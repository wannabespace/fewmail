import { Button } from '@fewmail/ui/components/button'
import { ContentSwitch } from '@fewmail/ui/components/custom/content-switch'
import { LoadingContent } from '@fewmail/ui/components/custom/loading-content'
import { Refresh01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ComponentProps } from 'react'

export const RefreshButton = ({
  refreshing,
  iconClassName,
  ...props
}: {
  refreshing: boolean
  iconClassName?: string
} & Omit<ComponentProps<typeof Button>, 'children'>) => (
  <Button {...props}>
    <LoadingContent loading={refreshing}>
      <ContentSwitch
        activeContent={
          <HugeiconsIcon
            icon={Tick02Icon}
            strokeWidth={2}
            className="text-success"
          />
        }
        active={refreshing}
      >
        <HugeiconsIcon
          icon={Refresh01Icon}
          strokeWidth={2}
          className={iconClassName}
        />
      </ContentSwitch>
    </LoadingContent>
  </Button>
)
