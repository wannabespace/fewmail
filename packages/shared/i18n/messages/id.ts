import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const id: Messages = {
  actionKind: {
    cleanup: 'Berhenti dari semua',
    commitment: 'Selesai',
    security: 'Sudah saya cek',
    task: 'Kirim',
    spam: 'Dipindahkan ke spam',
    archive: 'Arsipkan',
    follow_up: 'Tindak lanjuti',
    mark_read: 'Tandai dibaca',
    pay: 'Bayar',
    read: 'Baca',
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
    pending: 'menunggu di Hari ini',
  },
  agent: {
    chats: 'Obrolan',
    confirm: {
      approve_action: 'Jalankan tindakan ini?',
      archive_thread: 'Arsipkan percakapan ini?',
      create_rule: 'Tambahkan aturan ini?',
      handle_thread: 'Serahkan percakapan ini ke agen?',
      reply: 'Kirim balasan ini?',
      send_email: 'Kirim email ini?',
      snooze_thread: 'Tunda percakapan ini?',
      unsubscribe: 'Berhenti berlangganan dari pengirim ini?',
    },
    decline: 'Jangan',
    declined: 'Kamu menolak',
    deleteChat: 'Hapus obrolan',
    failed: 'Agen tidak bisa menyelesaikannya. Coba lagi.',
    lead: 'Tanyakan soal email kamu atau bilang apa yang harus dilakukan. Semua yang mengirim atau mengubah Gmail menunggu persetujuanmu.',
    newChat: 'Obrolan baru',
    noChats: 'Belum ada obrolan',
    cancelEdit: 'Batalkan edit',
    copy: 'Salin',
    edit: 'Edit',
    editing: 'Mengedit pesan Anda',
    regenerate: 'Jawab ulang',
    removeSkill: 'Hapus skill',
    skillPlaceholder: 'Tambahkan detail atau langsung kirim',
    skills: 'Skill',
    placeholder:
      'Tanyakan soal email kamu atau bilang apa yang harus dilakukan…',
    retry: 'Coba lagi',
    send: 'Kirim',
    steps: {
      list_subscriptions: 'Membaca langganan',
      approve_action: 'Menyetujui',
      archive_thread: 'Mengarsipkan',
      create_rule: 'Menambahkan aturan',
      dismiss_action: 'Melewati',
      draft_reply: 'Menulis balasan',
      create_draft: 'Menyimpan draf',
      get_board: 'Membaca papan',
      get_person: 'Mencari orangnya',
      get_today: 'Memeriksa hari ini',
      handle_thread: 'Menyerahkan percakapan',
      list_boards: 'Membuka papan',
      list_mail: 'Mencari di email',
      list_rules: 'Membaca aturan',
      read_thread: 'Membaca percakapan',
      redraft_action: 'Menulis ulang draf',
      refresh: 'Memeriksa email baru',
      send_email: 'Mengirim',
      snooze_thread: 'Menunda',
      unsubscribe: 'Berhenti berlangganan',
    },
    stop: 'Hentikan',
    thinking: 'Berpikir…',
    title: 'Apa yang bisa aku bantu?',
    to: (recipients: string) => `Kepada ${recipients}`,
    until: (time: string) => `Sampai ${time}`,
    yes: {
      approve_action: 'Setujui',
      archive_thread: 'Arsipkan',
      create_rule: 'Tambahkan',
      handle_thread: 'Serahkan',
      reply: 'Kirim',
      send_email: 'Kirim',
      snooze_thread: 'Tunda',
      unsubscribe: 'Berhenti berlangganan',
    },
  },
  ask: {
    label: (question: string) => `Tanya Fewmail: “${question}”`,
    thinking: 'Menelusuri email kamu…',
  },
  byRule: 'oleh aturan',
  boards: {
    chart: {
      add: 'Tambah grafik',
      edit: 'Pengaturan grafik',
      empty: 'Belum ada yang bisa digambar',
      groupBy: 'Dikelompokkan per',
      groupings: {
        group: 'Siapa atau apa',
        month: 'Bulan',
        status: 'Status',
        week: 'Minggu',
      },
      measure: 'Menampilkan',
      measures: { count: 'Jumlah', sum: 'Total nominal' },
      other: 'Lainnya',
      remove: 'Hapus grafik',
      title: 'Judul grafik',
      type: 'Jenis grafik',
      types: {
        area: 'Area',
        bar: 'Batang',
        line: 'Garis',
        pie: 'Lingkaran',
      },
      untitled: 'Grafik baru',
    },
    charts: 'Grafik',
    create: 'Buat papan',
    delete: 'Hapus papan',
    description: 'Apa yang dikumpulkan',
    descriptionPlaceholder:
      'Perjalanan: tiket pesawat, hotel, dan sewa mobil, beserta biayanya',
    edit: 'Ubah papan',
    editHint:
      'Jika kamu mengubah apa yang dikumpulkan, enam bulan terakhir dibaca ulang.',
    empty: 'Masih kosong. Email yang cocok akan muncul di sini begitu tiba.',
    entries: (total: number) =>
      plural('id', total, { other: (n) => `${n} entri` }),
    name: 'Nama',
    namePlaceholder: 'Perjalanan',
    new: 'Papan baru',
    newHint:
      'Jelaskan dengan kata-katamu sendiri apa yang dikumpulkan. Fewmail mencarinya di email enam bulan terakhir, memilih grafik, dan terus memperbaruinya.',
    planning: 'Menyiapkan…',
    readingHistory: 'Membaca email enam bulan terakhir…',
    save: 'Simpan',
    starter: {
      events: {
        description:
          'Tiket, reservasi, dan janji temu: di mana saya harus berada, kapan, dan dengan siapa.',
        name: 'Acara',
      },
      money: {
        description:
          'Pembayaran, langganan, tagihan, dan pengembalian dana: untuk apa saya membayar, kepada siapa, dan berapa.',
        name: 'Uang',
      },
      orders: {
        description:
          'Pesanan online dan pengiriman: apa yang kubeli, dari siapa dan di mana sekarang.',
        name: 'Pesanan',
      },
      trips: {
        description:
          'Penerbangan, kereta, hotel dan sewa: ke mana aku pergi, kapan dan berapa biayanya.',
        name: 'Perjalanan',
      },
    },
  },
  bulk: {
    badge: (n: number) => `Dikirim ke ${n}+ pengguna Fewmail`,
    reason: (n: number) =>
      `Email massal: ${n}+ pengguna Fewmail menerima teks yang sama`,
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
  commitments: {
    title: 'Kamu sudah berjanji',
  },
  compose: {
    backInQueue: 'Dibatalkan. Draf kembali ke Hari ini.',
    canceled: 'Dibatalkan. Email kamu kembali ke editor.',
    cc: 'Cc',
    discard: 'Buang',
    draftSaved: 'Draf disimpan',
    saveDraft: 'Simpan draf',
    forward: 'Teruskan',
    forwardedMessage: 'Pesan yang diteruskan',
    from: 'Dari',
    instructionPlaceholder: 'Bagaimana nadanya? (opsional)',
    invalidRecipients: 'Tambahkan minimal satu alamat email yang valid.',
    later: {
      inHour: 'Satu jam lagi',
      monday: 'Senin pagi',
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
    writeForMe: 'Tuliskan untukku',
    writing: 'Menulis…',
  },
  command: {
    compose: 'Email baru',
    agent: 'Agen',
    appearance: 'Tampilan',
    checkMail: 'Periksa email baru',
    goTo: 'Buka',
    inboxUpToDate: 'Kotak masuk sudah terbaru',
    mail: 'Email',
    nothingMatches: 'Tidak ada yang cocok.',
    placeholder: 'Cari email atau jalankan perintah…',
    rewriteBrief: 'Tulis ulang ringkasan',
    searchFor: (query: string) => `Cari email “${query}”`,
    teachRule: 'Ajarkan aturan baru',
    upgrade: 'Beralih ke Pro',
    theme: {
      dark: 'Tema gelap',
      light: 'Tema terang',
      system: 'Ikuti tema sistem',
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
  keys: {
    skills: 'skill',
    unsubscribe: 'berhenti langganan',
    filter: 'filter',
    reply: 'balas',
    snooze: 'tunda',
    anything: 'apa saja',
    approve: 'setujui',
    archive: 'arsipkan',
    close: 'tutup',
    draftReply: 'draf balasan',
    edit: 'edit',
    move: 'pindah',
    open: 'buka',
    search: 'cari',
    send: 'kirim',
    skip: 'lewati',
    stopEditing: 'selesai edit',
  },
  legal: {
    privacy: 'Kebijakan Privasi',
    englishOnly:
      'Dokumen ini disediakan dalam bahasa Inggris, yang merupakan versi yang mengikat.',
    terms: 'Ketentuan Layanan',
    updated: (date: string) => `Terakhir diperbarui ${date}`,
  },
  limits: {
    boards: (total: number) =>
      `Paketmu mencakup ${total} papan. Hapus satu, atau beralih ke Max di Pengaturan → Paket.`,
    messages: (date: string) =>
      `Pesan ke agen untuk bulan ini sudah habis. Akan tersedia lagi pada ${date}.`,
    tasks: (total: number) =>
      `Paketmu menangani ${total} utas sekaligus. Tunggu satu selesai, atau beralih ke Max di Pengaturan → Paket.`,
  },
  login: {
    agree: ((slots) => [
      'Dengan melanjutkan, kamu menyetujui ',
      slots.terms,
      ' dan ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail meminta izin untuk membaca, merapikan, dan mengirim Gmail untukmu. Tidak ada yang dikirim atau diarsipkan tanpa persetujuanmu, kecuali kamu membuat aturan yang mengizinkannya.',
    continue: 'Lanjutkan dengan Google',
    lead: 'Fewmail membaca kotak masukmu, membalas dengan gayamu, dan hanya menampilkan yang benar-benar butuh kamu.',
    messengers:
      'Juga di aplikasi pesan, dimulai dari Telegram: terima ringkasan, setujui balasan, atau cukup kirim pesan suara.',
    title: 'Hanya yang penting.',
  },
  mail: {
    allMailboxes: 'Semua kotak surat',
    unread: 'Belum dibaca',
    block: 'Blokir pengirim',
    blocked: 'Diblokir. Email mereka kini masuk ke sampah.',
    forward: 'Teruskan',
    more: 'Lainnya',
    reply: 'Balas',
    trash: 'Pindahkan ke sampah',
    trashed: 'Dipindahkan ke sampah',
    movedToInbox:
      'Dikembalikan ke kotak masuk. Terima kasih sudah memberi tahu.',
    noThread: 'Pilih email untuk membacanya di sini',
    deleteDraft: 'Hapus draf',
    noRecipients: 'Tanpa penerima',
    notSpam: 'Bukan spam',
    reportSpam: 'Laporkan spam',
    reportedSpam: 'Dilaporkan. Email mereka kini masuk ke spam.',
    archive: 'Arsipkan',
    archived: 'Diarsipkan',
    attachment: 'lampiran',
    draftReply: 'Draf balasan',
    drafting: 'Menyusun…',
    draftWaiting: 'Draf menunggu di Hari ini',
    due: (date: string) => `jatuh tempo ${date}`,
    empty: 'Tidak ada email di sini',
    emptyHint: 'Email baru akan muncul di sini begitu tiba.',
    expectsReply: 'Menunggu balasan',
    filter: {
      drafts: 'Draf',
      spam: 'Spam',
      inbox: 'Kotak masuk',
      snoozed: 'Ditunda',
      important: 'Penting',
      needs_reply: 'Perlu dibalas',
      quiet: 'Tenang',
    },
    instruction: 'Beri tahu agen cara membalas, atau tekan Enter saja',
    open: 'Buka',
    search: 'Cari atau jelaskan: tagihan dari Anna bulan lalu',
    openInGmail: 'Buka di Gmail',
    unsubscribe: 'Berhenti berlangganan',
    unsubscribed: 'Berhenti berlangganan',
    unsubscribeFailed:
      'Pengirim ini tidak mendukung berhenti berlangganan sekali klik, jadi email-nya diarsipkan.',
    you: 'Kamu',
  },
  subscriptions: {
    archivedOnly:
      'Pengirim ini tidak punya berhenti langganan sekali klik, jadi emailnya diarsipkan. Jika terus datang, akan masuk spam.',
    count: (total: number) => `Milis: ${total}`,
    empty: 'Tidak ada milis yang mengirimimu email bulan ini.',
    lead: 'Milis yang mengirimimu email bulan ini, yang paling aktif lebih dulu. Berhenti langganan mengarsipkan semua kirimannya; email yang masih datang dua minggu kemudian masuk spam.',
    opened: (total: number) =>
      total === 0 ? 'tidak ada yang dibuka' : `${total} dibuka`,
    title: 'Langganan',
    unsubscribe: 'Berhenti langganan',
    unsubscribed: 'Berhenti berlangganan',
  },
  nav: {
    subscriptions: 'Langganan',
    agent: 'Agen',
    boards: 'Papan',
    newBoard: 'Papan baru',
    mail: 'Email',
    rules: 'Aturan',
    search: 'Cari atau tanya…',
    settings: 'Pengaturan',
    syncFailed: 'Sinkronisasi Gmail gagal, mencoba lagi',
    syncing: 'Membaca kotak masukmu…',
    today: 'Hari ini',
    trialLeft: (total: number) => `Uji coba Pro · sisa ${total} hari`,
    usage: (percent: number) => `Agen · ${percent}% bulan ini terpakai`,
    watching: 'Agen sedang memantau kotak masukmu',
  },
  schedule: {
    failed:
      'Jalannya jadwal ini gagal. Saya akan mencoba lagi di jadwal berikutnya.',
    limitReached: (day: string) =>
      `Pesan bulan ini sudah habis, jadi jadwal melewatkan jalannya hingga ${day}.`,
    open: 'Buka di Fewmail',
    stopped:
      'Jadwal ini gagal tiga kali berturut-turut, jadi saya menghentikannya. Minta saya menyiapkannya lagi kapan pun Anda mau.',
  },
  notifications: {
    many: (total: number) =>
      plural('id', total, {
        other: (n) => `${n} kabar baru dari Fewmail`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Halaman yang diisi agen dari email kamu, mulai dari setengah tahun terakhir. Pilih sampai ${max}; kamu bisa menambah sendiri nanti.`,
    boardsTitle: 'Apa yang perlu dikumpulkan agen untukmu?',
    languageHint:
      'Aplikasi, ringkasan, dan penjelasan memakai bahasa ini. Balasan selalu mengikuti bahasa email yang kamu balas.',
    languageTitle: 'Fewmail harus berbicara dalam bahasa apa?',
    lead: 'Dua jawaban singkat. Semuanya bisa kamu ubah nanti di Pengaturan.',
    reading: 'Membaca kotak masukmu…',
    start: 'Mulai',
    title: 'Ayo siapkan agenmu.',
  },
  plan: {
    free: 'Gratis',
    freeDescription:
      'Email yang cepat dan tenang dengan aturan sederhana. Gratis selama kamu mau.',
    includes:
      'Pro menambahkan agen: ringkasan harian, setiap email dibaca dan diringkas, balasan disusun dengan gayamu, aturan dalam kata-kata biasa, Telegram, dan MCP.',
    manage: 'Kelola tagihan',
    price: (usd: number) => `$${usd} / bulan`,
    priceYearly: (usd: number) => `$${usd} / tahun`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `${emails} email dan ${messages} pesan per bulan; papan dan utas yang diserahkan tanpa batas.`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `${emails} email dan ${messages} pesan per bulan.`,
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
    emailsUsed: (used: string, total: string) => `${used} dari ${total} email`,
    messagesUsed: (used: string, total: string) =>
      `${used} dari ${total} pesan`,
    trialDescription: (date: string) =>
      `Semua fitur Pro sampai ${date}, lalu gratis. Tanpa kartu.`,
    upgrade: 'Paket lain',
    usage: 'Bulan ini',
  },
  people: {
    firstContact: (date: string) => `Berkirim email sejak ${date}`,
    lastContact: (date: string) => `Email terakhir ${date}`,
    open: 'Buka percakapan',
    promised: 'Kamu sudah berjanji',
    threads: (total: number) => `${total} percakapan`,
  },
  queue: {
    draftedInVoice: 'Ditulis dengan gayamu',
    edit: 'Edit',
    open: 'Buka',
    send: 'Kirim',
    shorter: 'Persingkat',
    shorterInstruction: 'Buat lebih singkat.',
    skip: 'Lewati',
  },
  reminders: {
    followUp: 'Tindak lanjut',
    noReply: 'Belum dibalas',
  },
  risk: {
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
    add: 'Tambah aturan',
    count: (total: number) =>
      plural('id', total, { other: (n) => `${n} aturan` }),
    delete: 'Hapus',
    describe: {
      alwaysShow: 'Selalu masuk ke Hari ini',
      autonomous: 'Dikerjakan sendiri, tercatat di yang sudah ditangani',
      draft: 'Draf menunggumu di Hari ini',
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
    lead: 'Beri tahu agen dengan kata-kata biasa apa yang harus dilakukan pada email tertentu. Agen mencocokkan setiap email dengan aturan ini, dari atas ke bawah.',
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
    account: 'Akun',
    agent: 'Agen',
    briefDescription: (timezone: string) => `Di zona waktumu, ${timezone}`,
    briefTitle: 'Ringkasan harian',
    deleteAccount: 'Hapus akun',
    deleteConfirm: 'Hapus semuanya',
    deleteDescription:
      'Langsung menghapus akun, email yang disinkronkan, draf, aturan, dan ringkasanmu dari Fewmail. Gmail-mu sendiri tidak disentuh.',
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
      'Aplikasi, ringkasan, dan ikhtisar. Balasan mengikuti email.',
    legal: 'Legal',
    mailboxes: {
      add: 'Tambah Gmail',
      addDescription:
        'Email dari akun Gmail lain masuk ke Hari ini dan kotak masuk yang sama. Akun itu tidak bisa dipakai masuk ke sini: masuk dengannya membuka Fewmail terpisah.',
      added: 'Kotak surat ditambahkan. Emailnya muncul dalam semenit.',
      failed:
        'Kotak surat tidak bisa ditambahkan. Izinkan akses Gmail lalu coba lagi.',
      lost: 'Akses Gmail hilang. Tambahkan lagi untuk menyambungkan ulang.',
      reading: 'Membaca email…',
      remove: 'Hapus',
      signIn: 'Anda masuk dengan akun ini',
      signInChosen: 'Itu akun yang Anda pakai untuk masuk. Pilih akun lain.',
      synced: (ago: string) => `Disinkronkan ${ago}`,
      title: 'Kotak surat',
    },
    mcp: {
      allow: 'Izinkan',
      connected: (ago: string) => `Terhubung ${ago}`,
      copy: 'Salin URL',
      defaultName: 'Klien MCP',
      deny: 'Tolak',
      description:
        'Mereka bisa membaca ringkasan dan emailmu, menyusun draf balasan, dan mengirimnya setelah kamu konfirmasi.',
      disconnect: 'Putuskan',
      paste:
        'Tambahkan URL ini sebagai konektor di aplikasimu, lalu masuk ke Fewmail.',
      request: (app: string) => `${app} ingin memakai Fewmail-mu`,
      title: 'Hubungkan Claude, Cursor, atau klien MCP apa pun',
    },
    signedInWithGoogle: 'Masuk dengan Google',
    signOut: 'Keluar',
    schedules: {
      delete: 'Hapus',
      description:
        'Minta agen di chat untuk melakukan sesuatu secara rutin, misalnya “setiap Jumat pukul 17.00 kumpulkan tagihan minggu ini”. Setiap jalannya masuk ke chat tersendiri, tempat Anda menyetujui apa pun yang ingin dikirimnya.',
      title: 'Jadwal',
    },
    snippets: {
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
      notConfigured: 'Notifikasi browser belum dikonfigurasi di server ini.',
      off: 'Terima email mendesak dan ringkasan harian di sini, bahkan saat Fewmail ditutup.',
      on: 'Email mendesak dan ringkasan harian muncul di sini. Beberapa sekaligus datang sebagai satu.',
      title: 'Notifikasi',
      unsupported: 'Browser ini tidak dapat menampilkan notifikasi.',
    },
    telegram: {
      connect: 'Hubungkan Telegram',
      disconnect: 'Putuskan',
      linked:
        'Ringkasanmu tiba setiap pagi, email mendesak langsung. Setujui dan edit draf dari chat.',
      notConfigured: 'Bot Telegram belum dikonfigurasi di server ini.',
      unlinked: 'Terima ringkasan dan setujui draf dari Telegram.',
    },
    whatsapp: {
      connect: 'Hubungkan WhatsApp',
      disconnect: 'Putuskan',
      linked:
        'Ringkasanmu tiba setiap pagi, email mendesak langsung. Setujui dan edit draf dari chat.',
      notConfigured: 'Bot WhatsApp belum dikonfigurasi di server ini.',
      unlinked: 'Terima ringkasan dan setujui draf dari WhatsApp.',
    },
    title: 'Pengaturan',
  },
  skills: {
    bills: 'Tagihan dan pembayaran jatuh tempo',
    cleanup: 'Newsletter yang perlu dibereskan',
    followups: 'Siapa yang belum membalasmu',
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
  },
  starterRules: {
    alwaysShow:
      'Peringatan keamanan, tagihan yang jatuh tempo, apa pun dari bank atau pemerintah',
    newsletters: 'Buletin dan rangkuman berkala',
    notifications: 'Notifikasi otomatis dari alat dan layanan',
    promotions: 'Promosi, pemasaran, dan email penjualan yang tidak diminta',
    receipts: 'Tanda terima, konfirmasi pesanan dan pengiriman',
  },
  tasks: {
    active: (goal: string) => `Agen sedang mengerjakannya: ${goal}`,
    auto: 'Kirim email tanpa bertanya',
    autoHint:
      'Setiap email tetap menunggu beberapa detik agar kamu bisa mengurungkannya.',
    cancel: 'Hentikan',
    done: 'Tugas selesai',
    goal: 'Apa yang harus dicapai agen?',
    goalPlaceholder: 'mis. Minta tagihan dikirim ulang dengan alamat baru kami',
    handle: 'Urus ini…',
    next: 'Langkah berikutnya',
    start: 'Mulai',
    started: 'Agen sedang mengerjakannya.',
  },
  telegram: {
    heard: (text: string) => `Terdengar: “${text}”`,
    voiceFailed: 'Aku tidak bisa menangkapnya. Coba lagi atau ketik saja.',
    help: 'Tulis atau ucapkan apa yang kamu perlukan:\n• tanya soal email: “kapan Netflix diperpanjang?”\n• bilang apa balasannya: “bilang ke Anna aku tanda tangan besok”\n• balas salah satu drafku untuk mengubahnya',
    canceled: 'Dibatalkan. Draf kembali ke antrean kamu.',
    sendingIn: (seconds: number) => `Mengirim dalam ${seconds} dtk`,
    undo: 'Urungkan',
    commands: { brief: 'Ringkasan hari ini', queue: 'Yang butuh kamu' },
    connectFirst:
      'Buka dulu Fewmail → Pengaturan → Integrasi lalu ketuk “Hubungkan Telegram”.',
    connected:
      'Terhubung. Aku akan mengirim ringkasanmu setiap pagi dan memberi tahu saat ada yang mendesak.\n\n/brief — ringkasan hari ini\n/queue — yang butuh kamu',
    done: 'Selesai',
    draft: 'Draf:',
    edit: 'Edit',
    editPrompt:
      'Kirimkan teks penggantinya, atau beri tahu cara mengubahnya dengan awalan “/”, mis. “/lebih formal”.',
    newDraft: 'Draf baru:',
    nothing: 'Tidak ada yang butuh kamu saat ini.',
    proOnly:
      'Telegram adalah bagian dari Fewmail Pro. Buka Pengaturan → Paket di Fewmail untuk beralih.',
    queueHint: '/queue — yang butuh kamu',
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
    awaiting: 'Menunggu balasan',
    hint: {
      notNow: 'Nanti saja',
      setUp: 'Atur',
      turnOn: 'Aktifkan',
    },
    later: (total: number, time: string) =>
      `${total} lagi datang pukul ${time}`,
    briefFrom: (time: string) => `ringkasan pukul ${time}`,
    dates: 'Tanggal dan rapat',
    done: 'Selesai',
    firstRead:
      'Membaca email tiga hari terakhir. Yang butuh perhatianmu akan muncul di sini dengan sendirinya.',
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
    nothingNeedsYou:
      'Tidak ada yang butuh kamu saat ini. Email baru dibaca begitu tiba.',
    pulse: {
      lists: (n: number) => `${n} dari milis`,
      people: (n: number) => `${n} dari orang`,
      total: (n: number) => `${n} email dalam sehari terakhir`,
    },
    recent: 'Juga dalam sehari terakhir',
    sent: 'Terkirim',
    worthAttention: 'Layak diperhatikan',
    writing: 'Menulis…',
  },
  whatsapp: {
    connectFirst:
      'Buka dulu Fewmail → Pengaturan → Integrasi lalu ketuk “Hubungkan WhatsApp”.',
    connected:
      'Terhubung. Aku akan mengirim ringkasan setiap pagi dan mengabari saat ada yang mendesak. Kirim teks atau pesan suara untuk membalas email apa pun.',
    proOnly:
      'WhatsApp adalah bagian dari Fewmail Pro. Buka Pengaturan → Paket di Fewmail untuk beralih.',
  },
  zombie: {
    badge: (share: number) =>
      `Mengabaikan berhenti langganan pada ${share}% orang`,
    reason: 'Tetap mengirim email setelah kamu berhenti langganan',
  },
}
