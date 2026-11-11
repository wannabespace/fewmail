# Agent instructions

Index only — rules live in `.agents/rules/`, one file per topic. `CLAUDE.md` symlinks here. Read the rule files the task touches **before** writing code; update the same file in the task that changes what it describes.

## Rule files

| File | Read before / update when |
| --- | --- |
| [`domain.md`](.agents/rules/domain.md) | Naming anything user-facing; core concepts — brief, queue, actions, rules, autonomy, handled mail |
| [`architecture.md`](.agents/rules/architecture.md) | Adding a feature, a procedure, a table, an integration (web, MCP, Telegram), anything touching Gmail or the AI models |
| [`monorepo.md`](.agents/rules/monorepo.md) | Commands, env vars, local URLs, adding a package |
| [`ui.md`](.agents/rules/ui.md) | Any UI — before the first className |

## Always applies

- **One service layer, many clients.** Everything the agent or the user can do lives in `apps/api/services/*` and takes a `userId`. The web (oRPC), MCP and Telegram are thin adapters over it; a feature is not done until it is reachable from each surface it belongs to.
- **Nothing changes in Gmail without consent.** Only an approved action or an autonomous rule the user created (or kept from the starter set) may archive, mark read, unsubscribe or send. Sending always needs an explicit approval.
- **No user data in clear text in the database** — every text column from a user or their mail is `encryptedText` / `encryptedJson`, or `searchableText` when it is queried (see `architecture.md` → Database). Never log bodies, subjects, addresses or drafts.
- **A comment is a warning or it does not exist.** Keep a comment only when an innocent-looking edit would break something; everything else goes into names.
- **Write as little code as possible.** Reuse before adding, extend a file before creating one, no speculative options.
- **Design decisions go in the `fewmail-ui` skill** (`.agents/skills/fewmail-ui/`), in the matching topic file, in the same task.
