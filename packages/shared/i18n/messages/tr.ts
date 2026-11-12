import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const tr: Messages = {
  actionKind: {
    cleanup: 'Hepsinden çık',
    commitment: 'Tamam',
    security: 'Kontrol ettim',
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
  agent: {
    chats: 'Sohbetler',
    autonomy: {
      ask: 'Her e-postadan önce sana sorar',
      auto: (most: number) =>
        `E-postaları sana sormadan kendisi gönderir (en fazla ${most})`,
    },
    calendar: (email: string) => `${email} takviminde`,
    cc: (recipients: string) => `Bilgi: ${recipients}`,
    confirm: {
      create_schedule: 'Bu bir zamanlamayla çalıştırılsın mı?',
      create_event: 'Bu etkinlik eklensin mi?',
      delete_event: 'Bu etkinlik silinsin mi?',
      update_event: 'Bu etkinlik değiştirilsin mi?',
      approve_action: 'Bu işlem yapılsın mı?',
      archive_thread: 'Bu yazışma arşivlensin mi?',
      clear_out: 'Bu e-posta grupları gelen kutusundan temizlensin mi?',
      undo_clear_out: 'Temizlenen her şey gelen kutusuna geri dönsün mü?',
      create_rule: 'Bu kural eklensin mi?',
      handle_thread: 'Bu yazışma ajana bırakılsın mı?',
      reply: 'Bu yanıt gönderilsin mi?',
      send_email: 'Bu e-posta gönderilsin mi?',
      snooze_thread: 'Bu yazışma ertelensin mi?',
      unsubscribe: 'Bu göndericiden abonelik iptal edilsin mi?',
      trash_thread: 'Bu ileti dizisi çöp kutusuna taşınsın mı?',
      report_spam: 'Bu gönderen spam olarak bildirilsin mi?',
      mark_not_spam: 'Bu ileti dizisi spamdan çıkarılsın mı?',
      move_to_inbox: 'Bu ileti dizisi gelen kutusuna geri taşınsın mı?',
    },
    decline: 'Hayır',
    declined: 'Hayır dedin',
    detach: 'Bu e-postayı ekleme',
    deleteChat: 'Sohbeti sil',
    failed: 'Ajan işi bitiremedi. Tekrar dene.',
    lead: 'E-postaların hakkında sor ya da ne yapılacağını söyle. Gönderen ya da Gmail’i değiştiren her şey senin onayını bekler.',
    newChat: 'Yeni sohbet',
    noChats: 'Henüz sohbet yok',
    cancelEdit: 'Düzenlemeyi iptal et',
    copy: 'Kopyala',
    edit: 'Düzenle',
    editing: 'Mesajını düzenliyorsun',
    regenerate: 'Yeniden yanıtla',
    skills: 'Beceriler',
    placeholder: 'E-postaların hakkında sor ya da beceriler için / yaz',
    retry: 'Tekrar dene',
    send: 'Gönder',
    steps: {
      create_schedule: 'Zamanlama kuruluyor',
      delete_schedule: 'Zamanlama durduruluyor',
      list_schedules: 'Zamanlamalar okunuyor',
      create_event: 'Etkinlik ekleniyor',
      delete_event: 'Etkinlik siliniyor',
      list_events: 'Takvime bakılıyor',
      update_event: 'Etkinlik değiştiriliyor',
      list_subscriptions: 'Abonelikler okunuyor',
      approve_action: 'Onaylanıyor',
      archive_thread: 'Arşivleniyor',
      get_reading: 'Bültenler okunuyor',
      get_wrapped: 'Postanı sayıyorum',
      clear_out: 'Gelen kutusu temizleniyor',
      preview_clear_out: 'Tüm gelen kutusu okunuyor',
      undo_clear_out: 'Temizlenen e-postalar geri getiriliyor',
      create_rule: 'Kural ekleniyor',
      dismiss_action: 'Atlanıyor',
      draft_reply: 'Yanıt yazılıyor',
      create_draft: 'Taslak kaydediliyor',
      get_board: 'Pano okunuyor',
      get_person: 'Kişi aranıyor',
      get_today: 'Bugün kontrol ediliyor',
      handle_thread: 'Yazışma devrediliyor',
      list_boards: 'Panolar açılıyor',
      list_handled: 'Halledilenlere bakılıyor',
      list_mail: 'E-postalarda aranıyor',
      list_rules: 'Kurallar okunuyor',
      read_thread: 'Yazışma okunuyor',
      redraft_action: 'Taslak yeniden yazılıyor',
      refresh: 'Yeni e-postalar alınıyor',
      send_email: 'Gönderiliyor',
      snooze_thread: 'Erteleniyor',
      unsubscribe: 'Abonelik iptal ediliyor',
      trash_thread: 'Çöp kutusuna taşınıyor',
      report_spam: 'Spam bildiriliyor',
      mark_not_spam: 'Spamdan çıkarılıyor',
      move_to_inbox: 'Gelen kutusuna taşınıyor',
      create_board: 'Pano oluşturuluyor',
    },
    stop: 'Durdur',
    thinking: 'Düşünüyor…',
    title: 'Senin için ne yapabilirim?',
    to: (recipients: string) => `Kime: ${recipients}`,
    until: (time: string) => `Şu zamana kadar: ${time}`,
    yes: {
      create_schedule: 'Zamanla',
      create_event: 'Ekle',
      delete_event: 'Sil',
      update_event: 'Kaydet',
      approve_action: 'Onayla',
      archive_thread: 'Arşivle',
      clear_out: 'Temizle',
      undo_clear_out: 'Geri getir',
      create_rule: 'Ekle',
      handle_thread: 'Devret',
      reply: 'Gönder',
      send_email: 'Gönder',
      snooze_thread: 'Ertele',
      unsubscribe: 'İptal et',
      trash_thread: 'Çöpe taşı',
      report_spam: 'Spam bildir',
      mark_not_spam: 'Spam değil',
      move_to_inbox: 'Geri taşı',
    },
  },
  ask: {
    label: (question: string) => `Fewmail'e sor: “${question}”`,
    thinking: 'E-postalarına bakılıyor…',
  },
  byRule: 'bir kuralla',
  boards: {
    chart: {
      add: 'Grafik ekle',
      currency: 'Para birimi',
      edit: 'Grafik ayarları',
      empty: 'Henüz çizilecek bir şey yok',
      groupBy: 'Gruplama',
      groupings: {
        group: 'Kim veya ne',
        month: 'Ay',
        status: 'Durum',
        week: 'Hafta',
      },
      measure: 'Gösterilen',
      measures: { count: 'Adet', sum: 'Toplam tutar' },
      other: 'Diğer',
      remove: 'Grafiği kaldır',
      skipped: (n: number) =>
        `Sayılmadı: ${n} başka para biriminde veya tutarsız`,
      title: 'Grafik başlığı',
      type: 'Grafik türü',
      types: {
        area: 'Alan',
        bar: 'Çubuk',
        line: 'Çizgi',
        pie: 'Pasta',
      },
      untitled: 'Yeni grafik',
      weekOf: (date: string) => `${date} haftası`,
    },
    charts: 'Grafikler',
    create: 'Pano oluştur',
    delete: 'Panoyu sil',
    description: 'Neleri topladığı',
    descriptionPlaceholder:
      'Seyahatler: uçuşlar, oteller ve araç kiralama, maliyetleriyle',
    edit: 'Panoyu düzenle',
    editHint: 'Neleri topladığını değiştirirsen son altı ay yeniden okunur.',
    empty: 'Henüz boş. Uygun e-postalar gelir gelmez burada görünür.',
    entries: (total: number) =>
      plural('tr', total, { other: (n) => `${n} kayıt` }),
    name: 'Ad',
    namePlaceholder: 'Seyahatler',
    new: 'Yeni pano',
    newHint:
      'Neyin toplanacağını kendi kelimelerinle anlat. Fewmail son altı ayın postalarında bulur, grafikleri seçer ve panoyu güncel tutar.',
    planning: 'Hazırlanıyor…',
    readingHistory: 'Son altı ayın postaları okunuyor…',
    save: 'Kaydet',
    starter: {
      events: {
        description:
          'Biletler, rezervasyonlar ve randevular: nerede, ne zaman ve kiminle olmam gerektiği.',
        name: 'Etkinlikler',
      },
      money: {
        description:
          'Ödemeler, abonelikler, faturalar ve iadeler: neye, kime ve ne kadar ödediğim.',
        name: 'Para',
      },
      orders: {
        description:
          'Online siparişler ve teslimatlar: ne aldım, kimden ve şu an nerede.',
        name: 'Siparişler',
      },
      subscriptions: {
        description:
          'Düzenli ödediğim hizmetler: her biri ne kadar, ne sıklıkla ve bir sonraki yenileme ne zaman.',
        name: 'Ücretli abonelikler',
      },
      trips: {
        description:
          'Uçuşlar, trenler, oteller ve kiralamalar: nereye, ne zaman ve kaça gidiyorum.',
        name: 'Seyahatler',
      },
    },
  },
  bulk: {
    badge: (n: number) => `${n}+ Fewmail kullanıcısına gönderildi`,
    reason: (n: number) =>
      `Toplu e-posta: ${n}+ Fewmail kullanıcısı aynı metni aldı`,
  },
  calendar: {
    allDay: 'Tüm gün',
    calendar: 'Takvim',
    create: 'Etkinlik ekle',
    delete: 'Sil',
    deleted: 'Etkinlik silindi',
    description: 'Açıklama',
    editEvent: 'Etkinliği düzenle',
    endBeforeStart: 'Etkinlik başlamadan bitiyor',
    ends: 'Bitiş',
    location: 'Konum',
    newEvent: 'Yeni etkinlik',
    next: 'Sonraki',
    openInGoogle: "Google Takvim'de aç",
    previous: 'Önceki',
    save: 'Kaydet',
    saved: 'Etkinlik kaydedildi',
    starts: 'Başlangıç',
    title: 'Takvim',
    titlePlaceholder: 'Başlık ekleyin',
    today: 'Bugün',
    untitled: '(Başlıksız)',
    views: {
      day: 'Gün',
      week: 'Hafta',
      month: 'Ay',
      year: 'Yıl',
    },
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
  clearOut: {
    groups: {
      lists: 'Hiç açmadığın bültenler',
      notifications: 'Okunmuş bildirimler, bir aydan eski',
      old: 'Bir yıldan eski her şey',
      promotions: 'Reklamlar ve sosyal, 3 günden eski',
    },
    done: (emails: string) => `${emails} temizlendi`,
    empty: 'Temizlenecek bir şey yok: gelen kutusu zaten düzenli.',
    lead: (emails: string) =>
      `Gelen kutusunda ${emails} var. Gidebilecekler şunlar.`,
    leadCapped: (emails: string) =>
      `Gelen kutusunda ${emails} fazlası var. Gidebilecekler şunlar.`,
    left: (emails: string) => `Gelen kutusunda ${emails} kalacak`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} ve ${more} tane daha` : names,
    run: (emails: string) => `${emails} temizle`,
    safe: 'Hiçbir şey silinmez. Temizlenen e-postalar Fewmail/Cleared etiketiyle arşive gider ve tek tıkla geri gelir; bültenlerden aboneliğin de iptal edilir.',
    scanning:
      'Tüm gelen kutusunu okuyorum, yalnızca başlıklar. Bir dakikaya kadar.',
    title: 'Gelen kutusunu temizle',
    undo: 'Hepsini geri getir',
    undone: (emails: string) => `${emails} yeniden gelen kutusunda`,
  },
  wrapped: {
    busiest: (day: string, hour: string) => `En yoğun: ${day}, ${hour} civarı`,
    copied: 'Bağlantı kopyalandı',
    copyLink: 'Bağlantıyı kopyala',
    cta: 'Seninkini Fewmail ile al',
    emails: 'e-posta geldi',
    empty:
      'Hikâye için henüz yeterli e-posta yok. Birkaç gün sonra tekrar gel.',
    handled: 'Fewmail kendi halletti',
    people: 'En çok kim yazdı',
    period: { month: 'Bu ay', year: 'Bu yıl' },
    replies: 'yanıtı Fewmail yazdı ve gönderildi',
    saveImage: 'Görseli kaydet',
    saved: 'Fewmail kazandırdı',
    shareNote:
      'Bağlantı ve görsel yalnızca bu sayıları gösterir, asla isim veya adres göstermez.',
    shared: { month: 'E-postada bir ay', year: 'E-postada bir yıl' },
    spam: 'spam e-posta durduruldu',
    split: (people: string, lists: string) =>
      `${people} kişilerden · ${lists} bültenlerden`,
    title: { month: 'E-postada ayın', year: 'E-postada yılın' },
    unsubscribed: 'bülten bırakıldı',
  },
  forward: {
    done: 'İlettiğin e-posta',
  },
  reading: {
    empty: 'Son günde bülten gelmedi.',
    lead: 'Son günün bültenleri tek yerde, gelen kutusunu doldurmasınlar diye.',
    title: 'Okuma',
  },
  commitments: {
    title: 'Söz verdin',
  },
  compose: {
    backInQueue: 'İptal edildi. Taslak Bugün’e geri döndü.',
    canceled: 'İptal edildi. E-postan düzenleyiciye geri döndü.',
    cc: 'Bilgi',
    discard: 'Sil',
    draftSaved: 'Taslak kaydedildi',
    saveDraft: 'Taslağı kaydet',
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
    goTo: 'Git',
    mail: 'Posta',
    nothingMatches: 'Eşleşen bir şey yok.',
    placeholder: 'Postaların hakkında sor veya komut çalıştır…',
    commandsOnly: 'Komut çalıştır…',
    rewriteBrief: 'Özeti yeniden yaz',
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
  justNow: 'az önce',
  errors: {
    failed: 'Bir şeyler ters gitti. Tekrar dene.',
    needsPro: 'Bunun için Fewmail Pro gerekiyor.',
    alreadySent: 'Zaten gönderildi, geri almak için çok geç.',
    notFound: 'Bu artık yok. Silinmiş olabilir.',
    offline: 'Fewmail’e ulaşılamıyor. Bağlantını kontrol et.',
  },
  update: {
    available: 'Fewmail’in yeni bir sürümü çıktı.',
    reload: 'Yenile',
  },
  keys: {
    restore: 'gelen kutusuna',
    calendarToday: 'bugün',
    newEvent: 'yeni etkinlik',
    period: 'önceki / sonraki',
    view: 'görünüm',
    group: 'grupla',
    skills: 'beceriler',
    unsubscribe: 'abonelikten çık',
    filter: 'filtre',
    reply: 'yanıtla',
    snooze: 'ertele',
    trash: 'çöp',
    ask: 'bunu sor',
    anything: 'her şey',
    approve: 'onayla',
    approveAll: (n: number) => `bu türdeki ${n} kartın hepsini onayla`,
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
  limits: {
    boards: (total: number) =>
      `Planın ${total} pano içeriyor. Birini sil ya da Ayarlar → Plan’dan Max’e geç.`,
    messages: (date: string) =>
      `Bu ayki ajan mesajların bitti. ${date} tarihinde yenilenecek.`,
    tasks: (total: number) =>
      `Planın aynı anda ${total} yazışmayı devralır. Birinin bitmesini bekle ya da Ayarlar → Plan’dan Max’e geç.`,
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
      'Fewmail, Gmail’ini senin için okumak, düzenlemek ve göndermek için izin ister. İzin veren bir kural yazmadığın sürece senin onayın olmadan hiçbir şey gönderilmez ve arşivlenmez. Google Takvim erişimi de ister; bunu kaldırabilirsin.',
    continue: 'Google ile devam et',
    lead: 'Fewmail gelen kutunu senin yerine okur, senin üslubunla yanıtlar ve sadece gerçekten seni bekleyenleri gösterir.',
    messengers:
      'Mesajlaşma uygulamalarında da çalışır, ilk olarak Telegram’da: özeti al, yanıtları onayla ya da sadece sesli mesaj gönder.',
    title: 'Yalnızca önemli olan.',
  },
  mail: {
    allMailboxes: 'Tüm posta kutuları',
    group: {
      category: 'Kategori',
      importance: 'Önem',
      none: 'Grup yok',
      sender: 'Gönderen',
      title: 'Grupla',
    },
    unread: 'Okunmamış',
    block: 'Göndereni engelle',
    blocked: 'Engellendi. E-postaları artık çöpe gidiyor.',
    forward: 'İlet',
    more: 'Daha fazla',
    close: 'Kapat',
    reply: 'Yanıtla',
    trash: 'Çöpe taşı',
    trashed: 'Çöpe taşındı',
    moveToInbox: 'Gelen kutusuna',
    backInInbox: 'Gelen kutusuna taşındı',
    movedToInbox: 'Gelen kutusuna geri taşındı. Bildirdiğin için teşekkürler.',
    noThread: 'Burada okumak için bir e-posta seç',
    deleteDraft: 'Taslağı sil',
    notSent: 'Gönderilemedi. Yeniden denemek için aç',
    noRecipients: 'Alıcı yok',
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
    dueHint: 'Ajanın bu e-postada bulduğu son tarih',
    empty: 'Burada e-posta yok',
    emptyHint: 'Yeni e-postalar gelir gelmez burada görünür.',
    expectsReply: 'Yanıt bekliyor',
    filter: {
      archive: 'Arşiv',
      trash: 'Çöp kutusu',
      drafts: 'Taslaklar',
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
  subscriptions: {
    archivedOnly:
      'Bu gönderenin tek tıkla abonelikten çıkma seçeneği yok, bu yüzden e-postaları arşivlendi. Gelmeye devam ederse spama gider.',
    count: (total: number) => `E-posta listesi: ${total}`,
    empty: 'Bu ay sana hiçbir e-posta listesi yazmadı.',
    lead: 'Bu ay sana yazan e-posta listeleri, en etkin olanlar önce. Abonelikten çıkınca gönderdikleri her şey arşivlenir; iki hafta sonra hâlâ gelen e-postalar spama gider.',
    opened: (total: number) =>
      total === 0 ? 'hiçbiri açılmadı' : `${total} açıldı`,
    title: 'Abonelikler',
    unsubscribe: 'Abonelikten çık',
    unsubscribed: 'Abonelikten çıkıldı',
  },
  nav: {
    calendar: 'Takvim',
    subscriptions: 'Abonelikler',
    agent: 'Ajan',
    boards: 'Panolar',
    newBoard: 'Yeni pano',
    mail: 'Posta',
    reading: 'Okuma',
    rules: 'Kurallar',
    search: 'Ara veya sor…',
    settings: 'Ayarlar',
    syncFailed: 'Gmail eşitlemesi başarısız, yeniden deneniyor',
    syncing: 'Gelen kutun okunuyor…',
    today: 'Bugün',
    trialLeft: (total: number) => `Pro denemesi · ${total} gün kaldı`,
    usage: (percent: number) => `Ajan · bu ayın %${percent} kadarı kullanıldı`,
    watching: 'Ajan gelen kutunu izliyor',
  },
  schedule: {
    awaitsAnswer:
      'Bu çalışmayı atladım: bir önceki hâlâ bu sohbette yanıtını bekliyor.',
    failed:
      'Bu zamanlanmış çalışma başarısız oldu. Bir sonrakinde yeniden deneyeceğim.',
    limitReached: (day: string) =>
      `Bu ayın mesajları bitti, bu yüzden zamanlama şu tarihe kadar çalışmaları atlıyor: ${day}`,
    open: 'Fewmail’de aç',
    stopped:
      'Bu zamanlama üst üste üç kez başarısız oldu, bu yüzden durdurdum. Geri istediğinizde yeniden kurmamı isteyin.',
  },
  notifications: {
    many: (total: number) =>
      plural('tr', total, {
        other: (n) => `Fewmail’den ${n} yeni bildirim`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Ajanın e-postalarından doldurduğu sayfalar; son altı aydan başlar. En fazla ${max} tane seç; kendi panolarını sonra ekleyebilirsin.`,
    boardsTitle: 'Ajan senin için neleri toplasın?',
    languageHint:
      'Uygulama, özetler ve açıklamalar bu dili kullanır. Yanıtlar her zaman yanıtladığın e-postanın dilinde olur.',
    languageTitle: 'Fewmail hangi dili konuşsun?',
    lead: 'İki kısa cevap. Hepsini daha sonra Ayarlar’dan değiştirebilirsin.',
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
    priceYearly: (usd: number) => `$${usd} / yıl`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `Ayda ${emails} e-posta ve ${messages} mesaj; panolar ve devredilen yazışmalar sınırsız.`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `Ayda ${emails} e-posta ve ${messages} mesaj.`,
    cancels: (plan: string, date: string) =>
      `${date} tarihine kadar ${plan}, sonra Ücretsiz.`,
    choose: (plan: string) => `${plan} seç`,
    proRenews: (date: string) => `${date} tarihinde yenilenir.`,
    resets: (date: string) => `${date} tarihinde sıfırlanır.`,
    title: 'Plan',
    trial: 'Pro denemesi',
    welcome: (plan: string) =>
      `${plan} planına hoş geldin. Ajan yeniden görevde.`,
    yearly: 'Yıllık öde',
    yearlyHint: 'İki ay ücretsiz.',
    emailsUsed: (used: string, total: string) => `${used} / ${total} e-posta`,
    messagesUsed: (used: string, total: string) => `${used} / ${total} mesaj`,
    trialDescription: (date: string) =>
      `${date} tarihine kadar Pro’nun tamamı, sonra ücretsiz. Kart gerekmez.`,
    upgrade: 'Diğer planlar',
    usage: 'Bu ay',
  },
  people: {
    firstContact: (date: string) => `${date} tarihinden beri yazışıyorsunuz`,
    lastContact: (date: string) => `Son e-posta ${date}`,
    open: 'Diğer yazışmalarda bekliyor',
    promised: 'Söz verdin',
    threads: (total: number) => `${total} yazışma`,
  },
  queue: {
    askedByYou: 'Senin isteğinle',
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
    add: 'Kural ekle',
    count: (total: number) =>
      plural('tr', total, { other: (n) => `${n} kural` }),
    delete: 'Sil',
    describe: {
      alwaysShow: 'Her zaman Bugün’e düşer',
      autonomous: 'Kendiliğinden yapılır, halledilenlerde listelenir',
      draft: 'Bir taslak Bugün’de seni bekler',
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
  },
  settings: {
    forward: {
      copy: 'Adresi kopyala',
      description:
        'Kendi posta kutundan bu adrese herhangi bir e-postayı gönder ya da ilet, en üste ne yapılacağını yazan bir not ekle. Yanıt Telegram veya WhatsApp’a ve buradaki bir sohbete gelir.',
      title: 'Ajana ilet',
    },
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
      allow: 'İzin ver',
      connected: (ago: string) => `${ago} bağlandı`,
      copy: 'URL’yi kopyala',
      defaultName: 'MCP istemcisi',
      deny: 'Reddet',
      description:
        'Özetini ve postalarını okuyabilir, yanıt taslağı yazabilir ve sen onayladıktan sonra gönderebilirler.',
      disconnect: 'Bağlantıyı kes',
      paste:
        'Bu URL’yi uygulamana bağlayıcı olarak ekle, sonra Fewmail’e giriş yap.',
      request: (app: string) => `${app} Fewmail’ini kullanmak istiyor`,
      title: 'Claude, Cursor veya herhangi bir MCP istemcisini bağla',
    },
    signedInWithGoogle: 'Google ile giriş yapıldı',
    signOut: 'Çıkış yap',
    schedules: {
      delete: 'Sil',
      description:
        'Sohbette ajandan düzenli olarak bir şey yapmasını isteyin, örneğin “her cuma 17:00’de haftanın faturalarını topla”. Her çalışma kendi sohbetine gelir; göndermek istediği her şeyi orada onaylarsınız.',
      title: 'Zamanlamalar',
    },
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
  site: {
    chapters: {
      compare: {
        description:
          'Çoğu araç gelen kutunu daha hızlı bitirmene yardım eder. Fewmail ise onu senin yerine bitirir.',
        label: 'Karşılaştır',
        title: 'Fewmail’i farklı kılan ne?',
      },
      control: {
        description:
          'Postalarla ne yapılacağını Fewmail’e sade bir dille anlat, hangi kuralların kendi başına çalışabileceğine sen karar ver ve yaptığı her şeyi Halledilenler’de incele.',
        label: 'Kontrol',
        title: 'Kuralları sen koyarsın. O da ne yaptığını gösterir.',
      },
      memory: {
        description:
          'Fewmail neye söz verdiğini, kimin kim olduğunu, neye para ödediğini ve senin için hâlâ hangi yazışmalarla ilgilendiğini aklında tutar.',
        label: 'Hafıza',
        title: 'O hatırlar, sen hatırlamak zorunda kalmazsın.',
      },
      pricing: {
        description:
          'Sıralama, kurallar ve koruma sonsuza dek ücretsiz. Pro ve Max, senin için okuyan ve yazan her şeyi ekler; Max sadece bunu daha çok yapar.',
        label: 'Fiyatlar',
        title: (usd: number) =>
          `Sıralama ücretsiz. Ajan için başlangıç fiyatı $${usd}.`,
      },
      protection: {
        description:
          'Her planda, Fewmail kullananlardan öğrenen bir topluluk spam kalkanı var ve tek bir adresi ya da postandan tek bir kelimeyi bile paylaşmaz. Benzer alan adları, bilinen oltalama siteleri ve değişen ödeme bilgileri, sen harekete geçmeden önce uyarı verir.',
        label: 'Koruma',
        title: 'Dolandırıcılar kapıda kalır.',
      },
      questions: {
        description: 'Kısa cevaplar burada. Uzunları gizlilik politikasında.',
        label: 'Sorular',
        title: 'Gmail’i bağlamadan önce.',
      },
      replies: {
        description:
          'Fewmail, gönderdiğin postalardan nasıl yazdığını öğrenir, sonra yanıtları önceden ve e-postanın dilinde hazırlar. Düzenle, başka bir versiyon iste ya da olduğu gibi gönder. Sen onay vermeden hiçbir şey gitmez.',
        label: 'Yanıtlar',
        title: 'Senin üslubunla, onların dilinde yanıtlar.',
      },
      telegram: {
        description:
          'Özeti ve acil postaları Telegram’da al, bir yanıtı tek dokunuşla onayla ya da sadece sesli mesaj gönder: “Marco’ya perşembe uyar de”. Fewmail yazışmayı bulur ve yanıtı hazırlar.',
        label: 'Telegram',
        title: 'Gelen kutun, bir sohbette.',
      },
      today: {
        description:
          'Fewmail her gün, seçtiğin saatte senin dilinde kısa bir özet yazar ve karar bekleyen birkaç e-postayı en önemlisi başta olacak şekilde sıraya koyar. ⏎ ile onayla, S ile atla; gerisi zaten halledildi ve tam olarak ne yaptığını görebilirsin.',
        label: 'Bugün',
        title: 'Bir özet. Bir kuyruk. Gelen kutun bu kadar.',
      },
    },
    closing: {
      lead: 'Gmail’i bir dakikada bağla. Fewmail son üç günün postalarıyla başlar, böylece ilk kararlar seni hemen bekliyor olur.',
      title: 'Sabahlarını geri al.',
    },
    mcpPage: {
      copy: 'URL’yi kopyala',
      lead: 'Fewmail’i MCP sunucusu olarak bağla ve zaten kullandığın yapay zekâdan postanı sor. Postanı okumak ve ajanın sıralaması ücretsiz; taslak, gönderme ve kurallar Pro ile gelir.',
      safety:
        'E-posta gönderen ya da Gmail’i değiştiren her şey önce onayını ister. Postan hiçbir zaman model eğitmek için kullanılmaz ve her uygulamanın bağlantısını ayarlardan kesebilirsin.',
      steps: {
        chatgpt:
          'Settings’te bu URL ile bir bağlayıcı (uygulama) ekle, sonra Fewmail’e giriş yap.',
        claude:
          'Settings → Connectors’da bu URL ile özel bir bağlayıcı ekle, sonra Fewmail’e giriş yap.',
        code: 'Bunu terminalde bir kez çalıştır, Claude Code sorduğunda Fewmail’e giriş yap.',
        cursor:
          'Bunu mcp.json dosyana ekle, Cursor sorduğunda Fewmail’e giriş yap.',
      },
      title: 'Claude, ChatGPT ve araçlarının içinde Fewmail.',
    },
    comparePage: {
      lead: 'E-posta istemcileri her e-postayı daha hızlı okumanı sağlar. Filtreler postaları klasörlere taşır. Fewmail ise bir ajan: postaları okur, neyin bekleyebileceğine karar verir ve sana yalnızca gerisini sorar.',
      title: 'Fewmail karşılaştırması.',
    },
    comparison: {
      custom: 'Özel',
      features: 'Özellik özellik',
      groups: {
        agent: 'Okuma ve yanıtlama',
        day: 'Günün',
        reach: 'Nerede çalışır',
        safety: 'Koruma',
      },
      labels: {
        ask: 'Postana her şeyi sor',
        brief: 'Günlük özet',
        calendar: 'Takvim',
        drafts: 'Senin için hazırlanan yanıtlar',
        followUps: 'Takip hatırlatmaları',
        gmail: 'Gmail ve Google Workspace',
        handOver: 'Bir yazışmayı devret',
        importance: 'Öneme göre sıralama',
        keepApp: 'Kendi e-posta uygulamanla devam et',
        mcp: 'Kendi araçların için MCP',
        memory: 'Sözleri ve kişileri hatırlar',
        otherProviders: 'iCloud, Yahoo ve diğer IMAP postaları',
        outlook: 'Outlook ve Microsoft 365',
        phishing: 'Oltalama ve ödeme değişikliği uyarıları',
        phone: 'Telefonunda',
        rules: 'Sade dille kurallar',
        snooze: 'Erteleme',
        spamShield: 'Topluluk spam kalkanı',
        summaries: 'E-posta özetleri',
        teams: 'Ekip gelen kutusu',
        unsubscribe: 'Tek tıkla abonelikten çıkma',
      },
      more: 'Diğer karşılaştırmalar',
      no: 'Hayır',
      noFreePlan: 'Ücretsiz plan yok',
      ours: {
        ask: 'Pro’da',
        brief: 'Senin dilinde, Pro’da',
        drafts: 'Senin üslubunla, yalnızca sen onaylayınca gönderilir, Pro’da',
        followUps: 'Yanıt bekleyen postalarda otomatik',
        handOver: 'Ajan hedefe ulaşana dek yürütür, Pro’da',
        importance: 'Her e-posta puanlanır, ücretsiz',
        keepApp: 'Her şey Gmail’de görünür',
        mcp: 'Pro’da',
        memory: 'Pro’da',
        phone: 'Telegram ve WhatsApp, sesle, Pro’da',
        rules: 'Arşivle, okundu işaretle veya abonelikten çık, ücretsiz',
        summaries: 'Pro’da',
        unsubscribe: 'Bunu yok sayan gönderenler spama gider',
      },
      plans: 'Planlar ve fiyatlar',
      read: 'Karşılaştırmayı oku',
      source: (name: string, date: string) =>
        `${name} bilgileri, ${date} itibarıyla kontrol edilen herkese açık web sitesinden alındı. Fiyatlar ve özellikler değişebilir; güncel teklif için onların sitesine bak.`,
      title: (name: string) => `Fewmail ve ${name}`,
      tryFree: 'Fewmail’i ücretsiz dene',
      which: 'Hangisi sana göre?',
      yes: 'Evet',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 posta kutusu ve tüm özellikler, AI Bundle dahil',
          lunch: '2 posta kutusu, erteleme ve hatırlatmalar',
          snack: '1 posta kutusu ve temel filtreleme',
        },
        summary:
          'SaneBox postaları klasörlere ayırır, en üst planında taslak da yazar ve özetler. Fewmail önce her şeyi okur ve sana tek bir özetle yalnızca senin verebileceğin birkaç kararı sunar.',
        them: {
          brief: 'Filtrelenen postaların günlük derlemesi',
          drafts: 'SaneDrafts, Dinner’da',
          followUps: 'SaneNoReplies',
          importance: 'Önemsiz postalar SaneLater’a taşınır',
          keepApp: 'Klasörler üzerinden çalışır',
          otherProviders: 'Herhangi bir IMAP veya Exchange sunucusu',
          phone: 'E-posta uygulaman üzerinden',
          rules: 'Postaları klasörler arasında taşıyarak eğitme',
          snooze: 'Lunch’tan itibaren',
          summaries: 'SaneSummary, Dinner’da',
          unsubscribe: 'SaneBlackHole klasörü',
        },
        verdict:
          'Postan Gmail dışındaysa ve klasörler yetiyorsa SaneBox’ı seç. Gmail kullanıyorsan ve önemli postaların okunmasını, özetlenmesini ve yanıtlanmasını istiyorsan Fewmail’i seç.',
      },
      shortwave: {
        plans: {
          business: 'Kullanıcı başına',
          free: 'Çoğu özellik ve asistan',
          max: 'Kullanıcı başına, en güçlü modeller',
          premier: 'Kullanıcı başına, daha güçlü modeller',
          pro: 'Tüm geçmiş, AI ile arama ve yazma',
        },
        summary:
          'Shortwave, konuşarak kullandığın bir AI asistanı olan bir e-posta istemcisi. Fewmail ise okumayı önce kendisi yapan ve sana yalnızca karar veremediği şeyleri soran bir ajan.',
        them: {
          ask: 'AI asistanı ve arama',
          drafts: 'İstediğinde',
          importance: 'Bölmeler ve paketler',
          keepApp: 'E-posta uygulamanın yerini alır',
          memory: 'AI belleği',
          otherProviders: 'Gmail’e yönlendirilir',
          outlook: 'Microsoft 365 desteklenmez',
          phone: 'iOS ve Android uygulamaları',
          rules: 'AI filtreleri, plana göre 3 ile 50 arası',
          summaries: 'Her e-postanın üstünde',
          teams: 'Paylaşılan yazışmalar ve yorumlar',
          unsubscribe: 'Tek tıkla engellemeyle',
        },
        verdict:
          'Sohbet asistanlı yeni bir gelen kutusu istiyorsan Shortwave’i seç. Zaten kullandığın Gmail’de daha az e-postaya bakmak istiyorsan Fewmail’i seç.',
      },
      superhuman: {
        plans: {
          business:
            'Üye başına, yıllık ödemede $33. Auto Drafts ve Ask AI eklenir',
          enterprise: 'SSO ve yönetici denetimleri',
          starter: 'Üye başına, yıllık ödemede $25',
        },
        summary:
          'Superhuman her e-postayı daha hızlı geçmeni sağlar. Fewmail onları senin yerine geçer ve yalnızca seni bekleyenleri gösterir.',
        them: {
          ask: 'Ask AI, Business’ta',
          drafts: 'Auto Drafts, Business’ta',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox ve Auto Labels',
          keepApp: 'E-posta uygulamanın yerini alır',
          mcp: 'Business’ta',
          phone: 'iOS ve Android uygulamaları',
          rules: 'Custom Auto Labels, Business’ta',
          spamShield: 'Sağlayıcının filtresi',
          summaries: 'Auto Summarize',
          teams: 'Paylaşılan taslaklar ve yorumlar',
        },
        verdict:
          'Her e-postaya kendin ve daha hızlı dokunmak istiyorsan Superhuman’ı seç. Çoğunu hiç görmemeyi tercih ediyorsan Fewmail’i seç.',
      },
    },
    control: {
      gmail: {
        description:
          'İsteğe bağlı Fewmail etiketleri, sıralamayı Gmail’in kendisinde, telefonunda ve diğer tüm posta uygulamalarında gösterir.',
        title: 'Her Gmail uygulamasıyla çalışır',
      },
      handled: {
        description:
          'Ajanın kendi başına yaptığı her şey, nedeniyle birlikte Halledilenler’de listelenir.',
        title: 'Halledilenler, göz önünde',
      },
      keyboard: {
        description:
          'Her işlemin tek bir tuşu var ve ⌘K ile her şeye ulaşırsın. Ellerin klavyeden hiç ayrılmaz.',
        title: 'Önce klavye',
      },
      mcp: {
        description:
          'Claude’u ya da herhangi bir MCP istemcisini bağla; aynı ajanla okusun, ayıklasın ve taslak yazsın.',
        title: 'MCP sunucusu',
      },
      privacy: {
        description:
          'Konular, içerikler, özetler ve taslaklar veritabanımızda şifrelenir. Göndermek her zaman senin onayını gerektirir.',
        title: 'Gizlilik baştan tasarımda',
      },
      rules: {
        description:
          '“Hiç açmadığım bültenler” ya da “mağaza makbuzları”: arşivle, okundu yap ya da abonelikten çık.',
        title: 'Sade dille kurallar',
      },
    },
    demos: {
      draft: {
        expectsReply: 'Yanıt bekliyor',
        language: 'Lena gibi Almanca',
        redraft: 'Yeniden yaz',
      },
      shield: [
        {
          detail: 'paypa1-billing.com, paypal.com gibi görünüyor',
          label: 'Benzer alan adı',
        },
        {
          detail: 'Tanıdık bir tedarikçinin faturasında yeni IBAN',
          label: 'Ödeme bilgileri değişti',
        },
        {
          detail: '9 kişi bu kampanyayı spam olarak bildirdi',
          label: 'Spama taşındı',
        },
      ],
      telegram: {
        draftReady: 'Marco için taslak hazır: perşembe 16:00. Gönderilsin mi?',
        urgent: 'İmzalı sözleşmeyi cumadan önce istiyor. Bir yanıt hazırladım.',
        voice: '“Marco’ya perşembe uyar de, ama saat dörtte.”',
      },
      today: {
        brief:
          'Anna sözleşmeyi bekliyor, Northwind’in faturasının son günü gelecek hafta ve Marco perşembe için bir saat istiyor. Kırk iki bülten ve bildirim halledildi.',
        day: 'Perşembe özeti',
        queue: [
          {
            reason: 'Sözleşme yarın bekleniyor',
            summary:
              'İmzalı sözleşmenin cuma günkü başlangıç toplantısından önce geri gelmesi gerekiyor.',
          },
          {
            reason: 'Fatura · 1.240 $, son gün 20 Kasım',
            summary: 'Web sitesi yenilemesi için ekim faturası.',
          },
          {
            reason: 'Toplantı önerisi',
            summary: 'Üç aylık değerlendirme için perşembe 15:00’i öneriyor.',
          },
        ],
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'Hayır. Fewmail, Gmail’in üzerinde çalışır. Yaptığı her şey Gmail’de de görünür ve yanında istediğin Gmail uygulamasını kullanmaya devam edebilirsin.',
        question: 'Gmail’i bırakmam gerekiyor mu?',
      },
      {
        answer:
          'Sen olmadan asla. Yanıtlar sen onaylayana kadar kuyruğunda bekler ve yalnızca senin oluşturduğun ya da tuttuğun kurallar kendi başına arşivleyebilir, okundu yapabilir veya abonelikten çıkabilir. Yaptığı her şey Halledilenler’de listelenir.',
        question: 'Kendi başına e-posta gönderebilir ya da silebilir mi?',
      },
      {
        answer:
          'Konular, içerikler, özetler ve taslaklar veritabanımızda şifrelenir. Postaların asla model eğitmek için kullanılmaz ve spam kalkanı kullanıcılar arasında yalnızca anahtarlı hash’ler paylaşır, asla adres ya da içerik paylaşmaz.',
        question: 'Postalarıma ne oluyor?',
      },
      {
        answer: `Her yeni hesap, kart gerekmeden ${trialDays} gün Pro alır. Süre bitince Ücretsiz planda kalırsın; hiçbir şey silinmez, hiçbir ücret alınmaz.`,
        question: 'Deneme bitince ne olur?',
      },
      {
        answer:
          'Taslaklar, yanıtladığın e-postanın dilinde yazılır. Uygulama, özet ve Telegram botu ise on beş dil arasından seçtiğin tek bir dili konuşur.',
        question: 'Hangi dilleri konuşuyor?',
      },
      {
        answer:
          'Şimdilik Gmail ve Google Workspace hesapları. Tek bir Fewmail’e birden fazla posta kutusu ekle; hepsinin postaları aynı özete ve gelen kutusuna düşer.',
        question: 'Hangi e-posta hesaplarıyla çalışır?',
      },
    ],
    footer: {
      legal: 'Yasal',
      product: 'Ürün',
      tagline:
        'Gmail’ini okuyan ve sana yalnızca seni bekleyenleri gösteren e-posta ajanı.',
      versus: (name: string) => `vs ${name}`,
    },
    hero: {
      lead: 'Fewmail, Gmail için bir e-posta ajanı. Her e-postayı senin yerine okur, yanıtları senin üslubunla hazırlar ve önüne gerçekten seni bekleyenlerin kısa bir listesini koyar.',
      start: 'Google ile ücretsiz başla',
    },
    memory: {
      ask: {
        description:
          '⌘K’de bir soru sor, yanıtı kendi postalarından, dayandığı e-postalarla birlikte al.',
        title: 'Postalarına sor',
      },
      boards: {
        description:
          'Neyin takip edileceğini anlat (para, seyahatler, siparişler), ajan bunları son altı aydan başlayarak postalarından toplasın ve grafiklere döksün.',
        title: 'Panolar',
      },
      followUps: {
        description:
          'Yanıt bekleyen postalar takip edilir, böylece hiçbir yazışma sessizce ölmez.',
        title: 'Takipler',
      },
      handle: {
        description:
          '“Bununla ilgilen” de, ajan yazışmayı hedefine doğru yürütsün: her gönderimden önce sorarak ya da kendi başına göndererek.',
        title: 'Bununla ilgilen',
      },
      people: {
        description:
          'Yazıştığın herkes hakkında, her hafta yenilenen kısa bir not, tam e-postalarının yanında.',
        title: 'Kişiler',
      },
      promises: {
        description:
          'Gönderdiğin postalarda verdiğin sözler, zamanı gelince sana geri döner, kimse peşine düşmek zorunda kalmadan.',
        title: 'Tutulan sözler',
      },
    },
    nav: {
      compare: 'Karşılaştır',
      features: 'Özellikler',
      pricing: 'Fiyatlar',
      signIn: 'Giriş yap',
    },
    plans: {
      everythingIn: (plan: string) => `${plan} planındaki her şey, artı`,
      forever: 'sonsuza dek',
      free: {
        description: 'Sıralama, kurallar ve koruma. Sonsuza dek.',
        features: [
          'Her e-posta sıralanır ve önemine göre puanlanır',
          'Arşivleyen, okundu yapan ya da abonelikten çıkan sade dille kurallar',
          'Topluluk spam kalkanı ve oltalama uyarıları',
          'Abonelikten çıktıktan sonra yazmayı sürdüren zombi gönderenler yakalanır',
          'Yanıt bekleyen postalar için otomatik takip',
          'Gmail’de erteleme, parçalar ve Fewmail etiketleri',
        ],
      },
      max: {
        description: 'Yoğun bir gelen kutusu için aynı ajan.',
        emails: (emails: string) => `Ayda ${emails} e-posta okunur`,
        messages: (messages: number) => `Ajana ayda ${messages} mesaj`,
        unlimited: 'Sınırsız pano ve devredilen yazışma',
      },
      monthly: 'Aylık',
      per: { month: '/ ay', year: '/ yıl' },
      pro: {
        description: 'Ajanın tamamı: okur, yazar ve hatırlar.',
        features: [
          'Bugün: günlük özet ve tek bir karar kuyruğu',
          'Senin üslubunla hazırlanan, yalnızca sen onaylayınca gönderilen yanıtlar',
          'Telegram: özet, onaylar ve sesli talimatlar',
          '“Bununla ilgilen”: ajan bir yazışmayı hedefine ulaştırır',
          'Sözler ve kişiler hatırlanır; para ya da takip ettiğin her şey için grafikli panolar',
          'Postalarına her şeyi sor, ayrıca kendi araçların için MCP',
        ],
        limits: (emails: string, messages: number) =>
          `Ayda ${emails} e-posta okunur ve ajana ${messages} mesaj; gürültü asla sayılmaz`,
      },
      tryFree: (days: number) => `${days} gün ücretsiz dene`,
      yearly: 'Yıllık · 2 ay ücretsiz',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Sıralama, sade dille kurallar ve koruma sonsuza dek ücretsiz. Pro, senin için okuyan, yazan ve hatırlayan ajan; Max ise yoğun bir gelen kutusuna yetecek kapasiteye sahip aynı ajan. Her hesap ${trialDays} gün Pro ile başlar, süre bitince de Ücretsiz planda kalırsın.`,
      otherTool: 'Başka bir araç mı düşünüyorsun?',
      title: 'Gelen kutusuna değil, ajana öde.',
    },
    promises: [
      'Onayın olmadan hiçbir şey gönderilmez',
      'Postaların depolanırken şifrelenir',
      'Asla model eğitmek için kullanılmaz',
    ],
    startFree: 'Ücretsiz başla',
    trialNote: (days: number) =>
      `Kart gerekmeden ${days} gün Pro. Sonra istediğin kadar ücretsiz.`,
  },
  skills: {
    bills: 'Yaklaşan faturalar ve ödemeler',
    cancel: 'Ücretli bir aboneliği iptal et',
    cleanup: 'Temizlenecek bültenler',
    followups: 'Sana hâlâ yanıt vermeyenler',
    reading: 'Günün bültenleri tek bir özette',
    today: 'Bugün seni bekleyenler',
    waiting: 'Yanıtını bekleyenler',
    week: 'E-postada haftan',
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
    listen: '🔊 Dinle',
    heard: (text: string) => `Duyduğum: “${text}”`,
    voiceFailed: 'Anlayamadım. Tekrar dene ya da yaz.',
    help: 'Ne istediğini yaz ya da söyle:\n• e-postaların hakkında sor: “Netflix ne zaman yenileniyor?”\n• ne yanıtlanacağını söyle: “Anna’ya yarın imzalayacağımı yaz”\n• değiştirmek için taslaklarımdan birini yanıtla',
    canceled: 'İptal edildi. Taslak kuyruğuna geri döndü.',
    sendingIn: (seconds: number) => `${seconds} sn içinde gönderiliyor`,
    undo: 'Geri al',
    commands: { brief: 'Bugünün özeti', queue: 'Seni bekleyenler' },
    connectFirst:
      'Önce Fewmail → Ayarlar → Entegrasyonlar’ı aç ve “Telegram’ı bağla”ya dokun.',
    connected:
      'Bağlandı. Özetini her sabah göndereceğim ve acil bir şey gelince haber vereceğim.\n\n/brief: bugünün özeti\n/queue: seni bekleyenler',
    done: 'Tamam',
    draft: 'Taslak:',
    edit: 'Düzenle',
    editPrompt:
      'Yerine kullanılacak metni gönder ya da “/” ile başlayarak nasıl değiştireceğimi söyle, örn. “/daha resmi”.',
    newDraft: 'Yeni taslak:',
    nothing: 'Şu an seni bekleyen bir şey yok.',
    proOnly:
      "Telegram, Fewmail Pro'nun bir parçası. Pro'ya geçmek için Fewmail'de Ayarlar → Plan'ı aç.",
    draftClipped:
      'Burada kısaltıldı. “Gönder” taslağın tamamını gönderir; Fewmail’de oku.',
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
    awaiting: 'Yanıt bekleniyor',
    hint: {
      notNow: 'Şimdi değil',
      setUp: 'Kur',
      turnOn: 'Aç',
    },
    later: (total: number, time: string) =>
      `${time} saatinde ${total} tane daha gelecek`,
    briefAt: (time: string) => `her gün ${time} özeti`,
    dates: 'Tarihler ve toplantılar',
    done: 'Tamam',
    firstRead:
      'Son üç günün e-postalarını okuyorum. İlgilenmen gerekenler burada kendiliğinden görünecek.',
    approvedMany: (n: number) => `${n} onaylandı`,
    listen: 'Özeti dinle',
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
    period: (days: number) =>
      days === 1 ? 'Son bir günde' : `Son ${days} günde`,
    pulse: {
      lists: (n: number) => `${n} e-posta listelerinden`,
      people: (n: number) => `${n} kişilerden`,
      total: (n: number, period: string) => `${period} ${n} e-posta`,
    },
    saved: (minutes: number) =>
      `Fewmail bu hafta sana yaklaşık ${formatMinutes('tr', minutes)} kazandırdı`,
    savedHow: (handled: number, replies: number) =>
      `Kendi hallettiği: ${handled} · Taslaktan gönderilen yanıtlar: ${replies}`,
    recent: (period: string) => `${period} ayrıca`,
    sent: 'Gönderildi',
    worthAttention: 'İlgini hak ediyor',
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
