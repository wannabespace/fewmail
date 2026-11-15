import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const hi: Messages = {
  actionDone: {
    commitment: 'हो गया',
    confirm: 'मैंने पुष्टि कर दी',
    follow_up: 'मैंने फ़ॉलो-अप किया',
    pay: 'मैंने भुगतान कर दिया',
    read: 'मैंने पढ़ लिया',
    renew: 'मैंने रिन्यू कर दिया',
    schedule: 'मैंने शेड्यूल कर लिया',
    security: 'मैंने जाँच लिया',
    sign: 'मैंने साइन कर दिया',
  },
  actionLink: {
    confirm: 'पुष्टि करें',
    pay: 'भुगतान करें',
    read: 'पढ़ें',
    renew: 'रिन्यू करें',
    sign: 'साइन करें',
  },
  actionKind: {
    cleanup: 'सभी से अनसब्सक्राइब करें',
    consent: 'मंज़ूर करें',
    commitment: 'वादा किया',
    security: 'जाँच करें',
    spam: 'स्पैम में डालें',
    trash: 'ट्रैश में डालें',
    archive: 'आर्काइव करें',
    follow_up: 'फ़ॉलो-अप',
    mark_read: 'पढ़ा हुआ मार्क करें',
    pay: 'भुगतान करें',
    read: 'पढ़ने लायक',
    reply: 'जवाब दें',
    schedule: 'शेड्यूल करें',
    unsubscribe: 'अनसब्सक्राइब करें',
  },
  actionStatus: {
    auto_done: 'एजेंट ने कर दिया',
    dismissed: 'छोड़ा गया',
    done: 'हो गया',
    failed: 'विफल',
    pending: 'होम पर इंतज़ार में',
  },
  byRule: 'एक नियम से',
  agent: {
    decideOnHome: 'होम पर तय करें',
    fromAgent: 'एजेंट पूछ रहा है',
    mcpAsks: (client: string) => `${client} MCP के ज़रिए पूछ रहा है`,
    calendar: (email: string) => `${email} के कैलेंडर में`,
    cc: (recipients: string) => `Cc: ${recipients}`,
    confirm: {
      dismiss_action: 'यह कार्ड छोड़ें?',
      delete_board: 'यह बोर्ड और उस पर सब कुछ हटाएँ?',
      create_event: 'यह इवेंट जोड़ें?',
      delete_event: 'यह इवेंट हटाएं?',
      update_event: 'यह इवेंट बदलें?',
      approve_action: 'यह काम करें?',
      archive_thread: 'यह थ्रेड आर्काइव करें?',
      clear_out: 'इनबॉक्स से ये ईमेल समूह साफ़ करें?',
      undo_clear_out: 'साफ़ किए गए सभी ईमेल इनबॉक्स में वापस लाएँ?',
      create_rule: 'यह नियम जोड़ें?',
      reply: 'यह जवाब भेजें?',
      send_email: 'यह ईमेल भेजें?',
      snooze_thread: 'यह थ्रेड बाद के लिए टालें?',
      unsubscribe: 'इस भेजने वाले से सदस्यता छोड़ें?',
      tidy_mail: 'इन शांत ईमेल को समेटें?',
      trash_thread: 'इस थ्रेड को ट्रैश में ले जाएँ?',
      report_spam: 'इस भेजने वाले को स्पैम के रूप में रिपोर्ट करें?',
      mark_not_spam: 'इस थ्रेड को स्पैम से निकालें?',
      move_to_inbox: 'इस थ्रेड को इनबॉक्स में वापस ले जाएँ?',
    },
    retry: 'फिर कोशिश करें',
    steps: {
      create_event: 'इवेंट जोड़ रहा है',
      delete_event: 'इवेंट हटा रहा है',
      list_events: 'कैलेंडर देख रहा है',
      update_event: 'इवेंट बदल रहा है',
      list_subscriptions: 'मेलिंग लिस्ट देख रहा हूँ',
      approve_action: 'मंज़ूर किया जा रहा है',
      archive_thread: 'आर्काइव किया जा रहा है',
      get_reading: 'न्यूज़लेटर पढ़े जा रहे हैं',
      get_wrapped: 'आपके ईमेल गिने जा रहे हैं',
      clear_out: 'इनबॉक्स साफ़ किया जा रहा है',
      preview_clear_out: 'पूरा इनबॉक्स पढ़ा जा रहा है',
      undo_clear_out: 'साफ़ किए गए ईमेल वापस लाए जा रहे हैं',
      create_rule: 'नियम जोड़ा जा रहा है',
      dismiss_action: 'छोड़ा जा रहा है',
      draft_reply: 'जवाब लिखा जा रहा है',
      create_draft: 'ड्राफ़्ट सहेजा जा रहा है',
      find_people: 'पता खोजा जा रहा है',
      get_board: 'बोर्ड पढ़ा जा रहा है',
      get_person: 'व्यक्ति की जानकारी देखी जा रही है',
      get_today: 'आज का हाल देखा जा रहा है',
      list_boards: 'बोर्ड खोले जा रहे हैं',
      list_handled: 'संभाले गए काम देखे जा रहे हैं',
      list_mail: 'मेल में खोजा जा रहा है',
      list_rules: 'नियम पढ़े जा रहे हैं',
      read_thread: 'थ्रेड पढ़ा जा रहा है',
      redraft_action: 'ड्राफ़्ट दोबारा लिखा जा रहा है',
      refresh: 'नए मेल देखे जा रहे हैं',
      send_email: 'भेजा जा रहा है',
      snooze_thread: 'टाला जा रहा है',
      unsubscribe: 'सदस्यता छोड़ी जा रही है',
      tidy_mail: 'समेटा जा रहा है',
      trash_thread: 'ट्रैश में ले जा रहे हैं',
      report_spam: 'स्पैम रिपोर्ट कर रहे हैं',
      mark_not_spam: 'स्पैम से निकाल रहे हैं',
      move_to_inbox: 'इनबॉक्स में ले जा रहे हैं',
      create_board: 'बोर्ड बना रहे हैं',
      update_board: 'बोर्ड बदल रहे हैं',
      delete_board: 'बोर्ड हटा रहे हैं',
      add_board_chart: 'चार्ट जोड़ रहे हैं',
      add_to_board: 'बोर्ड पर रख रहे हैं',
      edit_board_entry: 'एंट्री ठीक कर रहे हैं',
      remove_board_entry: 'बोर्ड से हटा रहे हैं',
      rename_board_group: 'समूह का नाम बदल रहे हैं',
    },
    to: (recipients: string) => `प्रति: ${recipients}`,
    until: (time: string) => `तक: ${time}`,
    yes: {
      dismiss_action: 'छोड़ें',
      delete_board: 'हटाएँ',
      create_event: 'जोड़ें',
      delete_event: 'हटाएं',
      update_event: 'सेव करें',
      approve_action: 'मंज़ूर करें',
      archive_thread: 'आर्काइव करें',
      clear_out: 'साफ़ करें',
      undo_clear_out: 'वापस लाएँ',
      create_rule: 'जोड़ें',
      reply: 'भेजें',
      send_email: 'भेजें',
      snooze_thread: 'टालें',
      unsubscribe: 'सदस्यता छोड़ें',
      tidy_mail: 'समेटें',
      trash_thread: 'ट्रैश में डालें',
      report_spam: 'स्पैम रिपोर्ट करें',
      mark_not_spam: 'स्पैम नहीं',
      move_to_inbox: 'वापस ले जाएँ',
    },
  },
  ask: {
    label: (question: string) => `Fewmail से पूछें: “${question}”`,
    thinking: 'आपके मेल देखे जा रहे हैं…',
  },
  compose: {
    attach: 'फ़ाइलें जोड़ें',
    attachmentsTooLarge: (limit: string) => `अटैचमेंट कुल ${limit} तक हो सकते हैं।`,
    dropFiles: 'जोड़ने के लिए फ़ाइलें यहाँ छोड़ें',
    removeAttachment: 'हटाएँ',
    discarded: 'ड्राफ़्ट हटाया गया',
    backInQueue: 'रद्द किया गया। ड्राफ़्ट वापस होम पर है।',
    canceled: 'रद्द किया गया। आपका ईमेल वापस एडिटर में है।',
    cc: 'Cc',
    discard: 'हटाएँ',
    draftSaved: 'ड्राफ़्ट सहेजा गया',
    forward: 'फ़ॉरवर्ड करें',
    forwardedMessage: 'फ़ॉरवर्ड किया गया संदेश',
    from: 'से',
    instructionPlaceholder: 'यह कैसा लगना चाहिए? (वैकल्पिक)',
    invalidRecipients: 'कम से कम एक सही ईमेल पता जोड़ें।',
    later: {
      inHour: 'एक घंटे में',
      monday: 'सोमवार सुबह',
      pick: 'तारीख़ और समय चुनें',
      schedule: 'शेड्यूल करें',
      time: 'समय',
      tomorrow: 'कल सुबह',
    },
    new: 'नया ईमेल',
    placeholder: 'अपना ईमेल लिखें…',
    remind: {
      days: (total: number) =>
        plural('hi', total, {
          one: (n) => `${n} दिन में जवाब न आए तो याद दिलाएँ`,
          other: (n) => `${n} दिनों में जवाब न आए तो याद दिलाएँ`,
        }),
      label: 'याद दिलाएँ',
      off: 'कोई रिमाइंडर नहीं',
    },
    reply: 'जवाब दें',
    scheduledFor: (date: string) => `${date} के लिए शेड्यूल किया गया`,
    send: 'भेजें',
    sendLater: 'बाद में भेजें',
    sendingIn: (seconds: number) => `${seconds} सेकंड में भेजा जाएगा`,
    subject: 'विषय',
    to: 'प्रति',
    undo: 'पहले जैसा करें',
    undoing: 'वापस ले रहा है…',
    writeForMe: 'मेरे लिए लिखें',
    writing: 'लिखा जा रहा है…',
  },
  composer: {
    acceptSuggestion: 'स्वीकारने के लिए Tab',
    bold: 'बोल्ड',
    bulletList: 'बुलेट सूची',
    italic: 'इटैलिक',
    link: 'लिंक',
    linkPlaceholder: 'लिंक पेस्ट करें या लिखें',
    noSnippets: 'कोई स्निपेट मेल नहीं खाता।',
    removeLink: 'लिंक हटाएँ',
  },
  calendar: {
    tomorrow: 'कल',
    noAccess: {
      allow: 'अनुमति दें',
      description:
        'Google को आपका कैलेंडर Fewmail के साथ साझा करने की अनुमति नहीं मिली। यहाँ इवेंट देखने और जोड़ने के लिए अनुमति दें।',
      title: 'कैलेंडर जुड़ा नहीं है',
    },
    allDay: 'पूरा दिन',
    calendar: 'कैलेंडर',
    create: 'इवेंट जोड़ें',
    delete: 'हटाएं',
    deleted: 'इवेंट हटाया गया',
    description: 'विवरण',
    editEvent: 'इवेंट बदलें',
    endBeforeStart: 'इवेंट शुरू होने से पहले खत्म होता है',
    ends: 'खत्म',
    location: 'जगह',
    newEvent: 'नया इवेंट',
    next: 'अगला',
    openInGoogle: 'Google Calendar में खोलें',
    previous: 'पिछला',
    save: 'सेव करें',
    saved: 'इवेंट सेव हुआ',
    saving: 'इवेंट सेव हो रहा है…',
    scope: {
      this: 'सिर्फ़ यह इवेंट',
      following: 'यह और आगे के इवेंट',
      all: 'सभी इवेंट',
    },
    starts: 'शुरू',
    title: 'कैलेंडर',
    titlePlaceholder: 'शीर्षक जोड़ें',
    today: 'आज',
    untitled: '(कोई शीर्षक नहीं)',
    views: {
      day: 'दिन',
      week: 'सप्ताह',
      month: 'महीना',
      year: 'साल',
    },
  },
  category: {
    calendar: 'कैलेंडर',
    finance: 'वित्त',
    newsletter: 'न्यूज़लेटर',
    notification: 'सूचना',
    other: 'अन्य',
    person: 'व्यक्ति',
    promotion: 'प्रमोशन',
    receipt: 'रसीद',
    security: 'सुरक्षा',
    travel: 'यात्रा',
    work: 'काम',
  },
  command: {
    compose: 'नया ईमेल',
    agent: 'एजेंट',
    appearance: 'रूप-रंग',
    goTo: 'यहाँ जाएँ',
    mail: 'मेल',
    nothingMatches: 'कुछ नहीं मिला।',
    placeholder: 'अपने मेल के बारे में पूछें या कोई कमांड चलाएँ…',
    teachRule: 'नया नियम सिखाएँ',
    upgrade: 'Pro में अपग्रेड करें',
    theme: {
      dark: 'डार्क',
      light: 'लाइट',
      system: 'सिस्टम',
    },
  },
  importance: ['शोर', 'जानने लायक', 'जल्द ध्यान दें', 'ज़रूरी'],
  justNow: 'अभी',
  errors: {
    calendarAccess: 'Fewmail के पास इस कैलेंडर की अनुमति नहीं है। कैलेंडर पेज पर अनुमति दें।',
    failed: 'कुछ गड़बड़ हो गई। फिर से कोशिश करें।',
    needsPro: 'इसके लिए Fewmail Pro चाहिए।',
    alreadySent: 'पहले ही भेजा जा चुका है, अब पूर्ववत नहीं हो सकता।',
    notFound: 'यह अब मौजूद नहीं है। शायद इसे हटा दिया गया है।',
    offline: 'Fewmail से कनेक्ट नहीं हो पा रहा। अपना कनेक्शन जाँचें।',
  },
  update: {
    available: 'Fewmail का नया वर्ज़न आ गया है।',
    reload: 'रीलोड करें',
  },
  keys: {
    attach: 'जोड़ें',
    done: 'हो गया',
    openLink: 'लिंक खोलें',
    writeReminder: 'रिमाइंडर लिखें',
    summary: 'सारांश',
    fromSender: 'इस प्रेषक से और',
    approvePicked: (n: number) => `${n} चुने हुए मंज़ूर करें`,
    pick: 'चुनें',
    pickAll: 'सब चुनें',
    markRead: 'पढ़ा हुआ मार्क करें',
    unpick: 'चुनाव हटाएँ',
    pin: 'पिन करें',
    unpin: 'अनपिन करें',
    copyCode: 'कोड कॉपी करें',
    restore: 'इनबॉक्स में',
    calendarToday: 'आज',
    newEvent: 'नया इवेंट',
    period: 'पिछला / अगला',
    view: 'व्यू',
    skills: 'स्किल',
    unsubscribe: 'अनसब्सक्राइब',
    filter: 'फ़िल्टर',
    reply: 'जवाब',
    snooze: 'स्नूज़',
    trash: 'ट्रैश',
    ask: 'इसके बारे में पूछें',
    archive: 'आर्काइव',
    approve: 'मंज़ूर करें',
    approveAll: (n: number) => `ऐसे सभी ${n} मंज़ूर करें`,
    close: 'बंद करें',
    draftReply: 'जवाब ड्राफ़्ट करें',
    edit: 'बदलें',
    expand: 'खोलें / बंद करें',
    move: 'चलें',
    stackEmail: 'अगला / पिछला ईमेल',
    open: 'खोलें',
    notOnBoard: 'इस बोर्ड का नहीं',
    rename: 'नाम बदलें',
    clearFilter: 'फ़िल्टर हटाएँ',
    search: 'खोजें',
    send: 'भेजें',
    skip: 'छोड़ें',
    keep: 'रखें',
    stopEditing: 'बदलाव बंद करें',
    rewrite: 'दोबारा लिखें',
    save: 'सहेजें',
    deleteEvent: 'हटाएँ',
  },
  legal: {
    privacy: 'गोपनीयता नीति',
    englishOnly: 'यह दस्तावेज़ अंग्रेज़ी में उपलब्ध है, और अंग्रेज़ी संस्करण ही बाध्यकारी है।',
    terms: 'सेवा की शर्तें',
    updated: (date: string) => `अंतिम अपडेट: ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `इस महीने एजेंट का कोटा खत्म हो गया। यह ${date} को फिर मिलेगा।`,
  },
  notices: {
    freeUpSpace: 'जगह खाली करें',
    mailLost: 'Fewmail की आपके Gmail तक पहुँच खो गई है और वह नए मेल नहीं पढ़ रहा।',
    mailboxLost: (email: string) => `Fewmail की ${email} तक पहुँच खो गई है।`,
    reconnect: 'फिर से जोड़ें',
    sendLimit: (email: string, when: string) =>
      `${email} ने Gmail की रोज़ की भेजने की सीमा पूरी कर ली है। भेजना फिर से ${when} काम करेगा।`,
    signInAgain: 'फिर से साइन इन करें',
    storageFull: (email: string) =>
      `${email} का Google स्टोरेज भर गया है, इसलिए Gmail नए ईमेल वापस भेज रहा है।`,
    storageFullHint: 'फिर से ईमेल पाने के लिए जगह खाली करें या ज़्यादा स्टोरेज लें।',
  },
  login: {
    needsGmail:
      'Fewmail को काम करने के लिए आपके Gmail की ज़रूरत है। फिर से साइन इन करें और Google की स्क्रीन पर Gmail वाला बॉक्स चुना रहने दें।',
    agree: ((slots) => [
      'जारी रखकर आप ',
      slots.terms,
      ' और ',
      slots.privacy,
      ' से सहमत होते हैं।',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail आपकी ओर से Gmail पढ़ने, व्यवस्थित करने और भेजने की अनुमति माँगता है। जब तक आप इसकी इजाज़त देने वाला नियम नहीं लिखते, आपकी मंज़ूरी के बिना न कुछ भेजा जाता है, न आर्काइव किया जाता है। यह आपके Google Calendar की अनुमति भी मांगता है, जिसे आप हटा सकते हैं।',
    continue: 'Google से जारी रखें',
    lead: 'Fewmail आपके लिए इनबॉक्स पढ़ता है, आपके अंदाज़ में जवाब देता है और सिर्फ़ वही दिखाता है जिसे सच में आपकी ज़रूरत है।',
    messengers:
      'मैसेंजर में भी काम करता है, शुरुआत Telegram से: ज़रूरी मेल पाएँ, जवाब मंज़ूर करें या बस वॉइस मैसेज भेजें।',
    title: 'सिर्फ़ वही, जो ज़रूरी है।',
  },
  mail: {
    inThread: (emails: string) => `इस बातचीत में ${emails}`,
    burstHint: (emails: string) =>
      `यह एक बातचीत नहीं है: इस भेजने वाले के ${emails}, साथ रखे गए क्योंकि लगभग एक साथ आए`,
    draftDeleted: 'ड्राफ़्ट हटाया गया',
    unsubscribeConfirm: (name: string) => `${name} से अनसब्सक्राइब करें?`,
    unsubscribeHint:
      'Fewmail लिस्ट छोड़ देगा और यह थ्रेड आर्काइव करेगा। अनसब्सक्राइब को वापस नहीं लिया जा सकता।',
    unsubscribing: 'अनसब्सक्राइब हो रहा है…',
    pin: 'पिन करें',
    unpin: 'अनपिन करें',
    pinned: 'पिन किए गए',
    showAll: (n: number) => `सभी ${n} दिखाएँ`,
    showFewer: 'कम दिखाएँ',
    inGmail: (count: string) => `Gmail में ${count}`,
    markShownRead: (n: number) => `${n} को पढ़ा हुआ चिह्नित करें`,
    oneTimeCode: {
      archive: 'कॉपी करें और संग्रहित करें',
      copied: 'कोड कॉपी हो गया',
      copy: 'कोड कॉपी करें',
      trash: 'कॉपी करें और हटाएँ',
    },
    openUnsubscribePage: 'पेज खोलें',
    unsubscribeYourself:
      'इस सूची से निकलना आपको उसके पेज पर ख़ुद पूरा करना होगा। तब तक उसके ईमेल आर्काइव हैं।',
    allMailboxes: 'सभी मेलबॉक्स',
    filterAbout: {
      focused: 'पहले ज़रूरी मेल और लोग, सूचनाएँ समेटी हुई',
      unread: 'जो आपने अभी नहीं पढ़ा, प्रकार के अनुसार',
      categories: 'पूरा इनबॉक्स प्रकार के अनुसार, जिसे आपकी ज़रूरत है वह पहले',
      inbox: 'सब कुछ, नया सबसे ऊपर',
    },
    find: {
      back: 'मेल पर वापस',
      open: 'खोजें',
      recent: 'हाल की खोजें',
      tips: 'सुझाव',
      clearRecent: 'साफ़ करें',
      describeExample: 'पिछले महीने Anna के इनवॉइस',
      searching: 'आपके मेल में खोज रहा हूँ…',
      tip: {
        from: 'Anna के ईमेल',
        subject: 'विषय में “invoice” है',
        attachment: 'अटैचमेंट वाले',
        pdf: 'PDF अटैचमेंट वाले',
        unread: 'अपठित बातचीत',
        week: 'पिछले 7 दिनों के',
        describe: 'या अपने शब्दों में बताएँ',
      },
    },
    group: {
      read: 'पढ़े हुए',
      earlier: 'पहले के',
      important: 'ज़रूरी',
      people: 'लोग',
      plans: 'कैलेंडर और यात्रा',
      money: 'पैसा',
      updates: 'सूचनाएँ',
      newsletters: 'न्यूज़लेटर',
      promotions: 'प्रमोशन',
    },
    unread: 'अपठित',
    block: 'भेजने वाले को ब्लॉक करें',
    ignoresUnsubscribe: (name: string) =>
      `${name} अनसब्सक्राइब को नज़रअंदाज़ करता है`,
    ignoresUnsubscribeHint:
      'Fewmail ने अनसब्सक्राइब करने को कहा, लेकिन यह भेजने वाला फिर भी लिखता रहता है। अब से इसके ईमेल ट्रैश में भेजें? इसे नियमों में वापस बदल सकते हैं।',
    blocked: 'ब्लॉक किया गया। उनके मेल अब ट्रैश में जाएँगे।',
    forward: 'फ़ॉरवर्ड करें',
    more: 'और',
    close: 'बंद करें',
    reply: 'जवाब दें',
    trash: 'ट्रैश में डालें',
    trashed: 'ट्रैश में डाल दिया',
    moveToInbox: 'इनबॉक्स में ले जाएँ',
    backInInbox: 'इनबॉक्स में ले जाया गया',
    movedToInbox: 'इनबॉक्स में वापस डाल दिया। बताने के लिए शुक्रिया।',
    noThread: 'यहाँ पढ़ने के लिए कोई ईमेल चुनें',
    deleteDraft: 'ड्राफ़्ट हटाएँ',
    notSent: 'नहीं भेजा गया। फिर से कोशिश करने के लिए खोलें',
    noRecipients: 'कोई प्राप्तकर्ता नहीं',
    notSpam: 'स्पैम नहीं',
    reportSpam: 'स्पैम रिपोर्ट करें',
    reportedSpam: 'रिपोर्ट किया गया। उनके मेल अब स्पैम में जाएँगे।',
    archive: 'आर्काइव करें',
    archived: 'आर्काइव हो गया',
    markedRead: 'पढ़ा हुआ मार्क किया',
    attachment: 'अटैचमेंट',
    draftReply: 'जवाब ड्राफ़्ट करें',
    drafting: 'ड्राफ़्ट बन रहा है…',
    draftWaiting: 'ड्राफ़्ट होम पर इंतज़ार कर रहा है',
    due: (date: string) => `देय ${date}`,
    dueHint: 'इस ईमेल में एजेंट को मिली समय-सीमा',
    empty: 'यहाँ कोई ईमेल नहीं है',
    emptyHint: 'नए ईमेल आते ही यहाँ दिखेंगे।',
    noResults: 'कुछ नहीं मिला',
    noResultsHint: 'दूसरे शब्द या दूसरा फ़ोल्डर आज़माएँ।',
    expectsReply: 'जवाब की उम्मीद है',
    filter: {
      categories: 'श्रेणियाँ',
      archive: 'संग्रह',
      trash: 'ट्रैश',
      drafts: 'ड्राफ़्ट',
      spam: 'स्पैम',
      inbox: 'इनबॉक्स',
      snoozed: 'स्नूज़ किए गए',
      focused: 'फ़ोकस',
      unread: 'अनपढ़े',
    },
    instruction: 'एजेंट को बताएँ कि कैसे जवाब देना है, या बस Enter दबाएँ',
    open: 'खोलें',
    openInGmail: 'Gmail में खोलें',
    openFullPage: 'पूरे पेज पर खोलें',
    peek: 'पूर्वावलोकन',
    collapseFullPage: 'सूची पर वापस जाएँ',
    search: 'खोजें या बताएँ: पिछले महीने Anna के इनवॉइस',
    unsubscribe: 'अनसब्सक्राइब करें',
    unsubscribed: 'अनसब्सक्राइब हो गया',
    unsubscribeFailed:
      'इस भेजने वाले के पास एक-क्लिक अनसब्सक्राइब नहीं है, इसलिए ईमेल आर्काइव कर दिया गया।',
    you: 'आप',
    replyTo: 'जवाब भेजें',
    date: 'तारीख',
    authentication: 'प्रमाणीकरण',
    toLine: (recipients: string) => `को: ${recipients}`,
  },
  subscriptions: {
    unsubscribeHint: (emails: string) =>
      `Fewmail लिस्ट छोड़ देगा और उसका भेजा सब कुछ आर्काइव करेगा (इस महीने ${emails})। अनसब्सक्राइब को वापस नहीं लिया जा सकता।`,
    archivedOnly:
      'इस भेजने वाले के पास ऐसा अनसब्सक्राइब नहीं है जिसे Fewmail इस्तेमाल कर सके, इसलिए उसका मेल आर्काइव कर दिया गया, लेकिन तुम अब भी लिस्ट में हो और नए मेल आते रहेंगे।',
    count: (total: number) => `मेलिंग लिस्ट: ${total}`,
    empty: 'इस महीने किसी मेलिंग लिस्ट ने आपको नहीं लिखा।',
    lead: 'न्यूज़लेटर, प्रमोशन और दूसरी मेलिंग लिस्ट जिन्होंने इस महीने आपको लिखा, सबसे सक्रिय पहले। जो आप कभी नहीं पढ़ते, उससे अनसब्सक्राइब करें: Fewmail लिस्ट छोड़ देता है और उसका भेजा सब कुछ आर्काइव कर देता है।',
    opened: (total: number) =>
      total === 0 ? 'एक भी नहीं खोला' : `${total} खोले`,
    title: 'मेलिंग लिस्ट',
    unsubscribe: 'अनसब्सक्राइब करें',
    unsubscribed: 'अनसब्सक्राइब हो गया',
  },
  nav: {
    labels: 'लेबल',
    folders: 'फ़ोल्डर',
    calendar: 'कैलेंडर',
    subscriptions: 'मेलिंग लिस्ट',
    boards: 'बोर्ड',
    newBoard: 'नया बोर्ड',
    mail: 'मेल',
    reading: 'पढ़ना',
    rules: 'नियम',
    search: 'खोजें या पूछें…',
    settings: 'सेटिंग्स',
    syncFailed: 'Gmail सिंक विफल, फिर से कोशिश हो रही है',
    syncing: 'आपका इनबॉक्स पढ़ा जा रहा है…',
    loading: 'लोड हो रहा है',
    syncFailedIn: (email: string) => `${email} सिंक विफल, फिर से कोशिश हो रही है`,
    syncingIn: (email: string) => `${email} पढ़ा जा रहा है…`,
    home: 'होम',
    trialLeft: (total: number) =>
      plural('hi', total, {
        one: () => 'Pro ट्रायल · 1 दिन बाकी',
        other: (n) => `Pro ट्रायल · ${n} दिन बाकी`,
      }),
    usage: (percent: number) => `एजेंट · इस महीने का ${percent}% इस्तेमाल हुआ`,
    watching: 'एजेंट आपके इनबॉक्स पर नज़र रख रहा है',
  },
  notifications: {
    many: (total: number) =>
      plural('hi', total, {
        other: (n) => `Fewmail से ${n} नई सूचनाएँ`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `ऐसे पेज जिन्हें एजेंट आपके मेल से भरता है, पिछले तीन महीनों से शुरू करके। ${max} तक चुनें; अपने पेज बाद में जोड़ सकते हैं।`,
    boardsTitle: 'एजेंट आपके लिए क्या इकट्ठा करे?',
    languageHint:
      'ऐप, सारांश और व्याख्याएँ इसी भाषा में होंगी। जवाब हमेशा उस ईमेल की भाषा में होंगे जिसका आप जवाब दे रहे हैं।',
    languageTitle: 'Fewmail कौन-सी भाषा बोले?',
    lead: 'दो छोटे जवाब। आप बाद में सेटिंग्स में सब बदल सकते हैं।',
    reading: 'आपका इनबॉक्स पढ़ा जा रहा है…',
    start: 'शुरू करें',
    title: 'चलिए, आपका एजेंट सेट करते हैं।',
  },
  plan: {
    used: (percent: number) => `${percent}% इस्तेमाल हुआ`,
    about: (emails: string, messages: string) =>
      `महीने में लगभग ${emails} पढ़े गए ईमेल या एजेंट को ${messages} संदेश, किसी भी मेल में।`,
    free: 'Free',
    freeDescription: 'आसान नियमों के साथ तेज़ और शांत मेल। जब तक चाहें, मुफ़्त।',
    includes:
      'हर पेड प्लान में एजेंट जुड़ता है: हर ईमेल पढ़ा और सारांशित, आपकी आवाज़ में ड्राफ़्ट किए गए जवाब, सादे शब्दों में नियम, Telegram और MCP।',
    manage: 'बिलिंग मैनेज करें',
    price: (usd: number) => `$${usd} / महीना`,
    priceYearly: (usd: number) => `$${usd} / वर्ष`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
    cancels: (plan: string, date: string) => `${date} तक ${plan}, फिर Free।`,
    choose: (plan: string) => `${plan} चुनें`,
    proRenews: (date: string) => `${date} को रिन्यू होगा।`,
    resets: (date: string) => `${date} को फिर से शुरू होगा।`,
    title: 'प्लान',
    trial: 'Pro ट्रायल',
    welcome: (plan: string) => `${plan} में आपका स्वागत है। एजेंट फिर से काम पर है।`,
    yearly: 'सालाना भुगतान करें',
    yearlyHint: 'दो महीने मुफ़्त।',
    trialDescription: (date: string) =>
      `${date} तक Pro की हर सुविधा, फिर मुफ़्त। कार्ड की ज़रूरत नहीं।`,
    upgrade: 'अन्य प्लान',
    usage: 'इस महीने',
  },
  queue: {
    addToCalendar: 'कैलेंडर में जोड़ें',
    writeReminder: 'रिमाइंडर लिखें',
    approve: 'मंज़ूर करें',
    delete: 'हटाएँ',
    pick: 'चुनें',
    picked: (n: number) => `${n} चुने गए`,
    unpick: 'चुनाव हटाएँ',
    askedByYou: 'आपके कहने पर',
    draftedInVoice: 'आपके अंदाज़ में ड्राफ़्ट किया गया',
    edit: 'बदलें',
    send: 'भेजें',
    rewrite: 'दोबारा लिखें',
    shorterInstruction: 'इसे छोटा करें।',
    new: 'नया',
    skipStale: 'सब छोड़ें',
    skipped: (n: number) => `छोड़े गए: ${n}`,
    stale: (n: number) => `एक हफ़्ते से पुराने: ${n}`,
    skip: 'छोड़ें',
  },
  reminders: {
    followUp: 'फ़ॉलो-अप करें',
    noReply: 'अभी तक जवाब नहीं',
  },
  rules: {
    deleted: 'नियम हटाया गया',
    add: 'नियम जोड़ें',
    count: (total: number) =>
      plural('hi', total, { one: () => '1 नियम', other: (n) => `${n} नियम` }),
    delete: 'हटाएँ',
    describe: {
      alwaysShow: 'हमेशा होम पर दिखता है',
      autonomous: 'अपने आप होता है, निपटाए गए में दिखता है',
      draft: 'एक ड्राफ़्ट होम पर आपका इंतज़ार करता है',
    },
    effect: {
      trash: 'ट्रैश में डालें',
      always_show: 'हमेशा मुझे दिखाएँ',
      archive: 'आर्काइव करें',
      draft_reply: 'जवाब ड्राफ़्ट करें',
      mark_read: 'पढ़ा हुआ मार्क करें',
      unsubscribe: 'अनसब्सक्राइब करें',
    },
    enabled: 'नियम चालू है',
    lead: 'एजेंट को आसान शब्दों में बताएँ कि कुछ खास मेल के साथ क्या करना है। वह हर ईमेल को इन नियमों से मिलाकर देखता है।',
    newTitle: 'नया नियम सिखाएँ',
    leadFree:
      'अपने आप आर्काइव करें, पढ़ा हुआ मार्क करें या अनसब्सक्राइब करें। नियम नए मेल के आते ही चलते हैं।',
    simple: {
      appliedAutomatically: 'नए मेल पर अपने आप लागू',
      field: {
        from: 'भेजने वाला',
        mailingList: 'कोई भी मेलिंग लिस्ट',
        subject: 'विषय में शामिल',
      },
      title: {
        from: (value: string) => `भेजने वाला “${value}”`,
        mailingList: () => 'कोई भी मेलिंग लिस्ट',
        subject: (value: string) => `विषय में “${value}” शामिल`,
      },
      valuePlaceholder: 'anna@example.com, कोई नाम या शब्द',
      whichField: 'किससे मिलान करें',
    },
    placeholder: 'जैसे, Hetzner के इनवॉइस या LinkedIn की सूचनाएँ',
    title: 'नियम',
    whatAgentDoes: 'एजेंट क्या करे',
    whichEmails: 'कौन-से ईमेल',
  },
  settings: {
    disconnectConfirm: (name: string) => `${name} डिस्कनेक्ट करें?`,
    messengerDisconnectHint:
      'बॉट आपको लिखना बंद कर देगा। फिर से जोड़ने के लिए इस पेज से नया लिंक चाहिए होगा।',
    readingDigest: {
      description:
        'हर सुबह, कल के न्यूज़लेटर Telegram और WhatsApp में एक संदेश में आते हैं, और अगर दोनों में से कोई जुड़ा नहीं है तो सूचना के रूप में।',
      title: 'न्यूज़लेटर सारांश',
    },
    knowledge: {
      description:
        'कीमतें, पते, उपलब्धता, आप कैसे जवाब देना पसंद करते हैं। एजेंट इसे ड्राफ़्ट और ऑटोकम्प्लीट में इस्तेमाल करता है।',
      placeholder: 'जैसे: कंसल्टिंग $150/h है। मैं शुक्रवार को कॉल नहीं लेता। मेरा पता है…',
      title: 'एजेंट को क्या पता होना चाहिए',
    },
    labels: {
      description:
        'मेल को Fewmail/… लेबल में बाँटें ताकि आपके फ़ोन के Gmail में भी वही क्रम दिखे।',
      title: 'Gmail में एजेंट लेबल',
    },
    snippets: {
      deleted: 'स्निपेट हटाया गया',
      add: 'स्निपेट जोड़ें',
      body: 'टेक्स्ट',
      delete: 'हटाएँ',
      description: 'नाम से स्निपेट डालने के लिए एडिटर में ; टाइप करें।',
      name: 'नाम',
      title: 'स्निपेट',
    },
    account: 'खाता',
    agent: 'एजेंट',
    deleteAccount: 'खाता हटाएँ',
    deleteConfirm: 'सब कुछ हटाएँ',
    deleteDescription:
      'आपका खाता, सिंक किए गए मेल, ड्राफ़्ट और नियम Fewmail से तुरंत हटा दिए जाएँगे। आपके Gmail को छुआ नहीं जाएगा। सशुल्क प्लान तुरंत रद्द हो जाता है।',
    deleteFailed: 'खाता नहीं हटाया गया। एक मिनट में फिर से कोशिश करें।',
    deleteSignIn:
      'यह पुष्टि करने के लिए कि यह आप ही हैं, Google से फिर से साइन इन करें, फिर खाता हटाएँ।',
    deleteTitle: 'अपना Fewmail खाता हटाएँ?',
    cancel: 'रद्द करें',
    integrations: 'इंटीग्रेशन',
    language: 'भाषा',
    languageDescription: 'ऐप, बॉट और सारांश। जवाब ईमेल की भाषा में होते हैं।',
    legal: 'कानूनी',
    mailboxes: {
      removeConfirm: (email: string) => `${email} हटाएँ?`,
      removeHint:
        'Fewmail इसे पढ़ना बंद कर देगा और वहाँ पढ़ी बातें भूल जाएगा। Gmail में कुछ नहीं बदलेगा।',
      add: 'Gmail जोड़ें',
      addDescription:
        'दूसरे Gmail खाते की मेल उसी होम और इनबॉक्स में आती है। इससे यहाँ कोई साइन इन नहीं कर सकता: इससे साइन इन करने पर अलग Fewmail खुलता है।',
      added: 'मेलबॉक्स जोड़ा गया। इसकी मेल एक मिनट में दिखेगी।',
      failed: 'मेलबॉक्स नहीं जोड़ा जा सका। Gmail एक्सेस दें और फिर कोशिश करें।',
      lost: 'Gmail एक्सेस चला गया। फिर से जोड़कर दोबारा कनेक्ट करें।',
      reading: 'मेल पढ़ी जा रही है…',
      remove: 'हटाएँ',
      retrying: 'Gmail अभी जवाब नहीं दे रहा। Fewmail अपने आप फिर से कोशिश करेगा।',
      signIn: 'आप इसी से साइन इन करते हैं',
      signInChosen: 'आप इसी खाते से साइन इन करते हैं। कोई दूसरा चुनें।',
      signInLost: 'Gmail एक्सेस चला गया। दोबारा कनेक्ट करने के लिए फिर से साइन इन करें।',
      synced: (ago: string) => `${ago} सिंक हुआ`,
      title: 'मेलबॉक्स',
    },
    mcp: {
      disconnectHint: 'जब तक आप इसे फिर से नहीं जोड़ते, यह आपका मेल नहीं पढ़ पाएगा।',
      allow: 'अनुमति दें',
      connected: (ago: string) => `${ago} जुड़ा`,
      copy: 'URL कॉपी करें',
      defaultName: 'MCP क्लाइंट',
      deny: 'मना करें',
      description:
        'ये आपका मेल पढ़ सकते हैं, जवाब ड्राफ़्ट कर सकते हैं और आपकी पुष्टि के बाद भेज सकते हैं।',
      disconnect: 'डिस्कनेक्ट करें',
      paste: 'इस URL को अपने ऐप में कनेक्टर के रूप में जोड़ें, फिर Fewmail में साइन इन करें।',
      request: (app: string) => `${app} आपका Fewmail इस्तेमाल करना चाहता है`,
      title: 'Claude, Cursor या कोई भी MCP क्लाइंट जोड़ें',
    },
    morningDescription: (timezone: string) =>
      `न्यूज़लेटर सारांश और सोमवार की साप्ताहिक रिपोर्ट, आपके टाइम ज़ोन में, ${timezone}`,
    morningTitle: 'सुबह के संदेश',
    signedInWithGoogle: 'Google से साइन इन',
    signOut: 'साइन आउट',
    notifications: {
      blocked: 'सूचनाएँ ब्लॉक हैं। ब्राउज़र की साइट सेटिंग में इन्हें अनुमति दें।',
      browser: 'यह ब्राउज़र',
      messengerOff: 'ज़रूरी मेल Fewmail में ही रहते हैं।',
      messengerOn: 'ज़रूरी मेल तुरंत चैट में आते हैं।',
      notConfigured: 'इस सर्वर पर ब्राउज़र सूचनाएँ कॉन्फ़िगर नहीं हैं।',
      off: 'Fewmail बंद होने पर भी ज़रूरी मेल यहाँ पाएँ।',
      on: 'ज़रूरी मेल यहाँ दिखते हैं। एक साथ कई आएँ तो एक सूचना में आते हैं।',
      title: 'सूचनाएँ',
      unsupported: 'यह ब्राउज़र सूचनाएँ नहीं दिखा सकता।',
    },
    telegram: {
      connect: 'Telegram जोड़ें',
      disconnect: 'डिस्कनेक्ट करें',
      linked: 'ज़रूरी मेल तुरंत आते हैं। चैट से ही ड्राफ़्ट मंज़ूर करें और बदलें।',
      linkedQuiet: 'चैट से ही ड्राफ़्ट मंज़ूर करें और बदलें।',
      notConfigured: 'इस सर्वर पर Telegram बॉट कॉन्फ़िगर नहीं है।',
      unlinked: 'Telegram पर ज़रूरी मेल पाएँ और ड्राफ़्ट मंज़ूर करें।',
    },
    whatsapp: {
      connect: 'WhatsApp जोड़ें',
      disconnect: 'डिस्कनेक्ट करें',
      linked: 'ज़रूरी मेल तुरंत आते हैं। चैट से ही ड्राफ़्ट मंज़ूर करें और बदलें।',
      linkedQuiet: 'चैट से ही ड्राफ़्ट मंज़ूर करें और बदलें।',
      notConfigured: 'इस सर्वर पर WhatsApp बॉट कॉन्फ़िगर नहीं है।',
      unlinked: 'WhatsApp पर ज़रूरी मेल पाएँ और ड्राफ़्ट मंज़ूर करें।',
    },
    title: 'सेटिंग्स',
  },
  site: {
    meta: {
      assistant:
        'Fewmail Gmail के लिए AI ईमेल असिस्टेंट है, जो हर ईमेल पहले खुद पढ़ता है, आपके अंदाज़ में जवाब लिखता है और आपको सिर्फ़ वही दिखाता है जिसे आपकी ज़रूरत है। मुफ़्त शुरू करें।',
      assistantTitle: 'Gmail के लिए AI ईमेल असिस्टेंट',
      compare:
        'Superhuman, Shortwave और SaneBox से Fewmail की तुलना: खुद तेज़ी से पढ़ने का तरीका नहीं, बल्कि आपके लिए मेल पढ़ने वाला AI एजेंट।',
      compareTitle: 'AI ईमेल असिस्टेंट की तुलना',
      home: 'Fewmail Gmail के लिए AI ईमेल असिस्टेंट है: यह हर ईमेल पढ़ता है, आपके अंदाज़ में जवाब लिखता है और आपको सिर्फ़ वही दिखाता है जिसे आपकी ज़रूरत है।',
      login:
        'Fewmail आपके लिए आपका Gmail पढ़ता है, आपके अंदाज़ में जवाब देता है और सिर्फ़ वही दिखाता है जिसे सच में आपकी ज़रूरत है।',
      mcp: 'Fewmail को MCP सर्वर के रूप में Claude, ChatGPT, Claude Code या Cursor से जोड़ें: जिस AI को आप पहले से इस्तेमाल करते हैं, उसी से अपना Gmail पढ़ें और छाँटें।',
      motto: 'आपके इनबॉक्स में सिर्फ़ ज़रूरी चीज़ें',
      pricing: (trialDays: number) =>
        `होम, छँटाई, नियमों और स्पैम सुरक्षा के लिए Fewmail हमेशा मुफ़्त है। Pro, पूरा एजेंट, ${trialDays} मुफ़्त दिनों से शुरू होता है, कार्ड की ज़रूरत नहीं।`,
      tagline: 'Gmail के लिए AI ईमेल एजेंट',
    },
    chapters: {
      pricing: {
        description:
          'होम, सॉर्टिंग, नियम और सुरक्षा हमेशा के लिए मुफ़्त। Lite, Pro और Max वह सब जोड़ते हैं जो आपके लिए पढ़ता और लिखता है; बड़े प्लान बस उसे और ज़्यादा करते हैं।',
        label: 'कीमत',
        title: (usd: number) => `सॉर्टिंग मुफ़्त। एजेंट $${usd} से शुरू।`,
      },
      questions: {
        description: 'छोटे जवाब यहाँ हैं। लंबे जवाब गोपनीयता नीति में।',
        label: 'सवाल',
        title: 'Gmail जोड़ने से पहले।',
      },
    },
    closing: {
      lead: 'एक मिनट में Gmail जोड़ें। Fewmail पिछले तीन दिनों के मेल से शुरू करता है, इसलिए पहले फ़ैसले तुरंत आपका इंतज़ार कर रहे होते हैं।',
      title: 'अपनी सुबहें वापस पाएँ।',
    },
    mcp: {
      answer:
        'शुक्रवार के किकऑफ़ से पहले साइन किया हुआ कॉन्ट्रैक्ट। जवाब पहले से ड्राफ़्ट है और आपकी Fewmail कतार में इंतज़ार कर रहा है।',
      clients: 'इनके साथ काम करता है',
      emphasis: 'Claude और ChatGPT के अंदर।',
      free: 'अपना मेल पढ़ना और एजेंट की छँटाई मुफ़्त है।',
      label: 'MCP',
      lead: 'Fewmail को MCP सर्वर की तरह जोड़ें और जिस असिस्टेंट को आप पहले से इस्तेमाल करते हैं, उसी से अपने मेल के बारे में पूछें। जो कुछ भी ईमेल भेजता है या Gmail बदलता है, वह फिर भी पहले आपकी हाँ पूछता है।',
      question: 'इस हफ़्ते Anna को मुझसे क्या चाहिए?',
      setup: 'एक मिनट में जोड़ें',
      title: 'आपका मेल, Claude और ChatGPT के अंदर।',
    },
    mcpPage: {
      copy: 'URL कॉपी करें',
      lead: 'Fewmail को MCP सर्वर की तरह जोड़ें और जिस AI को आप पहले से इस्तेमाल करते हैं, उसी से अपने ईमेल के बारे में पूछें। ईमेल पढ़ना और एजेंट की छँटाई मुफ़्त है; ड्राफ़्ट, भेजना और नियम Pro में हैं।',
      safety:
        'ईमेल भेजने या Gmail बदलने वाली हर चीज़ पहले आपकी हाँ पूछती है। आपके ईमेल से कभी मॉडल ट्रेन नहीं होते, और किसी भी ऐप को सेटिंग्स में डिस्कनेक्ट किया जा सकता है।',
      steps: {
        chatgpt:
          'Settings में इस URL के साथ एक कनेक्टर (ऐप) जोड़ें, फिर Fewmail में साइन इन करें।',
        claude:
          'Settings → Connectors में इस URL के साथ एक कस्टम कनेक्टर जोड़ें, फिर Fewmail में साइन इन करें।',
        code: 'इसे टर्मिनल में एक बार चलाएँ, फिर Claude Code के पूछने पर Fewmail में साइन इन करें।',
        cursor:
          'इसे अपने mcp.json में जोड़ें, फिर Cursor के पूछने पर Fewmail में साइन इन करें।',
      },
      title: 'Claude, ChatGPT और आपके टूल्स के अंदर Fewmail।',
    },
    assistantPage: {
      abilities: {
        ask: {
          description:
            'पूछें “मेरी फ़्लाइट कब निकलेगी?” और जवाब उन ईमेल के साथ पाएँ जिनसे वह आया, Fewmail, Telegram या WhatsApp में, या Claude और ChatGPT से।',
          title: 'आपके मेल से जवाब',
        },
        drafts: {
          description:
            'जवाब पहले से लिखे जाते हैं, आपके अंदाज़ में और भेजने वाले की भाषा में, और आपकी मंज़ूरी तक आपकी कतार में इंतज़ार करते हैं।',
          title: 'आपके अंदाज़ में जवाब ड्राफ़्ट करता है',
        },
        protection: {
          description:
            'बदले हुए बैंक विवरण, मिलते-जुलते डोमेन और जानी-पहचानी ठगी पर आपके कुछ करने से पहले चेतावनी मिलती है।',
          title: 'फ़िशिंग से सावधान करता है',
        },
        reading: {
          description:
            'दिन के न्यूज़लेटर विषय के हिसाब से एक सारांश बन जाते हैं, हर वाक्य उस ईमेल से जुड़ा जिससे वह आया।',
          title: 'न्यूज़लेटर एक सारांश में',
        },
        rules: {
          description:
            'एक वाक्य में बताएँ कि कुछ मेल के साथ क्या होना चाहिए, और वह नियम बन जाता है। खुद से सिर्फ़ वे नियम काम करते हैं जिन्हें आप चालू करते हैं।',
          title: 'सादे शब्दों में नियम',
        },
        sorting: {
          description:
            'हर ईमेल को एक सारांश और महत्व का स्कोर मिलता है, ताकि ज़रूरी चीज़ें ऊपर आएँ और रसीदें, सूचनाएँ और प्रमोशन आपके रास्ते से दूर रहें।',
          title: 'हर ईमेल पढ़ता और छाँटता है',
        },
      },
      abilitiesDescription:
        'सब कुछ उसी Gmail में होता है जिसे आप पहले से इस्तेमाल करते हैं, और एजेंट का हर काम उसकी वजह के साथ दर्ज होता है।',
      abilitiesLabel: 'यह क्या करता है',
      abilitiesTitle: 'एक असिस्टेंट, कोई और इनबॉक्स नहीं।',
      compareTitle: 'दूसरे AI ईमेल टूल से इसकी तुलना।',
      faq: (trialDays: number) => [
        {
          answer:
            'ऐसा सॉफ़्टवेयर जो AI से आपके लिए ईमेल पढ़ता, छाँटता और उनका जवाब देता है। ज़्यादातर टूल उस इनबॉक्स में सारांश और लिखने में मदद जोड़ देते हैं जिसे आप अब भी खुद पढ़ते हैं। Fewmail इससे आगे जाता है: यह पहले सब कुछ पढ़ता है, ताकि आपको सिर्फ़ वही दिखे जिसे आपकी ज़रूरत है।',
          question: 'AI ईमेल असिस्टेंट क्या है?',
        },
        {
          answer:
            'Fewmail अपने डेटाबेस में विषय, मुख्य भाग, सारांश और ड्राफ़्ट एन्क्रिप्ट रखता है, आपके मेल से कभी मॉडल ट्रेन नहीं करता और आपकी हाँ के बिना Gmail में कभी कुछ नहीं भेजता या बदलता। आप कभी भी इसे डिस्कनेक्ट करके सब कुछ हटा सकते हैं।',
          question: 'क्या AI को अपना ईमेल पढ़ने देना सुरक्षित है?',
        },
        {
          answer:
            'यह आपके लिए जवाब ड्राफ़्ट करता है, पर कभी खुद से कोई जवाब नहीं भेजता। हर ड्राफ़्ट आपकी कतार में आपकी मंज़ूरी का इंतज़ार करता है, और मिलते-जुलते ड्राफ़्ट एक साथ मंज़ूर किए जा सकते हैं।',
          question: 'क्या यह अपने आप ईमेल का जवाब दे सकता है?',
        },
        {
          answer: `हाँ। Free प्लान हर ईमेल छाँटता है, जिसे आपकी ज़रूरत है उसे एक पेज पर रखता है, आपके नियम चलाता है और आपको स्पैम और फ़िशिंग से बचाता है, हमेशा के लिए। ड्राफ़्ट, सारांश और बाकी एजेंट पेड प्लान में मिलते हैं, और हर खाता ${trialDays} दिन के Pro से शुरू होता है, बिना कार्ड।`,
          question: 'क्या Gmail के लिए कोई मुफ़्त AI ईमेल असिस्टेंट है?',
        },
      ],
      faqTitle: 'AI ईमेल असिस्टेंट के बारे में।',
      lead: 'Fewmail आपके Gmail में आते ही हर ईमेल पढ़ता है, शोर हटाता है, आपके अंदाज़ में जवाब ड्राफ़्ट करता है और आपके सामने सिर्फ़ वे कुछ चीज़ें लाता है जिन पर आपका फ़ैसला चाहिए। आपकी हाँ के बिना कुछ भी भेजा या बदला नहीं जाता।',
      title: 'वह AI ईमेल असिस्टेंट जो आपका Gmail पहले पढ़ता है।',
    },
    comparePage: {
      lead: 'ईमेल क्लाइंट आपको हर ईमेल तेज़ी से पढ़ने में मदद करते हैं। फ़िल्टर मेल को फ़ोल्डरों में डालते हैं। Fewmail एक एजेंट है: वह मेल पढ़ता है, तय करता है कि क्या रुक सकता है और सिर्फ़ बाकी के बारे में आपसे पूछता है।',
      title: 'Fewmail की तुलना।',
    },
    comparison: {
      custom: 'कस्टम',
      features: 'हर फ़ीचर की तुलना',
      groups: {
        agent: 'पढ़ना और जवाब देना',
        day: 'आपका दिन',
        reach: 'कहाँ काम करता है',
        safety: 'सुरक्षा',
      },
      labels: {
        ask: 'अपने मेल से कुछ भी पूछें',
        home: 'जो आपका इंतज़ार कर रहा है, सब एक पेज पर',
        calendar: 'कैलेंडर',
        drafts: 'आपके लिए लिखे जवाब',
        followUps: 'फ़ॉलो-अप रिमाइंडर',
        gmail: 'Gmail और Google Workspace',
        handOver: 'थ्रेड सौंप दें',
        importance: 'महत्व के क्रम में',
        keepApp: 'अपना मेल ऐप रखें',
        mcp: 'आपके अपने टूल के लिए MCP',
        memory: 'वादे और लोग याद रखता है',
        otherProviders: 'iCloud, Yahoo और दूसरे IMAP मेल',
        outlook: 'Outlook और Microsoft 365',
        phishing: 'फ़िशिंग और भुगतान बदलाव की चेतावनियाँ',
        phone: 'आपके फ़ोन पर',
        rules: 'सादे शब्दों में नियम',
        snooze: 'स्नूज़',
        spamShield: 'कम्युनिटी स्पैम शील्ड',
        summaries: 'ईमेल सारांश',
        teams: 'टीम इनबॉक्स',
        unsubscribe: 'एक क्लिक में अनसब्सक्राइब',
      },
      more: 'और तुलनाएँ',
      no: 'नहीं',
      noFreePlan: 'कोई मुफ़्त प्लान नहीं',
      ours: {
        ask: 'Pro पर',
        home: 'लाइव, एक साथ मंज़ूरी, मुफ़्त',
        drafts: 'आपके अंदाज़ में, सिर्फ़ आपकी मंज़ूरी पर भेजे जाते हैं, Pro पर',
        followUps: 'अपने आप, उन मेल पर जिनका जवाब अपेक्षित है',
        handOver: 'एजेंट उसे उसके लक्ष्य तक पहुँचाता है, Pro पर',
        importance: 'हर ईमेल का स्कोर, मुफ़्त',
        keepApp: 'सब कुछ Gmail में दिखता है',
        mcp: 'Pro पर',
        memory: 'Pro पर',
        phone: 'Telegram और WhatsApp, वॉइस के साथ, Pro पर',
        rules: 'आर्काइव, पढ़ा हुआ मार्क या अनसब्सक्राइब, मुफ़्त',
        summaries: 'Pro पर',
        unsubscribe: 'जो भेजने वाले इसे अनदेखा करें, वे स्पैम में जाते हैं',
      },
      plans: 'प्लान और कीमतें',
      read: 'तुलना पढ़ें',
      source: (name: string, date: string) =>
        `${name} की जानकारी उसकी सार्वजनिक वेबसाइट से ली गई है, जिसे ${date} में जाँचा गया। कीमतें और फ़ीचर बदलते रहते हैं; मौजूदा ऑफ़र के लिए उनकी साइट देखें।`,
      title: (name: string) => `Fewmail बनाम ${name}`,
      tryFree: 'Fewmail मुफ़्त आज़माएँ',
      which: 'आपके लिए कौन-सा सही है?',
      yes: 'हाँ',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 मेलबॉक्स और हर फ़ीचर, AI Bundle सहित',
          lunch: '2 मेलबॉक्स, स्नूज़ और रिमाइंडर',
          snack: '1 मेलबॉक्स और बुनियादी फ़िल्टरिंग',
        },
        summary:
          'SaneBox मेल को फ़ोल्डरों में बाँटता है, और अपने सबसे ऊँचे प्लान पर ड्राफ़्ट और सारांश भी लिखता है। Fewmail पहले सब कुछ पढ़ता है और वे गिने-चुने फ़ैसले, जो सिर्फ़ आप ले सकते हैं, एक ही पेज पर रखता है।',
        them: {
          home: 'फ़िल्टर किए गए मेल का रोज़ का डाइजेस्ट',
          drafts: 'SaneDrafts, Dinner पर',
          followUps: 'SaneNoReplies',
          importance: 'गैर-ज़रूरी मेल SaneLater में जाते हैं',
          keepApp: 'फ़ोल्डरों के ज़रिए काम करता है',
          otherProviders: 'कोई भी IMAP या Exchange सर्वर',
          phone: 'आपके मेल ऐप के ज़रिए',
          rules: 'मेल को फ़ोल्डरों के बीच खिसकाकर सिखाना',
          snooze: 'Lunch से',
          summaries: 'SaneSummary, Dinner पर',
          unsubscribe: 'SaneBlackHole फ़ोल्डर',
        },
        verdict:
          'अगर आपका मेल Gmail से बाहर है और फ़ोल्डर काफ़ी हैं, तो SaneBox चुनें। अगर आप Gmail इस्तेमाल करते हैं और चाहते हैं कि ज़रूरी मेल पढ़े जाएँ, उनका सारांश बने और जवाब जाएँ, तो Fewmail चुनें।',
      },
      shortwave: {
        plans: {
          business: 'प्रति सीट',
          free: 'ज़्यादातर फ़ीचर और असिस्टेंट',
          max: 'प्रति सीट, सबसे ताक़तवर मॉडल',
          premier: 'प्रति सीट, ज़्यादा ताक़तवर मॉडल',
          pro: 'पूरा इतिहास, AI सर्च और लेखन',
        },
        summary:
          'Shortwave एक ईमेल क्लाइंट है, जिसमें एक AI असिस्टेंट है जिससे आप बात करते हैं। Fewmail एक एजेंट है जो पहले खुद पढ़ता है और आपसे सिर्फ़ वही पूछता है जो वह खुद तय नहीं कर सकता।',
        them: {
          ask: 'AI असिस्टेंट और सर्च',
          drafts: 'जब आप कहें',
          importance: 'स्प्लिट और बंडल',
          keepApp: 'आपके मेल ऐप की जगह लेता है',
          memory: 'AI मेमोरी',
          otherProviders: 'Gmail में फ़ॉरवर्ड करके',
          outlook: 'Microsoft 365 सपोर्ट नहीं',
          phone: 'iOS और Android ऐप',
          rules: 'AI फ़िल्टर, प्लान के हिसाब से 3 से 50',
          summaries: 'हर ईमेल के ऊपर',
          teams: 'साझा थ्रेड और कमेंट',
          unsubscribe: 'एक क्लिक में ब्लॉक के साथ',
        },
        verdict:
          'अगर आपको चैट असिस्टेंट वाला नया इनबॉक्स चाहिए, तो Shortwave चुनें। अगर आप उसी Gmail में, जिसे आप पहले से इस्तेमाल करते हैं, कम ईमेल देखना चाहते हैं, तो Fewmail चुनें।',
      },
      superhuman: {
        plans: {
          business:
            'प्रति सदस्य, सालाना बिलिंग पर $33। Auto Drafts और Ask AI जोड़ता है',
          enterprise: 'SSO और एडमिन कंट्रोल',
          starter: 'प्रति सदस्य, सालाना बिलिंग पर $25',
        },
        summary:
          'Superhuman आपको हर ईमेल तेज़ी से निपटाने में मदद करता है। Fewmail उन्हें आपके लिए निपटाता है और सिर्फ़ वही दिखाता है जिसे आपकी ज़रूरत है।',
        them: {
          ask: 'Ask AI, Business पर',
          drafts: 'Auto Drafts, Business पर',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox और Auto Labels',
          keepApp: 'आपके मेल ऐप की जगह लेता है',
          mcp: 'Business पर',
          phone: 'iOS और Android ऐप',
          rules: 'Custom Auto Labels, Business पर',
          spamShield: 'आपके प्रोवाइडर का फ़िल्टर',
          summaries: 'Auto Summarize',
          teams: 'साझा ड्राफ़्ट और कमेंट',
        },
        verdict:
          'अगर आप हर ईमेल को खुद, और तेज़ी से, देखना चाहते हैं, तो Superhuman चुनें। अगर आप उनमें से ज़्यादातर को देखना ही नहीं चाहते, तो Fewmail चुनें।',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'कई AI ईमेल टूल बस चैट बॉक्स वाला नया इनबॉक्स होते हैं: आप अब भी हर ईमेल खुद पढ़ते हैं, बस ऊपर एक सारांश के साथ। Fewmail उसी Gmail पर काम करने वाला AI एजेंट है जिसे आप पहले से इस्तेमाल करते हैं। यह पहले हर ईमेल पढ़ता है, आपके अंदाज़ में जवाब लिखता है और आपके सामने सिर्फ़ वे कुछ फ़ैसले लाता है जिनमें आपकी ज़रूरत है।',
        question: 'Fewmail दूसरे AI ईमेल असिस्टेंट से कैसे अलग है?',
      },
      {
        answer:
          'नहीं। Fewmail, Gmail के ऊपर काम करता है। इसका किया हर काम Gmail में भी दिखता है, और आप साथ में कोई भी Gmail ऐप इस्तेमाल करते रह सकते हैं।',
        question: 'क्या मुझे Gmail छोड़ना होगा?',
      },
      {
        answer:
          'आपके बिना कभी नहीं। जवाब आपकी कतार में तब तक इंतज़ार करते हैं जब तक आप उन्हें मंज़ूर न करें, और सिर्फ़ वे नियम जो आपने बनाए या रखे हैं, खुद आर्काइव, पढ़ा हुआ मार्क या अनसब्सक्राइब कर सकते हैं। उसका किया हर काम निपटाए गए में दर्ज होता है।',
        question: 'क्या यह खुद मेल भेज या हटा सकता है?',
      },
      {
        answer:
          'विषय, मुख्य भाग, सारांश और ड्राफ़्ट हमारे डेटाबेस में एन्क्रिप्ट रहते हैं। आपके मेल का इस्तेमाल कभी मॉडल ट्रेन करने में नहीं होता, और स्पैम शील्ड यूज़र्स के बीच सिर्फ़ कीड हैश साझा करती है, कभी पते या सामग्री नहीं।',
        question: 'मेरे मेल का क्या होता है?',
      },
      {
        answer: `हर नए खाते को ${trialDays} दिन का Pro मिलता है, बिना कार्ड। उसके खत्म होने पर आप बस Free पर रहते हैं; न कुछ हटाया जाता है, न कोई पैसा कटता है।`,
        question: 'ट्रायल के बाद क्या होता है?',
      },
      {
        answer:
          'ड्राफ़्ट उसी भाषा में लिखे जाते हैं जिसमें वह ईमेल है जिसका आप जवाब दे रहे हैं। ऐप, सारांश और Telegram बॉट पंद्रह भाषाओं में से आपकी चुनी हुई एक भाषा बोलते हैं।',
        question: 'यह कौन-सी भाषाएँ बोलता है?',
      },
      {
        answer:
          'फ़िलहाल Gmail और Google Workspace खाते। एक Fewmail में कई मेलबॉक्स जोड़ें, और उनका मेल उसी होम और इनबॉक्स में आता है।',
        question: 'कौन-से ईमेल खाते काम करते हैं?',
      },
    ],
    features: {
      description:
        'ईमेल के वे काम जिनमें पहले पूरी दोपहर निकल जाती थी, अब पीछे चुपचाप हो जाते हैं और ऐसी जगह दर्ज रहते हैं जहाँ आप उन्हें जाँच सकें।',
      items: {
        codes: {
          description:
            'ताज़ा कोड होम के ऊपर और अपने ईमेल के पास मिलता है, बिना कुछ खोले कॉपी करने को तैयार। मुफ़्त।',
          title: 'साइन-इन कोड',
        },
        subscriptions: {
          description:
            'इस महीने लिखने वाली हर मेलिंग लिस्ट, और आपने उसके कितने ईमेल सच में खोले। किसी से भी एक कुंजी में अनसब्सक्राइब। मुफ़्त।',
          title: 'मेलिंग लिस्ट',
        },
        ask: {
          description:
            'सादे शब्दों में कुछ भी पूछें और जवाब अपने ही मेल से पाएँ, उन ईमेल के साथ जिनसे वह आया।',
          title: 'अपने मेल से पूछें',
        },
        boards: {
          description:
            'पैसा, पेड सब्सक्रिप्शन, यात्राएँ, ऑर्डर: बताएँ कि क्या ट्रैक करना है और एजेंट उसे एक साल तक के मेल से चार्ट के साथ इकट्ठा करता है।',
          title: 'बोर्ड',
        },
        calendar: {
          description:
            'हर मेलबॉक्स का कैलेंडर एक ही जगह। ईमेल में सुझाई गई मीटिंग आपकी हाँ के बाद इवेंट बन जाती है।',
          title: 'कैलेंडर',
        },
        clearOut: {
          description:
            'पूरा बैकलॉग एक बार में बाहर, हर मेलबॉक्स में 50,000 ईमेल तक, सब एक ही लेबल के नीचे, ताकि एक क्लिक में हर ईमेल वापस आ सके। मुफ़्त।',
          title: 'इनबॉक्स साफ़ करें',
        },
        reading: {
          description:
            'दिन के न्यूज़लेटर का एक सारांश: विषय के हिसाब से ख़बरें, हर वाक्य अपने स्रोत से जुड़ा, और वे जो पूरे पढ़ने लायक हैं।',
          title: 'पढ़ना',
        },
        voice: {
          description:
            'अपने न्यूज़लेटर का सारांश सुनें। Telegram या WhatsApp में वॉइस मैसेज भेजें और एजेंट बोलकर जवाब देता है।',
          title: 'पढ़ने के बजाय सुनें',
        },
        wrapped: {
          description:
            'ईमेल में आपका महीना या साल: क्या आया, क्या निपटा, कितना समय वापस मिला। शेयर करने लायक, कभी किसी नाम के साथ नहीं।',
          title: 'ईमेल में आपका साल',
        },
      },
      label: 'और बाकी सब',
      title: 'बाकी सब कुछ, जो एक असिस्टेंट करता।',
    },
    footer: {
      legal: 'कानूनी',
      product: 'प्रोडक्ट',
      tagline:
        'वह AI ईमेल एजेंट जो आपका Gmail पढ़ता है और सिर्फ़ वही दिखाता है जिसे आपकी ज़रूरत है।',
      versus: (name: string) => `बनाम ${name}`,
    },
    gone: {
      emphasis: 'अब नहीं रहेंगी।',
      label: 'क्या चला जाता है',
      rows: [
        {
          fix: '“इनबॉक्स साफ़ करें” पूरा बैकलॉग एक बार में हटा देता है: पुराने विज्ञापन, पढ़ी हुई सूचनाएँ, वे लिस्ट जिन्हें आप कभी नहीं खोलते। एक क्लिक में हर ईमेल वापस आ जाता है।',
          problem: 'हज़ारों ईमेल जिन्हें कोई कभी नहीं पढ़ेगा।',
        },
        {
          fix: 'जवाब पहले से ड्राफ़्ट रहते हैं, आपके अंदाज़ में और उनकी भाषा में। मिलते-जुलते जवाब ⇧⏎ से एक साथ मंज़ूर होते हैं, फिर भी हर एक को आप जाँच सकते हैं।',
          problem: 'आधी रात को ईमेल का जवाब देना।',
        },
        {
          fix: 'एक कुंजी से अनसब्सक्राइब, जैसे कोई इंसान करता: एक क्लिक, अनसब्सक्राइब पेज या एक ईमेल। जो फिर भी लिखते रहें, वे पकड़े जाते हैं और स्पैम के लिए सुझाए जाते हैं।',
          problem: 'वे न्यूज़लेटर जिनके लिए आपने कभी साइन अप नहीं किया।',
        },
        {
          fix: 'दिन के न्यूज़लेटर विषय के हिसाब से एक सारांश बन जाते हैं, और पूरे पढ़ने लायक वाले बताए जाते हैं।',
          problem: 'वे न्यूज़लेटर जिन्हें आप पढ़ना चाहते थे।',
        },
        {
          fix: 'बदले हुए भुगतान विवरण, मिलते-जुलते डोमेन और जानी-पहचानी फ़िशिंग पर, आपके कुछ करने से पहले ही चेतावनी मिलती है।',
          problem: 'नए बैंक विवरण वाला एक इनवॉइस।',
        },
        {
          fix: 'भेजे गए मेल में किए गए वादे समय आने पर लौट आते हैं, और जिन थ्रेड का किसी ने जवाब नहीं दिया, उन पर फ़ॉलो-अप होता है।',
          problem: 'वह काम जिसका वादा किया और भूल गए।',
        },
        {
          fix: 'Telegram या WhatsApp पर सिर्फ़ ज़रूरी मेल आप तक पहुँचता है। बाकी पहले से छँटा हुआ होम पर इंतज़ार करता है, जब चाहें देख लें।',
          problem: 'डिनर के बीच भी मेल देखना, बस यूँ ही।',
        },
      ],
      title: 'ईमेल की वे परेशानियाँ जो अब नहीं रहेंगी।',
    },
    hero: {
      needs: {
        emphasis: 'आपकी ज़रूरत है।',
        lead: (handled: string) =>
          `Anna कॉन्ट्रैक्ट का इंतज़ार कर रही हैं, Northwind का इनवॉइस अगले हफ़्ते देय है और Marco गुरुवार चाहते हैं। ${handled} न्यूज़लेटर और सूचनाएँ निपटा दी गईं, और नया मेल आते ही होम अपने आप अपडेट हो जाता है।`,
        tag: 'होम · गुरुवार, 08:12',
        title: 'तीन चीज़ों को आपकी ज़रूरत है।',
      },
      fates: {
        archived: 'आर्काइव किया',
        markedRead: 'पढ़ा हुआ मार्क किया',
        spam: 'स्पैम',
        summarised: 'सार बनाया',
        unsubscribed: 'अनसब्सक्राइब किया',
      },
      handled: ((slots) => [
        slots.count,
        ' निपटाए, हर एक की वजह के साथ',
      ]) as Rich<'count'>,
      inbox: 'इनबॉक्स',
      lead: 'न्यूज़लेटर, रसीदें, पिंग, एक फ़िशिंग लिंक, और इन्हीं में कहीं वे तीन ईमेल जो सच में मायने रखते हैं। Fewmail वह AI एजेंट है जो आपके लिए यह सब पढ़ता है।',
      needYou: ((slots) => [slots.count, ' को आपकी ज़रूरत']) as Rich<'count'>,
      queue: [
        {
          reason: 'कॉन्ट्रैक्ट कल तक',
          summary: 'शुक्रवार के किकऑफ़ से पहले साइन किया हुआ कॉन्ट्रैक्ट वापस चाहिए।',
        },
        {
          reason: 'इनवॉइस · $1,240, देय 20 नवंबर',
          summary:
            'वेबसाइट रीडिज़ाइन का अक्टूबर का इनवॉइस। बैंक विवरण पिछली बार जैसे ही हैं।',
        },
        {
          reason: 'मीटिंग का प्रस्ताव',
          summary:
            'गुरुवार 15:00 बजे का सुझाव। आप 16:00 से खाली हैं, इसलिए ड्राफ़्ट चार बजे के लिए पूछता है।',
        },
      ],
      reading: {
        emphasis: 'हर एक पढ़ता है।',
        lead: 'वह शोर को आर्काइव करता है, जो आप कभी नहीं खोलते उससे अनसब्सक्राइब करता है और धोखाधड़ी को दरवाज़े पर ही रोक देता है। हर काम उसकी वजह के साथ दर्ज होता है, ताकि आप जाँच सकें।',
        title: 'Fewmail हर एक पढ़ता है।',
      },
      remind: '19 नवंबर को याद दिलाएँ',
      remindPlan: 'इसे आपके बिलों में जोड़ता है और 19 नवंबर को याद दिलाता है।',
      start: 'Google के साथ मुफ़्त शुरू करें',
      title: 'ईमेल आपका काम नहीं है।',
      home: 'होम',
      tryQueue: 'कतार आज़माएँ',
      unread: ((slots) => [slots.count, ' अपठित']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        'आपके इनबॉक्स में ',
        slots.count,
        ' अपठित',
      ]) as Rich<'count'>,
      willDo: 'Fewmail करेगा',
    },
    nav: {
      assistant: 'AI ईमेल असिस्टेंट',
      compare: 'तुलना',
      features: 'फ़ीचर',
      mcp: 'MCP सर्वर',
      pricing: 'कीमत',
      signIn: 'साइन इन',
    },
    play: {
      again: 'फिर से साफ़ करें',
      doneLead: (handled: string) =>
        `आपने तीन फ़ैसले किए। बाकी ${handled} Fewmail ने संभाल लिए और वजह भी लिख दी।`,
      doneTitle: 'आज के लिए बस इतना ही।',
      emphasis: 'दो मिनट में।',
      handled: [
        'Lumen Weekly: पिछले 30 अंकों में से आपने एक भी नहीं खोला',
        'paypa1-billing.com, paypal.com जैसा दिखता है',
        'Parcelhub: डिलीवरी सूचनाएँ, नियम “रसीदें और शिपिंग” के तहत',
      ],
      handledTitle: 'आपके सोते समय निपटाए गए',
      label: 'आज़माकर देखें',
      lead: 'अब सुबह ऐसी दिखती है। ड्राफ़्ट लिखे हुए हैं, वजहें बताई हुई हैं, फ़ैसला आपका। चलिए, इसे साफ़ कीजिए।',
      left: (count: number) => `${count} पर फ़ैसला बाकी`,
      title: 'आपका पूरा इनबॉक्स, दो मिनट में।',
    },
    plans: {
      agent: 'एजेंट',
      emails: 'एजेंट हर महीने जितने ईमेल पढ़ता है',
      everyPlan: 'हर प्लान में',
      messages: 'या एजेंट को संदेश',
      oneAllowance:
        'एजेंट के हर काम के लिए एक ही कोटा: जितना इस्तेमाल, उतना भुगतान, और फालतू मेल कभी नहीं गिना जाता',
      forever: 'हमेशा के लिए',
      free: {
        description: 'होम, सॉर्टिंग, नियम और सुरक्षा। हमेशा के लिए।',
      },
      max: {
        description: 'व्यस्त इनबॉक्स के लिए वही एजेंट।',
      },
      monthly: 'मासिक',
      per: { month: 'प्रति माह', year: 'प्रति वर्ष' },
      lite: {
        description: 'पूरा एजेंट: पढ़ता है, लिखता है और याद रखता है।',
      },
      pro: {
        description: 'वही एजेंट, ज़्यादा मेल के लिए जगह के साथ।',
      },
      tryFree: (days: number) => `${days} दिन मुफ़्त आज़माएँ`,
      yearly: 'सालाना · 2 महीने मुफ़्त',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `होम, सॉर्टिंग, सादे शब्दों में नियम और सुरक्षा हमेशा के लिए मुफ़्त हैं। Pro वह एजेंट है जो आपके लिए पढ़ता, लिखता और याद रखता है; Max वही एजेंट है, व्यस्त इनबॉक्स के लिए ज़्यादा गुंजाइश के साथ। हर खाता ${trialDays} दिन के Pro से शुरू होता है, और उनके खत्म होने पर आप बस Free पर रहते हैं।`,
      otherTool: 'किसी दूसरे टूल के बारे में सोच रहे हैं?',
      title: 'इनबॉक्स के लिए नहीं, एजेंट के लिए भुगतान करें।',
    },
    startFree: 'मुफ़्त शुरू करें',
    trialNote: (days: number) =>
      `${days} दिन का Pro, बिना कार्ड। फिर जब तक चाहें, मुफ़्त।`,
    trust: {
      emphasis: 'पूछता है',
      label: 'आपका मेल, आपकी मर्ज़ी',
      places:
        'उसी Gmail के ऊपर काम करता है जिसे आप पहले से इस्तेमाल करते हैं, और आप तक यहाँ पहुँचता है:',
      title: 'कुछ करने से पहले यह पूछता है।',
      vows: [
        {
          description:
            'ड्राफ़्ट आपका इंतज़ार करते हैं। सिर्फ़ वे नियम जो आपने बनाए या रखे हैं, खुद आर्काइव, पढ़ा हुआ मार्क या अनसब्सक्राइब कर सकते हैं, और उनका किया हर काम निपटाए गए में दर्ज होता है।',
          title: 'आपकी हाँ के बिना कुछ नहीं भेजा जाता।',
        },
        {
          description:
            'विषय, मुख्य भाग, सारांश और ड्राफ़्ट हमारे डेटाबेस में एन्क्रिप्ट रहते हैं। सेव किए गए ड्राफ़्ट Gmail में रहते हैं, हमारे पास कभी नहीं।',
          title: 'स्टोरेज में एन्क्रिप्टेड।',
        },
        {
          description:
            'स्पैम शील्ड कीड हैश के ज़रिए सबसे सीखती है। आपके मेल का न एक पता साझा होता है, न एक शब्द।',
          title: 'कभी मॉडल ट्रेन करने में इस्तेमाल नहीं।',
        },
      ],
    },
  },
  skills: {
    bills: 'बकाया बिल और भुगतान',
    cancel: 'पेड सब्सक्रिप्शन रद्द करें',
    cleanup: 'हटाने लायक न्यूज़लेटर',
    followups: 'किसने अब तक जवाब नहीं दिया',
    reading: 'दिन के न्यूज़लेटर एक सारांश में',
    today: 'आज आपको क्या देखना है',
    waiting: 'कौन आपके जवाब का इंतज़ार कर रहा है',
    week: 'मेल में आपका हफ़्ता',
  },
  snooze: {
    laterToday: 'आज बाद में',
    nextWeek: 'अगले हफ़्ते',
    title: 'स्नूज़',
    tomorrow: 'कल',
    unsnooze: 'इनबॉक्स में वापस',
    until: (date: string) => `${date} तक स्नूज़`,
    weekend: 'इस वीकेंड',
  },
  spam: {
    reasonList: 'स्पैमर डोमेन की सार्वजनिक सूची में है',
    reasonPattern: {
      auth: 'भेजने वाले की पुष्टि विफल: पता नकली है',
      infra: 'ऐसे नेटवर्क से भेजा गया जिसे कई Fewmail यूज़र्स ने स्पैम बताया',
      link: 'ऐसी साइटों के लिंक जिन्हें कई Fewmail यूज़र्स ने स्पैम बताया',
      signals: 'नया डोमेन, अजीब पता और कमज़ोर पुष्टि एक साथ',
      template: 'वही टेक्स्ट जिसे कई Fewmail यूज़र्स ने स्पैम बताया',
    },
    reasonCommunity: 'कई Fewmail यूज़र्स ने इसे स्पैम बताया',
    reasonYou: 'आपने इस भेजने वाले को स्पैम बताया',
    suspect: 'स्पैम लगता है',
    imagesHidden: 'स्पैम में तस्वीरें छिपी रहती हैं।',
    openFile: {
      action: 'खोलें',
      description:
        'यह ईमेल स्पैम में है। इसकी फ़ाइलें तभी खोलें जब आपको भेजने वाले पर भरोसा हो।',
      title: (name: string) => `${name} खोलें?`,
    },
    showImages: 'तस्वीरें दिखाएं',
  },
  starterRules: {
    alwaysShow:
      'सुरक्षा अलर्ट, जिन बिलों की देय तिथि है, और मेरे बैंक या सरकार से आया कोई भी ईमेल',
    newsletters: 'न्यूज़लेटर और डाइजेस्ट',
    notifications: 'टूल और सेवाओं से आने वाली स्वचालित सूचनाएँ',
    promotions: 'प्रमोशन, मार्केटिंग और बिना माँगे सेल्स ईमेल',
    receipts: 'रसीदें, ऑर्डर और शिपिंग की पुष्टि',
  },
  telegram: {
    approveAlike: 'एक तरह के सभी कार्ड एक साथ मंज़ूर करें:',
    chatTaken:
      'यह चैट पहले से किसी दूसरे Fewmail खाते से जुड़ी है। पहले वहाँ Telegram डिस्कनेक्ट करें (सेटिंग्स → इंटीग्रेशन), फिर लिंक दोबारा खोलें।',
    queueChanged: 'इस बीच कार्ड बदल गए हैं। अभी इन पर आपकी ज़रूरत है:',
    heard: (text: string) => `सुना: “${text}”`,
    voiceFailed: 'मैं समझ नहीं पाया। फिर से कोशिश करें या टाइप करें।',
    help: 'लिखें या बोलें कि क्या चाहिए:\n• अपने मेल के बारे में पूछें: “Netflix कब रिन्यू होगा?”\n• बताएँ क्या जवाब देना है: “अन्ना को बताओ कि मैं कल साइन करूँगा”\n• कोई काम दें: “यात्राओं के लिए बोर्ड बनाओ”\n• बदलने के लिए मेरे किसी ड्राफ़्ट का जवाब दें',
    canceled: 'रद्द किया गया। ड्राफ़्ट वापस आपकी कतार में है।',
    sendingIn: (seconds: number) => `${seconds} सेकंड में भेजा जाएगा`,
    undo: 'पहले जैसा करें',
    commands: { queue: 'जिसे आपकी ज़रूरत है' },
    connectFirst: (url: string) =>
      `नमस्ते! मैं Fewmail हूँ। यहाँ Telegram में मैं ज़रूरी मेल आने पर बताता हूँ, दिखाता हूँ कि किस पर आपकी ज़रूरत है, और आपके मंज़ूर किए जवाब भेजता हूँ।\n\nयह चैट अभी आपके Fewmail से नहीं जुड़ी है। बस एक मिनट लगेगा:\n1. Fewmail की सेटिंग्स खोलें: ${url}\n2. इंटीग्रेशन में “Telegram जोड़ें” पर टैप करें (यह Fewmail Pro का हिस्सा है)।\n3. Telegram आपको यहीं वापस लाएगा — Start दबाएँ, बस हो गया।`,
    connected:
      'जुड़ गया। कुछ ज़रूरी आते ही मैं आपको बताऊँगा।\n\n/queue: जिसे आपकी ज़रूरत है',
    done: 'हो गया',
    draft: 'ड्राफ़्ट:',
    edit: 'बदलें',
    editPrompt:
      'इसकी जगह इस्तेमाल होने वाला टेक्स्ट भेजें, या “/” से शुरू करके बताएँ कि कैसे बदलना है, जैसे “/ज़्यादा औपचारिक”।',
    newDraft: 'नया ड्राफ़्ट:',
    nothing: 'अभी किसी चीज़ को आपकी ज़रूरत नहीं है।',
    proOnly:
      'Telegram, Fewmail Pro का हिस्सा है। अपग्रेड करने के लिए Fewmail में सेटिंग्स → प्लान खोलें।',
    draftClipped:
      'यहाँ छोटा करके दिखाया है। “भेजें” पूरा ड्राफ़्ट भेजता है। उसे Fewmail में पढ़ें।',
    rewriting: 'दोबारा लिखा जा रहा है…',
    send: 'भेजें',
    sendThis: 'यही भेजें',
    shorter: 'छोटा करें',
    skip: 'छोड़ें',
    skipped: 'छोड़ा गया',
    somethingWrong: 'कुछ गड़बड़ हो गई',
    urgent: 'ज़रूरी',
    willSend: 'यह भेजा जाएगा:',
  },
  today: {
    working: 'काम चल रहा है…',
    allKinds: 'सभी',
    ruleOffer: {
      lead: 'एजेंट मिलते-जुलते ईमेल के लिए यह खुद कर सकता है। जब तक आप हाँ नहीं कहते, यह बंद रहेगा।',
      no: 'बंद रहने दें',
      turnedOn: 'चालू हो गया। नियमों में बदलें।',
      yes: 'चालू करें',
    },
    newSender: {
      archive: 'हमेशा आर्काइव करें',
      archived: 'इस भेजने वाले के नए मेल आर्काइव होंगे। इसे नियम में बदल सकते हैं।',
      keep: 'पहले जैसा रखें',
      label: 'नया भेजने वाला',
      lead: (count: number, opened: number) =>
        `दो हफ़्तों में ${count} मेल, ${opened === 0 ? 'एक भी नहीं खोला' : `${opened} खोले`}`,
    },
    readingNow: (total: number) =>
      plural('hi', total, {
        one: (n) => `एजेंट ${n} नया मेल पढ़ रहा है`,
        other: (n) => `एजेंट ${n} नए मेल पढ़ रहा है`,
      }),
    allDone: 'सब हो गया। आपके लिए कुछ बाकी नहीं।',
    allDoneLead: 'मैं नए मेल पढ़ता रहूँगा, और जिस पर आपका ध्यान चाहिए, वह यहाँ दिखेगा।',
    byRules: (n: number) => `आपके नियमों ने ${n} संभाल लिए।`,
    decisions: 'फ़ैसले',
    journal: {
      approved: 'आपने हाँ कहा',
      byRule: (rule: string) => `आपका नियम: ${rule}`,
      failed: 'नहीं हो पाया',
      lead: 'पिछले 7 दिन। आपके मेल, कैलेंडर या बोर्ड में हर बदलाव आपकी हाँ से या आपके चालू किए गए नियम से हुआ।',
      title: 'आपके मेल में क्या हुआ',
    },
    progress: (done: number, total: number) => `${total} में से ${done}`,
    readAll: 'मैंने हर एक पढ़ा, और आपकी हाँ के बिना आपके मेल में कुछ नहीं बदलता।',
    worthKnowing: 'जानने लायक',
    quick: 'झटपट',
    needsLook: 'खुद देखें',
    tidy: {
      failed: (emails: string) =>
        `Gmail ने बदलाव नहीं माना: ${emails}। थोड़ी देर में फिर कोशिश करें।`,
      confirm: (emails: string) => `${emails} समेटें?`,
      running: 'समेटा जा रहा है…',
      unsubscribeHint:
        'इनमें कुछ मेलिंग लिस्ट हैं जिन्हें Fewmail छोड़ देगा, और इसे वापस नहीं लिया जा सकता।',
      archive: (n: number) => `आर्काइव करने को: ${n}`,
      review: 'जांचें',
      reviewLead:
        'हर ईमेल, साथ में एजेंट क्या करेगा और क्यों। जो सही लगे उसे मंज़ूर करें, जो जैसा है वैसा रहना चाहिए उसे रखें।',
      reviewTitle: 'एजेंट के सुझाव जांचें',
      done: (n: number) => `समेटे गए: ${n}`,
      keep: 'रहने दें',
      mark_read: (n: number) => `पढ़ा हुआ करने को: ${n}`,
      run: 'सब मंज़ूर करें',
      total: (n: number) => `एजेंट ने इन्हें समेटने का सुझाव दिया: ${n} ईमेल`,
      unsubscribe: (n: number) => `अनसब्सक्राइब करने को: ${n}`,
      untilYouApprove: 'आपकी मंज़ूरी तक आपके मेल में कुछ नहीं बदलता',
      spam: (n: number) => `स्पैम में: ${n}`,
      trash: (n: number) => `हटाने को: ${n}`,
    },
    pauseListening: 'रोकें',
    resumeListening: 'जारी रखें',
    awaiting: 'जवाब का इंतज़ार',
    hint: {
      messengers: {
        lead: 'ज़रूरी मेल पाएँ और ड्राफ़्ट मंज़ूर करें, उसी मैसेंजर में जो आप पहले से इस्तेमाल करते हैं।',
        title: 'Telegram या WhatsApp',
      },
      notNow: 'अभी नहीं',
      setUp: 'सेट अप करें',
      turnOn: 'चालू करें',
    },
    dates: 'तारीखें और मीटिंग',
    done: 'हो गया',
    firstRead:
      'पहले आपके पिछले तीन दिनों के मेल। जिस पर आपका ध्यान चाहिए, वह यहाँ अपने आप दिखेगा, और आपकी हाँ के बिना कुछ नहीं बदलेगा।',
    approvedMany: (n: number) => `${n} मंज़ूर`,
    listen: 'सुनें',
    handled: {
      spam: (n: number) => `${n} स्पैम में`,
      archived: (n: number) => `${n} आर्काइव किए`,
      markedRead: (n: number) => `${n} पढ़े हुए मार्क किए`,
      review: 'देखें',
      total: (n: number) => `${n} निपटाए`,
      unsubscribed: (n: number) => `${n} अनसब्सक्राइब किए`,
    },
    headline: (total: number) =>
      total === 0
        ? 'सब शांत है।'
        : plural('hi', total, {
            one: () => 'एक चीज़ को आपकी ज़रूरत है।',
            other: (n) => `${n} चीज़ों को आपकी ज़रूरत है।`,
          }),
    nothingNeedsYou:
      'अभी किसी चीज़ को आपकी ज़रूरत नहीं है। नया मेल आते ही पढ़ लिया जाता है।',
    period: (days: number) =>
      days === 1 ? 'पिछले दिन में' : `पिछले ${days} दिनों में`,
    pulse: {
      lists: (n: number) => `${n} मेलिंग लिस्ट से`,
      people: (n: number) => `${n} लोगों से`,
      total: (n: number, period: string) => `${period} ${n} ईमेल`,
    },
    saved: (minutes: number) =>
      `इस हफ़्ते Fewmail ने आपके लगभग ${formatMinutes('hi', minutes)} बचाए`,
    recent: (period: string) => `${period} और`,
    sent: 'भेजा गया',
    codes: 'साइन-इन कोड',
    worthAttention: 'ध्यान देने लायक',
  },
  boards: {
    chartRemoved: 'चार्ट हटाया गया',
    addTo: 'बोर्ड में जोड़ें',
    added: (board: string) => `${board} में जोड़ा गया`,
    cancel: 'रद्द करें',
    chart: {
      add: 'चार्ट जोड़ें',
      ask: 'चार्ट के बारे में बताएँ',
      askPlaceholder: 'हर दुकान पर खर्च, स्थिति के हिसाब से ऑर्डर…',
      currency: 'मुद्रा',
      edit: 'चार्ट सेटिंग्स',
      empty: 'अभी दिखाने को कुछ नहीं',
      groupBy: 'किसके हिसाब से',
      groupings: {
        group: 'कौन या क्या',
        month: 'महीना',
        status: 'स्थिति',
        week: 'हफ़्ता',
      },
      measure: 'दिखाता है',
      measures: { count: 'गिनती', sum: 'कुल राशि' },
      moveEarlier: 'पहले ले जाएँ',
      moveLater: 'बाद में ले जाएँ',
      other: 'अन्य',
      remove: 'चार्ट हटाएँ',
      skipped: (n: number) => `नहीं गिना गया: ${n} दूसरी मुद्रा में या बिना राशि के`,
      title: 'चार्ट का नाम',
      type: 'चार्ट का प्रकार',
      types: {
        area: 'एरिया',
        bar: 'बार',
        line: 'लाइन',
        pie: 'पाई',
      },
      untitled: 'नया चार्ट',
      weekOf: (date: string) => `${date} से शुरू सप्ताह`,
    },
    charts: 'चार्ट',
    create: 'बोर्ड बनाएँ',
    delete: 'बोर्ड हटाएँ',
    deleteConfirm: (name: string) => `“${name}” हटाएँ?`,
    deleteHint: 'इसकी एंट्री और चार्ट भी हट जाएँगे। आपके मेल जहाँ हैं, वहीं रहेंगे।',
    describe: 'क्या इकट्ठा करना है, बदलें',
    description: 'क्या इकट्ठा करना है',
    descriptionPlaceholder:
      'यात्राएँ: फ़्लाइट, होटल और किराये की कार, उनकी कीमत के साथ',
    due: (when: string) => `आगे: ${when}`,
    empty: 'अभी खाली है। मिलते-जुलते ईमेल आते ही यहाँ दिखेंगे।',
    entries: (total: number) =>
      plural('hi', total, { one: () => 'एक एंट्री', other: (n) => `${n} एंट्री` }),
    entry: {
      edited: 'आपने बदला',
      nextOn: (date: string) => `अगली ${date}`,
      remove: 'इस बोर्ड का नहीं',
      removed: 'बोर्ड से हटा दिया। आगे से इसका ध्यान रखेगा।',
    },
    expected: (when: string) => `अपेक्षित ${when}`,
    filter: {
      clear: 'फ़िल्टर हटाएँ',
      nothing: 'कोई एंट्री मेल नहीं खाती।',
      search: 'एंट्री खोजें',
    },
    groups: {
      every: {
        month: 'हर महीने',
        quarter: 'हर तिमाही',
        week: 'हर हफ़्ते',
        year: 'हर साल',
      },
      expected: (date: string) => `अपेक्षित ${date}`,
      next: (date: string) => `अगली ${date}`,
      perMonth: (amount: string) => `${amount} / महीना`,
      rename: 'समूह का नाम बदलें',
      renameHint: 'इसे किसी दूसरे समूह का नाम दें, तो दोनों मिल जाएँगे।',
      showAll: (n: number) => `सभी ${n} दिखाएँ`,
      showFewer: 'कम दिखाएँ',
      title: 'कौन या क्या के हिसाब से',
    },
    history: {
      capped: (n: number) => `अवधि के ${n} सबसे नए मिलते-जुलते ईमेल पढ़े गए।`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'चुनी गई अवधि के मेल देख रहा हूँ…'
          : `${plural('hi', found, { one: () => 'एक ईमेल', other: (n) => `${n} ईमेल` })} पढ़ रहा हूँ · अब तक ${plural('hi', entries, { one: () => 'एक एंट्री', other: (n) => `${n} एंट्री` })}`,
    },
    menu: 'बोर्ड के विकल्प',
    moveDown: 'नीचे ले जाएँ',
    moveUp: 'ऊपर ले जाएँ',
    name: 'नाम',
    namePlaceholder: 'यात्राएँ',
    new: 'नया बोर्ड',
    newHint:
      'अपने शब्दों में बताएँ क्या इकट्ठा करना है। Fewmail आपकी चुनी अवधि तक के मेल में उसे ढूँढेगा, चार्ट चुनेगा और बोर्ड को अपडेट रखेगा।',
    period: 'अवधि',
    periods: {
      1: 'पिछला दिन',
      7: 'पिछला हफ़्ता',
      30: 'पिछला महीना',
      90: 'पिछले 3 महीने',
      180: 'पिछले 6 महीने',
      365: 'पिछला साल',
    },
    planning: 'तैयार कर रहा हूँ…',
    redescribe: 'सहेजें और फिर से पढ़ें',
    redescribeHint:
      'नए विवरण के साथ बोर्ड की अवधि फिर से पढ़ी जाएगी। आपकी बदली या हटाई गई एंट्री वैसी ही रहेंगी।',
    rename: 'बोर्ड का नाम बदलें',
    save: 'सहेजें',
    settings: {
      bannerDays: 'तारीख से पहले सूचना',
      days: (n: number) =>
        plural('hi', n, {
          one: () => '1 दिन पहले',
          other: (count) => `${count} दिन पहले`,
        }),
      hint: 'बोर्ड कितना पीछे तक इकट्ठा करे और किसी तारीख़ से कितने दिन पहले आपको बताए।',
      never: 'कभी नहीं',
      title: 'बोर्ड सेटिंग्स',
    },
    starter: {
      events: {
        description: 'टिकट, बुकिंग और अपॉइंटमेंट: मुझे कहाँ, कब और किसके साथ होना है।',
        name: 'इवेंट',
      },
      health: {
        description:
          'डॉक्टर की मुलाक़ातें, पर्चे, जाँच रिपोर्ट और बीमा क्लेम: किससे मिला, कब और कितना खर्च हुआ।',
        name: 'सेहत',
      },
      home: {
        description:
          'किराया, बिजली-पानी के बिल, मरम्मत और घर के अनुबंध: क्या देना है, किसे और कितना।',
        name: 'घर',
      },
      invoices: {
        description:
          'काम के लिए भेजे और मिले इनवॉइस: क्लाइंट या सप्लायर, रकम, नियत तारीख और भुगतान हुआ या नहीं।',
        name: 'इनवॉइस',
      },
      jobs: {
        description:
          'आवेदन, इंटरव्यू और ऑफ़र: कौन-सी कंपनी, कौन-सा पद और हर एक कहाँ तक पहुँचा।',
        name: 'नौकरी की तलाश',
      },
      learning: {
        description:
          'कोर्स, क्लास और स्कूल या कॉलेज के मेल: डेडलाइन, ग्रेड, सर्टिफ़िकेट और उनकी लागत।',
        name: 'पढ़ाई',
      },
      money: {
        description:
          'भुगतान, सब्सक्रिप्शन, बिल और रिफ़ंड: मैं किस चीज़ के लिए, किसे, कितना देता हूँ और अगला नवीनीकरण कब है।',
        name: 'वित्त',
      },
      orders: {
        description:
          'ऑनलाइन ऑर्डर और डिलीवरी: मैंने क्या खरीदा, किससे और वह अभी कहाँ है।',
        name: 'ऑर्डर',
      },
      trips: {
        description:
          'फ़्लाइट, ट्रेन, होटल और किराये: मैं कहाँ जा रहा हूँ, कब और कितना खर्च होगा।',
        name: 'यात्राएँ',
      },
    },
    summary: {
      lastMonth: 'पिछला महीना',
      perMonth: (amount: string) => `${amount} हर महीने`,
      recurring: (n: number) =>
        plural('hi', n, {
          one: () => 'एक नियमित',
          other: (count) => `${count} नियमित`,
        }),
      thisMonth: 'इस महीने',
      upcoming: 'अगले 30 दिन',
    },
  },
  bulk: {
    badge: (n: number) => `${n}+ Fewmail उपयोगकर्ताओं को भेजा गया`,
    reason: (n: number) => `बल्क ईमेल: ${n}+ Fewmail उपयोगकर्ताओं को यही टेक्स्ट मिला`,
  },
  cleanup: {
    emails: (total: number) =>
      plural('hi', total, {
        one: () => '1 ईमेल',
        other: (n) => `${n} ईमेल`,
      }),
    reason: (total: number) => `इस महीने ${total} ईमेल, एक भी नहीं खोला`,
    title: (total: number) =>
      plural('hi', total, {
        one: () => 'वह न्यूज़लेटर बंद करें जिसे आप कभी नहीं खोलते',
        other: (n) => `वे ${n} न्यूज़लेटर बंद करें जिन्हें आप कभी नहीं खोलते`,
      }),
  },
  clearOut: {
    partial:
      'Gmail ने सफ़ाई का कुछ हिस्सा रोक दिया। जो पहले ही हट चुका है, वह वापस आ सकता है।',
    groups: {
      lists: 'न्यूज़लेटर जिन्हें आप कभी नहीं खोलते',
      notifications: 'पढ़ी हुई सूचनाएँ, एक महीने से पुरानी',
      old: 'एक साल से पुराना सब कुछ',
      promotions: 'विज्ञापन और सोशल, 3 दिन से पुराने',
    },
    done: (emails: string) => `${emails} साफ़ किए गए`,
    empty: 'साफ़ करने को कुछ नहीं: इनबॉक्स पहले से व्यवस्थित है।',
    lead: (emails: string) => `इनबॉक्स में ${emails} हैं। ये हटाए जा सकते हैं।`,
    leadCapped: (emails: string) =>
      `इनबॉक्स में ${emails} से ज़्यादा हैं। ये हटाए जा सकते हैं।`,
    left: (emails: string) => `इनबॉक्स में ${emails} रहेंगे`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} और ${more} और` : names,
    run: (emails: string) => `${emails} साफ़ करें`,
    safe: 'कुछ भी डिलीट नहीं होता। साफ़ किए गए ईमेल Fewmail/Cleared लेबल के साथ आर्काइव होते हैं और एक क्लिक में वापस आते हैं; न्यूज़लेटर से सदस्यता भी हटाई जाती है।',
    scanning: 'पूरा इनबॉक्स पढ़ रहा हूँ, सिर्फ़ हेडर। एक मिनट तक।',
    title: 'इनबॉक्स साफ़ करें',
    undo: 'सब वापस लाएँ',
    undone: (emails: string) => `${emails} फिर से इनबॉक्स में`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `सबसे व्यस्त दिन: ${day} · सबसे व्यस्त घंटा: ${hours}`,
    copied: 'लिंक कॉपी हो गया',
    copyLink: 'लिंक कॉपी करें',
    cta: 'Fewmail के साथ अपना पाएँ',
    emails: 'ईमेल आए',
    empty: 'कहानी के लिए अभी पर्याप्त ईमेल नहीं हैं। कुछ दिनों में फिर आएँ।',
    handled: 'Fewmail ने ख़ुद संभाले',
    people: 'सबसे ज़्यादा किसने लिखा',
    period: { month: 'यह महीना', year: 'यह साल' },
    replies: 'जवाब Fewmail ने लिखे और भेजे गए',
    saveImage: 'तस्वीर सहेजें',
    saved: 'Fewmail ने बचाए',
    shareNote: 'लिंक और तस्वीर में सिर्फ़ ये आँकड़े दिखते हैं, कभी नाम या पते नहीं।',
    shared: { month: 'ईमेल में एक महीना', year: 'ईमेल में एक साल' },
    spam: 'स्पैम ईमेल रोके',
    split: (people: string, lists: string, other: string) =>
      `${people} लोगों से · ${lists} न्यूज़लेटर से · ${other} अन्य`,
    title: { month: 'ईमेल में आपका महीना', year: 'ईमेल में आपका साल' },
    unsubscribed: 'न्यूज़लेटर छोड़े',
  },
  reading: {
    markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    summary: 'आपके न्यूज़लेटर में क्या था',
    worth: 'पूरा पढ़ने लायक',
    leftOut: (n: number) => `सारांश से बाहर: ${n}, इनमें कुछ नया नहीं।`,
    note: {
      inSummary: 'सारांश में',
      leftOut: 'छोड़ा गया',
    },
    digest: (n: number) => `न्यूज़लेटर: ${n}`,
    lead: 'एक दिन के न्यूज़लेटर एक जगह, ताकि इनबॉक्स न भरे।',
    issues: 'सभी अंक',
    title: 'पढ़ना',
  },
  commitments: {
    title: 'आपने वादा किया',
  },
  people: {
    firstContact: (date: string) => `${date} से संपर्क में`,
    lastContact: (date: string) => `आखिरी ईमेल ${date}`,
    open: 'दूसरी बातचीत में बाकी',
    promised: 'आपने वादा किया',
    threads: (total: number) =>
      plural('hi', total, {
        one: () => '1 बातचीत',
        other: (n) => `${n} बातचीत`,
      }),
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} सक्रिय फ़िशिंग साइटों की सार्वजनिक सूची में है। लिंक न खोलें, साइन इन न करें और भुगतान न करें।`,
    lookalike_domain: (domain: string) =>
      `यह ${domain} जैसा दिखता है, पर यह अलग पता है। लिंक पर क्लिक न करें और भुगतान न करें।`,
    new_sender_payment: (domain: string) =>
      `${domain} से पहला ईमेल है और इसमें पैसे माँगे गए हैं। किसी भरोसेमंद तरीके से पुष्टि करें।`,
    spoofed_sender: (domain: string) =>
      `${domain} से होने का दावा है, लेकिन ${domain} ने इसे नहीं भेजा। लिंक पर क्लिक न करें और भुगतान न करें।`,
    payment_change: (domain: string) =>
      `${domain} से नए भुगतान विवरण आए हैं। भुगतान से पहले फ़ोन पर पुष्टि करें।`,
    title: 'कुछ करने से पहले जाँच लें',
  },
  upgrade: {
    ask: 'अपने मेल से पूछें',
    hints: {
      ask: 'Fewmail Pro का हिस्सा: अपने शब्दों में कुछ भी पूछें और जवाब अपने ही मेल से पाएँ।',
      boards:
        'Fewmail Pro का हिस्सा: बताएँ क्या इकट्ठा करना है, एजेंट उसे आपके मेल में ढूँढेगा और अपडेट रखेगा।',
      drafts:
        'Fewmail Pro का हिस्सा: एजेंट आपकी शैली में जवाब लिखेगा, आप उसे बदलकर भेज दें।',
    },
  },
  whatsapp: {
    phoneTaken:
      'यह नंबर पहले से किसी दूसरे Fewmail खाते से जुड़ा है। पहले वहाँ WhatsApp डिस्कनेक्ट करें (सेटिंग्स → इंटीग्रेशन), फिर मैसेज दोबारा भेजें।',
    connectFirst: (url: string) =>
      `नमस्ते! मैं Fewmail हूँ। यहाँ WhatsApp में मैं ज़रूरी मेल आने पर बताता हूँ, दिखाता हूँ कि किस चीज़ को आपकी ज़रूरत है, और आपके मंज़ूर किए जवाब भेजता हूँ।\n\nयह नंबर अभी आपके Fewmail से नहीं जुड़ा है। बस एक मिनट लगेगा:\n1. Fewmail की सेटिंग्स खोलें: ${url}\n2. इंटीग्रेशन में “WhatsApp जोड़ें” पर टैप करें (यह Fewmail Pro का हिस्सा है)।\n3. WhatsApp एक तैयार संदेश के साथ खुलेगा — उसे भेज दें, बस।`,
    connected:
      'जुड़ गया। कुछ ज़रूरी आने पर मैं संदेश करूँगा। किसी भी ईमेल का जवाब देने के लिए टेक्स्ट या वॉइस मैसेज भेजें।',
    proOnly:
      'WhatsApp, Fewmail Pro का हिस्सा है। अपग्रेड करने के लिए Fewmail में सेटिंग्स → प्लान खोलें।',
  },
  zombie: {
    badge: (share: number) => `${share}% लोगों के अनसब्सक्राइब को अनदेखा करता है`,
    reason: 'अनसब्सक्राइब के बाद भी ईमेल भेजता रहा',
  },
}
