import type { PostHog } from 'posthog-js'

let instance: Promise<PostHog> | null = null
let identity: Parameters<PostHog['identify']> | null = null

const UUID = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/iu
const EXPECTED_ERRORS = [
  'resizeobserver loop',
  'failed to fetch',
  'load failed',
  'network error',
  'networkerror',
]

const isExpectedError = (message: string) => {
  const lower = message.toLowerCase()
  return EXPECTED_ERRORS.some((error) => lower.includes(error))
}

// The search holds what the user searched for, so it never leaves the browser.
const appPath = () =>
  location.pathname
    .split('/')
    .map((segment) => (UUID.test(segment) ? ':id' : segment))
    .join('/')

const appUrl = () => `${location.origin}${appPath()}`

const init = async () => {
  const { default: posthogJs } = await import('posthog-js')
  const client = posthogJs.init(import.meta.env.POSTHOG_TOKEN ?? '', {
    api_host: 'https://e.fewmail.app',
    before_send: (event) => {
      if (
        !event ||
        (event.event === '$exception' &&
          event.properties.$exception_list.some(
            ({ value }: { value: string }) => isExpectedError(value)
          ))
      ) {
        return null
      }
      event.properties.$current_url = appUrl()
      event.properties.$pathname = appPath()
      return event
    },
    capture_dead_clicks: true,
    capture_pageview: false,
    defaults: '2026-08-30',
    enable_recording_console_log: false,
    get_current_url: appUrl,
    // Autocapture would otherwise send link targets and button text: mail addresses, subjects, URLs from emails.
    mask_all_element_attributes: true,
    mask_all_text: true,
    session_recording: {
      // Email bodies render in an iframe and avatars are the senders' pictures.
      blockSelector: 'iframe, img',
      maskAllInputs: true,
      // Every text on screen is someone's mail; replays show layout and clicks only.
      maskTextSelector: '*',
      // Pinned off: the project's network setting would record API answers, which carry decrypted mail.
      recordBody: false,
      recordHeaders: false,
    },
    ui_host: 'https://eu.posthog.com',
  })
  client.register({
    app: 'desktop' in document.documentElement.dataset ? 'desktop' : 'web',
  })
  if (identity) {
    client.identify(...identity)
  }
  return client
}

const withClient = async (run: (client: PostHog) => void) => {
  if (import.meta.env.POSTHOG_TOKEN) {
    run(await (instance ??= init()))
  }
}

/** The only importer of posthog-js, loaded after the first paint; properties are enums and counts (`architecture.md` → Analytics). */
export const posthog = {
  capture: (...args: Parameters<PostHog['capture']>) =>
    withClient((client) => client.capture(...args)),
  captureException: (...args: Parameters<PostHog['captureException']>) =>
    withClient((client) => client.captureException(...args)),
  identify: (...args: Parameters<PostHog['identify']>) => {
    identity = args
    return withClient((client) => client.identify(...args))
  },
  reset: () => {
    identity = null
    return withClient((client) => client.reset())
  },
}
