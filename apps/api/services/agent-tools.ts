import {
  AGENT_TOOLS,
  MAIL_CATEGORIES,
  RULE_EFFECTS,
} from '@fewmail/shared/agent'
import type { AgentToolName } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { z } from 'zod'

import { createBoard, getBoard, listBoards } from './boards'
import { generateBrief, getToday } from './brief'
import { createEvent, deleteEvent, listEvents, updateEvent } from './calendar'
import { listSubscriptions } from './cleanup'
import { saveDraft } from './drafts'
import {
  approveAction,
  archiveMessage,
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
import { createRule, listRules } from './rules'
import { createSchedule, deleteSchedule, listSchedules } from './schedules'
import { markNotSpam, reportSpam } from './spam'
import { syncMailboxes } from './sync'
import { createTask } from './tasks'
import { unsubscribeMessage } from './thread-effects'

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

/** Everything the agent can do for a user, shared by MCP and the agent chat; their access comes from `AGENT_TOOLS`. */
export const agentTools = (
  userId: string
): Record<AgentToolName, AgentTool> => ({
  get_today: define({
    description:
      "The user's email brief and the queue of things that need them: each pending action has an id, a kind (reply, pay, schedule, follow_up, read, archive, mark_read, unsubscribe), the email it is about and, for replies, a draft in the user's voice. Also counts what the agent handled on its own and how much mail came in (pulse) in the last 24 hours, the other mail worth knowing from that day (recent), mail naming a due date or meeting time (dates), sent mail still waiting for an answer (awaiting) and what each board collected in the last 30 days (boards).",
    run: () => getToday(userId),
  }),
  list_mail: define({
    description:
      "List recent emails with the agent's analysis (category, importance 0–3, one-line summary, whether a reply is expected). filter: inbox (what is in the Gmail inbox now), important (importance ≥ 2), needs_reply and quiet (noise) — all three within the inbox — snoozed. search takes plain language ('invoices from Anna last month') or Gmail search syntax (from:, subject:, newer_than:, has:attachment…).",
    input: {
      category: z.enum(MAIL_CATEGORIES).optional(),
      filter: z
        .enum(['inbox', 'important', 'needs_reply', 'quiet', 'snoozed', 'spam'])
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
  trash_thread: define({
    description:
      'Move the email thread to the Gmail trash; Gmail deletes it for good after 30 days. messageId is any email of the thread.',
    input: { messageId: z.uuid() },
    run: async ({ messageId }) => {
      await trashMessage(userId, messageId)
      return { trashed: true }
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
      "Unsubscribe from the mailing list an email came from (through its own one-click unsubscribe link, when it has one) and archive everything that sender sent. unsubscribed says whether the sender's list was actually left.",
    input: { messageId: z.uuid() },
    run: ({ messageId }) => unsubscribeMessage(userId, messageId, 'sender'),
  }),
  list_handled: define({
    description:
      'What the agent did on its own (archived, marked read, unsubscribed, trashed, moved to spam), newest first, with the email each was about: since is ISO 8601, the last 24 hours by default.',
    input: { since: z.iso.datetime({ offset: true }).optional() },
    run: ({ since }) =>
      listHandled(userId, since ? new Date(since) : undefined),
  }),
  list_subscriptions: define({
    description:
      'Mailing lists that wrote to the user in the last 30 days and they have not left, busiest first: sender, how many emails, how many were opened, and the messageId of the latest one — pass it to unsubscribe.',
    run: () => listSubscriptions(userId),
  }),
  handle_thread: define({
    description:
      'Hand an email thread to the agent with a goal ("get the invoice resent", "find a time next week"). It writes and, depending on autonomy, sends the emails until the goal is reached. autonomy "ask" (default) queues each email for the user to approve in Today; only use "auto" when the user explicitly asked the agent to send on their behalf.',
    input: {
      autonomy: z.enum(['ask', 'auto']).default('ask'),
      goal: z.string().min(4),
      messageId: z.uuid(),
    },
    run: (input) => createTask(userId, input),
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
      'Create a board that collects one kind of email as entries. description says what belongs on it ("receipts and refunds with their amounts"), at least 3 characters; it fills from mail the user already has.',
    input: { description: z.string().min(3), name: z.string().min(1) },
    run: ({ description, name }) => createBoard(userId, { description, name }),
  }),
  get_board: define({
    description:
      'One board: its description, the newest entries (title, group, status, amount, date) and the series behind its charts.',
    input: { id: z.uuid() },
    run: ({ id }) => getBoard(userId, id),
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
      'The rules the agent follows. Each has a plain-language instruction matched against incoming mail, and an effect: archive, mark_read, unsubscribe and trash are applied on their own, draft_reply leaves a draft in Today, always_show puts the email in Today.',
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
      'Fetch new mail from Gmail, analyze it and rewrite the brief. Takes a few seconds per new email.',
    run: async () => {
      await syncMailboxes(userId)
      return generateBrief(userId)
    },
  }),
})

export const toolAccess = (name: string) => AGENT_TOOLS[name as AgentToolName]
