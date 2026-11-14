import {
  BILLING_INTERVALS,
  BOARD_CHART_TYPES,
  BOARD_GROUPINGS,
  BOARD_MEASURES,
  BOARD_PERIODS,
  BOARD_PRESETS,
  CLEAR_OUT_GROUPS,
  DEVICE_KINDS,
  FOLLOWUP_DAYS,
  GMAIL_EFFECTS,
  MAIL_CATEGORIES,
  OUTBOX_MODES,
  PAID_PLANS,
  RULE_EFFECTS,
  SIMPLE_MATCH_FIELDS,
  WRAPPED_PERIODS,
} from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { LOCALES } from '@fewmail/shared/i18n/locales'
import type { InferRouterOutputs } from '@orpc/server'
import { type } from 'arktype'

import { agent, authed, visitor } from '.'
import { CALENDAR_SCOPE, GMAIL_SCOPE, hasSignInScope } from '../lib/auth'
import { isTimeZone } from '../lib/clock'
import { watchChanges } from '../lib/live'
import { approveCard, approveCards } from '../services/approve'
import { completeEmail } from '../services/autocomplete'
import { createBillingPortal, createCheckout } from '../services/billing'
import {
  addChart,
  addToBoard,
  createBoard,
  deleteBoard,
  dismissEntry,
  getBoard,
  listBoards,
  renameGroup,
  reorderBoards,
  updateBoard,
} from '../services/boards'
import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
} from '../services/calendar'
import {
  keepSender,
  listSubscriptions,
  runClearOut,
  scanClearOut,
  undoClearOut,
} from '../services/cleanup'
import { deleteDraft, listDrafts, saveDraft } from '../services/drafts'
import { getToday, listJournal, openToday } from '../services/home'
import { askFewmail } from '../services/instructions'
import {
  getTelegramLink,
  getWhatsappLink,
  disconnectApp,
  listConnectedApps,
  setUrgentPush,
  unlinkTelegram,
  unlinkWhatsapp,
} from '../services/integrations'
import { listUserLabels } from '../services/labels'
import {
  archiveMessage,
  moveToInbox,
  blockSender,
  countQueue,
  listQueue,
  dismissAction,
  draftReply,
  getThread,
  listMail,
  countUnread,
  markThreadRead,
  settleTidy,
  pinMessage,
  redraftAction,
  restoreAction,
  snoozeMessage,
  trashMessage,
  unsnoozeMessage,
  writeReplyTo,
} from '../services/mail'
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
import { getPlanInfo, getUsage } from '../services/plan'
import { getReading, getReadingSummary } from '../services/reading'
import {
  createRule,
  deleteRule,
  listRules,
  updateRule,
} from '../services/rules'
import { saveSettings } from '../services/save-settings'
import { getSettings } from '../services/settings'
import { deleteSnippet, listSnippets, saveSnippet } from '../services/snippets'
import { markNotSpam, reportSpam } from '../services/spam'
import { unsubscribeMessage } from '../services/thread-effects'
import { getWrapped, readSharedWrapped } from '../services/wrapped'

const id = type({ id: 'string.uuid' })

const boardChart = type({
  'currency?': 'string',
  groupBy: type.enumerated(...BOARD_GROUPINGS),
  id: 'string',
  measure: type.enumerated(...BOARD_MEASURES),
  title: 'string',
  type: type.enumerated(...BOARD_CHART_TYPES),
})
const boardText = { description: 'string > 2', name: 'string > 0' } as const
const boardPeriod = type.enumerated(...BOARD_PERIODS)

