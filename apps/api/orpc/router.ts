import { db } from '@fewmail/db'
import { messages } from '@fewmail/db/schema'
import {
  BILLING_INTERVALS,
  BOARD_CHART_TYPES,
  BOARD_GROUPINGS,
  BOARD_MEASURES,
  BOARD_PRESETS,
  DEVICE_KINDS,
  FOLLOWUP_DAYS,
  GMAIL_EFFECTS,
  MAIL_CATEGORIES,
  OUTBOX_MODES,
  PAID_PLANS,
  RULE_EFFECTS,
  SIMPLE_MATCH_FIELDS,
} from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { LOCALES } from '@fewmail/shared/i18n/locales'
import { streamToEventIterator } from '@orpc/server'
import type { InferRouterOutputs } from '@orpc/server'
import { type } from 'arktype'
import { and, eq } from 'drizzle-orm'

import { agent, authed } from '.'
import { watchChanges } from '../lib/live'
import { writeReply } from '../services/agent'
import { askMail } from '../services/ask'
import { completeEmail } from '../services/autocomplete'
import { createBillingPortal, createCheckout } from '../services/billing'
import {
  createBoard,
  deleteBoard,
  getBoard,
  listBoards,
  updateBoard,
} from '../services/boards'
import { generateBrief, getToday } from '../services/brief'
import { deleteChat, getChat, listChats, streamChat } from '../services/chat'
import { listSubscriptions, unsubscribeSender } from '../services/cleanup'
import { deleteDraft, listDrafts, saveDraft } from '../services/drafts'
import {
  getTelegramLink,
  getWhatsappLink,
  disconnectApp,
  listConnectedApps,
  unlinkTelegram,
  unlinkWhatsapp,
} from '../services/integrations'
import { backfillAgentLabels } from '../services/labels'
import {
  approveAction,
  archiveMessage,
  blockSender,
  dismissAction,
  draftReply,
  getThread,
  listMail,
  countUnread,
  markThreadRead,
  redraftAction,
  snoozeMessage,
  trashMessage,
  unsnoozeMessage,
  unsubscribeMessage,
} from '../services/mail'
import { NotFoundError } from '../services/mail-errors'
import {
  listMailboxes,
  removeMailbox,
  startAddingMailbox,
} from '../services/mailboxes'
import {
  registerDevice,
  removeDevice,
  webPushKey,
} from '../services/notifications'
import { cancelMail, listScheduled, scheduleMail } from '../services/outbox'
import { getPerson } from '../services/people'
import {
  getPlanInfo,
  getUsage,
  requireAgent,
  spendMessage,
} from '../services/plan'
import {
  createRule,
  deleteRule,
  listRules,
  updateRule,
} from '../services/rules'
import { deleteSchedule, listSchedules } from '../services/schedules'
import { getSettings, saveSettings } from '../services/settings'
import { deleteSnippet, listSnippets, saveSnippet } from '../services/snippets'
import { markNotSpam, reportSpam } from '../services/spam'
import { syncMailboxes } from '../services/sync'
import { cancelTask, createTask } from '../services/tasks'

const id = type({ id: 'string.uuid' })

const boardChart = type({
  groupBy: type.enumerated(...BOARD_GROUPINGS),
  id: 'string',
  measure: type.enumerated(...BOARD_MEASURES),
  title: 'string',
  type: type.enumerated(...BOARD_CHART_TYPES),
})
const boardText = { description: 'string > 2', name: 'string > 0' } as const

const settingsInput = type({
  'briefHour?': '0 <= number.integer <= 23',
  language: type.enumerated(...LOCALES.map(({ code }) => code)),
  'starterBoards?': type.enumerated(...BOARD_PRESETS).array(),
  'gmailLabels?': 'boolean',
  'knowledge?': 'string | null',
  timezone: 'string',
  'voice?': 'string | null',
})

const draftRef = type({ id: 'string', mailboxId: 'string.uuid' })

const draftInput = type({
  'bcc?': 'string.email[]',
  'cc?': 'string.email[]',
  'draft?': draftRef,
  html: 'string',
  'mailboxId?': 'string.uuid',
  mode: type.enumerated(...OUTBOX_MODES),
  'replyToMessageId?': 'string.uuid',
  subject: 'string',
  text: 'string',
  to: 'string.email[]',
})

