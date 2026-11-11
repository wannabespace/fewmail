import { db } from '@fewmail/db'
import { rules } from '@fewmail/db/schema'
import type { SimpleMatch } from '@fewmail/db/schema'
import type { RuleEffect } from '@fewmail/shared/agent'
import { and, desc, eq } from 'drizzle-orm'

import { expectRow } from '../lib/rows'
import { NotFoundError } from './mail-errors'

export const listRules = (userId: string) =>
  db
    .select()
    .from(rules)
    .where(eq(rules.userId, userId))
    .orderBy(desc(rules.createdAt))

export const createRule = async (
  userId: string,
  input:
    | { effect: RuleEffect; instruction: string }
    | { effect: RuleEffect; match: SimpleMatch }
) => {
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

export const updateRule = async (
  userId: string,
  id: string,
  input: Partial<{
    effect: RuleEffect
    enabled: boolean
    instruction: string
  }>
) => {
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

export const deleteRule = async (userId: string, id: string) => {
  await db.delete(rules).where(and(eq(rules.id, id), eq(rules.userId, userId)))
}
