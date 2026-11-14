import { PostHog } from 'posthog-node'

import { env } from '../env'

const client = env.POSTHOG_TOKEN
  ? new PostHog(env.POSTHOG_TOKEN, {
      // A crash skips the flush on SIGTERM, and a batched event would die with the process.
      flushAt: 1,
      host: 'https://eu.i.posthog.com',
    })
  : null

/** Enums and counts only: never subjects, addresses, drafts or error messages (`architecture.md` → Analytics). */
export const capture = (
  userId: string,
  event: string,
  properties?: Record<string, boolean | number | string | null | undefined>
) =>
  client?.capture({
    distinctId: userId,
    event,
    properties: { app: 'api', ...properties },
  })
