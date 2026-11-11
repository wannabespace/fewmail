import { db } from '@fewmail/db'
import { actions, messages, outbox, tasks, users } from '@fewmail/db/schema'
import type { TaskAutonomy } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { messages as dictionaries } from '@fewmail/shared/i18n'
import { englishName } from '@fewmail/shared/i18n/locales'
import { generateText, Output } from 'ai'
import { type } from 'arktype'
import { and, desc, eq, gte, inArray, ne } from 'drizzle-orm'

import { models } from '../lib/ai'
import { expectRow } from '../lib/rows'
import { NotFoundError } from './mail-errors'
import { scheduleMail } from './outbox'
import { requireRoom } from './plan'
import { getSettings } from './settings'

/** A runaway loop with an auto-replying sender must stop and ask the user. */
const MAX_EMAILS_PER_TASK = 6
const THREAD_LIMIT = 12
const BODY_LIMIT = 2500

const stepSchema = type({
  decision: "'send' | 'wait' | 'done' | 'ask_user'",
  email: 'string | null',
  note: 'string',
})

type Task = typeof tasks.$inferSelect

const threadTranscript = async (userId: string, threadId: string) => {
  const rows = await db
    .select()
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.threadId, threadId)))
    .orderBy(desc(messages.receivedAt))
    .limit(THREAD_LIMIT)
  return rows.toReversed()
}

const decideStep = async (task: Task) => {
  const [user] = await db.select().from(users).where(eq(users.id, task.userId))
  const settings = await getSettings(task.userId)
  const thread = await threadTranscript(task.userId, task.threadId)
  const { output } = await generateText({
    instructions: [
      `You act for ${user?.name ?? 'the user'} <${user?.email ?? ''}> on one email thread until this goal is reached: "${task.goal}".`,
      'Decide the next step from the latest state of the thread:',
      "- send: write the next email (body only, in the language of the thread, in the user's voice) that moves toward the goal.",
      "- wait: the ball is in the other side's court; nothing to send yet.",
      '- done: the goal is reached.',
      '- ask_user: you need a decision, a fact or a document only the user has, or the request goes beyond the goal.',
      `note: one sentence for the user in ${englishName(settings?.language ?? 'en')} saying what happened or what you need.`,
      'Never invent facts, prices, dates or commitments the user did not give you.',
      settings?.knowledge
        ? `What the user wants you to know:\n${settings.knowledge}`
        : null,
    ]
      .filter(Boolean)
      .join('\n'),
    model: models.writer,
    output: Output.object({ schema: stepSchema }),
    prompt: thread
      .map(
        (message) =>
          `${message.isFromMe ? 'USER' : (message.fromName ?? message.fromEmail)} · ${message.receivedAt.toISOString()}\n${message.body.slice(0, BODY_LIMIT)}`
      )
      .join('\n\n---\n\n'),
  })
  return { output, thread }
}

const sentForTask = async (task: Task) => {
  const sent = await db
    .select({ id: outbox.id })
    .from(outbox)
    .where(
      and(
        eq(outbox.userId, task.userId),
        eq(outbox.threadId, task.threadId),
        gte(outbox.createdAt, task.createdAt),
        inArray(outbox.status, ['scheduled', 'sending', 'sent'])
      )
    )
  return sent.length
}

export const advanceTask = async (task: Task) => {
  const settings = await getSettings(task.userId)
  const t = dictionaries[settings?.language ?? 'en']
  const { output, thread } = await decideStep(task)
  const last = thread.findLast((message) => !message.isFromMe) ?? thread.at(-1)
  const tooMany = (await sentForTask(task)) >= MAX_EMAILS_PER_TASK
  const decision =
    output.decision === 'send' && tooMany ? 'ask_user' : output.decision

  await db
    .update(tasks)
    .set({ summary: output.note })
    .where(eq(tasks.id, task.id))

  if (decision === 'wait') {
    return
  }
  if (decision === 'done') {
    await db.update(tasks).set({ status: 'done' }).where(eq(tasks.id, task.id))
  }
  if (decision === 'send' && output.email && last && task.autonomy === 'auto') {
    await scheduleMail(task.userId, {
      html: textToHtml(output.email),
      mode: 'reply',
      replyToMessageId: last.id,
      subject: last.subject,
      text: output.email,
      to: [last.isFromMe ? (last.to[0] ?? '') : last.fromEmail].filter(Boolean),
    })
    return
  }
  await db.insert(actions).values({
    autonomous: false,
    detail: decision === 'send' ? output.email : null,
    kind: 'task',
    messageId: last?.id ?? null,
    reason: output.note,
    status: 'pending',
    threadId: task.threadId,
    title: decision === 'done' ? t.tasks.done : t.tasks.next,
    userId: task.userId,
  })
}

export const createTask = async (
  userId: string,
  input: { autonomy: TaskAutonomy; goal: string; messageId: string }
) => {
  const [message] = await db
    .select({ threadId: messages.threadId })
    .from(messages)
    .where(and(eq(messages.id, input.messageId), eq(messages.userId, userId)))
  if (!message) {
    throw new NotFoundError('Email not found')
  }
  await requireRoom(userId, 'tasks', () =>
    db.$count(
      tasks,
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, 'active'),
        ne(tasks.threadId, message.threadId)
      )
    )
  )
  await db
    .update(tasks)
    .set({ status: 'canceled' })
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.threadId, message.threadId),
        eq(tasks.status, 'active')
      )
    )
  const [task] = await db
    .insert(tasks)
    .values({
      autonomy: input.autonomy,
      goal: input.goal,
      status: 'active',
      threadId: message.threadId,
      userId,
    })
    .returning()
  const created = expectRow(task)
  await advanceTask(created)
  return created
}

export const cancelTask = (userId: string, id: string) =>
  db
    .update(tasks)
    .set({ status: 'canceled' })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))

export const activeTask = async (userId: string, threadId: string) => {
  const [task] = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.threadId, threadId),
        eq(tasks.status, 'active')
      )
    )
  return task ?? null
}

/** New mail in a thread with an active task moves the task forward. */
export const advanceTasksFor = async (userId: string, threadIds: string[]) => {
  if (threadIds.length === 0) {
    return
  }
  const active = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, 'active'),
        inArray(tasks.threadId, threadIds)
      )
    )
  await Promise.all(
    active.map((task) =>
      advanceTask(task).catch((error) => console.error('task failed', error))
    )
  )
}
