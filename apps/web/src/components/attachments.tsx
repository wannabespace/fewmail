import { attachmentOfCid } from '@fewmail/shared/email'
import type { MailAttachment } from '@fewmail/shared/email'
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '@fewmail/ui/components/attachment'
import { File01Icon, Image01Icon, Pdf01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ReactNode } from 'react'

import { useFileSize } from '~/lib/i18n'
import { posthog } from '~/lib/posthog'

export const attachmentUrl = (messageId: string, partId: string) =>
  `${import.meta.env.API_URL}/attachments/${messageId}/${encodeURIComponent(partId)}`

/** Draws an email's `cid:` images from its own files; without this they show as broken images. */
export const cidSource =
  (message: { attachments: MailAttachment[] | null; id: string }) =>
  (src: string) => {
    const file = attachmentOfCid(message.attachments ?? [], src)
    return file && attachmentUrl(message.id, file.partId)
  }

const iconOf = (mimeType: string) => {
  if (mimeType === 'application/pdf') {
    return Pdf01Icon
  }
  return mimeType.startsWith('image/') ? Image01Icon : File01Icon
}

export const FileChip = ({
  actions,
  file,
  preview,
  trigger,
}: {
  actions?: ReactNode
  file: { filename: string; mimeType: string; size: number }
  preview?: string
  trigger?: ReactNode
}) => {
  const fileSize = useFileSize()
  return (
    <Attachment size="sm" className="max-w-64">
      <AttachmentMedia variant={preview ? 'image' : 'icon'}>
        {preview ? (
          <img src={preview} alt="" data-mask />
        ) : (
          <HugeiconsIcon icon={iconOf(file.mimeType)} />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle data-mask>{file.filename}</AttachmentTitle>
        <AttachmentDescription>{fileSize(file.size)}</AttachmentDescription>
      </AttachmentContent>
      {trigger}
      {actions && <AttachmentActions>{actions}</AttachmentActions>}
    </Attachment>
  )
}

/** The files an email's HTML does not draw itself: listed under it, and kept when it is forwarded. */
export const listedAttachments = (message: {
  attachments: MailAttachment[] | null
  html: string | null
}) =>
  (message.attachments ?? []).filter(
    ({ contentId }) => !contentId || !message.html?.includes(`cid:${contentId}`)
  )

const PREVIEWED = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

/** The files the email's HTML does not draw itself; each opens in a new tab, or downloads when a browser cannot show it. */
export const MessageAttachments = ({
  message,
}: {
  message: {
    attachments: MailAttachment[] | null
    html: string | null
    id: string
  }
}) => {
  const files = listedAttachments(message)
  if (files.length === 0) {
    return null
  }
  return (
    <AttachmentGroup>
      {files.map((file) => {
        const url = attachmentUrl(message.id, file.partId)
        return (
          <FileChip
            key={file.partId}
            file={file}
            preview={PREVIEWED.has(file.mimeType) ? url : undefined}
            trigger={
              <AttachmentTrigger
                render={
                  <a
                    aria-label={file.filename}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => posthog.capture('attachment_opened')}
                  />
                }
              />
            }
          />
        )
      })}
    </AttachmentGroup>
  )
}
