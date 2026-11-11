import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const uk: Messages = {
  agent: {
    chats: 'Чати',
    confirm: {
      approve_action: 'Виконати цю дію?',
      archive_thread: 'Архівувати цей лист?',
      create_rule: 'Додати це правило?',
      handle_thread: 'Доручити цей лист агенту?',
      reply: 'Надіслати цю відповідь?',
      send_email: 'Надіслати цей лист?',
      snooze_thread: 'Відкласти цей лист?',
      unsubscribe: 'Відписатися від цього відправника?',
    },
    decline: 'Ні',
    declined: 'Ви відмовились',
    deleteChat: 'Видалити чат',
    failed: 'Агент не зміг завершити. Спробуйте ще раз.',
    lead: 'Питайте про пошту або кажіть, що зробити. Усе, що надсилає листи чи змінює Gmail, чекає на ваше «так».',
    leave: 'Вийти з режиму агента',
    newChat: 'Новий чат',
    noChats: 'Чатів ще немає',
    placeholder: 'Спитайте про пошту або скажіть, що зробити…',
    retry: 'Спробувати ще',
    send: 'Надіслати',
    steps: {
      approve_action: 'Виконую',
      archive_thread: 'Архівую',
      create_rule: 'Додаю правило',
      dismiss_action: 'Пропускаю',
      draft_reply: 'Пишу чернетку',
      get_board: 'Читаю дошку',
      get_person: 'Шукаю людину',
      get_today: 'Дивлюся сьогоднішнє',
      handle_thread: 'Доручаю лист агенту',
      list_boards: 'Відкриваю дошки',
      list_mail: 'Шукаю в пошті',
      list_rules: 'Читаю правила',
      read_thread: 'Читаю лист',
      redraft_action: 'Переписую чернетку',
      refresh: 'Перевіряю нову пошту',
      send_email: 'Надсилаю',
      snooze_thread: 'Відкладаю',
      unsubscribe: 'Відписую',
    },
    stop: 'Зупинити',
    suggestions: [
      'Що потребує мене сьогодні?',
      'Хто чекає на мою відповідь?',
      'Чи є рахунки до сплати найближчим часом?',
      'Що було в пошті цього тижня?',
    ],
    thinking: 'Думаю…',
    title: 'Чим допомогти?',
    to: (recipients: string) => `Кому: ${recipients}`,
    until: (time: string) => `До ${time}`,
    yes: {
      approve_action: 'Виконати',
      archive_thread: 'Архівувати',
      create_rule: 'Додати',
      handle_thread: 'Доручити',
      reply: 'Надіслати',
      send_email: 'Надіслати',
      snooze_thread: 'Відкласти',
      unsubscribe: 'Відписатися',
    },
  },
  ask: {
    label: (question: string) => `Спитати Fewmail: «${question}»`,
    thinking: 'Шукаю у твоїй пошті…',
  },
  compose: {
    backInQueue: 'Скасовано. Чернетка знову в «Сьогодні».',
    canceled: 'Скасовано. Лист знову в редакторі.',
    cc: 'Копія',
    discard: 'Видалити',
    forward: 'Переслати',
    forwardedMessage: 'Переслане повідомлення',
    from: 'Від',
    instructionPlaceholder: 'Як має звучати? (необов’язково)',
    invalidRecipients: 'Додай хоча б одну правильну адресу.',
    later: {
      inHour: 'За годину',
      monday: 'У понеділок зранку',
      tomorrow: 'Завтра зранку',
    },
    new: 'Новий лист',
    placeholder: 'Напиши листа…',
    remind: {
      days: (total: number) =>
        plural('uk', total, {
          one: (n) => `Нагадати, якщо немає відповіді ${n} день`,
          few: (n) => `Нагадати, якщо немає відповіді ${n} дні`,
          many: (n) => `Нагадати, якщо немає відповіді ${n} днів`,
          other: (n) => `Нагадати, якщо немає відповіді ${n} дня`,
        }),
      label: 'Нагадати',
      off: 'Без нагадування',
    },
    reply: 'Відповісти',
    scheduledFor: (date: string) => `Заплановано на ${date}`,
    send: 'Надіслати',
    sendLater: 'Надіслати пізніше',
    sendingIn: (seconds: number) => `Надсилаю через ${seconds} с`,
    subject: 'Тема',
    to: 'Кому',
    undo: 'Скасувати',
    writeForMe: 'Напиши за мене',
    writing: 'Пишу…',
  },
  composer: {
    acceptSuggestion: 'Tab, щоб прийняти',
    bold: 'Жирний',
    bulletList: 'Маркований список',
    italic: 'Курсив',
    link: 'Посилання',
    linkPlaceholder: 'Встав або введи посилання',
    noSnippets: 'Немає збігів серед шаблонів.',
    removeLink: 'Прибрати посилання',
  },
  reminders: {
    followUp: 'Нагадати',
    noReply: 'Ще без відповіді',
  },
  snooze: {
    laterToday: 'Пізніше сьогодні',
    nextWeek: 'Наступного тижня',
    title: 'Відкласти',
    tomorrow: 'Завтра',
    unsnooze: 'Повернути у вхідні',
    until: (date: string) => `Відкладено до ${date}`,
    weekend: 'На вихідних',
  },
  actionKind: {
    cleanup: 'Відписатися від усіх',
    commitment: 'Готово',
    security: 'Я перевірив',
    task: 'Надіслати',
    spam: 'У спам',
    trash: 'У кошик',
    archive: 'В архів',
    follow_up: 'Нагадати',
    mark_read: 'Прочитано',
    pay: 'Оплатити',
    read: 'Прочитати',
    reply: 'Відповісти',
    schedule: 'Запланувати',
    unsubscribe: 'Відписатися',
  },
  actionStatus: {
    auto_done: 'зроблено агентом',
    dismissed: 'пропущено',
    done: 'зроблено',
    failed: 'не вдалося',
    pending: 'чекає в «Сьогодні»',
  },
  byRule: 'за правилом',
  category: {
    calendar: 'Календар',
    finance: 'Фінанси',
    newsletter: 'Розсилка',
    notification: 'Сповіщення',
    other: 'Інше',
    person: 'Людина',
    promotion: 'Реклама',
    receipt: 'Чек',
    security: 'Безпека',
    travel: 'Подорожі',
    work: 'Робота',
  },
  command: {
    compose: 'Новий лист',
    agent: 'Агент',
    appearance: 'Вигляд',
    checkMail: 'Перевірити пошту',
    goTo: 'Перейти',
    inboxUpToDate: 'Пошта актуальна',
    mail: 'Пошта',
    nothingMatches: 'Нічого не знайдено.',
    placeholder: 'Шукай у пошті або введи команду…',
    rewriteBrief: 'Переписати бриф',
    searchFor: (query: string) => `Шукати в пошті «${query}»`,
    upgrade: 'Перейти на Pro',
    teachRule: 'Навчити нового правила',
    theme: { dark: 'Темна тема', light: 'Світла тема', system: 'Як у системі' },
  },
  importance: ['Шум', 'Варто знати', 'Скоро знадобишся', 'Терміново'],
  justNow: 'щойно',
  keys: {
    reply: 'відповісти',
    snooze: 'відкласти',
    anything: 'будь-що',
    archive: 'архівувати',
    approve: 'схвалити',
    close: 'закрити',
    draftReply: 'чернетка',
    edit: 'змінити',
    move: 'рух',
    open: 'відкрити',
    search: 'пошук',
    send: 'надіслати',
    skip: 'пропустити',
    stopEditing: 'готово',
  },
  legal: {
    privacy: 'Політика конфіденційності',
    englishOnly:
      'Цей документ надано англійською мовою, і саме ця версія є обовʼязковою.',
    terms: 'Умови використання',
    updated: (date: string) => `Оновлено ${date}`,
  },
  limits: {
    boards: (total: number) =>
      `Твій план вміщує ${total} борди. Видали один або перейди на Max у Налаштуваннях → План.`,
    messages: (date: string) =>
      `Повідомлення агенту на цей місяць закінчилися. Вони повернуться ${date}.`,
    tasks: (total: number) =>
      `Твій план веде ${total} тредів одночасно. Дочекайся, поки один завершиться, або перейди на Max у Налаштуваннях → План.`,
  },
  login: {
    agree: ((slots) => [
      'Продовжуючи, ти погоджуєшся з ',
      slots.terms,
      ' та ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail просить доступ, щоб читати, впорядковувати й надсилати Gmail за тебе. Нічого не надсилається й не архівується без твоєї згоди, якщо ти сам не створиш правило, яке це дозволяє.',
    continue: 'Продовжити з Google',
    lead: 'Fewmail читає пошту за тебе, відповідає твоїм голосом і показує лише те, що справді потребує тебе.',
    messengers:
      'Працює й у месенджерах, починаючи з Telegram: отримуй бриф, схвалюй відповіді або просто надиктуй голосове.',
    title: 'Лише те, що важливо.',
  },
  mail: {
    unread: 'Непрочитане',
    block: 'Заблокувати',
    blocked: 'Заблоковано. Їхні листи тепер ідуть у кошик.',
    forward: 'Переслати',
    more: 'Ще',
    reply: 'Відповісти',
    trash: 'У кошик',
    trashed: 'Переміщено в кошик',
    movedToInbox: 'Повернуто у вхідні. Дякуємо, що сказав.',
    noThread: 'Вибери лист, щоб прочитати його тут',
    notSpam: 'Не спам',
    reportSpam: 'Позначити як спам',
    reportedSpam: 'Позначено. Їхні листи тепер ідуть у спам.',
    archive: 'Архівувати',
    archived: 'Заархівовано',
    attachment: 'вкладення',
    draftReply: 'Чернетка відповіді',
    drafting: 'Пишу…',
    draftWaiting: 'Чернетка чекає в «Сьогодні»',
    due: (date: string) => `до ${date}`,
    empty: 'Тут немає листів.',
    expectsReply: 'Чекає на відповідь',
    filter: {
      spam: 'Спам',
      inbox: 'Вхідні',
      snoozed: 'Відкладені',
      important: 'Важливі',
      needs_reply: 'Без відповіді',
      quiet: 'Тихі',
    },
    instruction: 'Скажи агенту, як відповісти, або просто натисни Enter',
    open: 'Відкрити',
    search: 'Шукай або опиши: рахунки від Анни за минулий місяць',
    openInGmail: 'Відкрити в Gmail',
    unsubscribe: 'Відписатися',
    unsubscribed: 'Відписано',
    unsubscribeFailed:
      'У цього відправника немає відписки в один клік, тому лист заархівовано.',
    you: 'Ти',
  },
  nav: {
    agent: 'Агент',
    boards: 'Дошки',
    newBoard: 'Нова дошка',
    mail: 'Пошта',
    rules: 'Правила',
    search: 'Шукай або питай…',
    settings: 'Налаштування',
    syncFailed: 'Помилка синхронізації Gmail, пробую ще',
    syncing: 'Читаю твою пошту…',
    today: 'Сьогодні',
    trialLeft: (total: number) =>
      plural('uk', total, {
        one: (n) => `Пробний Pro · залишився ${n} день`,
        few: (n) => `Пробний Pro · залишилося ${n} дні`,
        many: (n) => `Пробний Pro · залишилося ${n} днів`,
        other: (n) => `Пробний Pro · залишилося ${n} дня`,
      }),
    usage: (percent: number) => `Агент · використано ${percent}% місяця`,
    watching: 'Агент стежить за поштою',
  },
  schedule: {
    failed: 'Цей запуск за розкладом не вдався. Спробую знову наступного разу.',
    limitReached: (day: string) =>
      `Повідомлення на цей місяць вичерпано, тому розклад пропускає запуски до ${day}.`,
    open: 'Відкрити у Fewmail',
    stopped:
      'Розклад не вдався тричі поспіль, тому я його зупинив. Попросіть мене налаштувати його знову, коли захочете.',
  },
  notifications: {
    many: (total: number) =>
      plural('uk', total, {
        one: (n) => `${n} нове у Fewmail`,
        few: (n) => `${n} нові у Fewmail`,
        other: (n) => `${n} нових у Fewmail`,
      }),
  },
  onboarding: {
    languageHint:
      'Цією мовою будуть застосунок, брифи, підсумки й пояснення. Відповіді завжди мовою листа, на який ти відповідаєш.',
    languageTitle: 'Якою мовою говорити Fewmail?',
    lead: 'Дві швидкі відповіді. Усе можна змінити пізніше в налаштуваннях.',
    personaTitle: 'Як ти користуєшся поштою?',
    reading: 'Читаю твою пошту…',
    start: 'Почати',
    title: 'Налаштуймо твого агента.',
  },
  plan: {
    free: 'Безкоштовний',
    freeDescription:
      'Швидка й спокійна пошта з простими правилами. Безкоштовно, скільки забажаєш.',
    includes:
      'Pro додає агента: щоденний бриф, кожен лист прочитаний і підсумований, відповіді у твоєму стилі, правила звичайними словами, Telegram і MCP.',
    manage: 'Керувати оплатою',
    price: (usd: number) => `$${usd} / місяць`,
    priceYearly: (usd: number) => `$${usd} / рік`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `${emails} листів і ${messages} повідомлень на місяць; борди й передані агенту треди без обмежень.`,
    messages: 'Повідомлення агенту',
    messagesHint: 'Чат, Ask, Telegram і WhatsApp.',
    of: (used: string, total: string) => `${used} з ${total}`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `${emails} листів і ${messages} повідомлень на місяць.`,
    cancels: (plan: string, date: string) =>
      `${plan} до ${date}, далі — безкоштовний.`,
    choose: (plan: string) => `Обрати ${plan}`,
    emails: 'Листи, які прочитав агент',
    emailsHint: 'Шум, відсортований автоматично, не рахується.',
    proRenews: (date: string) => `Поновлюється ${date}.`,
    resets: (date: string) => `Оновиться ${date}.`,
    title: 'План',
    trial: 'Пробний Pro',
    trialDescription: (date: string) =>
      `Усі можливості Pro до ${date}. Потім Fewmail лишається безкоштовним із простими правилами — картка не потрібна.`,
    welcome: (plan: string) => `Вітаємо в ${plan}. Агент знову до роботи.`,
    yearly: 'Платити щороку',
    yearlyHint: 'Два місяці безкоштовно.',
  },
  persona: {
    reader: {
      description:
        'Здебільшого читаю. Тримай пошту в спокої, розбирайся з шумом і не пропускай нічого важливого.',
      title: 'Здебільшого читаю',
    },
    responder: {
      description:
        'Відповідаю багато. Став першими тих, хто чекає на мене, і готуй відповіді моїм голосом.',
      title: 'Багато відповідаю',
    },
  },
  queue: {
    draftedInVoice: 'Написано твоїм голосом',
    edit: 'Змінити',
    open: 'Відкрити',
    send: 'Надіслати',
    shorter: 'Коротше',
    shorterInstruction: 'Зроби коротше.',
    skip: 'Пропустити',
  },
  rules: {
    actWithoutAsking: 'Діяти без запиту',
    add: 'Додати правило',
    count: (total: number) =>
      plural('uk', total, {
        one: (n) => `${n} правило`,
        few: (n) => `${n} правила`,
        many: (n) => `${n} правил`,
        other: (n) => `${n} правила`,
      }),
    delete: 'Видалити',
    describe: {
      alwaysShow: 'Завжди потрапляє в «Сьогодні»',
      autonomous: 'Робиться саме, видно серед опрацьованих',
      draft: 'Чернетка чекає на тебе в «Сьогодні»',
      suggested: 'Пропонується в «Сьогодні», ти підтверджуєш',
    },
    effect: {
      trash: 'Видалити в кошик',
      always_show: 'Завжди показувати',
      archive: 'В архів',
      draft_reply: 'Написати чернетку',
      mark_read: 'Позначити прочитаним',
      unsubscribe: 'Відписатися',
    },
    enabled: 'Правило ввімкнено',
    lead: 'Простими словами скажи агенту, що робити з певними листами. Він перевіряє кожен лист за цими правилами, згори донизу.',
    newTitle: 'Навчити нового правила',
    placeholder: 'напр. Рахунки від Hetzner або сповіщення LinkedIn',
    leadFree:
      'Архівуй, позначай прочитаним або відписуйся автоматично. Правила спрацьовують на нову пошту одразу, щойно вона надходить.',
    simple: {
      appliedAutomatically: 'Застосовується до нової пошти автоматично',
      field: {
        from: 'Від',
        mailingList: 'Будь-яка розсилка',
        subject: 'Тема містить',
      },
      title: {
        from: (value: string) => `Від «${value}»`,
        mailingList: () => 'Будь-яка розсилка',
        subject: (value: string) => `Тема містить «${value}»`,
      },
      valuePlaceholder: 'anna@example.com, ім’я або слово',
      whichField: 'Збіг за',
    },
    title: 'Правила',
    whatAgentDoes: 'Що робить агент',
    whichEmails: 'Які листи',
    withoutAsking: 'Без запиту',
  },
  settings: {
    knowledge: {
      description:
        'Ціни, адреси, коли ти доступний, як любиш відповідати. Агент використовує це в чернетках і автодоповненні.',
      placeholder:
        'Напр. Консультація коштує $150/год. По п’ятницях не беру дзвінків. Моя адреса…',
      title: 'Що має знати агент',
    },
    labels: {
      description:
        'Сортує пошту за мітками Fewmail/…, щоб Gmail на телефоні показував той самий порядок.',
      title: 'Мітки агента в Gmail',
    },
    schedules: {
      delete: 'Видалити',
      description:
        'Попросіть агента в чаті робити щось регулярно, наприклад «щоп’ятниці о 17:00 збери рахунки за тиждень». Кожен запуск приходить в окремий чат, де ви підтверджуєте все, що він хоче надіслати.',
      title: 'Розклади',
    },
    snippets: {
      add: 'Додати шаблон',
      body: 'Текст',
      delete: 'Видалити',
      description: 'Введи ; у редакторі, щоб вставити шаблон за назвою.',
      name: 'Назва',
      title: 'Шаблони',
    },
    account: 'Акаунт',
    agent: 'Агент',
    briefDescription: (timezone: string) =>
      `У твоєму часовому поясі, ${timezone}`,
    briefTitle: 'Щоденний бриф',
    deleteAccount: 'Видалити акаунт',
    deleteConfirm: 'Видалити все',
    deleteDescription:
      'Одразу видаляє з Fewmail твій акаунт, синхронізовану пошту, чернетки, правила й брифи. Сам Gmail не зачіпається.',
    deleteTitle: 'Видалити акаунт Fewmail?',
    cancel: 'Скасувати',
    integrations: 'Інтеграції',
    language: 'Мова',
    languageDescription:
      'Застосунок, брифи й підсумки. Відповіді — мовою листа.',
    legal: 'Правова інформація',
    mailboxes: {
      add: 'Додати Gmail',
      addDescription:
        'Пошта з іншого акаунта Gmail потрапляє в той самий «Сьогодні» і вхідні. Ним не можна увійти сюди: вхід із ним відкриває окремий Fewmail.',
      added: 'Скриньку додано. Її пошта з’явиться за хвилину.',
      failed:
        'Не вдалося додати скриньку. Дозвольте доступ до Gmail і спробуйте ще раз.',
      lost: 'Доступ до Gmail втрачено. Додайте скриньку ще раз, щоб підключити.',
      reading: 'Читаю пошту…',
      remove: 'Видалити',
      signIn: 'Ви входите з цим акаунтом',
      signInChosen: 'Це акаунт, з яким ви входите. Виберіть інший.',
      synced: (ago: string) => `Синхронізовано ${ago}`,
      title: 'Скриньки',
    },
    mcp: {
      copyNow: 'Скопіюй конфіг зараз: ключ показується лише раз.',
      create: 'Створити ключ',
      defaultName: 'MCP-клієнт',
      description:
        'Вони можуть читати твій бриф і пошту, писати чернетки й надсилати їх після твого підтвердження.',
      keyName: 'Назва ключа',
      neverUsed: 'Не використовувався',
      revoke: 'Відкликати',
      title: 'Підключи Claude, Cursor або будь-який MCP-клієнт',
      used: (ago: string) => `Використано ${ago}`,
    },
    persona: 'Як ти користуєшся поштою',
    signedInWithGoogle: 'Вхід через Google',
    signOut: 'Вийти',
    notifications: {
      blocked:
        'Сповіщення заблоковано. Дозволь їх у налаштуваннях сайту в браузері.',
      browser: 'Цей браузер',
      notConfigured: 'Сповіщення в браузері не налаштовані на цьому сервері.',
      off: 'Отримуй термінові листи й щоденний бриф тут, навіть коли Fewmail закритий.',
      on: 'Термінові листи й щоденний бриф з’являються тут. Кілька одночасно приходять одним.',
      title: 'Сповіщення',
      unsupported: 'Цей браузер не вміє показувати сповіщення.',
    },
    telegram: {
      connect: 'Підключити Telegram',
      disconnect: 'Відключити',
      linked:
        'Бриф приходить щоранку, термінові листи — одразу. Схвалюй і редагуй чернетки прямо в чаті.',
      notConfigured: 'Бот Telegram не налаштовано на цьому сервері.',
      unlinked: 'Отримуй бриф і схвалюй чернетки в Telegram.',
    },
    whatsapp: {
      connect: 'Підключити WhatsApp',
      disconnect: 'Відключити',
      linked:
        'Бриф приходить щоранку, термінові листи — одразу. Схвалюй і редагуй чернетки прямо в чаті.',
      notConfigured: 'Бот WhatsApp не налаштовано на цьому сервері.',
      unlinked: 'Отримуй бриф і схвалюй чернетки в WhatsApp.',
    },
    title: 'Налаштування',
  },
  spam: {
    reasonList: 'У публічному списку доменів спамерів',
    reasonPattern: {
      auth: 'Не пройшов перевірку відправника: адресу підроблено',
      infra:
        'Надіслано з мережі, на яку кілька користувачів Fewmail скаржилися як на спам',
      link: 'Посилання на сайти, які кілька користувачів Fewmail позначили як спам',
      signals: 'Новий домен, дивна адреса і слабка автентифікація водночас',
      template:
        'Такий самий текст кілька користувачів Fewmail позначили як спам',
    },
    reasonCommunity: 'Кілька користувачів Fewmail позначили це як спам',
    reasonYou: 'Ти позначив цього відправника як спам',
    suspect: 'Схоже на спам',
  },
  starterRules: {
    alwaysShow:
      'Сповіщення безпеки, рахунки до оплати, будь-що від мого банку чи державних органів',
    newsletters: 'Розсилки та дайджести',
    notifications: 'Автоматичні сповіщення від інструментів і сервісів',
    people:
      'Листи від реальних людей, які ставлять мені запитання або чекають на мою відповідь',
    promotions: 'Акції, маркетинг і холодні продажі',
    receipts: 'Чеки, підтвердження замовлень і доставки',
  },
  telegram: {
    heard: (text: string) => `Почув: «${text}»`,
    voiceFailed: 'Не вдалося розібрати. Спробуй ще раз або напиши текстом.',
    help: 'Напиши або скажи голосом, що потрібно:\n• спитай про пошту: «коли продовжується Netflix?»\n• скажи, що відповісти: «напиши Анні, що підпишу завтра»\n• дай відповідь на мою чернетку, щоб її змінити',
    canceled: 'Скасовано. Чернетка знову в черзі.',
    sendingIn: (seconds: number) => `Надсилаю через ${seconds} с`,
    undo: 'Скасувати',
    commands: { brief: 'Бриф на сьогодні', queue: 'Що потребує тебе' },
    connectFirst:
      'Спершу відкрий Fewmail → Налаштування → Інтеграції й натисни «Підключити Telegram».',
    connected:
      'Підключено. Щоранку надсилатиму бриф і писатиму, коли прийде щось термінове.\n\n/brief — бриф на сьогодні\n/queue — що потребує тебе',
    done: 'Готово',
    draft: 'Чернетка:',
    edit: 'Змінити',
    editPrompt:
      'Надішли текст на заміну або скажи, як змінити, почавши з «/», напр. «/офіційніше».',
    newDraft: 'Нова чернетка:',
    nothing: 'Зараз нічого не потребує тебе.',
    proOnly:
      'Telegram входить у Fewmail Pro. Щоб перейти, відкрий у Fewmail Налаштування → План.',
    queueHint: '/queue — що потребує тебе',
    rewriting: 'Переписую…',
    send: 'Надіслати',
    sendThis: 'Надіслати це',
    shorter: 'Коротше',
    skip: 'Пропустити',
    skipped: 'Пропущено',
    somethingWrong: 'Щось пішло не так',
    urgent: 'Терміново',
    willSend: 'Надішлю:',
  },
  today: {
    hint: {
      notNow: 'Не зараз',
      setUp: 'Налаштувати',
      turnOn: 'Увімкнути',
    },
    later: (total: number, time: string) =>
      plural('uk', total, {
        one: (n) => `Ще ${n} прийде о ${time}`,
        few: (n) => `Ще ${n} прийдуть о ${time}`,
        many: (n) => `Ще ${n} прийдуть о ${time}`,
        other: (n) => `Ще ${n} прийде о ${time}`,
      }),
    briefArrives: (time: string) => `Бриф приходить щодня о ${time}.`,
    briefFrom: (time: string) => `бриф від ${time}`,
    done: 'Готово',
    firstRead:
      "Читаю твою пошту за останні три дні. Усе, що потребує тебе, з'явиться тут само.",
    handled: {
      spam: (n: number) => `У спамі: ${n}`,
      archived: (n: number) => `В архіві: ${n}`,
      markedRead: (n: number) => `Прочитано: ${n}`,
      review: 'Переглянути',
      total: (n: number) => `Опрацьовано: ${n}`,
      unsubscribed: (n: number) => `Відписано: ${n}`,
    },
    headline: (total: number) =>
      total === 0
        ? 'Усе спокійно.'
        : plural('uk', total, {
            one: (n) => `${n} справа чекає на тебе.`,
            few: (n) => `${n} справи чекають на тебе.`,
            many: (n) => `${n} справ чекають на тебе.`,
            other: (n) => `${n} справи чекають на тебе.`,
          }),
    nothingNeedsYou:
      'Зараз нічого не потребує тебе. Нові листи читаються, щойно приходять.',
    sent: 'Надіслано',
    waitingOnYou: 'Чекають на тебе',
    worthAttention: 'Варто уваги',
    writeNow: 'Написати зараз',
    writing: 'Пишу…',
  },
  boards: {
    chart: {
      add: 'Додати графік',
      edit: 'Налаштування графіка',
      empty: 'Поки нічого малювати',
      groupBy: 'Розбивка',
      groupings: {
        group: 'Хто або що',
        month: 'Місяць',
        status: 'Статус',
        week: 'Тиждень',
      },
      measure: 'Показує',
      measures: { count: 'Кількість', sum: 'Сума' },
      other: 'Інше',
      remove: 'Прибрати графік',
      title: 'Назва графіка',
      type: 'Тип графіка',
      types: {
        area: 'Область',
        bar: 'Стовпці',
        line: 'Лінія',
        pie: 'Кругова',
      },
      untitled: 'Новий графік',
    },
    charts: 'Графіки',
    create: 'Створити дошку',
    delete: 'Видалити дошку',
    description: 'Що збирати',
    descriptionPlaceholder:
      'Подорожі: квитки, готелі й оренда авто, разом із вартістю',
    edit: 'Змінити дошку',
    editHint:
      'Якщо змінити, що збирати, останні пів року буде прочитано заново.',
    empty:
      'Поки порожньо. Відповідні листи з’являтимуться тут, щойно надійдуть.',
    entries: (total: number) =>
      plural('uk', total, {
        one: (n) => `${n} запис`,
        few: (n) => `${n} записи`,
        many: (n) => `${n} записів`,
        other: (n) => `${n} запису`,
      }),
    name: 'Назва',
    namePlaceholder: 'Подорожі',
    new: 'Нова дошка',
    newHint:
      'Опиши своїми словами, що збирати. Fewmail знайде це в пошті за останні пів року, підбере графіки й оновлюватиме дошку сам.',
    planning: 'Налаштовую…',
    readingHistory: 'Читаю пошту за останні пів року…',
    save: 'Зберегти',
    starter: {
      money: {
        description:
          'Платежі, підписки, рахунки й повернення: за що я плачу, кому і скільки.',
        name: 'Гроші',
      },
    },
  },
  bulk: {
    badge: (n: number) => `Отримали ${n}+ користувачів Fewmail`,
    reason: (n: number) =>
      `Масова розсилка: ${n}+ користувачів Fewmail отримали той самий текст`,
  },
  cleanup: {
    emails: (total: number) =>
      plural('uk', total, {
        one: (n) => `${n} лист`,
        few: (n) => `${n} листи`,
        many: (n) => `${n} листів`,
        other: (n) => `${n} листа`,
      }),
    reason: (total: number) =>
      `Листів цього місяця: ${total}, жоден не відкрито`,
    title: (total: number) =>
      plural('uk', total, {
        one: (n) => `Відписатися від ${n} розсилки, яку ти не відкриваєш`,
        few: (n) => `Відписатися від ${n} розсилок, які ти не відкриваєш`,
        many: (n) => `Відписатися від ${n} розсилок, які ти не відкриваєш`,
        other: (n) => `Відписатися від ${n} розсилки, яку ти не відкриваєш`,
      }),
  },
  commitments: {
    title: 'Ти пообіцяв',
  },
  people: {
    firstContact: (date: string) => `Листуєтеся з ${date}`,
    lastContact: (date: string) => `Останній лист ${date}`,
    open: 'Листування з ними',
    promised: 'Ти пообіцяв',
    threads: (total: number) =>
      plural('uk', total, {
        one: (n) => `${n} розмова`,
        few: (n) => `${n} розмови`,
        many: (n) => `${n} розмов`,
        other: (n) => `${n} розмови`,
      }),
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} є в публічному списку активних фішингових сайтів. Не переходь за посиланнями, не входь і не плати.`,
    lookalike_domain: (domain: string) =>
      `Схоже на ${domain}, але це інша адреса. Не переходь за посиланнями й не плати.`,
    new_sender_payment: (domain: string) =>
      `Перший лист від ${domain}, і в ньому просять гроші. Перевір через канал, якому вже довіряєш.`,
    spoofed_sender: (domain: string) =>
      `Нібито від ${domain}, але ${domain} цього не надсилав. Не переходь за посиланнями й не плати.`,
    payment_change: (domain: string) =>
      `Нові платіжні реквізити від ${domain}. Підтвердь телефоном, перш ніж платити.`,
    title: 'Перевір, перш ніж діяти',
  },
  tasks: {
    active: (goal: string) => `Агент працює: ${goal}`,
    auto: 'Надсилати листи без запиту',
    autoHint: 'Кожен лист однаково чекає кілька секунд, щоб ти міг скасувати.',
    cancel: 'Зупинити',
    done: 'Завдання виконано',
    goal: 'Чого має досягти агент?',
    goalPlaceholder: 'напр. Отримати рахунок повторно з нашою новою адресою',
    handle: 'Розібратися з цим…',
    next: 'Наступний крок',
    start: 'Почати',
    started: 'Агент узявся до справи.',
  },
  whatsapp: {
    connectFirst:
      'Спершу відкрий Fewmail → Налаштування → Інтеграції й натисни «Підключити WhatsApp».',
    connected:
      'Під’єднано. Я надсилатиму бриф щоранку й писатиму, коли прийде щось термінове. Надішли текст або голосове, щоб відповісти на будь-який лист.',
    proOnly:
      'WhatsApp входить у Fewmail Pro. Щоб перейти, відкрий у Fewmail Налаштування → План.',
  },
  zombie: {
    badge: (share: number) => `Ігнорує відписку в ${share}% людей`,
    reason: 'Продовжує писати після того, як ти відписався',
  },
}
