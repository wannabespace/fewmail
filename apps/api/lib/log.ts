import { captureServerError } from './posthog'

/**
 * Error objects carry what was sent (AI SDK `requestBodyValues`, grammY `payload`), i.e. mail
 * and drafts, so only the name, status and first line of the message ever reach the logs.
 */
export const logError = (label: string, error: unknown) => {
  captureServerError(label, error instanceof Error ? error.name : typeof error)
  if (!(error instanceof Error)) {
    console.error(label, typeof error)
    return
  }
  const status = ['statusCode', 'status', 'error_code']
    .map((key) => Reflect.get(error, key))
    .find((value) => value !== undefined)
  const message = error.message.split('\n', 1)[0]?.slice(0, 200)
  console.error(label, error.name, status ?? '', message)
}

/** For `.catch()` on work that runs in the background: `.catch(logErrorAs('first sync'))`. */
export const logErrorAs = (label: string) => (error: unknown) =>
  logError(label, error)

/** The security log: what was refused or removed and where, never whose mail or address. */
export const logSecurityEvent = (
  event: string,
  ...details: (number | string)[]
) => console.warn('security', event, ...details)
