import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const de: Messages = {
  ask: {
    label: (question: string) => `Fewmail fragen: „${question}“`,
    thinking: 'Durchsuche deine Mails…',
  },
  compose: {
    backInQueue: 'Abgebrochen. Der Entwurf ist wieder in Heute.',
    canceled: 'Abgebrochen. Deine E-Mail ist wieder im Editor.',
    cc: 'Cc',
    discard: 'Verwerfen',
    forward: 'Weiterleiten',
    forwardedMessage: 'Weitergeleitete Nachricht',
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
    subscription: 'Verstanden',
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
    checkMail: 'Auf neue Mails prüfen',
    goTo: 'Gehe zu',
    inboxUpToDate: 'Posteingang ist aktuell',
    mail: 'Mail',
    nothingMatches: 'Keine Treffer.',
    placeholder: 'Mails durchsuchen oder Befehl ausführen…',
    rewriteBrief: 'Briefing neu schreiben',
    searchFor: (query: string) => `Mails nach „${query}“ durchsuchen`,
    upgrade: 'Auf Pro upgraden',
    teachRule: 'Neue Regel beibringen',
    theme: {
      dark: 'Dunkles Design',
      light: 'Helles Design',
      system: 'Wie das System',
    },
  },
  importance: ['Rauschen', 'Gut zu wissen', 'Braucht dich bald', 'Dringend'],
  keys: {
    reply: 'antworten',
    snooze: 'zurückstellen',
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
  login: {
    agree: ((slots) => [
      'Wenn du fortfährst, stimmst du den ',
      slots.terms,
      ' und der ',
      slots.privacy,
      ' zu.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail bittet darum, Gmail für dich zu lesen, zu ordnen und zu senden. Ohne dein Okay wird nichts gesendet und nichts archiviert, außer du legst eine Regel an, die es erlaubt.',
    continue: 'Weiter mit Google',
    lead: 'Fewmail liest deinen Posteingang für dich, antwortet in deinem Ton und zeigt dir nur, was dich wirklich braucht.',
    messengers:
      'Funktioniert auch in Messengern, zuerst in Telegram: Briefing lesen, Antworten freigeben oder einfach eine Sprachnachricht schicken.',
    title: 'Nur, was zählt.',
  },
  mail: {
    block: 'Absender blockieren',
    blocked: 'Blockiert. Ihre Mails landen jetzt im Papierkorb.',
    forward: 'Weiterleiten',
    more: 'Mehr',
    reply: 'Antworten',
    trash: 'In den Papierkorb',
    trashed: 'In den Papierkorb verschoben',
    movedToInbox: 'Zurück im Posteingang. Danke für den Hinweis.',
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
    empty: 'Hier sind keine Mails.',
    expectsReply: 'Erwartet Antwort',
    filter: {
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
    search: 'Mit Gmail-Syntax suchen: from:anna has:attachment',
    openInGmail: 'In Gmail öffnen',
    unsubscribe: 'Abmelden',
    unsubscribed: 'Abgemeldet',
    unsubscribeFailed:
      'Dieser Absender bietet keine Abmeldung per Klick, daher wurde die Mail archiviert.',
    you: 'Du',
  },
  nav: {
    money: 'Geld',
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
    watching: 'Der Agent behält deinen Posteingang im Blick',
  },
  onboarding: {
    languageHint:
      'App, Briefings, Zusammenfassungen und Erklärungen nutzen diese Sprache. Antworten folgen immer der Sprache der Mail, auf die du antwortest.',
    languageTitle: 'Welche Sprache soll Fewmail sprechen?',
    lead: 'Zwei kurze Antworten. Du kannst alles später in den Einstellungen ändern.',
    personaTitle: 'Wie nutzt du E-Mail?',
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
    pro: 'Pro',
    proCancels: (date: string) => `Pro bis ${date}, danach Free.`,
    proRenews: (date: string) => `Verlängert sich am ${date}.`,
    title: 'Tarif',
    trial: 'Pro-Testphase',
    trialDescription: (date: string) =>
      `Alle Pro-Funktionen bis ${date}. Danach bleibt Fewmail mit einfachen Regeln kostenlos – keine Karte nötig.`,
    upgrade: 'Auf Pro upgraden',
    welcome: 'Willkommen bei Pro. Der Agent ist wieder im Einsatz.',
  },
  persona: {
    reader: {
      description:
        'Ich lese vor allem. Halte meinen Posteingang ruhig, kümmere dich um das Rauschen und lass nichts Wichtiges durchrutschen.',
      title: 'Ich lese vor allem',
    },
    responder: {
      description:
        'Ich antworte viel. Zeig mir zuerst, wer auf mich wartet, und entwirf Antworten in meinem Ton.',
      title: 'Ich antworte viel',
    },
  },
  queue: {
    draftedInVoice: 'In deinem Ton entworfen',
    edit: 'Bearbeiten',
    open: 'Öffnen',
    send: 'Senden',
    shorter: 'Kürzer',
    shorterInstruction: 'Mach es kürzer.',
    skip: 'Überspringen',
  },
  rules: {
    actWithoutAsking: 'Ohne Nachfrage handeln',
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
      suggested: 'Wird in Heute vorgeschlagen, du bestätigst',
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
    withoutAsking: 'Ohne Nachfrage',
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
    mcp: {
      copyNow:
        'Kopiere die Konfiguration jetzt: Der Schlüssel wird nur einmal angezeigt.',
      create: 'Schlüssel erstellen',
      defaultName: 'MCP-Client',
      description:
        'Sie können dein Briefing und deine Mails lesen, Antworten entwerfen und nach deiner Bestätigung senden.',
      keyName: 'Name des Schlüssels',
      neverUsed: 'Nie verwendet',
      revoke: 'Widerrufen',
      title: 'Claude, Cursor oder einen beliebigen MCP-Client verbinden',
      used: (ago: string) => `Verwendet ${ago}`,
    },
    persona: 'Wie du E-Mail nutzt',
    signedInWithGoogle: 'Mit Google angemeldet',
    signOut: 'Abmelden',
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
    people:
      'Mails von echten Menschen, die mir eine Frage stellen oder auf meine Antwort warten',
    promotions: 'Angebote, Marketing und Kaltakquise-Mails',
    receipts: 'Belege, Bestell- und Versandbestätigungen',
  },
  telegram: {
    heard: (text: string) => `Verstanden: „${text}“`,
    voiceFailed:
      'Das konnte ich nicht verstehen. Versuch es noch mal oder schreib es.',
    whichEmail:
      'Welche Mail? Antworte auf eine meiner Nachrichten und schreib, was ich sagen soll.',
    canceled: 'Abgebrochen. Der Entwurf ist wieder in deiner Warteschlange.',
    sendingIn: (seconds: number) => `Senden in ${seconds} s`,
    undo: 'Rückgängig',
    commands: { brief: 'Briefing von heute', queue: 'Was dich braucht' },
    connectFirst:
      'Öffne zuerst Fewmail → Einstellungen → Integrationen und tippe auf „Telegram verbinden“.',
    connected:
      'Verbunden. Ich schicke dir jeden Morgen dein Briefing und melde mich, wenn etwas Dringendes kommt.\n\n/brief — Briefing von heute\n/queue — was dich braucht',
    done: 'Erledigt',
    draft: 'Entwurf:',
    edit: 'Bearbeiten',
    editPrompt:
      'Schick mir den Text, der stattdessen verwendet werden soll, oder sag mir mit „/“ am Anfang, wie ich ihn ändern soll, z. B. „/förmlicher“.',
    newDraft: 'Neuer Entwurf:',
    nothing: 'Gerade braucht dich nichts.',
    proOnly:
      'Telegram ist Teil von Fewmail Pro. Öffne in Fewmail Einstellungen → Tarif, um zu upgraden.',
    queueHint: '/queue — was dich braucht',
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
    later: (total: number, time: string) =>
      plural('de', total, {
        one: () => `Eine weitere kommt um ${time}`,
        other: (n) => `${n} weitere kommen um ${time}`,
      }),
    briefArrives: (time: string) => `Dein Briefing kommt jeden Tag um ${time}.`,
    briefFrom: (time: string) => `Briefing von ${time}`,
    done: 'Erledigt',
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
    sent: 'Gesendet',
    waitingOnYou: 'Wartet auf dich',
    worthAttention: 'Einen Blick wert',
    writeNow: 'Jetzt schreiben',
    writing: 'Schreibe…',
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
  money: {
    due: (date: string) => `Fällig am ${date}`,
    empty:
      'Noch nichts. Belege, Rechnungen und Abos erscheinen hier, sobald sie ankommen.',
    lastCharged: (date: string) => `Zuletzt abgebucht am ${date}`,
    lead: 'Alles, was Fewmail in deinen Belegen und Rechnungen gefunden hat.',
    monthlyTotal: 'Jeden Monat für Abos',
    period: { month: 'monatlich', week: 'wöchentlich', year: 'jährlich' },
    priceUp: (merchant: string, from: string, to: string) =>
      `${merchant} kostet jetzt ${to} (vorher ${from})`,
    priceUpTitle: (merchant: string) => `${merchant} ist teurer geworden`,
    recent: 'Letzte Käufe',
    subscriptions: 'Abos',
    title: 'Geld',
    upcoming: 'Fällige Rechnungen',
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
