import { SITE_ICON_PX } from '@fewmail/shared/email'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@fewmail/ui/components/avatar'

/**
 * A sender's photo or site icon, rounded square so a logo keeps its corners; the initial while it loads or when there
 * is none. A site icon sits 1px inside the frame, as favicons run to their edge; a photo fills it.
 */
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
    {src && (
      <AvatarImage
        alt=""
        className="rounded-none data-icon:p-px"
        src={src}
        onLoad={(event) =>
          event.currentTarget.toggleAttribute(
            'data-icon',
            event.currentTarget.naturalWidth <= SITE_ICON_PX
          )
        }
      />
    )}
    <AvatarFallback data-mask className="rounded-none font-medium">
      {name[0]?.toUpperCase()}
    </AvatarFallback>
  </Avatar>
)
