import type { Rich } from '../locales'
import { plural } from '../locales'

export const en = {
  actionKind: {
    archive: 'Archive',
    cleanup: 'Unsubscribe from all',
    commitment: 'Done',
    follow_up: 'Follow up',
    mark_read: 'Mark read',
    pay: 'Pay',
    read: 'Read',
    reply: 'Reply',
    schedule: 'Schedule',
    security: 'I checked it',
    spam: 'Moved to spam',
    task: 'Send',
    trash: 'Move to trash',
    unsubscribe: 'Unsubscribe',
  },
  actionStatus: {
    auto_done: 'done by the agent',
    dismissed: 'skipped',
    done: 'done',
    failed: 'failed',
    pending: 'waiting in Today',
  },
  ask: {
    label: (question: string) => `Ask Fewmail: “${question}”`,
    thinking: 'Looking through your mail…',
  },
  boards: {
    chart: {
      add: 'Add chart',
      edit: 'Chart settings',
      empty: 'Nothing to draw yet',
      groupBy: 'Grouped by',
      groupings: {
        group: 'Who or what',
        month: 'Month',
        status: 'Status',
        week: 'Week',
      },
      measure: 'Shows',
      measures: { count: 'Count', sum: 'Total amount' },
      other: 'Other',
      remove: 'Remove chart',
      title: 'Chart title',
      type: 'Chart type',
      types: {
        area: 'Area',
        bar: 'Bars',
        line: 'Line',
        pie: 'Pie',
      },
      untitled: 'New chart',
    },
    charts: 'Charts',
    create: 'Create board',
    delete: 'Delete board',
    description: 'What it collects',
    descriptionPlaceholder:
      'Trips: flights, hotels and car rentals, with what they cost',
    edit: 'Edit board',
    editHint: 'Changing what it collects reads the last six months again.',
    empty: 'Nothing here yet. Matching emails show up as they arrive.',
    entries: (total: number) =>
      plural('en', total, {
        one: () => 'One entry',
        other: (n) => `${n} entries`,
      }),
    name: 'Name',
    namePlaceholder: 'Travel',
    new: 'New board',
    newHint:
      'Describe what to collect in your own words. Fewmail finds it in the last six months of mail, picks the charts and keeps it up to date.',
    planning: 'Setting it up…',
    readingHistory: 'Reading the last six months of mail…',
    save: 'Save',
    starter: {
      money: {
        description:
          'Payments, subscriptions, bills and refunds: what I pay for, to whom and how much.',
        name: 'Money',
      },
    },
  },
  bulk: {
    badge: (n: number) => `Sent to ${n}+ Fewmail users`,
    reason: (n: number) => `Mass email: ${n}+ Fewmail users got the same text`,
  },
  byRule: 'by a rule',
  category: {
    calendar: 'Calendar',
    finance: 'Finance',
    newsletter: 'Newsletter',
    notification: 'Notification',
    other: 'Other',
    person: 'Person',
    promotion: 'Promotion',
    receipt: 'Receipt',
    security: 'Security',
    travel: 'Travel',
    work: 'Work',
  },
  commitments: {
    title: 'You promised',
  },
  compose: {
    backInQueue: 'Canceled. The draft is back in Today.',
    canceled: 'Canceled. Your email is back in the editor.',
    cc: 'Cc',
    discard: 'Discard',
    forward: 'Forward',
    forwardedMessage: 'Forwarded message',
    from: 'From',
    instructionPlaceholder: 'How should it read? (optional)',
    invalidRecipients: 'Add at least one valid email address.',
    later: {
      inHour: 'In an hour',
      monday: 'Monday morning',
      tomorrow: 'Tomorrow morning',
    },
    new: 'New email',
    placeholder: 'Write your email…',
    remind: {
      days: (total: number) =>
        plural('en', total, {
          one: () => 'Remind me if no reply in a day',
          other: (n) => `Remind me if no reply in ${n} days`,
        }),
      label: 'Remind me',
      off: 'No reminder',
    },
    reply: 'Reply',
    scheduledFor: (date: string) => `Scheduled for ${date}`,
    send: 'Send',
    sendLater: 'Send later',
    sendingIn: (seconds: number) => `Sending in ${seconds} s`,
    subject: 'Subject',
    to: 'To',
    undo: 'Undo',
    writeForMe: 'Write it for me',
    writing: 'Writing…',
  },
  cleanup: {
    emails: (total: number) =>
      plural('en', total, {
        one: () => '1 email',
        other: (n) => `${n} emails`,
      }),
    reason: (total: number) => `${total} emails this month, none opened`,
    title: (total: number) =>
      plural('en', total, {
        one: () => 'Unsubscribe from a newsletter you never open',
        other: (n) => `Unsubscribe from ${n} newsletters you never open`,
      }),
  },
  command: {
    agent: 'Agent',
    appearance: 'Appearance',
    compose: 'New email',
    checkMail: 'Check for new mail',
    goTo: 'Go to',
    inboxUpToDate: 'Inbox is up to date',
    mail: 'Mail',
    nothingMatches: 'Nothing matches.',
    placeholder: 'Search mail or run a command…',
    rewriteBrief: 'Rewrite the brief',
    searchFor: (query: string) => `Search mail for “${query}”`,
    teachRule: 'Teach a new rule',
    upgrade: 'Upgrade to Pro',
    theme: {
      dark: 'Use dark theme',
      light: 'Use light theme',
      system: 'Match system theme',
    },
  },
  composer: {
    acceptSuggestion: 'Tab to accept',
    bold: 'Bold',
    bulletList: 'Bulleted list',
    italic: 'Italic',
    link: 'Link',
    linkPlaceholder: 'Paste or type a link',
    noSnippets: 'No snippets match.',
    removeLink: 'Remove link',
  },
  importance: ['Noise', 'Worth knowing', 'Needs you soon', 'Urgent'],
  keys: {
    anything: 'anything',
    approve: 'approve',
    archive: 'archive',
    reply: 'reply',
    snooze: 'snooze',
    close: 'close',
    draftReply: 'draft reply',
    edit: 'edit',
    move: 'move',
    open: 'open',
    search: 'search',
    send: 'send',
    skip: 'skip',
    stopEditing: 'stop editing',
  },
  legal: {
    privacy: 'Privacy Policy',
    englishOnly:
      'This document is provided in English, which is the binding version.',
    terms: 'Terms of Service',
    updated: (date: string) => `Last updated ${date}`,
  },
  login: {
    agree: ((slots) => [
      'By continuing you agree to the ',
      slots.terms,
      ' and the ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail asks to read, organize and send Gmail for you. Nothing is sent and nothing is archived without your say, unless you write a rule that allows it.',
    continue: 'Continue with Google',
    lead: 'Fewmail reads your inbox for you, answers in your voice and only shows you what actually needs you.',
    messengers:
      'Works in messengers too, starting with Telegram: get the brief, approve replies or just send a voice message.',
    title: 'Only what matters.',
  },
  mail: {
    archive: 'Archive',
    archived: 'Archived',
    block: 'Block sender',
    blocked: 'Blocked. Their mail now goes to the trash.',
    forward: 'Forward',
    more: 'More',
    movedToInbox: 'Moved back to the inbox. Thanks for telling us.',
    noThread: 'Pick an email to read it here',
    notSpam: 'Not spam',
    reply: 'Reply',
    reportSpam: 'Report spam',
    reportedSpam: 'Reported. Their mail now goes to spam.',
    trash: 'Move to trash',
    trashed: 'Moved to trash',
    attachment: 'attachment',
    draftReply: 'Draft reply',
    drafting: 'Drafting…',
    draftWaiting: 'Draft is waiting in Today',
    due: (date: string) => `due ${date}`,
    empty: 'No emails here.',
    expectsReply: 'Expects a reply',
    filter: {
      inbox: 'Inbox',
      snoozed: 'Snoozed',
      spam: 'Spam',
      important: 'Important',
      needs_reply: 'Needs reply',
      quiet: 'Quiet',
    },
    instruction: 'Tell the agent how to reply, or just press Enter',
    open: 'Open',
    openInGmail: 'Open in Gmail',
    search: 'Search or describe: invoices from Anna last month',
    unsubscribe: 'Unsubscribe',
    unsubscribed: 'Unsubscribed',
    unsubscribeFailed:
      'This sender has no one-click unsubscribe, so the email was archived.',
    you: 'You',
  },
  nav: {
    boards: 'Boards',
    newBoard: 'New board',
    mail: 'Mail',
    rules: 'Rules',
    search: 'Search or ask…',
    settings: 'Settings',
    syncFailed: 'Gmail sync failed, retrying',
    syncing: 'Reading your inbox…',
    today: 'Today',
    trialLeft: (total: number) =>
      plural('en', total, {
        one: () => 'Pro trial · 1 day left',
        other: (n) => `Pro trial · ${n} days left`,
      }),
    watching: 'Agent is watching your inbox',
  },
  notifications: {
    many: (total: number) =>
      plural('en', total, {
        other: (n) => `${n} new from Fewmail`,
      }),
  },
  onboarding: {
    languageHint:
      'The app, briefs, summaries and explanations use this language. Replies always match the language of the email you answer.',
    languageTitle: 'Which language should Fewmail speak?',
    lead: 'Two quick answers. You can change all of them later in Settings.',
    personaTitle: 'How do you use email?',
    reading: 'Reading your inbox…',
    start: 'Start',
    title: 'Let’s set up your agent.',
  },
  plan: {
    free: 'Free',
    freeDescription:
      'Fast, calm mail with simple rules. Free for as long as you like.',
    includes:
      'Pro adds the agent: a daily brief, every email read and summarized, replies drafted in your voice, rules in plain words, Telegram and MCP.',
    manage: 'Manage billing',
    price: (usd: number) => `$${usd} / month`,
    pro: 'Pro',
    proCancels: (date: string) => `Pro until ${date}, then Free.`,
    proRenews: (date: string) => `Renews on ${date}.`,
    title: 'Plan',
    trial: 'Pro trial',
    trialDescription: (date: string) =>
      `Every Pro feature until ${date}. Afterwards Fewmail stays free with simple rules — no card needed.`,
    upgrade: 'Upgrade to Pro',
    welcome: 'Welcome to Pro. The agent is back on duty.',
  },
  people: {
    firstContact: (date: string) => `Writing since ${date}`,
    lastContact: (date: string) => `Last email ${date}`,
    open: 'Open with them',
    promised: 'You promised',
    threads: (total: number) =>
      plural('en', total, {
        one: () => '1 conversation',
        other: (n) => `${n} conversations`,
      }),
  },
  persona: {
    reader: {
      description:
        'I mostly read. Keep my inbox calm, handle the noise and make sure nothing important slips by.',
      title: 'I mostly read',
    },
    responder: {
      description:
        'I answer a lot. Put the people waiting on me first and have replies drafted in my voice.',
      title: 'I reply a lot',
    },
  },
  queue: {
    draftedInVoice: 'Drafted in your voice',
    edit: 'Edit',
    open: 'Open',
    send: 'Send',
    shorter: 'Shorter',
    shorterInstruction: 'Make it shorter.',
    skip: 'Skip',
  },
  reminders: {
    followUp: 'Follow up',
    noReply: 'No reply yet',
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} is on a public list of live phishing sites. Do not click links, sign in or pay.`,
    lookalike_domain: (domain: string) =>
      `Looks like ${domain}, but it is a different address. Do not click links or pay.`,
    new_sender_payment: (domain: string) =>
      `First email from ${domain} and it asks for money. Verify through a channel you already trust.`,
    spoofed_sender: (domain: string) =>
      `Claims to be from ${domain}, but ${domain} did not send it. Do not click links or pay.`,
    payment_change: (domain: string) =>
      `New payment details from ${domain}. Confirm by phone before paying.`,
    title: 'Check before you act',
  },
  rules: {
    actWithoutAsking: 'Act without asking',
    add: 'Add rule',
    count: (total: number) =>
      plural('en', total, { one: () => '1 rule', other: (n) => `${n} rules` }),
    delete: 'Delete',
    describe: {
      alwaysShow: 'Always lands in Today',
      autonomous: 'Done on its own, listed under handled',
      draft: 'A draft waits for you in Today',
      suggested: 'Suggested in Today, you confirm',
    },
    effect: {
      always_show: 'Always show me',
      archive: 'Archive it',
      draft_reply: 'Draft a reply',
      mark_read: 'Mark as read',
      trash: 'Move to trash',
      unsubscribe: 'Unsubscribe',
    },
    enabled: 'Rule enabled',
    lead: 'Tell the agent in plain words what to do with certain mail. It reads every email against these, top to bottom.',
    newTitle: 'Teach a new rule',
    leadFree:
      'Archive, mark as read or unsubscribe automatically. Rules run on new mail the moment it arrives.',
    placeholder: 'e.g. Invoices from Hetzner, or LinkedIn notifications',
    simple: {
      appliedAutomatically: 'Applied automatically to new mail',
      field: {
        from: 'From',
        mailingList: 'Any mailing list',
        subject: 'Subject contains',
      },
      title: {
        from: (value: string) => `From “${value}”`,
        mailingList: () => 'Any mailing list',
        subject: (value: string) => `Subject contains “${value}”`,
      },
      valuePlaceholder: 'anna@example.com, a name or a word',
      whichField: 'Match by',
    },
    title: 'Rules',
    whatAgentDoes: 'What the agent does',
    whichEmails: 'Which emails',
    withoutAsking: 'Without asking',
  },
  settings: {
    account: 'Account',
    agent: 'Agent',
    briefDescription: (timezone: string) => `In your time zone, ${timezone}`,
    briefTitle: 'Daily brief',
    deleteAccount: 'Delete account',
    deleteConfirm: 'Delete everything',
    deleteDescription:
      'Deletes your account, synced mail, drafts, rules and briefs from Fewmail right away. Your Gmail itself is not touched.',
    deleteTitle: 'Delete your Fewmail account?',
    cancel: 'Cancel',
    integrations: 'Integrations',
    knowledge: {
      description:
        'Prices, addresses, availability, how you like to answer. The agent uses it in drafts and autocomplete.',
      placeholder:
        'e.g. Consulting is $150/h. I do not take calls on Fridays. My address is…',
      title: 'What the agent should know',
    },
    labels: {
      description:
        'Sort mail into Fewmail/… labels so Gmail on your phone shows the same order.',
      title: 'Agent labels in Gmail',
    },
    language: 'Language',
    languageDescription: 'App, briefs and summaries. Replies follow the email.',
    legal: 'Legal',
    mailboxes: {
      add: 'Add Gmail',
      addDescription:
        'Another Gmail account’s mail joins the same Today and inbox. It never signs anyone in here: signing in with it opens a separate Fewmail.',
      added: 'Mailbox added. Its mail shows up in a minute.',
      failed: 'Could not add the mailbox. Allow Gmail access and try again.',
      lost: 'Gmail access was lost. Add it again to reconnect.',
      reading: 'Reading mail…',
      remove: 'Remove',
      signIn: 'You sign in with this one',
      signInChosen: 'That is the account you sign in with. Choose another one.',
      synced: (ago: string) => `Synced ${ago}`,
      title: 'Mailboxes',
    },
    mcp: {
      copyNow: 'Copy this config now: the key is shown only once.',
      create: 'Create key',
      defaultName: 'MCP client',
      description:
        'They can read your brief and mail, draft replies and send them after you confirm.',
      keyName: 'Key name',
      neverUsed: 'Never used',
      revoke: 'Revoke',
      title: 'Connect Claude, Cursor or any MCP client',
      used: (ago: string) => `Used ${ago}`,
    },
    persona: 'How you use email',
    signedInWithGoogle: 'Signed in with Google',
    signOut: 'Sign out',
    snippets: {
      add: 'Add snippet',
      body: 'Text',
      delete: 'Delete',
      description: 'Type ; in the editor to insert a snippet by name.',
      name: 'Name',
      title: 'Snippets',
    },
    notifications: {
      blocked:
        'Notifications are blocked. Allow them in this site’s browser settings.',
      browser: 'This browser',
      notConfigured: 'Browser notifications are not configured on this server.',
      off: 'Get urgent mail and the daily brief here, even with Fewmail closed.',
      on: 'Urgent mail and the daily brief show up here. Several at once arrive as one.',
      title: 'Notifications',
      unsupported: 'This browser cannot show notifications.',
    },
    telegram: {
      connect: 'Connect Telegram',
      disconnect: 'Disconnect',
      linked:
        'Your brief arrives every morning, urgent mail right away. Approve and edit drafts from the chat.',
      notConfigured: 'The Telegram bot is not configured on this server.',
      unlinked: 'Get the brief and approve drafts from Telegram.',
    },
    whatsapp: {
      connect: 'Connect WhatsApp',
      disconnect: 'Disconnect',
      linked:
        'Your brief arrives every morning, urgent mail right away. Approve and edit drafts from the chat.',
      notConfigured: 'The WhatsApp bot is not configured on this server.',
      unlinked: 'Get the brief and approve drafts from WhatsApp.',
    },
    title: 'Settings',
  },
  snooze: {
    laterToday: 'Later today',
    nextWeek: 'Next week',
    title: 'Snooze',
    tomorrow: 'Tomorrow',
    unsnooze: 'Back to inbox',
    until: (date: string) => `Snoozed until ${date}`,
    weekend: 'This weekend',
  },
  spam: {
    reasonList: 'On a public list of spammer domains',
    reasonPattern: {
      auth: 'Failed sender authentication: the address is forged',
      infra: 'Sent from a network several Fewmail users reported for spam',
      link: 'Links to sites several Fewmail users reported as spam',
      signals: 'New domain, odd address and weak authentication together',
      template: 'Same text that several Fewmail users reported as spam',
    },
    reasonCommunity: 'Reported as spam by several Fewmail users',
    reasonYou: 'You reported this sender as spam',
    suspect: 'Looks like spam',
  },
  starterRules: {
    alwaysShow:
      'Security alerts, bills that are due, anything from my bank or government',
    newsletters: 'Newsletters and digests',
    notifications: 'Automated notifications from tools and services',
    people:
      'Emails from real people that ask me a question or wait for my answer',
    promotions: 'Promotions, marketing and cold sales emails',
    receipts: 'Receipts, order and shipping confirmations',
  },
  tasks: {
    active: (goal: string) => `The agent is on it: ${goal}`,
    auto: 'Send emails without asking me',
    autoHint: 'Each email still waits a few seconds so you can undo it.',
    cancel: 'Stop',
    done: 'Task done',
    goal: 'What should the agent achieve?',
    goalPlaceholder: 'e.g. Get the invoice resent with our new address',
    handle: 'Handle this…',
    next: 'Next step',
    start: 'Start',
    started: 'The agent is on it.',
  },
  telegram: {
    commands: { brief: 'Today’s brief', queue: 'What needs you' },
    connectFirst:
      'Open Fewmail → Settings → Integrations and tap “Connect Telegram” first.',
    connected:
      'Connected. I will send your brief every morning and ping you when something urgent arrives.\n\n/brief — today’s brief\n/queue — what needs you',
    done: 'Done',
    draft: 'Draft:',
    edit: 'Edit',
    editPrompt:
      'Send me the text to use instead, or tell me how to change it starting with “/”, e.g. “/more formal”.',
    newDraft: 'New draft:',
    heard: (text: string) => `Heard: “${text}”`,
    nothing: 'Nothing needs you right now.',
    proOnly:
      'Telegram is part of Fewmail Pro. Open Settings → Plan in Fewmail to upgrade.',
    queueHint: '/queue — what needs you',
    rewriting: 'Rewriting…',
    canceled: 'Canceled. The draft is back in your queue.',
    send: 'Send',
    sendThis: 'Send this',
    sendingIn: (seconds: number) => `Sending in ${seconds} s`,
    shorter: 'Shorter',
    skip: 'Skip',
    skipped: 'Skipped',
    somethingWrong: 'Something went wrong',
    undo: 'Undo',
    voiceFailed: 'I could not make that out. Try again or type it.',
    whichEmail: 'Which email? Reply to one of my messages with what to say.',
    urgent: 'Urgent',
    willSend: 'Will send:',
  },
  today: {
    briefArrives: (time: string) => `Your brief arrives every day at ${time}.`,
    briefFrom: (time: string) => `brief from ${time}`,
    done: 'Done',
    firstRead:
      'Reading the last three days of your mail. What needs you shows up here on its own.',
    handled: {
      archived: (n: number) => `${n} archived`,
      markedRead: (n: number) => `${n} marked read`,
      spam: (n: number) => `${n} to spam`,
      review: 'Review',
      total: (n: number) => `${n} handled`,
      unsubscribed: (n: number) => `${n} unsubscribed`,
    },
    headline: (total: number) =>
      total === 0
        ? 'All calm.'
        : plural('en', total, {
            one: () => 'One thing needs you.',
            other: (n) => `${n} things need you.`,
          }),
    later: (total: number, time: string) =>
      plural('en', total, {
        one: () => `One more arrives at ${time}`,
        other: (n) => `${n} more arrive at ${time}`,
      }),
    nothingNeedsYou:
      'Nothing needs you right now. New mail is read the moment it arrives.',
    sent: 'Sent',
    waitingOnYou: 'Waiting on you',
    worthAttention: 'Worth your attention',
    writeNow: 'Write it now',
    writing: 'Writing…',
  },
  whatsapp: {
    connectFirst:
      'Open Fewmail → Settings → Integrations and tap “Connect WhatsApp” first.',
    connected:
      'Connected. I will send your brief every morning and message you when something urgent arrives. Send text or a voice message to answer any email.',
    proOnly:
      'WhatsApp is part of Fewmail Pro. Open Settings → Plan in Fewmail to upgrade.',
  },
  zombie: {
    badge: (share: number) => `Ignores unsubscribes for ${share}% of people`,
    reason: 'Kept mailing you after you unsubscribed',
  },
}

export type Messages = typeof en
