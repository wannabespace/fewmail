# Legal document validation

Reviewed on 18 November 2026 against the current repository and the official sources linked below. This is a document and implementation consistency review, not a jurisdiction-specific legal opinion. The revised public documents are drafts until the open items below are resolved. No production account settings, processor contracts or deployment configuration were independently verified.

## Changes made

- Rewrote Privacy and Terms in plain English with short sections and tables. English remains the binding document language required by the project.
- Corrected paid-plan coverage, AI on Free, stored AI drafts, calendar approval context and local browser snapshots. Snapshots can contain drafts and full thread context, so the old claim that they never contain full emails was inaccurate.
- Named Railway and Cloudflare, explained connected services, server-side encryption and the difference between preventing model training and immediate provider deletion.
- Removed the unverified 30-day backup promise, the claim that all identifiers and hashes are nonpersonal, and the promise that Google revocation or complete deletion always happens immediately.
- Added privacy-request rights, processing purposes and proposed legal bases, automatic-renewal disclosure, statutory refund and withdrawal protections, and limits on warranty and liability exclusions.
- Removed the blanket reverse-engineering ban, which conflicted with the source's AGPL rights, and the unlimited consumer indemnity. Replaced the unidentified governing jurisdiction with Delaware after the owner supplied the company details, preserving mandatory consumer protections.
- Corrected the privacy page's search description so it no longer promises deletion of every copy.

## Required before treating the documents as validated for publication

### 1. Company identity supplied; market-specific representation remains to assess

On 18 November 2026, the owner supplied a company-details screenshot identifying Wannabe Space, LLC as a Delaware LLC, file number 5255992, with phone +1 302 267 7919 and registered agent Legalinc Corporate Services Inc., 131 Continental Dr, Suite 305, Newark, DE 19713, United States. These details are now in both public documents. At the owner's request, the business contact address is omitted. The registered agent's address is explicitly labeled as such; it is not presented as an operating or customer-support address. The representative's name and the EIN were not copied. The screenshot is owner-supplied evidence, not an independent registry check. Whether the registered-agent address alone meets the physical-address disclosure rules in each target market remains to be assessed.

