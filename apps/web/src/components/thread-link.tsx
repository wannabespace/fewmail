import { Link } from '@tanstack/react-router'

import { prefetchThread } from '~/lib/mail-db'

export const ThreadLink = ({
  text,
  threadId,
}: {
  text: string
  threadId: string
}) => (
  <Link
    to="/mail/$threadId"
    params={{ threadId }}
    onPointerEnter={() => {
      void prefetchThread(threadId)
    }}
    data-mask
  >
    {text}
  </Link>
)
