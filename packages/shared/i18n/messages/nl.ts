import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const nl: Messages = {
  actionDone: {
    commitment: 'Klaar',
    confirm: 'Bevestigd',
    follow_up: 'Opgevolgd',
    pay: 'Betaald',
    read: 'Gelezen',
    renew: 'Verlengd',
    schedule: 'Ingepland',
    security: 'Gecontroleerd',
    sign: 'Ondertekend',
  },
  actionLink: {
    confirm: 'Bevestigen',
    pay: 'Betalen',
    read: 'Lezen',
    renew: 'Verlengen',
    sign: 'Ondertekenen',
  },
  actionKind: {
    cleanup: 'Overal afmelden',
    consent: 'Goedkeuren',
    commitment: 'Beloofd',
    security: 'Controleren',
    spam: 'Naar spam',
    archive: 'Archiveren',
    follow_up: 'Opvolgen',
    mark_read: 'Markeer gelezen',
    pay: 'Betalen',
    read: 'Het lezen waard',
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
    pending: 'wacht op Home',
  },
  agent: {
    decideOnHome: 'Beslis op Home',
    fromAgent: 'De agent vraagt',
    mcpAsks: (client: string) => `${client} vraagt via MCP`,
    calendar: (email: string) => `In de agenda van ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      dismiss_action: 'Deze kaart overslaan?',
      delete_board: 'Dit bord met alles erop verwijderen?',
      create_event: 'Deze afspraak toevoegen?',
      delete_event: 'Deze afspraak verwijderen?',
      update_event: 'Deze afspraak wijzigen?',
      approve_action: 'Deze actie uitvoeren?',
      archive_thread: 'Dit gesprek archiveren?',
      clear_out: 'Deze groepen mail uit je inbox opruimen?',
      undo_clear_out: 'Alle opgeruimde mail terug naar de inbox?',
      create_rule: 'Deze regel toevoegen?',
      reply: 'Dit antwoord versturen?',
      send_email: 'Deze e-mail versturen?',
      snooze_thread: 'Dit gesprek uitstellen?',
      unsubscribe: 'Afmelden bij deze afzender?',
      tidy_mail: 'Deze rustige e-mails opruimen?',
      trash_thread: 'Deze thread naar de prullenbak verplaatsen?',
      report_spam: 'Deze afzender als spam melden?',
      mark_not_spam: 'Deze thread uit spam halen?',
      move_to_inbox: 'Deze thread terugzetten naar de inbox?',
    },
    retry: 'Opnieuw proberen',
    steps: {
      create_event: 'Afspraak toevoegen',
      delete_event: 'Afspraak verwijderen',
      list_events: 'Agenda bekijken',
      update_event: 'Afspraak wijzigen',
      list_subscriptions: 'Abonnementen bekijken',
      approve_action: 'Uitvoeren',
      archive_thread: 'Archiveren',
      get_reading: 'Nieuwsbrieven lezen',
      get_wrapped: 'Ik tel je mail',
      clear_out: 'Inbox opruimen',
      preview_clear_out: 'Hele inbox lezen',
      undo_clear_out: 'Opgeruimde mail terugzetten',
      create_rule: 'Regel toevoegen',
      dismiss_action: 'Overslaan',
      draft_reply: 'Antwoord opstellen',
      create_draft: 'Concept wordt opgeslagen',
      find_people: 'Adres zoeken',
      get_board: 'Bord lezen',
      get_person: 'Persoon opzoeken',
      get_today: 'Vandaag bekijken',
      list_boards: 'Borden openen',
      list_handled: 'Afgehandelde mail bekijken',
      list_mail: 'Mail doorzoeken',
      list_rules: 'Regels lezen',
      read_thread: 'Gesprek lezen',
      redraft_action: 'Concept herschrijven',
      refresh: 'Nieuwe mail ophalen',
      send_email: 'Versturen',
      snooze_thread: 'Uitstellen',
      unsubscribe: 'Afmelden',
      tidy_mail: 'Opruimen',
      trash_thread: 'Naar de prullenbak verplaatsen',
      report_spam: 'Spam melden',
      mark_not_spam: 'Uit spam halen',
      move_to_inbox: 'Naar de inbox verplaatsen',
      create_board: 'Bord maken',
      update_board: 'Bord aanpassen',
      delete_board: 'Bord verwijderen',
      add_board_chart: 'Grafiek toevoegen',
      add_to_board: 'Op het bord zetten',
      edit_board_entry: 'Item corrigeren',
      remove_board_entry: 'Van het bord halen',
      rename_board_group: 'Groep hernoemen',
    },
    to: (recipients: string) => `Aan ${recipients}`,
    until: (time: string) => `Tot ${time}`,
    yes: {
      dismiss_action: 'Overslaan',
      delete_board: 'Verwijderen',
      create_event: 'Toevoegen',
      delete_event: 'Verwijderen',
      update_event: 'Opslaan',
      approve_action: 'Uitvoeren',
      archive_thread: 'Archiveren',
      clear_out: 'Opruimen',
      undo_clear_out: 'Terugzetten',
      create_rule: 'Toevoegen',
      reply: 'Versturen',
      send_email: 'Versturen',
      snooze_thread: 'Uitstellen',
      unsubscribe: 'Afmelden',
      tidy_mail: 'Opruimen',
      trash_thread: 'Naar prullenbak',
      report_spam: 'Spam melden',
      mark_not_spam: 'Geen spam',
      move_to_inbox: 'Terugzetten',
    },
  },
  ask: {
    label: (question: string) => `Vraag Fewmail: “${question}”`,
    thinking: 'Je mail doorzoeken…',
  },
  byRule: 'door een regel',
  boards: {
    chartRemoved: 'Grafiek verwijderd',
    addTo: 'Aan bord toevoegen',
    added: (board: string) => `Op ${board} gezet`,
    cancel: 'Annuleren',
    chart: {
      add: 'Grafiek toevoegen',
      ask: 'Beschrijf de grafiek',
      askPlaceholder: 'Uitgaven per winkel, bestellingen per status…',
      currency: 'Valuta',
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
      moveEarlier: 'Naar voren',
      moveLater: 'Naar achteren',
      other: 'Overig',
      remove: 'Grafiek verwijderen',
      skipped: (n: number) =>
        `Niet meegeteld: ${n} in een andere valuta of zonder bedrag`,
      title: 'Titel van de grafiek',
      type: 'Soort grafiek',
      types: {
        area: 'Vlak',
        bar: 'Staven',
        line: 'Lijn',
        pie: 'Taart',
      },
      untitled: 'Nieuwe grafiek',
      weekOf: (date: string) => `Week van ${date}`,
    },
    charts: 'Grafieken',
    create: 'Bord maken',
    delete: 'Bord verwijderen',
    deleteConfirm: (name: string) => `“${name}” verwijderen?`,
    deleteHint: 'De items en grafieken gaan mee. Je mail blijft waar hij is.',
    describe: 'Aanpassen wat het verzamelt',
    description: 'Wat het verzamelt',
    descriptionPlaceholder:
      'Reizen: vluchten, hotels en huurauto’s, met wat ze kostten',
    due: (when: string) => `Binnenkort: ${when}`,
    empty: 'Nog leeg. Passende e-mails verschijnen hier zodra ze binnenkomen.',
    entries: (total: number) =>
      plural('nl', total, {
        one: () => 'Eén item',
        other: (n) => `${n} items`,
      }),
    entry: {
      edited: 'Door jou bewerkt',
      nextOn: (date: string) => `volgende: ${date}`,
      remove: 'Niet op dit bord',
      removed: 'Van het bord gehaald. Het leert ervan.',
    },
    expected: (when: string) => `Verwacht ${when}`,
    filter: {
      clear: 'Filter wissen',
      nothing: 'Geen items gevonden.',
      search: 'Items zoeken',
    },
    groups: {
      every: {
        month: 'elke maand',
        quarter: 'elk kwartaal',
        week: 'elke week',
        year: 'elk jaar',
      },
      expected: (date: string) => `verwacht ${date}`,
      next: (date: string) => `volgende: ${date}`,
      perMonth: (amount: string) => `${amount} / maand`,
      rename: 'Groep hernoemen',
      renameHint:
        'Geef hem de naam van een andere groep om ze samen te voegen.',
      showAll: (n: number) => `Alle ${n} tonen`,
      showFewer: 'Minder tonen',
      title: 'Per wie of wat',
    },
    history: {
      capped: (n: number) =>
        `De nieuwste ${n} passende e-mails van de periode gelezen.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Mail van de periode doorzoeken…'
          : `${plural('nl', found, { one: () => 'Eén e-mail', other: (n) => `${n} e-mails` })} lezen · tot nu toe ${plural('nl', entries, { one: () => 'één item', other: (n) => `${n} items` })}`,
    },
    menu: 'Bordacties',
    moveDown: 'Omlaag',
    moveUp: 'Omhoog',
    name: 'Naam',
    namePlaceholder: 'Reizen',
    new: 'Nieuw bord',
    newHint:
      'Beschrijf in je eigen woorden wat er verzameld moet worden. Fewmail zoekt het op in je mail zo ver terug als je kiest, kiest de grafieken en houdt het bij.',
    period: 'Periode',
    periods: {
      1: 'Afgelopen dag',
      7: 'Afgelopen week',
      30: 'Afgelopen maand',
      90: 'Afgelopen 3 maanden',
      180: 'Afgelopen 6 maanden',
      365: 'Afgelopen jaar',
    },
    planning: 'Bezig met instellen…',
    redescribe: 'Opslaan en opnieuw lezen',
    redescribeHint:
      'Leest de periode opnieuw met de nieuwe beschrijving. Items die je bewerkte of weghaalde blijven.',
    rename: 'Bord hernoemen',
    save: 'Opslaan',
    settings: {
      bannerDays: 'Seintje vóór een datum',
      days: (n: number) =>
        plural('nl', n, {
          one: () => '1 dag van tevoren',
          other: (count) => `${count} dagen van tevoren`,
        }),
      hint: 'Hoe ver het bord terug verzamelt en wanneer het je vóór een datum waarschuwt.',
      never: 'Nooit',
      title: 'Bordinstellingen',
    },
    starter: {
      events: {
        description:
          'Tickets, reserveringen en afspraken: waar ik moet zijn, wanneer en met wie.',
        name: 'Afspraken',
      },
      health: {
        description:
          'Doktersafspraken, recepten, uitslagen en declaraties: bij wie ik was, wanneer en wat het kostte.',
        name: 'Gezondheid',
      },
      home: {
        description:
          'Huur, energie, reparaties en contracten voor mijn woning: wat er betaald moet worden, aan wie en hoeveel.',
        name: 'Wonen',
      },
      invoices: {
        description:
          'Facturen die ik voor werk verstuur en ontvang: klant of leverancier, bedrag, vervaldatum en of hij betaald is.',
        name: 'Facturen',
      },
      jobs: {
        description:
          'Sollicitaties, gesprekken en aanbiedingen: welk bedrijf, welke functie en hoe ver elke staat.',
        name: 'Sollicitaties',
      },
      learning: {
        description:
          'Cursussen, lessen en mail van school of studie: deadlines, cijfers, certificaten en wat ze kosten.',
        name: 'Leren',
      },
      money: {
        description:
          'Betalingen, abonnementen, rekeningen en terugbetalingen: waarvoor ik betaal, aan wie, hoeveel en wanneer het verlengt.',
        name: 'Financiën',
      },
      orders: {
        description:
          'Online bestellingen en leveringen: wat ik kocht, bij wie en waar het nu is.',
        name: 'Bestellingen',
      },
      trips: {
        description:
          'Vluchten, treinen, hotels en huur: waar ik heen ga, wanneer en wat het kost.',
        name: 'Reizen',
      },
    },
    summary: {
      lastMonth: 'Vorige maand',
      perMonth: (amount: string) => `${amount} per maand`,
      recurring: (n: number) =>
        plural('nl', n, {
          one: () => 'Eén terugkerend',
          other: (count) => `${count} terugkerend`,
        }),
      thisMonth: 'Deze maand',
      upcoming: 'Komende 30 dagen',
    },
  },
  bulk: {
    badge: (n: number) => `Verstuurd naar ${n}+ Fewmail-gebruikers`,
    reason: (n: number) =>
      `Massamail: ${n}+ Fewmail-gebruikers kregen dezelfde tekst`,
  },
  calendar: {
    tomorrow: 'Morgen',
    noAccess: {
      allow: 'Toegang geven',
      description:
        'Google mocht je agenda niet met Fewmail delen. Sta het toe om hier afspraken te zien en toe te voegen.',
      title: 'Agenda niet verbonden',
    },
    allDay: 'Hele dag',
    calendar: 'Agenda',
    create: 'Afspraak toevoegen',
    delete: 'Verwijderen',
    deleted: 'Afspraak verwijderd',
    description: 'Beschrijving',
    editEvent: 'Afspraak bewerken',
    endBeforeStart: 'De afspraak eindigt voordat hij begint',
    ends: 'Eindigt',
    location: 'Locatie',
    newEvent: 'Nieuwe afspraak',
    next: 'Volgende',
    openInGoogle: 'Openen in Google Agenda',
    previous: 'Vorige',
    save: 'Opslaan',
    saved: 'Afspraak opgeslagen',
    scope: {
      this: 'Alleen deze afspraak',
      following: 'Deze en volgende afspraken',
      all: 'Alle afspraken',
    },
    starts: 'Begint',
    title: 'Agenda',
    titlePlaceholder: 'Titel toevoegen',
    today: 'Vandaag',
    untitled: '(Geen titel)',
    views: {
      day: 'Dag',
      week: 'Week',
      month: 'Maand',
      year: 'Jaar',
    },
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
  clearOut: {
    partial:
      'Gmail heeft een deel van het opruimen gestopt. Wat al verplaatst is, kan terug.',
    groups: {
      lists: 'Nieuwsbrieven die je nooit opent',
      notifications: 'Gelezen meldingen, ouder dan een maand',
      old: 'Alles ouder dan een jaar',
      promotions: 'Reclame en sociaal, ouder dan 3 dagen',
    },
    done: (emails: string) => `${emails} opgeruimd`,
    empty: 'Niets op te ruimen: de inbox is al op orde.',
    lead: (emails: string) => `${emails} in de inbox. Dit kan weg.`,
    leadCapped: (emails: string) =>
      `Meer dan ${emails} in de inbox. Dit kan weg.`,
    left: (emails: string) => `${emails} blijven in de inbox`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} en nog ${more}` : names,
    run: (emails: string) => `${emails} opruimen`,
    safe: 'Er wordt niets verwijderd. Opgeruimde mail gaat naar het archief met het label Fewmail/Cleared en komt met één klik terug; van nieuwsbrieven word je ook afgemeld.',
    scanning: 'Ik lees de hele inbox, alleen de kopregels. Tot een minuut.',
    title: 'Inbox opruimen',
    undo: 'Alles terugzetten',
    undone: (emails: string) => `${emails} terug in de inbox`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `Drukste dag: ${day} · drukste uur: ${hours}`,
    copied: 'Link gekopieerd',
    copyLink: 'Link kopiëren',
    cta: 'Haal de jouwe met Fewmail',
    emails: 'e-mails binnengekomen',
    empty:
      'Nog te weinig mail voor een verhaal. Kom over een paar dagen terug.',
    handled: 'zelf afgehandeld door Fewmail',
    people: 'Wie het meest schreef',
    period: { month: 'Deze maand', year: 'Dit jaar' },
    replies: 'antwoorden door Fewmail geschreven en verstuurd',
    saveImage: 'Afbeelding opslaan',
    saved: 'bespaard door Fewmail',
    shareNote:
      'De link en de afbeelding tonen alleen deze cijfers, nooit namen of adressen.',
    shared: { month: 'Een maand in e-mail', year: 'Een jaar in e-mail' },
    spam: 'spammails tegengehouden',
    split: (people: string, lists: string, other: string) =>
      `${people} van mensen · ${lists} van nieuwsbrieven · ${other} overige`,
    title: { month: 'Jouw maand in e-mail', year: 'Jouw jaar in e-mail' },
    unsubscribed: 'nieuwsbrieven verlaten',
  },
  reading: {
    markAllRead: 'Alles als gelezen markeren',
    summary: 'Wat je nieuwsbrieven zeiden',
    worth: 'De moeite waard om helemaal te lezen',
    leftOut: (n: number) => `Weggelaten: ${n}, niets nieuws.`,
    since: (n: number) =>
      `Na de samenvatting binnengekomen: ${n}, ze komen in de volgende.`,
    note: {
      inSummary: 'In de samenvatting',
      leftOut: 'Weggelaten',
      since: 'Na de samenvatting',
    },
    digest: (n: number) => `Nieuwsbrieven vandaag: ${n}`,
    lead: 'De nieuwsbrieven van de afgelopen dag op één plek, zodat ze je inbox niet vullen.',
    title: 'Lezen',
  },
  commitments: {
    title: 'Je hebt beloofd',
  },
  compose: {
    attach: 'Bestanden bijvoegen',
    attachmentsTooLarge: (limit: string) =>
      `Bijlagen mogen samen tot ${limit} zijn.`,
    dropFiles: 'Zet bestanden neer om ze bij te voegen',
    removeAttachment: 'Verwijderen',
    discarded: 'Concept verworpen',
    backInQueue: 'Geannuleerd. Het concept staat weer op Home.',
    canceled: 'Geannuleerd. Je e-mail staat weer in de editor.',
    cc: 'Cc',
    discard: 'Verwerpen',
    draftSaved: 'Concept opgeslagen',
    forward: 'Doorsturen',
    forwardedMessage: 'Doorgestuurd bericht',
    from: 'Van',
    instructionPlaceholder: 'Hoe moet het klinken? (optioneel)',
    invalidRecipients: 'Voeg minstens één geldig e-mailadres toe.',
    later: {
      inHour: 'Over een uur',
      monday: 'Maandagochtend',
      pick: 'Datum en tijd kiezen',
      schedule: 'Inplannen',
      time: 'Tijd',
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
    goTo: 'Ga naar',
    mail: 'Mail',
    nothingMatches: 'Geen resultaten.',
    placeholder: 'Vraag iets over je mail of voer een opdracht uit…',
    teachRule: 'Nieuwe regel aanleren',
    upgrade: 'Overstappen op Pro',
    theme: {
      dark: 'Donker',
      light: 'Licht',
      system: 'Systeem',
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
  errors: {
    calendarAccess:
      'Fewmail heeft geen toegang tot deze agenda. Sta het toe op de pagina Agenda.',
    failed: 'Er ging iets mis. Probeer het opnieuw.',
    needsPro: 'Hiervoor heb je Fewmail Pro nodig.',
    alreadySent: 'Al verzonden, te laat om ongedaan te maken.',
    notFound: 'Dit bestaat niet meer. Misschien is het verwijderd.',
    offline: 'Fewmail is niet bereikbaar. Controleer je verbinding.',
  },
  update: {
    available: 'Er is een nieuwe versie van Fewmail.',
    reload: 'Herladen',
  },
  keys: {
    attach: 'bijvoegen',
    done: 'klaar',
    openLink: 'link openen',
    writeReminder: 'herinnering schrijven',
    summary: 'samenvatting',
    fromSender: 'meer van afzender',
    approvePicked: (n: number) => `${n} gekozen goedkeuren`,
    pick: 'kiezen',
    pickAll: 'alles kiezen',
    markRead: 'markeer gelezen',
    unpick: 'keuze wissen',
    pin: 'vastzetten',
    unpin: 'losmaken',
    copyCode: 'code kopiëren',
    restore: 'naar inbox',
    calendarToday: 'vandaag',
    newEvent: 'nieuwe afspraak',
    period: 'vorige / volgende',
    view: 'weergave',
    skills: 'skills',
    unsubscribe: 'afmelden',
    filter: 'filter',
    reply: 'beantwoorden',
    snooze: 'uitstellen',
    trash: 'prullenbak',
    ask: 'ernaar vragen',
    approve: 'goedkeuren',
    approveAll: (n: number) => `alle ${n} van deze soort goedkeuren`,
    archive: 'archiveren',
    close: 'sluiten',
    draftReply: 'concept',
    edit: 'bewerken',
    expand: 'uitklappen / inklappen',
    move: 'bewegen',
    open: 'openen',
    notOnBoard: 'niet op dit bord',
    rename: 'hernoemen',
    clearFilter: 'filter wissen',
    search: 'zoeken',
    send: 'versturen',
    skip: 'overslaan',
    keep: 'houden',
    stopEditing: 'stop bewerken',
    rewrite: 'herschrijven',
    save: 'opslaan',
    deleteEvent: 'verwijderen',
  },
  legal: {
    privacy: 'Privacybeleid',
    englishOnly:
      'Dit document is beschikbaar in het Engels; dat is de bindende versie.',
    terms: 'Servicevoorwaarden',
    updated: (date: string) => `Laatst bijgewerkt op ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `Het tegoed van de agent is op voor deze maand. Het komt terug op ${date}.`,
  },
  notices: {
    freeUpSpace: 'Ruimte vrijmaken',
    mailLost:
      'Fewmail heeft geen toegang meer tot je Gmail en leest geen nieuwe mail.',
    mailboxLost: (email: string) =>
      `Fewmail heeft geen toegang meer tot ${email}.`,
    reconnect: 'Opnieuw verbinden',
    sendLimit: (email: string, when: string) =>
      `${email} heeft de dagelijkse verzendlimiet van Gmail bereikt. Versturen werkt weer ${when}.`,
    signInAgain: 'Opnieuw inloggen',
    storageFull: (email: string) =>
      `${email} heeft geen Google-opslag meer, dus Gmail weigert nieuwe mail.`,
    storageFullHint:
      'Maak ruimte vrij of neem meer opslag om weer mail te ontvangen.',
  },
  login: {
    needsGmail:
      'Fewmail heeft toegang tot je Gmail nodig. Log opnieuw in en laat het Gmail-vakje op het scherm van Google aangevinkt.',
    agree: ((slots) => [
      'Door verder te gaan ga je akkoord met de ',
      slots.terms,
      ' en het ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail vraagt toestemming om je Gmail te lezen, te ordenen en te versturen. Er wordt niets verstuurd of gearchiveerd zonder jouw akkoord, tenzij je een regel maakt die dat toestaat. Het vraagt ook om je Google Agenda, die je kunt uitvinken.',
    continue: 'Doorgaan met Google',
    lead: 'Fewmail leest je inbox voor je, antwoordt in jouw stijl en laat alleen zien wat jou echt nodig heeft.',
    messengers:
      'Werkt ook in messengers, te beginnen met Telegram: ontvang dringende mail, keur antwoorden goed of stuur gewoon een spraakbericht.',
    title: 'Alleen wat ertoe doet.',
  },
  mail: {
    inThread: (emails: string) => `${emails} in dit gesprek`,
    burstHint: (emails: string) =>
      `Geen gesprek: ${emails} van deze afzender, gebundeld omdat ze kort na elkaar kwamen`,
    draftDeleted: 'Concept verwijderd',
    unsubscribeConfirm: (name: string) => `Afmelden bij ${name}?`,
    unsubscribeHint:
      'Fewmail meldt je af bij de lijst en archiveert dit gesprek. Afmelden kan niet ongedaan worden gemaakt.',
    unsubscribing: 'Afmelden…',
    pin: 'Vastzetten',
    unpin: 'Losmaken',
    pinned: 'Vastgezet',
    showAll: (n: number) => `Alle ${n} tonen`,
    showFewer: 'Minder tonen',
    inGmail: (count: string) => `${count} in Gmail`,
    markShownRead: (n: number) => `${n} als gelezen markeren`,
    oneTimeCode: {
      archive: 'Kopiëren en archiveren',
      copied: 'Code gekopieerd',
      copy: 'Code kopiëren',
      trash: 'Kopiëren en verwijderen',
    },
    openUnsubscribePage: 'Pagina openen',
    unsubscribeYourself:
      'Voor deze lijst moet je zelf afmelden op de pagina ervan. Tot dan is de mail gearchiveerd.',
    allMailboxes: 'Alle mailboxen',
    filterAbout: {
      focused: 'Belangrijk en mensen eerst, meldingen ingeklapt',
      unread: 'Wat je nog niet hebt gelezen, per soort',
      categories: 'De hele inbox per soort, wat jou nodig heeft eerst',
      inbox: 'Alles, nieuwste eerst',
    },
    find: {
      back: 'Terug naar mail',
      open: 'Zoeken',
      recent: 'Recente zoekopdrachten',
      tips: 'Tips',
      clearRecent: 'Wissen',
      describeExample: 'facturen van Anna van vorige maand',
      searching: 'Je mail doorzoeken…',
      tip: {
        from: 'Mail van Anna',
        subject: 'Onderwerp noemt “invoice”',
        attachment: 'Met bijlagen',
        pdf: 'Met een pdf als bijlage',
        unread: 'Ongelezen gesprekken',
        week: 'Van de afgelopen 7 dagen',
        describe: 'Of beschrijf het in je eigen woorden',
      },
    },
    group: {
      read: 'Gelezen',
      earlier: 'Eerder',
      important: 'Belangrijk',
      people: 'Mensen',
      plans: 'Agenda en reizen',
      money: 'Geld',
      updates: 'Meldingen',
      newsletters: 'Nieuwsbrieven',
      promotions: 'Aanbiedingen',
    },
    unread: 'Ongelezen',
    block: 'Afzender blokkeren',
    ignoresUnsubscribe: (name: string) => `${name} negeert afmeldingen`,
    ignoresUnsubscribeHint:
      'Fewmail heeft om afmelding gevraagd, maar deze afzender blijft bekend genoeg toch mailen. Zijn mail voortaan naar de prullenbak? Terugdraaien kan in Regels.',
    blocked: 'Geblokkeerd. Hun mail gaat nu naar de prullenbak.',
    forward: 'Doorsturen',
    more: 'Meer',
    close: 'Sluiten',
    reply: 'Beantwoorden',
    trash: 'Naar prullenbak',
    trashed: 'Naar prullenbak verplaatst',
    moveToInbox: 'Naar inbox',
    backInInbox: 'Naar de inbox verplaatst',
    movedToInbox: 'Terug in de inbox. Bedankt voor het melden.',
    noThread: 'Kies een e-mail om hem hier te lezen',
    deleteDraft: 'Concept verwijderen',
    notSent: 'Niet verzonden. Open om opnieuw te proberen',
    noRecipients: 'Geen ontvangers',
    notSpam: 'Geen spam',
    reportSpam: 'Spam melden',
    reportedSpam: 'Gemeld. Hun mail gaat nu naar spam.',
    archive: 'Archiveren',
    archived: 'Gearchiveerd',
    markedRead: 'Gemarkeerd als gelezen',
    attachment: 'bijlage',
    draftReply: 'Antwoord opstellen',
    drafting: 'Opstellen…',
    draftWaiting: 'Concept wacht op Home',
    due: (date: string) => `vervalt ${date}`,
    dueHint: 'Deadline die de agent in deze e-mail vond',
    empty: 'Geen e-mails hier',
    emptyHint: 'Nieuwe e-mails verschijnen hier zodra ze binnenkomen.',
    noResults: 'Niets gevonden',
    noResultsHint: 'Probeer andere woorden of een andere map.',
    expectsReply: 'Verwacht antwoord',
    filter: {
      categories: 'Categorieën',
      archive: 'Archief',
      trash: 'Prullenbak',
      drafts: 'Concepten',
      spam: 'Spam',
      inbox: 'Inbox',
      snoozed: 'Uitgesteld',
      focused: 'Focus',
      unread: 'Ongelezen',
    },
    instruction: 'Vertel de agent hoe te antwoorden, of druk gewoon op Enter',
    open: 'Openen',
    search: 'Zoek of beschrijf: facturen van Anna van vorige maand',
    openInGmail: 'Openen in Gmail',
    openFullPage: 'Op volledige pagina openen',
    peek: 'Snel bekijken',
    collapseFullPage: 'Terug naar de lijst',
    unsubscribe: 'Afmelden',
    unsubscribed: 'Afgemeld',
    unsubscribeFailed:
      'Deze afzender heeft geen afmelding met één klik, dus de e-mail is gearchiveerd.',
    you: 'Jij',
    replyTo: 'Antwoord aan',
    date: 'Datum',
    authentication: 'Authenticatie',
    toLine: (recipients: string) => `aan ${recipients}`,
  },
  subscriptions: {
    unsubscribeHint: (emails: string) =>
      `Fewmail meldt je af bij de lijst en archiveert alles wat die stuurde (${emails} deze maand). Afmelden kan niet ongedaan worden gemaakt.`,
    archivedOnly:
      'Deze afzender heeft geen afmelding die Fewmail kan gebruiken, dus de mail is gearchiveerd, maar je staat nog op de lijst en nieuwe mail blijft komen.',
    count: (total: number) => `Mailinglijsten: ${total}`,
    empty: 'Geen mailinglijst heeft je deze maand gemaild.',
    lead: 'Mailinglijsten die je deze maand mailden, de drukste eerst. Afmelden archiveert alles wat ze stuurden; komt er twee weken later nog mail, dan stel ik voor die naar spam te verplaatsen en doe ik dat pas na je ja.',
    opened: (total: number) =>
      total === 0 ? 'geen enkele geopend' : `${total} geopend`,
    title: 'Abonnementen',
    unsubscribe: 'Afmelden',
    unsubscribed: 'Afgemeld',
  },
  nav: {
    labels: 'Labels',
    folders: 'Mappen',
    calendar: 'Agenda',
    subscriptions: 'Abonnementen',
    boards: 'Borden',
    newBoard: 'Nieuw bord',
    mail: 'Mail',
    reading: 'Lezen',
    rules: 'Regels',
    search: 'Zoek of vraag…',
    settings: 'Instellingen',
    syncFailed: 'Gmail-synchronisatie mislukt, opnieuw proberen',
    syncing: 'Je inbox wordt gelezen…',
    loading: 'Laden',
    syncFailedIn: (email: string) =>
      `Synchronisatie van ${email} mislukt, opnieuw proberen`,
    syncingIn: (email: string) => `${email} wordt gelezen…`,
    home: 'Home',
    trialLeft: (total: number) =>
      plural('nl', total, {
        one: () => 'Pro-proefperiode · nog 1 dag',
        other: (n) => `Pro-proefperiode · nog ${n} dagen`,
      }),
    usage: (percent: number) => `Agent · ${percent}% van deze maand gebruikt`,
    watching: 'De agent houdt je inbox in de gaten',
  },
  notifications: {
    many: (total: number) =>
      plural('nl', total, {
        other: (n) => `${n} nieuwe meldingen van Fewmail`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Pagina’s die de agent uit je mail vult, te beginnen met de laatste drie maanden. Kies er tot ${max}; eigen pagina’s kun je later toevoegen.`,
    boardsTitle: 'Wat moet de agent voor je verzamelen?',
    languageHint:
      'De app, samenvattingen en uitleg gebruiken deze taal. Antwoorden volgen altijd de taal van de e-mail die je beantwoordt.',
    languageTitle: 'Welke taal moet Fewmail spreken?',
    lead: 'Twee snelle antwoorden. Je kunt alles later wijzigen in Instellingen.',
    reading: 'Je inbox wordt gelezen…',
    start: 'Starten',
    title: 'Laten we je agent instellen.',
  },
  plan: {
    used: (percent: number) => `${percent}% gebruikt`,
    about: (emails: string, messages: string) =>
      `Ongeveer ${emails} gelezen e-mails of ${messages} berichten aan de agent per maand, in elke verhouding.`,
    free: 'Gratis',
    freeDescription:
      'Snelle, rustige mail met eenvoudige regels. Gratis zo lang je wilt.',
    includes:
      'Elk betaald abonnement voegt de agent toe: elke e-mail gelezen en samengevat, antwoorden in jouw stijl, regels in gewone woorden, Telegram en MCP.',
    manage: 'Facturering beheren',
    price: (usd: number) => `$${usd} / maand`,
    priceYearly: (usd: number) => `$${usd} / jaar`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
    cancels: (plan: string, date: string) =>
      `${plan} tot ${date}, daarna Gratis.`,
    choose: (plan: string) => `Kies ${plan}`,
    proRenews: (date: string) => `Wordt verlengd op ${date}.`,
    resets: (date: string) => `Begint opnieuw op ${date}.`,
    title: 'Abonnement',
    trial: 'Pro-proefperiode',
    welcome: (plan: string) =>
      `Welkom bij ${plan}. De agent is weer aan het werk.`,
    yearly: 'Jaarlijks betalen',
    yearlyHint: 'Twee maanden gratis.',
    trialDescription: (date: string) =>
      `Alles van Pro tot ${date}, daarna gratis. Geen kaart nodig.`,
    upgrade: 'Andere abonnementen',
    usage: 'Deze maand',
  },
  people: {
    firstContact: (date: string) => `Mailt sinds ${date}`,
    lastContact: (date: string) => `Laatste e-mail ${date}`,
    open: 'Wacht in andere gesprekken',
    promised: 'Je hebt beloofd',
    threads: (total: number) =>
      plural('nl', total, {
        one: () => '1 gesprek',
        other: (n) => `${n} gesprekken`,
      }),
  },
  queue: {
    addToCalendar: 'Aan agenda toevoegen',
    writeReminder: 'Herinnering schrijven',
    approve: 'Goedkeuren',
    delete: 'Verwijderen',
    pick: 'Kiezen',
    picked: (n: number) => `${n} gekozen`,
    unpick: 'Niet kiezen',
    askedByYou: 'Op jouw verzoek',
    draftedInVoice: 'Opgesteld in jouw stijl',
    edit: 'Bewerken',
    send: 'Versturen',
    rewrite: 'Herschrijven',
    shorterInstruction: 'Maak het korter.',
    new: 'Nieuw',
    skipStale: 'Alle overslaan',
    skipped: (n: number) => `Overgeslagen: ${n}`,
    stale: (n: number) => `Ouder dan een week: ${n}`,
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
    deleted: 'Regel verwijderd',
    add: 'Regel toevoegen',
    count: (total: number) =>
      plural('nl', total, {
        one: () => '1 regel',
        other: (n) => `${n} regels`,
      }),
    delete: 'Verwijderen',
    describe: {
      alwaysShow: 'Komt altijd op Home',
      autonomous: 'Wordt zelf gedaan, staat bij afgehandeld',
      draft: 'Een concept wacht op je op Home',
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
    lead: 'Vertel de agent in gewone woorden wat hij met bepaalde mail moet doen. Hij toetst elke e-mail aan deze regels.',
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
  },
  settings: {
    disconnectConfirm: (name: string) => `${name} ontkoppelen?`,
    messengerDisconnectHint:
      'De bot stuurt je dan geen berichten meer. Opnieuw koppelen kan met een nieuwe link van deze pagina.',
    readingDigest: {
      description:
        'Elke ochtend komen de nieuwsbrieven van de afgelopen dag als één bericht in Telegram en WhatsApp.',
      title: 'Nieuwsbriefoverzicht',
    },
    account: 'Account',
    agent: 'Agent',
    deleteAccount: 'Account verwijderen',
    deleteConfirm: 'Alles verwijderen',
    deleteDescription:
      'Verwijdert direct je account, gesynchroniseerde mail, concepten en regels uit Fewmail. Je Gmail zelf blijft onaangeroerd. Een betaald abonnement wordt direct opgezegd.',
    deleteFailed:
      'Het account is niet verwijderd. Probeer het over een minuut opnieuw.',
    deleteSignIn:
      'Log ter bevestiging opnieuw in met Google en verwijder daarna het account.',
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
      'App, bot en samenvattingen. Antwoorden volgen de e-mail.',
    legal: 'Juridisch',
    mailboxes: {
      removeConfirm: (email: string) => `${email} verwijderen?`,
      removeHint:
        'Fewmail leest deze mailbox niet meer en vergeet wat het er las. In Gmail verandert niets.',
      add: 'Gmail toevoegen',
      addDescription:
        'Mail van een ander Gmail-account komt ook op Home en in dezelfde inbox. Er logt nooit iemand mee in: inloggen ermee opent een aparte Fewmail.',
      added: 'Mailbox toegevoegd. De mail verschijnt binnen een minuut.',
      failed:
        'De mailbox kon niet worden toegevoegd. Sta Gmail-toegang toe en probeer het opnieuw.',
      lost: 'Gmail-toegang is verloren. Voeg hem opnieuw toe om opnieuw te verbinden.',
      reading: 'Mail wordt gelezen…',
      remove: 'Verwijderen',
      retrying: 'Gmail reageert nu niet. Fewmail probeert het vanzelf opnieuw.',
      signIn: 'Je logt hiermee in',
      signInChosen: 'Met dit account log je in. Kies een ander.',
      signInLost:
        'Gmail-toegang is verloren. Log opnieuw in om opnieuw te verbinden.',
      synced: (ago: string) => `Gesynchroniseerd ${ago}`,
      title: 'Mailboxen',
    },
    mcp: {
      disconnectHint:
        'De app kan je mail dan niet meer lezen tot je hem opnieuw koppelt.',
      allow: 'Toestaan',
      connected: (ago: string) => `Verbonden ${ago}`,
      copy: 'URL kopiëren',
      defaultName: 'MCP-client',
      deny: 'Weigeren',
      description:
        'Ze kunnen je mail lezen, antwoorden opstellen en die versturen nadat jij bevestigt.',
      disconnect: 'Ontkoppelen',
      paste: 'Voeg deze URL toe als connector in je app en log in bij Fewmail.',
      request: (app: string) => `${app} wil je Fewmail gebruiken`,
      title: 'Koppel Claude, Cursor of een andere MCP-client',
    },
    morningDescription: (timezone: string) =>
      `Nieuwsbriefoverzicht en het weekrapport op maandag, in jouw tijdzone, ${timezone}`,
    morningTitle: 'Ochtendberichten',
    signedInWithGoogle: 'Ingelogd met Google',
    signOut: 'Uitloggen',
    snippets: {
      deleted: 'Snippet verwijderd',
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
      messengerOff: 'Dringende mail blijft in Fewmail.',
      messengerOn: 'Dringende mail komt meteen in de chat.',
      notConfigured: 'Browsermeldingen zijn niet ingesteld op deze server.',
      off: 'Ontvang dringende mail hier, ook als Fewmail dicht is.',
      on: 'Dringende mail verschijnt hier. Meerdere tegelijk komen als één.',
      title: 'Meldingen',
      unsupported: 'Deze browser kan geen meldingen tonen.',
    },
    telegram: {
      connect: 'Telegram koppelen',
      disconnect: 'Ontkoppelen',
      linked:
        'Dringende mail komt meteen binnen. Keur concepten goed en bewerk ze in de chat.',
      linkedQuiet: 'Keur concepten goed en bewerk ze in de chat.',
      notConfigured: 'De Telegram-bot is niet ingesteld op deze server.',
      unlinked: 'Ontvang dringende mail en keur concepten goed via Telegram.',
    },
    whatsapp: {
      connect: 'WhatsApp koppelen',
      disconnect: 'Ontkoppelen',
      linked:
        'Dringende mail komt meteen binnen. Keur concepten goed en bewerk ze in de chat.',
      linkedQuiet: 'Keur concepten goed en bewerk ze in de chat.',
      notConfigured: 'De WhatsApp-bot is niet ingesteld op deze server.',
      unlinked: 'Ontvang dringende mail en keur concepten goed via WhatsApp.',
    },
    title: 'Instellingen',
  },
  site: {
    meta: {
      compare:
        'Fewmail vergeleken met Superhuman, Shortwave en SaneBox: een agent die je mail leest in plaats van een snellere manier om hem zelf te lezen.',
      home: 'Fewmail is een e-mailagent voor Gmail: hij leest elke mail, schrijft antwoorden in jouw stijl en laat je alleen zien wat jou nodig heeft.',
      login:
        'Fewmail leest je Gmail voor je, antwoordt in jouw stijl en laat je alleen zien wat jou echt nodig heeft.',
      mcp: 'Koppel Fewmail als MCP-server aan Claude, ChatGPT, Claude Code of Cursor: lees en sorteer je Gmail vanuit de AI die je al gebruikt.',
      motto: 'alleen wat telt in je inbox',
      pricing: (trialDays: number) =>
        `Fewmail is voor altijd gratis voor Home, sorteren, regels en spambescherming. Pro, de hele agent, begint met ${trialDays} gratis dagen en zonder kaart.`,
      tagline: 'de e-mailagent voor Gmail',
    },
    chapters: {
      pricing: {
        description:
          'Home, sorteren, regels en bescherming zijn voor altijd gratis. Lite, Pro en Max voegen alles toe wat voor je leest en schrijft; de grotere abonnementen doen er gewoon meer van.',
        label: 'Prijzen',
        title: (usd: number) =>
          `Gratis voor het sorteren. Vanaf $${usd} voor de agent.`,
      },
      questions: {
        description:
          'De korte antwoorden. De lange staan in het privacybeleid.',
        label: 'Vragen',
        title: 'Voordat je Gmail koppelt.',
      },
    },
    closing: {
      lead: 'Koppel Gmail in een minuut. Fewmail begint met de mail van de afgelopen drie dagen, dus de eerste beslissingen liggen meteen voor je klaar.',
      title: 'Krijg je ochtenden terug.',
    },
    mcp: {
      answer:
        'Het getekende contract, vóór de kick-off van vrijdag. Er staat al een antwoord klaar in je wachtrij in Fewmail.',
      clients: 'Werkt met',
      emphasis: 'Claude en ChatGPT.',
      free: 'Je mail lezen en het sorteren door de agent zijn gratis.',
      label: 'MCP',
      lead: 'Koppel Fewmail als MCP-server en vraag naar je mail vanuit de assistent die je al gebruikt. Alles wat iets verstuurt of Gmail wijzigt, vraagt nog steeds om je ja.',
      question: 'Wat heeft Anna deze week van me nodig?',
      setup: 'In een minuut gekoppeld',
      title: 'Je mail, gewoon in Claude en ChatGPT.',
    },
    mcpPage: {
      copy: 'URL kopiëren',
      lead: 'Koppel Fewmail als MCP-server en vraag naar je mail vanuit de AI die je al gebruikt. Je mail lezen en het sorteren door de agent zijn gratis; concepten, versturen en regels komen met Pro.',
      safety:
        'Alles wat een e-mail verstuurt of Gmail wijzigt, vraagt eerst om je ja. Je mail traint nooit modellen en je kunt elke app ontkoppelen in de instellingen.',
      steps: {
        chatgpt:
          'Voeg in Settings een connector (app) met deze URL toe en log daarna in bij Fewmail.',
        claude:
          'Voeg in Settings → Connectors een eigen connector met deze URL toe en log daarna in bij Fewmail.',
        code: 'Voer dit één keer uit in een terminal en log in bij Fewmail als Claude Code erom vraagt.',
        cursor:
          'Zet dit in je mcp.json en log in bij Fewmail als Cursor erom vraagt.',
      },
      title: 'Fewmail in Claude, ChatGPT en je tools.',
    },
    comparePage: {
      lead: 'Mailprogramma’s maken je sneller in het lezen van elke e-mail. Filters verplaatsen mail naar mappen. Fewmail is een agent: het leest je mail, beslist wat kan wachten en vraagt jou alleen naar de rest.',
      title: 'Fewmail vergeleken.',
    },
    comparison: {
      custom: 'Op maat',
      features: 'Functie voor functie',
      groups: {
        agent: 'Lezen en beantwoorden',
        day: 'Je dag',
        reach: 'Waar het werkt',
        safety: 'Bescherming',
      },
      labels: {
        ask: 'Vraag je mail wat je wilt',
        home: 'Alles wat jou nodig heeft, op één pagina',
        calendar: 'Agenda',
        drafts: 'Antwoorden voor je opgesteld',
        followUps: 'Herinneringen om op te volgen',
        gmail: 'Gmail en Google Workspace',
        handOver: 'Een gesprek overdragen',
        importance: 'Gesorteerd op belangrijkheid',
        keepApp: 'Houd je eigen mailapp',
        mcp: 'MCP voor je eigen tools',
        memory: 'Onthoudt afspraken en mensen',
        otherProviders: 'iCloud, Yahoo en andere IMAP-mail',
        outlook: 'Outlook en Microsoft 365',
        phishing: 'Waarschuwingen voor phishing en gewijzigde betaalgegevens',
        phone: 'Op je telefoon',
        rules: 'Regels in gewone woorden',
        snooze: 'Snoozen',
        spamShield: 'Spamschild van de community',
        summaries: 'Samenvattingen van e-mails',
        teams: 'Gedeelde teaminbox',
        unsubscribe: 'Afmelden met één klik',
      },
      more: 'Meer vergelijkingen',
      no: 'Nee',
      noFreePlan: 'Geen gratis abonnement',
      ours: {
        ask: 'In Pro',
        home: 'Live, in één keer goed te keuren, gratis',
        drafts: 'In jouw stijl, pas verstuurd als jij akkoord geeft, in Pro',
        followUps: 'Automatisch, bij mail die een antwoord verwacht',
        handOver: 'De agent werkt het af tot het doel, in Pro',
        importance: 'Elke e-mail beoordeeld, gratis',
        keepApp: 'Alles verschijnt in Gmail',
        mcp: 'In Pro',
        memory: 'In Pro',
        phone: 'Telegram en WhatsApp, met spraak, in Pro',
        rules: 'Archiveren, als gelezen markeren of afmelden, gratis',
        summaries: 'In Pro',
        unsubscribe: 'Afzenders die het negeren gaan naar spam',
      },
      plans: 'Abonnementen en prijzen',
      read: 'Lees de vergelijking',
      source: (name: string, date: string) =>
        `Gegevens over ${name} komen van de openbare website, gecontroleerd in ${date}. Prijzen en functies veranderen; kijk op hun site voor het actuele aanbod.`,
      title: (name: string) => `Fewmail vs ${name}`,
      tryFree: 'Probeer Fewmail gratis',
      which: 'Welke past bij jou?',
      yes: 'Ja',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 mailboxen en alle functies, inclusief AI Bundle',
          lunch: '2 mailboxen, snoozen en herinneringen',
          snack: '1 mailbox en basisfilters',
        },
        summary:
          'SaneBox sorteert mail in mappen en stelt op het hoogste abonnement ook antwoorden op en vat samen. Fewmail leest eerst alles en zet de paar beslissingen die alleen jij kunt nemen op één pagina.',
        them: {
          home: 'Een dagelijkse samenvatting van gefilterde mail',
          drafts: 'SaneDrafts, in Dinner',
          followUps: 'SaneNoReplies',
          importance: 'Onbelangrijke mail gaat naar SaneLater',
          keepApp: 'Werkt via mappen',
          otherProviders: 'Elke IMAP- of Exchange-server',
          phone: 'Via je mailapp',
          rules: 'Trainen door mail tussen mappen te verplaatsen',
          snooze: 'Vanaf Lunch',
          summaries: 'SaneSummary, in Dinner',
          unsubscribe: 'Map SaneBlackHole',
        },
        verdict:
          'Kies SaneBox als je mail buiten Gmail staat en mappen genoeg zijn. Kies Fewmail als je Gmail gebruikt en wilt dat belangrijke mail gelezen, samengevat en beantwoord wordt.',
      },
      shortwave: {
        plans: {
          business: 'Per gebruiker',
          free: 'De meeste functies en de assistent',
          max: 'Per gebruiker, de sterkste modellen',
          premier: 'Per gebruiker, sterkere modellen',
          pro: 'Volledige geschiedenis, zoeken en schrijven met AI',
        },
        summary:
          'Shortwave is een mailprogramma met een AI-assistent waarmee je praat. Fewmail is een agent die eerst zelf leest en jou alleen vraagt wat het niet kan beslissen.',
        them: {
          ask: 'AI-assistent en zoeken',
          drafts: 'Als je erom vraagt',
          importance: 'Splitsingen en bundels',
          keepApp: 'Vervangt je mailapp',
          memory: 'AI-geheugen',
          otherProviders: 'Doorgestuurd naar Gmail',
          outlook: 'Microsoft 365 niet ondersteund',
          phone: 'Apps voor iOS en Android',
          rules: 'AI-filters, 3 tot 50 per abonnement',
          summaries: 'Boven elke e-mail',
          teams: 'Gedeelde gesprekken en opmerkingen',
          unsubscribe: 'Met blokkeren in één klik',
        },
        verdict:
          'Kies Shortwave als je een nieuwe inbox met een chatassistent wilt. Kies Fewmail als je minder e-mails wilt zien, in de Gmail die je al gebruikt.',
      },
      superhuman: {
        plans: {
          business:
            'Per lid, $33 bij jaarlijkse betaling. Met Auto Drafts en Ask AI',
          enterprise: 'SSO en beheeropties',
          starter: 'Per lid, $25 bij jaarlijkse betaling',
        },
        summary:
          'Met Superhuman ga je sneller door elke e-mail. Fewmail gaat er voor je doorheen en laat alleen zien wat jou nodig heeft.',
        them: {
          ask: 'Ask AI, in Business',
          drafts: 'Auto Drafts, in Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox en Auto Labels',
          keepApp: 'Vervangt je mailapp',
          mcp: 'In Business',
          phone: 'Apps voor iOS en Android',
          rules: 'Custom Auto Labels, in Business',
          spamShield: 'Het filter van je provider',
          summaries: 'Auto Summarize',
          teams: 'Gedeelde concepten en opmerkingen',
        },
        verdict:
          'Kies Superhuman als je elke e-mail zelf wilt aanraken, maar sneller. Kies Fewmail als je de meeste liever helemaal niet ziet.',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'Nee. Fewmail werkt bovenop Gmail. Alles wat het doet, zie je ook in Gmail, en je kunt elke Gmail-app ernaast blijven gebruiken.',
        question: 'Moet ik weg bij Gmail?',
      },
      {
        answer:
          'Nooit zonder jou. Antwoorden wachten in je wachtrij tot je ze goedkeurt, en alleen regels die jij hebt gemaakt of behouden mogen zelf archiveren, als gelezen markeren of afmelden. Alles wat het deed, staat onder Afgehandeld.',
        question: 'Kan het zelf mail versturen of verwijderen?',
      },
      {
        answer:
          'Onderwerpen, inhoud, samenvattingen en concepten zijn versleuteld in onze database. Je mail wordt nooit gebruikt om modellen te trainen, en het spamschild deelt tussen gebruikers alleen hashes met een sleutel, nooit adressen of inhoud.',
        question: 'Wat gebeurt er met mijn mail?',
      },
      {
        answer: `Elk nieuw account krijgt ${trialDays} dagen Pro, zonder kaart. Daarna blijf je gewoon op Gratis; er wordt niets verwijderd en niets afgeschreven.`,
        question: 'Wat gebeurt er na de proefperiode?',
      },
      {
        answer:
          'Concepten worden geschreven in de taal van de e-mail die je beantwoordt. De app, de samenvattingen en de Telegram-bot spreken één taal naar keuze, uit vijftien.',
        question: 'Welke talen spreekt het?',
      },
      {
        answer:
          'Voorlopig accounts van Gmail en Google Workspace. Voeg meerdere mailboxen toe aan één Fewmail en hun mail komt op Home en in dezelfde inbox terecht.',
        question: 'Welke e-mailaccounts werken?',
      },
    ],
    features: {
      description:
        'De stukken e-mail die vroeger een middag kostten, gedaan op de achtergrond en op een rij gezet waar je ze kunt nakijken.',
      items: {
        codes: {
          description:
            'Een verse code staat bovenaan Home en naast de e-mail, klaar om te kopiëren zonder iets te openen. Gratis.',
          title: 'Inlogcodes',
        },
        subscriptions: {
          description:
            'Elke mailinglijst die deze maand schreef, met hoeveel van haar e-mails je echt hebt geopend. Meld je met één toets af. Gratis.',
          title: 'Abonnementen',
        },
        ask: {
          description:
            'Vraag wat je wilt in gewone woorden en krijg het antwoord uit je eigen mail, met de e-mails waar het vandaan komt.',
          title: 'Vraag het je mail',
        },
        boards: {
          description:
            'Geld, betaalde abonnementen, reizen, bestellingen: beschrijf wat je wilt bijhouden en de agent verzamelt het uit tot een jaar mail, met grafieken.',
          title: 'Borden',
        },
        calendar: {
          description:
            'De agenda van elke mailbox in één overzicht. Een afspraak die in een e-mail wordt voorgesteld, komt in je agenda zodra je ja zegt.',
          title: 'Agenda',
        },
        clearOut: {
          description:
            'De hele achterstand in één keer weg, tot 50.000 e-mails per mailbox, allemaal onder één label, zodat Ongedaan maken ze stuk voor stuk terugzet. Gratis.',
          title: 'Opruimen',
        },
        reading: {
          description:
            'Eén samenvatting van de nieuwsbrieven van vandaag: het nieuws per onderwerp, elke zin gekoppeld aan de bron, en welke het lezen waard zijn.',
          title: 'Lezen',
        },
        voice: {
          description:
            'Laat de samenvatting van je nieuwsbrieven voorlezen. Stuur een spraakbericht in Telegram of WhatsApp en de agent antwoordt hardop.',
          title: 'Luisteren in plaats van lezen',
        },
        wrapped: {
          description:
            'Jouw maand of jaar in e-mail: wat er binnenkwam, wat er werd afgehandeld, hoeveel tijd je terugkreeg. Om te delen, nooit met een naam.',
          title: 'Wrapped',
        },
      },
      label: 'En de rest',
      title: 'Al het andere wat een assistent zou doen.',
    },
    footer: {
      legal: 'Juridisch',
      product: 'Product',
      tagline:
        'De e-mailagent die je Gmail leest en je alleen laat zien wat jou nodig heeft.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'niet meer hebt.',
      label: 'Wat verdwijnt',
      rows: [
        {
          fix: 'Opruimen haalt de hele achterstand in één keer weg: oude reclame, gelezen meldingen, lijsten die je nooit opent. Eén keer Ongedaan maken zet elke e-mail terug.',
          problem: 'Duizenden e-mails die niemand ooit gaat lezen.',
        },
        {
          fix: 'Antwoorden staan al klaar, in jouw stijl en in hun taal. Vergelijkbare keur je samen goed met ⇧⏎, en je kunt ze nog steeds allemaal nakijken.',
          problem: 'Om middernacht nog e-mail beantwoorden.',
        },
        {
          fix: 'Eén toets meldt je af zoals een mens dat zou doen: één klik, de afmeldpagina of een e-mail. Afzenders die blijven mailen worden betrapt en als spam voorgesteld.',
          problem: 'Nieuwsbrieven waarvoor je je nooit hebt aangemeld.',
        },
        {
          fix: 'De nieuwsbrieven van vandaag worden één samenvatting per onderwerp, met de exemplaren die het lezen waard zijn erbij.',
          problem: 'Nieuwsbrieven die je nog wilde lezen.',
        },
        {
          fix: 'Gewijzigde betaalgegevens, nagemaakte domeinen en bekende phishing geven een waarschuwing voordat je iets doet.',
          problem: 'Een factuur met een nieuw rekeningnummer.',
        },
        {
          fix: 'Beloftes die je in verstuurde mail doet, komen terug als ze aan de beurt zijn, en threads waar niemand op reageerde, worden opgevolgd.',
          problem: 'Dat ene wat je beloofde en vergat.',
        },
        {
          fix: 'Alleen dringende mail bereikt je in Telegram of WhatsApp. De rest wacht al gesorteerd op Home, tot je kijkt.',
          problem: 'Tijdens het eten je mail checken, voor de zekerheid.',
        },
      ],
      title: 'E-mailproblemen die je niet meer hebt.',
    },
    hero: {
      needs: {
        emphasis: 'hebben jou nodig.',
        lead: (handled: string) =>
          `Anna wacht op het contract, de factuur van Northwind moet volgende week betaald zijn en Marco wil donderdag. ${handled} nieuwsbrieven en meldingen zijn afgehandeld, en Home werkt zichzelf bij zodra er nieuwe mail binnenkomt.`,
        tag: 'Home · donderdag, 08:12',
        title: 'Drie dingen hebben jou nodig.',
      },
      fates: {
        archived: 'Gearchiveerd',
        markedRead: 'Als gelezen gemarkeerd',
        spam: 'Spam',
        summarised: 'Samengevat',
        unsubscribed: 'Afgemeld',
      },
      handled: ((slots) => [
        slots.count,
        ' afgehandeld, elk met een reden',
      ]) as Rich<'count'>,
      inbox: 'Inbox',
      lead: 'Nieuwsbrieven, bonnetjes, meldingen, een phishinglink en, ergens daartussen, de drie e-mails die er echt toe doen. Fewmail is de agent die het allemaal voor je leest.',
      needYou: ((slots) => [slots.count, ' hebben jou nodig']) as Rich<'count'>,
      queue: [
        {
          reason: 'Contract morgen nodig',
          summary:
            'Heeft het getekende contract terug nodig vóór de kick-off van vrijdag.',
        },
        {
          reason: 'Factuur · $1,240 vóór 20 nov.',
          summary:
            'Factuur van oktober voor het nieuwe websiteontwerp. Zelfde rekeningnummer als de vorige keer.',
        },
        {
          reason: 'Afspraak voorgesteld',
          summary:
            'Stelt donderdag om 15:00 voor. Jij kunt vanaf 16:00, dus het concept vraagt om vier uur.',
        },
      ],
      reading: {
        emphasis: 'elke e-mail.',
        lead: 'Het archiveert de ruis, meldt je af voor wat je nooit opent en houdt oplichters buiten de deur. Alles wat het doet, wordt met de reden opgeschreven, zodat je het kunt nakijken.',
        title: 'Fewmail leest elke e-mail.',
      },
      remind: 'Herinner me op 19 nov.',
      remindPlan: 'Zet hem bij je rekeningen en herinnert je op 19 nov.',
      start: 'Gratis starten met Google',
      title: 'E-mail is niet jouw werk.',
      home: 'Home',
      tryQueue: 'Probeer de wachtrij',
      unread: ((slots) => [slots.count, ' ongelezen']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' ongelezen in je inbox',
      ]) as Rich<'count'>,
      willDo: 'Wat Fewmail doet',
    },
    nav: {
      compare: 'Vergelijken',
      features: 'Functies',
      mcp: 'MCP-server',
      pricing: 'Prijzen',
      signIn: 'Inloggen',
    },
    play: {
      again: 'Nog een keer',
      doneLead: (handled: string) =>
        `Je nam drie beslissingen. Fewmail regelde de andere ${handled} en schreef op waarom.`,
      doneTitle: 'Dat was het voor vandaag.',
      emphasis: 'in twee minuten.',
      handled: [
        'Lumen Weekly: je opende geen van de laatste 30 nummers',
        'paypa1-billing.com lijkt op paypal.com',
        'Parcelhub: bezorgberichten, via de regel “Bonnetjes en verzending”',
      ],
      handledTitle: 'Afgehandeld terwijl je sliep',
      label: 'Probeer het',
      lead: 'Zo ziet een ochtend er nu uit. De concepten zijn geschreven, de redenen staan erbij, jij beslist. Ga je gang, werk hem weg.',
      left: (count: number) => `Nog ${count} te beslissen`,
      title: 'Je hele inbox, in twee minuten.',
    },
    plans: {
      agent: 'De agent',
      emails: 'E-mails die de agent per maand leest',
      everyPlan: 'In elk abonnement',
      messages: 'of berichten aan de agent',
      oneAllowance:
        'Eén tegoed voor alles wat de agent doet: je betaalt voor wat je gebruikt, en ruis telt nooit mee',
      forever: 'voor altijd',
      free: {
        description: 'Home, sorteren, regels en bescherming. Voor altijd.',
      },
      max: {
        description: 'Dezelfde agent voor een drukke inbox.',
      },
      monthly: 'Maandelijks',
      per: { month: 'per maand', year: 'per jaar' },
      lite: {
        description: 'De hele agent: hij leest, schrijft en onthoudt.',
      },
      pro: {
        description: 'Dezelfde agent met ruimte voor meer mail.',
      },
      tryFree: (days: number) => `${days} dagen gratis proberen`,
      yearly: 'Jaarlijks · 2 maanden gratis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Home, sorteren, regels in gewone woorden en bescherming zijn voor altijd gratis. Pro is de agent die voor je leest, schrijft en onthoudt; Max is dezelfde agent met ruimte voor een drukke inbox. Elk account begint met ${trialDays} dagen Pro, en daarna blijf je gewoon op Gratis.`,
      otherTool: 'Denk je aan een andere tool?',
      title: 'Betaal voor de agent, niet voor de inbox.',
    },
    startFree: 'Gratis starten',
    trialNote: (days: number) =>
      `${days} dagen Pro, geen kaart nodig. Daarna gratis zo lang je wilt.`,
    trust: {
      emphasis: 'vraagt',
      label: 'Jouw mail, jouw beslissing',
      places: 'Werkt bovenop de Gmail die je al gebruikt, en bereikt je in',
      title: 'Het vraagt eerst, en doet dan pas iets.',
      vows: [
        {
          description:
            'Concepten wachten op jou. Alleen regels die jij hebt gemaakt of behouden mogen zelf archiveren, als gelezen markeren of afmelden, en alles wat ze deden, staat onder Afgehandeld.',
          title: 'Niets wordt verstuurd zonder jouw ja.',
        },
        {
          description:
            'Onderwerpen, inhoud, samenvattingen en concepten zijn versleuteld in onze database. Opgeslagen concepten blijven in Gmail, nooit bij ons.',
          title: 'Versleuteld opgeslagen.',
        },
        {
          description:
            'Het spamschild leert van iedereen via hashes met een sleutel. Geen enkel adres en geen woord uit je mail wordt gedeeld.',
          title: 'Nooit gebruikt om modellen te trainen.',
        },
      ],
    },
  },
  skills: {
    bills: 'Rekeningen en betalingen die eraan komen',
    cancel: 'Een betaald abonnement opzeggen',
    cleanup: 'Nieuwsbrieven om op te ruimen',
    followups: 'Wie jou nog een antwoord schuldig is',
    reading: 'De nieuwsbrieven van de dag in één overzicht',
    today: 'Wat vandaag op je wacht',
    waiting: 'Wie wacht op je antwoord',
    week: 'Je week in mail',
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
    imagesHidden: 'Afbeeldingen zijn verborgen in spam.',
    openFile: {
      action: 'Openen',
      description:
        'Deze e-mail staat in spam. Open de bestanden alleen als je de afzender vertrouwt.',
      title: (name: string) => `${name} openen?`,
    },
    showImages: 'Afbeeldingen tonen',
  },
  starterRules: {
    alwaysShow:
      'Beveiligingsmeldingen, rekeningen die betaald moeten worden, alles van mijn bank of de overheid',
    newsletters: 'Nieuwsbrieven en digests',
    notifications: 'Automatische meldingen van tools en diensten',
    promotions: 'Aanbiedingen, marketing en ongevraagde verkoopmails',
    receipts: 'Bonnen, bestel- en verzendbevestigingen',
  },
  telegram: {
    approveAlike: 'Alle kaarten van één soort tegelijk goedkeuren:',
    chatTaken:
      'Deze chat is al gekoppeld aan een ander Fewmail-account. Ontkoppel Telegram daar eerst (Instellingen → Integraties) en open de link dan opnieuw.',
    queueChanged: 'De kaarten zijn intussen veranderd. Dit heeft je nu nodig:',
    heard: (text: string) => `Gehoord: “${text}”`,
    voiceFailed: 'Ik kon het niet verstaan. Probeer het opnieuw of typ het.',
    help: 'Schrijf of zeg wat je nodig hebt:\n• vraag iets over je mail: ‘wanneer verlengt Netflix?’\n• zeg wat ik moet antwoorden: ‘zeg Anna dat ik morgen teken’\n• geef me een taak: ‘maak een bord voor reizen’\n• antwoord op een van mijn concepten om het aan te passen',
    canceled: 'Geannuleerd. Het concept staat weer in je wachtrij.',
    sendingIn: (seconds: number) => `Versturen over ${seconds} s`,
    undo: 'Ongedaan maken',
    commands: { queue: 'Wat jou nodig heeft' },
    connectFirst: (url: string) =>
      `Hoi! Ik ben Fewmail. Hier in Telegram laat ik je weten wanneer er dringende mail binnenkomt, laat ik zien wat jou nodig heeft en verstuur ik de antwoorden die je goedkeurt.\n\nDeze chat is nog niet gekoppeld aan je Fewmail. Het kost een minuutje:\n1. Open de instellingen van Fewmail: ${url}\n2. Tik onder Integraties op “Telegram koppelen” (onderdeel van Fewmail Pro).\n3. Telegram brengt je hier terug: druk op Start en je bent klaar.`,
    connected:
      'Gekoppeld. Ik laat het weten als er iets dringends binnenkomt.\n\n/queue: wat jou nodig heeft',
    done: 'Klaar',
    draft: 'Concept:',
    edit: 'Bewerken',
    editPrompt:
      'Stuur me de tekst die ik moet gebruiken, of zeg hoe ik het moet aanpassen, beginnend met “/”, bijv. “/formeler”.',
    newDraft: 'Nieuw concept:',
    nothing: 'Er is nu niets dat jou nodig heeft.',
    proOnly:
      'Telegram is onderdeel van Fewmail Pro. Open Instellingen → Abonnement in Fewmail om over te stappen.',
    draftClipped:
      'Hier ingekort. ‘Versturen’ verstuurt het hele concept – lees het in Fewmail.',
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
    working: 'Bezig…',
    allKinds: 'Alle',
    ruleOffer: {
      lead: 'De agent kan dit zelf doen voor passende mail. De regel blijft uit tot je ja zegt.',
      no: 'Uit laten',
      turnedOn: 'Aangezet. Wijzig het in Regels.',
      yes: 'Aanzetten',
    },
    newSender: {
      archive: 'Altijd archiveren',
      archived:
        'Nieuwe mail van deze afzender wordt gearchiveerd. Wijzig dit bij Regels.',
      keep: 'Gewoon houden',
      label: 'Nieuwe afzender',
      lead: (count: number, opened: number) =>
        `${count} e-mails in twee weken, ${opened === 0 ? 'geen geopend' : `${opened} geopend`}`,
    },
    readingNow: (total: number) =>
      plural('nl', total, {
        one: () => 'De agent leest een nieuwe e-mail',
        other: (n) => `De agent leest ${n} nieuwe e-mails`,
      }),
    allDone: 'Alles klaar. Niets heeft je nodig.',
    allDoneLead:
      'Ik blijf nieuwe mail lezen, en wat jou nodig heeft, verschijnt hier.',
    byRules: (n: number) => `Je regels hebben er ${n} afgehandeld.`,
    decisions: 'Beslissingen',
    journal: {
      approved: 'Je zei ja',
      byRule: (rule: string) => `Je regel: ${rule}`,
      failed: 'Mislukt',
      lead: 'De afgelopen 7 dagen. Elke wijziging in je mail, agenda of borden had je ja of een regel die je aanzette.',
      title: 'Gedaan in je mail',
    },
    progress: (done: number, total: number) => `${done} van ${total}`,
    readAll:
      'Ik heb ze allemaal gelezen, en zonder je ja verandert er niets in je mail.',
    worthKnowing: 'Goed om te weten',
    quick: 'Snel',
    needsLook: 'Zelf bekijken',
    tidy: {
      failed: (emails: string) =>
        `Gmail heeft ${emails} niet aangepast. Probeer het zo opnieuw.`,
      confirm: (emails: string) => `${emails} opruimen?`,
      running: 'Opruimen…',
      unsubscribeHint:
        'Een deel zijn mailinglijsten waarvoor Fewmail je afmeldt, en dat kan niet ongedaan worden gemaakt.',
      archive: (n: number) => `${n} archiveren`,
      review: 'Nakijken',
      reviewLead:
        'Elke e-mail met wat de agent zou doen en waarom. Keur goed wat klopt, houd wat moet blijven zoals het is.',
      reviewTitle: 'Kijk na wat de agent voorstelt',
      done: (n: number) => `${n} opgeruimd`,
      keep: 'Houden',
      mark_read: (n: number) => `${n} als gelezen markeren`,
      run: 'Alles goedkeuren',
      total: (n: number) => `E-mails die de agent wil opruimen: ${n}`,
      unsubscribe: (n: number) => `${n} afmelden`,
      untilYouApprove: 'Er verandert niets in je mail tot je akkoord geeft',
      spam: (n: number) => `${n} naar spam`,
      trash: (n: number) => `${n} verwijderen`,
    },
    pauseListening: 'Pauzeren',
    resumeListening: 'Hervatten',
    awaiting: 'Wacht op antwoord',
    hint: {
      notNow: 'Niet nu',
      setUp: 'Instellen',
      turnOn: 'Inschakelen',
    },
    dates: 'Data en afspraken',
    done: 'Klaar',
    firstRead:
      'Ik lees je mail van de afgelopen drie dagen. Wat jou nodig heeft, verschijnt hier vanzelf, en er verandert niets tot je ja zegt.',
    approvedMany: (n: number) => `${n} goedgekeurd`,
    listen: 'Luisteren',
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
    period: (days: number) =>
      days === 1 ? 'het afgelopen etmaal' : `de afgelopen ${days} dagen`,
    pulse: {
      lists: (n: number) => `${n} van mailinglijsten`,
      people: (n: number) => `${n} van mensen`,
      total: (total: number, period: string) =>
        plural('nl', total, {
          one: (n) => `${n} e-mail ${period}`,
          other: (n) => `${n} e-mails ${period}`,
        }),
    },
    saved: (minutes: number) =>
      `Fewmail heeft je deze week ongeveer ${formatMinutes('nl', minutes)} bespaard`,
    recent: (period: string) => `Ook ${period}`,
    sent: 'Verstuurd',
    codes: 'Inlogcodes',
    worthAttention: 'Verdient je aandacht',
  },
  upgrade: {
    ask: 'Vraag het je mail',
    hints: {
      ask: 'Onderdeel van Fewmail Pro: vraag alles in je eigen woorden en krijg het antwoord uit je eigen mail.',
      boards:
        'Onderdeel van Fewmail Pro: beschrijf wat er verzameld moet worden, en de agent vindt het in je mail en houdt het bij.',
      drafts:
        'Onderdeel van Fewmail Pro: de agent schrijft het antwoord in jouw stijl, jij past het aan en verstuurt het.',
    },
  },
  whatsapp: {
    phoneTaken:
      'Dit nummer is al gekoppeld aan een ander Fewmail-account. Ontkoppel WhatsApp daar eerst (Instellingen → Integraties) en stuur het bericht dan opnieuw.',
    connectFirst: (url: string) =>
      `Hoi! Ik ben Fewmail. Hier in WhatsApp laat ik weten wanneer er dringende mail binnenkomt, toon ik wat jou nodig heeft en verstuur ik de antwoorden die je goedkeurt.\n\nDit nummer is nog niet gekoppeld aan je Fewmail. Het kost een minuutje:\n1. Open de Fewmail-instellingen: ${url}\n2. Tik onder Integraties op “WhatsApp koppelen” (onderdeel van Fewmail Pro).\n3. WhatsApp opent met een klaargezet bericht — verstuur het en je bent klaar.`,
    connected:
      'Gekoppeld. Ik stuur je een bericht als er iets dringends binnenkomt. Stuur tekst of een spraakbericht om op een e-mail te antwoorden.',
    proOnly:
      'WhatsApp is onderdeel van Fewmail Pro. Open Instellingen → Abonnement in Fewmail om over te stappen.',
  },
  zombie: {
    badge: (share: number) => `Negeert afmeldingen bij ${share}% van de mensen`,
    reason: 'Bleef mailen nadat je je had afgemeld',
  },
}
