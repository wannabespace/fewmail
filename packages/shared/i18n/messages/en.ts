import type { AgentToolName, ConsentToolName } from '../../agent'
import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'

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
  agent: {
    voice: 'Talk to the agent',
    voiceStop: 'Stop and send',
    autonomy: {
      ask: 'Asks you before each email',
      auto: (most: number) =>
        `Sends the emails on its own, without asking you (up to ${most})`,
    },
    calendar: (email: string) => `In the calendar of ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    chats: 'Chats',
    confirm: {
      create_schedule: 'Run this on a schedule?',
      create_event: 'Add this event?',
      delete_event: 'Delete this event?',
      update_event: 'Change this event?',
      approve_action: 'Approve this action?',
      archive_thread: 'Archive this thread?',
      clear_out: 'Clear out these groups of inbox mail?',
      undo_clear_out: 'Bring every cleared email back to the inbox?',
      create_rule: 'Add this rule?',
      handle_thread: 'Hand this thread to the agent?',
      reply: 'Send this reply?',
      send_email: 'Send this email?',
      snooze_thread: 'Snooze this thread?',
      unsubscribe: 'Unsubscribe from this sender?',
      trash_thread: 'Move this thread to the trash?',
      report_spam: 'Report this sender as spam?',
      mark_not_spam: 'Move this thread out of spam?',
      move_to_inbox: 'Move this thread back to the inbox?',
    } satisfies Record<ConsentToolName | 'reply', string>,
    decline: 'Don’t',
    declined: 'You said no',
    detach: 'Don’t attach this email',
    deleteChat: 'Delete chat',
    failed: 'The agent could not finish. Try again.',
    lead: 'Ask about your mail or say what to do. Anything that sends or changes Gmail waits for your yes.',
    newChat: 'New chat',
    closeChat: 'Close tab',
    switchChat: 'Switch chat',
    noChats: 'No chats yet',
    cancelEdit: 'Cancel editing',
    copy: 'Copy',
    edit: 'Edit',
    editing: 'Editing your message',
    regenerate: 'Answer again',
    skills: 'Skills',
    placeholder: 'Ask about your mail, or type / for skills',
    retry: 'Try again',
    send: 'Send',
    steps: {
      create_schedule: 'Setting up a schedule',
      delete_schedule: 'Stopping the schedule',
      list_schedules: 'Reading schedules',
      create_event: 'Adding an event',
      delete_event: 'Deleting the event',
      list_events: 'Checking the calendar',
      update_event: 'Changing the event',
      list_subscriptions: 'Reading subscriptions',
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
      get_board: 'Reading the board',
      get_person: 'Looking up the person',
      get_today: 'Checking today',
      handle_thread: 'Handing the thread over',
      list_boards: 'Opening boards',
      list_handled: 'Checking what was handled',
      list_mail: 'Searching mail',
      list_rules: 'Reading rules',
      read_thread: 'Reading the thread',
      redraft_action: 'Rewriting the draft',
      refresh: 'Checking for new mail',
      send_email: 'Sending',
      snooze_thread: 'Snoozing',
      unsubscribe: 'Unsubscribing',
      trash_thread: 'Moving to the trash',
      report_spam: 'Reporting spam',
      mark_not_spam: 'Moving out of spam',
      move_to_inbox: 'Moving to the inbox',
      create_board: 'Creating a board',
      update_board: 'Changing the board',
      delete_board: 'Deleting the board',
      add_board_chart: 'Adding a chart',
      add_to_board: 'Putting it on the board',
      edit_board_entry: 'Correcting the entry',
      remove_board_entry: 'Taking it off the board',
      rename_board_group: 'Renaming the group',
    } satisfies Record<AgentToolName, string>,
    stop: 'Stop',
    thinking: 'Thinking…',
    title: 'What can I do for you?',
    to: (recipients: string) => `To ${recipients}`,
    until: (time: string) => `Until ${time}`,
    yes: {
      create_schedule: 'Schedule it',
      create_event: 'Add',
      delete_event: 'Delete',
      update_event: 'Save',
      approve_action: 'Approve',
      archive_thread: 'Archive',
      clear_out: 'Clear out',
      undo_clear_out: 'Bring back',
      create_rule: 'Add rule',
      handle_thread: 'Hand over',
      reply: 'Send',
      send_email: 'Send',
      snooze_thread: 'Snooze',
      unsubscribe: 'Unsubscribe',
      trash_thread: 'Move to trash',
      report_spam: 'Report spam',
      mark_not_spam: 'Not spam',
      move_to_inbox: 'Move to inbox',
    } satisfies Record<ConsentToolName | 'reply', string>,
  },
  ask: {
    label: (question: string) => `Ask Fewmail: “${question}”`,
    openChat: 'Open in chat',
    thinking: 'Looking through your mail…',
  },
  boards: {
    addTo: 'Add to board',
    added: (board: string) => `Put on ${board}`,
    cancel: 'Cancel',
    chart: {
      add: 'Add chart',
      ask: 'Describe the chart',
      askPlaceholder: 'Spending per shop, orders by status…',
      currency: 'Currency',
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
      moveEarlier: 'Move earlier',
      moveLater: 'Move later',
      other: 'Other',
      remove: 'Remove chart',
      skipped: (n: number) =>
        `Not counted: ${n} in another currency or without an amount`,
      title: 'Chart title',
      type: 'Chart type',
      types: {
        area: 'Area',
        bar: 'Bars',
        line: 'Line',
        pie: 'Pie',
      },
      untitled: 'New chart',
      weekOf: (date: string) => `Week of ${date}`,
    },
    charts: 'Charts',
    create: 'Create board',
    delete: 'Delete board',
    deleteConfirm: (name: string) => `Delete “${name}”?`,
    deleteHint:
      'Its entries and charts go with it. Your mail stays where it is.',
    describe: 'Change what it collects',
    description: 'What it collects',
    descriptionPlaceholder:
      'Trips: flights, hotels and car rentals, with what they cost',
    due: (when: string) => `Coming up ${when}`,
    empty: 'Nothing here yet. Matching emails show up as they arrive.',
    entries: (total: number) =>
      plural('en', total, {
        one: () => 'One entry',
        other: (n) => `${n} entries`,
      }),
    entry: {
      amount: 'Amount',
      currency: 'Currency',
      date: 'Date',
      edit: 'Edit entry',
      edited: 'Edited by you',
      group: 'Who or what',
      next: 'Next date',
      nextOn: (date: string) => `next ${date}`,
      remove: 'Not on this board',
      removed: 'Taken off the board. It learns from that.',
      status: 'Status',
      title: 'Title',
    },
    expected: (when: string) => `Expected ${when}`,
    filter: {
      clear: 'Clear filter',
      nothing: 'No entries match.',
      search: 'Search entries',
    },
    groups: {
      every: {
        month: 'every month',
        quarter: 'every quarter',
        week: 'every week',
        year: 'every year',
      },
      expected: (date: string) => `expected ${date}`,
      next: (date: string) => `next ${date}`,
      perMonth: (amount: string) => `${amount} / month`,
      rename: 'Rename group',
      renameHint: 'Give it another group’s name to merge the two.',
      showAll: (n: number) => `Show all ${n}`,
      showFewer: 'Show fewer',
      title: 'By who or what',
    },
    history: {
      capped: (n: number) =>
        `Read the newest ${n} matching emails of the last six months.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Looking through the last six months of mail…'
          : `Reading ${plural('en', found, { one: () => 'one email', other: (n) => `${n} emails` })} from the last six months · ${plural('en', entries, { one: () => 'one entry', other: (n) => `${n} entries` })} so far`,
    },
    menu: 'Board actions',
    moveDown: 'Move down',
    moveUp: 'Move up',
    name: 'Name',
    namePlaceholder: 'Travel',
    new: 'New board',
    newHint:
      'Describe what to collect in your own words. Fewmail finds it in the last six months of mail, picks the charts and keeps it up to date.',
    planning: 'Setting it up…',
    redescribe: 'Save and read again',
    redescribeHint:
      'Reads the last six months again with the new description. Entries you edited or took off stay.',
    rename: 'Rename board',
    save: 'Save',
    settings: {
      bannerDays: 'Heads-up before a date',
      days: (n: number) =>
        plural('en', n, {
          one: () => '1 day before',
          other: (count) => `${count} days before`,
        }),
      hint: 'When the board warns you before a date.',
      never: 'Never',
      title: 'Heads-ups',
    },
    starter: {
      events: {
        description:
          'Tickets, reservations and appointments: where I need to be, when and with whom.',
        name: 'Events',
      },
      health: {
        description:
          'Doctor visits, prescriptions, test results and insurance claims: who I saw, when, and what it cost.',
        name: 'Health',
      },
      home: {
        description:
          'Rent, utilities, repairs and contracts for where I live: what is due, to whom and how much.',
        name: 'Home',
      },
      invoices: {
        description:
          'Invoices I send and receive for work: client or supplier, amount, due date and whether it is paid.',
        name: 'Invoices',
      },
      jobs: {
        description:
          'Applications, interviews and offers: which company, what role, and where each one stands.',
        name: 'Job search',
      },
      learning: {
        description:
          'Courses, classes and school mail: deadlines, grades, certificates and what they cost.',
        name: 'Courses and school',
      },
      money: {
        description:
          'Payments, subscriptions, bills and refunds: what I pay for, to whom and how much.',
        name: 'Money',
      },
      orders: {
        description:
          'Online orders and deliveries: what I bought, from whom, and where it is.',
        name: 'Orders',
      },
      subscriptions: {
        description:
          'Services I pay for regularly: what each costs, how often, and when it renews next.',
        name: 'Paid subscriptions',
      },
      trips: {
        description:
          'Flights, trains, hotels and rentals: where I go, when and what it costs.',
        name: 'Trips',
      },
    },
    summary: {
      lastMonth: 'Last month',
      perMonth: (amount: string) => `${amount} a month`,
      recurring: (n: number) =>
        plural('en', n, {
          one: () => 'One repeating',
          other: (count) => `${count} repeating`,
        }),
      thisMonth: 'This month',
      upcoming: 'Due in 30 days',
    },
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
    starts: 'Starts',
    title: 'Calendar',
    titlePlaceholder: 'Add a title',
    today: 'Today',
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
    backInQueue: 'Canceled. The draft is back in Today.',
    canceled: 'Canceled. Your email is back in the editor.',
    cc: 'Cc',
    discard: 'Discard',
    draftSaved: 'Draft saved',
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
  clearOut: {
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
    busiest: (day: string, hour: string) => `Busiest: ${day}, around ${hour}`,
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
    split: (people: string, lists: string) =>
      `${people} from people · ${lists} from mailing lists`,
    title: { month: 'Your month in email', year: 'Your year in email' },
    unsubscribed: 'mailing lists left',
  },
  forward: {
    done: 'Your forwarded email',
  },
  reading: {
    digest: (n: number) => `${n} newsletters today`,
    empty: 'No newsletters in the last day.',
    lead: 'The last day of newsletters in one place, so they never crowd the inbox.',
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
    commandsOnly: 'Run a command…',
    rewriteBrief: 'Rewrite the brief',
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
    archive: 'archive',
    reply: 'reply',
    snooze: 'snooze',
    trash: 'trash',
    close: 'close',
    draftReply: 'draft reply',
    edit: 'edit',
    move: 'move',
    open: 'open',
    notOnBoard: 'not on this board',
    rename: 'rename',
    clearFilter: 'clear filter',
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
  limits: {
    boards: (total: number) =>
      `Your plan holds ${total} boards. Delete one, or switch to Max in Settings → Plan.`,
    messages: (date: string) =>
      `This month’s messages to the agent are used up. They come back on ${date}.`,
    tasks: (total: number) =>
      `Your plan hands over ${total} threads at a time. Let one finish, or switch to Max in Settings → Plan.`,
  },
  notices: {
    mailLost: 'Fewmail lost access to your Gmail and is not reading new mail.',
    mailboxLost: (email: string) => `Fewmail lost access to ${email}.`,
    reconnect: 'Reconnect',
    signInAgain: 'Sign in again',
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
      'Fewmail asks to read, organize and send Gmail for you. Nothing is sent and nothing is archived without your say, unless you write a rule that allows it. It also asks for your Google Calendar, which you can untick.',
    continue: 'Continue with Google',
    lead: 'Fewmail reads your inbox for you, answers in your voice and only shows you what actually needs you.',
    messengers:
      'Works in messengers too, starting with Telegram: get the brief, approve replies or just send a voice message.',
    title: 'Only what matters.',
  },
  mail: {
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
      inbox: 'Everything in your inbox',
      important: 'Mail that needs you soon',
      needs_reply: 'People waiting for your answer',
      quiet: 'Newsletters, notices and other noise',
    },
    find: {
      back: 'Back to mail',
      open: 'Search',
      recent: 'Recent searches',
      tips: 'Tips',
      combine: 'Combine them for a sharper search: from:anna has:attachment',
      describeExample: 'invoices from Anna last month',
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
    },
    unread: 'Unread',
    archive: 'Archive',
    archived: 'Archived',
    block: 'Block sender',
    blocked: 'Blocked. Their mail now goes to the trash.',
    forward: 'Forward',
    more: 'More',
    close: 'Close',
    movedToInbox: 'Moved back to the inbox. Thanks for telling us.',
    moveToInbox: 'Move to inbox',
    backInInbox: 'Moved to the inbox',
    noThread: 'Pick an email to read it here',
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
    drafting: 'Drafting…',
    draftWaiting: 'Draft is waiting in Today',
    due: (date: string) => `due ${date}`,
    dueHint: 'Deadline the agent found in this email',
    empty: 'No emails here',
    emptyHint: 'New mail shows up here as it arrives.',
    noResults: 'Nothing found',
    noResultsHint: 'Try other words, or look in another folder.',
    expectsReply: 'Expects a reply',
    filter: {
      archive: 'Archive',
      trash: 'Trash',
      drafts: 'Drafts',
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
  subscriptions: {
    archivedOnly:
      'This sender has no one-click unsubscribe, so its mail was archived. If it keeps coming, it goes to spam.',
    count: (total: number) =>
      plural('en', total, {
        one: () => '1 mailing list',
        other: (n) => `${n} mailing lists`,
      }),
    empty: 'No mailing lists wrote to you this month.',
    lead: 'Mailing lists that wrote to you this month, busiest first. Unsubscribing archives everything they sent; mail that still comes two weeks later goes to spam.',
    opened: (total: number) =>
      total === 0 ? 'none opened' : `${total} opened`,
    title: 'Subscriptions',
    unsubscribe: 'Unsubscribe',
    unsubscribed: 'Unsubscribed',
  },
  nav: {
    calendar: 'Calendar',
    subscriptions: 'Subscriptions',
    agent: 'Agent',
    boards: 'Boards',
    newBoard: 'New board',
    mail: 'Mail',
    reading: 'Reading',
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
    usage: (percent: number) => `Agent · ${percent}% of this month used`,
    watching: 'Agent is watching your inbox',
  },
  schedule: {
    awaitsAnswer:
      'I skipped this run: the last one still waits for your answer in this chat.',
    failed: 'This scheduled run failed. I’ll try again at the next one.',
    limitReached: (day: string) =>
      `This month’s messages are used up, so the schedule skips runs until ${day}.`,
    open: 'Open in Fewmail',
    stopped:
      'This schedule failed three times in a row, so I stopped it. Ask me to set it up again when you want it back.',
  },
  notifications: {
    many: (total: number) =>
      plural('en', total, {
        other: (n) => `${n} new from Fewmail`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Pages the agent fills from your mail, starting with the last half year. Pick up to ${max}; you can add your own later.`,
    boardsTitle: 'What should the agent collect for you?',
    languageHint:
      'The app, briefs, summaries and explanations use this language. Replies always match the language of the email you answer.',
    languageTitle: 'Which language should Fewmail speak?',
    lead: 'Two quick answers. You can change all of them later in Settings.',
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
    priceYearly: (usd: number) => `$${usd} / year`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `${emails} emails and ${messages} messages a month; boards and handed-over threads without limit.`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `${emails} emails and ${messages} messages a month.`,
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
    emailsUsed: (used: string, total: string) => `${used} of ${total} emails`,
    messagesUsed: (used: string, total: string) =>
      `${used} of ${total} messages`,
    trialDescription: (date: string) =>
      `Everything in Pro until ${date}, then Free. No card needed.`,
    upgrade: 'Other plans',
    usage: 'This month',
  },
  people: {
    firstContact: (date: string) => `Writing since ${date}`,
    lastContact: (date: string) => `Last email ${date}`,
    open: 'Waiting in other threads',
    promised: 'You promised',
    threads: (total: number) =>
      plural('en', total, {
        one: () => '1 conversation',
        other: (n) => `${n} conversations`,
      }),
  },
  queue: {
    askedByYou: 'Asked by you',
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
    deleted: 'Rule deleted',
    add: 'Add rule',
    count: (total: number) =>
      plural('en', total, { one: () => '1 rule', other: (n) => `${n} rules` }),
    delete: 'Delete',
    describe: {
      alwaysShow: 'Always lands in Today',
      autonomous: 'Done on its own, listed under handled',
      draft: 'A draft waits for you in Today',
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
    readingDigest: {
      description:
        'After the brief, the day’s newsletters arrive in Telegram and WhatsApp as one message.',
      title: 'Newsletter digest',
    },
    voiceBrief: {
      description:
        'The brief also arrives in Telegram and WhatsApp as a voice note you can listen to.',
      title: 'Brief as a voice note',
    },
    forward: {
      copy: 'Copy address',
      description:
        'Forward an email here from your own mailbox with a note on what to do. The answer comes in a chat of its own.',
      title: 'Forward to the agent',
    },
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
      allow: 'Allow',
      connected: (ago: string) => `Connected ${ago}`,
      copy: 'Copy URL',
      defaultName: 'MCP client',
      deny: 'Deny',
      description:
        'They can read your brief and mail, draft replies and send them after you confirm.',
      disconnect: 'Disconnect',
      paste:
        'Add this URL as a connector in your app, then sign in to Fewmail.',
      request: (app: string) => `${app} wants to use your Fewmail`,
      title: 'Connect Claude, Cursor or any MCP client',
    },
    signedInWithGoogle: 'Signed in with Google',
    signOut: 'Sign out',
    schedules: {
      delete: 'Delete',
      description:
        'Ask the agent in chat to do something regularly, like “every Friday at 17:00 collect the week’s invoices”. Each run arrives in its own chat, where you approve anything it wants to send.',
      title: 'Schedules',
    },
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
  site: {
    chapters: {
      pricing: {
        description:
          'The sorting, rules and protection are free forever. Pro and Max add everything that reads and writes for you; Max simply does more of it.',
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
        'Anything that sends an email or changes Gmail asks for your yes first. Your mail is never used to train models, and you can disconnect any app in Settings.',
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
        brief: 'Daily brief',
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
        brief: 'In your language, on Pro',
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
          'SaneBox sorts mail into folders, and on its top plan drafts and summarises too. Fewmail reads everything first and hands you one brief and the few decisions only you can make.',
        them: {
          brief: 'A daily digest of filtered mail',
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
          'Drafts are written in the language of the email you are answering. The app, the brief and the Telegram bot speak one language you choose, from fifteen.',
        question: 'Which languages does it speak?',
      },
      {
        answer:
          'Gmail and Google Workspace accounts today. Add several mailboxes to one Fewmail and their mail lands in the same brief and inbox.',
        question: 'Which email accounts work?',
      },
    ],
    features: {
      description:
        'The parts of email that used to take an afternoon, done in the background and listed where you can check them.',
      items: {
        ask: {
          description:
            'Ask anything in plain words and get the answer from your own mail, with the emails it came from.',
          title: 'Ask your mail',
        },
        boards: {
          description:
            'Money, paid subscriptions, trips, orders: describe what to track and the agent collects it from half a year of mail, with charts.',
          title: 'Boards',
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
        forward: {
          description:
            'Forward an email with a note on top, “find a time with them next week”, and the agent takes it from there.',
          title: 'Forward to the agent',
        },
        handle: {
          description:
            'Hand a thread over with a goal and the agent works it to the end, asking before each send.',
          title: 'Handle this',
        },
        reading: {
          description:
            'The day’s newsletters in one quiet list, each summed up in a few sentences.',
          title: 'Reading',
        },
        voice: {
          description:
            'Listen to the brief in Telegram, WhatsApp or the app, and answer the bot with a voice note.',
          title: 'Listen to the brief',
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
        'The email agent that reads your Gmail and only shows you what needs you.',
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
          fix: 'One key unsubscribes the way a person would: one click, the unsubscribe page or an email. Senders who keep writing go straight to spam.',
          problem: 'Newsletters you never signed up for.',
        },
        {
          fix: 'Reading gathers the day’s newsletters into one list, each summed up in a few sentences.',
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
          fix: 'Only urgent mail reaches you in Telegram or WhatsApp. The rest waits for the morning brief, which you can also listen to.',
          problem: 'Checking mail at dinner, just in case.',
        },
      ],
      title: 'Email problems you stop having.',
    },
    hero: {
      brief: {
        emphasis: 'need you.',
        lead: (handled: string) =>
          `Anna is waiting on the contract, Northwind’s invoice is due next week and Marco wants Thursday. ${handled} newsletters and notifications were handled.`,
        tag: 'Thursday brief · 08:00',
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
      lead: 'Newsletters, receipts, pings, a phishing link and, somewhere in there, the three emails that actually matter. Fewmail is the agent that reads all of it for you.',
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
      today: 'Today',
      tryQueue: 'Try the queue',
      unread: ((slots) => [slots.count, ' unread']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' unread in your inbox',
      ]) as Rich<'count'>,
      willDo: 'Fewmail will',
    },
    nav: {
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
      everythingIn: (plan: string) => `Everything in ${plan}, plus`,
      forever: 'forever',
      free: {
        description: 'The sorting, the rules and the protection. Forever.',
        features: [
          'Every email sorted and scored by importance',
          'Plain-language rules that archive, mark read or unsubscribe',
          'Community spam shield and phishing warnings',
          'Zombie senders caught after you unsubscribe',
          'Automatic follow-ups on mail that expects a reply',
          'Snooze, snippets and Fewmail labels in Gmail',
        ],
      },
      max: {
        description: 'The same agent for a busy inbox.',
        emails: (emails: string) => `${emails} emails read a month`,
        messages: (messages: number) =>
          `${messages} messages to the agent a month`,
        unlimited: 'Boards and handed-over threads without limit',
      },
      monthly: 'Monthly',
      per: { month: 'a month', year: 'a year' },
      pro: {
        description: 'The whole agent: it reads, writes and remembers.',
        features: [
          'Today: a daily brief and one queue of decisions',
          'Replies drafted in your voice, sent only when you approve',
          'Telegram: the brief, approvals and voice instructions',
          '“Handle this”: the agent works a thread to its goal',
          'Promises and people remembered, boards with charts for money or anything you track',
          'Ask your mail anything, plus MCP for your own tools',
        ],
        limits: (emails: string, messages: number) =>
          `${emails} emails read and ${messages} messages to the agent a month; noise never counts`,
      },
      tryFree: (days: number) => `Try free for ${days} days`,
      yearly: 'Yearly · 2 months free',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Sorting, plain-language rules and protection are free forever. Pro is the agent that reads, writes and remembers for you; Max is the same agent with room for a busy inbox. Every account starts with ${trialDays} days of Pro, and when they end you simply stay on Free.`,
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
  },
  starterRules: {
    alwaysShow:
      'Security alerts, bills that are due, anything from my bank or government',
    newsletters: 'Newsletters and digests',
    notifications: 'Automated notifications from tools and services',
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
    approveAlike: 'Approve every card of one kind at once:',
    listen: '🔊 Listen',
    commands: { brief: 'Today’s brief', queue: 'What needs you' },
    connectFirst:
      'Open Fewmail → Settings → Integrations and tap “Connect Telegram” first.',
    connected:
      'Connected. I will send your brief every morning and ping you when something urgent arrives.\n\n/brief: today’s brief\n/queue: what needs you',
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
    help: 'Write or say what you need:\n• ask about your mail: “when does my Netflix renew?”\n• say what to answer: “tell Anna I’ll sign tomorrow”\n• give me a task: “make a board for trips”\n• reply to one of my drafts to change it',
    urgent: 'Urgent',
    willSend: 'Will send:',
  },
  today: {
    stopListening: 'Stop',
    awaiting: 'Waiting for a reply',
    briefAt: (time: string) => `daily brief at ${time}`,
    dates: 'Dates and meetings',
    done: 'Done',
    firstRead:
      'Reading the last three days of your mail. What needs you shows up here on its own.',
    approvedMany: (n: number) => `${n} approved`,
    listen: 'Listen to the brief',
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
      notNow: 'Not now',
      setUp: 'Set up',
      turnOn: 'Turn on',
    },
    later: (total: number, time: string) =>
      plural('en', total, {
        one: () => `One more arrives at ${time}`,
        other: (n) => `${n} more arrive at ${time}`,
      }),
    nothingNeedsYou:
      'Nothing needs you right now. New mail is read the moment it arrives.',
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
    savedHow: (handled: number, replies: number) =>
      `Handled on its own: ${handled} · Replies sent from drafts: ${replies}`,
    recent: (period: string) => `Also ${period}`,
    sent: 'Sent',
    worthAttention: 'Worth your attention',
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
