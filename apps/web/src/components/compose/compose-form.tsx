import { FOLLOWUP_DAYS } from '@fewmail/shared/agent'
import { ATTACHMENTS_MAX_BYTES, htmlToText } from '@fewmail/shared/email'
import type { OutgoingAttachment } from '@fewmail/shared/email'
import { AttachmentGroup } from '@fewmail/ui/components/attachment'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@fewmail/ui/components/dropdown-menu'
import { Input } from '@fewmail/ui/components/input'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@fewmail/ui/components/select'
import {
  Attachment01Icon,
  Cancel01Icon,
  Delete02Icon,
  PencilEdit02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useFileSize, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'
import { posthog } from '~/lib/posthog'
import { toastDeferred } from '~/lib/undo'

import { FileChip } from '../attachments'
import type { ComposerEditorHandle } from '../composer/composer-editor'
import { ComposerEditor } from '../composer/composer-editor'
import { useWithAgent } from '../upgrade-dialog'
import type { Draft } from './compose-context'
import { useCompose } from './compose-context'
import { RecipientsField } from './recipients-field'
import { parseRecipients, validRecipients } from './schedule'
import { SendLater } from './send-later'

const AUTOSAVE_MS = 1000

const isValid = (recipient: string) => validRecipients([recipient])

const base64Of = (file: File) =>
  // oxlint-disable-next-line promise/avoid-new -- FileReader has no promise API, and it encodes large files without a copy per byte
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () =>
      resolve(String(reader.result).split(',')[1] ?? '')
    )
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(file)
  })

const MIME_TYPE = /^[\w.+-]+\/[\w.+-]+$/u

const attachmentOf = async (file: File): Promise<OutgoingAttachment> => ({
  data: await base64Of(file),
  filename: file.name,
  id: crypto.randomUUID(),
  mimeType: MIME_TYPE.test(file.type) ? file.type : 'application/octet-stream',
  size: file.size,
})

/** Once a saved draft holds a file, later saves name it instead of sending it up again. */
const withoutData = ({ data: _data, ...file }: OutgoingAttachment) => file

const hasFiles = (transfer: DataTransfer) => transfer.types.includes('Files')

const focusAtEnd = (field: { focus: () => void } | null) => {
  field?.focus()
  if (field instanceof HTMLInputElement) {
    field.setSelectionRange(field.value.length, field.value.length)
  }
}

