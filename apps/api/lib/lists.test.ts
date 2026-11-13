import { expect, test } from 'bun:test'

import { listSearch, titledListId } from '@fewmail/shared/agent'

test('a titled List-Id is a list of its own', () => {
  expect(titledListId(' letstri/fewmail <fewmail.letstri.github.com> ')).toBe(
    'letstri/fewmail <fewmail.letstri.github.com>'
  )
  expect(titledListId('"Python-Dev" <python-dev.python.org>')).not.toBeNull()
})

test('a List-Id an email service changes per send is not', () => {
  expect(titledListId('<81844.broadcast>')).toBeNull()
  expect(
    titledListId('1656960@sendpulse.info <1656960.sendpulse.info>')
  ).toBeNull()
  expect(titledListId(undefined)).toBeNull()
})

test('a list is searched by its label, other mail by sender', () => {
  expect(
    listSearch({
      fromEmail: 'notifications@github.com',
      listId: 'letstri/fewmail <Fewmail.letstri.github.com>',
    })
  ).toBe('list:fewmail.letstri.github.com newer_than:30d')
  expect(listSearch({ fromEmail: 'news@example.com', listId: null })).toBe(
    'from:news@example.com newer_than:30d'
  )
})
