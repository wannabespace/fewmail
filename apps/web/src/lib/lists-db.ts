import { client, orpc } from './orpc'
import { listCollection, useRanked } from './query-client'

export const contacts = listCollection({
  getKey: ({ email }) => email,
  id: 'contacts',
  queryFn: () => client.contacts.list(),
  queryKey: orpc.contacts.list.key(),
})

export const mailboxes = listCollection({
  getKey: ({ id }) => id,
  id: 'mailboxes',
  queryFn: () => client.mailboxes.list(),
  queryKey: orpc.mailboxes.list.key(),
})

export const snippets = listCollection({
  getKey: ({ id }) => id,
  id: 'snippets',
  queryFn: () => client.snippets.list(),
  queryKey: orpc.snippets.list.key(),
})

export const connectedApps = listCollection({
  getKey: ({ clientId }) => clientId,
  id: 'connected-apps',
  queryFn: () => client.integrations.apps.list(),
  queryKey: orpc.integrations.apps.list.key(),
})

export const useAllMailboxes = () => useRanked(mailboxes).data ?? []

/** The ones the user keeps on; Settings alone shows the rest. */
export const useMailboxes = () =>
  useAllMailboxes().filter(({ enabled }) => enabled)
