import { Kbd } from '@fewmail/ui/components/kbd'

export const KeyHints = ({
  hints,
}: {
  hints: [key: string, label: string][]
}) => (
  <footer className="text-muted-foreground flex h-11 shrink-0 items-center gap-5 border-t px-10 text-xs">
    {hints.map(([key, label]) => (
      <span key={key} className="flex items-center gap-1.5">
        <Kbd>{key}</Kbd>
        {label}
      </span>
    ))}
  </footer>
)
