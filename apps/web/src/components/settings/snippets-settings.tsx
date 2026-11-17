import { textToHtml } from '@fewmail/shared/email'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
  SettingsRows,
} from '@fewmail/ui/components/custom/settings-group'
import { Input } from '@fewmail/ui/components/input'
import { Textarea } from '@fewmail/ui/components/textarea'
import { useLiveQuery } from '@tanstack/react-db'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { useT } from '~/lib/i18n'
import { snippets as snippetRows } from '~/lib/lists-db'
import { client, orpc } from '~/lib/orpc'
import { queryClient, showUntilSettled } from '~/lib/query-client'
import type { Settle } from '~/lib/query-client'
import { toastDeferred } from '~/lib/undo'

const invalidate = () =>
  queryClient.invalidateQueries({ queryKey: orpc.snippets.key() })

export const SnippetsSettings = () => {
  const t = useT()
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  // A new snippet has no `rank` the server gave, so the list goes by name, as the server sorts it.
  const { data: snippets = [] } = useLiveQuery((query) =>
    query.from({ snippet: snippetRows }).orderBy(({ snippet }) => snippet.name)
  )
  const save = useMutation(
    orpc.snippets.save.mutationOptions({
      onMutate: (snippet) => {
        setName('')
        setBody('')
        return showUntilSettled(() =>
          snippetRows.insert({ id: crypto.randomUUID(), rank: 0, ...snippet })
        )
      },
      onSettled: (_, __, ___, settle) => settle?.(invalidate()),
    })
  )
  const remove = useMutation({
    ...orpc.snippets.delete.mutationOptions(),
    mutationFn: ({ id }: { id: string; settle: Settle }) =>
      client.snippets.delete({ id }),
    onSettled: (_, __, { settle }) => settle(invalidate()),
  })
  const deleteSnippet = (id: string) => {
    const settle = showUntilSettled(() => {
      if (snippetRows.has(id)) {
        snippetRows.delete(id)
      }
    })
    toastDeferred(t.settings.snippets.deleted, {
      commit: () => remove.mutate({ id, settle }),
      hide: () => null,
      undo: () => settle(invalidate()),
    })
  }
  const isFilled = Boolean(name.trim() && body.trim())

  return (
    <SettingsGroup title={t.settings.snippets.title}>
      <form
        className="flex flex-col gap-2 p-3.5"
        onSubmit={(event) => {
          event.preventDefault()
          if (isFilled) {
            save.mutate({ html: textToHtml(body), name: name.trim() })
          }
        }}
      >
        <span className="text-muted-foreground text-sm">
          {t.settings.snippets.description}
        </span>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t.settings.snippets.name}
          aria-label={t.settings.snippets.name}
        />
        <Textarea
          data-mask
          value={body}
          rows={3}
          onChange={(event) => setBody(event.target.value)}
          aria-label={t.settings.snippets.body}
          placeholder={t.settings.snippets.body}
        />
        <Button
          size="sm"
          type="submit"
          className="self-start"
          disabled={!isFilled}
        >
          {t.settings.snippets.add}
        </Button>
      </form>
      <SettingsRows>
        {snippets.map((snippet) => (
          <SettingsRow
            key={snippet.id}
            title={<span data-mask>;{snippet.name}</span>}
          >
            <Button
              size="sm"
              variant="ghost-destructive"
              onClick={() => deleteSnippet(snippet.id)}
            >
              {t.settings.snippets.delete}
            </Button>
          </SettingsRow>
        ))}
      </SettingsRows>
    </SettingsGroup>
  )
}
