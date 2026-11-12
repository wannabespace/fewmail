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

/** Intl throws on an unknown zone, which would fail every worker loop for that user. */
export const isTimeZone = (timezone: string) => {
  try {
    localClock(timezone)
    return true
  } catch {
    return false
  }
}
