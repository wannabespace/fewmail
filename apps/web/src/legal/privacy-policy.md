## 1. Who we are

Fewmail is an email agent operated by **Wannabe Space, LLC** ("Fewmail", "we", "us"), a limited liability company registered in Delaware, United States (file number 5255992). We are responsible for the personal data described in this policy.

- **Registered agent:** Legalinc Corporate Services Inc., 131 Continental Dr, Suite 305, Newark, DE 19713, United States.
- **Email, including privacy requests:** [hello@fewmail.app](mailto:hello@fewmail.app).
- **Phone:** [+1 302 267 7919](tel:+13022677919).

Fewmail reads your connected Gmail mailboxes, sorts mail and helps you decide what to do. Paid plans and the trial also offer summaries, drafts and answers about your mail. **Free also uses AI to sort mail and check for risks.**

We do not sell your personal data, use your mail for advertising or use Google user data to train general-purpose AI models. Connecting an optional service, such as Telegram or an external AI assistant, lets that service receive the data needed for its features.

## 2. What we read from Google

Google asks you to allow access when you connect a mailbox. We request your basic profile and these permissions:

| Permission | What we use it for |
| --- | --- |
| Basic profile | Your name, email address and photo, to create and identify your account |
| Gmail (`gmail.modify`) | Read, search and organize mail; save drafts; send messages you approve |
| Calendar (`calendar.events`) | Show events from your primary calendar; create, change or delete events when you ask or approve |
| Contacts (`contacts`, `contacts.other.readonly`) | Show names and photos, suggest recipients and list contacts; delete a saved contact only when you choose to |

Calendar and Contacts are optional. You can leave them unticked on Google's consent screen and use the other features. Gmail access is needed to use Fewmail as an email app.

**Mail.** We read senders, recipients, subjects, dates, labels, message text and HTML, list and security headers, and attachment names, types and sizes. Recent sent mail helps us match your writing style and notice replies or promises you are waiting for.

**Attachments.** Opening a file or an image embedded in an email fetches it from Gmail through our server. We do not save a separate copy of those files. On paid plans and the trial, we may also send up to two attached PDFs or images per relevant email to Mistral to extract text. Each file must be no larger than 10 MB; for PDFs we request the first three pages. Extracted text is used in the AI request, rather than stored as a separate document. Facts from it can appear in saved summaries or reminders.

**Calendar and Contacts.** Calendar events are fetched live. Event details can also be included in an agent request or a stored request awaiting your approval. Google contacts are cached in server memory, refreshed on use after six hours, and are not stored in our database or sent to our AI models. Names and addresses already present in your email may still be processed as email data.

**Additional mailboxes.** Each mailbox grants its own permissions. Its mail joins your Fewmail account. Adding it does not let someone sign in to your Fewmail account using that mailbox.

## 3. What can change in your Google account

Changes happen when you take an action, approve a proposal or turn on a rule that allows the change.

- Opening a thread in Fewmail marks it as read in Gmail. Archive, trash, spam, pin and snooze controls also update Gmail.
- Rules you turn on can archive, mark read, unsubscribe or trash matching mail. Starter rules that change Gmail begin switched off. You can review completed actions under Rules.
- Messages you compose and AI-written replies need your explicit send approval. Ordinary sends have a short Undo window; scheduled sends wait until the time you choose.
- Unsubscribing contacts the mailing list through its unsubscribe link, a simple form or an unsubscribe email. The list receives the information in that request, which may identify your subscription. An enabled unsubscribe rule can make this request automatically.
- Your unfinished composer drafts and their attachments are saved in Gmail. Proposed AI replies and emails waiting to be sent are also stored encrypted in Fewmail. Uploaded outgoing attachments are kept until sending completes or the undone message is saved back to Gmail drafts.
- Inbox clear-out runs only after you approve the groups to archive. It scans metadata for up to 50,000 inbox emails without saving that scan as a separate mailbox copy. Cleared mail gets a label so you can restore it.

Requests from an external AI assistant through MCP that need consent wait for your approval in Fewmail. An approval shown only inside that assistant does not replace your approval in Fewmail.

## 4. How AI processes your data

The content sent depends on the feature. It can include relevant emails and earlier messages in a thread, your request, settings, writing style, examples of sent mail, and calendar details the agent looks up.

| Feature | Services that process it |
| --- | --- |
| Sorting, importance, rule matching and risk checks, on every plan | TypeSafe's Jev through OpenRouter |
| Summaries and information extracted from mail, on paid plans and the trial | Jev Router through OpenRouter; Google Gemini as fallback |
| Drafts and answers about your mail, on paid plans and the trial | Anthropic Claude through OpenRouter; xAI Grok as fallback |
| Suggestions while you type | Mistral Codestral; Jev Router through OpenRouter as fallback |
| Text from attached PDFs and images; transcription of voice messages | Mistral |
| Reading summaries and answers aloud | ElevenLabs receives the text to speak |

