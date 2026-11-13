import { FOLLOWUP_DAYS } from '@fewmail/shared/agent'
import { htmlToText } from '@fewmail/shared/email'
import { Button } from '@fewmail/ui/components/button'
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
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'
import { toastDeferred } from '~/lib/undo'

import type { ComposerEditorHandle } from '../composer/composer-editor'
import { ComposerEditor } from '../composer/composer-editor'
import { useWithAgent } from '../upgrade-dialog'
import type { Draft } from './compose-context'
import { useCompose } from './compose-context'
import { parseRecipients, validRecipients } from './schedule'
import { SendLater } from './send-later'

const AUTOSAVE_MS = 1000

const isValid = (recipient: string) => validRecipients([recipient])

export const ComposeForm = ({
  draft,
  onDone,
}: {
  draft: Draft
  onDone: () => void
}) => {
  const t = useT()
  const hasAgent = useHasAgent()
  const withAgent = useWithAgent()
  const { openCompose, send } = useCompose()
  const editorRef = useRef<ComposerEditorHandle>(null)
  const [to, setTo] = useState(draft.to.join(', '))
  const [cc, setCc] = useState(draft.cc.join(', '))
  const [showCc, setShowCc] = useState(draft.cc.length > 0)
  const [subject, setSubject] = useState(draft.subject)
  const [remindAfterDays, setRemindAfterDays] = useState(draft.remindAfterDays)
  const [instruction, setInstruction] = useState('')
  const { data: snippets } = useQuery(orpc.snippets.list.queryOptions())
  const { data: mailboxes = [] } = useQuery(orpc.mailboxes.list.queryOptions())
  const [mailboxId, setMailboxId] = useState(draft.mailboxId)

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
      !mail.subject.trim() && mail.to.length === 0 && !mail.text.trim()
    const persist = async () => {
      if (isBlank && !gmailDraft.current) {
        return
      }
      gmailDraft.current = await client.mail.saveDraft({
        ...mail,
        ...(gmailDraft.current && { draft: gmailDraft.current }),
      })
      setIsSaved(true)
      void queryClient.invalidateQueries({ queryKey: orpc.mail.drafts.key() })
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
    }
  }
  const discard = () => {
    isLeaving.current = true
    if (![to, cc, subject, body.current.text].some((text) => text.trim())) {
      onDone()
      void saving.current.then(removeDraft)
      return
    }
    const kept = {
      ...draft,
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
  useEffect(() => {
    if (isReply) {
      editorRef.current?.focus()
    }
  }, [isReply])
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
    <div className="flex flex-col gap-3">
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
        <Input
          value={to}
          onChange={(event) => {
            setTo(event.target.value)
            edit()
          }}
          placeholder={t.compose.to}
          aria-label={t.compose.to}
          data-mask
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
        <Input
          value={cc}
          onChange={(event) => {
            setCc(event.target.value)
            edit()
          }}
          placeholder={t.compose.cc}
          aria-label={t.compose.cc}
          data-mask
        />
      )}
      {!isReply && (
        <Input
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
      {draft.replyToMessageId && (
        <div className="flex items-center gap-2">
          <Input
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder={t.compose.instructionPlaceholder}
            aria-label={t.compose.instructionPlaceholder}
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={writeDraft.isPending}
            onClick={() =>
              withAgent(
                'drafts',
                () =>
                  draft.replyToMessageId &&
                  writeDraft.mutate(
                    {
                      messageId: draft.replyToMessageId,
                      ...(instruction.trim() && {
                        instruction: instruction.trim(),
                      }),
                    },
                    { onSuccess: fillEditor }
                  )
              )
            }
          >
            {writeDraft.isPending ? t.compose.writing : t.compose.writeForMe}
          </Button>
        </div>
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
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => submit()}>
          {t.compose.send} <Kbd>⌘⏎</Kbd>
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
        <span className="text-muted-foreground ml-auto min-w-0 truncate text-xs">
          {isSaved && t.compose.draftSaved}
        </span>
        <Button size="sm" variant="ghost-muted" onClick={discard}>
          {t.compose.discard}
        </Button>
      </div>
    </div>
  )
}
