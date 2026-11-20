import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@fewmail/ui/components/empty'

import { LogoMark } from '~/components/logo'

/** A pane with nothing left in it: the bird smiles over what is done and what will come, never a bare title. */
export const PaneEmpty = ({
  isShown,
  lead,
  title,
}: {
  isShown: boolean
  lead: string
  title: string
}) =>
  isShown && (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <LogoMark isHappy className="size-20" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{lead}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
