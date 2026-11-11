import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const nl: Messages = {
  actionKind: {
    cleanup: 'Overal afmelden',
    commitment: 'Klaar',
    security: 'Gecontroleerd',
    task: 'Versturen',
    spam: 'Naar spam verplaatst',
    archive: 'Archiveren',
    follow_up: 'Opvolgen',
    mark_read: 'Markeer gelezen',
    pay: 'Betalen',
    read: 'Lezen',
    reply: 'Beantwoorden',
    schedule: 'Inplannen',
    trash: 'Naar prullenbak',
    unsubscribe: 'Afmelden',
  },
  actionStatus: {
    auto_done: 'gedaan door de agent',
    dismissed: 'overgeslagen',
    done: 'gedaan',
    failed: 'mislukt',
    pending: 'wacht in Vandaag',
  },
  agent: {
    chats: 'Chats',
    confirm: {
      approve_action: 'Deze actie uitvoeren?',
      archive_thread: 'Dit gesprek archiveren?',
      create_rule: 'Deze regel toevoegen?',
      handle_thread: 'Dit gesprek aan de agent overlaten?',
      reply: 'Dit antwoord versturen?',
      send_email: 'Deze e-mail versturen?',
      snooze_thread: 'Dit gesprek uitstellen?',
      unsubscribe: 'Afmelden bij deze afzender?',
    },
    decline: 'Nee',
    declined: 'Je zei nee',
    deleteChat: 'Chat verwijderen',
    failed: 'De agent kon het niet afmaken. Probeer het opnieuw.',
    lead: 'Vraag iets over je mail of zeg wat er moet gebeuren. Alles wat verstuurt of Gmail wijzigt, wacht op jouw ja.',
    leave: 'Agentmodus verlaten',
    newChat: 'Nieuwe chat',
    noChats: 'Nog geen chats',
    placeholder: 'Vraag iets over je mail of zeg wat er moet gebeuren…',
    retry: 'Opnieuw proberen',
    send: 'Versturen',
    steps: {
      approve_action: 'Uitvoeren',
      archive_thread: 'Archiveren',
      create_rule: 'Regel toevoegen',
      dismiss_action: 'Overslaan',
      draft_reply: 'Antwoord opstellen',
      get_board: 'Bord lezen',
      get_person: 'Persoon opzoeken',
      get_today: 'Vandaag bekijken',
      handle_thread: 'Gesprek overdragen',
      list_boards: 'Borden openen',
      list_mail: 'Mail doorzoeken',
      list_rules: 'Regels lezen',
      read_thread: 'Gesprek lezen',
      redraft_action: 'Concept herschrijven',
      refresh: 'Nieuwe mail ophalen',
      send_email: 'Versturen',
      snooze_thread: 'Uitstellen',
      unsubscribe: 'Afmelden',
    },
    stop: 'Stoppen',
    suggestions: [
      'Wat heeft vandaag mijn aandacht nodig?',
      'Wie wacht op mijn antwoord?',
      'Zijn er binnenkort rekeningen te betalen?',
      'Wat gebeurde er deze week in mijn mail?',
    ],
    thinking: 'Denken…',
    title: 'Wat kan ik voor je doen?',
    to: (recipients: string) => `Aan ${recipients}`,
    until: (time: string) => `Tot ${time}`,
    yes: {
      approve_action: 'Uitvoeren',
      archive_thread: 'Archiveren',
      create_rule: 'Toevoegen',
      handle_thread: 'Overlaten',
      reply: 'Versturen',
      send_email: 'Versturen',
      snooze_thread: 'Uitstellen',
      unsubscribe: 'Afmelden',
    },
  },
  ask: {
    label: (question: string) => `Vraag Fewmail: “${question}”`,
    thinking: 'Je mail doorzoeken…',
  },
  byRule: 'door een regel',
  boards: {
    chart: {
      add: 'Grafiek toevoegen',
      edit: 'Grafiekinstellingen',
      empty: 'Nog niets om te tekenen',
      groupBy: 'Gegroepeerd per',
      groupings: {
        group: 'Wie of wat',
        month: 'Maand',
        status: 'Status',
        week: 'Week',
      },
      measure: 'Toont',
      measures: { count: 'Aantal', sum: 'Totaalbedrag' },
      other: 'Overig',
      remove: 'Grafiek verwijderen',
      title: 'Titel van de grafiek',
      type: 'Soort grafiek',
      types: {
        area: 'Vlak',
        bar: 'Staven',
        line: 'Lijn',
        pie: 'Taart',
      },
      untitled: 'Nieuwe grafiek',
    },
    charts: 'Grafieken',
    create: 'Bord maken',
    delete: 'Bord verwijderen',
    description: 'Wat het verzamelt',
    descriptionPlaceholder:
      'Reizen: vluchten, hotels en huurauto’s, met wat ze kostten',
    edit: 'Bord bewerken',
    editHint:
      'Als je verandert wat het verzamelt, worden de afgelopen zes maanden opnieuw gelezen.',
    empty: 'Nog leeg. Passende e-mails verschijnen hier zodra ze binnenkomen.',
    entries: (total: number) =>
      plural('nl', total, {
        one: () => 'Eén item',
        other: (n) => `${n} items`,
      }),
    name: 'Naam',
    namePlaceholder: 'Reizen',
    new: 'Nieuw bord',
    newHint:
      'Beschrijf in je eigen woorden wat er verzameld moet worden. Fewmail zoekt het op in de mail van de afgelopen zes maanden, kiest de grafieken en houdt het bij.',
    planning: 'Bezig met instellen…',
    readingHistory: 'Mail van de afgelopen zes maanden lezen…',
    save: 'Opslaan',
    starter: {
      money: {
        description:
          'Betalingen, abonnementen, rekeningen en terugbetalingen: waarvoor ik betaal, aan wie en hoeveel.',
        name: 'Geld',
      },
    },
  },
  bulk: {
    badge: (n: number) => `Verstuurd naar ${n}+ Fewmail-gebruikers`,
    reason: (n: number) =>
      `Massamail: ${n}+ Fewmail-gebruikers kregen dezelfde tekst`,
  },
  category: {
    calendar: 'Agenda',
    finance: 'Financiën',
    newsletter: 'Nieuwsbrief',
    notification: 'Melding',
    other: 'Overig',
    person: 'Persoon',
    promotion: 'Aanbieding',
    receipt: 'Bon',
    security: 'Beveiliging',
    travel: 'Reizen',
    work: 'Werk',
  },
  cleanup: {
    emails: (total: number) =>
      plural('nl', total, {
        one: () => '1 e-mail',
        other: (n) => `${n} e-mails`,
      }),
    reason: (total: number) =>
      `${total} e-mails deze maand, geen enkele geopend`,
    title: (total: number) =>
      plural('nl', total, {
        one: () => 'Meld je af voor een nieuwsbrief die je nooit opent',
        other: (n) => `Meld je af voor ${n} nieuwsbrieven die je nooit opent`,
      }),
  },
  commitments: {
    title: 'Je hebt beloofd',
  },
  compose: {
    backInQueue: 'Geannuleerd. Het concept staat weer in Vandaag.',
    canceled: 'Geannuleerd. Je e-mail staat weer in de editor.',
    cc: 'Cc',
    discard: 'Verwerpen',
    forward: 'Doorsturen',
    forwardedMessage: 'Doorgestuurd bericht',
    from: 'Van',
    instructionPlaceholder: 'Hoe moet het klinken? (optioneel)',
    invalidRecipients: 'Voeg minstens één geldig e-mailadres toe.',
    later: {
      inHour: 'Over een uur',
      monday: 'Maandagochtend',
      tomorrow: 'Morgenochtend',
    },
    new: 'Nieuwe e-mail',
    placeholder: 'Schrijf je e-mail…',
    remind: {
      days: (total: number) =>
        plural('nl', total, {
          one: () => 'Herinner me als er na een dag geen antwoord is',
          other: (n) => `Herinner me als er na ${n} dagen geen antwoord is`,
        }),
      label: 'Herinner me',
      off: 'Geen herinnering',
    },
    reply: 'Beantwoorden',
    scheduledFor: (date: string) => `Gepland voor ${date}`,
    send: 'Versturen',
    sendLater: 'Later versturen',
    sendingIn: (seconds: number) => `Versturen over ${seconds} s`,
    subject: 'Onderwerp',
    to: 'Aan',
    undo: 'Ongedaan maken',
    writeForMe: 'Schrijf het voor me',
    writing: 'Schrijven…',
  },
  command: {
    compose: 'Nieuwe e-mail',
    agent: 'Agent',
    appearance: 'Weergave',
    checkMail: 'Nieuwe mail ophalen',
    goTo: 'Ga naar',
    inboxUpToDate: 'Inbox is bijgewerkt',
    mail: 'Mail',
    nothingMatches: 'Geen resultaten.',
    placeholder: 'Zoek in mail of voer een opdracht uit…',
    rewriteBrief: 'Overzicht opnieuw schrijven',
    searchFor: (query: string) => `Zoek in mail naar “${query}”`,
    teachRule: 'Nieuwe regel aanleren',
    upgrade: 'Overstappen op Pro',
    theme: {
      dark: 'Donker thema',
      light: 'Licht thema',
      system: 'Systeemthema volgen',
    },
  },
  composer: {
    acceptSuggestion: 'Tab om te accepteren',
    bold: 'Vet',
    bulletList: 'Opsomming',
    italic: 'Cursief',
    link: 'Link',
    linkPlaceholder: 'Plak of typ een link',
    noSnippets: 'Geen snippets gevonden.',
    removeLink: 'Link verwijderen',
  },
  importance: ['Ruis', 'Goed om te weten', 'Heeft je snel nodig', 'Dringend'],
  justNow: 'zojuist',
  keys: {
    reply: 'beantwoorden',
    snooze: 'uitstellen',
    anything: 'alles',
    approve: 'goedkeuren',
    archive: 'archiveren',
    close: 'sluiten',
    draftReply: 'concept',
    edit: 'bewerken',
    move: 'bewegen',
    open: 'openen',
    search: 'zoeken',
    send: 'versturen',
    skip: 'overslaan',
    stopEditing: 'stop bewerken',
  },
  legal: {
    privacy: 'Privacybeleid',
    englishOnly:
      'Dit document is beschikbaar in het Engels; dat is de bindende versie.',
    terms: 'Servicevoorwaarden',
    updated: (date: string) => `Laatst bijgewerkt op ${date}`,
  },
  login: {
    agree: ((slots) => [
      'Door verder te gaan ga je akkoord met de ',
      slots.terms,
      ' en het ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail vraagt toestemming om je Gmail te lezen, te ordenen en te versturen. Er wordt niets verstuurd of gearchiveerd zonder jouw akkoord, tenzij je een regel maakt die dat toestaat.',
    continue: 'Doorgaan met Google',
    lead: 'Fewmail leest je inbox voor je, antwoordt in jouw stijl en laat alleen zien wat jou echt nodig heeft.',
    messengers:
      'Werkt ook in messengers, te beginnen met Telegram: ontvang het overzicht, keur antwoorden goed of stuur gewoon een spraakbericht.',
    title: 'Alleen wat ertoe doet.',
  },
  mail: {
    unread: 'Ongelezen',
    block: 'Afzender blokkeren',
    blocked: 'Geblokkeerd. Hun mail gaat nu naar de prullenbak.',
    forward: 'Doorsturen',
    more: 'Meer',
    reply: 'Beantwoorden',
    trash: 'Naar prullenbak',
    trashed: 'Naar prullenbak verplaatst',
    movedToInbox: 'Terug in de inbox. Bedankt voor het melden.',
    noThread: 'Kies een e-mail om hem hier te lezen',
    notSpam: 'Geen spam',
    reportSpam: 'Spam melden',
    reportedSpam: 'Gemeld. Hun mail gaat nu naar spam.',
    archive: 'Archiveren',
    archived: 'Gearchiveerd',
    attachment: 'bijlage',
    draftReply: 'Antwoord opstellen',
    drafting: 'Opstellen…',
    draftWaiting: 'Concept wacht in Vandaag',
    due: (date: string) => `vervalt ${date}`,
    empty: 'Geen e-mails hier.',
    expectsReply: 'Verwacht antwoord',
    filter: {
      spam: 'Spam',
      inbox: 'Inbox',
      snoozed: 'Uitgesteld',
      important: 'Belangrijk',
      needs_reply: 'Te beantwoorden',
      quiet: 'Rustig',
    },
    instruction: 'Vertel de agent hoe te antwoorden, of druk gewoon op Enter',
    open: 'Openen',
    search: 'Zoek of beschrijf: facturen van Anna van vorige maand',
    openInGmail: 'Openen in Gmail',
    unsubscribe: 'Afmelden',
    unsubscribed: 'Afgemeld',
    unsubscribeFailed:
      'Deze afzender heeft geen afmelding met één klik, dus de e-mail is gearchiveerd.',
    you: 'Jij',
  },
  nav: {
    agent: 'Agent',
    boards: 'Borden',
    newBoard: 'Nieuw bord',
    mail: 'Mail',
    rules: 'Regels',
    search: 'Zoek of vraag…',
    settings: 'Instellingen',
    syncFailed: 'Gmail-synchronisatie mislukt, opnieuw proberen',
    syncing: 'Je inbox wordt gelezen…',
    today: 'Vandaag',
    trialLeft: (total: number) =>
      plural('nl', total, {
        one: () => 'Pro-proefperiode · nog 1 dag',
        other: (n) => `Pro-proefperiode · nog ${n} dagen`,
      }),
    watching: 'De agent houdt je inbox in de gaten',
  },
  notifications: {
    many: (total: number) =>
      plural('nl', total, {
        other: (n) => `${n} nieuwe meldingen van Fewmail`,
      }),
  },
  onboarding: {
    languageHint:
      'De app, overzichten, samenvattingen en uitleg gebruiken deze taal. Antwoorden volgen altijd de taal van de e-mail die je beantwoordt.',
    languageTitle: 'Welke taal moet Fewmail spreken?',
    lead: 'Twee snelle antwoorden. Je kunt alles later wijzigen in Instellingen.',
    personaTitle: 'Hoe gebruik je e-mail?',
    reading: 'Je inbox wordt gelezen…',
    start: 'Starten',
    title: 'Laten we je agent instellen.',
  },
  plan: {
    free: 'Gratis',
    freeDescription:
      'Snelle, rustige mail met eenvoudige regels. Gratis zo lang je wilt.',
    includes:
      'Pro voegt de agent toe: een dagelijkse briefing, elke e-mail gelezen en samengevat, antwoorden in jouw stijl, regels in gewone woorden, Telegram en MCP.',
    manage: 'Facturering beheren',
    price: (usd: number) => `$${usd} / maand`,
    pro: 'Pro',
    proCancels: (date: string) => `Pro tot ${date}, daarna Gratis.`,
    proRenews: (date: string) => `Wordt verlengd op ${date}.`,
    title: 'Abonnement',
    trial: 'Pro-proefperiode',
    trialDescription: (date: string) =>
      `Alle Pro-functies tot ${date}. Daarna blijft Fewmail gratis met eenvoudige regels — geen creditcard nodig.`,
    upgrade: 'Overstappen op Pro',
    welcome: 'Welkom bij Pro. De agent is weer aan het werk.',
  },
  people: {
    firstContact: (date: string) => `Mailt sinds ${date}`,
    lastContact: (date: string) => `Laatste e-mail ${date}`,
    open: 'Gesprekken openen',
    promised: 'Je hebt beloofd',
    threads: (total: number) =>
      plural('nl', total, {
        one: () => '1 gesprek',
        other: (n) => `${n} gesprekken`,
      }),
  },
  persona: {
    reader: {
      description:
        'Ik lees vooral. Houd mijn inbox rustig, handel de ruis af en zorg dat niets belangrijks me ontgaat.',
      title: 'Ik lees vooral',
    },
    responder: {
      description:
        'Ik antwoord veel. Zet mensen die op mij wachten bovenaan en stel antwoorden op in mijn stijl.',
      title: 'Ik antwoord veel',
    },
  },
  queue: {
    draftedInVoice: 'Opgesteld in jouw stijl',
    edit: 'Bewerken',
    open: 'Openen',
    send: 'Versturen',
    shorter: 'Korter',
    shorterInstruction: 'Maak het korter.',
    skip: 'Overslaan',
  },
  reminders: {
    followUp: 'Opvolgen',
    noReply: 'Nog geen antwoord',
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} staat op een openbare lijst van actieve phishingsites. Klik geen links, log niet in en betaal niet.`,
    lookalike_domain: (domain: string) =>
      `Lijkt op ${domain}, maar het is een ander adres. Klik niet op links en betaal niet.`,
    new_sender_payment: (domain: string) =>
      `Eerste e-mail van ${domain} en er wordt om geld gevraagd. Controleer het via een kanaal dat je al vertrouwt.`,
    spoofed_sender: (domain: string) =>
      `Lijkt van ${domain} te komen, maar ${domain} heeft dit niet verstuurd. Klik niet op links en betaal niet.`,
    payment_change: (domain: string) =>
      `Nieuwe betaalgegevens van ${domain}. Bevestig telefonisch voordat je betaalt.`,
    title: 'Controleer voordat je iets doet',
  },
  rules: {
    actWithoutAsking: 'Handelen zonder te vragen',
    add: 'Regel toevoegen',
    count: (total: number) =>
      plural('nl', total, {
        one: () => '1 regel',
        other: (n) => `${n} regels`,
      }),
    delete: 'Verwijderen',
    describe: {
      alwaysShow: 'Komt altijd in Vandaag',
      autonomous: 'Wordt zelf gedaan, staat bij afgehandeld',
      draft: 'Een concept wacht op je in Vandaag',
      suggested: 'Voorgesteld in Vandaag, jij bevestigt',
    },
    effect: {
      always_show: 'Altijd tonen',
      archive: 'Archiveren',
      draft_reply: 'Antwoord opstellen',
      mark_read: 'Markeren als gelezen',
      trash: 'Naar prullenbak',
      unsubscribe: 'Afmelden',
    },
    enabled: 'Regel ingeschakeld',
    lead: 'Vertel de agent in gewone woorden wat hij met bepaalde mail moet doen. Hij toetst elke e-mail aan deze regels, van boven naar beneden.',
    newTitle: 'Nieuwe regel aanleren',
    leadFree:
      'Archiveer, markeer als gelezen of meld je automatisch af. Regels werken op nieuwe mail zodra die binnenkomt.',
    placeholder: 'bijv. Facturen van Hetzner, of meldingen van LinkedIn',
    simple: {
      appliedAutomatically: 'Automatisch toegepast op nieuwe mail',
      field: {
        from: 'Van',
        mailingList: 'Elke mailinglijst',
        subject: 'Onderwerp bevat',
      },
      title: {
        from: (value: string) => `Van “${value}”`,
        mailingList: () => 'Elke mailinglijst',
        subject: (value: string) => `Onderwerp bevat “${value}”`,
      },
      valuePlaceholder: 'anna@example.com, een naam of een woord',
      whichField: 'Overeenkomst op',
    },
    title: 'Regels',
    whatAgentDoes: 'Wat de agent doet',
    whichEmails: 'Welke e-mails',
    withoutAsking: 'Zonder te vragen',
  },
  settings: {
    account: 'Account',
    agent: 'Agent',
    briefDescription: (timezone: string) => `In jouw tijdzone, ${timezone}`,
    briefTitle: 'Dagelijks overzicht',
    deleteAccount: 'Account verwijderen',
    deleteConfirm: 'Alles verwijderen',
    deleteDescription:
      'Verwijdert direct je account, gesynchroniseerde mail, concepten, regels en overzichten uit Fewmail. Je Gmail zelf blijft onaangeroerd.',
    deleteTitle: 'Je Fewmail-account verwijderen?',
    cancel: 'Annuleren',
    integrations: 'Integraties',
    knowledge: {
      description:
        'Prijzen, adressen, beschikbaarheid, hoe je graag antwoordt. De agent gebruikt het in concepten en automatisch aanvullen.',
      placeholder:
        'bijv. Advies kost $150/h. Op vrijdag neem ik niet op. Mijn adres is…',
      title: 'Wat de agent moet weten',
    },
    labels: {
      description:
        'Sorteer mail in Fewmail/…-labels zodat Gmail op je telefoon dezelfde volgorde toont.',
      title: 'Agentlabels in Gmail',
    },
    language: 'Taal',
    languageDescription:
      'App, overzichten en samenvattingen. Antwoorden volgen de e-mail.',
    legal: 'Juridisch',
    mailboxes: {
      add: 'Gmail toevoegen',
      addDescription:
        'Mail van een ander Gmail-account komt in hetzelfde Vandaag en dezelfde inbox. Er logt nooit iemand mee in: inloggen ermee opent een aparte Fewmail.',
      added: 'Mailbox toegevoegd. De mail verschijnt binnen een minuut.',
      failed:
        'De mailbox kon niet worden toegevoegd. Sta Gmail-toegang toe en probeer het opnieuw.',
      lost: 'Gmail-toegang is verloren. Voeg hem opnieuw toe om opnieuw te verbinden.',
      reading: 'Mail wordt gelezen…',
      remove: 'Verwijderen',
      signIn: 'Je logt hiermee in',
      signInChosen: 'Met dit account log je in. Kies een ander.',
      synced: (ago: string) => `Gesynchroniseerd ${ago}`,
      title: 'Mailboxen',
    },
    mcp: {
      copyNow:
        'Kopieer deze configuratie nu: de sleutel wordt maar één keer getoond.',
      create: 'Sleutel maken',
      defaultName: 'MCP-client',
      description:
        'Ze kunnen je overzicht en mail lezen, antwoorden opstellen en die versturen nadat jij bevestigt.',
      keyName: 'Naam sleutel',
      neverUsed: 'Nooit gebruikt',
      revoke: 'Intrekken',
      title: 'Koppel Claude, Cursor of een andere MCP-client',
      used: (ago: string) => `Gebruikt ${ago}`,
    },
    persona: 'Hoe je e-mail gebruikt',
    signedInWithGoogle: 'Ingelogd met Google',
    signOut: 'Uitloggen',
    snippets: {
      add: 'Snippet toevoegen',
      body: 'Tekst',
      delete: 'Verwijderen',
      description: 'Typ ; in de editor om een snippet op naam in te voegen.',
      name: 'Naam',
      title: 'Snippets',
    },
    notifications: {
      blocked:
        'Meldingen zijn geblokkeerd. Sta ze toe in de site-instellingen van de browser.',
      browser: 'Deze browser',
      notConfigured: 'Browsermeldingen zijn niet ingesteld op deze server.',
      off: 'Ontvang dringende mail en het dagelijkse overzicht hier, ook als Fewmail dicht is.',
      on: 'Dringende mail en het dagelijkse overzicht verschijnen hier. Meerdere tegelijk komen als één.',
      title: 'Meldingen',
      unsupported: 'Deze browser kan geen meldingen tonen.',
    },
    telegram: {
      connect: 'Telegram koppelen',
      disconnect: 'Ontkoppelen',
      linked:
        'Je overzicht komt elke ochtend, dringende mail meteen. Keur concepten goed en bewerk ze in de chat.',
      notConfigured: 'De Telegram-bot is niet ingesteld op deze server.',
      unlinked: 'Ontvang het overzicht en keur concepten goed via Telegram.',
    },
    whatsapp: {
      connect: 'WhatsApp koppelen',
      disconnect: 'Ontkoppelen',
      linked:
        'Je overzicht komt elke ochtend, dringende mail meteen. Keur concepten goed en bewerk ze in de chat.',
      notConfigured: 'De WhatsApp-bot is niet ingesteld op deze server.',
      unlinked: 'Ontvang het overzicht en keur concepten goed via WhatsApp.',
    },
    title: 'Instellingen',
  },
  snooze: {
    laterToday: 'Later vandaag',
    nextWeek: 'Volgende week',
    title: 'Uitstellen',
    tomorrow: 'Morgen',
    unsnooze: 'Terug naar inbox',
    until: (date: string) => `Uitgesteld tot ${date}`,
    weekend: 'Dit weekend',
  },
  spam: {
    reasonList: 'Op een openbare lijst van spamdomeinen',
    reasonPattern: {
      auth: 'Afzenderverificatie mislukt: het adres is vervalst',
      infra:
        'Verstuurd vanaf een netwerk dat meerdere Fewmail-gebruikers als spam hebben gemeld',
      link: 'Links naar sites die meerdere Fewmail-gebruikers als spam hebben gemeld',
      signals: 'Nieuw domein, vreemd adres en zwakke verificatie tegelijk',
      template:
        'Dezelfde tekst die meerdere Fewmail-gebruikers als spam hebben gemeld',
    },
    reasonCommunity: 'Door meerdere Fewmail-gebruikers als spam gemeld',
    reasonYou: 'Je hebt deze afzender als spam gemeld',
    suspect: 'Lijkt op spam',
  },
  starterRules: {
    alwaysShow:
      'Beveiligingsmeldingen, rekeningen die betaald moeten worden, alles van mijn bank of de overheid',
    newsletters: 'Nieuwsbrieven en digests',
    notifications: 'Automatische meldingen van tools en diensten',
    people:
      'E-mails van echte mensen die me iets vragen of op mijn antwoord wachten',
    promotions: 'Aanbiedingen, marketing en ongevraagde verkoopmails',
    receipts: 'Bonnen, bestel- en verzendbevestigingen',
  },
  tasks: {
    active: (goal: string) => `De agent is ermee bezig: ${goal}`,
    auto: 'E-mails versturen zonder te vragen',
    autoHint:
      'Elke e-mail wacht nog steeds een paar seconden zodat je hem kunt terugdraaien.',
    cancel: 'Stoppen',
    done: 'Taak klaar',
    goal: 'Wat moet de agent bereiken?',
    goalPlaceholder:
      'bijv. De factuur opnieuw laten sturen met ons nieuwe adres',
    handle: 'Regel dit…',
    next: 'Volgende stap',
    start: 'Starten',
    started: 'De agent is ermee bezig.',
  },
  telegram: {
    heard: (text: string) => `Gehoord: “${text}”`,
    voiceFailed: 'Ik kon het niet verstaan. Probeer het opnieuw of typ het.',
    help: 'Schrijf of zeg wat je nodig hebt:\n• vraag iets over je mail: ‘wanneer verlengt Netflix?’\n• zeg wat ik moet antwoorden: ‘zeg Anna dat ik morgen teken’\n• antwoord op een van mijn concepten om het aan te passen',
    canceled: 'Geannuleerd. Het concept staat weer in je wachtrij.',
    sendingIn: (seconds: number) => `Versturen over ${seconds} s`,
    undo: 'Ongedaan maken',
    commands: { brief: 'Overzicht van vandaag', queue: 'Wat jou nodig heeft' },
    connectFirst:
      'Open eerst Fewmail → Instellingen → Integraties en tik op “Telegram koppelen”.',
    connected:
      'Gekoppeld. Ik stuur je elke ochtend je overzicht en laat het weten als er iets dringends binnenkomt.\n\n/brief — overzicht van vandaag\n/queue — wat jou nodig heeft',
    done: 'Klaar',
    draft: 'Concept:',
    edit: 'Bewerken',
    editPrompt:
      'Stuur me de tekst die ik moet gebruiken, of zeg hoe ik het moet aanpassen, beginnend met “/”, bijv. “/formeler”.',
    newDraft: 'Nieuw concept:',
    nothing: 'Er is nu niets dat jou nodig heeft.',
    proOnly:
      'Telegram is onderdeel van Fewmail Pro. Open Instellingen → Abonnement in Fewmail om over te stappen.',
    queueHint: '/queue — wat jou nodig heeft',
    rewriting: 'Herschrijven…',
    send: 'Versturen',
    sendThis: 'Dit versturen',
    shorter: 'Korter',
    skip: 'Overslaan',
    skipped: 'Overgeslagen',
    somethingWrong: 'Er ging iets mis',
    urgent: 'Dringend',
    willSend: 'Ik verstuur:',
  },
  today: {
    hint: {
      notNow: 'Niet nu',
      setUp: 'Instellen',
      turnOn: 'Inschakelen',
    },
    later: (total: number, time: string) =>
      plural('nl', total, {
        one: () => `Nog één komt om ${time}`,
        other: (n) => `Nog ${n} komen om ${time}`,
      }),
    briefArrives: (time: string) => `Je overzicht komt elke dag om ${time}.`,
    briefFrom: (time: string) => `overzicht van ${time}`,
    done: 'Klaar',
    firstRead:
      'Ik lees je mail van de afgelopen drie dagen. Wat jou nodig heeft, verschijnt hier vanzelf.',
    handled: {
      spam: (n: number) => `${n} naar spam`,
      archived: (n: number) => `${n} gearchiveerd`,
      markedRead: (n: number) => `${n} als gelezen gemarkeerd`,
      review: 'Bekijken',
      total: (n: number) => `${n} afgehandeld`,
      unsubscribed: (n: number) => `${n} afgemeld`,
    },
    headline: (total: number) =>
      total === 0
        ? 'Alles rustig.'
        : plural('nl', total, {
            one: () => 'Eén ding heeft je nodig.',
            other: (n) => `${n} dingen hebben je nodig.`,
          }),
    nothingNeedsYou:
      'Er is nu niets dat jou nodig heeft. Nieuwe mail wordt gelezen zodra die binnenkomt.',
    sent: 'Verstuurd',
    waitingOnYou: 'Wacht op jou',
    worthAttention: 'Verdient je aandacht',
    writeNow: 'Nu schrijven',
    writing: 'Schrijven…',
  },
  whatsapp: {
    connectFirst:
      'Open eerst Fewmail → Instellingen → Integraties en tik op “WhatsApp koppelen”.',
    connected:
      'Gekoppeld. Ik stuur je elke ochtend het overzicht en laat het weten als er iets dringends binnenkomt. Stuur tekst of een spraakbericht om op een e-mail te antwoorden.',
    proOnly:
      'WhatsApp is onderdeel van Fewmail Pro. Open Instellingen → Abonnement in Fewmail om over te stappen.',
  },
  zombie: {
    badge: (share: number) => `Negeert afmeldingen bij ${share}% van de mensen`,
    reason: 'Bleef mailen nadat je je had afgemeld',
  },
}
