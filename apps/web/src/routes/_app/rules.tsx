import type { RouterOutputs } from '@fewmail/api/router'
import type { RuleEffect, SimpleMatchField } from '@fewmail/shared/agent'
import {
  GMAIL_EFFECTS,
  RULE_EFFECTS,
  SIMPLE_MATCH_FIELDS,
} from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
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
import { Switch } from '@fewmail/ui/components/switch'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'
import { useEffect, useRef, useState } from 'react'

import { useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'

type Rule = RouterOutputs['rules']['list'][number]
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
      <SelectTrigger aria-label={t.rules.whatAgentDoes} className="w-40">
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

const useInvalidateRules = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: orpc.rules.key() })
}

const RuleRow = ({ rule }: { rule: Rule }) => {
  const t = useT()
  const invalidate = useInvalidateRules()
  const update = useMutation(
    orpc.rules.update.mutationOptions({ onSuccess: invalidate })
  )
  const remove = useMutation(
    orpc.rules.delete.mutationOptions({ onSuccess: invalidate })
  )

  return (
    <SettingsRow
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
        <Button
          size="sm"
          variant="ghost-destructive"
          onClick={() => remove.mutate({ id: rule.id })}
        >
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
  const invalidate = useInvalidateRules()
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
  const submit = () =>
    instruction.trim().length > 2 &&
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
          disabled={create.isPending}
          onClick={submit}
        >
          {t.rules.add} <Kbd>⏎</Kbd>
        </Button>
      </div>
    </div>
  )
}

const SimpleRuleForm = () => {
  const t = useT()
  const invalidate = useInvalidateRules()
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
  const submit = () =>
    (!needsValue || value.trim()) &&
    create.mutate({ effect, match: { field, value: value.trim() } })

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
      <Button className="ml-auto" disabled={create.isPending} onClick={submit}>
        {t.rules.add} <Kbd>⏎</Kbd>
      </Button>
    </div>
  )
}

const RulesPage = () => {
  const t = useT()
  const hasAgent = useHasAgent()
  const { data: rules = [] } = useQuery(orpc.rules.list.queryOptions())

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
        <header className="flex flex-col gap-3">
          <h1 className="text-display font-serif tracking-tight">
            {t.rules.title}
          </h1>
          <p className="text-brief text-foreground/85 font-serif">
            {hasAgent ? t.rules.lead : t.rules.leadFree}
          </p>
        </header>

        <SettingsGroup title={t.rules.newTitle}>
          <AgentRuleForm />
          {!hasAgent && <SimpleRuleForm />}
        </SettingsGroup>

        {rules.length > 0 && (
          <SettingsGroup title={t.rules.count(rules.length)}>
            {rules.map((rule) => (
              <RuleRow key={rule.id} rule={rule} />
            ))}
          </SettingsGroup>
        )}
      </div>
    </main>
  )
}

export const Route = createFileRoute('/_app/rules')({
  component: RulesPage,
  validateSearch: type({ 'new?': 'boolean' }),
})
