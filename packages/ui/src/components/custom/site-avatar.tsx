import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@fewmail/ui/components/avatar'

/** A sender's photo or site icon, rounded square so a logo keeps its corners; the initial while it loads or when there is none. */
export const SiteAvatar = ({
  name,
  size = 'xs',
  src,
}: {
  name: string
  size?: 'xs' | 'sm'
  src: string | undefined
}) => (
  <Avatar
    size={size}
    className="overflow-hidden rounded-md after:rounded-md data-[size=xs]:rounded-sm data-[size=xs]:after:rounded-sm"
  >
    {src && <AvatarImage alt="" className="rounded-none" src={src} />}
    <AvatarFallback data-mask className="rounded-none font-medium">
      {name[0]?.toUpperCase()}
    </AvatarFallback>
  </Avatar>
)
