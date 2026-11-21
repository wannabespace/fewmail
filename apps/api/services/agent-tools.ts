import {
  AGENT_TOOLS,
  BOARD_EFFECT,
  COMMITMENT_STATUSES,
  EVENT_SCOPES,
  MAIL_CATEGORIES,
  BOT_EFFECTS,
  CLEAR_OUT_GROUPS,
  WRAPPED_PERIODS,
} from '@fewmail/shared/agent'
import type { AgentToolName } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { z } from 'zod'

import { announceChange } from '../lib/live'
import { botChat, remindLater } from './bot-chat'
import { createBot, listBots, updateBot } from './bots'
import { createEvent, deleteEvent, listEvents, updateEvent } from './calendar'
import {
  listSubscriptions,
  runClearOut,
  scanClearOut,
  undoClearOut,
} from './cleanup'
import { listCommitments, setCommitmentStatus } from './commitments'
import { saveDraft } from './drafts'
import { getToday } from './home'
import {
  approveAction,
  archiveMessage,
  settleTidy,
  moveToInbox,
  dismissAction,
  draftReply,
  getThread,
  listHandled,
  listMail,
  redraftAction,
  snoozeMessage,
  trashMessage,
} from './mail'
import { NotFoundError } from './mail-errors'
import { scheduleMail } from './outbox'
import { findContacts, getPerson } from './people'
import { getReadingDay } from './reading'
import { markNotSpam, reportSpam } from './spam'
import { syncMailboxes } from './sync'
import { unsubscribeMessage } from './thread-effects'
import { getWrapped } from './wrapped'

const define = <Input extends z.ZodRawShape = Record<never, never>>(tool: {
  description: string
  input?: Input
  run: (input: z.infer<z.ZodObject<Input>>) => Promise<unknown>
}) => tool

const eventFields = {
  allDay: z.boolean(),
  description: z.string().optional(),
  end: z.string(),
  location: z.string().optional(),
  start: z.string(),
  title: z.string().min(1),
}

const EVENT_TIMES =
  "start and end are ISO 8601 with the user's UTC offset, or yyyy-MM-dd when allDay (end exclusive: a one-day event ends the next day)."

interface AgentTool {
  description: string
  input?: z.ZodRawShape
  run: (input: never) => Promise<unknown>
}

