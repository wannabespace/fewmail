import { db } from '@fewmail/db'
import { chats } from '@fewmail/db/schema'
import type { OpenThread } from '@fewmail/shared/agent'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { englishName } from '@fewmail/shared/i18n/locales'
import {
  convertToModelMessages,
  generateId,
  isToolUIPart,
  stepCountIs,
  streamText,
  tool,
  validateUIMessages,
} from 'ai'
import type { UIMessage } from 'ai'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { INFORMAL_ADDRESS, models, NO_EM_DASH, trackUsage } from '../lib/ai'
import { agentTools, toolAccess } from './agent-tools'
import { NotFoundError } from './mail-errors'
import { spendMessage } from './plan'
import { getSettings } from './settings'
import { expandSkills } from './skills'

const MAX_STEPS = 12
const TITLE_LENGTH = 80

const chatTools = (userId: string) =>
  Object.fromEntries(
    Object.entries(agentTools(userId)).map(([name, agentTool]) => [
      name,
      tool({
        description: agentTool.description,
        execute: (input: unknown) => agentTool.run(input as never),
        inputSchema: z.object(agentTool.input ?? {}),
        needsApproval: toolAccess(name) === 'consent',
      }),
    ])
  )

const instructionsFor = async (userId: string) => {
  const settings = await getSettings(userId)
  const timezone = settings?.timezone ?? 'UTC'
  const now = new Date().toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timezone,
  })
  return [
    "You are Fewmail, the user's email agent, talking with them in a chat. You read all of their mail so they do not have to.",
    `Write in ${englishName(settings?.language ?? 'en')}, or in the language the user writes in. Replies to an email are written in the language of that email.`,
    INFORMAL_ADDRESS,
    NO_EM_DASH,
    'The user wants calm and nothing important lost: people waiting for them come first.',
    `Now: ${now} (${timezone}).`,
    settings?.knowledge
      ? `What the user told you to know:\n${settings.knowledge}`
      : '',
    'Use the tools for anything about their mail and never invent emails, people, amounts or dates; search before saying something is not there.',
    'Speak like a person, not a program: never name your tools, fields, ids, categories or action kinds (no get_today, finance, pay). Say what you looked at in plain words, like "your queue" or "money mail".',
    'The queue lives on the app\'s Home screen; in another language call it by that language\'s word for a home page, never the English "Home". You are the agent: say "I", never "the agent".',
    'Be brief: a few sentences or a short list. Mention an email as a markdown link to its thread, [sender: subject](?thread=<threadId>), so the user can open it.',
    'To send a reply: draft_reply, then approve_action with that action id. Sending, archiving, snoozing, unsubscribing, rules and handing threads over show the user a confirmation button, so call the tool instead of asking in text. When they decline, accept it and do not retry.',
  ]
    .filter(Boolean)
    .join('\n')
}

/** History keeps the email that was open, so "this" and "reply to it" still mean that one later in the chat. */
const openThreadText = (part: { data: unknown; type: string }) => {
  if (part.type !== 'data-thread') {
    return
  }
  const { from, messageId, subject, threadId } = part.data as OpenThread
  return {
    text: `The user wrote this with an email open beside the chat: ${from}: ${subject} (threadId ${threadId}, latest messageId ${messageId}). "This", "it" or "here" mean that email.`,
    type: 'text' as const,
  }
}

/** An approval the user never answered (they wrote something else instead) counts as declined. */
const declineUnanswered = (messages: UIMessage[]) =>
  messages.map((message, index) =>
    index === messages.length - 1
      ? message
      : {
          ...message,
          parts: message.parts.map((part) =>
            isToolUIPart(part) && part.state === 'approval-requested'
              ? {
                  ...part,
                  approval: { ...part.approval, approved: false },
                  state: 'approval-responded' as const,
                }
              : part
          ),
        }
  )

const titleOf = (message: UIMessage) =>
  message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join(' ')
    .slice(0, TITLE_LENGTH)

const ownChat = async (userId: string, id: string) => {
  const [chat] = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, id), eq(chats.userId, userId)))
  return chat
}

export const listChats = (userId: string) =>
  db
    .select({ id: chats.id, title: chats.title, updatedAt: chats.updatedAt })
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt))
    .limit(50)

export const getChat = async (userId: string, id: string) => {
  const chat = await ownChat(userId, id)
  if (!chat) {
    throw new NotFoundError('Chat not found')
  }
  return { ...chat, messages: chat.messages as UIMessage[] }
}

