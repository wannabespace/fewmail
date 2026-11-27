import { db } from '@fewmail/db'
import { botPosts, outbox } from '@fewmail/db/schema'
import {
  BOT_MESSAGE_CHARS,
  botOfCard,
  cardPayload,
  FREE_DECISIONS,
  UNDO_SEND_SECONDS,
} from '@fewmail/shared/agent'
import type { ActionKind, ConsentToolName } from '@fewmail/shared/agent'
import { approveTitle, messages as dictionaries } from '@fewmail/shared/i18n'
import type { Messages } from '@fewmail/shared/i18n'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { choice } from '@typesafe-ai/sdk'
import { Result } from 'better-result'
import { and, eq, gt, gte, sql } from 'drizzle-orm'

import { jev } from '../lib/jev'
import { capture } from '../lib/posthog'
import { approveCard } from './approve'
import { createBot } from './bots'
import {
  botSuggestions,
  declineBotSuggestion,
  keepSender,
  newSenders,
} from './cleanup'
import { usageResetsAt } from './limit-error'
import {
  dismissAction,
  listQueue,
  listTidy,
  redraftAction,
  settleTidy,
} from './mail'
import { cancelMail } from './outbox'
import { getPlanInfo, hasAgent } from './plan'
import { getSettings } from './settings'
import { unsubscribeMessage } from './thread-effects'

export const DECISION_VERBS = [
  'approve',
  'skip',
  'shorter',
  'rewrite',
  'always_archive',
  'always_mark_read',
  'unsubscribe',
  'keep',
  'cancel',
] as const
export type DecisionVerb = (typeof DECISION_VERBS)[number]

type Ref =
  | { id: string; kind: ActionKind; tool?: ConsentToolName; type: 'card' }
  | { messageIds: string[]; type: 'tidy' }
  | { fromEmail: string; messageId: string; type: 'sender' }
  | { fromEmail: string; type: 'suggestion' }
  | { id: string; type: 'outbox' }

/** Something the bot put to the user that a reply in words can settle: what the chat says, and what the reader reads. */
export interface OpenItem {
  /** Computed from the kind and the sender's name only: the reader never sees what an email says. */
  cue: string
  key: string
  /** In the numbered list the bot writes; a send in its undo window is not, but "cancel" still reaches it. */
  listed: boolean
  ref: Ref
  /** Approving it sends an email: one send per approval. */
  sends: boolean
  /** In the user's language, as the chat and the messengers say it. */
  text: string
  threadId: string | null
  updatedAt: Date | null
  verbs: DecisionVerb[]
  who: string
}

/** The bars readBotEffect holds too: what leaves the account or cannot be taken back needs more certainty. */
const SURE_ODDS = 0.8
const ODDS = 0.6
/** The reader reads at most this many numbered items. */
const READ_ITEMS = 9
const WHO_CHARS = 40
const DRAFT_CHARS = 1500
/** The longest cue an item gives the reader. */
const CUE_CHARS = 160
/** The question frame around the items: the scope and rest questions and the state's wording. */
const FRAME_CHARS = 700

const OUTWARD_TOOLS = new Set<ConsentToolName>([
  'clear_out',
  'create_bot',
  'create_event',
  'delete_event',
  'report_spam',
  'send_email',
  'trash_thread',
  'unsubscribe',
  'update_bot',
  'update_event',
])

const isSure = (item: OpenItem, verb: DecisionVerb) => {
  if (
    verb === 'unsubscribe' ||
    verb === 'always_archive' ||
    verb === 'always_mark_read'
  ) {
    return true
  }
  if (verb !== 'approve' || item.ref.type !== 'card') {
    return false
  }
  const { kind, tool } = item.ref
  return (
    item.sends ||
    kind === 'spam' ||
    kind === 'unsubscribe' ||
    (!!tool && OUTWARD_TOOLS.has(tool))
  )
}

const VERB_CRITERIA: Record<DecisionVerb | 'none', string> = {
  always_archive:
    'Always archive this sender from now on: make a bot that archives their mail',
  always_mark_read:
    'Always mark this sender read from now on: make a bot that marks their mail read',
  approve:
    'Do what the bot proposed for it: yes, ok, go ahead, do it, send it, approve, I paid it, add it',
  cancel: 'Stop the email being sent: cancel, stop, undo, do not send',
  keep: 'Keep this sender as usual: leave it, keep it in the inbox, no',
  none: 'The message does not answer this item, or answers another one',
  rewrite:
    'Write its reply again, saying what the user tells it to say instead',
  shorter: 'Make its reply shorter',
  skip: 'Skip it: no, leave it, not now, ignore it',
  unsubscribe: 'Unsubscribe from this sender',
}

