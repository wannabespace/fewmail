import {
  BILLING_INTERVALS,
  BOT_FOLDER_NAME_CHARS,
  BOT_MESSAGE_CHARS,
  CLEAR_OUT_GROUPS,
  COMMITMENT_STATUSES,
  EVENT_SCOPES,
  FOLLOWUP_DAYS,
  GMAIL_EFFECTS,
  MAIL_CATEGORIES,
  OUTBOX_MODES,
  PAID_PLANS,
  BOT_EFFECTS,
  BOT_PRESETS,
  SIMPLE_MATCH_FIELDS,
  WRAPPED_PERIODS,
} from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { LOCALES } from '@fewmail/shared/i18n/locales'
import type { InferRouterOutputs } from '@orpc/server'
import { type } from 'arktype'

import { agent, authed, visitor } from '.'
import { GMAIL_SCOPE, hasSignInScope } from '../lib/auth'
import { isTimeZone } from '../lib/clock'
import { watchChanges } from '../lib/live'
import { logErrorAs } from '../lib/log'
import { askBot } from '../services/agent-run'
import { approveCard, approveCards } from '../services/approve'
import { completeEmail } from '../services/autocomplete'
import { createBillingPortal, createCheckout } from '../services/billing'
import {
  botChat,
  clearBotChat,
  createBotFolder,
  deleteBotFolder,
  listBotChats,
  listBotFolders,
  markBotRead,
  moveBotToFolder,
  renameBotFolder,
  setBotMuted,
  setBotPinned,
} from '../services/bot-chat'
import {
  addPresetBot,
  createBot,
  deleteBot,
  listBots,
  readBotEffect,
  updateBot,
} from '../services/bots'
import {
  createEvent,
  deleteEvent,
  hasCalendar,
  listEvents,
  updateEvent,
} from '../services/calendar'
import {
  CLEAR_OUT_RUN,
  declineBotSuggestion,
  keepSender,
  pageSubscriptions,
  runClearOut,
  scanClearOut,
  undoClearOut,
} from '../services/cleanup'
import { listCommitments, setCommitmentStatus } from '../services/commitments'
import { waitingOf } from '../services/decide'
import {
  confirmSignIn,
  takeSignIn,
  waitForSignIn,
} from '../services/desktop-sign-in'
import {
  countDrafts,
  deleteDraft,
  listDrafts,
  saveDraft,
} from '../services/drafts'
import {
  dismissBanner,
  getToday,
  listBanner,
  listJournal,
  openToday,
} from '../services/home'
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
  addCardEvent,
  archiveMessage,
  moveToInbox,
  blockSender,
  listQueue,
  dismissAction,
  getThread,
  listMail,
  countWaiting,
  countInboxInGmail,
  countUnread,
  markThreadRead,
  markThreadUnread,
  settleTidy,
  pinMessage,
  redraftAction,
  restoreAction,
  snoozeMessage,
  trashMessage,
  unsnoozeMessage,
  withParticipants,
  writeReplyTo,
} from '../services/mail'
import {
  listMailboxes,
  removeMailbox,
  setMailboxEnabled,
  startAddingMailbox,
} from '../services/mailboxes'
import {
  keepDeviceSeen,
  registerDevice,
  removeDevice,
  sendTestPush,
  webPushKey,
} from '../services/notifications'
import { cancelMail, scheduleMail } from '../services/outbox'
import { deleteContact, listContacts } from '../services/people'
import { getPlanInfo, getUsage } from '../services/plan'
import {
  getReadingDay,
  listReadingIssues,
  markReadingRead,
} from '../services/reading'
import { saveSettings } from '../services/save-settings'
import { getSettings } from '../services/settings'
import { deleteSnippet, listSnippets, saveSnippet } from '../services/snippets'
import { markNotSpam, reportSpam } from '../services/spam'
import { syncMailbox } from '../services/sync'
import { unsubscribeMessage } from '../services/thread-effects'
import { getWrapped, readSharedWrapped } from '../services/wrapped'

const id = type({ id: 'string.uuid' })

const settingsInput = type({
  language: type.enumerated(...LOCALES.map(({ code }) => code)),
  'gmailLabels?': 'boolean',
  'knowledge?': 'string | null',
  timezone: type('string').narrow(
    (zone, ctx) => isTimeZone(zone) || ctx.mustBe('an IANA time zone')
  ),
  'voice?': 'string | null',
})

const draftRef = type({ id: 'string', mailboxId: 'string.uuid' })

const attachmentInput = type({
  'data?': 'string.base64',
  filename: 'string <= 255',
  id: /^[\w.-]{1,100}$/u,
  mimeType: /^[\w.+-]+\/[\w.+-]+$/u,
  size: 'number.integer >= 0',
})