export const ComposeForm = ({
  draft,
  onDone,
}: {
  draft: Draft
  onDone: () => void
}) => {
  const t = useT()
  const fileSize = useFileSize()
  const hasAgent = useHasAgent()
  const withAgent = useWithAgent()
  const { openCompose, send } = useCompose()
  const editorRef = useRef<ComposerEditorHandle>(null)
  const toRef = useRef<HTMLInputElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const [to, setTo] = useState(draft.to.join(', '))
  const [cc, setCc] = useState(draft.cc.join(', '))
  const [showCc, setShowCc] = useState(draft.cc.length > 0)
  const [subject, setSubject] = useState(draft.subject)
  const [remindAfterDays, setRemindAfterDays] = useState(draft.remindAfterDays)
  const { data: snippets } = useQuery(orpc.snippets.list.queryOptions())
  const { data: mailboxes = [] } = useQuery(orpc.mailboxes.list.queryOptions())
  const [mailboxId, setMailboxId] = useState(draft.mailboxId)
  const [attachments, setAttachments] = useState(draft.attachments)
  const [isDragging, setIsDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()
  const writeDraft = useMutation(orpc.mail.writeDraft.mutationOptions())
  const [edits, setEdits] = useState(0)
  const [isSaved, setIsSaved] = useState(Boolean(draft.gmailDraft))
  const body = useRef({ html: draft.html, text: htmlToText(draft.html) })
  const gmailDraft = useRef(draft.gmailDraft)
  // Saves run one after another: a second save started before the first returns its id would create a duplicate draft.
  const saving = useRef<Promise<unknown>>(Promise.resolve())
  const isLeaving = useRef(false)
  const edit = () => {
    setEdits((count) => count + 1)
    setIsSaved(false)
  }

  const save = useEffectEvent(() => {
    const mail = {
      attachments,
      bcc: draft.bcc,
      cc: parseRecipients(cc).filter(isValid),
      ...body.current,
      ...(mailboxId && { mailboxId }),
      mode: draft.mode,
      ...(draft.replyToMessageId && {
        replyToMessageId: draft.replyToMessageId,
      }),
      subject,
      to: parseRecipients(to).filter(isValid),
    }
    const isBlank =
      !mail.subject.trim() &&
      mail.to.length === 0 &&
      !mail.text.trim() &&
      mail.attachments.length === 0
    const uploaded = new Set(
      mail.attachments.filter(({ data }) => data).map(({ id }) => id)
    )
    const persist = async () => {
      if (isBlank && !gmailDraft.current) {
        return
      }
      gmailDraft.current = await client.mail.saveDraft({
        ...mail,
        ...(gmailDraft.current && { draft: gmailDraft.current }),
      })
      setAttachments((current) =>
        current.map((file) =>
          uploaded.has(file.id) ? withoutData(file) : file
        )
      )
      setIsSaved(true)
      void queryClient.invalidateQueries({ queryKey: orpc.mail.drafts.key() })
      void queryClient.invalidateQueries({
        queryKey: orpc.mail.draftCount.key(),
      })
    }
    saving.current = saving.current.then(persist).catch(() => null)
  })
  useEffect(() => {
    if (edits === 0) {
      return
    }
    const timer = setTimeout(save, AUTOSAVE_MS)
    return () => clearTimeout(timer)
  }, [edits])
  const hasUnsaved = edits > 0 && !isSaved
  const saveOnLeave = useEffectEvent(() => {
    if (hasUnsaved && !isLeaving.current) {
      save()
    }
  })
  useEffect(() => () => saveOnLeave(), [])

  const removeDraft = async () => {
    if (gmailDraft.current) {
      await client.mail.deleteDraft(gmailDraft.current)
      void queryClient.invalidateQueries({ queryKey: orpc.mail.drafts.key() })
      void queryClient.invalidateQueries({
        queryKey: orpc.mail.draftCount.key(),
      })
    }
  }
  const addFiles = async (
    files: File[],
    source: 'drop' | 'paste' | 'picker'
  ) => {
    if (files.length === 0) {
      return
    }
    const total = [...attachments, ...files].reduce(
      (sum, { size }) => sum + size,
      0
    )
    if (total > ATTACHMENTS_MAX_BYTES) {
      toast.error(
        t.compose.attachmentsTooLarge(fileSize(ATTACHMENTS_MAX_BYTES))
      )
      return
    }
    const added = await Promise.all(files.map(attachmentOf))
    setAttachments((current) => [...current, ...added])
    edit()
    posthog.capture('attachment_added', { count: files.length, source })
  }
  const removeFile = (id: string) => {
    setAttachments((current) => current.filter((file) => file.id !== id))
    edit()
  }
  const pickFiles = () => fileInput.current?.click()
  useHotkey('Mod+Shift+U', pickFiles, { ignoreInputs: false })

  const discard = () => {
    isLeaving.current = true
    if (
      attachments.length === 0 &&
      ![to, cc, subject, body.current.text].some((text) => text.trim())
    ) {
      onDone()
      void saving.current.then(removeDraft)
      return
    }
    const kept = {
      ...draft,
      attachments,
      cc: parseRecipients(cc),
      html: body.current.html,
      mailboxId,
      remindAfterDays,
      subject,
      to: parseRecipients(to),
    }
    onDone()
    toastDeferred(
      t.compose.discarded,
      () => saving.current.then(removeDraft),
      () =>
        saving.current.then(() =>
          openCompose({ ...kept, gmailDraft: gmailDraft.current ?? null })
        )
    )
  }
  const fillEditor = ({ html }: { html: string }) => {
    editorRef.current?.setContent(html)
    editorRef.current?.focus()
  }

  const isReply = draft.mode === 'reply'
  const focusFirstEmpty = useEffectEvent(() => {
    const empty = [toRef, subjectRef].find(
      ({ current }) => current && !current.value.trim()
    )
    focusAtEnd((empty ?? editorRef).current)
  })
  useEffect(() => focusFirstEmpty(), [])
  const submit = (sendAt?: Date) => {
    const recipients = parseRecipients(to)
    const copies = parseRecipients(cc)
    if (
      !validRecipients(recipients) ||
      (copies.length > 0 && !validRecipients(copies))
    ) {
      toast.error(t.compose.invalidRecipients)
      return
    }
    const editor = editorRef.current
    if (!editor || !editor.getText().trim()) {
      return
    }
    const mail = {
      ...draft,
      attachments,
      cc: copies,
      html: editor.getHtml(),
      mailboxId,
      remindAfterDays,
      sendAt,
      subject,
      text: editor.getText(),
      to: recipients,
    }
    isLeaving.current = true
    onDone()
    void saving.current.then(() =>
      send({ ...mail, gmailDraft: gmailDraft.current })
    )
  }

  // The editor handles its own ⌘⏎: answering it here too would send the mail twice.
  useHotkey(
    'Mod+Enter',
    (event) =>
      !(
        event.target instanceof HTMLElement && event.target.isContentEditable
      ) && submit(),
    { ignoreInputs: false }
  )

  return (
    // Capture: the editor would paste a copied file's name as text, or drop it nowhere.
    <div
      className="relative flex flex-col gap-3"
      onDragOver={(event) => {
        if (hasFiles(event.dataTransfer)) {
          event.preventDefault()
          setIsDragging(true)
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragging(false)
        }
      }}
      onDropCapture={(event) => {
        if (hasFiles(event.dataTransfer)) {
          event.preventDefault()
          event.stopPropagation()
          setIsDragging(false)
          void addFiles([...event.dataTransfer.files], 'drop')
        }
      }}
      onPasteCapture={(event) => {
        if (event.clipboardData.files.length > 0) {
          event.preventDefault()
          event.stopPropagation()
          void addFiles([...event.clipboardData.files], 'paste')
        }
      }}
    >
      {isDragging && (
        <div className="border-primary/40 bg-background/80 text-muted-foreground pointer-events-none absolute -inset-2 z-20 flex items-center justify-center rounded-xl border-2 border-dashed text-sm">
          {t.compose.dropFiles}
        </div>
      )}
      {!draft.replyToMessageId && mailboxes.length > 1 && (
        <Select
          items={mailboxes.map(({ email, id }) => ({
            label: email,
            value: id,
          }))}
          value={mailboxId ?? mailboxes.find(({ signIn }) => signIn)?.id}
          onValueChange={(next) => {
            if (next) {
              setMailboxId(next)
              edit()
            }
          }}
        >
          <SelectTrigger aria-label={t.compose.from} className="w-full">
            <span className="text-muted-foreground">{t.compose.from}</span>
            <SelectValue data-mask />
          </SelectTrigger>
          <SelectContent>
            {mailboxes.map(({ email, id }) => (
              <SelectItem key={id} value={id}>
                <span data-mask>{email}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="flex items-center gap-2">
        <RecipientsField
          ref={toRef}
          label={t.compose.to}
          value={to}
          onChange={(next) => {
            setTo(next)
            edit()
          }}
        />
        {!showCc && (
          <Button
            size="sm"
            variant="ghost-muted"
            onClick={() => setShowCc(true)}
          >
            {t.compose.cc}
          </Button>
        )}
      </div>
      {showCc && (
        <RecipientsField
          label={t.compose.cc}
          value={cc}
          onChange={(next) => {
            setCc(next)
            edit()
          }}
        />
      )}
      {!isReply && (
        <Input
          ref={subjectRef}
          value={subject}
          onChange={(event) => {
            setSubject(event.target.value)
            edit()
          }}
          placeholder={t.compose.subject}
          aria-label={t.compose.subject}
          data-mask
        />
      )}
      <ComposerEditor
        ref={editorRef}
        initialHtml={draft.html}
        placeholder={t.compose.placeholder}
        aria-label={t.compose.placeholder}
        snippets={snippets}
        onChange={(value) => {
          body.current = value
          edit()
        }}
        onSubmit={() => submit()}
        onEscape={() =>
          document.activeElement instanceof HTMLElement &&
          document.activeElement.blur()
        }
        complete={
          hasAgent
            ? ({ prefix, signal, suffix }) =>
                client.mail
                  .complete(
                    {
                      prefix,
                      suffix,
                      ...(draft.replyToMessageId && {
                        replyToMessageId: draft.replyToMessageId,
                      }),
                    },
                    { signal }
                  )
                  .then(({ text }) => text)
            : undefined
        }
      />
      {attachments.length > 0 && (
        <AttachmentGroup>
          {attachments.map((file) => (
            <FileChip
              key={file.id}
              file={file}
              actions={
                <IconButton
                  icon={Cancel01Icon}
                  label={t.compose.removeAttachment}
                  size="icon-xs"
                  variant="ghost-muted"
                  onClick={() => removeFile(file.id)}
                />
              }
            />
          ))}
        </AttachmentGroup>
      )}
      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          void addFiles([...(event.target.files ?? [])], 'picker')
          event.target.value = ''
        }}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => submit()} shortcut={<Kbd>⌘⏎</Kbd>}>
          {t.compose.send}
        </Button>
        <SendLater onSchedule={submit} />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="sm" variant="ghost-muted" />}
          >
            {remindAfterDays
              ? t.compose.remind.days(remindAfterDays)
              : t.compose.remind.label}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-w-none">
            <DropdownMenuRadioGroup
              value={String(remindAfterDays ?? 0)}
              onValueChange={(value) =>
                setRemindAfterDays(Number(value) || null)
              }
            >
              <DropdownMenuRadioItem value="0">
                {t.compose.remind.off}
              </DropdownMenuRadioItem>
              {FOLLOWUP_DAYS.map((days) => (
                <DropdownMenuRadioItem key={days} value={String(days)}>
                  {t.compose.remind.days(days)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <IconButton
          icon={Attachment01Icon}
          label={t.compose.attach}
          shortcut={<Kbd>⇧⌘U</Kbd>}
          size="icon-sm"
          variant="ghost-muted"
          onClick={pickFiles}
        />
        {draft.replyToMessageId && (
          <Button
            size="sm"
            variant="ghost-muted"
            disabled={writeDraft.isPending}
            onClick={() =>
              withAgent(
                'drafts',
                () =>
                  draft.replyToMessageId &&
                  writeDraft.mutate(
                    { messageId: draft.replyToMessageId },
                    { onSuccess: fillEditor }
                  )
              )
            }
          >
            <HugeiconsIcon
              icon={PencilEdit02Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            {writeDraft.isPending ? t.compose.writing : t.compose.writeForMe}
          </Button>
        )}
        <span className="text-muted-foreground ml-auto min-w-0 truncate text-xs">
          {isSaved && t.compose.draftSaved}
        </span>
        <IconButton
          icon={Delete02Icon}
          label={t.compose.discard}
          size="icon-sm"
          variant="ghost-destructive"
          onClick={discard}
        />
      </div>
    </div>
  )
}
