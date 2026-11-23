import type { RouterOutputs } from '@fewmail/api/router'
import { botOfCard, PROPOSAL_KINDS } from '@fewmail/shared/agent'
import type { ProposalKind } from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { SettingsRow } from '@fewmail/ui/components/custom/settings-group'
import { Kbd } from '@fewmail/ui/components/kbd'
import { Tool, ToolContent, ToolHeader } from '@fewmail/ui/components/tool'
import { Mail01Icon, NextIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { NowPart } from '~/components/bot-chat'
import { confirm } from '~/components/confirm-dialog'
import { ExpandTrigger, expandRow } from '~/components/expand-row'
import { PaneRows } from '~/components/pane-rows'
import type { QueueItem } from '~/components/queue-card'
import { SenderAvatar } from '~/components/sender-avatar'
import { queueCards, todayLists } from '~/lib/home-db'
import { useT } from '~/lib/i18n'
import { client, orpc } from '~/lib/orpc'
import { showUntilSettled } from '~/lib/query-client'
import { toastUndo } from '~/lib/undo'

type Today = RouterOutputs['today']['get']

export const isProposal = ({ action }: QueueItem) =>
  (PROPOSAL_KINDS as readonly string[]).includes(action.kind)

interface Proposal {
  /** Whose chat it is in. */
  bot: string
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

const fromCard = (card: QueueItem): Proposal => {
  const { action, analysis, message } = card
  return {
    bot: botOfCard(card),
    id: action.id,
    isCard: true,
    kind: action.kind as ProposalKind,
    message,
    why: action.reason || analysis?.summary || '',
  }
}

const fromTidy = ({ analysis, message }: Today['tidy'][number]): Proposal => ({
  bot: analysis.botId ?? 'fewmail',
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

const hide = (items: Proposal[]) => {
  const { cardIds, messageIds } = split(items)
  return showUntilSettled(() => {
    if (cardIds.length > 0) {
      queueCards.delete(cardIds)
    }
    const tidied = messageIds.filter((id) => todayLists.tidy.has(id))
    if (tidied.length > 0) {
      todayLists.tidy.delete(tidied)
    }
  })
}

/** What the agent proposes to do with mail on its own: nothing changes in Gmail until the user approves it, all at once or one by one. */
export const useProposals = (
  today: Today | undefined,
  cards: QueueItem[],
  onSettle: () => void
) => {
  const t = useT()
  const queryClient = useQueryClient()
  const proposals = [
    ...cards.filter(isProposal).map(fromCard),
    ...(today?.tidy ?? []).map(fromTidy),
  ]
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
      toast.loading(t.today.tidy.running, { id: PROPOSALS_TOAST })
      return hide(items)
    },
    onSettled: (_data, _error, _items, settle) => settle?.(refetchMail()),
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
    onSettled: (_data, _error, _items, settle) => settle?.(refetch()),
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
  return { approve, keep, proposals }
}

type Proposals = ReturnType<typeof useProposals>

const byKind = (proposals: Proposal[]) =>
  PROPOSAL_KINDS.map((kind) => ({
    kind,
    rows: proposals.filter((proposal) => proposal.kind === kind),
  })).filter(({ rows }) => rows.length > 0)

const PROPOSALS_SHOWN = 5

/** Every proposal by what it would do, each kind folded to its first few: ⏎ approves the cursor's, S keeps the email as it is. */
export const ProposalsReview = ({
  canUseKeys,
  proposals,
}: {
  canUseKeys: boolean
  proposals: Proposals
}) => {
  const t = useT()
  const [cursor, setCursor] = useState<number | null>(null)
  const [unfolded, setUnfolded] = useState<ProposalKind[]>([])
  const groups = byKind(proposals.proposals).map((group) => ({
    ...group,
    isUnfolded: unfolded.includes(group.kind),
    shown: unfolded.includes(group.kind)
      ? group.rows
      : group.rows.slice(0, PROPOSALS_SHOWN),
  }))
  const all = groups.flatMap(({ rows }) => rows)
  const rows = groups.flatMap(({ shown }) => shown)
  // The cursor keeps its place as rows leave: the next one slides under it.
  const current = cursor === null ? -1 : Math.min(cursor, rows.length - 1)
  const selected = rows[current]
  const toggle = (kind: ProposalKind) =>
    setUnfolded((kinds) =>
      kinds.includes(kind)
        ? kinds.filter((each) => each !== kind)
        : [...kinds, kind]
    )

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
  useHotkey('T', () => proposals.approve(all), listKeys)
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
      <NowPart>
        <p>{t.today.tidy.reviewLead}</p>
        <Button
          size="sm"
          className="self-start"
          onClick={() => proposals.approve(all)}
          shortcut={<Kbd>T</Kbd>}
        >
          {t.today.tidy.run}
          <span className="tabular-nums">{all.length}</span>
        </Button>
      </NowPart>
      <NowPart>
        {groups.map((group) => (
          <Tool key={group.kind} open>
            <ToolHeader
              icon={Mail01Icon}
              isOpenable={false}
              title={
                <>
                  {t.actionKind[group.kind]}
                  <span className="text-muted-foreground ml-1.5 tabular-nums">
                    {group.rows.length}
                  </span>
                </>
              }
              action={
                group.rows.length > PROPOSALS_SHOWN && (
                  <Button
                    size="xs"
                    variant="link-muted"
                    onClick={() => toggle(group.kind)}
                  >
                    {group.isUnfolded
                      ? t.mail.showFewer
                      : t.mail.showAll(group.rows.length)}
                  </Button>
                )
              }
            />
            <ToolContent variant="rows">
              <PaneRows
                listKey={`${group.kind}:${group.isUnfolded}`}
                rowKey={({ id }) => id}
                rows={group.shown}
              >
                {(proposal, place) => {
                  const isActive = proposal === selected
                  const { message } = proposal
                  return (
                    <SettingsRow
                      {...place}
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
                      icon={
                        message && <SenderAvatar sender={message} size="sm" />
                      }
                      title={
                        message ? (
                          <span data-mask>
                            {message.fromName ?? message.fromEmail}
                          </span>
                        ) : (
                          t.actionKind[proposal.kind]
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
                      <IconButton
                        icon={NextIcon}
                        label={t.today.tidy.keep}
                        size="icon-sm"
                        variant="ghost-tint-muted"
                        shortcut={isActive ? <Kbd>S</Kbd> : undefined}
                        onClick={() => proposals.keep(proposal)}
                      />
                      <IconButton
                        icon={Tick02Icon}
                        label={t.actionKind[proposal.kind]}
                        size="icon-sm"
                        variant="ghost-tint-muted"
                        shortcut={isActive ? <Kbd>⏎</Kbd> : undefined}
                        onClick={() => proposals.approve([proposal])}
                      />
                    </SettingsRow>
                  )
                }}
              </PaneRows>
            </ToolContent>
          </Tool>
        ))}
      </NowPart>
    </>
  )
}
