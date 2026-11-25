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
    auto_done: 'kendiliğinden yapıldı',
    dismissed: 'atlandı',
    done: 'tamam',
    failed: 'başarısız',
    pending: 'seni bekliyor',
  },
  agent: {
    decideOnHome: 'Fewmail’de karar ver',
    fromAgent: 'Ajan soruyor',
    mcpAsks: (client: string) => `${client} MCP üzerinden istiyor`,
    calendar: (email: string) => `${email} takviminde`,
    cc: (recipients: string) => `Bilgi: ${recipients}`,
    confirm: {
      dismiss_action: 'Bu kart atlansın mı?',
      create_event: 'Bu etkinlik eklensin mi?',
      delete_event: 'Bu etkinlik silinsin mi?',
      update_event: 'Bu etkinlik değiştirilsin mi?',
      approve_action: 'Bu işlem yapılsın mı?',
      archive_thread: 'Bu yazışma arşivlensin mi?',
      clear_out: 'Bu e-posta grupları gelen kutusundan temizlensin mi?',
      undo_clear_out: 'Temizlenen her şey gelen kutusuna geri dönsün mü?',
      create_bot: 'Bu bot oluşturulsun mu?',
      update_bot: 'Bu bot değiştirilsin mi?',
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
      create_bot: 'Bot oluşturuluyor',
      update_bot: 'Bot değiştiriliyor',
      dismiss_action: 'Atlanıyor',
      draft_reply: 'Yanıt yazılıyor',
      create_draft: 'Taslak kaydediliyor',
      find_people: 'Adres aranıyor',
      get_person: 'Kişi aranıyor',
      get_today: 'Bugün kontrol ediliyor',
      list_handled: 'Halledilenlere bakılıyor',
      list_mail: 'E-postalarda aranıyor',
      get_bot_chat: 'Sohbet okunuyor',
      list_bots: 'Botların okunuyor',
      read_thread: 'Yazışma okunuyor',
      redraft_action: 'Taslak yeniden yazılıyor',
      refresh: 'Yeni e-postalar alınıyor',
      remind_later: 'Hatırlatıcı kuruluyor',
      send_email: 'Gönderiliyor',
      snooze_thread: 'Erteleniyor',
      unsubscribe: 'Abonelik iptal ediliyor',
      tidy_mail: 'Toplanıyor',
      trash_thread: 'Çöp kutusuna taşınıyor',
      report_spam: 'Spam bildiriliyor',
      mark_not_spam: 'Spamdan çıkarılıyor',
      move_to_inbox: 'Gelen kutusuna taşınıyor',
      list_promises: 'Sözler kontrol ediliyor',
      set_promise_status: 'Söz güncelleniyor',
    },
    to: (recipients: string) => `Kime: ${recipients}`,
    until: (time: string) => `Şu zamana kadar: ${time}`,
    yes: {
      dismiss_action: 'Atla',
      create_event: 'Ekle',
      delete_event: 'Sil',
      update_event: 'Kaydet',
      approve_action: 'Onayla',
      archive_thread: 'Arşivle',
      clear_out: 'Temizle',
      undo_clear_out: 'Geri getir',
      create_bot: 'Bot oluştur',
      update_bot: 'Kaydet',
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
  byBot: 'bir botla',
  bulk: {
    badge: (n: number) => `${n}+ Fewmail kullanıcısına gönderildi`,
    reason: (n: number) =>
      `Toplu e-posta: ${n}+ Fewmail kullanıcısı aynı metni aldı`,
  },
  cold: {
    reason:
      'Soğuk e-posta: hiç yazmadığın bir yabancı bir şey satmaya çalışıyor',
  },
  calendar: {
    tomorrow: 'Yarın',
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
  board: {
    lead: {
      coming: (total: number) =>
        plural('tr', total, {
          one: () => 'Bir son tarih yaklaşıyor.',
          other: (n) => `${n} son tarih yaklaşıyor.`,
        }),
      owed: (amounts: string) => `Alacağın: ${amounts}.`,
      promised: (total: number) =>
        plural('tr', total, {
          one: () => 'Bir söz verdin.',
          other: (n) => `${n} söz verdin.`,
        }),
      waiting: (total: number) =>
        plural('tr', total, {
          one: () => 'Sana verilen bir söz hâlâ açık.',
          other: (n) => `Sana verilen ${n} söz hâlâ açık.`,
        }),
    },
    section: {
      coming: 'Yaklaşan',
      owed: 'Alacakların',
      promised: 'Verdiğin sözler',
    },
    state: {
      acknowledged: 'yanıt verdiler, henüz yapılmadı',
      broken: 'olmadı',
      cancelled: 'iptal edildi',
      fulfilled: 'yapıldı',
      in_progress: 'yolda',
      open: 'bekliyor',
      overdue: 'gecikti',
    },
    by: (date: string) => `${date} tarihine kadar`,
    lastDay: (date: string) => `son tarih: ${date}`,
    done: 'Yapıldı',
    forget: 'Unut',
    reopen: 'Yeniden aç',
    markedDone: 'Yapıldı olarak işaretlendi',
    forgotten: 'Unutuldu',
    reopened: 'Yeniden açıldı',
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
    ready: (emails: string) => `${emails} temizlenebilir`,
    review: 'İncele',
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
    handled: 'e-postayı Fewmail halletti',
    handledHint:
      'Fewmail onayın olmadan Gmail’de hiçbir şeyi değiştirmez. Bir botun kendi başına çalışmasına izin ver, bu tür postaları senin için halletsin.',
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
    markAllRead: 'Tümünü okundu olarak işaretle',
    summary: 'Bültenlerinde neler var',
    worth: 'Tamamını okumaya değer',
    leftOut: (n: number) => `Özete alınmayan: ${n}, yeni bir şey yok.`,
    note: {
      inSummary: 'Özette',
      leftOut: 'Alınmadı',
    },
    digest: (n: number) => `Bültenler: ${n}`,
    lead: 'Bir günün bültenleri tek yerde, gelen kutusunu doldurmasınlar diye.',
    issues: 'Tüm sayılar',
    empty: 'Henüz bülten yok',
    emptyHint:
      'Her sabah ajan bültenlerindeki haberleri buraya yazacak; her satır geldiği e-postaya bağlanır.',
    title: 'Okuma',
  },
  commitments: {
    title: 'Söz verdin',
  },
  compose: {
    attach: 'Dosya ekle',
    attachmentsTooLarge: (limit: string) =>
      `Ekler toplamda en fazla ${limit} olabilir.`,
    dropFiles: 'Eklemek için dosyaları bırak',
    removeAttachment: 'Kaldır',
    discarded: 'Taslak silindi',
    backInQueue: 'İptal edildi. Taslak yine botunun sohbetinde bekliyor.',
    canceled: 'İptal edildi. E-postan düzenleyiciye geri döndü.',
    cc: 'Bilgi',
    discard: 'Sil',
    draftSaved: 'Taslak kaydedildi',
    forward: 'İlet',
    forwardedMessage: 'İletilen mesaj',
    from: 'Kimden',
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
    appearance: 'Görünüm',
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
    crashTitle: 'Fewmail bu sayfada tökezledi',
    crashLead:
      'E-postaların güvende, Gmail’de hiçbir şey değişmedi. Sayfayı yenile; tekrar olursa zaten haberimiz olur.',
    missingTitle: 'Bu adreste bir şey yok',
    calendarAccess:
      'Fewmail’in bu takvime erişimi yok. Takvim sayfasından izin ver.',
    failed: 'Bir şeyler ters gitti. Tekrar dene.',
    needsPro: 'Bunun için Fewmail Pro gerekiyor.',
    alreadySent: 'Zaten gönderildi, geri almak için çok geç.',
    consentChanged:
      'Bu, istendiğinden beri değişti. Tekrar bak ve botunun sohbetinde karar ver.',
    notFound: 'Bu artık yok. Silinmiş olabilir.',
    offline: 'Fewmail’e ulaşılamıyor. Bağlantını kontrol et.',
  },
  desktop: {
    confirm: 'Uygulamada oturum aç',
    confirmLead: (code: string) =>
      `Bilgisayarındaki Fewmail oturum açmak istiyor. ${code} gösterdiğini kontrol et.`,
    confirmTitle: 'Uygulamada oturum açılsın mı?',
    expired:
      'Bu oturum açma isteğinin süresi doldu. Uygulamada yeniden başlat.',
    lead: 'Bilgisayarında oturum açtın. Bu sekmeyi kapatabilirsin.',
    title: 'Uygulamaya dön',
    waiting: (code: string) =>
      `Tarayıcında devam et ve ${code} gösterdiğini kontrol et.`,
  },
  update: {
    available: 'Fewmail’in yeni bir sürümü çıktı.',
    reload: 'Yenile',
  },
  keys: {
    forget: 'unut',
    reopen: 'yeniden aç',
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
      'Onayın olmadan hiçbir şey gönderilmez ve arşivlenmez. Takvim ve kişiler isteğe bağlıdır.',
    continue: 'Google ile devam et',
    lead: 'Fewmail postanı okur ve sadece seni bekleyenleri gösterir.',
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
    inboxTotal: (count: string) => `Toplam ${count}`,
    markShownRead: (n: number) => `${n} tanesini okundu işaretle`,
    oneTimeCode: {
      copied: 'Kod kopyalandı',
      copy: 'Kodu kopyala',
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
      named: 'Gönderen veya konu',
      mentioned: 'Metinde geçiyor',
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
      'Fewmail abonelikten çıkmayı istedi ama bu gönderenin yine de yazmaya devam ettiği biliniyor. Postaları bundan sonra çöp kutusuna gitsin mi? Bunu bir bot yapar, onu da botlarının arasından silebilirsin.',
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
    due: (date: string) => `son tarih ${date}`,
    dueHint: 'Ajanın bu e-postada bulduğu son tarih',
    empty: {
      focused: 'Gelen kutusu boş',
      unread: 'Hepsi okundu',
      categories: 'Gelen kutusu boş',
      inbox: 'Gelen kutusu boş',
      snoozed: 'Ertelenen yok',
      sent: 'Henüz bir şey gönderilmedi',
      drafts: 'Taslak yok',
      archive: 'Arşiv boş',
      spam: 'Spam yok',
      trash: 'Çöp kutusu boş',
    },
    emptyHint: {
      focused: 'Yeni e-postalar gelir gelmez burada görünür.',
      unread: 'Yeni e-postalar gelir gelmez burada görünür.',
      categories: 'Yeni e-postalar gelir gelmez burada görünür.',
      inbox: 'Yeni e-postalar gelir gelmez burada görünür.',
      snoozed:
        'Bir e-postayı sonraya ertele: okunmamış olarak gelen kutusuna döner.',
      sent: 'Gönderdiğin e-postalar burada görünür.',
      drafts: 'Başlayıp göndermediğin e-postalar burada bekler.',
      archive: 'Arşivlenen e-postalar gelen kutusundan çıkar ve burada bekler.',
      spam: 'Spam gelen kutusuna değil, buraya düşer.',
      trash: 'Silinen e-postalar burada 30 gün kalır.',
    },
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
    search: 'Ara ya da anlat',
    openInGmail: "Gmail'de aç",
    openInNewTab: 'Yeni sekmede aç',
    unsubscribe: 'Abonelikten çık',
    unsubscribed: 'Abonelikten çıkıldı',
    unsubscribeFailed:
      "Bu gönderenin Fewmail'in kullanabileceği bir abonelikten çıkma yolu yok, bu yüzden e-posta arşivlendi, ama hâlâ listedesin.",
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
    unsubscribeHint:
      'Fewmail listeden çıkar ve gönderdiği her şeyi arşivler. Abonelikten çıkma geri alınamaz.',
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
    board: 'Pano',
    menu: 'Menü',
    collapseSidebar: 'Kenar çubuğunu daralt',
    expandSidebar: 'Kenar çubuğunu genişlet',
    labels: 'Etiketler',
    folders: 'Klasörler',
    calendar: 'Takvim',
    subscriptions: 'E-posta listeleri',
    wrapped: 'Özet',
    people: 'Kişiler',
    findPerson: 'Kişi bul',
    personMail: 'E-postaları göster',
    deleteContact: 'Kişiyi sil',
    contactDeleted: 'Kişi silindi',
    clearSearch: 'Aramayı temizle',
    mail: 'Posta',
    reading: 'Okuma',
    settings: 'Ayarlar',
    syncFailed: 'Gmail eşitlemesi başarısız, yeniden deneniyor',
    syncing: 'Gelen kutun okunuyor…',
    loading: 'Yükleniyor',
    syncFailedIn: (email: string) =>
      `${email} eşitlemesi başarısız, yeniden deneniyor`,
    syncingIn: (email: string) => `${email} okunuyor…`,
    home: 'Botlar',
    trialLeft: (total: number) => `Pro denemesi · ${total} gün kaldı`,
    usage: (percent: number) => `Ajan · bu ayın %${percent} kadarı kullanıldı`,
    watching: 'Ajan gelen kutunu izliyor',
  },
  notifications: {
    many: (total: number) =>
      plural('tr', total, {
        other: (n) => `Fewmail’den ${n} yeni bildirim`,
      }),
    testBody: 'Acil e-postalar böyle görünecek.',
    testTitle: 'Bildirimler çalışıyor',
  },
  plan: {
    used: (percent: number) => `%${percent} kullanıldı`,
    base: 'Ajanın temel aylık limiti.',
    times: (times: number) => `${times} kat daha yüksek aylık limit.`,
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
    openEmail: 'E-postayı aç',
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
    credential_phishing: (domain: string) =>
      `${domain} giriş yapmanı ya da kart veya hesap bilgilerini girmeni istiyor. Bankalar ve hizmetler bunu asla e-postayla istemez: bağlantılara tıklama, hiçbir şey girme.`,
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
  bots: {
    profile: 'Ne yapıyorum',
    closeProfile: 'Kapat',
    since: (date: string) => `${date} tarihinden beri çalışıyor`,
    status: {
      acts: 'Kendi başına yapıyor',
      asks: 'Her e-postadan önce soruyor',
      last: (time: string) => `son: ${time}`,
      paused: (date: string) => `${date} tarihine kadar duraklatıldı`,
      reading: (n: number) =>
        plural('tr', n, {
          other: (count) => `${count} yeni e-posta okuyor`,
        }),
      waiting: (n: number) =>
        plural('tr', n, {
          other: (count) => `${count} iş seni bekliyor`,
        }),
      watching: 'Postanı izliyor',
    },
    intro: {
      acts: 'Sensiz, kendi başıma yapıyorum: yaptığım her şey burada görünür ve geri alabilirsin.',
      asks: 'Bir e-postaya dokunmadan önce sana burada soruyorum. Kendi başıma yapmama izin ver, sensiz hallederim.',
      board:
        'Merhaba! Postandaki sözleri ve son tarihleri takip ediyorum: sana borçlu olunanı, senin söz verdiklerini ve yaklaşanları; zamanı gelince de hatırlatırım. Kimin sana ne borçlu olduğunu sor.',
      change:
        'Yaptığımı değiştirmek ya da sana bir şeyi hatırlatmamı istemek için bana yazman yeterli.',
      fewmail:
        'Merhaba, ben Fewmail Bot. Botlarından hiçbirinin almadığı tüm postaları okur ve sana yalnızca seninle ilgili olanları gösteririm. Onayın olmadan Gmail’de hiçbir şey değişmez. Postanla ilgili her şeyi sorabilir, sana bir şeyi hatırlatmamı ya da postanın bir kısmını sensiz halleden bir bot yapmamı isteyebilirsin.',
      own: (name: string) => `Merhaba, ben ${name}. Şununla ilgileniyorum:`,
    },
    pause: {
      day: 'Yarına kadar',
      hint: 'Duraklatılmışken e-posta almaz; onları Fewmail Bot alır.',
      month: 'Bir ay',
      resume: 'Devam ettir',
      title: 'Duraklat',
      week: 'Bir hafta',
    },
    week: {
      approved: 'senin onayınla',
      auto: 'kendi başına',
      title: 'Son 7 gün',
      waiting: 'seni bekliyor',
    },
    lately: 'Son yapılanlar',
    notifications: 'Bildirimler',
    quiet: {
      hide: 'Gizle',
      show: 'Göster',
      week: (n: number) =>
        plural('tr', n, {
          other: (count) => `Son 7 günde postanda ${count} değişiklik`,
        }),
    },
    chatMenu: 'Sohbet işlemleri',
    clear: 'Geçmişi temizle',
    clearConfirm: (name: string) => `${name} ile sohbet temizlensin mi?`,
    clearHint:
      'Mesajları kalıcı olarak silinir. Postanda yaptıkları ve kurduğu hatırlatmalar kalır.',
    cleared: 'Geçmiş temizlendi',
    deleteFolder: 'Klasörü sil',
    deleteFolderConfirm: (name: string) => `${name} klasörü silinsin mi?`,
    deleteFolderHint: 'İçindeki botlar listede, klasör dışında kalır.',
    moveTo: 'Klasöre taşı',
    newFolder: 'Yeni klasör',
    noFolder: 'Klasör yok',
    pin: 'Sabitle',
    rename: 'Yeniden adlandır',
    renameFolder: 'Klasörü yeniden adlandır',
    unpin: 'Sabitlemeyi kaldır',
    add: 'Yeni bot',
    answering: 'Yazıyorum…',
    cancelReply: 'Yanıtı iptal et',
    cards: {
      autoDone: (n: number) =>
        plural('tr', n, {
          other: (count) => `${count} tanesini kendim yaptım.`,
        }),
      dismissed: (n: number) =>
        plural('tr', n, {
          other: (count) => `${count} tanesini atladın.`,
        }),
      done: (n: number) =>
        plural('tr', n, {
          other: (count) => `${count} tanesi onayından sonra yapıldı.`,
        }),
      failed: (n: number) =>
        plural('tr', n, {
          other: (count) => `Gmail ${count} tanesini reddetti.`,
        }),
      pending: (n: number) =>
        plural('tr', n, {
          other: (count) => `${count} tanesi seni bekliyor.`,
        }),
    },
    composer: (name: string) => `Postaları hakkında ${name} botuna yaz`,
    copied: 'Kopyalandı',
    copy: 'Kopyala',
    created: 'Bot oluşturuldu. Bundan sonra yeni postaları okuyor.',
    delete: 'Botu sil',
    deleteConfirm: (name: string) => `${name} silinsin mi?`,
    deleteHint:
      'Sohbeti de onunla birlikte gider. Postaları olduğu yerde kalır, benzer yeni postalar Fewmail’e gider.',
    deleted: 'Bot silindi',
    earlier: 'Öncekileri göster',
    edit: 'Bot ayarları',
    effect: {
      always_show: 'Her birini bana göster',
      archive: 'Arşivle',
      collect: 'Sadece topla',
      draft_reply: 'Yanıt taslağı hazırla',
      mark_read: 'Okundu olarak işaretle',
      promises: 'Takip ettiğim sözler ve son tarihler',
      tidy: 'Toparla',
      trash: 'Çöpe taşı',
      unsubscribe: 'Abonelikten çık',
    },
    empty:
      'Burada henüz bir şey yok. Bana ait bir posta gelince buraya yazarım.',
    enabled: 'Kendi başına yapar',
    enabledHint: {
      off: 'Kapalıyken her e-posta için önce onayını ister.',
      on: 'Açıkken sormadan iş görür; yaptığı her şey sohbetinde görünür.',
    },
    instruction: 'Hangi e-postalar ve onlarla ne yapacağı',
    instructionPlaceholder:
      'örn. Hetzner faturalarını okundu say veya LinkedIn bildirimlerini arşivle',
    mute: 'Sessize al',
    muted: 'Sessizde: bu bottan bildirim gelmez',
    name: 'Ad',
    namePlaceholder: 'örn. Faturalar',
    noPlan:
      'Sana yanıt veremem: ücretsiz planda sohbet için tokenim yok. Abone ol, tamamen seninim.',
    now: 'Şimdi bekleyenler',
    suggestions: 'Öneriler',
    nudge: {
      noReply: 'O yazışmada henüz yanıt yok.',
      replied: 'O zamandan beri o yazışmaya bir yanıt geldi.',
    },
    promises: (n: number) =>
      plural('tr', n, {
        other: (count) => `${count} sözü not ettim.`,
      }),
    presets: 'Şablonlar',
    react: 'Tepki ver',
    reaction: 'Tepki',
    reply: 'Yanıtla',
    save: 'Kaydet',
    saved: 'Kaydedildi',
    simple: {
      title: {
        from: (value: string) => `Gönderen: “${value}”`,
        mailingList: () => 'Herhangi bir e-posta listesi',
        subject: (value: string) => `Konu “${value}” içerir`,
      },
    },
    spent: (date: string) =>
      `${date} tarihine kadar yanıt veremem: bu ayın kullanım hakkı bitti.`,
    steps: (n: number) =>
      plural('tr', n, {
        one: () => 'Bir adım',
        other: (count) => `${count} adım`,
      }),
    subscribe: 'Abone ol',
    fewmail: 'Fewmail Bot',
    fewmailJob: 'Botlarını oluşturur, e-postaları bulur ve soruları yanıtlar',
    title: 'Botlar',
    toLatest: 'En yeniye git',
    unmute: 'Sesi aç',
    whatItDoes: 'Onlarla ne yapacağı',
    you: 'Sen',
  },
  settings: {
    disconnectConfirm: (name: string) => `${name} bağlantısı kesilsin mi?`,
    messengerDisconnectHint:
      'Bot sana yazmayı bırakır. Yeniden bağlamak için bu sayfadan yeni bir bağlantı gerekir.',
    account: 'Hesap',
    agent: 'Ajan',
    deleteAccount: 'Hesabı sil',
    deleteConfirm: 'Her şeyi sil',
    deleteDescription:
      'Hesabını, eşitlenen postaları, taslakları ve botları Fewmail’den hemen siler. Gmail’ine dokunulmaz. Ücretli plan hemen iptal edilir.',
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
    languageSearch: 'Dil ara',
    languageDescription:
      'Uygulama, bot ve özetler. Yanıtlar e-postanın dilini izler.',
    legal: 'Yasal',
    mailboxes: {
      removeConfirm: (email: string) => `${email} kaldırılsın mı?`,
      removeHint:
        'Fewmail bu kutuyu okumayı bırakır ve orada okuduklarını unutur. Gmail’de hiçbir şey değişmez.',
      add: 'Gmail ekle',
      addDescription:
        'Başka bir Gmail hesabının postaları aynı botlara ve gelen kutusuna gelir. Bu hesapla buraya kimse giriş yapamaz: onunla giriş yapmak ayrı bir Fewmail açar.',
      added: 'Posta kutusu eklendi. Postaları bir dakika içinde görünür.',
      failed:
        'Posta kutusu eklenemedi. Gmail erişimine izin verip tekrar deneyin.',
      lost: 'Gmail erişimi kesildi. Yeniden bağlamak için tekrar ekleyin.',
      off: 'Kapalı. Siz açana kadar Fewmail bu kutuyu okumaz ve postalarını gizler.',
      reading: 'Postalar okunuyor…',
      remove: 'Kaldır',
      retrying:
        'Gmail şu anda yanıt vermiyor. Fewmail kendiliğinden yeniden deneyecek.',
      signIn: 'Bu hesapla giriş yapıyorsunuz',
      signInChosen: 'Bu, giriş yaptığın hesap. Başka bir hesap seç.',
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
      desktop: 'Bu bilgisayar',
      messengerOff: "Acil e-postalar Fewmail'de kalır.",
      messengerOn: 'Acil e-postalar hemen sohbete gelir.',
      notConfigured: 'Tarayıcı bildirimleri bu sunucuda yapılandırılmamış.',
      off: 'Fewmail kapalıyken bile acil e-postaları burada al.',
      on: 'Acil e-postalar burada görünür. Aynı anda gelenler tek bildirimde toplanır.',
      title: 'Bildirimler',
      test: 'Test gönder',
      testFailed: 'Ulaşmadı. Bildirimleri kapatıp yeniden aç.',
      testSent:
        'Gönderildi. Ekranda yok mu? Bilgisayarının ayarlarında tarayıcının bildirimlerine izin ver.',
      testSentDesktop:
        'Gönderildi. Ekranda yok mu? Bilgisayarının ayarlarında Fewmail’in bildirimlerine izin ver.',
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
        `Fewmail botlar, sıralama ve spam koruması için sonsuza dek ücretsiz. Pro, ajanın tamamı, ${trialDays} ücretsiz günle ve kart olmadan başlar.`,
      tagline: 'Gmail için yapay zekâ e-posta ajanı',
    },
    chapters: {
      pricing: {
        description:
          'Botlar, sıralama ve koruma sonsuza dek ücretsiz. Lite, Pro ve Max, senin için okuyan ve yazan her şeyi ekler; büyük planlar sadece bunu daha çok yapar.',
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
        'Cuma günkü başlangıç toplantısından önce imzalı sözleşme. Yanıtı çoktan hazırlandı, Fewmail’de onayını bekliyor.',
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
      lead: 'Fewmail’i MCP sunucusu olarak bağla ve zaten kullandığın yapay zekâdan postanı sor. Postanı okumak ve ajanın sıralaması ücretsiz; taslak, gönderme ve yazan botlar Pro ile gelir.',
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
            'Yanıtlar önceden, senin tonunla ve gönderenin dilinde yazılır; sen onaylayana kadar botunun sohbetinde bekler.',
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
        bots: {
          description:
            'Bazı postalara ne olması gerektiğini tek cümleyle anlat, kendi sohbeti olan bir bota dönüşsün. Yalnızca izin verdiğin botlar kendi başına iş görür.',
          title: 'Sade sözlerle botlar',
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
            'Yanıt taslaklarını senin için yazar ama asla kendi başına göndermez. Her taslak onayın için botunun sohbetinde bekler, benzer olanları birlikte onaylayabilirsin.',
          question: 'E-postaları otomatik olarak yanıtlayabilir mi?',
        },
        {
          answer: `Evet. Ücretsiz plan her e-postayı sıralar, seni bekleyenleri botlarının sohbetlerinde toplar, botlarını çalıştırır ve seni spamdan ve oltalamadan korur, hem de sonsuza dek. Taslaklar, özetler ve ajanın geri kalanı ücretli planlarla gelir; her hesap kart gerekmeden ${trialDays} gün Pro ile başlar.`,
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
        home: 'Seni bekleyen her şey tek yerde',
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
        bots: 'Sade dille botlar',
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
        bots: 'Arşivle, okundu işaretle veya abonelikten çık, ücretsiz',
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
          bots: 'Postaları klasörler arasında taşıyarak eğitme',
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
          bots: 'AI filtreleri, plana göre 3 ile 50 arası',
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
          bots: 'Custom Auto Labels, Business’ta',
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
          'Sen olmadan asla. Yanıtlar sen onaylayana kadar botunun sohbetinde bekler ve bir bot ancak sen izin verince kendi başına arşivler, okundu yapar veya abonelikten çıkar. Yaptığı her şey nedeniyle birlikte sohbetinde kalır.',
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
          'Şimdilik Gmail ve Google Workspace hesapları. Tek bir Fewmail’e birden fazla posta kutusu ekle; hepsinin postaları aynı botlara ve gelen kutusuna düşer. Eklenen bir posta kutusu kapatılıp sonra yeniden açılabilir.',
        question: 'Hangi e-posta hesaplarıyla çalışır?',
      },
    ],
    features: {
      description:
        'E-postanın eskiden bir öğleden sonranı alan işleri arka planda yapılır ve kontrol edebileceğin bir yerde listelenir.',
      items: {
        calendar: {
          description:
            'Tüm posta kutularının takvimi tek bir görünümde. Bir e-postada önerilen toplantı, sen onaylayınca etkinliğe dönüşür.',
          title: 'Takvim',
        },
        codes: {
          description:
            'Yeni bir kod her sayfanın en üstünde ve e-postasının yanında, hiçbir şey açmadan kopyalanmaya hazır bekler. Ücretsiz.',
          title: 'Giriş kodları',
        },
        messengers: {
          description:
            'Acil postalar sana hemen Telegram’da ya da WhatsApp’ta ulaşır. Postanı orada sor, taslakları orada onayla, yazarak ya da sesle.',
          title: 'Telegram ve WhatsApp',
        },
        reading: {
          description:
            'Her sabah dünün bültenlerinden tek bir sayı: konulara göre haberler, her cümle kaynağına bağlı ve baştan sona okumaya değenler.',
          title: 'Okuma',
        },
        shield: {
          description:
            'Bir spamcıyı bir kez bildir, her Fewmail kullanıcısı daha güvende olsun. Kalkanın yakaladığı her şey taşınmadan önce onayını bekler. Ücretsiz.',
          title: 'Spam kalkanı',
        },
        subscriptions: {
          description:
            'Bu ay yazan her e-posta listesi ve gerçekten kaç e-postasını açtığın. Herhangi birinden tek tuşla çık. Ücretsiz.',
          title: 'E-posta listeleri',
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
          fix: 'Fewmail Bot’tan birikenleri temizlemesini iste: eski reklamlar, okunmuş bildirimler, hiç açmadığın listeler, hepsi tek seferde taşınır. Tek tıkla her e-posta geri gelir.',
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
          fix: 'Okuma her sabah dünün bültenlerini konulara göre tek bir sayıya dönüştürür, okumaya değenler de belirtilir.',
          problem: 'Okumayı düşündüğün bültenler.',
        },
        {
          fix: 'Değişen ödeme bilgileri, benzer alan adları ve bilinen oltalama siteleri, sen harekete geçmeden önce uyarı verir.',
          problem: 'Yeni banka bilgileriyle gelen bir fatura.',
        },
        {
          fix: 'Pano, söz verdiklerini ve sana borçlu olunanları not eder, her birini günü gelince geri getirir. Kimsenin yanıtlamadığı yazışmalar da takip edilir.',
          problem: 'Söz verip unuttuğun o şey.',
        },
        {
          fix: 'Telegram’a ya da WhatsApp’a yalnızca acil postalar gelir. Gerisi önceden ayıklanmış halde botlarının sohbetlerinde, ne zaman bakarsan seni bekler.',
          problem: 'Akşam yemeğinde, ne olur ne olmaz diye postalara bakmak.',
        },
      ],
      title: 'E-posta dertlerin artık geride.',
    },
    hero: {
      needs: {
        emphasis: 'seni bekliyor.',
        lead: (handled: string, bot: string) =>
          `Anna sözleşmeyi bekliyor, Northwind’in faturasının son günü gelecek hafta ve Marco perşembeyi istiyor. Botların ${handled} bülten ve bildirimi halletti, bu üçü de ${bot} sohbetinde bekliyor.`,
        tag: (bot: string) => `${bot} · Perşembe, 08:12`,
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
      seeBots: 'Botlarla tanış',
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
    bots: {
      again: 'Baştan başla',
      board: {
        coming: {
          state: 'ücretliye geçer · 28 Kasım',
          text: 'Coursely denemesi',
        },
        owed: {
          state: 'bekleniyor · 22 Kasım’a kadar',
          text: 'Northwind: çift çekim için $120 iade',
        },
        promised: {
          state: 'perşembeye kadar',
          text: 'İncelemeden önce slaytları Marco’ya gönder',
        },
      },
      emphasis: 'Her tür posta için',
      fewmail: {
        approve: 'Onayla',
        ask: 'Hetzner faturaları: okundu olarak işaretle',
        botName: 'Hetzner faturaları',
        digest: (total: number, people: number) =>
          `Son bir günde ${total} e-posta. Çoğu bülten ve bildirim, insanlardan yalnızca ${people} tane.`,
        proposal: 'İşte bot. Onayla, yeni postalarla işe başlasın.',
      },
      label: 'Botlar',
      later: 'Bilmeye değer dört şey, karar verilecek bir şey yok.',
      lead: 'Her bot kendi türündeki postayı geldiği anda okur ve sohbetinde ne yaptığını, neyin seni beklediğini anlatır. Aralarında gezin ya da [ ve ] tuşlarına bas.',
      points: [
        {
          description:
            'Her e-posta, işi o olan bota gider: Önemli, Bekleyebilir, Hızlı ya da senin yaptığın bir bot. Hiçbir botun almadığı postalar Fewmail Bot’ta kalır.',
          title: 'Posta geldikçe ayırırlar.',
        },
        {
          description:
            'Bir bot, sen kendi başına iş görmesine izin verene kadar her e-postaya dokunmadan önce sorar. Yaptığı her şey nedeniyle birlikte sohbetinde kalır.',
          title: 'Güvenene kadar sorarlar.',
        },
        {
          description:
            'Fewmail Bot’a “Hetzner faturaları: okundu olarak işaretle” de ve yaptığı botu onayla. Bir botu duraklatmak, değiştirmek ya da silmek de aynı şekilde olur.',
          title: 'Tek cümleyle bot yap.',
        },
      ],
      quick:
        'Growthly’den Mira soğuk satış e-postası: bir şey satmaya çalışan bir yabancı ve sen ona hiç yazmadın.',
      settled: {
        remind: 'hatırlatma kuruldu',
        send: 'yanıt gönderildi',
        skip: 'geçildi',
      },
      title: 'Her tür posta için bir sohbet.',
    },
    plans: {
      agent: 'Ajan',
      details: 'Tüm planları ayrıntılı gör',
      usage: 'Ajanın aylık limiti',
      everyPlan: 'Her planda',
      oneAllowance:
        'Ajanın yaptığı her şey için tek bir kullanım hakkı: kullandığın kadar ödersin, gereksiz e-postalar hiç sayılmaz',
      forever: 'sonsuza dek',
      free: {
        description: 'Botlar, sıralama ve koruma. Sonsuza dek.',
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
        `Sade dille botlar, sıralama ve koruma sonsuza dek ücretsiz. Pro, senin için okuyan, yazan ve hatırlayan ajan; Max ise yoğun bir gelen kutusuna yetecek kapasiteye sahip aynı ajan. Her hesap ${trialDays} gün Pro ile başlar, süre bitince de Ücretsiz planda kalırsın.`,
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
            'Taslaklar seni bekler. Bir bot postaları ancak sen izin verince kendi başına taşır ve yaptığı her şey nedeniyle birlikte sohbetinde kalır.',
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
  starterBots: {
    board: { name: 'Pano' },
    important: {
      instruction:
        'Benden bir adım bekleyenler: yanıtımı bekleyen kişiler, ödemesi gelen faturalar, güvenlik uyarıları, bankamdan ya da devletten gelen her şey. Her birini bana göster',
      name: 'Önemli',
    },
    later: {
      instruction:
        'Bilmeye değer ama karar gerektirmeyenler: kullandığım hizmetlerden haberler, teslimatlar, etkinlikler ve tarihler',
      name: 'Bekleyebilir',
    },
    quick: {
      instruction:
        'Okumadan temizleyeceğim gürültü: bildirimler, makbuzlar, bültenler, kampanyalar ve tanımadığım yerlerden satış e-postaları. Toparla: arşivle, okundu olarak işaretle ya da abonelikten çık, hangisi uyarsa',
      name: 'Hızlı',
    },
  },
  telegram: {
    approveAlike: 'Aynı türdeki tüm kartları birden onayla:',
    chatTaken:
      'Bu sohbet zaten başka bir Fewmail hesabına bağlı. Önce oradan Telegram bağlantısını kes (Ayarlar → Entegrasyonlar), sonra bağlantıyı yeniden aç.',
    queueChanged: 'Kartlar bu arada değişti. Şu an seni bekleyenler:',
    heard: (text: string) => `Duyduğum: “${text}”`,
    voiceFailed: 'Anlayamadım. Tekrar dene ya da yaz.',
    help: 'Ne istediğini yaz ya da söyle:\n• e-postaların hakkında sor: “Netflix ne zaman yenileniyor?”\n• ne yanıtlanacağını söyle: “Anna’ya yarın imzalayacağımı yaz”\n• bana bir iş ver: “Medium bültenlerini hep arşivle”\n• değiştirmek için taslaklarımdan birini yanıtla',
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
    botSuggestion: {
      done: {
        archive:
          'Bundan sonra yeni bir bot bu göndericinin postalarını arşivleyecek.',
        mark_read:
          'Bundan sonra yeni bir bot bu göndericinin postalarını okundu olarak işaretleyecek.',
      },
      label: 'Önerilen bot',
      lead: (count: number, effect: 'archive' | 'mark_read') =>
        effect === 'archive'
          ? `Bu ay ${count} e-posta, ajan hepsini arşivlerdi`
          : `Bu ay ${count} e-posta, ajan hepsini okundu olarak işaretlerdi`,
      no: 'Hayır, teşekkürler',
      yes: {
        archive: 'Her zaman arşivle',
        mark_read: 'Her zaman okundu olarak işaretle',
      },
    },
    newSender: {
      archive: 'Her zaman arşivle',
      archived:
        'Bundan sonra yeni bir bot bu göndericinin postalarını arşivleyecek.',
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
    allowanceSpent: (date: string) =>
      `Ajanın bu ayki kullanım hakkı bitti: özetler ve taslaklar ${date} tarihinde geri gelecek. O zamana kadar sözleri ve son tarihleri kaydetmeye devam ediyorum.`,
    byBots: (n: number) => `Botların ${n} tanesini halletti.`,
    decisions: 'Kararlar',
    journal: {
      approved: 'Onayladın',
      byBot: (bot: string) => `Botun: ${bot}`,
      failed: 'Olmadı',
      lead: 'Son 7 gün. E-postandaki ya da takvimindeki her değişiklik senin onayınla ya da kendi başına çalışmasına izin verdiğin bir botla yapıldı.',
      title: 'E-postanda yapılanlar',
    },
    progress: (done: number, total: number) => `${done}/${total}`,
    mostlyNoise: (people: number) =>
      people === 0
        ? 'Hepsi bülten ve bildirim.'
        : `Çoğu bülten ve bildirim, insanlardan yalnızca ${people} tane.`,
    worth: {
      awaiting: (total: number) =>
        plural('tr', total, {
          one: () => '1 yanıt bekliyor',
          other: (n) => `${n} yanıt bekliyor`,
        }),
      dated: (total: number) =>
        plural('tr', total, {
          one: () => '1 tarihli',
          other: (n) => `${n} tarihli`,
        }),
    },
    worthKnowing: 'Bilmekte fayda var',
    canWait: 'Bekleyebilir',
    canWaitEmpty: {
      lead: 'Vaktin olduğunda okuyacağın e-postalar ve beklediğin yanıtlar burada toplanır.',
      title: 'Bekleyen bir şey yok.',
    },
    improve: {
      empty: {
        lead: 'Ajan bir gönderene her seferinde aynı şeyi yaptığını görürse burada bir bot önerir.',
        title: 'Şimdilik öneri yok.',
      },
      lead: (total: number) =>
        plural('tr', total, {
          other: (n) => `Ajanın senin için oluşturabileceği ${n} bot.`,
        }),
      title: 'Ajanın önerileri',
    },
    quick: 'Hızlı',
    needsLook: 'Seni bekliyor',
    tidy: {
      failed: (emails: string) =>
        `${emails} Gmail’de değiştirilemedi. Birazdan tekrar dene.`,
      confirm: (emails: string) => `${emails} toplansın mı?`,
      running: 'Toplanıyor…',
      unsubscribeHint:
        'Bazıları Fewmail’in çıkacağı e-posta listeleri ve abonelikten çıkma geri alınamaz.',
      review: 'Kontrol et',
      reviewLead:
        'Bu e-postaları kaldırmayı öneriyorum, her birinin yanında nedeni var. Hepsini birden onayla ya da kalması gerekenleri bırak.',
      reviewTitle: 'Ajanın önerilerini kontrol et',
      done: (n: number) => `${n} toplandı`,
      keep: 'Kalsın',
      run: 'Tümünü onayla',
      untilYouApprove: 'Sen onaylayana kadar e-postanda hiçbir şey değişmez',
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
      'Önce son üç günün e-postaları. İlgilenmen gerekenler burada kendiliğinden görünecek.',
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
  },
  upgrade: {
    hints: {
      board:
        'Fewmail Pro’ya dahil: ajan e-postandan sana verilen sözleri, senin verdiğin sözleri ve son günleri yazar, her biri tamamlanana kadar takip eder.',
      chat: 'Fewmail Pro’nun parçası: botlarınla postaları hakkında konuş, söyledikleri zaman sana geri dönerler.',
      drafts:
        "Fewmail Pro'nun parçası: ajan yanıtı senin üslubunla yazar, sen düzenleyip gönderirsin.",
    },
  },
  whatsapp: {
    phoneTaken:
      'Bu numara zaten başka bir Fewmail hesabına bağlı. Önce oradan WhatsApp bağlantısını kes (Ayarlar → Entegrasyonlar), sonra mesajı yeniden gönder.',
    connectFirst: (url: string) =>
      `Merhaba! Ben Fewmail. Burada, WhatsApp’ta acil bir e-posta geldiğinde haber veririm, seni bekleyenleri gösteririm ve onayladığın yanıtları gönderirim.\n\nBu numara henüz Fewmail’ine bağlı değil. Bir dakika sürer:\n1. Fewmail ayarlarını aç: ${url}\n2. Entegrasyonlar’da “WhatsApp’ı bağla”ya dokun (Fewmail Pro’nun parçası).\n3. WhatsApp hazır bir mesajla açılır, gönder, hepsi bu.`,
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
