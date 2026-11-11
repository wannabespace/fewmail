import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const tr: Messages = {
  actionKind: {
    cleanup: 'Hepsinden çık',
    commitment: 'Tamam',
    security: 'Kontrol ettim',
    subscription: 'Anladım',
    task: 'Gönder',
    spam: 'Spama taşındı',
    archive: 'Arşivle',
    follow_up: 'Takip et',
    mark_read: 'Okundu yap',
    pay: 'Öde',
    read: 'Oku',
    reply: 'Yanıtla',
    schedule: 'Planla',
    trash: 'Çöpe taşı',
    unsubscribe: 'Abonelikten çık',
  },
  actionStatus: {
    auto_done: 'ajan halletti',
    dismissed: 'atlandı',
    done: 'tamam',
    failed: 'başarısız',
    pending: 'Bugün’de bekliyor',
  },
  ask: {
    label: (question: string) => `Fewmail'e sor: “${question}”`,
    thinking: 'E-postalarına bakılıyor…',
  },
  byRule: 'bir kuralla',
  bulk: {
    badge: (n: number) => `${n}+ Fewmail kullanıcısına gönderildi`,
    reason: (n: number) =>
      `Toplu e-posta: ${n}+ Fewmail kullanıcısı aynı metni aldı`,
  },
  category: {
    calendar: 'Takvim',
    finance: 'Finans',
    newsletter: 'Bülten',
    notification: 'Bildirim',
    other: 'Diğer',
    person: 'Kişi',
    promotion: 'Promosyon',
    receipt: 'Makbuz',
    security: 'Güvenlik',
    travel: 'Seyahat',
    work: 'İş',
  },
  cleanup: {
    emails: (total: number) => `${total} e-posta`,
    reason: (total: number) => `Bu ay ${total} e-posta, hiçbiri açılmadı`,
    title: (total: number) =>
      plural('tr', total, {
        one: () => 'Hiç açmadığın bir bültenden çık',
        other: (n) => `Hiç açmadığın ${n} bültenden çık`,
      }),
  },
  commitments: {
    title: 'Söz verdin',
  },
  compose: {
    backInQueue: 'İptal edildi. Taslak Bugün’e geri döndü.',
    canceled: 'İptal edildi. E-postan düzenleyiciye geri döndü.',
    cc: 'Bilgi',
    discard: 'Sil',
    forward: 'İlet',
    forwardedMessage: 'İletilen mesaj',
    from: 'Kimden',
    instructionPlaceholder: 'Nasıl olsun? (isteğe bağlı)',
    invalidRecipients: 'En az bir geçerli e-posta adresi ekle.',
    later: {
      inHour: 'Bir saat sonra',
      monday: 'Pazartesi sabahı',
      tomorrow: 'Yarın sabah',
    },
    new: 'Yeni e-posta',
    placeholder: 'E-postanı yaz…',
    remind: {
      days: (total: number) => `${total} gün içinde yanıt gelmezse hatırlat`,
      label: 'Hatırlat',
      off: 'Hatırlatma yok',
    },
    reply: 'Yanıtla',
    scheduledFor: (date: string) => `${date} için planlandı`,
    send: 'Gönder',
    sendLater: 'Sonra gönder',
    sendingIn: (seconds: number) => `${seconds} sn içinde gönderiliyor`,
    subject: 'Konu',
    to: 'Kime',
    undo: 'Geri al',
    writeForMe: 'Benim için yaz',
    writing: 'Yazılıyor…',
  },
  command: {
    compose: 'Yeni e-posta',
    agent: 'Ajan',
    appearance: 'Görünüm',
    checkMail: 'Yeni postaları kontrol et',
    goTo: 'Git',
    inboxUpToDate: 'Gelen kutusu güncel',
    mail: 'Posta',
    nothingMatches: 'Eşleşen bir şey yok.',
    placeholder: 'Postalarda ara veya komut çalıştır…',
    rewriteBrief: 'Özeti yeniden yaz',
    searchFor: (query: string) => `Postalarda “${query}” ara`,
    teachRule: 'Yeni kural öğret',
    upgrade: "Pro'ya geç",
    theme: {
      dark: 'Koyu tema',
      light: 'Açık tema',
      system: 'Sistem temasını kullan',
    },
  },
  composer: {
    acceptSuggestion: 'Kabul için Tab',
    bold: 'Kalın',
    bulletList: 'Madde işaretli liste',
    italic: 'İtalik',
    link: 'Bağlantı',
    linkPlaceholder: 'Bağlantı yapıştır veya yaz',
    noSnippets: 'Eşleşen parça yok.',
    removeLink: 'Bağlantıyı kaldır',
  },
  importance: ['Gürültü', 'Bilmeye değer', 'Yakında seni bekliyor', 'Acil'],
  keys: {
    reply: 'yanıtla',
    snooze: 'ertele',
    anything: 'her şey',
    approve: 'onayla',
    archive: 'arşivle',
    close: 'kapat',
    draftReply: 'taslak yanıt',
    edit: 'düzenle',
    move: 'gezin',
    open: 'aç',
    search: 'ara',
    send: 'gönder',
    skip: 'atla',
    stopEditing: 'düzenlemeyi bitir',
  },
  legal: {
    privacy: 'Gizlilik Politikası',
    englishOnly:
      'Bu belge İngilizce olarak sunulmaktadır; bağlayıcı sürüm İngilizce olandır.',
    terms: 'Hizmet Koşulları',
    updated: (date: string) => `Son güncelleme: ${date}`,
  },
  login: {
    agree: ((slots) => [
      'Devam ederek ',
      slots.terms,
      ' ve ',
      slots.privacy,
      ' metinlerini kabul etmiş olursun.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail, Gmail’ini senin için okumak, düzenlemek ve göndermek için izin ister. İzin veren bir kural yazmadığın sürece senin onayın olmadan hiçbir şey gönderilmez ve arşivlenmez.',
    continue: 'Google ile devam et',
    lead: 'Fewmail gelen kutunu senin yerine okur, senin üslubunla yanıtlar ve sadece gerçekten seni bekleyenleri gösterir.',
    messengers:
      'Mesajlaşma uygulamalarında da çalışır, ilk olarak Telegram’da: özeti al, yanıtları onayla ya da sadece sesli mesaj gönder.',
    title: 'Yalnızca önemli olan.',
  },
  mail: {
    block: 'Göndereni engelle',
    blocked: 'Engellendi. E-postaları artık çöpe gidiyor.',
    forward: 'İlet',
    more: 'Daha fazla',
    reply: 'Yanıtla',
    trash: 'Çöpe taşı',
    trashed: 'Çöpe taşındı',
    movedToInbox: 'Gelen kutusuna geri taşındı. Bildirdiğin için teşekkürler.',
    noThread: 'Burada okumak için bir e-posta seç',
    notSpam: 'Spam değil',
    reportSpam: 'Spam bildir',
    reportedSpam: 'Bildirildi. E-postaları artık spama gidiyor.',
    archive: 'Arşivle',
    archived: 'Arşivlendi',
    attachment: 'ek',
    draftReply: 'Yanıt taslağı',
    drafting: 'Yazılıyor…',
    draftWaiting: 'Taslak Bugün’de bekliyor',
    due: (date: string) => `son tarih ${date}`,
    empty: 'Burada e-posta yok.',
    expectsReply: 'Yanıt bekliyor',
    filter: {
      spam: 'Spam',
      inbox: 'Gelen',
      snoozed: 'Ertelenen',
      important: 'Önemli',
      needs_reply: 'Yanıt bekleyen',
      quiet: 'Sessiz',
    },
    instruction: 'Ajana nasıl yanıtlayacağını söyle ya da sadece Enter’a bas',
    open: 'Aç',
    search: "Ara ya da anlat: Anna'dan geçen ayki faturalar",
    openInGmail: "Gmail'de aç",
    unsubscribe: 'Abonelikten çık',
    unsubscribed: 'Abonelikten çıkıldı',
    unsubscribeFailed:
      'Bu gönderen tek tıkla abonelikten çıkmayı desteklemiyor, bu yüzden e-posta arşivlendi.',
    you: 'Sen',
  },
  money: {
    due: (date: string) => `Son ödeme ${date}`,
    empty:
      'Henüz bir şey yok. Fişler, faturalar ve abonelikler geldikçe burada görünür.',
    lastCharged: (date: string) => `Son ödeme alındı: ${date}`,
    lead: 'Fewmail’in fişlerinde ve faturalarında bulduğu her şey.',
    monthlyTotal: 'Aylık abonelik tutarı',
    period: { month: 'aylık', week: 'haftalık', year: 'yıllık' },
    priceUp: (merchant: string, from: string, to: string) =>
      `${merchant} artık ${to} (önceden ${from})`,
    priceUpTitle: (merchant: string) => `${merchant} zamlandı`,
    recent: 'Son alışverişler',
    subscriptions: 'Abonelikler',
    title: 'Para',
    upcoming: 'Yaklaşan ödemeler',
  },
  nav: {
    money: 'Para',
    mail: 'Posta',
    rules: 'Kurallar',
    search: 'Ara veya sor…',
    settings: 'Ayarlar',
    syncFailed: 'Gmail eşitlemesi başarısız, yeniden deneniyor',
    syncing: 'Gelen kutun okunuyor…',
    today: 'Bugün',
    trialLeft: (total: number) => `Pro denemesi · ${total} gün kaldı`,
    watching: 'Ajan gelen kutunu izliyor',
  },
  notifications: {
    many: (total: number) =>
      plural('tr', total, {
        other: (n) => `Fewmail’den ${n} yeni bildirim`,
      }),
  },
  onboarding: {
    languageHint:
      'Uygulama, özetler ve açıklamalar bu dili kullanır. Yanıtlar her zaman yanıtladığın e-postanın dilinde olur.',
    languageTitle: 'Fewmail hangi dili konuşsun?',
    lead: 'İki kısa cevap. Hepsini daha sonra Ayarlar’dan değiştirebilirsin.',
    personaTitle: 'E-postayı nasıl kullanıyorsun?',
    reading: 'Gelen kutun okunuyor…',
    start: 'Başla',
    title: 'Ajanını kuralım.',
  },
  plan: {
    free: 'Ücretsiz',
    freeDescription:
      'Basit kurallarla hızlı ve sakin e-posta. İstediğin kadar ücretsiz.',
    includes:
      'Pro, ajanı ekler: günlük özet, her e-postanın okunup özetlenmesi, senin üslubunla yazılan yanıt taslakları, sade sözcüklerle kurallar, Telegram ve MCP.',
    manage: 'Faturalandırmayı yönet',
    price: (usd: number) => `$${usd} / ay`,
    pro: 'Pro',
    proCancels: (date: string) => `${date} tarihine kadar Pro, sonra Ücretsiz.`,
    proRenews: (date: string) => `${date} tarihinde yenilenir.`,
    title: 'Plan',
    trial: 'Pro denemesi',
    trialDescription: (date: string) =>
      `${date} tarihine kadar tüm Pro özellikleri. Sonrasında Fewmail basit kurallarla ücretsiz kalır — kart gerekmez.`,
    upgrade: "Pro'ya geç",
    welcome: "Pro'ya hoş geldin. Ajan yeniden görevde.",
  },
  people: {
    firstContact: (date: string) => `${date} tarihinden beri yazışıyorsunuz`,
    lastContact: (date: string) => `Son e-posta ${date}`,
    open: 'Yazışmaları aç',
    promised: 'Söz verdin',
    threads: (total: number) => `${total} yazışma`,
  },
  persona: {
    reader: {
      description:
        'Çoğunlukla okurum. Gelen kutumu sakin tut, gürültüyü hallet ve önemli hiçbir şeyin gözden kaçmasına izin verme.',
      title: 'Çoğunlukla okurum',
    },
    responder: {
      description:
        'Çok yanıt yazarım. Beni bekleyenleri öne al ve yanıtları benim üslubumla taslak olarak hazırla.',
      title: 'Çok yanıt yazarım',
    },
  },
  queue: {
    draftedInVoice: 'Senin üslubunla yazıldı',
    edit: 'Düzenle',
    open: 'Aç',
    send: 'Gönder',
    shorter: 'Kısalt',
    shorterInstruction: 'Daha kısa yap.',
    skip: 'Atla',
  },
  reminders: {
    followUp: 'Takip et',
    noReply: 'Henüz yanıt yok',
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} etkin oltalama sitelerinin herkese açık listesinde. Bağlantılara tıklama, giriş yapma ve ödeme yapma.`,
    lookalike_domain: (domain: string) =>
      `${domain} gibi görünüyor ama farklı bir adres. Bağlantılara tıklama ve ödeme yapma.`,
    new_sender_payment: (domain: string) =>
      `${domain} adresinden ilk e-posta ve para istiyor. Zaten güvendiğin bir kanaldan doğrula.`,
    spoofed_sender: (domain: string) =>
      `${domain} adına geldiğini söylüyor ama ${domain} göndermedi. Bağlantılara tıklama, ödeme yapma.`,
    payment_change: (domain: string) =>
      `${domain} adresinden yeni ödeme bilgileri. Ödemeden önce telefonla teyit et.`,
    title: 'Harekete geçmeden önce kontrol et',
  },
  rules: {
    actWithoutAsking: 'Sormadan uygula',
    add: 'Kural ekle',
    count: (total: number) =>
      plural('tr', total, { other: (n) => `${n} kural` }),
    delete: 'Sil',
    describe: {
      alwaysShow: 'Her zaman Bugün’e düşer',
      autonomous: 'Kendiliğinden yapılır, halledilenlerde listelenir',
      draft: 'Bir taslak Bugün’de seni bekler',
      suggested: 'Bugün’de önerilir, sen onaylarsın',
    },
    effect: {
      always_show: 'Her zaman göster',
      archive: 'Arşivle',
      draft_reply: 'Yanıt taslağı hazırla',
      mark_read: 'Okundu olarak işaretle',
      trash: 'Çöpe taşı',
      unsubscribe: 'Abonelikten çık',
    },
    enabled: 'Kural etkin',
    lead: 'Ajana belirli postalarla ne yapacağını sade bir dille anlat. Her e-postayı yukarıdan aşağıya bu kurallarla karşılaştırır.',
    newTitle: 'Yeni kural öğret',
    leadFree:
      'Otomatik olarak arşivle, okundu olarak işaretle veya abonelikten çık. Kurallar yeni e-postalara geldiği anda uygulanır.',
    placeholder: 'örn. Hetzner faturaları veya LinkedIn bildirimleri',
    simple: {
      appliedAutomatically: 'Yeni e-postalara otomatik uygulanır',
      field: {
        from: 'Gönderen',
        mailingList: 'Herhangi bir e-posta listesi',
        subject: 'Konu şunu içerir',
      },
      title: {
        from: (value: string) => `Gönderen: “${value}”`,
        mailingList: () => 'Herhangi bir e-posta listesi',
        subject: (value: string) => `Konu “${value}” içerir`,
      },
      valuePlaceholder: 'anna@example.com, bir ad veya bir sözcük',
      whichField: 'Eşleştirme ölçütü',
    },
    title: 'Kurallar',
    whatAgentDoes: 'Ajan ne yapar',
    whichEmails: 'Hangi e-postalar',
    withoutAsking: 'Sormadan',
  },
  settings: {
    account: 'Hesap',
    agent: 'Ajan',
    briefDescription: (timezone: string) => `Senin saat diliminde, ${timezone}`,
    briefTitle: 'Günlük özet',
    deleteAccount: 'Hesabı sil',
    deleteConfirm: 'Her şeyi sil',
    deleteDescription:
      'Hesabını, eşitlenen postaları, taslakları, kuralları ve özetleri Fewmail’den hemen siler. Gmail’ine dokunulmaz.',
    deleteTitle: 'Fewmail hesabın silinsin mi?',
    cancel: 'İptal',
    integrations: 'Entegrasyonlar',
    knowledge: {
      description:
        'Fiyatlar, adresler, müsaitlik, nasıl yanıtlamayı sevdiğin. Agent bunu taslaklarda ve otomatik tamamlamada kullanır.',
      placeholder:
        'ör. Danışmanlık $150/h. Cuma günleri telefon görüşmesi yapmam. Adresim…',
      title: "Agent'ın bilmesi gerekenler",
    },
    labels: {
      description:
        'Telefonundaki Gmail aynı sırayı göstersin diye e-postaları Fewmail/… etiketlerine ayır.',
      title: "Gmail'de agent etiketleri",
    },
    language: 'Dil',
    languageDescription:
      'Uygulama, özetler ve açıklamalar. Yanıtlar e-postanın dilini izler.',
    legal: 'Yasal',
    mailboxes: {
      add: 'Gmail ekle',
      addDescription:
        'Başka bir Gmail hesabının postaları aynı Bugün ve gelen kutusuna gelir. Bu hesapla buraya kimse giriş yapamaz: onunla giriş yapmak ayrı bir Fewmail açar.',
      added: 'Posta kutusu eklendi. Postaları bir dakika içinde görünür.',
      failed:
        'Posta kutusu eklenemedi. Gmail erişimine izin verip tekrar deneyin.',
      lost: 'Gmail erişimi kesildi. Yeniden bağlamak için tekrar ekleyin.',
      reading: 'Postalar okunuyor…',
      remove: 'Kaldır',
      signIn: 'Bu hesapla giriş yapıyorsunuz',
      signInChosen: 'Bu, giriş yaptığınız hesap. Başka birini seçin.',
      synced: (ago: string) => `${ago} eşitlendi`,
      title: 'Posta kutuları',
    },
    mcp: {
      copyNow:
        'Bu yapılandırmayı şimdi kopyala: anahtar yalnızca bir kez gösterilir.',
      create: 'Anahtar oluştur',
      defaultName: 'MCP istemcisi',
      description:
        'Özetini ve postalarını okuyabilir, yanıt taslağı yazabilir ve sen onayladıktan sonra gönderebilirler.',
      keyName: 'Anahtar adı',
      neverUsed: 'Hiç kullanılmadı',
      revoke: 'İptal et',
      title: 'Claude, Cursor veya herhangi bir MCP istemcisini bağla',
      used: (ago: string) => `Son kullanım ${ago}`,
    },
    persona: 'E-postayı nasıl kullanıyorsun',
    signedInWithGoogle: 'Google ile giriş yapıldı',
    signOut: 'Çıkış yap',
    snippets: {
      add: 'Parça ekle',
      body: 'Metin',
      delete: 'Sil',
      description: 'Bir parçayı adıyla eklemek için düzenleyicide ; yaz.',
      name: 'Ad',
      title: 'Parçalar',
    },
    notifications: {
      blocked:
        'Bildirimler engellendi. Tarayıcının site ayarlarından izin ver.',
      browser: 'Bu tarayıcı',
      notConfigured: 'Tarayıcı bildirimleri bu sunucuda yapılandırılmamış.',
      off: 'Fewmail kapalıyken bile acil e-postaları ve günlük özeti burada al.',
      on: 'Acil e-postalar ve günlük özet burada görünür. Aynı anda gelenler tek bildirimde toplanır.',
      title: 'Bildirimler',
      unsupported: 'Bu tarayıcı bildirim gösteremiyor.',
    },
    telegram: {
      connect: 'Telegram’ı bağla',
      disconnect: 'Bağlantıyı kes',
      linked:
        'Özetin her sabah, acil postalar hemen gelir. Taslakları sohbetten onayla ve düzenle.',
      notConfigured: 'Telegram botu bu sunucuda yapılandırılmamış.',
      unlinked: 'Özeti al ve taslakları Telegram’dan onayla.',
    },
    whatsapp: {
      connect: 'WhatsApp’ı bağla',
      disconnect: 'Bağlantıyı kes',
      linked:
        'Özetin her sabah, acil postalar hemen gelir. Taslakları sohbetten onayla ve düzenle.',
      notConfigured: 'WhatsApp botu bu sunucuda yapılandırılmamış.',
      unlinked: 'Özeti al ve taslakları WhatsApp’tan onayla.',
    },
    title: 'Ayarlar',
  },
  snooze: {
    laterToday: 'Bugün daha sonra',
    nextWeek: 'Gelecek hafta',
    title: 'Ertele',
    tomorrow: 'Yarın',
    unsnooze: 'Gelen kutusuna dön',
    until: (date: string) => `${date} tarihine kadar ertelendi`,
    weekend: 'Bu hafta sonu',
  },
  spam: {
    reasonList: 'Herkese açık spam alan adı listesinde',
    reasonPattern: {
      auth: 'Gönderen doğrulaması başarısız: adres sahte',
      infra:
        'Birkaç Fewmail kullanıcısının spam olarak bildirdiği bir ağdan gönderildi',
      link: 'Birkaç Fewmail kullanıcısının spam olarak bildirdiği sitelere bağlantılar',
      signals: 'Yeni alan adı, tuhaf adres ve zayıf doğrulama bir arada',
      template:
        'Birkaç Fewmail kullanıcısının spam olarak bildirdiği metnin aynısı',
    },
    reasonCommunity: 'Birkaç Fewmail kullanıcısı spam olarak bildirdi',
    reasonYou: 'Bu göndereni spam olarak bildirdin',
    suspect: 'Spam gibi',
  },
  starterRules: {
    alwaysShow:
      'Güvenlik uyarıları, ödeme tarihi gelen faturalar, bankamdan veya devletten gelen her şey',
    newsletters: 'Bültenler ve özet e-postalar',
    notifications: 'Araç ve hizmetlerden gelen otomatik bildirimler',
    people:
      'Gerçek kişilerden gelen, bana soru soran veya yanıtımı bekleyen e-postalar',
    promotions: 'Promosyonlar, pazarlama ve istenmeyen satış e-postaları',
    receipts: 'Makbuzlar, sipariş ve kargo onayları',
  },
  tasks: {
    active: (goal: string) => `Ajan ilgileniyor: ${goal}`,
    auto: 'E-postaları bana sormadan gönder',
    autoHint:
      'Her e-posta yine de birkaç saniye bekler, böylece geri alabilirsin.',
    cancel: 'Durdur',
    done: 'Görev tamamlandı',
    goal: 'Ajan neyi başarmalı?',
    goalPlaceholder:
      'ör. Faturanın yeni adresimizle tekrar gönderilmesini sağla',
    handle: 'Bununla ilgilen…',
    next: 'Sonraki adım',
    start: 'Başlat',
    started: 'Ajan ilgileniyor.',
  },
  telegram: {
    heard: (text: string) => `Duyduğum: “${text}”`,
    voiceFailed: 'Anlayamadım. Tekrar dene ya da yaz.',
    whichEmail: 'Hangi e-posta? Mesajlarımdan birini ne yazılacağıyla yanıtla.',
    canceled: 'İptal edildi. Taslak kuyruğuna geri döndü.',
    sendingIn: (seconds: number) => `${seconds} sn içinde gönderiliyor`,
    undo: 'Geri al',
    commands: { brief: 'Bugünün özeti', queue: 'Seni bekleyenler' },
    connectFirst:
      'Önce Fewmail → Ayarlar → Entegrasyonlar’ı aç ve “Telegram’ı bağla”ya dokun.',
    connected:
      'Bağlandı. Özetini her sabah göndereceğim ve acil bir şey gelince haber vereceğim.\n\n/brief — bugünün özeti\n/queue — seni bekleyenler',
    done: 'Tamam',
    draft: 'Taslak:',
    edit: 'Düzenle',
    editPrompt:
      'Yerine kullanılacak metni gönder ya da “/” ile başlayarak nasıl değiştireceğimi söyle, örn. “/daha resmi”.',
    newDraft: 'Yeni taslak:',
    nothing: 'Şu an seni bekleyen bir şey yok.',
    proOnly:
      "Telegram, Fewmail Pro'nun bir parçası. Pro'ya geçmek için Fewmail'de Ayarlar → Plan'ı aç.",
    queueHint: '/queue — seni bekleyenler',
    rewriting: 'Yeniden yazılıyor…',
    send: 'Gönder',
    sendThis: 'Bunu gönder',
    shorter: 'Kısalt',
    skip: 'Atla',
    skipped: 'Atlandı',
    somethingWrong: 'Bir şeyler ters gitti',
    urgent: 'Acil',
    willSend: 'Gönderilecek:',
  },
  today: {
    later: (total: number, time: string) =>
      `${time} saatinde ${total} tane daha gelecek`,
    briefArrives: (time: string) => `Özetin her gün şu saatte gelir: ${time}.`,
    briefFrom: (time: string) => `${time} özeti`,
    done: 'Tamam',
    firstRead:
      'Son üç günün e-postalarını okuyorum. İlgilenmen gerekenler burada kendiliğinden görünecek.',
    handled: {
      spam: (n: number) => `${n} spama taşındı`,
      archived: (n: number) => `${n} arşivlendi`,
      markedRead: (n: number) => `${n} okundu yapıldı`,
      review: 'İncele',
      total: (n: number) => `${n} halledildi`,
      unsubscribed: (n: number) => `${n} abonelikten çıkıldı`,
    },
    headline: (total: number) =>
      total === 0
        ? 'Her şey sakin.'
        : plural('tr', total, {
            one: () => 'Bir şey seni bekliyor.',
            other: (n) => `${n} şey seni bekliyor.`,
          }),
    nothingNeedsYou:
      'Şu an seni bekleyen bir şey yok. Yeni postalar gelir gelmez okunur.',
    sent: 'Gönderildi',
    waitingOnYou: 'Seni bekliyor',
    worthAttention: 'İlgini hak ediyor',
    writeNow: 'Şimdi yaz',
    writing: 'Yazılıyor…',
  },
  whatsapp: {
    connectFirst:
      'Önce Fewmail → Ayarlar → Entegrasyonlar’ı aç ve “WhatsApp’ı bağla”ya dokun.',
    connected:
      'Bağlandı. Her sabah özetini gönderecek, acil bir şey geldiğinde yazacağım. Herhangi bir e-postayı yanıtlamak için metin ya da sesli mesaj gönder.',
    proOnly:
      "WhatsApp, Fewmail Pro'nun bir parçası. Pro'ya geçmek için Fewmail'de Ayarlar → Plan'ı aç.",
  },
  zombie: {
    badge: (share: number) =>
      `Kişilerin %${share} kadarının abonelik iptalini yok sayıyor`,
    reason: 'Abonelikten çıktıktan sonra da e-posta göndermeye devam etti',
  },
}
