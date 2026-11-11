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