Terms now choose Delaware law while preserving mandatory consumer protections and available courts, consistent with [Rome I, Article 6](https://eur-lex.europa.eu/eli/reg/2008/593/oj/eng). Assess whether EU/UK representatives or a DPO are required for the actual operations and target markets, and publish their details if applicable.

### 2. AI providers' training and retention settings

`apps/api/lib/ai.ts` restricts data collection for Jev Router, but the writer, fallback routes and `apps/api/lib/jev.ts` do not independently enforce the same request setting. Account-wide controls or provider contracts may supply it; they were not verified. Check OpenRouter's account and organization privacy settings, input/output logging, all routed endpoints, and coverage of the decisions endpoint.

Mistral's API training/data-sharing opt-out and ElevenLabs' model-improvement opt-out are confirmed by the owner as disabled on 18 November 2026. These two configuration actions are complete on owner confirmation; they were not independently inspected. Privacy now reflects the settings. This does not establish historical treatment of data sent before the changes, zero retention, or coverage of the OpenRouter routes above.

Keep **Improve the models for everyone** off under ElevenLabs' **Terms and privacy → Data use**, and the API **Anonymous improvement data** toggle off under Mistral's **Admin → Privacy**. Mistral's Vibe toggle is separate and does not cover Fewmail's API calls. Do not replace the no-training obligation with a broad consent clause. [Google Limited Use](https://developers.google.com/workspace/workspace-api-user-data-developer-policy) restricts how Workspace data may be used. [OpenRouter](https://openrouter.ai/docs/guides/privacy/provider-logging) distinguishes training policies from provider retention; [Mistral's API opt-out instructions](https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training) and [zero-retention documentation](https://docs.mistral.ai/admin/monitor-comply/zero-data-retention) describe separate controls; [ElevenLabs](https://elevenlabs.io/docs/help-center/legal/is-my-data-used-to-improve-eleven-labs-ai-models) documents its opt-out. Actual provider retention and contractual terms remain to be recorded.

### 3. Analytics consent and privacy operations

`apps/web/src/main.tsx` captures page visits and `apps/web/src/lib/posthog.ts` initializes PostHog without a consent choice, including persistent identifiers and session replay configuration. The policy now describes this behavior; it does not make it compliant. Implement prior consent and a withdrawal control for nonessential browser tracking where required, or document and implement a valid exemption. Identified analytics and replay must not be assumed exempt merely because mail text is masked. Keep necessary service/security telemetry distinct from optional browser analytics. [CNIL's analytics guidance](https://www.cnil.fr/fr/node/677) explains the narrow exemption.

Confirm event, person-profile and replay retention in PostHog. `posthog.reset()` only resets the browser identity; account deletion does not request deletion of the remote profile or historic events. Establish and test an authenticated process to fulfill access, export and erasure requests across the database, PostHog, support and processors. Validate error sanitization: `captureException` can transmit error details even though normal event properties and page recordings are masked.

### 4. Account deletion and hashed network records

`apps/api/lib/auth.ts` deletes the Stripe customer, attempts Google revocation, then relies on account foreign-key cascades. In `packages/db/schema/insight.ts`, `bulk_prints`, `domain_sightings`, `list_sightings`, `template_reports` and `pattern_reports` identify users by a keyed `userHash` without a cascading user foreign key. They survive account deletion. A 30-day query window in `services/bulk.ts` is not a retention/deletion job.

Delete the user's hash-linked records as part of account deletion, or establish and justify a lawful, limited retention policy. Add a regression check that covers all five tables. Do not describe these rows as anonymous merely because the account identifier is hashed. The [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng) treats pseudonymized data as personal data when it remains attributable.

### 5. Retention and international transfers

The owner explicitly prefers not to publish a specific hosting region. No Railway/database region is added to the public documents, and no EU-only processing promise is made. This preference does not remove the need to disclose applicable international-transfer safeguards.

The owner reports default retention settings. Defaults are not one common duration: [PostHog events](https://posthog.com/docs/data/events-retention) depend on plan and paid-plan start date, while [recordings](https://posthog.com/docs/session-replay/recording-retention) have a separate policy. Default event eligibility is one year on Free, two years for new paid plans from 5 November 2026, and seven years for qualifying older paid plans. Person profiles remain until deletion, and expired records need not be physically erased immediately. No specific Fewmail PostHog plan was supplied, so the public notice explains the dependency and links the policies without asserting an unverified duration.

[Railway backups](https://docs.railway.com/volumes/backups) have daily, weekly and monthly schedules with different retention periods. Saying that settings are at defaults does not establish which schedule is active or whether manual snapshots exist. Confirm backup rotation, restore/deletion procedures, infrastructure logs and support retention before declaring those checks closed. The old 30-day backup promise remains removed.

Verify processor agreements and the actual mechanism for every relevant international transfer, such as an applicable adequacy decision or signed contractual safeguards. Update Privacy with the real mechanism and how to obtain a copy. Do not claim that SCCs are signed, a provider is certified or all processing stays in the EU without evidence. [The European Commission lists the required privacy disclosures](https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en), including purposes, legal bases, retention, recipients, transfers and rights.

### 6. Consumer checkout and withdrawal

Verify the actual Stripe prices, taxes, renewal terms, cancellation timing, plan-change proration and refund handling. The code holds Stripe price IDs, not evidence of the prices configured in the live account. Check that the recurring payment obligation and contractual information are visible before payment and supplied in a durable confirmation. The general statutory-rights clause does not replace required checkout disclosures.

Implement the applicable online withdrawal process and refund workflow. A normal Stripe renewal-cancellation button is not necessarily withdrawal from the contract. [Directive (EU) 2023/2673, Article 11a and Article 2](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023L2673) requires an accessible online withdrawal function and durable acknowledgement through national measures applying from 19 June 2026. Confirm the implementation for target countries; email instructions alone do not satisfy that interface requirement. Supply the required model withdrawal form and obtain any legally necessary express request before charging for service delivered during a withdrawal period. [UK cancellation rules](https://www.legislation.gov.uk/uksi/2013/3134/part/3) also need market-specific verification.

### 7. Unsubscribe email versus explicit-send approval

`services/thread-effects.ts` falls back to `unsubscribeByMail`, which calls `sendMail` directly. `services/simple-rules.ts` and `services/agent.ts` can reach it through an autonomous unsubscribe rule. That can send an email without a separate explicit approval and without the ordinary outbox Undo window. The public drafts distinguish this existing behavior from composed messages and AI replies so they do not make a false universal promise.

This conflicts with the project's rule that sending always requires explicit approval. Enforce that invariant in the service layer: automatic rules must not use the email fallback without a new approval. Verify both simple and model-matched rules, direct unsubscribe, approved cards, clear-out and messenger/MCP calls. After fixing the behavior, align both public documents; do not use the revised description as authorization to weaken the product's consent rule.

### 8. Legal bases and sensitive mailbox contents

The legal-basis section is a proposed mapping requiring validation, not proof that the conditions are met. Document the legitimate-interests assessment for security/network signals, correspondent data and analytics. Mail can reveal health, beliefs and other sensitive information about users and third parties. Determine the applicable Article 9 condition and controller/processor roles for personal versus organizational use; ordinary mailbox authorization and contract necessity alone do not settle this. Assess whether a customer DPA, an Article 14 notice or an exception, and a DPIA are required. [European Commission guidance](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data_en) explains the additional rules for sensitive data.

Have counsel for the verified jurisdiction and target markets review the final liability cap, free-user terms, age/capacity requirements and consumer clauses. Do not present this review as a certification of GDPR or worldwide consumer-law compliance.

## Validation performed

- `pnpm --filter @fewmail/web build` passed, including prerendering the public legal pages. The build reports the existing large-chunk advisory.
- `pnpm exec ultracite check apps/web/src/lib/seo.ts` passed.
- Checked generated Privacy and Terms HTML for their sections and rendered tables, and checked the diff for whitespace errors.
- No model, prompt, price, allowance, runtime behavior or dependency changed; AI economics and runtime memory measurement are not affected by these document edits.
