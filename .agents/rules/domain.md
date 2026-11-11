# Domain

Fewmail is an **email agent**: it reads every incoming email so the person does not have to, and shows them only what needs them. The UI is built around decisions, not around the inbox.

| Term | Meaning |
| --- | --- |
| **Brief** | A short daily summary in the user's language (`briefs`, one per local day), written at `briefHour` in the user's time zone, also sent to Telegram. Headline + 2–4 sentences, no lists. |
| **Today** | The home screen: brief + queue + handled summary. |
| **Queue** | Pending **actions** (`actions.status = 'pending'`), ordered by importance. Each is approved (`⏎`), edited, redrafted or skipped. |
| **Action** | Something the agent proposes or did: `reply` (with a draft), `pay`, `schedule`, `follow_up`, `read`, `archive`, `mark_read`, `unsubscribe`. Statuses: `pending`, `done`, `dismissed` (skipped), `auto_done` (by an autonomous rule), `failed`. |
| **Handled** | `auto_done` actions — what the agent did on its own. Always reviewable, never hidden. |
| **Analysis** | Per-message result of the fast model: category, importance 0–3, one-line summary, reason, `needsReply`, extracted amount / due date / meeting time, matched rule. |
| **Importance** | 3 urgent (pushed to Telegram immediately), 2 needs you soon, 1 worth knowing, 0 noise. |
| **Rule** | A plain-language instruction ("Newsletters and digests") + an effect (`archive`, `mark_read`, `unsubscribe`, `draft_reply`, `always_show`). **Autonomous** rules act without asking; others only propose. New users get starter rules for their persona. |
| **Persona** | Chosen at onboarding: **reader** (mostly reads, wants calm and nothing lost — brief first, noise handled) or **responder** (replies a lot — people waiting first, drafts in their voice). It shapes starter rules, agent prompts and Today's emphasis. |
| **Language** | One setting for the whole product, chosen at onboarding (defaults to the browser's): the app UI, Telegram bot, briefs, summaries, reasons, action labels and starter rules use it. **Replies always use the language of the email being answered.** Legal documents stay in English (the binding version) with a translated note. |
| **Voice** | How drafts sound: learned from the user's recent sent mail (synced alongside the inbox) plus an optional `voice` note. |

| **Snooze** | Hide a thread until a time; it comes back to the inbox unread. Free. |
| **Follow-up** | "Remind me if no reply in N days" on a sent email (Free: the thread resurfaces). Pro adds automatic follow-ups the agent sets itself and a nudge in Today. |
| **Knowledge** | Free-form facts the user gives the agent (prices, availability…), used in drafts and autocomplete. Pro. |
| **Spam shield** | Community spam protection: "Report spam" (`!`) moves the thread to Gmail spam and votes; enough independent votes move that sender's mail to spam for everyone. "Not spam" votes the other way. Free. |
| **Snippets** | Saved texts inserted with `;name` in the editor. Free. |
| **Agent labels** | Optional `Fewmail/<Category>` Gmail labels so the sorting shows in any Gmail client. Pro. |

UI copy says "the agent" or "Fewmail", never "AI" or "the model".

## Plans

| Plan | What it is |
| --- | --- |
| **Free** | Forever. Mail view, archive / unsubscribe / open in Gmail, **simple rules** (`rules.match`: from, subject contains, any mailing list → archive, mark read, unsubscribe; always act on their own). **No AI anywhere**: no Today, no analysis, drafts, AI filters, Telegram or MCP — the controls are absent, not locked. |
| **Trial** | 14 days of Pro from onboarding (`user_settings.trial_ends_at`), no card. Ends silently into Free. |
| **Pro** | $15/month via Stripe (`PRO_PRICE_USD`). The whole agent. |

**Never push.** Pro is mentioned only in Settings → Plan, one ⌘K item ("Upgrade to Pro") and, during the trial, a muted "N days left" line in the sidebar. No modals, no banners, no badges, no "Sent with Fewmail" signature.
