# Security

Fewmail reads people's Gmail, so we take security reports seriously.

## Reporting a vulnerability

Please report privately, not in a public issue. Open a draft advisory under the repo's
[Security tab](https://github.com/wannabespace/fewmail/security/advisories/new) and it reaches us directly.

Include what you found, how to reproduce it, and what an attacker could do with it. A proof of concept helps.

We will confirm we received it, work on a fix, and credit you once it ships (unless you would rather stay anonymous).

Please give us a reasonable window to patch before you share the details anywhere.

## Scope

The whole repo is in scope: the web app, the API and worker, the MCP server, the Telegram and WhatsApp bots, and the desktop app.
Anything that reads or changes one account's mail from another, sends or changes mail without the user's approval, decrypts
stored data without the key, or reaches our own network from a link in an email is exactly what we want to hear about.
