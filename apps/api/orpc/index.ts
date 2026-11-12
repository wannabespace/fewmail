import { ORPCError, os } from '@orpc/server'
import { Result } from 'better-result'

import { auth } from '../lib/auth'
import { LimitReachedError } from '../services/limit-error'
import { NotFoundError } from '../services/mail'
import { AlreadySentError } from '../services/outbox'
import { AgentRequiredError, requireAgent } from '../services/plan'

export const orpc = os.$context<{ headers: Headers }>()

const notFoundToOrpc = orpc.middleware(async ({ next }) => {
  const result = await Result.tryPromise(async () => await next())
  if (result.isOk()) {
    return result.value
  }
  const error = result.error.cause
  if (error instanceof AlreadySentError) {
    throw new ORPCError('CONFLICT', { message: error.message })
  }
  if (error instanceof NotFoundError) {
    throw new ORPCError('NOT_FOUND', { message: error.message })
  }
  if (error instanceof AgentRequiredError) {
    throw new ORPCError('FORBIDDEN', { message: error.message })
  }
  if (error instanceof LimitReachedError) {
    throw new ORPCError('TOO_MANY_REQUESTS', {
      data: {
        limit: error.limit,
        resetsAt: error.resetsAt,
        total: error.total,
      },
      message: error.message,
    })
  }
  throw error
})

/** Signed-out visitors: only what a shared link shows. */
export const visitor = orpc.use(notFoundToOrpc)

export const authed = orpc
  .use(notFoundToOrpc)
  .use(async ({ context, next }) => {
    const session = await auth.api.getSession({ headers: context.headers })
    if (!session) {
      throw new ORPCError('UNAUTHORIZED')
    }
    return next({ context: { user: session.user } })
  })

export const agent = authed.use(async ({ context, next }) => {
  await requireAgent(context.user.id)
  return next()
})
