import { desktopDeviceStore, isDesktop } from './desktop'
import { client, reopenLiveStream } from './orpc'

const WORKER_URL = '/sw.js'

export const pushSupported =
  isDesktop || ('serviceWorker' in navigator && 'PushManager' in window)

export const currentPushSubscription = async () => {
  const registration = await navigator.serviceWorker.getRegistration(WORKER_URL)
  return (await registration?.pushManager.getSubscription()) ?? null
}

export const pushStateQuery = {
  enabled: pushSupported,
  // macOS asks for the app's permission with its first notification, so the desktop app starts at `default`.
  queryFn: async () =>
    isDesktop
      ? { permission: 'default', subscribed: !!desktopDeviceStore.get() }
      : {
          permission: Notification.permission,
          subscribed: !!(await currentPushSubscription()),
        },
  queryKey: ['push-state'],
}

export const enablePush = async (publicKey: string) => {
  if (isDesktop) {
    const token = crypto.randomUUID()
    await client.devices.register({ kind: 'desktop', token })
    desktopDeviceStore.set(token)
    reopenLiveStream()
    return
  }
  await navigator.serviceWorker.register(WORKER_URL)
  // `register` resolves while the worker still installs, and Chrome refuses to subscribe without an active one.
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    applicationServerKey: publicKey,
    userVisibleOnly: true,
  })
  const { endpoint, keys } = subscription.toJSON()
  if (!(endpoint && keys?.auth && keys.p256dh)) {
    throw new Error('Push subscription without keys')
  }
  await client.devices.register({
    keys: { auth: keys.auth, p256dh: keys.p256dh },
    kind: 'web',
    token: endpoint,
  })
}

export const disablePush = async () => {
  const token = desktopDeviceStore.get()
  if (token) {
    desktopDeviceStore.set('')
    await client.devices.remove({ token })
  }
  const subscription =
    pushSupported && !isDesktop ? await currentPushSubscription() : null
  if (subscription) {
    await client.devices.remove({ token: subscription.endpoint })
    await subscription.unsubscribe()
  }
}
