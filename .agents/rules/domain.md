# Domain

Fewmail is an **email agent**: it reads every incoming email so the person does not have to, and shows them only what needs them. The UI is built around decisions, not around the inbox.

| Term | Meaning |
| --- | --- |
| **Brief** | A short daily summary in the user's language (`briefs`, one per local day), written at `briefHour` in the user's time zone (20:00 by default, not asked at onboarding; changed from the time on Today or in Settings), also sent to Telegram and WhatsApp. Headline of ≤ 6 words + at most 2 short sentences (≤ 35 words) naming only the most urgent thing and the handled count — the cards below carry the rest; no lists. |
| **Mailbox** | A Gmail account whose mail Fewmail reads. One is the account you sign in with; more can be added in Settings and their mail joins the same Today, queue and inbox; Mail can be narrowed to one of them. An added mailbox never signs anyone in to your account — signing in with it opens its own Fewmail. |
| **Today** | The home screen: brief + queue, then what is worth knowing even when nothing needs the user — sent mail still awaiting an answer (pending follow-ups), the day's other mail of importance ≥ 1, mail naming a due date or meeting time (last 7 days, dates as written), what each board collected in the last 30 days — then the day's pulse (mail in, from people, from lists) and the handled summary. Empty sections hide. With no brief yet, opening Today writes one. Non-urgent cards arrive in two batches (brief hour and 7 h later); security, promises, tasks and urgent mail come at once. |
| **Queue** | Pending **actions** (`actions.status = 'pending'`), ordered by importance. Each is approved (`⏎`), edited, redrafted or skipped. |
| **Action** | Something the agent proposes or did: `reply` (with a draft), `pay`, `schedule`, `follow_up`, `read`, `archive`, `mark_read`, `unsubscribe`, `spam`, `security`, `commitment`, `cleanup`, task actions. Statuses: `pending`, `done`, `dismissed` (skipped), `auto_done` (by an autonomous rule), `failed`. |
| **Handled** | `auto_done` actions — what the agent did on its own. Always reviewable, never hidden. |
| **Analysis** | Per-message result (Jev decides; on Pro the fast model writes the text, on Free the summary is the snippet): category, importance 0–3, one-line summary, reason, `needsReply`, extracted amount / due date / meeting time, matched rule. |
| **Importance** | 3 urgent (pushed to Telegram and WhatsApp immediately), 2 needs you soon, 1 worth knowing, 0 noise. |
| **Rule** | A plain-language instruction ("Newsletters and digests") + an effect. Gmail effects (`archive`, `mark_read`, `unsubscribe`, `trash`) always act on their own and land under handled — there is no "ask first" rule; `draft_reply` leaves a draft in Today, `always_show` pins the email to Today. A rule is on or off (`enabled`). New users get the same starter rules. On Free, only the Gmail effects. |
| **Language** | One setting for the whole product, chosen at onboarding (defaults to the browser's): the app UI, Telegram bot, briefs, summaries, reasons, action labels and starter rules use it. **Replies always use the language of the email being answered.** Legal documents stay in English (the binding version) with a translated note. |
| **Voice** | How drafts sound: learned from the user's recent sent mail (synced alongside the inbox) plus an optional `voice` note. |
| **Saved draft** | An unfinished email kept as a Gmail draft, never in our database: "Save draft" in the editor, the agent's `create_draft`, or Gmail itself. Listed under Mail → Drafts, reopened in the editor; sending it from Fewmail or discarding it deletes it. Not the agent's reply drafts in Today. Free. |
| **Snooze** | Hide a thread until a time; it comes back to the inbox unread. Free. |
| **Follow-up** | "Remind me if no reply in N days" on a sent email (Free: the thread resurfaces). The agent also sets follow-ups itself on sent mail that expects an answer (all plans); Pro adds a nudge in Today. |
| **Schedule** | Something the user asked the agent to do regularly ("every Friday at 17:00 collect the week's invoices", "every Monday send the team the report"). Each run is a message in its own agent chat with a notification; anything it wants to send waits for approval there. Created by asking the agent; listed in Settings. |
| **Knowledge** | Free-form facts the user gives the agent (prices, availability…), used in drafts and autocomplete. Pro. |
| **Spam shield** | Community spam protection: "Report spam" (`!`) moves the thread to Gmail spam and votes; enough independent votes move that sender's mail to spam for everyone. Votes also count against the campaign's patterns — the same text, the sending network, the linked domains — so a spammer gains nothing by switching address. "Not spam" votes the other way. Free. |
| **Maybe spam** | One weak signal (odd domain name, freshly registered domain, weak sender authentication): labelled "Looks like spam" and kept out of Important, never moved. Two or more → spam. Free. |
| **Snippets** | Saved texts inserted with `;name` in the editor. Free. |
| **Agent labels** | Optional `Fewmail/<Category>` Gmail labels so the sorting shows in any Gmail client. Free. |
| **Subscriptions** | `/subscriptions` (`G U`): every mailing list that wrote in the last 30 days and the user has not left, busiest first, with how many emails came and how many were opened. Unsubscribe (`U`) leaves the list by one-click when the sender supports it and archives everything that sender sent; either way later mail becomes a zombie. Free. |
| **Zombie sender** | Mail that keeps coming more than 14 days after you unsubscribed; moved to spam. Free. |
| **Bulk** | Mail sent near-identically to many people (`bulkCount`). Free. |
| **Risk** | Known phishing domain (public list), lookalike sender domain or changed payment details; shown as a warning and a `security` action. Free. |
| **Commitment** | A promise you made in sent mail; due ones come back as actions. Pro. |
| **People** | Per-contact note the agent keeps, refreshed weekly. Pro. |
| **Board** | A page the user describes in their own words ("Trips: flights and hotels with what they cost"); the agent collects matching mail as **entries** (title, group, status, amount, date), starting with half a year of history, and picks the **charts** when it is created — the user edits or removes them after. Onboarding offers ready-made **presets** (`BOARD_PRESETS`: Money, Subscriptions, Trips, Orders — up to the trial's board limit, Money and Subscriptions picked by default, kept in `user_settings.starter_boards`); the worker creates them after the first sync as ordinary boards the user may change or delete. Boards live in the sidebar (`G 1`…`G 9`). Pro. |
| **Cleanup** | Weekly Sunday suggestion to clear accumulated noise. Pro. |
| **Task** | "Handle this": the agent works a thread toward a goal, asking before each send or sending on its own (`ask` / `auto`). Pro. |
| **Agent mode** | `/agent` (`G A`): the whole app as one chat with the agent, sidebar folded away. It answers from the mail through the same tools as MCP, shows each step it takes, and anything that sends, changes Gmail, adds a rule or hands a thread over waits for the user's yes on a confirmation card in the chat. Chats are kept (`chats`) and listed under Chats; `/` reopens agent mode for someone who left the app in it. Pro. |
| **Skill** | A built-in job the agent knows by name (`SKILLS`: `today`, `waiting`, `followups`, `bills`, `week`, `cleanup`), run as `/name` plus optional details. The chat's `/` menu and empty-chat chips, a Telegram command, a WhatsApp text and an MCP prompt all start the same skill. Not user-defined. Pro. |
| **Instructions** | Free-text or voice messages to the Telegram or WhatsApp bot; replying to a bot message targets its thread. Pro. |

UI copy says "the agent" or "Fewmail", never "AI" or "the model".

## Plans

| Plan | What it is |
| --- | --- |
| **Free** | Forever. Mail view, archive / unsubscribe / open in Gmail, **simple rules** (`rules.match`: from, subject contains, any mailing list → archive, mark read, unsubscribe; always act on their own), and every Jev decision: classification, importance, needs-reply, plain-language rules (archive / mark read / unsubscribe / trash, autonomous), risk checks, zombie and bulk detection, auto follow-ups, agent labels. **No LLM**: no Today, agent mode, summaries, drafts, autocomplete, Ask AI, commitments, money, people, tasks, Telegram, WhatsApp or MCP — the controls are absent, not locked. |
| **Trial** | 14 days of Pro from onboarding (`user_settings.trial_ends_at`), no card, with smaller limits (500 emails, 50 messages). Ends silently into Free. |
| **Pro** | $10/month or $100/year via Stripe (`PRICE_USD`; a year is ten months). The whole agent: everything that uses an LLM, within `PLAN_LIMITS`: 1,000 emails and 100 messages a month, 3 boards, 5 handed-over threads at a time. |
| **Max** | $30/month or $300/year. The same agent with 6,000 emails and 500 messages a month and no limit on boards or tasks. Subscribers of the old $15 Pro get Max limits. |

**Limit, never degrade.** Both paid plans have every feature and the same models; they differ only in `PLAN_LIMITS`. **Emails** count mail the agent wrote for — noise Jev settles is free. Past the email limit new mail is handled exactly as on Free (Jev, rules, spam shield) with no summary or draft, except urgent mail, which may run 10% over. **Messages** are chat turns, Ask, and Telegram / WhatsApp texts; past the limit they are refused with the reset date. Limits are monthly on yearly plans too (never a yearly pool) and reset on the 1st (UTC).

**Never push.** Paid plans are mentioned only in Settings → Plan (usage meters and the plan choices), one ⌘K item ("Upgrade to Pro"), a muted "N days left" line in the sidebar during the trial, and a muted usage line once a month is ≥ 90% spent. No modals, no banners, no badges, no "Sent with Fewmail" signature.
