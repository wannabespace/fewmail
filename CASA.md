# CASA readiness

Google approves `gmail.modify` (a restricted scope) only after a Cloud App Security Assessment (CASA, Tier 2): an authorized lab scans the web app and API and checks answers to an OWASP ASVS based questionnaire. It is renewed every year. Calendar and Contacts are sensitive scopes and do not need it.

Submitted for verification on 2026-11-17. Google names the lab after its first review.

## Verification status

- **Where:** Google Cloud console, project `fewmail`, Google Auth Platform → Verification Center. Branding is verified; data access is "under review".
- **Google writes to** the developer contact on the consent screen. Answer the same day: every delay puts the app back in the queue.
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

## Done in code (2026-11-17)

- **Security headers.** Web (`apps/web/Caddyfile`): HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy` and a CSP with `frame-ancestors 'none'`, `object-src 'none'`, scripts only from our origin, PostHog's proxy and two hashed inline scripts (the build fails if a page's inline script has no hash there). The mail frame inherits it: inline styles and remote images still work, checked in Chrome against the built site. API (`apps/api/index.ts`): `hono/secure-headers` on every route, `default-src 'none'; frame-ancestors 'none'`, except attachments (no CSP, so PDFs open).
- **Dependencies.** `postcss-selector-parser` pinned to `^6.1.5` (GHSA-rj75-hqrm-r3gf); `pnpm audit --prod` is clean. CI (`.github/workflows/check.yml`) runs lint, types, tests, TruffleHog and `pnpm audit --prod --audit-level=high`; Dependabot is on.
- **Rate limiting.** 1000 requests a minute per IP on everything but the providers' webhooks, in memory (the API is one replica). Better Auth still limits `/auth/*`.
- **Security-event logging.** Every 401/403/429, a sign-in Google refused and every account deletion is logged as `security …` (method, route's first segment, status; no address or content). Rejected webhooks (Stripe now answers 401, WhatsApp, Telegram, Gmail push) and refused MCP clients fall under it.
- **Error alerting.** Every logged error also sends `server_error { label, error }` to PostHog (class name only), so an alert can watch it.
- **Fixes from the self-review** (three parallel reviews of authorization, injection and auth/crypto):
  - `/avatar` fetched the user's `image` field, which `/auth/update-user` let anyone set to any URL, `file://` included: the server could read its own environment. Photos are now fetched only from `https://*.googleusercontent.com`, `/auth/update-user` and `/auth/change-email` are disabled, and `/avatar` serves only raster image types.
  - `/og/w/:token` put the raw token into its HTML: reflected XSS on the API origin. The token must be exactly two segments and every URL in the page is escaped.
  - An unsubscribe by email took recipients, subject and body from the sender's `mailto:`: several recipients, injected headers and raw HTML. Now one address, the body as escaped text, and no header value in any outgoing mail can carry a line break.
  - Links from mail the server fetches (one-click unsubscribe, unsubscribe pages) were checked by name only, so `127.0.0.1.nip.io` passed. The name is now resolved and private, loopback, link-local, CGNAT and ULA addresses are refused on every hop.
  - WhatsApp's verify token is compared in constant time; `/voice/reading` refuses cross-site requests, so another site's link cannot spend the month's speech.

## To do

### Owner (not code)

- [ ] **Cloudflare:** minimum TLS 1.2 and HSTS for both hosts. Lock the API's origin to Cloudflare (or drop the `*.up.railway.app` domain): `cf-connecting-ip` keys the rate limits and can be forged by anyone reaching Railway directly.
- [ ] **PostHog:** an alert on a spike of `server_error`.
- [ ] **2FA, and a list of who has access,** for Google Cloud (project `fewmail`), Railway, Cloudflare, GitHub, Stripe, PostHog and the domain registrar.
- [ ] **Incident response note** (one page): who is told, how a leaked secret is revoked (Google OAuth client secret, `ENCRYPTION_SECRET`, `BETTER_AUTH_SECRET`, Stripe, Telegram and WhatsApp secrets), and how users are notified.
- [ ] **Postgres TLS:** confirm `DATABASE_URL` stays on Railway's private network (or uses `sslmode=require`).
- [ ] **Test account for the lab,** kept out of the repo, with a little mail in it.
- [ ] **ZAP:** a baseline, then an authenticated scan against `fewmail.app` and `api.fewmail.app` after this ships, and fix what it reports.

### Code, next

- [ ] **MCP consent phishing.** Anyone can register an OAuth client (`allowUnauthenticatedClientRegistration`) and name it "Claude"; `/connect` shows only that name and Enter accepts. Show the redirect host and an "unverified" mark for dynamically registered clients, and drop Enter as accept.
- [ ] **Desktop sign-in phishing.** `desktopSignIn.wait` needs no auth, so an attacker can start a flow and send someone the `/desktop?challenge=…` link with its code. Show where the waiting app is (IP, country, OS) on the confirm page, or have the user type the code shown in the app.
- [ ] **Messenger link codes** never expire and work in Telegram groups: give them a TTL, rotate them, refuse non-private chats.
- [ ] **Keys.** Everything at rest uses one `ENCRYPTION_SECRET`, with no key id in the ciphertext. Prefix ciphertexts with a key version so a key can be rotated. `BETTER_AUTH_SECRET` also keys the spam-report hashes and Wrapped links: rotating it resets sender reputation and old Wrapped links. Require 32+ characters for both secrets in `env.ts`.
- [ ] **Data retention.** Synced mail is kept while the account exists (privacy policy §8). Keep the justification ready (Home and the agent's context need history), or prune old bodies and say so in §8.

## Already in place

- **TLS:** HTTPS only; HTTP answers 301 to HTTPS; TLS 1.3 at Cloudflare.
- **Encryption at rest:**
  - Every text column from a user or their mail is AES-GCM encrypted (`packages/db/utils.ts`).
  - OAuth tokens are encrypted by Better Auth (`encryptOAuthTokens`).
  - Contacts are never stored in the database; they are cached in memory only.
  - Calendar events are read live from Google.
- **Email rendering:** mail HTML is shown in an iframe sandboxed without `allow-scripts` or `allow-forms`, and remote content is blocked by its own CSP until the user allows images (`thread-view.tsx`).
- **Authorization:** every service takes the session's or token's `userId`, and every client-supplied id is checked against it (reviewed 2026-11-17, no IDOR found).
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
- **Secrets:** none tracked in git, now or in history (only `.env.example`); TruffleHog checks every push.

## How this was checked (2026-11-17)

Re-run these to see what is fixed:

```sh
# Security headers
curl -sI https://fewmail.app/home | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy'
curl -sI https://api.fewmail.app/auth/ok | grep -iE 'strict-transport|content-security|x-frame|x-content-type'

# HTTP → HTTPS (301 today), old TLS refused
curl -sI http://fewmail.app | head -1
echo | openssl s_client -connect fewmail.app:443 -tls1_1 2>&1 | grep -E 'Protocol|Cipher is'

# Known vulnerabilities in production dependencies (none)
pnpm audit --prod

# Every table that references users cascades on delete (no output = all do)
grep -rnE "references\(\(\) => users" packages/db/schema/*.ts | grep -v cascade
```

## History

What was done toward verification, so none of it has to be rediscovered.

### 2026-11-11: Data Access, first pass

- **Branding was already verified:** Fewmail, fewmail.app, `/privacy`, `/terms`, authorized domain `fewmail.app`, the developer contact email. No logo is set; uploading one would restart brand review.
- **Data Access:**
  - The project had no scopes declared.
  - Added `openid`, `userinfo.email`, `userinfo.profile` and `gmail.modify`.
  - Picked "Email productivity" and wrote a `gmail.modify` justification, checked against `apps/web/src/legal/privacy-policy.md`.
  - Saved.
- **Submission blocked:** "Prepare for verification" refused it as "Missing … demo video". Nothing was submitted.

### 2026-11-12: test run before recording

- **Calendar:**
  - The app also asks for `calendar.events` (`apps/api/lib/auth.ts`), which was missing from Data Access, so it was added with a justification.
  - The Google Calendar API was not enabled in the project, so creating an event answered 500. It is enabled now.
- **Fixes shipped while clicking through:**

  | Commit | Fix |
  | --- | --- |
  | `b325467` | Gmail 403/429 backoff |
  | `1f3a493` | "Reading your inbox…" until the first sync; labelled Listen button; Clear-out no longer opens on its own |
  | `de57c0d` | Gmail empty-204 crash |
  | `5463e34` | Better Auth takes the IP from `cf-connecting-ip` |
  | `cce5cf3` | Mistral 429 retry |
  | `a998edf` | ⌘K search ladder |
  | `56a010d` | Visible compose button |
  | `de6eeab` | Board presets |

- **Recording attempt:** the Claude in Chrome overlay and personal tabs would have been in the video, so recording moved to a separate browser (below).

### 2026-11-16: recording the demo video

**Method:**

- A clean Chrome profile, driven over CDP by `agent-browser` (0.41.2). The script is below.
- `ffmpeg` (installed with brew) captured the screen on the external display, which gets no macOS notification banners. It was cropped to the 1440x900 window, so the address bar is in every frame.
- agent-browser's `record --cursor` ran alongside it to draw the pointer.
- The take was shot in four parts and joined with ffmpeg's concat:
  - part 1 in full;
  - part 2 cut to 0–54 s;
  - part 3 cut to 0–23.6 s;
  - part 4 in full.
- **Result:** `~/Desktop/fewmail-oauth-demo.mp4` (2:37, 1440x900, H.264, no voice), uploaded Unlisted as https://youtu.be/Q3MRryOLweI. The consent frame shows `client_id=904482129450-3ssd…` in the address bar.

**Launching the demo browser:**

```sh
open -na "Google Chrome" --args --user-data-dir="$HOME/.fewmail-demo-chrome" \
  --remote-debugging-port=9222 --window-size=1440,900 --window-position=0,25 \
  --lang=en-US --accept-lang=en-US,en --no-first-run --no-default-browser-check
```

**Problems hit, so a re-shoot avoids them:**

- The profile came up in Ukrainian. Fix: the en-US flags above, plus Fewmail's locale set to `"en"` in localStorage and in the `fewmail.locale` cookie.
- agent-browser jumped to Chrome's hidden Gemini webview. Fix: `ab tab t1` before every step.
- **The consent screen:** click only "Select all". Clicking it and then each checkbox unticks them, and the first take ended without Calendar connected.
- To see the full consent screen again, delete the Fewmail account (Settings → Delete account). This revokes the Google grant.
- ffmpeg failed with "Invalid device index", because indexes change. Fix: pick the screen by name, `"Capture screen 1:none"`.
- Nav links didn't respond to role locators, and "Week" is not a button. Fix: CSS (`nav a[href="/mail"]`) and text locators.
- **Possible bug (not fixed):** after the first sync, Mail's list showed only a spinner for about 2 minutes, apparently waiting out Gmail's quota backoff. The script loads `/mail` before it starts recording.

**Side effects on real accounts:**

- A test email "Project sync this week" was sent from a second test account to the owner's account.
- Fewmail's reply to it was really sent.
- The owner's Fewmail account was deleted twice and created again in the take.
- A test event was created and deleted.
- Real mail is visible in the video. If Google objects, re-shoot on a cleaner mailbox.

### 2026-11-16/17: Data Access completed and submitted

- **Contacts:** added `contacts` and `contacts.other.readonly`, which the app asks for since `a64c6cd`.
- **Texts:** the justifications were rewritten in plain language after the first versions read as machine-written. They are above.
- **Video link** pasted in Data Access and saved.
- **Questionnaire:** submitted from Verification Center → Prepare for verification, with the answers below.

  | Question                 | Answer |
  | ------------------------ | ------ |
  | Personal use only        | No     |
  | Internal only            | No     |
  | Development/testing only | No     |
  | WordPress SMTP plugin    | No     |

  Both acknowledgements (verification requirements, CASA) were ticked.

- **Status:** "Your app's data access is under review". No reply from Google yet.

<details>
<summary>Recording script (demo.sh)</summary>

Usage: `GOOGLE_ACCOUNT_NAME='<name on the Google account>' demo.sh part1` … `part4`, with the demo browser open and signed in to that Google account. Each part writes `<part>.mp4` next to the script.

```bash
#!/bin/bash
# Fewmail OAuth demo: drives the demo Chrome (CDP 9222) and screen-records its window, address bar included.
# Usage: demo.sh <part1|part2>
set -uo pipefail
D=$(cd "$(dirname "$0")" && pwd)
S=demo-5219cd301b0d
ab() { agent-browser --session "$S" --cdp 9222 "$@"; }
pause() { sleep "${1:-1.2}"; }
say() { echo "▶ $(date +%T) $*"; }
must() { ab "$@" >/dev/null || { echo "✗ $*"; stop_capture; exit 1; }; }
click() { must "$@"; pause 1.2; }
typeslow() { local w; for w in $1; do ab keyboard type "$w " >/dev/null; sleep 0.12; done; }

front() {
  ab tab t1 >/dev/null
  local pid
  pid=$(pgrep -f "user-data-dir=$HOME/.fewmail-demo-chrome" | head -1)
  osascript -e "tell application \"System Events\" to tell (first process whose unix id is $pid)" \
    -e 'set frontmost to true' -e 'set position of window 1 to {-2440, 0}' \
    -e 'set size of window 1 to {1440, 900}' -e 'end tell' >/dev/null
}
# The external display (no notification banners); the window sits at 1000,135 in its pixels.
start_capture() {
  front
  ab record start "$D/cursor-$1.mp4" --cursor >/dev/null
  ffmpeg -v error -y -f avfoundation -capture_cursor 0 -framerate 30 -pixel_format nv12 -i "Capture screen 1:none" \
    -vf "crop=1440:900:1000:135" -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p "$D/$1.mp4" \
    </dev/null &
  FF=$!
  pause 1.5
}
stop_capture() {
  [ -n "${FF:-}" ] && kill -INT "$FF" 2>/dev/null && wait "$FF" 2>/dev/null
  FF=
  ab record stop >/dev/null 2>&1
}

part1() {
  ab open https://fewmail.app >/dev/null
  pause 3
  start_capture part1
  say landing
  pause 3
  click find role button click --name 'Sign in'
  ab wait --url '**/login' >/dev/null
  pause 4.5
  say google
  click find role button click --name 'Continue with Google'
  ab wait --url '**accounts.google.com/**' >/dev/null
  pause 3
  click find role link click --name "$GOOGLE_ACCOUNT_NAME"
  ab wait --text 'verified this app' >/dev/null
  pause 3
  click find role link click --name 'Advanced'
  pause 1
  click find role link click --name 'Go to Fewmail (unsafe)'
  pause 2
  say consent
  # Google shows a sign-in step, then the scopes; Continue on each until Fewmail is back.
  for _ in 1 2 3; do
    case "$(ab get url)" in *fewmail.app*) break ;; esac
    ab snapshot -i -c >"$D/consent.txt"
    if grep -q 'checkbox' "$D/consent.txt"; then
      pause 2
      ab click "@$(grep -o 'checkbox "Select all" \[checked=false, ref=e[0-9]*' "$D/consent.txt" | grep -o 'e[0-9]*$')" >/dev/null
      pause 2.5
      ab scroll down 300 >/dev/null
    fi
    pause 4
    click find role button click --name 'Continue'
    pause 4
  done
  say onboarding
  ab wait --url '**/onboarding' >/dev/null
  pause 3
  click find role button click --name 'Start'
  ab wait --url '**/home' >/dev/null
  pause 6
  stop_capture
}

