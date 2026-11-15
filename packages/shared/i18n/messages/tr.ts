import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const tr: Messages = {
  actionDone: {
    heads_up: 'Anladım',
    commitment: 'Tamam',
    confirm: 'Onayladım',
    follow_up: 'Takip ettim',
    pay: 'Ödedim',
    read: 'Okudum',
    renew: 'Yeniledim',
    schedule: 'Planladım',
    security: 'Kontrol ettim',
    sign: 'İmzaladım',
  },
  actionLink: {
    confirm: 'Onayla',
    pay: 'Öde',
    read: 'Oku',
    renew: 'Yenile',
    sign: 'İmzala',
  },
  actionKind: {
    heads_up: 'Bilgi',
    cleanup: 'Hepsinden çık',
    consent: 'Onayla',
    commitment: 'Söz verildi',
    security: 'Kontrol et',
    spam: 'Spama taşı',
    archive: 'Arşivle',
    follow_up: 'Takip et',
    mark_read: 'Okundu yap',
    pay: 'Öde',
    read: 'Okumaya değer',
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
    pending: 'Ana Sayfa’da bekliyor',
  },
  agent: {
    decideOnHome: 'Ana sayfada karar ver',
    fromAgent: 'Ajan soruyor',
    mcpAsks: (client: string) => `${client} MCP üzerinden istiyor`,
    calendar: (email: string) => `${email} takviminde`,
    cc: (recipients: string) => `Bilgi: ${recipients}`,
    confirm: {
      dismiss_action: 'Bu kart atlansın mı?',
      delete_board: 'Bu pano ve içindeki her şey silinsin mi?',
      create_event: 'Bu etkinlik eklensin mi?',
      delete_event: 'Bu etkinlik silinsin mi?',
      update_event: 'Bu etkinlik değiştirilsin mi?',
      approve_action: 'Bu işlem yapılsın mı?',
      archive_thread: 'Bu yazışma arşivlensin mi?',
      clear_out: 'Bu e-posta grupları gelen kutusundan temizlensin mi?',
      undo_clear_out: 'Temizlenen her şey gelen kutusuna geri dönsün mü?',
      create_rule: 'Bu kural eklensin mi?',
      reply: 'Bu yanıt gönderilsin mi?',
      send_email: 'Bu e-posta gönderilsin mi?',
      snooze_thread: 'Bu yazışma ertelensin mi?',
      unsubscribe: 'Bu göndericiden abonelik iptal edilsin mi?',
      tidy_mail: 'Bu sakin e-postalar toplansın mı?',
      trash_thread: 'Bu ileti dizisi çöp kutusuna taşınsın mı?',
      report_spam: 'Bu gönderen spam olarak bildirilsin mi?',
      mark_not_spam: 'Bu ileti dizisi spamdan çıkarılsın mı?',
      move_to_inbox: 'Bu ileti dizisi gelen kutusuna geri taşınsın mı?',
    },
    retry: 'Tekrar dene',
    steps: {
      create_event: 'Etkinlik ekleniyor',
      delete_event: 'Etkinlik siliniyor',
      list_events: 'Takvime bakılıyor',
      update_event: 'Etkinlik değiştiriliyor',
      list_subscriptions: 'E-posta listeleri okunuyor',
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
      find_people: 'Adres aranıyor',
      get_board: 'Pano okunuyor',
      get_person: 'Kişi aranıyor',
      get_today: 'Bugün kontrol ediliyor',
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
      tidy_mail: 'Toplanıyor',
      trash_thread: 'Çöp kutusuna taşınıyor',
      report_spam: 'Spam bildiriliyor',
      mark_not_spam: 'Spamdan çıkarılıyor',
      move_to_inbox: 'Gelen kutusuna taşınıyor',
      create_board: 'Pano oluşturuluyor',
      update_board: 'Pano değiştiriliyor',
      delete_board: 'Pano siliniyor',
      add_board_chart: 'Grafik ekleniyor',
      add_to_board: 'Panoya ekleniyor',
      edit_board_entry: 'Kayıt düzeltiliyor',
      remove_board_entry: 'Panodan çıkarılıyor',
      rename_board_group: 'Grubun adı değiştiriliyor',
    },
    to: (recipients: string) => `Kime: ${recipients}`,
    until: (time: string) => `Şu zamana kadar: ${time}`,
    yes: {
      dismiss_action: 'Atla',
      delete_board: 'Sil',
      create_event: 'Ekle',
      delete_event: 'Sil',
      update_event: 'Kaydet',
      approve_action: 'Onayla',
      archive_thread: 'Arşivle',
      clear_out: 'Temizle',
      undo_clear_out: 'Geri getir',
      create_rule: 'Ekle',
      reply: 'Gönder',
      send_email: 'Gönder',
      snooze_thread: 'Ertele',
      unsubscribe: 'İptal et',
      tidy_mail: 'Topla',
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
    chartRemoved: 'Grafik kaldırıldı',
    addTo: 'Panoya ekle',
    added: (board: string) => `Eklendi: ${board}`,
    cancel: 'İptal',
    chart: {
      add: 'Grafik ekle',
      ask: 'Grafiği anlat',
      askPlaceholder: 'Mağazaya göre harcama, duruma göre siparişler…',
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
      moveEarlier: 'Öne al',
      moveLater: 'Geriye al',
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
    deleteConfirm: (name: string) => `“${name}” silinsin mi?`,
    deleteHint:
      'Kayıtları ve grafikleri de silinir. Postaların olduğu yerde kalır.',
    describe: 'Neleri topladığını değiştir',
    description: 'Neleri topladığı',
    descriptionPlaceholder:
      'Seyahatler: uçuşlar, oteller ve araç kiralama, maliyetleriyle',
    due: (when: string) => `Yaklaşıyor: ${when}`,
    empty: 'Henüz boş. Uygun e-postalar gelir gelmez burada görünür.',
    entries: (total: number) =>
      plural('tr', total, { other: (n) => `${n} kayıt` }),
    entry: {
      edited: 'Senin düzenlemen',
      nextOn: (date: string) => `sonraki: ${date}`,
      remove: 'Bu panoya ait değil',
      removed: 'Panodan çıkarıldı. Bundan ders çıkarır.',
    },
    expected: (when: string) => `Beklenen: ${when}`,
    filter: {
      clear: 'Filtreyi temizle',
      nothing: 'Eşleşen kayıt yok.',
      search: 'Kayıtlarda ara',
    },
    groups: {
      every: {
        month: 'her ay',
        quarter: 'her çeyrek',
        week: 'her hafta',
        year: 'her yıl',
      },
      expected: (date: string) => `beklenen: ${date}`,
      next: (date: string) => `sonraki: ${date}`,
      perMonth: (amount: string) => `${amount} / ay`,
      rename: 'Grubu yeniden adlandır',
      renameHint: 'İkisini birleştirmek için başka bir grubun adını ver.',
      showAll: (n: number) => `Tümünü göster (${n})`,
      showFewer: 'Daha az göster',
      title: 'Kim veya neye göre',
    },
    history: {
      capped: (n: number) => `Dönemin eşleşen en yeni ${n} e-postası okundu.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Dönemin postalarına bakılıyor…'
          : `${plural('tr', found, { other: (n) => `${n} e-posta` })} okunuyor · şimdiye kadar ${plural('tr', entries, { other: (n) => `${n} kayıt` })}`,
    },
    menu: 'Pano işlemleri',
    moveDown: 'Aşağı taşı',
    moveUp: 'Yukarı taşı',
    name: 'Ad',
    namePlaceholder: 'Seyahatler',
    new: 'Yeni pano',
    newHint:
      'Neyin toplanacağını kendi kelimelerinle anlat. Fewmail seçtiğin dönemin postalarında bulur, grafikleri seçer ve panoyu güncel tutar.',
    period: 'Dönem',
    periods: {
      1: 'Son 1 gün',
      7: 'Son 1 hafta',
      30: 'Son 1 ay',
      90: 'Son 3 ay',
      180: 'Son 6 ay',
      365: 'Son 1 yıl',
    },
    planning: 'Hazırlanıyor…',
    redescribe: 'Kaydet ve yeniden oku',
    redescribeHint:
      'Dönem yeni açıklamayla yeniden okunur. Düzenlediğin veya çıkardığın kayıtlar olduğu gibi kalır.',
    rename: 'Panoyu yeniden adlandır',
    save: 'Kaydet',
    settings: {
      bannerDays: 'Tarihten önce uyarı',
      days: (n: number) =>
        plural('tr', n, { other: (count) => `${count} gün önce` }),
      hint: 'Panonun ne kadar geriye kadar topladığı ve seni bir tarihten ne kadar önce uyaracağı.',
      never: 'Hiçbir zaman',
      title: 'Pano ayarları',
    },
    starter: {
      events: {
        description:
          'Biletler, rezervasyonlar ve randevular: nerede, ne zaman ve kiminle olmam gerektiği.',
        name: 'Etkinlikler',
      },
      health: {
        description:
          'Doktor randevuları, reçeteler, tahlil sonuçları ve sigorta talepleri: kime, ne zaman gittim ve ne kadar tuttu.',
        name: 'Sağlık',
      },
      home: {
        description:
          'Kira, faturalar, tamirler ve evle ilgili sözleşmeler: neyin vadesi geldi, kime ve ne kadar.',
        name: 'Ev',
      },
      invoices: {
        description:
          'İş için kestiğim ve aldığım faturalar: müşteri ya da tedarikçi, tutar, son tarih ve ödenip ödenmediği.',
        name: 'İş faturaları',
      },
      jobs: {
        description:
          'Başvurular, mülakatlar ve teklifler: hangi şirket, hangi pozisyon ve her biri ne aşamada.',
        name: 'İş arama',
      },
      learning: {
        description:
          'Kurslar, dersler ve okul ya da üniversite e-postaları: son tarihler, notlar, sertifikalar ve ücretleri.',
        name: 'Eğitim',
      },
      money: {
        description:
          'Ödemeler, abonelikler, faturalar ve iadeler: neye, kime, ne kadar ödediğim ve ne zaman yenilendiği.',
        name: 'Finans',
      },
      orders: {
        description:
          'Online siparişler ve teslimatlar: ne aldım, kimden ve şu an nerede.',
        name: 'Siparişler',
      },
      trips: {
        description:
          'Uçuşlar, trenler, oteller ve kiralamalar: nereye, ne zaman ve kaça gidiyorum.',
        name: 'Seyahatler',
      },
    },
    summary: {
      lastMonth: 'Geçen ay',
      perMonth: (amount: string) => `Ayda ${amount}`,
      recurring: (n: number) =>
        plural('tr', n, { other: (count) => `${count} düzenli` }),
      thisMonth: 'Bu ay',
      upcoming: 'Önümüzdeki 30 gün',
    },
  },
  bulk: {
    badge: (n: number) => `${n}+ Fewmail kullanıcısına gönderildi`,
    reason: (n: number) =>
      `Toplu e-posta: ${n}+ Fewmail kullanıcısı aynı metni aldı`,
  },
  calendar: {
    tomorrow: 'Yarın',
    noAccess: {
      allow: 'Erişime izin ver',
      description:
        'Google’ın takvimini Fewmail ile paylaşmasına izin verilmedi. Etkinlikleri burada görmek ve eklemek için izin ver.',
      title: 'Takvim bağlı değil',
    },
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
    saving: 'Etkinlik kaydediliyor…',
    scope: {
      this: 'Yalnızca bu etkinlik',
      following: 'Bu ve sonraki etkinlikler',
      all: 'Tüm etkinlikler',
    },
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
    partial:
      'Gmail temizliğin bir kısmını durdurdu. Taşınanlar geri getirilebilir.',
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
    busiest: (day: string, hours: string) =>
      `En yoğun gün: ${day} · en yoğun saat: ${hours}`,
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
    split: (people: string, lists: string, other: string) =>
      `${people} kişilerden · ${lists} bültenlerden · ${other} diğer`,
    title: { month: 'E-postada ayın', year: 'E-postada yılın' },
    unsubscribed: 'bülten bırakıldı',
  },
  reading: {
    markAllRead: 'Tümünü okundu işaretle',
    summary: 'Bültenleriniz ne dedi',
    worth: 'Tamamını okumaya değer',
    leftOut: (n: number) => `Özete alınmayan: ${n}, yeni bir şey yok.`,
    note: {
      inSummary: 'Özette',
      leftOut: 'Alınmadı',
    },
    digest: (n: number) => `Bültenler: ${n}`,
    lead: 'Bir günün bültenleri tek yerde, gelen kutusunu doldurmasınlar diye.',
    issues: 'Tüm sayılar',
    title: 'Okuma',
  },
  commitments: {
    title: 'Söz verdin',
  },
  compose: {
    attach: 'Dosya ekle',
    attachmentsTooLarge: (limit: string) =>
      `Ekler toplamda en fazla ${limit} olabilir.`,
    dropFiles: 'Eklemek için dosyaları bırakın',
    removeAttachment: 'Kaldır',
    discarded: 'Taslak silindi',
    backInQueue: 'İptal edildi. Taslak Ana Sayfa’ya geri döndü.',
    canceled: 'İptal edildi. E-postan düzenleyiciye geri döndü.',
    cc: 'Bilgi',
    discard: 'Sil',
    draftSaved: 'Taslak kaydedildi',
    forward: 'İlet',
    forwardedMessage: 'İletilen mesaj',
    from: 'Kimden',
    instructionPlaceholder: 'Nasıl olsun? (isteğe bağlı)',
    invalidRecipients: 'En az bir geçerli e-posta adresi ekle.',
    later: {
      inHour: 'Bir saat sonra',
      monday: 'Pazartesi sabahı',
      pick: 'Tarih ve saat seç',
      schedule: 'Planla',
      time: 'Saat',
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
    undoing: 'Geri alınıyor…',
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
    teachRule: 'Yeni kural öğret',
    upgrade: "Pro'ya geç",
    theme: {
      dark: 'Koyu',
      light: 'Açık',
      system: 'Sistem',
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
    calendarAccess:
      'Fewmail’in bu takvime erişimi yok. Takvim sayfasından izin ver.',
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
    attach: 'ekle',
    done: 'tamam',
    openLink: 'bağlantıyı aç',
    writeReminder: 'hatırlatma yaz',
    summary: 'özet',
    fromSender: 'gönderenden diğerleri',
    approvePicked: (n: number) => `seçili ${n} öğeyi onayla`,
    pick: 'seç',
    pickAll: 'tümünü seç',
    markRead: 'okundu yap',
    markUnread: 'okunmadı yap',
    unpick: 'seçimi temizle',
    pin: 'sabitle',
    unpin: 'sabitlemeyi kaldır',
    copyCode: 'kodu kopyala',
    restore: 'gelen kutusuna',
    calendarToday: 'bugün',
    newEvent: 'yeni etkinlik',
    period: 'önceki / sonraki',
    view: 'görünüm',
    skills: 'beceriler',
    unsubscribe: 'abonelikten çık',
    filter: 'filtre',
    reply: 'yanıtla',
    snooze: 'ertele',
    trash: 'çöp',
    ask: 'bunu sor',
    approve: 'onayla',
    approveAll: (n: number) => `bu türdeki ${n} kartın hepsini onayla`,
    archive: 'arşivle',
    close: 'kapat',
    draftReply: 'taslak yanıt',
    edit: 'düzenle',
    expand: 'aç / kapat',
    move: 'gezin',
    stackEmail: 'sonraki / önceki e-posta',
    open: 'aç',
    notOnBoard: 'bu panoya ait değil',
    rename: 'yeniden adlandır',
    clearFilter: 'filtreyi temizle',
    search: 'ara',
    send: 'gönder',
    skip: 'atla',
    keep: 'kalsın',
    stopEditing: 'düzenlemeyi bitir',
    rewrite: 'yeniden yaz',
    save: 'kaydet',
    deleteEvent: 'sil',
  },
  legal: {
    privacy: 'Gizlilik Politikası',
    englishOnly:
      'Bu belge İngilizce olarak sunulmaktadır; bağlayıcı sürüm İngilizce olandır.',
    terms: 'Hizmet Koşulları',
    updated: (date: string) => `Son güncelleme: ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `Ajanın bu ayki kullanım hakkı bitti. ${date} tarihinde yenilenecek.`,
  },
  notices: {
    freeUpSpace: 'Yer aç',
    mailLost: 'Fewmail Gmail erişimini kaybetti ve yeni postaları okumuyor.',
    mailboxLost: (email: string) => `Fewmail ${email} erişimini kaybetti.`,
    reconnect: 'Yeniden bağla',
    sendLimit: (email: string, when: string) =>
      `${email} Gmail’in günlük gönderme sınırına ulaştı. Gönderme ${when} yeniden çalışacak.`,
    signInAgain: 'Yeniden giriş yap',
    storageFull: (email: string) =>
      `${email} için Google depolama alanı doldu, bu yüzden Gmail yeni e-postaları geri çeviriyor.`,
    storageFullHint:
      'Yeniden e-posta almak için yer aç ya da daha fazla depolama al.',
  },
  login: {
    needsGmail:
      'Fewmail’in çalışması için Gmail erişimi gerekiyor. Yeniden giriş yap ve Google ekranında Gmail kutusunu işaretli bırak.',
    agree: ((slots) => [
      'Devam ederek ',
      slots.terms,
      ' ve ',
      slots.privacy,
      ' metinlerini kabul etmiş olursun.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail, Gmail’ini senin için okumak, düzenlemek ve göndermek için izin ister. İzin veren bir kural yazmadığın sürece senin onayın olmadan hiçbir şey gönderilmez ve arşivlenmez. Google Takvim’e ve kişilerin fotoğraflarını göstermek için kişilerine de erişim ister; ikisini de kaldırabilirsin.',
    continue: 'Google ile devam et',
    lead: 'Fewmail gelen kutunu senin yerine okur, senin üslubunla yanıtlar ve sadece gerçekten seni bekleyenleri gösterir.',
    messengers:
      'Mesajlaşma uygulamalarında da çalışır, ilk olarak Telegram’da: acil postaları al, yanıtları onayla ya da sadece sesli mesaj gönder.',
    title: 'Yalnızca önemli olan.',
  },
  mail: {
    inThread: (emails: string) => `Bu konuşmada ${emails}`,
    moreFrom: (name: string) => `${name} kişisinden diğerleri`,
    draftDeleted: 'Taslak silindi',
    unsubscribeConfirm: (name: string) => `${name} aboneliğinden çıkılsın mı?`,
    unsubscribeHint:
      'Fewmail listeden çıkar ve bu yazışmayı arşivler. Abonelikten çıkma geri alınamaz.',
    unsubscribing: 'Abonelikten çıkılıyor…',
    pin: 'Sabitle',
    unpin: 'Sabitlemeyi kaldır',
    pinned: 'Sabitlenenler',
    showAll: (n: number) => `${n} öğenin tümünü göster`,
    showFewer: 'Daha az göster',
    inGmail: (count: string) => `${count} Gmail’de`,
    markShownRead: (n: number) => `${n} tanesini okundu işaretle`,
    oneTimeCode: {
      archive: 'Kopyala ve arşivle',
      copied: 'Kod kopyalandı',
      copy: 'Kodu kopyala',
    photos: {
      allow: 'Erişime izin ver',
      description:
        'Fewmail bunları Google kişilerinden alır ve onları yalnızca bunun için kullanır.',
      title: 'Sana yazanların fotoğraflarını gör',
    },
      trash: 'Kopyala ve sil',
    },
    openUnsubscribePage: 'Sayfayı aç',
    unsubscribeYourself:
      'Bu listeden çıkmayı kendi sayfasında tamamlaman gerekiyor. O zamana kadar e-postaları arşivde.',
    allMailboxes: 'Tüm posta kutuları',
    filterAbout: {
      focused: 'Önce önemli postalar ve kişiler, bildirimler katlanmış',
      unread: 'Henüz okumadıkların, türe göre',
      categories: 'Tüm gelen kutusu türe göre, seni bekleyenler önce',
      inbox: 'Hepsi, en yenisi üstte',
    },
    find: {
      back: 'Postaya dön',
      open: 'Ara',
      recent: 'Son aramalar',
      tips: 'İpuçları',
      clearRecent: 'Temizle',
      describeExample: "Anna'dan geçen ayki faturalar",
      searching: 'E-postalarında arıyorum…',
      tip: {
        from: "Anna'dan gelen e-postalar",
        subject: 'Konu “invoice” içeriyor',
        attachment: 'Ekli olanlar',
        pdf: 'PDF ekli olanlar',
        unread: 'Okunmamış konuşmalar',
        week: 'Son 7 günden',
        describe: 'Ya da kendi sözlerinle anlat',
      },
    },
    group: {
      read: 'Okunanlar',
      earlier: 'Daha eski',
      important: 'Önemli',
      people: 'Kişiler',
      plans: 'Takvim ve seyahat',
      money: 'Para',
      updates: 'Bildirimler',
      newsletters: 'Bültenler',
      promotions: 'Promosyonlar',
    },
    unread: 'Okunmamış',
    block: 'Göndereni engelle',
    ignoresUnsubscribe: (name: string) =>
      `${name} abonelikten çıkmayı yok sayıyor`,
    ignoresUnsubscribeHint:
      "Fewmail abonelikten çıkmayı istedi ama bu gönderenin yine de yazmaya devam ettiği biliniyor. Postaları bundan sonra çöp kutusuna gitsin mi? Kurallar'dan geri alabilirsin.",
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
    markedRead: 'Okundu olarak işaretlendi',
    markUnread: 'Okunmadı olarak işaretle',
    markedUnread: 'Okunmadı olarak işaretlendi',
    attachment: 'ek',
    draftReply: 'Yanıt taslağı',
    drafting: 'Yazılıyor…',
    draftWaiting: 'Taslak Ana Sayfa’da bekliyor',
    due: (date: string) => `son tarih ${date}`,
    dueHint: 'Ajanın bu e-postada bulduğu son tarih',
    empty: 'Burada e-posta yok',
    emptyHint: 'Yeni e-postalar gelir gelmez burada görünür.',
    noResults: 'Hiçbir şey bulunamadı',
    noResultsHint: 'Başka kelimeler ya da başka bir klasör dene.',
    expectsReply: 'Yanıt bekliyor',
    filter: {
      categories: 'Kategoriler',
      archive: 'Arşiv',
      trash: 'Çöp kutusu',
      drafts: 'Taslaklar',
      spam: 'Spam',
      inbox: 'Gelen',
      snoozed: 'Ertelenen',
      sent: 'Gönderilenler',
      focused: 'Odak',
      unread: 'Okunmamış',
    },
    instruction: 'Ajana nasıl yanıtlayacağını söyle ya da sadece Enter’a bas',
    open: 'Aç',
    search: "Ara ya da anlat: Anna'dan geçen ayki faturalar",
    openInGmail: "Gmail'de aç",
    openFullPage: 'Tam sayfada aç',
    collapseFullPage: 'Listeye dön',
    unsubscribe: 'Abonelikten çık',
    unsubscribed: 'Abonelikten çıkıldı',
    unsubscribeFailed:
      'Bu gönderen tek tıkla abonelikten çıkmayı desteklemiyor, bu yüzden e-posta arşivlendi.',
    you: 'Sen',
    sent: 'Gönderildi',
    writeReply: 'Yanıt yaz…',
    replyTo: 'Yanıt adresi',
    date: 'Tarih',
    authentication: 'Kimlik doğrulama',
    toLine: (recipients: string) => `alıcı: ${recipients}`,
  },
  subscriptions: {
    leftBy: (percent: number) =>
      `Fewmail okurlarının %${percent} kadarı abonelikten çıktı`,
    unsubscribeHint: (emails: string) =>
      `Fewmail listeden çıkar ve gönderdiği her şeyi arşivler (bu ay ${emails}). Abonelikten çıkma geri alınamaz.`,
    archivedOnly:
      "Bu gönderenin Fewmail'in kullanabileceği bir abonelikten çıkma yolu yok, bu yüzden e-postaları arşivlendi, ama hâlâ listedesin ve yeni e-postalar gelmeye devam edecek.",
    count: (total: number) => `E-posta listesi: ${total}`,
    empty: 'Bu ay sana hiçbir e-posta listesi yazmadı.',
    lead: 'Bu ay sana yazan bültenler, kampanyalar ve diğer e-posta listeleri, en etkin olanlar önce. Hiç okumadıklarından çık: Fewmail listeden ayrılır ve gönderdiği her şeyi arşivler.',
    opened: (total: number) =>
      total === 0 ? 'hiçbiri açılmadı' : `${total} açıldı`,
    title: 'E-posta listeleri',
    unsubscribe: 'Abonelikten çık',
    unsubscribed: 'Abonelikten çıkıldı',
  },
  nav: {
    labels: 'Etiketler',
    folders: 'Klasörler',
    calendar: 'Takvim',
    subscriptions: 'E-posta listeleri',
    boards: 'Panolar',
    newBoard: 'Yeni pano',
    mail: 'Posta',
    reading: 'Okuma',
    rules: 'Kurallar',
    search: 'Ara veya sor…',
    settings: 'Ayarlar',
    syncFailed: 'Gmail eşitlemesi başarısız, yeniden deneniyor',
    syncing: 'Gelen kutun okunuyor…',
    loading: 'Yükleniyor',
    syncFailedIn: (email: string) =>
      `${email} eşitlemesi başarısız, yeniden deneniyor`,
    syncingIn: (email: string) => `${email} okunuyor…`,
    home: 'Ana Sayfa',
    trialLeft: (total: number) => `Pro denemesi · ${total} gün kaldı`,
    usage: (percent: number) => `Ajan · bu ayın %${percent} kadarı kullanıldı`,
    watching: 'Ajan gelen kutunu izliyor',
  },
  notifications: {
    many: (total: number) =>
      plural('tr', total, {
        other: (n) => `Fewmail’den ${n} yeni bildirim`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Ajanın e-postalarından doldurduğu sayfalar; son üç aydan başlar. En fazla ${max} tane seç; kendi panolarını sonra ekleyebilirsin.`,
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
    used: (percent: number) => `%${percent} kullanıldı`,
    about: (emails: string, messages: string) =>
      `Ayda yaklaşık ${emails} okunan e-posta ya da ajana ${messages} mesaj, istediğin karışımla.`,
    free: 'Ücretsiz',
    freeDescription:
      'Basit kurallarla hızlı ve sakin e-posta. İstediğin kadar ücretsiz.',
    includes:
      'Her ücretli plan ajanı ekler: her e-postanın okunup özetlenmesi, senin üslubunla yazılan yanıt taslakları, sade sözcüklerle kurallar, Telegram ve MCP.',
    manage: 'Faturalandırmayı yönet',
    price: (usd: number) => `$${usd} / ay`,
    priceYearly: (usd: number) => `$${usd} / yıl`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
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
    trialDescription: (date: string) =>
      `${date} tarihine kadar Pro’nun tamamı, sonra ücretsiz. Kart gerekmez.`,
    upgrade: 'Diğer planlar',
    usage: 'Bu ay',
  },
  headsUp: {
    deadline: 'Son gün yaklaşıyor',
    notYet: 'O zamandan beri bir şey gelmedi',
    price: 'Fiyat arttı',
    priceUp: (what: string, from: string, to: string) =>
      `${what}: ${from} yerine ${to}`,
    promised: 'Sana verilen söz',
  },
  queue: {
    addToCalendar: 'Takvime ekle',
    writeReminder: 'Hatırlatma yaz',
    approve: 'Onayla',
    delete: 'Sil',
    pick: 'Seç',
    picked: (n: number) => `${n} seçili`,
    unpick: 'Seçimi kaldır',
    askedByYou: 'Senin isteğinle',
    draftedInVoice: 'Senin üslubunla yazıldı',
    edit: 'Düzenle',
    send: 'Gönder',
    rewrite: 'Yeniden yaz',
    shorterInstruction: 'Daha kısa yap.',
    new: 'Yeni',
    skipStale: 'Hepsini atla',
    skipped: (n: number) => `Atlandı: ${n}`,
    stale: (n: number) => `Bir haftadan eski: ${n}`,
    skip: 'Atla',
  },
  reminders: {
    followUp: 'Takip et',
    noReply: 'Henüz yanıt yok',
  },
  risk: {
    prompt_injection: (domain: string) =>
      `${domain} bu e-postaya, e-posta okuyan asistanlar için talimatlar gizlemiş. Ajan bunları yok sayar; iletme ve istediğini yapma.`,
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
    deleted: 'Kural silindi',
    add: 'Kural ekle',
    count: (total: number) =>
      plural('tr', total, { other: (n) => `${n} kural` }),
    delete: 'Sil',
    describe: {
      alwaysShow: 'Her zaman Ana Sayfa’ya düşer',
      autonomous: 'Kendiliğinden yapılır, halledilenlerde listelenir',
      draft: 'Bir taslak Ana Sayfa’da seni bekler',
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
    lead: 'Ajana belirli postalarla ne yapacağını sade bir dille anlat. Her e-postayı bu kurallarla karşılaştırır.',
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
    disconnectConfirm: (name: string) => `${name} bağlantısı kesilsin mi?`,
    messengerDisconnectHint:
      'Bot sana yazmayı bırakır. Yeniden bağlamak için bu sayfadan yeni bir bağlantı gerekir.',
    readingDigest: {
      description:
        'Her sabah dünün bültenleri Telegram ve WhatsApp’a tek mesaj olarak, ikisi de bağlı değilse bildirim olarak gelir.',
      title: 'Bülten özeti',
    },
    account: 'Hesap',
    agent: 'Ajan',
    morningDescription: (timezone: string) =>
      `Bülten özeti ve pazartesi haftalık rapor, senin saat diliminde, ${timezone}`,
    morningTitle: 'Sabah mesajları',
    deleteAccount: 'Hesabı sil',
    deleteConfirm: 'Her şeyi sil',
    deleteDescription:
      'Hesabını, eşitlenen postaları, taslakları ve kuralları Fewmail’den hemen siler. Gmail’ine dokunulmaz. Ücretli plan hemen iptal edilir.',
    deleteFailed: 'Hesap silinmedi. Bir dakika sonra yeniden dene.',
    deleteSignIn:
      'Sen olduğunu doğrulamak için Google ile yeniden giriş yap, sonra hesabı sil.',
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
      'Uygulama, bot ve özetler. Yanıtlar e-postanın dilini izler.',
    legal: 'Yasal',
    mailboxes: {
      removeConfirm: (email: string) => `${email} kaldırılsın mı?`,
      removeHint:
        'Fewmail bu kutuyu okumayı bırakır ve orada okuduklarını unutur. Gmail’de hiçbir şey değişmez.',
      add: 'Gmail ekle',
      addDescription:
        'Başka bir Gmail hesabının postaları aynı Ana Sayfa’ya ve gelen kutusuna gelir. Bu hesapla buraya kimse giriş yapamaz: onunla giriş yapmak ayrı bir Fewmail açar.',
      added: 'Posta kutusu eklendi. Postaları bir dakika içinde görünür.',
      failed:
        'Posta kutusu eklenemedi. Gmail erişimine izin verip tekrar deneyin.',
      lost: 'Gmail erişimi kesildi. Yeniden bağlamak için tekrar ekleyin.',
      reading: 'Postalar okunuyor…',
      remove: 'Kaldır',
      retrying:
        'Gmail şu anda yanıt vermiyor. Fewmail kendiliğinden yeniden deneyecek.',
      signIn: 'Bu hesapla giriş yapıyorsunuz',
      signInChosen: 'Bu, giriş yaptığınız hesap. Başka birini seçin.',
      signInLost:
        'Gmail erişimi kesildi. Yeniden bağlamak için tekrar giriş yapın.',
      synced: (ago: string) => `${ago} eşitlendi`,
      title: 'Posta kutuları',
    },
    mcp: {
      disconnectHint: 'Yeniden bağlayana kadar postanı okuyamaz.',
      allow: 'İzin ver',
      connected: (ago: string) => `${ago} bağlandı`,
      copy: 'URL’yi kopyala',
      defaultName: 'MCP istemcisi',
      deny: 'Reddet',
      description:
        'Postalarını okuyabilir, yanıt taslağı yazabilir ve sen onayladıktan sonra gönderebilirler.',
      disconnect: 'Bağlantıyı kes',
      paste:
        'Bu URL’yi uygulamana bağlayıcı olarak ekle, sonra Fewmail’e giriş yap.',
      request: (app: string) => `${app} Fewmail’ini kullanmak istiyor`,
      title: 'Claude, Cursor veya herhangi bir MCP istemcisini bağla',
    },
    signedInWithGoogle: 'Google ile giriş yapıldı',
    signOut: 'Çıkış yap',
    snippets: {
      deleted: 'Parça silindi',
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
      messengerOff: "Acil e-postalar Fewmail'de kalır.",
      messengerOn: 'Acil e-postalar hemen sohbete gelir.',
      notConfigured: 'Tarayıcı bildirimleri bu sunucuda yapılandırılmamış.',
      off: 'Fewmail kapalıyken bile acil e-postaları burada al.',
      on: 'Acil e-postalar burada görünür. Aynı anda gelenler tek bildirimde toplanır.',
      title: 'Bildirimler',
      unsupported: 'Bu tarayıcı bildirim gösteremiyor.',
    },
    telegram: {
      connect: 'Telegram’ı bağla',
      disconnect: 'Bağlantıyı kes',
      linked:
        'Acil postalar hemen gelir. Taslakları sohbetten onayla ve düzenle.',
      linkedQuiet: 'Taslakları sohbetten onayla ve düzenle.',
      notConfigured: 'Telegram botu bu sunucuda yapılandırılmamış.',
      unlinked: 'Acil postaları al ve taslakları Telegram’dan onayla.',
    },
    whatsapp: {
      connect: 'WhatsApp’ı bağla',
      disconnect: 'Bağlantıyı kes',
      linked:
        'Acil postalar hemen gelir. Taslakları sohbetten onayla ve düzenle.',
      linkedQuiet: 'Taslakları sohbetten onayla ve düzenle.',
      notConfigured: 'WhatsApp botu bu sunucuda yapılandırılmamış.',
      unlinked: 'Acil postaları al ve taslakları WhatsApp’tan onayla.',
    },
    title: 'Ayarlar',
  },
  site: {
    meta: {
      assistant:
        'Fewmail, Gmail için bir yapay zekâ e-posta asistanıdır: her e-postayı önce kendisi okur, yanıtları senin üslubunla yazar ve sana yalnızca seni bekleyenleri gösterir. Ücretsiz başla.',
      assistantTitle: 'Gmail için yapay zekâ e-posta asistanı',
      compare:
        'Fewmail ile Superhuman, Shortwave ve SaneBox karşılaştırması: postanı senin yerine okuyan bir yapay zekâ ajanı, kendin daha hızlı okumanın bir yolu değil.',
      compareTitle: 'Yapay zekâ e-posta asistanları karşılaştırması',
      home: 'Fewmail, Gmail için yapay zekâ destekli bir e-posta asistanıdır: her e-postayı okur, yanıtları senin üslubunla yazar ve sana yalnızca seni bekleyenleri gösterir.',
      login:
        'Fewmail Gmail’ini senin yerine okur, senin üslubunla yanıtlar ve sana yalnızca gerçekten seni bekleyenleri gösterir.',
      mcp: 'Fewmail’i MCP sunucusu olarak Claude, ChatGPT, Claude Code veya Cursor’a bağla: Gmail’ini zaten kullandığın yapay zekâdan oku ve düzenle.',
      motto: 'gelen kutunda yalnızca önemli olan',
      pricing: (trialDays: number) =>
        `Fewmail Ana Sayfa, sıralama, kurallar ve spam koruması için sonsuza dek ücretsiz. Pro, ajanın tamamı, ${trialDays} ücretsiz günle ve kart olmadan başlar.`,
      tagline: 'Gmail için yapay zekâ e-posta ajanı',
    },
    chapters: {
      pricing: {
        description:
          'Ana Sayfa, sıralama, kurallar ve koruma sonsuza dek ücretsiz. Lite, Pro ve Max, senin için okuyan ve yazan her şeyi ekler; büyük planlar sadece bunu daha çok yapar.',
        label: 'Fiyatlar',
        title: (usd: number) =>
          `Sıralama ücretsiz. Ajan için başlangıç fiyatı $${usd}.`,
      },
      questions: {
        description: 'Kısa cevaplar burada. Uzunları gizlilik politikasında.',
        label: 'Sorular',
        title: 'Gmail’i bağlamadan önce.',
      },
    },
    closing: {
      lead: 'Gmail’i bir dakikada bağla. Fewmail son üç günün postalarıyla başlar, böylece ilk kararlar seni hemen bekliyor olur.',
      title: 'Sabahlarını geri al.',
    },
    mcp: {
      answer:
        'Cuma günkü başlangıç toplantısından önce imzalı sözleşme. Yanıtı çoktan hazırlandı, Fewmail kuyruğunda seni bekliyor.',
      clients: 'Şunlarla çalışır',
      emphasis: 'Claude ve ChatGPT’nin içinde.',
      free: 'Postanı okumak ve ajanın sıralaması ücretsiz.',
      label: 'MCP',
      lead: 'Fewmail’i MCP sunucusu olarak bağla ve postanı zaten kullandığın asistana sor. E-posta gönderen ya da Gmail’i değiştiren her şey yine de önce onayını ister.',
      question: 'Anna bu hafta benden ne bekliyor?',
      setup: 'Bir dakikada bağla',
      title: 'Postan, Claude ve ChatGPT’nin içinde.',
    },
    mcpPage: {
      copy: 'URL’yi kopyala',
      lead: 'Fewmail’i MCP sunucusu olarak bağla ve zaten kullandığın yapay zekâdan postanı sor. Postanı okumak ve ajanın sıralaması ücretsiz; taslak, gönderme ve kurallar Pro ile gelir.',
      safety:
        'E-posta gönderen ya da Gmail’i değiştiren her şey önce onayını ister. Asistana emir vermeye çalışan bir e-posta, asistan onu okumadan önce işaretlenir. Postan hiçbir zaman model eğitmek için kullanılmaz ve her uygulamanın bağlantısını ayarlardan kesebilirsin.',
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
    assistantPage: {
      abilities: {
        ask: {
          description:
            '“Uçağım ne zaman kalkıyor?” diye sor, yanıtı geldiği e-postalarla birlikte al: Fewmail’de, Telegram’da, WhatsApp’ta ya da Claude ve ChatGPT’de.',
          title: 'Postandan yanıtlar',
        },
        drafts: {
          description:
            'Yanıtlar önceden, senin tonunla ve gönderenin dilinde yazılır; sen onaylayana kadar kuyruğunda bekler.',
          title: 'Yanıtları senin üslubunla yazar',
        },
        protection: {
          description:
            'Değişen ödeme bilgileri, benzer alan adları ve bilinen dolandırıcılıklar, sen harekete geçmeden önce uyarı verir.',
          title: 'Oltalamaya karşı uyarır',
        },
        reading: {
          description:
            'Günün bültenleri konulara göre tek bir özete dönüşür; her cümle geldiği e-postaya bağlanır.',
          title: 'Bültenler tek bir özette',
        },
        rules: {
          description:
            'Bazı postalara ne olması gerektiğini tek cümleyle anlat, bir kurala dönüşsün. Yalnızca senin açtığın kurallar kendi başına çalışır.',
          title: 'Sade sözlerle kurallar',
        },
        sorting: {
          description:
            'Her e-posta bir özet ve önem puanı alır; böylece acil olan öne çıkar, makbuzlar, bildirimler ve promosyonlar yoluna çıkmaz.',
          title: 'Her e-postayı okur ve sıralar',
        },
      },
      abilitiesDescription:
        'Her şey zaten kullandığın Gmail’de olur ve ajanın yaptığı her şey nedeniyle birlikte kaydedilir.',
      abilitiesLabel: 'Neler yapar',
      abilitiesTitle: 'Bir asistan, yeni bir gelen kutusu değil.',
      compareTitle: 'Diğer yapay zekâ e-posta araçlarıyla karşılaştırması.',
      faq: (trialDays: number) => [
        {
          answer:
            'E-postaları senin yerine okumak, sıralamak ve yanıtlamak için yapay zekâ kullanan bir yazılım. Çoğu, hâlâ kendin okuduğun bir gelen kutusuna yalnızca özetler ve yazma yardımı ekler. Fewmail daha ileri gider: her şeyi önce kendisi okur, böylece yalnızca seni bekleyenleri görürsün.',
          question: 'Yapay zekâ e-posta asistanı nedir?',
        },
        {
          answer:
            'Fewmail konuları, içerikleri, özetleri ve taslakları veritabanında şifreler, postanı asla model eğitmek için kullanmaz ve onayın olmadan Gmail’de hiçbir şey göndermez ya da değiştirmez. İstediğin zaman bağlantısını kesip her şeyi silebilirsin.',
          question: 'Yapay zekânın e-postalarımı okuması güvenli mi?',
        },
        {
          answer:
            'Yanıt taslaklarını senin için yazar ama asla kendi başına göndermez. Her taslak onayın için kuyruğunda bekler, benzer olanları birlikte onaylayabilirsin.',
          question: 'E-postaları otomatik olarak yanıtlayabilir mi?',
        },
        {
          answer: `Evet. Ücretsiz plan her e-postayı sıralar, seni bekleyenleri tek bir sayfada toplar, kurallarını çalıştırır ve seni spamdan ve oltalamadan korur, hem de sonsuza dek. Taslaklar, özetler ve ajanın geri kalanı ücretli planlarla gelir; her hesap kart gerekmeden ${trialDays} gün Pro ile başlar.`,
          question:
            'Gmail için ücretsiz bir yapay zekâ e-posta asistanı var mı?',
        },
      ],
      faqTitle: 'Yapay zekâ e-posta asistanları hakkında.',
      lead: 'Fewmail, Gmail’ine gelen her e-postayı geldiği anda okur, gürültüyü temizler, yanıtları senin üslubunla yazar ve sana yalnızca kararını bekleyen birkaç şeyi getirir. Onayın olmadan hiçbir şey gönderilmez ya da değiştirilmez.',
      title: 'Gmail’ini senden önce okuyan yapay zekâ e-posta asistanı.',
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
        home: 'Seni bekleyen her şey tek sayfada',
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
        home: 'Canlı güncellenir, toplu onay, ücretsiz',
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
          'SaneBox postaları klasörlere ayırır, en üst planında taslak da yazar ve özetler. Fewmail önce her şeyi okur ve yalnızca senin verebileceğin birkaç kararı tek sayfada toplar.',
        them: {
          home: 'Filtrelenen postaların günlük derlemesi',
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
    faq: (trialDays: number) => [
      {
        answer:
          'Birçok yapay zekâ e-posta aracı sohbet kutulu yeni bir gelen kutusudur: her e-postayı yine sen okursun, sadece üstünde bir özetle. Fewmail, zaten kullandığın Gmail’in üzerinde çalışan bir yapay zekâ ajanı. Her e-postayı önce kendisi okur, yanıtları senin üslubunla yazar ve sana yalnızca seni bekleyen birkaç kararı getirir.',
        question:
          'Fewmail diğer yapay zekâ e-posta asistanlarından nasıl farklı?',
      },
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
          'Taslaklar, yanıtladığın e-postanın dilinde yazılır. Uygulama, özetler ve Telegram botu ise on beş dil arasından seçtiğin tek bir dili konuşur.',
        question: 'Hangi dilleri konuşuyor?',
      },
      {
        answer:
          'Şimdilik Gmail ve Google Workspace hesapları. Tek bir Fewmail’e birden fazla posta kutusu ekle; hepsinin postaları aynı Ana Sayfa’ya ve gelen kutusuna düşer.',
        question: 'Hangi e-posta hesaplarıyla çalışır?',
      },
    ],
    features: {
      description:
        'E-postanın eskiden bir öğleden sonranı alan işleri arka planda yapılır ve kontrol edebileceğin bir yerde listelenir.',
      items: {
        codes: {
          description:
            'Yeni bir kod Ana Sayfa’nın en üstünde ve e-postasının yanında, hiçbir şey açmadan kopyalanmaya hazır bekler. Ücretsiz.',
          title: 'Giriş kodları',
        },
        subscriptions: {
          description:
            'Bu ay yazan her e-posta listesi ve gerçekten kaç e-postasını açtığın. Herhangi birinden tek tuşla çık. Ücretsiz.',
          title: 'E-posta listeleri',
        },
        ask: {
          description:
            'Sade bir dille her şeyi sor, yanıtı kendi postalarından, dayandığı e-postalarla birlikte al.',
          title: 'Postalarına sor',
        },
        boards: {
          description:
            'Para, ücretli abonelikler, seyahatler, siparişler: neyin takip edileceğini anlat, ajan bunları bir yıla kadar postalardan grafiklerle toplasın.',
          title: 'Panolar',
        },
        calendar: {
          description:
            'Tüm posta kutularının takvimi tek bir görünümde. Bir e-postada önerilen toplantı, sen evet deyince etkinliğe dönüşür.',
          title: 'Takvim',
        },
        clearOut: {
          description:
            'Biriken her şey tek seferde gider: posta kutusu başına 50.000 e-postaya kadar, hepsi tek bir etiket altında, böylece tek tıkla hepsi geri gelir. Ücretsiz.',
          title: 'Gelen kutusunu temizle',
        },
        reading: {
          description:
            'Günün bültenlerinden tek bir özet: konulara göre haberler, her cümle kaynağına bağlı ve baştan sona okumaya değenler.',
          title: 'Okuma',
        },
        voice: {
          description:
            'Bültenlerinin özetini sesli dinle. Telegram veya WhatsApp’tan sesli mesaj gönder, ajan sesli yanıt versin.',
          title: 'Okumak yerine dinle',
        },
        wrapped: {
          description:
            'E-postada ayın ya da yılın: ne geldi, ne halledildi, ne kadar zaman kazandın. Paylaşabilirsin, hiçbir isim görünmez.',
          title: 'E-postada yılın',
        },
      },
      label: 'Ve gerisi',
      title: 'Bir asistanın yapacağı diğer her şey.',
    },
    footer: {
      legal: 'Yasal',
      product: 'Ürün',
      tagline:
        'Gmail’ini okuyan ve sana yalnızca seni bekleyenleri gösteren yapay zekâ e-posta ajanı.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'artık geride.',
      label: 'Geride kalanlar',
      rows: [
        {
          fix: 'Temizlik, biriken her şeyi tek seferde kaldırır: eski reklamlar, okunmuş bildirimler, hiç açmadığın listeler. Tek tıkla her e-posta geri gelir.',
          problem: 'Kimsenin asla okumayacağı binlerce e-posta.',
        },
        {
          fix: 'Yanıtlar önceden, senin üslubunla ve onların dilinde hazırlanır. Benzer olanları ⇧⏎ ile birlikte onaylarsın, yine de her birine göz atmak sana kalır.',
          problem: 'Gece yarısı e-posta yanıtlamak.',
        },
        {
          fix: 'Tek tuş, bir insanın yapacağı gibi abonelikten çıkarır: tek tık, abonelikten çıkma sayfası ya da bir e-posta. Yazmaya devam eden göndericiler yakalanır ve spam olarak önerilir.',
          problem: 'Hiç abone olmadığın bültenler.',
        },
        {
          fix: 'Günün bültenleri konulara göre tek bir özete dönüşür, okumaya değenler de belirtilir.',
          problem: 'Okumayı düşündüğün bültenler.',
        },
        {
          fix: 'Değişen ödeme bilgileri, benzer alan adları ve bilinen oltalama siteleri, sen harekete geçmeden önce uyarı verir.',
          problem: 'Yeni banka bilgileriyle gelen bir fatura.',
        },
        {
          fix: 'Gönderdiğin postalarda verdiğin sözler zamanı gelince sana geri döner, kimsenin yanıtlamadığı yazışmalar da takip edilir.',
          problem: 'Söz verip unuttuğun o şey.',
        },
        {
          fix: 'Telegram’a ya da WhatsApp’a yalnızca acil postalar gelir. Gerisi önceden ayıklanmış halde Ana Sayfa’da, ne zaman bakarsan seni bekler.',
          problem: 'Akşam yemeğinde, ne olur ne olmaz diye postalara bakmak.',
        },
      ],
      title: 'E-posta dertlerin artık geride.',
    },
    hero: {
      needs: {
        emphasis: 'seni bekliyor.',
        lead: (handled: string) =>
          `Anna sözleşmeyi bekliyor, Northwind’in faturasının son günü gelecek hafta ve Marco perşembeyi istiyor. ${handled} bülten ve bildirim halledildi; yeni posta geldikçe Ana Sayfa kendini günceller.`,
        tag: 'Ana Sayfa · Perşembe, 08:12',
        title: 'Üç şey seni bekliyor.',
      },
      fates: {
        archived: 'Arşivlendi',
        markedRead: 'Okundu yapıldı',
        spam: 'Spam',
        summarised: 'Özetlendi',
        unsubscribed: 'Abonelikten çıkıldı',
      },
      handled: ((slots) => [
        slots.count,
        ' halledildi, her biri nedeniyle',
      ]) as Rich<'count'>,
      inbox: 'Gelen kutusu',
      lead: 'Bültenler, makbuzlar, bildirimler, bir oltalama bağlantısı ve bir yerlerde gerçekten önemli olan üç e-posta. Fewmail, hepsini senin yerine okuyan yapay zekâ ajanı.',
      needYou: ((slots) => [slots.count, ' seni bekliyor']) as Rich<'count'>,
      queue: [
        {
          reason: 'Sözleşme yarın bekleniyor',
          summary:
            'İmzalı sözleşmenin cuma günkü başlangıç toplantısından önce geri gelmesi gerekiyor.',
        },
        {
          reason: 'Fatura · $1,240, son gün 20 Kasım',
          summary:
            'Web sitesi yenilemesi için ekim faturası. Banka bilgileri geçen seferkiyle aynı.',
        },
        {
          reason: 'Toplantı önerisi',
          summary:
            'Perşembe 15:00’i öneriyor. Sen 16:00’dan itibaren boşsun, bu yüzden taslak saat dördü soruyor.',
        },
      ],
      reading: {
        emphasis: 'her birini okur.',
        lead: 'Gürültüyü arşivler, hiç açmadığın bültenlerden aboneliğini iptal eder ve dolandırıcılığı kapıda durdurur. Yaptığı her şey nedeniyle birlikte yazılır, böylece kontrol edebilirsin.',
        title: 'Fewmail her birini okur.',
      },
      remind: '19 Kasım’da hatırlat',
      remindPlan: 'Faturalarına ekler ve 19 Kasım’da sana hatırlatır.',
      start: 'Google ile ücretsiz başla',
      title: 'E-posta senin işin değil.',
      home: 'Ana Sayfa',
      tryQueue: 'Kuyruğu dene',
      unread: ((slots) => [slots.count, ' okunmamış']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        'Gelen kutunda ',
        slots.count,
        ' okunmamış',
      ]) as Rich<'count'>,
      willDo: 'Fewmail ne yapacak',
    },
    nav: {
      assistant: 'Yapay zekâ e-posta asistanı',
      compare: 'Karşılaştır',
      features: 'Özellikler',
      mcp: 'MCP sunucusu',
      pricing: 'Fiyatlar',
      signIn: 'Giriş yap',
    },
    play: {
      again: 'Yeniden temizle',
      doneLead: (handled: string) =>
        `Üç karar verdin. Fewmail geri kalan ${handled} tanesini halletti ve nedenini yazdı.`,
      doneTitle: 'Bugünlük bu kadar.',
      emphasis: 'iki dakikada.',
      handled: [
        'Lumen Weekly: son 30 sayının hiçbirini açmadın',
        'paypa1-billing.com, paypal.com gibi görünüyor',
        'Parcelhub: teslimat bildirimleri, “Makbuzlar ve kargo” kuralıyla',
      ],
      handledTitle: 'Sen uyurken halledilenler',
      label: 'Dene',
      lead: 'Artık sabahlar böyle görünüyor. Taslaklar yazıldı, nedenler ortada, kararı sen verirsin. Hadi, temizle.',
      left: (count: number) => `${count} karar bekliyor`,
      title: 'Tüm gelen kutun, iki dakikada.',
    },
    plans: {
      agent: 'Ajan',
      emails: 'Ajanın ayda okuduğu e-posta',
      everyPlan: 'Her planda',
      messages: 'ya da ajana mesaj',
      oneAllowance:
        'Ajanın yaptığı her şey için tek bir kullanım hakkı: kullandığın kadar ödersin, gereksiz e-postalar hiç sayılmaz',
      forever: 'sonsuza dek',
      free: {
        description: 'Ana Sayfa, sıralama, kurallar ve koruma. Sonsuza dek.',
      },
      max: {
        description: 'Yoğun bir gelen kutusu için aynı ajan.',
      },
      monthly: 'Aylık',
      per: { month: '/ ay', year: '/ yıl' },
      lite: {
        description: 'Ajanın tamamı: okur, yazar ve hatırlar.',
      },
      pro: {
        description: 'Aynı ajan, daha çok posta için yer.',
      },
      tryFree: (days: number) => `${days} gün ücretsiz dene`,
      yearly: 'Yıllık · 2 ay ücretsiz',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Ana Sayfa, sıralama, sade dille kurallar ve koruma sonsuza dek ücretsiz. Pro, senin için okuyan, yazan ve hatırlayan ajan; Max ise yoğun bir gelen kutusuna yetecek kapasiteye sahip aynı ajan. Her hesap ${trialDays} gün Pro ile başlar, süre bitince de Ücretsiz planda kalırsın.`,
      otherTool: 'Başka bir araç mı düşünüyorsun?',
      title: 'Gelen kutusuna değil, ajana öde.',
    },
    startFree: 'Ücretsiz başla',
    trialNote: (days: number) =>
      `Kart gerekmeden ${days} gün Pro. Sonra istediğin kadar ücretsiz.`,
    trust: {
      emphasis: 'sorar.',
      label: 'Postan, kararın',
      places:
        'Zaten kullandığın Gmail’in üzerinde çalışır ve sana şuralardan ulaşır',
      title: 'Harekete geçmeden önce sorar.',
      vows: [
        {
          description:
            'Taslaklar seni bekler. Yalnızca senin oluşturduğun ya da tuttuğun kurallar kendi başına arşivleyebilir, okundu yapabilir veya abonelikten çıkabilir; yaptıkları her şey Halledilenler’de listelenir.',
          title: 'Onayın olmadan hiçbir şey gönderilmez.',
        },
        {
          description:
            'Konular, içerikler, özetler ve taslaklar veritabanımızda şifrelenir. Kaydedilen taslaklar bizde değil, Gmail’de kalır.',
          title: 'Depolanırken şifrelenir.',
        },
        {
          description:
            'Spam kalkanı herkesten anahtarlı hash’ler aracılığıyla öğrenir. Postandan tek bir adres ya da tek bir kelime bile paylaşılmaz.',
          title: 'Asla model eğitmek için kullanılmaz.',
        },
      ],
    },
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
    imagesHidden: 'Spamdaki görseller gizlenir.',
    openFile: {
      action: 'Aç',
      description:
        'Bu e-posta spam klasöründe. Dosyalarını yalnızca gönderene güveniyorsan aç.',
      title: (name: string) => `${name} açılsın mı?`,
    },
    showImages: 'Görselleri göster',
  },
  starterRules: {
    alwaysShow:
      'Güvenlik uyarıları, ödeme tarihi gelen faturalar, bankamdan veya devletten gelen her şey',
    newsletters: 'Bültenler ve özet e-postalar',
    notifications: 'Araç ve hizmetlerden gelen otomatik bildirimler',
    promotions: 'Promosyonlar, pazarlama ve istenmeyen satış e-postaları',
    receipts: 'Makbuzlar, sipariş ve kargo onayları',
  },
  telegram: {
    approveAlike: 'Aynı türdeki tüm kartları birden onayla:',
    chatTaken:
      'Bu sohbet zaten başka bir Fewmail hesabına bağlı. Önce oradan Telegram bağlantısını kes (Ayarlar → Entegrasyonlar), sonra bağlantıyı yeniden aç.',
    queueChanged: 'Kartlar bu arada değişti. Şu an seni bekleyenler:',
    heard: (text: string) => `Duyduğum: “${text}”`,
    voiceFailed: 'Anlayamadım. Tekrar dene ya da yaz.',
    help: 'Ne istediğini yaz ya da söyle:\n• e-postaların hakkında sor: “Netflix ne zaman yenileniyor?”\n• ne yanıtlanacağını söyle: “Anna’ya yarın imzalayacağımı yaz”\n• bana bir iş ver: “seyahatler için bir pano oluştur”\n• değiştirmek için taslaklarımdan birini yanıtla',
    canceled: 'İptal edildi. Taslak kuyruğuna geri döndü.',
    sendingIn: (seconds: number) => `${seconds} sn içinde gönderiliyor`,
    undo: 'Geri al',
    commands: { queue: 'Seni bekleyenler' },
    connectFirst: (url: string) =>
      `Merhaba! Ben Fewmail. Burada, Telegram’da acil bir e-posta geldiğinde haber veririm, seni bekleyenleri gösteririm ve onayladığın yanıtları gönderirim.\n\nBu sohbet henüz Fewmail’ine bağlı değil. Bir dakika sürer:\n1. Fewmail ayarlarını aç: ${url}\n2. Entegrasyonlar’da “Telegram’ı bağla”ya dokun (Fewmail Pro’nun parçası).\n3. Telegram seni buraya geri getirir: Başlat’a bas, hepsi bu.`,
    connected:
      'Bağlandı. Acil bir şey gelince haber vereceğim.\n\n/queue: seni bekleyenler',
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
    working: 'Yapılıyor…',
    allKinds: 'Tümü',
    ruleOffer: {
      lead: 'Ajan bunu eşleşen postalar için kendisi yapabilir. Sen evet diyene kadar kapalı kalır.',
      no: 'Kapalı kalsın',
      turnedOn: "Açıldı. Kurallar'dan değiştirebilirsin.",
      yes: 'Aç',
    },
    newSender: {
      archive: 'Her zaman arşivle',
      archived:
        'Bu göndericiden gelen yeni e-postalar arşivlenecek. Kurallar bölümünden değiştirebilirsin.',
      keep: 'Her zamanki gibi tut',
      label: 'Yeni gönderici',
      lead: (count: number, opened: number) =>
        `İki haftada ${count} e-posta, ${opened === 0 ? 'hiçbiri açılmadı' : `${opened} tanesi açıldı`}`,
    },
    readingNow: (total: number) =>
      plural('tr', total, {
        other: (n) => `Ajan ${n} yeni e-postayı okuyor`,
      }),
    allDone: 'Hepsi tamam. Seni bekleyen bir şey yok.',
    allDoneLead:
      'Yeni e-postaları okumaya devam ediyorum, ilgilenmen gereken her şey burada görünecek.',
    byRules: (n: number) => `Kuralların ${n} tanesini halletti.`,
    decisions: 'Kararlar',
    journal: {
      approved: 'Evet dedin',
      byRule: (rule: string) => `Kuralın: ${rule}`,
      failed: 'Olmadı',
      lead: 'Son 7 gün. E-postandaki, takvimindeki ya da panolarındaki her değişiklik senin onayınla ya da açtığın bir kuralla yapıldı.',
      title: 'E-postanda yapılanlar',
    },
    progress: (done: number, total: number) => `${done}/${total}`,
    readAll: 'Hepsini okudum. Onayın olmadan e-postanda hiçbir şey değişmez.',
    worthKnowing: 'Bilmekte fayda var',
    quick: 'Hızlı',
    needsLook: 'Kendin bak',
    tidy: {
      failed: (emails: string) =>
        `${emails} Gmail’de değiştirilemedi. Birazdan tekrar dene.`,
      confirm: (emails: string) => `${emails} toplansın mı?`,
      running: 'Toplanıyor…',
      unsubscribeHint:
        'Bazıları Fewmail’in çıkacağı e-posta listeleri ve abonelikten çıkma geri alınamaz.',
      archive: (n: number) => `${n} arşivlenecek`,
      review: 'Kontrol et',
      reviewLead:
        'Her e-posta, ajanın ne yapacağı ve nedeniyle. Doğru görüneni onayla, olduğu gibi kalması gerekeni bırak.',
      reviewTitle: 'Ajanın önerilerini kontrol et',
      done: (n: number) => `${n} toplandı`,
      keep: 'Kalsın',
      mark_read: (n: number) => `${n} okundu yapılacak`,
      run: 'Tümünü onayla',
      total: (n: number) => `Ajanın toparlamayı önerdiği e-posta: ${n}`,
      unsubscribe: (n: number) => `${n} abonelikten çıkılacak`,
      untilYouApprove: 'Sen onaylayana kadar e-postanda hiçbir şey değişmez',
      spam: (n: number) => `${n} spama taşınacak`,
      trash: (n: number) => `${n} silinecek`,
    },
    pauseListening: 'Duraklat',
    resumeListening: 'Devam et',
    awaiting: 'Yanıt bekleniyor',
    hint: {
      messengers: {
        lead: 'Acil e-postaları al ve taslakları zaten kullandığın mesajlaşma uygulamasında onayla.',
        title: 'Telegram veya WhatsApp',
      },
      notNow: 'Şimdi değil',
      setUp: 'Kur',
      turnOn: 'Aç',
    },
    dates: 'Tarihler ve toplantılar',
    done: 'Tamam',
    firstRead:
      'Önce son üç günün e-postaları. İlgilenmen gerekenler burada kendiliğinden görünecek. Sen “evet” demeden hiçbir şey değişmez.',
    approvedMany: (n: number) => `${n} onaylandı`,
    listen: 'Dinle',
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
    recent: (period: string) => `${period} ayrıca`,
    sent: 'Gönderildi',
    codes: 'Giriş kodları',
    worthAttention: 'İlgini hak ediyor',
  },
  upgrade: {
    ask: 'Postana sor',
    hints: {
      ask: "Fewmail Pro'nun parçası: istediğini kendi kelimelerinle sor, yanıtı kendi postalarından al.",
      boards:
        "Fewmail Pro'nun parçası: neyin toplanacağını anlat, ajan postalarında bulsun ve güncel tutsun.",
      drafts:
        "Fewmail Pro'nun parçası: ajan yanıtı senin üslubunla yazar, sen düzenleyip gönderirsin.",
    },
  },
  whatsapp: {
    phoneTaken:
      'Bu numara zaten başka bir Fewmail hesabına bağlı. Önce oradan WhatsApp bağlantısını kes (Ayarlar → Entegrasyonlar), sonra mesajı yeniden gönder.',
    connectFirst: (url: string) =>
      `Merhaba! Ben Fewmail. Burada, WhatsApp’ta acil bir e-posta geldiğinde haber veririm, seni bekleyenleri gösteririm ve onayladığın yanıtları gönderirim.\n\nBu numara henüz Fewmail’ine bağlı değil. Bir dakika sürer:\n1. Fewmail ayarlarını aç: ${url}\n2. Entegrasyonlar’da “WhatsApp’ı bağla”ya dokun (Fewmail Pro’nun parçası).\n3. WhatsApp hazır bir mesajla açılır — gönder, hepsi bu.`,
    connected:
      'Bağlandı. Acil bir şey geldiğinde yazacağım. Herhangi bir e-postayı yanıtlamak için metin ya da sesli mesaj gönder.',
    proOnly:
      "WhatsApp, Fewmail Pro'nun bir parçası. Pro'ya geçmek için Fewmail'de Ayarlar → Plan'ı aç.",
  },
  zombie: {
    badge: (share: number) =>
      `Kişilerin %${share} kadarının abonelik iptalini yok sayıyor`,
    reason: 'Abonelikten çıktıktan sonra da e-posta göndermeye devam etti',
  },
}
