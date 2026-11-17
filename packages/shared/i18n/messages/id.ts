import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const id: Messages = {
  actionDone: {
    heads_up: 'Mengerti',
    commitment: 'Selesai',
    confirm: 'Sudah saya konfirmasi',
    follow_up: 'Sudah saya tindak lanjuti',
    pay: 'Sudah saya bayar',
    read: 'Sudah saya baca',
    renew: 'Sudah saya perpanjang',
    schedule: 'Sudah saya jadwalkan',
    security: 'Sudah saya cek',
    sign: 'Sudah saya tanda tangani',
  },
  actionLink: {
    confirm: 'Konfirmasi',
    pay: 'Bayar',
    read: 'Baca',
    renew: 'Perpanjang',
    sign: 'Tanda tangani',
  },
  actionKind: {
    heads_up: 'Perhatian',
    cleanup: 'Berhenti dari semua',
    consent: 'Setujui',
    commitment: 'Dijanjikan',
    security: 'Periksa',
    spam: 'Pindahkan ke spam',
    archive: 'Arsipkan',
    follow_up: 'Tindak lanjuti',
    mark_read: 'Tandai dibaca',
    pay: 'Bayar',
    read: 'Layak dibaca',
    reply: 'Balas',
    schedule: 'Jadwalkan',
    trash: 'Pindahkan ke sampah',
    unsubscribe: 'Berhenti langganan',
  },
  actionStatus: {
    auto_done: 'diselesaikan agen',
    dismissed: 'dilewati',
    done: 'selesai',
    failed: 'gagal',
    pending: 'menunggu di Beranda',
  },
  agent: {
    decideOnHome: 'Putuskan di Beranda',
    fromAgent: 'Agen meminta',
    mcpAsks: (client: string) => `${client} meminta lewat MCP`,
    calendar: (email: string) => `Di kalender ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      dismiss_action: 'Lewati kartu ini?',
      create_event: 'Tambahkan acara ini?',
      delete_event: 'Hapus acara ini?',
      update_event: 'Ubah acara ini?',
      approve_action: 'Jalankan tindakan ini?',
      archive_thread: 'Arsipkan percakapan ini?',
      clear_out: 'Bersihkan grup email ini dari kotak masuk?',
      undo_clear_out: 'Kembalikan semua yang dibersihkan ke kotak masuk?',
      create_rule: 'Tambahkan aturan ini?',
      reply: 'Kirim balasan ini?',
      send_email: 'Kirim email ini?',
      snooze_thread: 'Tunda percakapan ini?',
      unsubscribe: 'Berhenti berlangganan dari pengirim ini?',
      tidy_mail: 'Rapikan email tenang ini?',
      trash_thread: 'Pindahkan utas ini ke sampah?',
      report_spam: 'Laporkan pengirim ini sebagai spam?',
      mark_not_spam: 'Keluarkan utas ini dari spam?',
      move_to_inbox: 'Kembalikan utas ini ke kotak masuk?',
    },
    retry: 'Coba lagi',
    steps: {
      create_event: 'Menambahkan acara',
      delete_event: 'Menghapus acara',
      list_events: 'Memeriksa kalender',
      update_event: 'Mengubah acara',
      list_subscriptions: 'Membaca milis',
      approve_action: 'Menyetujui',
      archive_thread: 'Mengarsipkan',
      get_reading: 'Membaca newsletter',
      get_wrapped: 'Menghitung emailmu',
      clear_out: 'Membersihkan kotak masuk',
      preview_clear_out: 'Membaca seluruh kotak masuk',
      undo_clear_out: 'Mengembalikan email yang dibersihkan',
      create_rule: 'Menambahkan aturan',
      dismiss_action: 'Melewati',
      draft_reply: 'Menulis balasan',
      create_draft: 'Menyimpan draf',
      find_people: 'Mencari alamatnya',
      get_person: 'Mencari orangnya',
      get_today: 'Memeriksa hari ini',
      list_handled: 'Memeriksa yang sudah ditangani',
      list_mail: 'Mencari di email',
      list_rules: 'Membaca aturan',
      read_thread: 'Membaca percakapan',
      redraft_action: 'Menulis ulang draf',
      refresh: 'Memeriksa email baru',
      send_email: 'Mengirim',
      snooze_thread: 'Menunda',
      unsubscribe: 'Berhenti berlangganan',
      tidy_mail: 'Merapikan',
      trash_thread: 'Memindahkan ke sampah',
      report_spam: 'Melaporkan spam',
      mark_not_spam: 'Mengeluarkan dari spam',
      move_to_inbox: 'Memindahkan ke kotak masuk',
      list_promises: 'Memeriksa janji',
      set_promise_status: 'Memperbarui janji',
    },
    to: (recipients: string) => `Kepada ${recipients}`,
    until: (time: string) => `Sampai ${time}`,
    yes: {
      dismiss_action: 'Lewati',
      create_event: 'Tambah',
      delete_event: 'Hapus',
      update_event: 'Simpan',
      approve_action: 'Setujui',
      archive_thread: 'Arsipkan',
      clear_out: 'Bersihkan',
      undo_clear_out: 'Kembalikan',
      create_rule: 'Tambahkan',
      reply: 'Kirim',
      send_email: 'Kirim',
      snooze_thread: 'Tunda',
      unsubscribe: 'Berhenti berlangganan',
      tidy_mail: 'Rapikan',
      trash_thread: 'Ke sampah',
      report_spam: 'Laporkan spam',
      mark_not_spam: 'Bukan spam',
      move_to_inbox: 'Kembalikan',
    },
  },
  ask: {
    label: (question: string) => `Tanya Fewmail: “${question}”`,
    thinking: 'Menelusuri email kamu…',
  },
  byRule: 'oleh aturan',
  bulk: {
    badge: (n: number) => `Dikirim ke ${n}+ pengguna Fewmail`,
    reason: (n: number) =>
      `Email massal: ${n}+ pengguna Fewmail menerima teks yang sama`,
  },
  calendar: {
    tomorrow: 'Besok',
    allDay: 'Sepanjang hari',
    calendar: 'Kalender',
    create: 'Tambah acara',
    delete: 'Hapus',
    deleted: 'Acara dihapus',
    description: 'Deskripsi',
    editEvent: 'Edit acara',
    endBeforeStart: 'Acara berakhir sebelum dimulai',
    ends: 'Selesai',
    location: 'Lokasi',
    newEvent: 'Acara baru',
    next: 'Berikutnya',
    openInGoogle: 'Buka di Google Kalender',
    previous: 'Sebelumnya',
    save: 'Simpan',
    saved: 'Acara disimpan',
    saving: 'Menyimpan acara…',
    scope: {
      this: 'Acara ini saja',
      following: 'Acara ini dan berikutnya',
      all: 'Semua acara',
    },
    starts: 'Mulai',
    title: 'Kalender',
    titlePlaceholder: 'Tambahkan judul',
    today: 'Hari ini',
    untitled: '(Tanpa judul)',
    views: {
      day: 'Hari',
      week: 'Minggu',
      month: 'Bulan',
      year: 'Tahun',
    },
  },
  category: {
    calendar: 'Kalender',
    finance: 'Keuangan',
    newsletter: 'Buletin',
    notification: 'Notifikasi',
    other: 'Lainnya',
    person: 'Orang',
    promotion: 'Promosi',
    receipt: 'Tanda terima',
    security: 'Keamanan',
    travel: 'Perjalanan',
    work: 'Kerja',
  },
  board: {
    lead: {
      coming: (total: number) =>
        plural('id', total, {
          one: () => 'Satu tenggat sudah dekat.',
          other: (n) => `${n} tenggat sudah dekat.`,
        }),
      empty:
        'Tidak ada yang terbuka. Janji kepadamu, janjimu, dan tenggat masuk ke sini sendiri dari emailmu.',
      owed: (amounts: string) => `Kamu masih berhak menerima ${amounts}.`,
      promised: (total: number) =>
        plural('id', total, {
          one: () => 'Kamu menjanjikan satu hal.',
          other: (n) => `Kamu menjanjikan ${n} hal.`,
        }),
      waiting: (total: number) =>
        plural('id', total, {
          one: () => 'Satu janji kepadamu masih terbuka.',
          other: (n) => `${n} janji kepadamu masih terbuka.`,
        }),
    },
    section: {
      coming: 'Segera',
      owed: 'Hakmu',
      promised: 'Janjimu',
      settled: 'Baru selesai',
    },
    state: {
      acknowledged: 'sudah dibalas, belum dikerjakan',
      broken: 'tidak terjadi',
      cancelled: 'dibatalkan',
      fulfilled: 'selesai',
      in_progress: 'dalam proses',
      open: 'menunggu',
      overdue: 'terlambat',
    },
    by: (date: string) => `sebelum ${date}`,
    lastDay: (date: string) => `hari terakhir ${date}`,
    done: 'Selesai',
    forget: 'Lupakan',
    reopen: 'Buka lagi',
    markedDone: 'Ditandai selesai',
    forgotten: 'Dilupakan',
    reopened: 'Dibuka lagi',
  },
  cleanup: {
    emails: (total: number) => `${total} email`,
    reason: (total: number) =>
      `${total} email bulan ini, tidak ada yang dibuka`,
    title: (total: number) =>
      plural('id', total, {
        other: (n) =>
          n === 1
            ? 'Berhenti langganan newsletter yang tidak pernah kamu buka'
            : `Berhenti langganan ${n} newsletter yang tidak pernah kamu buka`,
      }),
  },
  clearOut: {
    partial:
      'Gmail menghentikan sebagian pembersihan. Yang sudah dipindahkan bisa dikembalikan.',
    groups: {
      lists: 'Newsletter yang tidak pernah kamu buka',
      notifications: 'Notifikasi yang sudah dibaca, lebih dari sebulan',
      old: 'Semua yang lebih dari setahun',
      promotions: 'Iklan dan sosial, lebih dari 3 hari',
    },
    done: (emails: string) => `${emails} dibersihkan`,
    empty: 'Tidak ada yang perlu dibersihkan: kotak masuk sudah rapi.',
    lead: (emails: string) =>
      `${emails} di kotak masuk. Ini yang bisa dibersihkan.`,
    leadCapped: (emails: string) =>
      `Lebih dari ${emails} di kotak masuk. Ini yang bisa dibersihkan.`,
    left: (emails: string) => `${emails} tetap di kotak masuk`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} dan ${more} lainnya` : names,
    run: (emails: string) => `Bersihkan ${emails}`,
    safe: 'Tidak ada yang dihapus. Email yang dibersihkan diarsipkan dengan label Fewmail/Cleared dan kembali dengan satu klik; langganan newsletter juga dihentikan.',
    scanning:
      'Aku membaca seluruh kotak masuk, hanya header. Paling lama satu menit.',
    title: 'Bersihkan kotak masuk',
    undo: 'Kembalikan semua',
    undone: (emails: string) => `${emails} kembali di kotak masuk`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `Hari tersibuk: ${day} · jam tersibuk: ${hours}`,
    copied: 'Tautan disalin',
    copyLink: 'Salin tautan',
    cta: 'Dapatkan punyamu dengan Fewmail',
    emails: 'email masuk',
    empty: 'Belum cukup email untuk bercerita. Kembali beberapa hari lagi.',
    handled: 'ditangani Fewmail sendiri',
    people: 'Siapa yang paling sering menulis',
    period: { month: 'Bulan ini', year: 'Tahun ini' },
    replies: 'balasan ditulis Fewmail dan terkirim',
    saveImage: 'Simpan gambar',
    saved: 'dihemat oleh Fewmail',
    shareNote:
      'Tautan dan gambar hanya menampilkan angka ini, tanpa nama atau alamat.',
    shared: { month: 'Sebulan dalam email', year: 'Setahun dalam email' },
    spam: 'email spam dihentikan',
    split: (people: string, lists: string, other: string) =>
      `${people} dari orang · ${lists} dari newsletter · ${other} lainnya`,
    title: { month: 'Bulanmu dalam email', year: 'Tahunmu dalam email' },
    unsubscribed: 'newsletter ditinggalkan',
  },
  reading: {
    markAllRead: 'Tandai semua sudah dibaca',
    summary: 'Isi newsletter Anda',
    worth: 'Layak dibaca utuh',
    leftOut: (n: number) => `Tidak masuk ringkasan: ${n}, tidak ada yang baru.`,
    note: {
      inSummary: 'Di ringkasan',
      leftOut: 'Dilewati',
    },
    digest: (n: number) => `Newsletter: ${n}`,
    lead: 'Newsletter satu hari di satu tempat, agar tidak memenuhi kotak masuk.',
    issues: 'Semua edisi',
    title: 'Bacaan',
  },
  commitments: {
    title: 'Kamu sudah berjanji',
  },
  compose: {
    attach: 'Lampirkan file',
    attachmentsTooLarge: (limit: string) => `Total lampiran maksimal ${limit}.`,
    dropFiles: 'Lepas file untuk melampirkan',
    removeAttachment: 'Hapus',
    discarded: 'Draf dibuang',
    backInQueue: 'Dibatalkan. Draf kembali ke Beranda.',
    canceled: 'Dibatalkan. Email kamu kembali ke editor.',
    cc: 'Cc',
    discard: 'Buang',
    draftSaved: 'Draf disimpan',
    forward: 'Teruskan',
    forwardedMessage: 'Pesan yang diteruskan',
    from: 'Dari',
    invalidRecipients: 'Tambahkan minimal satu alamat email yang valid.',
    later: {
      inHour: 'Satu jam lagi',
      monday: 'Senin pagi',
      pick: 'Pilih tanggal & waktu',
      schedule: 'Jadwalkan',
      time: 'Waktu',
      tomorrow: 'Besok pagi',
    },
    new: 'Email baru',
    placeholder: 'Tulis email kamu…',
    remind: {
      days: (total: number) => `Ingatkan jika tak dibalas dalam ${total} hari`,
      label: 'Ingatkan',
      off: 'Tanpa pengingat',
    },
    reply: 'Balas',
    scheduledFor: (date: string) => `Dijadwalkan ${date}`,
    send: 'Kirim',
    sendLater: 'Kirim nanti',
    sendingIn: (seconds: number) => `Mengirim dalam ${seconds} dtk`,
    subject: 'Subjek',
    to: 'Kepada',
    undo: 'Urungkan',
    undoing: 'Membatalkan…',
    writeForMe: 'Tuliskan untukku',
    writing: 'Menulis…',
  },
  command: {
    compose: 'Email baru',
    agent: 'Agen',
    appearance: 'Tampilan',
    goTo: 'Buka',
    mail: 'Email',
    nothingMatches: 'Tidak ada yang cocok.',
    placeholder: 'Tanya soal email atau jalankan perintah…',
    teachRule: 'Ajarkan aturan baru',
    upgrade: 'Beralih ke Pro',
    theme: {
      dark: 'Gelap',
      light: 'Terang',
      system: 'Sistem',
    },
  },
  composer: {
    acceptSuggestion: 'Tab untuk terima',
    bold: 'Tebal',
    bulletList: 'Daftar poin',
    italic: 'Miring',
    link: 'Tautan',
    linkPlaceholder: 'Tempel atau ketik tautan',
    noSnippets: 'Tidak ada snippet yang cocok.',
    removeLink: 'Hapus tautan',
  },
  importance: ['Kebisingan', 'Perlu tahu', 'Segera butuh kamu', 'Mendesak'],
  justNow: 'baru saja',
  errors: {
    calendarAccess:
      'Fewmail tidak punya akses ke kalender ini. Izinkan di halaman Kalender.',
    failed: 'Terjadi kesalahan. Coba lagi.',
    needsPro: 'Ini memerlukan Fewmail Pro.',
    alreadySent: 'Sudah terkirim, terlambat untuk membatalkan.',
    consentChanged:
      'Ini berubah sejak diminta. Lihat lagi dan putuskan di Beranda.',
    notFound: 'Ini sudah tidak ada. Mungkin sudah dihapus.',
    offline: 'Tidak dapat terhubung ke Fewmail. Periksa koneksimu.',
  },
  desktop: {
    lead: 'Fewmail sedang terbuka di Mac Anda. Anda bisa menutup tab ini.',
    open: 'Buka Fewmail',
    title: 'Kembali ke aplikasi',
  },
  update: {
    available: 'Versi baru Fewmail sudah tersedia.',
    reload: 'Muat ulang',
  },
  keys: {
    forget: 'lupakan',
    reopen: 'buka lagi',
    attach: 'lampirkan',
    done: 'selesai',
    openLink: 'buka tautan',
    writeReminder: 'tulis pengingat',
    summary: 'ringkasan',
    fromSender: 'lainnya dari pengirim',
    approvePicked: (n: number) => `setujui ${n} yang dipilih`,
    pick: 'pilih',
    pickAll: 'pilih semua',
    markRead: 'tandai dibaca',
    markUnread: 'tandai belum dibaca',
    unpick: 'hapus pilihan',
    pin: 'sematkan',
    unpin: 'lepas sematan',
    copyCode: 'salin kode',
    restore: 'ke kotak masuk',
    calendarToday: 'hari ini',
    newEvent: 'acara baru',
    period: 'sebelumnya / berikutnya',
    view: 'tampilan',
    skills: 'skill',
    unsubscribe: 'berhenti langganan',
    filter: 'filter',
    reply: 'balas',
    snooze: 'tunda',
    trash: 'buang',
    ask: 'tanyakan tentang ini',
    approve: 'setujui',
    approveAll: (n: number) => `setujui semua ${n} yang sejenis`,
    archive: 'arsipkan',
    close: 'tutup',
    draftReply: 'draf balasan',
    edit: 'edit',
    expand: 'buka / tutup',
    move: 'pindah',
    stackEmail: 'email berikut / sebelumnya',
    open: 'buka',
    rename: 'ganti nama',
    clearFilter: 'hapus filter',
    search: 'cari',
    send: 'kirim',
    skip: 'lewati',
    keep: 'simpan',
    stopEditing: 'selesai edit',
    rewrite: 'tulis ulang',
    save: 'simpan',
    deleteEvent: 'hapus',
  },
  legal: {
    privacy: 'Kebijakan Privasi',
    englishOnly:
      'Dokumen ini disediakan dalam bahasa Inggris, yang merupakan versi yang mengikat.',
    terms: 'Ketentuan Layanan',
    updated: (date: string) => `Terakhir diperbarui ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `Jatah agen untuk bulan ini sudah habis. Akan tersedia lagi pada ${date}.`,
  },
  notices: {
    freeUpSpace: 'Kosongkan ruang',
    mailLost:
      'Fewmail kehilangan akses ke Gmail-mu dan tidak membaca email baru.',
    mailboxLost: (email: string) => `Fewmail kehilangan akses ke ${email}.`,
    reconnect: 'Hubungkan lagi',
    sendLimit: (email: string, when: string) =>
      `${email} mencapai batas kirim harian Gmail. Bisa mengirim lagi ${when}.`,
    signInAgain: 'Masuk lagi',
    storageFull: (email: string) =>
      `Penyimpanan Google ${email} penuh, jadi Gmail menolak email baru.`,
    storageFullHint:
      'Kosongkan ruang atau tambah penyimpanan agar bisa menerima email lagi.',
  },
  login: {
    needsGmail:
      'Fewmail butuh akses ke Gmail-mu. Masuk lagi dan biarkan kotak Gmail tetap dicentang di layar Google.',
    agree: ((slots) => [
      'Dengan melanjutkan, kamu menyetujui ',
      slots.terms,
      ' dan ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Tidak ada yang dikirim atau diarsipkan tanpa persetujuanmu. Kalender dan kontak opsional.',
    continue: 'Lanjutkan dengan Google',
    lead: 'Fewmail membaca emailmu dan hanya menampilkan yang butuh kamu.',
    title: 'Hanya yang penting.',
  },
  mail: {
    inThread: (emails: string) => `${emails} dalam percakapan ini`,
    moreFrom: (name: string) => `Lainnya dari ${name}`,
    draftDeleted: 'Draf dihapus',
    unsubscribeConfirm: (name: string) => `Berhenti berlangganan dari ${name}?`,
    unsubscribeHint:
      'Fewmail keluar dari milis ini dan mengarsipkan percakapan ini. Berhenti berlangganan tidak bisa dibatalkan.',
    unsubscribing: 'Berhenti berlangganan…',
    pin: 'Sematkan',
    unpin: 'Lepas sematan',
    pinned: 'Disematkan',
    showAll: (n: number) => `Tampilkan semua ${n}`,
    showFewer: 'Tampilkan lebih sedikit',
    inboxTotal: (count: string) => `${count} total`,
    markShownRead: (n: number) => `Tandai ${n} sudah dibaca`,
    oneTimeCode: {
      copied: 'Kode disalin',
      copy: 'Salin kode',
    },
    openUnsubscribePage: 'Buka halaman',
    unsubscribeYourself:
      'Untuk keluar dari daftar ini, selesaikan di halamannya. Sementara itu emailnya diarsipkan.',
    allMailboxes: 'Semua kotak surat',
    filterAbout: {
      focused: 'Yang penting dan orang dulu, pemberitahuan dilipat',
      unread: 'Yang belum kamu baca, per jenis',
      categories: 'Seluruh kotak masuk per jenis, yang butuh kamu dulu',
      inbox: 'Semua, terbaru di atas',
    },
    find: {
      recent: 'Pencarian terakhir',
      tips: 'Tips',
      clearRecent: 'Hapus',
      describeExample: 'tagihan dari Anna bulan lalu',
      searching: 'Mencari di emailmu…',
      tip: {
        from: 'Email dari Anna',
        subject: 'Subjek menyebut “invoice”',
        attachment: 'Dengan lampiran',
        pdf: 'Dengan lampiran PDF',
        unread: 'Percakapan belum dibaca',
        week: 'Dari 7 hari terakhir',
        describe: 'Atau jelaskan dengan kata-katamu',
      },
    },
    group: {
      named: 'Pengirim atau subjek',
      mentioned: 'Disebut dalam teks',
      read: 'Sudah dibaca',
      earlier: 'Sebelumnya',
      important: 'Penting',
      people: 'Orang',
      plans: 'Kalender dan perjalanan',
      money: 'Uang',
      updates: 'Pemberitahuan',
      newsletters: 'Buletin',
      promotions: 'Promosi',
    },
    unread: 'Belum dibaca',
    block: 'Blokir pengirim',
    ignoresUnsubscribe: (name: string) =>
      `${name} mengabaikan berhenti berlangganan`,
    ignoresUnsubscribeHint:
      'Fewmail sudah meminta berhenti berlangganan, tetapi pengirim ini dikenal tetap mengirim email. Kirim emailnya ke sampah mulai sekarang? Kamu bisa membatalkannya di Aturan.',
    blocked: 'Diblokir. Email mereka kini masuk ke sampah.',
    forward: 'Teruskan',
    more: 'Lainnya',
    close: 'Tutup',
    reply: 'Balas',
    trash: 'Pindahkan ke sampah',
    trashed: 'Dipindahkan ke sampah',
    moveToInbox: 'Ke kotak masuk',
    backInInbox: 'Dipindahkan ke kotak masuk',
    movedToInbox:
      'Dikembalikan ke kotak masuk. Terima kasih sudah memberi tahu.',
    deleteDraft: 'Hapus draf',
    notSent: 'Tidak terkirim. Buka untuk mencoba lagi',
    noRecipients: 'Tanpa penerima',
    notSpam: 'Bukan spam',
    reportSpam: 'Laporkan spam',
    reportedSpam: 'Dilaporkan. Email mereka kini masuk ke spam.',
    archive: 'Arsipkan',
    archived: 'Diarsipkan',
    markedRead: 'Ditandai dibaca',
    markUnread: 'Tandai belum dibaca',
    markedUnread: 'Ditandai belum dibaca',
    attachment: 'lampiran',
    draftReply: 'Draf balasan',
    due: (date: string) => `jatuh tempo ${date}`,
    dueHint: 'Tenggat yang ditemukan agen di email ini',
    empty: 'Tidak ada email di sini',
    emptyHint: 'Email baru akan muncul di sini begitu tiba.',
    noResults: 'Tidak ada hasil',
    noResultsHint: 'Coba kata lain atau folder lain.',
    expectsReply: 'Menunggu balasan',
    filter: {
      categories: 'Kategori',
      archive: 'Arsip',
      trash: 'Sampah',
      drafts: 'Draf',
      spam: 'Spam',
      inbox: 'Kotak masuk',
      snoozed: 'Ditunda',
      sent: 'Terkirim',
      focused: 'Fokus',
      unread: 'Belum dibaca',
    },
    instruction: 'Beri tahu agen cara membalas, atau tekan Enter saja',
    open: 'Buka',
    search: 'Cari atau jelaskan',
    openInGmail: 'Buka di Gmail',
    collapseFullPage: 'Kembali ke daftar',
    unsubscribe: 'Berhenti berlangganan',
    unsubscribed: 'Berhenti berlangganan',
    unsubscribeFailed:
      'Pengirim ini tidak mendukung berhenti berlangganan sekali klik, jadi email-nya diarsipkan.',
    you: 'Kamu',
    sent: 'Terkirim',
    writeReply: 'Tulis balasan…',
    replyTo: 'Balas ke',
    date: 'Tanggal',
    authentication: 'Autentikasi',
    toLine: (recipients: string) => `kepada ${recipients}`,
  },
  subscriptions: {
    leftBy: (percent: number) =>
      `${percent}% pembacanya di Fewmail berhenti berlangganan`,
    unsubscribeHint: (emails: string) =>
      `Fewmail keluar dari milis ini dan mengarsipkan semua yang dikirimnya (${emails} bulan ini). Berhenti berlangganan tidak bisa dibatalkan.`,
    archivedOnly:
      'Pengirim ini tidak punya cara berhenti langganan yang bisa dipakai Fewmail, jadi emailnya diarsipkan, tetapi kamu masih di milis dan email baru akan terus datang.',
    count: (total: number) => `Milis: ${total}`,
    empty: 'Tidak ada milis yang mengirimimu email bulan ini.',
    lead: 'Buletin, promosi, dan milis lain yang mengirimimu email bulan ini, yang paling aktif lebih dulu. Berhenti langganan dari yang tidak pernah kamu baca: Fewmail keluar dari milis dan mengarsipkan semua kirimannya.',
    opened: (total: number) =>
      total === 0 ? 'tidak ada yang dibuka' : `${total} dibuka`,
    title: 'Milis',
    unsubscribe: 'Berhenti langganan',
    unsubscribed: 'Berhenti berlangganan',
  },
  nav: {
    board: 'Papan',
    menu: 'Menu',
    labels: 'Label',
    folders: 'Folder',
    calendar: 'Kalender',
    subscriptions: 'Milis',
    people: 'Orang',
    findPerson: 'Cari orang',
    personMail: 'Lihat email',
    deleteContact: 'Hapus kontak',
    contactDeleted: 'Kontak dihapus',
    clearSearch: 'Hapus pencarian',
    mail: 'Email',
    reading: 'Bacaan',
    rules: 'Aturan',
    search: 'Cari atau tanya…',
    settings: 'Pengaturan',
    syncFailed: 'Sinkronisasi Gmail gagal, mencoba lagi',
    syncing: 'Membaca kotak masukmu…',
    loading: 'Memuat',
    syncFailedIn: (email: string) =>
      `Sinkronisasi ${email} gagal, mencoba lagi`,
    syncingIn: (email: string) => `Membaca ${email}…`,
    home: 'Beranda',
    trialLeft: (total: number) => `Uji coba Pro · sisa ${total} hari`,
    usage: (percent: number) => `Agen · ${percent}% bulan ini terpakai`,
    watching: 'Agen sedang memantau kotak masukmu',
  },
  notifications: {
    many: (total: number) =>
      plural('id', total, {
        other: (n) => `${n} kabar baru dari Fewmail`,
      }),
  },
  onboarding: {
    languageHint:
      'Aplikasi, ikhtisar, dan penjelasan memakai bahasa ini. Balasan selalu mengikuti bahasa email yang kamu balas.',
    languageTitle: 'Fewmail harus berbicara dalam bahasa apa?',
    lead: 'Dua jawaban singkat. Semuanya bisa kamu ubah nanti di Pengaturan.',
    reading: 'Membaca kotak masukmu…',
    start: 'Mulai',
    title: 'Ayo siapkan agenmu.',
  },
  plan: {
    used: (percent: number) => `${percent}% terpakai`,
    about: (emails: string, messages: string) =>
      `Sekitar ${emails} email dibaca atau ${messages} pesan ke agen sebulan, dalam campuran apa pun.`,
    free: 'Gratis',
    freeDescription:
      'Email yang cepat dan tenang dengan aturan sederhana. Gratis selama kamu mau.',
    includes:
      'Setiap paket berbayar menambahkan agen: setiap email dibaca dan diringkas, balasan disusun dengan gayamu, aturan dalam kata-kata biasa, Telegram, dan MCP.',
    manage: 'Kelola tagihan',
    price: (usd: number) => `$${usd} / bulan`,
    priceYearly: (usd: number) => `$${usd} / tahun`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
    cancels: (plan: string, date: string) =>
      `${plan} sampai ${date}, lalu Gratis.`,
    choose: (plan: string) => `Pilih ${plan}`,
    proRenews: (date: string) => `Diperpanjang pada ${date}.`,
    resets: (date: string) => `Diatur ulang pada ${date}.`,
    title: 'Paket',
    trial: 'Uji coba Pro',
    welcome: (plan: string) =>
      `Selamat datang di ${plan}. Agen kembali bertugas.`,
    yearly: 'Bayar tahunan',
    yearlyHint: 'Gratis dua bulan.',
    trialDescription: (date: string) =>
      `Semua fitur Pro sampai ${date}, lalu gratis. Tanpa kartu.`,
    upgrade: 'Paket lain',
    usage: 'Bulan ini',
  },
  headsUp: {
    deadline: 'Hari terakhir segera',
    notYet: 'Belum ada kabar sejak itu',
    price: 'Harga naik',
    priceUp: (what: string, from: string, to: string) =>
      `${what}: ${to}, sebelumnya ${from}`,
    promised: 'Dijanjikan untukmu',
  },
  queue: {
    addToCalendar: 'Tambah ke kalender',
    writeReminder: 'Tulis pengingat',
    approve: 'Setujui',
    delete: 'Hapus',
    pick: 'Pilih',
    picked: (n: number) => `${n} dipilih`,
    unpick: 'Batal pilih',
    askedByYou: 'Atas permintaanmu',
    draftedInVoice: 'Ditulis dengan gayamu',
    openEmail: 'Buka email',
    send: 'Kirim',
    rewrite: 'Tulis ulang',
    shorterInstruction: 'Buat lebih singkat.',
    new: 'Baru',
    skipStale: 'Lewati semua',
    skipped: (n: number) => `Dilewati: ${n}`,
    stale: (n: number) => `Lebih dari seminggu: ${n}`,
    skip: 'Lewati',
  },
  reminders: {
    followUp: 'Tindak lanjut',
    noReply: 'Belum dibalas',
  },
  risk: {
    prompt_injection: (domain: string) =>
      `${domain} menyembunyikan instruksi untuk asisten pembaca email di email ini. Agen mengabaikannya; jangan teruskan dan jangan lakukan yang dimintanya.`,
    known_phishing: (domain: string) =>
      `${domain} ada di daftar publik situs phishing aktif. Jangan klik tautan, masuk, atau membayar.`,
    lookalike_domain: (domain: string) =>
      `Terlihat seperti ${domain}, tapi alamatnya berbeda. Jangan klik tautan atau membayar.`,
    new_sender_payment: (domain: string) =>
      `Email pertama dari ${domain} dan langsung meminta uang. Pastikan lewat saluran yang sudah kamu percaya.`,
    spoofed_sender: (domain: string) =>
      `Mengaku dari ${domain}, tapi ${domain} tidak mengirimnya. Jangan klik tautan atau membayar.`,
    payment_change: (domain: string) =>
      `Detail pembayaran baru dari ${domain}. Konfirmasi lewat telepon sebelum membayar.`,
    title: 'Cek dulu sebelum bertindak',
  },
  rules: {
    deleted: 'Aturan dihapus',
    add: 'Tambah aturan',
    count: (total: number) =>
      plural('id', total, { other: (n) => `${n} aturan` }),
    delete: 'Hapus',
    describe: {
      alwaysShow: 'Selalu masuk ke Beranda',
      autonomous: 'Dikerjakan sendiri, tercatat di yang sudah ditangani',
      draft: 'Draf menunggumu di Beranda',
    },
    effect: {
      always_show: 'Selalu tampilkan',
      archive: 'Arsipkan',
      draft_reply: 'Buat draf balasan',
      mark_read: 'Tandai sudah dibaca',
      trash: 'Pindahkan ke sampah',
      unsubscribe: 'Berhenti langganan',
    },
    enabled: 'Aturan aktif',
    lead: 'Beri tahu agen dengan kata-kata biasa apa yang harus dilakukan pada email tertentu. Agen mencocokkan setiap email dengan aturan ini.',
    newTitle: 'Ajarkan aturan baru',
    leadFree:
      'Arsipkan, tandai sudah dibaca, atau berhenti berlangganan secara otomatis. Aturan berjalan pada email baru begitu email itu tiba.',
    placeholder: 'mis. Tagihan dari Hetzner, atau notifikasi LinkedIn',
    simple: {
      appliedAutomatically: 'Diterapkan otomatis pada email baru',
      field: {
        from: 'Dari',
        mailingList: 'Milis apa pun',
        subject: 'Subjek berisi',
      },
      title: {
        from: (value: string) => `Dari “${value}”`,
        mailingList: () => 'Milis apa pun',
        subject: (value: string) => `Subjek berisi “${value}”`,
      },
      valuePlaceholder: 'anna@example.com, nama, atau kata',
      whichField: 'Cocokkan berdasarkan',
    },
    title: 'Aturan',
    whatAgentDoes: 'Yang dilakukan agen',
    whichEmails: 'Email yang mana',
  },
  settings: {
    disconnectConfirm: (name: string) => `Putuskan ${name}?`,
    messengerDisconnectHint:
      'Bot berhenti mengirimimu pesan. Untuk menghubungkan lagi, perlu tautan baru dari halaman ini.',
    readingDigest: {
      description:
        'Setiap pagi, newsletter kemarin datang ke Telegram dan WhatsApp dalam satu pesan, atau sebagai notifikasi jika keduanya belum terhubung.',
      title: 'Ringkasan newsletter',
    },
    account: 'Akun',
    agent: 'Agen',
    morningDescription: (timezone: string) =>
      `Ringkasan newsletter dan laporan mingguan hari Senin, di zona waktumu, ${timezone}`,
    morningTitle: 'Pesan pagi',
    deleteAccount: 'Hapus akun',
    deleteConfirm: 'Hapus semuanya',
    deleteDescription:
      'Langsung menghapus akun, email yang disinkronkan, draf, dan aturanmu dari Fewmail. Gmail-mu sendiri tidak disentuh. Paket berbayar langsung dibatalkan.',
    deleteFailed: 'Akun tidak terhapus. Coba lagi sebentar lagi.',
    deleteSignIn:
      'Untuk memastikan ini kamu, masuk lagi dengan Google, lalu hapus akunnya.',
    deleteTitle: 'Hapus akun Fewmail-mu?',
    cancel: 'Batal',
    integrations: 'Integrasi',
    knowledge: {
      description:
        'Harga, alamat, ketersediaan, cara kamu suka membalas. Agen memakainya di draf dan pelengkapan otomatis.',
      placeholder:
        'mis. Konsultasi $150/h. Saya tidak menerima telepon di hari Jumat. Alamat saya…',
      title: 'Yang perlu diketahui agen',
    },
    labels: {
      description:
        'Pilah email ke label Fewmail/… agar Gmail di ponsel kamu menampilkan urutan yang sama.',
      title: 'Label agen di Gmail',
    },
    language: 'Bahasa',
    languageDescription:
      'Aplikasi, bot, dan ikhtisar. Balasan mengikuti email.',
    legal: 'Legal',
    mailboxes: {
      removeConfirm: (email: string) => `Hapus ${email}?`,
      removeHint:
        'Fewmail berhenti membacanya dan melupakan apa yang dibacanya di sana. Tidak ada yang berubah di Gmail.',
      add: 'Tambah Gmail',
      addDescription:
        'Email dari akun Gmail lain masuk ke Beranda dan kotak masuk yang sama. Akun itu tidak bisa dipakai masuk ke sini: masuk dengannya membuka Fewmail terpisah.',
      added: 'Kotak surat ditambahkan. Emailnya muncul dalam semenit.',
      failed:
        'Kotak surat tidak bisa ditambahkan. Izinkan akses Gmail lalu coba lagi.',
      lost: 'Akses Gmail hilang. Tambahkan lagi untuk menyambungkan ulang.',
      reading: 'Membaca email…',
      remove: 'Hapus',
      retrying:
        'Gmail sedang tidak merespons. Fewmail akan mencoba lagi sendiri.',
      signIn: 'Anda masuk dengan akun ini',
      signInChosen: 'Itu akun yang Anda pakai untuk masuk. Pilih akun lain.',
      signInLost: 'Akses Gmail hilang. Masuk lagi untuk menyambungkan ulang.',
      synced: (ago: string) => `Disinkronkan ${ago}`,
      title: 'Kotak surat',
    },
    mcp: {
      disconnectHint:
        'Aplikasi ini tidak bisa lagi membaca emailmu sampai kamu menghubungkannya lagi.',
      allow: 'Izinkan',
      connected: (ago: string) => `Terhubung ${ago}`,
      copy: 'Salin URL',
      defaultName: 'Klien MCP',
      deny: 'Tolak',
      description:
        'Mereka bisa membaca emailmu, menyusun draf balasan, dan mengirimnya setelah kamu konfirmasi.',
      disconnect: 'Putuskan',
      paste:
        'Tambahkan URL ini sebagai konektor di aplikasimu, lalu masuk ke Fewmail.',
      request: (app: string) => `${app} ingin memakai Fewmail-mu`,
      title: 'Hubungkan Claude, Cursor, atau klien MCP apa pun',
    },
    signedInWithGoogle: 'Masuk dengan Google',
    signOut: 'Keluar',
    snippets: {
      deleted: 'Snippet dihapus',
      add: 'Tambah snippet',
      body: 'Teks',
      delete: 'Hapus',
      description:
        'Ketik ; di editor untuk menyisipkan snippet berdasarkan nama.',
      name: 'Nama',
      title: 'Snippet',
    },
    notifications: {
      blocked: 'Notifikasi diblokir. Izinkan di pengaturan situs browser.',
      browser: 'Browser ini',
      messengerOff: 'Email mendesak tetap di Fewmail.',
      messengerOn: 'Email mendesak langsung masuk ke chat.',
      notConfigured: 'Notifikasi browser belum dikonfigurasi di server ini.',
      off: 'Terima email mendesak di sini, bahkan saat Fewmail ditutup.',
      on: 'Email mendesak muncul di sini. Beberapa sekaligus datang sebagai satu.',
      title: 'Notifikasi',
      unsupported: 'Browser ini tidak dapat menampilkan notifikasi.',
    },
    telegram: {
      connect: 'Hubungkan Telegram',
      disconnect: 'Putuskan',
      linked: 'Email mendesak langsung tiba. Setujui dan edit draf dari chat.',
      linkedQuiet: 'Setujui dan edit draf dari chat.',
      notConfigured: 'Bot Telegram belum dikonfigurasi di server ini.',
      unlinked: 'Terima email mendesak dan setujui draf dari Telegram.',
    },
    whatsapp: {
      connect: 'Hubungkan WhatsApp',
      disconnect: 'Putuskan',
      linked: 'Email mendesak langsung tiba. Setujui dan edit draf dari chat.',
      linkedQuiet: 'Setujui dan edit draf dari chat.',
      notConfigured: 'Bot WhatsApp belum dikonfigurasi di server ini.',
      unlinked: 'Terima email mendesak dan setujui draf dari WhatsApp.',
    },
    title: 'Pengaturan',
  },
  site: {
    meta: {
      assistant:
        'Fewmail adalah asisten email AI untuk Gmail yang membaca setiap email lebih dulu, menulis draf balasan dengan gayamu, dan hanya menunjukkan yang butuh kamu. Gratis untuk mulai.',
      assistantTitle: 'Asisten email AI untuk Gmail',
      compare:
        'Perbandingan Fewmail dengan Superhuman, Shortwave, dan SaneBox: agen AI yang membaca email untukmu, bukan cara lebih cepat untuk membacanya sendiri.',
      compareTitle: 'Perbandingan asisten email AI',
      home: 'Fewmail adalah asisten email AI untuk Gmail: membaca setiap email, menulis draf balasan dengan gayamu, dan hanya menunjukkan yang butuh kamu.',
      login:
        'Fewmail membaca Gmail-mu untukmu, membalas dengan gayamu, dan hanya menunjukkan yang benar-benar butuh kamu.',
      mcp: 'Hubungkan Fewmail ke Claude, ChatGPT, Claude Code, atau Cursor sebagai server MCP: baca dan pilah Gmail dari AI yang sudah kamu pakai.',
      motto: 'hanya yang penting di kotak masukmu',
      pricing: (trialDays: number) =>
        `Fewmail gratis selamanya untuk Beranda, memilah, aturan, dan perlindungan spam. Pro, agen lengkapnya, dimulai dengan ${trialDays} hari gratis tanpa kartu.`,
      tagline: 'agen email AI untuk Gmail',
    },
    chapters: {
      pricing: {
        description:
          'Beranda, penyortiran, aturan, dan perlindungan gratis selamanya. Lite, Pro, dan Max menambahkan semua yang membaca dan menulis untukmu; paket yang lebih besar hanya melakukannya lebih banyak.',
        label: 'Harga',
        title: (usd: number) =>
          `Gratis untuk penyortiran. Mulai $${usd} untuk agennya.`,
      },
      questions: {
        description:
          'Jawaban singkatnya ada di sini. Yang panjang ada di kebijakan privasi.',
        label: 'Pertanyaan',
        title: 'Sebelum kamu menghubungkan Gmail.',
      },
    },
    closing: {
      lead: 'Hubungkan Gmail dalam semenit. Fewmail mulai dari email tiga hari terakhir, jadi keputusan pertama langsung menunggumu.',
      title: 'Rebut kembali pagimu.',
    },
    mcp: {
      answer:
        'Kontrak yang sudah ditandatangani, sebelum kickoff hari Jumat. Balasannya sudah disusun dan menunggu di antrean Fewmail-mu.',
      clients: 'Bekerja dengan',
      emphasis: 'Claude dan ChatGPT.',
      free: 'Membaca emailmu dan penyortiran oleh agen gratis.',
      label: 'MCP',
      lead: 'Hubungkan Fewmail sebagai server MCP dan tanyakan soal emailmu dari asisten yang sudah kamu pakai. Apa pun yang mengirim email atau mengubah Gmail tetap menunggu persetujuanmu.',
      question: 'Apa yang Anna butuhkan dariku minggu ini?',
      setup: 'Hubungkan dalam semenit',
      title: 'Emailmu, langsung di Claude dan ChatGPT.',
    },
    mcpPage: {
      copy: 'Salin URL',
      lead: 'Hubungkan Fewmail sebagai server MCP dan tanyakan emailmu dari AI yang sudah kamu pakai. Membaca email dan penyortiran oleh agen gratis; draf, pengiriman, dan aturan ada di Pro.',
      safety:
        'Apa pun yang mengirim email atau mengubah Gmail meminta persetujuanmu dulu. Email yang mencoba memerintah asisten ditandai sebelum asisten membacanya. Emailmu tidak pernah dipakai melatih model, dan aplikasi apa pun bisa diputus di Pengaturan.',
      steps: {
        chatgpt:
          'Di Settings, tambahkan konektor (app) dengan URL ini, lalu masuk ke Fewmail.',
        claude:
          'Di Settings → Connectors, tambahkan konektor khusus dengan URL ini, lalu masuk ke Fewmail.',
        code: 'Jalankan ini sekali di terminal, lalu masuk ke Fewmail saat Claude Code meminta.',
        cursor:
          'Tambahkan ini ke mcp.json-mu, lalu masuk ke Fewmail saat Cursor meminta.',
      },
      title: 'Fewmail di dalam Claude, ChatGPT, dan alatmu.',
    },
    assistantPage: {
      abilities: {
        ask: {
          description:
            'Tanyakan “kapan pesawatku berangkat?” dan dapatkan jawabannya beserta email asalnya, di Fewmail, Telegram, atau WhatsApp, atau dari Claude dan ChatGPT.',
          title: 'Jawaban dari emailmu',
        },
        drafts: {
          description:
            'Balasan ditulis lebih dulu, dengan gayamu dan dalam bahasa pengirim, lalu menunggu di antreanmu sampai kamu menyetujuinya.',
          title: 'Menulis draf balasan dengan gayamu',
        },
        protection: {
          description:
            'Detail rekening yang berubah, domain tiruan, dan penipuan yang sudah dikenal memunculkan peringatan sebelum kamu bertindak.',
          title: 'Memperingatkan soal phishing',
        },
        reading: {
          description:
            'Newsletter hari ini menjadi satu ringkasan per topik, tiap kalimat tertaut ke email asalnya.',
          title: 'Newsletter dalam satu ringkasan',
        },
        rules: {
          description:
            'Jelaskan dalam satu kalimat apa yang harus terjadi pada email tertentu, dan itu menjadi aturan. Hanya aturan yang kamu nyalakan yang bertindak sendiri.',
          title: 'Aturan dengan kata-kata biasa',
        },
        sorting: {
          description:
            'Setiap email mendapat ringkasan dan skor kepentingan, jadi yang mendesak naik ke atas, sementara struk, notifikasi, dan promosi tidak menghalangimu.',
          title: 'Membaca dan memilah setiap email',
        },
      },
      abilitiesDescription:
        'Semuanya terjadi di Gmail yang sudah kamu pakai, dan setiap tindakan agen dicatat beserta alasannya.',
      abilitiesLabel: 'Yang dilakukannya',
      abilitiesTitle: 'Asisten, bukan kotak masuk baru.',
      compareTitle: 'Dibandingkan dengan alat email AI lainnya.',
      faq: (trialDays: number) => [
        {
          answer:
            'Perangkat lunak yang memakai AI untuk membaca, memilah, dan membalas email untukmu. Kebanyakan hanya menambahkan ringkasan dan bantuan menulis ke kotak masuk yang tetap kamu baca sendiri. Fewmail melangkah lebih jauh: ia membaca semuanya lebih dulu, jadi kamu hanya melihat yang butuh kamu.',
          question: 'Apa itu asisten email AI?',
        },
        {
          answer:
            'Fewmail mengenkripsi subjek, isi, ringkasan, dan draf di database-nya, tidak pernah memakai emailmu untuk melatih model, dan tidak pernah mengirim atau mengubah apa pun di Gmail tanpa persetujuanmu. Kamu bisa memutuskannya dan menghapus semuanya kapan saja.',
          question: 'Apakah aman membiarkan AI membaca emailku?',
        },
        {
          answer:
            'Ia menuliskan drafnya untukmu, tetapi tidak pernah mengirim satu pun sendiri. Setiap draf menunggu persetujuanmu di antrean, dan draf yang mirip bisa disetujui sekaligus.',
          question: 'Bisakah ia membalas email secara otomatis?',
        },
        {
          answer: `Ada. Paket Gratis memilah setiap email, mengumpulkan yang butuh kamu di satu halaman, menjalankan aturanmu, dan melindungimu dari spam dan phishing, selamanya. Draf, ringkasan, dan bagian agen lainnya ada di paket berbayar, dan setiap akun dimulai dengan ${trialDays} hari Pro, tanpa kartu.`,
          question: 'Adakah asisten email AI gratis untuk Gmail?',
        },
      ],
      faqTitle: 'Seputar asisten email AI.',
      lead: 'Fewmail membaca setiap email di Gmail-mu begitu tiba, menyingkirkan yang tidak penting, menulis draf balasan dengan gayamu, dan hanya membawa beberapa hal yang butuh keputusanmu. Tidak ada yang dikirim atau diubah tanpa persetujuanmu.',
      title: 'Asisten email AI yang membaca Gmail-mu lebih dulu.',
    },
    comparePage: {
      lead: 'Aplikasi email membuatmu lebih cepat membaca setiap email. Filter memindahkan email ke folder. Fewmail adalah agen: ia membaca email, memutuskan apa yang bisa menunggu, dan hanya bertanya padamu soal sisanya.',
      title: 'Fewmail dibandingkan.',
    },
    comparison: {
      custom: 'Khusus',
      features: 'Fitur demi fitur',
      groups: {
        agent: 'Membaca dan membalas',
        day: 'Harimu',
        reach: 'Di mana bisa dipakai',
        safety: 'Perlindungan',
      },
      labels: {
        ask: 'Tanyakan apa saja ke emailmu',
        home: 'Yang butuh kamu, dalam satu halaman',
        calendar: 'Kalender',
        drafts: 'Balasan yang disusunkan untukmu',
        followUps: 'Pengingat tindak lanjut',
        gmail: 'Gmail dan Google Workspace',
        handOver: 'Serahkan sebuah percakapan',
        importance: 'Diurutkan menurut kepentingan',
        keepApp: 'Tetap pakai aplikasi emailmu',
        mcp: 'MCP untuk alatmu sendiri',
        memory: 'Mengingat janji dan orang',
        otherProviders: 'iCloud, Yahoo, dan email IMAP lainnya',
        outlook: 'Outlook dan Microsoft 365',
        phishing: 'Peringatan phishing dan perubahan pembayaran',
        phone: 'Di ponselmu',
        rules: 'Aturan dengan kata-kata biasa',
        snooze: 'Tunda',
        spamShield: 'Perisai spam komunitas',
        summaries: 'Ringkasan email',
        teams: 'Kotak masuk tim',
        unsubscribe: 'Berhenti langganan sekali klik',
      },
      more: 'Perbandingan lainnya',
      no: 'Tidak',
      noFreePlan: 'Tanpa paket gratis',
      ours: {
        ask: 'Di Pro',
        home: 'Langsung diperbarui, setujui sekaligus, gratis',
        drafts: 'Dengan gayamu, dikirim hanya setelah kamu setujui, di Pro',
        followUps: 'Otomatis, untuk email yang menunggu balasan',
        handOver: 'Agen menuntaskannya sampai tujuan, di Pro',
        importance: 'Setiap email dinilai, gratis',
        keepApp: 'Semuanya muncul di Gmail',
        mcp: 'Di Pro',
        memory: 'Di Pro',
        phone: 'Telegram dan WhatsApp, dengan suara, di Pro',
        rules: 'Arsipkan, tandai dibaca, atau berhenti langganan, gratis',
        summaries: 'Di Pro',
        unsubscribe: 'Pengirim yang mengabaikannya masuk spam',
      },
      plans: 'Paket dan harga',
      read: 'Baca perbandingannya',
      source: (name: string, date: string) =>
        `Detail ${name} diambil dari situs web publiknya, diperiksa pada ${date}. Harga dan fitur bisa berubah; cek situs mereka untuk penawaran terbaru.`,
      title: (name: string) => `Fewmail vs ${name}`,
      tryFree: 'Coba Fewmail gratis',
      which: 'Mana yang cocok untukmu?',
      yes: 'Ya',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 kotak surat dan semua fitur, termasuk AI Bundle',
          lunch: '2 kotak surat, tunda, dan pengingat',
          snack: '1 kotak surat dan filter dasar',
        },
        summary:
          'SaneBox menyortir email ke dalam folder, dan di paket teratasnya juga menyusun draf dan ringkasan. Fewmail membaca semuanya lebih dulu, lalu mengumpulkan di satu halaman sedikit keputusan yang hanya bisa kamu ambil.',
        them: {
          home: 'Rangkuman harian email yang sudah difilter',
          drafts: 'SaneDrafts, di Dinner',
          followUps: 'SaneNoReplies',
          importance: 'Email tak penting dipindah ke SaneLater',
          keepApp: 'Bekerja lewat folder',
          otherProviders: 'Server IMAP atau Exchange apa pun',
          phone: 'Lewat aplikasi emailmu',
          rules: 'Dilatih dengan memindahkan email antarfolder',
          snooze: 'Mulai Lunch',
          summaries: 'SaneSummary, di Dinner',
          unsubscribe: 'Folder SaneBlackHole',
        },
        verdict:
          'Pilih SaneBox jika emailmu di luar Gmail dan folder sudah cukup. Pilih Fewmail jika kamu memakai Gmail dan ingin email penting dibaca, diringkas, dan dibalas.',
      },
      shortwave: {
        plans: {
          business: 'Per pengguna',
          free: 'Sebagian besar fitur dan asistennya',
          max: 'Per pengguna, model terkuat',
          premier: 'Per pengguna, model lebih kuat',
          pro: 'Seluruh riwayat, pencarian dan penulisan AI',
        },
        summary:
          'Shortwave adalah aplikasi email dengan asisten AI yang bisa kamu ajak bicara. Fewmail adalah agen yang membaca lebih dulu dan hanya menanyakan apa yang tidak bisa ia putuskan.',
        them: {
          ask: 'Asisten AI dan pencarian',
          drafts: 'Saat kamu minta',
          importance: 'Split dan bundel',
          keepApp: 'Menggantikan aplikasi emailmu',
          memory: 'Memori AI',
          otherProviders: 'Diteruskan ke Gmail',
          outlook: 'Microsoft 365 tidak didukung',
          phone: 'Aplikasi iOS dan Android',
          rules: 'Filter AI, 3 sampai 50 sesuai paket',
          summaries: 'Di atas setiap email',
          teams: 'Percakapan dan komentar bersama',
          unsubscribe: 'Dengan blokir sekali klik',
        },
        verdict:
          'Pilih Shortwave jika kamu ingin kotak masuk baru dengan asisten chat. Pilih Fewmail jika kamu ingin lebih sedikit email untuk dilihat, di Gmail yang sudah kamu pakai.',
      },
      superhuman: {
        plans: {
          business:
            'Per anggota, $33 ditagih tahunan. Menambah Auto Drafts dan Ask AI',
          enterprise: 'SSO dan kontrol admin',
          starter: 'Per anggota, $25 ditagih tahunan',
        },
        summary:
          'Superhuman membuatmu lebih cepat memeriksa setiap email. Fewmail memeriksanya untukmu dan hanya menampilkan yang butuh kamu.',
        them: {
          ask: 'Ask AI, di Business',
          drafts: 'Auto Drafts, di Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox dan Auto Labels',
          keepApp: 'Menggantikan aplikasi emailmu',
          mcp: 'Di Business',
          phone: 'Aplikasi iOS dan Android',
          rules: 'Custom Auto Labels, di Business',
          spamShield: 'Filter penyedia emailmu',
          summaries: 'Auto Summarize',
          teams: 'Draf dan komentar bersama',
        },
        verdict:
          'Pilih Superhuman jika kamu ingin menyentuh setiap email sendiri, dengan lebih cepat. Pilih Fewmail jika kamu lebih suka tidak melihat sebagian besar email sama sekali.',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'Banyak alat email AI hanyalah kotak masuk baru dengan kolom chat: kamu tetap membaca setiap email, hanya dengan ringkasan di atasnya. Fewmail adalah agen AI di atas Gmail yang sudah kamu pakai. Ia membaca setiap email lebih dulu, menulis draf balasan dengan gayamu, dan hanya membawa beberapa keputusan yang butuh kamu.',
        question: 'Apa bedanya Fewmail dengan asisten email AI lainnya?',
      },
      {
        answer:
          'Tidak. Fewmail bekerja di atas Gmail. Semua yang dilakukannya juga terlihat di Gmail, dan kamu tetap bisa memakai aplikasi Gmail mana pun bersamaan.',
        question: 'Apakah aku harus meninggalkan Gmail?',
      },
      {
        answer:
          'Tidak pernah tanpa kamu. Balasan menunggu di antreanmu sampai kamu menyetujuinya, dan hanya aturan yang kamu buat atau pertahankan yang boleh mengarsipkan, menandai dibaca, atau berhenti langganan sendiri. Semua yang dilakukannya tercatat di Sudah ditangani.',
        question: 'Bisakah ia mengirim atau menghapus email sendiri?',
      },
      {
        answer:
          'Subjek, isi, ringkasan, dan draf dienkripsi di database kami. Emailmu tidak pernah dipakai untuk melatih model, dan perisai spam hanya membagikan hash berkunci antarpengguna, tidak pernah alamat atau isi.',
        question: 'Apa yang terjadi pada emailku?',
      },
      {
        answer: `Setiap akun baru mendapat ${trialDays} hari Pro, tanpa kartu. Setelah selesai, kamu cukup tetap di paket Gratis; tidak ada yang dihapus dan tidak ada tagihan.`,
        question: 'Apa yang terjadi setelah uji coba?',
      },
      {
        answer:
          'Draf ditulis dalam bahasa email yang kamu balas. Aplikasi, ringkasan, dan bot Telegram memakai satu bahasa pilihanmu, dari lima belas bahasa.',
        question: 'Bahasa apa saja yang didukung?',
      },
      {
        answer:
          'Saat ini akun Gmail dan Google Workspace. Tambahkan beberapa kotak surat ke satu Fewmail, dan emailnya masuk ke Beranda dan kotak masuk yang sama.',
        question: 'Akun email apa saja yang bisa dipakai?',
      },
    ],
    features: {
      description:
        'Urusan email yang dulu menghabiskan satu sore, kini dikerjakan di latar belakang dan dicatat di tempat yang bisa kamu periksa.',
      items: {
        codes: {
          description:
            'Kode terbaru menunggu di atas Beranda dan di samping emailnya, siap disalin tanpa membuka apa pun. Gratis.',
          title: 'Kode masuk',
        },
        subscriptions: {
          description:
            'Setiap milis yang menulis bulan ini, dengan berapa emailnya yang benar-benar kamu buka. Berhenti langganan dari mana saja dengan satu tombol. Gratis.',
          title: 'Milis',
        },
        ask: {
          description:
            'Tanyakan apa saja dengan kata-kata biasa dan dapatkan jawaban dari emailmu sendiri, lengkap dengan email sumbernya.',
          title: 'Tanya emailmu',
        },
        calendar: {
          description:
            'Kalender semua kotak suratmu dalam satu tampilan. Rapat yang diusulkan lewat email menjadi acara begitu kamu setuju.',
          title: 'Kalender',
        },
        clearOut: {
          description:
            'Semua tumpukan lama keluar sekaligus, hingga 50.000 email per kotak surat, semuanya di bawah satu label sehingga satu klik mengembalikan semuanya. Gratis.',
          title: 'Bersihkan kotak masuk',
        },
        reading: {
          description:
            'Satu ringkasan newsletter hari ini: berita per topik, tiap kalimat tertaut ke sumbernya, dan yang layak dibaca utuh.',
          title: 'Bacaan',
        },
        voice: {
          description:
            'Dengarkan ringkasan newsletter kamu dibacakan. Kirim pesan suara di Telegram atau WhatsApp dan agen menjawab dengan suara.',
          title: 'Dengarkan, bukan baca',
        },
        wrapped: {
          description:
            'Bulan atau tahunmu dalam email: apa yang masuk, apa yang ditangani, berapa banyak waktu yang kembali padamu. Bisa dibagikan, tanpa pernah menampilkan nama.',
          title: 'Tahunmu dalam email',
        },
      },
      label: 'Dan selebihnya',
      title: 'Semua hal lain yang biasa dikerjakan seorang asisten.',
    },
    footer: {
      legal: 'Legal',
      product: 'Produk',
      tagline:
        'Agen email AI yang membaca Gmail-mu dan hanya menampilkan yang butuh kamu.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'tak lagi kamu alami.',
      label: 'Yang hilang',
      rows: [
        {
          fix: 'Bersihkan kotak masuk menyingkirkan semua tumpukan lama sekaligus: iklan lama, notifikasi yang sudah dibaca, milis yang tak pernah kamu buka. Satu klik mengembalikan semuanya.',
          problem: 'Ribuan email yang tak akan pernah dibaca siapa pun.',
        },
        {
          fix: 'Balasan disusun lebih awal, dengan gayamu dan dalam bahasa mereka. Yang mirip bisa disetujui sekaligus dengan ⇧⏎, dan tetap bisa kamu periksa satu per satu.',
          problem: 'Membalas email tengah malam.',
        },
        {
          fix: 'Satu tombol berhenti langganan seperti yang dilakukan manusia: satu klik, halaman berhenti langganan, atau email. Pengirim yang tetap menulis ketahuan dan diusulkan sebagai spam.',
          problem: 'Newsletter yang tak pernah kamu daftari.',
        },
        {
          fix: 'Newsletter hari ini jadi satu ringkasan per topik, dengan yang layak dibaca utuh ditandai.',
          problem: 'Newsletter yang ingin kamu baca.',
        },
        {
          fix: 'Detail pembayaran yang berubah, domain tiruan, dan phishing yang sudah dikenal memunculkan peringatan sebelum kamu bertindak.',
          problem: 'Tagihan dengan detail rekening baru.',
        },
        {
          fix: 'Janji yang kamu buat di email terkirim kembali padamu saat waktunya tiba, dan percakapan yang tak dibalas siapa pun akan ditindaklanjuti.',
          problem: 'Hal yang kamu janjikan lalu terlupa.',
        },
        {
          fix: 'Hanya email mendesak yang sampai ke Telegram atau WhatsApp. Sisanya menunggu di Beranda, sudah tersortir, kapan pun kamu sempat melihat.',
          problem: 'Mengecek email saat makan malam, jaga-jaga.',
        },
      ],
      title: 'Masalah email yang tak lagi kamu alami.',
    },
    hero: {
      needs: {
        emphasis: 'butuh kamu.',
        lead: (handled: string) =>
          `Anna menunggu kontraknya, tagihan Northwind jatuh tempo minggu depan, dan Marco minta hari Kamis. ${handled} newsletter dan notifikasi sudah ditangani, dan Beranda memperbarui diri begitu email baru masuk.`,
        tag: 'Beranda · Kamis, 08:12',
        title: 'Tiga hal butuh kamu.',
      },
      fates: {
        archived: 'Diarsipkan',
        markedRead: 'Ditandai dibaca',
        spam: 'Spam',
        summarised: 'Diringkas',
        unsubscribed: 'Berhenti langganan',
      },
      handled: ((slots) => [
        slots.count,
        ' ditangani, masing-masing dengan alasannya',
      ]) as Rich<'count'>,
      inbox: 'Kotak masuk',
      lead: 'Newsletter, struk, notifikasi, sebuah tautan phishing, dan di antaranya, tiga email yang benar-benar penting. Fewmail adalah agen AI yang membaca semuanya untukmu.',
      needYou: ((slots) => [slots.count, ' butuh kamu']) as Rich<'count'>,
      queue: [
        {
          reason: 'Kontrak jatuh tempo besok',
          summary:
            'Kontrak yang sudah ditandatangani perlu dikirim balik sebelum kickoff hari Jumat.',
        },
        {
          reason: 'Tagihan · $1,240, jatuh tempo 20 Nov',
          summary:
            'Tagihan Oktober untuk desain ulang situs web. Detail rekeningnya sama seperti sebelumnya.',
        },
        {
          reason: 'Usulan rapat',
          summary:
            'Mengusulkan Kamis pukul 15:00. Kamu baru luang mulai 16:00, jadi drafnya meminta jam empat.',
        },
      ],
      reading: {
        emphasis: 'setiap email.',
        lead: 'Ia mengarsipkan yang tak penting, menghentikan langganan yang tak pernah kamu buka, dan menghadang penipuan di depan pintu. Semua yang dilakukannya dicatat beserta alasannya, jadi kamu bisa memeriksanya.',
        title: 'Fewmail membaca setiap email.',
      },
      remind: 'Ingatkan aku 19 Nov',
      remindPlan: 'Menambahkannya ke tagihanmu dan mengingatkanmu pada 19 Nov.',
      start: 'Mulai gratis dengan Google',
      title: 'Email bukan pekerjaanmu.',
      home: 'Beranda',
      tryQueue: 'Coba antreannya',
      unread: ((slots) => [slots.count, ' belum dibaca']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' belum dibaca di kotak masukmu',
      ]) as Rich<'count'>,
      willDo: 'Yang akan dilakukan Fewmail',
    },
    nav: {
      assistant: 'Asisten email AI',
      compare: 'Bandingkan',
      features: 'Fitur',
      mcp: 'Server MCP',
      pricing: 'Harga',
      signIn: 'Masuk',
    },
    play: {
      again: 'Bersihkan lagi',
      doneLead: (handled: string) =>
        `Kamu membuat tiga keputusan. Fewmail mengurus ${handled} sisanya dan mencatat alasannya.`,
      doneTitle: 'Selesai untuk hari ini.',
      emphasis: 'dalam dua menit.',
      handled: [
        'Lumen Weekly: kamu tidak membuka satu pun dari 30 edisi terakhir',
        'paypa1-billing.com mirip paypal.com',
        'Parcelhub: pemberitahuan pengiriman, lewat aturan “Struk dan pengiriman”',
      ],
      handledTitle: 'Ditangani selagi kamu tidur',
      label: 'Coba',
      lead: 'Beginilah pagi sekarang. Drafnya sudah ditulis, alasannya sudah ada, kamu yang memutuskan. Ayo, bereskan.',
      left: (count: number) => `${count} perlu diputuskan`,
      title: 'Seluruh kotak masukmu, dalam dua menit.',
    },
    plans: {
      agent: 'Agen',
      details: 'Lihat semua paket secara rinci',
      emails: 'Email yang dibaca agen per bulan',
      everyPlan: 'Di setiap paket',
      messages: 'atau pesan ke agen',
      oneAllowance:
        'Satu jatah untuk semua yang dikerjakan agen: bayar sesuai pemakaian, dan email tak penting tidak pernah dihitung',
      forever: 'selamanya',
      free: {
        description:
          'Beranda, penyortiran, aturan, dan perlindungan. Selamanya.',
      },
      max: {
        description: 'Agen yang sama untuk kotak masuk yang sibuk.',
      },
      monthly: 'Bulanan',
      per: { month: 'per bulan', year: 'per tahun' },
      lite: {
        description: 'Agen seutuhnya: membaca, menulis, dan mengingat.',
      },
      pro: {
        description: 'Agen yang sama dengan ruang untuk lebih banyak email.',
      },
      tryFree: (days: number) => `Coba gratis ${days} hari`,
      yearly: 'Tahunan · gratis 2 bulan',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Beranda, penyortiran, aturan dengan kata-kata biasa, dan perlindungan gratis selamanya. Pro adalah agen yang membaca, menulis, dan mengingat untukmu; Max adalah agen yang sama dengan ruang lebih untuk kotak masuk yang sibuk. Setiap akun dimulai dengan ${trialDays} hari Pro, dan setelah selesai kamu cukup tetap di paket Gratis.`,
      otherTool: 'Sedang mempertimbangkan aplikasi lain?',
      title: 'Bayar untuk agennya, bukan kotak masuknya.',
    },
    startFree: 'Mulai gratis',
    trialNote: (days: number) =>
      `${days} hari Pro, tanpa kartu. Setelah itu gratis selama kamu mau.`,
    trust: {
      emphasis: 'bertanya',
      label: 'Emailmu, keputusanmu',
      places:
        'Bekerja di atas Gmail yang sudah kamu pakai, dan menjangkaumu di',
      title: 'Ia bertanya sebelum bertindak.',
      vows: [
        {
          description:
            'Draf menunggumu. Hanya aturan yang kamu buat atau pertahankan yang boleh mengarsipkan, menandai dibaca, atau berhenti langganan sendiri, dan semua yang dilakukannya tercatat di Sudah ditangani.',
          title: 'Tidak ada yang terkirim tanpa persetujuanmu.',
        },
        {
          description:
            'Subjek, isi, ringkasan, dan draf dienkripsi di database kami. Draf yang tersimpan tetap di Gmail, tidak pernah di tempat kami.',
          title: 'Dienkripsi saat disimpan.',
        },
        {
          description:
            'Perisai spam belajar dari semua pengguna lewat hash berkunci. Tidak satu alamat atau satu kata pun dari emailmu yang dibagikan.',
          title: 'Tidak pernah dipakai untuk melatih model.',
        },
      ],
    },
  },
  skills: {
    bills: 'Tagihan dan pembayaran jatuh tempo',
    cancel: 'Batalkan langganan berbayar',
    cleanup: 'Newsletter yang perlu dibereskan',
    followups: 'Siapa yang belum membalasmu',
    reading: 'Newsletter hari ini dalam satu ringkasan',
    today: 'Yang perlu kamu urus hari ini',
    waiting: 'Siapa yang menunggu balasanmu',
    week: 'Minggumu di email',
  },
  snooze: {
    laterToday: 'Nanti hari ini',
    nextWeek: 'Minggu depan',
    title: 'Tunda',
    tomorrow: 'Besok',
    unsnooze: 'Kembali ke kotak masuk',
    until: (date: string) => `Ditunda hingga ${date}`,
    weekend: 'Akhir pekan ini',
  },
  spam: {
    reasonList: 'Ada di daftar publik domain spammer',
    reasonPattern: {
      auth: 'Autentikasi pengirim gagal: alamatnya dipalsukan',
      infra:
        'Dikirim dari jaringan yang dilaporkan sebagai spam oleh beberapa pengguna Fewmail',
      link: 'Tautan ke situs yang dilaporkan sebagai spam oleh beberapa pengguna Fewmail',
      signals: 'Domain baru, alamat aneh, dan autentikasi lemah sekaligus',
      template:
        'Teks yang sama dengan yang dilaporkan sebagai spam oleh beberapa pengguna Fewmail',
    },
    reasonCommunity: 'Dilaporkan sebagai spam oleh beberapa pengguna Fewmail',
    reasonYou: 'Kamu melaporkan pengirim ini sebagai spam',
    suspect: 'Mirip spam',
    imagesHidden: 'Gambar disembunyikan di spam.',
    openFile: {
      action: 'Buka',
      description:
        'Email ini ada di spam. Buka filenya hanya jika Anda memercayai pengirimnya.',
      title: (name: string) => `Buka ${name}?`,
    },
    showImages: 'Tampilkan gambar',
  },
  starterRules: {
    alwaysShow:
      'Peringatan keamanan, tagihan yang jatuh tempo, apa pun dari bank atau pemerintah',
    newsletters: 'Buletin dan rangkuman berkala',
    notifications: 'Notifikasi otomatis dari alat dan layanan',
    promotions: 'Promosi, pemasaran, dan email penjualan yang tidak diminta',
    receipts: 'Tanda terima, konfirmasi pesanan dan pengiriman',
  },
  telegram: {
    approveAlike: 'Setujui sekaligus semua kartu sejenis:',
    chatTaken:
      'Chat ini sudah terhubung ke akun Fewmail lain. Putuskan Telegram di sana dulu (Pengaturan → Integrasi), lalu buka tautannya lagi.',
    queueChanged:
      'Kartunya sudah berubah sejak tadi. Ini yang perlu kamu tangani sekarang:',
    heard: (text: string) => `Terdengar: “${text}”`,
    voiceFailed: 'Aku tidak bisa menangkapnya. Coba lagi atau ketik saja.',
    help: 'Tulis atau ucapkan apa yang kamu perlukan:\n• tanya soal email: “kapan Netflix diperpanjang?”\n• bilang apa balasannya: “bilang ke Anna aku tanda tangan besok”\n• kasih tugas: “selalu arsipkan newsletter dari Medium”\n• balas salah satu drafku untuk mengubahnya',
    canceled: 'Dibatalkan. Draf kembali ke antrean kamu.',
    sendingIn: (seconds: number) => `Mengirim dalam ${seconds} dtk`,
    undo: 'Urungkan',
    commands: { queue: 'Yang butuh kamu' },
    connectFirst: (url: string) =>
      `Hai! Aku Fewmail. Di Telegram ini aku memberi tahu saat email penting masuk, menunjukkan apa yang perlu kamu tangani, dan mengirim balasan yang kamu setujui.\n\nChat ini belum terhubung ke Fewmail-mu. Cuma butuh semenit:\n1. Buka pengaturan Fewmail: ${url}\n2. Di Integrasi, ketuk “Hubungkan Telegram” (bagian dari Fewmail Pro).\n3. Telegram akan membawamu kembali ke sini — tekan Mulai, dan selesai.`,
    connected:
      'Terhubung. Aku akan memberi tahu saat ada yang mendesak.\n\n/queue: yang butuh kamu',
    done: 'Selesai',
    draft: 'Draf:',
    edit: 'Edit',
    editPrompt:
      'Kirimkan teks penggantinya, atau beri tahu cara mengubahnya dengan awalan “/”, mis. “/lebih formal”.',
    newDraft: 'Draf baru:',
    nothing: 'Tidak ada yang butuh kamu saat ini.',
    proOnly:
      'Telegram adalah bagian dari Fewmail Pro. Buka Pengaturan → Paket di Fewmail untuk beralih.',
    draftClipped:
      'Dipendekkan di sini. “Kirim” mengirim draf lengkap. Baca di Fewmail.',
    rewriting: 'Menulis ulang…',
    send: 'Kirim',
    sendThis: 'Kirim ini',
    shorter: 'Persingkat',
    skip: 'Lewati',
    skipped: 'Dilewati',
    somethingWrong: 'Terjadi kesalahan',
    urgent: 'Mendesak',
    willSend: 'Akan dikirim:',
  },
  today: {
    working: 'Sedang dikerjakan…',
    allKinds: 'Semua',
    ruleSuggestion: {
      done: {
        archive:
          'Email baru dari pengirim ini akan diarsipkan. Ubah di Aturan.',
        mark_read:
          'Email baru dari pengirim ini akan ditandai sudah dibaca. Ubah di Aturan.',
      },
      label: 'Aturan yang disarankan',
      lead: (count: number, effect: 'archive' | 'mark_read') =>
        effect === 'archive'
          ? `${count} email bulan ini, dan agen akan mengarsipkan semuanya`
          : `${count} email bulan ini, dan agen akan menandai semuanya sudah dibaca`,
      no: 'Tidak, terima kasih',
      yes: {
        archive: 'Selalu arsipkan',
        mark_read: 'Selalu tandai dibaca',
      },
    },
    ruleOffer: {
      lead: 'Agen bisa melakukan ini sendiri untuk email yang cocok. Aturan tetap mati sampai kamu bilang ya.',
      no: 'Biarkan mati',
      turnedOn: 'Dinyalakan. Ubah di Aturan.',
      yes: 'Nyalakan',
    },
    newSender: {
      archive: 'Selalu arsipkan',
      archived: 'Email baru dari pengirim ini akan diarsipkan. Ubah di Aturan.',
      keep: 'Biarkan seperti biasa',
      label: 'Pengirim baru',
      lead: (count: number, opened: number) =>
        `${count} email dalam dua minggu, ${opened === 0 ? 'tidak ada yang dibuka' : `${opened} dibuka`}`,
    },
    readingNow: (total: number) =>
      plural('id', total, {
        other: (n) => `Agen sedang membaca ${n} email baru`,
      }),
    allDone: 'Semua beres. Tidak ada yang butuh kamu.',
    allDoneLead:
      'Aku terus membaca email baru, dan yang butuh perhatianmu akan muncul di sini.',
    allowanceSpent: (date: string) =>
      `Jatah agen untuk bulan ini sudah habis: ringkasan dan draf tersedia lagi pada ${date}. Sampai saat itu aku tetap mencatat janji dan tenggat.`,
    byRules: (n: number) => `Aturanmu sudah mengurus ${n}.`,
    decisions: 'Keputusan',
    journal: {
      approved: 'Kamu bilang ya',
      byRule: (rule: string) => `Aturanmu: ${rule}`,
      failed: 'Tidak berhasil',
      lead: '7 hari terakhir. Setiap perubahan di email atau kalendermu terjadi dengan persetujuanmu atau aturan yang kamu aktifkan.',
      title: 'Yang sudah dilakukan di email kamu',
    },
    progress: (done: number, total: number) => `${done} dari ${total}`,
    readAll:
      'Aku membaca semuanya, dan tidak ada yang berubah di emailmu tanpa persetujuanmu.',
    later: (total: number) =>
      plural('id', total, {
        other: (n) => `${n} lagi bisa menunggu`,
      }),
    quick: 'Cepat',
    tidy: {
      failed: (emails: string) =>
        `Gmail tidak mengubah ${emails}. Coba lagi sebentar lagi.`,
      confirm: (emails: string) => `Rapikan ${emails}?`,
      running: 'Merapikan…',
      unsubscribeHint:
        'Sebagian adalah milis yang akan ditinggalkan Fewmail, dan itu tidak bisa dibatalkan.',
      archive: (n: number) => `${n} untuk diarsipkan`,
      review: 'Periksa',
      reviewLead:
        'Setiap email dengan apa yang akan dilakukan agen dan alasannya. Setujui yang tepat, simpan yang harus tetap seperti semula.',
      reviewTitle: 'Periksa saran agen',
      done: (n: number) => `${n} dirapikan`,
      keep: 'Simpan',
      mark_read: (n: number) => `${n} untuk ditandai dibaca`,
      run: 'Setujui semua',
      total: (n: number) => `Email yang disarankan agen untuk dirapikan: ${n}`,
      unsubscribe: (n: number) => `${n} untuk berhenti langganan`,
      untilYouApprove:
        'Tidak ada yang berubah di email kamu sampai kamu menyetujuinya',
      spam: (n: number) => `${n} ke spam`,
      trash: (n: number) => `${n} untuk dihapus`,
    },
    pauseListening: 'Jeda',
    resumeListening: 'Lanjutkan',
    awaiting: 'Menunggu balasan',
    hint: {
      messengers: {
        lead: 'Terima email penting dan setujui draf di messenger yang sudah kamu pakai.',
        title: 'Telegram atau WhatsApp',
      },
      notNow: 'Nanti saja',
      setUp: 'Atur',
      turnOn: 'Aktifkan',
    },
    dates: 'Tanggal dan rapat',
    done: 'Selesai',
    firstRead:
      'Mulai dari email tiga hari terakhir. Yang butuh perhatianmu akan muncul di sini dengan sendirinya, dan tidak ada yang berubah sampai kamu bilang ya.',
    approvedMany: (n: number) => `${n} disetujui`,
    listen: 'Dengarkan',
    handled: {
      spam: (n: number) => `${n} ke spam`,
      archived: (n: number) => `${n} diarsipkan`,
      markedRead: (n: number) => `${n} ditandai dibaca`,
      review: 'Tinjau',
      total: (n: number) => `${n} ditangani`,
      unsubscribed: (n: number) => `${n} berhenti langganan`,
    },
    headline: (total: number) =>
      total === 0
        ? 'Semua tenang.'
        : plural('id', total, { other: (n) => `${n} hal butuh kamu.` }),
    period: (days: number) =>
      days === 1 ? 'dalam sehari terakhir' : `dalam ${days} hari terakhir`,
    pulse: {
      lists: (n: number) => `${n} dari milis`,
      people: (n: number) => `${n} dari orang`,
      total: (n: number, period: string) => `${n} email ${period}`,
    },
    saved: (minutes: number) =>
      `Fewmail menghemat sekitar ${formatMinutes('id', minutes)} untukmu minggu ini`,
    recent: (period: string) => `Juga ${period}`,
    sent: 'Terkirim',
    codes: 'Kode masuk',
  },
  upgrade: {
    ask: 'Tanya email-mu',
    hints: {
      board:
        'Bagian dari Fewmail Pro: agen mencatat apa yang dijanjikan kepadamu, apa yang kamu janjikan, dan tenggat dari emailmu, lalu memantau masing-masing sampai selesai.',
      ask: 'Bagian dari Fewmail Pro: tanyakan apa saja dengan kata-katamu sendiri dan dapatkan jawaban dari email-mu.',
      drafts:
        'Bagian dari Fewmail Pro: agen menulis balasan dengan gayamu, lalu kamu edit dan kirim.',
    },
  },
  whatsapp: {
    phoneTaken:
      'Nomor ini sudah terhubung ke akun Fewmail lain. Putuskan WhatsApp di sana dulu (Pengaturan → Integrasi), lalu kirim pesannya lagi.',
    connectFirst: (url: string) =>
      `Hai! Aku Fewmail. Di WhatsApp ini aku memberi tahu saat ada email penting, menunjukkan apa yang butuh kamu, dan mengirim balasan yang kamu setujui.\n\nNomor ini belum terhubung ke Fewmail-mu. Cuma butuh semenit:\n1. Buka pengaturan Fewmail: ${url}\n2. Di Integrasi, ketuk “Hubungkan WhatsApp” (bagian dari Fewmail Pro).\n3. WhatsApp terbuka dengan pesan yang sudah siap — kirim, dan selesai.`,
    connected:
      'Terhubung. Aku akan mengabari saat ada yang mendesak. Kirim teks atau pesan suara untuk membalas email apa pun.',
    proOnly:
      'WhatsApp adalah bagian dari Fewmail Pro. Buka Pengaturan → Paket di Fewmail untuk beralih.',
  },
  zombie: {
    badge: (share: number) =>
      `Mengabaikan berhenti langganan pada ${share}% orang`,
    reason: 'Tetap mengirim email setelah kamu berhenti langganan',
  },
}
