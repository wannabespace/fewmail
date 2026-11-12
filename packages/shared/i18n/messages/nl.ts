import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
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
    voice: 'Praat met de agent',
    voiceStop: 'Stoppen en versturen',
    chats: 'Chats',
    autonomy: {
      ask: 'Vraagt het je vóór elke e-mail',
      auto: (most: number) =>
        `Verstuurt de e-mails zelf, zonder het je te vragen (tot ${most})`,
    },
    calendar: (email: string) => `In de agenda van ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      create_schedule: 'Dit volgens een planning uitvoeren?',
      create_event: 'Deze afspraak toevoegen?',
      delete_event: 'Deze afspraak verwijderen?',
      update_event: 'Deze afspraak wijzigen?',
      approve_action: 'Deze actie uitvoeren?',
      archive_thread: 'Dit gesprek archiveren?',
      clear_out: 'Deze groepen mail uit je inbox opruimen?',
      undo_clear_out: 'Alle opgeruimde mail terug naar de inbox?',
      create_rule: 'Deze regel toevoegen?',
      handle_thread: 'Dit gesprek aan de agent overlaten?',
      reply: 'Dit antwoord versturen?',
      send_email: 'Deze e-mail versturen?',
      snooze_thread: 'Dit gesprek uitstellen?',
      unsubscribe: 'Afmelden bij deze afzender?',
      trash_thread: 'Deze thread naar de prullenbak verplaatsen?',
      report_spam: 'Deze afzender als spam melden?',
      mark_not_spam: 'Deze thread uit spam halen?',
      move_to_inbox: 'Deze thread terugzetten naar de inbox?',
    },
    decline: 'Nee',
    declined: 'Je zei nee',
    detach: 'Deze e-mail niet bijvoegen',
    deleteChat: 'Chat verwijderen',
    failed: 'De agent kon het niet afmaken. Probeer het opnieuw.',
    lead: 'Vraag iets over je mail of zeg wat er moet gebeuren. Alles wat verstuurt of Gmail wijzigt, wacht op jouw ja.',
    newChat: 'Nieuwe chat',
    closeChat: 'Tabblad sluiten',
    switchChat: 'Andere chat',
    noChats: 'Nog geen chats',
    cancelEdit: 'Bewerken annuleren',
    copy: 'Kopiëren',
    edit: 'Bewerken',
    editing: 'Je bewerkt je bericht',
    regenerate: 'Opnieuw antwoorden',
    skills: 'Skills',
    placeholder: 'Vraag iets over je mail of typ / voor skills',
    retry: 'Opnieuw proberen',
    send: 'Versturen',
    steps: {
      create_schedule: 'Planning instellen',
      delete_schedule: 'Planning stoppen',
      list_schedules: 'Planningen lezen',
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
      get_board: 'Bord lezen',
      get_person: 'Persoon opzoeken',
      get_today: 'Vandaag bekijken',
      handle_thread: 'Gesprek overdragen',
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
    stop: 'Stoppen',
    thinking: 'Denken…',
    title: 'Wat kan ik voor je doen?',
    to: (recipients: string) => `Aan ${recipients}`,
    until: (time: string) => `Tot ${time}`,
    yes: {
      create_schedule: 'Inplannen',
      create_event: 'Toevoegen',
      delete_event: 'Verwijderen',
      update_event: 'Opslaan',
      approve_action: 'Uitvoeren',
      archive_thread: 'Archiveren',
      clear_out: 'Opruimen',
      undo_clear_out: 'Terugzetten',
      create_rule: 'Toevoegen',
      handle_thread: 'Overlaten',
      reply: 'Versturen',
      send_email: 'Versturen',
      snooze_thread: 'Uitstellen',
      unsubscribe: 'Afmelden',
      trash_thread: 'Naar prullenbak',
      report_spam: 'Spam melden',
      mark_not_spam: 'Geen spam',
      move_to_inbox: 'Terugzetten',
    },
  },
  ask: {
    label: (question: string) => `Vraag Fewmail: “${question}”`,
    openChat: 'Openen in chat',
    thinking: 'Je mail doorzoeken…',
  },
  byRule: 'door een regel',
  boards: {
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
    emptyQuery: 'Het zoekt naar mail die past bij',
    entries: (total: number) =>
      plural('nl', total, {
        one: () => 'Eén item',
        other: (n) => `${n} items`,
      }),
    entry: {
      amount: 'Bedrag',
      currency: 'Valuta',
      date: 'Datum',
      edit: 'Item bewerken',
      edited: 'Door jou bewerkt',
      group: 'Wie of wat',
      next: 'Volgende datum',
      nextOn: (date: string) => `volgende: ${date}`,
      remove: 'Niet op dit bord',
      removed: 'Van het bord gehaald. Het leert ervan.',
      status: 'Status',
      title: 'Titel',
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
        `De nieuwste ${n} passende e-mails van de afgelopen zes maanden gelezen.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Mail van de afgelopen zes maanden doorzoeken…'
          : `${plural('nl', found, { one: () => 'Eén e-mail', other: (n) => `${n} e-mails` })} van de afgelopen zes maanden lezen · tot nu toe ${plural('nl', entries, { one: () => 'één item', other: (n) => `${n} items` })}`,
    },
    menu: 'Bordacties',
    moveDown: 'Omlaag',
    moveUp: 'Omhoog',
    name: 'Naam',
    namePlaceholder: 'Reizen',
    new: 'Nieuw bord',
    newHint:
      'Beschrijf in je eigen woorden wat er verzameld moet worden. Fewmail zoekt het op in de mail van de afgelopen zes maanden, kiest de grafieken en houdt het bij.',
    planning: 'Bezig met instellen…',
    redescribe: 'Opslaan en opnieuw lezen',
    redescribeHint:
      'Leest de afgelopen zes maanden opnieuw met de nieuwe beschrijving. Items die je bewerkte of weghaalde blijven.',
    rename: 'Bord hernoemen',
    save: 'Opslaan',
    settings: {
      bannerDays: 'Seintje vóór een datum',
      days: (n: number) =>
        plural('nl', n, {
          one: () => '1 dag van tevoren',
          other: (count) => `${count} dagen van tevoren`,
        }),
      hint: 'Hoe het bord zijn mail vindt en wanneer het je waarschuwt.',
      never: 'Nooit',
      query: 'Gmail-zoekopdracht',
      queryHint:
        'Als je dit aanpast, worden de afgelopen zes maanden opnieuw gelezen.',
      title: 'Zoeken en seintjes',
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
          'Betalingen, abonnementen, rekeningen en terugbetalingen: waarvoor ik betaal, aan wie en hoeveel.',
        name: 'Geld',
      },
      orders: {
        description:
          'Online bestellingen en leveringen: wat ik kocht, bij wie en waar het nu is.',
        name: 'Bestellingen',
      },
      subscriptions: {
        description:
          'Diensten waarvoor ik regelmatig betaal: wat elk kost, hoe vaak en wanneer het verlengt.',
        name: 'Betaalde abonnementen',
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
      upcoming: 'Binnen 30 dagen te betalen',
    },
  },
  bulk: {
    badge: (n: number) => `Verstuurd naar ${n}+ Fewmail-gebruikers`,
    reason: (n: number) =>
      `Massamail: ${n}+ Fewmail-gebruikers kregen dezelfde tekst`,
  },
  calendar: {
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
    busiest: (day: string, hour: string) =>
      `Drukste moment: ${day}, rond ${hour}`,
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
    split: (people: string, lists: string) =>
      `${people} van mensen · ${lists} van nieuwsbrieven`,
    title: { month: 'Jouw maand in e-mail', year: 'Jouw jaar in e-mail' },
    unsubscribed: 'nieuwsbrieven verlaten',
  },
  forward: {
    done: 'Je doorgestuurde e-mail',
  },
  reading: {
    digest: (n: number) => `Nieuwsbrieven vandaag: ${n}`,
    empty: 'Geen nieuwsbrieven in de afgelopen dag.',
    lead: 'De nieuwsbrieven van de afgelopen dag op één plek, zodat ze je inbox niet vullen.',
    title: 'Lezen',
  },
  commitments: {
    title: 'Je hebt beloofd',
  },
  compose: {
    backInQueue: 'Geannuleerd. Het concept staat weer in Vandaag.',
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
    commandsOnly: 'Voer een opdracht uit…',
    rewriteBrief: 'Overzicht opnieuw schrijven',
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
  errors: {
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
    restore: 'naar inbox',
    calendarToday: 'vandaag',
    newEvent: 'nieuwe afspraak',
    period: 'vorige / volgende',
    view: 'weergave',
    group: 'groeperen',
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
    move: 'bewegen',
    open: 'openen',
    notOnBoard: 'niet op dit bord',
    rename: 'hernoemen',
    clearFilter: 'filter wissen',
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
  limits: {
    boards: (total: number) =>
      `Je abonnement bevat ${total} borden. Verwijder er een of stap over op Max via Instellingen → Abonnement.`,
    messages: (date: string) =>
      `De berichten aan de agent zijn op voor deze maand. Ze komen terug op ${date}.`,
    tasks: (total: number) =>
      `Je abonnement neemt ${total} threads tegelijk over. Laat er een afronden of stap over op Max via Instellingen → Abonnement.`,
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
      'Fewmail vraagt toestemming om je Gmail te lezen, te ordenen en te versturen. Er wordt niets verstuurd of gearchiveerd zonder jouw akkoord, tenzij je een regel maakt die dat toestaat. Het vraagt ook om je Google Agenda, die je kunt uitvinken.',
    continue: 'Doorgaan met Google',
    lead: 'Fewmail leest je inbox voor je, antwoordt in jouw stijl en laat alleen zien wat jou echt nodig heeft.',
    messengers:
      'Werkt ook in messengers, te beginnen met Telegram: ontvang het overzicht, keur antwoorden goed of stuur gewoon een spraakbericht.',
    title: 'Alleen wat ertoe doet.',
  },
  mail: {
    openUnsubscribePage: 'Pagina openen',
    unsubscribeYourself:
      'Voor deze lijst moet je zelf afmelden op de pagina ervan. Tot dan is de mail gearchiveerd.',
    allMailboxes: 'Alle mailboxen',
    group: {
      category: 'Categorie',
      importance: 'Belang',
      none: 'Geen groepen',
      sender: 'Afzender',
      title: 'Groeperen',
    },
    unread: 'Ongelezen',
    block: 'Afzender blokkeren',
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
    attachment: 'bijlage',
    draftReply: 'Antwoord opstellen',
    drafting: 'Opstellen…',
    draftWaiting: 'Concept wacht in Vandaag',
    due: (date: string) => `vervalt ${date}`,
    dueHint: 'Deadline die de agent in deze e-mail vond',
    empty: 'Geen e-mails hier',
    emptyHint: 'Nieuwe e-mails verschijnen hier zodra ze binnenkomen.',
    expectsReply: 'Verwacht antwoord',
    filter: {
      archive: 'Archief',
      trash: 'Prullenbak',
      drafts: 'Concepten',
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
  subscriptions: {
    archivedOnly:
      'Deze afzender heeft geen afmelding met één klik, dus de mail is gearchiveerd. Blijft die komen, dan gaat ze naar spam.',
    count: (total: number) => `Mailinglijsten: ${total}`,
    empty: 'Geen mailinglijst heeft je deze maand gemaild.',
    lead: 'Mailinglijsten die je deze maand mailden, de drukste eerst. Afmelden archiveert alles wat ze stuurden; mail die twee weken later nog komt, gaat naar spam.',
    opened: (total: number) =>
      total === 0 ? 'geen enkele geopend' : `${total} geopend`,
    title: 'Abonnementen',
    unsubscribe: 'Afmelden',
    unsubscribed: 'Afgemeld',
  },
  nav: {
    calendar: 'Agenda',
    subscriptions: 'Abonnementen',
    agent: 'Agent',
    boards: 'Borden',
    newBoard: 'Nieuw bord',
    mail: 'Mail',
    reading: 'Lezen',
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
    usage: (percent: number) => `Agent · ${percent}% van deze maand gebruikt`,
    watching: 'De agent houdt je inbox in de gaten',
  },
  schedule: {
    awaitsAnswer:
      'Deze run heb ik overgeslagen: de vorige wacht in deze chat nog op je antwoord.',
    failed:
      'Deze geplande run is mislukt. Ik probeer het bij de volgende opnieuw.',
    limitReached: (day: string) =>
      `De berichten van deze maand zijn op, dus de planning slaat runs over tot ${day}.`,
    open: 'Openen in Fewmail',
    stopped:
      'Deze planning is drie keer achter elkaar mislukt, dus ik heb haar gestopt. Vraag me haar opnieuw in te stellen als je haar terug wilt.',
  },
  notifications: {
    many: (total: number) =>
      plural('nl', total, {
        other: (n) => `${n} nieuwe meldingen van Fewmail`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Pagina’s die de agent uit je mail vult, te beginnen met het laatste halfjaar. Kies er tot ${max}; eigen pagina’s kun je later toevoegen.`,
    boardsTitle: 'Wat moet de agent voor je verzamelen?',
    languageHint:
      'De app, overzichten, samenvattingen en uitleg gebruiken deze taal. Antwoorden volgen altijd de taal van de e-mail die je beantwoordt.',
    languageTitle: 'Welke taal moet Fewmail spreken?',
    lead: 'Twee snelle antwoorden. Je kunt alles later wijzigen in Instellingen.',
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
    priceYearly: (usd: number) => `$${usd} / jaar`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `${emails} e-mails en ${messages} berichten per maand; borden en overgedragen threads zonder limiet.`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `${emails} e-mails en ${messages} berichten per maand.`,
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
    emailsUsed: (used: string, total: string) => `${used} van ${total} e-mails`,
    messagesUsed: (used: string, total: string) =>
      `${used} van ${total} berichten`,
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
    askedByYou: 'Op jouw verzoek',
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
  },
  settings: {
    readingDigest: {
      description:
        'Na de briefing komen de nieuwsbrieven van de dag als één bericht in Telegram en WhatsApp.',
      title: 'Nieuwsbriefoverzicht',
    },
    voiceBrief: {
      description:
        'De briefing komt in Telegram en WhatsApp ook als spraakbericht.',
      title: 'Briefing als spraakbericht',
    },
    forward: {
      copy: 'Adres kopiëren',
      description:
        'Stuur of forward elke e-mail vanuit je eigen mailbox naar dit adres, met bovenaan een notitie wat er moet gebeuren. Het antwoord komt in Telegram of WhatsApp en in een chat hier.',
      title: 'Doorsturen naar de agent',
    },
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
      allow: 'Toestaan',
      connected: (ago: string) => `Verbonden ${ago}`,
      copy: 'URL kopiëren',
      defaultName: 'MCP-client',
      deny: 'Weigeren',
      description:
        'Ze kunnen je overzicht en mail lezen, antwoorden opstellen en die versturen nadat jij bevestigt.',
      disconnect: 'Ontkoppelen',
      paste: 'Voeg deze URL toe als connector in je app en log in bij Fewmail.',
      request: (app: string) => `${app} wil je Fewmail gebruiken`,
      title: 'Koppel Claude, Cursor of een andere MCP-client',
    },
    signedInWithGoogle: 'Ingelogd met Google',
    signOut: 'Uitloggen',
    schedules: {
      delete: 'Verwijderen',
      description:
        'Vraag de agent in de chat om iets regelmatig te doen, zoals „elke vrijdag om 17:00 de facturen van de week verzamelen”. Elke run komt in een eigen chat, waar je goedkeurt wat hij wil versturen.',
      title: 'Planningen',
    },
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
  site: {
    chapters: {
      pricing: {
        description:
          'Sorteren, regels en bescherming zijn voor altijd gratis. Pro en Max voegen alles toe wat voor je leest en schrijft; Max doet er gewoon meer van.',
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
        brief: 'Dagelijks overzicht',
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
        brief: 'In jouw taal, in Pro',
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
          'SaneBox sorteert mail in mappen en stelt op het hoogste abonnement ook antwoorden op en vat samen. Fewmail leest eerst alles en geeft je één overzicht en de paar beslissingen die alleen jij kunt nemen.',
        them: {
          brief: 'Een dagelijkse samenvatting van gefilterde mail',
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
          'Concepten worden geschreven in de taal van de e-mail die je beantwoordt. De app, het overzicht en de Telegram-bot spreken één taal naar keuze, uit vijftien.',
        question: 'Welke talen spreekt het?',
      },
      {
        answer:
          'Voorlopig accounts van Gmail en Google Workspace. Voeg meerdere mailboxen toe aan één Fewmail en hun mail komt in hetzelfde overzicht en dezelfde inbox terecht.',
        question: 'Welke e-mailaccounts werken?',
      },
    ],
    features: {
      description:
        'De stukken e-mail die vroeger een middag kostten, gedaan op de achtergrond en op een rij gezet waar je ze kunt nakijken.',
      items: {
        ask: {
          description:
            'Vraag wat je wilt in gewone woorden en krijg het antwoord uit je eigen mail, met de e-mails waar het vandaan komt.',
          title: 'Vraag het je mail',
        },
        boards: {
          description:
            'Geld, betaalde abonnementen, reizen, bestellingen: beschrijf wat je wilt bijhouden en de agent verzamelt het uit een halfjaar mail, met grafieken.',
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
        forward: {
          description:
            'Stuur een e-mail door met een notitie erboven, “zoek volgende week een moment met ze”, en de agent neemt het over.',
          title: 'Doorsturen naar de agent',
        },
        handle: {
          description:
            'Draag een thread over met een doel en de agent werkt hem af tot het einde, en vraagt het vóór elke verzending.',
          title: 'Regel dit',
        },
        reading: {
          description:
            'De nieuwsbrieven van de dag in één rustige lijst, elk samengevat in een paar zinnen.',
          title: 'Lezen',
        },
        voice: {
          description:
            'Luister naar het overzicht in Telegram, WhatsApp of de app, en antwoord de bot met een spraakbericht.',
          title: 'Luister naar het overzicht',
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
          fix: 'Eén toets meldt je af zoals een mens dat zou doen: één klik, de afmeldpagina of een e-mail. Afzenders die blijven mailen, gaan direct naar spam.',
          problem: 'Nieuwsbrieven waarvoor je je nooit hebt aangemeld.',
        },
        {
          fix: 'Lezen zet de nieuwsbrieven van de dag in één lijst, elk samengevat in een paar zinnen.',
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
          fix: 'Alleen dringende mail bereikt je in Telegram of WhatsApp. De rest wacht op het ochtendoverzicht, waar je ook naar kunt luisteren.',
          problem: 'Tijdens het eten je mail checken, voor de zekerheid.',
        },
      ],
      title: 'E-mailproblemen die je niet meer hebt.',
    },
    hero: {
      brief: {
        emphasis: 'hebben jou nodig.',
        lead: (handled: string) =>
          `Anna wacht op het contract, de factuur van Northwind moet volgende week betaald zijn en Marco wil donderdag. ${handled} nieuwsbrieven en meldingen zijn afgehandeld.`,
        tag: 'Overzicht van donderdag · 08:00',
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
      today: 'Vandaag',
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
      everythingIn: (plan: string) => `Alles uit ${plan}, plus`,
      forever: 'voor altijd',
      free: {
        description: 'Het sorteren, de regels en de bescherming. Voor altijd.',
        features: [
          'Elke e-mail gesorteerd en beoordeeld op belangrijkheid',
          'Regels in gewone woorden die archiveren, als gelezen markeren of afmelden',
          'Spamschild van de community en phishingwaarschuwingen',
          'Zombie-afzenders betrapt nadat je je hebt afgemeld',
          'Automatisch opvolgen van mail die een antwoord verwacht',
          'Uitstellen, snippets en Fewmail-labels in Gmail',
        ],
      },
      max: {
        description: 'Dezelfde agent voor een drukke inbox.',
        emails: (emails: string) => `${emails} gelezen e-mails per maand`,
        messages: (messages: number) =>
          `${messages} berichten aan de agent per maand`,
        unlimited: 'Borden en overgedragen threads zonder limiet',
      },
      monthly: 'Maandelijks',
      per: { month: 'per maand', year: 'per jaar' },
      pro: {
        description: 'De hele agent: hij leest, schrijft en onthoudt.',
        features: [
          'Vandaag: een dagelijks overzicht en één wachtrij met beslissingen',
          'Antwoorden in jouw stijl, pas verstuurd als jij akkoord geeft',
          'Telegram: het overzicht, goedkeuringen en spraakopdrachten',
          '“Regel dit”: de agent werkt een thread af tot het doel',
          'Beloftes en mensen onthouden, borden met grafieken voor geld of alles wat je bijhoudt',
          'Vraag je mail alles, plus MCP voor je eigen tools',
        ],
        limits: (emails: string, messages: number) =>
          `${emails} gelezen e-mails en ${messages} berichten aan de agent per maand; ruis telt nooit mee`,
      },
      tryFree: (days: number) => `${days} dagen gratis proberen`,
      yearly: 'Jaarlijks · 2 maanden gratis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Sorteren, regels in gewone woorden en bescherming zijn voor altijd gratis. Pro is de agent die voor je leest, schrijft en onthoudt; Max is dezelfde agent met ruimte voor een drukke inbox. Elk account begint met ${trialDays} dagen Pro, en daarna blijf je gewoon op Gratis.`,
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
  },
  starterRules: {
    alwaysShow:
      'Beveiligingsmeldingen, rekeningen die betaald moeten worden, alles van mijn bank of de overheid',
    newsletters: 'Nieuwsbrieven en digests',
    notifications: 'Automatische meldingen van tools en diensten',
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
    approveAlike: 'Alle kaarten van één soort tegelijk goedkeuren:',
    listen: '🔊 Luisteren',
    heard: (text: string) => `Gehoord: “${text}”`,
    voiceFailed: 'Ik kon het niet verstaan. Probeer het opnieuw of typ het.',
    help: 'Schrijf of zeg wat je nodig hebt:\n• vraag iets over je mail: ‘wanneer verlengt Netflix?’\n• zeg wat ik moet antwoorden: ‘zeg Anna dat ik morgen teken’\n• geef me een taak: ‘maak een bord voor reizen’\n• antwoord op een van mijn concepten om het aan te passen',
    canceled: 'Geannuleerd. Het concept staat weer in je wachtrij.',
    sendingIn: (seconds: number) => `Versturen over ${seconds} s`,
    undo: 'Ongedaan maken',
    commands: { brief: 'Overzicht van vandaag', queue: 'Wat jou nodig heeft' },
    connectFirst:
      'Open eerst Fewmail → Instellingen → Integraties en tik op “Telegram koppelen”.',
    connected:
      'Gekoppeld. Ik stuur je elke ochtend je overzicht en laat het weten als er iets dringends binnenkomt.\n\n/brief: overzicht van vandaag\n/queue: wat jou nodig heeft',
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
    awaiting: 'Wacht op antwoord',
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
    briefAt: (time: string) => `dagelijks overzicht om ${time}`,
    dates: 'Data en afspraken',
    done: 'Klaar',
    firstRead:
      'Ik lees je mail van de afgelopen drie dagen. Wat jou nodig heeft, verschijnt hier vanzelf.',
    approvedMany: (n: number) => `${n} goedgekeurd`,
    listen: 'Naar de briefing luisteren',
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
    savedHow: (handled: number, replies: number) =>
      `Zelf afgehandeld: ${handled} · Antwoorden verstuurd vanuit concepten: ${replies}`,
    recent: (period: string) => `Ook ${period}`,
    sent: 'Verstuurd',
    worthAttention: 'Verdient je aandacht',
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
