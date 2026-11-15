export class NotFoundError extends Error {
  override name = 'NotFoundError'
}

export class AttachmentsTooLargeError extends Error {
  override name = 'AttachmentsTooLargeError'
}