slot() {
  # The middle of a week-view hour slot: column from the day's header, row from the hour's label.
  ab eval "(() => {
    const day = [...document.querySelectorAll('*')].find(e => e.children.length < 3 && /^Thu\s*19$/.test(e.textContent.trim()))
    const hour = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && e.textContent.trim() === '3:00 PM')
    const d = day.getBoundingClientRect(), h = hour.getBoundingClientRect()
    return Math.round(d.x + d.width / 2) + ' ' + Math.round(h.y + 18)
  })()" | tr -d '"'
}

part2() {
  # Mail's first list can wait minutes on Gmail's quota: load it before recording, then go Home without a reload.
  ab open https://fewmail.app/mail >/dev/null
  for _ in $(seq 1 40); do
    [ "$(ab eval 'document.body.innerText.includes("Project sync this week")')" = true ] && break
    sleep 6
  done
  ab click 'nav a[href="/home"]' >/dev/null
  ab wait --text 'need you' >/dev/null
  pause 2
  start_capture part2
  say home
  pause 3
  ab scroll down 500 >/dev/null; pause 2.5
  ab scroll up 500 >/dev/null; pause 1.5

  say mail
  click click 'nav a[href="/mail"]'
  pause 1.5
  click find text 'Project sync this week' click
  pause 5
  say send
  local send
  send=$(ab snapshot -i -c | grep -o 'button "Send" \[ref=e[0-9]*' | tail -1 | grep -o 'e[0-9]*$')
  ab hover "@$send" >/dev/null; pause 1.5
  click click "@$send"
  pause 12
  say archive
  click find role button click --name 'Archive'
  pause 3

  say gmail
  ab open 'https://mail.google.com/mail/u/0/#sent' >/dev/null
  pause 6
  ab open 'https://mail.google.com/mail/u/0/#search/subject%3A%22Project+sync+this+week%22' >/dev/null
  pause 6

  stop_capture
}

