import { FOLLOWUP_DAYS } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'

import type { ComposerEditorHandle } from '../composer/composer-editor'
import { ComposerEditor } from '../composer/composer-editor'
import type { Draft } from './compose-context'
import { useCompose } from './compose-context'
import type { LaterPreset } from './schedule'
import { LATER_PRESETS, parseRecipients, validRecipients } from './schedule'

const LATER_OPTIONS: LaterPreset[] = ['inHour', 'tomorrow', 'monday']

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
  const { send } = useCompose()
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
  const closeDraft = (message?: string) => {
    if (message) {
      toast.success(message)
    }
    void queryClient.invalidateQueries({ queryKey: orpc.mail.drafts.key() })
    onDone()
  }
  const saveDraft = useMutation(
    orpc.mail.saveDraft.mutationOptions({
      onSuccess: () => closeDraft(t.compose.draftSaved),
    })
  )
  const deleteDraft = useMutation(
    orpc.mail.deleteDraft.mutationOptions({ onSuccess: () => closeDraft() })
  )
  const fillEditor = ({ html }: { html: string }) => {
    editorRef.current?.setContent(html)
    editorRef.current?.focus()
  }

  const isReply = draft.mode === 'reply'
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
    send({
      ...draft,
      cc: copies,
      html: editor.getHtml(),
      mailboxId,
      remindAfterDays,
      sendAt,
      subject,
      text: editor.getText(),
      to: recipients,
    })
    onDone()
  }

  const save = () => {
    const editor = editorRef.current
    if (!editor) {
      return
    }
    saveDraft.mutate({
      cc: parseRecipients(cc).filter(isValid),
      ...(draft.gmailDraft && { draft: draft.gmailDraft }),
      html: editor.getHtml(),
      ...(mailboxId && { mailboxId }),
      mode: draft.mode,
      ...(draft.replyToMessageId && {
        replyToMessageId: draft.replyToMessageId,
      }),
      subject,
      text: editor.getText(),
      to: parseRecipients(to).filter(isValid),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {!draft.replyToMessageId && mailboxes.length > 1 && (
        <Select
          items={mailboxes.map(({ email, id }) => ({
            label: email,
            value: id,
          }))}
          value={mailboxId ?? mailboxes.find(({ signIn }) => signIn)?.id}
          onValueChange={(next) => next && setMailboxId(next)}
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
          onChange={(event) => setTo(event.target.value)}
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
          onChange={(event) => setCc(event.target.value)}
          placeholder={t.compose.cc}
          aria-label={t.compose.cc}
          data-mask
        />
      )}
      {!isReply && (
        <Input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder={t.compose.subject}
          aria-label={t.compose.subject}
          data-mask
        />
      )}
      {hasAgent && draft.replyToMessageId && (
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
        onSubmit={() => submit()}
        onEscape={onDone}
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
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => submit()}>
          {t.compose.send} <Kbd>⌘⏎</Kbd>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="sm" variant="secondary" />}
          >
            {t.compose.sendLater}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {LATER_OPTIONS.map((preset) => (
              <DropdownMenuItem
                key={preset}
                onClick={() => submit(LATER_PRESETS[preset]())}
              >
                {t.compose.later[preset]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="sm" variant="ghost-muted" />}
          >
            {remindAfterDays
              ? t.compose.remind.days(remindAfterDays)
              : t.compose.remind.label}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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
        <Button
          size="sm"
          variant="ghost-muted"
          className="ml-auto"
          disabled={saveDraft.isPending}
          onClick={save}
        >
          {t.compose.saveDraft}
        </Button>
        <Button
          size="sm"
          variant="ghost-muted"
          disabled={deleteDraft.isPending}
          onClick={() =>
            draft.gmailDraft ? deleteDraft.mutate(draft.gmailDraft) : onDone()
          }
        >
          {t.compose.discard}
        </Button>
      </div>
    </div>
  )
}