const sendInput = draftInput.and({
  'remindAfterDays?': type.enumerated(...FOLLOWUP_DAYS).or('null'),
  'sendAt?': 'Date',
  to: 'string.email[] >= 1',
})

const ruleInput = type({
  effect: type.enumerated(...RULE_EFFECTS),
  instruction: 'string > 2',
})

const simpleRuleInput = type({
  effect: type.enumerated(...GMAIL_EFFECTS),
  match: {
    field: type.enumerated(...SIMPLE_MATCH_FIELDS),
    value: 'string',
  },
})

const messageId = type({ messageId: 'string.uuid' })

const FREE_EFFECTS = new Set<string>(GMAIL_EFFECTS)

/** Jev matches plain-language rules on every plan; drafting and showing in Today need the agent. */
const requireAgentFor = async (userId: string, rule: { effect?: string }) => {
  if (rule.effect && !FREE_EFFECTS.has(rule.effect)) {
    await requireAgent(userId)
  }
}

export const router = {
  boards: {
    create: agent.input(type(boardText)).handler(async ({ context, input }) => {
      const board = await createBoard(context.user.id, input)
      return { id: board.id }
    }),
    delete: agent.input(id).handler(async ({ context, input }) => {
      await deleteBoard(context.user.id, input.id)
    }),
    get: agent
      .input(id)
      .handler(({ context, input }) => getBoard(context.user.id, input.id)),
    list: agent.handler(({ context }) => listBoards(context.user.id)),
    update: agent
      .input(
        id.and({
          'charts?': boardChart.array(),
          'description?': boardText.description,
          'name?': boardText.name,
        })
      )
      .handler(async ({ context, input: { id: boardId, ...input } }) => {
        await updateBoard(context.user.id, boardId, input)
      }),
  },
  actions: {
    approve: agent
      .input(id.and({ 'detail?': 'string' }))
      .handler(({ context, input }) =>
        approveAction(context.user.id, input.id, input.detail)
      ),
    dismiss: agent
      .input(id)
      .handler(({ context, input }) =>
        dismissAction(context.user.id, input.id)
      ),
    redraft: agent
      .input(id.and({ 'instruction?': 'string' }))
      .handler(({ context, input }) =>
        redraftAction(context.user.id, input.id, input.instruction)
      ),
  },
  devices: {
    register: authed
      .input(
        type({
          keys: { auth: 'string', p256dh: 'string' },
          kind: type.enumerated(...DEVICE_KINDS),
          token: 'string.url',
        })
      )
      .handler(async ({ context, input }) => {
        await registerDevice(context.user.id, input)
      }),
    remove: authed
      .input(type({ token: 'string' }))
      .handler(async ({ context, input }) => {
        await removeDevice(context.user.id, input.token)
      }),
    webPushKey: authed.handler(() => webPushKey()),
  },
  integrations: {
    apps: {
      disconnect: agent
        .input(type({ clientId: 'string' }))
        .handler(async ({ context, input }) => {
          await disconnectApp(context.user.id, input.clientId)
        }),
      list: agent.handler(({ context }) => listConnectedApps(context.user.id)),
    },
    telegram: {
      get: agent.handler(({ context }) => getTelegramLink(context.user.id)),
      unlink: agent.handler(async ({ context }) => {
        await unlinkTelegram(context.user.id)
      }),
    },
    whatsapp: {
      get: agent.handler(({ context }) => getWhatsappLink(context.user.id)),
      unlink: agent.handler(async ({ context }) => {
        await unlinkWhatsapp(context.user.id)
      }),
    },
  },
  mailboxes: {
    add: authed.handler(({ context }) => startAddingMailbox(context.user.id)),
    list: authed.handler(({ context }) => listMailboxes(context.user.id)),
    remove: authed.input(id).handler(async ({ context, input }) => {
      await removeMailbox(context.user.id, input.id)
    }),
  },
  mail: {
    archive: authed.input(messageId).handler(async ({ context, input }) => {
      await archiveMessage(context.user.id, input.messageId)
    }),
    block: authed.input(messageId).handler(async ({ context, input }) => {
      await blockSender(context.user.id, input.messageId)
    }),
    cancelSend: authed
      .input(id)
      .handler(({ context, input }) => cancelMail(context.user.id, input.id)),
    deleteDraft: authed.input(draftRef).handler(async ({ context, input }) => {
      await deleteDraft(context.user.id, input)
    }),
    drafts: authed
      .input(type({ 'mailboxId?': 'string.uuid', 'search?': 'string' }))
      .handler(({ context, input }) => listDrafts(context.user.id, input)),
    complete: agent
      .input(
        type({
          prefix: 'string',
          'replyToMessageId?': 'string.uuid',
          suffix: 'string',
        })
      )
      .handler(async ({ context, input, signal }) => ({
        text: await completeEmail({
          ...input,
          signal,
          userId: context.user.id,
        }),
      })),
    notSpam: authed.input(messageId).handler(async ({ context, input }) => {
      await markNotSpam(context.user.id, input.messageId)
    }),
    reportSpam: authed.input(messageId).handler(async ({ context, input }) => {
      await reportSpam(context.user.id, input.messageId)
    }),
    saveDraft: authed
      .input(draftInput)
      .handler(({ context, input }) => saveDraft(context.user.id, input)),
    scheduled: authed.handler(({ context }) => listScheduled(context.user.id)),
    send: authed
      .input(sendInput)
      .handler(({ context, input }) => scheduleMail(context.user.id, input)),
    snooze: authed
      .input(messageId.and({ until: 'Date' }))
      .handler(async ({ context, input }) => {
        await snoozeMessage(context.user.id, input.messageId, input.until)
      }),
    trash: authed.input(messageId).handler(async ({ context, input }) => {
      await trashMessage(context.user.id, input.messageId)
    }),
    unsnooze: authed.input(messageId).handler(async ({ context, input }) => {
      await unsnoozeMessage(context.user.id, input.messageId)
    }),
    writeDraft: agent
      .input(messageId.and({ 'instruction?': 'string' }))
      .handler(async ({ context, input }) => {
        const [message] = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.id, input.messageId),
              eq(messages.userId, context.user.id)
            )
          )
        if (!message) {
          throw new NotFoundError('Email not found')
        }
        const text = await writeReply({
          instruction: input.instruction,
          message,
          userId: context.user.id,
        })
        return { html: textToHtml(text), text }
      }),
    draftReply: agent
      .input(type({ 'instruction?': 'string', messageId: 'string.uuid' }))
      .handler(({ context, input }) =>
        draftReply(context.user.id, input.messageId, input.instruction)
      ),
    list: authed
      .input(
        type({
          'before?': 'Date',
          'category?': type.enumerated(...MAIL_CATEGORIES),
          filter:
            "'inbox' | 'important' | 'needs_reply' | 'quiet' | 'snoozed' | 'spam'",
          'mailboxId?': 'string.uuid',
          'search?': 'string',
        })
      )
      .handler(({ context, input }) => listMail(context.user.id, input)),
    markRead: authed
      .input(type({ threadId: 'string' }))
      .handler(async ({ context, input }) => {
        await markThreadRead(context.user.id, input.threadId)
      }),
    unread: authed
      .input(type({ 'mailboxId?': 'string.uuid' }))
      .handler(({ context, input }) =>
        countUnread(context.user.id, input.mailboxId)
      ),
    thread: authed
      .input(type({ threadId: 'string' }))
      .handler(({ context, input }) =>
        getThread(context.user.id, input.threadId)
      ),
    unsubscribe: authed
      .input(messageId)
      .handler(({ context, input }) =>
        unsubscribeMessage(context.user.id, input.messageId)
      ),
  },
  chats: {
    delete: agent.input(id).handler(async ({ context, input }) => {
      await deleteChat(context.user.id, input.id)
    }),
    get: agent
      .input(id)
      .handler(({ context, input }) => getChat(context.user.id, input.id)),
    list: agent.handler(({ context }) => listChats(context.user.id)),
    send: agent
      .input(
        id.and({
          message: {
            id: 'string',
            parts: 'object[]',
            role: "'user' | 'assistant'",
          },
        })
      )
      .handler(async ({ context, input }) =>
        streamToEventIterator(
          await streamChat(context.user.id, {
            id: input.id,
            message: input.message as Parameters<
              typeof streamChat
            >[1]['message'],
          })
        )
      ),
  },
  ask: agent
    .input(type({ question: 'string > 2' }))
    .handler(async ({ context, input }) => {
      await spendMessage(context.user.id)
      return askMail(context.user.id, input.question)
    }),
  billing: {
    checkout: authed
      .input(
        type({
          interval: type.enumerated(...BILLING_INTERVALS),
          plan: type.enumerated(...PAID_PLANS),
        })
      )
      .handler(async ({ context, input }) => ({
        url: await createCheckout(context.user.id, input),
      })),
    portal: authed.handler(async ({ context }) => ({
      url: await createBillingPortal(context.user.id),
    })),
  },
  me: authed.handler(async ({ context }) => ({
    plan: await getPlanInfo(context.user.id),
    settings: await getSettings(context.user.id),
    usage: await getUsage(context.user.id),
    user: context.user,
  })),
  rules: {
    create: authed.input(ruleInput).handler(async ({ context, input }) => {
      await requireAgentFor(context.user.id, input)
      return createRule(context.user.id, input)
    }),
    createSimple: authed
      .input(simpleRuleInput)
      .handler(({ context, input }) => createRule(context.user.id, input)),
    delete: authed.input(id).handler(async ({ context, input }) => {
      await deleteRule(context.user.id, input.id)
    }),
    list: authed.handler(({ context }) => listRules(context.user.id)),
    update: authed
      .input(id.and(ruleInput.partial()).and({ 'enabled?': 'boolean' }))
      .handler(async ({ context, input: { id: ruleId, ...change } }) => {
        await requireAgentFor(context.user.id, change)
        return updateRule(context.user.id, ruleId, change)
      }),
  },
  subscriptions: {
    list: authed.handler(({ context }) => listSubscriptions(context.user.id)),
    unsubscribe: authed
      .input(messageId)
      .handler(({ context, input }) =>
        unsubscribeSender(context.user.id, input.messageId)
      ),
  },
  person: agent
    .input(type({ email: 'string.email' }))
    .handler(({ context, input }) => getPerson(context.user.id, input.email)),
  tasks: {
    cancel: agent.input(id).handler(async ({ context, input }) => {
      await cancelTask(context.user.id, input.id)
    }),
    create: agent
      .input(
        type({
          autonomy: "'ask' | 'auto'",
          goal: 'string > 3',
          messageId: 'string.uuid',
        })
      )
      .handler(async ({ context, input }) => {
        const task = await createTask(context.user.id, input)
        return { id: task.id }
      }),
  },
  schedules: {
    delete: agent.input(id).handler(async ({ context, input }) => {
      await deleteSchedule(context.user.id, input.id)
    }),
    list: agent.handler(({ context }) => listSchedules(context.user.id)),
  },
  settings: {
    save: authed.input(settingsInput).handler(async ({ context, input }) => {
      const before = await getSettings(context.user.id)
      const settings = await saveSettings(context.user.id, input)
      if (input.gmailLabels && !before?.gmailLabels) {
        void backfillAgentLabels(context.user.id).catch(console.error)
      }
      void syncMailboxes(context.user.id).catch(console.error)
      return settings
    }),
  },
  live: authed.handler(async function* live({ context, signal }) {
    yield* watchChanges(context.user.id, signal)
  }),
  snippets: {
    delete: authed.input(id).handler(async ({ context, input }) => {
      await deleteSnippet(context.user.id, input.id)
    }),
    list: authed.handler(({ context }) => listSnippets(context.user.id)),
    save: authed
      .input(type({ html: 'string', 'id?': 'string.uuid', name: 'string > 0' }))
      .handler(({ context, input }) => saveSnippet(context.user.id, input)),
  },
  today: {
    get: agent.handler(({ context }) => getToday(context.user.id)),
    refreshBrief: agent.handler(({ context }) =>
      generateBrief(context.user.id)
    ),
  },
}

export type Router = typeof router
export type RouterOutputs = InferRouterOutputs<Router>
