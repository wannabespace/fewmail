import { ORPCError, os } from '@orpc/server'

import { auth } from '../lib/auth'
import { NotFoundError } from '../services/mail'
import { AgentRequiredError, requireAgent } from '../services/plan'

export const orpc = os.$context<{ headers: Headers }>()

const notFoundToOrpc = orpc.middleware(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new ORPCError('NOT_FOUND', { message: error.message })
    }
    if (error instanceof AgentRequiredError) {
      throw new ORPCError('FORBIDDEN', { message: error.message })
    }
    throw error
  }
})

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