/** What the reader is sent at most for one answer: every item with every verb, and the user's message at its cap (`bun run economics`). */
export const DECISION_PROMPT_CHARS =
  READ_ITEMS * (CUE_CHARS + JSON.stringify(VERB_CRITERIA).length) +
  FRAME_CHARS +
  BOT_MESSAGE_CHARS

const nameOf = (
  from: { fromEmail?: string | null; fromName?: string | null } | null
) => (from?.fromName ?? from?.fromEmail ?? '').slice(0, WHO_CHARS)

const quote = (text: string) =>
  text
    .slice(0, DRAFT_CHARS)
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n')

type QueueItem = Awaited<ReturnType<typeof listQueue>>[number]

const cardItem = (t: Messages, card: QueueItem): OpenItem => {
  const { action, message } = card
  const { link, tool } = cardPayload(action)
  const who = nameOf(message)
  const isReply = action.kind === 'reply'
  const said = approveTitle(t, action)
  return {
    cue: `${tool ? `request to ${tool}` : `${action.kind} card`}${who ? ` about mail from "${who}"` : ''}; approving it means: ${approveTitle(dictionaries.en, action)}`,
    key: `card:${action.id}`,
    listed: true,
    ref: { id: action.id, kind: action.kind, tool, type: 'card' },
    sends: isReply || tool === 'send_email',
    text: [
      who ? `${who}: ${action.title}` : action.title,
      isReply && action.detail
        ? `${t.decide.draft}\n${quote(action.detail)}`
        : null,
      link ? link.url : null,
      link ? t.decide.whenDone(said) : `${said}?`,
    ]
      .filter(Boolean)
      .join('\n'),
    threadId: message?.threadId ?? action.threadId,
    updatedAt: action.updatedAt,
    verbs: isReply
      ? ['approve', 'skip', 'shorter', 'rewrite']
      : action.kind === 'follow_up'
        ? ['approve', 'skip', 'rewrite']
        : ['approve', 'skip'],
    who,
  }
}

/**
 * What a bot's chat waits on now, in the order it lists them: its cards, its quiet mail to tidy and, in Fewmail's,
 * new senders and suggested bots; then any send still in its undo window, which "cancel" stops.
 */
