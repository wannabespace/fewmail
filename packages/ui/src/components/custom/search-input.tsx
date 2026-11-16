import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@fewmail/ui/components/input-group'
import { cn } from '@fewmail/ui/lib/utils'
import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ComponentProps, ReactNode, Ref } from 'react'

/**
 * Inside a `data-search` box with a `group/search` class: it hides while the field shows its placeholder, so the field
 * needs one. The field keeps focus on a press, and an uncontrolled field is emptied here too.
 */
export const SearchClear = ({
  label,
  onClear,
}: {
  label: string
  onClear: () => void
}) => (
  <IconButton
    icon={Cancel01Icon}
    label={label}
    size="icon-xs"
    variant="ghost-muted"
    className="group-has-[input:placeholder-shown]/search:hidden"
    onMouseDown={(event) => event.preventDefault()}
    onClick={(event) => {
      const field = event.currentTarget
        .closest('[data-search]')
        ?.querySelector('input')
      if (field) {
        field.value = ''
        field.focus()
      }
      onClear()
    }}
  />
)

export const SearchInput = ({
  className,
  clearLabel,
  end,
  groupRef,
  onValueChange,
  size = 'sm',
  ...props
}: Omit<ComponentProps<typeof InputGroupInput>, 'onChange' | 'size'> & {
  clearLabel: string
  end?: ReactNode
  groupRef?: Ref<HTMLDivElement>
  onValueChange: (value: string) => void
  size?: ComponentProps<typeof InputGroup>['size']
}) => (
  <InputGroup
    ref={groupRef}
    data-search
    size={size}
    className={cn('group/search', className)}
  >
    <InputGroupAddon>
      <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
    </InputGroupAddon>
    <InputGroupInput
      {...props}
      onChange={(event) => onValueChange(event.target.value)}
    />
    <InputGroupAddon align="inline-end">
      <SearchClear label={clearLabel} onClear={() => onValueChange('')} />
      {end}
    </InputGroupAddon>
  </InputGroup>
)
