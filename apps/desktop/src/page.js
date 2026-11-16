const backgroundAtTop = () => {
  for (
    let node = document.elementFromPoint(innerWidth / 2, 0);
    node;
    node = node.parentElement
  ) {
    const color = getComputedStyle(node).backgroundColor
    if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
      return color
    }
  }
  return getComputedStyle(document.body).backgroundColor
}

// Paints the native title bar in the colour right under it, so the window reads as one page in either theme.
addEventListener('DOMContentLoaded', () => {
  const pixel = document.createElement('canvas').getContext('2d', {
    willReadFrequently: true,
  })
  let reported = ''
  let isQueued = false
  const report = () => {
    isQueued = false
    // The kit's colours are oklch; a pixel turns any CSS colour into sRGB.
    pixel.clearRect(0, 0, 1, 1)
    pixel.fillStyle = backgroundAtTop()
    pixel.fillRect(0, 0, 1, 1)
    const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data
    const message = `theme ${r} ${g} ${b}`
    if (message !== reported) {
      reported = message
      // oxlint-disable-next-line unicorn/require-post-message-target-origin -- wry's IPC channel, not window.postMessage
      window.ipc.postMessage(message)
    }
  }
  const queue = () => {
    if (!isQueued) {
      isQueued = true
      requestAnimationFrame(report)
    }
  }
  report()
  new MutationObserver(queue).observe(document.documentElement, {
    attributeFilter: ['class'],
    attributes: true,
    childList: true,
    subtree: true,
  })
})
