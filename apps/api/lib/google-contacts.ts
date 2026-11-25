import { db } from '@fewmail/db'
import { mailboxes } from '@fewmail/db/schema'
import { Result } from 'better-result'
import { and, eq } from 'drizzle-orm'

import type { GmailAccount } from './auth'
import { CONTACTS_SCOPE, gmailAccessToken, hasScope } from './auth'
import { logError } from './log'

interface Person {
  emailAddresses?: { value: string }[]
  names?: { displayName?: string }[]
  photos?: { default?: boolean; url: string }[]
  resourceName: string
}

interface SavedContact {
  account: GmailAccount
  resourceName: string
}

export interface GoogleContact {
  email: string
  name: string | null
  photo: string | null
  /** Empty for an other contact: Google's API can only read those. */
  saved: SavedContact[]
}

type PeopleField = 'connections' | 'otherContacts'

const PEOPLE_API = 'https://people.googleapis.com/v1'
const PAGE_SIZE = '1000'
const CONTACTS_CACHE_MS = 6 * 3_600_000
const CACHED_USERS = 1000
const FETCH_TIMEOUT_MS = 4000

const PEOPLE_LISTS: Record<PeopleField, string> = {
  connections: `people/me/connections?${new URLSearchParams({
    personFields: 'emailAddresses,names,photos',
  })}`,
  // Without the profile source an other contact carries only the photo the user set on it, which nobody does.
  otherContacts: `otherContacts?${new URLSearchParams([
    ['readMask', 'emailAddresses,names,photos'],
    ['sources', 'READ_SOURCE_TYPE_CONTACT'],
    ['sources', 'READ_SOURCE_TYPE_PROFILE'],
  ])}`,
}

const listPeople = async (account: GmailAccount, field: PeopleField) => {
  const headers = { authorization: `Bearer ${await gmailAccessToken(account)}` }
  const people: Person[] = []
  let pageToken: string | undefined
  do {
    // oxlint-disable-next-line eslint/no-await-in-loop -- pages chain via nextPageToken
    const response = await fetch(
      `${PEOPLE_API}/${PEOPLE_LISTS[field]}&${new URLSearchParams({
        pageSize: PAGE_SIZE,
        ...(pageToken && { pageToken }),
      })}`,
      { headers }
    )
    // A grant with the contacts scopes unticked has no contacts to give.
    if (response.status === 403) {
      return people
    }
    if (!response.ok) {
      throw new Error(`People ${field} failed: ${response.status}`)
    }
    // oxlint-disable-next-line eslint/no-await-in-loop -- pages chain via nextPageToken
    const page = (await response.json()) as Partial<
      Record<PeopleField, Person[]>
    > & { nextPageToken?: string }
    people.push(...(page[field] ?? []))
    pageToken = page.nextPageToken
  } while (pageToken)
  return people
}

const listAccountContacts = async (
  account: GmailAccount,
  field: PeopleField
) => {
  const people = await Result.tryPromise(() => listPeople(account, field))
  if (people.isErr()) {
    logError('google contacts', people.error.cause)
    return []
  }
  const canDelete =
    field === 'connections' && (await hasScope(account, CONTACTS_SCOPE))
  return people.value.flatMap(
    ({ emailAddresses = [], names = [], photos = [], resourceName }) =>
      emailAddresses.map(({ value }) => ({
        email: value.toLowerCase(),
        name: names[0]?.displayName ?? null,
        // Google's default is a drawn initial, which the avatar already shows.
        photo: photos.find((candidate) => !candidate.default)?.url ?? null,
        saved: canDelete ? [{ account, resourceName }] : [],
      }))
  )
}

const fetchContacts = async (userId: string) => {
  const accounts = await db
    .select({
      refreshToken: mailboxes.refreshToken,
      userId: mailboxes.userId,
    })
    .from(mailboxes)
    .where(and(eq(mailboxes.userId, userId), eq(mailboxes.enabled, true)))
  const lists = await Promise.all(
    accounts.flatMap((account) =>
      (['otherContacts', 'connections'] as const).map((field) =>
        listAccountContacts(account, field)
      )
    )
  )
  const contacts = new Map<string, GoogleContact>()
  // Saved contacts come last so the name and photo the user chose win over the profile's.
  for (const contact of lists.flat()) {
    const known = contacts.get(contact.email)
    contacts.set(contact.email, {
      email: contact.email,
      name: contact.name ?? known?.name ?? null,
      photo: contact.photo ?? known?.photo ?? null,
      saved: [...(known?.saved ?? []), ...contact.saved],
    })
  }
  return contacts
}

// A failed listing stays cached too: each avatar on a page would otherwise list every contact again.
const cache = new Map<
  string,
  { contacts: Promise<Map<string, GoogleContact>>; expiresAt: number }
>()

/** Every mailbox's saved and other Google contacts by address, read again every 6 hours. */
export const googleContacts = (userId: string) => {
  const cached = cache.get(userId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.contacts
  }
  if (cache.size >= CACHED_USERS) {
    cache.delete(cache.keys().next().value ?? '')
  }
  const contacts = fetchContacts(userId)
  cache.set(userId, { contacts, expiresAt: Date.now() + CONTACTS_CACHE_MS })
  return contacts
}

export const forgetGoogleContacts = (userId: string) => {
  cache.delete(userId)
}

export const deleteGoogleContacts = async (
  userId: string,
  saved: SavedContact[]
) => {
  await Promise.all(
    saved.map(async ({ account, resourceName }) => {
      const response = await fetch(
        `${PEOPLE_API}/${resourceName}:deleteContact`,
        {
          headers: {
            authorization: `Bearer ${await gmailAccessToken(account)}`,
          },
          method: 'DELETE',
        }
      )
      if (!response.ok && response.status !== 404) {
        throw new Error(`People deleteContact failed: ${response.status}`)
      }
    })
  )
  forgetGoogleContacts(userId)
}

const isGooglePhoto = (url: string) => {
  const parsed = URL.parse(url)
  return (
    parsed?.protocol === 'https:' &&
    parsed.hostname.endsWith('.googleusercontent.com')
  )
}

/** The Google profile photo of the user or of someone in their contacts, fetched by our server like site icons. */
export const contactPhoto = async (
  user: { email: string; id: string; image?: string | null },
  email: string
) => {
  const contacts = await googleContacts(user.id)
  const url =
    email === user.email.toLowerCase() ? user.image : contacts.get(email)?.photo
  if (!url || !isGooglePhoto(url)) {
    return null
  }
  const photo = await Result.tryPromise(async () => {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    return response.ok
      ? {
          bytes: await response.arrayBuffer(),
          type: response.headers.get('content-type') ?? 'image/jpeg',
        }
      : null
  })
  if (photo.isErr()) {
    logError('contact photo fetch', photo.error.cause)
    return null
  }
  return photo.value
}
