import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const ja: Messages = {
  actionDone: {
    heads_up: '確認しました',
    commitment: '完了',
    confirm: '確認しました',
    follow_up: 'フォローしました',
    pay: '支払いました',
    read: '読みました',
    renew: '更新しました',
    schedule: '予定に入れました',
    security: '確認しました',
    sign: '署名しました',
  },
  actionLink: {
    confirm: '確認する',
    pay: '支払う',
    read: '読む',
    renew: '更新する',
    sign: '署名する',
  },
  actionKind: {
    heads_up: 'お知らせ',
    cleanup: 'すべて配信停止',
    consent: '承認',
    commitment: '約束',
    security: '確認する',
    spam: '迷惑メールに移動',
    trash: 'ゴミ箱に移動',
    archive: 'アーカイブ',
    follow_up: 'フォローアップ',
    mark_read: '既読にする',
    pay: '支払う',
    read: '読む価値あり',
    reply: '返信',
    schedule: '予定に入れる',
    unsubscribe: '配信停止',
  },
  actionStatus: {
    auto_done: 'エージェントが対応済み',
    dismissed: 'スキップ',
    done: '完了',
    failed: '失敗',
    pending: '「ホーム」で待機中',
  },
  byRule: 'ルールによる',
  agent: {
    decideOnHome: 'ホームで決める',
    fromAgent: 'エージェントからの確認',
    mcpAsks: (client: string) => `${client}が MCP 経由で依頼しています`,
    calendar: (email: string) => `${email} のカレンダー`,
    cc: (recipients: string) => `CC: ${recipients}`,
    confirm: {
      dismiss_action: 'このカードをスキップしますか?',
      create_event: 'この予定を追加しますか？',
      delete_event: 'この予定を削除しますか？',
      update_event: 'この予定を変更しますか？',
      approve_action: 'この操作を実行しますか？',
      archive_thread: 'このスレッドをアーカイブしますか？',
      clear_out: '受信トレイからこれらのメールを片付けますか？',
      undo_clear_out: '片付けたメールをすべて受信トレイに戻しますか？',
      create_rule: 'このルールを追加しますか？',
      reply: 'この返信を送信しますか？',
      send_email: 'このメールを送信しますか？',
      snooze_thread: 'このスレッドをスヌーズしますか？',
      unsubscribe: 'この送信者の配信を停止しますか？',
      tidy_mail: 'これらの静かなメールを片付けますか？',
      trash_thread: 'このスレッドをゴミ箱に移動しますか？',
      report_spam: 'この送信者を迷惑メールとして報告しますか？',
      mark_not_spam: 'このスレッドを迷惑メールから戻しますか？',
      move_to_inbox: 'このスレッドを受信トレイに戻しますか？',
    },
    retry: '再試行',
    steps: {
      create_event: '予定を追加中',
      delete_event: '予定を削除中',
      list_events: 'カレンダーを確認中',
      update_event: '予定を変更中',
      list_subscriptions: 'メーリングリストを確認中',
      approve_action: '実行中',
      archive_thread: 'アーカイブ中',
      get_reading: 'メルマガを読み込み中',
      get_wrapped: 'メールを集計中',
      clear_out: '受信トレイを片付け中',
      preview_clear_out: '受信トレイ全体を読み込み中',
      undo_clear_out: '片付けたメールを戻し中',
      create_rule: 'ルールを追加中',
      dismiss_action: 'スキップ中',
      draft_reply: '返信を作成中',
      create_draft: '下書きを保存中',
      find_people: 'アドレスを検索中',
      get_person: '相手を確認中',
      get_today: '今日の状況を確認中',
      list_handled: '処理済みを確認中',
      list_mail: 'メールを検索中',
      list_rules: 'ルールを確認中',
      read_thread: 'スレッドを読込中',
      redraft_action: '下書きを書き直し中',
      refresh: '新着メールを確認中',
      send_email: '送信中',
      snooze_thread: 'スヌーズ中',
      unsubscribe: '配信停止中',
      tidy_mail: '片付け中',
      trash_thread: 'ゴミ箱に移動中',
      report_spam: '迷惑メールを報告中',
      mark_not_spam: '迷惑メールから戻し中',
      move_to_inbox: '受信トレイに移動中',
      list_promises: '約束を確認中',
      set_promise_status: '約束を更新中',
    },
    to: (recipients: string) => `宛先: ${recipients}`,
    until: (time: string) => `再表示: ${time}`,
    yes: {
      dismiss_action: 'スキップ',
      create_event: '追加',
      delete_event: '削除',
      update_event: '保存',
      approve_action: '実行',
      archive_thread: 'アーカイブ',
      clear_out: '片付ける',
      undo_clear_out: '戻す',
      create_rule: '追加',
      reply: '送信',
      send_email: '送信',
      snooze_thread: 'スヌーズ',
      unsubscribe: '配信停止',
      tidy_mail: '片付ける',
      trash_thread: 'ゴミ箱へ',
      report_spam: '迷惑メールを報告',
      mark_not_spam: '迷惑メールではない',
      move_to_inbox: '戻す',
    },
  },
  ask: {
    label: (question: string) => `Fewmail に質問：「${question}」`,
    thinking: 'メールを確認しています…',
  },
  compose: {
    attach: 'ファイルを添付',
    attachmentsTooLarge: (limit: string) =>
      `添付ファイルは合計 ${limit} までです。`,
    dropFiles: 'ドロップして添付',
    removeAttachment: '削除',
    discarded: '下書きを破棄しました',
    backInQueue: 'キャンセルしました。下書きは「ホーム」に戻りました。',
    canceled: 'キャンセルしました。メールはエディタに戻りました。',
    cc: 'Cc',
    discard: '破棄',
    draftSaved: '下書きを保存しました',
    forward: '転送',
    forwardedMessage: '転送されたメッセージ',
    from: '差出人',
    invalidRecipients: '有効なメールアドレスを1つ以上追加してください。',
    later: {
      inHour: '1時間後',
      monday: '月曜日の朝',
      pick: '日時を選択',
      schedule: '予約',
      time: '時刻',
      tomorrow: '明日の朝',
    },
    new: '新規メール',
    placeholder: 'メールを書く…',
    remind: {
      days: (total: number) => `${total}日以内に返信がなければ通知`,
      label: 'リマインド',
      off: 'リマインドなし',
    },
    reply: '返信',
    scheduledFor: (date: string) => `${date} に送信予定`,
    send: '送信',
    sendLater: '後で送信',
    sendingIn: (seconds: number) => `${seconds}秒後に送信`,
    subject: '件名',
    to: '宛先',
    undo: '元に戻す',
    undoing: '元に戻しています…',
    writeForMe: '代わりに書いて',
    writing: '作成中…',
  },
  composer: {
    acceptSuggestion: 'Tab で確定',
    bold: '太字',
    bulletList: '箇条書き',
    italic: '斜体',
    link: 'リンク',
    linkPlaceholder: 'リンクを貼り付けまたは入力',
    noSnippets: '一致するスニペットはありません。',
    removeLink: 'リンクを削除',
  },
  calendar: {
    tomorrow: '明日',
    noAccess: {
      allow: 'アクセスを許可',
      description:
        'Google でカレンダーの共有が許可されていません。ここで予定を見たり追加したりするには許可してください。',
      title: 'カレンダーが接続されていません',
    },
    allDay: '終日',
    calendar: 'カレンダー',
    create: '予定を追加',
    delete: '削除',
    deleted: '予定を削除しました',
    description: '説明',
    editEvent: '予定を編集',
    endBeforeStart: '終了が開始より前になっています',
    ends: '終了',
    location: '場所',
    newEvent: '新しい予定',
    next: '次へ',
    openInGoogle: 'Google カレンダーで開く',
    previous: '前へ',
    save: '保存',
    saved: '予定を保存しました',
    saving: '予定を保存中…',
    scope: {
      this: 'この予定のみ',
      following: 'これ以降の予定',
      all: 'すべての予定',
    },
    starts: '開始',
    title: 'カレンダー',
    titlePlaceholder: 'タイトルを追加',
    today: '今日',
    untitled: '(タイトルなし)',
    views: {
      day: '日',
      week: '週',
      month: '月',
      year: '年',
    },
  },
  category: {
    calendar: 'カレンダー',
    finance: 'お金',
    newsletter: 'ニュースレター',
    notification: '通知',
    other: 'その他',
    person: '人',
    promotion: 'プロモーション',
    receipt: '領収書',
    security: 'セキュリティ',
    travel: '旅行',
    work: '仕事',
  },
  command: {
    compose: '新規メール',
    agent: 'エージェント',
    appearance: '表示',
    goTo: '移動',
    mail: 'メール',
    nothingMatches: '一致するものはありません。',
    placeholder: 'メールについて質問、またはコマンドを実行…',
    teachRule: '新しいルールを教える',
    upgrade: 'Pro にアップグレード',
    theme: {
      dark: 'ダーク',
      light: 'ライト',
      system: 'システム',
    },
  },
  importance: ['ノイズ', '知っておくと良い', '近いうちに対応', '緊急'],
  justNow: 'たった今',
  errors: {
    calendarAccess:
      'Fewmail はこのカレンダーにアクセスできません。カレンダーのページで許可してください。',
    failed: '問題が発生しました。もう一度お試しください。',
    needsPro: 'これには Fewmail Pro が必要です。',
    alreadySent: 'すでに送信済みのため、取り消せません。',
    consentChanged:
      '確認を求めた後に内容が変わりました。もう一度見て、ホームで決めてください。',
    notFound: 'これはもう存在しません。削除された可能性があります。',
    offline: 'Fewmail に接続できません。接続を確認してください。',
  },
  update: {
    available: 'Fewmail の新しいバージョンがあります。',
    reload: '再読み込み',
  },
  keys: {
    forget: '忘れる',
    reopen: '再開',
    attach: '添付',
    done: '完了',
    openLink: 'リンクを開く',
    writeReminder: 'リマインドを書く',
    summary: 'まとめ',
    fromSender: '同じ差出人のメール',
    approvePicked: (n: number) => `選択した${n}件を承認`,
    pick: '選択',
    pickAll: 'すべて選択',
    markRead: '既読にする',
    markUnread: '未読にする',
    unpick: '選択を解除',
    pin: 'ピン留め',
    unpin: 'ピン留めを外す',
    copyCode: 'コードをコピー',
    restore: '受信トレイへ',
    calendarToday: '今日',
    newEvent: '新しい予定',
    period: '前へ / 次へ',
    view: '表示',
    skills: 'スキル',
    unsubscribe: '配信停止',
    filter: 'フィルター',
    reply: '返信',
    snooze: 'スヌーズ',
    trash: 'ゴミ箱',
    ask: 'これについて聞く',
    archive: 'アーカイブ',
    approve: '承認',
    approveAll: (n: number) => `同じ種類の${n}件をすべて承認`,
    close: '閉じる',
    draftReply: '返信を下書き',
    edit: '編集',
    expand: '開く / 閉じる',
    move: '移動',
    stackEmail: '次 / 前のメール',
    open: '開く',
    rename: '名前を変更',
    clearFilter: 'フィルターを解除',
    search: '検索',
    send: '送信',
    skip: 'スキップ',
    keep: '残す',
    stopEditing: '編集を終了',
    rewrite: '書き直す',
    save: '保存',
    deleteEvent: '削除',
  },
  legal: {
    privacy: 'プライバシーポリシー',
    englishOnly: 'この文書は英語で提供されており、英語版が正式な版となります。',
    terms: '利用規約',
    updated: (date: string) => `最終更新日：${date}`,
  },
  limits: {
    usage: (date: string) =>
      `今月のエージェント利用枠を使い切りました。${date} に戻ります。`,
  },
  notices: {
    freeUpSpace: '空き容量を増やす',
    mailLost:
      'Fewmail が Gmail にアクセスできなくなり、新しいメールを読めていません。',
    mailboxLost: (email: string) =>
      `Fewmail が ${email} にアクセスできなくなりました。`,
    reconnect: '再接続',
    sendLimit: (email: string, when: string) =>
      `${email} は Gmail の 1 日の送信上限に達しました。${when}に再び送信できます。`,
    signInAgain: 'もう一度ログイン',
    storageFull: (email: string) =>
      `${email} の Google ストレージがいっぱいのため、Gmail が新しいメールを差し戻しています。`,
    storageFullHint:
      'メールを再び受信するには、空き容量を増やすかストレージを追加してください。',
    photos: {
      allow: 'アクセスを許可',
      description:
        'Fewmail は Google の連絡先から写真を取得し、その用途にのみ使います。',
      title: 'メールをくれる人の写真を表示',
    },
  },
  login: {
    needsGmail:
      'Fewmail を使うには Gmail へのアクセスが必要です。もう一度ログインし、Google の画面で Gmail のチェックを外さないでください。',
    agree: ((slots) => [
      '続行すると、',
      slots.terms,
      'と',
      slots.privacy,
      'に同意したことになります。',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail は、あなたに代わって Gmail を読み、整理し、送信する権限をリクエストします。許可するルールを書かない限り、あなたの承認なしに送信やアーカイブは行いません。 Google カレンダーと、相手の写真を表示するための連絡先へのアクセスも求めますが、どちらもチェックを外せます。',
    continue: 'Google で続行',
    lead: 'Fewmail があなたの代わりに受信トレイを読み、あなたらしい文面で返信し、本当に必要なものだけをお見せします。',
    messengers:
      'メッセンジャーでも使えます（まずは Telegram から）。急ぎのメールを受け取り、返信を承認し、音声メッセージで指示することもできます。',
    title: '大切なメールだけを。',
  },
  mail: {
    inThread: (emails: string) => `この会話に${emails}`,
    moreFrom: (name: string) => `${name}からの他のメール`,
    draftDeleted: '下書きを削除しました',
    unsubscribeConfirm: (name: string) => `${name}の配信を停止しますか？`,
    unsubscribeHint:
      'Fewmailがリストから登録解除し、このスレッドをアーカイブします。配信停止は元に戻せません。',
    unsubscribing: '配信停止中…',
    pin: 'ピン留め',
    unpin: 'ピン留めを外す',
    pinned: 'ピン留め',
    showAll: (n: number) => `すべて表示（${n}）`,
    showFewer: '折りたたむ',
    inGmail: (count: string) => `Gmail に ${count} 件`,
    markShownRead: (n: number) => `${n}件を既読にする`,
    oneTimeCode: {
      copied: 'コードをコピーしました',
      copy: 'コードをコピー',
    },
    openUnsubscribePage: 'ページを開く',
    unsubscribeYourself:
      'このリストの配信停止はページで手続きが必要です。それまでメールはアーカイブします。',
    allMailboxes: 'すべてのメールボックス',
    filterAbout: {
      focused: '重要なメールと人を先に、通知はまとめて',
      unread: 'まだ読んでいないメールを種類別に',
      categories: '受信トレイ全体を種類別に、対応が必要なものを先に',
      inbox: 'すべて、新しい順',
    },
    find: {
      recent: '最近の検索',
      tips: 'ヒント',
      clearRecent: 'クリア',
      describeExample: '先月の Anna からの請求書',
      searching: 'メールを検索中…',
      tip: {
        from: 'Anna からのメール',
        subject: '件名に「invoice」を含む',
        attachment: '添付ファイルあり',
        pdf: 'PDF 添付あり',
        unread: '未読のスレッド',
        week: '過去 7 日間',
        describe: '自分の言葉で説明することもできます',
      },
    },
    group: {
      named: '差出人または件名',
      mentioned: '本文に記載',
      read: '既読',
      earlier: '以前',
      important: '重要',
      people: '人',
      plans: '予定と旅行',
      money: 'お金',
      updates: '通知',
      newsletters: 'ニュースレター',
      promotions: 'プロモーション',
    },
    unread: '未読',
    block: '送信者をブロック',
    ignoresUnsubscribe: (name: string) => `${name} は配信停止を無視します`,
    ignoresUnsubscribeHint:
      'Fewmail は配信停止を依頼しましたが、この送信者はそれでも送り続けることで知られています。今後このメールをゴミ箱に送りますか?ルールで元に戻せます。',
    blocked: 'ブロックしました。今後のメールはゴミ箱に移動します。',
    forward: '転送',
    more: 'その他',
    close: '閉じる',
    reply: '返信',
    trash: 'ゴミ箱に移動',
    trashed: 'ゴミ箱に移動しました',
    moveToInbox: '受信トレイへ',
    backInInbox: '受信トレイに移動しました',
    movedToInbox: '受信トレイに戻しました。お知らせありがとうございます。',
    deleteDraft: '下書きを削除',
    notSent: '未送信。開いて再試行',
    noRecipients: '宛先なし',
    notSpam: '迷惑メールではない',
    reportSpam: '迷惑メールとして報告',
    reportedSpam: '報告しました。今後のメールは迷惑メールに移動します。',
    archive: 'アーカイブ',
    archived: 'アーカイブしました',
    markedRead: '既読にしました',
    markUnread: '未読にする',
    markedUnread: '未読にしました',
    attachment: '添付ファイル',
    draftReply: '返信を下書き',
    due: (date: string) => `期限 ${date}`,
    dueHint: 'エージェントがこのメールで見つけた期限',
    empty: 'メールはありません',
    emptyHint: '新しいメールが届くとここに表示されます。',
    noResults: '見つかりませんでした',
    noResultsHint: '別の言葉や別のフォルダーで試してください。',
    expectsReply: '返信待ち',
    filter: {
      categories: 'カテゴリ',
      archive: 'アーカイブ',
      trash: 'ゴミ箱',
      drafts: '下書き',
      spam: '迷惑メール',
      inbox: '受信トレイ',
      snoozed: 'スヌーズ中',
      sent: '送信済み',
      focused: 'フォーカス',
      unread: '未読',
    },
    instruction: '返信の方針を伝えるか、そのまま Enter を押してください',
    open: '開く',
    openInGmail: 'Gmail で開く',
    collapseFullPage: 'リストに戻る',
    search: '検索または説明：先月の Anna からの請求書',
    unsubscribe: '配信停止',
    unsubscribed: '配信を停止しました',
    unsubscribeFailed:
      'この送信者はワンクリック配信停止に対応していないため、メールをアーカイブしました。',
    you: 'あなた',
    sent: '送信済み',
    writeReply: '返信を書く…',
    replyTo: '返信先',
    date: '日付',
    authentication: '認証',
    toLine: (recipients: string) => `宛先: ${recipients}`,
  },
  subscriptions: {
    leftBy: (percent: number) => `Fewmailの読者の${percent}%が配信を停止`,
    unsubscribeHint: (emails: string) =>
      `Fewmailがリストから登録解除し、送られたメールをすべてアーカイブします（今月は${emails}）。配信停止は元に戻せません。`,
    archivedOnly:
      'この送信者にはFewmailが使える配信停止の方法がないため、メールをアーカイブしました。ただしリストには残っているので、新しいメールは引き続き届きます。',
    count: (total: number) => `メーリングリスト${total}件`,
    empty: '今月メールを送ってきたメーリングリストはありません。',
    lead: '今月メールを送ってきたニュースレター、プロモーション、その他のメーリングリスト（多い順）。読まないものは配信停止を：Fewmail がリストから抜け、送られたメールをすべてアーカイブします。',
    opened: (total: number) => (total === 0 ? '開封なし' : `${total}件開封`),
    title: 'メーリングリスト',
    unsubscribe: '配信停止',
    unsubscribed: '配信停止しました',
  },
  nav: {
    board: 'ボード',
    menu: 'メニュー',
    labels: 'ラベル',
    folders: 'フォルダ',
    calendar: 'カレンダー',
    subscriptions: 'メーリングリスト',
    people: '人',
    findPerson: '人を探す',
    clearSearch: '検索をクリア',
    mail: 'メール',
    reading: 'リーディング',
    rules: 'ルール',
    search: '検索または質問…',
    settings: '設定',
    syncFailed: 'Gmail の同期に失敗しました。再試行中',
    syncing: '受信トレイを読んでいます…',
    loading: '読み込み中',
    syncFailedIn: (email: string) => `${email} の同期に失敗しました。再試行中`,
    syncingIn: (email: string) => `${email} を読んでいます…`,
    home: 'ホーム',
    trialLeft: (total: number) => `Pro トライアル · 残り ${total} 日`,
    usage: (percent: number) => `エージェント · 今月の ${percent}% を使用`,
    watching: 'エージェントが受信トレイを見守っています',
  },
  notifications: {
    many: (n: number) => `Fewmail から ${n} 件のお知らせ`,
  },
  onboarding: {
    languageHint:
      'アプリ、要約、説明にこの言語を使います。返信は常に、返信するメールの言語に合わせます。',
    languageTitle: 'Fewmail は何語で話しましょうか？',
    lead: '2つの簡単な質問です。すべて後から設定で変更できます。',
    reading: '受信トレイを読んでいます…',
    start: '始める',
    title: 'エージェントを設定しましょう。',
  },
  plan: {
    used: (percent: number) => `${percent}% 使用`,
    about: (emails: string, messages: string) =>
      `月に約 ${emails} 通のメール読み取り、またはエージェントへの ${messages} 件のメッセージ（組み合わせ自由）。`,
    free: 'Free',
    freeDescription:
      'シンプルなルールで、速く落ち着いたメールを。好きなだけ無料で使えます。',
    includes:
      '有料プランではエージェントが加わります：すべてのメールの読み取りと要約、あなたの口調での返信の下書き、自然な言葉で書けるルール、Telegram と MCP。',
    manage: '支払いを管理',
    price: (usd: number) => `$${usd} / 月`,
    priceYearly: (usd: number) => `$${usd} / 年`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
    cancels: (plan: string, date: string) =>
      `${date} まで ${plan}、その後は Free になります。`,
    choose: (plan: string) => `${plan} を選ぶ`,
    proRenews: (date: string) => `${date} に更新されます。`,
    resets: (date: string) => `${date} にリセットされます。`,
    title: 'プラン',
    trial: 'Pro トライアル',
    welcome: (plan: string) =>
      `${plan} へようこそ。エージェントが再び動き始めました。`,
    yearly: '年払いにする',
    yearlyHint: '2 か月分無料。',
    trialDescription: (date: string) =>
      `${date}までProの全機能、その後は無料。カード不要。`,
    upgrade: '他のプラン',
    usage: '今月',
  },
  queue: {
    addToCalendar: 'カレンダーに追加',
    writeReminder: 'リマインドを書く',
    approve: '承認',
    delete: '削除',
    pick: '選択',
    picked: (n: number) => `${n}件を選択中`,
    unpick: '選択解除',
    askedByYou: 'あなたの依頼',
    draftedInVoice: 'あなたらしい文面で下書きしました',
    readEmail: 'メールを読む',
    send: '送信',
    rewrite: '書き直す',
    shorterInstruction: 'もっと短くしてください。',
    new: '新着',
    skipStale: 'まとめてスキップ',
    skipped: (n: number) => `${n}件をスキップ`,
    stale: (n: number) => `1週間以上前: ${n}件`,
    skip: 'スキップ',
  },
  reminders: {
    followUp: 'フォローアップ',
    noReply: 'まだ返信なし',
  },
  rules: {
    deleted: 'ルールを削除しました',
    add: 'ルールを追加',
    count: (n: number) => `${n} 件のルール`,
    delete: '削除',
    describe: {
      alwaysShow: '常に「ホーム」に表示',
      autonomous: '自動で実行し、対応済みに表示',
      draft: '下書きが「ホーム」で待っています',
    },
    effect: {
      trash: 'ゴミ箱に移動',
      always_show: '常に表示する',
      archive: 'アーカイブする',
      draft_reply: '返信を下書きする',
      mark_read: '既読にする',
      unsubscribe: '配信停止する',
    },
    enabled: 'ルールを有効化',
    lead: '特定のメールをどう扱うか、普段の言葉でエージェントに伝えてください。エージェントはすべてのメールを、これらのルールに照らし合わせます。',
    newTitle: '新しいルールを教える',
    leadFree:
      'アーカイブ、既読、配信停止を自動で行います。ルールは新しいメールが届いた瞬間に適用されます。',
    simple: {
      appliedAutomatically: '新しいメールに自動で適用されます',
      field: {
        from: '差出人',
        mailingList: 'すべてのメーリングリスト',
        subject: '件名に含む',
      },
      title: {
        from: (value: string) => `差出人「${value}」`,
        mailingList: () => 'すべてのメーリングリスト',
        subject: (value: string) => `件名に「${value}」を含む`,
      },
      valuePlaceholder: 'anna@example.com、名前、または単語',
      whichField: '条件',
    },
    placeholder: '例：Hetzner からの請求書、LinkedIn の通知',
    title: 'ルール',
    whatAgentDoes: 'エージェントの動作',
    whichEmails: '対象のメール',
  },
  settings: {
    disconnectConfirm: (name: string) => `${name}の接続を解除しますか？`,
    messengerDisconnectHint:
      'ボットからのメッセージが届かなくなります。再接続にはこのページの新しいリンクが必要です。',
    readingDigest: {
      description:
        '毎朝、前日のメルマガを Telegram と WhatsApp にひとつのメッセージで、どちらも未接続なら通知で届けます。',
      title: 'メルマガのダイジェスト',
    },
    knowledge: {
      description:
        '料金、住所、対応可能な日時、返信のスタイルなど。エージェントが下書きや自動補完に使います。',
      placeholder:
        '例：コンサルティングは $150/h です。金曜日は電話に出ません。住所は…',
      title: 'エージェントに知っておいてほしいこと',
    },
    labels: {
      description:
        'メールを Fewmail/… ラベルに分類し、スマホの Gmail でも同じ順序で表示します。',
      title: 'Gmail のエージェントラベル',
    },
    snippets: {
      deleted: 'スニペットを削除しました',
      add: 'スニペットを追加',
      body: 'テキスト',
      delete: '削除',
      description:
        'エディタで ; を入力すると、名前でスニペットを挿入できます。',
      name: '名前',
      title: 'スニペット',
    },
    account: 'アカウント',
    agent: 'エージェント',
    deleteAccount: 'アカウントを削除',
    deleteConfirm: 'すべて削除',
    deleteDescription:
      'アカウント、同期したメール、下書き、ルールを Fewmail からすぐに削除します。Gmail 自体には影響しません。有料プランはすぐに解約されます。',
    deleteFailed:
      'アカウントは削除されませんでした。少し待ってからもう一度お試しください。',
    deleteSignIn:
      '本人確認のため、もう一度 Google でログインしてからアカウントを削除してください。',
    deleteTitle: 'Fewmail アカウントを削除しますか？',
    cancel: 'キャンセル',
    integrations: '連携',
    language: '言語',
    languageDescription:
      'アプリ、ボット、要約に使います。返信はメールの言語に合わせます。',
    legal: '法的情報',
    mailboxes: {
      removeConfirm: (email: string) => `${email}を削除しますか？`,
      removeHint:
        'Fewmailはこのメールボックスを読むのをやめ、読んだ内容を忘れます。Gmailでは何も変わりません。',
      add: 'Gmailを追加',
      addDescription:
        '別のGmailアカウントのメールも同じ「ホーム」と受信トレイに届きます。このアカウントでここにログインすることはできません。ログインすると別のFewmailが開きます。',
      added: 'メールボックスを追加しました。1分ほどでメールが表示されます。',
      failed:
        'メールボックスを追加できませんでした。Gmailへのアクセスを許可して、もう一度お試しください。',
      lost: 'Gmailへのアクセスが失われました。再接続するにはもう一度追加してください。',
      reading: 'メールを読み込み中…',
      remove: '削除',
      retrying:
        'Gmail が今は応答していません。Fewmail が自動でもう一度試します。',
      signIn: 'ログインに使うアカウント',
      signInChosen:
        'それはログインに使っているアカウントです。別のアカウントを選んでください。',
      signInLost:
        'Gmailへのアクセスが失われました。再接続するにはもう一度ログインしてください。',
      synced: (ago: string) => `${ago}に同期`,
      title: 'メールボックス',
    },
    mcp: {
      disconnectHint: '再接続するまで、メールを読めなくなります。',
      allow: '許可',
      connected: (ago: string) => `${ago}に接続`,
      copy: 'URLをコピー',
      defaultName: 'MCP クライアント',
      deny: '拒否',
      description:
        'メールの閲覧、返信の下書き、あなたの確認後の送信ができます。',
      disconnect: '接続を解除',
      paste:
        'このURLをアプリのコネクタとして追加し、Fewmailにサインインしてください。',
      request: (app: string) => `${app}がFewmailへのアクセスを求めています`,
      title: 'Claude、Cursor、その他の MCP クライアントを接続',
    },
    morningDescription: (timezone: string) =>
      `メルマガのダイジェストと月曜の週次レポートを、あなたのタイムゾーン（${timezone}）で届けます`,
    morningTitle: '朝のメッセージ',
    signedInWithGoogle: 'Google でログイン中',
    signOut: 'ログアウト',
    notifications: {
      blocked:
        '通知がブロックされています。ブラウザのサイト設定で許可してください。',
      browser: 'このブラウザ',
      messengerOff: '緊急のメールは Fewmail の中だけに表示します。',
      messengerOn: '緊急のメールをすぐにチャットへ送ります。',
      notConfigured: 'このサーバーではブラウザ通知が設定されていません。',
      off: 'Fewmail を閉じていても、緊急のメールをここで受け取れます。',
      on: '緊急のメールがここに届きます。同時に複数届いたときは 1 件にまとめます。',
      title: '通知',
      unsupported: 'このブラウザは通知を表示できません。',
    },
    telegram: {
      connect: 'Telegram を接続',
      disconnect: '接続を解除',
      linked:
        '緊急のメールはすぐに届きます。下書きの承認や編集もチャットからできます。',
      linkedQuiet: '下書きの承認や編集はチャットからできます。',
      notConfigured: 'このサーバーでは Telegram ボットが設定されていません。',
      unlinked: 'Telegram で緊急のメールを受け取り、下書きを承認できます。',
    },
    whatsapp: {
      connect: 'WhatsApp を接続',
      disconnect: '接続を解除',
      linked:
        '緊急のメールはすぐに届きます。下書きの承認や編集もチャットからできます。',
      linkedQuiet: '下書きの承認や編集はチャットからできます。',
      notConfigured: 'このサーバーでは WhatsApp ボットが設定されていません。',
      unlinked: 'WhatsApp で緊急のメールを受け取り、下書きを承認できます。',
    },
    title: '設定',
  },
  site: {
    meta: {
      assistant:
        'Fewmail は Gmail のための AI メールアシスタントです。すべてのメールを先に読み、あなたらしい返信を下書きし、あなたが必要なものだけを見せます。無料で始められます。',
      assistantTitle: 'Gmail のための AI メールアシスタント',
      compare:
        'Fewmail と Superhuman、Shortwave、SaneBox の比較：自分で速く読むための道具ではなく、代わりにメールを読む AI エージェントです。',
      compareTitle: 'AI メールアシスタントの比較',
      home: 'Fewmail は Gmail のための AI メールアシスタントです。すべてのメールを読み、あなたらしい返信を下書きし、あなたが必要なものだけを見せます。',
      login:
        'Fewmail はあなたの代わりに Gmail を読み、あなたらしく返信し、本当にあなたが必要なものだけを見せます。',
      mcp: 'Fewmail を MCP サーバーとして Claude、ChatGPT、Claude Code、Cursor に接続し、使い慣れた AI から Gmail を読んで整理できます。',
      motto: '受信トレイの大事なことだけ',
      pricing: (trialDays: number) =>
        `Fewmail のホーム、仕分け、ルール、スパム対策はずっと無料。エージェントのすべてが使える Pro は、カード不要の ${trialDays} 日間無料から始められます。`,
      tagline: 'Gmail のための AI メールエージェント',
    },
    chapters: {
      pricing: {
        description:
          'ホーム、仕分け、ルール、保護機能はずっと無料。Lite、Pro、Max では、メールを読み、書いてくれる機能がすべて加わります。上のプランほど、それをたくさんこなすだけです。',
        label: '料金',
        title: (usd: number) => `仕分けは無料。エージェントは $${usd} から。`,
      },
      questions: {
        description:
          '要点だけの回答です。詳しくはプライバシーポリシーをご覧ください。',
        label: 'よくある質問',
        title: 'Gmail をつなぐ前に。',
      },
    },
    closing: {
      lead: 'Gmail の接続は 1 分。Fewmail は直近 3 日分のメールから始めるので、最初の判断がすぐにあなたを待っています。',
      title: '朝の時間を取り戻そう。',
    },
    mcp: {
      answer:
        '金曜のキックオフまでに、署名済みの契約書が必要です。返信はもう下書きしてあり、Fewmail のキューで待っています。',
      clients: '対応アプリ',
      emphasis: 'Claude と ChatGPT',
      free: 'メールの閲覧とエージェントによる仕分けは無料です。',
      label: 'MCP',
      lead: 'Fewmail を MCP サーバーとしてつなげば、いつも使っているアシスタントからメールについて聞けます。メールの送信や Gmail の変更は、これまでどおりあなたの承認を待ちます。',
      question: '今週、Anna が私に求めていることは？',
      setup: '1 分で接続',
      title: 'あなたのメールを、Claude と ChatGPT の中で。',
    },
    mcpPage: {
      copy: 'URL をコピー',
      lead: 'Fewmail を MCP サーバーとしてつなげば、使い慣れた AI からメールについて聞けます。メールの閲覧とエージェントによる仕分けは無料。下書き、送信、ルールは Pro で使えます。',
      safety:
        'メールの送信や Gmail の変更は、必ず先にあなたの承認を求めます。アシスタントに命令しようとするメールは、読まれる前に警告が付きます。メールがモデルの学習に使われることはなく、どのアプリも設定から切断できます。',
      steps: {
        chatgpt:
          'Settings でこの URL のコネクタ（アプリ）を追加し、Fewmail にサインインします。',
        claude:
          'Settings → Connectors でこの URL のカスタムコネクタを追加し、Fewmail にサインインします。',
        code: 'ターミナルで一度これを実行し、Claude Code に求められたら Fewmail にサインインします。',
        cursor:
          'これを mcp.json に追加し、Cursor に求められたら Fewmail にサインインします。',
      },
      title: 'Claude、ChatGPT、いつものツールの中に Fewmail を。',
    },
    assistantPage: {
      abilities: {
        ask: {
          description:
            '「フライトは何時に出発？」と聞けば、もとのメールと一緒に答えが返ってきます。Fewmail、Telegram、WhatsApp でも、Claude や ChatGPT からでも。',
          title: 'メールから答える',
        },
        drafts: {
          description:
            '返信は前もって、あなたの口調で、送信者の言語で書かれ、あなたが承認するまでキューで待ちます。',
          title: 'あなたらしい返信を下書き',
        },
        protection: {
          description:
            '振込先の変更、なりすましドメイン、既知の詐欺には、あなたが動く前に警告を出します。',
          title: 'フィッシングを警告',
        },
        reading: {
          description:
            'その日のメルマガを、トピックごとの 1 つの要約に。各文にはもとのメールへのリンクがつきます。',
          title: 'メルマガを 1 つの要約に',
        },
        rules: {
          description:
            '一部のメールをどうしたいか一文で書けば、それがルールになります。自動で動くのは、あなたがオンにしたルールだけです。',
          title: '普段の言葉で書くルール',
        },
        sorting: {
          description:
            'すべてのメールに要約と重要度のスコアがつくので、急ぎのものが上に来て、領収書、通知、プロモーションは邪魔になりません。',
          title: 'すべてのメールを読んで仕分け',
        },
      },
      abilitiesDescription:
        'すべてはいつもの Gmail の中で行われ、エージェントがしたことはひとつ残らず理由とともに記録されます。',
      abilitiesLabel: 'できること',
      abilitiesTitle: '新しい受信トレイではなく、アシスタント。',
      compareTitle: 'ほかの AI メールツールとの比較。',
      faq: (trialDays: number) => [
        {
          answer:
            'AI を使って、あなたの代わりにメールを読み、仕分け、返信するソフトウェアです。多くは、結局自分で読む受信トレイに要約や文章作成の手助けを加えるだけ。Fewmail はさらに先へ進み、先にすべてを読むので、あなたは必要なものだけを見れば済みます。',
          question: 'AI メールアシスタントとは？',
        },
        {
          answer:
            'Fewmail は件名、本文、要約、下書きをデータベース内で暗号化し、あなたのメールをモデルの学習に使うことはなく、あなたの承認なしに Gmail で何かを送信・変更することもありません。いつでも接続を解除し、すべてを削除できます。',
          question: 'AI にメールを読ませても安全ですか？',
        },
        {
          answer:
            '返信を下書きしますが、自分から送信することはありません。下書きはすべてキューであなたの承認を待ち、似たものはまとめて承認できます。',
          question: 'メールに自動で返信できますか？',
        },
        {
          answer: `あります。Free プランでは、すべてのメールの仕分け、あなたが必要なものを 1 ページにまとめる表示、ルールの実行、迷惑メールとフィッシングからの保護がずっと使えます。下書き、要約などエージェントのほかの機能は有料プランで使え、どのアカウントもカード不要の Pro ${trialDays} 日間から始まります。`,
          question: 'Gmail で使える無料の AI メールアシスタントはありますか？',
        },
      ],
      faqTitle: 'AI メールアシスタントについて。',
      lead: 'Fewmail は Gmail に届くメールを届いたそばからすべて読み、ノイズを片付け、あなたらしい返信を下書きし、あなたの判断が必要な数件だけを届けます。あなたの承認なしに送信や変更が行われることはありません。',
      title: 'あなたの Gmail を先に読む AI メールアシスタント。',
    },
    comparePage: {
      lead: 'メールクライアントは、すべてのメールを速く読めるようにします。フィルターは、メールをフォルダに振り分けます。Fewmail はエージェントです。メールを読み、後回しにできるものを判断し、それ以外だけをあなたに尋ねます。',
      title: 'Fewmail を比べる。',
    },
    comparison: {
      custom: '個別見積もり',
      features: '機能ごとの比較',
      groups: {
        agent: '読むことと返信',
        day: 'あなたの 1 日',
        reach: '使える場所',
        safety: '保護',
      },
      labels: {
        ask: 'メールに何でも質問',
        home: '対応が必要なことを 1 ページに',
        calendar: 'カレンダー',
        drafts: '返信の下書き',
        followUps: 'フォローアップのリマインダー',
        gmail: 'Gmail と Google Workspace',
        handOver: 'スレッドを任せる',
        importance: '重要度順に並べる',
        keepApp: 'いつものメールアプリのまま',
        mcp: '自分のツール向けの MCP',
        memory: '約束や人を覚えている',
        otherProviders: 'iCloud、Yahoo などの IMAP メール',
        outlook: 'Outlook と Microsoft 365',
        phishing: 'フィッシングと支払い先変更の警告',
        phone: 'スマートフォンで',
        rules: '普段の言葉で書くルール',
        snooze: 'スヌーズ',
        spamShield: 'コミュニティ迷惑メールシールド',
        summaries: 'メールの要約',
        teams: 'チームの受信トレイ',
        unsubscribe: 'ワンクリックで配信停止',
      },
      more: 'ほかの比較',
      no: 'なし',
      noFreePlan: '無料プランなし',
      ours: {
        ask: 'Pro で',
        home: 'リアルタイムで更新、まとめて承認、無料',
        drafts: 'あなたの口調で。送信は承認したときだけ、Pro で',
        followUps: '返信を待っているメールに自動で',
        handOver: 'エージェントが目的まで進める、Pro で',
        importance: 'すべてのメールを採点、無料',
        keepApp: 'すべて Gmail に反映',
        mcp: 'Pro で',
        memory: 'Pro で',
        phone: 'Telegram と WhatsApp、音声も、Pro で',
        rules: 'アーカイブ、既読、配信停止、無料',
        summaries: 'Pro で',
        unsubscribe: '無視する送信者は迷惑メールへ',
      },
      plans: 'プランと料金',
      read: '比較を読む',
      source: (name: string, date: string) =>
        `${name} の情報は公式サイトの公開情報に基づき、${date} に確認したものです。料金や機能は変わることがあるため、最新の内容は ${name} のサイトでご確認ください。`,
      title: (name: string) => `Fewmail vs ${name}`,
      tryFree: 'Fewmail を無料で試す',
      which: 'あなたに合うのはどちら？',
      yes: 'あり',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: 'メールボックス 4 つとすべての機能、AI Bundle 付き',
          lunch: 'メールボックス 2 つ、スヌーズとリマインダー',
          snack: 'メールボックス 1 つと基本のフィルター',
        },
        summary:
          'SaneBox はメールをフォルダに仕分け、最上位プランでは下書きと要約もします。Fewmail は先にすべてを読み、あなたにしかできない少しの判断だけを 1 ページにまとめます。',
        them: {
          home: 'フィルターされたメールの毎日のダイジェスト',
          drafts: 'SaneDrafts、Dinner で',
          followUps: 'SaneNoReplies',
          importance: '重要でないメールを SaneLater へ移動',
          keepApp: 'フォルダを通して動作',
          otherProviders: 'あらゆる IMAP または Exchange サーバー',
          phone: 'メールアプリを通して',
          rules: 'フォルダ間でメールを動かして学習',
          snooze: 'Lunch から',
          summaries: 'SaneSummary、Dinner で',
          unsubscribe: 'SaneBlackHole フォルダ',
        },
        verdict:
          'メールが Gmail 以外にあり、フォルダ分けで十分なら SaneBox。Gmail を使っていて、大切なメールを読んで、要約して、返信まで任せたいなら Fewmail。',
      },
      shortwave: {
        plans: {
          business: 'ユーザー単位',
          free: 'ほとんどの機能とアシスタント',
          max: 'ユーザー単位、最も高性能なモデル',
          premier: 'ユーザー単位、より高性能なモデル',
          pro: '全履歴、AI 検索と文章作成',
        },
        summary:
          'Shortwave は、話しかけて使う AI アシスタント付きのメールクライアントです。Fewmail は先にメールを読み、自分で判断できないことだけをあなたに尋ねるエージェントです。',
        them: {
          ask: 'AI アシスタントと検索',
          drafts: '頼んだときに',
          importance: '分割とバンドル',
          keepApp: 'メールアプリを置き換える',
          memory: 'AI メモリー',
          otherProviders: 'Gmail に転送して',
          outlook: 'Microsoft 365 は非対応',
          phone: 'iOS と Android アプリ',
          rules: 'AI フィルター、プランにより 3〜50 個',
          summaries: 'すべてのメールの上部に',
          teams: '共有スレッドとコメント',
          unsubscribe: 'ワンクリックのブロック付き',
        },
        verdict:
          'チャットアシスタント付きの新しい受信トレイが欲しいなら Shortwave。いつもの Gmail のまま、目を通すメールを減らしたいなら Fewmail。',
      },
      superhuman: {
        plans: {
          business: '1 メンバーあたり $33、年払い。Auto Drafts と Ask AI 付き',
          enterprise: 'SSO と管理機能',
          starter: '1 メンバーあたり $25、年払い',
        },
        summary:
          'Superhuman は、すべてのメールを速く処理できるようにします。Fewmail はあなたの代わりに処理し、あなたが必要なものだけを見せます。',
        them: {
          ask: 'Ask AI、Business で',
          drafts: 'Auto Drafts、Business で',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox と Auto Labels',
          keepApp: 'メールアプリを置き換える',
          mcp: 'Business で',
          phone: 'iOS と Android アプリ',
          rules: 'Custom Auto Labels、Business で',
          spamShield: 'メールプロバイダーのフィルター',
          summaries: 'Auto Summarize',
          teams: '共有下書きとコメント',
        },
        verdict:
          'すべてのメールに自分で、もっと速く目を通したいなら Superhuman。ほとんどのメールを見ずに済ませたいなら Fewmail。',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          '多くの AI メールツールは、チャット欄のついた新しい受信トレイです。結局すべてのメールを自分で読み、上に要約がつくだけです。Fewmail は、いま使っている Gmail の上で動く AI エージェントです。先にすべてのメールを読み、あなたらしい返信を下書きし、あなたが決めるべき数件だけを届けます。',
        question: 'Fewmail はほかの AI メールアシスタントと何が違いますか？',
      },
      {
        answer:
          'いいえ。Fewmail は Gmail の上で動きます。行ったことはすべて Gmail にも反映され、普段の Gmail アプリもそのまま併用できます。',
        question: 'Gmail から乗り換える必要はありますか？',
      },
      {
        answer:
          'あなたの了承なしには決して行いません。返信はあなたが承認するまでキューで待機し、自動でアーカイブ、既読、配信停止ができるのは、あなたが作成したか残したルールだけです。行ったことはすべて「対応済み」に表示されます。',
        question: '勝手にメールを送ったり削除したりしませんか？',
      },
      {
        answer:
          '件名、本文、要約、下書きはデータベース内で暗号化されています。あなたのメールがモデルの学習に使われることはありません。迷惑メールシールドがユーザー間で共有するのは鍵付きハッシュだけで、アドレスや内容は共有しません。',
        question: '私のメールはどう扱われますか？',
      },
      {
        answer: `新しいアカウントはすべて、Pro を ${trialDays} 日間カードなしで使えます。終了後はそのまま Free に移るだけで、何も削除されず、請求もありません。`,
        question: 'トライアル終了後はどうなりますか？',
      },
      {
        answer:
          '下書きは、返信するメールと同じ言語で書かれます。アプリ、要約、Telegram ボットは、15 言語から選んだひとつの言語で話します。',
        question: '対応している言語は？',
      },
      {
        answer:
          '現在は Gmail と Google Workspace のアカウントに対応しています。ひとつの Fewmail に複数のメールボックスを追加すれば、すべてのメールが同じ「ホーム」と受信トレイに届きます。',
        question: 'どのメールアカウントで使えますか？',
      },
    ],
    features: {
      description:
        '以前は午後いっぱいかかっていたメールの作業を、裏側で片づけ、確認できる場所に一覧で残します。',
      items: {
        codes: {
          description:
            '新しいコードはホームの上部とそのメールの横に表示され、何も開かずにコピーできます。無料。',
          title: 'ログインコード',
        },
        subscriptions: {
          description:
            '今月届いたすべてのメーリングリストと、実際に開いたメールの数。どれでもキー 1 つで配信停止。無料。',
          title: 'メーリングリスト',
        },
        ask: {
          description:
            '普段の言葉で何でも聞けば、あなた自身のメールから答えが返ってきます。根拠になったメールも一緒に。',
          title: 'メールに聞く',
        },
        calendar: {
          description:
            'すべてのメールボックスのカレンダーをひとつの画面に。メールで提案された会議は、あなたが OK すれば予定になります。',
          title: 'カレンダー',
        },
        clearOut: {
          description:
            '溜まったメールを一度にまとめて片付けます。メールボックスごとに最大 50,000 通、すべてひとつのラベルにまとめるので、「元に戻す」で全部戻せます。無料。',
          title: '受信トレイの片付け',
        },
        reading: {
          description:
            'その日のメルマガを 1 つの要約に。トピックごとのニュース、各文に出典へのリンク、全文を読む価値のあるものも。',
          title: 'リーディング',
        },
        voice: {
          description:
            'メルマガの要約を読み上げで聴けます。Telegram や WhatsApp で音声メッセージを送れば、エージェントが声で答えます。',
          title: '読む代わりに聴く',
        },
        wrapped: {
          description:
            'メールで振り返るあなたの 1 か月、1 年。届いたメール、対応したこと、取り戻せた時間。シェアできて、名前は一切出ません。',
          title: 'メールで振り返る1年',
        },
      },
      label: 'ほかにも',
      title: 'アシスタントに頼みたいことは、ほかにも全部。',
    },
    footer: {
      legal: '法的情報',
      product: 'プロダクト',
      tagline:
        'Gmail を読んで、あなたが必要なものだけを見せる AI メールエージェント。',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'もう過去のもの。',
      label: 'なくなるもの',
      rows: [
        {
          fix: '受信トレイの片付けで、溜まったメールを一度に移動します。古い広告、既読の通知、開かないメルマガ。「元に戻す」ひとつで、すべてのメールが戻ります。',
          problem: '誰も読むことのない何千通ものメール。',
        },
        {
          fix: '返信は前もって、あなたの口調と相手の言語で下書きされます。似た返信は ⇧⏎ でまとめて承認でき、一通ずつ確認もできます。',
          problem: '真夜中のメール返信。',
        },
        {
          fix: 'キー 1 つで、人と同じやり方で配信停止：ワンクリック、配信停止ページ、またはメール。それでも送ってくる送信者は検出され、迷惑メールとして提案されます。',
          problem: '登録した覚えのないメルマガ。',
        },
        {
          fix: 'その日のメルマガがトピックごとの 1 つの要約になり、全文を読む価値のあるものも示されます。',
          problem: '読むつもりだったメルマガ。',
        },
        {
          fix: '支払い先の変更、なりすましドメイン、既知のフィッシングは、対応する前に警告します。',
          problem: '振込先が変わった請求書。',
        },
        {
          fix: '送信したメールでした約束は期限が来ると戻ってきて、誰も返信していないスレッドにはフォローアップが付きます。',
          problem: '約束したのに忘れていたこと。',
        },
        {
          fix: 'Telegram や WhatsApp に届くのは急ぎのメールだけ。残りは仕分け済みで「ホーム」に並び、好きなときに確認できます。',
          problem: '念のため、夕食中もメールを確認すること。',
        },
      ],
      title: 'メールの悩みは、もう過去のもの。',
    },
    hero: {
      needs: {
        emphasis: 'あなたの出番',
        lead: (handled: string) =>
          `Anna は契約書を待っていて、Northwind の請求書は来週が支払期限、Marco は木曜に時間を取りたいそうです。ニュースレターと通知 ${handled} 通は対応済み。新しいメールが届くたびに「ホーム」は自動で更新されます。`,
        tag: 'ホーム · 木曜日 08:12',
        title: 'あなたの出番は 3 つ。',
      },
      fates: {
        archived: 'アーカイブ',
        markedRead: '既読',
        spam: '迷惑メール',
        summarised: '要約',
        unsubscribed: '配信停止',
      },
      handled: ((slots) => [
        '対応済み ',
        slots.count,
        ' 件、すべて理由つき',
      ]) as Rich<'count'>,
      inbox: '受信トレイ',
      lead: 'メルマガ、レシート、通知、フィッシングリンク。そしてそのどこかに、本当に大事な 3 通のメール。Fewmail は、そのすべてをあなたの代わりに読む AI エージェントです。',
      needYou: ((slots) => [
        'あなたの判断が必要 ',
        slots.count,
        ' 件',
      ]) as Rich<'count'>,
      queue: [
        {
          reason: '契約書の期限は明日',
          summary:
            '金曜のキックオフまでに、署名済みの契約書を返送してほしいとのこと。',
        },
        {
          reason: '請求書 · 11月20日までに $1,240',
          summary:
            'ウェブサイトリニューアルの 10 月分の請求書。振込先は前回と同じです。',
        },
        {
          reason: '会議の提案',
          summary:
            '木曜 15:00 を提案しています。空いているのは 16:00 からなので、下書きでは 16 時をお願いしています。',
        },
      ],
      reading: {
        emphasis: 'すべて読みます。',
        lead: 'ノイズはアーカイブし、開かないメルマガは配信停止し、詐欺は入口で止めます。やったことにはすべて理由が書き残されるので、あとから確認できます。',
        title: 'Fewmail が、すべて読みます。',
      },
      remind: '11月19日にリマインド',
      remindPlan: '請求の一覧に追加して、11月19日にお知らせします。',
      start: 'Google で無料で始める',
      title: 'メールは、あなたの仕事じゃない。',
      home: 'ホーム',
      tryQueue: 'キューを試す',
      unread: ((slots) => ['未読 ', slots.count, ' 件']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        '受信トレイに未読 ',
        slots.count,
        ' 件',
      ]) as Rich<'count'>,
      willDo: 'Fewmail がすること',
    },
    nav: {
      assistant: 'AI メールアシスタント',
      compare: '比較',
      features: '機能',
      mcp: 'MCP サーバー',
      pricing: '料金',
      signIn: 'ログイン',
    },
    play: {
      again: 'もう一度片づける',
      doneLead: (handled: string) =>
        `あなたが決めたのは 3 つだけ。残りの ${handled} 通は Fewmail が対応し、その理由も書き残しました。`,
      doneTitle: '今日はこれでおしまい。',
      emphasis: '2 分で。',
      handled: [
        'Lumen Weekly：直近 30 号を一度も開いていません',
        'paypa1-billing.com は paypal.com に似せたドメインです',
        'Parcelhub：配送のお知らせ、ルール「レシートと配送」により',
      ],
      handledTitle: '寝ている間に対応済み',
      label: '試してみる',
      lead: 'これが、これからの朝です。下書きはできていて、理由も添えてあり、決めるのはあなた。さあ、片づけてみてください。',
      left: (count: number) => `判断待ち ${count} 件`,
      title: '受信トレイのすべてを、2 分で。',
    },
    plans: {
      agent: 'エージェント',
      emails: 'エージェントが 1 か月に読むメール',
      everyPlan: 'すべてのプランに',
      messages: 'またはエージェントへのメッセージ',
      oneAllowance:
        'エージェントのすべての作業に共通の利用枠: 使った分だけ、ノイズは数えません',
      forever: 'ずっと',
      free: {
        description: 'ホーム、仕分け、ルール、保護。ずっと無料。',
      },
      max: {
        description: '同じエージェントを、忙しい受信トレイのために。',
      },
      monthly: '月払い',
      per: { month: '/ 月', year: '/ 年' },
      lite: {
        description: 'エージェントのすべて：読み、書き、覚える。',
      },
      pro: {
        description: '同じエージェントで、より多くのメールに対応。',
      },
      tryFree: (days: number) => `${days} 日間無料で試す`,
      yearly: '年払い · 2 か月分無料',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `ホーム、仕分け、普段の言葉で書くルール、保護機能はずっと無料。Pro は、あなたの代わりに読み、書き、覚えるエージェントです。Max は同じエージェントに、忙しい受信トレイのための余裕を加えたもの。どのアカウントも Pro の ${trialDays} 日間から始まり、終わったらそのまま Free に移るだけです。`,
      otherTool: 'ほかのツールも検討中ですか？',
      title: '払うのはエージェントに。受信トレイにではなく。',
    },
    startFree: '無料で始める',
    trialNote: (days: number) =>
      `Pro を ${days} 日間、カード不要で。その後も好きなだけ無料で使えます。`,
    trust: {
      emphasis: '聞きます',
      label: 'あなたのメール、決めるのはあなた',
      places: 'いつもの Gmail の上で動き、こちらでも受け取れます',
      title: '動く前に、必ずあなたに聞きます。',
      vows: [
        {
          description:
            '下書きはあなたを待ちます。自動でアーカイブ、既読、配信停止ができるのは、あなたが作成したか残したルールだけ。ルールが行ったことはすべて「対応済み」に表示されます。',
          title: 'あなたの OK なしには何も送りません。',
        },
        {
          description:
            '件名、本文、要約、下書きはデータベース内で暗号化されています。保存した下書きは Gmail に残り、私たちのもとには置きません。',
          title: '保存時に暗号化。',
        },
        {
          description:
            '迷惑メールシールドは、鍵付きハッシュを通してみんなから学びます。あなたのメールのアドレスも言葉も、ひとつも共有されません。',
          title: 'モデルの学習には一切使いません。',
        },
      ],
    },
  },
  skills: {
    bills: '支払い期限の近い請求',
    cancel: '有料サブスクを解約する',
    cleanup: '整理したいニュースレター',
    followups: 'まだ返信がない相手',
    reading: '今日のメルマガをひとつのダイジェストに',
    today: '今日対応が必要なこと',
    waiting: '返信を待っている人',
    week: '今週のメールのまとめ',
  },
  snooze: {
    laterToday: '今日の後ほど',
    nextWeek: '来週',
    title: 'スヌーズ',
    tomorrow: '明日',
    unsnooze: '受信トレイに戻す',
    until: (date: string) => `${date} までスヌーズ`,
    weekend: '今週末',
  },
  spam: {
    reasonList: 'スパム送信者ドメインの公開リストに載っています',
    reasonPattern: {
      auth: '送信者の認証に失敗：アドレスが偽装されています',
      infra:
        '複数の Fewmail ユーザーが迷惑メールとして報告したネットワークから送信',
      link: '複数の Fewmail ユーザーが迷惑メールとして報告したサイトへのリンク',
      signals: '新しいドメイン、不自然なアドレス、弱い認証が重なっています',
      template: '複数の Fewmail ユーザーが迷惑メールとして報告した文面と同じ',
    },
    reasonCommunity: '複数の Fewmail ユーザーが迷惑メールとして報告',
    reasonYou: 'この送信者を迷惑メールとして報告済み',
    suspect: '迷惑メールの疑い',
    imagesHidden: '迷惑メールの画像は非表示です。',
    openFile: {
      action: '開く',
      description:
        'このメールは迷惑メールにあります。送信者を信頼できる場合のみファイルを開いてください。',
      title: (name: string) => `${name} を開きますか？`,
    },
    showImages: '画像を表示',
  },
  starterRules: {
    alwaysShow:
      'セキュリティ警告、支払期限のある請求書、銀行や行政機関からのあらゆるメール',
    newsletters: 'ニュースレターとダイジェスト',
    notifications: 'ツールやサービスからの自動通知',
    promotions: 'プロモーション、マーケティング、営業の売り込みメール',
    receipts: '領収書、注文確認、発送通知',
  },
  telegram: {
    approveAlike: '同じ種類のカードをまとめて承認：',
    chatTaken:
      'このチャットはすでに別の Fewmail アカウントに接続されています。先にそちらで Telegram の接続を解除してから（設定 → 連携）、もう一度リンクを開いてください。',
    queueChanged:
      'その後カードが変わりました。今対応が必要なものはこちらです：',
    heard: (text: string) => `聞き取った内容：「${text}」`,
    voiceFailed:
      'うまく聞き取れませんでした。もう一度話すか、入力してください。',
    help: '必要なことを書くか話してください：\n• メールについて質問：「Netflixの更新日はいつ？」\n• 返信内容を伝える：「アンナに明日署名すると伝えて」\n• 作業を頼む：「Mediumのニュースレターはいつもアーカイブして」\n• 下書きを変えるには、その下書きに返信',
    canceled: 'キャンセルしました。下書きはキューに戻りました。',
    sendingIn: (seconds: number) => `${seconds}秒後に送信`,
    undo: '元に戻す',
    commands: { queue: '対応が必要なもの' },
    connectFirst: (url: string) =>
      `こんにちは、Fewmail です。この Telegram で、急ぎのメールが届いたらお知らせし、あなたの対応が必要なものを見せ、承認した返信を送ります。\n\nこのチャットはまだ Fewmail とつながっていません。1分で終わります：\n1. Fewmail の設定を開く：${url}\n2. 「連携」で「Telegram を接続」をタップ（Fewmail Pro の機能です）。\n3. Telegram がここに戻してくれるので、「開始」を押せば完了です。`,
    connected:
      '接続しました。緊急の連絡が届いたらすぐにお知らせします。\n\n/queue：対応が必要なもの',
    done: '完了',
    draft: '下書き：',
    edit: '編集',
    editPrompt:
      '代わりに使う文面を送るか、「/」に続けて変更方法を伝えてください。例：「/もっと丁寧に」',
    newDraft: '新しい下書き：',
    nothing: '今、対応が必要なものはありません。',
    proOnly:
      'Telegram は Fewmail Pro の機能です。アップグレードするには Fewmail の 設定 → プラン を開いてください。',
    draftClipped:
      'ここでは一部だけ表示しています。「送信」で下書き全文が送られます。全文は Fewmail で確認できます。',
    rewriting: '書き直し中…',
    send: '送信',
    sendThis: 'これを送信',
    shorter: '短く',
    skip: 'スキップ',
    skipped: 'スキップしました',
    somethingWrong: '問題が発生しました',
    urgent: '緊急',
    willSend: '送信内容：',
  },
  today: {
    working: '処理中…',
    allKinds: 'すべて',
    ruleOffer: {
      lead: 'エージェントが該当するメールに自動でこれを行えます。「はい」と言うまでオフのままです。',
      no: 'オフのまま',
      turnedOn: 'オンにしました。ルールで変更できます。',
      yes: 'オンにする',
    },
    newSender: {
      archive: '常にアーカイブ',
      archived:
        'この送信者からの新しいメールはアーカイブされます。「ルール」で変更できます。',
      keep: 'いつも通り残す',
      label: '新しい送信者',
      lead: (count: number, opened: number) =>
        `2週間で${count}通、${opened === 0 ? '開封なし' : `${opened}通を開封`}`,
    },
    readingNow: (total: number) =>
      `エージェントが新着メール${total}通を読んでいます`,
    allDone: 'すべて完了。対応が必要なものはありません。',
    allDoneLead:
      '新しいメールは引き続き読んでいます。対応が必要なものはここに表示されます。',
    allowanceSpent: (date: string) =>
      `今月のエージェント利用枠を使い切りました。要約と下書きは ${date} に戻ります。それまでも約束と期限は記録し続けます。`,
    byRules: (n: number) => `${n}件はルールで処理しました。`,
    decisions: '決めること',
    journal: {
      approved: 'あなたが承認',
      byRule: (rule: string) => `あなたのルール：${rule}`,
      failed: 'うまくいきませんでした',
      lead: '直近7日間。メールやカレンダーの変更はすべて、あなたの承認か、あなたがオンにしたルールによるものです。',
      title: 'メールで行ったこと',
    },
    progress: (done: number, total: number) => `${done} / ${total}`,
    readAll:
      'すべて読みました。あなたの承認なしにメールが変わることはありません。',
    worth: {
      awaiting: (total: number) =>
        plural('ja', total, {
          one: () => '返信待ち 1 件',
          other: (n) => `返信待ち ${n} 件`,
        }),
      dated: (total: number) =>
        plural('ja', total, {
          one: () => '日付あり 1 件',
          other: (n) => `日付あり ${n} 件`,
        }),
      important: (total: number) =>
        plural('ja', total, {
          one: () => '重要なメール 1 件',
          other: (n) => `重要なメール ${n} 件`,
        }),
    },
    worthKnowing: '知っておきたいこと',
    quick: 'すぐ済むもの',
    needsLook: '目を通すもの',
    tidy: {
      failed: (emails: string) =>
        `Gmail で${emails}を変更できませんでした。少ししてからもう一度お試しください。`,
      confirm: (emails: string) => `${emails}を片付けますか？`,
      running: '片付け中…',
      unsubscribeHint:
        'Fewmailが配信停止するメーリングリストが含まれており、配信停止は元に戻せません。',
      archive: (n: number) => `アーカイブ ${n} 件`,
      review: '確認する',
      reviewLead:
        '各メールと、エージェントが行う操作とその理由です。正しいものは承認し、そのままにしたいものは残してください。',
      reviewTitle: 'エージェントの提案を確認',
      done: (n: number) => `${n} 件を片付けました`,
      keep: '残す',
      mark_read: (n: number) => `既読にする ${n} 件`,
      run: 'すべて承認',
      total: (n: number) => `エージェントが片付けを提案したメール ${n} 件`,
      unsubscribe: (n: number) => `配信停止 ${n} 件`,
      untilYouApprove: '承認するまでメールは何も変わりません',
      spam: (n: number) => `迷惑メールへ ${n} 件`,
      trash: (n: number) => `削除 ${n} 件`,
    },
    pauseListening: '一時停止',
    resumeListening: '再開',
    awaiting: '返信待ち',
    hint: {
      messengers: {
        lead: '急ぎのメールの受け取りと下書きの承認を、いつものメッセンジャーで。',
        title: 'Telegram または WhatsApp',
      },
      notNow: '今はしない',
      setUp: '設定する',
      turnOn: 'オンにする',
    },
    dates: '日付と予定',
    done: '完了',
    firstRead:
      'まずは直近3日分のメールから。対応が必要なものはここに自動で表示されます。あなたが承認するまで何も変わりません。',
    approvedMany: (n: number) => `${n}件を承認しました`,
    listen: '聞く',
    handled: {
      spam: (n: number) => `${n} 件迷惑メール`,
      archived: (n: number) => `${n} 件アーカイブ`,
      markedRead: (n: number) => `${n} 件既読`,
      review: '確認',
      total: (n: number) => `${n} 件対応済み`,
      unsubscribed: (n: number) => `${n} 件配信停止`,
    },
    headline: (n: number) =>
      n === 0
        ? 'すべて落ち着いています。'
        : `対応が必要なものが ${n} 件あります。`,
    period: (days: number) => (days === 1 ? 'この1日' : `この${days}日`),
    pulse: {
      lists: (n: number) => `メーリングリストから${n}通`,
      people: (n: number) => `人から${n}通`,
      total: (n: number, period: string) => `${period}で${n}通`,
    },
    saved: (minutes: number) =>
      `今週 Fewmail が節約した時間: 約${formatMinutes('ja', minutes)}`,
    recent: (period: string) => `${period}のその他`,
    sent: '送信済み',
    codes: '認証コード',
  },
  bulk: {
    badge: (n: number) => `${n}人以上のFewmailユーザーに送信`,
    reason: (n: number) =>
      `一斉メール：${n}人以上のFewmailユーザーが同じ内容を受信`,
  },
  board: {
    lead: {
      coming: (total: number) =>
        plural('ja', total, {
          one: () => '期限が 1 件近づいています。',
          other: (n) => `期限が ${n} 件近づいています。`,
        }),
      empty:
        '未完了のものはありません。あなたへの約束、あなたの約束、期限はメールから自動でここに届きます。',
      owed: (amounts: string) => `受け取る予定: ${amounts}。`,
      promised: (total: number) =>
        plural('ja', total, {
          one: () => 'あなたは 1 件約束しています。',
          other: (n) => `あなたは ${n} 件約束しています。`,
        }),
      waiting: (total: number) =>
        plural('ja', total, {
          one: () => 'あなたへの約束が 1 件まだ未完了です。',
          other: (n) => `あなたへの約束が ${n} 件まだ未完了です。`,
        }),
    },
    section: {
      coming: '近づく期限',
      owed: '受け取る予定',
      promised: 'あなたの約束',
      settled: '最近完了',
    },
    state: {
      acknowledged: '返事あり、未完了',
      broken: '実現しなかった',
      cancelled: '取り消し',
      fulfilled: '完了',
      in_progress: '進行中',
      open: '待機中',
      overdue: '期限切れ',
    },
    by: (date: string) => `${date} まで`,
    lastDay: (date: string) => `最終日 ${date}`,
    done: '完了',
    forget: '忘れる',
    reopen: '再開',
    markedDone: '完了にしました',
    forgotten: '忘れました',
    reopened: '再開しました',
  },
  cleanup: {
    emails: (total: number) => `${total}件のメール`,
    reason: (total: number) => `今月${total}件、一度も開封なし`,
    title: (total: number) => `開いていないニュースレター${total}件を配信停止`,
  },
  clearOut: {
    partial:
      'Gmail が片付けの一部を止めました。すでに移動したメールは戻せます。',
    groups: {
      lists: '一度も開いていないメルマガ',
      notifications: '既読の通知（1か月より前）',
      old: '1年より前のすべて',
      promotions: '広告とソーシャル（3日より前）',
    },
    done: (emails: string) => `${emails}を片付けました`,
    empty: '片付けるものはありません。受信トレイは整っています。',
    lead: (emails: string) => `受信トレイに${emails}。片付けられるのはこちら。`,
    leadCapped: (emails: string) =>
      `受信トレイに${emails}以上。片付けられるのはこちら。`,
    left: (emails: string) => `受信トレイに残るのは${emails}`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} ほか${more}件` : names,
    run: (emails: string) => `${emails}を片付ける`,
    safe: '何も削除されません。片付けたメールは Fewmail/Cleared ラベル付きでアーカイブされ、ワンクリックで戻せます。メルマガは配信停止もします。',
    scanning: '受信トレイ全体をヘッダーだけ読み込んでいます。最大1分。',
    title: '受信トレイを片付ける',
    undo: 'すべて戻す',
    undone: (emails: string) => `${emails}を受信トレイに戻しました`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `いちばん多い曜日: ${day} · 時間帯: ${hours}`,
    copied: 'リンクをコピーしました',
    copyLink: 'リンクをコピー',
    cta: 'Fewmail で自分のものを',
    emails: '通のメールが届いた',
    empty: 'まだ振り返るほどメールがありません。数日後にまた見てください。',
    handled: 'Fewmail が自動で処理',
    people: 'よく届いた相手',
    period: { month: '今月', year: '今年' },
    replies: 'Fewmail が下書きして送信した返信',
    saveImage: '画像を保存',
    saved: 'Fewmail が節約した時間',
    shareNote:
      'リンクと画像にはこの数字だけが表示され、名前やアドレスは含まれません。',
    shared: { month: 'メールで振り返る1か月', year: 'メールで振り返る1年' },
    spam: '止めたスパム',
    split: (people: string, lists: string, other: string) =>
      `人から ${people} · メルマガから ${lists} · その他 ${other}`,
    title: { month: 'メールで振り返る今月', year: 'メールで振り返る今年' },
    unsubscribed: 'やめたメルマガ',
  },
  reading: {
    markAllRead: 'すべて既読にする',
    summary: 'メルマガの内容まとめ',
    worth: '全文を読む価値あり',
    leftOut: (n: number) => `まとめから除外: ${n}件（新しい内容なし）`,
    note: {
      inSummary: 'まとめに含む',
      leftOut: '除外',
    },
    digest: (n: number) => `メルマガ: ${n}件`,
    lead: '1日分のメルマガを1か所に。受信トレイを埋めません。',
    issues: 'すべての号',
    title: 'リーディング',
  },
  commitments: {
    title: 'あなたの約束',
  },
  headsUp: {
    deadline: 'もうすぐ期限',
    notYet: 'その後まだ届いていません',
    price: '値上がり',
    priceUp: (what: string, from: string, to: string) =>
      `${what}: ${from} → ${to}`,
    promised: 'あなたへの約束',
  },
  risk: {
    prompt_injection: (domain: string) =>
      `${domain} はこのメールに、メールを読むアシスタント向けの指示を隠しています。エージェントは無視します。転送したり、指示どおりにしたりしないでください。`,
    known_phishing: (domain: string) =>
      `${domain} は稼働中のフィッシングサイトの公開リストに載っています。リンクを開いたり、ログインや支払いをしたりしないでください。`,
    lookalike_domain: (domain: string) =>
      `${domain}に似ていますが、別のアドレスです。リンクを開いたり支払ったりしないでください。`,
    new_sender_payment: (domain: string) =>
      `${domain}からの初めてのメールで、支払いを求めています。信頼できる別の方法で確認してください。`,
    spoofed_sender: (domain: string) =>
      `${domain}を名乗っていますが、${domain}から送られたものではありません。リンクを開いたり支払ったりしないでください。`,
    payment_change: (domain: string) =>
      `${domain}から新しい支払い先の連絡です。支払う前に電話で確認してください。`,
    title: '対応する前に確認してください',
  },
  upgrade: {
    ask: 'メールに聞く',
    hints: {
      board:
        'Fewmail Pro に含まれます。エージェントがメールから、あなたへの約束、あなたの約束、期限を書き留め、完了するまで見守ります。',
      ask: 'Fewmail Pro の機能です。普段の言葉で何でも質問すると、あなた自身のメールから答えが返ってきます。',
      drafts:
        'Fewmail Pro の機能です。エージェントがあなたの文体で返信を書き、あなたが編集して送信します。',
    },
  },
  whatsapp: {
    phoneTaken:
      'この番号はすでに別の Fewmail アカウントに接続されています。先にそちらで WhatsApp の接続を解除してから（設定 → 連携）、もう一度メッセージを送ってください。',
    connectFirst: (url: string) =>
      `こんにちは、Fewmail です。この WhatsApp で、急ぎのメールが届いたらお知らせし、対応が必要なものを見せ、承認した返信を送ります。\n\nこの番号はまだ Fewmail に接続されていません。1 分で終わります:\n1. Fewmail の設定を開く: ${url}\n2. 連携で「WhatsApp を接続」をタップ(Fewmail Pro の機能です)。\n3. 用意されたメッセージ付きで WhatsApp が開くので、送信すれば完了です。`,
    connected:
      '接続しました。緊急のメールが届いたらお知らせします。テキストや音声メッセージで、どのメールにも返信できます。',
    proOnly:
      'WhatsApp は Fewmail Pro の機能です。アップグレードするには Fewmail の 設定 → プラン を開いてください。',
  },
  zombie: {
    badge: (share: number) => `${share}%の人の配信停止を無視しています`,
    reason: '配信停止後もメールを送り続けています',
  },
}
