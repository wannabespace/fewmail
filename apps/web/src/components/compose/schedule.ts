import { addDays, addHours, nextMonday, nextSaturday, set } from 'date-fns'

const at = (date: Date, hours: number) =>
  set(date, { hours, milliseconds: 0, minutes: 0, seconds: 0 })

const MORNING = 8

export const LATER_PRESETS = {
  inHour: () => addHours(new Date(), 1),
  monday: () => at(nextMonday(new Date()), MORNING),
  tomorrow: () => at(addDays(new Date(), 1), MORNING),
} as const

export const SNOOZE_PRESETS = {
  laterToday: () => addHours(new Date(), 3),
  nextWeek: () => at(nextMonday(new Date()), MORNING),
  tomorrow: () => at(addDays(new Date(), 1), MORNING),
  weekend: () => at(nextSaturday(new Date()), 9),
} as const

export type LaterPreset = keyof typeof LATER_PRESETS
export type SnoozePreset = keyof typeof SNOOZE_PRESETS

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