const toolsOf = (userId: string): Record<AgentToolName, AgentTool> => ({
  get_today: define({
    description:
      "What needs the user across their bot chats, live. The queue of things that need them (queue): each pending action has an id, a kind (reply, pay, schedule, follow_up, read, archive, mark_read, unsubscribe, commitment: a promise the user made that is due, heads_up: a last day coming up or a promise to the user that has not come, said in its detail), the email it is about and, for replies, a draft in the user's voice. Also counts what the agent handled on its own and how much mail came in (pulse) since the user's last day on Home (days: at least 1, at most 7), the other unread mail worth knowing from those days (recent), mail naming a due date or meeting time, soonest first and none already passed (dates), sent mail still waiting for an answer (awaiting) and the time the agent saved the user in the last 7 days (saved: minutes, from emails handled on its own and replies sent from its drafts) and quiet inbox mail no bot covers that the agent would archive, mark read or unsubscribe from (tidy: each email with its suggestedAction; carry them out with tidy_mail) and sign-in or verification codes from the last 15 minutes still in the inbox (codes) and senders whose every email of the last month the agent would archive or mark read (botSuggestions: count, effect and fromEmail; the user can say yes in the app, or you can offer a bot with create_bot, never make one unasked).",
    run: () => getToday(userId),
  }),
  list_mail: define({
    description:
      "List recent emails with the agent's analysis (category, importance 0–3, one-line summary, whether a reply is expected). filter: inbox (what is in the Gmail inbox now), unread (unread threads in the inbox), important (importance ≥ 2), needs_reply and quiet (noise), all three within the inbox; pinned (threads the user pinned, starred in Gmail, that are still in the inbox; every email carries isPinned); snoozed, sent (what the user sent, newest first, each with its recipients in to), spam, archive (archived, out of the inbox) and trash. search takes plain language ('invoices from Anna last month') or Gmail search syntax (from:, subject:, newer_than:, has:attachment…).",
    input: {
      category: z.enum(MAIL_CATEGORIES).optional(),
      filter: z
        .enum([
          'inbox',
          'unread',
          'important',
          'needs_reply',
          'quiet',
          'pinned',
          'snoozed',
          'sent',
          'spam',
          'archive',
          'trash',
        ])
        .default('inbox'),
      search: z.string().optional(),
    },
    run: (input) => listMail(userId, input),
  }),
  read_thread: define({
    description:
      'Read every message of an email thread in full, with the agent analysis and actions for it and the names, types and sizes of its attached files.',
    input: { threadId: z.string() },
    run: ({ threadId }) => getThread(userId, threadId),
  }),
  draft_reply: define({
    description:
      'Have the agent draft (or redraft) a reply to an email in the user\'s voice. Nothing is sent: the draft lands in the queue as a pending reply action. instruction steers it ("decline politely", "propose Tuesday 10:00").',
    input: {
      instruction: z.string().optional(),
      messageId: z.uuid(),
    },
    run: ({ instruction, messageId }) =>
      draftReply(userId, messageId, instruction),
  }),
  redraft_action: define({
    description:
      'Rewrite the draft of a pending reply action with an instruction ("shorter", "more formal").',
    input: { actionId: z.uuid(), instruction: z.string() },
    run: ({ actionId, instruction }) =>
      redraftAction(userId, actionId, instruction),
  }),
  approve_action: define({
    description:
      "Carry out a pending action from the queue. For a reply this SENDS the email from the user's Gmail, using text when given instead of the stored draft; confirm the exact text with the user first. Archive, mark_read and unsubscribe change Gmail; the others mark the email read and close the action.",
    input: { actionId: z.uuid(), text: z.string().optional() },
    run: ({ actionId, text }) => approveAction(userId, actionId, text),
  }),
  dismiss_action: define({
    description: 'Close a pending action without doing anything in Gmail.',
    input: { actionId: z.uuid() },
    run: ({ actionId }) => dismissAction(userId, actionId),
  }),
  send_email: define({
    description:
      "Write a new email (not a reply) from the user's Gmail. It leaves after a few seconds' undo window; confirm the recipients and the exact text with the user first. Replies go through draft_reply and approve_action instead.",
    input: {
      cc: z.array(z.email()).optional(),
      subject: z.string(),
      text: z.string().min(1),
      to: z.array(z.email()).min(1),
    },
    run: (mail) =>
      scheduleMail(userId, {
        ...mail,
        html: textToHtml(mail.text),
        mode: 'new',
      }),
  }),
  create_draft: define({
    description:
      "Save an email as a draft in the user's Gmail without sending it; they finish and send it themselves from Fewmail or Gmail. replyToMessageId makes it a reply in that email's thread.",
    input: {
      cc: z.array(z.email()).optional(),
      replyToMessageId: z.uuid().optional(),
      subject: z.string(),
      text: z.string().min(1),
      to: z.array(z.email()),
    },
    run: (mail) =>
      saveDraft(userId, {
        ...mail,
        html: textToHtml(mail.text),
        mode: mail.replyToMessageId ? 'reply' : 'new',
      }),
  }),
  archive_thread: define({
    description:
      'Archive the email thread in Gmail: it leaves the inbox, nothing is deleted. messageId is any email of the thread.',
    input: { messageId: z.uuid() },
    run: async ({ messageId }) => {
      await archiveMessage(userId, messageId)
      return { archived: true }
    },
  }),
  tidy_mail: define({
    description:
      "Do what the agent suggested for quiet inbox mail (get_today's tidy): archive, mark read or unsubscribe, each email as its suggestedAction says. messageIds are emails from tidy; anything else is ignored. settled counts the emails done, failed those Gmail refused.",
    input: { messageIds: z.array(z.uuid()).min(1) },
    run: ({ messageIds }) => settleTidy(userId, messageIds, 'done'),
  }),
  trash_thread: define({
    description:
      'Move the email thread to the Gmail trash; Gmail deletes it for good after 30 days. messageId is any email of the thread.',
    input: { messageId: z.uuid() },
    run: async ({ messageId }) => {
      await trashMessage(userId, messageId)
      return { trashed: true }
    },
  }),
  move_to_inbox: define({
    description:
      'Move an archived or trashed email thread back to the inbox. For spam use mark_not_spam. messageId is any email of the thread.',
    input: { messageId: z.uuid() },
    run: async ({ messageId }) => {
      await moveToInbox(userId, messageId)
      return { inInbox: true }
    },
  }),
  report_spam: define({
    description:
      "Move the email thread to spam and report its sender, so the sender's later mail goes to spam too.",
    input: { messageId: z.uuid() },
    run: async ({ messageId }) => {
      await reportSpam(userId, messageId)
      return { reported: true }
    },
  }),
  mark_not_spam: define({
    description:
      'Move an email thread wrongly sent to spam back to the inbox and trust its sender again.',
    input: { messageId: z.uuid() },
    run: async ({ messageId }) => {
      await markNotSpam(userId, messageId)
      return { inInbox: true }
    },
  }),
  snooze_thread: define({
    description:
      "Hide the email thread until a time; it comes back to the inbox unread then. until is ISO 8601 with the user's UTC offset.",
    input: { messageId: z.uuid(), until: z.iso.datetime({ offset: true }) },
    run: async ({ messageId, until }) => {
      await snoozeMessage(userId, messageId, new Date(until))
      return { until }
    },
  }),
  unsubscribe: define({
    description:
      'Unsubscribe from the mailing list an email came from (through its own one-click unsubscribe link, when it has one) and archive everything that list sent (a sender like notifications@github.com sends a list per repository). unsubscribed says whether the list was actually left. ignoresUnsubscribe means the sender is known to keep writing after an unsubscribe: tell the user and offer a trash bot for that sender (create_bot), never make one unasked.',
    input: { messageId: z.uuid() },
    run: ({ messageId }) => unsubscribeMessage(userId, messageId, 'list'),
  }),
  preview_clear_out: define({
    description:
      'What a clear-out of the whole inbox would move out, read from Gmail (takes up to a minute): inbox is how many emails are in it (isCapped: more than counted), overlaps counts inbox emails by the exact set of groups they fall in, so a choice of groups adds up without double counting (promotions: ads and social older than 3 days, notifications: read updates and forum mail older than 30 days, lists: mailing lists with 3+ emails none of them opened, old: everything older than a year), senders are those unopened lists. Show the user the numbers before offering clear_out.',
    run: () => scanClearOut(userId),
  }),
  clear_out: define({
    description:
      "Archive the chosen groups of inbox mail (see preview_clear_out) under this run's label in Fewmail/Cleared; for lists also unsubscribe. lists: preview_clear_out's senders the user saw, as returned (empty without the lists group). Nothing is deleted; undo_clear_out with the returned run brings it back, also when failed (Gmail refused part).",
    input: {
      groups: z.array(z.enum(CLEAR_OUT_GROUPS)).min(1),
      lists: z.array(
        z.object({
          fromEmail: z.string(),
          gmailId: z.string(),
          listId: z.string().nullable(),
          mailboxId: z.string(),
        })
      ),
    },
    run: ({ groups, lists }) => runClearOut(userId, groups, lists),
  }),
  undo_clear_out: define({
    description:
      "Move one clear-out's emails back to the inbox: run from clear_out, else the latest. Unsubscribes stay.",
    input: { run: z.string().optional() },
    run: ({ run }) => undoClearOut(userId, run),
  }),
  get_reading: define({
    description:
      "One day of newsletters (day yyyy-MM-dd, else the latest issue): each one's sender, subject, summary and threadId, and the agent's summary of them all once written the next morning.",
    input: { day: z.iso.date().optional() },
    run: ({ day }) => getReadingDay(userId, day),
  }),
  get_wrapped: define({
    description:
      "The user's mail so far this year or this month, Wrapped style: emails in (from people, from lists), handled (by bots on their own plus the archive, mark read, unsubscribe, trash and spam the user said yes to), replies sent from its drafts, minutes saved, lists left, spam stopped, the busiest ISO weekday and hour in their time zone, and the three people who wrote most. shareToken makes the public link /w/<shareToken>, which shows the counts only.",
    input: { period: z.enum(WRAPPED_PERIODS) },
    run: ({ period }) => getWrapped(userId, period),
  }),
  list_handled: define({
    description:
      'What the agent did, newest first, with the email each was about: status done (after the user said yes), auto_done (by a bot the user turned on, named in bot) or failed. since is ISO 8601, the last 24 hours by default.',
    input: { since: z.iso.datetime({ offset: true }).optional() },
    run: ({ since }) =>
      listHandled(userId, since ? new Date(since) : undefined),
  }),
  list_subscriptions: define({
    description:
      'Mailing lists that wrote to the user in the last 30 days and they have not left, busiest first: sender (a sender of several lists has one row per list, named by its title), how many emails, how many were opened, the share of its readers on Fewmail who left it (leftShare, 0 to 1, null while too few get it) and the messageId of the latest one to pass to unsubscribe.',
    run: () => listSubscriptions(userId),
  }),
  find_people: define({
    description:
      'Email addresses of people the user wrote to or heard from whose name or address contains the query, the most written-to first. Use it to turn a name into an address before send_email or create_draft.',
    input: { query: z.string().min(1) },
    run: ({ query }) => findContacts(userId, query),
  }),
  get_person: define({
    description:
      "What the user's mail knows about one person: since when they write, conversation count, open items, promises the user made to them (promised), promises they made to the user that are still open (owed) and a short note.",
    input: { email: z.email() },
    run: ({ email }) => getPerson(userId, email),
  }),
  get_bot_chat: define({
    description:
      "One Home bot's chat over the last two weeks, oldest first: the cards it reported (each with its email and status), the promises (the Board), each day's digest (counts: what Fewmail's headline said that morning; cards: what waited then, with its status now), and what was said: the user's messages, the answers, and nudges (what the bot came back with when it said it would; replied tells whether the thread got an answer since). bot is fewmail, board or the id of one of the user's bots (list_bots).",
    input: { bot: z.string().min(1) },
    run: ({ bot }) => botChat(userId, bot),
  }),
  remind_later: define({
    description:
      "Come back to the user later in one bot's chat: at that moment the note appears there and the user gets a notification (never at night, then in the morning), unless they muted the bot. Use it when the user asks to be reminded or to check later whether something came (a payment, an answer). at: ISO 8601 with the user's UTC offset, within 90 days. bot: the chat it belongs to (fewmail, board or one of the user's bots). threadId: the email thread it is about, so the bot can say whether an answer came since. note: what the bot will say, in the user's language.",
    input: {
      at: z.string(),
      bot: z.string().min(1),
      note: z.string().min(1).max(500),
      threadId: z.string().optional(),
    },
    run: ({ at, ...nudge }) =>
      remindLater(userId, { ...nudge, at: new Date(at) }),
  }),
  list_promises: define({
    description:
      "Every promise the agent tracks: the user's own from their sent mail (mine), those made to the user (theirs) and last days an email implies (deadline). status: open, acknowledged (someone answered, nothing done yet), in_progress, fulfilled (an email proved it: evidenceMessageId), broken or cancelled; history lists each change, who made it (agent from an email, or user) and the email; amountCents and currency when it is money owed to the user (a refund). A reply alone never makes a promise fulfilled.",
    run: () => listCommitments(userId),
  }),
  set_promise_status: define({
    description:
      'Set a promise\'s status when the user says so ("they paid me back", "forget that one", "it never came"): fulfilled, broken, cancelled, or open to reopen. Changes nothing in Gmail.',
    input: {
      id: z.uuid(),
      status: z.enum(COMMITMENT_STATUSES),
    },
    run: async ({ id, status }) => {
      await setCommitmentStatus(userId, id, status)
      return { status }
    },
  }),
  list_events: define({
    description:
      "Events in the user's Google calendars between from and to (ISO 8601), across every mailbox, each with its id, mailboxId and, for one occurrence of a recurring event, its seriesId. calendars lists each mailbox and whether its calendar is connected.",
    input: {
      from: z.iso.datetime({ offset: true }),
      to: z.iso.datetime({ offset: true }),
    },
    run: ({ from, to }) =>
      listEvents(userId, { from: new Date(from), to: new Date(to) }),
  }),
  create_event: define({
    description: `Add an event to the user's Google calendar (the sign-in mailbox's unless mailboxId is given). ${EVENT_TIMES} Confirm the title and time with the user first.`,
    input: { ...eventFields, mailboxId: z.uuid().optional() },
    run: (event) => createEvent(userId, event),
  }),
  update_event: define({
    description: `Change an event from list_events, sending every field again. ${EVENT_TIMES} For a recurring event, scope says what changes: this occurrence only (this, the default), it and every later one (following) or the whole series (all); ask the user which.`,
    input: {
      ...eventFields,
      id: z.string(),
      mailboxId: z.uuid(),
      scope: z.enum(EVENT_SCOPES).optional(),
    },
    run: ({ id, mailboxId, scope, ...event }) =>
      updateEvent(userId, { id, mailboxId }, event, scope),
  }),
  delete_event: define({
    description:
      'Delete an event from list_events from the Google calendar. For a recurring event, scope says what goes: this occurrence only (this, the default), it and every later one (following) or the whole series (all); ask the user which.',
    input: {
      id: z.string(),
      mailboxId: z.uuid(),
      scope: z.enum(EVENT_SCOPES).optional(),
    },
    run: async ({ scope, ...ref }) => {
      await deleteEvent(userId, ref, scope)
      return { deleted: true }
    },
  }),
  list_bots: define({
    description:
      "The user's bots, the chats on Home: each takes the incoming mail its plain-language instruction (or a simple match on sender, subject or mailing list) describes, and has a name and an effect: archive, mark_read, unsubscribe and trash move each email; tidy does what you would suggest for each email (archive, mark read or unsubscribe); draft_reply leaves a draft in the bot's chat; always_show puts each email in the bot's chat as one that needs the user; collect only gathers the mail there. enabled: the bot moves mail on its own; off, it asks the user for a yes on each email. Mail no bot takes is Fewmail's; a bot with effect promises is the Board, which holds the promises and takes no mail.",
    run: () => listBots(userId),
  }),
  create_bot: define({
    description:
      'Make the user a bot that looks after some of their mail, e.g. name "Hetzner", instruction "Invoices from Hetzner: mark them read", effect mark_read. The instruction is all the user sees, so it says both which mail and what the effect does with it. archive, mark_read, unsubscribe and trash move each email; tidy does what you would suggest for each email (archive, mark read or unsubscribe); draft_reply leaves a draft in the bot\'s chat; always_show puts each email in the bot\'s chat as one that needs the user; collect only gathers the mail there. enabled: the bot moves mail on its own; off, it asks the user for a yes on each email.',
    input: {
      effect: z.enum(BOT_EFFECTS),
      enabled: z.boolean().default(false),
      instruction: z.string().min(3),
      name: z.string().min(1).max(60),
    },
    run: (input) => createBot(userId, input),
  }),
  update_bot: define({
    description:
      "Change one of the user's bots when they ask in its chat (or in Fewmail Bot's): its name, which mail it takes and what it does with it (instruction, written as create_bot's: both which mail and what it does), its effect, whether it acts on its own (enabled: off, it asks the user for a yes on each email) or a pause (pausedUntil: ISO 8601 with the user's UTC offset; it takes no mail until then and its mail is Fewmail Bot's; null ends the pause). Send only what changes. id: the bot's id (list_bots). The Board takes only a new name.",
    input: {
      effect: z.enum(BOT_EFFECTS).optional(),
      enabled: z.boolean().optional(),
      id: z.uuid(),
      instruction: z.string().min(3).optional(),
      name: z.string().min(1).max(60).optional(),
      pausedUntil: z.iso.datetime({ offset: true }).nullable().optional(),
    },
    run: async ({ id, pausedUntil, ...change }) => {
      const own = await listBots(userId)
      const bot = own.find((each) => each.id === id)
      if (!bot) {
        throw new NotFoundError('Bot not found')
      }
      if (bot.effect === BOARD_EFFECT) {
        return updateBot(userId, id, { name: change.name })
      }
      return updateBot(userId, id, {
        ...change,
        ...(pausedUntil === undefined
          ? {}
          : { pausedUntil: pausedUntil ? new Date(pausedUntil) : null }),
      })
    },
  }),
  refresh: define({
    description:
      'Fetch new mail from Gmail and analyze it, then return the same as get_today. Takes a few seconds per new email.',
    run: async () => {
      await syncMailboxes(userId)
      return getToday(userId)
    },
  }),
})

/** Everything the agent can do for a user, shared by MCP and the agent's runs (messengers); their access comes from `AGENT_TOOLS`. A write refreshes every open tab, since a tool can touch any part of the app. */
export const agentTools = (userId: string) =>
  Object.fromEntries(
    Object.entries(toolsOf(userId)).map(([name, tool]) => [
      name,
      AGENT_TOOLS[name as AgentToolName] === 'read'
        ? tool
        : {
            ...tool,
            run: async (input: never) => {
              const result = await tool.run(input)
              await announceChange(userId)
              return result
            },
          },
    ])
  ) as Record<AgentToolName, AgentTool>

export const toolAccess = (name: string) => AGENT_TOOLS[name as AgentToolName]
