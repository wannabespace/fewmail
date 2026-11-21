# Agent instructions

Index only — rules live in `.agents/rules/`, one file per topic. `CLAUDE.md` symlinks here. Read the rule files the task touches **before** writing code; update the same file in the task that changes what it describes.

## Rule files

| File | Read before / update when |
| --- | --- |
| [`domain.md`](.agents/rules/domain.md) | Naming anything user-facing; core concepts — Home, bots, queue, actions, autonomy, handled mail |
| [`architecture.md`](.agents/rules/architecture.md) | Adding a feature, a procedure, a table, an integration (web, MCP, Telegram), anything touching Gmail or the AI models, analytics events |
| [`monorepo.md`](.agents/rules/monorepo.md) | Commands, env vars, local URLs, adding a package |
| [`ui.md`](.agents/rules/ui.md) | Any UI — before the first className |

## Always applies

- **One service layer, many clients.** Everything the agent or the user can do lives in `apps/api/services/*` and takes a `userId`. The web (oRPC), MCP and Telegram are thin adapters over it; a feature is not done until it is reachable from each surface it belongs to.
- **Nothing changes in Gmail without consent.** Only an approved action or a bot the user let act on its own (the starter tidying bot asks until then; a bot that asks puts each email up for a yes) may archive, mark read, unsubscribe, move to spam or send; the spam shield only proposes, except for senders the user reported. Sending always needs an explicit approval. An MCP client's own approval is not the user's yes: its consent tools wait in Fewmail.
- **No user data in clear text in the database** — every text column from a user or their mail is `encryptedText` / `encryptedJson`, or `searchableText` when it is queried (see `architecture.md` → Database). Never log bodies, subjects, addresses or drafts.
- **A comment is a warning or it does not exist.** Keep a comment only when an innocent-looking edit would break something; everything else goes into names.
- **Write as little code as possible.** Reuse before adding, extend a file before creating one, no speculative options.
- **Everything a user does is an event.** A new mutation, command, tool, bot button or anything else a user can do ships its PostHog event in the same task, on every surface it reaches (web, MCP, Telegram, WhatsApp) — oRPC mutations are captured on their own, the rest is not; conventions and privacy limits in `architecture.md` → Analytics.
- **Every change to a model, a prompt, a size limit, a plan limit or a price changes what Fewmail costs.** Run `bun run economics` in `apps/api` before and after, report the cost per email and message and the plan margins, and run `bun test` there (see `architecture.md` → AI cost).
- **The app stays under 100 MB of memory.** The page process of a production build on a signed-in Home must stay below 100 MB; a new dependency or anything loaded on start is measured before it lands (see `architecture.md` → Memory).
- **The public site tells the truth about the app.** A change to what a user sees or can do (a feature added, removed or renamed, a new concept, a plan's contents) updates the landing and the site pages that describe it (`routes/_site*`, `components/landing-demos.tsx`, `t.site` in every language) in the same task: their demos show the app as it is now, in its words. A demo still showing something the app no longer has is a bug.
- **Design decisions go in the `fewmail-ui` skill** (`.agents/skills/fewmail-ui/`), in the matching topic file, in the same task.
