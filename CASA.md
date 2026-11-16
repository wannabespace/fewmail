# CASA readiness

Google approves `gmail.modify` (a restricted scope) only after a Cloud App Security Assessment (CASA, Tier 2): an authorized lab scans the web app and API and checks answers to an OWASP ASVS based questionnaire. It is renewed every year. Calendar and Contacts are sensitive scopes and do not need it.

Submitted for verification on 2026-11-17. Google names the lab after its first review.

## Verification status

- **Where:** Google Cloud console, project `fewmail`, Google Auth Platform → Verification Center (signed in as the Google account at `authuser=2`). Branding is verified; data access is "under review".
- **Google writes to** valerii@wannabespace.com. Answer the same day: every delay puts the app back in the queue.
- **Scopes submitted:**
  - `gmail.modify` (restricted, "Email productivity");
  - `calendar.events`, `contacts`, `contacts.other.readonly` (sensitive);
  - `openid`, `userinfo.email`, `userinfo.profile`.

  They match `apps/api/lib/auth.ts`, so any change to the scopes there must be made in Data Access too, and needs a new video.
- **Demo video:** https://youtu.be/Q3MRryOLweI (Unlisted, 2:37). It shows, in order:
  - sign-in through Google's unverified-app warning and the consent screen, with the client ID in the address bar;
  - Home;
  - Mail: a drafted reply sent and archived, then the same thread in Gmail;
  - Calendar: an event added, shown in Google Calendar, then deleted;
  - People search;
  - Settings → Delete account.
- **Acknowledged when submitting:** the verification requirements, and that restricted scopes need CASA, re-certified every year.
- **Expected timeline** (developers' experience, not a Google promise):

  | Stage | Roughly |
  | --- | --- |
  | First reply from Google | a few days to 2 weeks |
  | Rounds of fixes (video, texts, privacy policy), often 1 to 3 | 1 to 4 weeks |
  | Calendar and Contacts approved | usually before CASA |
  | CASA: lab, scan, fixes, report | 2 to 6 weeks |
  | Final Gmail approval after the CASA report | 1 to 2 weeks |

  In total, plan for 1 to 3 months. Until then, users see the unverified-app warning and sign-ins are capped at 100 users.

### Justifications as submitted

Keep replies to Google consistent with these, and update them in Data Access if the product changes.

**Gmail (`gmail.modify`):**

> Fewmail is an email client with an assistant built in. We read the inbox to show people what needs their attention, catch spam and suggest replies written the way they usually write. When the user agrees, Fewmail also archives emails, marks them as read, moves spam and unsubscribes from mailing lists. A reply is only sent after the user approves it, in the app or in our Telegram or WhatsApp bot.
>
> We looked at narrower scopes first. gmail.readonly can't archive or send. gmail.send and gmail.labels can't read the emails we summarize and reply to. gmail.metadata doesn't include the message body. gmail.modify covers all of this and still can't permanently delete anything.
>
> Email content is encrypted in our database. We don't sell it or train models on it, and we follow the Google API Services User Data Policy, including the Limited Use requirements.

**Sensitive (Calendar, Contacts):**

> Calendar: Fewmail has a calendar next to the inbox. We show the user's events there and use them when they ask the assistant something like "am I free on Thursday?". Users can add an event themselves or ask us to add a meeting from an email, and they can edit or delete events on the same page, so read-only access isn't enough.
>
> Contacts: we use the user's contacts and other contacts to show real names and photos next to senders, to suggest recipients while writing, and on the People page. A user can also delete a contact they no longer need there, so we need contacts rather than contacts.readonly. Other contacts are only read.
>
> We only change something in Calendar or Contacts when the user asks. Contacts are never sent to the AI model. Users can uncheck Calendar or Contacts on the consent screen and the rest of the app keeps working.

**Additional info:**

> No test account needed: anyone can sign in with Google at https://fewmail.app/login. The video shows the whole sign-in with the consent screen, then each scope in use. Gmail: replying to an email from Fewmail and archiving it, then the same thread in Gmail. Calendar: adding an event, seeing it in Google Calendar, then deleting it. Contacts: searching on the People page.

## Suggested order

1. Security headers. This is the biggest scan finding and is mostly config. Test the mail frame under the new CSP.
2. Dependency fix and audit in CI.
3. Rate limiting.
4. Secrets: document them, check the database TLS.
5. 2FA and the access list, and the incident note. These are not code; the owner does them.
6. Security-event logging and alerting.
7. Retention answer.
8. A ZAP self-scan, then fix what it finds.

Follow `CLAUDE.md` and `.agents/rules/` as for any change: for example, headers touch `architecture.md`, and retention touches the privacy policy.

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

## How this was checked (2026-11-17)

Re-run these to see what is fixed:

```sh
# Security headers (none today; only `server: cloudflare`)
curl -sI https://fewmail.app/home | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy'
curl -sI https://api.fewmail.app/auth/ok | grep -iE 'strict-transport|content-security|x-frame|x-content-type'

# HTTP → HTTPS (301 today), old TLS refused
curl -sI http://fewmail.app | head -1
echo | openssl s_client -connect fewmail.app:443 -tls1_1 2>&1 | grep -E 'Protocol|Cipher is'

# Known vulnerabilities in production dependencies (1 moderate today)
pnpm audit --prod

# Every table that references users cascades on delete (no output = all do)
grep -rnE "references\(\(\) => users" packages/db/schema/*.ts | grep -v cascade
```
