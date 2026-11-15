import { db } from '@fewmail/db'
import { mailboxes } from '@fewmail/db/schema'
import { Result } from 'better-result'
import { eq } from 'drizzle-orm'

import type { GmailAccount } from './auth'
import { gmailAccessToken } from './auth'
import { logError } from './log'

interface Person {
  emailAddresses?: { value: string }[]
  photos?: { default?: boolean; url: string }[]
}

type PeopleField = 'connections' | 'otherContacts'

const PEOPLE_API = 'https://people.googleapis.com/v1'
const PAGE_SIZE = '1000'
const PHOTOS_CACHE_MS = 6 * 3_600_000
const CACHED_USERS = 1000
const FETCH_TIMEOUT_MS = 4000

const PEOPLE_LISTS: Record<PeopleField, string> = {
  connections: `people/me/connections?${new URLSearchParams({
    personFields: 'emailAddresses,photos',
  })}`,
  // Without the profile source an other contact carries only the photo the user set on it, which nobody does.
  otherContacts: `otherContacts?${new URLSearchParams([
    ['readMask', 'emailAddresses,photos'],
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
    // A grant from before the contacts scopes, or with them unticked, has no photos to give.
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

const fetchPhotos = async (userId: string) => {
  const photos = new Map<string, string>()
  const accounts = await db
    .select({
      refreshToken: mailboxes.refreshToken,
      userId: mailboxes.userId,
    })
    .from(mailboxes)
    .where(eq(mailboxes.userId, userId))
  const lists = await Promise.all(
    accounts.flatMap((account) =>
      (['otherContacts', 'connections'] as const).map(async (field) => {
        const people = await Result.tryPromise(() => listPeople(account, field))
        if (people.isErr()) {
          logError('contact photos', people.error.cause)
          return []
        }
        return people.value
      })
    )
  )
  // Saved contacts come last so the photo the user chose wins over the profile's.
  for (const {
    emailAddresses = [],
    photos: personPhotos = [],
  } of lists.flat()) {
    // Google's default is a drawn initial, which the avatar already shows.
    const photo = personPhotos.find((candidate) => !candidate.default)
    if (photo) {
      for (const { value } of emailAddresses) {
        photos.set(value.toLowerCase(), photo.url)
      }
    }
  }
  return photos
}

// A failed listing stays cached too: each avatar on a page would otherwise list every contact again.
const cache = new Map<
  string,
  { expiresAt: number; photos: Promise<Map<string, string>> }
>()

const contactPhotos = (userId: string) => {
  const cached = cache.get(userId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.photos
  }
  if (cache.size >= CACHED_USERS) {
    cache.delete(cache.keys().next().value ?? '')
  }
  const photos = fetchPhotos(userId)
  cache.set(userId, { expiresAt: Date.now() + PHOTOS_CACHE_MS, photos })
  return photos
}

/** The Google profile photo of the user or of someone in their contacts, fetched by our server like site icons. */
export const contactPhoto = async (
  user: { email: string; id: string; image?: string | null },
  email: string
) => {
  const photos = await contactPhotos(user.id)
  const url =
    email === user.email.toLowerCase() ? user.image : photos.get(email)
  if (!url) {
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
