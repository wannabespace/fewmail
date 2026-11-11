import { cn } from '@fewmail/ui/lib/utils'

export const LogoMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={cn('text-primary size-5.5', className)}
  >
    <g
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 4C11 4 6 9 5 19" />
      <path d="M5 19c4-1 8-3 10-7" />
      <path d="M9 13h5" />
    </g>
  </svg>
)

export const Logo = () => (
  <span className="flex items-center gap-2.5">
    <LogoMark />
    <span className="font-serif text-xl font-medium tracking-tight">
      Fewmail
    </span>
  </span>
)
