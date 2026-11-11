import { cva } from 'class-variance-authority'

const chatProse = `[&_blockquote]:border-border [&_:is(h1,h2,h3,h4,h5,h6)]:mt-3 [&_:is(h1,h2,h3,h4,h5,h6)]:mb-1 [&_:is(h3,h4,h5,h6)]:font-medium [&_:is(ul,ol)]:my-2 [&_:is(ul,ol)]:ml-4 [&_:is(ul,ol)]:list-outside [&_a]:underline-offset-2 [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_h1]:font-semibold [&_h2]:font-semibold [&_li]:my-1 [&_li]:py-0 [&_li_:is(ul,ol)]:mt-1 [&_li_:is(ul,ol)]:pl-0 [&_p]:my-2 [&>:first-child]:mt-0 [&>:last-child]:mb-0`

export const responseVariants = cva('min-w-0', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: `text-sm/normal [&_:is(h3,h4,h5,h6)]:text-sm [&_h1]:text-base [&_h2]:text-sm ${chatProse}`,
      document: `text-muted-foreground [&_:is(h1,h2,h3,h4,h5,h6)]:text-foreground [&_strong]:text-foreground [&_blockquote]:border-border [&_hr]:border-border text-base/7 [&_:is(h1,h2)]:mt-12 [&_:is(h1,h2)]:mb-4 [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold [&_:is(h1,h2,h3,h4,h5,h6)]:tracking-tight [&_:is(h3,h4,h5,h6)]:mt-8 [&_:is(h3,h4,h5,h6)]:mb-3 [&_:is(h3,h4,h5,h6)]:text-base [&_:is(ul,ol)]:my-4 [&_:is(ul,ol)]:ml-5 [&_:is(ul,ol)]:list-outside [&_a]:wrap-break-word [&_a]:underline-offset-4 [&_a:not([data-slot]):hover]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_h1]:text-2xl [&_h2]:text-xl [&_hr]:my-10 [&_img]:rounded-xl [&_li]:my-1.5 [&_li]:py-0 [&_li]:pl-1 [&_li_:is(ul,ol)]:my-1.5 [&_ol]:list-decimal [&_p:not([data-slot])]:my-4 [&_strong]:font-medium [&_ul]:list-disc [&>:first-child]:mt-0 [&>:last-child]:mb-0`,
      reading: `font-serif text-base/relaxed ${chatProse}`,
    },
  },
})
