import {
  addDays,
  addHours,
  isToday,
  isWeekend,
  nextMonday,
  nextSaturday,
  set,
} from 'date-fns'

const at = (date: Date, hours: number) =>
  set(date, { hours, milliseconds: 0, minutes: 0, seconds: 0 })

const MORNING = 8

/** Before this hour the night is not over, so "tomorrow morning" is the coming one, not a day later. */
const NIGHT_ENDS = 4

const tomorrowMorning = () => {
  const now = new Date()
  return at(now.getHours() < NIGHT_ENDS ? now : addDays(now, 1), MORNING)
}

export const LATER_PRESETS = {
  inHour: () => addHours(new Date(), 1),
  monday: () => at(nextMonday(new Date()), MORNING),
  tomorrow: tomorrowMorning,
} as const

/** Null where the label would not be true right now: later today past midnight, this weekend on a weekend. */
export const SNOOZE_PRESETS = {
  laterToday: () => {
    const until = addHours(new Date(), 3)
    return isToday(until) ? until : null
  },
  nextWeek: () => at(nextMonday(new Date()), MORNING),
  tomorrow: tomorrowMorning,
  weekend: () =>
    isWeekend(new Date()) ? null : at(nextSaturday(new Date()), 9),
} as const

export type LaterPreset = keyof typeof LATER_PRESETS
export type SnoozePreset = keyof typeof SNOOZE_PRESETS

/** A menu's presets in order with their times, leaving out the null ones and any that lands on an earlier one's time (next week on a Sunday is tomorrow). */
export const presetTimes = <Preset extends string>(
  presets: Record<Preset, () => Date | null>,
  order: readonly Preset[]
) => {
  const seen = new Set<number>()
  return order.flatMap((preset) => {
    const until = presets[preset]()
    if (!until || seen.has(until.getTime())) {
      return []
    }
    seen.add(until.getTime())
    return [{ preset, until }]
  })
}

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/u

/** Accepts "a@b.c, Name <d@e.f>; g@h.i" as typed or pasted. */
export const parseRecipients = (value: string) =>
  value
    .split(/[,;\n]/u)
    .map((part) => part.match(/<(?<email>[^>]+)>/u)?.groups?.email ?? part)
    .map((part) => part.trim())
    .filter(Boolean)

export const validRecipients = (recipients: string[]) =>
  recipients.length > 0 &&
  recipients.every((recipient) => EMAIL.test(recipient))
