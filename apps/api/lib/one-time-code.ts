// Suffixes count too: "Bestätigungscode", "verificatiecode", "doğrulama kodu". Inside a word they do not: "hotpot", "footprint", "Kodak", "a one-time deal".
const KEYWORD =
  /codes?(?!\p{L})|kod(?:u|un|unuz|em|en|y)?(?!\p{L})|código|codice|код|(?<!\p{L})otp(?!\p{L})|one[- ]time[- ](?:code|pass|pin)|(?<!\p{L})verif|(?<!\p{L})pin(?!\p{L})|コード|認証|验证码|驗證碼|校验码|动态码|인증|코드|कोड|ओटीपी/giu

// "Promo code SAVE20", "zip code 10001" and "order #123456" are not sign-in codes.
const NOT_A_CODE =
  /promo|coupon|discount|voucher|gift|referral|invit|zip|postal|post ?code|qr|bar ?code|tracking|conduct|country|area code|source code|dress code|промокод|знижк|скидк|купон|rabatt|gutschein|descuento|cupón|réduction|sconto|indirim|korting|折扣|优惠|割引|쿠폰/iu

const CANDIDATE =
  /(?<![\p{L}\p{N}#$€£₴.,/]|\d[ -])(?:\d{3,4}[ -]\d{3,4}|\d{4,8}|(?=[A-Z\d-]*\d)[A-Z\d]{3}-[A-Z\d]{3}|(?=[A-Z\d]*\d)(?=[A-Z\d]*[A-Z])[A-Z\d]{5,8})(?![\p{L}\p{N}%$€£₴]|[ -]?\d|[.,:/]\d)/gu

// "support.google.com/code/…" once matched the sender's street number in the footer.
const LINK = /\S+:\/\/\S+/gu
// "FSSC 22000", "ISO 9001": a standard's number follows its acronym; "OTP 4821" is still a code.
const AFTER_ACRONYM = /(?<!\p{L})(?<acronym>[A-Z]{2,}) $/u
const YEAR = /^(?:19|20)\d\d$/u
const AFTER = 100
const BEFORE = 60
const BODY_READ = 3000

const isStandardNumber = (before: string) => {
  const acronym = before.match(AFTER_ACRONYM)?.groups?.acronym
  return (
    acronym !== undefined && !new RegExp(KEYWORD.source, 'iu').test(acronym)
  )
}

const candidates = (text: string) =>
  [...text.matchAll(CANDIDATE)]
    .filter(
      ({ 0: match, index }) =>
        !YEAR.test(match) && !isStandardNumber(text.slice(0, index))
    )
    .map(([match]) => match)

const codeIn = (text: string) => {
  for (const keyword of text.matchAll(KEYWORD)) {
    const start = keyword.index
    const end = start + keyword[0].length
    if (NOT_A_CODE.test(text.slice(Math.max(0, start - 30), end + 15))) {
      continue
    }
    const found =
      candidates(text.slice(end, end + AFTER)).at(0) ??
      candidates(text.slice(Math.max(0, start - BEFORE), start)).at(-1)
    if (found) {
      return found.replaceAll(/[ -]/gu, '')
    }
  }
  return null
}

/** A sign-in or verification code the sender asks to enter, the way iOS offers one above the keyboard. */
export const oneTimeCode = (subject: string, body: string) =>
  codeIn(subject) ??
  codeIn(
    body.slice(0, BODY_READ).replaceAll(LINK, ' ').replaceAll(/\s+/gu, ' ')
  )
