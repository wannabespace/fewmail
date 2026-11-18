import { db } from '@fewmail/db'
import { rules } from '@fewmail/db/schema'
import type { SimpleMatch } from '@fewmail/db/schema'
import { isGmailEffect } from '@fewmail/shared/agent'
import type { RuleEffect } from '@fewmail/shared/agent'
import { and, desc, eq, sql } from 'drizzle-orm'

import { expectRow } from '../lib/rows'
import { NotFoundError } from './mail-errors'
import { requireAgent } from './plan'

/** Jev matches plain-language rules on every plan; drafting and showing on Home need the agent. */
const requireAgentFor = async (userId: string, effect?: RuleEffect) => {
  if (effect && !isGmailEffect(effect)) {
    await requireAgent(userId)
  }
}

/** Newest first; starter rules share one `createdAt`, so the id keeps their order from shuffling between reads. */
export const RULE_ORDER = [desc(rules.createdAt), desc(rules.id)] as const

export const listRules = (userId: string) =>
  db
    .select()
    .from(rules)
    .where(eq(rules.userId, userId))
    .orderBy(...RULE_ORDER)

/** Starter rules that change Gmail start off and untouched: Home offers each once; turning it on or saying no touches it. */
export const listRuleOffers = async (userId: string) => {
  const untouched = await db
    .select()
    .from(rules)
    .where(
      and(
        eq(rules.userId, userId),
        eq(rules.enabled, false),
        sql`${rules.updatedAt} = ${rules.createdAt}`
      )
    )
    .orderBy(...RULE_ORDER)
  return untouched.filter(({ effect }) => isGmailEffect(effect))
}

export const sameText = (a: string, b: string) =>
  a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase()

export const updateRule = async (
  userId: string,
  id: string,
  input: Partial<{
    effect: RuleEffect
    enabled: boolean
    instruction: string
  }>
) => {
  await requireAgentFor(userId, input.effect)
  const [rule] = await db
    .update(rules)
    .set(input)
    .where(and(eq(rules.id, id), eq(rules.userId, userId)))
    .returning()
  if (!rule) {
    throw new NotFoundError('Rule not found')
  }
  return rule
}

export const createRule = async (
  userId: string,
  input:
    | { effect: RuleEffect; instruction: string }
    | { effect: RuleEffect; match: SimpleMatch }
) => {
  await requireAgentFor(userId, input.effect)
  const existing = await listRules(userId)
  const twin = existing.find((rule) =>
    'match' in input
      ? rule.match?.field === input.match.field &&
        sameText(rule.match.value, input.match.value)
      : rule.instruction !== null &&
        sameText(rule.instruction, input.instruction)
  )
  if (twin) {
    return updateRule(userId, twin.id, { effect: input.effect, enabled: true })
  }
  const [rule] = await db
    .insert(rules)
    .values(
      'match' in input
        ? { effect: input.effect, match: input.match, userId }
        : { ...input, userId }
    )
    .returning()
  return expectRow(rule)
}

export const deleteRule = async (userId: string, id: string) => {
  await db.delete(rules).where(and(eq(rules.id, id), eq(rules.userId, userId)))
}
