import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
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
    voice: 'Bicara ke agen',
    voiceStop: 'Berhenti dan kirim',
    chats: 'Obrolan',
    autonomy: {
      ask: 'Bertanya padamu sebelum setiap email',
      auto: (most: number) =>
        `Mengirim email sendiri tanpa bertanya padamu (hingga ${most})`,
    },
    calendar: (email: string) => `Di kalender ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      create_schedule: 'Jalankan ini sesuai jadwal?',
      create_event: 'Tambahkan acara ini?',
      delete_event: 'Hapus acara ini?',
      update_event: 'Ubah acara ini?',
      approve_action: 'Jalankan tindakan ini?',
      archive_thread: 'Arsipkan percakapan ini?',
      clear_out: 'Bersihkan grup email ini dari kotak masuk?',
      undo_clear_out: 'Kembalikan semua yang dibersihkan ke kotak masuk?',
      create_rule: 'Tambahkan aturan ini?',
      handle_thread: 'Serahkan percakapan ini ke agen?',
      reply: 'Kirim balasan ini?',
      send_email: 'Kirim email ini?',
      snooze_thread: 'Tunda percakapan ini?',
      unsubscribe: 'Berhenti berlangganan dari pengirim ini?',
      trash_thread: 'Pindahkan utas ini ke sampah?',
      report_spam: 'Laporkan pengirim ini sebagai spam?',
      mark_not_spam: 'Keluarkan utas ini dari spam?',
      move_to_inbox: 'Kembalikan utas ini ke kotak masuk?',
    },
    decline: 'Jangan',
    declined: 'Kamu menolak',
    detach: 'Jangan lampirkan email ini',
    deleteChat: 'Hapus obrolan',
    failed: 'Agen tidak bisa menyelesaikannya. Coba lagi.',
    lead: 'Tanyakan soal email kamu atau bilang apa yang harus dilakukan. Semua yang mengirim atau mengubah Gmail menunggu persetujuanmu.',
    newChat: 'Obrolan baru',
    closeChat: 'Tutup tab',
    switchChat: 'Ganti obrolan',
    noChats: 'Belum ada obrolan',
    cancelEdit: 'Batalkan edit',
    copy: 'Salin',
    edit: 'Edit',
    editing: 'Mengedit pesan Anda',
    regenerate: 'Jawab ulang',
    skills: 'Skill',
    placeholder: 'Tanya soal email kamu, atau ketik / untuk skill',
    retry: 'Coba lagi',
    send: 'Kirim',
    steps: {
      create_schedule: 'Menyiapkan jadwal',
      delete_schedule: 'Menghentikan jadwal',
      list_schedules: 'Membaca jadwal',
      create_event: 'Menambahkan acara',
      delete_event: 'Menghapus acara',
      list_events: 'Memeriksa kalender',
      update_event: 'Mengubah acara',
      list_subscriptions: 'Membaca langganan',
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
      get_board: 'Membaca papan',
      get_person: 'Mencari orangnya',
      get_today: 'Memeriksa hari ini',
      handle_thread: 'Menyerahkan percakapan',
      list_boards: 'Membuka papan',
      list_handled: 'Memeriksa yang sudah ditangani',
      list_mail: 'Mencari di email',
      list_rules: 'Membaca aturan',
      read_thread: 'Membaca percakapan',
      redraft_action: 'Menulis ulang draf',
      refresh: 'Memeriksa email baru',
      send_email: 'Mengirim',
      snooze_thread: 'Menunda',
      unsubscribe: 'Berhenti berlangganan',
      trash_thread: 'Memindahkan ke sampah',
      report_spam: 'Melaporkan spam',
      mark_not_spam: 'Mengeluarkan dari spam',
      move_to_inbox: 'Memindahkan ke kotak masuk',
      create_board: 'Membuat papan',
      update_board: 'Mengubah papan',
      delete_board: 'Menghapus papan',
      add_board_chart: 'Menambah grafik',
      add_to_board: 'Menaruh di papan',
      edit_board_entry: 'Memperbaiki entri',
      remove_board_entry: 'Mengeluarkan dari papan',
      rename_board_group: 'Mengganti nama grup',
    },
    stop: 'Hentikan',
    thinking: 'Berpikir…',
    title: 'Apa yang bisa aku bantu?',
    to: (recipients: string) => `Kepada ${recipients}`,
    until: (time: string) => `Sampai ${time}`,
    yes: {
      create_schedule: 'Jadwalkan',
      create_event: 'Tambah',
      delete_event: 'Hapus',
      update_event: 'Simpan',
      approve_action: 'Setujui',
      archive_thread: 'Arsipkan',
      clear_out: 'Bersihkan',
      undo_clear_out: 'Kembalikan',
      create_rule: 'Tambahkan',
      handle_thread: 'Serahkan',
      reply: 'Kirim',
      send_email: 'Kirim',
      snooze_thread: 'Tunda',
      unsubscribe: 'Berhenti berlangganan',
      trash_thread: 'Ke sampah',
      report_spam: 'Laporkan spam',
      mark_not_spam: 'Bukan spam',
      move_to_inbox: 'Kembalikan',
    },
  },
  ask: {
    label: (question: string) => `Tanya Fewmail: “${question}”`,
    openChat: 'Buka di chat',
    thinking: 'Menelusuri email kamu…',
  },
  byRule: 'oleh aturan',
  boards: {
    addTo: 'Tambah ke papan',
    added: (board: string) => `Ditaruh di ${board}`,
    cancel: 'Batal',
    chart: {
      add: 'Tambah grafik',
      ask: 'Jelaskan grafiknya',
      askPlaceholder: 'Belanja per toko, pesanan per status…',
      currency: 'Mata uang',
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
      moveEarlier: 'Geser lebih awal',
      moveLater: 'Geser lebih akhir',
      other: 'Lainnya',
      remove: 'Hapus grafik',
      skipped: (n: number) =>
        `Tidak dihitung: ${n} dalam mata uang lain atau tanpa jumlah`,
      title: 'Judul grafik',
      type: 'Jenis grafik',
      types: {
        area: 'Area',
        bar: 'Batang',
        line: 'Garis',
        pie: 'Lingkaran',
      },
      untitled: 'Grafik baru',
      weekOf: (date: string) => `Minggu ${date}`,
    },
    charts: 'Grafik',
    create: 'Buat papan',
    delete: 'Hapus papan',
    deleteConfirm: (name: string) => `Hapus “${name}”?`,
    deleteHint:
      'Entri dan grafiknya ikut terhapus. Email kamu tetap di tempatnya.',
    describe: 'Ubah apa yang dikumpulkan',
    description: 'Apa yang dikumpulkan',
    descriptionPlaceholder:
      'Perjalanan: tiket pesawat, hotel, dan sewa mobil, beserta biayanya',
    due: (when: string) => `Segera: ${when}`,
    empty: 'Masih kosong. Email yang cocok akan muncul di sini begitu tiba.',
    entries: (total: number) =>
      plural('id', total, { other: (n) => `${n} entri` }),
    entry: {
      amount: 'Nominal',
      currency: 'Mata uang',
      date: 'Tanggal',
      edit: 'Edit entri',
      edited: 'Diedit olehmu',
      group: 'Siapa atau apa',
      next: 'Tanggal berikutnya',
      nextOn: (date: string) => `berikutnya ${date}`,
      remove: 'Bukan untuk papan ini',
      removed: 'Dikeluarkan dari papan. Papan belajar dari situ.',
      status: 'Status',
      title: 'Judul',
    },
    expected: (when: string) => `Diperkirakan ${when}`,
    filter: {
      clear: 'Hapus filter',
      nothing: 'Tidak ada entri yang cocok.',
      search: 'Cari entri',
    },
    groups: {
      every: {
        month: 'tiap bulan',
        quarter: 'tiap kuartal',
        week: 'tiap minggu',
        year: 'tiap tahun',
      },
      expected: (date: string) => `diperkirakan ${date}`,
      next: (date: string) => `berikutnya ${date}`,
      perMonth: (amount: string) => `${amount} / bulan`,
      rename: 'Ganti nama grup',
      renameHint: 'Beri nama grup lain untuk menggabungkan keduanya.',
      showAll: (n: number) => `Tampilkan semua ${n}`,
      showFewer: 'Tampilkan lebih sedikit',
      title: 'Per siapa atau apa',
    },
    history: {
      capped: (n: number) =>
        `Sudah membaca ${n} email cocok terbaru dari enam bulan terakhir.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Menelusuri email enam bulan terakhir…'
          : `Membaca ${plural('id', found, { other: (n) => `${n} email` })} dari enam bulan terakhir · sejauh ini ${plural('id', entries, { other: (n) => `${n} entri` })}`,
    },
    menu: 'Aksi papan',
    moveDown: 'Pindah ke bawah',
    moveUp: 'Pindah ke atas',
    name: 'Nama',
    namePlaceholder: 'Perjalanan',
    new: 'Papan baru',
    newHint:
      'Jelaskan dengan kata-katamu sendiri apa yang dikumpulkan. Fewmail mencarinya di email enam bulan terakhir, memilih grafik, dan terus memperbaruinya.',
    planning: 'Menyiapkan…',
    redescribe: 'Simpan dan baca ulang',
    redescribeHint:
      'Membaca ulang enam bulan terakhir dengan deskripsi baru. Entri yang kamu edit atau keluarkan tetap seperti itu.',
    rename: 'Ganti nama papan',
    save: 'Simpan',
    settings: {
      bannerDays: 'Pengingat sebelum tanggal',
      days: (n: number) =>
        plural('id', n, { other: (count) => `${count} hari sebelumnya` }),
      hint: 'Kapan papan memberi tahu kamu sebelum suatu tanggal.',
      never: 'Tidak pernah',
      title: 'Pengingat',
    },
    starter: {
      events: {
        description:
          'Tiket, reservasi, dan janji temu: di mana saya harus berada, kapan, dan dengan siapa.',
        name: 'Acara',
      },
      health: {
        description:
          'Kunjungan dokter, resep, hasil tes, dan klaim asuransi: siapa yang saya temui, kapan, dan berapa biayanya.',
        name: 'Kesehatan',
      },
      home: {
        description:
          'Sewa, tagihan utilitas, perbaikan, dan kontrak tempat tinggal: apa yang jatuh tempo, kepada siapa, dan berapa.',
        name: 'Rumah',
      },
      invoices: {
        description:
          'Faktur yang saya kirim dan terima untuk pekerjaan: klien atau pemasok, jumlah, jatuh tempo, dan apakah sudah dibayar.',
        name: 'Faktur',
      },
      jobs: {
        description:
          'Lamaran, wawancara, dan tawaran: perusahaan mana, posisi apa, dan sampai mana masing-masing.',
        name: 'Cari kerja',
      },
      learning: {
        description:
          'Kursus, kelas, dan email dari sekolah atau kampus: tenggat, nilai, sertifikat, dan biayanya.',
        name: 'Belajar',
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
      subscriptions: {
        description:
          'Layanan yang rutin kubayar: berapa biayanya, seberapa sering, dan kapan diperpanjang berikutnya.',
        name: 'Langganan berbayar',
      },
      trips: {
        description:
          'Penerbangan, kereta, hotel dan sewa: ke mana aku pergi, kapan dan berapa biayanya.',
        name: 'Perjalanan',
      },
    },
    summary: {
      lastMonth: 'Bulan lalu',
      perMonth: (amount: string) => `${amount} per bulan`,
      recurring: (n: number) =>
        plural('id', n, { other: (count) => `${count} berulang` }),
      thisMonth: 'Bulan ini',
      upcoming: 'Jatuh tempo dalam 30 hari',
    },
  },
  bulk: {
    badge: (n: number) => `Dikirim ke ${n}+ pengguna Fewmail`,
    reason: (n: number) =>
      `Email massal: ${n}+ pengguna Fewmail menerima teks yang sama`,
  },
  calendar: {
    noAccess: {
      allow: 'Izinkan akses',
      description:
        'Google tidak diizinkan membagikan kalendermu ke Fewmail. Izinkan agar bisa melihat dan menambah acara di sini.',
      title: 'Kalender belum terhubung',
    },
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
    busiest: (day: string, hour: string) =>
      `Paling sibuk: ${day}, sekitar ${hour}`,
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
    split: (people: string, lists: string) =>
      `${people} dari orang · ${lists} dari newsletter`,
    title: { month: 'Bulanmu dalam email', year: 'Tahunmu dalam email' },
    unsubscribed: 'newsletter ditinggalkan',
  },
  forward: {
    done: 'Email yang kamu teruskan',
  },
  reading: {
    digest: (n: number) => `Newsletter hari ini: ${n}`,
    empty: 'Tidak ada newsletter dalam sehari terakhir.',
    lead: 'Newsletter sehari terakhir di satu tempat, agar tidak memenuhi kotak masuk.',
    title: 'Bacaan',
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
    goTo: 'Buka',
    mail: 'Email',
    nothingMatches: 'Tidak ada yang cocok.',
    placeholder: 'Tanya soal email atau jalankan perintah…',
    commandsOnly: 'Jalankan perintah…',
    rewriteBrief: 'Tulis ulang ringkasan',
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
  errors: {
    calendarAccess:
      'Fewmail tidak punya akses ke kalender ini. Izinkan di halaman Kalender.',
    failed: 'Terjadi kesalahan. Coba lagi.',
    needsPro: 'Ini memerlukan Fewmail Pro.',
    alreadySent: 'Sudah terkirim, terlambat untuk membatalkan.',
    notFound: 'Ini sudah tidak ada. Mungkin sudah dihapus.',
    offline: 'Tidak dapat terhubung ke Fewmail. Periksa koneksimu.',
  },
  update: {
    available: 'Versi baru Fewmail sudah tersedia.',
    reload: 'Muat ulang',
  },
  keys: {
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
    move: 'pindah',
    open: 'buka',
    notOnBoard: 'bukan untuk papan ini',
    rename: 'ganti nama',
    clearFilter: 'hapus filter',
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
  notices: {
    mailLost:
      'Fewmail kehilangan akses ke Gmail-mu dan tidak membaca email baru.',
    mailboxLost: (email: string) => `Fewmail kehilangan akses ke ${email}.`,
    reconnect: 'Hubungkan lagi',
    signInAgain: 'Masuk lagi',
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
      'Fewmail meminta izin untuk membaca, merapikan, dan mengirim Gmail untukmu. Tidak ada yang dikirim atau diarsipkan tanpa persetujuanmu, kecuali kamu membuat aturan yang mengizinkannya. Fewmail juga meminta akses Google Kalender, yang bisa kamu hapus centangnya.',
    continue: 'Lanjutkan dengan Google',
    lead: 'Fewmail membaca kotak masukmu, membalas dengan gayamu, dan hanya menampilkan yang benar-benar butuh kamu.',
    messengers:
      'Juga di aplikasi pesan, dimulai dari Telegram: terima ringkasan, setujui balasan, atau cukup kirim pesan suara.',
    title: 'Hanya yang penting.',
  },
  mail: {
    pin: 'Sematkan',
    unpin: 'Lepas sematan',
    pinned: 'Disematkan',
    allPinned: (n: number) => `Tampilkan semua ${n}`,
    fewerPinned: 'Tampilkan lebih sedikit',
    oneTimeCode: {
      archive: 'Salin dan arsipkan',
      copied: 'Kode disalin',
      copy: 'Salin kode',
      trash: 'Salin dan hapus',
    },
    openUnsubscribePage: 'Buka halaman',
    unsubscribeYourself:
      'Untuk keluar dari daftar ini, selesaikan di halamannya. Sementara itu emailnya diarsipkan.',
    allMailboxes: 'Semua kotak surat',
    filterAbout: {
      inbox: 'Semua yang ada di kotak masuk',
      important: 'Email yang segera butuh kamu',
      needs_reply: 'Orang menunggu balasanmu',
      quiet: 'Buletin, pemberitahuan, dan gangguan lain',
    },
    find: {
      back: 'Kembali ke email',
      open: 'Cari',
      recent: 'Pencarian terakhir',
      tips: 'Tips',
      combine: 'Gabungkan agar lebih tepat: from:anna has:attachment',
      describeExample: 'tagihan dari Anna bulan lalu',
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
      read: 'Sudah dibaca',
    },
    unread: 'Belum dibaca',
    block: 'Blokir pengirim',
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
    noThread: 'Pilih email untuk membacanya di sini',
    deleteDraft: 'Hapus draf',
    notSent: 'Tidak terkirim. Buka untuk mencoba lagi',
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
    dueHint: 'Tenggat yang ditemukan agen di email ini',
    empty: 'Tidak ada email di sini',
    emptyHint: 'Email baru akan muncul di sini begitu tiba.',
    noResults: 'Tidak ada hasil',
    noResultsHint: 'Coba kata lain atau folder lain.',
    expectsReply: 'Menunggu balasan',
    filter: {
      archive: 'Arsip',
      trash: 'Sampah',
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
    calendar: 'Kalender',
    subscriptions: 'Langganan',
    agent: 'Agen',
    boards: 'Papan',
    newBoard: 'Papan baru',
    mail: 'Email',
    reading: 'Bacaan',
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
    awaitsAnswer:
      'Saya melewati jalannya kali ini: yang sebelumnya masih menunggu jawabanmu di chat ini.',
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
    open: 'Menunggu di utas lain',
    promised: 'Kamu sudah berjanji',
    threads: (total: number) => `${total} percakapan`,
  },
  queue: {
    askedByYou: 'Atas permintaanmu',
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
    deleted: 'Aturan dihapus',
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
    readingDigest: {
      description:
        'Setelah ringkasan harian, newsletter hari itu datang ke Telegram dan WhatsApp dalam satu pesan.',
      title: 'Ringkasan newsletter',
    },
    voiceBrief: {
      description:
        'Ringkasan juga datang ke Telegram dan WhatsApp sebagai pesan suara.',
      title: 'Ringkasan suara',
    },
    forward: {
      copy: 'Salin alamat',
      description:
        'Kirim atau teruskan email apa pun ke alamat ini dari kotak suratmu sendiri, dengan catatan di atas tentang apa yang harus dilakukan. Jawabannya datang di Telegram atau WhatsApp dan di obrolan di sini.',
      title: 'Teruskan ke agen',
    },
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
  site: {
    chapters: {
      pricing: {
        description:
          'Penyortiran, aturan, dan perlindungan gratis selamanya. Pro dan Max menambahkan semua yang membaca dan menulis untukmu; Max hanya melakukannya lebih banyak.',
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
        'Apa pun yang mengirim email atau mengubah Gmail meminta persetujuanmu dulu. Emailmu tidak pernah dipakai melatih model, dan aplikasi apa pun bisa diputus di Pengaturan.',
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
        brief: 'Ringkasan harian',
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
        brief: 'Dalam bahasamu, di Pro',
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
          'SaneBox menyortir email ke dalam folder, dan di paket teratasnya juga menyusun draf dan ringkasan. Fewmail membaca semuanya lebih dulu, lalu memberimu satu ringkasan dan sedikit keputusan yang hanya bisa kamu ambil.',
        them: {
          brief: 'Rangkuman harian email yang sudah difilter',
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
          'Saat ini akun Gmail dan Google Workspace. Tambahkan beberapa kotak surat ke satu Fewmail, dan emailnya masuk ke ringkasan dan kotak masuk yang sama.',
        question: 'Akun email apa saja yang bisa dipakai?',
      },
    ],
    features: {
      description:
        'Urusan email yang dulu menghabiskan satu sore, kini dikerjakan di latar belakang dan dicatat di tempat yang bisa kamu periksa.',
      items: {
        ask: {
          description:
            'Tanyakan apa saja dengan kata-kata biasa dan dapatkan jawaban dari emailmu sendiri, lengkap dengan email sumbernya.',
          title: 'Tanya emailmu',
        },
        boards: {
          description:
            'Uang, langganan berbayar, perjalanan, pesanan: jelaskan apa yang ingin dilacak dan agen mengumpulkannya dari email enam bulan terakhir, lengkap dengan grafik.',
          title: 'Papan',
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
        forward: {
          description:
            'Teruskan email dengan catatan di atasnya, misalnya “carikan waktu dengan mereka minggu depan”, dan agen yang melanjutkan.',
          title: 'Teruskan ke agen',
        },
        handle: {
          description:
            'Serahkan percakapan beserta tujuannya, dan agen menuntaskannya sampai akhir, selalu bertanya sebelum mengirim.',
          title: 'Urus ini',
        },
        reading: {
          description:
            'Newsletter hari ini dalam satu daftar yang tenang, masing-masing diringkas dalam beberapa kalimat.',
          title: 'Bacaan',
        },
        voice: {
          description:
            'Dengarkan ringkasan di Telegram, WhatsApp, atau aplikasi, dan balas bot dengan pesan suara.',
          title: 'Dengarkan ringkasan',
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
        'Agen email yang membaca Gmail-mu dan hanya menampilkan yang butuh kamu.',
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
          fix: 'Satu tombol berhenti berlangganan seperti yang dilakukan orang: satu klik, halaman berhenti langganan, atau sebuah email. Pengirim yang terus menulis langsung masuk spam.',
          problem: 'Newsletter yang tak pernah kamu daftari.',
        },
        {
          fix: 'Bacaan mengumpulkan newsletter hari ini dalam satu daftar, masing-masing diringkas dalam beberapa kalimat.',
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
          fix: 'Hanya email mendesak yang sampai ke Telegram atau WhatsApp. Sisanya menunggu ringkasan pagi, yang juga bisa kamu dengarkan.',
          problem: 'Mengecek email saat makan malam, jaga-jaga.',
        },
      ],
      title: 'Masalah email yang tak lagi kamu alami.',
    },
    hero: {
      brief: {
        emphasis: 'butuh kamu.',
        lead: (handled: string) =>
          `Anna menunggu kontraknya, tagihan Northwind jatuh tempo minggu depan, dan Marco minta hari Kamis. ${handled} newsletter dan notifikasi sudah ditangani.`,
        tag: 'Ringkasan Kamis · 08:00',
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
      lead: 'Newsletter, struk, notifikasi, sebuah tautan phishing, dan di antaranya, tiga email yang benar-benar penting. Fewmail adalah agen yang membaca semuanya untukmu.',
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
      today: 'Hari ini',
      tryQueue: 'Coba antreannya',
      unread: ((slots) => [slots.count, ' belum dibaca']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' belum dibaca di kotak masukmu',
      ]) as Rich<'count'>,
      willDo: 'Yang akan dilakukan Fewmail',
    },
    nav: {
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
      everythingIn: (plan: string) => `Semua yang ada di ${plan}, plus`,
      forever: 'selamanya',
      free: {
        description: 'Penyortiran, aturan, dan perlindungan. Selamanya.',
        features: [
          'Setiap email disortir dan dinilai menurut kepentingannya',
          'Aturan dengan kata-kata biasa yang mengarsipkan, menandai dibaca, atau berhenti langganan',
          'Perisai spam komunitas dan peringatan phishing',
          'Pengirim zombie tertangkap setelah kamu berhenti langganan',
          'Tindak lanjut otomatis untuk email yang menunggu balasan',
          'Tunda, snippet, dan label Fewmail di Gmail',
        ],
      },
      max: {
        description: 'Agen yang sama untuk kotak masuk yang sibuk.',
        emails: (emails: string) => `${emails} email dibaca per bulan`,
        messages: (messages: number) => `${messages} pesan ke agen per bulan`,
        unlimited: 'Papan dan percakapan yang diserahkan tanpa batas',
      },
      monthly: 'Bulanan',
      per: { month: 'per bulan', year: 'per tahun' },
      pro: {
        description: 'Agen seutuhnya: membaca, menulis, dan mengingat.',
        features: [
          'Hari ini: ringkasan harian dan satu antrean keputusan',
          'Balasan disusun dengan gayamu, dikirim hanya setelah kamu setujui',
          'Telegram: ringkasan, persetujuan, dan perintah suara',
          '“Urus ini”: agen menggarap percakapan sampai tujuannya tercapai',
          'Janji dan orang diingat, papan dengan grafik untuk uang atau apa pun yang kamu lacak',
          'Tanyakan apa saja pada emailmu, plus MCP untuk alatmu sendiri',
        ],
        limits: (emails: string, messages: number) =>
          `${emails} email dibaca dan ${messages} pesan ke agen per bulan; email yang tak penting tidak pernah dihitung`,
      },
      tryFree: (days: number) => `Coba gratis ${days} hari`,
      yearly: 'Tahunan · gratis 2 bulan',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Penyortiran, aturan dengan kata-kata biasa, dan perlindungan gratis selamanya. Pro adalah agen yang membaca, menulis, dan mengingat untukmu; Max adalah agen yang sama dengan ruang lebih untuk kotak masuk yang sibuk. Setiap akun dimulai dengan ${trialDays} hari Pro, dan setelah selesai kamu cukup tetap di paket Gratis.`,
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
    approveAlike: 'Setujui sekaligus semua kartu sejenis:',
    listen: '🔊 Dengarkan',
    heard: (text: string) => `Terdengar: “${text}”`,
    voiceFailed: 'Aku tidak bisa menangkapnya. Coba lagi atau ketik saja.',
    help: 'Tulis atau ucapkan apa yang kamu perlukan:\n• tanya soal email: “kapan Netflix diperpanjang?”\n• bilang apa balasannya: “bilang ke Anna aku tanda tangan besok”\n• kasih tugas: “buat papan untuk perjalanan”\n• balas salah satu drafku untuk mengubahnya',
    canceled: 'Dibatalkan. Draf kembali ke antrean kamu.',
    sendingIn: (seconds: number) => `Mengirim dalam ${seconds} dtk`,
    undo: 'Urungkan',
    commands: { brief: 'Ringkasan hari ini', queue: 'Yang butuh kamu' },
    connectFirst:
      'Buka dulu Fewmail → Pengaturan → Integrasi lalu ketuk “Hubungkan Telegram”.',
    connected:
      'Terhubung. Aku akan mengirim ringkasanmu setiap pagi dan memberi tahu saat ada yang mendesak.\n\n/brief: ringkasan hari ini\n/queue: yang butuh kamu',
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
    stopListening: 'Hentikan',
    awaiting: 'Menunggu balasan',
    hint: {
      notNow: 'Nanti saja',
      setUp: 'Atur',
      turnOn: 'Aktifkan',
    },
    later: (total: number, time: string) =>
      `${total} lagi datang pukul ${time}`,
    briefAt: (time: string) => `ringkasan harian pukul ${time}`,
    dates: 'Tanggal dan rapat',
    done: 'Selesai',
    firstRead:
      'Membaca email tiga hari terakhir. Yang butuh perhatianmu akan muncul di sini dengan sendirinya.',
    approvedMany: (n: number) => `${n} disetujui`,
    listen: 'Dengarkan ringkasan',
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
    period: (days: number) =>
      days === 1 ? 'dalam sehari terakhir' : `dalam ${days} hari terakhir`,
    pulse: {
      lists: (n: number) => `${n} dari milis`,
      people: (n: number) => `${n} dari orang`,
      total: (n: number, period: string) => `${n} email ${period}`,
    },
    saved: (minutes: number) =>
      `Fewmail menghemat sekitar ${formatMinutes('id', minutes)} untukmu minggu ini`,
    savedHow: (handled: number, replies: number) =>
      `Ditangani sendiri: ${handled} · Balasan terkirim dari draf: ${replies}`,
    recent: (period: string) => `Juga ${period}`,
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
