import { db } from '@fewmail/db'
import { snippets } from '@fewmail/db/schema'
import { and, eq } from 'drizzle-orm'

import { expectRow } from '../lib/rows'
import { sameText } from './bots'

export const listSnippets = async (userId: string) => {
  const rows = await db
    .select({ html: snippets.html, id: snippets.id, name: snippets.name })
    .from(snippets)
    .where(eq(snippets.userId, userId))
  return rows.toSorted((a, b) => a.name.localeCompare(b.name))
}

export const saveSnippet = async (
  userId: string,
  input: { html: string; id?: string; name: string }
) => {
  // `;name` inserts one snippet: a second one of the same name could never be picked.
  const existing = await listSnippets(userId)
  const id =
    input.id ?? existing.find(({ name }) => sameText(name, input.name))?.id
  if (id) {
    const [updated] = await db
      .update(snippets)
      .set({ html: input.html, name: input.name })
      .where(and(eq(snippets.id, id), eq(snippets.userId, userId)))
      .returning()
    return expectRow(updated)
  }
  const [created] = await db
    .insert(snippets)
    .values({ html: input.html, name: input.name, userId })
    .returning()
  return expectRow(created)
}

export const deleteSnippet = (userId: string, id: string) =>
  db
    .delete(snippets)
    .where(and(eq(snippets.id, id), eq(snippets.userId, userId)))
