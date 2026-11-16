import type { AgentToolName, ConsentToolName } from '../../agent'
import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'

export const en = {
  actionDone: {
    heads_up: 'Got it',
    commitment: 'Done',
    confirm: 'I confirmed',
    follow_up: 'I followed up',
    pay: 'I paid it',
    read: 'I read it',
    renew: 'I renewed it',
    schedule: 'I scheduled it',
    security: 'I checked it',
    sign: 'I signed it',
  },
  actionLink: {
    confirm: 'Confirm',
    pay: 'Pay',
    read: 'Read',
    renew: 'Renew',
    sign: 'Sign',
  },
  actionKind: {
    heads_up: 'Heads-up',
    archive: 'Archive',
    cleanup: 'Unsubscribe from all',
    consent: 'Approve',
    commitment: 'Promised',
    follow_up: 'Follow up',
    mark_read: 'Mark read',
    pay: 'Pay',
    read: 'Worth reading',
    reply: 'Reply',
    schedule: 'Schedule',
    security: 'Check it',
    spam: 'Move to spam',
    trash: 'Move to trash',
    unsubscribe: 'Unsubscribe',
  },
  actionStatus: {
    auto_done: 'done by the agent',
    dismissed: 'skipped',
    done: 'done',
    failed: 'failed',
    pending: 'waiting on Home',
  },
  agent: {
    decideOnHome: 'Decide on Home',
    fromAgent: 'The agent asks',
    mcpAsks: (client: string) => `${client} asks through MCP`,
    calendar: (email: string) => `In the calendar of ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      dismiss_action: 'Skip this card?',
      create_event: 'Add this event?',
      delete_event: 'Delete this event?',
      update_event: 'Change this event?',
      approve_action: 'Approve this action?',
      archive_thread: 'Archive this thread?',
      clear_out: 'Clear out these groups of inbox mail?',
      undo_clear_out: 'Bring every cleared email back to the inbox?',
      create_rule: 'Add this rule?',
      reply: 'Send this reply?',
      send_email: 'Send this email?',
      snooze_thread: 'Snooze this thread?',
      unsubscribe: 'Unsubscribe from this sender?',
      tidy_mail: 'Tidy up these quiet emails?',
      trash_thread: 'Move this thread to the trash?',
      report_spam: 'Report this sender as spam?',
      mark_not_spam: 'Move this thread out of spam?',
      move_to_inbox: 'Move this thread back to the inbox?',
    } satisfies Record<ConsentToolName | 'reply', string>,
    retry: 'Try again',
    steps: {
      create_event: 'Adding an event',
      delete_event: 'Deleting the event',
      list_events: 'Checking the calendar',
      update_event: 'Changing the event',
      list_subscriptions: 'Reading mailing lists',
      approve_action: 'Approving',
      archive_thread: 'Archiving',
      get_reading: 'Reading the newsletters',
      get_wrapped: 'Counting your mail',
      clear_out: 'Clearing out the inbox',
      preview_clear_out: 'Reading the whole inbox',
      undo_clear_out: 'Bringing cleared mail back',
      create_rule: 'Adding a rule',
      dismiss_action: 'Skipping',
      draft_reply: 'Drafting a reply',
      create_draft: 'Saving a draft',
      find_people: 'Finding the address',
      get_person: 'Looking up the person',
      get_today: 'Checking today',
      list_handled: 'Checking what was handled',
      list_mail: 'Searching mail',
      list_rules: 'Reading rules',
      read_thread: 'Reading the thread',
      redraft_action: 'Rewriting the draft',
      refresh: 'Checking for new mail',
      send_email: 'Sending',
      snooze_thread: 'Snoozing',
      unsubscribe: 'Unsubscribing',
      tidy_mail: 'Tidying up',
      trash_thread: 'Moving to the trash',
      report_spam: 'Reporting spam',
      mark_not_spam: 'Moving out of spam',
      move_to_inbox: 'Moving to the inbox',
    } satisfies Record<AgentToolName, string>,
    to: (recipients: string) => `To ${recipients}`,
    until: (time: string) => `Until ${time}`,
    yes: {
      dismiss_action: 'Skip',
      create_event: 'Add',
      delete_event: 'Delete',
      update_event: 'Save',
      approve_action: 'Approve',
      archive_thread: 'Archive',
      clear_out: 'Clear out',
      undo_clear_out: 'Bring back',
      create_rule: 'Add rule',
      reply: 'Send',
      send_email: 'Send',
      snooze_thread: 'Snooze',
      unsubscribe: 'Unsubscribe',
      tidy_mail: 'Tidy up',
      trash_thread: 'Move to trash',
      report_spam: 'Report spam',
      mark_not_spam: 'Not spam',
      move_to_inbox: 'Move to inbox',
    } satisfies Record<ConsentToolName | 'reply', string>,
  },
  ask: {
    label: (question: string) => `Ask Fewmail: “${question}”`,
    thinking: 'Looking through your mail…',
  },
  bulk: {
    badge: (n: number) => `Sent to ${n}+ Fewmail users`,
    reason: (n: number) => `Mass email: ${n}+ Fewmail users got the same text`,
  },
  byRule: 'by a rule',
  calendar: {
    noAccess: {
      allow: 'Allow access',
      description:
        'Google was not allowed to share your calendar with Fewmail. Allow it to see and add events here.',
      title: 'Calendar is not connected',
    },
    allDay: 'All day',
    calendar: 'Calendar',
    create: 'Add event',
    delete: 'Delete',
    deleted: 'Event deleted',
    description: 'Description',
    editEvent: 'Edit event',
    endBeforeStart: 'The event ends before it starts',
    ends: 'Ends',
    location: 'Location',
    newEvent: 'New event',
    next: 'Next',
    openInGoogle: 'Open in Google Calendar',
    previous: 'Previous',
    save: 'Save',
    saved: 'Event saved',
    saving: 'Saving the event…',
    scope: {
      this: 'This event',
      following: 'This and following events',
      all: 'All events',
    },
    starts: 'Starts',
    title: 'Calendar',
    titlePlaceholder: 'Add a title',
    today: 'Today',
    tomorrow: 'Tomorrow',
    untitled: '(No title)',
    views: {
      day: 'Day',
      week: 'Week',
      month: 'Month',
      year: 'Year',
    },
  },
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
    attach: 'Attach files',
    attachmentsTooLarge: (limit: string) =>
      `Attachments can add up to ${limit}.`,
    dropFiles: 'Drop files to attach',
    removeAttachment: 'Remove',
    discarded: 'Draft discarded',
    backInQueue: 'Canceled. The draft is back on Home.',
    canceled: 'Canceled. Your email is back in the editor.',
    cc: 'Cc',
    discard: 'Discard',
    draftSaved: 'Draft saved',
    forward: 'Forward',
    forwardedMessage: 'Forwarded message',
    from: 'From',
    invalidRecipients: 'Add at least one valid email address.',
    later: {
      inHour: 'In an hour',
      monday: 'Monday morning',
      pick: 'Pick date & time',
      schedule: 'Schedule',
      time: 'Time',
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
    undoing: 'Undoing…',
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
  clearOut: {
    partial:
      'Gmail stopped part of the clear-out. What was already moved can come back.',
    groups: {
      lists: 'Mailing lists you never open',
      notifications: 'Read notifications, older than a month',
      old: 'Everything older than a year',
      promotions: 'Ads and social, older than 3 days',
    },
    done: (emails: string) => `${emails} cleared out`,
    empty: 'Nothing to clear: the inbox is already in order.',
    lead: (emails: string) => `${emails} in the inbox. This is what can go.`,
    leadCapped: (emails: string) =>
      `More than ${emails} in the inbox. This is what can go.`,
    left: (emails: string) => `${emails} stay in the inbox`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} and ${more} more` : names,
    run: (emails: string) => `Clear out ${emails}`,
    safe: 'Nothing is deleted. Cleared mail is archived under the Fewmail/Cleared label and comes back in one click; lists are also unsubscribed.',
    scanning: 'Reading the whole inbox, headers only. Up to a minute.',
    title: 'Clear out the inbox',
    undo: 'Bring it all back',
    undone: (emails: string) => `${emails} back in the inbox`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `Busiest day: ${day} · busiest hour: ${hours}`,
    copied: 'Link copied',
    copyLink: 'Copy link',
    cta: 'Get yours with Fewmail',
    emails: 'emails came in',
    empty: 'Not enough mail yet to tell the story. Come back in a few days.',
    handled: 'handled by Fewmail on its own',
    people: 'Who wrote most',
    period: { month: 'This month', year: 'This year' },
    replies: 'replies drafted by Fewmail and sent',
    saveImage: 'Save image',
    saved: 'saved by Fewmail',
    shareNote:
      'The link and the image show only these numbers, never names or emails.',
    shared: { month: 'A month in email', year: 'A year in email' },
    spam: 'spam emails stopped',
    split: (people: string, lists: string, other: string) =>
      `${people} from people · ${lists} from mailing lists · ${other} other`,
    title: { month: 'Your month in email', year: 'Your year in email' },
    unsubscribed: 'mailing lists left',
  },
  reading: {
    markAllRead: 'Mark all read',
    summary: 'What your newsletters said',
    worth: 'Worth reading in full',
    leftOut: (n: number) => `${n} left out: nothing new in them.`,
    note: {
      inSummary: 'In the summary',
      leftOut: 'Left out',
    },
    digest: (n: number) => `${n} newsletters`,
    lead: 'A day of newsletters in one place, so they never crowd the inbox.',
    issues: 'Every issue',
    title: 'Reading',
  },
  command: {
    agent: 'Agent',
    appearance: 'Appearance',
    compose: 'New email',
    goTo: 'Go to',
    mail: 'Mail',
    nothingMatches: 'Nothing matches.',
    placeholder: 'Ask about your mail or run a command…',
    teachRule: 'Teach a new rule',
    upgrade: 'Upgrade to Pro',
    theme: {
      dark: 'Dark',
      light: 'Light',
      system: 'System',
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
  justNow: 'just now',
  errors: {
    calendarAccess:
      'Fewmail has no access to this calendar. Allow it on the Calendar page.',
    failed: 'Something went wrong. Try again.',
    needsPro: 'This needs Fewmail Pro.',
    alreadySent: "Already sent, it's too late to undo.",
    notFound: 'This is no longer here. It may have been deleted.',
    offline: "Can't reach Fewmail. Check your connection.",
  },
  update: {
    available: 'A new version of Fewmail is out.',
    reload: 'Reload',
  },
  keys: {
    attach: 'attach',
    done: 'done',
    openLink: 'open link',
    writeReminder: 'write a reminder',
    summary: 'summary',
    fromSender: 'more from sender',
    pin: 'pin',
    unpin: 'unpin',
    copyCode: 'copy code',
    restore: 'back to inbox',
    calendarToday: 'today',
    newEvent: 'new event',
    period: 'previous / next',
    view: 'view',
    skills: 'skills',
    unsubscribe: 'unsubscribe',
    filter: 'filter',
    ask: 'ask about it',
    approve: 'approve',
    approveAll: (n: number) => `approve all ${n} like this`,
    approvePicked: (n: number) => `approve ${n} picked`,
    archive: 'archive',
    reply: 'reply',
    snooze: 'snooze',
    trash: 'trash',
    close: 'close',
    draftReply: 'draft reply',
    edit: 'edit',
    expand: 'expand / collapse',
    move: 'move',
    stackEmail: 'next / previous email',
    open: 'open',
    pick: 'pick',
    pickAll: 'pick all',
    markRead: 'mark read',
    markUnread: 'mark unread',
    unpick: 'clear picks',
    rename: 'rename',
    clearFilter: 'clear filter',
    search: 'search',
    send: 'send',
    skip: 'skip',
    keep: 'keep',
    stopEditing: 'stop editing',
    rewrite: 'rewrite',
    save: 'save',
    deleteEvent: 'delete',
  },
  legal: {
    privacy: 'Privacy Policy',
    englishOnly:
      'This document is provided in English, which is the binding version.',
    terms: 'Terms of Service',
    updated: (date: string) => `Last updated ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `This month’s agent allowance is spent. It comes back on ${date}.`,
  },
  notices: {
    freeUpSpace: 'Free up space',
    mailLost: 'Fewmail lost access to your Gmail and is not reading new mail.',
    mailboxLost: (email: string) => `Fewmail lost access to ${email}.`,
    reconnect: 'Reconnect',
    sendLimit: (email: string, when: string) =>
      `${email} hit Gmail’s daily sending limit. Sending works again ${when}.`,
    signInAgain: 'Sign in again',
    storageFull: (email: string) =>
      `${email} is out of Google storage, so Gmail is bouncing new mail.`,
    storageFullHint: 'Free up space or get more storage to receive mail again.',
    photos: {
      allow: 'Allow access',
      description:
        'Fewmail shows them from your Google contacts and uses those only for that.',
      title: 'See the photos of people who write to you',
    },
  },
  login: {
    needsGmail:
      "Fewmail needs your Gmail to work. Sign in again and keep the Gmail box ticked on Google's screen.",
    agree: ((slots) => [
      'By continuing you agree to the ',
      slots.terms,
      ' and the ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail asks to read, organize and send Gmail for you. Nothing is sent and nothing is archived without your say, unless you write a rule that allows it. It also asks for your Google Calendar, and for your contacts to show people’s photos; you can untick both.',
    continue: 'Continue with Google',
    lead: 'Fewmail reads your inbox for you, answers in your voice and only shows you what actually needs you.',
    messengers:
      'Works in messengers too, starting with Telegram: get urgent mail, approve replies or just send a voice message.',
    title: 'Only what matters.',
  },
  mail: {
    inThread: (emails: string) => `${emails} in this conversation`,
    moreFrom: (name: string) => `More from ${name}`,
    draftDeleted: 'Draft deleted',
    unsubscribeConfirm: (name: string) => `Unsubscribe from ${name}?`,
    unsubscribeHint:
      'Fewmail leaves the list and archives this thread. Leaving a list cannot be undone.',
    unsubscribing: 'Unsubscribing…',
    pin: 'Pin',
    unpin: 'Unpin',
    pinned: 'Pinned',
    showAll: (n: number) => `Show all ${n}`,
    showFewer: 'Show fewer',
    inGmail: (count: string) => `${count} in Gmail`,
    markShownRead: (n: number) => `Mark ${n} read`,
    oneTimeCode: {
      archive: 'Copy and archive',
      copied: 'Code copied',
      copy: 'Copy code',
      trash: 'Copy and delete',
    },
    openUnsubscribePage: 'Open page',
    unsubscribeYourself:
      'This list needs you to finish leaving on its own page. Its mail is archived meanwhile.',
    allMailboxes: 'All mailboxes',
    filterAbout: {
      focused: 'Important mail and people first, notifications folded away',
      unread: 'What you have not read yet, sorted by kind',
      categories: 'The whole inbox by kind, mail that needs you first',
      inbox: 'Everything, newest first',
    },
    find: {
      recent: 'Recent searches',
      tips: 'Tips',
      clearRecent: 'Clear',
      describeExample: 'invoices from Anna last month',
      searching: 'Searching your mail…',
      tip: {
        from: 'Mail from Anna',
        subject: 'Subject mentions “invoice”',
        attachment: 'With attachments',
        pdf: 'With a PDF attached',
        unread: 'Unread conversations',
        week: 'From the last 7 days',
        describe: 'Or describe it in your own words',
      },
    },
    group: {
      read: 'Read',
      earlier: 'Earlier',
      important: 'Important',
      people: 'People',
      plans: 'Calendar and travel',
      money: 'Money',
      updates: 'Notifications',
      newsletters: 'Newsletters',
      promotions: 'Promotions',
    },
    unread: 'Unread',
    archive: 'Archive',
    archived: 'Archived',
    markedRead: 'Marked read',
    markUnread: 'Mark as unread',
    markedUnread: 'Marked unread',
    block: 'Block sender',
    ignoresUnsubscribe: (name: string) => `${name} ignores unsubscribes`,
    ignoresUnsubscribeHint:
      'Fewmail asked to leave, but this sender is known to keep writing anyway. Send their mail to the trash from now on? You can undo it in Rules.',
    blocked: 'Blocked. Their mail now goes to the trash.',
    forward: 'Forward',
    more: 'More',
    close: 'Close',
    movedToInbox: 'Moved back to the inbox. Thanks for telling us.',
    moveToInbox: 'Move to inbox',
    backInInbox: 'Moved to the inbox',
    deleteDraft: 'Delete draft',
    notSent: 'Not sent. Open to retry',
    noRecipients: 'No recipients',
    notSpam: 'Not spam',
    reply: 'Reply',
    reportSpam: 'Report spam',
    reportedSpam: 'Reported. Their mail now goes to spam.',
    trash: 'Move to trash',
    trashed: 'Moved to trash',
    attachment: 'attachment',
    draftReply: 'Draft reply',
    due: (date: string) => `due ${date}`,
    dueHint: 'Deadline the agent found in this email',
    empty: 'No emails here',
    emptyHint: 'New mail shows up here as it arrives.',
    noResults: 'Nothing found',
    noResultsHint: 'Try other words, or look in another folder.',
    expectsReply: 'Expects a reply',
    filter: {
      categories: 'Categories',
      archive: 'Archive',
      trash: 'Trash',
      drafts: 'Drafts',
      inbox: 'Inbox',
      snoozed: 'Snoozed',
      sent: 'Sent',
      spam: 'Spam',
      focused: 'Focused',
      unread: 'Unread',
    },
    instruction: 'Tell the agent how to reply, or just press Enter',
    open: 'Open',
    openInGmail: 'Open in Gmail',
    collapseFullPage: 'Back to the list',
    search: 'Search or describe: invoices from Anna last month',
    unsubscribe: 'Unsubscribe',
    unsubscribed: 'Unsubscribed',
    unsubscribeFailed:
      'This sender has no one-click unsubscribe, so the email was archived.',
    you: 'You',
    sent: 'Sent',
    writeReply: 'Write a reply…',
    replyTo: 'Reply to',
    date: 'Date',
    authentication: 'Authentication',
    toLine: (recipients: string) => `to ${recipients}`,
  },
  subscriptions: {
    leftBy: (percent: number) =>
      `${percent}% of its readers on Fewmail left it`,
    unsubscribeHint: (emails: string) =>
      `Fewmail leaves the list and archives everything it sent (${emails} this month). Leaving a list cannot be undone.`,
    archivedOnly:
      'This sender has no unsubscribe Fewmail can use, so its mail was archived, but you are still on the list and new mail will keep arriving.',
    count: (total: number) =>
      plural('en', total, {
        one: () => '1 mailing list',
        other: (n) => `${n} mailing lists`,
      }),
    empty: 'No mailing lists wrote to you this month.',
    lead: 'Newsletters, promotions and other mailing lists that wrote to you this month, busiest first. Unsubscribe from what you never read: Fewmail leaves the list and archives everything it sent.',
    opened: (total: number) =>
      total === 0 ? 'none opened' : `${total} opened`,
    title: 'Mailing lists',
    unsubscribe: 'Unsubscribe',
    unsubscribed: 'Unsubscribed',
  },
  nav: {
    menu: 'Menu',
    labels: 'Labels',
    folders: 'Folders',
    calendar: 'Calendar',
    subscriptions: 'Mailing lists',
    people: 'People',
    findPerson: 'Find a person',
    mail: 'Mail',
    reading: 'Reading',
    rules: 'Rules',
    search: 'Search or ask…',
    settings: 'Settings',
    syncFailed: 'Gmail sync failed, retrying',
    syncing: 'Reading your inbox…',
    loading: 'Loading',
    syncFailedIn: (email: string) => `Couldn’t sync ${email}, retrying`,
    syncingIn: (email: string) => `Reading ${email}…`,
    home: 'Home',
    trialLeft: (total: number) =>
      plural('en', total, {
        one: () => 'Pro trial · 1 day left',
        other: (n) => `Pro trial · ${n} days left`,
      }),
    usage: (percent: number) => `Agent · ${percent}% of this month used`,
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
      'The app, summaries and explanations use this language. Replies always match the language of the email you answer.',
    languageTitle: 'Which language should Fewmail speak?',
    lead: 'Two quick answers. You can change all of them later in Settings.',
    reading: 'Reading your inbox…',
    start: 'Start',
    title: 'Let’s set up your agent.',
  },
  plan: {
    used: (percent: number) => `${percent}% used`,
    about: (emails: string, messages: string) =>
      `About ${emails} emails read or ${messages} messages to the agent a month, in any mix.`,
    free: 'Free',
    freeDescription:
      'Fast, calm mail with simple rules. Free for as long as you like.',
    includes:
      'Every paid plan adds the agent: every email read and summarized, replies drafted in your voice, rules in plain words, Telegram and MCP.',
    manage: 'Manage billing',
    price: (usd: number) => `$${usd} / month`,
    priceYearly: (usd: number) => `$${usd} / year`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
    cancels: (plan: string, date: string) =>
      `${plan} until ${date}, then Free.`,
    choose: (plan: string) => `Choose ${plan}`,
    proRenews: (date: string) => `Renews on ${date}.`,
    resets: (date: string) => `Resets on ${date}.`,
    title: 'Plan',
    trial: 'Pro trial',
    welcome: (plan: string) => `Welcome to ${plan}. The agent is back on duty.`,
    yearly: 'Pay yearly',
    yearlyHint: 'Two months free.',
    trialDescription: (date: string) =>
      `Everything in Pro until ${date}, then Free. No card needed.`,
    upgrade: 'Other plans',
    usage: 'This month',
  },
  headsUp: {
    deadline: 'Coming up',
    notYet: 'Nothing has come since',
    price: 'Price went up',
    priceUp: (what: string, from: string, to: string) =>
      `${what}: ${to} instead of ${from}`,
    promised: 'Promised to you',
  },
  queue: {
    addToCalendar: 'Add to calendar',
    writeReminder: 'Write a reminder',
    askedByYou: 'Asked by you',
    approve: 'Approve',
    delete: 'Delete',
    draftedInVoice: 'Drafted in your voice',
    readEmail: 'Read email',
    pick: 'Pick',
    picked: (n: number) => `${n} picked`,
    send: 'Send',
    rewrite: 'Rewrite',
    shorterInstruction: 'Make it shorter.',
    new: 'New',
    skipStale: 'Skip them',
    skipped: (n: number) => `Skipped: ${n}`,
    stale: (n: number) => `Older than a week: ${n}`,
    skip: 'Skip',
    unpick: 'Unpick',
  },
  reminders: {
    followUp: 'Follow up',
    noReply: 'No reply yet',
  },
  risk: {
    prompt_injection: (domain: string) =>
      `${domain} hid instructions in this email for assistants that read mail. The agent ignores them; do not forward it or do what it asks.`,
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
    deleted: 'Rule deleted',
    add: 'Add rule',
    count: (total: number) =>
      plural('en', total, { one: () => '1 rule', other: (n) => `${n} rules` }),
    delete: 'Delete',
    describe: {
      alwaysShow: 'Always lands on Home',
      autonomous: 'Done on its own, listed under handled',
      draft: 'A draft waits for you on Home',
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
    lead: 'Tell the agent in plain words what to do with certain mail. It reads every email against these.',
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
  },
  settings: {
    disconnectConfirm: (name: string) => `Disconnect ${name}?`,
    messengerDisconnectHint:
      'The bot stops writing to you. Connecting again takes a new link from this page.',
    readingDigest: {
      description:
        'Each morning, yesterday’s newsletters arrive as one message in Telegram and WhatsApp, or as a notification when neither is connected.',
      title: 'Newsletter digest',
    },
    account: 'Account',
    agent: 'Agent',
    deleteAccount: 'Delete account',
    deleteConfirm: 'Delete everything',
    deleteDescription:
      'Deletes your account, synced mail, drafts and rules from Fewmail right away. Your Gmail itself is not touched. A paid plan is canceled at once.',
    deleteFailed: 'The account was not deleted. Try again in a minute.',
    deleteSignIn:
      'To confirm it is you, sign in with Google again, then delete the account.',
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
    languageDescription: 'App, bot and summaries. Replies follow the email.',
    legal: 'Legal',
    mailboxes: {
      removeConfirm: (email: string) => `Remove ${email}?`,
      removeHint:
        'Fewmail stops reading it and forgets what it read there. Nothing changes in Gmail.',
      add: 'Add Gmail',
      addDescription:
        'Another Gmail account’s mail joins the same Home and inbox. It never signs anyone in here: signing in with it opens a separate Fewmail.',
      added: 'Mailbox added. Its mail shows up in a minute.',
      failed: 'Could not add the mailbox. Allow Gmail access and try again.',
      lost: 'Gmail access was lost. Add it again to reconnect.',
      reading: 'Reading mail…',
      remove: 'Remove',
      retrying:
        'Gmail is not answering right now. Fewmail tries again on its own.',
      signIn: 'You sign in with this one',
      signInChosen: 'That is the account you sign in with. Choose another one.',
      signInLost: 'Gmail access was lost. Sign in again to reconnect.',
      synced: (ago: string) => `Synced ${ago}`,
      title: 'Mailboxes',
    },
    mcp: {
      disconnectHint:
        'It can no longer read your mail until you connect it again.',
      allow: 'Allow',
      connected: (ago: string) => `Connected ${ago}`,
      copy: 'Copy URL',
      defaultName: 'MCP client',
      deny: 'Deny',
      description:
        'They can read your mail, draft replies and send them after you confirm.',
      disconnect: 'Disconnect',
      paste:
        'Add this URL as a connector in your app, then sign in to Fewmail.',
      request: (app: string) => `${app} wants to use your Fewmail`,
      title: 'Connect Claude, Cursor or any MCP client',
    },
    morningDescription: (timezone: string) =>
      `Newsletter digest and Monday’s weekly report, in your time zone, ${timezone}`,
    morningTitle: 'Morning messages',
    signedInWithGoogle: 'Signed in with Google',
    signOut: 'Sign out',
    snippets: {
      deleted: 'Snippet deleted',
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
      messengerOff: 'Urgent mail stays in Fewmail.',
      messengerOn: 'Urgent mail arrives in the chat right away.',
      notConfigured: 'Browser notifications are not configured on this server.',
      off: 'Get urgent mail here, even with Fewmail closed.',
      on: 'Urgent mail shows up here. Several at once arrive as one.',
      title: 'Notifications',
      unsupported: 'This browser cannot show notifications.',
    },
    telegram: {
      connect: 'Connect Telegram',
      disconnect: 'Disconnect',
      linked:
        'Urgent mail arrives right away. Approve and edit drafts from the chat.',
      linkedQuiet: 'Approve and edit drafts from the chat.',
      notConfigured: 'The Telegram bot is not configured on this server.',
      unlinked: 'Get urgent mail and approve drafts from Telegram.',
    },
    whatsapp: {
      connect: 'Connect WhatsApp',
      disconnect: 'Disconnect',
      linked:
        'Urgent mail arrives right away. Approve and edit drafts from the chat.',
      linkedQuiet: 'Approve and edit drafts from the chat.',
      notConfigured: 'The WhatsApp bot is not configured on this server.',
      unlinked: 'Get urgent mail and approve drafts from WhatsApp.',
    },
    title: 'Settings',
  },
  site: {
    meta: {
      assistant:
        'Fewmail is an AI email assistant for Gmail that reads every email first, drafts replies in your voice and shows you only what needs you. Free to start.',
      assistantTitle: 'AI email assistant for Gmail',
      compare:
        'How Fewmail compares to Superhuman, Shortwave and SaneBox: an AI agent that reads your mail instead of a faster way to read it yourself.',
      compareTitle: 'AI email assistants compared',
      home: 'Fewmail is an AI email assistant for Gmail: it reads every email, drafts replies in your voice and shows you only what needs you.',
      login:
        'Fewmail reads your Gmail for you, answers in your voice and only shows you what actually needs you.',
      mcp: 'Connect Fewmail to Claude, ChatGPT, Claude Code or Cursor as an MCP server: read and triage your Gmail from the AI you already use.',
      motto: 'only what matters in your inbox',
      pricing: (trialDays: number) =>
        `Fewmail is free forever for Home, sorting, rules and spam protection. Pro, the whole agent, starts with ${trialDays} free days and no card.`,
      tagline: 'the AI email agent for Gmail',
    },
    chapters: {
      pricing: {
        description:
          'Home, the sorting, rules and protection are free forever. Lite, Pro and Max add everything that reads and writes for you; the bigger plans simply do more of it.',
        label: 'Pricing',
        title: (usd: number) =>
          `Free for the sorting. From $${usd} for the agent.`,
      },
      questions: {
        description:
          'The short answers. The long ones are in the privacy policy.',
        label: 'Questions',
        title: 'Before you connect Gmail.',
      },
    },
    closing: {
      lead: 'Connect Gmail in a minute. Fewmail starts with the last three days of mail, so the first decisions are waiting for you right away.',
      title: 'Get your mornings back.',
    },
    mcp: {
      answer:
        'The signed contract, before Friday’s kickoff. A reply is already drafted and waiting in your Fewmail queue.',
      clients: 'Works with',
      emphasis: 'Claude and ChatGPT.',
      free: 'Reading your mail and the agent’s sorting is free.',
      label: 'MCP',
      lead: 'Connect Fewmail as an MCP server and ask about your mail from the assistant you already use. Anything that sends or changes Gmail still asks for your yes.',
      question: 'What does Anna need from me this week?',
      setup: 'Connect in a minute',
      title: 'Your mail, inside Claude and ChatGPT.',
    },
    mcpPage: {
      copy: 'Copy URL',
      lead: 'Connect Fewmail as an MCP server and ask about your mail from the AI you already use. Reading your mail and the agent’s sorting is free; drafting, sending and rules come with Pro.',
      safety:
        'Anything that sends an email or changes Gmail asks for your yes first. An email that tries to give the assistant orders is flagged before the assistant reads it. Your mail is never used to train models, and you can disconnect any app in Settings.',
      steps: {
        chatgpt:
          'In Settings, add a connector (app) with this URL, then sign in to Fewmail.',
        claude:
          'In Settings → Connectors, add a custom connector with this URL, then sign in to Fewmail.',
        code: 'Run this once in a terminal, then sign in to Fewmail when Claude Code asks.',
        cursor:
          'Add this to your mcp.json, then sign in to Fewmail when Cursor asks.',
      },
      title: 'Fewmail inside Claude, ChatGPT and your tools.',
    },
    assistantPage: {
      abilities: {
        ask: {
          description:
            'Ask “when does my flight leave?” and get the answer with the emails it came from, in Fewmail, Telegram or WhatsApp, or from Claude and ChatGPT.',
          title: 'Answers from your mail',
        },
        drafts: {
          description:
            'Replies are written ahead of time, in your tone and in the sender’s language, and wait in your queue until you approve them.',
          title: 'Drafts replies in your voice',
        },
        protection: {
          description:
            'Changed bank details, lookalike domains and known scams raise a warning before you act.',
          title: 'Warns about phishing',
        },
        reading: {
          description:
            'The day’s newsletters become one summary by topic, each sentence linked to the email it came from.',
          title: 'Newsletters in one summary',
        },
        rules: {
          description:
            'Describe in one sentence what should happen to some mail and it becomes a rule. Only the rules you turn on act on their own.',
          title: 'Rules in plain words',
        },
        sorting: {
          description:
            'Every email gets a summary and an importance score, so what is urgent rises and receipts, notifications and promotions stay out of your way.',
          title: 'Reads and sorts every email',
        },
      },
      abilitiesDescription:
        'Everything happens in the Gmail you already use, and each thing the agent does is written down with its reason.',
      abilitiesLabel: 'What it does',
      abilitiesTitle: 'An assistant, not another inbox.',
      compareTitle: 'How it compares to other AI email tools.',
      faq: (trialDays: number) => [
        {
          answer:
            'Software that uses AI to read, sort and answer email for you. Most add summaries and writing help to an inbox you still read yourself. Fewmail goes further: it reads everything first, so you only see what needs you.',
          question: 'What is an AI email assistant?',
        },
        {
          answer:
            'Fewmail encrypts subjects, bodies, summaries and drafts in its database, never uses your mail to train models and never sends or changes anything in Gmail without your yes. You can disconnect it and delete everything at any time.',
          question: 'Is it safe to let AI read my email?',
        },
        {
          answer:
            'It drafts them for you, but never sends one on its own. Each draft waits in your queue for your approval, and similar ones can be approved together.',
          question: 'Can it answer emails automatically?',
        },
        {
          answer: `Yes. The Free plan sorts every email, keeps what needs you on one page, runs your rules and protects you from spam and phishing, forever. Drafts, summaries and the rest of the agent come with the paid plans, and every account starts with ${trialDays} days of Pro, no card.`,
          question: 'Is there a free AI email assistant for Gmail?',
        },
      ],
      faqTitle: 'About AI email assistants.',
      lead: 'Fewmail reads every email in your Gmail as it arrives, clears the noise, drafts replies in your voice and brings you only the few things that need your decision. Nothing is sent or changed without your yes.',
      title: 'The AI email assistant that reads your Gmail first.',
    },
    comparePage: {
      lead: 'Email clients make you faster at reading every email. Filters move mail into folders. Fewmail is an agent: it reads the mail, decides what can wait and asks you only about the rest.',
      title: 'Fewmail compared.',
    },
    comparison: {
      custom: 'Custom',
      features: 'Feature by feature',
      groups: {
        agent: 'Reading and replying',
        day: 'Your day',
        reach: 'Where it works',
        safety: 'Protection',
      },
      labels: {
        ask: 'Ask your mail anything',
        home: 'What needs you, on one page',
        calendar: 'Calendar',
        drafts: 'Replies drafted for you',
        followUps: 'Follow-up reminders',
        gmail: 'Gmail and Google Workspace',
        handOver: 'Hand a thread over',
        importance: 'Sorted by importance',
        keepApp: 'Keep your mail app',
        mcp: 'MCP for your own tools',
        memory: 'Remembers promises and people',
        otherProviders: 'iCloud, Yahoo and other IMAP mail',
        outlook: 'Outlook and Microsoft 365',
        phishing: 'Phishing and payment-change warnings',
        phone: 'On your phone',
        rules: 'Rules in plain words',
        snooze: 'Snooze',
        spamShield: 'Community spam shield',
        summaries: 'Email summaries',
        teams: 'Team inbox',
        unsubscribe: 'One-click unsubscribe',
      },
      more: 'More comparisons',
      no: 'No',
      noFreePlan: 'No free plan',
      ours: {
        ask: 'On Pro',
        home: 'Live, approved in batches, free',
        drafts: 'In your voice, sent only when you approve, on Pro',
        followUps: 'Automatic, on mail that expects a reply',
        handOver: 'The agent works it to its goal, on Pro',
        importance: 'Every email scored, free',
        keepApp: 'Everything shows up in Gmail',
        mcp: 'On Pro',
        memory: 'On Pro',
        phone: 'Telegram and WhatsApp, with voice, on Pro',
        rules: 'Archive, mark read or unsubscribe, free',
        summaries: 'On Pro',
        unsubscribe: 'Senders who ignore it go to spam',
      },
      plans: 'Plans and prices',
      read: 'Read the comparison',
      source: (name: string, date: string) =>
        `${name} details come from its public website, checked in ${date}. Prices and features change; check their site for the current offer.`,
      title: (name: string) => `Fewmail vs ${name}`,
      tryFree: 'Try Fewmail free',
      which: 'Which one is for you?',
      yes: 'Yes',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 mailboxes and every feature, AI Bundle included',
          lunch: '2 mailboxes, snooze and reminders',
          snack: '1 mailbox and basic filtering',
        },
        summary:
          'SaneBox sorts mail into folders, and on its top plan drafts and summarises too. Fewmail reads everything first and keeps the few decisions only you can make on one page.',
        them: {
          home: 'A daily digest of filtered mail',
          drafts: 'SaneDrafts, on Dinner',
          followUps: 'SaneNoReplies',
          importance: 'Unimportant mail moved to SaneLater',
          keepApp: 'Works through folders',
          otherProviders: 'Any IMAP or Exchange server',
          phone: 'Through your mail app',
          rules: 'Trained by moving mail between folders',
          snooze: 'From Lunch',
          summaries: 'SaneSummary, on Dinner',
          unsubscribe: 'SaneBlackHole folder',
        },
        verdict:
          'Pick SaneBox if your mail lives outside Gmail and folders are enough. Pick Fewmail if you use Gmail and want the important mail read, summarised and answered.',
      },
      shortwave: {
        plans: {
          business: 'Per seat',
          free: 'Most features and the assistant',
          max: 'Per seat, the strongest models',
          premier: 'Per seat, stronger models',
          pro: 'Full history, AI search and writing',
        },
        summary:
          'Shortwave is an email client with an AI assistant you talk to. Fewmail is an agent that does the reading first and asks you only what it cannot decide.',
        them: {
          ask: 'AI assistant and search',
          drafts: 'When you ask',
          importance: 'Splits and bundles',
          keepApp: 'Replaces your mail app',
          memory: 'AI memory',
          otherProviders: 'Forwarded into Gmail',
          outlook: 'Microsoft 365 not supported',
          phone: 'iOS and Android apps',
          rules: 'AI filters, 3 to 50 by plan',
          summaries: 'On top of every email',
          teams: 'Shared threads and comments',
          unsubscribe: 'With one-click block',
        },
        verdict:
          'Pick Shortwave if you want a new inbox with a chat assistant. Pick Fewmail if you want fewer emails to look at, in the Gmail you already use.',
      },
      superhuman: {
        plans: {
          business:
            'Per member, $33 billed yearly. Adds Auto Drafts and Ask AI',
          enterprise: 'SSO and admin controls',
          starter: 'Per member, $25 billed yearly',
        },
        summary:
          'Superhuman makes you faster at going through every email. Fewmail goes through them for you and shows only what needs you.',
        them: {
          ask: 'Ask AI, on Business',
          drafts: 'Auto Drafts, on Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox and Auto Labels',
          keepApp: 'Replaces your mail app',
          mcp: 'On Business',
          phone: 'iOS and Android apps',
          rules: 'Custom Auto Labels, on Business',
          spamShield: "Your provider's filter",
          summaries: 'Auto Summarize',
          teams: 'Shared drafts and comments',
        },
        verdict:
          'Pick Superhuman if you want to touch every email yourself, faster. Pick Fewmail if you would rather not see most of them at all.',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'Many AI email tools are a new inbox with a chat box: you still read every email, now with a summary on top. Fewmail is an AI agent on top of the Gmail you already use. It reads every email first, drafts replies in your voice and brings you only the few decisions that need you.',
        question: 'How is Fewmail different from other AI email assistants?',
      },
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
        answer: `Every new account gets ${trialDays} days of Pro, no card. When it ends you simply stay on Free; nothing is deleted and nothing is charged.`,
        question: 'What happens after the trial?',
      },
      {
        answer:
          'Drafts are written in the language of the email you are answering. The app, the summaries and the Telegram bot speak one language you choose, from fifteen.',
        question: 'Which languages does it speak?',
      },
      {
        answer:
          'Gmail and Google Workspace accounts today. Add several mailboxes to one Fewmail and their mail joins the same Home and inbox.',
        question: 'Which email accounts work?',
      },
    ],
    features: {
      description:
        'The parts of email that used to take an afternoon, done in the background and listed where you can check them.',
      items: {
        codes: {
          description:
            'A fresh code waits at the top of Home and beside its email, ready to copy without opening anything. Free.',
          title: 'Sign-in codes',
        },
        subscriptions: {
          description:
            'Every mailing list that wrote this month, with how many of its emails you actually opened. Leave any of them with one key. Free.',
          title: 'Mailing lists',
        },
        ask: {
          description:
            'Ask anything in plain words and get the answer from your own mail, with the emails it came from.',
          title: 'Ask your mail',
        },
        calendar: {
          description:
            'The calendar of every mailbox in one view. A meeting proposed in an email becomes an event once you say yes.',
          title: 'Calendar',
        },
        clearOut: {
          description:
            'The whole backlog out in one go, up to 50,000 emails per mailbox, all under one label so Undo brings every one back. Free.',
          title: 'Clear-out',
        },
        reading: {
          description:
            'One summary of the day’s newsletters: the news by topic, each sentence linked to where it came from, and the ones worth reading in full.',
          title: 'Reading',
        },
        voice: {
          description:
            'Have your newsletters’ summary read out to you. Send a voice message in Telegram or WhatsApp and the agent answers out loud.',
          title: 'Listen instead of reading',
        },
        wrapped: {
          description:
            'Your month or year in mail: what came in, what was handled, how much time you got back. Shareable, never with a name.',
          title: 'Wrapped',
        },
      },
      label: 'And the rest',
      title: 'Everything else an assistant would do.',
    },
    footer: {
      legal: 'Legal',
      product: 'Product',
      tagline:
        'The AI email agent that reads your Gmail and only shows you what needs you.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'stop having.',
      label: 'What goes away',
      rows: [
        {
          fix: 'Clear-out moves the whole backlog out in one go: old ads, read notifications, lists you never open. One Undo brings every email back.',
          problem: 'Thousands of emails nobody will ever read.',
        },
        {
          fix: 'Replies are drafted ahead of time, in your voice and in their language. Similar ones are approved together with ⇧⏎, each still yours to check.',
          problem: 'Answering email at midnight.',
        },
        {
          fix: 'One key unsubscribes the way a person would: one click, the unsubscribe page or an email. Senders who keep writing are caught and offered for spam.',
          problem: 'Newsletters you never signed up for.',
        },
        {
          fix: 'The day’s newsletters become one summary by topic, with the ones worth reading in full pointed out.',
          problem: 'Newsletters you meant to read.',
        },
        {
          fix: 'Changed payment details, lookalike domains and known phishing raise a warning before you act.',
          problem: 'An invoice with new bank details.',
        },
        {
          fix: 'Promises you make in sent mail come back when they are due, and threads nobody answered get a follow-up.',
          problem: 'The thing you promised and forgot.',
        },
        {
          fix: 'Only urgent mail reaches you in Telegram or WhatsApp. The rest waits on Home, already sorted, for whenever you look.',
          problem: 'Checking mail at dinner, just in case.',
        },
      ],
      title: 'Email problems you stop having.',
    },
    hero: {
      needs: {
        emphasis: 'need you.',
        lead: (handled: string) =>
          `Anna is waiting on the contract, Northwind’s invoice is due next week and Marco wants Thursday. ${handled} newsletters and notifications were handled, and Home keeps up as new mail arrives.`,
        tag: 'Home · Thursday, 08:12',
        title: 'Three things need you.',
      },
      fates: {
        archived: 'Archived',
        markedRead: 'Marked read',
        spam: 'Spam',
        summarised: 'Summarised',
        unsubscribed: 'Unsubscribed',
      },
      handled: ((slots) => [
        slots.count,
        ' handled, each with a reason',
      ]) as Rich<'count'>,
      inbox: 'Inbox',
      lead: 'Newsletters, receipts, pings, a phishing link and, somewhere in there, the three emails that actually matter. Fewmail is the AI agent that reads all of it for you.',
      needYou: ((slots) => [slots.count, ' need you']) as Rich<'count'>,
      queue: [
        {
          reason: 'Contract due tomorrow',
          summary: 'Needs the signed contract back before Friday’s kickoff.',
        },
        {
          reason: 'Invoice · $1,240 due Nov 20',
          summary:
            'October invoice for the website redesign. Same bank details as last time.',
        },
        {
          reason: 'Meeting proposed',
          summary:
            'Suggests Thursday at 15:00. You are free from 16:00, so the draft asks for four.',
        },
      ],
      reading: {
        emphasis: 'every one.',
        lead: 'It archives the noise, unsubscribes you from what you never open and stops the scam at the door. Each thing it does is written down with the reason, so you can check it.',
        title: 'Fewmail reads every one.',
      },
      remind: 'Remind me Nov 19',
      remindPlan: 'Adds it to your bills and reminds you on Nov 19.',
      start: 'Start free with Google',
      title: 'Email is not your job.',
      home: 'Home',
      tryQueue: 'Try the queue',
      unread: ((slots) => [slots.count, ' unread']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' unread in your inbox',
      ]) as Rich<'count'>,
      willDo: 'Fewmail will',
    },
    nav: {
      assistant: 'AI email assistant',
      compare: 'Compare',
      features: 'Features',
      mcp: 'MCP server',
      pricing: 'Pricing',
      signIn: 'Sign in',
    },
    play: {
      again: 'Clear it again',
      doneLead: (handled: string) =>
        `You made three decisions. Fewmail took care of the other ${handled} and wrote down why.`,
      doneTitle: 'That’s it for today.',
      emphasis: 'in two minutes.',
      handled: [
        'Lumen Weekly: you opened none of the last 30 issues',
        'paypa1-billing.com looks like paypal.com',
        'Parcelhub: delivery notices, by the rule “Receipts and shipping”',
      ],
      handledTitle: 'Handled while you slept',
      label: 'Try it',
      lead: 'This is what a morning looks like now. The drafts are written, the reasons are given, you decide. Go ahead, clear it.',
      left: (count: number) => `${count} to decide`,
      title: 'Your whole inbox, in two minutes.',
    },
    plans: {
      agent: 'The agent',
      emails: 'Emails the agent reads, a month',
      everyPlan: 'On every plan',
      messages: 'or messages to the agent',
      oneAllowance:
        'One allowance for everything the agent does: you pay for what you use, and noise never counts',
      forever: 'forever',
      free: {
        description:
          'Home, the sorting, the rules and the protection. Forever.',
      },
      max: {
        description: 'The same agent for a busy inbox.',
      },
      monthly: 'Monthly',
      per: { month: 'a month', year: 'a year' },
      lite: {
        description: 'The whole agent: it reads, writes and remembers.',
      },
      pro: {
        description: 'The same agent with room for more mail.',
      },
      tryFree: (days: number) => `Try free for ${days} days`,
      yearly: 'Yearly · 2 months free',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Home, sorting, plain-language rules and protection are free forever. Pro is the agent that reads, writes and remembers for you; Max is the same agent with room for a busy inbox. Every account starts with ${trialDays} days of Pro, and when they end you simply stay on Free.`,
      otherTool: 'Thinking about another tool?',
      title: 'Pay for the agent, not the inbox.',
    },
    startFree: 'Start free',
    trialNote: (days: number) =>
      `${days} days of Pro, no card. Then free for as long as you like.`,
    trust: {
      emphasis: 'asks',
      label: 'Your mail, your say',
      places: 'Works on top of the Gmail you already use, and reaches you in',
      title: 'It asks before it acts.',
      vows: [
        {
          description:
            'Drafts wait for you. Only rules you created or kept may archive, mark read or unsubscribe on their own, and everything they did is listed under Handled.',
          title: 'Nothing is sent without your yes.',
        },
        {
          description:
            'Subjects, bodies, summaries and drafts are encrypted in our database. Saved drafts stay in Gmail, never with us.',
          title: 'Encrypted at rest.',
        },
        {
          description:
            'The spam shield learns from everyone through keyed hashes. Not one address or word of your mail is shared.',
          title: 'Never used to train models.',
        },
      ],
    },
  },
  skills: {
    bills: 'Bills and payments due',
    cancel: 'Cancel a paid subscription',
    cleanup: 'Newsletters to clear out',
    followups: 'Who owes you an answer',
    reading: 'The day’s newsletters in one digest',
    today: 'What needs you today',
    waiting: 'Who is waiting for your reply',
    week: 'Your week in mail',
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
    imagesHidden: 'Images are hidden in spam.',
    openFile: {
      action: 'Open',
      description:
        'This email is in spam. Open its files only if you trust the sender.',
      title: (name: string) => `Open ${name}?`,
    },
    showImages: 'Show images',
  },
  starterRules: {
    alwaysShow:
      'Security alerts, bills that are due, anything from my bank or government',
    newsletters: 'Newsletters and digests',
    notifications: 'Automated notifications from tools and services',
    promotions: 'Promotions, marketing and cold sales emails',
    receipts: 'Receipts, order and shipping confirmations',
  },
  telegram: {
    approveAlike: 'Approve every card of one kind at once:',
    chatTaken:
      'This chat is already connected to another Fewmail account. Disconnect Telegram there first (Settings → Integrations), then open the link again.',
    queueChanged: 'The cards changed since. Here is what needs you now:',
    commands: { queue: 'What needs you' },
    connectFirst: (url: string) =>
      `Hi! I’m Fewmail. Here in Telegram I tell you when urgent mail arrives, show what needs you and send the replies you approve.\n\nThis chat isn’t connected to your Fewmail yet. It takes a minute:\n1. Open Fewmail settings: ${url}\n2. Under Integrations, tap “Connect Telegram” (it’s part of Fewmail Pro).\n3. Telegram brings you back here — press Start and you’re set.`,
    connected:
      'Connected. I will ping you when something urgent arrives.\n\n/queue: what needs you',
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
    draftClipped:
      'Shortened here. Send sends the whole draft. Read it in Fewmail.',
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
    help: 'Write or say what you need:\n• ask about your mail: “when does my Netflix renew?”\n• say what to answer: “tell Anna I’ll sign tomorrow”\n• give me a task: “always archive newsletters from Medium”\n• reply to one of my drafts to change it',
    urgent: 'Urgent',
    willSend: 'Will send:',
  },
  today: {
    working: 'Working on it…',
    allKinds: 'All',
    ruleOffer: {
      lead: 'The agent can do this for matching mail on its own. It stays off until you say yes.',
      no: 'Keep off',
      turnedOn: 'Turned on. Change it in Rules.',
      yes: 'Turn on',
    },
    newSender: {
      archive: 'Always archive',
      archived:
        'New mail from this sender will be archived. Change it in Rules.',
      keep: 'Keep as usual',
      label: 'New sender',
      lead: (count: number, opened: number) =>
        `${count} emails in two weeks, ${opened === 0 ? 'none opened' : `${opened} opened`}`,
    },
    readingNow: (total: number) =>
      plural('en', total, {
        one: () => 'The agent is reading a new email',
        other: (n) => `The agent is reading ${n} new emails`,
      }),
    allDone: 'All done. Nothing needs you.',
    allDoneLead:
      'I keep reading new mail, and anything that needs you shows up here.',
    byRules: (n: number) => `Your rules took care of ${n}.`,
    decisions: 'Decisions',
    journal: {
      approved: 'You said yes',
      byRule: (rule: string) => `Your rule: ${rule}`,
      failed: 'Did not work',
      lead: 'The last 7 days. Every change in your mail or calendar had your yes or a rule you turned on.',
      title: 'Done in your mail',
    },
    progress: (done: number, total: number) => `${done} of ${total}`,
    readAll:
      'I read every one, and nothing changes in your mail without your yes.',
    worthKnowing: 'Worth knowing',
    quick: 'Quick',
    needsLook: 'Needs a look',
    tidy: {
      failed: (emails: string) =>
        `Gmail did not change ${emails}. Try again in a moment.`,
      confirm: (emails: string) => `Tidy up ${emails}?`,
      running: 'Tidying up…',
      unsubscribeHint:
        'Fewmail will leave the mailing lists among them, and leaving a list cannot be undone.',
      archive: (n: number) => `${n} to archive`,
      review: 'Review',
      reviewLead:
        'Each email with what the agent would do and why. Approve what looks right, keep what should stay as it is.',
      reviewTitle: 'Review what the agent suggests',
      done: (n: number) => `${n} tidied`,
      keep: 'Keep',
      mark_read: (n: number) => `${n} to mark read`,
      run: 'Approve all',
      total: (total: number) =>
        plural('en', total, {
          one: () => 'The agent suggests tidying one email',
          other: (n) => `The agent suggests tidying ${n} emails`,
        }),
      unsubscribe: (n: number) => `${n} to unsubscribe`,
      untilYouApprove: 'Nothing changes in your mail until you approve',
      spam: (n: number) => `${n} to move to spam`,
      trash: (n: number) => `${n} to delete`,
    },
    pauseListening: 'Pause',
    resumeListening: 'Resume',
    awaiting: 'Waiting for a reply',
    dates: 'Dates and meetings',
    done: 'Done',
    firstRead:
      'Starting with the last three days of your mail. What needs you shows up here on its own, and nothing changes until you say yes.',
    approvedMany: (n: number) => `${n} approved`,
    listen: 'Listen',
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
    hint: {
      messengers: {
        lead: 'Get urgent mail and approve drafts in the messenger you already use.',
        title: 'Telegram or WhatsApp',
      },
      notNow: 'Not now',
      setUp: 'Set up',
      turnOn: 'Turn on',
    },
    period: (days: number) =>
      days === 1 ? 'in the last day' : `in the last ${days} days`,
    pulse: {
      lists: (n: number) => `${n} from mailing lists`,
      people: (n: number) => `${n} from people`,
      total: (total: number, period: string) =>
        plural('en', total, {
          one: (n) => `${n} email ${period}`,
          other: (n) => `${n} emails ${period}`,
        }),
    },
    saved: (minutes: number) =>
      `Fewmail saved you about ${formatMinutes('en', minutes)} this week`,
    recent: (period: string) => `Also ${period}`,
    sent: 'Sent',
    codes: 'Sign-in codes',
  },
  upgrade: {
    ask: 'Ask your mail',
    hints: {
      ask: 'Part of Fewmail Pro: ask anything in plain words and get the answer from your own mail.',
      drafts:
        'Part of Fewmail Pro: the agent writes the reply in your style, and you edit and send it.',
    },
  },
  whatsapp: {
    phoneTaken:
      'This number is already connected to another Fewmail account. Disconnect WhatsApp there first (Settings → Integrations), then send the message again.',
    connectFirst: (url: string) =>
      `Hi! I’m Fewmail. Here in WhatsApp I tell you when urgent mail arrives, show what needs you and send the replies you approve.\n\nThis number isn’t connected to your Fewmail yet. It takes a minute:\n1. Open Fewmail settings: ${url}\n2. Under Integrations, tap “Connect WhatsApp” (it’s part of Fewmail Pro).\n3. WhatsApp opens with a message ready — send it and you’re set.`,
    connected:
      'Connected. I will message you when something urgent arrives. Send text or a voice message to answer any email.',
    proOnly:
      'WhatsApp is part of Fewmail Pro. Open Settings → Plan in Fewmail to upgrade.',
  },
  zombie: {
    badge: (share: number) => `Ignores unsubscribes for ${share}% of people`,
    reason: 'Kept mailing you after you unsubscribed',
  },
}

export type Messages = typeof en
