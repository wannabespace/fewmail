# CASA readiness

Google approves `gmail.modify` (a restricted scope) only after a Cloud App Security Assessment (CASA, Tier 2): an authorized lab scans the web app and API and checks answers to an OWASP ASVS based questionnaire. It is renewed every year. Calendar and Contacts are sensitive scopes and do not need it.

Submitted for verification on 2026-11-17. Google names the lab after its first review.

## To do

### Security headers

Neither `fewmail.app` nor `api.fewmail.app` sends any security header today, and it is the first thing a scan reports.

- [ ] **Web** (`apps/web/Caddyfile`, every response):
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` that turns off camera, microphone, geolocation and payment (the web uses none)
  - `Content-Security-Policy` with `frame-ancestors 'none'`, `script-src 'self' https://e.fewmail.app`, `connect-src 'self' https://api.fewmail.app https://e.fewmail.app` and `object-src 'none'`
- [ ] **Watch out:** a `srcDoc` iframe inherits the page's CSP, so the email frame (`thread-view.tsx`) will be held to it. Inline styles in mail need `style-src 'unsafe-inline'` and remote images need `img-src https: data: blob:`, or mail renders broken. Test a few real newsletters before shipping.
- [ ] **API** (`apps/api/index.ts`): `hono/secure-headers` on every route: HSTS, `nosniff`, `frame-ancestors 'none'`. Responses are JSON, audio and images, so a strict `default-src 'none'` fits, except the Wrapped preview HTML.
- [ ] **Cloudflare:** set the minimum TLS version to 1.2 and turn on HSTS for both hosts. HTTP already redirects to HTTPS and TLS 1.3 is served.

### Dependencies

- [ ] `pnpm audit --prod` finds one moderate issue: `postcss-selector-parser` < 6.1.5 through `@tailwindcss/typography` (GHSA-rj75-hqrm-r3gf). Bump it or add a `pnpm.overrides` entry.
- [ ] Add `pnpm audit --prod --audit-level=high` to CI and turn on Dependabot or Renovate, so the yearly re-assessment starts clean.

### Rate limiting

- [ ] Better Auth limits only `/auth/*`, in memory per instance. oRPC (`/rpc`), `/mcp`, `/voice/*` and the attachment and avatar routes have no limit. Add Cloudflare rate-limiting rules per IP on `api.fewmail.app`, or a limiter in Hono backed by Postgres or Redis, so that limits hold across instances.

### Keys and secrets

- [ ] Everything encrypted at rest uses one `ENCRYPTION_SECRET`, with no key id in the ciphertext and no rotation path. At minimum, document:
  - where it lives (Railway variables);
  - who can read it;
  - what happens if it leaks.

  Better: prefix ciphertexts with a key version, so a new key can be introduced and old rows re-encrypted.
- [ ] `BETTER_AUTH_SECRET` also keys the spam-report hashes. Rotating it resets sender reputation (see `architecture.md`). Write this down next to the rotation plan.
- [ ] Confirm the Postgres connection uses TLS (`sslmode=require`), or that it stays on Railway's private network.

### Accounts and access

- [ ] Turn on 2FA, and list who has access, for each of:
  - Google Cloud (project `fewmail`);
  - Railway;
  - Cloudflare;
  - GitHub;
  - Stripe;
  - PostHog;
  - the domain registrar.

  The questionnaire asks.
- [ ] A one-page incident response note: who is told, how a leaked token or key is revoked (Google OAuth client secret, `ENCRYPTION_SECRET`, Stripe, Telegram and WhatsApp secrets), and how users are notified.

### Logging and monitoring

- [ ] Security events are not logged as such. Log, without addresses or content:
  - failed sign-ins and rejected webhooks (bad Stripe, WhatsApp, Telegram or Gmail push signatures);
  - MCP clients being refused;
  - account deletions.
- [ ] Error alerting: today errors only reach Railway's logs. Any alert, even an email on a spike of 5xx responses, answers the "do you monitor" questions.

### Data retention

- [ ] Synced mail is kept for as long as the account exists (privacy policy §8). This is allowed, but the lab asks why. Either keep the justification ready (Home and the agent's context need history), or prune message bodies older than a set window and say so in §8.

### Before the scan

- [ ] Run OWASP ZAP (baseline, then authenticated) against `fewmail.app` and `api.fewmail.app`, and fix what it reports before the lab runs its own scan.
- [ ] Have a test account ready for the lab, made for the lab and kept out of the repo, with a little mail in it.

## Already in place

- **TLS:** HTTPS only; HTTP answers 301 to HTTPS; TLS 1.3 at Cloudflare.
- **Encryption at rest:**
  - Every text column from a user or their mail is AES-GCM encrypted (`packages/db/utils.ts`).
  - OAuth tokens are encrypted by Better Auth (`encryptOAuthTokens`).
  - Contacts are never stored in the database; they are cached in memory only.
  - Calendar events are read live from Google.
- **Email rendering:** mail HTML is shown in an iframe sandboxed without `allow-scripts`, and remote content is blocked by its own CSP until the user allows images (`thread-view.tsx`).
- **Webhooks verified:**
  - Stripe: signature;
  - WhatsApp: HMAC with `timingSafeEqual`;
  - Telegram: secret token;
  - Gmail push: Google-signed JWT with the endpoint as audience.
- **CORS:** the API allows only `WEB_URL`, with credentials.
- **Sessions:** Better Auth cookies on `fewmail.app` and its subdomains, cached for 5 minutes, so a revoked session ends within 5 minutes.
- **MCP:** JWT access tokens are bound to the MCP URL, and each call also needs the user's consent row, so Settings → Disconnect cuts a client off at once. Actions that change mail wait for approval in Fewmail.
- **Consent for writes:** nothing changes in Gmail without an approved action or a rule the user turned on. Sending always needs an explicit approval.
- **Account deletion:** deletes every user row (all foreign keys cascade), revokes the Google grant, cancels billing and deletes the Stripe customer.
- **Logs:** no bodies, subjects, addresses or drafts. MCP logs only the tool name, access level and timing.
- **Analytics:** PostHog session replay masks all text, inputs and element attributes.
- **Errors:** responses carry a code and a generic message, never a stack trace.
- **Secrets:** none tracked in git (only `.env.example`).
