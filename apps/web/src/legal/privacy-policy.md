## 1. Introduction

Fewmail ("we," "our," "us"), owned by Wannabe Space, LLC, is an email agent: it reads your Gmail for you, writes a daily brief, drafts replies in your voice and only shows you what needs you. This Privacy Policy explains what data we access, why, how we protect it and what we never do with it.

## 2. Google user data we access

When you sign in with Google you grant Fewmail the `gmail.modify` permission together with your basic profile (name, email address, profile photo). We use it only for the features you see in the app:

- **Read** your messages (sender, recipients, subject, date, labels, text body and whether there are attachments) so the agent can summarize them, judge their importance and draft replies. Attachments themselves are not downloaded.
- **Read your recently sent messages** so drafts match how you write, and to notice when you are waiting for an answer or promised something.
- **Change labels** — archive, mark as read, snooze, move to trash, or add the agent's own `Fewmail/…` labels if you turn them on — only when you do it yourself, approve it, or keep a rule that allows it. Every automatic change is listed under "handled" in the app.
- **Send email** only when you send it yourself or explicitly approve an agent draft — in the app, in Telegram or WhatsApp, or through an MCP client you connected. Every send waits a few seconds so you can undo it, and scheduled emails wait until the time you chose.
- **Search** your mailbox when you ask the agent a question about your mail.
- **Unsubscribe** from a mailing list through its one-click unsubscribe link, only when you approve it or a rule you keep allows it.

## 3. Limited Use

Fewmail's use and transfer to any other app of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements. In particular:

- We use Google user data only to provide and improve the user-facing features described above.
- We do not sell Google user data, and we do not use or transfer it for advertising, for credit-worthiness or lending decisions, or to data brokers.
- We do not use Google user data to develop, improve or train generalized AI or machine-learning models.
- No person at Fewmail reads your email unless you ask us to (for example in a support request), it is necessary for security purposes such as investigating abuse, or it is required by law.

## 4. What we store

- **Account and session data:** name, email address, profile photo, session tokens, IP address and user agent.
- **Google OAuth tokens:** stored encrypted, used only to access Gmail on your behalf.
- **Synced mail:** the message data listed in section 2. Everything that comes from your mail — addresses, names, subjects, snippets, bodies and headers — is encrypted at rest with AES-256-GCM.
- **What the agent produces:** summaries, importance and reasons, drafts and daily briefs — also encrypted at rest.
- **Agent notes (Pro):** notes about the people you correspond with, promises you made in sent mail and the goals of threads you ask the agent to handle — encrypted at rest. Payments and subscriptions found in your mail are stored as merchant (encrypted), amount, currency and dates.
- **Fraud checks:** to warn you when bank or payment details in an email change, we store only keyed one-way hashes of those details, never the details themselves.
- **Your settings and rules:** language, how you use email, brief time, time zone, the rules and snippets you write, and anything you tell the agent to know about you.
- **Community spam protection:** when you report spam or mark something as not spam, we store your vote with a keyed one-way hash of the sender's address (and of the domain for company domains). No addresses, subjects or contents are stored for this, and other users never learn who voted. Mail from a sender is moved to spam for other users only after several different people reported it and few marked it as not spam; a sender you have written to is never moved by community votes.
- **Other network signals:** to spot mass mailings, senders who keep writing after you unsubscribed, and lookalike domains, we store keyed one-way hashes of your account, senders, domains and a short fingerprint of each message's text. When you report spam or mark mail as not spam, the vote is also stored against a fingerprint of the text, a keyed hash of the network that delivered the mail and keyed hashes of unfamiliar domains it links to, so the same campaign is caught when it comes from a new address. We also read the sender-authentication results Gmail attaches to each email (SPF, DKIM, DMARC). These are combined across users only as counts; no content is shared between users. We also record which senders you unsubscribed from.
- **Outbox and reminders:** emails waiting to be sent (encrypted, recipients included), snoozed threads and follow-up reminders.
- **Billing:** if you subscribe to Pro, your Stripe customer ID and subscription status. Card details are handled by Stripe and never reach our servers.
- **Integrations:** if you connect Telegram, your Telegram chat ID; if you connect WhatsApp, your phone number and when you last wrote to the bot; if you create MCP keys, only a one-way hash of each key.