const draftInput = type({
  'attachments?': attachmentInput.array(),
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

const botInput = type({
  effect: type.enumerated(...BOT_EFFECTS),
  'enabled?': 'boolean',
  instruction: 'string > 2',
  name: '0 < string <= 60',
})

/** `fewmail` or one of the user's bots. */
const botRef = type({ bot: '0 < string <= 64' })

const folderName = type('string.trim').to(
  `0 < string <= ${BOT_FOLDER_NAME_CHARS}`
)

const simpleBotInput = type({
  effect: type.enumerated(...GMAIL_EFFECTS),
  name: '0 < string <= 60',
  match: {
    field: type.enumerated(...SIMPLE_MATCH_FIELDS),
    value: 'string',
  },
})

const messageId = type({ messageId: 'string.uuid' })

const readingDayInput = type({ 'day?': /^\d{4}-\d{2}-\d{2}$/u })

const eventRef = type({ id: 'string', mailboxId: 'string.uuid' })
const eventScope = type.enumerated(...EVENT_SCOPES)

const eventInput = type({
  allDay: 'boolean',
  'description?': 'string',
  end: 'string',
  'location?': 'string',
  start: 'string',
  title: 'string',
})

/** Both halves of PKCE are 32 bytes, or their SHA-256, in base64url. */
const SIGN_IN_CHALLENGE = '/^[\\w-]{43}$/'
const signInChallengeInput = type({ challenge: SIGN_IN_CHALLENGE })

export const router = {
  actions: {
    addEvent: authed.input(id).handler(async ({ context, input }) => {
      await addCardEvent(context.user.id, input.id)
    }),
    approve: authed
      .input(id.and({ 'detail?': 'string' }))
      .handler(({ context, input }) =>
        approveCard(context.user.id, input.id, input.detail)
      ),
    approveMany: authed
      .input(type({ ids: 'string.uuid[] > 0' }))
      .handler(({ context, input }) =>
        approveCards(context.user.id, input.ids)
      ),
    dismiss: authed
      .input(id)
      .handler(({ context, input }) =>
        dismissAction(context.user.id, input.id)
      ),
    restore: authed
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
  commitments: {
    list: agent.handler(({ context }) => listCommitments(context.user.id)),
    setStatus: agent
      .input(id.and({ status: type.enumerated(...COMMITMENT_STATUSES) }))
      .handler(async ({ context, input }) => {
        await setCommitmentStatus(context.user.id, input.id, input.status)
      }),
  },
  calendar: {
    create: authed
      .input(eventInput.and({ 'mailboxId?': 'string.uuid' }))
      .handler(({ context, input }) => createEvent(context.user.id, input)),
    delete: authed
      .input(eventRef.and({ 'scope?': eventScope }))
      .handler(async ({ context, input: { scope, ...ref } }) => {
        await deleteEvent(context.user.id, ref, scope)
      }),
    events: authed
      .input(type({ from: 'Date', to: 'Date' }))
      .handler(({ context, input }) => listEvents(context.user.id, input)),
    update: authed
      .input(eventRef.and(eventInput).and({ 'scope?': eventScope }))
      .handler(
        ({ context, input: { id: eventId, mailboxId, scope, ...event } }) =>
          updateEvent(context.user.id, { id: eventId, mailboxId }, event, scope)
      ),
  },
  /** The desktop app's sign-in through the browser (`services/desktop-sign-in.ts`). */
  desktopSignIn: {
    confirm: authed
      .input(signInChallengeInput)
      .handler(({ context, input }) =>
        confirmSignIn(context.headers, input.challenge)
      ),
    take: visitor
      .input(
        type({ challenge: SIGN_IN_CHALLENGE, verifier: SIGN_IN_CHALLENGE })
      )
      .handler(({ input }) => takeSignIn(input.challenge, input.verifier)),
    wait: visitor.input(signInChallengeInput).handler(async function* wait({
      input,
      signal,
    }) {
      yield* waitForSignIn(input.challenge, signal)
    }),
  },
  devices: {
    register: authed
      .input(
        type({
          keys: { auth: 'string', p256dh: 'string' },
          kind: "'web'",
          token: 'string.url',
        }).or({ kind: "'desktop'", token: 'string.uuid' })
      )
      .handler(async ({ context, input }) => {
        await registerDevice(context.user.id, input)
      }),
    remove: authed
      .input(type({ token: 'string' }))
      .handler(async ({ context, input }) => {
        await removeDevice(context.user.id, input.token)
      }),
    test: authed
      .input(type({ token: 'string' }))
      .handler(({ context, input }) =>
        sendTestPush(context.user.id, input.token)
      ),
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
    setEnabled: authed
      .input(id.and({ enabled: 'boolean' }))
      .handler(async ({ context, input }) => {
        await setMailboxEnabled(context.user.id, input.id, input.enabled)
        if (input.enabled) {
          void syncMailbox(input).catch(logErrorAs('turned-on sync'))
        }
      }),
  },
  mail: {
    archive: authed
      .input(messageId)
      .handler(({ context, input }) =>
        archiveMessage(context.user.id, input.messageId)
      ),
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
    draftCount: authed.handler(({ context }) => countDrafts(context.user.id)),
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
    writeDraft: agent.input(messageId).handler(async ({ context, input }) => {
      const text = await writeReplyTo(context.user.id, input.messageId)
      return { html: textToHtml(text), text }
    }),
    list: authed
      .input(
        type({
          'before?': 'Date',
          'category?': type.enumerated(...MAIL_CATEGORIES),
          filter:
            "'inbox' | 'unread' | 'important' | 'needs_reply' | 'quiet' | 'pinned' | 'snoozed' | 'sent' | 'spam' | 'archive' | 'trash'",
          'indexOnly?': 'boolean',
          'mailboxId?': 'string.uuid',
          'search?': 'string',
        })
      )
      .handler(async ({ context, input }) =>
        withParticipants(
          context.user.id,
          await listMail(context.user.id, input)
        )
      ),
    labels: authed.handler(({ context }) => listUserLabels(context.user.id)),
    markRead: authed
      .input(type({ threadId: 'string' }))
      .handler(async ({ context, input }) => {
        await markThreadRead(context.user.id, input.threadId)
      }),
    markUnread: authed
      .input(type({ threadId: 'string' }))
      .handler(async ({ context, input }) => {
        await markThreadUnread(context.user.id, input.threadId)
      }),
    unread: authed
      .input(type({ 'mailboxId?': 'string.uuid' }))
      .handler(({ context, input }) =>
        countUnread(context.user.id, input.mailboxId)
      ),
    inGmail: authed
      .input(type({ 'mailboxId?': 'string.uuid' }))
      .handler(({ context, input }) =>
        countInboxInGmail(context.user.id, input.mailboxId)
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
    const [plan, settings, usage, hasGmail, hasAnyCalendar] = await Promise.all(
      [
        getPlanInfo(context.user.id),
        getSettings(context.user.id),
        getUsage(context.user.id),
        hasSignInScope(context.user.id, GMAIL_SCOPE),
        hasCalendar(context.user.id),
      ]
    )
    return {
      hasCalendar: hasAnyCalendar,
      hasGmail,
      plan,
      settings,
      usage,
      user: context.user,
    }
  }),
  bots: {
    addPreset: authed
      .input(
        type({ preset: type.enumerated(...BOT_PRESETS.map(({ key }) => key)) })
      )
      .handler(({ context, input }) =>
        addPresetBot(context.user.id, input.preset)
      ),
    create: authed
      .input(botInput)
      .handler(({ context, input }) => createBot(context.user.id, input)),
    createSimple: authed
      .input(simpleBotInput)
      .handler(({ context, input }) => createBot(context.user.id, input)),
    declineSuggestion: authed
      .input(type({ fromEmail: 'string > 0' }))
      .handler(({ context, input }) =>
        declineBotSuggestion(context.user.id, input.fromEmail)
      ),
    delete: authed.input(id).handler(async ({ context, input }) => {
      await deleteBot(context.user.id, input.id)
    }),
    list: authed.handler(({ context }) => listBots(context.user.id)),
    readEffect: authed
      .input(type({ simple: 'boolean', text: '2 < string <= 2000' }))
      .handler(({ input }) => readBotEffect(input.text, input.simple)),
    chats: authed.handler(({ context }) => listBotChats(context.user.id)),
    chat: authed
      .input(botRef.and({ 'before?': 'Date' }))
      .handler(({ context, input }) =>
        botChat(context.user.id, input.bot, input.before)
      ),
    read: authed
      .input(botRef)
      .handler(({ context, input }) => markBotRead(context.user.id, input.bot)),
    mute: authed
      .input(botRef.and({ muted: 'boolean' }))
      .handler(({ context, input }) =>
        setBotMuted(context.user.id, input.bot, input.muted)
      ),
    pin: authed
      .input(botRef.and({ pinned: 'boolean' }))
      .handler(({ context, input }) =>
        setBotPinned(context.user.id, input.bot, input.pinned)
      ),
    clear: authed
      .input(botRef)
      .handler(({ context, input }) =>
        clearBotChat(context.user.id, input.bot)
      ),
    folders: authed.handler(({ context }) => listBotFolders(context.user.id)),
    createFolder: authed
      .input(type({ 'bot?': '0 < string <= 64', name: folderName }))
      .handler(({ context, input }) => createBotFolder(context.user.id, input)),
    renameFolder: authed
      .input(id.and({ name: folderName }))
      .handler(({ context, input }) => renameBotFolder(context.user.id, input)),
    deleteFolder: authed
      .input(id)
      .handler(({ context, input }) =>
        deleteBotFolder(context.user.id, input.id)
      ),
    moveToFolder: authed
      .input(botRef.and({ folder: 'string.uuid | null' }))
      .handler(({ context, input }) => moveBotToFolder(context.user.id, input)),
    waiting: authed
      .input(botRef)
      .handler(({ context, input }) => waitingOf(context.user.id, input.bot)),
    ask: authed
      .input(
        botRef.and({
          'replyTo?': 'string.uuid',
          'seen?': { at: 'Date', keys: 'string[] <= 20' },
          text: `0 < string <= ${BOT_MESSAGE_CHARS}`,
          'voice?': 'boolean',
        })
      )
      .handler(async function* ask({ context, input }) {
        yield* askBot(context.user.id, input.bot, input.text.trim(), {
          replyTo: input.replyTo,
          seen: input.seen,
          voice: input.voice,
        })
      }),
    update: authed
      .input(id.and(botInput.partial()).and({ 'pausedUntil?': 'Date | null' }))
      .handler(({ context, input: { id: botId, ...change } }) =>
        updateBot(context.user.id, botId, change)
      ),
  },
  subscriptions: {
    clearOut: authed
      .input(
        type({
          groups: type.enumerated(...CLEAR_OUT_GROUPS).array(),
          lists: type({
            fromEmail: 'string',
            gmailId: 'string',
            listId: 'string | null',
            mailboxId: 'string.uuid',
          }).array(),
        })
      )
      .handler(({ context, input }) =>
        runClearOut(context.user.id, input.groups, input.lists)
      ),
    list: authed
      .input(type({ offset: 'number.integer >= 0' }))
      .handler(({ context, input }) =>
        pageSubscriptions(context.user.id, input.offset)
      ),
    scanClearOut: authed.handler(({ context }) =>
      scanClearOut(context.user.id)
    ),
    undoClearOut: authed
      .input(type({ run: CLEAR_OUT_RUN }))
      .handler(({ context, input }) =>
        undoClearOut(context.user.id, input.run)
      ),
    unsubscribe: authed
      .input(messageId)
      .handler(({ context, input }) =>
        unsubscribeMessage(context.user.id, input.messageId, 'list')
      ),
  },
  contacts: {
    delete: authed
      .input(type({ email: 'string.email' }))
      .handler(async ({ context, input }) => {
        await deleteContact(context.user.id, input.email)
      }),
    list: authed.handler(({ context }) => listContacts(context.user.id)),
  },

  settings: {
    save: authed
      .input(settingsInput)
      .handler(({ context, input }) => saveSettings(context.user.id, input)),
  },
  live: authed
    .input(type({ 'device?': 'string.uuid' }))
    .handler(async function* live({ context, input, signal }) {
      if (input.device) {
        keepDeviceSeen(context.user.id, input.device, signal)
      }
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
    banner: authed.handler(({ context }) => listBanner(context.user.id)),
    count: authed.handler(({ context }) => countWaiting(context.user.id)),
    dismissBanner: authed.input(id).handler(async ({ context, input }) => {
      await dismissBanner(context.user.id, input.id)
    }),
    get: authed.handler(({ context }) => getToday(context.user.id)),
    handled: authed.handler(({ context }) => listJournal(context.user.id)),
    keepSender: authed
      .input(messageId)
      .handler(({ context, input }) =>
        keepSender(context.user.id, input.messageId)
      ),
    keep: authed
      .input(type({ messageIds: 'string.uuid[] > 0' }))
      .handler(({ context, input }) =>
        settleTidy(context.user.id, input.messageIds, 'dismissed')
      ),
    open: authed.handler(({ context }) => openToday(context.user.id)),
    queue: authed.handler(({ context }) => listQueue(context.user.id)),
    tidy: authed
      .input(type({ messageIds: 'string.uuid[] > 0' }))
      .handler(({ context, input }) =>
        settleTidy(context.user.id, input.messageIds, 'done')
      ),
  },
  reading: {
    day: authed
      .input(readingDayInput)
      .handler(({ context, input }) =>
        getReadingDay(context.user.id, input.day)
      ),
    issues: authed.handler(({ context }) => listReadingIssues(context.user.id)),
    markRead: authed
      .input(type({ day: /^\d{4}-\d{2}-\d{2}$/u }))
      .handler(({ context, input }) =>
        markReadingRead(context.user.id, input.day)
      ),
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
