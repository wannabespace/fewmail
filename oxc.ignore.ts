export const ignorePatterns = [
  '.agents/**',
  '.claude/**',
  '.github/**',
  '**/migrations/**',
  '**/routeTree.gen.ts',
  // Vendored from the EvilCharts registry: update with `shadcn add @evilcharts/…`, never by hand.
  'packages/ui/src/components/evilcharts/**',
  // The presets skip every `codegen` dir as generated output; ours is source.
  '!**/codegen',
]
