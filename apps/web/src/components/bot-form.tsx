import { BOARD_EFFECT, BOT_PRESETS } from '@fewmail/shared/agent'
import type { MailBotEffect } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@fewmail/ui/components/dialog'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@fewmail/ui/components/field'
import { Input } from '@fewmail/ui/components/input'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Switch } from '@fewmail/ui/components/switch'
import { Textarea } from '@fewmail/ui/components/textarea'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { createDebouncedFn } from 'seitu'
import { toast } from 'sonner'

import { refreshBots } from '~/components/bot-chat'
import type { OwnBot } from '~/components/bot-list'
import { confirm } from '~/components/confirm-dialog'
import { botChats, ownBots } from '~/lib/home-db'
import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { queryClient, showUntilSettled, useRanked } from '~/lib/query-client'

interface BotDraft {
  enabled: boolean
  name: string
  /** Which mail is its and what it does with it; a simple bot's keeps its match, so its text only says what it does. */
  text: string
}

const draftOf = (bot: OwnBot | null, t: Messages): BotDraft => ({
  enabled: bot?.enabled ?? true,
  name: bot?.name ?? '',
  text: bot?.match ? t.bots.effect[bot.effect] : (bot?.instruction ?? ''),
})

const READ_PAUSE_MS = 500
const READ_CHARS = 2000

/** Jev reads the text once typing pauses, so saving rarely waits on it; changed words that do not say what to do only collect. */
const useReadEffect = (bot: OwnBot | null, t: Messages) => {
  const afterTyping = useMemo(
    () => createDebouncedFn((run: () => void) => run(), READ_PAUSE_MS),
    []
  )
  // A read still waiting when the form closes would cost a model call nobody saves.
  useEffect(() => afterTyping.cancel, [afterTyping])
  const asked = (value: string) => {
    const words = value.trim()
    return words !== draftOf(bot, t).text.trim() && words.length > 2
      ? { simple: !!bot?.match, text: words.slice(0, READ_CHARS) }
      : null
  }
  const queryOf = (input: NonNullable<ReturnType<typeof asked>>) =>
    orpc.bots.readEffect.queryOptions({
      input,
      staleTime: Number.POSITIVE_INFINITY,
    })
  return {
    readAhead: (text: string) =>
      afterTyping(() => {
        const input = asked(text)
        if (input) {
          void queryClient.prefetchQuery(queryOf(input))
        }
      }),
    /** Saving right after a keystroke reads the words as they stand, never the read from before the pause. */
    read: async (text: string): Promise<MailBotEffect> => {
      const own = bot && bot.effect !== BOARD_EFFECT ? bot.effect : 'collect'
      const latest = asked(text)
      if (!latest) {
        return own
      }
      // A sender's bot only moves mail: collecting is no effect of its, so words Jev cannot read keep what it does.
      return (
        (await queryClient.fetchQuery(queryOf(latest))) ??
        (bot?.match ? own : 'collect')
      )
    },
  }
}

/** The bot's name, which mail is its and what it does with it in one text (a sender's bot keeps its match), and whether it acts alone. */
const BotFields = ({
  draft,
  hasMatch,
  isBoard,
  onChange,
}: {
  draft: BotDraft
  hasMatch: boolean
  /** It takes no mail and moves none: only its name is the user's to change. */
  isBoard: boolean
  onChange: (change: Partial<BotDraft>) => void
}) => {
  const t = useT()
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="bot-name">{t.bots.name}</FieldLabel>
        <Input
          id="bot-name"
          data-mask
          maxLength={60}
          placeholder={t.bots.namePlaceholder}
          value={draft.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </Field>
      {!isBoard && (
        <BotMailFields draft={draft} hasMatch={hasMatch} onChange={onChange} />
      )}
    </FieldGroup>
  )
}

