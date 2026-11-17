import type { RouterOutputs } from '@fewmail/api/router'
import type { RuleEffect, SimpleMatchField } from '@fewmail/shared/agent'
import {
  GMAIL_EFFECTS,
  isGmailEffect,
  RULE_EFFECTS,
  SIMPLE_MATCH_FIELDS,
} from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
  SettingsRows,
} from '@fewmail/ui/components/custom/settings-group'
import { Input } from '@fewmail/ui/components/input'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@fewmail/ui/components/select'
import { Spinner } from '@fewmail/ui/components/spinner'
import { Switch } from '@fewmail/ui/components/switch'
import { cn } from '@fewmail/ui/lib/utils'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod/mini'

import { expandRow, useIsThreadExpanded } from '~/components/expand-row'
import { Journal, useJournal } from '~/components/journal'
import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { client, orpc } from '~/lib/orpc'
import {
  listCollection,
  queryClient,
  showUntilSettled,
  useRanked,
} from '~/lib/query-client'
import { holdClicksUntilMove, STILL_POINTER_GUARD } from '~/lib/still-pointer'
import { toastUndo } from '~/lib/undo'

type Rule = RouterOutputs['rules']['list'][number]

const rulesList = listCollection({
  getKey: ({ id }) => id,
  id: 'rules',
  queryFn: () => client.rules.list(),
  queryKey: orpc.rules.list.key(),
})
type GmailEffect = (typeof GMAIL_EFFECTS)[number]

const ACTS_ON_GMAIL = new Set<RuleEffect>(GMAIL_EFFECTS)

const EffectSelect = <Effect extends RuleEffect>({
  effects,
  onChange,
  value,
}: {
  effects: readonly Effect[]
  onChange: (effect: Effect) => void
  value: Effect
}) => {
  const t = useT()

  return (
    <Select
      items={effects.map((effect) => ({
        label: t.rules.effect[effect],
        value: effect,
      }))}
      value={value}
      onValueChange={(next) => next && onChange(next)}
    >
      <SelectTrigger aria-label={t.rules.whatAgentDoes} className="w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {effects.map((effect) => (
          <SelectItem key={effect} value={effect}>
            {t.rules.effect[effect]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const ruleTitle = (t: Messages, rule: Rule) =>
  rule.match
    ? t.rules.simple.title[rule.match.field](rule.match.value)
    : (rule.instruction ?? '')

const ruleDescription = (t: Messages, rule: Rule) => {
  if (rule.match) {
    return t.rules.simple.appliedAutomatically
  }
  if (ACTS_ON_GMAIL.has(rule.effect)) {
    return t.rules.describe.autonomous
  }
  return rule.effect === 'draft_reply'
    ? t.rules.describe.draft
    : t.rules.describe.alwaysShow
}

const invalidate = () =>
  queryClient.invalidateQueries({ queryKey: orpc.rules.key() })

const restoreRule = (rule: Rule) =>
  rule.match && isGmailEffect(rule.effect)
    ? client.rules.createSimple({ effect: rule.effect, match: rule.match })
    : client.rules.create({
        effect: rule.effect,
        instruction: rule.instruction ?? '',
      })

const RuleRow = ({ isActive, rule }: { isActive: boolean; rule: Rule }) => {
  const t = useT()
  const update = useMutation(
    orpc.rules.update.mutationOptions({
      onMutate: ({ id, ...change }) =>
        showUntilSettled(() => {
          if (rulesList.has(id)) {
            rulesList.update(id, (item) => Object.assign(item, change))
          }
        }),
      onSettled: (_, __, ___, settle) => settle?.(invalidate()),
    })
  )
  const remove = useMutation(
    orpc.rules.delete.mutationOptions({
      onMutate: ({ id }) =>
        showUntilSettled(() => {
          if (rulesList.has(id)) {
            rulesList.delete(id)
          }
        }),
      onSettled: (_, __, ___, settle) => settle?.(invalidate()),
    })
  )
  const deleteRule = () => {
    holdClicksUntilMove()
    remove.mutate({ id: rule.id })
    // The row is gone by now, so the undo cannot be a mutation of its own.
    toastUndo(t.rules.deleted, () => restoreRule(rule).then(invalidate))
  }
  const keys = { enabled: isActive }
  useHotkey(
    'Space',
    () => update.mutate({ enabled: !rule.enabled, id: rule.id }),
    keys
  )
  useHotkey('Backspace', deleteRule, keys)

  return (
    <SettingsRow
      active={isActive}
      title={<span data-mask>{ruleTitle(t, rule)}</span>}
      description={ruleDescription(t, rule)}
    >
      <div className="flex items-center gap-3">
        <EffectSelect
          effects={rule.match ? GMAIL_EFFECTS : RULE_EFFECTS}
          value={rule.effect}
          onChange={(effect) => update.mutate({ effect, id: rule.id })}
        />
        <Switch
          aria-label={t.rules.enabled}
          checked={rule.enabled}
          onCheckedChange={(enabled) => update.mutate({ enabled, id: rule.id })}
        />
        <Button size="sm" variant="ghost-destructive" onClick={deleteRule}>
          {t.rules.delete}
        </Button>
      </div>
    </SettingsRow>
  )
}

const useRuleInput = () => {
  const { new: isNew } = Route.useSearch()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew) {
      inputRef.current?.focus()
    }
  }, [isNew])

  useHotkey('N', () => inputRef.current?.focus())
  useHotkey('Escape', () => inputRef.current?.blur(), {
    ignoreInputs: false,
    target: inputRef,
  })

  return inputRef
}

