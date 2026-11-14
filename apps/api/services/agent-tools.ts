import {
  AGENT_TOOLS,
  BOARD_PERIODS,
  MAIL_CATEGORIES,
  RULE_EFFECTS,
  CLEAR_OUT_GROUPS,
  WRAPPED_PERIODS,
} from '@fewmail/shared/agent'
import type { AgentToolName } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { z } from 'zod'

import { announceChange } from '../lib/live'
import {
  addChart,
  addToBoard,
  createBoard,
  deleteBoard,
  dismissEntry,
  getBoard,
  listBoards,
  renameGroup,
  updateBoard,
  updateEntry,
} from './boards'
import { createEvent, deleteEvent, listEvents, updateEvent } from './calendar'
import {
  listSubscriptions,
  runClearOut,
  scanClearOut,
  undoClearOut,
} from './cleanup'
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
import { scheduleMail } from './outbox'
import { getPerson } from './people'
import { getReading } from './reading'
import { createRule, listRules } from './rules'
import { createSchedule, deleteSchedule, listSchedules } from './schedules'
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

const BOARD_ENTRIES_SHOWN = 60

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
      "What the user's Home screen shows, live. The queue of things that need them (queue): each pending action has an id, a kind (reply, pay, schedule, follow_up, read, archive, mark_read, unsubscribe), the email it is about and, for replies, a draft in the user's voice. Also counts what the agent handled on its own and how much mail came in (pulse) since the user's last day on Home (days: at least 1, at most 7), the other unread mail worth knowing from those days (recent), mail naming a due date or meeting time, soonest first and none already passed (dates), sent mail still waiting for an answer (awaiting), what each board collected in the last 30 days (boards), board entries whose next date is coming up such as a renewal, a bill or a departure (banners) and the time the agent saved the user in the last 7 days (saved: minutes, from emails handled on its own and replies sent from its drafts) and quiet inbox mail no rule covers that the agent would archive, mark read or unsubscribe from (tidy: each email with its suggestedAction; carry them out with tidy_mail) and sign-in or verification codes from the last 15 minutes still in the inbox (codes).",
    run: () => getToday(userId),
  }),
  list_mail: define({
    description:
      "List recent emails with the agent's analysis (category, importance 0–3, one-line summary, whether a reply is expected). filter: inbox (what is in the Gmail inbox now), unread (unread threads in the inbox), important (importance ≥ 2), needs_reply and quiet (noise), all three within the inbox; pinned (threads the user pinned, starred in Gmail, that are still in the inbox; every email carries isPinned); snoozed, spam, archive (archived, out of the inbox) and trash. search takes plain language ('invoices from Anna last month') or Gmail search syntax (from:, subject:, newer_than:, has:attachment…).",
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
      'Read every message of an email thread in full, with the agent analysis and actions for it.',
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
      "Do what the agent suggested for quiet inbox mail (get_today's tidy): archive, mark read or unsubscribe, each email as its suggestedAction says. messageIds are emails from tidy; anything else is ignored. settled counts the emails done.",
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
      'Unsubscribe from the mailing list an email came from (through its own one-click unsubscribe link, when it has one) and archive everything that list sent (a sender like notifications@github.com sends a list per repository). unsubscribed says whether the list was actually left. ignoresUnsubscribe means the sender is known to keep writing after an unsubscribe: tell the user and offer a trash rule for that sender (create_rule), never make one unasked.',
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
      'Archive the chosen groups of inbox mail (see preview_clear_out) under the Gmail label Fewmail/Cleared, and for lists also unsubscribe from them. Nothing is deleted; undo_clear_out brings every cleared email back.',
    input: { groups: z.array(z.enum(CLEAR_OUT_GROUPS)).min(1) },
    run: ({ groups }) => runClearOut(userId, groups),
  }),
  undo_clear_out: define({
    description:
      'Move every email a clear-out archived back to the inbox. Unsubscribes are not undone.',
    run: () => undoClearOut(userId),
  }),
  get_reading: define({
    description:
      "The last 24 hours of newsletters, newest first: sender, subject, a two or three sentence summary of what each says, and the threadId to open it. They usually sit outside the inbox, archived by the user's newsletter rule.",
    run: () => getReading(userId),
  }),
  get_wrapped: define({
    description:
      "The user's mail so far this year or this month, Wrapped style: emails in (from people, from lists), handled by the agent on its own, replies sent from its drafts, minutes saved, lists left, spam stopped, the busiest ISO weekday and hour in their time zone, and the three people who wrote most. shareToken makes the public link /w/<shareToken>, which shows the counts only.",
    input: { period: z.enum(WRAPPED_PERIODS) },
    run: ({ period }) => getWrapped(userId, period),
  }),
  list_handled: define({
    description:
      'What the agent did, newest first, with the email each was about: status done (after the user said yes), auto_done (by a rule the user turned on, named in rule) or failed. since is ISO 8601, the last 24 hours by default.',
    input: { since: z.iso.datetime({ offset: true }).optional() },
    run: ({ since }) =>
      listHandled(userId, since ? new Date(since) : undefined),
  }),
  list_subscriptions: define({
    description:
      'Mailing lists that wrote to the user in the last 30 days and they have not left, busiest first: sender (a sender of several lists has one row per list, named by its title), how many emails, how many were opened, and the messageId of the latest one to pass to unsubscribe.',
    run: () => listSubscriptions(userId),
  }),
  get_person: define({
    description:
      "What the user's mail knows about one person: since when they write, conversation count, open items, promises the user made to them and a short note.",
    input: { email: z.email() },
    run: ({ email }) => getPerson(userId, email),
  }),
  list_boards: define({
    description:
      "The user's boards: pages that collect one kind of email (money, trips, orders…) as entries. Use get_board to read one.",
    run: () => listBoards(userId),
  }),
  create_board: define({
    description:
      'Create a board that collects one kind of email as entries. description says what belongs on it ("receipts and refunds with their amounts"), at least 3 characters; it fills from mail the user already has, as far back as periodDays (default 90; entries older than the period leave the board).',
    input: {
      description: z.string().min(3),
      name: z.string().min(1),
      periodDays: z.literal([...BOARD_PERIODS]).optional(),
    },
    run: (input) => createBoard(userId, input),
  }),
  get_board: define({
    description:
      'One board: its description and Gmail query, a summary (this month, last month, what repeats per month, what is due soon), its groups (total, how often they repeat, next date), the newest entries (id, title, group, status, amount, date, next date) and the series behind its charts.',
    input: { id: z.uuid() },
    run: async ({ id }) => {
      const board = await getBoard(userId, id)
      return { ...board, entries: board.entries.slice(0, BOARD_ENTRIES_SHOWN) }
    },
  }),
  update_board: define({
    description:
      "Change a board: its name, what it collects (a new description reads its period again; entries the user edited or removed stay), how far back it collects (periodDays: a longer period reads the extra mail, a shorter one hides older entries) or how many days before an entry's next date it warns (1–14, null for never).",
    input: {
      bannerDays: z.number().int().min(1).max(14).nullable().optional(),
      description: z.string().min(3).optional(),
      id: z.uuid(),
      name: z.string().min(1).optional(),
      periodDays: z.literal([...BOARD_PERIODS]).optional(),
    },
    run: ({ id, ...input }) => updateBoard(userId, id, input),
  }),
  delete_board: define({
    description:
      'Delete a board and every entry on it. Only when the user asks to delete that board.',
    input: { id: z.uuid() },
    run: ({ id }) => deleteBoard(userId, id),
  }),
  add_board_chart: define({
    description:
      'Add a chart to a board from the user\'s words ("spending per shop", "orders by status").',
    input: { ask: z.string().min(3), id: z.uuid() },
    run: ({ ask, id }) => addChart(userId, id, ask),
  }),
  add_to_board: define({
    description:
      'Put an email on a board that its search missed; the entry is written from the email.',
    input: { boardId: z.uuid(), messageId: z.uuid() },
    run: ({ boardId, messageId }) => addToBoard(userId, boardId, messageId),
  }),
  edit_board_entry: define({
    description:
      "Correct an entry of a board (id from get_board). amount is in the currency's units, negative for a refund; dates are ISO; null clears a field.",
    input: {
      amount: z.number().nullable().optional(),
      currency: z.string().length(3).nullable().optional(),
      date: z.iso.date().optional(),
      dueAt: z.iso.date().nullable().optional(),
      group: z.string().nullable().optional(),
      id: z.uuid(),
      status: z.string().nullable().optional(),
      title: z.string().min(1).optional(),
    },
    run: ({ amount, date, dueAt, id, ...input }) =>
      updateEntry(userId, id, {
        ...input,
        ...(amount !== undefined && {
          amountCents: amount === null ? null : Math.round(amount * 100),
        }),
        ...(date && { occurredAt: new Date(date) }),
        ...(dueAt !== undefined && { dueAt: dueAt ? new Date(dueAt) : null }),
      }),
  }),
  remove_board_entry: define({
    description:
      'Take an entry off its board because it does not belong; the board learns from it and never collects that email again.',
    input: { id: z.uuid() },
    run: ({ id }) => dismissEntry(userId, id),
  }),
  rename_board_group: define({
    description:
      'Rename a group on a board; renaming it to another group\'s name merges the two ("Netflix Inc." into "Netflix").',
    input: { from: z.string(), id: z.uuid(), to: z.string().min(1) },
    run: ({ from, id, to }) => renameGroup(userId, id, { from, to }),
  }),
  list_events: define({
    description:
      "Events in the user's Google calendars between from and to (ISO 8601), across every mailbox, each with its id and mailboxId. calendars lists each mailbox and whether its calendar is connected.",
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
    description: `Change an event from list_events, sending every field again. ${EVENT_TIMES}`,
    input: { ...eventFields, id: z.string(), mailboxId: z.uuid() },
    run: ({ id, mailboxId, ...event }) =>
      updateEvent(userId, { id, mailboxId }, event),
  }),
  delete_event: define({
    description: 'Delete an event from list_events from the Google calendar.',
    input: { id: z.string(), mailboxId: z.uuid() },
    run: async (ref) => {
      await deleteEvent(userId, ref)
      return { deleted: true }
    },
  }),
  list_rules: define({
    description:
      'The rules the agent follows. Each has a plain-language instruction matched against incoming mail, and an effect: archive, mark_read, unsubscribe and trash are applied on their own, draft_reply leaves a draft on Home, always_show puts the email on Home.',
    run: () => listRules(userId),
  }),
  create_rule: define({
    description:
      'Teach the agent a rule, e.g. instruction "Invoices from Hetzner", effect mark_read. archive, mark_read, unsubscribe and trash are then applied to matching mail without asking.',
    input: {
      effect: z.enum(RULE_EFFECTS),
      instruction: z.string().min(3),
    },
    run: (input) => createRule(userId, input),
  }),
  list_schedules: define({
    description:
      "The user's schedules: instructions the agent runs on its own at set times, each with its cadence in words, the next run and the chat its runs land in.",
    run: () => listSchedules(userId),
  }),
  create_schedule: define({
    description:
      'Run an instruction on a schedule, for anything the user wants regularly: every Friday at 17:00 "collect this week\'s invoices and tell me the total", every Monday at 9:00 "write the weekly report to team@… from the Money board". instruction is the message the agent receives each time, complete on its own. cron is a 5-field cron expression in the user\'s timezone, at most hourly; when is the same cadence in words in the user\'s language ("Every Friday at 17:00"). Each run is a new message in the schedule\'s own chat and the user gets a notification; sending and Gmail changes still wait for their approval there.',
    input: {
      cron: z.string(),
      instruction: z.string().min(4),
      when: z.string().min(2),
    },
    run: (input) => createSchedule(userId, input),
  }),
  delete_schedule: define({
    description: 'Stop a schedule; its past runs stay in its chat.',
    input: { id: z.uuid() },
    run: async ({ id }) => {
      await deleteSchedule(userId, id)
      return { deleted: true }
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

/** Everything the agent can do for a user, shared by MCP and the agent chat; their access comes from `AGENT_TOOLS`. A write refreshes every open tab, since a tool can touch any part of the app. */
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
