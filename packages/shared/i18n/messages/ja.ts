import type { Rich } from '../locales'
import { formatMinutes } from '../locales'
import type { Messages } from './en'

export const ja: Messages = {
  actionKind: {
    cleanup: 'すべて配信停止',
    commitment: '完了',
    security: '確認しました',
    task: '送信',
    spam: '迷惑メールに移動',
    trash: 'ゴミ箱に移動',
    archive: 'アーカイブ',
    follow_up: 'フォローアップ',
    mark_read: '既読にする',
    pay: '支払う',
    read: '読む',
    reply: '返信',
    schedule: '予定に入れる',
    unsubscribe: '配信停止',
  },
  actionStatus: {
    auto_done: 'エージェントが対応済み',
    dismissed: 'スキップ',
    done: '完了',
    failed: '失敗',
    pending: '「今日」で待機中',
  },
  byRule: 'ルールによる',
  agent: {
    voice: '声で話す',
    voiceStop: '止めて送信',
    chats: 'チャット',
    autonomy: {
      ask: 'メールを送る前に毎回確認します',
      auto: (most: number) =>
        `確認せずに自分でメールを送ります（最大 ${most} 通）`,
    },
    calendar: (email: string) => `${email} のカレンダー`,
    cc: (recipients: string) => `CC: ${recipients}`,
    confirm: {
      create_schedule: 'これをスケジュールで実行しますか？',
      create_event: 'この予定を追加しますか？',
      delete_event: 'この予定を削除しますか？',
      update_event: 'この予定を変更しますか？',
      approve_action: 'この操作を実行しますか？',
      archive_thread: 'このスレッドをアーカイブしますか？',
      clear_out: '受信トレイからこれらのメールを片付けますか？',
      undo_clear_out: '片付けたメールをすべて受信トレイに戻しますか？',
      create_rule: 'このルールを追加しますか？',
      handle_thread: 'このスレッドをエージェントに任せますか？',
      reply: 'この返信を送信しますか？',
      send_email: 'このメールを送信しますか？',
      snooze_thread: 'このスレッドをスヌーズしますか？',
      unsubscribe: 'この送信者の配信を停止しますか？',
      trash_thread: 'このスレッドをゴミ箱に移動しますか？',
      report_spam: 'この送信者を迷惑メールとして報告しますか？',
      mark_not_spam: 'このスレッドを迷惑メールから戻しますか？',
      move_to_inbox: 'このスレッドを受信トレイに戻しますか？',
    },
    decline: 'やめる',
    declined: 'キャンセルしました',
    detach: 'このメールを添付しない',
    deleteChat: 'チャットを削除',
    failed:
      'エージェントが最後まで完了できませんでした。もう一度お試しください。',
    lead: 'メールについて質問したり、してほしいことを伝えてください。送信や Gmail の変更は、必ずあなたの確認を待ちます。',
    newChat: '新しいチャット',
    noChats: 'チャットはまだありません',
    cancelEdit: '編集をキャンセル',
    copy: 'コピー',
    edit: '編集',
    editing: 'メッセージを編集中',
    regenerate: 'もう一度回答',
    skills: 'スキル',
    placeholder: 'メールについて質問するか、/ でスキルを選択',
    retry: '再試行',
    send: '送信',
    steps: {
      create_schedule: 'スケジュールを設定中',
      delete_schedule: 'スケジュールを停止中',
      list_schedules: 'スケジュールを確認中',
      create_event: '予定を追加中',
      delete_event: '予定を削除中',
      list_events: 'カレンダーを確認中',
      update_event: '予定を変更中',
      list_subscriptions: '購読を確認中',
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
      get_board: 'ボードを読込中',
      get_person: '相手を確認中',
      get_today: '今日の状況を確認中',
      handle_thread: 'スレッドを引き渡し中',
      list_boards: 'ボードを開いています',
      list_handled: '処理済みを確認中',
      list_mail: 'メールを検索中',
      list_rules: 'ルールを確認中',
      read_thread: 'スレッドを読込中',
      redraft_action: '下書きを書き直し中',
      refresh: '新着メールを確認中',
      send_email: '送信中',
      snooze_thread: 'スヌーズ中',
      unsubscribe: '配信停止中',
      trash_thread: 'ゴミ箱に移動中',
      report_spam: '迷惑メールを報告中',
      mark_not_spam: '迷惑メールから戻し中',
      move_to_inbox: '受信トレイに移動中',
      create_board: 'ボードを作成中',
      update_board: 'ボードを変更中',
      delete_board: 'ボードを削除中',
      add_board_chart: 'グラフを追加中',
      add_to_board: 'ボードに追加中',
      edit_board_entry: '項目を修正中',
      remove_board_entry: 'ボードから外し中',
      rename_board_group: 'グループ名を変更中',
    },
    stop: '停止',
    thinking: '考え中…',
    title: '何をお手伝いしましょうか？',
    to: (recipients: string) => `宛先: ${recipients}`,
    until: (time: string) => `再表示: ${time}`,
    yes: {
      create_schedule: 'スケジュールする',
      create_event: '追加',
      delete_event: '削除',
      update_event: '保存',
      approve_action: '実行',
      archive_thread: 'アーカイブ',
      clear_out: '片付ける',
      undo_clear_out: '戻す',
      create_rule: '追加',
      handle_thread: '任せる',
      reply: '送信',
      send_email: '送信',
      snooze_thread: 'スヌーズ',
      unsubscribe: '配信停止',
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
    backInQueue: 'キャンセルしました。下書きは「今日」に戻りました。',
    canceled: 'キャンセルしました。メールはエディタに戻りました。',
    cc: 'Cc',
    discard: '破棄',
    draftSaved: '下書きを保存しました',
    saveDraft: '下書きを保存',
    forward: '転送',
    forwardedMessage: '転送されたメッセージ',
    from: '差出人',
    instructionPlaceholder: 'どんな文面にしますか？（任意）',
    invalidRecipients: '有効なメールアドレスを1つ以上追加してください。',
    later: {
      inHour: '1時間後',
      monday: '月曜日の朝',
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
    commandsOnly: 'コマンドを実行…',
    rewriteBrief: 'ブリーフを書き直す',
    teachRule: '新しいルールを教える',
    upgrade: 'Pro にアップグレード',
    theme: {
      dark: 'ダークテーマ',
      light: 'ライトテーマ',
      system: 'システムに合わせる',
    },
  },
  importance: ['ノイズ', '知っておくと良い', '近いうちに対応', '緊急'],
  justNow: 'たった今',
  errors: {
    failed: '問題が発生しました。もう一度お試しください。',
    needsPro: 'これには Fewmail Pro が必要です。',
    alreadySent: 'すでに送信済みのため、取り消せません。',
    notFound: 'これはもう存在しません。削除された可能性があります。',
    offline: 'Fewmail に接続できません。接続を確認してください。',
  },
  update: {
    available: 'Fewmail の新しいバージョンがあります。',
    reload: '再読み込み',
  },
  keys: {
    restore: '受信トレイへ',
    calendarToday: '今日',
    newEvent: '新しい予定',
    period: '前へ / 次へ',
    view: '表示',
    group: 'グループ',
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
    move: '移動',
    open: '開く',
    notOnBoard: 'このボードに含めない',
    rename: '名前を変更',
    clearFilter: 'フィルターを解除',
    search: '検索',
    send: '送信',
    skip: 'スキップ',
    stopEditing: '編集を終了',
  },
  legal: {
    privacy: 'プライバシーポリシー',
    englishOnly: 'この文書は英語で提供されており、英語版が正式な版となります。',
    terms: '利用規約',
    updated: (date: string) => `最終更新日：${date}`,
  },
  limits: {
    boards: (total: number) =>
      `現在のプランのボードは ${total} 個までです。1 つ削除するか、設定 → プランで Max に切り替えてください。`,
    messages: (date: string) =>
      `今月のエージェントへのメッセージを使い切りました。${date} に戻ります。`,
    tasks: (total: number) =>
      `現在のプランで同時に任せられるスレッドは ${total} 件です。1 件終わるのを待つか、設定 → プランで Max に切り替えてください。`,
  },
  login: {
    agree: ((slots) => [
      '続行すると、',
      slots.terms,
      'と',
      slots.privacy,
      'に同意したことになります。',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail は、あなたに代わって Gmail を読み、整理し、送信する権限をリクエストします。許可するルールを書かない限り、あなたの承認なしに送信やアーカイブは行いません。 Google カレンダーへのアクセスも求めますが、チェックを外せます。',
    continue: 'Google で続行',
    lead: 'Fewmail があなたの代わりに受信トレイを読み、あなたらしい文面で返信し、本当に必要なものだけをお見せします。',
    messengers:
      'メッセンジャーでも使えます（まずは Telegram から）。ブリーフを受け取り、返信を承認し、音声メッセージで指示することもできます。',
    title: '大切なメールだけを。',
  },
  mail: {
    openUnsubscribePage: 'ページを開く',
    unsubscribeYourself:
      'このリストの配信停止はページで手続きが必要です。それまでメールはアーカイブします。',
    allMailboxes: 'すべてのメールボックス',
    group: {
      category: 'カテゴリ',
      importance: '重要度',
      none: 'グループなし',
      sender: '送信者',
      title: 'グループ化',
    },
    unread: '未読',
    block: '送信者をブロック',
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
    noThread: 'メールを選ぶとここで読めます',
    deleteDraft: '下書きを削除',
    notSent: '未送信。開いて再試行',
    noRecipients: '宛先なし',
    notSpam: '迷惑メールではない',
    reportSpam: '迷惑メールとして報告',
    reportedSpam: '報告しました。今後のメールは迷惑メールに移動します。',
    archive: 'アーカイブ',
    archived: 'アーカイブしました',
    attachment: '添付ファイル',
    draftReply: '返信を下書き',
    drafting: '下書き中…',
    draftWaiting: '下書きが「今日」で待っています',
    due: (date: string) => `期限 ${date}`,
    dueHint: 'エージェントがこのメールで見つけた期限',
    empty: 'メールはありません',
    emptyHint: '新しいメールが届くとここに表示されます。',
    expectsReply: '返信待ち',
    filter: {
      archive: 'アーカイブ',
      trash: 'ゴミ箱',
      drafts: '下書き',
      spam: '迷惑メール',
      inbox: '受信トレイ',
      snoozed: 'スヌーズ中',
      important: '重要',
      needs_reply: '要返信',
      quiet: '静か',
    },
    instruction: '返信の方針を伝えるか、そのまま Enter を押してください',
    open: '開く',
    openInGmail: 'Gmail で開く',
    search: '検索または説明：先月の Anna からの請求書',
    unsubscribe: '配信停止',
    unsubscribed: '配信を停止しました',
    unsubscribeFailed:
      'この送信者はワンクリック配信停止に対応していないため、メールをアーカイブしました。',
    you: 'あなた',
  },
  subscriptions: {
    archivedOnly:
      'この送信者はワンクリック配信停止に対応していないため、メールをアーカイブしました。今後も届く場合は迷惑メールに移動します。',
    count: (total: number) => `メーリングリスト${total}件`,
    empty: '今月メールを送ってきたメーリングリストはありません。',
    lead: '今月メールを送ってきたメーリングリスト（多い順）。配信停止すると送られたメールはすべてアーカイブされ、2週間後も届くメールは迷惑メールに移動します。',
    opened: (total: number) => (total === 0 ? '開封なし' : `${total}件開封`),
    title: '購読',
    unsubscribe: '配信停止',
    unsubscribed: '配信停止しました',
  },
  nav: {
    calendar: 'カレンダー',
    subscriptions: '購読',
    agent: 'エージェント',
    boards: 'ボード',
    newBoard: '新しいボード',
    mail: 'メール',
    reading: 'リーディング',
    rules: 'ルール',
    search: '検索または質問…',
    settings: '設定',
    syncFailed: 'Gmail の同期に失敗しました。再試行中',
    syncing: '受信トレイを読んでいます…',
    today: '今日',
    trialLeft: (total: number) => `Pro トライアル · 残り ${total} 日`,
    usage: (percent: number) => `エージェント · 今月の ${percent}% を使用`,
    watching: 'エージェントが受信トレイを見守っています',
  },
  schedule: {
    awaitsAnswer:
      '今回の実行はスキップしました。前回の実行がこのチャットであなたの返答を待っています。',
    failed: 'このスケジュール実行は失敗しました。次回もう一度試します。',
    limitReached: (day: string) =>
      `今月のメッセージを使い切ったため、次の日付まで実行をスキップします: ${day}`,
    open: 'Fewmail で開く',
    stopped:
      'このスケジュールは3回連続で失敗したため停止しました。また必要になったら設定し直すよう頼んでください。',
  },
  notifications: {
    many: (n: number) => `Fewmail から ${n} 件のお知らせ`,
  },
  onboarding: {
    boardsHint: (max: number) =>
      `エージェントがメールから自動でまとめるページです。直近半年分から始めます。${max} 件まで選べます。自分のボードは後から追加できます。`,
    boardsTitle: 'エージェントに何を集めてもらいますか？',
    languageHint:
      'アプリ、ブリーフ、要約、説明にこの言語を使います。返信は常に、返信するメールの言語に合わせます。',
    languageTitle: 'Fewmail は何語で話しましょうか？',
    lead: '2つの簡単な質問です。すべて後から設定で変更できます。',
    reading: '受信トレイを読んでいます…',
    start: '始める',
    title: 'エージェントを設定しましょう。',
  },
  plan: {
    free: 'Free',
    freeDescription:
      'シンプルなルールで、速く落ち着いたメールを。好きなだけ無料で使えます。',
    includes:
      'Pro ではエージェントが加わります：毎日のブリーフ、すべてのメールの読み取りと要約、あなたの口調での返信の下書き、自然な言葉で書けるルール、Telegram と MCP。',
    manage: '支払いを管理',
    price: (usd: number) => `$${usd} / 月`,
    priceYearly: (usd: number) => `$${usd} / 年`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `毎月 ${emails} 通のメールと ${messages} 件のメッセージ。ボードと任せたスレッドは無制限。`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `毎月 ${emails} 通のメールと ${messages} 件のメッセージ。`,
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
    emailsUsed: (used: string, total: string) => `メール ${used} / ${total}`,
    messagesUsed: (used: string, total: string) =>
      `メッセージ ${used} / ${total}`,
    trialDescription: (date: string) =>
      `${date}までProの全機能、その後は無料。カード不要。`,
    upgrade: '他のプラン',
    usage: '今月',
  },
  queue: {
    askedByYou: 'あなたの依頼',
    draftedInVoice: 'あなたらしい文面で下書きしました',
    edit: '編集',
    open: '開く',
    send: '送信',
    shorter: '短く',
    shorterInstruction: 'もっと短くしてください。',
    skip: 'スキップ',
  },
  reminders: {
    followUp: 'フォローアップ',
    noReply: 'まだ返信なし',
  },
  rules: {
    add: 'ルールを追加',
    count: (n: number) => `${n} 件のルール`,
    delete: '削除',
    describe: {
      alwaysShow: '常に「今日」に表示',
      autonomous: '自動で実行し、対応済みに表示',
      draft: '下書きが「今日」で待っています',
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
    lead: '特定のメールをどう扱うか、普段の言葉でエージェントに伝えてください。エージェントはすべてのメールを、これらのルールに上から順に照らし合わせます。',
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
    readingDigest: {
      description:
        'ブリーフの後、その日のメルマガを Telegram と WhatsApp にひとつのメッセージで届けます。',
      title: 'メルマガのダイジェスト',
    },
    voiceBrief: {
      description:
        'ブリーフを Telegram と WhatsApp に音声メッセージでも届けます。',
      title: '音声ブリーフ',
    },
    forward: {
      copy: 'アドレスをコピー',
      description:
        '自分のメールボックスからこのアドレスにメールを送信または転送し、上にやってほしいことをメモしてください。返事は Telegram か WhatsApp と、ここのチャットに届きます。',
      title: 'エージェントに転送',
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
    schedules: {
      delete: '削除',
      description:
        '「毎週金曜 17:00 に今週の請求書をまとめて」のように、定期的に行うことをチャットでエージェントに頼めます。実行のたびに専用のチャットに届き、送信したいものはそこで承認します。',
      title: 'スケジュール',
    },
    snippets: {
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
    briefDescription: (timezone: string) =>
      `あなたのタイムゾーン（${timezone}）で`,
    briefTitle: 'デイリーブリーフ',
    deleteAccount: 'アカウントを削除',
    deleteConfirm: 'すべて削除',
    deleteDescription:
      'アカウント、同期したメール、下書き、ルール、ブリーフを Fewmail からすぐに削除します。Gmail 自体には影響しません。',
    deleteTitle: 'Fewmail アカウントを削除しますか？',
    cancel: 'キャンセル',
    integrations: '連携',
    language: '言語',
    languageDescription:
      'アプリ、ブリーフ、要約に使います。返信はメールの言語に合わせます。',
    legal: '法的情報',
    mailboxes: {
      add: 'Gmailを追加',
      addDescription:
        '別のGmailアカウントのメールも同じ「今日」と受信トレイに届きます。このアカウントでここにログインすることはできません。ログインすると別のFewmailが開きます。',
      added: 'メールボックスを追加しました。1分ほどでメールが表示されます。',
      failed:
        'メールボックスを追加できませんでした。Gmailへのアクセスを許可して、もう一度お試しください。',
      lost: 'Gmailへのアクセスが失われました。再接続するにはもう一度追加してください。',
      reading: 'メールを読み込み中…',
      remove: '削除',
      signIn: 'ログインに使うアカウント',
      signInChosen:
        'それはログインに使っているアカウントです。別のアカウントを選んでください。',
      synced: (ago: string) => `${ago}に同期`,
      title: 'メールボックス',
    },
    mcp: {
      allow: '許可',
      connected: (ago: string) => `${ago}に接続`,
      copy: 'URLをコピー',
      defaultName: 'MCP クライアント',
      deny: '拒否',
      description:
        'ブリーフとメールの閲覧、返信の下書き、あなたの確認後の送信ができます。',
      disconnect: '接続を解除',
      paste:
        'このURLをアプリのコネクタとして追加し、Fewmailにサインインしてください。',
      request: (app: string) => `${app}がFewmailへのアクセスを求めています`,
      title: 'Claude、Cursor、その他の MCP クライアントを接続',
    },
    signedInWithGoogle: 'Google でログイン中',
    signOut: 'ログアウト',
    notifications: {
      blocked:
        '通知がブロックされています。ブラウザのサイト設定で許可してください。',
      browser: 'このブラウザ',
      notConfigured: 'このサーバーではブラウザ通知が設定されていません。',
      off: 'Fewmail を閉じていても、緊急のメールとデイリーブリーフをここで受け取れます。',
      on: '緊急のメールとデイリーブリーフがここに届きます。同時に複数届いたときは 1 件にまとめます。',
      title: '通知',
      unsupported: 'このブラウザは通知を表示できません。',
    },
    telegram: {
      connect: 'Telegram を接続',
      disconnect: '接続を解除',
      linked:
        'ブリーフは毎朝、緊急のメールはすぐに届きます。下書きの承認や編集もチャットからできます。',
      notConfigured: 'このサーバーでは Telegram ボットが設定されていません。',
      unlinked: 'Telegram でブリーフを受け取り、下書きを承認できます。',
    },
    whatsapp: {
      connect: 'WhatsApp を接続',
      disconnect: '接続を解除',
      linked:
        'ブリーフは毎朝、緊急のメールはすぐに届きます。下書きの承認や編集もチャットからできます。',
      notConfigured: 'このサーバーでは WhatsApp ボットが設定されていません。',
      unlinked: 'WhatsApp でブリーフを受け取り、下書きを承認できます。',
    },
    title: '設定',
  },
  site: {
    chapters: {
      pricing: {
        description:
          '仕分け、ルール、保護機能はずっと無料。Pro と Max では、メールを読み、書いてくれる機能がすべて加わります。Max は、それをもっとたくさんこなすだけです。',
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
        'メールの送信や Gmail の変更は、必ず先にあなたの承認を求めます。メールがモデルの学習に使われることはなく、どのアプリも設定から切断できます。',
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
        brief: '毎日のブリーフ',
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
        brief: 'あなたの言語で、Pro で',
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
          'SaneBox はメールをフォルダに仕分け、最上位プランでは下書きと要約もします。Fewmail は先にすべてを読み、ひとつのブリーフと、あなたにしかできない少しの判断だけを渡します。',
        them: {
          brief: 'フィルターされたメールの毎日のダイジェスト',
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
          '下書きは、返信するメールと同じ言語で書かれます。アプリ、ブリーフ、Telegram ボットは、15 言語から選んだひとつの言語で話します。',
        question: '対応している言語は？',
      },
      {
        answer:
          '現在は Gmail と Google Workspace のアカウントに対応しています。ひとつの Fewmail に複数のメールボックスを追加すれば、すべてのメールが同じブリーフと受信トレイに届きます。',
        question: 'どのメールアカウントで使えますか？',
      },
    ],
    features: {
      description:
        '以前は午後いっぱいかかっていたメールの作業を、裏側で片づけ、確認できる場所に一覧で残します。',
      items: {
        ask: {
          description:
            '普段の言葉で何でも聞けば、あなた自身のメールから答えが返ってきます。根拠になったメールも一緒に。',
          title: 'メールに聞く',
        },
        boards: {
          description:
            'お金、有料サブスク、旅行、注文。追跡したいものを書けば、エージェントが半年分のメールから集め、グラフにまとめます。',
          title: 'ボード',
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
        forward: {
          description:
            '「来週、この人たちと時間を合わせて」とひとこと添えてメールを転送すれば、あとはエージェントが引き受けます。',
          title: 'エージェントに転送',
        },
        handle: {
          description:
            'ゴールを伝えてスレッドを任せれば、エージェントが最後まで進めます。送信の前には毎回確認します。',
          title: 'これを任せる',
        },
        reading: {
          description:
            'その日のメルマガを静かなリストひとつにまとめ、それぞれ数文で要約します。',
          title: 'リーディング',
        },
        voice: {
          description:
            'ブリーフは Telegram、WhatsApp、アプリで聞けます。ボットには音声メッセージで返事ができます。',
          title: 'ブリーフを聞く',
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
        'Gmail を読んで、あなたが必要なものだけを見せるメールエージェント。',
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
          fix: 'キーひとつで、人がやるのと同じ方法で配信停止します。ワンクリック、配信停止ページ、またはメールで。それでも送ってくる送信者は迷惑メールに直行です。',
          problem: '登録した覚えのないメルマガ。',
        },
        {
          fix: 'リーディングが、その日のメルマガをひとつのリストに集め、それぞれ数文で要約します。',
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
          fix: 'Telegram や WhatsApp に届くのは急ぎのメールだけ。残りは朝のブリーフで待っていて、ブリーフは音声でも聞けます。',
          problem: '念のため、夕食中もメールを確認すること。',
        },
      ],
      title: 'メールの悩みは、もう過去のもの。',
    },
    hero: {
      brief: {
        emphasis: 'あなたの出番',
        lead: (handled: string) =>
          `Anna は契約書を待っていて、Northwind の請求書は来週が支払期限、Marco は木曜に時間を取りたいそうです。ニュースレターと通知 ${handled} 通は対応済みです。`,
        tag: '木曜日のブリーフ · 08:00',
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
      lead: 'メルマガ、レシート、通知、フィッシングリンク。そしてそのどこかに、本当に大事な 3 通のメール。Fewmail は、そのすべてをあなたの代わりに読むエージェントです。',
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
      today: '今日',
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
      everythingIn: (plan: string) => `${plan} のすべてに加えて`,
      forever: 'ずっと',
      free: {
        description: '仕分け、ルール、保護。ずっと無料。',
        features: [
          'すべてのメールを仕分けし、重要度を判定',
          'アーカイブ、既読、配信停止をこなす、普段の言葉で書くルール',
          'コミュニティ迷惑メールシールドとフィッシング警告',
          '配信停止後も送ってくるゾンビ送信者を検出',
          '返信を待っているメールに自動でフォローアップ',
          'スヌーズ、スニペット、Gmail の Fewmail ラベル',
        ],
      },
      max: {
        description: '同じエージェントを、忙しい受信トレイのために。',
        emails: (emails: string) => `毎月 ${emails} 通のメールを読む`,
        messages: (messages: number) =>
          `エージェントへのメッセージ 毎月 ${messages} 件`,
        unlimited: 'ボードと任せたスレッドは無制限',
      },
      monthly: '月払い',
      per: { month: '/ 月', year: '/ 年' },
      pro: {
        description: 'エージェントのすべて：読み、書き、覚える。',
        features: [
          '今日：毎日のブリーフと、判断のためのキューがひとつ',
          'あなたの口調で返信を下書きし、承認したときだけ送信',
          'Telegram：ブリーフ、承認、音声での指示',
          '「これを任せる」：エージェントがスレッドを目的まで進める',
          '約束と相手のことを記憶。お金など追跡したいものはグラフ付きのボードに',
          'メールに何でも質問。自分のツール向けの MCP も',
        ],
        limits: (emails: string, messages: number) =>
          `毎月 ${emails} 通のメール読み取りと、エージェントへの ${messages} 件のメッセージ。ノイズはカウントされません`,
      },
      tryFree: (days: number) => `${days} 日間無料で試す`,
      yearly: '年払い · 2 か月分無料',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `仕分け、普段の言葉で書くルール、保護機能はずっと無料。Pro は、あなたの代わりに読み、書き、覚えるエージェントです。Max は同じエージェントに、忙しい受信トレイのための余裕を加えたもの。どのアカウントも Pro の ${trialDays} 日間から始まり、終わったらそのまま Free に移るだけです。`,
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
    listen: '🔊 聞く',
    heard: (text: string) => `聞き取った内容：「${text}」`,
    voiceFailed:
      'うまく聞き取れませんでした。もう一度話すか、入力してください。',
    help: '必要なことを書くか話してください：\n• メールについて質問：「Netflixの更新日はいつ？」\n• 返信内容を伝える：「アンナに明日署名すると伝えて」\n• 下書きを変えるには、その下書きに返信',
    canceled: 'キャンセルしました。下書きはキューに戻りました。',
    sendingIn: (seconds: number) => `${seconds}秒後に送信`,
    undo: '元に戻す',
    commands: { brief: '今日のブリーフ', queue: '対応が必要なもの' },
    connectFirst:
      '先に Fewmail → 設定 → 連携 を開き、「Telegram を接続」をタップしてください。',
    connected:
      '接続しました。毎朝ブリーフをお送りし、緊急の連絡が届いたらすぐにお知らせします。\n\n/brief：今日のブリーフ\n/queue：対応が必要なもの',
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
    awaiting: '返信待ち',
    hint: {
      notNow: '今はしない',
      setUp: '設定する',
      turnOn: 'オンにする',
    },
    later: (total: number, time: string) => `${time}にあと${total}件届きます`,
    briefAt: (time: string) => `毎日 ${time} のブリーフ`,
    dates: '日付と予定',
    done: '完了',
    firstRead:
      '直近3日分のメールを読んでいます。対応が必要なものはここに自動で表示されます。',
    approvedMany: (n: number) => `${n}件を承認しました`,
    listen: 'ブリーフを聞く',
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
    nothingNeedsYou:
      '今、対応が必要なものはありません。新しいメールは届いた瞬間に読みます。',
    period: (days: number) => (days === 1 ? 'この1日' : `この${days}日`),
    pulse: {
      lists: (n: number) => `メーリングリストから${n}通`,
      people: (n: number) => `人から${n}通`,
      total: (n: number, period: string) => `${period}で${n}通`,
    },
    saved: (minutes: number) =>
      `今週 Fewmail が節約した時間: 約${formatMinutes('ja', minutes)}`,
    savedHow: (handled: number, replies: number) =>
      `自動で処理: ${handled} · 下書きから送信した返信: ${replies}`,
    recent: (period: string) => `${period}のその他`,
    sent: '送信済み',
    worthAttention: '目を通す価値あり',
    writing: '作成中…',
  },
  boards: {
    addTo: 'ボードに追加',
    added: (board: string) => `${board}に追加しました`,
    cancel: 'キャンセル',
    chart: {
      add: 'グラフを追加',
      ask: 'どんなグラフか説明',
      askPlaceholder: 'ショップ別の支出、ステータス別の注文…',
      currency: '通貨',
      edit: 'グラフの設定',
      empty: 'まだ表示できるデータがありません',
      groupBy: 'まとめ方',
      groupings: {
        group: '相手・対象',
        month: '月',
        status: 'ステータス',
        week: '週',
      },
      measure: '表示する値',
      measures: { count: '件数', sum: '合計金額' },
      moveEarlier: '前へ移動',
      moveLater: '後ろへ移動',
      other: 'その他',
      remove: 'グラフを削除',
      skipped: (n: number) => `集計外: ${n}件(別の通貨または金額なし)`,
      title: 'グラフのタイトル',
      type: 'グラフの種類',
      types: {
        area: 'エリア',
        bar: '棒',
        line: '折れ線',
        pie: '円',
      },
      untitled: '新しいグラフ',
      weekOf: (date: string) => `${date}の週`,
    },
    charts: 'グラフ',
    create: 'ボードを作成',
    delete: 'ボードを削除',
    deleteConfirm: (name: string) => `「${name}」を削除しますか？`,
    deleteHint: '項目とグラフも一緒に削除されます。メールはそのまま残ります。',
    describe: '集める内容を変更',
    description: '集める内容',
    descriptionPlaceholder: '旅行：航空券、ホテル、レンタカーとその費用',
    due: (when: string) => `次の日付: ${when}`,
    empty: 'まだ空です。当てはまるメールが届くとここに表示されます。',
    emptyQuery: '次の条件に合うメールを探します',
    entries: (n: number) => `${n}件`,
    entry: {
      amount: '金額',
      currency: '通貨',
      date: '日付',
      edit: '項目を編集',
      edited: 'あなたが編集',
      group: '相手・対象',
      next: '次の日付',
      nextOn: (date: string) => `次回 ${date}`,
      remove: 'このボードに含めない',
      removed: 'ボードから外しました。次からはこれを踏まえます。',
      status: 'ステータス',
      title: 'タイトル',
    },
    expected: (when: string) => `${when}予定`,
    filter: {
      clear: 'フィルターを解除',
      nothing: '一致する項目はありません。',
      search: '項目を検索',
    },
    groups: {
      every: {
        month: '毎月',
        quarter: '四半期ごと',
        week: '毎週',
        year: '毎年',
      },
      expected: (date: string) => `${date}予定`,
      next: (date: string) => `次回 ${date}`,
      perMonth: (amount: string) => `${amount} / 月`,
      rename: 'グループ名を変更',
      renameHint: '別のグループと同じ名前にすると、2つがまとまります。',
      showAll: (n: number) => `${n}件すべて表示`,
      showFewer: '表示を減らす',
      title: '相手・対象別',
    },
    history: {
      capped: (n: number) => `過去6か月で条件に合う最新の${n}件を読みました。`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? '過去6か月のメールを確認しています…'
          : `過去6か月のメール${found}件を読んでいます · これまでに${entries}件`,
    },
    menu: 'ボードの操作',
    moveDown: '下へ移動',
    moveUp: '上へ移動',
    name: '名前',
    namePlaceholder: '旅行',
    new: '新しいボード',
    newHint:
      '集めたいものを自分の言葉で書いてください。Fewmail が過去6か月のメールから探し出し、グラフを選び、最新の状態に保ちます。',
    planning: '準備しています…',
    redescribe: '保存して読み直す',
    redescribeHint:
      '新しい説明で過去6か月を読み直します。編集した項目や外した項目はそのまま残ります。',
    rename: 'ボード名を変更',
    save: '保存',
    settings: {
      bannerDays: '日付の前のお知らせ',
      days: (n: number) => `${n}日前`,
      hint: 'ボードがメールを探す方法と、お知らせするタイミング。',
      never: 'なし',
      query: 'Gmail の検索条件',
      queryHint: '変更すると過去6か月を読み直します。',
      title: '検索とお知らせ',
    },
    starter: {
      events: {
        description: 'チケット、予約、アポイント：どこに、いつ、誰と行くか。',
        name: '予定',
      },
      health: {
        description:
          '診察、処方箋、検査結果、保険請求：誰に、いつ診てもらい、いくらかかったか。',
        name: '健康',
      },
      home: {
        description:
          '家賃、光熱費、修理、住まいの契約：何の支払いが、誰に、いくら必要か。',
        name: '住まい',
      },
      invoices: {
        description:
          '仕事で発行・受領する請求書：取引先、金額、支払期日、支払い済みかどうか。',
        name: '仕事の請求書',
      },
      jobs: {
        description:
          '応募、面接、内定：どの会社の、どの職種で、それぞれ今どの段階か。',
        name: '転職活動',
      },
      learning: {
        description:
          '講座、授業、学校や大学からのメール：締め切り、成績、修了証、費用。',
        name: '学び',
      },
      money: {
        description:
          '支払い、サブスクリプション、請求書、返金：何に、誰に、いくら払っているか。',
        name: 'お金',
      },
      orders: {
        description: 'オンライン注文と配送：何をどこで買い、今どこにあるか。',
        name: '注文',
      },
      subscriptions: {
        description:
          '定期的に支払っているサービス：それぞれの料金、頻度、次の更新日。',
        name: '有料サブスク',
      },
      trips: {
        description:
          'フライト、列車、ホテル、レンタル：どこへ、いつ、いくらかかるか。',
        name: '旅行',
      },
    },
    summary: {
      lastMonth: '先月',
      perMonth: (amount: string) => `月${amount}`,
      recurring: (n: number) => `定期 ${n}件`,
      thisMonth: '今月',
      upcoming: '30日以内',
    },
  },
  bulk: {
    badge: (n: number) => `${n}人以上のFewmailユーザーに送信`,
    reason: (n: number) =>
      `一斉メール：${n}人以上のFewmailユーザーが同じ内容を受信`,
  },
  cleanup: {
    emails: (total: number) => `${total}件のメール`,
    reason: (total: number) => `今月${total}件、一度も開封なし`,
    title: (total: number) => `開いていないニュースレター${total}件を配信停止`,
  },
  clearOut: {
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
    busiest: (day: string, hour: string) =>
      `いちばん多いのは${day}の${hour}ごろ`,
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
    split: (people: string, lists: string) =>
      `人から ${people} · メルマガから ${lists}`,
    title: { month: 'メールで振り返る今月', year: 'メールで振り返る今年' },
    unsubscribed: 'やめたメルマガ',
  },
  forward: {
    done: '転送されたメール',
  },
  reading: {
    digest: (n: number) => `今日のメルマガ: ${n}件`,
    empty: '直近1日にメルマガはありません。',
    lead: '直近1日のメルマガを1か所に。受信トレイを埋めません。',
    title: 'リーディング',
  },
  commitments: {
    title: 'あなたの約束',
  },
  people: {
    firstContact: (date: string) => `${date}からやり取り`,
    lastContact: (date: string) => `最後のメール：${date}`,
    open: '他のスレッドで保留中',
    promised: 'あなたの約束',
    threads: (total: number) => `${total}件の会話`,
  },
  risk: {
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
  tasks: {
    active: (goal: string) => `エージェントが対応中：${goal}`,
    auto: '確認なしでメールを送信',
    autoHint: '各メールは数秒待機するので、取り消せます。',
    cancel: '停止',
    done: 'タスク完了',
    goal: 'エージェントに何を達成してほしいですか？',
    goalPlaceholder: '例：新しい住所で請求書を再送してもらう',
    handle: 'これを任せる…',
    next: '次のステップ',
    start: '開始',
    started: 'エージェントが対応中です。',
  },
  whatsapp: {
    connectFirst:
      '先に Fewmail → 設定 → 連携 を開き、「WhatsApp を接続」をタップしてください。',
    connected:
      '接続しました。毎朝ブリーフを送り、緊急のメールが届いたらお知らせします。テキストや音声メッセージで、どのメールにも返信できます。',
    proOnly:
      'WhatsApp は Fewmail Pro の機能です。アップグレードするには Fewmail の 設定 → プラン を開いてください。',
  },
  zombie: {
    badge: (share: number) => `${share}%の人の配信停止を無視しています`,
    reason: '配信停止後もメールを送り続けています',
  },
}
