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

## History

What was done toward verification, so none of it has to be rediscovered.

### 2026-11-11: Data Access, first pass

- **Branding was already verified:** Fewmail, fewmail.app, `/privacy`, `/terms`, authorized domain `fewmail.app`, contact valerii@wannabespace.com. No logo is set; uploading one would restart brand review.
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
- A test email "Project sync this week" was sent from wannabespace.llc@gmail.com to valerii.strilets@gmail.com.
- Fewmail's reply to it was really sent.
- The Fewmail account of valerii.strilets@gmail.com was deleted twice and created again in the take.
- A test event was created and deleted.
- Real mail is visible in the video: subjects, the Gmail Sent list and an old Vercel sign-in code. If Google objects, re-shoot on a cleaner mailbox.

### 2026-11-16/17: Data Access completed and submitted

- **Contacts:** added `contacts` and `contacts.other.readonly`, which the app asks for since `a64c6cd`.
- **Texts:** the justifications were rewritten in plain language after the first versions read as machine-written. They are above.
- **Video link** pasted in Data Access and saved.
- **Questionnaire:** submitted from Verification Center → Prepare for verification, with the answers below.

  | Question | Answer |
  | --- | --- |
  | Personal use only | No |
  | Internal only | No |
  | Development/testing only | No |
  | WordPress SMTP plugin | No |

  Both acknowledgements (verification requirements, CASA) were ticked.
- **Status:** "Your app's data access is under review". No reply from Google yet.

<details>
<summary>Recording script (demo.sh)</summary>

Usage: `demo.sh part1` … `part4`, with the demo browser open and signed in to the Google account in it. Each part writes `<part>.mp4` next to the script.

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
  click find role link click --name 'Valerii Strilets'
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
