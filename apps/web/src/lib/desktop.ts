/** Set by the desktop app (`apps/desktop`) before any script runs: the page is inside its window. */
interface DesktopApp {
  updateReady?: boolean
  version: string
}

declare global {
  interface Window {
    fewmailDesktop?: DesktopApp
    ipc?: { postMessage: (message: string) => void }
  }
}

const app = window.fewmailDesktop
const post = (message: string) => window.ipc?.postMessage(message)

export const desktop = app && {
  /** Restarts into the update the app downloaded. */
  installUpdate: () => post('install-update'),
  isUpdateReady: () => Boolean(app.updateReady),
  /** Google refuses embedded web views: the app opens `/desktop` in the browser and gets a one-time token back. */
  signIn: (next: string, hint?: string) =>
    post(
      `sign-in ${location.origin}/desktop?${new URLSearchParams({ next, ...(hint && { hint }) })}`
    ),
  version: app.version,
}

/** Fired by the app once an update is downloaded and checked; never outside it. */
export const onDesktopUpdateReady = (listener: () => void) => {
  addEventListener('fewmail-desktop-update', listener)
  return () => removeEventListener('fewmail-desktop-update', listener)
}