export const openItems = async (userId: string, bot: string, t: Messages) => {
  const [queue, tidy, senders, suggestions, sending] = await Promise.all([
    listQueue(userId),
    listTidy(userId),
    bot === 'fewmail' ? newSenders(userId) : [],
    bot === 'fewmail' ? botSuggestions(userId) : [],
    db
      .select({ id: outbox.id, to: outbox.to })
      .from(outbox)
      .where(
        and(
          eq(outbox.userId, userId),
          eq(outbox.status, 'scheduled'),
          gt(outbox.sendAt, new Date())
        )
      ),
  ])
  const asked = new Set(senders.map(({ fromEmail }) => fromEmail))
  const tidyIds = tidy
    .filter(({ analysis }) => (analysis.botId ?? 'fewmail') === bot)
    .map(({ message }) => message.id)
  const tidyItem: OpenItem = {
    cue: `tidy ${tidyIds.length} quiet emails as suggested`,
    // The count is in the key: a list that grew since the user saw it is not the one they answered.
    key: `tidy:${tidyIds.length}`,
    listed: true,
    ref: { messageIds: tidyIds, type: 'tidy' },
    sends: false,
    text: t.decide.tidy(tidyIds.length),
    threadId: null,
    updatedAt: null,
    verbs: ['approve', 'skip'],
    who: '',
  }
  return [
    ...queue
      .filter((card) => botOfCard(card) === bot)
      .map((card) => cardItem(t, card)),
    ...(tidyIds.length > 0 ? [tidyItem] : []),
    ...senders.map((sender): OpenItem => ({
      cue: `new mailing list "${nameOf(sender)}"`,
      key: `sender:${sender.messageId}`,
      listed: true,
      ref: {
        fromEmail: sender.fromEmail,
        messageId: sender.messageId,
        type: 'sender',
      },
      sends: false,
      text: t.decide.newSender(nameOf(sender), sender.count, sender.opened),
      threadId: null,
      updatedAt: null,
      verbs: ['unsubscribe', 'always_archive', 'keep'],
      who: nameOf(sender),
    })),
    ...suggestions
      .filter(({ fromEmail }) => !asked.has(fromEmail))
      .map((suggestion): OpenItem => ({
        cue: `offer to make a bot that ${suggestion.effect === 'archive' ? 'archives' : 'marks read'} mail from "${nameOf(suggestion)}"`,
        key: `suggestion:${suggestion.messageId}`,
        listed: true,
        ref: { fromEmail: suggestion.fromEmail, type: 'suggestion' },
        sends: false,
        text: t.decide.suggestion(
          nameOf(suggestion),
          suggestion.count,
          suggestion.effect
        ),
        threadId: null,
        updatedAt: null,
        verbs: [
          suggestion.effect === 'archive'
            ? 'always_archive'
            : 'always_mark_read',
          'skip',
        ],
        who: nameOf(suggestion),
      })),
    ...sending.map((send): OpenItem => ({
      cue: 'an email being sent, still in its undo window',
      key: `outbox:${send.id}`,
      listed: false,
      ref: { id: send.id, type: 'outbox' },
      sends: false,
      text: t.decide.sending(send.to.join(', ')),
      threadId: null,
      updatedAt: null,
      verbs: ['cancel'],
      who: send.to.join(', ').slice(0, WHO_CHARS),
    })),
  ]
}

/** The bot's message about what waits, numbered when there is more than one; computed, so it costs nothing. */
export const waitingText = (t: Messages, items: OpenItem[], hint: boolean) => {
  const listed = items.filter(({ listed }) => listed)
  const [only] = listed
  if (!only) {
    return null
  }
  if (listed.length === 1) {
    return only.text
  }
  return [
    t.decide.waiting(listed.length),
    ...listed.map((item, index) => `${index + 1}. ${item.text}`),
    hint ? t.decide.hint : null,
  ]
    .filter(Boolean)
    .join('\n')
}

interface Picked {
  odds: number
  verb: DecisionVerb | 'none'
}

export interface Answer {
  items: Picked[]
  rest: boolean
  scope: 'all' | 'named' | 'none'
}

/** The user's list as they saw it: a null is an item settled since, which keeps its number so the rest never shift. */
type Items = (OpenItem | null)[]

const stepOf = (item: OpenItem) =>
  `${item.ref.type}:${item.ref.type === 'card' ? item.ref.kind : ''}:${item.verbs.join()}`

/**
 * The binding rules, apart from the reader so they can be tested: a verb binds only at its odds; a bare yes binds only
 * when every listed item asks the same thing, and never an item the list did not show; two sends in one reply send
 * nothing and ask which first.
 */
export const bindAnswer = (items: Items, answer: Answer) => {
  const listed = items.filter((item) => item?.listed)
  const none = { bound: [], oneByOne: [], rest: answer.rest, unclear: [] }
  if (answer.scope === 'none') {
    return none
  }
  if (
    answer.scope === 'all' &&
    listed.length > 1 &&
    new Set(listed.map((item) => item && stepOf(item))).size > 1
  ) {
    return { ...none, unclear: listed.filter((item) => item !== null) }
  }
  const picked = items.flatMap((item, index) => {
    const pick = answer.items[index]
    return item &&
      pick &&
      pick.verb !== 'none' &&
      item.verbs.includes(pick.verb) &&
      (item.listed || answer.scope === 'named')
      ? [{ item, odds: pick.odds, verb: pick.verb }]
      : []
  })
  const sure = picked.filter(
    ({ item, odds, verb }) => odds >= (isSure(item, verb) ? SURE_ODDS : ODDS)
  )
  const sends = sure.filter(
    ({ item, verb }) => item.sends && verb === 'approve'
  )
  const isOneByOne = sends.length > 1
  return {
    bound: isOneByOne ? sure.filter((pick) => !sends.includes(pick)) : sure,
    oneByOne: isOneByOne ? sends.map(({ item }) => item) : [],
    rest: answer.rest,
    unclear: picked
      .filter((pick) => !sure.includes(pick))
      .map(({ item }) => item),
  }
}

