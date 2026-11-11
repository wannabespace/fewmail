import { db } from '@fewmail/db'
import { snippets } from '@fewmail/db/schema'
import { and, asc, eq } from 'drizzle-orm'

import { expectRow } from '../lib/rows'

export const listSnippets = (userId: string) =>
  db
    .select({ html: snippets.html, id: snippets.id, name: snippets.name })
    .from(snippets)
    .where(eq(snippets.userId, userId))
    .orderBy(asc(snippets.name))

export const saveSnippet = async (
  userId: string,
  input: { html: string; id?: string; name: string }
) => {
  if (input.id) {
    const [updated] = await db
      .update(snippets)
      .set({ html: input.html, name: input.name })
      .where(and(eq(snippets.id, input.id), eq(snippets.userId, userId)))
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
