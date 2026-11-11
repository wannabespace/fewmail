import { MAIL_CATEGORIES, RULE_EFFECTS } from '@fewmail/shared/agent'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'

import { generateBrief, getToday } from './services/brief'
import { userIdForApiKey } from './services/integrations'
import {
  approveAction,
  dismissAction,
  draftReply,
  getThread,
  listMail,
  redraftAction,
} from './services/mail'
import { getMoney } from './services/money'
import { getPerson } from './services/people'
import { getPlanInfo, hasAgent } from './services/plan'
import { createRule, listRules } from './services/rules'
import { ensureMailbox, syncMailbox } from './services/sync'
import { createTask } from './services/tasks'

const json = (value: unknown) => ({
  content: [{ text: JSON.stringify(value, null, 2), type: 'text' as const }],
})

const createServer = (userId: string) => {
  const server = new McpServer({ name: 'fewmail', version: '0.1.0' })

  server.registerTool(
    'get_today',
    {
      annotations: { readOnlyHint: true },
      description:
        "The user's email brief and the queue of things that need them: each pending action has an id, a kind (reply, pay, schedule, follow_up, read, archive, mark_read, unsubscribe), the email it is about and, for replies, a draft in the user's voice. Also counts what the agent handled on its own in the last 24 hours.",
    },
    async () => json(await getToday(userId))
  )

  server.registerTool(
    'list_mail',
    {
      annotations: { readOnlyHint: true },
      description:
        "List recent emails with the agent's analysis (category, importance 0–3, one-line summary, whether a reply is expected). filter: inbox (what is in the Gmail inbox now), important (importance ≥ 2), needs_reply, quiet (noise), snoozed. search takes Gmail search syntax (from:, subject:, newer_than:, has:attachment…).",
      inputSchema: {
        category: z.enum(MAIL_CATEGORIES).optional(),
        filter: z
          .enum([
            'inbox',
            'important',
            'needs_reply',
            'quiet',
            'snoozed',
            'spam',
          ])
          .default('inbox'),
        search: z.string().optional(),
      },
    },
    async (input) => json(await listMail(userId, input))
  )

  server.registerTool(
    'read_thread',
    {
      annotations: { readOnlyHint: true },
      description:
        'Read every message of an email thread in full, with the agent analysis and actions for it.',
      inputSchema: { threadId: z.string() },
    },
    async ({ threadId }) => json(await getThread(userId, threadId))
  )

  server.registerTool(
    'draft_reply',
    {
      description:
        'Have the agent draft (or redraft) a reply to an email in the user\'s voice. Nothing is sent: the draft lands in the queue as a pending reply action. instruction steers it ("decline politely", "propose Tuesday 10:00").',
      inputSchema: {
        instruction: z.string().optional(),
        messageId: z.string().uuid(),
      },
    },
    async ({ instruction, messageId }) =>
      json(await draftReply(userId, messageId, instruction))
  )

  server.registerTool(
    'redraft_action',
    {
      description:
        'Rewrite the draft of a pending reply action with an instruction ("shorter", "more formal").',
      inputSchema: { actionId: z.string().uuid(), instruction: z.string() },
    },
    async ({ actionId, instruction }) =>
      json(await redraftAction(userId, actionId, instruction))
  )

  server.registerTool(
    'approve_action',
    {
      annotations: { destructiveHint: true },
      description:
        "Carry out a pending action from the queue. For a reply this SENDS the email from the user's Gmail, using text when given instead of the stored draft; confirm the exact text with the user first. Archive, mark_read and unsubscribe change Gmail; the others mark the email read and close the action.",
      inputSchema: { actionId: z.string().uuid(), text: z.string().optional() },
    },
    async ({ actionId, text }) =>
      json(await approveAction(userId, actionId, text))
  )

  server.registerTool(
    'dismiss_action',
    {
      description: 'Close a pending action without doing anything in Gmail.',
      inputSchema: { actionId: z.string().uuid() },
    },
    async ({ actionId }) => json(await dismissAction(userId, actionId))
  )

  server.registerTool(
    'handle_thread',
    {
      description:
        'Hand an email thread to the agent with a goal ("get the invoice resent", "find a time next week"). It writes and, depending on autonomy, sends the emails until the goal is reached. autonomy "ask" (default) queues each email for the user to approve in Today; only use "auto" when the user explicitly asked the agent to send on their behalf.',
      inputSchema: {
        autonomy: z.enum(['ask', 'auto']).default('ask'),
        goal: z.string().min(4),
        messageId: z.string().uuid(),
      },
    },
    async (input) => json(await createTask(userId, input))
  )

  server.registerTool(
    'get_person',
    {
      annotations: { readOnlyHint: true },
      description:
        "What the user's mail knows about one person: since when they write, conversation count, open items, promises the user made to them and a short note.",
      inputSchema: { email: z.string().email() },
    },
    async ({ email }) => json(await getPerson(userId, email))
  )

  server.registerTool(
    'get_money',
    {
      annotations: { readOnlyHint: true },
      description:
        "Subscriptions (with monthly cost), upcoming bills and recent purchases found in the user's receipts and invoices.",
    },
    async () => json(await getMoney(userId))
  )

  server.registerTool(
    'list_rules',
    {
      annotations: { readOnlyHint: true },
      description:
        'The rules the agent follows. Each has a plain-language instruction matched against incoming mail, an effect (archive, mark_read, unsubscribe, draft_reply, always_show) and autonomous: true when the agent applies it without asking.',
    },
    async () => json(await listRules(userId))
  )

  server.registerTool(
    'create_rule',
    {
      description:
        'Teach the agent a rule, e.g. instruction "Invoices from Hetzner", effect mark_read, autonomous true. Only set autonomous when the user said the agent may act without asking.',
      inputSchema: {
        autonomous: z.boolean(),
        effect: z.enum(RULE_EFFECTS),
        instruction: z.string().min(3),
      },
    },
    async (input) => json(await createRule(userId, input))
  )

  server.registerTool(
    'refresh',
    {
      description:
        'Fetch new mail from Gmail, analyze it and rewrite the brief. Takes a few seconds per new email.',
    },
    async () => {
      await syncMailbox(await ensureMailbox(userId))
      return json(await generateBrief(userId))
    }
  )

  return server
}

export const handleMcp = async (request: Request) => {
  const key = request.headers.get('authorization')?.replace(/^Bearer\s+/iu, '')
  const userId = key ? await userIdForApiKey(key) : null
  if (!userId) {
    return Response.json(
      {
        error:
          'Create an API key in Fewmail → Settings → Integrations and send it as a Bearer token.',
      },
      { status: 401 }
    )
  }
  if (!hasAgent(await getPlanInfo(userId))) {
    return Response.json(
      { error: 'MCP is part of Fewmail Pro. Upgrade in Settings → Plan.' },
      { status: 403 }
    )
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined,
  })
  await createServer(userId).connect(transport)
  return transport.handleRequest(request)
}