const settingsInput = type({
  'briefHour?': '0 <= number.integer <= 23',
  language: type.enumerated(...LOCALES.map(({ code }) => code)),
  'starterBoards?': type.enumerated(...BOARD_PRESETS).array(),
  'gmailLabels?': 'boolean',
  'knowledge?': 'string | null',
  'readingDigest?': 'boolean',
  timezone: type('string').narrow(
    (zone, ctx) => isTimeZone(zone) || ctx.mustBe('an IANA time zone')
  ),
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

const eventRef = type({ id: 'string', mailboxId: 'string.uuid' })

const eventInput = type({
  allDay: 'boolean',
  'description?': 'string',
  end: 'string',
  'location?': 'string',
  start: 'string',
  title: 'string',
})

export const router = {
  boards: {
    create: agent
      .input(type({ ...boardText, 'periodDays?': boardPeriod }))
      .handler(async ({ context, input }) => {
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
    reorder: agent
      .input(type({ ids: 'string.uuid[]' }))
      .handler(async ({ context, input }) => {
        await reorderBoards(context.user.id, input.ids)
      }),
    update: agent
      .input(
        id.and({
          'bannerDays?': '1 <= number.integer <= 14 | null',
          'charts?': boardChart.array(),
          'description?': boardText.description,
          'name?': boardText.name,
          'periodDays?': boardPeriod,
        })
      )
      .handler(async ({ context, input: { id: boardId, ...input } }) => {
        await updateBoard(context.user.id, boardId, input)
      }),
    addChart: agent
      .input(id.and({ ask: 'string' }))
      .handler(({ context, input }) =>
        addChart(context.user.id, input.id, input.ask)
      ),
    addEmail: agent
      .input(id.and(messageId))
      .handler(async ({ context, input }) => {
        await addToBoard(context.user.id, input.id, input.messageId)
      }),
    renameGroup: agent
      .input(id.and({ from: 'string', to: 'string' }))
      .handler(async ({ context, input: { id: boardId, ...names } }) => {
        await renameGroup(context.user.id, boardId, names)
      }),
    dismissEntry: agent
      .input(id.and({ 'isDismissed?': 'boolean' }))
      .handler(async ({ context, input }) => {
        await dismissEntry(context.user.id, input.id, input.isDismissed)
      }),
  },
  actions: {
    approve: agent
      .input(id.and({ 'detail?': 'string' }))
      .handler(({ context, input }) =>
        approveCard(context.user.id, input.id, input.detail)
      ),
    approveMany: agent
      .input(type({ ids: 'string.uuid[] > 0' }))
      .handler(({ context, input }) =>
        approveCards(context.user.id, input.ids)
      ),
    dismiss: agent
      .input(id)
      .handler(({ context, input }) =>
        dismissAction(context.user.id, input.id)
      ),
    restore: agent
      .input(id)
      .handler(({ context, input }) =>
        restoreAction(context.user.id, input.id)
      ),
    redraft: agent
      .input(id.and({ 'instruction?': 'string' }))
      .handler(({ context, input }) =>
        redraftAction(context.user.id, input.id, input.instruction)
      ),
  },
  calendar: {
    create: authed
      .input(eventInput.and({ 'mailboxId?': 'string.uuid' }))
      .handler(({ context, input }) => createEvent(context.user.id, input)),
    delete: authed.input(eventRef).handler(async ({ context, input }) => {
      await deleteEvent(context.user.id, input)
    }),
    events: authed
      .input(type({ from: 'Date', to: 'Date' }))
      .handler(({ context, input }) => listEvents(context.user.id, input)),
    update: authed
      .input(eventRef.and(eventInput))
      .handler(({ context, input: { id: eventId, mailboxId, ...event } }) =>
        updateEvent(context.user.id, { id: eventId, mailboxId }, event)
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
      disconnect: authed
        .input(type({ clientId: 'string' }))
        .handler(async ({ context, input }) => {
          await disconnectApp(context.user.id, input.clientId)
        }),
      list: authed.handler(({ context }) => listConnectedApps(context.user.id)),
    },
    telegram: {
      get: agent.handler(({ context }) => getTelegramLink(context.user.id)),
      unlink: authed.handler(async ({ context }) => {
        await unlinkTelegram(context.user.id)
      }),
      setUrgentPush: authed
        .input(type({ on: 'boolean' }))
        .handler(async ({ context, input }) => {
          await setUrgentPush(context.user.id, 'telegram', input.on)
        }),
    },
    whatsapp: {
      get: agent.handler(({ context }) => getWhatsappLink(context.user.id)),
      unlink: authed.handler(async ({ context }) => {
        await unlinkWhatsapp(context.user.id)
      }),
      setUrgentPush: authed
        .input(type({ on: 'boolean' }))
        .handler(async ({ context, input }) => {
          await setUrgentPush(context.user.id, 'whatsapp', input.on)
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
    block: authed
      .input(messageId)
      .handler(({ context, input }) =>
        blockSender(context.user.id, input.messageId)
      ),
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
    moveToInbox: authed.input(messageId).handler(async ({ context, input }) => {
      await moveToInbox(context.user.id, input.messageId)
    }),
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
    pin: authed
      .input(messageId.and({ pinned: 'boolean' }))
      .handler(async ({ context, input }) => {
        await pinMessage(context.user.id, input.messageId, input.pinned)
      }),
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
        const text = await writeReplyTo(
          context.user.id,
          input.messageId,
          input.instruction
        )
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
            "'inbox' | 'unread' | 'important' | 'needs_reply' | 'quiet' | 'pinned' | 'snoozed' | 'spam' | 'archive' | 'trash'",
          'mailboxId?': 'string.uuid',
          'search?': 'string',
        })
      )
      .handler(({ context, input }) => listMail(context.user.id, input)),
    labels: authed.handler(({ context }) => listUserLabels(context.user.id)),
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
        unsubscribeMessage(context.user.id, input.messageId, 'thread')
      ),
  },

  ask: agent
    .input(type({ question: 'string > 2' }))
    .handler(({ context, input }) =>
      askFewmail(context.user.id, input.question)
    ),
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
  me: authed.handler(async ({ context }) => {
    const [plan, settings, usage, hasGmail, hasCalendar] = await Promise.all([
      getPlanInfo(context.user.id),
      getSettings(context.user.id),
      getUsage(context.user.id),
      hasSignInScope(context.user.id, GMAIL_SCOPE),
      hasSignInScope(context.user.id, CALENDAR_SCOPE),
    ])
    return {
      hasCalendar,
      hasGmail,
      plan,
      settings,
      usage,
      user: context.user,
    }
  }),
  rules: {
    create: authed
      .input(ruleInput)
      .handler(({ context, input }) => createRule(context.user.id, input)),
    createSimple: authed
      .input(simpleRuleInput)
      .handler(({ context, input }) => createRule(context.user.id, input)),
    delete: authed.input(id).handler(async ({ context, input }) => {
      await deleteRule(context.user.id, input.id)
    }),
    list: authed.handler(({ context }) => listRules(context.user.id)),
    update: authed
      .input(id.and(ruleInput.partial()).and({ 'enabled?': 'boolean' }))
      .handler(({ context, input: { id: ruleId, ...change } }) =>
        updateRule(context.user.id, ruleId, change)
      ),
  },
  subscriptions: {
    clearOut: authed
      .input(type({ groups: type.enumerated(...CLEAR_OUT_GROUPS).array() }))
      .handler(({ context, input }) =>
        runClearOut(context.user.id, input.groups)
      ),
    list: authed.handler(({ context }) => listSubscriptions(context.user.id)),
    scanClearOut: authed.handler(({ context }) =>
      scanClearOut(context.user.id)
    ),
    undoClearOut: authed.handler(({ context }) =>
      undoClearOut(context.user.id)
    ),
    unsubscribe: authed
      .input(messageId)
      .handler(({ context, input }) =>
        unsubscribeMessage(context.user.id, input.messageId, 'list')
      ),
  },
  person: agent
    .input(type({ email: 'string.email' }))
    .handler(({ context, input }) => getPerson(context.user.id, input.email)),

  settings: {
    save: authed
      .input(settingsInput)
      .handler(({ context, input }) => saveSettings(context.user.id, input)),
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
    count: agent.handler(({ context }) => countQueue(context.user.id)),
    get: agent.handler(({ context }) => getToday(context.user.id)),
    handled: agent.handler(({ context }) => listJournal(context.user.id)),
    keepSender: agent
      .input(messageId)
      .handler(({ context, input }) =>
        keepSender(context.user.id, input.messageId)
      ),
    keep: agent
      .input(type({ messageIds: 'string.uuid[] > 0' }))
      .handler(({ context, input }) =>
        settleTidy(context.user.id, input.messageIds, 'dismissed')
      ),
    open: agent.handler(({ context }) => openToday(context.user.id)),
    queue: agent.handler(({ context }) => listQueue(context.user.id)),
    tidy: agent
      .input(type({ messageIds: 'string.uuid[] > 0' }))
      .handler(({ context, input }) =>
        settleTidy(context.user.id, input.messageIds, 'done')
      ),
  },
  reading: {
    list: authed.handler(({ context }) => getReading(context.user.id)),
    summary: agent.handler(async ({ context }) => {
      const { summary } = await getReadingSummary(context.user.id)
      return summary
    }),
  },
  wrapped: {
    get: authed
      .input(type({ period: type.enumerated(...WRAPPED_PERIODS) }))
      .handler(({ context, input }) =>
        getWrapped(context.user.id, input.period)
      ),
    shared: visitor
      .input(type({ token: 'string' }))
      .handler(({ input }) => readSharedWrapped(input.token)),
  },
}

export type Router = typeof router
export type RouterOutputs = InferRouterOutputs<Router>
