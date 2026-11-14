import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const pl: Messages = {
  actionDone: {
    commitment: 'Gotowe',
    confirm: 'Potwierdziłem',
    follow_up: 'Przypomniałem się',
    pay: 'Zapłaciłem',
    read: 'Przeczytałem',
    renew: 'Przedłużyłem',
    schedule: 'Zaplanowałem',
    security: 'Sprawdziłem',
    sign: 'Podpisałem',
  },
  actionLink: {
    confirm: 'Potwierdź',
    pay: 'Zapłać',
    read: 'Czytaj',
    renew: 'Przedłuż',
    sign: 'Podpisz',
  },
  actionKind: {
    cleanup: 'Wypisz ze wszystkich',
    consent: 'Zatwierdź',
    commitment: 'Obiecane',
    security: 'Sprawdź',
    spam: 'Przenieś do spamu',
    archive: 'Archiwizuj',
    follow_up: 'Przypomnij się',
    mark_read: 'Oznacz jako przeczytane',
    pay: 'Zapłać',
    read: 'Warto przeczytać',
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
    pending: 'czeka na stronie głównej',
  },
  agent: {
    decideOnHome: 'Zdecyduj na stronie głównej',
    fromAgent: 'Prosi agent',
    mcpAsks: (client: string) => `${client} prosi przez MCP`,
    calendar: (email: string) => `W kalendarzu ${email}`,
    cc: (recipients: string) => `DW: ${recipients}`,
    confirm: {
      dismiss_action: 'Pominąć tę kartę?',
      delete_board: 'Usunąć tę tablicę ze wszystkim, co na niej jest?',
      create_event: 'Dodać to wydarzenie?',
      delete_event: 'Usunąć to wydarzenie?',
      update_event: 'Zmienić to wydarzenie?',
      approve_action: 'Wykonać tę akcję?',
      archive_thread: 'Zarchiwizować ten wątek?',
      clear_out: 'Uprzątnąć te grupy maili ze skrzynki?',
      undo_clear_out: 'Przywrócić do skrzynki wszystko, co uprzątnięto?',
      create_rule: 'Dodać tę regułę?',
      reply: 'Wysłać tę odpowiedź?',
      send_email: 'Wysłać tego e-maila?',
      snooze_thread: 'Odłożyć ten wątek?',
      unsubscribe: 'Wypisać się od tego nadawcy?',
      tidy_mail: 'Uporządkować te spokojne e-maile?',
      trash_thread: 'Przenieść ten wątek do kosza?',
      report_spam: 'Zgłosić tego nadawcę jako spam?',
      mark_not_spam: 'Wyjąć ten wątek ze spamu?',
      move_to_inbox: 'Przenieść ten wątek z powrotem do odebranych?',
    },
    retry: 'Spróbuj ponownie',
    steps: {
      create_event: 'Dodaję wydarzenie',
      delete_event: 'Usuwam wydarzenie',
      list_events: 'Sprawdzam kalendarz',
      update_event: 'Zmieniam wydarzenie',
      list_subscriptions: 'Sprawdzam subskrypcje',
      approve_action: 'Wykonuję',
      archive_thread: 'Archiwizuję',
      get_reading: 'Czytam newslettery',
      get_wrapped: 'Liczę twoją pocztę',
      clear_out: 'Porządkuję skrzynkę',
      preview_clear_out: 'Czytam całą skrzynkę',
      undo_clear_out: 'Przywracam uprzątnięte maile',
      create_rule: 'Dodaję regułę',
      dismiss_action: 'Pomijam',
      draft_reply: 'Piszę odpowiedź',
      create_draft: 'Zapisuję szkic',
      find_people: 'Szukam adresu',
      get_board: 'Czytam tablicę',
      get_person: 'Szukam osoby',
      get_today: 'Sprawdzam dzisiejsze',
      list_boards: 'Otwieram tablice',
      list_handled: 'Sprawdzam, co załatwiono',
      list_mail: 'Przeszukuję pocztę',
      list_rules: 'Czytam reguły',
      read_thread: 'Czytam wątek',
      redraft_action: 'Przepisuję szkic',
      refresh: 'Sprawdzam nową pocztę',
      send_email: 'Wysyłam',
      snooze_thread: 'Odkładam',
      unsubscribe: 'Wypisuję',
      tidy_mail: 'Porządkuję',
      trash_thread: 'Przenoszę do kosza',
      report_spam: 'Zgłaszam spam',
      mark_not_spam: 'Wyjmuję ze spamu',
      move_to_inbox: 'Przenoszę do odebranych',
      create_board: 'Tworzę tablicę',
      update_board: 'Zmieniam tablicę',
      delete_board: 'Usuwam tablicę',
      add_board_chart: 'Dodaję wykres',
      add_to_board: 'Dodaję do tablicy',
      edit_board_entry: 'Poprawiam wpis',
      remove_board_entry: 'Zdejmuję z tablicy',
      rename_board_group: 'Zmieniam nazwę grupy',
    },
    to: (recipients: string) => `Do: ${recipients}`,
    until: (time: string) => `Do ${time}`,
    yes: {
      dismiss_action: 'Pomiń',
      delete_board: 'Usuń',
      create_event: 'Dodaj',
      delete_event: 'Usuń',
      update_event: 'Zapisz',
      approve_action: 'Wykonaj',
      archive_thread: 'Archiwizuj',
      clear_out: 'Uprzątnij',
      undo_clear_out: 'Przywróć',
      create_rule: 'Dodaj',
      reply: 'Wyślij',
      send_email: 'Wyślij',
      snooze_thread: 'Odłóż',
      unsubscribe: 'Wypisz się',
      tidy_mail: 'Uporządkuj',
      trash_thread: 'Do kosza',
      report_spam: 'Zgłoś spam',
      mark_not_spam: 'To nie spam',
      move_to_inbox: 'Przenieś',
    },
  },
  ask: {
    label: (question: string) => `Zapytaj Fewmail: „${question}”`,
    thinking: 'Przeglądam twoją pocztę…',
  },
  byRule: 'przez regułę',
  boards: {
    chartRemoved: 'Wykres usunięty',
    addTo: 'Dodaj do tablicy',
    added: (board: string) => `Dodano do „${board}”`,
    cancel: 'Anuluj',
    chart: {
      add: 'Dodaj wykres',
      ask: 'Opisz wykres',
      askPlaceholder: 'Wydatki według sklepów, zamówienia według statusu…',
      currency: 'Waluta',
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
      moveEarlier: 'Przesuń wcześniej',
      moveLater: 'Przesuń dalej',
      other: 'Inne',
      remove: 'Usuń wykres',
      skipped: (n: number) =>
        `Nie wliczono: ${n} w innej walucie lub bez kwoty`,
      title: 'Tytuł wykresu',
      type: 'Rodzaj wykresu',
      types: {
        area: 'Warstwowy',
        bar: 'Słupki',
        line: 'Linia',
        pie: 'Kołowy',
      },
      untitled: 'Nowy wykres',
      weekOf: (date: string) => `Tydzień od ${date}`,
    },
    charts: 'Wykresy',
    create: 'Utwórz tablicę',
    delete: 'Usuń tablicę',
    deleteConfirm: (name: string) => `Usunąć „${name}”?`,
    deleteHint:
      'Wpisy i wykresy znikną razem z nią. Poczta zostaje tam, gdzie jest.',
    describe: 'Zmień, co zbiera',
    description: 'Co zbiera',
    descriptionPlaceholder:
      'Podróże: loty, hotele i wynajem aut, razem z kosztami',
    due: (when: string) => `Najbliższa data: ${when}`,
    empty: 'Na razie pusto. Pasujące maile pojawią się tu, gdy tylko przyjdą.',
    entries: (total: number) =>
      plural('pl', total, {
        one: () => 'Jeden wpis',
        few: (n) => `${n} wpisy`,
        many: (n) => `${n} wpisów`,
        other: (n) => `${n} wpisu`,
      }),
    entry: {
      edited: 'Poprawione przez ciebie',
      nextOn: (date: string) => `następnie ${date}`,
      remove: 'Nie z tej tablicy',
      removed: 'Zdjęte z tablicy. Zapamięta to na przyszłość.',
    },
    expected: (when: string) => `Spodziewane ${when}`,
    filter: {
      clear: 'Wyczyść filtr',
      nothing: 'Brak pasujących wpisów.',
      search: 'Szukaj we wpisach',
    },
    groups: {
      every: {
        month: 'co miesiąc',
        quarter: 'co kwartał',
        week: 'co tydzień',
        year: 'co rok',
      },
      expected: (date: string) => `spodziewane ${date}`,
      next: (date: string) => `następnie ${date}`,
      perMonth: (amount: string) => `${amount} / mies.`,
      rename: 'Zmień nazwę grupy',
      renameHint: 'Nadaj jej nazwę innej grupy, a obie się połączą.',
      showAll: (n: number) => `Pokaż wszystkie (${n})`,
      showFewer: 'Pokaż mniej',
      title: 'Według tego, kto lub co',
    },
    history: {
      capped: (n: number) =>
        `Przeczytano ${n} najnowszych pasujących maili z wybranego okresu.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Przeglądam pocztę z wybranego okresu…'
          : `Czytam ${plural('pl', found, { one: () => 'jeden mail', few: (n) => `${n} maile`, many: (n) => `${n} maili`, other: (n) => `${n} maila` })} · na razie ${plural('pl', entries, { one: () => 'jeden wpis', few: (n) => `${n} wpisy`, many: (n) => `${n} wpisów`, other: (n) => `${n} wpisu` })}`,
    },
    menu: 'Działania na tablicy',
    moveDown: 'Przesuń w dół',
    moveUp: 'Przesuń w górę',
    name: 'Nazwa',
    namePlaceholder: 'Podróże',
    new: 'Nowa tablica',
    newHint:
      'Opisz własnymi słowami, co zbierać. Fewmail znajdzie to w poczcie z wybranego okresu, dobierze wykresy i będzie je aktualizować.',
    period: 'Okres',
    periods: {
      1: 'Ostatni dzień',
      7: 'Ostatni tydzień',
      30: 'Ostatni miesiąc',
      90: 'Ostatnie 3 miesiące',
      180: 'Ostatnie pół roku',
      365: 'Ostatni rok',
    },
    planning: 'Przygotowuję…',
    redescribe: 'Zapisz i przeczytaj ponownie',
    redescribeHint:
      'Wybrany okres zostanie przeczytany od nowa według nowego opisu. Wpisy, które poprawiłeś lub zdjąłeś, zostają.',
    rename: 'Zmień nazwę tablicy',
    save: 'Zapisz',
    settings: {
      bannerDays: 'Przypomnienie przed datą',
      days: (n: number) =>
        plural('pl', n, {
          one: () => '1 dzień wcześniej',
          other: (count) => `${count} dni wcześniej`,
        }),
      hint: 'Jak daleko wstecz tablica zbiera i kiedy uprzedza cię przed terminem.',
      never: 'Nigdy',
      title: 'Ustawienia tablicy',
    },
    starter: {
      events: {
        description:
          'Bilety, rezerwacje i wizyty: gdzie mam być, kiedy i z kim.',
        name: 'Wydarzenia',
      },
      health: {
        description:
          'Wizyty lekarskie, recepty, wyniki badań i zwroty z ubezpieczenia: u kogo byłem, kiedy i ile to kosztowało.',
        name: 'Zdrowie',
      },
      home: {
        description:
          'Czynsz, media, naprawy i umowy dotyczące mieszkania: co trzeba zapłacić, komu i ile.',
        name: 'Dom',
      },
      invoices: {
        description:
          'Faktury, które wystawiam i otrzymuję w pracy: klient lub dostawca, kwota, termin i czy jest opłacona.',
        name: 'Faktury',
      },
      jobs: {
        description:
          'Aplikacje, rozmowy i oferty: która firma, jakie stanowisko i na jakim etapie jest każda.',
        name: 'Szukanie pracy',
      },
      learning: {
        description:
          'Kursy, zajęcia i poczta ze szkoły lub uczelni: terminy, oceny, certyfikaty i ich koszt.',
        name: 'Nauka',
      },
      money: {
        description:
          'Płatności, subskrypcje, rachunki i zwroty: za co płacę, komu, ile i kiedy się odnawia.',
        name: 'Finanse',
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
    summary: {
      lastMonth: 'Poprzedni miesiąc',
      perMonth: (amount: string) => `${amount} miesięcznie`,
      recurring: (n: number) =>
        plural('pl', n, {
          one: () => 'Jedna cykliczna',
          few: (count) => `${count} cykliczne`,
          many: (count) => `${count} cyklicznych`,
          other: (count) => `${count} cyklicznej`,
        }),
      thisMonth: 'Ten miesiąc',
      upcoming: 'Do zapłaty w 30 dni',
    },
  },
  bulk: {
    badge: (n: number) => `Wysłane do ${n}+ użytkowników Fewmail`,
    reason: (n: number) =>
      `Masowy e-mail: ${n}+ użytkowników Fewmail dostało ten sam tekst`,
  },
  calendar: {
    tomorrow: 'Jutro',
    noAccess: {
      allow: 'Zezwól na dostęp',
      description:
        'Google nie pozwolił udostępnić Twojego kalendarza Fewmail. Zezwól, aby widzieć i dodawać tu wydarzenia.',
      title: 'Kalendarz nie jest połączony',
    },
    allDay: 'Cały dzień',
    calendar: 'Kalendarz',
    create: 'Dodaj wydarzenie',
    delete: 'Usuń',
    deleted: 'Wydarzenie usunięte',
    description: 'Opis',
    editEvent: 'Edytuj wydarzenie',
    endBeforeStart: 'Wydarzenie kończy się, zanim się zacznie',
    ends: 'Koniec',
    location: 'Miejsce',
    newEvent: 'Nowe wydarzenie',
    next: 'Dalej',
    openInGoogle: 'Otwórz w Kalendarzu Google',
    previous: 'Wstecz',
    save: 'Zapisz',
    saved: 'Wydarzenie zapisane',
    starts: 'Początek',
    title: 'Kalendarz',
    titlePlaceholder: 'Dodaj tytuł',
    today: 'Dziś',
    untitled: '(Bez tytułu)',
    views: {
      day: 'Dzień',
      week: 'Tydzień',
      month: 'Miesiąc',
      year: 'Rok',
    },
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
  clearOut: {
    groups: {
      lists: 'Newslettery, których nie otwierasz',
      notifications: 'Przeczytane powiadomienia, starsze niż miesiąc',
      old: 'Wszystko starsze niż rok',
      promotions: 'Reklamy i społeczności, starsze niż 3 dni',
    },
    done: (emails: string) => `Uprzątnięto: ${emails}`,
    empty: 'Nie ma czego sprzątać: skrzynka jest już w porządku.',
    lead: (emails: string) => `W skrzynce: ${emails}. Oto co może zniknąć.`,
    leadCapped: (emails: string) =>
      `W skrzynce ponad ${emails}. Oto co może zniknąć.`,
    left: (emails: string) => `W skrzynce zostanie: ${emails}`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} i jeszcze ${more}` : names,
    run: (emails: string) => `Uprzątnij: ${emails}`,
    safe: 'Nic nie jest usuwane. Uprzątnięte maile trafiają do archiwum z etykietą Fewmail/Cleared i wracają jednym kliknięciem; z newsletterów dodatkowo się wypisuję.',
    scanning: 'Czytam całą skrzynkę, tylko nagłówki. Do minuty.',
    title: 'Uprzątnij skrzynkę odbiorczą',
    undo: 'Przywróć wszystko',
    undone: (emails: string) => `Z powrotem w skrzynce: ${emails}`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `Najpracowitszy dzień: ${day} · najpracowitsza godzina: ${hours}`,
    copied: 'Link skopiowany',
    copyLink: 'Kopiuj link',
    cta: 'Zdobądź swój z Fewmail',
    emails: 'maili przyszło',
    empty: 'Za mało poczty na historię. Wróć za kilka dni.',
    handled: 'Fewmail załatwił sam',
    people: 'Kto pisał najwięcej',
    period: { month: 'Ten miesiąc', year: 'Ten rok' },
    replies: 'odpowiedzi napisał Fewmail i zostały wysłane',
    saveImage: 'Zapisz obrazek',
    saved: 'zaoszczędził Fewmail',
    shareNote:
      'Link i obrazek pokazują tylko te liczby, nigdy imion ani adresów.',
    shared: { month: 'Miesiąc w mailach', year: 'Rok w mailach' },
    spam: 'maili spamowych zatrzymanych',
    split: (people: string, lists: string, other: string) =>
      `${people} od ludzi · ${lists} z newsletterów · ${other} innych`,
    title: { month: 'Twój miesiąc w mailach', year: 'Twój rok w mailach' },
    unsubscribed: 'newsletterów porzuconych',
  },
  reading: {
    markAllRead: 'Oznacz wszystkie jako przeczytane',
    summary: 'Co piszą twoje newslettery',
    worth: 'Warto przeczytać w całości',
    leftOut: (n: number) => `Pominięte w podsumowaniu: ${n}, nic nowego.`,
    since: (n: number) =>
      `Przyszły po podsumowaniu: ${n}, trafią do następnego.`,
    note: {
      inSummary: 'W podsumowaniu',
      leftOut: 'Pominięty',
      since: 'Po podsumowaniu',
    },
    digest: (n: number) => `Newslettery dziś: ${n}`,
    lead: 'Newslettery z ostatniej doby w jednym miejscu, żeby nie zaśmiecały skrzynki.',
    title: 'Czytanie',
  },
  commitments: {
    title: 'Obiecałeś',
  },
  compose: {
    discarded: 'Wersja robocza odrzucona',
    backInQueue: 'Anulowano. Szkic wrócił na stronę główną.',
    canceled: 'Anulowano. Twój e-mail wrócił do edytora.',
    cc: 'DW',
    discard: 'Odrzuć',
    draftSaved: 'Szkic zapisany',
    forward: 'Przekaż',
    forwardedMessage: 'Przekazana wiadomość',
    from: 'Od',
    instructionPlaceholder: 'Jak ma brzmieć? (opcjonalnie)',
    invalidRecipients: 'Dodaj co najmniej jeden poprawny adres e-mail.',
    later: {
      inHour: 'Za godzinę',
      monday: 'W poniedziałek rano',
      pick: 'Wybierz datę i godzinę',
      schedule: 'Zaplanuj',
      time: 'Godzina',
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
    goTo: 'Przejdź do',
    mail: 'Poczta',
    nothingMatches: 'Brak wyników.',
    placeholder: 'Zapytaj o pocztę lub wpisz polecenie…',
    teachRule: 'Naucz nowej reguły',
    upgrade: 'Przejdź na Pro',
    theme: {
      dark: 'Ciemny',
      light: 'Jasny',
      system: 'Systemowy',
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
  errors: {
    calendarAccess:
      'Fewmail nie ma dostępu do tego kalendarza. Zezwól na niego na stronie Kalendarz.',
    failed: 'Coś poszło nie tak. Spróbuj ponownie.',
    needsPro: 'Do tego potrzebny jest Fewmail Pro.',
    alreadySent: 'Już wysłano, za późno, by cofnąć.',
    notFound: 'Tego już nie ma. Możliwe, że zostało usunięte.',
    offline: 'Brak połączenia z Fewmail. Sprawdź internet.',
  },
  update: {
    available: 'Jest nowa wersja Fewmail.',
    reload: 'Odśwież',
  },
  keys: {
    done: 'gotowe',
    openLink: 'otwórz link',
    writeReminder: 'napisz przypomnienie',
    summary: 'podsumowanie',
    fromSender: 'więcej od nadawcy',
    approvePicked: (n: number) => `zatwierdź wybrane (${n})`,
    pick: 'wybierz',
    pickAll: 'wybierz wszystkie',
    markRead: 'oznacz jako przeczytane',
    unpick: 'wyczyść wybór',
    pin: 'przypnij',
    unpin: 'odepnij',
    copyCode: 'kopiuj kod',
    restore: 'do odebranych',
    calendarToday: 'dziś',
    newEvent: 'nowe wydarzenie',
    period: 'wstecz / dalej',
    view: 'widok',
    skills: 'umiejętności',
    unsubscribe: 'wypisz się',
    filter: 'filtr',
    reply: 'odpowiedz',
    snooze: 'odłóż',
    trash: 'kosz',
    ask: 'zapytaj o niego',
    approve: 'zatwierdź',
    approveAll: (n: number) => `zatwierdź wszystkie ${n} tego typu`,
    archive: 'archiwizuj',
    close: 'zamknij',
    draftReply: 'szkic odpowiedzi',
    edit: 'edytuj',
    expand: 'rozwiń / zwiń',
    move: 'przejdź',
    open: 'otwórz',
    notOnBoard: 'nie z tej tablicy',
    rename: 'zmień nazwę',
    clearFilter: 'wyczyść filtr',
    search: 'szukaj',
    send: 'wyślij',
    skip: 'pomiń',
    keep: 'zostaw',
    stopEditing: 'zakończ edycję',
    rewrite: 'przepisz',
    save: 'zapisz',
    deleteEvent: 'usuń',
  },
  legal: {
    privacy: 'Polityka prywatności',
    englishOnly:
      'Ten dokument jest udostępniony w języku angielskim, który jest wersją wiążącą.',
    terms: 'Warunki korzystania',
    updated: (date: string) => `Ostatnia aktualizacja: ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `Limit agenta na ten miesiąc się skończył. Wróci ${date}.`,
  },
  notices: {
    freeUpSpace: 'Zwolnij miejsce',
    mailLost:
      'Fewmail stracił dostęp do Twojego Gmaila i nie czyta nowej poczty.',
    mailboxLost: (email: string) => `Fewmail stracił dostęp do ${email}.`,
    reconnect: 'Połącz ponownie',
    sendLimit: (email: string, when: string) =>
      `${email} osiągnął dzienny limit wysyłki Gmaila. Wysyłanie znów zadziała ${when}.`,
    signInAgain: 'Zaloguj się ponownie',
    storageFull: (email: string) =>
      `Na ${email} skończyło się miejsce w Google, więc Gmail odrzuca nowe maile.`,
    storageFullHint:
      'Zwolnij miejsce albo dokup przestrzeń, żeby znów odbierać pocztę.',
  },
  login: {
    needsGmail:
      'Fewmail potrzebuje dostępu do Gmaila. Zaloguj się ponownie i zostaw zaznaczone pole Gmail na ekranie Google.',
    agree: ((slots) => [
      'Kontynuując, akceptujesz ',
      slots.terms,
      ' i ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail prosi o dostęp do czytania, porządkowania i wysyłania poczty Gmail w twoim imieniu. Nic nie zostanie wysłane ani zarchiwizowane bez twojej zgody, chyba że ustawisz regułę, która na to pozwala. Prosi też o dostęp do Kalendarza Google, który możesz odznaczyć.',
    continue: 'Kontynuuj z Google',
    lead: 'Fewmail czyta twoją skrzynkę za ciebie, odpowiada twoim głosem i pokazuje tylko to, co naprawdę wymaga twojej uwagi.',
    messengers:
      'Działa też w komunikatorach, na początek w Telegramie: odbieraj pilne e-maile, zatwierdzaj odpowiedzi albo po prostu nagraj głosówkę.',
    title: 'Tylko to, co ważne.',
  },
  mail: {
    draftDeleted: 'Wersja robocza usunięta',
    unsubscribeConfirm: (name: string) => `Wypisać się z ${name}?`,
    unsubscribeHint:
      'Fewmail wypisze cię z listy i zarchiwizuje ten wątek. Wypisania nie można cofnąć.',
    unsubscribing: 'Wypisywanie…',
    pin: 'Przypnij',
    unpin: 'Odepnij',
    pinned: 'Przypięte',
    showAll: (n: number) => `Pokaż wszystkie (${n})`,
    showFewer: 'Pokaż mniej',
    inGmail: (count: string) => `${count} w Gmailu`,
    markShownRead: (total: number) =>
      plural('pl', total, {
        one: (n) => `Oznacz ${n} jako przeczytaną`,
        other: (n) => `Oznacz ${n} jako przeczytane`,
      }),
    oneTimeCode: {
      archive: 'Kopiuj i archiwizuj',
      copied: 'Skopiowano kod',
      copy: 'Kopiuj kod',
      trash: 'Kopiuj i usuń',
    },
    openUnsubscribePage: 'Otwórz stronę',
    unsubscribeYourself:
      'Z tej listy trzeba wypisać się samemu na jej stronie. Do tego czasu jej maile są w archiwum.',
    allMailboxes: 'Wszystkie skrzynki',
    filterAbout: {
      focused: 'Najpierw ważne i ludzie, powiadomienia zwinięte',
      unread: 'Jeszcze nieprzeczytane, według rodzaju',
      inbox: 'Wszystko, od najnowszych',
    },
    find: {
      back: 'Wróć do poczty',
      open: 'Szukaj',
      recent: 'Ostatnie wyszukiwania',
      tips: 'Wskazówki',
      clearRecent: 'Wyczyść',
      describeExample: 'faktury od Anny z zeszłego miesiąca',
      searching: 'Szukam w twojej poczcie…',
      tip: {
        from: 'Maile od Anny',
        subject: 'Temat zawiera „invoice”',
        attachment: 'Z załącznikami',
        pdf: 'Z załączonym PDF',
        unread: 'Nieprzeczytane rozmowy',
        week: 'Z ostatnich 7 dni',
        describe: 'Albo opisz to własnymi słowami',
      },
    },
    group: {
      read: 'Przeczytane',
      earlier: 'Wcześniejsze',
      important: 'Ważne',
      people: 'Ludzie',
      plans: 'Kalendarz i podróże',
      money: 'Pieniądze',
      updates: 'Powiadomienia',
      newsletters: 'Newslettery',
      promotions: 'Promocje',
    },
    unread: 'Nieprzeczytane',
    block: 'Zablokuj nadawcę',
    ignoresUnsubscribe: (name: string) => `${name} ignoruje wypisania`,
    ignoresUnsubscribeHint:
      'Fewmail poprosił o wypisanie, ale ten nadawca znany jest z tego, że i tak pisze dalej. Przenosić jego maile do kosza od teraz? Możesz to cofnąć w Regułach.',
    blocked: 'Zablokowano. Jego poczta trafia teraz do kosza.',
    forward: 'Przekaż',
    more: 'Więcej',
    close: 'Zamknij',
    reply: 'Odpowiedz',
    trash: 'Przenieś do kosza',
    trashed: 'Przeniesiono do kosza',
    moveToInbox: 'Do odebranych',
    backInInbox: 'Przeniesiono do odebranych',
    movedToInbox: 'Przywrócono do odebranych. Dzięki za informację.',
    noThread: 'Wybierz e-mail, aby go tu przeczytać',
    deleteDraft: 'Usuń szkic',
    notSent: 'Nie wysłano. Otwórz, by spróbować ponownie',
    noRecipients: 'Brak odbiorców',
    notSpam: 'To nie spam',
    reportSpam: 'Zgłoś spam',
    reportedSpam: 'Zgłoszono. Jego poczta trafia teraz do spamu.',
    archive: 'Archiwizuj',
    archived: 'Zarchiwizowano',
    markedRead: 'Oznaczono jako przeczytane',
    attachment: 'załącznik',
    draftReply: 'Szkic odpowiedzi',
    drafting: 'Piszę…',
    draftWaiting: 'Szkic czeka na stronie głównej',
    due: (date: string) => `termin ${date}`,
    dueHint: 'Termin znaleziony przez agenta w tym mailu',
    empty: 'Brak maili',
    emptyHint: 'Nowe maile pojawią się tu, gdy tylko przyjdą.',
    noResults: 'Nic nie znaleziono',
    noResultsHint: 'Spróbuj innych słów albo innego folderu.',
    expectsReply: 'Czeka na odpowiedź',
    filter: {
      archive: 'Archiwum',
      trash: 'Kosz',
      drafts: 'Szkice',
      spam: 'Spam',
      inbox: 'Odebrane',
      snoozed: 'Odłożone',
      focused: 'Skupienie',
      unread: 'Nieprzeczytane',
    },
    instruction:
      'Powiedz agentowi, jak odpowiedzieć, albo po prostu naciśnij Enter',
    open: 'Otwórz',
    search: 'Szukaj lub opisz: faktury od Anny z zeszłego miesiąca',
    openInGmail: 'Otwórz w Gmailu',
    openFullPage: 'Otwórz na całej stronie',
    peek: 'Podgląd',
    collapseFullPage: 'Wróć do listy',
    unsubscribe: 'Wypisz się',
    unsubscribed: 'Wypisano',
    unsubscribeFailed:
      'Ten nadawca nie obsługuje wypisania jednym kliknięciem, więc e-mail został zarchiwizowany.',
    you: 'Ty',
    replyTo: 'Odpowiedz do',
    date: 'Data',
    authentication: 'Uwierzytelnienie',
    toLine: (recipients: string) => `do ${recipients}`,
  },
  subscriptions: {
    unsubscribeHint: (emails: string) =>
      `Fewmail wypisze cię z listy i zarchiwizuje wszystko, co wysłała (${emails} w tym miesiącu). Wypisania nie można cofnąć.`,
    archivedOnly:
      'Ten nadawca nie ma wypisania, z którego Fewmail może skorzystać, więc jego poczta została zarchiwizowana, ale nadal jesteś na liście i nowe wiadomości będą przychodzić.',
    count: (total: number) => `Listy mailingowe: ${total}`,
    empty: 'W tym miesiącu nie pisała do ciebie żadna lista mailingowa.',
    lead: 'Listy mailingowe, które pisały do ciebie w tym miesiącu, od najaktywniejszych. Wypisanie archiwizuje wszystko, co wysłały; jeśli po dwóch tygodniach poczta wciąż przychodzi, proponuję przenieść ją do spamu i przenoszę dopiero po twojej zgodzie.',
    opened: (total: number) =>
      total === 0 ? 'żaden nie otwarty' : `otwarte: ${total}`,
    title: 'Subskrypcje',
    unsubscribe: 'Wypisz się',
    unsubscribed: 'Wypisano',
  },
  nav: {
    labels: 'Etykiety',
    folders: 'Foldery',
    calendar: 'Kalendarz',
    subscriptions: 'Subskrypcje',
    boards: 'Tablice',
    newBoard: 'Nowa tablica',
    mail: 'Poczta',
    reading: 'Czytanie',
    rules: 'Reguły',
    search: 'Szukaj lub zapytaj…',
    settings: 'Ustawienia',
    syncFailed: 'Synchronizacja z Gmailem nie powiodła się, ponawiam',
    syncing: 'Czytam twoją skrzynkę…',
    syncFailedIn: (email: string) =>
      `Synchronizacja ${email} nie powiodła się, ponawiam`,
    syncingIn: (email: string) => `Czytam ${email}…`,
    home: 'Strona główna',
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
      `Strony, które agent wypełnia z twojej poczty, zaczynając od ostatnich trzech miesięcy. Wybierz do ${max}; własne dodasz później.`,
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
    used: (percent: number) => `Wykorzystano ${percent}%`,
    about: (emails: string, messages: string) =>
      `Około ${emails} przeczytanych e-maili lub ${messages} wiadomości do agenta miesięcznie, w dowolnych proporcjach.`,
    free: 'Free',
    freeDescription:
      'Szybka, spokojna poczta z prostymi regułami. Za darmo, jak długo chcesz.',
    includes:
      'Każdy płatny plan dodaje agenta: każdy e-mail przeczytany i streszczony, odpowiedzi pisane twoim stylem, reguły zwykłymi słowami, Telegram i MCP.',
    manage: 'Zarządzaj płatnościami',
    price: (usd: number) => `$${usd} / miesiąc`,
    priceYearly: (usd: number) => `$${usd} / rok`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
    cancels: (plan: string, date: string) => `${plan} do ${date}, potem Free.`,
    choose: (plan: string) => `Wybierz ${plan}`,
    proRenews: (date: string) => `Odnowienie ${date}.`,
    resets: (date: string) => `Odnowi się ${date}.`,
    title: 'Plan',
    trial: 'Okres próbny Pro',
    welcome: (plan: string) => `Witaj w ${plan}. Agent wraca do pracy.`,
    yearly: 'Płać rocznie',
    yearlyHint: 'Dwa miesiące gratis.',
    trialDescription: (date: string) =>
      `Wszystko z Pro do ${date}, potem za darmo. Bez karty.`,
    upgrade: 'Inne plany',
    usage: 'W tym miesiącu',
  },
  people: {
    firstContact: (date: string) => `Piszecie od ${date}`,
    lastContact: (date: string) => `Ostatni e-mail: ${date}`,
    open: 'Czeka w innych wątkach',
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
    addToCalendar: 'Dodaj do kalendarza',
    writeReminder: 'Napisz przypomnienie',
    approve: 'Zatwierdź',
    delete: 'Usuń',
    pick: 'Wybierz',
    picked: (n: number) => `Wybrane: ${n}`,
    unpick: 'Odznacz',
    askedByYou: 'Na twoją prośbę',
    draftedInVoice: 'Napisane twoim głosem',
    edit: 'Edytuj',
    send: 'Wyślij',
    rewrite: 'Przepisz',
    shorterInstruction: 'Skróć to.',
    new: 'Nowe',
    skipStale: 'Pomiń je',
    skipped: (n: number) => `Pominięte: ${n}`,
    stale: (n: number) => `Starsze niż tydzień: ${n}`,
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
    deleted: 'Reguła usunięta',
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
      alwaysShow: 'Zawsze trafia na stronę główną',
      autonomous: 'Robione samo, widoczne w załatwionych',
      draft: 'Szkic czeka na ciebie na stronie głównej',
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
    lead: 'Powiedz agentowi zwykłymi słowami, co robić z określonymi mailami. Sprawdza każdy mail według tych reguł.',
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
    disconnectConfirm: (name: string) => `Odłączyć ${name}?`,
    messengerDisconnectHint:
      'Bot przestanie do ciebie pisać. Ponowne połączenie wymaga nowego linku z tej strony.',
    readingDigest: {
      description:
        'Co rano newslettery z ostatniej doby przychodzą do Telegrama i WhatsAppa jedną wiadomością.',
      title: 'Podsumowanie newsletterów',
    },
    account: 'Konto',
    agent: 'Agent',
    deleteAccount: 'Usuń konto',
    deleteConfirm: 'Usuń wszystko',
    deleteDescription:
      'Od razu usuwa z Fewmail twoje konto, zsynchronizowaną pocztę, szkice i reguły. Twój Gmail pozostaje nietknięty.',
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
      'Aplikacja, bot i streszczenia. Odpowiedzi w języku maila.',
    legal: 'Informacje prawne',
    mailboxes: {
      removeConfirm: (email: string) => `Usunąć ${email}?`,
      removeHint:
        'Fewmail przestanie czytać tę skrzynkę i zapomni, co w niej przeczytał. W Gmailu nic się nie zmieni.',
      add: 'Dodaj Gmail',
      addDescription:
        'Poczta z innego konta Gmail trafia na tę samą stronę główną i do skrzynki odbiorczej. Nie da się nim tu zalogować: logowanie nim otwiera osobny Fewmail.',
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
      disconnectHint:
        'Nie będzie mogła czytać twojej poczty, dopóki nie połączysz jej ponownie.',
      allow: 'Zezwól',
      connected: (ago: string) => `Połączono ${ago}`,
      copy: 'Kopiuj URL',
      defaultName: 'Klient MCP',
      deny: 'Odmów',
      description:
        'Mogą czytać twoją pocztę, pisać szkice odpowiedzi i wysyłać je po twoim potwierdzeniu.',
      disconnect: 'Odłącz',
      paste:
        'Dodaj ten URL jako konektor w swojej aplikacji i zaloguj się do Fewmail.',
      request: (app: string) => `${app} chce korzystać z twojego Fewmail`,
      title: 'Połącz Claude, Cursor lub dowolnego klienta MCP',
    },
    morningDescription: (timezone: string) =>
      `Podsumowanie newsletterów i poniedziałkowy raport tygodniowy, w twojej strefie czasowej, ${timezone}`,
    morningTitle: 'Poranne wiadomości',
    signedInWithGoogle: 'Zalogowano przez Google',
    signOut: 'Wyloguj się',
    snippets: {
      deleted: 'Fragment usunięty',
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
      messengerOff: 'Pilne maile zostają w Fewmail.',
      messengerOn: 'Pilne maile od razu trafiają na czat.',
      notConfigured:
        'Powiadomienia przeglądarki nie są skonfigurowane na tym serwerze.',
      off: 'Odbieraj tutaj pilne maile, nawet gdy Fewmail jest zamknięty.',
      on: 'Pilne maile pojawiają się tutaj. Kilka naraz przychodzi jako jedno.',
      title: 'Powiadomienia',
      unsupported: 'Ta przeglądarka nie może wyświetlać powiadomień.',
    },
    telegram: {
      connect: 'Połącz Telegram',
      disconnect: 'Rozłącz',
      linked:
        'Pilne maile przychodzą od razu. Zatwierdzaj i edytuj szkice na czacie.',
      linkedQuiet: 'Zatwierdzaj i edytuj szkice na czacie.',
      notConfigured: 'Bot Telegram nie jest skonfigurowany na tym serwerze.',
      unlinked: 'Odbieraj pilne maile i zatwierdzaj szkice w Telegramie.',
    },
    whatsapp: {
      connect: 'Połącz WhatsApp',
      disconnect: 'Rozłącz',
      linked:
        'Pilne maile przychodzą od razu. Zatwierdzaj i edytuj szkice na czacie.',
      linkedQuiet: 'Zatwierdzaj i edytuj szkice na czacie.',
      notConfigured: 'Bot WhatsApp nie jest skonfigurowany na tym serwerze.',
      unlinked: 'Odbieraj pilne maile i zatwierdzaj szkice w WhatsAppie.',
    },
    title: 'Ustawienia',
  },
  site: {
    meta: {
      compare:
        'Fewmail w porównaniu z Superhuman, Shortwave i SaneBox: agent, który czyta pocztę za ciebie, zamiast szybszego sposobu, by czytać ją samemu.',
      home: 'Fewmail to agent poczty dla Gmaila: czyta każdy e-mail, pisze odpowiedzi twoim głosem i pokazuje tylko to, co wymaga ciebie.',
      login:
        'Fewmail czyta twojego Gmaila za ciebie, odpowiada twoim głosem i pokazuje tylko to, co naprawdę wymaga ciebie.',
      mcp: 'Połącz Fewmail z Claude, ChatGPT, Claude Code lub Cursorem jako serwer MCP: czytaj i porządkuj Gmaila z AI, której już używasz.',
      motto: 'tylko to, co ważne w twojej skrzynce',
      pricing: (trialDays: number) =>
        `Fewmail jest na zawsze darmowy do sortowania, reguł i ochrony przed spamem. Pro, cały agent, zaczyna się od ${trialDays} darmowych dni bez karty.`,
      tagline: 'agent poczty dla Gmaila',
    },
    chapters: {
      pricing: {
        description:
          'Sortowanie, reguły i ochrona są za darmo na zawsze. Lite, Pro i Max dodają wszystko, co czyta i pisze za ciebie; większe plany po prostu robią tego więcej.',
        label: 'Cennik',
        title: (usd: number) => `Sortowanie za darmo. Agent od $${usd}.`,
      },
      questions: {
        description:
          'Krótkie odpowiedzi. Długie znajdziesz w polityce prywatności.',
        label: 'Pytania',
        title: 'Zanim połączysz Gmaila.',
      },
    },
    closing: {
      lead: 'Połącz Gmaila w minutę. Fewmail zaczyna od poczty z ostatnich trzech dni, więc pierwsze decyzje czekają na ciebie od razu.',
      title: 'Odzyskaj swoje poranki.',
    },
    mcp: {
      answer:
        'Podpisanej umowy przed piątkowym startem projektu. Odpowiedź jest już napisana i czeka w twojej kolejce w Fewmail.',
      clients: 'Działa z',
      emphasis: 'Claude i ChatGPT.',
      free: 'Czytanie poczty i sortowanie przez agenta są za darmo.',
      label: 'MCP',
      lead: 'Podłącz Fewmail jako serwer MCP i pytaj o pocztę asystenta, którego już używasz. Wszystko, co wysyła maile lub zmienia Gmaila, i tak czeka na twoje „tak”.',
      question: 'Czego Anna potrzebuje ode mnie w tym tygodniu?',
      setup: 'Połącz w minutę',
      title: 'Twoja poczta w Claude i ChatGPT.',
    },
    mcpPage: {
      copy: 'Kopiuj URL',
      lead: 'Podłącz Fewmail jako serwer MCP i pytaj o pocztę z AI, której już używasz. Czytanie poczty i sortowanie przez agenta są darmowe; szkice, wysyłka i reguły są w Pro.',
      safety:
        'Wszystko, co wysyła maila lub zmienia Gmaila, najpierw pyta o twoje „tak”. Twoja poczta nigdy nie trenuje modeli, a każdą aplikację odłączysz w ustawieniach.',
      steps: {
        chatgpt:
          'W Settings dodaj konektor (aplikację) z tym URL, potem zaloguj się do Fewmail.',
        claude:
          'W Settings → Connectors dodaj własny konektor z tym URL, potem zaloguj się do Fewmail.',
        code: 'Uruchom to raz w terminalu, potem zaloguj się do Fewmail, gdy Claude Code poprosi.',
        cursor:
          'Dodaj to do mcp.json, potem zaloguj się do Fewmail, gdy Cursor poprosi.',
      },
      title: 'Fewmail w Claude, ChatGPT i twoich narzędziach.',
    },
    comparePage: {
      lead: 'Klienty poczty sprawiają, że szybciej czytasz każdy e-mail. Filtry przenoszą pocztę do folderów. Fewmail jest agentem: czyta pocztę, decyduje, co może poczekać, i pyta cię tylko o resztę.',
      title: 'Fewmail w porównaniu.',
    },
    comparison: {
      custom: 'Indywidualnie',
      features: 'Funkcja po funkcji',
      groups: {
        agent: 'Czytanie i odpowiadanie',
        day: 'Twój dzień',
        reach: 'Gdzie działa',
        safety: 'Ochrona',
      },
      labels: {
        ask: 'Zapytaj pocztę o cokolwiek',
        home: 'Wszystko, co czeka na ciebie, na jednej stronie',
        calendar: 'Kalendarz',
        drafts: 'Odpowiedzi pisane za ciebie',
        followUps: 'Przypomnienia o odpowiedziach',
        gmail: 'Gmail i Google Workspace',
        handOver: 'Przekazanie wątku',
        importance: 'Sortowanie według ważności',
        keepApp: 'Zostajesz przy swojej aplikacji pocztowej',
        mcp: 'MCP dla twoich narzędzi',
        memory: 'Pamięta obietnice i ludzi',
        otherProviders: 'iCloud, Yahoo i inna poczta IMAP',
        outlook: 'Outlook i Microsoft 365',
        phishing: 'Ostrzeżenia o phishingu i zmianie danych do płatności',
        phone: 'Na telefonie',
        rules: 'Reguły zwykłymi słowami',
        snooze: 'Odkładanie na później',
        spamShield: 'Społecznościowa tarcza antyspamowa',
        summaries: 'Streszczenia maili',
        teams: 'Wspólna skrzynka zespołu',
        unsubscribe: 'Wypisanie jednym kliknięciem',
      },
      more: 'Więcej porównań',
      no: 'Nie',
      noFreePlan: 'Brak darmowego planu',
      ours: {
        ask: 'W Pro',
        home: 'Na żywo, zatwierdzanie hurtem, za darmo',
        drafts: 'Twoim głosem, wysyłane dopiero po twojej zgodzie, w Pro',
        followUps: 'Automatyczne, przy mailach czekających na odpowiedź',
        handOver: 'Agent doprowadza go do celu, w Pro',
        importance: 'Każdy mail oceniony, za darmo',
        keepApp: 'Wszystko widać w Gmailu',
        mcp: 'W Pro',
        memory: 'W Pro',
        phone: 'Telegram i WhatsApp, z głosem, w Pro',
        rules:
          'Archiwizacja, oznaczanie jako przeczytane lub wypisanie, za darmo',
        summaries: 'W Pro',
        unsubscribe: 'Nadawcy, którzy to ignorują, trafiają do spamu',
      },
      plans: 'Plany i ceny',
      read: 'Przeczytaj porównanie',
      source: (name: string, date: string) =>
        `Dane o ${name} pochodzą z jego publicznej strony, stan na ${date}. Ceny i funkcje się zmieniają; aktualną ofertę sprawdź na ich stronie.`,
      title: (name: string) => `Fewmail vs ${name}`,
      tryFree: 'Wypróbuj Fewmail za darmo',
      which: 'Co wybrać?',
      yes: 'Tak',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 skrzynki i wszystkie funkcje, z AI Bundle',
          lunch: '2 skrzynki, odkładanie i przypomnienia',
          snack: '1 skrzynka i podstawowe filtrowanie',
        },
        summary:
          'SaneBox sortuje pocztę do folderów, a w najwyższym planie pisze też szkice i streszcza. Fewmail najpierw wszystko czyta i zbiera na jednej stronie kilka decyzji, które możesz podjąć tylko ty.',
        them: {
          home: 'Codzienne zestawienie odfiltrowanej poczty',
          drafts: 'SaneDrafts, w Dinner',
          followUps: 'SaneNoReplies',
          importance: 'Mniej ważna poczta trafia do SaneLater',
          keepApp: 'Działa przez foldery',
          otherProviders: 'Dowolny serwer IMAP lub Exchange',
          phone: 'Przez twoją aplikację pocztową',
          rules: 'Trenowanie przez przenoszenie maili między folderami',
          snooze: 'Od Lunch',
          summaries: 'SaneSummary, w Dinner',
          unsubscribe: 'Folder SaneBlackHole',
        },
        verdict:
          'Wybierz SaneBox, jeśli twoja poczta jest poza Gmailem i wystarczą ci foldery. Wybierz Fewmail, jeśli używasz Gmaila i chcesz, żeby ważna poczta była przeczytana, streszczona i miała odpowiedź.',
      },
      shortwave: {
        plans: {
          business: 'Za użytkownika',
          free: 'Większość funkcji i asystent',
          max: 'Za użytkownika, najmocniejsze modele',
          premier: 'Za użytkownika, mocniejsze modele',
          pro: 'Pełna historia, wyszukiwanie i pisanie z AI',
        },
        summary:
          'Shortwave to klient poczty z asystentem AI, z którym rozmawiasz. Fewmail to agent, który najpierw sam czyta pocztę i pyta cię tylko o to, czego nie może rozstrzygnąć.',
        them: {
          ask: 'Asystent AI i wyszukiwanie',
          drafts: 'Gdy poprosisz',
          importance: 'Podziały i pakiety',
          keepApp: 'Zastępuje twoją aplikację pocztową',
          memory: 'Pamięć AI',
          otherProviders: 'Przekierowane do Gmaila',
          outlook: 'Brak obsługi Microsoft 365',
          phone: 'Aplikacje na iOS i Android',
          rules: 'Filtry AI, od 3 do 50 zależnie od planu',
          summaries: 'Nad każdym mailem',
          teams: 'Wspólne wątki i komentarze',
          unsubscribe: 'Z blokowaniem jednym kliknięciem',
        },
        verdict:
          'Wybierz Shortwave, jeśli chcesz nową skrzynkę z asystentem na czacie. Wybierz Fewmail, jeśli chcesz oglądać mniej maili, w Gmailu, którego już używasz.',
      },
      superhuman: {
        plans: {
          business:
            'Za członka, $33 przy płatności rocznej. Dodaje Auto Drafts i Ask AI',
          enterprise: 'SSO i narzędzia administratora',
          starter: 'Za członka, $25 przy płatności rocznej',
        },
        summary:
          'Superhuman sprawia, że szybciej przechodzisz przez każdy e-mail. Fewmail przechodzi przez nie za ciebie i pokazuje tylko to, co wymaga twojej uwagi.',
        them: {
          ask: 'Ask AI, w Business',
          drafts: 'Auto Drafts, w Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox i Auto Labels',
          keepApp: 'Zastępuje twoją aplikację pocztową',
          mcp: 'W Business',
          phone: 'Aplikacje na iOS i Android',
          rules: 'Custom Auto Labels, w Business',
          spamShield: 'Filtr twojego dostawcy',
          summaries: 'Auto Summarize',
          teams: 'Wspólne szkice i komentarze',
        },
        verdict:
          'Wybierz Superhuman, jeśli chcesz sam dotknąć każdego maila, tylko szybciej. Wybierz Fewmail, jeśli wolisz większości z nich w ogóle nie oglądać.',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'Nie. Fewmail działa na Gmailu. Wszystko, co robi, widać też w Gmailu, a obok możesz dalej używać dowolnej aplikacji Gmail.',
        question: 'Czy muszę rezygnować z Gmaila?',
      },
      {
        answer:
          'Nigdy bez ciebie. Odpowiedzi czekają w kolejce, aż je zatwierdzisz, a archiwizować, oznaczać jako przeczytane czy wypisywać się mogą same tylko reguły, które utworzyłeś lub zostawiłeś. Wszystko, co zrobił, znajdziesz w Załatwionych.',
        question: 'Czy może sam wysyłać lub usuwać maile?',
      },
      {
        answer:
          'Tematy, treści, streszczenia i szkice są szyfrowane w naszej bazie danych. Twoja poczta nigdy nie służy do trenowania modeli, a tarcza antyspamowa wymienia między użytkownikami tylko hashe z kluczem, nigdy adresy ani treść.',
        question: 'Co dzieje się z moją pocztą?',
      },
      {
        answer: `Każde nowe konto dostaje ${trialDays} dni Pro, bez karty. Gdy się skończą, po prostu zostajesz na planie Free; nic nie jest usuwane i nic nie jest pobierane.`,
        question: 'Co po okresie próbnym?',
      },
      {
        answer:
          'Szkice powstają w języku e-maila, na który odpowiadasz. Aplikacja, streszczenia i bot w Telegramie mówią jednym wybranym przez ciebie językiem spośród piętnastu.',
        question: 'Jakie języki zna?',
      },
      {
        answer:
          'Na razie konta Gmail i Google Workspace. Dodaj kilka skrzynek do jednego Fewmail, a ich poczta trafi na tę samą stronę główną i do tej samej skrzynki.',
        question: 'Jakie konta e-mail działają?',
      },
    ],
    features: {
      description:
        'Te części poczty, które kiedyś zajmowały całe popołudnie, dzieją się w tle i są zapisane tam, gdzie możesz je sprawdzić.',
      items: {
        ask: {
          description:
            'Pytaj zwykłymi słowami i dostawaj odpowiedź z własnej poczty, razem z mailami, z których pochodzi.',
          title: 'Zapytaj swoją pocztę',
        },
        boards: {
          description:
            'Pieniądze, płatne subskrypcje, podróże, zamówienia: opisz, co śledzić, a agent zbierze to z maksymalnie roku poczty, z wykresami.',
          title: 'Tablice',
        },
        calendar: {
          description:
            'Kalendarze wszystkich skrzynek w jednym widoku. Spotkanie zaproponowane w mailu staje się wydarzeniem, gdy powiesz „tak”.',
          title: 'Kalendarz',
        },
        clearOut: {
          description:
            'Cały zaległy bałagan za jednym razem, do 50 000 maili na skrzynkę, wszystko pod jedną etykietą, więc „Przywróć wszystko” przywraca każdy z nich. Za darmo.',
          title: 'Sprzątanie skrzynki',
        },
        reading: {
          description:
            'Newslettery z dnia na jednej spokojnej liście, każdy streszczony w kilku zdaniach.',
          title: 'Czytanie',
        },
        voice: {
          description:
            'Naciśnij „Odsłuchaj” na stronie głównej i usłysz, co czeka na ciebie. Mów do agenta w aplikacji, Telegramie lub WhatsAppie, a odpowie na głos.',
          title: 'Posłuchaj, co czeka na ciebie',
        },
        wrapped: {
          description:
            'Twój miesiąc lub rok w mailach: co przyszło, co zostało załatwione, ile czasu odzyskałeś. Do udostępnienia, nigdy z imionami.',
          title: 'Rok w mailach',
        },
      },
      label: 'I cała reszta',
      title: 'Wszystko inne, co zrobiłby asystent.',
    },
    footer: {
      legal: 'Informacje prawne',
      product: 'Produkt',
      tagline:
        'Agent poczty, który czyta twojego Gmaila i pokazuje tylko to, co wymaga twojej uwagi.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'których już nie masz.',
      label: 'Co znika',
      rows: [
        {
          fix: 'Sprzątanie skrzynki za jednym razem wynosi do archiwum cały zaległy bałagan: stare reklamy, przeczytane powiadomienia, newslettery, których nie otwierasz. Jedno „Przywróć wszystko” przywraca każdy mail.',
          problem: 'Tysiące maili, których nikt nigdy nie przeczyta.',
        },
        {
          fix: 'Odpowiedzi są gotowe z wyprzedzeniem, twoim głosem i w ich języku. Podobne zatwierdzasz razem przez ⇧⏎, a każdą wciąż możesz sprawdzić.',
          problem: 'Odpisywanie na maile o północy.',
        },
        {
          fix: 'Jeden klawisz wypisuje cię tak, jak zrobiłby to człowiek: jednym kliknięciem, na stronie wypisu albo mailem. Nadawcy, którzy dalej piszą, trafiają prosto do spamu.',
          problem: 'Newslettery, na które nigdy się nie zapisałeś.',
        },
        {
          fix: 'Czytanie zbiera newslettery z dnia na jedną listę, każdy streszczony w kilku zdaniach.',
          problem: 'Newslettery, które chciałeś przeczytać.',
        },
        {
          fix: 'Zmienione dane do płatności, podszywające się domeny i znany phishing wywołują ostrzeżenie, zanim cokolwiek zrobisz.',
          problem: 'Faktura z nowym numerem konta.',
        },
        {
          fix: 'Obietnice z wysłanych maili wracają w terminie, a wątki, na które nikt nie odpowiedział, dostają przypomnienie.',
          problem: 'To, co obiecałeś i o czym zapomniałeś.',
        },
        {
          fix: 'Do Telegrama czy WhatsAppa trafia tylko to, co pilne. Reszta, już posortowana, czeka na stronie głównej, aż zajrzysz.',
          problem: 'Sprawdzanie poczty przy kolacji, tak na wszelki wypadek.',
        },
      ],
      title: 'Problemy z pocztą, których już nie masz.',
    },
    hero: {
      needs: {
        emphasis: 'czekają na ciebie.',
        lead: (handled: string) =>
          `Anna czeka na umowę, faktura Northwind jest do zapłaty w przyszłym tygodniu, a Marco chce czwartek. Załatwione newslettery i powiadomienia: ${handled}. Strona główna odświeża się sama, gdy przychodzi nowa poczta.`,
        tag: 'Strona główna · czwartek, 08:12',
        title: 'Trzy sprawy czekają na ciebie.',
      },
      fates: {
        archived: 'Zarchiwizowane',
        markedRead: 'Przeczytane',
        spam: 'Spam',
        summarised: 'Streszczone',
        unsubscribed: 'Wypisano',
      },
      handled: ((slots) => [
        'Załatwione: ',
        slots.count,
        ', każde z powodem',
      ]) as Rich<'count'>,
      inbox: 'Odebrane',
      lead: 'Newslettery, paragony, powiadomienia, link phishingowy i gdzieś pomiędzy nimi trzy maile, które naprawdę się liczą. Fewmail to agent, który czyta to wszystko za ciebie.',
      needYou: ((slots) => ['Czeka na ciebie: ', slots.count]) as Rich<'count'>,
      queue: [
        {
          reason: 'Umowa na jutro',
          summary:
            'Potrzebuje podpisanej umowy przed piątkowym startem projektu.',
        },
        {
          reason: 'Faktura · $1,240 do 20 listopada',
          summary:
            'Faktura za październik za nowy projekt strony. Te same dane do płatności co ostatnio.',
        },
        {
          reason: 'Propozycja spotkania',
          summary:
            'Proponuje czwartek o 15:00. Jesteś wolny od 16:00, więc szkic proponuje czwartą.',
        },
      ],
      reading: {
        emphasis: 'każdy mail.',
        lead: 'Archiwizuje szum, wypisuje cię z tego, czego nigdy nie otwierasz, i zatrzymuje oszustów za drzwiami. Każdy jego krok jest zapisany z powodem, więc możesz go sprawdzić.',
        title: 'Fewmail czyta każdy mail.',
      },
      remind: 'Przypomnij 19 listopada',
      remindPlan: 'Doda ją do rachunków i przypomni ci 19 listopada.',
      start: 'Zacznij za darmo z Google',
      title: 'Poczta to nie twoja praca.',
      home: 'Strona główna',
      tryQueue: 'Wypróbuj kolejkę',
      unread: ((slots) => ['Nieprzeczytane: ', slots.count]) as Rich<'count'>,
      unreadInbox: ((slots) => [
        'Nieprzeczytane w skrzynce: ',
        slots.count,
      ]) as Rich<'count'>,
      willDo: 'Fewmail zrobi',
    },
    nav: {
      compare: 'Porównanie',
      features: 'Funkcje',
      mcp: 'Serwer MCP',
      pricing: 'Cennik',
      signIn: 'Zaloguj się',
    },
    play: {
      again: 'Wyczyść jeszcze raz',
      doneLead: (handled: string) =>
        `Podjąłeś trzy decyzje. Fewmail zajął się resztą (${handled}) i zapisał, dlaczego.`,
      doneTitle: 'Na dziś to wszystko.',
      emphasis: 'w dwie minuty.',
      handled: [
        'Lumen Weekly: nie otworzyłeś żadnego z ostatnich 30 wydań',
        'paypa1-billing.com udaje paypal.com',
        'Parcelhub: powiadomienia o dostawie, według reguły „Paragony i przesyłki”',
      ],
      handledTitle: 'Załatwione, gdy spałeś',
      label: 'Wypróbuj',
      lead: 'Tak teraz wygląda poranek. Szkice są napisane, powody podane, ty decydujesz. Śmiało, wyczyść ją.',
      left: (count: number) => `Do decyzji: ${count}`,
      title: 'Cała skrzynka w dwie minuty.',
    },
    plans: {
      about: (emails: string, messages: string) =>
        `Około ${emails} przeczytanych e-maili lub ${messages} wiadomości do agenta miesięcznie`,
      oneAllowance:
        'Jeden limit na wszystko, co robi agent: płacisz za to, czego używasz, a szum nigdy się nie liczy',
      everythingIn: (plan: string) => `Wszystko z planu ${plan}, a do tego`,
      forever: 'na zawsze',
      free: {
        description: 'Sortowanie, reguły i ochrona. Na zawsze.',
        features: [
          'Strona główna: jedna kolejka decyzji na żywo, zatwierdzanych pojedynczo lub hurtem',
          'Każdy e-mail posortowany i oceniony pod kątem ważności',
          'Reguły zwykłymi słowami, które archiwizują, oznaczają jako przeczytane lub wypisują',
          'Społecznościowa tarcza antyspamowa i ostrzeżenia przed phishingiem',
          'Nadawcy-zombie wyłapywani po wypisaniu się',
          'Automatyczne przypomnienia przy mailach, które czekają na odpowiedź',
          'Odkładanie, fragmenty i etykiety Fewmail w Gmailu',
        ],
      },
      max: {
        description: 'Ten sam agent dla zapchanej skrzynki.',
      },
      monthly: 'Miesięcznie',
      per: { month: 'miesięcznie', year: 'rocznie' },
      lite: {
        description: 'Cały agent: czyta, pisze i pamięta.',
        features: [
          'Odpowiedzi pisane twoim głosem, wysyłane dopiero po twojej zgodzie',
          'Telegram: pilne e-maile, zatwierdzanie i polecenia głosowe',
          'Zapamiętane obietnice i ludzie, tablice z wykresami dla pieniędzy lub czegokolwiek, co śledzisz',
          'Pytaj swoją pocztę o wszystko, plus MCP dla twoich narzędzi',
        ],
      },
      pro: {
        description: 'Ten sam agent z miejscem na więcej poczty.',
      },
      tryFree: (days: number) => `${days} dni za darmo`,
      yearly: 'Rocznie · 2 miesiące gratis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Sortowanie, reguły zwykłymi słowami i ochrona są za darmo na zawsze. Pro to agent, który czyta, pisze i pamięta za ciebie; Max to ten sam agent z zapasem na zapchaną skrzynkę. Każde konto zaczyna od ${trialDays} dni Pro, a gdy się skończą, po prostu zostajesz na planie Free.`,
      otherTool: 'Rozważasz inne narzędzie?',
      title: 'Płać za agenta, nie za skrzynkę.',
    },
    startFree: 'Zacznij za darmo',
    trialNote: (days: number) =>
      `${days} dni Pro, bez karty. Potem za darmo, jak długo chcesz.`,
    trust: {
      emphasis: 'pyta',
      label: 'Twoja poczta, twoje zdanie',
      places:
        'Działa na Gmailu, którego już używasz, i dociera do ciebie przez',
      title: 'Najpierw pyta, potem działa.',
      vows: [
        {
          description:
            'Szkice czekają na ciebie. Archiwizować, oznaczać jako przeczytane czy wypisywać się mogą same tylko reguły, które utworzyłeś lub zostawiłeś, a wszystko, co zrobiły, znajdziesz w Załatwionych.',
          title: 'Nic nie wychodzi bez twojego „tak”.',
        },
        {
          description:
            'Tematy, treści, streszczenia i szkice są szyfrowane w naszej bazie danych. Zapisane szkice zostają w Gmailu, nigdy u nas.',
          title: 'Zaszyfrowane w bazie.',
        },
        {
          description:
            'Tarcza antyspamowa uczy się od wszystkich przez hashe z kluczem. Nie udostępnia ani jednego adresu, ani słowa z twojej poczty.',
          title: 'Nigdy nie służy do trenowania modeli.',
        },
      ],
    },
  },
  skills: {
    bills: 'Rachunki i płatności do zapłaty',
    cancel: 'Anulować płatną subskrypcję',
    cleanup: 'Newslettery do uprzątnięcia',
    followups: 'Kto jeszcze ci nie odpisał',
    reading: 'Newslettery z dnia w jednym podsumowaniu',
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
  telegram: {
    approveAlike: 'Zatwierdź naraz wszystkie karty jednego typu:',
    heard: (text: string) => `Usłyszałem: „${text}”`,
    voiceFailed:
      'Nie udało mi się tego zrozumieć. Spróbuj jeszcze raz albo napisz.',
    help: 'Napisz albo powiedz, czego potrzebujesz:\n• zapytaj o pocztę: „kiedy odnawia się Netflix?”\n• powiedz, co odpisać: „napisz Annie, że podpiszę jutro”\n• zleć mi coś: „utwórz tablicę na podróże”\n• odpowiedz na mój szkic, żeby go zmienić',
    canceled: 'Anulowano. Szkic wrócił do kolejki.',
    sendingIn: (seconds: number) => `Wysyłanie za ${seconds} s`,
    undo: 'Cofnij',
    commands: { queue: 'Co czeka na ciebie' },
    connectFirst: (url: string) =>
      `Cześć! Jestem Fewmail. Tutaj, w Telegramie, daję znać, gdy przychodzi pilna poczta, pokazuję, co czeka na ciebie, i wysyłam odpowiedzi, które zatwierdzisz.\n\nTen czat nie jest jeszcze połączony z twoim Fewmail. To zajmie minutę:\n1. Otwórz ustawienia Fewmail: ${url}\n2. W sekcji Integracje stuknij „Połącz Telegram” (to część Fewmail Pro).\n3. Telegram przeniesie cię z powrotem tutaj — naciśnij Start i gotowe.`,
    connected:
      'Połączono. Dam znać, gdy przyjdzie coś pilnego.\n\n/queue: co czeka na ciebie',
    done: 'Gotowe',
    draft: 'Szkic:',
    edit: 'Edytuj',
    editPrompt:
      'Wyślij mi tekst, którego mam użyć, albo powiedz, jak go zmienić, zaczynając od „/”, np. „/bardziej formalnie”.',
    newDraft: 'Nowy szkic:',
    nothing: 'Nic teraz na ciebie nie czeka.',
    proOnly:
      'Telegram jest częścią Fewmail Pro. Otwórz Ustawienia → Plan w Fewmail, aby przejść na Pro.',
    draftClipped:
      'Tu skrócono. „Wyślij” wysyła cały szkic. Przeczytaj go w Fewmail.',
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
    working: 'W toku…',
    allKinds: 'Wszystkie',
    ruleOffer: {
      lead: 'Agent może robić to sam z pasującymi mailami. Reguła jest wyłączona, dopóki nie powiesz „tak”.',
      no: 'Zostaw wyłączoną',
      turnedOn: 'Włączono. Zmienisz to w Regułach.',
      yes: 'Włącz',
    },
    newSender: {
      archive: 'Zawsze archiwizuj',
      archived:
        'Nowe wiadomości od tego nadawcy będą archiwizowane. Zmienisz to w Regułach.',
      keep: 'Zostaw jak zwykle',
      label: 'Nowy nadawca',
      lead: (count: number, opened: number) =>
        `${count} wiadomości w dwa tygodnie, ${opened === 0 ? 'żadnej nie otwarto' : `otwarte: ${opened}`}`,
    },
    readingNow: (total: number) =>
      plural('pl', total, {
        one: () => 'Agent czyta nową wiadomość',
        few: (n) => `Agent czyta ${n} nowe wiadomości`,
        many: (n) => `Agent czyta ${n} nowych wiadomości`,
        other: (n) => `Agent czyta ${n} nowej wiadomości`,
      }),
    allDone: 'Gotowe. Nic na ciebie nie czeka.',
    allDoneLead:
      'Dalej czytam nową pocztę, a wszystko, co wymaga twojej uwagi, pojawi się tutaj.',
    byRules: (n: number) => `Twoje reguły zajęły się ${n}.`,
    decisions: 'Decyzje',
    journal: {
      approved: 'Twoje „tak”',
      byRule: (rule: string) => `Twoja reguła: ${rule}`,
      failed: 'Nie udało się',
      lead: 'Ostatnie 7 dni. Każda zmiana w poczcie, kalendarzu czy tablicach miała twoje „tak” albo włączoną przez ciebie regułę.',
      title: 'Zrobione w twojej poczcie',
    },
    progress: (done: number, total: number) => `${done} z ${total}`,
    readAll:
      'Przeczytałem wszystkie, a bez twojego „tak” w poczcie nic się nie zmienia.',
    worthKnowing: 'Warto wiedzieć',
    quick: 'Szybko',
    needsLook: 'Zobacz sam',
    tidy: {
      confirm: (emails: string) => `Uporządkować ${emails}?`,
      running: 'Porządkowanie…',
      unsubscribeHint:
        'Wśród nich są listy, z których Fewmail cię wypisze, a wypisania nie można cofnąć.',
      archive: (n: number) => `do archiwizacji: ${n}`,
      review: 'Sprawdź',
      reviewLead:
        'Każdy e-mail z tym, co zrobiłby agent, i dlaczego. Zatwierdź to, co wygląda dobrze, zostaw to, co ma zostać bez zmian.',
      reviewTitle: 'Sprawdź, co proponuje agent',
      done: (n: number) => `Uporządkowane: ${n}`,
      keep: 'Zostaw',
      mark_read: (n: number) => `do oznaczenia jako przeczytane: ${n}`,
      run: 'Zatwierdź wszystko',
      total: (n: number) => `E-maile, które agent proponuje uporządkować: ${n}`,
      unsubscribe: (n: number) => `do wypisania się: ${n}`,
      untilYouApprove:
        'Nic w twojej poczcie się nie zmieni, dopóki nie zatwierdzisz',
      spam: (n: number) => `do spamu: ${n}`,
      trash: (n: number) => `do usunięcia: ${n}`,
    },
    pauseListening: 'Wstrzymaj',
    resumeListening: 'Wznów',
    awaiting: 'Czekasz na odpowiedź',
    hint: {
      notNow: 'Nie teraz',
      setUp: 'Skonfiguruj',
      turnOn: 'Włącz',
    },
    dates: 'Terminy i spotkania',
    done: 'Gotowe',
    firstRead:
      'Czytam Twoją pocztę z ostatnich trzech dni. To, co wymaga Twojej uwagi, pojawi się tu samo, a bez Twojego „tak” nic się nie zmieni.',
    approvedMany: (n: number) => `Zatwierdzono: ${n}`,
    listen: 'Odsłuchaj',
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
    period: (days: number) =>
      days === 1 ? 'z ostatniej doby' : `z ostatnich ${days} dni`,
    pulse: {
      lists: (n: number) => `${n} z list mailingowych`,
      people: (n: number) => `${n} od ludzi`,
      total: (total: number, period: string) =>
        plural('pl', total, {
          one: (n) => `${n} e-mail ${period}`,
          few: (n) => `${n} e-maile ${period}`,
          many: (n) => `${n} e-maili ${period}`,
          other: (n) => `${n} e-maila ${period}`,
        }),
    },
    saved: (minutes: number) =>
      `W tym tygodniu Fewmail zaoszczędził ci około ${formatMinutes('pl', minutes)}`,
    recent: (period: string) => `Też ${period}`,
    sent: 'Wysłano',
    codes: 'Kody logowania',
    worthAttention: 'Warte uwagi',
  },
  upgrade: {
    ask: 'Zapytaj swoją pocztę',
    hints: {
      ask: 'Część Fewmail Pro: pytaj o cokolwiek własnymi słowami i dostawaj odpowiedź z własnej poczty.',
      boards:
        'Część Fewmail Pro: opisz, co zbierać, a agent znajdzie to w poczcie i będzie aktualizować.',
      drafts:
        'Część Fewmail Pro: agent napisze odpowiedź w twoim stylu, a ty ją poprawisz i wyślesz.',
    },
  },
  whatsapp: {
    connectFirst: (url: string) =>
      `Cześć! Jestem Fewmail. Tutaj, w WhatsAppie, daję znać, gdy przychodzi pilny mail, pokazuję, co na ciebie czeka, i wysyłam odpowiedzi, które zatwierdzisz.\n\nTen numer nie jest jeszcze połączony z twoim Fewmail. To zajmie minutę:\n1. Otwórz ustawienia Fewmail: ${url}\n2. W Integracjach stuknij „Połącz WhatsApp” (część Fewmail Pro).\n3. WhatsApp otworzy się z gotową wiadomością — wyślij ją i gotowe.`,
    connected:
      'Połączono. Napiszę, gdy przyjdzie coś pilnego. Wyślij tekst albo głosówkę, żeby odpowiedzieć na dowolny e-mail.',
    proOnly:
      'WhatsApp jest częścią Fewmail Pro. Otwórz Ustawienia → Plan w Fewmail, aby przejść na Pro.',
  },
  zombie: {
    badge: (share: number) => `Ignoruje wypisanie u ${share}% osób`,
    reason: 'Wysyłał dalej po tym, jak się wypisałeś',
  },
}
