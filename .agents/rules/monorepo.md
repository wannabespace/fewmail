# Monorepo

pnpm workspaces + turbo, Bun runtime for the API, versions pinned in the `pnpm-workspace.yaml` catalog (shared with Tamery's choices).

| Command | What |
| --- | --- |
| `pnpm docker:start` | Postgres 18 on `localhost:5433` (5432 stays free for Tamery) |
| `pnpm db:generate` / `pnpm db:migrate` | Drizzle migrations (`packages/db/migrations`), env from the root `.env` |
| `pnpm dev` | Through portless: web `https://app.local.fewmail.app`, API `https://api.local.fewmail.app`; plus the worker (`dev:worker`, no URL) |
| `pnpm check` / `pnpm fix` | ultracite (oxlint + oxfmt) |
| `bun check` in a package | type check |

Env lives in the root `.env` (template: `.env.example`). Cross-service dev URLs (`API_URL`, `WEB_URL`) are not in `.env`: `setupPortlessEnvs(...)` (`@fewmail/shared/portless-env`) fills them at startup from the `portless` name in each app's `package.json`, worktree-aware; precedence: existing env var > portless. The web build also reads `WEB_URL` (canonical, sitemap and OG URLs), defaulting to `https://fewmail.app`. Production serves `dist` with `vite preview` (`allowedHosts: ['fewmail.app']`), whose middleware in the `fewmail-seo` plugin maps public paths to `<path>/index.html` and the rest to `app.html`. The proxy starts on `pnpm install` (`portless:start`, TLD `app`), shared with Tamery. A stopped backend shows up in the browser as a CORS error (portless answers 502 without CORS headers).

## Deploy (Railway)

The Railway project is code: `.railway/railway.ts` (`railway/iac`, root devDependency). Change it, then `railway config plan` and `railway config apply` (Railway CLI ≥ 5.42.1; Railway never reads `.railway/` during deploys). `railway.json` / `railway.toml` are deprecated and must not come back — a service cannot be managed by both.

- **postgres**, **api** and **worker**: one image, `apps/api/Dockerfile`, built with the repo root as context (it type-checks the API in a throwaway stage). `api` runs `index.ts` (HTTP, migrations on boot, Telegram webhook); `worker` overrides the start command with `worker.ts`.
- **worker**: exactly one replica, `overlapSeconds: 0`, `drainingSeconds: 30` — its job locks are in memory, so two copies would send briefs and Telegram pushes twice. On SIGTERM it stops ticking and waits for jobs in flight.
- **Secrets** are `preserve()` on `api` and set in the Railway dashboard, never in the repo; `worker` references `api`'s variables (`api.env.X`), so each value is set once. A new env var goes into `SECRETS` there and into `.env.example`.
- The web app is not in the Railway project yet.

Google OAuth redirect URI: `https://api.local.fewmail.app/auth/callback/google (prod: https://api.fewmail.app/auth/callback/google)`; the Gmail API must be enabled and, until verification, the user added as a test user.
