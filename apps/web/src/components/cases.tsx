import type { RouterOutputs } from '@fewmail/api/router'
import { hostOf } from '@fewmail/shared/agent'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@fewmail/ui/components/alert'
import { Button } from '@fewmail/ui/components/button'
import { Checkbox } from '@fewmail/ui/components/checkbox'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Spinner } from '@fewmail/ui/components/spinner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'

import { useDates, useT } from '~/lib/i18n'
import { useHasAgent } from '~/lib/me'
import { orpc } from '~/lib/orpc'

type Case = RouterOutputs['cases']['list'][number]
type Item = Case['items'][number]

const doneOf = (items: Item[]) =>
  items.filter(({ state }) => state === 'done').length

/** What a case's progress reads as: done items of all, then its deadline. */
export const useCaseFacts = () => {
  const t = useT()
  const dates = useDates()
  return ({ dueAt, items }: Pick<Case, 'dueAt' | 'items'>) =>
    [
      t.cases.progress(doneOf(items), items.length),
      dueAt && t.cases.dueBy(dates.format(new Date(dueAt), 'd MMM')),
    ]
      .filter(Boolean)
      .join(' · ')
}

/** Accepting a proposal is setting it active; declining is dropping it, so it is never offered again. */
export const useCaseStatus = () => {
  const t = useT()
  return useMutation(
    orpc.cases.setStatus.mutationOptions({
      onSuccess: (_, { status }) => {
        if (status === 'active') {
          toast.success(t.cases.accepted)
        }
        if (status === 'dropped') {
          toast.success(t.cases.declined)
        }
      },
    })
  )
}

const ProposalActions = ({ caseId }: { caseId: string }) => {
  const t = useT()
  const setStatus = useCaseStatus()
  return (
    <>
      <Button
        size="sm"
        variant="ghost-muted"
        disabled={setStatus.isPending}
        onClick={() => setStatus.mutate({ id: caseId, status: 'dropped' })}
      >
        {t.cases.decline}
      </Button>
      <Button
        size="sm"
        disabled={setStatus.isPending}
        onClick={() => setStatus.mutate({ id: caseId, status: 'active' })}
      >
        {t.cases.accept}
      </Button>
    </>
  )
}

/** Home's cases: proposals first with their yes and no, then the running ones, each opening its page. */
export const CasesSection = () => {
  const t = useT()
  const facts = useCaseFacts()
  const hasAgent = useHasAgent()
  const { data: open = [] } = useQuery({
    ...orpc.cases.list.queryOptions(),
    enabled: hasAgent,
  })
  if (open.length === 0) {
    return null
  }
  return (
    <SettingsGroup title={t.cases.title}>
      {open.map((found) =>
        found.status === 'proposed' ? (
          <SettingsRow
            key={found.id}
            title={
              <span data-mask>
                {t.cases.proposed}: {found.title}
              </span>
            }
            description={<span data-mask>{found.goal}</span>}
          >
            <ProposalActions caseId={found.id} />
          </SettingsRow>
        ) : (
          <SettingsRow
            key={found.id}
            render={<Link to="/cases/$caseId" params={{ caseId: found.id }} />}
            title={<span data-mask>{found.title}</span>}
            description={
              <span data-mask>
                {found.next ??
                  (found.plannedAt ? found.goal : t.cases.planning)}
              </span>
            }
          >
            <span className="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
              {facts(found)}
            </span>
          </SettingsRow>
        )
      )}
    </SettingsGroup>
  )
}

/** Over a thread: the case it may start, asked right where the email is read, or the case it belongs to. */
export const CaseBanner = ({ threadId }: { threadId: string }) => {
  const t = useT()
  const facts = useCaseFacts()
  const hasAgent = useHasAgent()
  const { data: found } = useQuery({
    ...orpc.cases.forThread.queryOptions({ input: { threadId } }),
    enabled: hasAgent,
  })
  if (!found) {
    return null
  }
  if (found.status === 'proposed') {
    return (
      <Alert>
        <AlertTitle data-mask>
          {t.cases.proposed}: {found.title}
        </AlertTitle>
        <AlertDescription>
          <span data-mask>{found.goal}</span>
          <ul className="mt-1 list-disc pl-4" data-mask>
            {found.items.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </AlertDescription>
        <AlertAction>
          <ProposalActions caseId={found.id} />
        </AlertAction>
      </Alert>
    )
  }
  return (
    <Alert>
      <AlertTitle data-mask>{t.cases.partOf(found.title)}</AlertTitle>
      <AlertDescription>
        <span data-mask>{found.next ?? t.cases.planning}</span> · {facts(found)}
      </AlertDescription>
      <AlertAction>
        <Button
          size="sm"
          variant="ghost-muted"
          render={<Link to="/cases/$caseId" params={{ caseId: found.id }} />}
        >
          {t.cases.open}
        </Button>
      </AlertAction>
    </Alert>
  )
}

const ItemSource = ({ item }: { item: Item }) => {
  const t = useT()
  const { source } = item
  if (source?.url) {
    return (
      <Button
        size="xs"
        variant="link-muted"
        className="self-start"
        render={
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            aria-label={hostOf(source.url)}
          />
        }
      >
        {t.cases.fromWeb} · {hostOf(source.url)}
      </Button>
    )
  }
  return (
    source?.file && (
      <span className="text-muted-foreground text-xs" data-mask>
        {source.file.filename}
      </span>
    )
  )
}

/** Each thing the case needs, ticked by the user or by a proof in the mail; where it came from under it. */
export const CaseChecklist = ({ items }: { items: Item[] }) => {
  const t = useT()
  const setItem = useMutation(orpc.cases.setItem.mutationOptions())
  return (
    <SettingsGroup title={t.cases.needed}>
      {items.map((item) => (
        <SettingsRow
          key={item.id}
          htmlFor={`case-item-${item.id}`}
          title={<span data-mask>{item.text}</span>}
          description={
            <span className="flex flex-col gap-0.5">
              <span>
                {t.cases.state[item.state]}
                {item.proof && (
                  <span data-mask>
                    {' · '}
                    {item.proof}
                  </span>
                )}
              </span>
              <ItemSource item={item} />
            </span>
          }
        >
          <Checkbox
            id={`case-item-${item.id}`}
            checked={item.state === 'done'}
            onCheckedChange={(isDone) =>
              setItem.mutate({ id: item.id, isDone: isDone === true })
            }
          />
        </SettingsRow>
      ))}
    </SettingsGroup>
  )
}

export const CasePlanning = () => {
  const t = useT()
  return (
    <span className="text-muted-foreground flex items-center gap-2 text-sm">
      <Spinner />
      {t.cases.planning}
    </span>
  )
}
