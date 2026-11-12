import { BATCH_HOURS_AFTER_BRIEF } from '@fewmail/shared/agent'
import { addDays, addHours, subDays } from 'date-fns'

import { localClock } from '../lib/clock'

/** Wall-clock instant for a local date and hour in a time zone, without a tz library. */
const zonedInstant = (date: string, hour: number, timezone: string) => {
  const guess = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00Z`)
  const shown = localClock(timezone, guess)
  const drift = (shown.hour - hour + 24) % 24
  return new Date(
    guess.getTime() - (drift > 12 ? drift - 24 : drift) * 3_600_000
  )
}

/**
 * Batched delivery: non-urgent queue items surface at two calm moments a day (the brief hour
 * and seven hours later); urgent ones never wait. Nothing to configure, Gmail is untouched.
 */
export const deliverySlots = (
  timezone: string,
  briefHour: number,
  now = new Date()
) => {
  const today = localClock(timezone, now).date
  const yesterday = localClock(timezone, subDays(now, 1)).date
  const tomorrow = localClock(timezone, addDays(now, 1)).date
  const slots = [yesterday, today, tomorrow].flatMap((date) =>
    BATCH_HOURS_AFTER_BRIEF.map((offset) =>
      addHours(zonedInstant(date, briefHour, timezone), offset)
    )
  )
  const past = slots.filter((slot) => slot <= now)
  return {
    last: past.at(-1) ?? subDays(now, 1),
    next: slots.find((slot) => slot > now) ?? addDays(now, 1),
  }
}
