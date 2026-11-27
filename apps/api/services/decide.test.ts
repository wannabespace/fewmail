import { describe, expect, test } from 'bun:test'

import { bindAnswer } from './decide'
import type { Answer, OpenItem } from './decide'

const card = (
  id: string,
  kind: 'archive' | 'pay' | 'reply',
  extra: Partial<OpenItem> = {}
): OpenItem => ({
  cue: kind,
  key: `card:${id}`,
  listed: true,
  ref: { id, kind, type: 'card' },
  sends: kind === 'reply',
  text: id,
  threadId: null,
  updatedAt: null,
  verbs:
    kind === 'reply'
      ? ['approve', 'skip', 'shorter', 'rewrite']
      : ['approve', 'skip'],
  who: id,
  ...extra,
})

const answer = (
  scope: Answer['scope'],
  items: Answer['items'],
  rest = false
): Answer => ({ items, rest, scope })

const no = { odds: 0.9, verb: 'none' } as const

describe('bindAnswer', () => {
  test('a number binds that item alone', () => {
    const items = [card('oksana', 'reply'), card('hetzner', 'pay')]
    const { bound, unclear } = bindAnswer(
      items,
      answer('named', [no, { odds: 0.9, verb: 'skip' }])
    )
    expect(bound.map(({ item, verb }) => [item.key, verb])).toEqual([
      ['card:hetzner', 'skip'],
    ])
    expect(unclear).toEqual([])
  })

  test('a bare yes after a list of different steps binds nothing', () => {
    const items = [card('oksana', 'reply'), card('hetzner', 'pay')]
    const { bound, unclear } = bindAnswer(
      items,
      answer('all', [
        { odds: 0.9, verb: 'approve' },
        { odds: 0.9, verb: 'approve' },
      ])
    )
    expect(bound).toEqual([])
    expect(unclear.map(({ key }) => key)).toEqual([
      'card:oksana',
      'card:hetzner',
    ])
  })

  test('a bare yes binds a list that asks one thing', () => {
    const items = [card('a', 'archive'), card('b', 'archive')]
    const { bound } = bindAnswer(
      items,
      answer('all', [
        { odds: 0.9, verb: 'approve' },
        { odds: 0.9, verb: 'approve' },
      ])
    )
    expect(bound).toHaveLength(2)
  })

  test('two sends in one reply send nothing and ask which first', () => {
    const items = [card('oksana', 'reply'), card('serhii', 'reply')]
    const { bound, oneByOne } = bindAnswer(
      items,
      answer('all', [
        { odds: 0.95, verb: 'approve' },
        { odds: 0.95, verb: 'approve' },
      ])
    )
    expect(bound).toEqual([])
    expect(oneByOne.map(({ key }) => key)).toEqual([
      'card:oksana',
      'card:serhii',
    ])
  })

  test('a send needs surer odds than a skip', () => {
    const items = [card('oksana', 'reply'), card('hetzner', 'pay')]
    const { bound, unclear } = bindAnswer(
      items,
      answer('named', [
        { odds: 0.7, verb: 'approve' },
        { odds: 0.65, verb: 'skip' },
      ])
    )
    expect(bound.map(({ item }) => item.key)).toEqual(['card:hetzner'])
    expect(unclear.map(({ key }) => key)).toEqual(['card:oksana'])
  })

  test('an item the list did not show binds only when named', () => {
    const items = [
      card('a', 'archive'),
      card('b', 'archive', { listed: false }),
    ]
    const yes = { odds: 0.9, verb: 'approve' } as const
    expect(bindAnswer(items, answer('all', [yes, yes])).bound).toHaveLength(1)
    expect(bindAnswer(items, answer('named', [no, yes])).bound).toHaveLength(1)
  })

  test('an item settled since keeps its number, so the rest never shift', () => {
    const items = [null, card('hetzner', 'pay')]
    const { bound } = bindAnswer(
      items,
      answer('named', [no, { odds: 0.9, verb: 'approve' }])
    )
    expect(bound.map(({ item }) => item.key)).toEqual(['card:hetzner'])
  })

  test('a message that answers nothing leaves everything to the agent', () => {
    const items = [card('a', 'archive')]
    const bound = bindAnswer(
      items,
      answer('none', [{ odds: 0.9, verb: 'approve' }], true)
    )
    expect(bound.bound).toEqual([])
    expect(bound.rest).toBe(true)
  })

  test('a verb the item does not offer never binds', () => {
    const items = [card('hetzner', 'pay')]
    const { bound } = bindAnswer(
      items,
      answer('named', [{ odds: 0.99, verb: 'unsubscribe' }])
    )
    expect(bound).toEqual([])
  })
})
