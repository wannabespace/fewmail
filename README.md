# Fewmail

An email agent: it reads your Gmail, drafts replies in your voice and only shows you what needs you. Web app, MCP server and Telegram bot over one agent.

```sh
cp .env.example .env   # fill in Google OAuth, OpenRouter, optional Telegram
pnpm install           # also starts the portless proxy
pnpm docker:start
pnpm db:migrate
pnpm dev               # https://app.local.fewmail.app · https://api.local.fewmail.app
```

Agents: start at [AGENTS.md](AGENTS.md).
