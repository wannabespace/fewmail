import { client } from './orpc'

const WORKER_URL = '/sw.js'

export const pushSupported =
  'serviceWorker' in navigator && 'PushManager' in window

export const currentPushSubscription = async () => {
  const registration = await navigator.serviceWorker.getRegistration(WORKER_URL)
  return (await registration?.pushManager.getSubscription()) ?? null
}

export const enablePush = async (publicKey: string) => {
  const registration = await navigator.serviceWorker.register(WORKER_URL)
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
  const subscription = pushSupported ? await currentPushSubscription() : null
  if (subscription) {
    await client.devices.remove({ token: subscription.endpoint })
    await subscription.unsubscribe()
  }
}
