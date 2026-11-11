import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const pl: Messages = {
  actionKind: {
    cleanup: 'Wypisz ze wszystkich',
    commitment: 'Gotowe',
    security: 'Sprawdziłem',
    subscription: 'Jasne',
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
  ask: {
    label: (question: string) => `Zapytaj Fewmail: „${question}”`,
    thinking: 'Przeglądam twoją pocztę…',
  },
  byRule: 'przez regułę',
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
    forward: 'Przekaż',
    forwardedMessage: 'Przekazana wiadomość',
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
  keys: {
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
    block: 'Zablokuj nadawcę',
    blocked: 'Zablokowano. Jego poczta trafia teraz do kosza.',
    forward: 'Przekaż',
    more: 'Więcej',
    reply: 'Odpowiedz',
    trash: 'Przenieś do kosza',
    trashed: 'Przeniesiono do kosza',
    movedToInbox: 'Przywrócono do odebranych. Dzięki za informację.',
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
    search: 'Szukaj składnią Gmaila: from:anna has:attachment',
    openInGmail: 'Otwórz w Gmailu',
    unsubscribe: 'Wypisz się',
    unsubscribed: 'Wypisano',
    unsubscribeFailed:
      'Ten nadawca nie obsługuje wypisania jednym kliknięciem, więc e-mail został zarchiwizowany.',
    you: 'Ty',
  },
  money: {
    due: (date: string) => `Termin: ${date}`,
    empty:
      'Na razie nic. Paragony, faktury i subskrypcje pojawią się tu, gdy tylko dotrą.',
    lastCharged: (date: string) => `Ostatnie obciążenie: ${date}`,
    lead: 'Wszystko, co Fewmail znalazł w twoich paragonach i rachunkach.',
    monthlyTotal: 'Co miesiąc na subskrypcje',
    period: { month: 'miesięcznie', week: 'tygodniowo', year: 'rocznie' },
    priceUp: (merchant: string, from: string, to: string) =>
      `${merchant} kosztuje teraz ${to} (było ${from})`,
    priceUpTitle: (merchant: string) => `${merchant} podrożał`,
    recent: 'Ostatnie zakupy',
    subscriptions: 'Subskrypcje',
    title: 'Pieniądze',
    upcoming: 'Rachunki do zapłaty',
  },
  nav: {
    money: 'Pieniądze',
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
    watching: 'Agent pilnuje twojej skrzynki',
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
    languageHint:
      'W tym języku działa aplikacja, podsumowania i wyjaśnienia. Odpowiedzi zawsze są w języku maila, na który odpowiadasz.',
    languageTitle: 'W jakim języku ma mówić Fewmail?',
    lead: 'Dwie szybkie odpowiedzi. Wszystko zmienisz później w Ustawieniach.',
    personaTitle: 'Jak korzystasz z poczty?',
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
    pro: 'Pro',
    proCancels: (date: string) => `Pro do ${date}, potem Free.`,
    proRenews: (date: string) => `Odnowienie ${date}.`,
    title: 'Plan',
    trial: 'Okres próbny Pro',
    trialDescription: (date: string) =>
      `Wszystkie funkcje Pro do ${date}. Potem Fewmail zostaje darmowy z prostymi regułami — bez karty.`,
    upgrade: 'Przejdź na Pro',
    welcome: 'Witaj w Pro. Agent wraca do pracy.',
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
  persona: {
    reader: {
      description:
        'Głównie czytam. Dbaj o spokój w skrzynce, zajmij się szumem i pilnuj, by nic ważnego mi nie umknęło.',
      title: 'Głównie czytam',
    },
    responder: {
      description:
        'Dużo odpowiadam. Pokazuj najpierw osoby, które na mnie czekają, i przygotowuj szkice odpowiedzi moim głosem.',
      title: 'Dużo odpowiadam',
    },
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
    actWithoutAsking: 'Działaj bez pytania',
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
      suggested: 'Proponowane w Dziś, ty zatwierdzasz',
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
    withoutAsking: 'Bez pytania',
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
    persona: 'Jak korzystasz z poczty',
    signedInWithGoogle: 'Zalogowano przez Google',
    signOut: 'Wyloguj się',
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
    people:
      'Maile od prawdziwych ludzi, które zadają mi pytanie lub czekają na moją odpowiedź',
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
    whichEmail:
      'Który e-mail? Odpowiedz na jedną z moich wiadomości i napisz, co odpisać.',
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
    later: (total: number, time: string) =>
      plural('pl', total, {
        one: () => `Jeszcze jedna rzecz o ${time}`,
        few: (n) => `Jeszcze ${n} rzeczy o ${time}`,
        many: (n) => `Jeszcze ${n} rzeczy o ${time}`,
        other: (n) => `Jeszcze ${n} rzeczy o ${time}`,
      }),
    briefArrives: (time: string) =>
      `Podsumowanie przychodzi codziennie o ${time}.`,
    briefFrom: (time: string) => `podsumowanie z ${time}`,
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
    sent: 'Wysłano',
    waitingOnYou: 'Czeka na ciebie',
    worthAttention: 'Warte uwagi',
    writeNow: 'Napisz teraz',
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
