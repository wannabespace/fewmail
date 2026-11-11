# Domain

Fewmail is an **email agent**: it reads every incoming email so the person does not have to, and shows them only what needs them. The UI is built around decisions, not around the inbox.

| Term | Meaning |
| --- | --- |
| **Brief** | A short daily summary in the user's language (`briefs`, one per local day), written at `briefHour` in the user's time zone (20:00 by default, not asked at onboarding; changed from the time on Today or in Settings), also sent to Telegram and WhatsApp. Headline + 2–4 sentences, no lists. |
| **Today** | The home screen: brief + queue + handled summary. Non-urgent cards arrive in two batches (brief hour and 7 h later); security, promises, tasks and urgent mail come at once. |
| **Queue** | Pending **actions** (`actions.status = 'pending'`), ordered by importance. Each is approved (`⏎`), edited, redrafted or skipped. |
| **Action** | Something the agent proposes or did: `reply` (with a draft), `pay`, `schedule`, `follow_up`, `read`, `archive`, `mark_read`, `unsubscribe`, `spam`, `security`, `commitment`, `cleanup`, task actions. Statuses: `pending`, `done`, `dismissed` (skipped), `auto_done` (by an autonomous rule), `failed`. |
| **Handled** | `auto_done` actions — what the agent did on its own. Always reviewable, never hidden. |
| **Analysis** | Per-message result (Jev decides; on Pro the fast model writes the text, on Free the summary is the snippet): category, importance 0–3, one-line summary, reason, `needsReply`, extracted amount / due date / meeting time, matched rule. |
| **Importance** | 3 urgent (pushed to Telegram and WhatsApp immediately), 2 needs you soon, 1 worth knowing, 0 noise. |
| **Rule** | A plain-language instruction ("Newsletters and digests") + an effect (`archive`, `mark_read`, `unsubscribe`, `draft_reply`, `always_show`). **Autonomous** rules act without asking; others only propose. New users get starter rules for their persona. On Free, rule effects are `archive`, `mark_read`, `unsubscribe`, `trash`, always autonomous. |
| **Persona** | Chosen at onboarding: **reader** (mostly reads, wants calm and nothing lost — brief first, noise handled) or **responder** (replies a lot — people waiting first, drafts in their voice). It shapes starter rules, agent prompts and Today's emphasis. |
| **Language** | One setting for the whole product, chosen at onboarding (defaults to the browser's): the app UI, Telegram bot, briefs, summaries, reasons, action labels and starter rules use it. **Replies always use the language of the email being answered.** Legal documents stay in English (the binding version) with a translated note. |
| **Voice** | How drafts sound: learned from the user's recent sent mail (synced alongside the inbox) plus an optional `voice` note. |
| **Snooze** | Hide a thread until a time; it comes back to the inbox unread. Free. |
| **Follow-up** | "Remind me if no reply in N days" on a sent email (Free: the thread resurfaces). The agent also sets follow-ups itself on sent mail that expects an answer (all plans); Pro adds a nudge in Today. |
| **Knowledge** | Free-form facts the user gives the agent (prices, availability…), used in drafts and autocomplete. Pro. |
| **Spam shield** | Community spam protection: "Report spam" (`!`) moves the thread to Gmail spam and votes; enough independent votes move that sender's mail to spam for everyone. Votes also count against the campaign's patterns — the same text, the sending network, the linked domains — so a spammer gains nothing by switching address. "Not spam" votes the other way. Free. |
| **Maybe spam** | One weak signal (odd domain name, freshly registered domain, weak sender authentication): labelled "Looks like spam" and kept out of Important, never moved. Two or more → spam. Free. |
| **Snippets** | Saved texts inserted with `;name` in the editor. Free. |
| **Agent labels** | Optional `Fewmail/<Category>` Gmail labels so the sorting shows in any Gmail client. Free. |
| **Zombie sender** | Mail that keeps coming more than 14 days after you unsubscribed; moved to spam. Free. |
| **Bulk** | Mail sent near-identically to many people (`bulkCount`). Free. |
| **Risk** | Known phishing domain (public list), lookalike sender domain or changed payment details; shown as a warning and a `security` action. Free. |
| **Commitment** | A promise you made in sent mail; due ones come back as actions. Pro. |
| **People** | Per-contact note the agent keeps, refreshed weekly. Pro. |
| **Board** | A page the user describes in their own words ("Trips: flights and hotels with what they cost"); the agent collects matching mail as **entries** (title, group, status, amount, date), starting with half a year of history, and picks the **charts** when it is created — the user edits or removes them after. Everyone starts with a **Money** board, an ordinary board they may change or delete. Boards live in the sidebar (`G 1`…`G 9`). Pro. |
| **Cleanup** | Weekly Sunday suggestion to clear accumulated noise. Pro. |
| **Task** | "Handle this": the agent works a thread toward a goal, asking before each send or sending on its own (`ask` / `auto`). Pro. |
| **Instructions** | Free-text or voice messages to the Telegram or WhatsApp bot; replying to a bot message targets its thread. Pro. |

UI copy says "the agent" or "Fewmail", never "AI" or "the model".

## Plans

| Plan | What it is |
| --- | --- |
| **Free** | Forever. Mail view, archive / unsubscribe / open in Gmail, **simple rules** (`rules.match`: from, subject contains, any mailing list → archive, mark read, unsubscribe; always act on their own), and every Jev decision: classification, importance, needs-reply, plain-language rules (archive / mark read / unsubscribe / trash, autonomous), risk checks, zombie and bulk detection, auto follow-ups, agent labels. **No LLM**: no Today, summaries, drafts, autocomplete, Ask AI, commitments, money, people, tasks, Telegram, WhatsApp or MCP — the controls are absent, not locked. |
| **Trial** | 14 days of Pro from onboarding (`user_settings.trial_ends_at`), no card. Ends silently into Free. |
| **Pro** | $15/month via Stripe (`PRO_PRICE_USD`). The whole agent: everything that uses an LLM. |

**Never push.** Pro is mentioned only in Settings → Plan, one ⌘K item ("Upgrade to Pro") and, during the trial, a muted "N days left" line in the sidebar. No modals, no banners, no badges, no "Sent with Fewmail" signature.
