import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const pl: Messages = {
  actionKind: {
    cleanup: 'Wypisz ze wszystkich',
    commitment: 'Gotowe',
    security: 'Sprawdziłem',
    task: 'Wyślij',
    spam: 'Przeniesiono do spamu',
    archive: 'Archiwizuj',
    follow_up: 'Przypomnij się',
    mark_read: 'Oznacz jako przeczytane',
    pay: 'Zapłać',
    read: 'Przeczytaj',
    reply: 'Odpowiedz',
    schedule: 'Zaplanuj',
    trash: 'Przenieś do kosza',
    unsubscribe: 'Wypisz się',
  },
  actionStatus: {
    auto_done: 'zrobione przez agenta',
    dismissed: 'pominięte',
    done: 'zrobione',
    failed: 'nie udało się',
    pending: 'czeka w Dziś',
  },
  agent: {
    chats: 'Czaty',
    confirm: {
      approve_action: 'Wykonać tę akcję?',
      archive_thread: 'Zarchiwizować ten wątek?',
      create_rule: 'Dodać tę regułę?',
      handle_thread: 'Przekazać ten wątek agentowi?',
      reply: 'Wysłać tę odpowiedź?',
      send_email: 'Wysłać tego e-maila?',
      snooze_thread: 'Odłożyć ten wątek?',
      unsubscribe: 'Wypisać się od tego nadawcy?',
    },
    decline: 'Nie',
    declined: 'Odmówiono',
    deleteChat: 'Usuń czat',
    failed: 'Agent nie dał rady dokończyć. Spróbuj ponownie.',
    lead: 'Pytaj o swoją pocztę albo powiedz, co zrobić. Wszystko, co wysyła lub zmienia Gmaila, czeka na twoje „tak”.',
    newChat: 'Nowy czat',
    noChats: 'Nie ma jeszcze czatów',
    placeholder: 'Zapytaj o pocztę albo powiedz, co zrobić…',
    retry: 'Spróbuj ponownie',
    send: 'Wyślij',
    steps: {
      list_subscriptions: 'Sprawdzam subskrypcje',
      approve_action: 'Wykonuję',
      archive_thread: 'Archiwizuję',
      create_rule: 'Dodaję regułę',
      dismiss_action: 'Pomijam',
      draft_reply: 'Piszę odpowiedź',
      create_draft: 'Zapisuję szkic',
      get_board: 'Czytam tablicę',
      get_person: 'Szukam osoby',
      get_today: 'Sprawdzam dzisiejsze',
      handle_thread: 'Przekazuję wątek',
      list_boards: 'Otwieram tablice',
      list_mail: 'Przeszukuję pocztę',
      list_rules: 'Czytam reguły',
      read_thread: 'Czytam wątek',
      redraft_action: 'Przepisuję szkic',
      refresh: 'Sprawdzam nową pocztę',
      send_email: 'Wysyłam',
      snooze_thread: 'Odkładam',
      unsubscribe: 'Wypisuję',
    },
    stop: 'Zatrzymaj',
    thinking: 'Myślę…',
    title: 'W czym mogę pomóc?',
    to: (recipients: string) => `Do: ${recipients}`,
    until: (time: string) => `Do ${time}`,
    yes: {
      approve_action: 'Wykonaj',
      archive_thread: 'Archiwizuj',
      create_rule: 'Dodaj',
      handle_thread: 'Przekaż',
      reply: 'Wyślij',
      send_email: 'Wyślij',
      snooze_thread: 'Odłóż',
      unsubscribe: 'Wypisz się',
    },
  },
  ask: {
    label: (question: string) => `Zapytaj Fewmail: „${question}”`,
    thinking: 'Przeglądam twoją pocztę…',
  },
  byRule: 'przez regułę',
  boards: {
    chart: {
      add: 'Dodaj wykres',
      edit: 'Ustawienia wykresu',
      empty: 'Na razie nie ma czego narysować',
      groupBy: 'Grupowanie',
      groupings: {
        group: 'Kto lub co',
        month: 'Miesiąc',
        status: 'Status',
        week: 'Tydzień',
      },
      measure: 'Pokazuje',
      measures: { count: 'Liczba', sum: 'Łączna kwota' },
      other: 'Inne',
      remove: 'Usuń wykres',
      title: 'Tytuł wykresu',
      type: 'Rodzaj wykresu',
      types: {
        area: 'Warstwowy',
        bar: 'Słupki',
        line: 'Linia',
        pie: 'Kołowy',
      },
      untitled: 'Nowy wykres',
    },
    charts: 'Wykresy',
    create: 'Utwórz tablicę',
    delete: 'Usuń tablicę',
    description: 'Co zbiera',
    descriptionPlaceholder:
      'Podróże: loty, hotele i wynajem aut, razem z kosztami',
    edit: 'Edytuj tablicę',
    editHint:
      'Jeśli zmienisz, co zbiera, ostatnie pół roku zostanie przeczytane od nowa.',
    empty: 'Na razie pusto. Pasujące maile pojawią się tu, gdy tylko przyjdą.',
    entries: (total: number) =>
      plural('pl', total, {
        one: () => 'Jeden wpis',
        few: (n) => `${n} wpisy`,
        many: (n) => `${n} wpisów`,
        other: (n) => `${n} wpisu`,
      }),
    name: 'Nazwa',
    namePlaceholder: 'Podróże',
    new: 'Nowa tablica',
    newHint:
      'Opisz własnymi słowami, co zbierać. Fewmail znajdzie to w poczcie z ostatniego pół roku, dobierze wykresy i będzie je aktualizować.',
    planning: 'Przygotowuję…',
    readingHistory: 'Czytam pocztę z ostatniego pół roku…',
    save: 'Zapisz',
    starter: {
      events: {
        description:
          'Bilety, rezerwacje i wizyty: gdzie mam być, kiedy i z kim.',
        name: 'Wydarzenia',
      },
      money: {
        description:
          'Płatności, subskrypcje, rachunki i zwroty: za co płacę, komu i ile.',
        name: 'Pieniądze',
      },
      orders: {
        description:
          'Zamówienia online i dostawy: co kupiłem, u kogo i gdzie teraz jest.',
        name: 'Zamówienia',
      },
      trips: {
        description:
          'Loty, pociągi, hotele i wynajem: dokąd jadę, kiedy i ile to kosztuje.',
        name: 'Podróże',
      },
    },
  },
  bulk: {
    badge: (n: number) => `Wysłane do ${n}+ użytkowników Fewmail`,
    reason: (n: number) =>
      `Masowy e-mail: ${n}+ użytkowników Fewmail dostało ten sam tekst`,
  },
  category: {
    calendar: 'Kalendarz',
    finance: 'Finanse',
    newsletter: 'Newsletter',
    notification: 'Powiadomienie',
    other: 'Inne',
    person: 'Osoba',
    promotion: 'Promocja',
    receipt: 'Paragon',
    security: 'Bezpieczeństwo',
    travel: 'Podróże',
    work: 'Praca',
  },
  cleanup: {
    emails: (total: number) =>
      plural('pl', total, {
        one: () => '1 e-mail',
        few: (n) => `${n} e-maile`,
        many: (n) => `${n} e-maili`,
        other: (n) => `${n} e-maila`,
      }),
    reason: (total: number) =>
      `E-maile w tym miesiącu: ${total}, żaden nie otwarty`,
    title: (total: number) =>
      plural('pl', total, {
        one: () => 'Wypisz się z newslettera, którego nigdy nie otwierasz',
        few: (n) =>
          `Wypisz się z ${n} newsletterów, których nigdy nie otwierasz`,
        many: (n) =>
          `Wypisz się z ${n} newsletterów, których nigdy nie otwierasz`,
        other: (n) =>
          `Wypisz się z ${n} newslettera, którego nigdy nie otwierasz`,
      }),
  },
  commitments: {
    title: 'Obiecałeś',
  },
  compose: {
    backInQueue: 'Anulowano. Szkic wrócił do Dziś.',
    canceled: 'Anulowano. Twój e-mail wrócił do edytora.',
    cc: 'DW',
    discard: 'Odrzuć',
    draftSaved: 'Szkic zapisany',
    saveDraft: 'Zapisz szkic',
    forward: 'Przekaż',
    forwardedMessage: 'Przekazana wiadomość',
    from: 'Od',
    instructionPlaceholder: 'Jak ma brzmieć? (opcjonalnie)',
    invalidRecipients: 'Dodaj co najmniej jeden poprawny adres e-mail.',
    later: {
      inHour: 'Za godzinę',
      monday: 'W poniedziałek rano',
      tomorrow: 'Jutro rano',
    },
    new: 'Nowy e-mail',
    placeholder: 'Napisz e-mail…',
    remind: {
      days: (total: number) =>
        plural('pl', total, {
          one: () => 'Przypomnij, jeśli brak odpowiedzi przez dzień',
          few: (n) => `Przypomnij, jeśli brak odpowiedzi przez ${n} dni`,
          many: (n) => `Przypomnij, jeśli brak odpowiedzi przez ${n} dni`,
          other: (n) => `Przypomnij, jeśli brak odpowiedzi przez ${n} dnia`,
        }),
      label: 'Przypomnij',
      off: 'Bez przypomnienia',
    },
    reply: 'Odpowiedz',
    scheduledFor: (date: string) => `Zaplanowano na ${date}`,
    send: 'Wyślij',
    sendLater: 'Wyślij później',
    sendingIn: (seconds: number) => `Wysyłanie za ${seconds} s`,
    subject: 'Temat',
    to: 'Do',
    undo: 'Cofnij',
    writeForMe: 'Napisz za mnie',
    writing: 'Piszę…',
  },
  command: {
    compose: 'Nowy e-mail',
    agent: 'Agent',
    appearance: 'Wygląd',
    checkMail: 'Sprawdź nową pocztę',
    goTo: 'Przejdź do',
    inboxUpToDate: 'Skrzynka jest aktualna',
    mail: 'Poczta',
    nothingMatches: 'Brak wyników.',
    placeholder: 'Szukaj w poczcie lub wpisz polecenie…',
    rewriteBrief: 'Napisz podsumowanie od nowa',
    searchFor: (query: string) => `Szukaj w poczcie „${query}”`,
    teachRule: 'Naucz nowej reguły',
    upgrade: 'Przejdź na Pro',
    theme: {
      dark: 'Motyw ciemny',
      light: 'Motyw jasny',
      system: 'Motyw systemowy',
    },
  },
  composer: {
    acceptSuggestion: 'Tab, by przyjąć',
    bold: 'Pogrubienie',
    bulletList: 'Lista punktowana',
    italic: 'Kursywa',
    link: 'Link',
    linkPlaceholder: 'Wklej lub wpisz link',
    noSnippets: 'Brak pasujących fragmentów.',
    removeLink: 'Usuń link',
  },
  importance: ['Szum', 'Warto wiedzieć', 'Wkrótce czeka na ciebie', 'Pilne'],
  justNow: 'przed chwilą',
  keys: {
    unsubscribe: 'wypisz się',
    filter: 'filtr',
    reply: 'odpowiedz',
    snooze: 'odłóż',
    anything: 'cokolwiek',
    approve: 'zatwierdź',
    archive: 'archiwizuj',
    close: 'zamknij',
    draftReply: 'szkic odpowiedzi',
    edit: 'edytuj',
    move: 'przejdź',
    open: 'otwórz',
    search: 'szukaj',
    send: 'wyślij',
    skip: 'pomiń',
    stopEditing: 'zakończ edycję',
  },
  legal: {
    privacy: 'Polityka prywatności',
    englishOnly:
      'Ten dokument jest udostępniony w języku angielskim, który jest wersją wiążącą.',
    terms: 'Warunki korzystania',
    updated: (date: string) => `Ostatnia aktualizacja: ${date}`,
  },
  limits: {
    boards: (total: number) =>
      `Twój plan obejmuje ${total} tablice. Usuń jedną albo przejdź na Max w Ustawieniach → Plan.`,
    messages: (date: string) =>
      `Wiadomości do agenta na ten miesiąc się skończyły. Wrócą ${date}.`,
    tasks: (total: number) =>
      `Twój plan prowadzi ${total} wątków naraz. Poczekaj, aż jeden się skończy, albo przejdź na Max w Ustawieniach → Plan.`,
  },
  login: {
    agree: ((slots) => [
      'Kontynuując, akceptujesz ',
      slots.terms,
      ' i ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail prosi o dostęp do czytania, porządkowania i wysyłania poczty Gmail w twoim imieniu. Nic nie zostanie wysłane ani zarchiwizowane bez twojej zgody, chyba że ustawisz regułę, która na to pozwala.',
    continue: 'Kontynuuj z Google',
    lead: 'Fewmail czyta twoją skrzynkę za ciebie, odpowiada twoim głosem i pokazuje tylko to, co naprawdę wymaga twojej uwagi.',
    messengers:
      'Działa też w komunikatorach, na początek w Telegramie: odbieraj podsumowanie, zatwierdzaj odpowiedzi albo po prostu nagraj głosówkę.',
    title: 'Tylko to, co ważne.',
  },
  mail: {
    allMailboxes: 'Wszystkie skrzynki',
    unread: 'Nieprzeczytane',
    block: 'Zablokuj nadawcę',
    blocked: 'Zablokowano. Jego poczta trafia teraz do kosza.',
    forward: 'Przekaż',
    more: 'Więcej',
    reply: 'Odpowiedz',
    trash: 'Przenieś do kosza',
    trashed: 'Przeniesiono do kosza',
    movedToInbox: 'Przywrócono do odebranych. Dzięki za informację.',
    noThread: 'Wybierz e-mail, aby go tu przeczytać',
    deleteDraft: 'Usuń szkic',
    noRecipients: 'Brak odbiorców',
    notSpam: 'To nie spam',
    reportSpam: 'Zgłoś spam',
    reportedSpam: 'Zgłoszono. Jego poczta trafia teraz do spamu.',
    archive: 'Archiwizuj',
    archived: 'Zarchiwizowano',
    attachment: 'załącznik',
    draftReply: 'Szkic odpowiedzi',
    drafting: 'Piszę…',
    draftWaiting: 'Szkic czeka w Dziś',
    due: (date: string) => `termin ${date}`,
    empty: 'Brak maili.',
    expectsReply: 'Czeka na odpowiedź',
    filter: {
      drafts: 'Szkice',
      spam: 'Spam',
      inbox: 'Odebrane',
      snoozed: 'Odłożone',
      important: 'Ważne',
      needs_reply: 'Do odpowiedzi',
      quiet: 'Ciche',
    },
    instruction:
      'Powiedz agentowi, jak odpowiedzieć, albo po prostu naciśnij Enter',
    open: 'Otwórz',
    search: 'Szukaj lub opisz: faktury od Anny z zeszłego miesiąca',
    openInGmail: 'Otwórz w Gmailu',
    unsubscribe: 'Wypisz się',
    unsubscribed: 'Wypisano',
    unsubscribeFailed:
      'Ten nadawca nie obsługuje wypisania jednym kliknięciem, więc e-mail został zarchiwizowany.',
    you: 'Ty',
  },
  subscriptions: {
    archivedOnly:
      'Ten nadawca nie ma wypisania jednym kliknięciem, więc jego poczta została zarchiwizowana. Jeśli dalej będzie przychodzić, trafi do spamu.',
    count: (total: number) => `Listy mailingowe: ${total}`,
    empty: 'W tym miesiącu nie pisała do ciebie żadna lista mailingowa.',
    lead: 'Listy mailingowe, które pisały do ciebie w tym miesiącu, od najaktywniejszych. Wypisanie archiwizuje wszystko, co wysłały; poczta, która przychodzi jeszcze po dwóch tygodniach, trafia do spamu.',
    opened: (total: number) =>
      total === 0 ? 'żaden nie otwarty' : `otwarte: ${total}`,
    title: 'Subskrypcje',
    unsubscribe: 'Wypisz się',
    unsubscribed: 'Wypisano',
  },
  nav: {
    subscriptions: 'Subskrypcje',
    agent: 'Agent',
    boards: 'Tablice',
    newBoard: 'Nowa tablica',
    mail: 'Poczta',
    rules: 'Reguły',
    search: 'Szukaj lub zapytaj…',
    settings: 'Ustawienia',
    syncFailed: 'Synchronizacja z Gmailem nie powiodła się, ponawiam',
    syncing: 'Czytam twoją skrzynkę…',
    today: 'Dziś',
    trialLeft: (total: number) =>
      plural('pl', total, {
        one: () => 'Okres próbny Pro · został 1 dzień',
        few: (n) => `Okres próbny Pro · zostały ${n} dni`,
        many: (n) => `Okres próbny Pro · zostało ${n} dni`,
        other: (n) => `Okres próbny Pro · zostało ${n} dnia`,
      }),
    usage: (percent: number) => `Agent · wykorzystano ${percent}% miesiąca`,
    watching: 'Agent pilnuje twojej skrzynki',
  },
  schedule: {
    failed:
      'To zaplanowane uruchomienie się nie powiodło. Spróbuję ponownie przy następnym.',
    limitReached: (day: string) =>
      `Wiadomości na ten miesiąc się skończyły, więc harmonogram pomija uruchomienia do ${day}.`,
    open: 'Otwórz w Fewmail',
    stopped:
      'Ten harmonogram zawiódł trzy razy z rzędu, więc go zatrzymałem. Poproś mnie o ponowne ustawienie, gdy będziesz chcieć.',
  },
  notifications: {
    many: (total: number) =>
      plural('pl', total, {
        one: (n) => `${n} nowe powiadomienie z Fewmail`,
        few: (n) => `${n} nowe powiadomienia z Fewmail`,
        other: (n) => `${n} nowych powiadomień z Fewmail`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Strony, które agent wypełnia z twojej poczty, zaczynając od ostatniego pół roku. Wybierz do ${max}; własne dodasz później.`,
    boardsTitle: 'Co agent ma dla ciebie zbierać?',
    languageHint:
      'W tym języku działa aplikacja, podsumowania i wyjaśnienia. Odpowiedzi zawsze są w języku maila, na który odpowiadasz.',
    languageTitle: 'W jakim języku ma mówić Fewmail?',
    lead: 'Dwie szybkie odpowiedzi. Wszystko zmienisz później w Ustawieniach.',
    reading: 'Czytam twoją skrzynkę…',
    start: 'Zaczynamy',
    title: 'Skonfigurujmy twojego agenta.',
  },
  plan: {
    free: 'Free',
    freeDescription:
      'Szybka, spokojna poczta z prostymi regułami. Za darmo, jak długo chcesz.',
    includes:
      'Pro dodaje agenta: codzienne podsumowanie, każdy e-mail przeczytany i streszczony, odpowiedzi pisane twoim stylem, reguły zwykłymi słowami, Telegram i MCP.',
    manage: 'Zarządzaj płatnościami',
    price: (usd: number) => `$${usd} / miesiąc`,
    priceYearly: (usd: number) => `$${usd} / rok`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `${emails} e-maili i ${messages} wiadomości miesięcznie; tablice i przekazane wątki bez limitu.`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `${emails} e-maili i ${messages} wiadomości miesięcznie.`,
    cancels: (plan: string, date: string) => `${plan} do ${date}, potem Free.`,
    choose: (plan: string) => `Wybierz ${plan}`,
    proRenews: (date: string) => `Odnowienie ${date}.`,
    resets: (date: string) => `Odnowi się ${date}.`,
    title: 'Plan',
    trial: 'Okres próbny Pro',
    welcome: (plan: string) => `Witaj w ${plan}. Agent wraca do pracy.`,
    yearly: 'Płać rocznie',
    yearlyHint: 'Dwa miesiące gratis.',
    emailsUsed: (used: string, total: string) => `${used} z ${total} e-maili`,
    messagesUsed: (used: string, total: string) =>
      `${used} z ${total} wiadomości`,
    trialDescription: (date: string) =>
      `Wszystko z Pro do ${date}, potem za darmo. Bez karty.`,
    upgrade: 'Inne plany',
    usage: 'W tym miesiącu',
  },
  people: {
    firstContact: (date: string) => `Piszecie od ${date}`,
    lastContact: (date: string) => `Ostatni e-mail: ${date}`,
    open: 'Otwórz korespondencję',
    promised: 'Obiecałeś',
    threads: (total: number) =>
      plural('pl', total, {
        one: () => '1 rozmowa',
        few: (n) => `${n} rozmowy`,
        many: (n) => `${n} rozmów`,
        other: (n) => `${n} rozmowy`,
      }),
  },
  queue: {
    draftedInVoice: 'Napisane twoim głosem',
    edit: 'Edytuj',
    open: 'Otwórz',
    send: 'Wyślij',
    shorter: 'Krócej',
    shorterInstruction: 'Skróć to.',
    skip: 'Pomiń',
  },
  reminders: {
    followUp: 'Przypomnij się',
    noReply: 'Brak odpowiedzi',
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} jest na publicznej liście aktywnych stron phishingowych. Nie klikaj linków, nie loguj się i nie płać.`,
    lookalike_domain: (domain: string) =>
      `Wygląda jak ${domain}, ale to inny adres. Nie klikaj linków i nie płać.`,
    new_sender_payment: (domain: string) =>
      `Pierwszy e-mail od ${domain} i od razu prośba o pieniądze. Sprawdź to kanałem, któremu już ufasz.`,
    spoofed_sender: (domain: string) =>
      `Podaje się za ${domain}, ale ${domain} tego nie wysłał. Nie klikaj linków i nie płać.`,
    payment_change: (domain: string) =>
      `Nowe dane do płatności od ${domain}. Potwierdź telefonicznie przed zapłatą.`,
    title: 'Sprawdź, zanim zareagujesz',
  },
  rules: {
    add: 'Dodaj regułę',
    count: (total: number) =>
      plural('pl', total, {
        one: (n) => `${n} reguła`,
        few: (n) => `${n} reguły`,
        many: (n) => `${n} reguł`,
        other: (n) => `${n} reguły`,
      }),
    delete: 'Usuń',
    describe: {
      alwaysShow: 'Zawsze trafia do Dziś',
      autonomous: 'Robione samo, widoczne w załatwionych',
      draft: 'Szkic czeka na ciebie w Dziś',
    },
    effect: {
      always_show: 'Zawsze pokazuj',
      archive: 'Archiwizuj',
      draft_reply: 'Przygotuj szkic odpowiedzi',
      mark_read: 'Oznacz jako przeczytane',
      trash: 'Przenieś do kosza',
      unsubscribe: 'Wypisz się',
    },
    enabled: 'Reguła włączona',
    lead: 'Powiedz agentowi zwykłymi słowami, co robić z określonymi mailami. Sprawdza każdy mail według tych reguł, od góry do dołu.',
    newTitle: 'Naucz nowej reguły',
    leadFree:
      'Archiwizuj, oznaczaj jako przeczytane lub wypisuj się automatycznie. Reguły działają na nowej poczcie, gdy tylko przychodzi.',
    placeholder: 'np. Faktury od Hetzner albo powiadomienia z LinkedIn',
    simple: {
      appliedAutomatically: 'Stosowana automatycznie do nowej poczty',
      field: {
        from: 'Od',
        mailingList: 'Dowolna lista mailingowa',
        subject: 'Temat zawiera',
      },
      title: {
        from: (value: string) => `Od „${value}”`,
        mailingList: () => 'Dowolna lista mailingowa',
        subject: (value: string) => `Temat zawiera „${value}”`,
      },
      valuePlaceholder: 'anna@example.com, imię lub słowo',
      whichField: 'Dopasuj według',
    },
    title: 'Reguły',
    whatAgentDoes: 'Co robi agent',
    whichEmails: 'Które maile',
  },
  settings: {
    account: 'Konto',
    agent: 'Agent',
    briefDescription: (timezone: string) =>
      `W twojej strefie czasowej, ${timezone}`,
    briefTitle: 'Codzienne podsumowanie',
    deleteAccount: 'Usuń konto',
    deleteConfirm: 'Usuń wszystko',
    deleteDescription:
      'Od razu usuwa z Fewmail twoje konto, zsynchronizowaną pocztę, szkice, reguły i podsumowania. Twój Gmail pozostaje nietknięty.',
    deleteTitle: 'Usunąć konto Fewmail?',
    cancel: 'Anuluj',
    integrations: 'Integracje',
    knowledge: {
      description:
        'Ceny, adresy, dostępność, jak lubisz odpowiadać. Agent używa tego w szkicach i autouzupełnianiu.',
      placeholder:
        'np. Konsultacje kosztują $150/h. Nie odbieram telefonów w piątki. Mój adres to…',
      title: 'Co agent powinien wiedzieć',
    },
    labels: {
      description:
        'Sortuj pocztę w etykiety Fewmail/…, żeby Gmail w telefonie pokazywał tę samą kolejność.',
      title: 'Etykiety agenta w Gmailu',
    },
    language: 'Język',
    languageDescription:
      'Aplikacja, podsumowania i streszczenia. Odpowiedzi w języku maila.',
    legal: 'Informacje prawne',
    mailboxes: {
      add: 'Dodaj Gmail',
      addDescription:
        'Poczta z innego konta Gmail trafia do tego samego Dziś i skrzynki odbiorczej. Nie da się nim tu zalogować: logowanie nim otwiera osobny Fewmail.',
      added: 'Skrzynka dodana. Poczta pojawi się za minutę.',
      failed:
        'Nie udało się dodać skrzynki. Zezwól na dostęp do Gmaila i spróbuj ponownie.',
      lost: 'Utracono dostęp do Gmaila. Dodaj skrzynkę ponownie, aby ją połączyć.',
      reading: 'Czytam pocztę…',
      remove: 'Usuń',
      signIn: 'Logujesz się tym kontem',
      signInChosen: 'Tym kontem się logujesz. Wybierz inne.',
      synced: (ago: string) => `Zsynchronizowano ${ago}`,
      title: 'Skrzynki',
    },
    mcp: {
      copyNow:
        'Skopiuj tę konfigurację teraz: klucz jest pokazywany tylko raz.',
      create: 'Utwórz klucz',
      defaultName: 'Klient MCP',
      description:
        'Mogą czytać twoje podsumowanie i pocztę, pisać szkice odpowiedzi i wysyłać je po twoim potwierdzeniu.',
      keyName: 'Nazwa klucza',
      neverUsed: 'Nigdy nieużyty',
      revoke: 'Unieważnij',
      title: 'Połącz Claude, Cursor lub dowolnego klienta MCP',
      used: (ago: string) => `Użyty ${ago}`,
    },
    signedInWithGoogle: 'Zalogowano przez Google',
    signOut: 'Wyloguj się',
    schedules: {
      delete: 'Usuń',
      description:
        'Poproś agenta na czacie, by robił coś regularnie, np. „w każdy piątek o 17:00 zbierz faktury z tygodnia”. Każde uruchomienie trafia do osobnego czatu, gdzie zatwierdzasz wszystko, co chce wysłać.',
      title: 'Harmonogramy',
    },
    snippets: {
      add: 'Dodaj fragment',
      body: 'Tekst',
      delete: 'Usuń',
      description: 'Wpisz ; w edytorze, by wstawić fragment po nazwie.',
      name: 'Nazwa',
      title: 'Fragmenty',
    },
    notifications: {
      blocked:
        'Powiadomienia są zablokowane. Zezwól na nie w ustawieniach witryny w przeglądarce.',
      browser: 'Ta przeglądarka',
      notConfigured:
        'Powiadomienia przeglądarki nie są skonfigurowane na tym serwerze.',
      off: 'Odbieraj tutaj pilne maile i codzienne podsumowanie, nawet gdy Fewmail jest zamknięty.',
      on: 'Pilne maile i codzienne podsumowanie pojawiają się tutaj. Kilka naraz przychodzi jako jedno.',
      title: 'Powiadomienia',
      unsupported: 'Ta przeglądarka nie może wyświetlać powiadomień.',
    },
    telegram: {
      connect: 'Połącz Telegram',
      disconnect: 'Rozłącz',
      linked:
        'Podsumowanie przychodzi co rano, pilne maile od razu. Zatwierdzaj i edytuj szkice na czacie.',
      notConfigured: 'Bot Telegram nie jest skonfigurowany na tym serwerze.',
      unlinked: 'Odbieraj podsumowanie i zatwierdzaj szkice w Telegramie.',
    },
    whatsapp: {
      connect: 'Połącz WhatsApp',
      disconnect: 'Rozłącz',
      linked:
        'Podsumowanie przychodzi co rano, pilne maile od razu. Zatwierdzaj i edytuj szkice na czacie.',
      notConfigured: 'Bot WhatsApp nie jest skonfigurowany na tym serwerze.',
      unlinked: 'Odbieraj podsumowanie i zatwierdzaj szkice w WhatsAppie.',
    },
    title: 'Ustawienia',
  },
  skills: {
    bills: 'Rachunki i płatności do zapłaty',
    cleanup: 'Newslettery do uprzątnięcia',
    followups: 'Kto jeszcze ci nie odpisał',
    today: 'Co czeka na ciebie dziś',
    waiting: 'Kto czeka na twoją odpowiedź',
    week: 'Twój tydzień w poczcie',
  },
  snooze: {
    laterToday: 'Później dziś',
    nextWeek: 'W przyszłym tygodniu',
    title: 'Odłóż',
    tomorrow: 'Jutro',
    unsnooze: 'Wróć do odebranych',
    until: (date: string) => `Odłożone do ${date}`,
    weekend: 'W ten weekend',
  },
  spam: {
    reasonList: 'Na publicznej liście domen spamerów',
    reasonPattern: {
      auth: 'Nieudane uwierzytelnienie nadawcy: adres jest podrobiony',
      infra:
        'Wysłane z sieci zgłoszonej jako spam przez kilku użytkowników Fewmail',
      link: 'Linki do stron zgłoszonych jako spam przez kilku użytkowników Fewmail',
      signals: 'Nowa domena, dziwny adres i słabe uwierzytelnienie naraz',
      template:
        'Ten sam tekst zgłoszony jako spam przez kilku użytkowników Fewmail',
    },
    reasonCommunity: 'Zgłoszone jako spam przez kilku użytkowników Fewmail',
    reasonYou: 'Zgłosiłeś tego nadawcę jako spam',
    suspect: 'Wygląda na spam',
  },
  starterRules: {
    alwaysShow:
      'Alerty bezpieczeństwa, rachunki do zapłaty, wszystko od mojego banku lub urzędów',
    newsletters: 'Newslettery i zestawienia',
    notifications: 'Automatyczne powiadomienia z narzędzi i serwisów',
    promotions: 'Promocje, marketing i niezamówione oferty sprzedażowe',
    receipts: 'Paragony, potwierdzenia zamówień i wysyłek',
  },
  tasks: {
    active: (goal: string) => `Agent się tym zajmuje: ${goal}`,
    auto: 'Wysyłaj e-maile bez pytania',
    autoHint: 'Każdy e-mail i tak czeka kilka sekund, żebyś mógł go cofnąć.',
    cancel: 'Zatrzymaj',
    done: 'Zadanie wykonane',
    goal: 'Co agent ma osiągnąć?',
    goalPlaceholder:
      'np. Poproś o ponowne wysłanie faktury z naszym nowym adresem',
    handle: 'Zajmij się tym…',
    next: 'Następny krok',
    start: 'Zacznij',
    started: 'Agent się tym zajmuje.',
  },
  telegram: {
    heard: (text: string) => `Usłyszałem: „${text}”`,
    voiceFailed:
      'Nie udało mi się tego zrozumieć. Spróbuj jeszcze raz albo napisz.',
    help: 'Napisz albo powiedz, czego potrzebujesz:\n• zapytaj o pocztę: „kiedy odnawia się Netflix?”\n• powiedz, co odpisać: „napisz Annie, że podpiszę jutro”\n• odpowiedz na mój szkic, żeby go zmienić',
    canceled: 'Anulowano. Szkic wrócił do kolejki.',
    sendingIn: (seconds: number) => `Wysyłanie za ${seconds} s`,
    undo: 'Cofnij',
    commands: { brief: 'Dzisiejsze podsumowanie', queue: 'Co czeka na ciebie' },
    connectFirst:
      'Najpierw otwórz Fewmail → Ustawienia → Integracje i stuknij „Połącz Telegram”.',
    connected:
      'Połączono. Będę wysyłać podsumowanie co rano i dam znać, gdy przyjdzie coś pilnego.\n\n/brief — dzisiejsze podsumowanie\n/queue — co czeka na ciebie',
    done: 'Gotowe',
    draft: 'Szkic:',
    edit: 'Edytuj',
    editPrompt:
      'Wyślij mi tekst, którego mam użyć, albo powiedz, jak go zmienić, zaczynając od „/”, np. „/bardziej formalnie”.',
    newDraft: 'Nowy szkic:',
    nothing: 'Nic teraz na ciebie nie czeka.',
    proOnly:
      'Telegram jest częścią Fewmail Pro. Otwórz Ustawienia → Plan w Fewmail, aby przejść na Pro.',
    queueHint: '/queue — co czeka na ciebie',
    rewriting: 'Przepisuję…',
    send: 'Wyślij',
    sendThis: 'Wyślij to',
    shorter: 'Krócej',
    skip: 'Pomiń',
    skipped: 'Pominięto',
    somethingWrong: 'Coś poszło nie tak',
    urgent: 'Pilne',
    willSend: 'Wyślę:',
  },
  today: {
    awaiting: 'Czekasz na odpowiedź',
    hint: {
      notNow: 'Nie teraz',
      setUp: 'Skonfiguruj',
      turnOn: 'Włącz',
    },
    later: (total: number, time: string) =>
      plural('pl', total, {
        one: () => `Jeszcze jedna rzecz o ${time}`,
        few: (n) => `Jeszcze ${n} rzeczy o ${time}`,
        many: (n) => `Jeszcze ${n} rzeczy o ${time}`,
        other: (n) => `Jeszcze ${n} rzeczy o ${time}`,
      }),
    briefFrom: (time: string) => `podsumowanie z ${time}`,
    dates: 'Terminy i spotkania',
    done: 'Gotowe',
    firstRead:
      'Czytam Twoją pocztę z ostatnich trzech dni. To, co wymaga Twojej uwagi, pojawi się tu samo.',
    handled: {
      spam: (total: number) =>
        plural('pl', total, {
          one: (n) => `${n} do spamu`,
          few: (n) => `${n} do spamu`,
          many: (n) => `${n} do spamu`,
          other: (n) => `${n} do spamu`,
        }),
      archived: (total: number) =>
        plural('pl', total, {
          one: (n) => `${n} zarchiwizowany`,
          few: (n) => `${n} zarchiwizowane`,
          many: (n) => `${n} zarchiwizowanych`,
          other: (n) => `${n} zarchiwizowanego`,
        }),
      markedRead: (total: number) =>
        plural('pl', total, {
          one: (n) => `${n} oznaczony jako przeczytany`,
          few: (n) => `${n} oznaczone jako przeczytane`,
          many: (n) => `${n} oznaczonych jako przeczytane`,
          other: (n) => `${n} oznaczonego jako przeczytane`,
        }),
      review: 'Przejrzyj',
      total: (total: number) =>
        plural('pl', total, {
          one: (n) => `${n} załatwiony`,
          few: (n) => `${n} załatwione`,
          many: (n) => `${n} załatwionych`,
          other: (n) => `${n} załatwionego`,
        }),
      unsubscribed: (total: number) =>
        plural('pl', total, {
          one: (n) => `${n} wypisanie`,
          few: (n) => `${n} wypisania`,
          many: (n) => `${n} wypisań`,
          other: (n) => `${n} wypisania`,
        }),
    },
    headline: (total: number) =>
      total === 0
        ? 'Wszystko spokojnie.'
        : plural('pl', total, {
            one: () => 'Jedna rzecz czeka na ciebie.',
            few: (n) => `${n} rzeczy czekają na ciebie.`,
            many: (n) => `${n} rzeczy czeka na ciebie.`,
            other: (n) => `${n} rzeczy czeka na ciebie.`,
          }),
    nothingNeedsYou:
      'Nic teraz na ciebie nie czeka. Nowa poczta jest czytana od razu, gdy przychodzi.',
    pulse: {
      lists: (n: number) => `${n} z list mailingowych`,
      people: (n: number) => `${n} od ludzi`,
      total: (total: number) =>
        plural('pl', total, {
          one: (n) => `${n} e-mail z ostatniej doby`,
          few: (n) => `${n} e-maile z ostatniej doby`,
          many: (n) => `${n} e-maili z ostatniej doby`,
          other: (n) => `${n} e-maila z ostatniej doby`,
        }),
    },
    recent: 'Też z ostatniej doby',
    sent: 'Wysłano',
    worthAttention: 'Warte uwagi',
    writing: 'Piszę…',
  },
  whatsapp: {
    connectFirst:
      'Najpierw otwórz Fewmail → Ustawienia → Integracje i stuknij „Połącz WhatsApp”.',
    connected:
      'Połączono. Będę wysyłać podsumowanie każdego ranka i dam znać, gdy przyjdzie coś pilnego. Wyślij tekst albo głosówkę, żeby odpowiedzieć na dowolny e-mail.',
    proOnly:
      'WhatsApp jest częścią Fewmail Pro. Otwórz Ustawienia → Plan w Fewmail, aby przejść na Pro.',
  },
  zombie: {
    badge: (share: number) => `Ignoruje wypisanie u ${share}% osób`,
    reason: 'Wysyłał dalej po tym, jak się wypisałeś',
  },
}
