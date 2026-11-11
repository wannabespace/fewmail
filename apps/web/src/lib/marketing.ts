import { PRO_PRICE_USD } from '@fewmail/shared/agent'

export const TRIAL_DAYS = 14

export const PLANS = [
  {
    description: 'The sorting, the rules and the protection. Forever.',
    features: [
      'Every email sorted and scored by importance',
      'Plain-language rules that archive, mark read or unsubscribe',
      'Community spam shield and phishing warnings',
      'Zombie senders caught after you unsubscribe',
      'Automatic follow-ups on mail that expects a reply',
      'Snooze, snippets and Fewmail labels in Gmail',
    ],
    name: 'Free',
    price: 0,
  },
  {
    description: 'The whole agent: it reads, writes and remembers.',
    features: [
      'Today: a daily brief and one queue of decisions',
      'Replies drafted in your voice, sent only when you approve',
      'Telegram: the brief, approvals and voice instructions',
      '“Handle this”: the agent works a thread to its goal',
      'Promises and people remembered, boards with charts for money or anything you track',
      'Ask your mail anything, plus MCP for your own tools',
    ],
    includes: 'Free',
    name: 'Pro',
    price: PRO_PRICE_USD,
  },
] as const

export const FAQ = [
  {
    answer:
      'No. Fewmail works on top of Gmail. Everything it does shows up in Gmail too, and you can keep using any Gmail app alongside it.',
    question: 'Do I have to leave Gmail?',
  },
  {
    answer:
      'Never without you. Replies wait in your queue until you approve them, and only rules you created or kept can archive, mark read or unsubscribe on their own. Everything it did is listed under Handled.',
    question: 'Can it send or delete mail on its own?',
  },
  {
    answer:
      'Subjects, bodies, summaries and drafts are encrypted in our database. Your mail is never used to train models, and the spam shield shares only keyed hashes between users, never addresses or content.',
    question: 'What happens to my mail?',
  },
  {
    answer: `Every new account gets ${TRIAL_DAYS} days of Pro, no card. When it ends you simply stay on Free; nothing is deleted and nothing is charged.`,
    question: 'What happens after the trial?',
  },
  {
    answer:
      'Drafts are written in the language of the email you are answering. The app, the brief and the Telegram bot speak one language you choose, from fifteen.',
    question: 'Which languages does it speak?',
  },
  {
    answer:
      'Gmail and Google Workspace accounts today, one mailbox per account.',
    question: 'Which email accounts work?',
  },
] as const

export interface Comparison {
  name: string
  summary: string
  /** Their side is what the product publicly offers, checked on `checkedAt`. */
  rows: { fewmail: string; them: string; topic: string }[]
  slug: string
  verdict: string
}

export const COMPARISONS_CHECKED_AT = 'November 2026'

export const COMPARISONS: Comparison[] = [
  {
    name: 'Superhuman',
    rows: [
      {
        fewmail: 'An agent: it reads your mail and hands you decisions',
        them: 'A fast email client you work through yourself',
        topic: 'What it is',
      },
      {
        fewmail: `Free forever; Pro $${PRO_PRICE_USD}/month`,
        them: 'From $30 per member a month, no free plan',
        topic: 'Price',
      },
      {
        fewmail: 'A daily brief and a queue ordered by importance',
        them: 'Split inbox and keyboard triage',
        topic: 'Your day',
      },
      {
        fewmail: 'Drafted in your voice, sent only when you approve',
        them: 'AI writing help inside the composer',
        topic: 'Replies',
      },
      {
        fewmail: 'Brief, approvals and voice instructions in Telegram',
        them: 'Its own apps',
        topic: 'On the go',
      },
      {
        fewmail: 'Community spam shield, phishing and payment-change warnings',
        them: 'Relies on your mail provider',
        topic: 'Protection',
      },
    ],
    slug: 'superhuman',
    summary:
      'Superhuman makes you faster at going through every email. Fewmail goes through them for you and shows only what needs you.',
    verdict:
      'Pick Superhuman if you want to touch every email yourself, faster. Pick Fewmail if you would rather not see most of them at all.',
  },
  {
    name: 'Shortwave',
    rows: [
      {
        fewmail: 'Works on top of Gmail; keep any Gmail app',
        them: 'A new email client built on Gmail',
        topic: 'What it is',
      },
      {
        fewmail: `Free forever; Pro $${PRO_PRICE_USD}/month`,
        them: 'Free plan; paid plans billed per seat',
        topic: 'Price',
      },
      {
        fewmail: 'A daily brief and a queue of decisions, two batches a day',
        them: 'Bundles and an AI assistant you ask',
        topic: 'Your day',
      },
      {
        fewmail: 'Drafted ahead of time in your voice, approved with one key',
        them: 'Drafts when you ask the assistant',
        topic: 'Replies',
      },
      {
        fewmail: 'Brief, approvals and voice instructions in Telegram',
        them: 'Its own apps',
        topic: 'On the go',
      },
      {
        fewmail: 'Community spam shield, phishing and payment-change warnings',
        them: 'Relies on Gmail',
        topic: 'Protection',
      },
    ],
    slug: 'shortwave',
    summary:
      'Shortwave is an email client with an AI assistant you talk to. Fewmail is an agent that does the reading first and asks you only what it cannot decide.',
    verdict:
      'Pick Shortwave if you want a new inbox with a chat assistant. Pick Fewmail if you want fewer emails to look at, in the Gmail you already use.',
  },
  {
    name: 'SaneBox',
    rows: [
      {
        fewmail: 'An agent that reads, decides and drafts',
        them: 'A filter that moves mail into folders',
        topic: 'What it is',
      },
      {
        fewmail: `Free forever; Pro $${PRO_PRICE_USD}/month`,
        them: 'Paid plans only, after a 14-day trial',
        topic: 'Price',
      },
      {
        fewmail: 'Plain-language rules: “newsletters I never open”',
        them: 'Training by moving mail between folders',
        topic: 'Sorting',
      },
      {
        fewmail: 'Drafted in your voice, sent only when you approve',
        them: 'None',
        topic: 'Replies',
      },
      {
        fewmail: 'A daily brief in your language',
        them: 'A digest of filtered mail',
        topic: 'Summary',
      },
      {
        fewmail: 'Unsubscribe in one key; senders who ignore it go to spam',
        them: 'A folder for mail you never want to see',
        topic: 'Unsubscribing',
      },
    ],
    slug: 'sanebox',
    summary:
      'SaneBox sorts mail into folders. Fewmail sorts it too, then reads what is left, writes the replies and tells you what matters in one brief.',
    verdict:
      'Pick SaneBox if folders are all you need. Pick Fewmail if you also want the important mail read, summarised and answered.',
  },
]