const AgentRuleForm = () => {
  const t = useT()
  const hasAgent = useHasAgent()
  const inputRef = useRuleInput()
  const [instruction, setInstruction] = useState('')
  const [effect, setEffect] = useState<RuleEffect>('archive')

  const create = useMutation(
    orpc.rules.create.mutationOptions({
      onSuccess: () => {
        setInstruction('')
        void invalidate()
      },
    })
  )
  const canAdd = instruction.trim().length > 2 && !create.isPending
  const submit = () =>
    canAdd &&
    create.mutate({
      effect,
      instruction: instruction.trim(),
    })

  useHotkey('Enter', submit, { ignoreInputs: false, target: inputRef })

  return (
    <div className="flex flex-col gap-3 p-3.5">
      <Input
        ref={inputRef}
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        placeholder={t.rules.placeholder}
        aria-label={t.rules.whichEmails}
      />
      <div className="flex flex-wrap items-center gap-3">
        <EffectSelect
          effects={hasAgent ? RULE_EFFECTS : GMAIL_EFFECTS}
          value={effect}
          onChange={setEffect}
        />
        <Button
          className="ml-auto"
          disabled={!canAdd}
          onClick={submit}
          shortcut={<Kbd>⏎</Kbd>}
        >
          {create.isPending && <Spinner />}
          {t.rules.add}
        </Button>
      </div>
    </div>
  )
}

