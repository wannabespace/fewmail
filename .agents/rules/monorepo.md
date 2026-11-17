# Monorepo

pnpm workspaces + turbo, Bun runtime for the API, versions pinned in the `pnpm-workspace.yaml` catalog (shared with Tamery's choices).

| Command | What |
| --- | --- |
| `pnpm docker:start` | Postgres 18 on `localhost:5433` (5432 stays free for Tamery) |
| `pnpm db:generate` / `pnpm db:migrate` | Drizzle migrations (`packages/db/migrations`), env from the root `.env` |
| `pnpm dev` | Through portless: web `https://app.local.fewmail.app`, API `https://api.local.fewmail.app`; plus the worker (`dev:worker`, no URL) |
| `pnpm check` / `pnpm fix` | ultracite (oxlint + oxfmt) |

`apps/web` runs Vite with `--configLoader runner`: `vite.config.ts` imports `src/lib/seo.ts`, which reaches `@fewmail/shared/i18n`, and the default loader leaves workspace packages to Node, which cannot resolve their extensionless TS imports — the build fails with `ERR_MODULE_NOT_FOUND`.
| `bun check` in a package | type check |
| `bun run economics` / `bun test` in `apps/api` | AI cost per plan, and its budget (`lib/economics.test.ts`) |
| `pnpm tauri dev` in `apps/desktop` | The desktop app on the local web. Needs Rust (`rustup`'s toolchain on `PATH`). Not part of `pnpm dev` |
| `pnpm tauri build` in `apps/desktop` | The installers for this machine's system in `src-tauri/target/release/bundle`; the updater's signatures need `TAURI_SIGNING_PRIVATE_KEY` |
| `pnpm tauri icon ../../brand/icon/app-icon-macos-1024.png -o src-tauri/icons` in `apps/desktop` | The app's icons from the brand's (then delete the `android`, `ios` and `Square*` ones it adds) |

Env lives in the root `.env` (template: `.env.example`). Cross-service dev URLs (`API_URL`, `WEB_URL`) are not in `.env`: `setupPortlessEnvs(...)` (`@fewmail/shared/portless-env`) fills them at startup from the `portless` name in each app's `package.json`, worktree-aware; precedence: existing env var > portless. The web build also reads `WEB_URL` (canonical, sitemap and OG URLs), defaulting to `https://fewmail.app`. Production serves `dist` with Caddy (`apps/web/Dockerfile`, `apps/web/Caddyfile`): `<path>/index.html` when it exists, `app.html` otherwise, 404 for a missing `/assets/*`, and a public page redirected to its language (`architecture.md` → Marketing & SEO). Locally, `docker run -p 4319:4319 -e PORT=4319 -e API_URL=http://localhost:9 -v "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" -v "$PWD/dist:/srv:ro" caddy:2-alpine` in `apps/web` serves a build the same way (restart it after a rebuild: the build replaces `dist`). The proxy starts on `pnpm install` (`portless:start`, TLD `app`), shared with Tamery. A stopped backend shows up in the browser as a CORS error (portless answers 502 without CORS headers).

## Deploy (Railway)

The Railway project is code: `.railway/railway.ts` (`railway/iac`, root devDependency). Railway never reads `.railway/` during deploys: `.github/workflows/railway.yml` runs `railway config plan` and `railway config apply --yes` on every push to `main` that touches `.railway/**` (project token in the `RAILWAY_TOKEN` secret). Removals (a service or variable gone from the file) need a manual run with the `destructive` input. Locally the same two commands need Railway CLI ≥ 5.42.1. `railway.json` / `railway.toml` are deprecated and must not come back — a service cannot be managed by both.

- **postgres**, **api** and **worker**: one image, `apps/api/Dockerfile`, built with the repo root as context (it type-checks the API in a throwaway stage). `api` runs `index.ts` (HTTP, migrations on boot, Telegram webhook); `worker` overrides the start command with `worker.ts`.
- **worker**: exactly one replica, `overlapSeconds: 0`, `drainingSeconds: 30` — its job locks are in memory, so two copies would send the morning messages and Telegram pushes twice. On SIGTERM it stops ticking and waits for jobs in flight.
- **Secrets** are `preserve()` on `api` and set in the Railway dashboard, never in the repo; `worker` references `api`'s variables (`api.env.X`), so each value is set once. A new env var goes into `SECRETS` there and into `.env.example`.
- **@fewmail/web**: `apps/web/Dockerfile` (repo root as context): `vite build` with `API_URL` / `WEB_URL` as build args (referenced from the API), then a Caddy image serving `dist` on the `PORT` Railway injects (never set it in `railway.ts`; a custom domain is added in the Railway dashboard, never by `apply`, which refuses to register one, so `domains` only mirrors it; its target port must stay automatic, `apply` does not change it), domain `fewmail.app`. Never `vite dev` or `vite preview` in production.
- **Web and API go live together**: the web's healthcheck `/health` is proxied by Caddy to the API's `/health/$RAILWAY_GIT_COMMIT_SHA`, which answers 503 until the API runs that commit (`healthcheckTimeout: 600` covers the API's build). So a new web never talks to an old API, and a failed API deploy keeps the old web too. Both services share `watchPatterns` for this — a commit only the web picked up would never become healthy. Rolling the web back alone fails the same way: roll back the API first. Deploys need a git commit (`railway up` has no `RAILWAY_GIT_COMMIT_SHA`). The web build also gets that SHA (build arg) and emits it as `/version.txt`; an open app compares it with its own every minute and on focus and offers a reload.
- Service names in `railway.ts` are the existing ones (`@fewmail/api`, `@fewmail/web`, `Postgres`): IaC matches by name, so a new name creates a second service.

Google OAuth redirect URI: `https://api.local.fewmail.app/auth/callback/google (prod: https://api.fewmail.app/auth/callback/google)`; the Gmail, Google Calendar and People APIs must be enabled, the `calendar.events`, `contacts` and `contacts.other.readonly` scopes added to the consent screen, and, until verification, the user added as a test user.

## CI

`.github/workflows/check.yml` on every push to `main` and every PR: `pnpm check`, `pnpm check-types`, `pnpm test`, a TruffleHog scan for verified secrets and `pnpm audit --prod --audit-level=high` (a vulnerable transitive dependency is pinned in `overrides` in `pnpm-workspace.yaml`). Dependabot opens weekly grouped updates.

## Desktop release

Bump `version` in `apps/desktop/src-tauri/tauri.conf.json`, push the tag `desktop-v<version>`: `.github/workflows/desktop.yml` builds with `tauri-action` on macOS (Apple silicon and Intel), Windows and Linux, signs and notarizes the Mac builds with the Developer ID, signs every update with the updater key, and publishes all of it with `latest.json` as the release of that tag in this repository (public, so the app downloads from it without a token; keep every other release out of it, since the updater reads `releases/latest`). Secrets: `APPLE_DEVELOPER_ID_P12` (the Developer ID Application certificate with its key, base64) and `APPLE_DEVELOPER_ID_P12_PASSWORD`, `APPLE_DEVELOPER_ID` (its full name, `Developer ID Application: … (TEAMID)`), an App Store Connect API key for notarization (`APPLE_API_KEY` — the `.p8` contents, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER`), `TAURI_SIGNING_PRIVATE_KEY` (the updater key, `~/.tauri/fewmail.key` on the machine that made it; its public half is `plugins.updater.pubkey`, and losing it means no installed app updates again); the release itself is published with the workflow's own `GITHUB_TOKEN`. Without `APPLE_DEVELOPER_ID` the Mac builds are signed ad hoc (macOS then asks to allow the app once in Privacy & Security); the Apple secrets turn on signing and notarization from the next release, and `APPLE_DEVELOPER_ID_P12` must be one line of base64. Windows builds are unsigned until a certificate is added. Keep `identifier` (`app.fewmail.desktop`): updates and the system's settings find the app by it.
