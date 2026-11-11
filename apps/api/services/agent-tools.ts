import { MAIL_CATEGORIES, RULE_EFFECTS } from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { z } from 'zod'

import { getBoard, listBoards } from './boards'
import { generateBrief, getToday } from './brief'
import {
  approveAction,
  archiveMessage,
  dismissAction,
  draftReply,
  getThread,
  listMail,
  redraftAction,
  snoozeMessage,
  unsubscribeMessage,
} from './mail'
import { scheduleMail } from './outbox'
import { getPerson } from './people'
import { createRule, listRules } from './rules'
import { createSchedule, deleteSchedule, listSchedules } from './schedules'
import { syncMailboxes } from './sync'
import { createTask } from './tasks'

/** `consent` changes Gmail, sends or lets the agent act alone: the chat asks the user first, MCP marks it destructive. */
export type ToolAccess = 'read' | 'write' | 'consent'

const define = <Input extends z.ZodRawShape = Record<never, never>>(tool: {
  access: ToolAccess
  description: string
  input?: Input
  run: (input: z.infer<z.ZodObject<Input>>) => Promise<unknown>
}) => tool

/** Everything the agent can do for a user, shared by MCP and the agent chat. */
export const agentTools = (userId: string) => ({
  get_today: define({
    access: 'read',
    description:
      "The user's email brief and the queue of things that need them: each pending action has an id, a kind (reply, pay, schedule, follow_up, read, archive, mark_read, unsubscribe), the email it is about and, for replies, a draft in the user's voice. Also counts what the agent handled on its own in the last 24 hours.",
    run: () => getToday(userId),
  }),
  list_mail: define({
    access: 'read',
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
    access: 'read',
    description:
      'Read every message of an email thread in full, with the agent analysis and actions for it.',
    input: { threadId: z.string() },
    run: ({ threadId }) => getThread(userId, threadId),
  }),
  draft_reply: define({
    access: 'write',
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
    access: 'write',
    description:
      'Rewrite the draft of a pending reply action with an instruction ("shorter", "more formal").',
    input: { actionId: z.uuid(), instruction: z.string() },
    run: ({ actionId, instruction }) =>
      redraftAction(userId, actionId, instruction),
  }),
  approve_action: define({
    access: 'consent',
    description:
      "Carry out a pending action from the queue. For a reply this SENDS the email from the user's Gmail, using text when given instead of the stored draft; confirm the exact text with the user first. Archive, mark_read and unsubscribe change Gmail; the others mark the email read and close the action.",
    input: { actionId: z.uuid(), text: z.string().optional() },
    run: ({ actionId, text }) => approveAction(userId, actionId, text),
  }),
  dismiss_action: define({
    access: 'write',
    description: 'Close a pending action without doing anything in Gmail.',
    input: { actionId: z.uuid() },
    run: ({ actionId }) => dismissAction(userId, actionId),
  }),
  send_email: define({
    access: 'consent',
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
  archive_thread: define({
    access: 'consent',
    description:
      'Archive the email thread in Gmail: it leaves the inbox, nothing is deleted. messageId is any email of the thread.',
    input: { messageId: z.uuid() },
    run: async ({ messageId }) => {
      await archiveMessage(userId, messageId)
      return { archived: true }
    },
  }),
  snooze_thread: define({
    access: 'consent',
    description:
      "Hide the email thread until a time; it comes back to the inbox unread then. until is ISO 8601 with the user's UTC offset.",
    input: { messageId: z.uuid(), until: z.iso.datetime({ offset: true }) },
    run: async ({ messageId, until }) => {
      await snoozeMessage(userId, messageId, new Date(until))
      return { until }
    },
  }),
  unsubscribe: define({
    access: 'consent',
    description:
      'Unsubscribe from the mailing list an email came from (through its own unsubscribe link) and archive the thread.',
    input: { messageId: z.uuid() },
    run: ({ messageId }) => unsubscribeMessage(userId, messageId),
  }),
  handle_thread: define({
    access: 'consent',
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
    access: 'read',
    description:
      "What the user's mail knows about one person: since when they write, conversation count, open items, promises the user made to them and a short note.",
    input: { email: z.email() },
    run: ({ email }) => getPerson(userId, email),
  }),
  list_boards: define({
    access: 'read',
    description:
      "The user's boards: pages that collect one kind of email (money, trips, orders…) as entries. Use get_board to read one.",
    run: () => listBoards(userId),
  }),
  get_board: define({
    access: 'read',
    description:
      'One board: its description, the newest entries (title, group, status, amount, date) and the series behind its charts.',
    input: { id: z.uuid() },
    run: ({ id }) => getBoard(userId, id),
  }),
  list_rules: define({
    access: 'read',
    description:
      'The rules the agent follows. Each has a plain-language instruction matched against incoming mail, and an effect: archive, mark_read, unsubscribe and trash are applied on their own, draft_reply leaves a draft in Today, always_show puts the email in Today.',
    run: () => listRules(userId),
  }),
  create_rule: define({
    access: 'consent',
    description:
      'Teach the agent a rule, e.g. instruction "Invoices from Hetzner", effect mark_read. archive, mark_read, unsubscribe and trash are then applied to matching mail without asking.',
    input: {
      effect: z.enum(RULE_EFFECTS),
      instruction: z.string().min(3),
    },
    run: (input) => createRule(userId, input),
  }),
  list_schedules: define({
    access: 'read',
    description:
      "The user's schedules: instructions the agent runs on its own at set times, each with its cadence in words, the next run and the chat its runs land in.",
    run: () => listSchedules(userId),
  }),
  create_schedule: define({
    access: 'consent',
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
    access: 'write',
    description: 'Stop a schedule; its past runs stay in its chat.',
    input: { id: z.uuid() },
    run: async ({ id }) => {
      await deleteSchedule(userId, id)
      return { deleted: true }
    },
  }),
  refresh: define({
    access: 'write',
    description:
      'Fetch new mail from Gmail, analyze it and rewrite the brief. Takes a few seconds per new email.',
    run: async () => {
      await syncMailboxes(userId)
      return generateBrief(userId)
    },
  }),
})

export type AgentToolName = keyof ReturnType<typeof agentTools>
