import { htmlToText, textToHtml } from '@fewmail/shared/email'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { Input } from '@fewmail/ui/components/input'
import { Kbd } from '@fewmail/ui/components/kbd'
import {
  LeftToRightListBulletIcon,
  Link01Icon,
  Unlink01Icon,
  TextBoldIcon,
  TextItalicIcon,
} from '@hugeicons/core-free-icons'
import { useHotkey } from '@tanstack/react-hotkeys'
import type { Editor } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import { Placeholder } from '@tiptap/extensions'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { StarterKit } from '@tiptap/starter-kit'
import type { SuggestionProps } from '@tiptap/suggestion'
import { Suggestion } from '@tiptap/suggestion'
import { Result } from 'better-result'
import type { Ref } from 'react'
import {
  useImperativeHandle,
  useMemo,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { useT } from '~/lib/i18n'

export interface ComposerEditorHandle {
  focus: () => void
  getHtml: () => string
  getText: () => string
  insertText: (text: string) => void
  setContent: (html: string) => void
}

interface ComposerSnippet {
  html: string
  id: string
  name: string
}

type ComposerComplete = (input: {
  prefix: string
  signal: AbortSignal
  suffix: string
}) => Promise<string>

interface Handlers {
  complete?: ComposerComplete
  hint: string
  onEscape?: () => void
  onSubmit?: () => void
  placeholder: string
  snippets?: ComposerSnippet[]
}

interface Ghost {
  pos: number
  text: string
}

interface SnippetMenu {
  index: number
  items: ComposerSnippet[]
  select: (index: number) => void
}

const ghostKey = new PluginKey<Ghost | null>('composerGhost')
const snippetKey = new PluginKey('composerSnippets')

const PREFIX_LIMIT = 2000
const SUFFIX_LIMIT = 500
const COMPLETE_DELAY = 350

const insertPlainText = (editor: Editor, text: string) => {
  if (text.includes('\n')) {
    editor.chain().focus().insertContent(textToHtml(text)).run()
  } else {
    editor.chain().focus().insertContent({ text, type: 'text' }).run()
  }
}

const isSnippetOpen = (editor: Editor) =>
  Boolean(snippetKey.getState(editor.state)?.active)

const renderGhost = (text: string, hint: string) => {
  const ghost = document.createElement('span')
  ghost.className = 'text-muted-foreground pointer-events-none select-none'
  ghost.contentEditable = 'false'
  ghost.textContent = text
  const label = document.createElement('span')
  label.className = 'text-muted-foreground/70 ml-1.5 font-sans text-2xs'
  label.textContent = hint
  ghost.append(label)
  return ghost
}

const createGhostExtension = (handlers: Handlers) =>
  Extension.create({
    addProseMirrorPlugins() {
      return [
        new Plugin<Ghost | null>({
          key: ghostKey,
          props: {
            decorations(state) {
              const ghost = ghostKey.getState(state)
              return ghost
                ? DecorationSet.create(state.doc, [
                    Decoration.widget(
                      ghost.pos,
                      () => renderGhost(ghost.text, handlers.hint),
                      { key: ghost.text, side: 1 }
                    ),
                  ])
                : null
            },
            handleDOMEvents: {
              blur: (view) => {
                if (ghostKey.getState(view.state)) {
                  view.dispatch(view.state.tr.setMeta(ghostKey, null))
                }
                return false
              },
            },
          },
          state: {
            apply: (tr, ghost) => {
              const meta = tr.getMeta(ghostKey) as Ghost | null | undefined
              if (meta !== undefined) {
                return meta
              }
              return tr.docChanged || tr.selectionSet ? null : ghost
            },
            init: () => null,
          },
          view: () => {
            let timer: ReturnType<typeof setTimeout> | undefined
            let controller: AbortController | undefined
            const cancel = () => {
              clearTimeout(timer)
              controller?.abort()
              controller = undefined
            }
            const schedule = (view: EditorView) => {
              const { complete } = handlers
              const { doc, selection } = view.state
              const { $head } = selection
              if (
                !complete ||
                !selection.empty ||
                !view.hasFocus() ||
                !$head.parent.isTextblock ||
                snippetKey.getState(view.state)?.active
              ) {
                return
              }
              const rest = $head.parent.textBetween(
                $head.parentOffset,
                $head.parent.content.size,
                undefined,
                ' '
              )
              const prefix = doc.textBetween(0, $head.pos, '\n\n', '\n')
              if (rest.trim() || !prefix.trim()) {
                return
              }
              const suffix = doc.textBetween(
                $head.pos,
                doc.content.size,
                '\n\n',
                '\n'
              )
              timer = setTimeout(async () => {
                const request = new AbortController()
                controller = request
                const completed = await Result.tryPromise(() =>
                  complete({
                    prefix: prefix.slice(-PREFIX_LIMIT),
                    signal: request.signal,
                    suffix: suffix.slice(0, SUFFIX_LIMIT),
                  })
                )
                const text = completed.unwrapOr('')
                if (
                  request.signal.aborted ||
                  !text.trim() ||
                  view.isDestroyed ||
                  view.state.doc !== doc ||
                  view.state.selection.head !== $head.pos
                ) {
                  return
                }
                view.dispatch(
                  view.state.tr.setMeta(ghostKey, { pos: $head.pos, text })
                )
              }, COMPLETE_DELAY)
            }
            return {
              destroy: cancel,
              update: (view, previous) => {
                const docChanged = !previous.doc.eq(view.state.doc)
                if (
                  !docChanged &&
                  previous.selection.eq(view.state.selection)
                ) {
                  return
                }
                cancel()
                if (docChanged) {
                  schedule(view)
                }
              },
            }
          },
        }),
      ]
    },
    name: 'composerGhost',
  })

const createSnippetExtension = (
  handlers: Handlers,
  menuElement: HTMLElement,
  setMenu: (menu: SnippetMenu | null) => void
) =>
  Extension.create({
    addProseMirrorPlugins() {
      return [
        Suggestion<ComposerSnippet, ComposerSnippet>({
          allow: () => Boolean(handlers.snippets?.length),
          char: ';',
          command: ({ editor, props, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent(props.html)
              .run()
          },
          editor: this.editor,
          items: ({ query }) => {
            const needle = query.toLowerCase()
            return (handlers.snippets ?? [])
              .filter(({ name }) => name.toLowerCase().includes(needle))
              .slice(0, 8)
          },
          pluginKey: snippetKey,
          render: () => {
            let current: SuggestionProps<ComposerSnippet, ComposerSnippet>
            let index = 0
            let unmount: (() => void) | undefined
            const sync = () =>
              setMenu({
                index,
                items: current.items,
                select: (selected) => {
                  const item = current.items[selected]
                  if (item) {
                    current.command(item)
                  }
                },
              })
            return {
              onExit: () => {
                unmount?.()
                unmount = undefined
                setMenu(null)
              },
              onKeyDown: ({ event }) => {
                const count = current.items.length
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  if (count) {
                    index =
                      (index + (event.key === 'ArrowDown' ? 1 : -1) + count) %
                      count
                    sync()
                  }
                  return true
                }
                if (event.key === 'Enter' || event.key === 'Tab') {
                  const item = current.items[index]
                  if (!item) {
                    return false
                  }
                  current.command(item)
                  return true
                }
                return false
              },
              onStart: (props) => {
                current = props
                index = 0
                sync()
                unmount = props.mount(menuElement)
              },
              onUpdate: (props) => {
                current = props
                index = Math.min(index, Math.max(props.items.length - 1, 0))
                sync()
              },
            }
          },
        }),
      ]
    },
    name: 'composerSnippets',
  })

const createKeysExtension = (handlers: Handlers) =>
  Extension.create({
    addKeyboardShortcuts() {
      return {
        Escape: ({ editor }) => {
          if (isSnippetOpen(editor)) {
            return false
          }
          if (ghostKey.getState(editor.state)) {
            editor.view.dispatch(editor.state.tr.setMeta(ghostKey, null))
            return true
          }
          if (!editor.state.selection.empty) {
            return editor.commands.setTextSelection(editor.state.selection.to)
          }
          handlers.onEscape?.()
          return true
        },
        'Mod-Enter': () => {
          handlers.onSubmit?.()
          return true
        },
        Tab: ({ editor }) => {
          const ghost = ghostKey.getState(editor.state)
          if (!ghost || isSnippetOpen(editor)) {
            return false
          }
          insertPlainText(editor, ghost.text)
          return true
        },
      }
    },
    name: 'composerKeys',
    priority: 1000,
  })

const normalizeHref = (value: string) => {
  const href = value.trim()
  if (/^[a-z][\d+.a-z-]*:/iu.test(href)) {
    return href
  }
  return href.includes('@') && !href.includes('/')
    ? `mailto:${href}`
    : `https://${href}`
}

const LinkField = ({
  editor,
  onDone,
}: {
  editor: Editor
  onDone: () => void
}) => {
  const t = useT()
  const [href, setHref] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const close = () => {
    onDone()
    editor.commands.focus()
  }
  useHotkey('Escape', close, { ignoreInputs: false, target: inputRef })

  return (
    <form
      className="w-64"
      onSubmit={(event) => {
        event.preventDefault()
        if (href.trim()) {
          editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: normalizeHref(href) })
            .run()
        }
        close()
      }}
    >
      <Input
        ref={inputRef}
        autoFocus
        value={href}
        onChange={(event) => setHref(event.target.value)}
        placeholder={t.composer.linkPlaceholder}
        aria-label={t.composer.link}
      />
    </form>
  )
}