const readAnswer = async (items: Items, text: string): Promise<Answer> => {
  const lines = items.flatMap((item, index) =>
    item ? [`${item.listed ? `${index + 1}.` : '-'} ${item.cue}`] : []
  )
  const { answers } = await jev.systemOne({
    questions: {
      rest: choice(
        'Whether the message also asks or requests something beyond answering the items',
        {
          no: 'It only answers the items',
          yes: 'It also asks a question or makes a new request',
        }
      ),
      scope: choice('How the message answers the items the bot asked about', {
        all: 'It answers all of them at once without naming any: a bare yes, ok, do it, all of them',
        named:
          'It names one or more of them, by number, by sender or by what they are',
        none: 'It answers none of them: a question, a new request, thanks or small talk',
      }),
      ...Object.fromEntries(
        items.flatMap((item, index) =>
          item
            ? [
                [
                  `item${index}`,
                  choice(
                    `What the message says to do with ${item.listed ? `item ${index + 1}` : `the ${item.cue}`}`,
                    Object.fromEntries(
                      (['none', ...item.verbs] as const).map((verb) => [
                        verb,
                        VERB_CRITERIA[verb],
                      ])
                    )
                  ),
                ],
              ]
            : []
        )
      ),
    },
    state: `A bot asked the user about these items:\n${lines.join('\n')}\n\nThe user answered: "${text}"`,
  })
  const read = answers as Record<
    string,
    { choice: string; probabilities: Record<string, number> } | undefined
  >
  return {
    items: items.map((_, index) => {
      const answer = read[`item${index}`]
      const verb = (answer?.choice ?? 'none') as Picked['verb']
      return { odds: answer?.probabilities[verb] ?? 0, verb }
    }),
    rest: read.rest?.choice === 'yes',
    scope: (read.scope?.choice ?? 'none') as Answer['scope'],
  }
}

/** The month's answers in words, each kept as a `decided` post: Free has `FREE_DECISIONS` of them. */
const decidedThisMonth = async (userId: string) => {
  const now = new Date()
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(botPosts)
    .where(
      and(
        eq(botPosts.userId, userId),
        eq(botPosts.kind, 'decided'),
        gte(
          botPosts.createdAt,
          new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
        )
      )
    )
  return row?.count ?? 0
}

/** Each verb through the service its button called; resolves to the outbox row of a send, which "cancel" can stop. */
const runItem = async (
  userId: string,
  item: OpenItem,
  verb: DecisionVerb,
  words: string
) => {
  const { ref } = item
  if (ref.type === 'card') {
    if (verb === 'skip') {
      await dismissAction(userId, ref.id)
      return null
    }
    if (verb === 'shorter' || verb === 'rewrite') {
      await redraftAction(
        userId,
        ref.id,
        verb === 'shorter' ? dictionaries.en.queue.shorterInstruction : words
      )
      return null
    }
    const { outboxId } = await approveCard(userId, ref.id)
    return outboxId
  }
  if (ref.type === 'tidy') {
    await settleTidy(
      userId,
      ref.messageIds,
      verb === 'approve' ? 'done' : 'dismissed'
    )
  } else if (ref.type === 'outbox') {
    await cancelMail(userId, ref.id)
  } else if (verb === 'always_archive' || verb === 'always_mark_read') {
    await createBot(userId, {
      effect: verb === 'always_archive' ? 'archive' : 'mark_read',
      match: { field: 'from', value: ref.fromEmail },
      name: item.who || ref.fromEmail,
    })
  } else if (ref.type === 'suggestion') {
    await declineBotSuggestion(userId, ref.fromEmail)
  } else if (verb === 'unsubscribe') {
    await unsubscribeMessage(userId, ref.messageId, 'list')
  } else {
    await keepSender(userId, ref.messageId)
  }
  return null
}

export type DecisionOutcome =
  | 'changed'
  | 'done'
  | 'limit'
  | 'one_by_one'
  | 'unclear'

export interface Decided {
  outcome: DecisionOutcome
  /** The message also asks something else: the agent answers it after. */
  rest: boolean
  text: string
}

