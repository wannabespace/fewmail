export const usageResetsAt = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
}

/** The month's allowance is spent; it comes back at `resetsAt`. */
export class LimitReachedError extends Error {
  override name = 'LimitReachedError'
  readonly resetsAt = usageResetsAt()

  constructor() {
    super("The plan's monthly allowance is spent")
  }
}