const SimpleRuleForm = () => {
  const t = useT()
  const inputRef = useRuleInput()
  const [field, setField] = useState<SimpleMatchField>('from')
  const [value, setValue] = useState('')
  const [effect, setEffect] = useState<GmailEffect>('archive')

  const create = useMutation(
    orpc.rules.createSimple.mutationOptions({
      onSuccess: () => {
        setValue('')
        void invalidate()
      },
    })
  )
  const needsValue = field !== 'mailingList'
  const canAdd = (!needsValue || Boolean(value.trim())) && !create.isPending
  const submit = () =>
    canAdd && create.mutate({ effect, match: { field, value: value.trim() } })

  useHotkey('Enter', submit, { ignoreInputs: false, target: inputRef })

  return (
    <div className="flex flex-wrap items-center gap-3 p-3.5">
      <Select
        items={SIMPLE_MATCH_FIELDS.map((option) => ({
          label: t.rules.simple.field[option],
          value: option,
        }))}
        value={field}
        onValueChange={(next) => next && setField(next)}
      >
        <SelectTrigger aria-label={t.rules.simple.whichField} className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SIMPLE_MATCH_FIELDS.map((option) => (
            <SelectItem key={option} value={option}>
              {t.rules.simple.field[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {needsValue && (
        <Input
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t.rules.simple.valuePlaceholder}
          aria-label={t.rules.simple.field[field]}
          className="min-w-48 flex-1"
        />
      )}
      <EffectSelect
        effects={GMAIL_EFFECTS}
        value={effect}
        onChange={setEffect}
      />
      <Button
        className="ml-auto"
        disabled={!canAdd}
        onClick={submit}
        shortcut={<Kbd>⏎</Kbd>}
      >
        {create.isPending && <Spinner />}
        {t.rules.add}
      </Button>
    </div>
  )
}

/**
 * J / K walk the rules, then the journal's emails: space turns the rule under the cursor on or off and ⌫ deletes it,
 * ⏎ opens the email, esc leaves the list. A click on an email puts the cursor on it.
 */
const useRulesCursor = (
  rules: Rule[],
  journal: ReturnType<typeof useJournal>
) => {
  const isFree = !useIsThreadExpanded()
  const [cursor, setCursor] = useState<number | null>(null)
  const emails = journal.rows.filter(({ message }) => message)
  const stops = [
    ...rules.map(({ id }) => id),
    ...emails.map(({ action }) => action.id),
  ]
  const activeId =
    cursor === null ? undefined : stops[Math.min(cursor, stops.length - 1)]
  const entry = emails.find(({ action }) => action.id === activeId)
  const step = (by: number) => {
    // A switch or button still focused from a click would take space and ⏎ as well as the cursor's row.
    ;(document.activeElement as HTMLElement | null)?.blur()
    setCursor((index) =>
      Math.max(0, Math.min(stops.length - 1, (index ?? -1) + by))
    )
  }
  const listKeys = { enabled: isFree && stops.length > 0 }
  useHotkey('J', () => step(1), listKeys)
  useHotkey('ArrowDown', () => step(1), listKeys)
  useHotkey('K', () => step(-1), listKeys)
  useHotkey('ArrowUp', () => step(-1), listKeys)
  useHotkey(
    'Enter',
    () =>
      entry?.message &&
      expandRow(entry.action.id, {
        from: 'journal',
        threadId: entry.message.threadId,
      }),
    { enabled: isFree && !!entry }
  )
  useHotkey('Escape', () => setCursor(null), {
    enabled: isFree && activeId !== undefined,
  })
  return {
    activeId: isFree ? activeId : undefined,
    select: (id: string) => setCursor(stops.indexOf(id)),
  }
}

const RulesPage = () => {
  const t = useT()
  const hasAgent = useHasAgent()
  const { data: rules = [] } = useRanked(rulesList)
  const journal = useJournal()
  const { activeId, select } = useRulesCursor(rules, journal)

  return (
    <motion.main layoutScroll className="under-notice flex-1 overflow-y-auto">
      <div
        className={cn(
          'mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16 max-md:px-4 max-md:pt-6',
          STILL_POINTER_GUARD
        )}
      >
        <header className="flex flex-col gap-3">
          <h1 className="text-display font-serif tracking-tight">
            {t.rules.title}
          </h1>
          <p className="text-brief text-foreground/85 font-serif text-balance">
            {hasAgent ? t.rules.lead : t.rules.leadFree}
          </p>
        </header>

        <SettingsGroup title={t.rules.newTitle}>
          <AgentRuleForm />
          {!hasAgent && <SimpleRuleForm />}
        </SettingsGroup>

        {rules.length > 0 && (
          <SettingsGroup title={t.rules.count(rules.length)}>
            <SettingsRows>
              {rules.map((rule) => (
                <RuleRow
                  key={rule.id}
                  isActive={rule.id === activeId}
                  rule={rule}
                />
              ))}
            </SettingsRows>
          </SettingsGroup>
        )}

        <Journal cursorId={activeId} journal={journal} onSelect={select} />
      </div>
    </motion.main>
  )
}

export const Route = createFileRoute('/_app/rules')({
  component: RulesPage,
  loader: () => rulesList.preload(),
  validateSearch: z.object({ new: z.optional(z.boolean()) }),
})
