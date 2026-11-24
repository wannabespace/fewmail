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
    auto_done: 'done on its own',
    dismissed: 'skipped',
    done: 'done',
    failed: 'failed',
    pending: 'waiting for you',
  },
  agent: {
    decideOnHome: 'Decide in Fewmail',
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
      create_bot: 'Make this bot?',
      update_bot: 'Change this bot?',
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
      create_bot: 'Making a bot',
      update_bot: 'Changing a bot',
      dismiss_action: 'Skipping',
      draft_reply: 'Drafting a reply',
      create_draft: 'Saving a draft',
      find_people: 'Finding the address',
      get_person: 'Looking up the person',
      get_today: 'Checking today',
      list_handled: 'Checking what was handled',
      list_mail: 'Searching mail',
      get_bot_chat: 'Reading the chat',
      list_bots: 'Reading your bots',
      read_thread: 'Reading the thread',
      redraft_action: 'Rewriting the draft',
      refresh: 'Checking for new mail',
      remind_later: 'Setting a reminder',
      send_email: 'Sending',
      snooze_thread: 'Snoozing',
      unsubscribe: 'Unsubscribing',
      tidy_mail: 'Tidying up',
      trash_thread: 'Moving to the trash',
      report_spam: 'Reporting spam',
      mark_not_spam: 'Moving out of spam',
      move_to_inbox: 'Moving to the inbox',
      list_promises: 'Checking promises',
      set_promise_status: 'Updating the promise',
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
      create_bot: 'Make bot',
      update_bot: 'Save',
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
  bulk: {
    badge: (n: number) => `Sent to ${n}+ Fewmail users`,
    reason: (n: number) => `Mass email: ${n}+ Fewmail users got the same text`,
  },
  cold: {
    reason: 'Cold outreach: a stranger pitching, and you never wrote to them',
  },
  byBot: 'by a bot',
  calendar: {
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
    backInQueue: 'Canceled. The draft waits in its bot’s chat again.',
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
  board: {
    lead: {
      coming: (total: number) =>
        plural('en', total, {
          one: () => 'One deadline is coming up.',
          other: (n) => `${n} deadlines are coming up.`,
        }),
      owed: (amounts: string) => `You are owed ${amounts}.`,
      promised: (total: number) =>
        plural('en', total, {
          one: () => 'You promised one thing.',
          other: (n) => `You promised ${n} things.`,
        }),
      waiting: (total: number) =>
        plural('en', total, {
          one: () => 'One promise to you is still open.',
          other: (n) => `${n} promises to you are still open.`,
        }),
    },
    section: {
      coming: 'Coming up',
      owed: 'Owed to you',
      promised: 'You promised',
    },
    state: {
      acknowledged: 'they answered, not done yet',
      broken: 'did not happen',
      cancelled: 'called off',
      fulfilled: 'done',
      in_progress: 'on its way',
      open: 'waiting',
      overdue: 'overdue',
    },
    by: (date: string) => `by ${date}`,
    lastDay: (date: string) => `deadline: ${date}`,
    done: 'Done',
    forget: 'Forget it',
    reopen: 'Reopen',
    markedDone: 'Marked done',
    forgotten: 'Forgotten',
    reopened: 'Reopened',
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
    ready: (emails: string) => `${emails} can go`,
    review: 'Review',
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
    handled: 'emails handled by Fewmail',
    handledHint:
      'Fewmail moves nothing in Gmail unless you approve it. Let a bot act on its own, and it will handle mail like this for you.',
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
    empty: 'No newsletters yet',
    emptyHint:
      'Each morning the agent will write the news from your newsletters here, each line linked to the email it came from.',
    title: 'Reading',
  },
  command: {
    appearance: 'Appearance',
    compose: 'New email',
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
    crashTitle: 'Fewmail tripped over this page',
    crashLead:
      'Your mail is safe and nothing changed in Gmail. Reload, and if it happens again we already know.',
    missingTitle: 'Nothing lives at this address',
    calendarAccess:
      'Fewmail has no access to this calendar. Allow it on the Calendar page.',
    failed: 'Something went wrong. Try again.',
    needsPro: 'This needs Fewmail Pro.',
    alreadySent: "Already sent, it's too late to undo.",
    consentChanged:
      'This changed since it was asked. Look at it again and decide in its bot’s chat.',
    notFound: 'This is no longer here. It may have been deleted.',
    offline: "Can't reach Fewmail. Check your connection.",
  },
  desktop: {
    confirm: 'Sign in to the app',
    confirmLead: (code: string) =>
      `Fewmail on your computer asks to sign in. Check that it shows ${code}.`,
    confirmTitle: 'Sign in to the app?',
    expired: 'This sign-in expired. Start it again in the app.',
    lead: "You're signed in on your computer. You can close this tab.",
    title: 'Back to the app',
    waiting: (code: string) =>
      `Continue in your browser and check that it shows ${code}.`,
  },
  update: {
    available: 'A new version of Fewmail is out.',
    reload: 'Reload',
  },
  keys: {
    attach: 'attach',
    forget: 'forget',
    reopen: 'reopen',
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
      'Nothing is sent or archived without your approval. Calendar and contacts are optional.',
    continue: 'Continue with Google',
    lead: 'Fewmail reads your mail and shows only what needs you.',
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
    inboxTotal: (count: string) => `${count} total`,
    markShownRead: (n: number) => `Mark ${n} read`,
    oneTimeCode: {
      copied: 'Code copied',
      copy: 'Copy code',
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
      named: 'Sender or subject',
      mentioned: 'Mentioned in the text',
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
      'Fewmail asked to leave, but this sender is known to keep writing anyway. Send their mail to the trash from now on? A bot will do it, and you can delete it among your bots.',
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
    empty: {
      focused: 'Inbox zero',
      unread: 'All read',
      categories: 'Inbox zero',
      inbox: 'Inbox zero',
      snoozed: 'Nothing snoozed',
      sent: 'Nothing sent yet',
      drafts: 'No drafts',
      archive: 'The archive is empty',
      spam: 'No spam',
      trash: 'The trash is empty',
    },
    emptyHint: {
      focused: 'New mail shows up here as it arrives.',
      unread: 'New mail shows up here as it arrives.',
      categories: 'New mail shows up here as it arrives.',
      inbox: 'New mail shows up here as it arrives.',
      snoozed:
        'Snooze an email to put it away until later: it comes back to the inbox unread.',
      sent: 'Emails you send show up here.',
      drafts: 'Emails you start but have not sent wait here.',
      archive: 'Archived emails leave the inbox and wait here.',
      spam: 'Spam lands here, out of your inbox.',
      trash: 'Deleted emails stay here for 30 days.',
    },
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
    openInNewTab: 'Open in a new tab',
    search: 'Search or describe',
    unsubscribe: 'Unsubscribe',
    unsubscribed: 'Unsubscribed',
    unsubscribeFailed:
      'This sender has no unsubscribe Fewmail can use, so the email was archived, but you are still on the list.',
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
    unsubscribeHint:
      'Fewmail leaves the list and archives everything it has sent. Leaving a list cannot be undone.',
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
    board: 'Board',
    menu: 'Menu',
    collapseSidebar: 'Collapse sidebar',
    expandSidebar: 'Expand sidebar',
    labels: 'Labels',
    folders: 'Folders',
    calendar: 'Calendar',
    subscriptions: 'Mailing lists',
    wrapped: 'Wrapped',
    people: 'People',
    findPerson: 'Find a person',
    personMail: 'Show emails',
    deleteContact: 'Delete contact',
    contactDeleted: 'Contact deleted',
    clearSearch: 'Clear search',
    mail: 'Mail',
    reading: 'Reading',
    settings: 'Settings',
    syncFailed: 'Gmail sync failed, retrying',
    syncing: 'Reading your inbox…',
    loading: 'Loading',
    syncFailedIn: (email: string) => `Couldn’t sync ${email}, retrying`,
    syncingIn: (email: string) => `Reading ${email}…`,
    home: 'Bots',
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
    testBody: 'This is how urgent mail shows up.',
    testTitle: 'Notifications work',
  },
  plan: {
    used: (percent: number) => `${percent}% used`,
    base: 'The agent’s base monthly limit.',
    times: (times: number) => `${times}× higher monthly limit.`,
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
    openEmail: 'Open email',
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
    credential_phishing: (domain: string) =>
      `${domain} asks you to sign in or enter card or account details. Banks and services never ask for that by email: do not click links or enter anything.`,
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
  bots: {
    profile: 'What I do',
    closeProfile: 'Close',
    since: (date: string) => `Working since ${date}`,
    status: {
      acts: 'Acts on its own',
      asks: 'Asks before each email',
      last: (time: string) => `last at ${time}`,
      paused: (date: string) => `Paused until ${date}`,
      reading: (n: number) =>
        plural('en', n, {
          one: () => `reading a new email`,
          other: (count) => `reading ${count} new emails`,
        }),
      waiting: (n: number) =>
        plural('en', n, {
          one: () => `One thing waits for you`,
          other: (count) => `${count} things wait for you`,
        }),
      watching: 'Watching your mail',
    },
    intro: {
      acts: 'I act on my own, without you: everything I do shows here, and you can undo it.',
      asks: 'Before I touch an email, I ask you here. Let me act on my own, and I will handle it without you.',
      board:
        'Hi! I keep the promises and last days from your mail: what you are owed, what you promised and what is due soon, and I remind you when one comes due. Ask me who owes you what.',
      change:
        'Write to me to change what I do, or to have me remind you of something.',
      fewmail:
        'Hi, I’m Fewmail Bot. I read all the mail none of your bots takes and show you only what needs you. Nothing changes in Gmail without your approval. Ask me anything about your mail, to remind you of something, or to make a bot that handles some of it without you.',
      own: (name: string) => `Hi, I’m ${name}. Here is what I look after:`,
    },
    pause: {
      day: 'Until tomorrow',
      hint: 'While paused it takes no mail, and Fewmail Bot keeps it.',
      month: 'For a month',
      resume: 'Resume',
      title: 'Pause',
      week: 'For a week',
    },
    week: {
      approved: 'with your approval',
      auto: 'on its own',
      title: 'Last 7 days',
      waiting: 'waiting for you',
    },
    lately: 'Lately',
    notifications: 'Notifications',
    quiet: {
      hide: 'Hide',
      show: 'Show',
      week: (n: number) =>
        plural('en', n, {
          one: () => `One change in your mail in the last 7 days`,
          other: (count) => `${count} changes in your mail in the last 7 days`,
        }),
    },
    chatMenu: 'Chat actions',
    clear: 'Clear history',
    clearConfirm: (name: string) => `Clear the chat with ${name}?`,
    clearHint:
      'Its messages go for good. What it did in your mail stays, and so do the reminders it set.',
    cleared: 'History cleared',
    deleteFolder: 'Delete folder',
    deleteFolderConfirm: (name: string) => `Delete the folder ${name}?`,
    deleteFolderHint: 'Its bots stay in the list, outside any folder.',
    moveTo: 'Move to folder',
    newFolder: 'New folder',
    noFolder: 'No folder',
    pin: 'Pin',
    rename: 'Rename',
    renameFolder: 'Rename folder',
    unpin: 'Unpin',
    add: 'New bot',
    answering: 'Writing…',
    cancelReply: 'Cancel reply',
    cards: {
      autoDone: (n: number) =>
        plural('en', n, {
          one: () => 'I did one on my own.',
          other: (count) => `I did ${count} on my own.`,
        }),
      dismissed: (n: number) =>
        plural('en', n, {
          one: () => 'You skipped one.',
          other: (count) => `You skipped ${count}.`,
        }),
      done: (n: number) =>
        plural('en', n, {
          one: () => 'One is done, approved by you.',
          other: (count) => `${count} are done, approved by you.`,
        }),
      failed: (n: number) =>
        plural('en', n, {
          one: () => 'Gmail refused one.',
          other: (count) => `Gmail refused ${count}.`,
        }),
      pending: (n: number) =>
        plural('en', n, {
          one: () => 'One waits for you.',
          other: (count) => `${count} wait for you.`,
        }),
    },
    composer: (name: string) => `Write to ${name} about its mail`,
    copied: 'Copied',
    copy: 'Copy',
    created: 'Bot made. It reads new mail from now on.',
    delete: 'Delete bot',
    deleteConfirm: (name: string) => `Delete ${name}?`,
    deleteHint:
      'Its chat goes with it. Its mail stays where it is, and new mail like it goes to Fewmail.',
    deleted: 'Bot deleted',
    earlier: 'Show earlier',
    edit: 'Bot settings',
    effect: {
      always_show: 'Show me every one',
      archive: 'Archive it',
      collect: 'Just collect it',
      draft_reply: 'Draft a reply',
      mark_read: 'Mark it read',
      promises: 'The promises and last days I keep track of',
      tidy: 'Tidy it up',
      trash: 'Move it to trash',
      unsubscribe: 'Unsubscribe',
    },
    empty: 'Nothing here yet. When mail of mine comes, I write here.',
    enabled: 'Acts on its own',
    enabledHint: {
      off: 'Off, it asks you to approve each email first.',
      on: 'On, it acts without asking; everything it does shows in its chat.',
    },
    instruction: 'Which emails, and what to do with them',
    purpose: {
      ask: 'Tell me what I’m for',
      intro: (name: string) =>
        `Hi, I’m ${name}. Tell me what I’m for: which emails are mine and what to do with them. Until you do, I take no mail.`,
      placeholder: 'e.g. Invoices from Hetzner, mark them read',
      status: 'Waiting to hear what it’s for',
      taken: (effect: string) =>
        `Got it, that mail is mine from now on. What I do with it: ${effect}. Write to me to change it.`,
      waiting: 'Waiting on you:',
    },
    instructionPlaceholder:
      'e.g. Mark invoices from Hetzner read, or archive LinkedIn notifications',
    mute: 'Mute',
    muted: 'Muted: no notifications from this bot',
    name: 'Name',
    namePlaceholder: 'e.g. Invoices',
    noPlan:
      'I can’t answer you: on the free plan I have no tokens for a conversation. Subscribe and I’m all yours.',
    now: 'Waiting now',
    suggestions: 'Suggestions',
    nudge: {
      noReply: 'No answer in that thread yet.',
      replied: 'An answer came in that thread since.',
    },
    promises: (n: number) =>
      plural('en', n, {
        one: () => 'I wrote down a promise.',
        other: (count) => `I wrote down ${count} promises.`,
      }),
    react: 'React',
    reaction: 'Reaction',
    reply: 'Reply',
    save: 'Save',
    saved: 'Saved',
    simple: {
      title: {
        from: (value: string) => `From “${value}”`,
        mailingList: () => 'Any mailing list',
        subject: (value: string) => `Subject contains “${value}”`,
      },
    },
    spent: (date: string) =>
      `I can’t answer until ${date}: this month’s allowance is spent.`,
    steps: (n: number) =>
      plural('en', n, {
        one: () => 'One step',
        other: (count) => `${count} steps`,
      }),
    subscribe: 'Subscribe',
    fewmail: 'Fewmail Bot',
    fewmailJob: 'Makes your bots, finds emails and answers questions',
    title: 'Bots',
    toLatest: 'To the latest',
    unmute: 'Unmute',
    whatItDoes: 'What it does with them',
    you: 'You',
  },
  settings: {
    disconnectConfirm: (name: string) => `Disconnect ${name}?`,
    messengerDisconnectHint:
      'The bot stops writing to you. Connecting again takes a new link from this page.',
    account: 'Account',
    agent: 'Agent',
    deleteAccount: 'Delete account',
    deleteConfirm: 'Delete everything',
    deleteDescription:
      'Deletes your account, synced mail, drafts and bots from Fewmail right away. Your Gmail itself is not touched. A paid plan is canceled at once.',
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
    languageSearch: 'Search languages',
    languageDescription: 'App, bot and summaries. Replies follow the email.',
    legal: 'Legal',
    mailboxes: {
      removeConfirm: (email: string) => `Remove ${email}?`,
      removeHint:
        'Fewmail stops reading it and forgets what it read there. Nothing changes in Gmail.',
      add: 'Add Gmail',
      addDescription:
        'Another Gmail account’s mail joins the same bots and inbox. It never signs anyone in here: signing in with it opens a separate Fewmail.',
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
      desktop: 'This computer',
      messengerOff: 'Urgent mail stays in Fewmail.',
      messengerOn: 'Urgent mail arrives in the chat right away.',
      notConfigured: 'Browser notifications are not configured on this server.',
      off: 'Get urgent mail here, even with Fewmail closed.',
      on: 'Urgent mail shows up here. Several at once arrive as one.',
      title: 'Notifications',
      test: 'Send a test',
      testFailed: 'It didn’t arrive. Turn notifications off and on again.',
      testSent:
        'Sent. Not on screen? Allow notifications for your browser in your computer’s settings.',
      testSentDesktop:
        'Sent. Not on screen? Allow notifications for Fewmail in your computer’s settings.',
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
        `Fewmail is free forever for the bots, sorting and spam protection. Pro, the whole agent, starts with ${trialDays} free days and no card.`,
      tagline: 'the AI email agent for Gmail',
    },
    chapters: {
      pricing: {
        description:
          'The bots, the sorting and the protection are free forever. Lite, Pro and Max add everything that reads and writes for you; the bigger plans simply do more of it.',
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
        'The signed contract, before Friday’s kickoff. A reply is already drafted and waits for your approval in Fewmail.',
      clients: 'Works with',
      emphasis: 'Claude and ChatGPT.',
      free: 'Reading your mail and the agent’s sorting is free.',
      label: 'MCP',
      lead: 'Connect Fewmail as an MCP server and ask about your mail from the assistant you already use. Anything that sends or changes Gmail still waits for your approval.',
      question: 'What does Anna need from me this week?',
      setup: 'Connect in a minute',
      title: 'Your mail, inside Claude and ChatGPT.',
    },
    mcpPage: {
      copy: 'Copy URL',
      lead: 'Connect Fewmail as an MCP server and ask about your mail from the AI you already use. Reading your mail and the agent’s sorting is free; drafting, sending and bots that write come with Pro.',
      safety:
        'Anything that sends an email or changes Gmail asks for your approval first. An email that tries to give the assistant orders is flagged before the assistant reads it. Your mail is never used to train models, and you can disconnect any app in Settings.',
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
            'Replies are written ahead of time, in your tone and in the sender’s language, and wait in their bot’s chat until you approve them.',
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
        bots: {
          description:
            'Describe in one sentence what should happen to some mail and it becomes a bot with its own chat. Only the bots you let act do so on their own.',
          title: 'Bots in plain words',
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
            'Fewmail encrypts subjects, bodies, summaries and drafts in its database, never uses your mail to train models and never sends or changes anything in Gmail without your approval. You can disconnect it and delete everything at any time.',
          question: 'Is it safe to let AI read my email?',
        },
        {
          answer:
            'It drafts them for you, but never sends one on its own. Each draft waits in its bot’s chat for your approval, and similar ones can be approved together.',
          question: 'Can it answer emails automatically?',
        },
        {
          answer: `Yes. The Free plan sorts every email, keeps what needs you in your bots’ chats, runs your bots and protects you from spam and phishing, forever. Drafts, summaries and the rest of the agent come with the paid plans, and every account starts with ${trialDays} days of Pro, no card.`,
          question: 'Is there a free AI email assistant for Gmail?',
        },
      ],
      faqTitle: 'About AI email assistants.',
      lead: 'Fewmail reads every email in your Gmail as it arrives, clears the noise, drafts replies in your voice and brings you only the few things that need your decision. Nothing is sent or changed without your approval.',
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
        home: 'What needs you, in one place',
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
        bots: 'Bots in plain words',
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
        bots: 'Archive, mark read or unsubscribe, free',
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
          bots: 'Trained by moving mail between folders',
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
          bots: 'AI filters, 3 to 50 by plan',
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
          bots: 'Custom Auto Labels, on Business',
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
          'Never without you. Replies wait in their bot’s chat until you approve them, and a bot archives, marks read or unsubscribes on its own only once you let it. Everything it did stays in its chat, with the reason.',
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
          'Gmail and Google Workspace accounts today. Add several mailboxes to one Fewmail and their mail joins the same bots and inbox.',
        question: 'Which email accounts work?',
      },
    ],
    features: {
      description:
        'The parts of email that used to take an afternoon, done in the background and listed where you can check them.',
      items: {
        calendar: {
          description:
            'The calendar of every mailbox in one view. A meeting proposed in an email becomes an event once you approve it.',
          title: 'Calendar',
        },
        codes: {
          description:
            'A fresh code waits at the top of every page and beside its email, ready to copy without opening anything. Free.',
          title: 'Sign-in codes',
        },
        messengers: {
          description:
            'Urgent mail reaches you in Telegram or WhatsApp at once. Ask about your mail and approve drafts there, in words or by voice.',
          title: 'Telegram and WhatsApp',
        },
        reading: {
          description:
            'One issue of yesterday’s newsletters each morning: the news by topic, each sentence linked to where it came from, and the ones worth reading in full.',
          title: 'Reading',
        },
        shield: {
          description:
            'Report a spammer once and every Fewmail user is safer. Whatever the shield catches waits for your approval before it moves. Free.',
          title: 'Spam shield',
        },
        subscriptions: {
          description:
            'Every mailing list that wrote this month, with how many of its emails you actually opened. Leave any of them with one key. Free.',
          title: 'Mailing lists',
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
          fix: 'Ask Fewmail Bot to clear out the backlog: old ads, read notifications, lists you never open, all moved in one go. One Undo brings every email back.',
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
          fix: 'Each morning Reading turns yesterday’s newsletters into one issue by topic, with the ones worth reading in full pointed out.',
          problem: 'Newsletters you meant to read.',
        },
        {
          fix: 'Changed payment details, lookalike domains and known phishing raise a warning before you act.',
          problem: 'An invoice with new bank details.',
        },
        {
          fix: 'The Board writes down what you promised and what you are owed, and brings each back on its day. Threads nobody answered get a follow-up.',
          problem: 'The thing you promised and forgot.',
        },
        {
          fix: 'Only urgent mail reaches you in Telegram or WhatsApp. The rest waits in your bots’ chats, already sorted, for whenever you look.',
          problem: 'Checking mail at dinner, just in case.',
        },
      ],
      title: 'Email problems you stop having.',
    },
    hero: {
      needs: {
        emphasis: 'need you.',
        lead: (handled: string, bot: string) =>
          `Anna is waiting on the contract, Northwind’s invoice is due next week and Marco wants Thursday. Your bots took care of ${handled} newsletters and notifications, and these three wait in ${bot}.`,
        tag: (bot: string) => `${bot} · Thursday, 08:12`,
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
      seeBots: 'Meet the bots',
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
    bots: {
      again: 'Start over',
      board: {
        coming: { state: 'turns paid · Nov 28', text: 'Coursely trial' },
        owed: {
          state: 'waiting · by Nov 22',
          text: 'Northwind: refund of $120 for the double charge',
        },
        promised: {
          state: 'due Thursday',
          text: 'Send Marco the slides before the review',
        },
      },
      emphasis: 'each kind of mail.',
      fewmail: {
        approve: 'Approve',
        ask: 'Invoices from Hetzner: mark them read',
        botName: 'Hetzner invoices',
        digest: (total: number, people: number) =>
          `${total} emails in the last day. Mostly newsletters and notifications, and just ${people} from people.`,
        proposal: 'Here is the bot. Approve it and it starts with new mail.',
      },
      label: 'Bots',
      later: 'Four worth knowing, nothing to decide.',
      lead: 'Each bot reads its own kind of mail as it arrives and tells you in its chat what it did and what waits for you. Click through them, or press [ and ].',
      points: [
        {
          description:
            'Every email goes to the bot whose job it is: Important, Can wait, Quick, or one you made. What no bot takes stays with Fewmail Bot.',
          title: 'They sort as mail arrives.',
        },
        {
          description:
            'A bot asks before it touches each email until you let it act on its own. Whatever it did stays in its chat, with the reason.',
          title: 'They ask until you trust them.',
        },
        {
          description:
            'Tell Fewmail Bot “invoices from Hetzner: mark them read” and approve the bot it makes. Pause, change or delete one the same way.',
          title: 'Make one in a sentence.',
        },
      ],
      quick:
        'Mira at Growthly is cold outreach: a stranger pitching, and you never wrote to them.',
      settled: {
        remind: 'reminder set',
        send: 'reply sent',
        skip: 'skipped',
      },
      title: 'A chat for each kind of mail.',
    },
    plans: {
      agent: 'The agent',
      details: 'See every plan in detail',
      usage: 'Agent limit, a month',
      everyPlan: 'On every plan',
      oneAllowance:
        'One allowance for everything the agent does: you pay for what you use, and noise never counts',
      forever: 'forever',
      free: {
        description: 'The bots, the sorting and the protection. Forever.',
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
        `Bots in plain words, sorting and protection are free forever. Pro is the agent that reads, writes and remembers for you; Max is the same agent with room for a busy inbox. Every account starts with ${trialDays} days of Pro, and when they end you simply stay on Free.`,
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
            'Drafts wait for you. A bot moves mail on its own only once you let it, and everything it did stays in its chat with the reason.',
          title: 'Nothing is sent without your approval.',
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
  starterBots: {
    board: { name: 'Board' },
    important: {
      instruction:
        'What needs a step from me: people waiting for my answer, bills that are due, security alerts, anything from my bank or government. Show me every one',
      name: 'Important',
    },
    later: {
      instruction:
        'Worth knowing but needs no decision: updates from services I use, deliveries, events and dates',
      name: 'Can wait',
    },
    quick: {
      instruction:
        'Noise I would clear without reading: notifications, receipts, newsletters, promotions and cold sales. Tidy them up: archive, mark read or unsubscribe, whichever fits',
      name: 'Quick',
    },
  },
  telegram: {
    approveAlike: 'Approve every card of one kind at once:',
    chatTaken:
      'This chat is already connected to another Fewmail account. Disconnect Telegram there first (Settings → Integrations), then open the link again.',
    queueChanged: 'The cards changed since. Here is what needs you now:',
    commands: { queue: 'What needs you' },
    connectFirst: (url: string) =>
      `Hi! I’m Fewmail. Here in Telegram I tell you when urgent mail arrives, show what needs you and send the replies you approve.\n\nThis chat isn’t connected to your Fewmail yet. It takes a minute:\n1. Open Fewmail settings: ${url}\n2. Under Integrations, tap “Connect Telegram” (it’s part of Fewmail Pro).\n3. Telegram brings you back here, press Start and you’re set.`,
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
    botSuggestion: {
      board:
        'Keeps the promises and last days from your mail and reminds you when one comes due',
      create: 'Make this bot',
      done: {
        archive: 'A new bot archives this sender’s mail from now on.',
        mark_read: 'A new bot marks this sender’s mail read from now on.',
      },
      label: 'Suggested bot',
      lead: (count: number, effect: 'archive' | 'mark_read') =>
        effect === 'archive'
          ? `${count} emails this month, and the agent would archive every one`
          : `${count} emails this month, and the agent would mark every one read`,
      no: 'No, thanks',
      yes: {
        archive: 'Always archive',
        mark_read: 'Always mark read',
      },
    },
    newSender: {
      archive: 'Always archive',
      archived: 'A new bot archives this sender’s mail from now on.',
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
    allowanceSpent: (date: string) =>
      `This month’s agent allowance is spent: summaries and drafts come back on ${date}. Until then I still write down promises and last days.`,
    byBots: (n: number) => `Your bots took care of ${n}.`,
    decisions: 'Decisions',
    journal: {
      approved: 'Approved by you',
      byBot: (bot: string) => `Your bot: ${bot}`,
      failed: 'Did not work',
      lead: 'The last 7 days. Every change in your mail or calendar was approved by you or made by a bot you let act on its own.',
      title: 'Done in your mail',
    },
    progress: (done: number, total: number) => `${done} of ${total}`,
    mostlyNoise: (people: number) =>
      people === 0
        ? 'All of them newsletters and notifications.'
        : `Mostly newsletters and notifications, and just ${people} from people.`,
    worth: {
      awaiting: (total: number) =>
        plural('en', total, {
          one: () => '1 waiting for a reply',
          other: (n) => `${n} waiting for a reply`,
        }),
      dated: (total: number) =>
        plural('en', total, {
          one: () => '1 with a date',
          other: (n) => `${n} with a date`,
        }),
    },
    worthKnowing: 'Worth knowing',
    canWait: 'Can wait',
    canWaitEmpty: {
      lead: 'Mail to read when you have a moment, and replies you are waiting for, gather here.',
      title: 'Nothing is waiting.',
    },
    improve: {
      empty: {
        lead: 'When the agent sees you treat a sender the same way again and again, it offers a bot here.',
        title: 'No suggestions right now.',
      },
      lead: (total: number) =>
        plural('en', total, {
          one: () => 'One bot the agent could make for you.',
          other: (n) => `${n} bots the agent could make for you.`,
        }),
      title: 'The agent suggests',
    },
    quick: 'Quick',
    needsLook: 'Needs you',
    tidy: {
      failed: (emails: string) =>
        `Gmail did not change ${emails}. Try again in a moment.`,
      confirm: (emails: string) => `Tidy up ${emails}?`,
      running: 'Tidying up…',
      unsubscribeHint:
        'Fewmail will leave the mailing lists among them, and leaving a list cannot be undone.',
      review: 'Review',
      reviewLead:
        "I'd clear these away, with why beside each. Approve them all at once, or keep the ones that should stay.",
      reviewTitle: 'Review what the agent suggests',
      done: (n: number) => `${n} tidied`,
      keep: 'Keep',
      run: 'Approve all',
      untilYouApprove: 'Nothing changes in your mail until you approve',
    },
    pauseListening: 'Pause',
    resumeListening: 'Resume',
    awaiting: 'Waiting for a reply',
    dates: 'Dates and meetings',
    done: 'Done',
    firstRead:
      'Starting with the last three days of your mail. What needs you shows up here on its own.',
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
  },
  upgrade: {
    hints: {
      chat: 'Part of Fewmail Pro: talk to your bots about their mail, and they come back to you when they said they would.',
      drafts:
        'Part of Fewmail Pro: the agent writes the reply in your style, and you edit and send it.',
      board:
        'Part of Fewmail Pro: the agent writes down what you were promised, what you promised and the last days in your mail, and keeps each until it is done.',
    },
  },
  whatsapp: {
    phoneTaken:
      'This number is already connected to another Fewmail account. Disconnect WhatsApp there first (Settings → Integrations), then send the message again.',
    connectFirst: (url: string) =>
      `Hi! I’m Fewmail. Here in WhatsApp I tell you when urgent mail arrives, show what needs you and send the replies you approve.\n\nThis number isn’t connected to your Fewmail yet. It takes a minute:\n1. Open Fewmail settings: ${url}\n2. Under Integrations, tap “Connect WhatsApp” (it’s part of Fewmail Pro).\n3. WhatsApp opens with a message ready, send it and you’re set.`,
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
