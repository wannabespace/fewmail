## 1. Introduction

Fewmail ("we," "our," "us"), owned by Wannabe Space, LLC, is an email agent: it reads your Gmail for you, drafts replies in your voice and only shows you what needs you. This Privacy Policy explains what data we access, why, how we protect it and what we never do with it.

## 2. Google user data we access

When you sign in with Google you grant Fewmail the `gmail.modify`, `calendar.events`, `contacts` and `contacts.other.readonly` permissions together with your basic profile (name, email address, profile photo). We use it only for the features you see in the app:

- **Read** your messages (sender, recipients, subject, date, labels, text body and the names, types and sizes of attached files) so the agent can summarize them, judge their importance and draft replies. When you open an attached file, or an email shows an image carried inside it, the file is read from Gmail through our server at that moment and is not stored. On paid plans, the PDFs and images attached to email that matters (up to two per email, the first three pages) are read once so the summary can name the amounts and dates inside them; their text is not stored.
- **Read your recently sent messages** so drafts match how you write, and to notice when you are waiting for an answer or promised something.
- **Change labels** (archive, mark as read, snooze, pin as a star, move to trash, or add the agent's own `Fewmail/…` labels if you turn them on) only when you do it yourself (opening an email in Fewmail marks it as read in Gmail, as any mail app does), approve it, or keep a rule that allows it. Every automatic change is listed under "handled" in the app.
- **Send email** only when you send it yourself or explicitly approve an agent draft: in the app, in Telegram or WhatsApp, or through an MCP client you connected. Every send waits a few seconds so you can undo it, and scheduled emails wait until the time you chose. Files you attach are kept encrypted only until Gmail takes the email (or, if you undo it, until it is back in your Gmail drafts), then deleted from our database; a file you forward is read from the original email in Gmail when it is sent.
- **Save drafts** to your Gmail, with the files you attached, as you write or when you ask the agent for a draft, list them under Drafts, and delete one when you send it from Fewmail or discard it. Drafts stay in Gmail; Fewmail does not store them.
- **Search** your mailbox when you ask the agent a question about your mail.
- **Clear out your inbox**, only when you open the clear-out and approve it: Fewmail reads the sender, labels and list headers of the mail in your inbox (up to 50,000 emails) to count what could be archived, without storing them; it then archives the groups you chose under the `Fewmail/Cleared` label, which brings them back in one click, and keeps one email from each mailing list it unsubscribes you from.
- **Unsubscribe** from a mailing list, only when you approve it or a rule you keep allows it: through its one-click unsubscribe link; else by opening its unsubscribe page from our server (without your cookies or any login) and sending the one-click form on it; else by sending the short unsubscribe email the list asks for from the Gmail address it writes to.
- **Show and edit your calendar** (`calendar.events`): Fewmail reads the events of your primary Google calendar (title, time, location and description) to show them on the Calendar page, and creates, changes or deletes an event only when you do it there or approve the agent doing it. Events are read live from Google each time and are not stored by Fewmail; when the agent looks them up for you (the agent chat, MCP), they are processed like the mail details it reads. You can leave this permission unticked on Google's consent screen; everything else keeps working.
- **Show people's photos and names, and delete a contact when you ask** (`contacts`, `contacts.other.readonly`): Fewmail reads the email addresses, names and profile photos of your Google contacts and of the people you have emailed with, to show each person's photo next to their mail and to list them in People and in the To and Cc suggestions. It deletes one of your saved Google contacts only when you choose Delete contact on it, and never changes your contacts otherwise. They are read from Google and kept in our server's memory for a few hours, never stored in our database, and never shown to the agent. You can leave these permissions unticked on Google's consent screen; senders then show their initial and People lists only the people you have emailed with.

You can add more Gmail accounts in Settings → Mailboxes. Each one grants the same `gmail.modify`, `calendar.events`, `contacts` and `contacts.other.readonly` permissions plus its email address, and Fewmail uses it exactly as above; its mail joins your own account. An added account is never a way to sign in to yours: signing in to Fewmail with it opens its own, separate Fewmail account.

## 3. Limited Use

Fewmail's use and transfer to any other app of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements. In particular:

- We use Google user data only to provide and improve the user-facing features described above.
- We do not sell Google user data, and we do not use or transfer it for advertising, for credit-worthiness or lending decisions, or to data brokers.
- We do not use Google user data to develop, improve or train generalized AI or machine-learning models.
- No person at Fewmail reads your email unless you ask us to (for example in a support request), it is necessary for security purposes such as investigating abuse, or it is required by law.

## 4. What we store

- **Account and session data:** name, email address, profile photo, session tokens, IP address and user agent.
- **Google OAuth tokens:** stored encrypted, used only to access Gmail on your behalf.
- **Synced mail:** the message data listed in section 2, for mail from three months before you connected a mailbox onward (for older mail the formatted HTML version is fetched only when you open an email). Everything that comes from your mail (addresses, names, subjects, snippets, bodies and headers) is encrypted at rest with AES-256-GCM. Older mail, and mail found by a search, is read from Gmail when you scroll to it or search and is not stored (our server keeps it in memory for at most a minute); an older thread is stored once you open it, point at it in a list (which starts loading it so it opens at once) or act on it.
- **Search index:** so Mail finds an email by part of a word, keyed one-way hashes of the beginnings of the words in each synced email's subject and sender, unique to your account, never the words themselves.
- **What the agent produces:** summaries, importance and reasons and drafts, also encrypted at rest.
- **Agent notes (Pro):** notes about the people you correspond with, promises you made in sent mail and promises made to you in mail you got (with the amount when it is money owed to you, such as a refund), each with how it went (open, answered, under way, done, broken or called off), who changed it (the agent, from an email, or you) and which email showed it, and a short description of how you write (greetings, sign-offs, tone, length; never what your emails are about), learned from your recent sent mail so drafts sound like you, encrypted at rest.
- **Fraud checks:** to warn you when bank or payment details in an email change, we store only keyed one-way hashes of those details, never the details themselves.
- **Your settings and rules:** language, how you use email, the hour for morning messages, time zone, the rules and snippets you write, and anything you tell the agent to know about you.
- **Community spam protection:** when you report spam or mark something as not spam, we store your vote with a keyed one-way hash of the sender's address (and of the domain for company domains). No addresses, subjects or contents are stored for this, and other users never learn who voted. Mail from a sender is flagged as spam for other users only after several different people reported it and few marked it as not spam, and it moves to spam only when that user says yes; a sender you have written to is never flagged by community votes.
- **Other network signals:** to spot mass mailings, senders who keep writing after you unsubscribed, and lookalike domains, we store keyed one-way hashes of your account, senders, domains and a short fingerprint of each message's text. When you report spam or mark mail as not spam, the vote is also stored against a fingerprint of the text, a keyed hash of the network that delivered the mail and keyed hashes of unfamiliar domains it links to, so the same campaign is caught when it comes from a new address. We also read the sender-authentication results Gmail attaches to each email (SPF, DKIM, DMARC). These are combined across users only as counts; no content is shared between users. We also record which senders you unsubscribed from, and, as keyed hashes of your account and of the list, which mailing lists you get, so the app can show what share of a list's readers left it; that share is shown only for lists at least ten people get.
- **Outbox and reminders:** emails waiting to be sent (encrypted, recipients included), snoozed threads and follow-up reminders.
- **Billing:** if you subscribe to Pro, your Stripe customer ID and subscription status. Card details are handled by Stripe and never reach our servers.
- **Integrations:** if you connect Telegram, your Telegram chat ID; if you connect WhatsApp, your phone number and when you last wrote to the bot; if you turn on browser notifications, the push address and keys your browser gives us for that; if you turn on notifications in the desktop app, a random ID for that computer and when it was last open, since the app receives them only while it runs; notifications waiting to go out (their title and text, encrypted), kept until they are delivered or given up on and for 7 days after, so one that failed can be sent again or through another channel you connected; if you connect an MCP client, its name and links as the client registered them, which permissions you granted it, and one-way hashes of the tokens it holds.

- **Public domain lists:** to catch phishing, spam and lookalike senders we also check sender and link domains against public lists we download: [Phishing.Database](https://github.com/Phishing-Database/Phishing.Database) (MIT), [StopForumSpam](https://www.stopforumspam.com/license) toxic domains, [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) (CC0) and the [Majestic Million](https://majestic.com/reports/majestic-million) (CC BY 3.0). The check happens on our servers; nothing about your mail is sent to these projects. To tell whether a new sender's domain was registered only days ago, we look up that domain (the domain alone, never the address or the email) in the public registration database (RDAP) through rdap.org.

We use **PostHog** (servers in the EU) for product analytics and error reports: which pages you open and which features you use (for example that an email was archived or a card approved, never which email), your plan and language, errors the app runs into and, while you use the app, screen recordings in which every text, input, email and picture is hidden, so they show only layout and clicks. PostHog receives your account's email address and name to link this to your account and keeps an identifier in your browser. No email content, subject, address of anyone you correspond with, search, draft or link from your mail is sent to PostHog. We do not use advertising or cross-site tracking tools.

## 5. AI processing

Quick decisions about each email (its category, importance, whether someone waits for an answer, whether you expect a reply to mail you sent, matching your rules, checking for risky wording and for text that tries to give orders to an assistant reading the mail and, for email from Google itself, whether it says your Google storage is full) are made by **TypeSafe** (Jev) through **OpenRouter** on every plan, including Free. Everything else runs only on the Pro plan and during the trial; on the Free plan no email content is sent to other AI providers. To summarize emails and write drafts, the relevant email content and your settings are sent to large language models through **OpenRouter**: short summaries and extraction go to **TypeSafe** Jev Router, which picks a model for each request only among providers that do not store or train on the data (Google Gemini Flash as fallback), drafts, answers about your mail and the agent chat (with the mail it looks up for you) go to Anthropic Claude Sonnet (xAI Grok as fallback). Inline autocomplete while you write uses **Mistral** Codestral, falling back to Jev Router through OpenRouter. Voice messages you send to the Telegram or WhatsApp bot are transcribed by **Mistral** Voxtral; voice recordings are not stored. They process the data only to return a result to us. We do not use your data to train models and do not allow it to be used for training.

## 6. Where your data goes

| Service | Purpose |
| --- | --- |
| Google (Gmail API, OAuth, Cloud Pub/Sub) | Sign-in and access to your mailbox; Pub/Sub tells us that your mailbox changed (only your address and a change number, no mail content) so new mail and changes you make in Gmail show up in seconds |
| Google favicon service | Showing the icon of the website a sender writes from: our server asks for it by the site's domain name alone (e.g. github.com), never with your address or anything about you, and your browser only loads it from Fewmail |
| OpenRouter → Anthropic, Google, xAI and the providers Jev Router picks | Reading emails, drafting replies, answering questions about your mail, autocomplete fallback |
| OpenRouter → TypeSafe (Jev) | Classifying each email, on every plan |
| ElevenLabs | Reading aloud, only when you ask: a summary of what needs you and the first items of your queue, the summary of your newsletters, and the bot’s answer to a voice message you sent (paid plans) |
| Mistral | Autocomplete while you write, transcribing Telegram and WhatsApp voice messages, reading the text of PDFs and images attached to email that matters (paid plans) |
| Stripe | Payments and subscriptions for Pro |
| PostHog (EU) | Product analytics, error reports and recordings with every text and picture hidden: what you use in Fewmail, never what your mail says |
| Telegram | Delivering urgent emails, drafts, the newsletter digest and the weekly report, only if you connect it |
| WhatsApp (Meta) | Delivering urgent emails, drafts, the newsletter digest and the weekly report, only if you connect it |
| Your browser’s push service (Google, Mozilla, Apple or Microsoft) | Delivering browser notifications with the sender, subject and summary of urgent emails, end-to-end encrypted so the push service cannot read them, only if you turn them on |
| GitHub | Hosting the desktop app's downloads and updates; the app asks it for a newer version every few hours, so GitHub sees your IP address, never anything about your mail or account |
| MCP clients you connect (e.g. Claude, Cursor) | Data that client requests after you sign in and allow it |
| Our hosting and database providers | Running Fewmail and storing the data above |

We share data with these services only as needed to run Fewmail, and we may disclose information if required by law.

## 7. Your choices and rights

- **Change what the agent may do** at any time in Rules: turn a rule off, remove it or stop it from acting without asking.
- **Remove an added mailbox** in Settings → Mailboxes. Its synced mail is deleted from our database right away; to also end the Google permission, revoke it at [myaccount.google.com/permissions](https://myaccount.google.com/permissions) (we do not revoke it ourselves, since the same permission may also serve that account's own Fewmail).
- **Disconnect** Telegram or WhatsApp, turn off browser notifications, or disconnect MCP clients in Settings.
- **Revoke access** to your Google account at any time at [myaccount.google.com/permissions](https://myaccount.google.com/permissions). Fewmail stops syncing immediately.
- **Delete your account** in Settings → Account. This deletes your account, synced mail, drafts, rules, settings and integrations from our database right away, revokes our Google access to the account you sign in with, cancels a paid plan at once and deletes your customer record at Stripe (Stripe keeps past invoices and payments). Your Gmail itself is not changed.
- **Access or export** your data by contacting us.

## 8. Data retention

We keep your data while your account exists. Synced mail is used for Home and the agent's context; deleting your account removes it as described above. Encrypted database backups, where they exist, are overwritten within 30 days.

## 9. Security

Data is encrypted in transit (TLS). At rest, everything you or your mail provide is encrypted: your name, email address and photo, mail, rules, snippets, settings you write yourself, your Telegram chat, your WhatsApp number, browser notification addresses, and the IP address and browser of your sessions. What stays unencrypted is what is not personal: ids, dates, flags, amounts and the keyed hashes used for spam protection. Access to production systems is restricted. No system is perfectly secure, and we cannot guarantee absolute security.

## 10. Children

Fewmail is not intended for anyone under 16, and we do not knowingly collect data from children.

## 11. Changes

We may update this policy. We will notify you in the app or by email about material changes before they take effect.

## 12. Contact

- **Email:** [hello@fewmail.app](mailto:hello@fewmail.app)
- **Website:** [https://fewmail.app](https://fewmail.app)