export const deleteChat = async (userId: string, id: string) => {
  await db.delete(chats).where(and(eq(chats.id, id), eq(chats.userId, userId)))
}

/** A note from Fewmail itself rather than the model, such as a scheduled run that could not happen. */
export const postToChat = async (
  userId: string,
  { id, text, title }: { id: string; text: string; title: string }
) => {
  const chat = await ownChat(userId, id)
  const message: UIMessage = {
    id: generateId(),
    metadata: { createdAt: Date.now() },
    parts: [{ text, type: 'text' }],
    role: 'assistant',
  }
  await (chat
    ? db
        .update(chats)
        .set({ messages: [...(chat.messages as UIMessage[]), message] })
        .where(and(eq(chats.id, id), eq(chats.userId, userId)))
    : db.insert(chats).values({
        id,
        messages: [message],
        title: title.slice(0, TITLE_LENGTH),
        userId,
      }))
}

/**
 * The client sends only its last message: a new one, the assistant turn it answered approvals in,
 * or the question it regenerates — which drops what came after it. History comes from the database.
 */
export const streamChat = async (
  userId: string,
  { id, message }: { id: string; message: UIMessage }
) => {
  const chat = await ownChat(userId, id)
  const stored = (chat?.messages ?? []) as UIMessage[]
  const tools = chatTools(userId)
  const known = stored.findIndex(({ id: storedId }) => storedId === message.id)
  if (message.role === 'user' || known === -1) {
    await spendMessage(userId)
  }
  const sent =
    message.role === 'user'
      ? { ...message, metadata: { createdAt: Date.now() } }
      : { ...message, metadata: stored[known]?.metadata }
  const history =
    known === -1
      ? [...stored, { ...sent, role: 'user' as const }]
      : [...stored.slice(0, known), sent]
  const messages = declineUnanswered(
    await validateUIMessages({ messages: history, tools })
  )

  const save = (all: UIMessage[]) =>
    db
      .update(chats)
      .set({ messages: all })
      .where(and(eq(chats.id, id), eq(chats.userId, userId)))
  await (chat
    ? save(messages)
    : db
        .insert(chats)
        .values({ id, messages, title: titleOf(message), userId }))

  const result = streamText({
    instructions: await instructionsFor(userId),
    messages: await convertToModelMessages(expandSkills(messages), {
      convertDataPart: openThreadText,
      tools,
    }),
    model: models.writer,
    stopWhen: stepCountIs(MAX_STEPS),
    telemetry: trackUsage(userId, 'chat'),
    tools,
  })
  return result.toUIMessageStream({
    generateMessageId: generateId,
    messageMetadata: ({ part }) =>
      part.type === 'start' && sent.role === 'user'
        ? { createdAt: Date.now() }
        : undefined,
    onFinish: async ({ messages: all }) => {
      await save(all)
    },
    originalMessages: messages,
  })
}

const THREAD_LINK = /\[(?<label>[^\]]+)\]\(\?thread=[^)]*\)/gu

const awaitsAnswer = (message: UIMessage | undefined) =>
  !!message?.parts.some(
    (part) => isToolUIPart(part) && part.state === 'approval-requested'
  )

/**
 * Runs one message through the agent outside the web chat; the answer is plain text, since its thread links only work in the app. The model's own errors arrive as stream chunks, not exceptions.
 * A new turn would decline the approvals the chat still waits for (the previous scheduled run's), so it only reminds of them.
 */
export const askAgent = async (
  userId: string,
  { id, text }: { id: string; text: string }
) => {
  const chat = await ownChat(userId, id)
  if (awaitsAnswer((chat?.messages as UIMessage[] | undefined)?.at(-1))) {
    const settings = await getSettings(userId)
    return dictionaries[settings?.language ?? 'en'].schedule.awaitsAnswer
  }
  const stream = await streamChat(userId, {
    id,
    message: {
      id: generateId(),
      parts: [{ text, type: 'text' }],
      role: 'user',
    },
  })
  for await (const chunk of stream) {
    if (chunk.type === 'error') {
      throw new Error(chunk.errorText)
    }
  }
  const { messages } = await getChat(userId, id)
  return (
    messages
      .at(-1)
      ?.parts.flatMap((part) => (part.type === 'text' ? [part.text] : []))
      .join('\n')
      .replaceAll(THREAD_LINK, '$<label>') ?? ''
  )
}
