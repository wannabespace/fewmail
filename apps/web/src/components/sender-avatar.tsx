import { SiteAvatar } from '@fewmail/ui/components/custom/site-avatar'

export const SenderAvatar = ({
  sender: { fromEmail, fromName },
  size,
}: {
  sender: { fromEmail: string; fromName?: string | null }
  size?: 'xs' | 'sm'
}) => {
  const [, domain] = fromEmail.split('@')
  return (
    <SiteAvatar
      name={fromName ?? fromEmail}
      size={size}
      src={
        domain &&
        `${import.meta.env.API_URL}/site-icon/${encodeURIComponent(domain)}`
      }
    />
  )
}
