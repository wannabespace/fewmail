import type { RouterOutputs } from '@fewmail/api/router'
import { PROPOSAL_KINDS } from '@fewmail/shared/agent'
import type { ProposalKind } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@fewmail/ui/components/accordion'
import { Button } from '@fewmail/ui/components/button'
import { MotionCollapse } from '@fewmail/ui/components/collapse.motion'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Item } from '@fewmail/ui/components/item'
import { Kbd } from '@fewmail/ui/components/kbd'
import { ScrollArea } from '@fewmail/ui/components/scroll-area'
import { cn } from '@fewmail/ui/lib/utils'
import { SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import { confirm } from '~/components/confirm-dialog'
import type { QueueItem } from '~/components/queue-card'
import { ThreadLink } from '~/components/thread-link'
import { queueCards } from '~/lib/home-db'
import { useT } from '~/lib/i18n'
import { warmThread } from '~/lib/mail-db'
import { client, orpc } from '~/lib/orpc'
import { toastUndo } from '~/lib/undo'

type Today = RouterOutputs['today']['get']

export const isProposal = ({ action }: QueueItem) =>
  (PROPOSAL_KINDS as readonly string[]).includes(action.kind)

interface Proposal {
  /** The card's action id, or the email's id for quiet mail to tidy. */
  id: string
  isCard: boolean
  kind: ProposalKind
  message: Pick<
    Today['tidy'][number]['message'],
    'fromEmail' | 'fromName' | 'id' | 'subject' | 'threadId'
  > | null
  why: string
}

const fromCard = ({ action, analysis, message }: QueueItem): Proposal => ({
  id: action.id,
  isCard: true,
  kind: action.kind as ProposalKind,
  message,
  why: action.reason || analysis?.summary || '',
})

const fromTidy = ({ analysis, message }: Today['tidy'][number]): Proposal => ({
  id: message.id,
  isCard: false,
  kind: analysis.suggestedAction,
  message,
  why: analysis.reason || analysis.summary,
})

const split = (items: Proposal[]) => ({
  cardIds: items.filter(({ isCard }) => isCard).map(({ id }) => id),
  messageIds: items.filter(({ isCard }) => !isCard).map(({ id }) => id),
})

const PROPOSALS_TOAST = 'proposals'

/** Archived mail comes back and a read mark comes off; a list left, spam and the trash do not. */
const undoOf = ({ kind, message }: Proposal) => {
  if (!message) {
    return []
  }
  if (kind === 'archive') {
    return [() => client.mail.moveToInbox({ messageId: message.id })]
  }
  if (kind === 'mark_read') {
    return [() => client.mail.markUnread({ threadId: message.threadId })]
  }
  return []
}

/** What the agent proposes to do with mail on its own: nothing changes in Gmail until the user approves it, all at once or one by one. */
export const useProposals = (
  today: Today | undefined,
  cards: QueueItem[],
  onSettle: () => void
) => {
  const t = useT()
  const queryClient = useQueryClient()
  // A refetch that lands while the next approval still runs would bring its row back under the cursor.
  const [goneIds, setGoneIds] = useState<string[]>([])
  const proposals = [
    ...cards.filter(isProposal).map(fromCard),
    ...(today?.tidy ?? []).map(fromTidy),
  ].filter(({ id }) => !goneIds.includes(id))
  const hide = (items: Proposal[]) => {
    setGoneIds((current) => [...current, ...items.map(({ id }) => id)])
    const { cardIds } = split(items)
    if (cardIds.length > 0) {
      queueCards.utils.writeDelete(cardIds)
    }
  }
  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: orpc.today.key() })
  const refetchMail = () =>
    Promise.all([
      refetch(),
      queryClient.invalidateQueries({ queryKey: orpc.mail.key() }),
    ])
  const run = useMutation({
    mutationFn: async (items: Proposal[]) => {
      const { cardIds, messageIds } = split(items)
      const [approved, tidied] = await Promise.all([
        cardIds.length > 0
          ? client.actions.approveMany({ ids: cardIds })
          : null,
        messageIds.length > 0 ? client.today.tidy({ messageIds }) : null,
      ])
      return (approved?.approved ?? 0) + (tidied?.settled ?? 0)
    },
    onError: () => toast.dismiss(PROPOSALS_TOAST),
    onMutate: (items) => {
      hide(items)
      toast.loading(t.today.tidy.running, { id: PROPOSALS_TOAST })
    },
    onSettled: refetchMail,
    onSuccess: (done, items) => {
      const undos = items.flatMap(undoOf)
      if (undos.length === 0) {
        toast.success(t.today.tidy.done(done), { id: PROPOSALS_TOAST })
        return
      }
      toastUndo(
        t.today.tidy.done(done),
        () => Promise.all(undos.map((undo) => undo())).finally(refetchMail),
        PROPOSALS_TOAST
      )
    },
  })
  const keepThem = useMutation({
    mutationFn: (items: Proposal[]) => {
      const { cardIds, messageIds } = split(items)
      return Promise.all([
        ...cardIds.map((id) => client.actions.dismiss({ id })),
        messageIds.length > 0 ? client.today.keep({ messageIds }) : null,
      ])
    },
    onMutate: hide,
    onSettled: refetch,
  })
  // All of it is one decision on Home: it is settled once none is left.
  const settleIfLast = (count: number) =>
    count === proposals.length && onSettle()
  const approve = (items: Proposal[]) => {
    const approveThem = () => {
      settleIfLast(items.length)
      run.mutate(items)
    }
    if (!items.some(({ kind }) => kind === 'unsubscribe')) {
      approveThem()
      return
    }
    confirm({
      action: t.actionKind.unsubscribe,
      description: t.today.tidy.unsubscribeHint,
      onConfirm: approveThem,
      title: t.today.tidy.confirm(t.cleanup.emails(items.length)),
      variant: 'warning',
    })
  }
  const keep = (item: Proposal) => {
    settleIfLast(1)
    keepThem.mutate([item])
  }
  return { approve, isLoaded: !!today, keep, proposals }
}

