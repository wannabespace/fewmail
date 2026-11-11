export type Limit = 'boards' | 'messages' | 'tasks'

export const usageResetsAt = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
}

export class LimitReachedError extends Error {
  override name = 'LimitReachedError'
  readonly limit: Limit
  readonly resetsAt = usageResetsAt()
  readonly total: number

  constructor(limit: Limit, total: number) {
    super(`The plan's ${limit} limit (${total}) is reached`)
    this.limit = limit
    this.total = total
  }
}
