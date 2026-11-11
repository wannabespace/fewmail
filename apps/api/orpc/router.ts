import { db } from '@fewmail/db'
import { messages } from '@fewmail/db/schema'
import {
  DEVICE_KINDS,
  FOLLOWUP_DAYS,
  GMAIL_EFFECTS,
  MAIL_CATEGORIES,
  OUTBOX_MODES,
  PERSONAS,
  RULE_EFFECTS,
  SIMPLE_MATCH_FIELDS,
} from '@fewmail/shared/agent'
import { textToHtml } from '@fewmail/shared/email'
import { LOCALES } from '@fewmail/shared/i18n/locales'
import type { InferRouterOutputs } from '@orpc/server'
import { type } from 'arktype'
import { and, eq } from 'drizzle-orm'

import { agent, authed } from '.'
import { watchChanges } from '../lib/live'
import { writeReply } from '../services/agent'
import { askMail } from '../services/ask'
import { completeEmail } from '../services/autocomplete'
import { createBillingPortal, createCheckout } from '../services/billing'
import { generateBrief, getToday } from '../services/brief'
import {
  createApiKey,
  getTelegramLink,
  getWhatsappLink,
  listApiKeys,
  revokeApiKey,
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
  redraftAction,
  snoozeMessage,
  trashMessage,
  unsnoozeMessage,
  unsubscribeMessage,
} from '../services/mail'
import { NotFoundError } from '../services/mail-errors'
import { getMoney } from '../services/money'
import {
  registerDevice,
  removeDevice,
  webPushKey,
} from '../services/notifications'
import { cancelMail, listScheduled, scheduleMail } from '../services/outbox'
import { getPerson } from '../services/people'
import { getPlanInfo, requireAgent } from '../services/plan'
import {
  createRule,
  deleteRule,
  listRules,
  updateRule,
} from '../services/rules'
import { getSettings, saveSettings } from '../services/settings'
import { deleteSnippet, listSnippets, saveSnippet } from '../services/snippets'
import { markNotSpam, reportSpam } from '../services/spam'
import { ensureMailbox, syncMailbox } from '../services/sync'
import { cancelTask, createTask } from '../services/tasks'

const id = type({ id: 'string.uuid' })

const settingsInput = type({
  'briefHour?': '0 <= number.integer <= 23',
  language: type.enumerated(...LOCALES.map(({ code }) => code)),
  persona: type.enumerated(...PERSONAS),
  'gmailLabels?': 'boolean',
  'knowledge?': 'string | null',
  timezone: 'string',
  'voice?': 'string | null',
})

const sendInput = type({
  'bcc?': 'string.email[]',
  'cc?': 'string.email[]',
  html: 'string',
  mode: type.enumerated(...OUTBOX_MODES),
  'remindAfterDays?': type.enumerated(...FOLLOWUP_DAYS).or('null'),
  'replyToMessageId?': 'string.uuid',
  'sendAt?': 'Date',
  subject: 'string',
  text: 'string',
  to: 'string.email[] >= 1',
})

const ruleInput = type({
  autonomous: 'boolean',
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

/** Jev matches plain-language rules on every plan; drafting, showing in Today and asking first need the agent. */
const requireAgentFor = async (
  userId: string,
  rule: { autonomous?: boolean; effect?: string }
) => {
  if (
    rule.autonomous === false ||
    (rule.effect && !FREE_EFFECTS.has(rule.effect))
  ) {
    await requireAgent(userId)
  }
}

export const router = {
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
    apiKeys: {
      create: agent
        .input(type({ name: 'string > 0' }))
        .handler(async ({ context, input }) => ({
          key: await createApiKey(context.user.id, input.name),
        })),
      list: agent.handler(({ context }) => listApiKeys(context.user.id)),
      revoke: agent.input(id).handler(async ({ context, input }) => {
        await revokeApiKey(context.user.id, input.id)
      }),
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
          'search?': 'string',
        })
      )
      .handler(({ context, input }) => listMail(context.user.id, input)),
    sync: authed.handler(async ({ context }) => {
      await syncMailbox(await ensureMailbox(context.user.id))
    }),
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
  ask: agent
    .input(type({ question: 'string > 2' }))
    .handler(({ context, input }) => askMail(context.user.id, input.question)),
  billing: {
    checkout: authed.handler(async ({ context }) => ({
      url: await createCheckout(context.user.id),
    })),
    portal: authed.handler(async ({ context }) => ({
      url: await createBillingPortal(context.user.id),
    })),
  },
  me: authed.handler(async ({ context }) => ({
    plan: await getPlanInfo(context.user.id),
    settings: await getSettings(context.user.id),
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
  money: agent.handler(({ context }) => getMoney(context.user.id)),
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
  settings: {
    save: authed.input(settingsInput).handler(async ({ context, input }) => {
      const before = await getSettings(context.user.id)
      const settings = await saveSettings(context.user.id, input)
      if (input.gmailLabels && !before?.gmailLabels) {
        void backfillAgentLabels(context.user.id).catch(console.error)
      }
      void ensureMailbox(context.user.id).then(syncMailbox).catch(console.error)
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
