self.addEventListener('push', (event) => {
  const { body, title, url } = event.data.json()
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { url },
      icon: '/apple-touch-icon.png',
    })
  )
})

const openApp = async (url) => {
  const [open] = await self.clients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  })
  if (!open) {
    return self.clients.openWindow(url)
  }
  const focused = await open.focus()
  return focused.navigate(url)
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(openApp(event.notification.data.url))
})
