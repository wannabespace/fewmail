import { randomUUID } from 'node:crypto'

import { db } from '@fewmail/db'
import { schedules } from '@fewmail/db/schema'
import { Cron } from 'croner'
import { and, asc, eq } from 'drizzle-orm'

import { announceChange } from '../lib/live'
import { getSettings } from './settings'

const MIN_INTERVAL_MS = 60 * 60 * 1000

export const nextRunAt = async (
  userId: string,
  cron: string,
  from = new Date()
) => {
  const settings = await getSettings(userId)
  const [next, after] = new Cron(cron, {
    timezone: settings?.timezone ?? 'UTC',
  }).nextRuns(2, from)
  if (!next) {
    throw new Error('This schedule never runs')
  }
  if (after && after.getTime() - next.getTime() < MIN_INTERVAL_MS) {
    throw new Error('A schedule runs at most once an hour')
  }
  return next
}

export const createSchedule = async (
  userId: string,
  input: Pick<typeof schedules.$inferInsert, 'cron' | 'instruction' | 'when'>
) => {
  const [schedule] = await db
    .insert(schedules)
    .values({
      ...input,
      chatId: randomUUID(),
      nextRunAt: await nextRunAt(userId, input.cron),
      userId,
    })
    .returning()
  await announceChange(userId, ['schedules'])
  return schedule
}

export const listSchedules = (userId: string) =>
  db
    .select({
      chatId: schedules.chatId,
      id: schedules.id,
      instruction: schedules.instruction,
      nextRunAt: schedules.nextRunAt,
      when: schedules.when,
    })
    .from(schedules)
    .where(eq(schedules.userId, userId))
    .orderBy(asc(schedules.nextRunAt))

export const deleteSchedule = async (userId: string, id: string) => {
  await db
    .delete(schedules)
    .where(and(eq(schedules.id, id), eq(schedules.userId, userId)))
  await announceChange(userId, ['schedules'])
}
