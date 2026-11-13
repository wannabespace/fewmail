import { textToHtml } from '@fewmail/shared/email'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Input } from '@fewmail/ui/components/input'
import { Textarea } from '@fewmail/ui/components/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'
import { toastDeferred } from '~/lib/undo'

export const SnippetsSettings = () => {
  const t = useT()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const { data: snippets = [] } = useQuery(orpc.snippets.list.queryOptions())
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.snippets.key() })
  const listKey = orpc.snippets.list.queryKey()
  const save = useMutation(
    orpc.snippets.save.mutationOptions({
      onMutate: (snippet) => {
        setName('')
        setBody('')
        queryClient.setQueryData(listKey, (old) =>
          [...(old ?? []), { id: crypto.randomUUID(), ...snippet }].toSorted(
            (a, b) => a.name.localeCompare(b.name)
          )
        )
      },
      onSettled: invalidate,
    })
  )
  const remove = useMutation(
    orpc.snippets.delete.mutationOptions({ onSettled: invalidate })
  )
  const deleteSnippet = (id: string) => {
    queryClient.setQueryData(listKey, (old) =>
      old?.filter((snippet) => snippet.id !== id)
    )
    toastDeferred(
      t.settings.snippets.deleted,
      () => remove.mutate({ id }),
      invalidate
    )
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
    </SettingsGroup>
  )
}