/**
 * A reply in the user's own words (or their voice, transcribed) read against what the bot asked them: what binds runs
 * through the same services the buttons called, what does not is said back and nothing changes. Null when it answers
 * nothing the bot asked, so the agent answers it. `shown` is the keys of the list the user answered, in its order, as
 * they saw it at `seenAt`: a card that changed since is not done but said again.
 */
export const decide = async (
  userId: string,
  input: {
    bot: string
    channel: 'telegram' | 'web' | 'whatsapp'
    seenAt?: Date
    shown?: string[]
    text: string
    voice: boolean
  }
): Promise<Decided | null> => {
  const settings = await getSettings(userId)
  const locale = settings?.language ?? 'en'
  const t = dictionaries[locale]
  const open = await openItems(userId, input.bot, t)
  const byKey = new Map(open.map((item) => [item.key, item]))
  const shown = (
    input.shown ?? open.filter(({ listed }) => listed).map(({ key }) => key)
  ).slice(0, READ_ITEMS)
  const items: Items = [
    ...shown.map((key) => byKey.get(key) ?? null),
    ...open
      .filter(({ key }) => !shown.includes(key))
      .map((item) => ({ ...item, listed: false })),
  ]
  if (!items.some(Boolean)) {
    return null
  }
  const via = input.voice ? 'voice' : 'words'
  if (
    !hasAgent(await getPlanInfo(userId)) &&
    (await decidedThisMonth(userId)) >= FREE_DECISIONS
  ) {
    capture(userId, 'bot_decided', {
      channel: input.channel,
      count: 0,
      kinds: '',
      outcome: 'limit',
      via,
    })
    return {
      outcome: 'limit',
      rest: false,
      text: t.decide.limit(
        FREE_DECISIONS,
        formatResetDay(locale, usageResetsAt())
      ),
    }
  }
  const { bound, oneByOne, rest, unclear } = bindAnswer(
    items,
    await readAnswer(items, input.text)
  )
  if (bound.length + oneByOne.length + unclear.length === 0) {
    return null
  }
  const listedCount = items.filter((item) => item?.listed).length
  const label = (item: OpenItem) =>
    item.listed && listedCount > 1
      ? `${items.indexOf(item) + 1} ${item.who}`.trim()
      : item.who || item.text.split('\n')[0] || ''
  const done: string[] = []
  const sending: string[] = []
  const changed: OpenItem[] = []
  const failed: OpenItem[] = []
  for (const { item, verb } of bound) {
    if (input.seenAt && item.updatedAt && item.updatedAt > input.seenAt) {
      changed.push(item)
      continue
    }
    // oxlint-disable-next-line eslint/no-await-in-loop -- one by one, as the buttons did: each send keeps its own undo window
    const ran = await Result.tryPromise(() =>
      runItem(userId, item, verb, input.text)
    )
    if (ran.isErr()) {
      failed.push(item)
    } else if (ran.value) {
      sending.push(t.decide.sendingIn(item.who, UNDO_SEND_SECONDS))
    } else {
      done.push(`${label(item)}: ${t.decide.did[verb]}`)
    }
  }
  const named = (list: OpenItem[]) => list.map(label).join(', ')
  const outcome: DecisionOutcome =
    unclear.length > 0
      ? 'unclear'
      : oneByOne.length > 0
        ? 'one_by_one'
        : changed.length + failed.length > 0
          ? 'changed'
          : 'done'
  capture(userId, 'bot_decided', {
    channel: input.channel,
    count: bound.length,
    kinds: [
      ...new Set(
        bound.map(({ item }) =>
          item.ref.type === 'card' ? item.ref.kind : item.ref.type
        )
      ),
    ].join(','),
    outcome,
    via,
  })
  return {
    outcome,
    rest: rest && outcome === 'done',
    text: [
      input.voice ? t.decide.heard(input.text) : null,
      done.length > 0 ? t.decide.done(done.join('; ')) : null,
      ...sending,
      changed.length > 0 ? t.decide.changed(named(changed)) : null,
      failed.length > 0 ? t.decide.failed(named(failed)) : null,
      oneByOne.length > 0 ? t.decide.oneByOne(named(oneByOne)) : null,
      unclear.length > 0 ? t.decide.unclear(named(unclear)) : null,
    ]
      .filter(Boolean)
      .join('\n'),
  }
}