Jev Router selects a model for each request. We apply OpenRouter's restriction against data collection to that route. This is different from a promise that every provider deletes every request immediately: providers may retain data for security, abuse prevention or legal obligations under their terms and account settings.

We do not use your Google user data to develop, improve or train general-purpose AI or machine-learning models. Our use of AI providers must respect the same restriction. We have disabled Mistral's API data-sharing option and ElevenLabs' model-improvement option. These choices do not mean those providers immediately delete every request.

AI can misread mail, miss a deadline or write an incorrect draft. You can check the original email, change a draft and turn off rules.

## 5. Google API Limited Use

Fewmail's use and transfer of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including its Limited Use requirements and the [Google Workspace user data policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy).

We use that data only for the user-facing features described here. We do not transfer it for advertising, credit or lending decisions, or to data brokers. People at Fewmail may access Google user data only with your affirmative agreement to view specific data, where necessary for security or abuse investigations, or where required by law.

## 6. What we store and why

| Data | Why we keep it |
| --- | --- |
| Name, email, profile photo, sessions, IP address and browser information | Sign-in, account security and support |
| Encrypted Google access and refresh tokens | Keep the mailboxes you connected available without asking you to sign in for each sync |
| Synced mail and attachment metadata | Display mail, search and provide context for the agent |
| Summaries, proposed replies, approval requests and their supporting context | Show what the agent proposes and record your decisions |
| Rules, snippets, settings and information you give the agent | Apply your preferences |
| Notes about correspondents, writing style, promises, amounts and deadlines | Draft in your voice and help you follow up on paid plans and the trial |
| Emails waiting to send, uploaded outgoing attachments and reminders | Deliver approved messages and resurface mail when requested |
| Stripe customer and subscription identifiers, plan and usage records | Manage billing and your agent allowance; Stripe handles card details |
| Connected messenger identifiers, notification addresses and MCP permissions | Deliver messages and support connections you choose |

We gradually sync mail from three months before you connect a mailbox onward. Some older messages are stored too, for example when they belong to a synced thread or when you open, preview or act on an older thread. Browsing or searching older mail otherwise fetches it from Gmail, with a short server-memory cache. Formatted HTML for historical mail may be fetched on first opening.

Search uses account-specific keyed hashes of word beginnings from senders and subjects. These let us match part of a word without keeping a plain-text search index.

**Spam and fraud protection.** We store reports and signals about senders, domains, sending networks, message patterns, changed payment details and mailing-list subscriptions. We use keyed hashes and message fingerprints to compare patterns without sharing mail content between users. Some domain observations are stored encrypted. Hashes and identifiers can still be personal data; they are not automatically anonymous.

Community reports normally produce a warning or proposal. Mail moves to spam automatically only for senders you reported yourself. Mailing-list departure rates are shown only for lists received by at least ten users.

## 7. Who receives data

We send only the data needed for the purposes below. Providers process data under their applicable terms and privacy arrangements. Services you connect can keep their own copies; disconnecting them does not erase copies they already received.

| Recipient | Purpose and data involved |
| --- | --- |
| Google | Sign-in, Gmail, Calendar and Contacts. Cloud Pub/Sub sends us your mailbox address and a change identifier so we know when to sync |
| OpenRouter and the AI providers in section 4 | Process the content needed for the requested AI feature |
| Mistral and ElevenLabs | Process the text, attachments or audio described in section 4 |
| Stripe | Payments and subscriptions, including your account name and email; card details do not reach our servers |
| Railway | Host Fewmail's web app, API, worker and database |
| Cloudflare | Deliver and protect our sites and API; handles network requests, including IP addresses |
| PostHog, using its EU service | Product analytics, error reports and masked session recordings, described below |
| Telegram or WhatsApp (Meta), if connected | Your messages to the bot and replies, drafts, alerts, newsletter digests and weekly reports delivered there |
| Your browser's push service, if enabled | Delivers encrypted notifications. The sender, subject and summary are readable on your device, including on its lock screen if your settings allow |
| MCP clients you connect, such as Claude or Cursor | The mail and other data they request within the permissions you grant |
| GitHub | Desktop downloads and update checks; receives request information such as your IP address |
| Mailing-list operators | Unsubscribe requests you approve or authorize through a rule |

For sender website icons, our server sends only the website's domain to Google's favicon service. To check a domain's age, we send the domain to the public registration service through rdap.org. We do not send these services the full email address or email content.