export type Proposals = ReturnType<typeof useProposals>

const byKind = (proposals: Proposal[]) =>
  PROPOSAL_KINDS.map((kind) => ({
    kind,
    rows: proposals.filter((proposal) => proposal.kind === kind),
  })).filter(({ rows }) => rows.length > 0)

const kindsLine = (t: Messages, proposals: Proposal[]) =>
  byKind(proposals)
    .map(({ kind, rows }) => t.today.tidy[kind](rows.length))
    .join(' · ')

export const PROPOSALS_ID = 'proposals'

/** The first stop of Home's decisions: every email the agent proposes to move, in a scroller of its own, approved in one yes (⏎ or T) or looked at one by one (D). */
const ProposalsQueueCard = ({
  canUseKeys,
  isSelected,
  proposals,
}: {
  canUseKeys: boolean
  isSelected: boolean
  proposals: Proposals
}) => {
  const t = useT()
  const rows = proposals.proposals
  useHotkey('T', () => proposals.approve(rows), {
    enabled: canUseKeys && rows.length > 0,
  })

  return (
    <AccordionItem value={PROPOSALS_ID} className="group">
      <AccordionTrigger
        trailing={
          !isSelected && (
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              {t.today.tidy.run}
            </span>
          )
        }
      >
        <span
          className={cn(
            'flex size-5.5 shrink-0 items-center justify-center rounded-md',
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-foreground/70'
          )}
        >
          <HugeiconsIcon
            icon={SparklesIcon}
            strokeWidth={2}
            className="size-3.5"
          />
        </span>
        <strong className="truncate font-semibold">
          {t.today.tidy.total(rows.length)}
        </strong>
        {!isSelected && (
          <span className="text-muted-foreground min-w-0 flex-1 truncate first-letter:uppercase">
            {kindsLine(t, rows)}
          </span>
        )}
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-3 pl-8.5">
          <ScrollArea viewportClassName="scroll-fade max-h-60">
            <div className="flex flex-col gap-3">
              {byKind(rows).map(({ kind, rows: group }) => (
                <div key={kind} className="flex flex-col gap-1">
                  <h4 className="text-muted-foreground text-xs font-medium first-letter:uppercase">
                    {t.today.tidy[kind](group.length)}
                  </h4>
                  <ul className="flex flex-col">
                    {group.map(({ id, message }) => (
                      <li key={id}>
                        {message ? (
                          <Item
                            size="xs"
                            className="-mx-2.5 flex-nowrap"
                            render={
                              <Link
                                to="/mail/$threadId"
                                params={{ threadId: message.threadId }}
                                onPointerEnter={() => {
                                  void warmThread(message.threadId)
                                }}
                              />
                            }
                          >
                            <span data-mask className="shrink-0 font-medium">
                              {message.fromName ?? message.fromEmail}
                            </span>
                            <span
                              data-mask
                              className="text-muted-foreground min-w-0 truncate"
                            >
                              {message.subject}
                            </span>
                          </Item>
                        ) : (
                          t.actionKind[kind]
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>
          <p className="text-muted-foreground text-sm">
            {t.today.tidy.untilYouApprove}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => proposals.approve(rows)}
              shortcut={<Kbd>⏎</Kbd>}
            >
              {t.today.tidy.run}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              render={
                <Link
                  to="/home"
                  search={(prev) => ({ ...prev, page: 'tidy' })}
                />
              }
              shortcut={<Kbd>D</Kbd>}
            >
              {t.today.tidy.review}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

const GroupLabel = ({ children }: { children: ReactNode }) => (
  <h3 className="text-muted-foreground text-xs font-medium">{children}</h3>
)

/** Heads Home's decisions: the proposals card, labelled apart from the cards only when there are both, folding away once settled. */
export const ProposalsGroup = ({
  canUseKeys,
  cursorId,
  hasCards,
  onSelect,
  proposals,
}: {
  canUseKeys: boolean
  cursorId: string | undefined
  hasCards: boolean
  onSelect: (id: string) => void
  proposals: Proposals
}) => {
  const t = useT()

  return (
    <AnimatePresence initial={false}>
      {proposals.proposals.length > 0 && (
        // The collapse clips, so it bleeds out like the cards (cardsBleedClassName) and pads back in, or it cuts the card's sides off.
        <MotionCollapse key={PROPOSALS_ID} className="-mx-4.75">
          <div className="flex flex-col gap-2.5 px-4.75">
            {hasCards && <GroupLabel>{t.today.quick}</GroupLabel>}
            <Accordion
              variant="cards"
              value={cursorId ? [cursorId] : []}
              onValueChange={([id]) => id && onSelect(id)}
            >
              <ProposalsQueueCard
                canUseKeys={canUseKeys}
                isSelected={cursorId === PROPOSALS_ID}
                proposals={proposals}
              />
            </Accordion>
            {hasCards && <GroupLabel>{t.today.needsLook}</GroupLabel>}
          </div>
        </MotionCollapse>
      )}
    </AnimatePresence>
  )
}

/** Every proposal by what it would do: ⏎ approves the cursor's, S keeps the email as it is. */
export const ProposalsReview = ({
  canUseKeys,
  proposals,
}: {
  canUseKeys: boolean
  proposals: Proposals
}) => {
  const t = useT()
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState(0)
  const groups = byKind(proposals.proposals)
  const rows = groups.flatMap(({ rows: group }) => group)
  // The cursor keeps its place as rows leave: the next one slides under it.
  const current = Math.min(cursor, rows.length - 1)
  const selected = rows[current]

  useEffect(() => {
    const row = listRef.current?.querySelectorAll('[data-slot="item"]')[current]
    row?.scrollIntoView({ block: 'nearest' })
  }, [current])

  const isDone = proposals.isLoaded && rows.length === 0
  useEffect(() => {
    if (isDone) {
      void navigate({
        search: (prev) => ({ ...prev, page: undefined }),
        to: '/home',
      })
    }
  }, [isDone, navigate])

  const move = (step: number) =>
    setCursor(Math.max(0, Math.min(rows.length - 1, current + step)))
  const keys = { enabled: canUseKeys && !!selected }
  useHotkey('J', () => move(1), keys)
  useHotkey('ArrowDown', () => move(1), keys)
  useHotkey('K', () => move(-1), keys)
  useHotkey('ArrowUp', () => move(-1), keys)
  useHotkey('Enter', () => selected && proposals.approve([selected]), keys)
  useHotkey('S', () => selected && proposals.keep(selected), keys)
  useHotkey('T', () => proposals.approve(rows), keys)
  useHotkey(
    'O',
    () =>
      selected?.message &&
      navigate({
        params: { threadId: selected.message.threadId },
        to: '/mail/$threadId',
      }),
    keys
  )

  return (
    <>
      <header className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-display font-serif tracking-tight">
            {t.today.tidy.reviewTitle}
          </h1>
          <Button
            size="sm"
            disabled={rows.length === 0}
            onClick={() => proposals.approve(rows)}
            shortcut={<Kbd>T</Kbd>}
          >
            {t.today.tidy.run}
          </Button>
        </div>
        <p className="text-brief text-foreground/80 font-serif">
          {t.today.tidy.reviewLead}
        </p>
      </header>
      <div ref={listRef} className="flex flex-col gap-8">
        {groups.map(({ kind, rows: group }) => (
          <SettingsGroup
            key={kind}
            title={
              <span className="inline-block first-letter:uppercase">
                {t.today.tidy[kind](group.length)}
              </span>
            }
          >
            {group.map((proposal) => {
              const isActive = proposal === selected
              const { message } = proposal
              return (
                <SettingsRow
                  key={proposal.id}
                  active={isActive}
                  title={
                    message ? (
                      <ThreadLink
                        threadId={message.threadId}
                        text={message.fromName ?? message.fromEmail}
                      />
                    ) : (
                      t.actionKind[kind]
                    )
                  }
                  description={
                    <span data-mask>
                      {[message?.subject, proposal.why]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  }
                >
                  <Button
                    size="sm"
                    variant="ghost-muted"
                    onClick={() => proposals.keep(proposal)}
                    shortcut={isActive ? <Kbd>S</Kbd> : undefined}
                  >
                    {t.today.tidy.keep}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => proposals.approve([proposal])}
                    shortcut={isActive ? <Kbd>⏎</Kbd> : undefined}
                  >
                    {t.actionKind[kind]}
                  </Button>
                </SettingsRow>
              )
            })}
          </SettingsGroup>
        ))}
      </div>
    </>
  )
}
