import { Kbd } from '@fewmail/ui/components/kbd'

export const KeyHints = ({
  hints,
}: {
  hints: [key: string, label: string][]
}) => (
  <footer className="text-muted-foreground scroll-fade-x bg-body in-[.bg-background]:bg-background relative z-10 -mt-11 hidden h-11 shrink-0 scrollbar-none items-center gap-5 overflow-x-auto border-t px-10 text-xs whitespace-nowrap in-data-shortcuts-revealed:flex">
    {hints.map(([key, label]) => (
      <span key={key} className="flex shrink-0 items-center gap-1.5">
        <Kbd>{key}</Kbd>
        {label}
      </span>
    ))}
  </footer>
)
