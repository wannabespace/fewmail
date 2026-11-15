import { Result } from 'better-result'

/** Local date (YYYY-MM-DD) and hour in a time zone, via Intl only. */
export const localClock = (timezone: string, date = new Date()) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
      month: '2-digit',
      timeZone: timezone,
      year: 'numeric',
    })
      .formatToParts(date)
      .map(({ type: part, value }) => [part, value])
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
  }
}

/** "2026-11-15 00:43 GMT+02:00": the model resolves "today" and "tonight" from it, so it must be the user's clock, not UTC. */
export const localStamp = (timezone: string, date: Date) =>
  new Intl.DateTimeFormat('sv-SE', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    timeZone: timezone,
    timeZoneName: 'longOffset',
    year: 'numeric',
  }).format(date)

/** Intl throws on an unknown zone, which would fail every worker loop for that user. */
export const isTimeZone = (timezone: string) =>
  Result.try(() => localClock(timezone)).isOk()

/** ICU (browsers, Bun) still names these zones the old way; Postgres on system tzdata without the legacy links rejects those names. */
const ICU_LEGACY_ZONES: Record<string, string> = {
  'Africa/Asmera': 'Africa/Asmara',
  'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
  'America/Catamarca': 'America/Argentina/Catamarca',
  'America/Coral_Harbour': 'America/Atikokan',
  'America/Cordoba': 'America/Argentina/Cordoba',
  'America/Godthab': 'America/Nuuk',
  'America/Indianapolis': 'America/Indiana/Indianapolis',
  'America/Jujuy': 'America/Argentina/Jujuy',
  'America/Louisville': 'America/Kentucky/Louisville',
  'America/Mendoza': 'America/Argentina/Mendoza',
  'Asia/Calcutta': 'Asia/Kolkata',
  'Asia/Katmandu': 'Asia/Kathmandu',
  'Asia/Rangoon': 'Asia/Yangon',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Atlantic/Faeroe': 'Atlantic/Faroe',
  'Europe/Kiev': 'Europe/Kyiv',
  'Pacific/Enderbury': 'Pacific/Kanton',
  'Pacific/Ponape': 'Pacific/Pohnpei',
  'Pacific/Truk': 'Pacific/Chuuk',
}

/** Every zone handed to Postgres (`at time zone`) goes through this. */
export const postgresZone = (timezone: string) =>
  ICU_LEGACY_ZONES[timezone] ?? timezone

/** The local day before a YYYY-MM-DD date; noon UTC keeps the step clear of any offset. */
export const previousDay = (date: string) =>
  new Date(Date.parse(`${date}T12:00:00Z`) - 86_400_000)
    .toISOString()
    .slice(0, 10)