/** Which mail is its and what it does with it, and whether it acts alone. */
const BotMailFields = ({
  draft,
  hasMatch,
  onChange,
}: {
  draft: BotDraft
  hasMatch: boolean
  onChange: (change: Partial<BotDraft>) => void
}) => {
  const t = useT()
  return (
    <>
      <Field>
        <FieldLabel htmlFor="bot-text">
          {hasMatch ? t.bots.whatItDoes : t.bots.instruction}
        </FieldLabel>
        <Textarea
          id="bot-text"
          data-mask
          placeholder={hasMatch ? undefined : t.bots.instructionPlaceholder}
          value={draft.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      </Field>
      <Field orientation="horizontal">
        <Switch
          id="bot-enabled"
          checked={draft.enabled}
          onCheckedChange={(enabled) => onChange({ enabled })}
        />
        <div className="flex flex-col">
          <FieldLabel htmlFor="bot-enabled">{t.bots.enabled}</FieldLabel>
          <FieldDescription>
            {t.bots.enabledHint[draft.enabled ? 'on' : 'off']}
          </FieldDescription>
        </div>
      </Field>
    </>
  )
}

/** New bot's ready-made ones, in the user's language; the Board only while the user has none. */
const BotPresets = ({ onCreated }: { onCreated: (id: string) => void }) => {
  const t = useT()
  const { data: own = [] } = useRanked(ownBots)
  const add = useMutation(
    orpc.bots.addPreset.mutationOptions({
      onSettled: refreshBots,
      onSuccess: ({ id }) => onCreated(id),
    })
  )
  const hasBoard = own.some(({ effect }) => effect === BOARD_EFFECT)
  return (
    <Field>
      <FieldLabel>{t.bots.presets}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {BOT_PRESETS.filter(
          ({ effect }) => effect !== BOARD_EFFECT || !hasBoard
        ).map(({ key }) => (
          <Button
            key={key}
            size="sm"
            variant="secondary"
            disabled={add.isPending}
            onClick={() => add.mutate({ preset: key })}
          >
            {t.starterBots[key].name}
          </Button>
        ))}
      </div>
    </Field>
  )
}

/** The form of a new bot (`bot` null) or one of the user's; mounted afresh each time the dialog opens. */
export const BotForm = ({
  bot,
  onClose,
  onCreated,
}: {
  bot: OwnBot | null
  /** None in the bot's profile, which stays open after a save and never makes a bot. */
  onClose?: () => void
  onCreated?: (id: string) => void
}) => {
  const t = useT()
  const [draft, setDraft] = useState(() => draftOf(bot, t))
  const readEffect = useReadEffect(bot, t)
  const done = (message: string) => {
    toast.success(message)
    onClose?.()
  }
  const create = useMutation(
    orpc.bots.create.mutationOptions({
      onSettled: refreshBots,
      onSuccess: ({ id }) => {
        onCreated?.(id)
        done(t.bots.created)
      },
    })
  )
  const update = useMutation(
    orpc.bots.update.mutationOptions({
      onMutate: ({ id, ...change }) => {
        done(t.bots.saved)
        return showUntilSettled(() => {
          if (ownBots.has(id)) {
            ownBots.update(id, (row) => Object.assign(row, change))
          }
        })
      },
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  const remove = useMutation(
    orpc.bots.delete.mutationOptions({
      onMutate: ({ id }) => {
        done(t.bots.deleted)
        return showUntilSettled(() => {
          for (const rows of [ownBots, botChats]) {
            if (rows.has(id)) {
              rows.delete(id)
            }
          }
        })
      },
      onSettled: (_, __, ___, settle) => settle?.(refreshBots()),
    })
  )
  const isBoard = bot?.effect === BOARD_EFFECT
  const canSave =
    !!draft.name.trim() &&
    (isBoard || !!bot?.match || draft.text.trim().length > 2)
  const save = async () => {
    if (bot && isBoard) {
      update.mutate({ id: bot.id, name: draft.name.trim() })
      return
    }
    const fields = {
      effect: await readEffect.read(draft.text),
      enabled: draft.enabled,
      name: draft.name.trim(),
    }
    if (!bot) {
      create.mutate({ ...fields, instruction: draft.text.trim() })
      return
    }
    update.mutate({
      id: bot.id,
      ...fields,
      ...(bot.match ? {} : { instruction: draft.text.trim() }),
    })
  }
  const askToDelete = (own: OwnBot) =>
    confirm({
      action: t.bots.delete,
      description: t.bots.deleteHint,
      onConfirm: () => remove.mutate({ id: own.id }),
      title: t.bots.deleteConfirm(own.name),
      variant: 'destructive',
    })
  return (
    <form
      className="contents"
      onSubmit={(event) => {
        event.preventDefault()
        if (canSave) {
          void save()
        }
      }}
    >
      {!bot && (
        <BotPresets
          onCreated={(id) => {
            onCreated?.(id)
            done(t.bots.created)
          }}
        />
      )}
      <BotFields
        draft={draft}
        hasMatch={!!bot?.match}
        isBoard={isBoard}
        onChange={(change) => {
          if (change.text !== undefined) {
            readEffect.readAhead(change.text)
          }
          setDraft((current) => ({ ...current, ...change }))
        }}
      />
      <DialogFooter>
        {bot && (
          <Button
            variant="ghost-destructive"
            className="mr-auto"
            onClick={() => askToDelete(bot)}
          >
            {t.bots.delete}
          </Button>
        )}
        <Button
          type="submit"
          disabled={!canSave || create.isPending || update.isPending}
          shortcut={<Kbd>⏎</Kbd>}
        >
          {bot ? t.bots.save : t.bots.add}
        </Button>
      </DialogFooter>
    </form>
  )
}

/** A new bot (`bot` null) or one of the user's to change; `editing` stays set through the fade-out (`onClosed` clears it). */
export const BotSettingsDialog = ({
  editing,
  onClose,
  onClosed,
  onCreated,
}: {
  editing: { bot: OwnBot | null; isOpen: boolean } | null
  onClose: () => void
  onClosed: () => void
  onCreated: (id: string) => void
}) => {
  const t = useT()
  return (
    <Dialog
      open={!!editing?.isOpen}
      onOpenChange={(open) => !open && onClose()}
      onOpenChangeComplete={(open) => !open && onClosed()}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing?.bot ? t.bots.edit : t.bots.add}</DialogTitle>
        </DialogHeader>
        {editing && (
          <BotForm
            key={editing.bot?.id ?? 'new'}
            bot={editing.bot}
            onClose={onClose}
            onCreated={onCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
