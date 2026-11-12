import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const de: Messages = {
  agent: {
    chats: 'Chats',
    autonomy: {
      ask: 'Fragt dich vor jeder E-Mail',
      auto: (most: number) =>
        `Sendet die E-Mails selbst, ohne dich zu fragen (bis zu ${most})`,
    },
    calendar: (email: string) => `Im Kalender von ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      create_schedule: 'Das regelmäßig ausführen?',
      create_event: 'Diesen Termin hinzufügen?',
      delete_event: 'Diesen Termin löschen?',
      update_event: 'Diesen Termin ändern?',
      approve_action: 'Diese Aktion ausführen?',
      archive_thread: 'Diese Unterhaltung archivieren?',
      create_rule: 'Diese Regel hinzufügen?',
      handle_thread: 'Diese Unterhaltung dem Agenten übergeben?',
      reply: 'Diese Antwort senden?',
      send_email: 'Diese E-Mail senden?',
      snooze_thread: 'Diese Unterhaltung zurückstellen?',
      unsubscribe: 'Von diesem Absender abmelden?',
      trash_thread: 'Diesen Verlauf in den Papierkorb verschieben?',
      report_spam: 'Diesen Absender als Spam melden?',
      mark_not_spam: 'Diesen Verlauf aus dem Spam holen?',
      move_to_inbox: 'Diesen Verlauf zurück in den Posteingang verschieben?',
    },
    decline: 'Nein',
    declined: 'Abgelehnt',
    deleteChat: 'Chat löschen',
    failed: 'Der Agent konnte nicht fertig werden. Versuch es noch einmal.',
    lead: 'Frag nach deinen Mails oder sag, was zu tun ist. Alles, was sendet oder Gmail ändert, wartet auf dein Ja.',
    newChat: 'Neuer Chat',
    noChats: 'Noch keine Chats',
    cancelEdit: 'Bearbeiten abbrechen',
    copy: 'Kopieren',
    edit: 'Bearbeiten',
    editing: 'Du bearbeitest deine Nachricht',
    regenerate: 'Neu antworten',
    skills: 'Skills',
    placeholder: 'Frag nach deinen Mails oder tipp / für Skills',
    retry: 'Erneut versuchen',
    send: 'Senden',
    steps: {
      create_schedule: 'Zeitplan wird eingerichtet',
      delete_schedule: 'Zeitplan wird beendet',
      list_schedules: 'Zeitpläne werden gelesen',
      create_event: 'Termin wird hinzugefügt',
      delete_event: 'Termin wird gelöscht',
      list_events: 'Kalender wird geprüft',
      update_event: 'Termin wird geändert',
      list_subscriptions: 'Lese Abos',
      approve_action: 'Wird ausgeführt',
      archive_thread: 'Wird archiviert',
      create_rule: 'Regel wird hinzugefügt',
      dismiss_action: 'Wird übersprungen',
      draft_reply: 'Antwort wird entworfen',
      create_draft: 'Entwurf wird gespeichert',
      get_board: 'Board wird gelesen',
      get_person: 'Person wird nachgeschlagen',
      get_today: 'Heute wird geprüft',
      handle_thread: 'Unterhaltung wird übergeben',
      list_boards: 'Boards werden geöffnet',
      list_handled: 'Erledigtes wird geprüft',
      list_mail: 'Mails werden durchsucht',
      list_rules: 'Regeln werden gelesen',
      read_thread: 'Unterhaltung wird gelesen',
      redraft_action: 'Entwurf wird umgeschrieben',
      refresh: 'Neue Mails werden abgerufen',
      send_email: 'Wird gesendet',
      snooze_thread: 'Wird zurückgestellt',
      unsubscribe: 'Wird abgemeldet',
      trash_thread: 'Verschiebe in den Papierkorb',
      report_spam: 'Melde Spam',
      mark_not_spam: 'Hole aus dem Spam',
      move_to_inbox: 'Verschiebe in den Posteingang',
      create_board: 'Erstelle ein Board',
    },
    stop: 'Stopp',
    thinking: 'Denke nach…',
    title: 'Was kann ich für dich tun?',
    to: (recipients: string) => `An ${recipients}`,
    until: (time: string) => `Bis ${time}`,
    yes: {
      create_schedule: 'Einplanen',
      create_event: 'Hinzufügen',
      delete_event: 'Löschen',
      update_event: 'Speichern',
      approve_action: 'Ausführen',
      archive_thread: 'Archivieren',
      create_rule: 'Hinzufügen',
      handle_thread: 'Übergeben',
      reply: 'Senden',
      send_email: 'Senden',
      snooze_thread: 'Zurückstellen',
      unsubscribe: 'Abmelden',
      trash_thread: 'In den Papierkorb',
      report_spam: 'Als Spam melden',
      mark_not_spam: 'Kein Spam',
      move_to_inbox: 'Verschieben',
    },
  },
  ask: {
    label: (question: string) => `Fewmail fragen: „${question}“`,
    thinking: 'Durchsuche deine Mails…',
  },
  compose: {
    backInQueue: 'Abgebrochen. Der Entwurf ist wieder in Heute.',
    canceled: 'Abgebrochen. Deine E-Mail ist wieder im Editor.',
    cc: 'Cc',
    discard: 'Verwerfen',
    draftSaved: 'Entwurf gespeichert',
    saveDraft: 'Als Entwurf speichern',
    forward: 'Weiterleiten',
    forwardedMessage: 'Weitergeleitete Nachricht',
    from: 'Von',
    instructionPlaceholder: 'Wie soll sie klingen? (optional)',
    invalidRecipients: 'Füge mindestens eine gültige E-Mail-Adresse hinzu.',
    later: {
      inHour: 'In einer Stunde',
      monday: 'Montagmorgen',
      tomorrow: 'Morgen früh',
    },
    new: 'Neue E-Mail',
    placeholder: 'Schreib deine E-Mail…',
    remind: {
      days: (total: number) =>
        plural('de', total, {
          one: () => 'Erinnern, wenn nach einem Tag keine Antwort',
          other: (n) => `Erinnern, wenn nach ${n} Tagen keine Antwort`,
        }),
      label: 'Erinnern',
      off: 'Keine Erinnerung',
    },
    reply: 'Antworten',
    scheduledFor: (date: string) => `Geplant für ${date}`,
    send: 'Senden',
    sendLater: 'Später senden',
    sendingIn: (seconds: number) => `Senden in ${seconds} s`,
    subject: 'Betreff',
    to: 'An',
    undo: 'Rückgängig',
    writeForMe: 'Schreib es für mich',
    writing: 'Schreibe…',
  },
  composer: {
    acceptSuggestion: 'Tab zum Übernehmen',
    bold: 'Fett',
    bulletList: 'Aufzählung',
    italic: 'Kursiv',
    link: 'Link',
    linkPlaceholder: 'Link einfügen oder eingeben',
    noSnippets: 'Keine passenden Textbausteine.',
    removeLink: 'Link entfernen',
  },
  reminders: {
    followUp: 'Nachfassen',
    noReply: 'Noch keine Antwort',
  },
  skills: {
    bills: 'Fällige Rechnungen und Zahlungen',
    cleanup: 'Newsletter zum Aufräumen',
    followups: 'Wer dir noch antworten muss',
    today: 'Was heute ansteht',
    waiting: 'Wer auf deine Antwort wartet',
    week: 'Deine Woche im Postfach',
  },
  snooze: {
    laterToday: 'Später heute',
    nextWeek: 'Nächste Woche',
    title: 'Zurückstellen',
    tomorrow: 'Morgen',
    unsnooze: 'Zurück in den Posteingang',
    until: (date: string) => `Zurückgestellt bis ${date}`,
    weekend: 'Am Wochenende',
  },
  actionKind: {
    cleanup: 'Alle abbestellen',
    commitment: 'Erledigt',
    security: 'Geprüft',
    task: 'Senden',
    spam: 'In Spam verschoben',
    trash: 'In den Papierkorb',
    archive: 'Archivieren',
    follow_up: 'Nachfassen',
    mark_read: 'Gelesen',
    pay: 'Bezahlen',
    read: 'Lesen',
    reply: 'Antworten',
    schedule: 'Planen',
    unsubscribe: 'Abmelden',
  },
  actionStatus: {
    auto_done: 'vom Agenten erledigt',
    dismissed: 'übersprungen',
    done: 'erledigt',
    failed: 'fehlgeschlagen',
    pending: 'wartet in Heute',
  },
  byRule: 'per Regel',
  calendar: {
    allDay: 'Ganztägig',
    calendar: 'Kalender',
    connect: 'Verbinden',
    connectHint:
      'Erlaube Fewmail, die Termine dieses Kontos zu sehen und zu bearbeiten.',
    connectTitle: 'Google Kalender verbinden',
    create: 'Termin hinzufügen',
    delete: 'Löschen',
    deleted: 'Termin gelöscht',
    description: 'Beschreibung',
    editEvent: 'Termin bearbeiten',
    endBeforeStart: 'Der Termin endet, bevor er beginnt',
    ends: 'Ende',
    location: 'Ort',
    newEvent: 'Neuer Termin',
    next: 'Weiter',
    openInGoogle: 'In Google Kalender öffnen',
    previous: 'Zurück',
    save: 'Speichern',
    saved: 'Termin gespeichert',
    starts: 'Beginn',
    title: 'Kalender',
    titlePlaceholder: 'Titel hinzufügen',
    today: 'Heute',
    untitled: '(Kein Titel)',
    views: {
      day: 'Tag',
      week: 'Woche',
      month: 'Monat',
      year: 'Jahr',
    },
  },
  category: {
    calendar: 'Kalender',
    finance: 'Finanzen',
    newsletter: 'Newsletter',
    notification: 'Benachrichtigung',
    other: 'Sonstiges',
    person: 'Person',
    promotion: 'Werbung',
    receipt: 'Beleg',
    security: 'Sicherheit',
    travel: 'Reisen',
    work: 'Arbeit',
  },
  command: {
    compose: 'Neue E-Mail',
    agent: 'Agent',
    appearance: 'Darstellung',
    goTo: 'Gehe zu',
    mail: 'Mail',
    nothingMatches: 'Keine Treffer.',
    placeholder: 'Frag nach deinen Mails oder führe einen Befehl aus…',
    commandsOnly: 'Befehl ausführen…',
    rewriteBrief: 'Briefing neu schreiben',
    upgrade: 'Auf Pro upgraden',
    teachRule: 'Neue Regel beibringen',
    theme: {
      dark: 'Dunkles Design',
      light: 'Helles Design',
      system: 'Wie das System',
    },
  },
  importance: ['Rauschen', 'Gut zu wissen', 'Braucht dich bald', 'Dringend'],
  justNow: 'gerade eben',
  errors: {
    failed: 'Etwas ist schiefgelaufen. Versuch es noch einmal.',
    needsPro: 'Dafür brauchst du Fewmail Pro.',
    alreadySent: 'Schon gesendet – Rückgängig geht nicht mehr.',
    notFound: 'Das gibt es nicht mehr – vielleicht wurde es gelöscht.',
    offline: 'Fewmail ist nicht erreichbar. Prüf deine Verbindung.',
  },
  keys: {
    restore: 'in den Posteingang',
    calendarToday: 'heute',
    newEvent: 'neuer Termin',
    period: 'zurück / weiter',
    view: 'Ansicht',
    group: 'gruppieren',
    skills: 'Skills',
    unsubscribe: 'abbestellen',
    filter: 'Filter',
    reply: 'antworten',
    snooze: 'zurückstellen',
    trash: 'Papierkorb',
    anything: 'alles',
    archive: 'archivieren',
    approve: 'freigeben',
    close: 'schließen',
    draftReply: 'Entwurf',
    edit: 'bearbeiten',
    move: 'bewegen',
    open: 'öffnen',
    search: 'suchen',
    send: 'senden',
    skip: 'überspringen',
    stopEditing: 'fertig',
  },
  legal: {
    privacy: 'Datenschutzerklärung',
    englishOnly:
      'Dieses Dokument wird auf Englisch bereitgestellt; die englische Fassung ist verbindlich.',
    terms: 'Nutzungsbedingungen',
    updated: (date: string) => `Zuletzt aktualisiert am ${date}`,
  },
  limits: {
    boards: (total: number) =>
      `Dein Plan umfasst ${total} Boards. Lösche eins oder wechsle zu Max unter Einstellungen → Plan.`,
    messages: (date: string) =>
      `Die Nachrichten an den Agenten sind für diesen Monat aufgebraucht. Ab ${date} gibt es neue.`,
    tasks: (total: number) =>
      `Dein Plan übernimmt ${total} Threads gleichzeitig. Lass einen abschließen oder wechsle zu Max unter Einstellungen → Plan.`,
  },
  login: {
    agree: ((slots) => [
      'Wenn du fortfährst, stimmst du den ',
      slots.terms,
      ' und der ',
      slots.privacy,
      ' zu.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail bittet darum, Gmail für dich zu lesen, zu ordnen und zu senden. Ohne dein Okay wird nichts gesendet und nichts archiviert, außer du legst eine Regel an, die es erlaubt. Außerdem bittet es um deinen Google Kalender, den du abwählen kannst.',
    continue: 'Weiter mit Google',
    lead: 'Fewmail liest deinen Posteingang für dich, antwortet in deinem Ton und zeigt dir nur, was dich wirklich braucht.',
    messengers:
      'Funktioniert auch in Messengern, zuerst in Telegram: Briefing lesen, Antworten freigeben oder einfach eine Sprachnachricht schicken.',
    title: 'Nur, was zählt.',
  },
  mail: {
    allMailboxes: 'Alle Postfächer',
    group: {
      category: 'Kategorie',
      importance: 'Wichtigkeit',
      none: 'Keine Gruppen',
      sender: 'Absender',
      title: 'Gruppieren',
    },
    unread: 'Ungelesen',
    block: 'Absender blockieren',
    blocked: 'Blockiert. Ihre Mails landen jetzt im Papierkorb.',
    forward: 'Weiterleiten',
    more: 'Mehr',
    reply: 'Antworten',
    trash: 'In den Papierkorb',
    trashed: 'In den Papierkorb verschoben',
    movedToInbox: 'Zurück im Posteingang. Danke für den Hinweis.',
    moveToInbox: 'In den Posteingang',
    backInInbox: 'In den Posteingang verschoben',
    noThread: 'Wähle eine E-Mail, um sie hier zu lesen',
    deleteDraft: 'Entwurf löschen',
    notSent: 'Nicht gesendet – zum erneuten Senden öffnen',
    noRecipients: 'Keine Empfänger',
    notSpam: 'Kein Spam',
    reportSpam: 'Als Spam melden',
    reportedSpam: 'Gemeldet. Ihre Mails landen jetzt im Spam.',
    archive: 'Archivieren',
    archived: 'Archiviert',
    attachment: 'Anhang',
    draftReply: 'Antwort entwerfen',
    drafting: 'Entwerfe…',
    draftWaiting: 'Entwurf wartet in Heute',
    due: (date: string) => `fällig am ${date}`,
    dueHint: 'Frist, die der Agent in dieser E-Mail gefunden hat',
    empty: 'Hier sind keine Mails',
    emptyHint: 'Neue Mails erscheinen hier, sobald sie ankommen.',
    expectsReply: 'Erwartet Antwort',
    filter: {
      archive: 'Archiv',
      trash: 'Papierkorb',
      drafts: 'Entwürfe',
      spam: 'Spam',
      inbox: 'Posteingang',
      snoozed: 'Zurückgestellt',
      important: 'Wichtig',
      needs_reply: 'Offen',
      quiet: 'Ruhig',
    },
    instruction:
      'Sag dem Agenten, wie er antworten soll, oder drück einfach Enter',
    open: 'Öffnen',
    search: 'Suchen oder beschreiben: Rechnungen von Anna letzten Monat',
    openInGmail: 'In Gmail öffnen',
    unsubscribe: 'Abmelden',
    unsubscribed: 'Abgemeldet',
    unsubscribeFailed:
      'Dieser Absender bietet keine Abmeldung per Klick, daher wurde die Mail archiviert.',
    you: 'Du',
  },
  subscriptions: {
    archivedOnly:
      'Dieser Absender bietet kein Abbestellen per Klick, daher wurden seine Mails archiviert. Kommen weiter welche, gehen sie in den Spam.',
    count: (total: number) => `Verteiler: ${total}`,
    empty: 'Diesen Monat hat dir kein Verteiler geschrieben.',
    lead: 'Verteiler, die dir diesen Monat geschrieben haben, die aktivsten zuerst. Abbestellen archiviert alles, was sie geschickt haben; Mails, die zwei Wochen später noch kommen, landen im Spam.',
    opened: (total: number) =>
      total === 0 ? 'keine geöffnet' : `${total} geöffnet`,
    title: 'Abos',
    unsubscribe: 'Abbestellen',
    unsubscribed: 'Abbestellt',
  },
  nav: {
    calendar: 'Kalender',
    subscriptions: 'Abos',
    agent: 'Agent',
    boards: 'Boards',
    newBoard: 'Neues Board',
    mail: 'Mail',
    rules: 'Regeln',
    search: 'Suchen oder fragen…',
    settings: 'Einstellungen',
    syncFailed: 'Gmail-Sync fehlgeschlagen, neuer Versuch',
    syncing: 'Lese deinen Posteingang…',
    today: 'Heute',
    trialLeft: (total: number) =>
      plural('de', total, {
        one: () => 'Pro-Testphase · noch 1 Tag',
        other: (n) => `Pro-Testphase · noch ${n} Tage`,
      }),
    usage: (percent: number) => `Agent · ${percent} % des Monats verbraucht`,
    watching: 'Der Agent behält deinen Posteingang im Blick',
  },
  schedule: {
    awaitsAnswer:
      'Diesen Lauf habe ich übersprungen: Der letzte wartet in diesem Chat noch auf deine Antwort.',
    failed:
      'Dieser geplante Lauf ist fehlgeschlagen. Ich versuche es beim nächsten erneut.',
    limitReached: (day: string) =>
      `Die Nachrichten dieses Monats sind aufgebraucht, daher überspringt der Zeitplan Läufe bis zum ${day}.`,
    open: 'In Fewmail öffnen',
    stopped:
      'Dieser Zeitplan ist dreimal hintereinander fehlgeschlagen, deshalb habe ich ihn gestoppt. Bitte mich, ihn neu einzurichten, wenn du ihn zurück willst.',
  },
  notifications: {
    many: (total: number) =>
      plural('de', total, {
        other: (n) => `${n} Neuigkeiten von Fewmail`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Seiten, die der Agent aus deinen Mails füllt, beginnend mit dem letzten halben Jahr. Wähle bis zu ${max}; eigene kannst du später hinzufügen.`,
    boardsTitle: 'Was soll der Agent für dich sammeln?',
    languageHint:
      'App, Briefings, Zusammenfassungen und Erklärungen nutzen diese Sprache. Antworten folgen immer der Sprache der Mail, auf die du antwortest.',
    languageTitle: 'Welche Sprache soll Fewmail sprechen?',
    lead: 'Zwei kurze Antworten. Du kannst alles später in den Einstellungen ändern.',
    reading: 'Lese deinen Posteingang…',
    start: 'Los geht’s',
    title: 'Richten wir deinen Agenten ein.',
  },
  plan: {
    free: 'Free',
    freeDescription:
      'Schnelle, ruhige Mail mit einfachen Regeln. Kostenlos, so lange du willst.',
    includes:
      'Pro bringt den Agenten: ein tägliches Briefing, jede Mail gelesen und zusammengefasst, Antworten in deinem Ton, Regeln in einfachen Worten, Telegram und MCP.',
    manage: 'Abrechnung verwalten',
    price: (usd: number) => `$${usd} / Monat`,
    priceYearly: (usd: number) => `$${usd} / Jahr`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `${emails} Mails und ${messages} Nachrichten im Monat; Boards und übergebene Threads ohne Limit.`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `${emails} Mails und ${messages} Nachrichten im Monat.`,
    cancels: (plan: string, date: string) =>
      `${plan} bis ${date}, danach Free.`,
    choose: (plan: string) => `${plan} wählen`,
    proRenews: (date: string) => `Verlängert sich am ${date}.`,
    resets: (date: string) => `Wird am ${date} zurückgesetzt.`,
    title: 'Tarif',
    trial: 'Pro-Testphase',
    welcome: (plan: string) =>
      `Willkommen bei ${plan}. Der Agent ist wieder im Einsatz.`,
    yearly: 'Jährlich zahlen',
    yearlyHint: 'Zwei Monate gratis.',
    emailsUsed: (used: string, total: string) => `${used} von ${total} E-Mails`,
    messagesUsed: (used: string, total: string) =>
      `${used} von ${total} Nachrichten`,
    trialDescription: (date: string) =>
      `Alles aus Pro bis ${date}, danach kostenlos. Keine Karte nötig.`,
    upgrade: 'Andere Pläne',
    usage: 'Diesen Monat',
  },
  queue: {
    askedByYou: 'Von dir angefragt',
    draftedInVoice: 'In deinem Ton entworfen',
    edit: 'Bearbeiten',
    open: 'Öffnen',
    send: 'Senden',
    shorter: 'Kürzer',
    shorterInstruction: 'Mach es kürzer.',
    skip: 'Überspringen',
  },
  rules: {
    add: 'Regel hinzufügen',
    count: (total: number) =>
      plural('de', total, {
        one: () => '1 Regel',
        other: (n) => `${n} Regeln`,
      }),
    delete: 'Löschen',
    describe: {
      alwaysShow: 'Landet immer in Heute',
      autonomous: 'Wird selbst erledigt, steht unter Erledigt',
      draft: 'Ein Entwurf wartet in Heute auf dich',
    },
    effect: {
      trash: 'In den Papierkorb',
      always_show: 'Immer anzeigen',
      archive: 'Archivieren',
      draft_reply: 'Antwort entwerfen',
      mark_read: 'Als gelesen markieren',
      unsubscribe: 'Abmelden',
    },
    enabled: 'Regel aktiv',
    lead: 'Sag dem Agenten in einfachen Worten, was er mit bestimmten Mails tun soll. Er prüft jede Mail anhand dieser Regeln, von oben nach unten.',
    newTitle: 'Neue Regel beibringen',
    placeholder:
      'z. B. Rechnungen von Hetzner oder Benachrichtigungen von LinkedIn',
    leadFree:
      'Automatisch archivieren, als gelesen markieren oder abmelden. Regeln greifen bei neuer Mail, sobald sie ankommt.',
    simple: {
      appliedAutomatically: 'Wird automatisch auf neue Mail angewendet',
      field: {
        from: 'Von',
        mailingList: 'Jede Mailingliste',
        subject: 'Betreff enthält',
      },
      title: {
        from: (value: string) => `Von „${value}“`,
        mailingList: () => 'Jede Mailingliste',
        subject: (value: string) => `Betreff enthält „${value}“`,
      },
      valuePlaceholder: 'anna@example.com, ein Name oder ein Wort',
      whichField: 'Abgleichen nach',
    },
    title: 'Regeln',
    whatAgentDoes: 'Was der Agent tut',
    whichEmails: 'Welche Mails',
  },
  settings: {
    knowledge: {
      description:
        'Preise, Adressen, Verfügbarkeit, wie du gern antwortest. Der Agent nutzt das in Entwürfen und der Autovervollständigung.',
      placeholder:
        'z. B. Beratung kostet $150/h. Freitags nehme ich keine Anrufe an. Meine Adresse ist…',
      title: 'Was der Agent wissen sollte',
    },
    labels: {
      description:
        'Sortiert Mails in Fewmail/…-Labels, damit Gmail auf deinem Handy dieselbe Ordnung zeigt.',
      title: 'Agent-Labels in Gmail',
    },
    schedules: {
      delete: 'Löschen',
      description:
        'Bitte den Agenten im Chat, etwas regelmäßig zu tun, etwa „jeden Freitag um 17:00 die Rechnungen der Woche sammeln“. Jeder Lauf landet in einem eigenen Chat, wo du alles bestätigst, was er senden möchte.',
      title: 'Zeitpläne',
    },
    snippets: {
      add: 'Textbaustein hinzufügen',
      body: 'Text',
      delete: 'Löschen',
      description:
        'Tippe ; im Editor, um einen Textbaustein per Name einzufügen.',
      name: 'Name',
      title: 'Textbausteine',
    },
    account: 'Konto',
    agent: 'Agent',
    briefDescription: (timezone: string) => `In deiner Zeitzone, ${timezone}`,
    briefTitle: 'Tägliches Briefing',
    deleteAccount: 'Konto löschen',
    deleteConfirm: 'Alles löschen',
    deleteDescription:
      'Löscht dein Konto, synchronisierte Mails, Entwürfe, Regeln und Briefings sofort aus Fewmail. Dein Gmail selbst bleibt unberührt.',
    deleteTitle: 'Fewmail-Konto löschen?',
    cancel: 'Abbrechen',
    integrations: 'Integrationen',
    language: 'Sprache',
    languageDescription:
      'App, Briefings und Zusammenfassungen. Antworten folgen der Mail.',
    legal: 'Rechtliches',
    mailboxes: {
      add: 'Gmail hinzufügen',
      addDescription:
        'Mail eines weiteren Gmail-Kontos landet im selben Heute und Posteingang. Damit meldet sich niemand hier an: Eine Anmeldung damit öffnet ein eigenes Fewmail.',
      added: 'Postfach hinzugefügt. Die Mails erscheinen in einer Minute.',
      failed:
        'Das Postfach konnte nicht hinzugefügt werden. Erlaube den Gmail-Zugriff und versuche es erneut.',
      lost: 'Der Gmail-Zugriff ging verloren. Füge es erneut hinzu, um es wieder zu verbinden.',
      reading: 'Mails werden gelesen…',
      remove: 'Entfernen',
      signIn: 'Damit meldest du dich an',
      signInChosen: 'Mit diesem Konto meldest du dich an. Wähle ein anderes.',
      synced: (ago: string) => `Synchronisiert ${ago}`,
      title: 'Postfächer',
    },
    mcp: {
      allow: 'Erlauben',
      connected: (ago: string) => `Verbunden ${ago}`,
      copy: 'URL kopieren',
      defaultName: 'MCP-Client',
      deny: 'Ablehnen',
      description:
        'Sie können dein Briefing und deine Mails lesen, Antworten entwerfen und nach deiner Bestätigung senden.',
      disconnect: 'Trennen',
      paste:
        'Füge diese URL als Connector in deiner App hinzu und melde dich bei Fewmail an.',
      request: (app: string) => `${app} möchte dein Fewmail nutzen`,
      title: 'Claude, Cursor oder einen beliebigen MCP-Client verbinden',
    },
    signedInWithGoogle: 'Mit Google angemeldet',
    signOut: 'Abmelden',
    notifications: {
      blocked:
        'Benachrichtigungen sind blockiert. Erlaube sie in den Website-Einstellungen des Browsers.',
      browser: 'Dieser Browser',
      notConfigured:
        'Browser-Benachrichtigungen sind auf diesem Server nicht eingerichtet.',
      off: 'Erhalte dringende Mails und das tägliche Briefing hier, auch wenn Fewmail geschlossen ist.',
      on: 'Dringende Mails und das tägliche Briefing erscheinen hier. Mehrere auf einmal kommen als eine.',
      title: 'Benachrichtigungen',
      unsupported: 'Dieser Browser kann keine Benachrichtigungen anzeigen.',
    },
    telegram: {
      connect: 'Telegram verbinden',
      disconnect: 'Trennen',
      linked:
        'Dein Briefing kommt jeden Morgen, dringende Mails sofort. Gib Entwürfe direkt im Chat frei oder bearbeite sie.',
      notConfigured:
        'Der Telegram-Bot ist auf diesem Server nicht eingerichtet.',
      unlinked: 'Erhalte das Briefing und gib Entwürfe in Telegram frei.',
    },
    whatsapp: {
      connect: 'WhatsApp verbinden',
      disconnect: 'Trennen',
      linked:
        'Dein Briefing kommt jeden Morgen, dringende Mails sofort. Gib Entwürfe direkt im Chat frei oder bearbeite sie.',
      notConfigured:
        'Der WhatsApp-Bot ist auf diesem Server nicht eingerichtet.',
      unlinked: 'Erhalte das Briefing und gib Entwürfe in WhatsApp frei.',
    },
    title: 'Einstellungen',
  },
  spam: {
    reasonList: 'Auf einer öffentlichen Liste von Spammer-Domains',
    reasonPattern: {
      auth: 'Absender-Authentifizierung fehlgeschlagen: Die Adresse ist gefälscht',
      infra:
        'Aus einem Netzwerk gesendet, das mehrere Fewmail-Nutzer als Spam gemeldet haben',
      link: 'Links zu Seiten, die mehrere Fewmail-Nutzer als Spam gemeldet haben',
      signals:
        'Neue Domain, seltsame Adresse und schwache Authentifizierung zugleich',
      template:
        'Derselbe Text, den mehrere Fewmail-Nutzer als Spam gemeldet haben',
    },
    reasonCommunity: 'Von mehreren Fewmail-Nutzern als Spam gemeldet',
    reasonYou: 'Du hast diesen Absender als Spam gemeldet',
    suspect: 'Wirkt wie Spam',
  },
  starterRules: {
    alwaysShow:
      'Sicherheitswarnungen, fällige Rechnungen, alles von meiner Bank oder von Behörden',
    newsletters: 'Newsletter und Digests',
    notifications: 'Automatische Benachrichtigungen von Tools und Diensten',
    promotions: 'Angebote, Marketing und Kaltakquise-Mails',
    receipts: 'Belege, Bestell- und Versandbestätigungen',
  },
  telegram: {
    heard: (text: string) => `Verstanden: „${text}“`,
    voiceFailed:
      'Das konnte ich nicht verstehen. Versuch es noch mal oder schreib es.',
    help: 'Schreib oder sag, was du brauchst:\n• frag nach deiner Mail: „Wann verlängert sich Netflix?“\n• sag, was ich antworten soll: „Sag Anna, dass ich morgen unterschreibe“\n• antworte auf einen meiner Entwürfe, um ihn zu ändern',
    canceled: 'Abgebrochen. Der Entwurf ist wieder in deiner Warteschlange.',
    sendingIn: (seconds: number) => `Senden in ${seconds} s`,
    undo: 'Rückgängig',
    commands: { brief: 'Briefing von heute', queue: 'Was dich braucht' },
    connectFirst:
      'Öffne zuerst Fewmail → Einstellungen → Integrationen und tippe auf „Telegram verbinden“.',
    connected:
      'Verbunden. Ich schicke dir jeden Morgen dein Briefing und melde mich, wenn etwas Dringendes kommt.\n\n/brief: Briefing von heute\n/queue: was dich braucht',
    done: 'Erledigt',
    draft: 'Entwurf:',
    edit: 'Bearbeiten',
    editPrompt:
      'Schick mir den Text, der stattdessen verwendet werden soll, oder sag mir mit „/“ am Anfang, wie ich ihn ändern soll, z. B. „/förmlicher“.',
    newDraft: 'Neuer Entwurf:',
    nothing: 'Gerade braucht dich nichts.',
    proOnly:
      'Telegram ist Teil von Fewmail Pro. Öffne in Fewmail Einstellungen → Tarif, um zu upgraden.',
    draftClipped:
      'Hier gekürzt. „Senden“ verschickt den ganzen Entwurf – lies ihn in Fewmail.',
    rewriting: 'Schreibe neu…',
    send: 'Senden',
    sendThis: 'So senden',
    shorter: 'Kürzer',
    skip: 'Überspringen',
    skipped: 'Übersprungen',
    somethingWrong: 'Etwas ist schiefgelaufen',
    urgent: 'Dringend',
    willSend: 'Wird gesendet:',
  },
  today: {
    awaiting: 'Wartet auf Antwort',
    hint: {
      notNow: 'Nicht jetzt',
      setUp: 'Einrichten',
      turnOn: 'Einschalten',
    },
    later: (total: number, time: string) =>
      plural('de', total, {
        one: () => `Eine weitere kommt um ${time}`,
        other: (n) => `${n} weitere kommen um ${time}`,
      }),
    briefAt: (time: string) => `Briefing täglich um ${time}`,
    dates: 'Termine und Fristen',
    done: 'Erledigt',
    firstRead:
      'Ich lese die Mails der letzten drei Tage. Was dich braucht, erscheint hier von selbst.',
    handled: {
      spam: (n: number) => `${n} als Spam`,
      archived: (n: number) => `${n} archiviert`,
      markedRead: (n: number) => `${n} als gelesen markiert`,
      review: 'Ansehen',
      total: (n: number) => `${n} erledigt`,
      unsubscribed: (n: number) => `${n} abgemeldet`,
    },
    headline: (total: number) =>
      total === 0
        ? 'Alles ruhig.'
        : plural('de', total, {
            one: () => 'Eine Sache braucht dich.',
            other: (n) => `${n} Sachen brauchen dich.`,
          }),
    nothingNeedsYou:
      'Gerade braucht dich nichts. Neue Mails werden gelesen, sobald sie ankommen.',
    pulse: {
      lists: (n: number) => `${n} aus Newslettern`,
      people: (n: number) => `${n} von Menschen`,
      total: (total: number) =>
        plural('de', total, {
          one: (n) => `${n} E-Mail in den letzten 24 Stunden`,
          other: (n) => `${n} E-Mails in den letzten 24 Stunden`,
        }),
    },
    recent: 'Außerdem in den letzten 24 Stunden',
    sent: 'Gesendet',
    worthAttention: 'Einen Blick wert',
    writing: 'Schreibe…',
  },
  boards: {
    chart: {
      add: 'Diagramm hinzufügen',
      currency: 'Währung',
      edit: 'Diagramm-Einstellungen',
      empty: 'Noch nichts zu zeichnen',
      groupBy: 'Gruppiert nach',
      groupings: {
        group: 'Wer oder was',
        month: 'Monat',
        status: 'Status',
        week: 'Woche',
      },
      measure: 'Zeigt',
      measures: { count: 'Anzahl', sum: 'Gesamtbetrag' },
      other: 'Sonstiges',
      remove: 'Diagramm entfernen',
      skipped: (n: number) =>
        `Nicht gezählt: ${n} in anderer Währung oder ohne Betrag`,
      title: 'Diagrammtitel',
      type: 'Diagrammtyp',
      types: {
        area: 'Fläche',
        bar: 'Balken',
        line: 'Linie',
        pie: 'Kreis',
      },
      untitled: 'Neues Diagramm',
      weekOf: (date: string) => `Woche ab ${date}`,
    },
    charts: 'Diagramme',
    create: 'Board erstellen',
    delete: 'Board löschen',
    description: 'Was es sammelt',
    descriptionPlaceholder:
      'Reisen: Flüge, Hotels und Mietwagen, mit den Kosten',
    edit: 'Board bearbeiten',
    editHint:
      'Wenn du änderst, was es sammelt, werden die letzten sechs Monate neu gelesen.',
    empty: 'Noch leer. Passende E-Mails erscheinen hier, sobald sie ankommen.',
    entries: (total: number) =>
      plural('de', total, {
        one: () => 'Ein Eintrag',
        other: (n) => `${n} Einträge`,
      }),
    name: 'Name',
    namePlaceholder: 'Reisen',
    new: 'Neues Board',
    newHint:
      'Beschreibe in eigenen Worten, was gesammelt werden soll. Fewmail findet es in den Mails der letzten sechs Monate, wählt die Diagramme und hält alles aktuell.',
    planning: 'Wird eingerichtet…',
    readingHistory: 'Lese die Mails der letzten sechs Monate…',
    save: 'Speichern',
    starter: {
      events: {
        description:
          'Tickets, Reservierungen und Termine: wo ich sein muss, wann und mit wem.',
        name: 'Termine',
      },
      money: {
        description:
          'Zahlungen, Abos, Rechnungen und Erstattungen: wofür ich zahle, an wen und wie viel.',
        name: 'Geld',
      },
      orders: {
        description:
          'Online-Bestellungen und Lieferungen: was ich gekauft habe, bei wem und wo es gerade ist.',
        name: 'Bestellungen',
      },
      trips: {
        description:
          'Flüge, Züge, Hotels und Mietwagen: wohin ich reise, wann und was es kostet.',
        name: 'Reisen',
      },
    },
  },
  bulk: {
    badge: (n: number) => `An ${n}+ Fewmail-Nutzer gesendet`,
    reason: (n: number) =>
      `Massenmail: ${n}+ Fewmail-Nutzer haben denselben Text bekommen`,
  },
  cleanup: {
    emails: (total: number) =>
      plural('de', total, {
        one: () => '1 Mail',
        other: (n) => `${n} Mails`,
      }),
    reason: (total: number) => `${total} Mails diesen Monat, keine geöffnet`,
    title: (total: number) =>
      plural('de', total, {
        one: () => 'Einen Newsletter abbestellen, den du nie öffnest',
        other: (n) => `${n} Newsletter abbestellen, die du nie öffnest`,
      }),
  },
  commitments: {
    title: 'Du hast versprochen',
  },
  people: {
    firstContact: (date: string) => `Ihr schreibt seit ${date}`,
    lastContact: (date: string) => `Letzte Mail am ${date}`,
    open: 'Verlauf öffnen',
    promised: 'Du hast versprochen',
    threads: (total: number) =>
      plural('de', total, {
        one: () => '1 Unterhaltung',
        other: (n) => `${n} Unterhaltungen`,
      }),
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} steht auf einer öffentlichen Liste aktiver Phishing-Seiten. Keine Links öffnen, nicht anmelden, nichts bezahlen.`,
    lookalike_domain: (domain: string) =>
      `Sieht aus wie ${domain}, ist aber eine andere Adresse. Klick keine Links an und zahl nichts.`,
    new_sender_payment: (domain: string) =>
      `Erste Mail von ${domain}, und es geht um Geld. Prüf das über einen Weg, dem du schon vertraust.`,
    spoofed_sender: (domain: string) =>
      `Gibt vor, von ${domain} zu sein, aber ${domain} hat sie nicht gesendet. Klicke auf keine Links und zahle nichts.`,
    payment_change: (domain: string) =>
      `Neue Zahlungsdaten von ${domain}. Bestätige sie telefonisch, bevor du zahlst.`,
    title: 'Erst prüfen, dann handeln',
  },
  tasks: {
    active: (goal: string) => `Der Agent kümmert sich: ${goal}`,
    auto: 'Mails senden, ohne mich zu fragen',
    autoHint:
      'Jede Mail wartet trotzdem ein paar Sekunden, damit du sie zurücknehmen kannst.',
    cancel: 'Stoppen',
    done: 'Aufgabe erledigt',
    goal: 'Was soll der Agent erreichen?',
    goalPlaceholder:
      'z. B. Die Rechnung mit unserer neuen Adresse neu ausstellen lassen',
    handle: 'Darum kümmern…',
    next: 'Nächster Schritt',
    start: 'Starten',
    started: 'Der Agent kümmert sich darum.',
  },
  whatsapp: {
    connectFirst:
      'Öffne zuerst Fewmail → Einstellungen → Integrationen und tippe auf „WhatsApp verbinden“.',
    connected:
      'Verbunden. Ich schicke dir jeden Morgen dein Briefing und melde mich, wenn etwas Dringendes kommt. Schreib oder sprich eine Nachricht ein, um auf eine Mail zu antworten.',
    proOnly:
      'WhatsApp ist Teil von Fewmail Pro. Öffne in Fewmail Einstellungen → Tarif, um zu upgraden.',
  },
  zombie: {
    badge: (share: number) => `Ignoriert Abmeldungen bei ${share}% der Leute`,
    reason: 'Hat dir nach der Abmeldung weiter geschrieben',
  },
}