const FormatMenu = ({ editor }: { editor: Editor }) => {
  const t = useT()
  const [isEditingLink, setIsEditingLink] = useState(false)
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive('bold'),
      bulletList: current.isActive('bulletList'),
      italic: current.isActive('italic'),
      link: current.isActive('link'),
    }),
  })

  return (
    <BubbleMenu
      editor={editor}
      options={{
        offset: 8,
        onHide: () => setIsEditingLink(false),
        placement: 'top',
      }}
      className="bg-popover ring-foreground/6 z-50 flex items-center gap-0.5 rounded-xl p-1 shadow-xl ring"
    >
      {isEditingLink ? (
        <LinkField editor={editor} onDone={() => setIsEditingLink(false)} />
      ) : (
        <>
          <IconButton
            icon={TextBoldIcon}
            label={t.composer.bold}
            shortcut={<Kbd>⌘B</Kbd>}
            size="icon-sm"
            variant="ghost-muted"
            aria-pressed={active.bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <IconButton
            icon={TextItalicIcon}
            label={t.composer.italic}
            shortcut={<Kbd>⌘I</Kbd>}
            size="icon-sm"
            variant="ghost-muted"
            aria-pressed={active.italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <IconButton
            icon={active.link ? Unlink01Icon : Link01Icon}
            label={active.link ? t.composer.removeLink : t.composer.link}
            size="icon-sm"
            variant="ghost-muted"
            onClick={() => {
              if (active.link) {
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
              } else {
                setIsEditingLink(true)
              }
            }}
          />
          <IconButton
            icon={LeftToRightListBulletIcon}
            label={t.composer.bulletList}
            size="icon-sm"
            variant="ghost-muted"
            aria-pressed={active.bulletList}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
        </>
      )}
    </BubbleMenu>
  )
}

const SnippetList = ({ menu }: { menu: SnippetMenu }) => {
  const t = useT()
  return (
    <div className="bg-popover ring-foreground/6 z-50 flex max-w-80 min-w-48 flex-col rounded-xl p-1 shadow-xl ring">
      {menu.items.length === 0 ? (
        <p className="text-muted-foreground px-2 py-1.5 text-xs">
          {t.composer.noSnippets}
        </p>
      ) : (
        menu.items.map((snippet, index) => (
          <Button
            key={snippet.id}
            tabIndex={-1}
            size="sm"
            variant={index === menu.index ? 'secondary' : 'ghost'}
            className="justify-start"
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => menu.select(index)}
          >
            <span data-mask className="truncate">
              {snippet.name}
            </span>
          </Button>
        ))
      )}
    </div>
  )
}

