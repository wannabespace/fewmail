import type { DeliveryNotice } from '@fewmail/shared/agent'
import { createWebStorageValue } from 'seitu/web'
import { z } from 'zod/mini'

declare global {
  interface Window {
    /** Tauri's bridge (`withGlobalTauri`); the app's commands are in `apps/desktop/src-tauri/src/lib.rs`. */
    __TAURI__?: {
      core: {
        invoke: (
          command: string,
          args: Record<string, unknown>
        ) => Promise<void>
      }
    }
  }
}

/** Set by the desktop app's preload (`apps/desktop`) to its platform: this page is its window. */
export const isDesktop = 'desktop' in document.documentElement.dataset

/** This app's `devices` row (`kind: 'desktop'`) while its notifications are on; Web Push does not reach a web view. */
export const desktopDeviceStore = createWebStorageValue({
  defaultValue: '',
  key: 'fewmail.desktop-device',
  schema: z.string(),
  type: 'localStorage',
})

/** The app shows it as the system's notification, which opens its `url` when clicked. */
export const notifyDesktop = (notice: DeliveryNotice) =>
  window.__TAURI__?.core.invoke('notify', { notice })

/** Home's count on the app's icon, as the tab title shows it in a browser. */
export const badgeDesktop = (count: number) =>
  window.__TAURI__?.core.invoke('set_badge', { count })
