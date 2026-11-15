import { expect, test } from 'bun:test'

import { oneTimeCode } from './one-time-code'

test('a sign-in code is found beside its word', () => {
  expect(oneTimeCode('Sign in', 'Your verification code is 482913.')).toBe(
    '482913'
  )
  expect(oneTimeCode('Sign in', 'Your code: 123-456')).toBe('123456')
  expect(oneTimeCode('Login', 'OTP 4821 is valid for 5 minutes.')).toBe('4821')
  expect(oneTimeCode('Anmeldung', 'Ihr Bestätigungscode lautet 774512.')).toBe(
    '774512'
  )
  expect(oneTimeCode('Giriş', 'Doğrulama kodunuz: 551203')).toBe('551203')
  expect(oneTimeCode('Sign in', 'Your one-time passcode is 908812.')).toBe(
    '908812'
  )
})

const pitch = (lead: string) =>
  `Hi, ${lead}. Exported to the US, Japan, Canada, Taiwan. Certifications: FSSC 22000 and US FDA, ensuring stable supply.`

test('a number in an ordinary email is not a code', () => {
  for (const lead of [
    'our hotpot udon',
    'a low carbon footprint',
    'not a one-time deal',
    'Kodae Foods',
    'we hold the code of practice',
  ]) {
    expect(oneTimeCode("Korea's #1 instant udon", pitch(lead))).toBeNull()
  }
  expect(
    oneTimeCode('Audit', 'Our ISO 9001 verification is attached.')
  ).toBeNull()
})