const createComposer = (setMenu: (menu: SnippetMenu | null) => void) => {
  const handlers: Handlers = {
    hint: '',
    placeholder: '',
  }
  const menuElement = document.createElement('div')
  return {
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        link: { autolink: true, linkOnPaste: true, openOnClick: false },
        underline: false,
      }),
      Placeholder.configure({ placeholder: () => handlers.placeholder }),
      createKeysExtension(handlers),
      createGhostExtension(handlers),
      createSnippetExtension(handlers, menuElement, setMenu),
    ],
    handlers,
    menuElement,
  }
}

const CONTENT_CLASS = [
  'min-h-32 font-serif text-base/relaxed outline-none',
  '[&_p:not(:first-child)]:mt-3 [&_li>p]:mt-0!',
  '[&_:is(ul,ol)]:my-3 [&_:is(ul,ol)]:pl-6 [&_ul]:list-disc [&_ol]:list-decimal [&_li:not(:first-child)]:mt-1',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
  '[&_blockquote]:text-muted-foreground [&_blockquote]:border-border [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:pl-3',
  '[&_.is-editor-empty:first-child]:before:text-muted-foreground [&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
].join(' ')

export const ComposerEditor = ({
  'aria-label': ariaLabel,
  complete,
  initialHtml,
  onChange,
  onEscape,
  onSubmit,
  placeholder,
  ref,
  snippets,
}: {
  'aria-label': string
  complete?: ComposerComplete
  initialHtml?: string
  onChange?: (value: { html: string; text: string }) => void
  onEscape: () => void
  onSubmit: () => void
  placeholder: string
  ref?: Ref<ComposerEditorHandle>
  snippets?: ComposerSnippet[]
}) => {
  const t = useT()
  const [menu, setMenu] = useState<SnippetMenu | null>(null)
  const composer = useMemo(() => createComposer(setMenu), [])

  useLayoutEffect(() => {
    Object.assign(composer.handlers, {
      complete,
      hint: t.composer.acceptSuggestion,
      onEscape,
      onSubmit,
      placeholder,
      snippets,
    })
  })

  const editor = useEditor({
    content: initialHtml ?? '',
    editorProps: {
      attributes: {
        'aria-label': ariaLabel,
        'aria-multiline': 'true',
        class: CONTENT_CLASS,
        role: 'textbox',
      },
    },
    extensions: composer.extensions,
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML()
      onChange?.({ html, text: htmlToText(html) })
    },
  })

  useLayoutEffect(() => {
    if (!editor.isDestroyed) {
      editor.view.dispatch(editor.state.tr.setMeta('placeholder', placeholder))
    }
  }, [editor, placeholder])

  useImperativeHandle(
    ref,
    () => ({
      focus: () => editor.commands.focus('end'),
      getHtml: () => editor.getHTML(),
      getText: () => htmlToText(editor.getHTML()),
      insertText: (text) => insertPlainText(editor, text),
      setContent: (html) => editor.commands.setContent(html),
    }),
    [editor]
  )

  return (
    <div data-mask className="flex flex-col">
      <EditorContent editor={editor} />
      <FormatMenu editor={editor} />
      {menu && createPortal(<SnippetList menu={menu} />, composer.menuElement)}
    </div>
  )
}
