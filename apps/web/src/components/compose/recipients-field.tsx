import type { RouterOutputs } from '@fewmail/api/router'
import { matchesContact } from '@fewmail/shared/email'
import {
  Autocomplete,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@fewmail/ui/components/combobox'
import { useQuery } from '@tanstack/react-query'
import type { Ref } from 'react'
import { useMemo } from 'react'

import { orpc } from '~/lib/orpc'

import { parseRecipients } from './schedule'

type Contact = RouterOutputs['contacts'][number]

const SUGGESTIONS_SHOWN = 6
const LAST_RECIPIENT = /[^,;]*$/u
const NO_CONTACTS: Contact[] = []

/** The To / Cc line: comma-separated addresses, suggesting people the user's mail knows for the one being typed. */
export const RecipientsField = ({
  label,
  onChange,
  ref,
  value,
}: {
  label: string
  onChange: (value: string) => void
  ref?: Ref<HTMLInputElement>
  value: string
}) => {
  const { data: contacts = NO_CONTACTS } = useQuery(
    orpc.contacts.queryOptions()
  )
  const query = LAST_RECIPIENT.exec(value)?.[0].trim() ?? ''
  const suggestions = useMemo(() => {
    if (!query) {
      return NO_CONTACTS
    }
    const entered = new Set(
      parseRecipients(value).map((email) => email.toLowerCase())
    )
    return contacts
      .filter(
        (contact) =>
          !entered.has(contact.email) && matchesContact(contact, query)
      )
      .slice(0, SUGGESTIONS_SHOWN)
  }, [contacts, query, value])

  return (
    <Autocomplete
      items={suggestions}
      filter={null}
      autoHighlight
      itemToStringValue={(contact: Contact) => contact.email}
      value={value}
      onValueChange={(next, { reason }) => {
        // base-ui empties the field on Escape once the popup is shut; Escape here only steps out.
        if (reason === 'escape-key') {
          return
        }
        onChange(
          reason === 'item-press'
            ? value.replace(LAST_RECIPIENT, ` ${next}, `).trimStart()
            : next
        )
      }}
    >
      <ComboboxInput
        ref={ref}
        showTrigger={false}
        placeholder={label}
        aria-label={label}
        className="flex-1"
        data-mask
      />
      <ComboboxContent>
        <ComboboxList>
          {(contact: Contact) => (
            <ComboboxItem key={contact.email} value={contact}>
              <span className="truncate" data-mask>
                {contact.name ?? contact.email}
              </span>
              {contact.name && (
                <span className="text-muted-foreground truncate" data-mask>
                  {contact.email}
                </span>
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Autocomplete>
  )
}
