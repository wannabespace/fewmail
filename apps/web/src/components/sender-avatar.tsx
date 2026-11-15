import type { Participant } from '@fewmail/shared/email'
import { AvatarGroup } from '@fewmail/ui/components/avatar'
import { SiteAvatar } from '@fewmail/ui/components/custom/site-avatar'
import { cn } from '@fewmail/ui/lib/utils'

export const SenderAvatar = ({
  sender: { fromEmail, fromName },
  size,
}: {
  sender: { fromEmail: string; fromName?: string | null }
  size?: 'xs' | 'sm'
}) => (
  <SiteAvatar
    name={fromName ?? fromEmail}
    size={size}
    src={`${import.meta.env.API_URL}/avatar/${encodeURIComponent(fromEmail)}`}
  />
)

const PARTICIPANTS_SHOWN = 3

/**
 * A thread's people overlapping, the first three: the names beside them list everyone. Set `--avatar-ring` to the fill
 * under them, or each ring shows as an outline.
 */
export const ParticipantAvatars = ({
  isVertical,
  participants,
  size,
}: {
  isVertical?: boolean
  participants: Participant[]
  size?: 'xs' | 'sm'
}) => {
  const avatars = participants
    .slice(0, PARTICIPANTS_SHOWN)
    .map((participant) => (
      <SenderAvatar
        key={participant.isFromMe ? '' : participant.fromEmail}
        sender={participant}
        size={size}
      />
    ))
  return isVertical ? (
    <div
      className={cn(
        'flex flex-col *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-(--avatar-ring,var(--color-background))',
        size === 'sm' ? '-space-y-4' : '-space-y-3.5'
      )}
    >
      {avatars}
    </div>
  ) : (
    <AvatarGroup>{avatars}</AvatarGroup>
  )
}

/** Two people by full name; more by first name, or the line cuts off before the second. */
export const participantNamesOf = (participants: Participant[], you: string) =>
  participants
    .map(({ fromEmail, fromName, isFromMe }) => {
      if (isFromMe) {
        return you
      }
      const name = fromName ?? fromEmail
      return participants.length > 2 ? name.split(' ')[0] : name
    })
    .join(', ')
