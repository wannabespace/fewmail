import type { RouterOutputs } from '@fewmail/api/router'
import { PROPOSAL_KINDS } from '@fewmail/shared/agent'
import type { ProposalKind } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { confirm } from '~/components/confirm-dialog'
import { ExpandTrigger, expandRow } from '~/components/expand-row'
import { HomeCard, PageHeading } from '~/components/home-card'
import type { QueueItem } from '~/components/queue-card'
import { SenderAvatar } from '~/components/sender-avatar'
import { queueCards } from '~/lib/home-db'
import { useT } from '~/lib/i18n'
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
  // Not before the refetch lands, or settled rows flash back for a moment.
  const show = (items: Proposal[]) =>
    setGoneIds((current) =>
      current.filter((id) => !items.some((item) => item.id === id))
    )
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
      return {
        done: (approved?.approved ?? 0) + (tidied?.settled ?? 0),
        failed: tidied?.failed ?? 0,
      }
    },
    meta: { event: 'proposals_approved' },
    onError: () => toast.dismiss(PROPOSALS_TOAST),
    onMutate: (items) => {
      hide(items)
      toast.loading(t.today.tidy.running, { id: PROPOSALS_TOAST })
    },
    onSettled: (_data, _error, items) => refetchMail().then(() => show(items)),
    onSuccess: ({ done, failed }, items) => {
      if (failed > 0) {
        toast.error(t.today.tidy.failed(t.cleanup.emails(failed)), {
          id: done === 0 ? PROPOSALS_TOAST : undefined,
        })
        if (done === 0) {
          return
        }
      }
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
    meta: { event: 'proposal_kept' },
    onMutate: hide,
    onSettled: (_data, _error, items) => refetch().then(() => show(items)),
  })
  // The card leaves once none is left, and whatever rises under the pointer must not take its click.
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

type Proposals = ReturnType<typeof useProposals>

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

/**
 * Heads Home's decisions: every email the agent proposes to move as one card, approved in one yes (T, or ⏎ on it) or
 * looked at one by one in the review it opens (a click, D); it folds away once settled.
 */
export const ProposalsGroup = ({
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
    rows.length > 0 && (
      <HomeCard
        heading={t.today.quick}
        isActive={isSelected}
        lead={`${t.today.tidy.total(rows.length)}: ${kindsLine(t, rows)}.`}
        page="tidy"
        rows={rows.flatMap(({ id, message }) =>
          message ? [{ id, sender: message, text: message.subject }] : []
        )}
        actions={
          <Button
            size="sm"
            onClick={() => proposals.approve(rows)}
            shortcut={<Kbd>{isSelected ? '⏎' : 'T'}</Kbd>}
          >
            {t.today.tidy.run}
          </Button>
        }
      />
    )
  )
}

/** Every proposal by what it would do: ⏎ approves the cursor's, S keeps the email as it is. */
export const ProposalsReview = ({
  canUseKeys,
  onClose,
  proposals,
}: {
  canUseKeys: boolean
  onClose: () => void
  proposals: Proposals
}) => {
  const t = useT()
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState<number | null>(null)
  const groups = byKind(proposals.proposals)
  const rows = groups.flatMap(({ rows: group }) => group)
  // The cursor keeps its place as rows leave: the next one slides under it.
  const current = cursor === null ? -1 : Math.min(cursor, rows.length - 1)
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
  const listKeys = { enabled: canUseKeys && rows.length > 0 }
  const keys = { enabled: canUseKeys && !!selected }
  useHotkey('J', () => move(1), listKeys)
  useHotkey('ArrowDown', () => move(1), listKeys)
  useHotkey('K', () => move(-1), listKeys)
  useHotkey('ArrowUp', () => move(-1), listKeys)
  useHotkey('Enter', () => selected && proposals.approve([selected]), keys)
  useHotkey('S', () => selected && proposals.keep(selected), keys)
  useHotkey('T', () => proposals.approve(rows), listKeys)
  useHotkey(
    'O',
    () =>
      selected?.message &&
      expandRow(selected.id, {
        from: 'home',
        threadId: selected.message.threadId,
      }),
    { enabled: keys.enabled && !!selected?.message }
  )

  return (
    <>
      <PageHeading
        title={t.today.tidy.reviewTitle}
        onClose={onClose}
        actions={
          <Button
            size="sm"
            disabled={rows.length === 0}
            onClick={() => proposals.approve(rows)}
            shortcut={<Kbd>T</Kbd>}
          >
            {t.today.tidy.run}
          </Button>
        }
      >
        <p className="text-brief text-foreground/80 font-serif">
          {t.today.tidy.reviewLead}
        </p>
      </PageHeading>
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
                  trigger={
                    message ? (
                      <ExpandTrigger
                        email={{ from: 'home', threadId: message.threadId }}
                        rowId={proposal.id}
                      />
                    ) : undefined
                  }
                  iconVariant="avatar"
                  icon={message && <SenderAvatar sender={message} size="sm" />}
                  title={
                    message ? (
                      <span data-mask>
                        {message.fromName ?? message.fromEmail}
                      </span>
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