part3() {
  ab open https://fewmail.app/calendar >/dev/null
  pause 4
  start_capture part3
  say calendar
  pause 2
  click find text 'Week' click --exact
  pause 1
  local xy
  xy=$(slot)
  ab mouse move ${xy} >/dev/null; pause 0.6
  ab mouse down left >/dev/null; ab mouse up left >/dev/null
  pause 1.5
  must find label 'Add a title' click
  typeslow 'Project sync with Wannabe Space'
  pause 1
  click find role button click --name 'Add event'
  pause 3
  ab open 'https://calendar.google.com/calendar/r/week/2026/11/19' >/dev/null
  pause 6
  stop_capture
}

part4() {
  ab open https://fewmail.app/calendar >/dev/null
  pause 4
  start_capture part4
  say delete event
  pause 1.5
  click find text 'Project sync with Wannabe Space' click
  pause 1.5
  click find role button click --name 'Delete'
  pause 3

  say people
  click find role button click --name 'People'
  pause 1
  must find placeholder 'Find a person' click
  typeslow 'Wannabe'
  pause 3

  say settings
  ab open https://fewmail.app/settings >/dev/null
  pause 2
  ab scroll down 2000 >/dev/null
  pause 1.5
  ab find role button hover --name 'Delete account' >/dev/null
  pause 3
  stop_capture
}

"$1"
```

</details>
