import { Blobatar } from '@blobatar/react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@fewmail/ui/components/avatar'
import { cn } from '@fewmail/ui/lib/utils'

export const UserAvatar = ({
  user,
  className,
}: {
  user:
    | {
        email: string
        image?: string | null
      }
    | null
    | undefined
  className?: string
}) => (
  <Avatar
    className={cn(
      `size-6 shrink-0 overflow-hidden rounded-lg after:rounded-lg`,
      className
    )}
  >
    <AvatarImage className="rounded-none" src={user?.image ?? undefined} />
    <AvatarFallback className="rounded-lg bg-transparent">
      <Blobatar className="size-full" name={user?.email ?? ''} />
    </AvatarFallback>
  </Avatar>
)