Spam and phishing checks also use downloaded public lists: [Phishing.Database](https://github.com/Phishing-Database/Phishing.Database) (MIT), [StopForumSpam](https://www.stopforumspam.com/license), [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) (CC0) and the [Majestic Million](https://majestic.com/reports/majestic-million) (CC BY 3.0). These checks run on our servers; no mail is sent to the list publishers.

We may also disclose information when legally required or where necessary to investigate abuse or protect the service, subject to the Google Limited Use restrictions.

**International processing.** These services may process data outside your country, including in the United States. Using PostHog's EU service does not mean all Fewmail data stays in the EU. Contact us for information about processing locations and the safeguards applicable to your data.

## 8. Cookies, device storage and analytics

We use cookies and browser storage to keep you signed in, remember your language and preferences, and load the app quickly.

Home and Mail keep a local snapshot in your browser's IndexedDB. It includes mail previews, summaries and pending actions, including drafts and the email or calendar context attached to an approval request. It can therefore contain sensitive data. It refreshes as the app loads new data and is cleared when you sign out or delete your account through that browser. One-time-code fields and detected codes are masked before saving. Other devices may retain their own copies until they sign out or clear site data.

PostHog records page visits, feature use, plan, language, device and browser information, and errors. It receives your account ID, name and account email, and keeps browser identifiers. Recordings mask page text and inputs and block email frames and images. We configure analytics to exclude mail contents, correspondent addresses, subjects, drafts, searches and links from mail. These are measures to reduce disclosure, rather than a guarantee that every possible application error contains no personal data.

PostHog's default retention periods depend on its plan and when that plan began. Events and recordings have separate retention periods; account profiles remain until deleted. Its documentation explains [event retention](https://posthog.com/docs/data/events-retention) and [recording retention](https://posthog.com/docs/session-replay/recording-retention). Reaching a retention date does not guarantee immediate deletion.

We do not use advertising trackers. You can clear cookies and site storage in your browser; doing so can sign you out and remove saved preferences. Clearing storage does not delete analytics already received by PostHog. Contact us to exercise your privacy rights over those records.

## 9. Why we may process personal data

Where the GDPR or UK GDPR applies, we rely on:

- **Providing the service you request:** account access, connected mail features, AI processing needed for those features, subscriptions and support.
- **Legitimate interests:** protecting accounts, preventing fraud and spam, maintaining the service and understanding product use, balanced against your rights. This also covers handling information about other people contained in mail you connect, where applicable.
- **Consent:** processing for which applicable law requires consent. You can withdraw it without affecting processing that was lawful before withdrawal.
- **Legal obligations:** records and disclosures required by law, such as applicable accounting obligations.

Google permission lets us access your mailbox; it is not blanket consent to every use of personal data. Without the access needed for a feature, we cannot provide that feature. Optional Calendar, Contacts, messenger and notification access is not required to use the rest of the app.

## 10. Retention and account deletion

We keep synced mail, settings and agent records while your account exists so you can use mail history and ongoing reminders. A cleanup job removes completed or abandoned notification deliveries seven days after their last update. Contacts, older-mail lookups and raw files read for AI extraction are handled as described above rather than kept as separate permanent copies.

**Deleting your account** in Settings → Account removes the account and its linked mail, rules, settings, agent records and integrations from our active database. It also deletes your Stripe customer record, ending any paid subscription immediately, and attempts to revoke the Google grant for your sign-in mailbox. If Stripe deletion fails, account deletion stops so a subscription is not left billing a deleted account. You may need to sign in again before confirming deletion.

Deletion does not delete your Gmail messages, Gmail drafts or calendar events. To make sure all Google permissions are removed, including for added mailboxes, revoke them at [Google account permissions](https://myaccount.google.com/permissions).

Account deletion does not automatically erase every copy elsewhere. Hashed network signals are stored separately from account-linked records; analytics, support correspondence, infrastructure logs, backups and records held by connected services can have separate retention periods. Stripe retains payment and invoice records as required for its obligations. Contact us about deletion of remaining personal data and applicable retention periods. We may retain data where required by law or necessary for a legal claim.

## 11. Your choices and rights

You can turn off rules, remove added mailboxes and disconnect messengers or MCP clients in Settings. Removing an added mailbox deletes its synced mail from our active database, but does not revoke its Google permission. Revoking Google access prevents future authorized Google API access; it does not by itself delete data already stored by Fewmail.

Email [hello@fewmail.app](mailto:hello@fewmail.app) to request access, a portable copy, correction or deletion of your personal data, or to object to or restrict processing. These rights depend on the law that applies and can have exceptions. We may need to verify your identity. Where GDPR applies, we normally respond within one month and explain any permitted extension.

You may complain to your local data protection authority, including an EU/EEA authority or the UK's Information Commissioner's Office. You do not have to contact us first.

Fewmail uses automated sorting and recommendations to help manage mail. It is not designed to make decisions about your legal rights or other similarly significant matters. You can review the original mail and change or stop rules you enabled.

## 12. Security, age and changes

We use HTTPS and encrypt stored mail content, personal text and Google tokens. Technical identifiers, dates, flags, usage amounts and some security hashes remain readable in the database. This is server-side encryption: Fewmail and the providers needed to run its features can process the data. It is not end-to-end encryption of your mailbox. Local browser storage relies on the protection of your device and browser. No system can guarantee absolute security.

Fewmail is intended for people aged 16 or older. If you believe a child under 16 has provided personal data, contact us so we can investigate and delete it where appropriate.

We will update the date on this page when this policy changes. We will notify you in the app or by email before material changes take effect. If a new use requires consent, a policy update alone does not provide that consent.
