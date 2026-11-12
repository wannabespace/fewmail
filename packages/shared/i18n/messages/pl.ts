import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
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
    autonomy: {
      ask: 'Pyta cię przed każdym e-mailem',
      auto: (most: number) =>
        `Wysyła e-maile sam, bez pytania cię (maksymalnie ${most})`,
    },
    calendar: (email: string) => `W kalendarzu ${email}`,
    cc: (recipients: string) => `DW: ${recipients}`,
    confirm: {
      create_schedule: 'Uruchamiać to według harmonogramu?',
      create_event: 'Dodać to wydarzenie?',
      delete_event: 'Usunąć to wydarzenie?',
      update_event: 'Zmienić to wydarzenie?',
      approve_action: 'Wykonać tę akcję?',
      archive_thread: 'Zarchiwizować ten wątek?',
      clear_out: 'Uprzątnąć te grupy maili ze skrzynki?',
      undo_clear_out: 'Przywrócić do skrzynki wszystko, co uprzątnięto?',
      create_rule: 'Dodać tę regułę?',
      handle_thread: 'Przekazać ten wątek agentowi?',
      reply: 'Wysłać tę odpowiedź?',
      send_email: 'Wysłać tego e-maila?',
      snooze_thread: 'Odłożyć ten wątek?',
      unsubscribe: 'Wypisać się od tego nadawcy?',
      trash_thread: 'Przenieść ten wątek do kosza?',
      report_spam: 'Zgłosić tego nadawcę jako spam?',
      mark_not_spam: 'Wyjąć ten wątek ze spamu?',
      move_to_inbox: 'Przenieść ten wątek z powrotem do odebranych?',
    },
    decline: 'Nie',
    declined: 'Odmówiono',
    detach: 'Nie dołączaj tego e-maila',
    deleteChat: 'Usuń czat',
    failed: 'Agent nie dał rady dokończyć. Spróbuj ponownie.',
    lead: 'Pytaj o swoją pocztę albo powiedz, co zrobić. Wszystko, co wysyła lub zmienia Gmaila, czeka na twoje „tak”.',
    newChat: 'Nowy czat',
    noChats: 'Nie ma jeszcze czatów',
    cancelEdit: 'Anuluj edycję',
    copy: 'Kopiuj',
    edit: 'Edytuj',
    editing: 'Edytujesz wiadomość',
    regenerate: 'Odpowiedz ponownie',
    skills: 'Umiejętności',
    placeholder: 'Zapytaj o pocztę albo wpisz /, by wybrać umiejętność',
    retry: 'Spróbuj ponownie',
    send: 'Wyślij',
    steps: {
      create_schedule: 'Ustawiam harmonogram',
      delete_schedule: 'Zatrzymuję harmonogram',
      list_schedules: 'Czytam harmonogramy',
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
      get_board: 'Czytam tablicę',
      get_person: 'Szukam osoby',
      get_today: 'Sprawdzam dzisiejsze',
      handle_thread: 'Przekazuję wątek',
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
      trash_thread: 'Przenoszę do kosza',
      report_spam: 'Zgłaszam spam',
      mark_not_spam: 'Wyjmuję ze spamu',
      move_to_inbox: 'Przenoszę do odebranych',
      create_board: 'Tworzę tablicę',
    },
    stop: 'Zatrzymaj',
    thinking: 'Myślę…',
    title: 'W czym mogę pomóc?',
    to: (recipients: string) => `Do: ${recipients}`,
    until: (time: string) => `Do ${time}`,
    yes: {
      create_schedule: 'Zaplanuj',
      create_event: 'Dodaj',
      delete_event: 'Usuń',
      update_event: 'Zapisz',
      approve_action: 'Wykonaj',
      archive_thread: 'Archiwizuj',
      clear_out: 'Uprzątnij',
      undo_clear_out: 'Przywróć',
      create_rule: 'Dodaj',
      handle_thread: 'Przekaż',
      reply: 'Wyślij',
      send_email: 'Wyślij',
      snooze_thread: 'Odłóż',
      unsubscribe: 'Wypisz się',
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
    chart: {
      add: 'Dodaj wykres',
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
      subscriptions: {
        description:
          'Usługi, za które płacę regularnie: ile kosztuje każda, jak często i kiedy się odnawia.',
        name: 'Płatne subskrypcje',
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
  calendar: {
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
    busiest: (day: string, hour: string) =>
      `Najwięcej poczty: ${day}, około ${hour}`,
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
    split: (people: string, lists: string) =>
      `${people} od ludzi · ${lists} z newsletterów`,
    title: { month: 'Twój miesiąc w mailach', year: 'Twój rok w mailach' },
    unsubscribed: 'newsletterów porzuconych',
  },
  forward: {
    done: 'Twój przekazany mail',
  },
  reading: {
    empty: 'W ostatniej dobie nie było newsletterów.',
    lead: 'Newslettery z ostatniej doby w jednym miejscu, żeby nie zaśmiecały skrzynki.',
    title: 'Czytanie',
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
    goTo: 'Przejdź do',
    mail: 'Poczta',
    nothingMatches: 'Brak wyników.',
    placeholder: 'Zapytaj o pocztę lub wpisz polecenie…',
    commandsOnly: 'Wpisz polecenie…',
    rewriteBrief: 'Napisz podsumowanie od nowa',
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
  errors: {
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
    restore: 'do odebranych',
    calendarToday: 'dziś',
    newEvent: 'nowe wydarzenie',
    period: 'wstecz / dalej',
    view: 'widok',
    group: 'grupuj',
    skills: 'umiejętności',
    unsubscribe: 'wypisz się',
    filter: 'filtr',
    reply: 'odpowiedz',
    snooze: 'odłóż',
    trash: 'kosz',
    ask: 'zapytaj o niego',
    anything: 'cokolwiek',
    approve: 'zatwierdź',
    approveAll: (n: number) => `zatwierdź wszystkie ${n} tego typu`,
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
      'Fewmail prosi o dostęp do czytania, porządkowania i wysyłania poczty Gmail w twoim imieniu. Nic nie zostanie wysłane ani zarchiwizowane bez twojej zgody, chyba że ustawisz regułę, która na to pozwala. Prosi też o dostęp do Kalendarza Google, który możesz odznaczyć.',
    continue: 'Kontynuuj z Google',
    lead: 'Fewmail czyta twoją skrzynkę za ciebie, odpowiada twoim głosem i pokazuje tylko to, co naprawdę wymaga twojej uwagi.',
    messengers:
      'Działa też w komunikatorach, na początek w Telegramie: odbieraj podsumowanie, zatwierdzaj odpowiedzi albo po prostu nagraj głosówkę.',
    title: 'Tylko to, co ważne.',
  },
  mail: {
    allMailboxes: 'Wszystkie skrzynki',
    group: {
      category: 'Kategoria',
      importance: 'Ważność',
      none: 'Bez grup',
      sender: 'Nadawca',
      title: 'Grupuj',
    },
    unread: 'Nieprzeczytane',
    block: 'Zablokuj nadawcę',
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
    attachment: 'załącznik',
    draftReply: 'Szkic odpowiedzi',
    drafting: 'Piszę…',
    draftWaiting: 'Szkic czeka w Dziś',
    due: (date: string) => `termin ${date}`,
    dueHint: 'Termin znaleziony przez agenta w tym mailu',
    empty: 'Brak maili',
    emptyHint: 'Nowe maile pojawią się tu, gdy tylko przyjdą.',
    expectsReply: 'Czeka na odpowiedź',
    filter: {
      archive: 'Archiwum',
      trash: 'Kosz',
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
    calendar: 'Kalendarz',
    subscriptions: 'Subskrypcje',
    agent: 'Agent',
    boards: 'Tablice',
    newBoard: 'Nowa tablica',
    mail: 'Poczta',
    reading: 'Czytanie',
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
    awaitsAnswer:
      'Pominąłem to uruchomienie: poprzednie wciąż czeka w tym czacie na twoją odpowiedź.',
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
    askedByYou: 'Na twoją prośbę',
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
    forward: {
      copy: 'Kopiuj adres',
      description:
        'Wyślij lub przekaż dowolny mail na ten adres ze swojej skrzynki, z notatką na górze, co zrobić. Odpowiedź przyjdzie w Telegramie lub WhatsAppie i w osobnym czacie tutaj.',
      title: 'Przekaż agentowi',
    },
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
      allow: 'Zezwól',
      connected: (ago: string) => `Połączono ${ago}`,
      copy: 'Kopiuj URL',
      defaultName: 'Klient MCP',
      deny: 'Odmów',
      description:
        'Mogą czytać twoje podsumowanie i pocztę, pisać szkice odpowiedzi i wysyłać je po twoim potwierdzeniu.',
      disconnect: 'Odłącz',
      paste:
        'Dodaj ten URL jako konektor w swojej aplikacji i zaloguj się do Fewmail.',
      request: (app: string) => `${app} chce korzystać z twojego Fewmail`,
      title: 'Połącz Claude, Cursor lub dowolnego klienta MCP',
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
  site: {
    chapters: {
      compare: {
        description:
          'Większość narzędzi pomaga ci szybciej przebić się przez skrzynkę. Fewmail robi to za ciebie.',
        label: 'Porównanie',
        title: 'Czym Fewmail się wyróżnia.',
      },
      control: {
        description:
          'Powiedz Fewmail zwykłymi słowami, co robić z pocztą, zdecyduj, które reguły mogą działać same, i przejrzyj wszystko, co zrobił, w Załatwionych.',
        label: 'Kontrola',
        title: 'Ty ustalasz reguły. On pokazuje swoją pracę.',
      },
      memory: {
        description:
          'Fewmail pamięta, co obiecałeś, kim są ludzie, za co płacisz i którymi wątkami wciąż się dla ciebie zajmuje.',
        label: 'Pamięć',
        title: 'Pamięta, żebyś ty nie musiał.',
      },
      pricing: {
        description:
          'Sortowanie, reguły i ochrona są za darmo na zawsze. Pro i Max dodają wszystko, co czyta i pisze za ciebie; Max po prostu robi tego więcej.',
        label: 'Cennik',
        title: (usd: number) => `Sortowanie za darmo. Agent od $${usd}.`,
      },
      protection: {
        description:
          'Każdy plan ma społecznościową tarczę antyspamową, która uczy się od wszystkich użytkowników Fewmail, nigdy nie udostępniając żadnego adresu ani słowa z twojej poczty. Podszywające się domeny, znany phishing i zmienione dane do płatności wywołują ostrzeżenie, zanim cokolwiek zrobisz.',
        label: 'Ochrona',
        title: 'Oszuści zostają za drzwiami.',
      },
      questions: {
        description:
          'Krótkie odpowiedzi. Długie znajdziesz w polityce prywatności.',
        label: 'Pytania',
        title: 'Zanim połączysz Gmaila.',
      },
      replies: {
        description:
          'Fewmail uczy się, jak piszesz, z wysłanych przez ciebie maili, a potem z wyprzedzeniem przygotowuje odpowiedzi w języku danego e-maila. Popraw, poproś o inną wersję albo wyślij bez zmian. Nic nie wychodzi bez twojego „tak”.',
        label: 'Odpowiedzi',
        title: 'Odpowiedzi twoim głosem, w ich języku.',
      },
      telegram: {
        description:
          'Odbieraj podsumowanie i pilne maile w Telegramie, zatwierdzaj odpowiedź jednym stuknięciem albo po prostu nagraj głosówkę: „powiedz Marco, że czwartek pasuje”. Fewmail znajdzie wątek i przygotuje szkic.',
        label: 'Telegram',
        title: 'Twoja skrzynka w czacie.',
      },
      today: {
        description:
          'Codziennie o wybranej przez ciebie godzinie Fewmail pisze krótkie podsumowanie w twoim języku i ustawia w kolejce tych kilka maili, które wymagają decyzji, od najważniejszych. Zatwierdź ⏎, pomiń S; reszta jest już załatwiona, a ty widzisz dokładnie, co zrobił.',
        label: 'Dziś',
        title: 'Jedno podsumowanie. Jedna kolejka. To cała twoja skrzynka.',
      },
    },
    closing: {
      lead: 'Połącz Gmaila w minutę. Fewmail zaczyna od poczty z ostatnich trzech dni, więc pierwsze decyzje czekają na ciebie od razu.',
      title: 'Odzyskaj swoje poranki.',
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
        brief: 'Codzienne podsumowanie',
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
        brief: 'W twoim języku, w Pro',
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
          'SaneBox sortuje pocztę do folderów, a w najwyższym planie pisze też szkice i streszcza. Fewmail najpierw wszystko czyta i daje ci jedno podsumowanie oraz kilka decyzji, które możesz podjąć tylko ty.',
        them: {
          brief: 'Codzienne zestawienie odfiltrowanej poczty',
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
    control: {
      gmail: {
        description:
          'Opcjonalne etykiety Fewmail pokazują sortowanie w samym Gmailu, na telefonie i w każdej innej aplikacji pocztowej.',
        title: 'Działa z każdą aplikacją Gmail',
      },
      handled: {
        description:
          'Wszystko, co agent zrobił sam, znajdziesz w Załatwionych, każdą czynność z powodem.',
        title: 'Załatwione, na widoku',
      },
      keyboard: {
        description:
          'Każda akcja ma swój klawisz, a ⌘K sięga wszędzie. Ręce nie opuszczają klawiatury.',
        title: 'Najpierw klawiatura',
      },
      mcp: {
        description:
          'Połącz Claude lub dowolnego klienta MCP i pozwól mu czytać, segregować i pisać szkice z tym samym agentem.',
        title: 'Serwer MCP',
      },
      privacy: {
        description:
          'Tematy, treści, streszczenia i szkice są szyfrowane w naszej bazie danych. Wysłanie zawsze wymaga twojej zgody.',
        title: 'Prywatność od podstaw',
      },
      rules: {
        description:
          '„Newslettery, których nigdy nie otwieram” albo „paragony ze sklepów”: archiwizuj, oznacz jako przeczytane lub wypisz się.',
        title: 'Reguły zwykłymi słowami',
      },
    },
    demos: {
      draft: {
        expectsReply: 'Oczekuje odpowiedzi',
        language: 'Po niemiecku, jak Lena',
        redraft: 'Napisz od nowa',
      },
      shield: [
        {
          detail: 'paypa1-billing.com udaje paypal.com',
          label: 'Podszywająca się domena',
        },
        {
          detail: 'Nowy IBAN na fakturze od znanego dostawcy',
          label: 'Zmienione dane do płatności',
        },
        {
          detail: '9 osób zgłosiło tę kampanię jako spam',
          label: 'Przeniesione do spamu',
        },
      ],
      telegram: {
        draftReady: 'Szkic dla Marco gotowy: czwartek o 16:00. Wysłać?',
        urgent:
          'Potrzebuje podpisanej umowy przed piątkiem. Przygotowałem odpowiedź.',
        voice: '„Powiedz Marco, że czwartek pasuje, ale o czwartej.”',
      },
      today: {
        brief:
          'Anna czeka na umowę, faktura Northwind jest do zapłaty w przyszłym tygodniu, a Marco chce termin w czwartek. Czterdzieści dwa newslettery i powiadomienia są już załatwione.',
        day: 'Podsumowanie na czwartek',
        queue: [
          {
            reason: 'Umowa na jutro',
            summary:
              'Potrzebuje podpisanej umowy przed piątkowym startem projektu.',
          },
          {
            reason: 'Faktura · 1240 $ do 20 listopada',
            summary: 'Faktura za październik za nowy projekt strony.',
          },
          {
            reason: 'Propozycja spotkania',
            summary: 'Proponuje czwartek o 15:00 na przegląd kwartalny.',
          },
        ],
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
          'Szkice powstają w języku e-maila, na który odpowiadasz. Aplikacja, podsumowanie i bot w Telegramie mówią jednym wybranym przez ciebie językiem spośród piętnastu.',
        question: 'Jakie języki zna?',
      },
      {
        answer:
          'Na razie konta Gmail i Google Workspace. Dodaj kilka skrzynek do jednego Fewmail, a ich poczta trafi do tego samego podsumowania i tej samej skrzynki.',
        question: 'Jakie konta e-mail działają?',
      },
    ],
    footer: {
      legal: 'Informacje prawne',
      product: 'Produkt',
      tagline:
        'Agent poczty, który czyta twojego Gmaila i pokazuje tylko to, co wymaga twojej uwagi.',
      versus: (name: string) => `vs ${name}`,
    },
    hero: {
      lead: 'Fewmail to agent poczty dla Gmaila. Czyta za ciebie każdy e-mail, pisze odpowiedzi twoim głosem i daje ci jedną krótką listę tego, co naprawdę wymaga twojej uwagi.',
      start: 'Zacznij za darmo z Google',
    },
    memory: {
      ask: {
        description:
          'Zadaj pytanie w ⌘K i dostań odpowiedź z własnej poczty, razem z mailami, z których pochodzi.',
        title: 'Zapytaj swoją pocztę',
      },
      boards: {
        description:
          'Opisz, co śledzić (pieniądze, podróże, zamówienia), a agent zbierze to z twojej poczty, z wykresami, zaczynając od ostatnich sześciu miesięcy.',
        title: 'Tablice',
      },
      followUps: {
        description:
          'Mail, który czeka na odpowiedź, dostaje przypomnienie, więc żaden wątek nie umiera po cichu.',
        title: 'Przypomnienia',
      },
      handle: {
        description:
          'Powiedz „zajmij się tym”, a agent poprowadzi wątek do twojego celu, pytając przed każdą wysyłką albo wysyłając sam.',
        title: 'Zajmij się tym',
      },
      people: {
        description:
          'Krótka notatka o każdym, do kogo piszesz, odświeżana co tydzień, tuż obok jego maila.',
        title: 'Ludzie',
      },
      promises: {
        description:
          'Obietnice z wysłanych maili wracają do ciebie w terminie, zanim ktokolwiek będzie musiał cię ponaglać.',
        title: 'Dotrzymane obietnice',
      },
    },
    nav: {
      compare: 'Porównanie',
      features: 'Funkcje',
      pricing: 'Cennik',
      signIn: 'Zaloguj się',
    },
    plans: {
      everythingIn: (plan: string) => `Wszystko z planu ${plan}, a do tego`,
      forever: 'na zawsze',
      free: {
        description: 'Sortowanie, reguły i ochrona. Na zawsze.',
        features: [
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
        emails: (emails: string) =>
          `${emails} przeczytanych e-maili miesięcznie`,
        messages: (messages: number) =>
          `${messages} wiadomości do agenta miesięcznie`,
        unlimited: 'Tablice i przekazane wątki bez limitu',
      },
      monthly: 'Miesięcznie',
      per: { month: 'miesięcznie', year: 'rocznie' },
      pro: {
        description: 'Cały agent: czyta, pisze i pamięta.',
        features: [
          'Dziś: codzienne podsumowanie i jedna kolejka decyzji',
          'Odpowiedzi pisane twoim głosem, wysyłane dopiero po twojej zgodzie',
          'Telegram: podsumowanie, zatwierdzanie i polecenia głosowe',
          '„Zajmij się tym”: agent prowadzi wątek do celu',
          'Zapamiętane obietnice i ludzie, tablice z wykresami dla pieniędzy lub czegokolwiek, co śledzisz',
          'Pytaj swoją pocztę o wszystko, plus MCP dla twoich narzędzi',
        ],
        limits: (emails: string, messages: number) =>
          `${emails} przeczytanych e-maili i ${messages} wiadomości do agenta miesięcznie; szum nigdy się nie liczy`,
      },
      tryFree: (days: number) => `Wypróbuj za darmo przez ${days} dni`,
      yearly: 'Rocznie · 2 miesiące gratis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Sortowanie, reguły zwykłymi słowami i ochrona są za darmo na zawsze. Pro to agent, który czyta, pisze i pamięta za ciebie; Max to ten sam agent z zapasem na zapchaną skrzynkę. Każde konto zaczyna od ${trialDays} dni Pro, a gdy się skończą, po prostu zostajesz na planie Free.`,
      otherTool: 'Rozważasz inne narzędzie?',
      title: 'Płać za agenta, nie za skrzynkę.',
    },
    promises: [
      'Nic nie zostanie wysłane bez twojej zgody',
      'Twoja poczta jest przechowywana w postaci zaszyfrowanej',
      'Nigdy nie służy do trenowania modeli',
    ],
    startFree: 'Zacznij za darmo',
    trialNote: (days: number) =>
      `${days} dni Pro, bez karty. Potem za darmo, jak długo chcesz.`,
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
    listen: '🔊 Posłuchaj',
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
      'Połączono. Będę wysyłać podsumowanie co rano i dam znać, gdy przyjdzie coś pilnego.\n\n/brief: dzisiejsze podsumowanie\n/queue: co czeka na ciebie',
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
    briefAt: (time: string) => `podsumowanie codziennie o ${time}`,
    dates: 'Terminy i spotkania',
    done: 'Gotowe',
    firstRead:
      'Czytam Twoją pocztę z ostatnich trzech dni. To, co wymaga Twojej uwagi, pojawi się tu samo.',
    approvedMany: (n: number) => `Zatwierdzono: ${n}`,
    listen: 'Posłuchaj podsumowania',
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
    savedHow: (handled: number, replies: number) =>
      `Załatwione samodzielnie: ${handled} · Odpowiedzi wysłane z wersji roboczych: ${replies}`,
    recent: (period: string) => `Też ${period}`,
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