- **Public domain lists:** to catch phishing, spam and lookalike senders we also check sender and link domains against public lists we download: [Phishing.Database](https://github.com/Phishing-Database/Phishing.Database) (MIT), [StopForumSpam](https://www.stopforumspam.com/license) toxic domains, [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) (CC0) and the [Majestic Million](https://majestic.com/reports/majestic-million) (CC BY 3.0). The check happens on our servers; nothing about your mail is sent to these projects. To tell whether a new sender's domain was registered only days ago, we look up that domain (the domain alone, never the address or the email) in the public registration database (RDAP) through rdap.org.

We do not use third-party analytics, advertising or tracking tools.

## 5. AI processing

Quick decisions about each email (its category, importance, whether someone waits for an answer, whether you expect a reply to mail you sent, matching your rules and checking for risky wording) are made by **TypeSafe** (Jev) on every plan, including Free. Everything else runs only on the Pro plan and during the trial; on the Free plan no email content is sent to other AI providers. To summarize emails and write drafts and briefs, the relevant email content and your settings are sent to large language models through **OpenRouter**, routed to **Anthropic** (primary) and to **Google** or **xAI** as fallback providers. Inline autocomplete while you write and transcription of voice messages you send to the Telegram or WhatsApp bot use **Mistral**; voice recordings are not stored. They process the data only to return a result to us. We do not use your data to train models and do not allow it to be used for training.

## 6. Where your data goes

| Service | Purpose |
| --- | --- |
| Google (Gmail API, OAuth) | Sign-in and access to your mailbox |
| OpenRouter → Anthropic, Google, xAI | Reading emails, drafting replies, writing briefs, answering questions about your mail |
| TypeSafe (Jev) | Classifying each email, on every plan |
| Mistral | Autocomplete while you write, transcribing Telegram and WhatsApp voice messages |
| Stripe | Payments and subscriptions for Pro |
| Telegram | Delivering your brief, urgent emails and drafts, only if you connect it |
| WhatsApp (Meta) | Delivering your brief, urgent emails and drafts, only if you connect it |
| MCP clients you connect (e.g. Claude, Cursor) | Data you or that client request with your API key |
| Our hosting and database providers | Running Fewmail and storing the data above |

We share data with these services only as needed to run Fewmail, and we may disclose information if required by law.

## 7. Your choices and rights

- **Change what the agent may do** at any time in Rules: turn a rule off, remove it or stop it from acting without asking.
- **Disconnect** Telegram or WhatsApp, or revoke MCP keys in Settings.
- **Revoke access** to your Google account at any time at [myaccount.google.com/permissions](https://myaccount.google.com/permissions). Fewmail stops syncing immediately.
- **Delete your account** in Settings → Account. This deletes your account, synced mail, drafts, briefs, rules, settings and integrations from our database right away and revokes our Google access. Your Gmail itself is not changed.
- **Access or export** your data by contacting us.

## 8. Data retention

We keep your data while your account exists. Synced mail is used for the brief and the agent's context; deleting your account removes it as described above. Encrypted database backups, where they exist, are overwritten within 30 days.

## 9. Security

Data is encrypted in transit (TLS). At rest, everything you or your mail provide is encrypted: your name, email address and photo, mail, rules, snippets, settings you write yourself, your Telegram chat, your WhatsApp number, API key names, and the IP address and browser of your sessions. What stays unencrypted is what is not personal: ids, dates, flags, amounts and the keyed hashes used for spam protection. Access to production systems is restricted. No system is perfectly secure, and we cannot guarantee absolute security.

## 10. Children

Fewmail is not intended for anyone under 16, and we do not knowingly collect data from children.

## 11. Changes

We may update this policy. We will notify you in the app or by email about material changes before they take effect.

## 12. Contact

- **Email:** [hello@wannabespace.com](mailto:hello@wannabespace.com)
- **Website:** [https://fewmail.app](https://fewmail.app)
