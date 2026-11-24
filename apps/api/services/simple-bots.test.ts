import { describe, expect, test } from 'bun:test'

import { fromMatches } from './simple-bots'

describe('fromMatches', () => {
  test('an address takes only that sender', () => {
    expect(fromMatches('ann@gmail.com', 'Ann@Gmail.com', null)).toBe(true)
    expect(fromMatches('ann@gmail.com', 'joann@gmail.com', 'Jo Ann')).toBe(
      false
    )
    expect(fromMatches('bob@x.com', 'bob@x.com.evil.io', null)).toBe(false)
  })

  test('a domain takes its own senders only', () => {
    expect(fromMatches('@hetzner.com', 'billing@hetzner.com', null)).toBe(true)
    expect(fromMatches('@hetzner.com', 'a@hetzner.com.evil.io', null)).toBe(
      false
    )
  })

  test('a name is found anywhere in the sender', () => {
    expect(fromMatches('Hetzner', 'billing@hetzner.com', null)).toBe(true)
    expect(fromMatches('Notion', 'team@makenotion.com', 'Notion Team')).toBe(
      true
    )
  })
})
