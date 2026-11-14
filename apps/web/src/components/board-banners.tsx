import type { RouterOutputs } from '@fewmail/api/router'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@fewmail/ui/components/alert'
import { Button } from '@fewmail/ui/components/button'
import { useNavigate } from '@tanstack/react-router'

import { useDates, useMoneyFormat, useT } from '~/lib/i18n'

type Banner = RouterOutputs['today']['get']['banners'][number]

/** A board's heads-up: an entry whose next date (renewal, bill, departure) falls within the board's `bannerDays`; a predicted one says "expected". */
export const BoardBanners = ({
  banners,
  showBoard = true,
}: {
  banners: Banner[]
  showBoard?: boolean
}) => {
  const t = useT()
  const dates = useDates()
  const money = useMoneyFormat()
  const navigate = useNavigate()

  return banners.map((banner) => (
    <Alert key={banner.id}>
      <AlertTitle data-mask>
        {banner.title}
        {banner.amountCents !== null &&
          banner.currency &&
          ` · ${money(banner.amountCents, banner.currency)}`}
      </AlertTitle>
      <AlertDescription>
        {showBoard && <span data-mask>{banner.boardName} · </span>}
        {(banner.isPredicted ? t.boards.expected : t.boards.due)(
          dates.ago(new Date(banner.dueAt))
        )}
      </AlertDescription>
      <AlertAction>
        <Button
          size="xs"
          variant="ghost-muted"
          onClick={() =>
            navigate({
              params: { threadId: banner.threadId },
              to: '/mail/$threadId',
            })
          }
        >
          {t.mail.open}
        </Button>
      </AlertAction>
    </Alert>
  ))
}
