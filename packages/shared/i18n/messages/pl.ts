import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const pl: Messages = {
  actionDone: {
    heads_up: 'Rozumiem',
    commitment: 'Gotowe',
    confirm: 'Potwierdzone',
    follow_up: 'Przypomniano',
    pay: 'Zapłacone',
    read: 'Przeczytane',
    renew: 'Przedłużone',
    schedule: 'Zaplanowane',
    security: 'Sprawdzone',
    sign: 'Podpisane',
  },
  actionLink: {
    confirm: 'Potwierdź',
    pay: 'Zapłać',
    read: 'Czytaj',
    renew: 'Przedłuż',
    sign: 'Podpisz',
  },
  actionKind: {
    heads_up: 'Do wiadomości',
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
      create_event: 'Dodać to wydarzenie?',
      delete_event: 'Usunąć to wydarzenie?',
      update_event: 'Zmienić to wydarzenie?',
      approve_action: 'Wykonać tę akcję?',
      archive_thread: 'Zarchiwizować ten wątek?',
      clear_out: 'Uprzątnąć te grupy maili ze skrzynki?',
      undo_clear_out: 'Przywrócić do skrzynki wszystko, co uprzątnięto?',
      create_bot: 'Utworzyć tego bota?',
      update_bot: 'Zmienić tego bota?',
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
      list_subscriptions: 'Sprawdzam listy mailingowe',
      approve_action: 'Wykonuję',
      archive_thread: 'Archiwizuję',
      get_reading: 'Czytam newslettery',
      get_wrapped: 'Liczę twoją pocztę',
      clear_out: 'Porządkuję skrzynkę',
      preview_clear_out: 'Czytam całą skrzynkę',
      undo_clear_out: 'Przywracam uprzątnięte maile',
      create_bot: 'Tworzę bota',
      update_bot: 'Zmieniam bota',
      dismiss_action: 'Pomijam',
      draft_reply: 'Piszę odpowiedź',
      create_draft: 'Zapisuję szkic',
      find_people: 'Szukam adresu',
      get_person: 'Szukam osoby',
      get_today: 'Sprawdzam dzisiejsze',
      list_handled: 'Sprawdzam, co załatwiono',
      list_mail: 'Przeszukuję pocztę',
      get_bot_chat: 'Czytam czat',
      list_bots: 'Czytam twoje boty',
      read_thread: 'Czytam wątek',
      redraft_action: 'Przepisuję szkic',
      refresh: 'Sprawdzam nową pocztę',
      remind_later: 'Ustawiam przypomnienie',
      send_email: 'Wysyłam',
      snooze_thread: 'Odkładam',
      unsubscribe: 'Wypisuję',
      tidy_mail: 'Porządkuję',
      trash_thread: 'Przenoszę do kosza',
      report_spam: 'Zgłaszam spam',
      mark_not_spam: 'Wyjmuję ze spamu',
      move_to_inbox: 'Przenoszę do odebranych',
      list_promises: 'Sprawdzam obietnice',
      set_promise_status: 'Aktualizuję obietnicę',
    },
    to: (recipients: string) => `Do: ${recipients}`,
    until: (time: string) => `Do ${time}`,
    yes: {
      dismiss_action: 'Pomiń',
      create_event: 'Dodaj',
      delete_event: 'Usuń',
      update_event: 'Zapisz',
      approve_action: 'Wykonaj',
      archive_thread: 'Archiwizuj',
      clear_out: 'Uprzątnij',
      undo_clear_out: 'Przywróć',
      create_bot: 'Utwórz bota',
      update_bot: 'Zapisz',
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
  byBot: 'przez bota',
  bulk: {
    badge: (n: number) => `Wysłane do ${n}+ użytkowników Fewmail`,
    reason: (n: number) =>
      `Masowy e-mail: ${n}+ użytkowników Fewmail dostało ten sam tekst`,
  },
  cold: {
    reason:
      'Zimny mail: obca osoba coś proponuje, a z tym adresem nie było żadnej korespondencji',
  },
  calendar: {
    tomorrow: 'Jutro',
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
    saving: 'Zapisuję wydarzenie…',
    scope: {
      this: 'Tylko to wydarzenie',
      following: 'To i następne wydarzenia',
      all: 'Wszystkie wydarzenia',
    },
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
  board: {
    lead: {
      coming: (total: number) =>
        plural('pl', total, {
          one: () => 'Zbliża się jeden termin.',
          few: (n) => `Zbliżają się ${n} terminy.`,
          many: (n) => `Zbliża się ${n} terminów.`,
          other: (n) => `Zbliża się ${n} terminu.`,
        }),
      owed: (amounts: string) => `Należy ci się ${amounts}.`,
      promised: (total: number) =>
        plural('pl', total, {
          one: () => 'Masz jedno zobowiązanie.',
          few: (n) => `Masz ${n} zobowiązania.`,
          many: (n) => `Masz ${n} zobowiązań.`,
          other: (n) => `Masz ${n} zobowiązania.`,
        }),
      waiting: (total: number) =>
        plural('pl', total, {
          one: () => 'Jedna złożona ci obietnica czeka na spełnienie.',
          few: (n) => `${n} złożone ci obietnice czekają na spełnienie.`,
          many: (n) => `${n} złożonych ci obietnic czeka na spełnienie.`,
          other: (n) => `${n} złożonej ci obietnicy czeka na spełnienie.`,
        }),
    },
    section: {
      coming: 'Zbliża się',
      owed: 'Należy ci się',
      promised: 'Twoje zobowiązania',
      settled: 'Ostatnio zamknięte',
    },
    state: {
      acknowledged: 'odpowiedzieli, jeszcze nie zrobione',
      broken: 'nie doszło do skutku',
      cancelled: 'odwołane',
      fulfilled: 'zrobione',
      in_progress: 'w drodze',
      open: 'czeka',
      overdue: 'po terminie',
    },
    by: (date: string) => `do ${date}`,
    lastDay: (date: string) => `termin: ${date}`,
    done: 'Zrobione',
    forget: 'Zapomnij',
    reopen: 'Otwórz ponownie',
    markedDone: 'Oznaczono jako zrobione',
    forgotten: 'Zapomniano',
    reopened: 'Otwarto ponownie',
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
    partial:
      'Gmail przerwał część porządków. To, co już przeniesiono, można przywrócić.',
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
    ready: (emails: string) => `Można uprzątnąć ${emails}`,
    review: 'Przejrzyj',
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
    handled: 'maili załatwił Fewmail',
    handledHint:
      'Fewmail nic nie zmienia w Gmailu bez twojej zgody. Pozwól botowi działać samemu, a zajmie się taką pocztą za ciebie.',
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
    note: {
      inSummary: 'W podsumowaniu',
      leftOut: 'Pominięty',
    },
    digest: (n: number) => `Newslettery: ${n}`,
    lead: 'Newslettery z jednego dnia w jednym miejscu, żeby nie zaśmiecały skrzynki.',
    issues: 'Wszystkie wydania',
    empty: 'Jeszcze nie ma newsletterów',
    emptyHint:
      'Każdego ranka agent zbierze tu wiadomości z twoich newsletterów, a każda linijka poprowadzi do maila, z którego pochodzi.',
    title: 'Czytanie',
  },
  commitments: {
    title: 'Twoje zobowiązania',
  },
  compose: {
    attach: 'Załącz pliki',
    attachmentsTooLarge: (limit: string) =>
      `Załączniki mogą mieć łącznie do ${limit}.`,
    dropFiles: 'Upuść pliki, aby je załączyć',
    removeAttachment: 'Usuń',
    discarded: 'Wersja robocza odrzucona',
    backInQueue: 'Anulowano. Szkic wrócił na stronę główną.',
    canceled: 'Anulowano. Twój e-mail wrócił do edytora.',
    cc: 'DW',
    discard: 'Odrzuć',
    draftSaved: 'Szkic zapisany',
    forward: 'Przekaż',
    forwardedMessage: 'Przekazana wiadomość',
    from: 'Od',
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
    undoing: 'Cofam…',
    writeForMe: 'Napisz za mnie',
    writing: 'Piszę…',
  },
  command: {
    compose: 'Nowy e-mail',
    appearance: 'Wygląd',
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
    crashTitle: 'Fewmail potknął się na tej stronie',
    crashLead:
      'Twoja poczta jest bezpieczna, w Gmailu nic się nie zmieniło. Odśwież; jeśli to się powtórzy, już o tym wiemy.',
    missingTitle: 'Pod tym adresem nic nie ma',
    calendarAccess:
      'Fewmail nie ma dostępu do tego kalendarza. Zezwól na niego na stronie Kalendarz.',
    failed: 'Coś poszło nie tak. Spróbuj ponownie.',
    needsPro: 'Do tego potrzebny jest Fewmail Pro.',
    alreadySent: 'Już wysłano, za późno, by cofnąć.',
    consentChanged:
      'To się zmieniło od czasu prośby. Spójrz jeszcze raz i zdecyduj na stronie głównej.',
    notFound: 'Tego już nie ma. Możliwe, że zostało usunięte.',
    offline: 'Brak połączenia z Fewmail. Sprawdź internet.',
  },
  desktop: {
    confirm: 'Zaloguj w aplikacji',
    confirmLead: (code: string) =>
      `Fewmail na Twoim komputerze prosi o zalogowanie. Sprawdź, czy pokazuje ${code}.`,
    confirmTitle: 'Zalogować w aplikacji?',
    expired: 'To logowanie wygasło. Zacznij je ponownie w aplikacji.',
    lead: 'Logowanie na Twoim komputerze się udało. Możesz zamknąć tę kartę.',
    title: 'Wróć do aplikacji',
    waiting: (code: string) =>
      `Kontynuuj w przeglądarce i sprawdź, czy pokazuje ${code}.`,
  },
  update: {
    available: 'Jest nowa wersja Fewmail.',
    reload: 'Odśwież',
  },
  keys: {
    forget: 'zapomnij',
    reopen: 'otwórz ponownie',
    attach: 'załącz',
    done: 'gotowe',
    openLink: 'otwórz link',
    writeReminder: 'napisz przypomnienie',
    summary: 'podsumowanie',
    fromSender: 'więcej od nadawcy',
    approvePicked: (n: number) => `zatwierdź wybrane (${n})`,
    pick: 'wybierz',
    pickAll: 'wybierz wszystkie',
    markRead: 'oznacz jako przeczytane',
    markUnread: 'oznacz jako nieprzeczytane',
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
    approve: 'zatwierdź',
    approveAll: (n: number) => `zatwierdź wszystkie ${n} tego typu`,
    archive: 'archiwizuj',
    close: 'zamknij',
    draftReply: 'szkic odpowiedzi',
    edit: 'edytuj',
    expand: 'rozwiń / zwiń',
    move: 'przejdź',
    stackEmail: 'następny / poprzedni e-mail',
    open: 'otwórz',
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
      'Nic nie zostanie wysłane ani zarchiwizowane bez twojej zgody. Kalendarz i kontakty są opcjonalne.',
    continue: 'Kontynuuj z Google',
    lead: 'Fewmail czyta twoją pocztę i pokazuje tylko to, co wymaga twojej uwagi.',
    title: 'Tylko to, co ważne.',
  },
  mail: {
    inThread: (emails: string) => `${emails} w tej rozmowie`,
    moreFrom: (name: string) => `Więcej od ${name}`,
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
    inboxTotal: (count: string) => `${count} łącznie`,
    markShownRead: (total: number) =>
      plural('pl', total, {
        one: (n) => `Oznacz ${n} jako przeczytaną`,
        other: (n) => `Oznacz ${n} jako przeczytane`,
      }),
    oneTimeCode: {
      copied: 'Skopiowano kod',
      copy: 'Kopiuj kod',
    },
    openUnsubscribePage: 'Otwórz stronę',
    unsubscribeYourself:
      'Z tej listy trzeba wypisać się samemu na jej stronie. Do tego czasu jej maile są w archiwum.',
    allMailboxes: 'Wszystkie skrzynki',
    filterAbout: {
      focused: 'Najpierw ważne i ludzie, powiadomienia zwinięte',
      unread: 'Jeszcze nieprzeczytane, według rodzaju',
      categories:
        'Cała skrzynka według rodzaju, najpierw to, co czeka na ciebie',
      inbox: 'Wszystko, od najnowszych',
    },
    find: {
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
      named: 'Nadawca lub temat',
      mentioned: 'Wspomniane w treści',
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
      'Fewmail poprosił o wypisanie, ale ten nadawca znany jest z tego, że i tak pisze dalej. Przenosić jego maile do kosza od teraz? Zrobi to bot, a usuniesz go na Stronie głównej.',
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
    deleteDraft: 'Usuń szkic',
    notSent: 'Nie wysłano. Otwórz, by spróbować ponownie',
    noRecipients: 'Brak odbiorców',
    notSpam: 'To nie spam',
    reportSpam: 'Zgłoś spam',
    reportedSpam: 'Zgłoszono. Jego poczta trafia teraz do spamu.',
    archive: 'Archiwizuj',
    archived: 'Zarchiwizowano',
    markedRead: 'Oznaczono jako przeczytane',
    markUnread: 'Oznacz jako nieprzeczytane',
    markedUnread: 'Oznaczono jako nieprzeczytane',
    attachment: 'załącznik',
    draftReply: 'Szkic odpowiedzi',
    due: (date: string) => `termin ${date}`,
    dueHint: 'Termin znaleziony przez agenta w tym mailu',
    empty: {
      focused: 'Skrzynka pusta',
      unread: 'Wszystko przeczytane',
      categories: 'Skrzynka pusta',
      inbox: 'Skrzynka pusta',
      snoozed: 'Nic nie odłożono',
      sent: 'Jeszcze nic nie wysłano',
      drafts: 'Brak szkiców',
      archive: 'Archiwum jest puste',
      spam: 'Brak spamu',
      trash: 'Kosz jest pusty',
    },
    emptyHint: {
      focused: 'Nowe maile pojawią się tu, gdy tylko przyjdą.',
      unread: 'Nowe maile pojawią się tu, gdy tylko przyjdą.',
      categories: 'Nowe maile pojawią się tu, gdy tylko przyjdą.',
      inbox: 'Nowe maile pojawią się tu, gdy tylko przyjdą.',
      snoozed:
        'Odłóż maila na później: wróci do odebranych jako nieprzeczytany.',
      sent: 'Tu pojawią się maile, które wyślesz.',
      drafts: 'Tu czekają maile zaczęte, ale niewysłane.',
      archive: 'Zarchiwizowane maile znikają z odebranych i czekają tutaj.',
      spam: 'Spam trafia tutaj, a nie do odebranych.',
      trash: 'Usunięte maile zostają tu przez 30 dni.',
    },
    noResults: 'Nic nie znaleziono',
    noResultsHint: 'Spróbuj innych słów albo innego folderu.',
    expectsReply: 'Czeka na odpowiedź',
    filter: {
      categories: 'Kategorie',
      archive: 'Archiwum',
      trash: 'Kosz',
      drafts: 'Szkice',
      spam: 'Spam',
      inbox: 'Odebrane',
      snoozed: 'Odłożone',
      sent: 'Wysłane',
      focused: 'Skupienie',
      unread: 'Nieprzeczytane',
    },
    instruction:
      'Powiedz agentowi, jak odpowiedzieć, albo po prostu naciśnij Enter',
    open: 'Otwórz',
    search: 'Szukaj lub opisz',
    openInGmail: 'Otwórz w Gmailu',
    openInNewTab: 'Otwórz w nowej karcie',
    unsubscribe: 'Wypisz się',
    unsubscribed: 'Wypisano',
    unsubscribeFailed:
      'Ten nadawca nie obsługuje wypisania jednym kliknięciem, więc e-mail został zarchiwizowany.',
    you: 'Ty',
    sent: 'Wysłano',
    writeReply: 'Napisz odpowiedź…',
    replyTo: 'Odpowiedz do',
    date: 'Data',
    authentication: 'Uwierzytelnienie',
    toLine: (recipients: string) => `do ${recipients}`,
  },
  subscriptions: {
    leftBy: (percent: number) =>
      `${percent}% czytelników w Fewmail się wypisało`,
    unsubscribeHint: (emails: string) =>
      `Fewmail wypisze cię z listy i zarchiwizuje wszystko, co wysłała (${emails} w tym miesiącu). Wypisania nie można cofnąć.`,
    archivedOnly:
      'Ten nadawca nie ma wypisania, z którego Fewmail może skorzystać, więc jego poczta została zarchiwizowana, ale nadal jesteś na liście i nowe wiadomości będą przychodzić.',
    count: (total: number) => `Listy mailingowe: ${total}`,
    empty: 'W tym miesiącu nie pisała do ciebie żadna lista mailingowa.',
    lead: 'Newslettery, promocje i inne listy mailingowe, które pisały do ciebie w tym miesiącu, od najaktywniejszych. Wypisz się z tego, czego nie czytasz: Fewmail opuści listę i zarchiwizuje wszystko, co wysłała.',
    opened: (total: number) =>
      total === 0 ? 'żaden nie otwarty' : `otwarte: ${total}`,
    title: 'Listy mailingowe',
    unsubscribe: 'Wypisz się',
    unsubscribed: 'Wypisano',
  },
  nav: {
    board: 'Tablica',
    menu: 'Menu',
    labels: 'Etykiety',
    folders: 'Foldery',
    calendar: 'Kalendarz',
    subscriptions: 'Listy mailingowe',
    wrapped: 'Podsumowanie',
    people: 'Osoby',
    findPerson: 'Znajdź osobę',
    personMail: 'Pokaż e-maile',
    deleteContact: 'Usuń kontakt',
    contactDeleted: 'Kontakt usunięty',
    clearSearch: 'Wyczyść wyszukiwanie',
    mail: 'Poczta',
    reading: 'Czytanie',
    settings: 'Ustawienia',
    syncFailed: 'Synchronizacja z Gmailem nie powiodła się, ponawiam',
    syncing: 'Czytam twoją skrzynkę…',
    loading: 'Wczytywanie',
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
  plan: {
    used: (percent: number) => `Wykorzystano ${percent}%`,
    base: 'Podstawowy miesięczny limit agenta.',
    times: (times: number) => `${times}× wyższy miesięczny limit.`,
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
  headsUp: {
    deadline: 'Wkrótce ostatni dzień',
    notYet: 'Od tamtej pory nic nie przyszło',
    price: 'Cena wzrosła',
    priceUp: (what: string, from: string, to: string) =>
      `${what}: ${to} zamiast ${from}`,
    promised: 'Obiecano ci',
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
    openEmail: 'Otwórz e-mail',
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
    prompt_injection: (domain: string) =>
      `${domain} ukrył w tym e-mailu instrukcje dla asystentów czytających pocztę. Agent je ignoruje; nie przekazuj go dalej i nie rób tego, o co prosi.`,
    known_phishing: (domain: string) =>
      `${domain} jest na publicznej liście aktywnych stron phishingowych. Nie klikaj linków, nie loguj się i nie płać.`,
    credential_phishing: (domain: string) =>
      `${domain} prosi, żebyś się zalogował albo podał dane karty lub konta. Banki i serwisy nigdy nie proszą o to mailem: nie klikaj linków i niczego nie wpisuj.`,
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
  bots: {
    profile: 'Co robię',
    closeProfile: 'Zamknij',
    change: 'Zmień',
    since: (date: string) => `Działa od ${date}`,
    status: {
      acts: 'Działa sam',
      asks: 'Pyta przed każdym mailem',
      last: (time: string) => `ostatnio o ${time}`,
      paused: (date: string) => `Wstrzymany do ${date}`,
      reading: (n: number) =>
        plural('pl', n, {
          one: () => `czyta nowego maila`,
          few: (count) => `czyta ${count} nowe maile`,
          many: (count) => `czyta ${count} nowych maili`,
          other: (count) => `czyta ${count} nowego maila`,
        }),
      waiting: (n: number) =>
        plural('pl', n, {
          one: () => `Jedna sprawa czeka na ciebie`,
          few: (count) => `${count} sprawy czekają na ciebie`,
          many: (count) => `${count} spraw czeka na ciebie`,
          other: (count) => `${count} sprawy czeka na ciebie`,
        }),
      watching: 'Pilnuje twojej poczty',
    },
    intro: {
      acts: 'Działam sam: wszystko, co robię, widać tutaj i możesz to cofnąć.',
      asks: 'Zanim ruszę maila, zapytam cię tutaj.',
      board:
        'Cześć! Pilnuję obietnic i terminów z twojej poczty: co ci są winni, co obiecałeś i co niedługo mija. Zapytaj mnie, kto ci co jest winien.',
      change: 'Żeby zmienić to, co robię, po prostu do mnie napisz.',
      fewmail:
        'Cześć, jestem Fewmail Bot. Czytam całą pocztę, której nie bierze żaden z twoich botów, i pokazuję tylko to, co wymaga ciebie. W Gmailu nic się nie zmienia bez twojej zgody. Pytaj mnie o pocztę albo poproś o nowego bota.',
      own: (name: string) => `Cześć, jestem ${name}. Pilnuję tego:`,
    },
    suggest: {
      actAlone: 'Działaj sam, nie pytaj',
      askFirst: 'Pytaj mnie przed każdym mailem',
      important: 'Co dziś wymaga mojej uwagi?',
      newBot: 'Zrób mi bota do faktur',
      owed: 'Kto mi co jest winien?',
      pauseWeek: 'Pauza na tydzień',
      promised: 'Co obiecałem w tym tygodniu?',
      waiting: 'Kto czeka na moją odpowiedź?',
      week: 'Co zrobiłeś w tym tygodniu?',
    },
    pause: {
      day: 'Do jutra',
      hint: 'Wstrzymany nie bierze maili; zajmuje się nimi Fewmail Bot.',
      month: 'Na miesiąc',
      resume: 'Wznów',
      title: 'Wstrzymaj',
      week: 'Na tydzień',
    },
    week: {
      approved: 'za twoją zgodą',
      auto: 'sam',
      title: 'Ostatnie 7 dni',
      waiting: 'czeka na ciebie',
    },
    lately: 'Ostatnio',
    notifications: 'Powiadomienia',
    quiet: {
      hide: 'Ukryj',
      show: 'Pokaż',
      week: (n: number) =>
        plural('pl', n, {
          one: () => `Jedna zmiana w poczcie w ostatnich 7 dniach`,
          few: (count) => `${count} zmiany w poczcie w ostatnich 7 dniach`,
          many: (count) => `${count} zmian w poczcie w ostatnich 7 dniach`,
          other: (count) => `${count} zmiany w poczcie w ostatnich 7 dniach`,
        }),
    },
    chatMenu: 'Działania czatu',
    clear: 'Wyczyść historię',
    clearConfirm: (name: string) => `Wyczyścić czat z ${name}?`,
    clearHint:
      'Jego wiadomości znikną na zawsze. To, co zrobił w twojej poczcie, zostaje, tak samo jak ustawione przypomnienia.',
    cleared: 'Historia wyczyszczona',
    deleteFolder: 'Usuń folder',
    deleteFolderConfirm: (name: string) => `Usunąć folder ${name}?`,
    deleteFolderHint: 'Jego boty zostaną na liście, poza folderami.',
    moveTo: 'Przenieś do folderu',
    newFolder: 'Nowy folder',
    noFolder: 'Bez folderu',
    pin: 'Przypnij',
    rename: 'Zmień nazwę',
    renameFolder: 'Zmień nazwę folderu',
    unpin: 'Odepnij',
    add: 'Nowy bot',
    answering: 'Piszę…',
    cancelReply: 'Anuluj odpowiedź',
    cards: {
      autoDone: (n: number) =>
        plural('pl', n, {
          one: () => 'Sam załatwiłem jedną.',
          few: (count) => `Sam załatwiłem ${count}.`,
          many: (count) => `Sam załatwiłem ${count}.`,
          other: (count) => `Sam załatwiłem ${count}.`,
        }),
      dismissed: (n: number) =>
        plural('pl', n, {
          one: () => 'Pominąłeś jedną.',
          few: (count) => `Pominąłeś ${count}.`,
          many: (count) => `Pominąłeś ${count}.`,
          other: (count) => `Pominąłeś ${count}.`,
        }),
      done: (n: number) =>
        plural('pl', n, {
          one: () => 'Jedna gotowa za twoją zgodą.',
          few: (count) => `${count} gotowe za twoją zgodą.`,
          many: (count) => `${count} gotowych za twoją zgodą.`,
          other: (count) => `${count} gotowej za twoją zgodą.`,
        }),
      failed: (n: number) =>
        plural('pl', n, {
          one: () => 'Gmail odrzucił jedną.',
          few: (count) => `Gmail odrzucił ${count}.`,
          many: (count) => `Gmail odrzucił ${count}.`,
          other: (count) => `Gmail odrzucił ${count}.`,
        }),
      pending: (n: number) =>
        plural('pl', n, {
          one: () => 'Jedna czeka na ciebie.',
          few: (count) => `${count} czekają na ciebie.`,
          many: (count) => `${count} czeka na ciebie.`,
          other: (count) => `${count} czeka na ciebie.`,
        }),
    },
    composer: (name: string) => `Napisz do ${name} o jego poczcie`,
    copied: 'Skopiowano',
    copy: 'Kopiuj',
    created: 'Bot gotowy. Od teraz czyta nową pocztę.',
    delete: 'Usuń bota',
    deleteConfirm: (name: string) => `Usunąć ${name}?`,
    deleteHint:
      'Jego czat zniknie razem z nim. Jego poczta zostaje tam, gdzie jest, a nowe podobne maile trafią do Fewmail.',
    deleted: 'Bot usunięty',
    earlier: 'Pokaż wcześniejsze',
    edit: 'Ustawienia bota',
    effect: {
      always_show: 'Zostaw na Stronie głównej',
      archive: 'Archiwizuj',
      collect: 'Tylko zbieraj',
      draft_reply: 'Przygotuj szkic odpowiedzi',
      mark_read: 'Oznacz jako przeczytane',
      promises: 'Obietnice i terminy, których pilnuję',
      tidy: 'Sprzątaj',
      trash: 'Przenieś do kosza',
      unsubscribe: 'Wypisz się',
    },
    empty: 'Na razie pusto. Gdy przyjdzie moja poczta, napiszę tutaj.',
    enabled: 'Działa sam',
    enabledHint: {
      off: 'Wyłączony najpierw prosi o twoją zgodę przy każdym mailu.',
      on: 'Włączony działa bez pytania; wszystko, co zrobi, widać w jego czacie.',
    },
    instruction: 'Które maile i co z nimi robić',
    instructionPlaceholder:
      'np. Oznaczaj faktury od Hetzner jako przeczytane albo archiwizuj powiadomienia z LinkedIn',
    mute: 'Wycisz',
    muted: 'Wyciszony: brak powiadomień od tego bota',
    name: 'Nazwa',
    namePlaceholder: 'np. Faktury',
    noPlan:
      'Nie mogę ci odpowiedzieć: w darmowym planie nie mam tokenów na rozmowę. Wykup subskrypcję, a jestem cały twój.',
    now: 'Czeka teraz',
    nudge: {
      noReply: 'W tym wątku nie ma jeszcze odpowiedzi.',
      replied: 'Od tamtej pory w tym wątku przyszła odpowiedź.',
    },
    promises: (n: number) =>
      plural('pl', n, {
        one: () => 'Zapisałem jedną obietnicę.',
        few: (count) => `Zapisałem ${count} obietnice.`,
        many: (count) => `Zapisałem ${count} obietnic.`,
        other: (count) => `Zapisałem ${count} obietnicy.`,
      }),
    presets: 'Szablony',
    react: 'Zareaguj',
    reaction: 'Reakcja',
    reply: 'Odpowiedz',
    save: 'Zapisz',
    saved: 'Zapisano',
    simple: {
      title: {
        from: (value: string) => `Od „${value}”`,
        mailingList: () => 'Dowolna lista mailingowa',
        subject: (value: string) => `Temat zawiera „${value}”`,
      },
    },
    spent: (date: string) =>
      `Nie mogę odpowiedzieć do ${date}: limit na ten miesiąc się skończył.`,
    steps: (n: number) =>
      plural('pl', n, {
        one: () => 'Jeden krok',
        few: (count) => `${count} kroki`,
        many: (count) => `${count} kroków`,
        other: (count) => `${count} kroku`,
      }),
    subscribe: 'Wykup subskrypcję',
    fewmail: 'Fewmail Bot',
    fewmailJob: 'Tworzy twoje boty, znajduje maile i odpowiada na pytania',
    title: 'Boty',
    toLatest: 'Do najnowszej wiadomości',
    unmute: 'Wyłącz wyciszenie',
    whatItDoes: 'Co z nimi robi',
    you: 'Ty',
  },
  settings: {
    disconnectConfirm: (name: string) => `Odłączyć ${name}?`,
    messengerDisconnectHint:
      'Bot przestanie do ciebie pisać. Ponowne połączenie wymaga nowego linku z tej strony.',
    account: 'Konto',
    agent: 'Agent',
    deleteAccount: 'Usuń konto',
    deleteConfirm: 'Usuń wszystko',
    deleteDescription:
      'Od razu usuwa z Fewmail twoje konto, zsynchronizowaną pocztę, szkice i boty. Twój Gmail pozostaje nietknięty. Płatny plan zostaje od razu anulowany.',
    deleteFailed: 'Konto nie zostało usunięte. Spróbuj ponownie za minutę.',
    deleteSignIn:
      'Aby potwierdzić, że to ty, zaloguj się ponownie przez Google, a potem usuń konto.',
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
    languageSearch: 'Szukaj języka',
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
      retrying: 'Gmail teraz nie odpowiada. Fewmail sam spróbuje ponownie.',
      signIn: 'Logujesz się tym kontem',
      signInChosen: 'Tym kontem się logujesz. Wybierz inne.',
      signInLost:
        'Utracono dostęp do Gmaila. Zaloguj się ponownie, aby go przywrócić.',
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
      desktop: 'Ten komputer',
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
      assistant:
        'Fewmail to asystent poczty AI dla Gmaila, który najpierw czyta każdy e-mail, pisze odpowiedzi twoim głosem i pokazuje tylko to, co wymaga ciebie. Na start za darmo.',
      assistantTitle: 'Asystent poczty AI dla Gmaila',
      compare:
        'Fewmail w porównaniu z Superhuman, Shortwave i SaneBox: agent AI, który czyta pocztę za ciebie, zamiast szybszego sposobu, by czytać ją samemu.',
      compareTitle: 'Porównanie asystentów poczty AI',
      home: 'Fewmail to asystent poczty AI dla Gmaila: czyta każdy e-mail, pisze odpowiedzi twoim głosem i pokazuje tylko to, co wymaga ciebie.',
      login:
        'Fewmail czyta twojego Gmaila za ciebie, odpowiada twoim głosem i pokazuje tylko to, co naprawdę wymaga ciebie.',
      mcp: 'Połącz Fewmail z Claude, ChatGPT, Claude Code lub Cursorem jako serwer MCP: czytaj i porządkuj Gmaila z AI, której już używasz.',
      motto: 'tylko to, co ważne w twojej skrzynce',
      pricing: (trialDays: number) =>
        `Fewmail jest na zawsze darmowy do strony głównej, sortowania, reguł i ochrony przed spamem. Pro, cały agent, zaczyna się od ${trialDays} darmowych dni bez karty.`,
      tagline: 'agent poczty AI dla Gmaila',
    },
    chapters: {
      pricing: {
        description:
          'Strona główna, sortowanie, reguły i ochrona są za darmo na zawsze. Lite, Pro i Max dodają wszystko, co czyta i pisze za ciebie; większe plany po prostu robią tego więcej.',
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
      lead: 'Podłącz Fewmail jako serwer MCP i pytaj o pocztę asystenta, którego już używasz. Wszystko, co wysyła maile lub zmienia Gmaila, i tak czeka na twoją zgodę.',
      question: 'Czego Anna potrzebuje ode mnie w tym tygodniu?',
      setup: 'Połącz w minutę',
      title: 'Twoja poczta w Claude i ChatGPT.',
    },
    mcpPage: {
      copy: 'Kopiuj URL',
      lead: 'Podłącz Fewmail jako serwer MCP i pytaj o pocztę z AI, której już używasz. Czytanie poczty i sortowanie przez agenta są darmowe; szkice, wysyłka i reguły są w Pro.',
      safety:
        'Wszystko, co wysyła maila lub zmienia Gmaila, najpierw prosi o twoją zgodę. E-mail, który próbuje wydawać polecenia asystentowi, zostaje oznaczony, zanim ten go przeczyta. Twoja poczta nigdy nie trenuje modeli, a każdą aplikację odłączysz w ustawieniach.',
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
    assistantPage: {
      abilities: {
        ask: {
          description:
            'Zapytaj „o której mam lot?” i dostań odpowiedź razem z mailami, z których pochodzi: w Fewmail, na Telegramie lub WhatsAppie albo w Claude i ChatGPT.',
          title: 'Odpowiedzi z twojej poczty',
        },
        drafts: {
          description:
            'Odpowiedzi powstają z wyprzedzeniem, twoim tonem i w języku nadawcy, i czekają w kolejce, aż je zatwierdzisz.',
          title: 'Pisze odpowiedzi twoim głosem',
        },
        protection: {
          description:
            'Zmienione dane do płatności, podszywające się domeny i znane oszustwa wywołują ostrzeżenie, zanim cokolwiek zrobisz.',
          title: 'Ostrzega przed phishingiem',
        },
        reading: {
          description:
            'Newslettery z całego dnia stają się jednym podsumowaniem według tematów, a każde zdanie prowadzi do maila, z którego pochodzi.',
          title: 'Newslettery w jednym podsumowaniu',
        },
        bots: {
          description:
            'Opisz jednym zdaniem, co ma się dziać z częścią poczty, a stanie się to regułą. Same działają tylko reguły, które włączysz.',
          title: 'Reguły zwykłymi słowami',
        },
        sorting: {
          description:
            'Każdy e-mail dostaje streszczenie i ocenę ważności, więc pilne sprawy wypływają na wierzch, a paragony, powiadomienia i promocje nie wchodzą ci w drogę.',
          title: 'Czyta i sortuje każdy e-mail',
        },
      },
      abilitiesDescription:
        'Wszystko dzieje się w Gmailu, którego już używasz, a każde działanie agenta jest zapisane razem z powodem.',
      abilitiesLabel: 'Co robi',
      abilitiesTitle: 'Asystent, a nie kolejna skrzynka.',
      compareTitle: 'Jak wypada na tle innych narzędzi pocztowych z AI.',
      faq: (trialDays: number) => [
        {
          answer:
            'To oprogramowanie, które z pomocą AI czyta, sortuje i odpowiada na maile za ciebie. Większość tylko dodaje streszczenia i pomoc w pisaniu do skrzynki, którą nadal czytasz sam. Fewmail idzie dalej: najpierw czyta wszystko, więc widzisz tylko to, co wymaga ciebie.',
          question: 'Czym jest asystent poczty AI?',
        },
        {
          answer:
            'Fewmail szyfruje tematy, treści, streszczenia i szkice w swojej bazie danych, nigdy nie używa twojej poczty do trenowania modeli i nigdy niczego nie wysyła ani nie zmienia w Gmailu bez twojej zgody. W każdej chwili możesz go odłączyć i usunąć wszystko.',
          question: 'Czy bezpiecznie jest pozwolić AI czytać moją pocztę?',
        },
        {
          answer:
            'Pisze dla ciebie szkice, ale nigdy nie wysyła ich sam. Każdy szkic czeka w kolejce na twoją zgodę, a podobne możesz zatwierdzić razem.',
          question: 'Czy może odpowiadać na maile automatycznie?',
        },
        {
          answer: `Tak. Plan Free sortuje każdy e-mail, zbiera na jednej stronie to, co wymaga ciebie, wykonuje twoje reguły i chroni przed spamem i phishingiem, na zawsze. Szkice, streszczenia i reszta agenta są w płatnych planach, a każde konto zaczyna od ${trialDays} dni Pro, bez karty.`,
          question: 'Czy istnieje darmowy asystent poczty AI dla Gmaila?',
        },
      ],
      faqTitle: 'O asystentach poczty AI.',
      lead: 'Fewmail czyta każdy e-mail w twoim Gmailu, gdy tylko przyjdzie, usuwa szum, pisze odpowiedzi twoim głosem i przynosi ci tylko te kilka spraw, które wymagają twojej decyzji. Nic nie zostaje wysłane ani zmienione bez twojej zgody.',
      title: 'Asystent poczty AI, który pierwszy czyta twojego Gmaila.',
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
        bots: 'Reguły zwykłymi słowami',
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
        bots: 'Archiwizacja, oznaczanie jako przeczytane lub wypisanie, za darmo',
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
          bots: 'Trenowanie przez przenoszenie maili między folderami',
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
          bots: 'Filtry AI, od 3 do 50 zależnie od planu',
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
          bots: 'Custom Auto Labels, w Business',
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
          'Wiele narzędzi pocztowych z AI to nowa skrzynka z czatem: nadal czytasz każdy e-mail, tylko ze streszczeniem na górze. Fewmail to agent AI działający na Gmailu, którego już używasz. Najpierw czyta każdy e-mail, pisze odpowiedzi twoim głosem i przynosi ci tylko te kilka decyzji, które wymagają ciebie.',
        question: 'Czym Fewmail różni się od innych asystentów poczty AI?',
      },
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
        codes: {
          description:
            'Świeży kod czeka na górze strony głównej i obok swojego e-maila, gotowy do skopiowania bez otwierania. Za darmo.',
          title: 'Kody logowania',
        },
        subscriptions: {
          description:
            'Każda lista mailingowa, która pisała w tym miesiącu, i ile jej e-maili naprawdę otworzyłeś. Wypisz się z dowolnej jednym klawiszem. Za darmo.',
          title: 'Listy mailingowe',
        },
        ask: {
          description:
            'Pytaj zwykłymi słowami i dostawaj odpowiedź z własnej poczty, razem z mailami, z których pochodzi.',
          title: 'Zapytaj swoją pocztę',
        },
        calendar: {
          description:
            'Kalendarze wszystkich skrzynek w jednym widoku. Spotkanie zaproponowane w mailu staje się wydarzeniem, gdy je zatwierdzisz.',
          title: 'Kalendarz',
        },
        clearOut: {
          description:
            'Cały zaległy bałagan za jednym razem, do 50 000 maili na skrzynkę, wszystko pod jedną etykietą, więc „Przywróć wszystko” przywraca każdy z nich. Za darmo.',
          title: 'Sprzątanie skrzynki',
        },
        reading: {
          description:
            'Jedno podsumowanie dzisiejszych newsletterów: wiadomości według tematów, każde zdanie z linkiem do źródła i te, które warto przeczytać w całości.',
          title: 'Czytanie',
        },
        voice: {
          description:
            'Posłuchaj podsumowania swoich newsletterów. Wyślij wiadomość głosową na Telegramie lub WhatsAppie, a agent odpowie na głos.',
          title: 'Słuchaj zamiast czytać',
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
        'Agent poczty AI, który czyta twojego Gmaila i pokazuje tylko to, co wymaga twojej uwagi.',
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
          fix: 'Jeden klawisz wypisuje cię tak, jak zrobiłby to człowiek: jedno kliknięcie, strona wypisu albo e-mail. Kto pisze dalej, zostaje wykryty i zaproponowany jako spam.',
          problem: 'Newslettery, na które nigdy się nie zapisałeś.',
        },
        {
          fix: 'Dzisiejsze newslettery stają się jednym podsumowaniem według tematów, a te warte przeczytania w całości są wskazane.',
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
      lead: 'Newslettery, paragony, powiadomienia, link phishingowy i gdzieś pomiędzy nimi trzy maile, które naprawdę się liczą. Fewmail to agent AI, który czyta to wszystko za ciebie.',
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
      assistant: 'Asystent poczty AI',
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
      agent: 'Agent',
      details: 'Zobacz wszystkie plany w szczegółach',
      usage: 'Limit agenta na miesiąc',
      everyPlan: 'W każdym planie',
      oneAllowance:
        'Jeden limit na wszystko, co robi agent: płacisz za to, czego używasz, a szum nigdy się nie liczy',
      forever: 'na zawsze',
      free: {
        description: 'Strona główna, sortowanie, reguły i ochrona. Na zawsze.',
      },
      max: {
        description: 'Ten sam agent dla zapchanej skrzynki.',
      },
      monthly: 'Miesięcznie',
      per: { month: 'miesięcznie', year: 'rocznie' },
      lite: {
        description: 'Cały agent: czyta, pisze i pamięta.',
      },
      pro: {
        description: 'Ten sam agent z miejscem na więcej poczty.',
      },
      tryFree: (days: number) => `${days} dni za darmo`,
      yearly: 'Rocznie · 2 miesiące gratis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Strona główna, sortowanie, reguły zwykłymi słowami i ochrona są za darmo na zawsze. Pro to agent, który czyta, pisze i pamięta za ciebie; Max to ten sam agent z zapasem na zapchaną skrzynkę. Każde konto zaczyna od ${trialDays} dni Pro, a gdy się skończą, po prostu zostajesz na planie Free.`,
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
          title: 'Nic nie wychodzi bez twojej zgody.',
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
    imagesHidden: 'Obrazy w spamie są ukryte.',
    openFile: {
      action: 'Otwórz',
      description:
        'Ten e-mail jest w spamie. Otwieraj jego pliki tylko, jeśli ufasz nadawcy.',
      title: (name: string) => `Otworzyć ${name}?`,
    },
    showImages: 'Pokaż obrazy',
  },
  starterBots: {
    board: { name: 'Tablica' },
    important: {
      instruction:
        'Co wymaga mojego ruchu: ludzie czekający na moją odpowiedź, rachunki do zapłacenia, alerty bezpieczeństwa, wszystko od mojego banku lub urzędów. Zostaw na Stronie głównej',
      name: 'Ważne',
    },
    later: {
      instruction:
        'Warto wiedzieć, ale bez decyzji: nowości z usług, z których korzystam, dostawy, wydarzenia i daty',
      name: 'Może poczekać',
    },
    quick: {
      instruction:
        'Szum, który usunąłbym bez czytania: powiadomienia, paragony, newslettery, promocje i zimna sprzedaż. Sprzątaj: archiwizuj, oznacz jako przeczytane albo wypisz się, co pasuje',
      name: 'Szybkie',
    },
  },
  telegram: {
    approveAlike: 'Zatwierdź naraz wszystkie karty jednego typu:',
    chatTaken:
      'Ten czat jest już połączony z innym kontem Fewmail. Najpierw odłącz tam Telegram (Ustawienia → Integracje), a potem otwórz link ponownie.',
    queueChanged:
      'Karty zmieniły się w międzyczasie. Oto, co teraz na ciebie czeka:',
    heard: (text: string) => `Usłyszałem: „${text}”`,
    voiceFailed:
      'Nie udało mi się tego zrozumieć. Spróbuj jeszcze raz albo napisz.',
    help: 'Napisz albo powiedz, czego potrzebujesz:\n• zapytaj o pocztę: „kiedy odnawia się Netflix?”\n• powiedz, co odpisać: „napisz Annie, że podpiszę jutro”\n• zleć mi coś: „zawsze archiwizuj newslettery z Medium”\n• odpowiedz na mój szkic, żeby go zmienić',
    canceled: 'Anulowano. Szkic wrócił do kolejki.',
    sendingIn: (seconds: number) => `Wysyłanie za ${seconds} s`,
    undo: 'Cofnij',
    commands: { queue: 'Co czeka na ciebie' },
    connectFirst: (url: string) =>
      `Cześć! Jestem Fewmail. Tutaj, w Telegramie, daję znać, gdy przychodzi pilna poczta, pokazuję, co czeka na ciebie, i wysyłam odpowiedzi, które zatwierdzisz.\n\nTen czat nie jest jeszcze połączony z twoim Fewmail. To zajmie minutę:\n1. Otwórz ustawienia Fewmail: ${url}\n2. W sekcji Integracje stuknij „Połącz Telegram” (to część Fewmail Pro).\n3. Telegram przeniesie cię z powrotem tutaj, naciśnij Start i gotowe.`,
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
    botSuggestion: {
      done: {
        archive: 'Nowy bot od teraz archiwizuje pocztę od tego nadawcy.',
        mark_read:
          'Nowy bot od teraz oznacza pocztę od tego nadawcy jako przeczytaną.',
      },
      label: 'Proponowany bot',
      lead: (count: number, effect: 'archive' | 'mark_read') =>
        effect === 'archive'
          ? `E-maili w tym miesiącu: ${count}, agent zarchiwizowałby każdy`
          : `E-maili w tym miesiącu: ${count}, agent oznaczyłby każdy jako przeczytany`,
      no: 'Nie, dziękuję',
      yes: {
        archive: 'Zawsze archiwizuj',
        mark_read: 'Zawsze oznaczaj jako przeczytane',
      },
    },
    newSender: {
      archive: 'Zawsze archiwizuj',
      archived: 'Nowy bot od teraz archiwizuje pocztę od tego nadawcy.',
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
    allowanceSpent: (date: string) =>
      `Limit agenta na ten miesiąc się skończył: podsumowania i szkice wrócą ${date}. Do tego czasu nadal zapisuję obietnice i terminy.`,
    byBots: (n: number) => `Twoje boty zajęły się ${n}.`,
    decisions: 'Decyzje',
    journal: {
      approved: 'Za twoją zgodą',
      byBot: (bot: string) => `Twój bot: ${bot}`,
      failed: 'Nie udało się',
      lead: 'Ostatnie 7 dni. Każda zmiana w poczcie czy kalendarzu zaszła za twoją zgodą albo zrobił ją bot, któremu pozwalasz działać samemu.',
      title: 'Zrobione w twojej poczcie',
    },
    progress: (done: number, total: number) => `${done} z ${total}`,
    mostlyNoise: (people: number) =>
      people === 0
        ? 'Same newslettery i powiadomienia.'
        : `Głównie newslettery i powiadomienia, od ludzi tylko ${people}.`,
    worth: {
      awaiting: (total: number) =>
        plural('pl', total, {
          one: (n) =>
            n === 1 ? '1 czeka na odpowiedź' : `czeka na odpowiedź: ${n}`,
          other: (n) => `czeka na odpowiedź: ${n}`,
        }),
      dated: (total: number) =>
        plural('pl', total, {
          one: (n) => (n === 1 ? '1 z datą' : `z datą: ${n}`),
          other: (n) => `z datą: ${n}`,
        }),
    },
    worthKnowing: 'Warto wiedzieć',
    canWait: 'Może poczekać',
    canWaitEmpty: {
      lead: 'Tu zbierają się maile do przeczytania w wolnej chwili i odpowiedzi, na które czekasz.',
      title: 'Nic nie czeka.',
    },
    improve: {
      empty: {
        lead: 'Gdy agent zauważy, że wiadomości od jakiegoś nadawcy traktujesz zawsze tak samo, zaproponuje tu bota.',
        title: 'Na razie brak propozycji.',
      },
      lead: (total: number) =>
        plural('pl', total, {
          one: () => 'Jeden bot, którego agent mógłby dla ciebie utworzyć.',
          few: (n) => `${n} boty, które agent mógłby dla ciebie utworzyć.`,
          many: (n) => `${n} botów, które agent mógłby dla ciebie utworzyć.`,
          other: (n) => `${n} bota, które agent mógłby dla ciebie utworzyć.`,
        }),
      title: 'Agent proponuje',
    },
    quick: 'Szybko',
    needsLook: 'Czeka na ciebie',
    tidy: {
      failed: (emails: string) =>
        `Gmail odrzucił ${emails}. Spróbuj ponownie za chwilę.`,
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
      messengers: {
        lead: 'Odbieraj pilną pocztę i zatwierdzaj szkice w komunikatorze, którego już używasz.',
        title: 'Telegram lub WhatsApp',
      },
      notNow: 'Nie teraz',
      setUp: 'Skonfiguruj',
      turnOn: 'Włącz',
    },
    dates: 'Terminy i spotkania',
    done: 'Gotowe',
    firstRead:
      'Najpierw poczta z ostatnich trzech dni. To, co wymaga twojej uwagi, pojawi się tu automatycznie.',
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
  },
  upgrade: {
    hints: {
      board:
        'Część Fewmail Pro: agent zapisuje, co ci obiecano, co ty obiecałeś, i terminy z twojej poczty, i pilnuje każdego, aż się zamknie.',
      chat: 'Część Fewmail Pro: rozmawiaj z botami o ich poczcie, a wrócą do ciebie wtedy, kiedy obiecały.',
      drafts:
        'Część Fewmail Pro: agent napisze odpowiedź w twoim stylu, a ty ją poprawisz i wyślesz.',
    },
  },
  whatsapp: {
    phoneTaken:
      'Ten numer jest już połączony z innym kontem Fewmail. Najpierw odłącz tam WhatsApp (Ustawienia → Integracje), a potem wyślij wiadomość ponownie.',
    connectFirst: (url: string) =>
      `Cześć! Jestem Fewmail. Tutaj, w WhatsAppie, daję znać, gdy przychodzi pilny mail, pokazuję, co na ciebie czeka, i wysyłam odpowiedzi, które zatwierdzisz.\n\nTen numer nie jest jeszcze połączony z twoim Fewmail. To zajmie minutę:\n1. Otwórz ustawienia Fewmail: ${url}\n2. W Integracjach stuknij „Połącz WhatsApp” (część Fewmail Pro).\n3. WhatsApp otworzy się z gotową wiadomością, wyślij ją i gotowe.`,
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
