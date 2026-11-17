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

/** Feeds the 5xx alert in PostHog: the log's label and the error's class, never its message. */
export const captureServerError = (label: string, error: string) =>
  client?.capture({
    distinctId: 'fewmail-api',
    event: 'server_error',
    properties: { $process_person_profile: false, app: 'api', error, label },
  })
