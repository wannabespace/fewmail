// Suffixes count too: "Bestätigungscode", "verificatiecode", "doğrulama kodu".
const KEYWORD =
  /code|kod|código|codice|код|passcode|otp|one[- ]time|verif|(?<!\p{L})pin(?!\p{L})|コード|認証|验证码|驗證碼|校验码|动态码|인증|코드|कोड|ओटीपी/giu

// "Promo code SAVE20", "zip code 10001" and "order #123456" are not sign-in codes.
const NOT_A_CODE =
  /promo|coupon|discount|voucher|gift|referral|invit|zip|postal|post ?code|qr|bar ?code|tracking|промокод|знижк|скидк|купон|rabatt|gutschein|descuento|cupón|réduction|sconto|indirim|korting|折扣|优惠|割引|쿠폰/iu

const CANDIDATE =
  /(?<![\p{L}\p{N}#$€£₴.,/]|\d[ -])(\d{3,4}[ -]\d{3,4}|\d{4,8}|(?=[A-Z\d]*\d)(?=[A-Z\d]*[A-Z])[A-Z\d]{5,8})(?![\p{L}\p{N}%$€£₴]|[ -]?\d|[.,:/]\d)/gu

const YEAR = /^(?:19|20)\d\d$/u
const AFTER = 100
const BEFORE = 60
const BODY_READ = 3000

const candidates = (text: string) =>
  [...text.matchAll(CANDIDATE)]
    .map(([match]) => match)
    .filter((match) => !YEAR.test(match))

const codeIn = (text: string) => {
  for (const keyword of text.matchAll(KEYWORD)) {
    const start = keyword.index
    const end = start + keyword[0].length
    if (NOT_A_CODE.test(text.slice(Math.max(0, start - 30), end + 10))) {
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
  codeIn(subject) ?? codeIn(body.slice(0, BODY_READ).replaceAll(/\s+/gu, ' '))
