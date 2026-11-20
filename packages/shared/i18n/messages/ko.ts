import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const ko: Messages = {
  actionDone: {
    heads_up: '알겠어요',
    commitment: '완료',
    confirm: '확인했어요',
    follow_up: '후속 조치했어요',
    pay: '결제했어요',
    read: '읽었어요',
    renew: '갱신했어요',
    schedule: '일정 잡았어요',
    security: '확인했어요',
    sign: '서명했어요',
  },
  actionLink: {
    confirm: '확인',
    pay: '결제',
    read: '읽기',
    renew: '갱신',
    sign: '서명',
  },
  actionKind: {
    heads_up: '알림',
    cleanup: '모두 구독 취소',
    consent: '승인',
    commitment: '약속',
    security: '확인하기',
    spam: '스팸으로 이동',
    trash: '휴지통으로 이동',
    archive: '보관',
    follow_up: '후속 조치',
    mark_read: '읽음 표시',
    pay: '결제',
    read: '읽어볼 만함',
    reply: '답장',
    schedule: '일정 잡기',
    unsubscribe: '구독 취소',
  },
  actionStatus: {
    auto_done: '에이전트가 처리함',
    dismissed: '건너뜀',
    done: '완료',
    failed: '실패',
    pending: '홈에서 대기 중',
  },
  byBot: '봇에 따라',
  agent: {
    decideOnHome: '홈에서 결정하기',
    fromAgent: '에이전트가 요청함',
    mcpAsks: (client: string) => `${client}이(가) MCP로 요청합니다`,
    calendar: (email: string) => `${email}의 캘린더`,
    cc: (recipients: string) => `참조: ${recipients}`,
    confirm: {
      dismiss_action: '이 카드를 건너뛸까요?',
      create_event: '이 일정을 추가할까요?',
      delete_event: '이 일정을 삭제할까요?',
      update_event: '이 일정을 변경할까요?',
      approve_action: '이 작업을 실행할까요?',
      archive_thread: '이 스레드를 보관할까요?',
      clear_out: '받은편지함에서 이 메일들을 정리할까요?',
      undo_clear_out: '정리한 메일을 모두 받은편지함으로 되돌릴까요?',
      create_bot: '이 봇을 만들까요?',
      reply: '이 답장을 보낼까요?',
      send_email: '이 이메일을 보낼까요?',
      snooze_thread: '이 스레드를 다시 알림으로 미룰까요?',
      unsubscribe: '이 발신자의 구독을 취소할까요?',
      tidy_mail: '이 조용한 메일을 정리할까요?',
      trash_thread: '이 스레드를 휴지통으로 옮길까요?',
      report_spam: '이 발신자를 스팸으로 신고할까요?',
      mark_not_spam: '이 스레드를 스팸에서 꺼낼까요?',
      move_to_inbox: '이 스레드를 받은편지함으로 되돌릴까요?',
    },
    retry: '다시 시도',
    steps: {
      create_event: '일정 추가 중',
      delete_event: '일정 삭제 중',
      list_events: '캘린더 확인 중',
      update_event: '일정 변경 중',
      list_subscriptions: '메일링 리스트 확인 중',
      approve_action: '실행하는 중',
      archive_thread: '보관하는 중',
      get_reading: '뉴스레터 읽는 중',
      get_wrapped: '메일을 세는 중',
      clear_out: '받은편지함 정리 중',
      preview_clear_out: '받은편지함 전체를 읽는 중',
      undo_clear_out: '정리한 메일을 되돌리는 중',
      create_bot: '봇 만드는 중',
      dismiss_action: '건너뛰는 중',
      draft_reply: '답장 작성하는 중',
      create_draft: '초안 저장하는 중',
      find_people: '주소 찾는 중',
      get_person: '사람 찾는 중',
      get_today: '오늘 확인하는 중',
      list_handled: '처리한 항목 확인 중',
      list_mail: '메일 검색하는 중',
      get_bot_chat: '채팅 읽는 중',
      list_bots: '내 봇 읽는 중',
      read_thread: '스레드 읽는 중',
      redraft_action: '초안 다시 쓰는 중',
      refresh: '새 메일 확인하는 중',
      remind_later: '리마인더 설정하는 중',
      send_email: '보내는 중',
      snooze_thread: '미루는 중',
      unsubscribe: '구독 취소하는 중',
      tidy_mail: '정리하는 중',
      trash_thread: '휴지통으로 옮기는 중',
      report_spam: '스팸 신고 중',
      mark_not_spam: '스팸에서 꺼내는 중',
      move_to_inbox: '받은편지함으로 옮기는 중',
      list_promises: '약속 확인 중',
      set_promise_status: '약속 업데이트 중',
    },
    to: (recipients: string) => `받는 사람: ${recipients}`,
    until: (time: string) => `다시 표시: ${time}`,
    yes: {
      dismiss_action: '건너뛰기',
      create_event: '추가',
      delete_event: '삭제',
      update_event: '저장',
      approve_action: '실행',
      archive_thread: '보관',
      clear_out: '정리',
      undo_clear_out: '되돌리기',
      create_bot: '봇 만들기',
      reply: '보내기',
      send_email: '보내기',
      snooze_thread: '미루기',
      unsubscribe: '구독 취소',
      tidy_mail: '정리',
      trash_thread: '휴지통으로',
      report_spam: '스팸 신고',
      mark_not_spam: '스팸 아님',
      move_to_inbox: '되돌리기',
    },
  },
  compose: {
    attach: '파일 첨부',
    attachmentsTooLarge: (limit: string) =>
      `첨부 파일의 전체 크기는 ${limit}까지 가능해요.`,
    dropFiles: '파일을 놓아 첨부하세요',
    removeAttachment: '제거',
    discarded: '임시 보관 메일을 삭제했어요',
    backInQueue: '취소했어요. 초안이 홈으로 돌아갔어요.',
    canceled: '취소했어요. 이메일이 편집기로 돌아갔어요.',
    cc: '참조',
    discard: '삭제',
    draftSaved: '초안을 저장했어요',
    forward: '전달',
    forwardedMessage: '전달된 메시지',
    from: '보낸 사람',
    invalidRecipients: '유효한 이메일 주소를 하나 이상 추가하세요.',
    later: {
      inHour: '1시간 후',
      monday: '월요일 아침',
      pick: '날짜 및 시간 선택',
      schedule: '예약',
      time: '시간',
      tomorrow: '내일 아침',
    },
    new: '새 이메일',
    placeholder: '이메일을 작성하세요…',
    remind: {
      days: (total: number) => `${total}일 안에 답장이 없으면 알림`,
      label: '알림',
      off: '알림 없음',
    },
    reply: '답장',
    scheduledFor: (date: string) => `${date}에 보낼 예정`,
    send: '보내기',
    sendLater: '나중에 보내기',
    sendingIn: (seconds: number) => `${seconds}초 후 전송`,
    subject: '제목',
    to: '받는 사람',
    undo: '실행 취소',
    undoing: '되돌리는 중…',
    writeForMe: '대신 써 줘',
    writing: '작성 중…',
  },
  composer: {
    acceptSuggestion: 'Tab으로 수락',
    bold: '굵게',
    bulletList: '글머리 기호 목록',
    italic: '기울임꼴',
    link: '링크',
    linkPlaceholder: '링크를 붙여넣거나 입력하세요',
    noSnippets: '일치하는 스니펫이 없어요.',
    removeLink: '링크 제거',
  },
  calendar: {
    tomorrow: '내일',
    allDay: '종일',
    calendar: '캘린더',
    create: '일정 추가',
    delete: '삭제',
    deleted: '일정을 삭제했습니다',
    description: '설명',
    editEvent: '일정 편집',
    endBeforeStart: '일정이 시작보다 먼저 끝납니다',
    ends: '종료',
    location: '장소',
    newEvent: '새 일정',
    next: '다음',
    openInGoogle: 'Google 캘린더에서 열기',
    previous: '이전',
    save: '저장',
    saved: '일정을 저장했습니다',
    saving: '일정 저장 중…',
    scope: {
      this: '이 일정만',
      following: '이 일정 및 이후 일정',
      all: '모든 일정',
    },
    starts: '시작',
    title: '캘린더',
    titlePlaceholder: '제목 추가',
    today: '오늘',
    untitled: '(제목 없음)',
    views: {
      day: '일',
      week: '주',
      month: '월',
      year: '연',
    },
  },
  category: {
    calendar: '캘린더',
    finance: '금융',
    newsletter: '뉴스레터',
    notification: '알림',
    other: '기타',
    person: '사람',
    promotion: '프로모션',
    receipt: '영수증',
    security: '보안',
    travel: '여행',
    work: '업무',
  },
  command: {
    compose: '새 이메일',
    appearance: '화면',
    upgrade: 'Pro로 업그레이드',
    theme: {
      dark: '다크',
      light: '라이트',
      system: '시스템',
    },
  },
  importance: ['잡음', '알아두면 좋음', '곧 확인 필요', '긴급'],
  justNow: '방금',
  errors: {
    crashTitle: 'Fewmail이 이 페이지에서 걸려 넘어졌어요',
    crashLead:
      '메일은 안전하고 Gmail에서는 아무것도 바뀌지 않았어요. 새로고침해 주세요. 다시 일어나도 저희가 이미 알고 있어요.',
    missingTitle: '이 주소에는 아무것도 없어요',
    calendarAccess:
      'Fewmail이 이 캘린더에 접근할 수 없어요. 캘린더 페이지에서 허용해 주세요.',
    failed: '문제가 발생했어요. 다시 시도해 주세요.',
    needsPro: 'Fewmail Pro가 필요해요.',
    alreadySent: '이미 보냈어요. 취소하기엔 늦었어요.',
    consentChanged:
      '요청된 뒤에 내용이 바뀌었어요. 다시 확인하고 홈에서 결정해 주세요.',
    notFound: '더 이상 존재하지 않아요. 삭제되었을 수 있어요.',
    offline: 'Fewmail에 연결할 수 없어요. 연결 상태를 확인해 주세요.',
  },
  desktop: {
    confirm: '앱에 로그인',
    confirmLead: (code: string) =>
      `이 컴퓨터의 Fewmail이 로그인을 요청합니다. ${code}가 표시되는지 확인하세요.`,
    confirmTitle: '앱에 로그인할까요?',
    expired: '이 로그인은 만료되었습니다. 앱에서 다시 시작하세요.',
    lead: '이 컴퓨터에서 로그인되었습니다. 이 탭은 닫아도 됩니다.',
    title: '앱으로 돌아가기',
    waiting: (code: string) =>
      `브라우저에서 계속하고 ${code}가 표시되는지 확인하세요.`,
  },
  update: {
    available: 'Fewmail 새 버전이 나왔어요.',
    reload: '새로고침',
  },
  keys: {
    forget: '목록에서 삭제',
    reopen: '다시 열기',
    attach: '첨부',
    done: '완료',
    openLink: '링크 열기',
    writeReminder: '리마인더 쓰기',
    summary: '요약',
    fromSender: '같은 발신자의 메일',
    approvePicked: (n: number) => `선택한 ${n}개 승인`,
    pick: '선택',
    pickAll: '모두 선택',
    markRead: '읽음 표시',
    markUnread: '읽지 않음 표시',
    unpick: '선택 해제',
    pin: '고정',
    unpin: '고정 해제',
    copyCode: '코드 복사',
    restore: '받은편지함으로',
    calendarToday: '오늘',
    newEvent: '새 일정',
    period: '이전 / 다음',
    view: '보기',
    skills: '스킬',
    unsubscribe: '구독 취소',
    filter: '필터',
    reply: '답장',
    snooze: '다시 알림',
    trash: '휴지통',
    archive: '보관',
    approve: '승인',
    approveAll: (n: number) => `같은 종류 ${n}개 모두 승인`,
    close: '닫기',
    draftReply: '답장 초안',
    edit: '편집',
    expand: '펼치기 / 접기',
    move: '이동',
    stackEmail: '다음 / 이전 메일',
    open: '열기',
    rename: '이름 바꾸기',
    clearFilter: '필터 지우기',
    search: '검색',
    send: '보내기',
    skip: '건너뛰기',
    keep: '남기기',
    stopEditing: '편집 종료',
    rewrite: '다시 쓰기',
    save: '저장',
    deleteEvent: '삭제',
  },
  legal: {
    privacy: '개인정보 처리방침',
    englishOnly:
      '이 문서는 영어로 제공되며, 영어판이 법적 효력을 갖는 버전이에요.',
    terms: '서비스 약관',
    updated: (date: string) => `최종 업데이트: ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `이번 달 에이전트 사용량을 모두 썼어요. ${date}에 다시 채워져요.`,
  },
  notices: {
    freeUpSpace: '공간 확보하기',
    mailLost: 'Fewmail이 Gmail에 접근할 수 없어 새 메일을 읽지 못하고 있어요.',
    mailboxLost: (email: string) => `Fewmail이 ${email}에 접근할 수 없어요.`,
    reconnect: '다시 연결',
    sendLimit: (email: string, when: string) =>
      `${email}이 Gmail 일일 발송 한도에 도달했어요. ${when} 다시 보낼 수 있어요.`,
    signInAgain: '다시 로그인',
    storageFull: (email: string) =>
      `${email}의 Google 저장공간이 가득 차서 Gmail이 새 메일을 반송하고 있어요.`,
    storageFullHint:
      '메일을 다시 받으려면 공간을 확보하거나 저장공간을 늘리세요.',
  },
  login: {
    needsGmail:
      'Fewmail이 작동하려면 Gmail 접근 권한이 필요해요. 다시 로그인하고 Google 화면에서 Gmail 항목을 체크한 채로 두세요.',
    agree: ((slots) => [
      '계속하면 ',
      slots.terms,
      ' 및 ',
      slots.privacy,
      '에 동의하게 돼요.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      '동의 없이 아무것도 보내거나 보관하지 않아요. 캘린더와 연락처는 선택이에요.',
    continue: 'Google로 계속하기',
    lead: 'Fewmail이 메일을 대신 읽고, 정말 필요한 것만 보여줘요.',
    title: '중요한 것만.',
  },
  mail: {
    inThread: (emails: string) => `이 대화에 ${emails}`,
    moreFrom: (name: string) => `${name}의 다른 메일`,
    draftDeleted: '임시 보관 메일을 삭제했어요',
    unsubscribeConfirm: (name: string) => `${name} 구독을 취소할까요?`,
    unsubscribeHint:
      'Fewmail이 리스트 구독을 취소하고 이 스레드를 보관해요. 구독 취소는 되돌릴 수 없어요.',
    unsubscribing: '구독 취소 중…',
    pin: '고정',
    unpin: '고정 해제',
    pinned: '고정됨',
    showAll: (n: number) => `${n}개 모두 보기`,
    showFewer: '접기',
    inboxTotal: (count: string) => `총 ${count}개`,
    markShownRead: (n: number) => `${n}개 읽음 표시`,
    oneTimeCode: {
      copied: '코드를 복사했습니다',
      copy: '코드 복사',
    },
    openUnsubscribePage: '페이지 열기',
    unsubscribeYourself:
      '이 목록은 해당 페이지에서 직접 구독을 해지해야 해요. 그동안 메일은 보관해 둘게요.',
    allMailboxes: '모든 메일함',
    filterAbout: {
      focused: '중요한 메일과 사람 먼저, 알림은 접어서',
      unread: '아직 읽지 않은 메일을 종류별로',
      categories: '받은편지함 전체를 종류별로, 확인이 필요한 메일 먼저',
      inbox: '전체, 최신순',
    },
    find: {
      recent: '최근 검색',
      tips: '팁',
      clearRecent: '지우기',
      describeExample: '지난달 Anna가 보낸 청구서',
      searching: '메일을 검색하는 중…',
      tip: {
        from: 'Anna가 보낸 메일',
        subject: '제목에 “invoice” 포함',
        attachment: '첨부파일 있음',
        pdf: 'PDF 첨부',
        unread: '읽지 않은 대화',
        week: '최근 7일',
        describe: '또는 직접 설명하세요',
      },
    },
    group: {
      named: '보낸 사람 또는 제목',
      mentioned: '본문에 언급됨',
      read: '읽음',
      earlier: '이전',
      important: '중요',
      people: '사람',
      plans: '일정과 여행',
      money: '돈',
      updates: '알림',
      newsletters: '뉴스레터',
      promotions: '프로모션',
    },
    unread: '읽지 않음',
    block: '발신자 차단',
    ignoresUnsubscribe: (name: string) => `${name} 님은 수신 거부를 무시합니다`,
    ignoresUnsubscribeHint:
      'Fewmail이 수신 거부를 요청했지만 이 발신자는 그래도 계속 보내는 것으로 알려져 있어요. 앞으로 이 발신자의 메일을 휴지통으로 보낼까요? 봇이 맡아서 하고, 그 봇은 홈에서 삭제할 수 있어요.',
    blocked: '차단했어요. 이제 이 발신자의 메일은 휴지통으로 가요.',
    forward: '전달',
    more: '더 보기',
    close: '닫기',
    reply: '답장',
    trash: '휴지통으로 이동',
    trashed: '휴지통으로 옮겼어요',
    moveToInbox: '받은편지함으로',
    backInInbox: '받은편지함으로 옮겼어요',
    movedToInbox: '받은편지함으로 되돌렸어요. 알려줘서 고마워요.',
    deleteDraft: '초안 삭제',
    notSent: '보내지 못함. 열어서 다시 시도',
    noRecipients: '받는 사람 없음',
    notSpam: '스팸 아님',
    reportSpam: '스팸 신고',
    reportedSpam: '신고했어요. 이제 이 발신자의 메일은 스팸으로 가요.',
    archive: '보관',
    archived: '보관했어요',
    markedRead: '읽음으로 표시했어요',
    markUnread: '읽지 않음으로 표시',
    markedUnread: '읽지 않음으로 표시함',
    attachment: '첨부파일',
    draftReply: '답장 초안 작성',
    due: (date: string) => `마감 ${date}`,
    dueHint: '에이전트가 이 메일에서 찾은 마감일',
    empty: {
      focused: '받은편지함이 비었어요',
      unread: '모두 읽었어요',
      categories: '받은편지함이 비었어요',
      inbox: '받은편지함이 비었어요',
      snoozed: '다시 알림으로 미룬 메일이 없어요',
      sent: '아직 보낸 메일이 없어요',
      drafts: '임시보관한 메일이 없어요',
      archive: '보관함이 비었어요',
      spam: '스팸이 없어요',
      trash: '휴지통이 비었어요',
    },
    emptyHint: {
      focused: '새 메일이 오면 바로 여기에 나타나요.',
      unread: '새 메일이 오면 바로 여기에 나타나요.',
      categories: '새 메일이 오면 바로 여기에 나타나요.',
      inbox: '새 메일이 오면 바로 여기에 나타나요.',
      snoozed:
        '메일을 다시 알림으로 미루면 나중까지 숨겨지고, 읽지 않은 상태로 받은편지함에 돌아와요.',
      sent: '보낸 메일이 여기에 나타나요.',
      drafts: '쓰다가 보내지 않은 메일이 여기에 남아요.',
      archive: '보관한 메일은 받은편지함에서 빠져 여기에 남아요.',
      spam: '스팸은 받은편지함 대신 여기로 와요.',
      trash: '삭제한 메일은 30일 동안 여기에 남아요.',
    },
    noResults: '찾은 결과가 없어요',
    noResultsHint: '다른 단어나 다른 폴더로 찾아보세요.',
    expectsReply: '답장을 기다림',
    filter: {
      categories: '카테고리',
      archive: '보관함',
      trash: '휴지통',
      drafts: '임시보관함',
      spam: '스팸',
      inbox: '받은편지함',
      snoozed: '다시 알림',
      sent: '보낸편지함',
      focused: '포커스',
      unread: '읽지 않음',
    },
    instruction: '어떻게 답장할지 알려주거나, 그냥 Enter를 누르세요',
    open: '열기',
    openInGmail: 'Gmail에서 열기',
    openInNewTab: '새 탭에서 열기',
    search: '검색하거나 설명하세요',
    unsubscribe: '구독 취소',
    unsubscribed: '구독을 취소했어요',
    unsubscribeFailed:
      '이 발신자는 원클릭 구독 취소를 지원하지 않아서 메일을 보관했어요.',
    you: '나',
    sent: '보냄',
    writeReply: '답장 쓰기…',
    replyTo: '회신 주소',
    date: '날짜',
    authentication: '인증',
    toLine: (recipients: string) => `받는 사람: ${recipients}`,
  },
  subscriptions: {
    leftBy: (percent: number) =>
      `Fewmail 독자의 ${percent}%가 구독을 해지했어요`,
    unsubscribeHint: (emails: string) =>
      `Fewmail이 리스트 구독을 취소하고 보낸 메일을 모두 보관해요(이번 달 ${emails}). 구독 취소는 되돌릴 수 없어요.`,
    archivedOnly:
      '이 발신자는 Fewmail이 쓸 수 있는 구독 취소 방법이 없어 메일을 보관했어요. 하지만 아직 리스트에 있어서 새 메일은 계속 와요.',
    count: (total: number) => `메일링 리스트 ${total}개`,
    empty: '이번 달 메일을 보낸 메일링 리스트가 없어요.',
    lead: '이번 달 메일을 보낸 뉴스레터, 프로모션 등 메일링 리스트예요. 많이 보낸 순서예요. 읽지 않는 건 구독을 취소하세요. Fewmail이 리스트에서 나가고 보낸 메일을 모두 보관해요.',
    opened: (total: number) =>
      total === 0 ? '하나도 안 열었어요' : `${total}개 열었어요`,
    title: '메일링 리스트',
    unsubscribe: '구독 취소',
    unsubscribed: '구독을 취소했어요',
  },
  nav: {
    board: '보드',
    menu: '메뉴',
    labels: '라벨',
    folders: '폴더',
    calendar: '캘린더',
    subscriptions: '메일링 리스트',
    wrapped: '돌아보기',
    people: '사람',
    findPerson: '사람 찾기',
    personMail: '이메일 보기',
    deleteContact: '연락처 삭제',
    contactDeleted: '연락처를 삭제했습니다',
    clearSearch: '검색 지우기',
    mail: '메일',
    reading: '읽을거리',
    settings: '설정',
    syncFailed: 'Gmail 동기화 실패, 다시 시도 중',
    syncing: '받은편지함을 읽는 중…',
    loading: '불러오는 중',
    syncFailedIn: (email: string) => `${email} 동기화 실패, 다시 시도 중`,
    syncingIn: (email: string) => `${email} 읽는 중…`,
    home: '홈',
    trialLeft: (total: number) => `Pro 체험 · ${total}일 남음`,
    usage: (percent: number) => `에이전트 · 이번 달 ${percent}% 사용`,
    watching: '에이전트가 받은편지함을 지켜보고 있어요',
  },
  notifications: {
    many: (n: number) => `Fewmail 새 알림 ${n}개`,
  },
  plan: {
    used: (percent: number) => `${percent}% 사용`,
    about: (emails: string, messages: string) =>
      `한 달에 메일 약 ${emails}통 읽기 또는 에이전트 메시지 ${messages}개, 원하는 대로 섞어서.`,
    free: 'Free',
    freeDescription:
      '간단한 규칙으로 빠르고 차분한 메일을. 원하는 만큼 무료로 쓸 수 있어요.',
    includes:
      '유료 요금제에서는 에이전트가 함께해요: 모든 메일 읽기와 요약, 내 말투로 작성하는 답장 초안, 평소 말로 쓰는 규칙, Telegram과 MCP.',
    manage: '결제 관리',
    price: (usd: number) => `$${usd} / 월`,
    priceYearly: (usd: number) => `$${usd} / 년`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
    cancels: (plan: string, date: string) =>
      `${date}까지 ${plan}, 그 후에는 Free로 바뀌어요.`,
    choose: (plan: string) => `${plan} 선택`,
    proRenews: (date: string) => `${date}에 갱신돼요.`,
    resets: (date: string) => `${date}에 초기화돼요.`,
    title: '요금제',
    trial: 'Pro 체험',
    welcome: (plan: string) =>
      `${plan}에 오신 걸 환영해요. 에이전트가 다시 일을 시작했어요.`,
    yearly: '연간 결제',
    yearlyHint: '두 달 무료예요.',
    trialDescription: (date: string) =>
      `${date}까지 Pro의 모든 기능, 이후 무료. 카드 필요 없음.`,
    upgrade: '다른 요금제',
    usage: '이번 달',
  },
  queue: {
    addToCalendar: '캘린더에 추가',
    writeReminder: '리마인더 쓰기',
    approve: '승인',
    delete: '삭제',
    pick: '선택',
    picked: (n: number) => `${n}개 선택됨`,
    unpick: '선택 해제',
    askedByYou: '요청하신 답장',
    draftedInVoice: '내 말투로 작성한 초안',
    openEmail: '메일 열기',
    send: '보내기',
    rewrite: '다시 쓰기',
    shorterInstruction: '더 짧게 써 줘.',
    new: '새 항목',
    skipStale: '모두 건너뛰기',
    skipped: (n: number) => `${n}개 건너뜀`,
    stale: (n: number) => `일주일 넘음: ${n}개`,
    skip: '건너뛰기',
  },
  reminders: {
    followUp: '후속 연락',
    noReply: '아직 답장 없음',
  },
  bots: {
    chatMenu: '채팅 작업',
    clear: '기록 지우기',
    clearConfirm: (name: string) => `${name}와의 채팅을 지울까요?`,
    clearHint:
      '메시지는 완전히 사라져요. 메일에서 한 일과 설정한 알림은 남아요.',
    cleared: '기록을 지웠어요',
    deleteFolder: '폴더 삭제',
    deleteFolderConfirm: (name: string) => `${name} 폴더를 삭제할까요?`,
    deleteFolderHint: '폴더 안의 봇은 폴더 밖으로 나와 목록에 남아요.',
    moveTo: '폴더로 이동',
    newFolder: '새 폴더',
    noFolder: '폴더 없음',
    pin: '고정',
    rename: '이름 바꾸기',
    renameFolder: '폴더 이름 바꾸기',
    unpin: '고정 해제',
    add: '새 봇',
    answering: '쓰는 중…',
    cancelReply: '답장 취소',
    cards: {
      autoDone: (n: number) => `${n}통은 제가 알아서 처리했어요.`,
      dismissed: (n: number) => `${n}통은 건너뛰었어요.`,
      done: (n: number) => `${n}통은 승인 후 처리됐어요.`,
      failed: (n: number) => `${n}통은 Gmail이 거부했어요.`,
      pending: (n: number) => `${n}통이 기다리고 있어요.`,
    },
    composer: (name: string) => `${name}에게 맡긴 메일에 대해 써 보세요`,
    copied: '복사했어요',
    copy: '복사',
    created: '봇을 만들었어요. 이제부터 새 메일을 읽어요.',
    delete: '봇 삭제',
    deleteConfirm: (name: string) => `${name}을(를) 삭제할까요?`,
    deleteHint:
      '채팅도 함께 사라져요. 메일은 그대로 남고, 비슷한 새 메일은 Fewmail로 가요.',
    deleted: '봇을 삭제했어요',
    earlier: '이전 항목 보기',
    edit: '봇 설정',
    effect: {
      always_show: '홈에 두기',
      archive: '보관하기',
      collect: '모아 두기만',
      draft_reply: '답장 초안 쓰기',
      mark_read: '읽음으로 표시',
      promises: '제가 챙기는 약속과 마감일',
      tidy: '정리하기',
      trash: '휴지통으로 이동',
      unsubscribe: '구독 취소',
    },
    empty: '아직 아무것도 없어요. 제 메일이 오면 여기에 쓸게요.',
    enabled: '알아서 처리',
    enabledHint: {
      off: '끄면 메일마다 먼저 승인을 받아요.',
      on: '켜면 묻지 않고 처리해요. 한 일은 모두 채팅에 보여요.',
    },
    instruction: '맡을 메일과 처리 방법',
    instructionPlaceholder:
      '예: Hetzner 청구서는 읽음 처리, LinkedIn 알림은 보관',
    mute: '알림 끄기',
    muted: '알림 꺼짐: 이 봇의 알림이 오지 않아요',
    name: '이름',
    namePlaceholder: '예: 청구서',
    noPlan:
      '답할 수 없어요. 무료 요금제에서는 대화에 쓸 토큰이 없거든요. 구독하면 언제든 이야기할 수 있어요.',
    now: '지금 기다리는 중',
    nudge: {
      noReply: '그 스레드에는 아직 답장이 없어요.',
      replied: '그 뒤로 그 스레드에 답장이 왔어요.',
    },
    promises: (n: number) => `약속 ${n}개를 적어 뒀어요.`,
    presets: '템플릿',
    react: '반응 남기기',
    reaction: '반응',
    reply: '답장',
    save: '저장',
    saved: '저장했어요',
    simple: {
      title: {
        from: (value: string) => `보낸 사람 “${value}”`,
        mailingList: () => '모든 메일링 리스트',
        subject: (value: string) => `제목에 “${value}” 포함`,
      },
    },
    spent: (date: string) =>
      `${date}까지는 답할 수 없어요. 이번 달 사용량을 모두 썼어요.`,
    steps: (n: number) => `${n}단계`,
    subscribe: '구독하기',
    fewmail: 'Fewmail Bot',
    fewmailJob: '봇을 만들고, 메일을 찾고, 질문에 답해요',
    title: '봇',
    toLatest: '최신 메시지로',
    unmute: '알림 켜기',
    whatItDoes: '메일을 어떻게 할지',
    you: '나',
  },
  settings: {
    disconnectConfirm: (name: string) => `${name} 연결을 해제할까요?`,
    messengerDisconnectHint:
      '봇이 더 이상 메시지를 보내지 않아요. 다시 연결하려면 이 페이지의 새 링크가 필요해요.',
    readingDigest: {
      description:
        '매일 아침, 어제의 뉴스레터를 Telegram과 WhatsApp으로 한 메시지에 모아 보내요. 둘 다 연결되지 않았다면 알림으로 보내요.',
      title: '뉴스레터 다이제스트',
    },
    knowledge: {
      description:
        '가격, 주소, 가능한 일정, 선호하는 답장 방식 등. 에이전트가 초안과 자동 완성에 사용해요.',
      placeholder:
        '예: 컨설팅은 $150/h예요. 금요일에는 전화를 받지 않아요. 제 주소는…',
      title: '에이전트가 알아야 할 것',
    },
    labels: {
      description:
        '메일을 Fewmail/… 라벨로 분류해서 휴대폰의 Gmail에서도 같은 순서로 보여요.',
      title: 'Gmail 에이전트 라벨',
    },
    snippets: {
      deleted: '스니펫을 삭제했어요',
      add: '스니펫 추가',
      body: '텍스트',
      delete: '삭제',
      description: '편집기에서 ; 를 입력하면 이름으로 스니펫을 넣을 수 있어요.',
      name: '이름',
      title: '스니펫',
    },
    account: '계정',
    agent: '에이전트',
    deleteAccount: '계정 삭제',
    deleteConfirm: '모두 삭제',
    deleteDescription:
      '계정, 동기화된 메일, 초안, 봇을 Fewmail에서 즉시 삭제해요. Gmail 자체는 건드리지 않아요. 유료 요금제는 즉시 해지돼요.',
    deleteFailed: '계정이 삭제되지 않았어요. 잠시 후 다시 시도하세요.',
    deleteSignIn:
      '본인 확인을 위해 Google로 다시 로그인한 뒤 계정을 삭제하세요.',
    deleteTitle: 'Fewmail 계정을 삭제할까요?',
    cancel: '취소',
    integrations: '연동',
    language: '언어',
    languageDescription: '앱, 봇, 요약에 사용해요. 답장은 메일 언어를 따라요.',
    legal: '법적 고지',
    mailboxes: {
      removeConfirm: (email: string) => `${email}을(를) 삭제할까요?`,
      removeHint:
        'Fewmail이 이 메일함을 더 이상 읽지 않고 읽은 내용을 잊어요. Gmail에서는 아무것도 바뀌지 않아요.',
      add: 'Gmail 추가',
      addDescription:
        '다른 Gmail 계정의 메일이 같은 홈과 받은편지함에 모입니다. 이 계정으로는 여기에 로그인할 수 없으며, 로그인하면 별도의 Fewmail이 열립니다.',
      added: '메일함을 추가했습니다. 1분 안에 메일이 표시됩니다.',
      failed:
        '메일함을 추가하지 못했습니다. Gmail 접근을 허용하고 다시 시도하세요.',
      lost: 'Gmail 접근이 끊겼습니다. 다시 연결하려면 다시 추가하세요.',
      reading: '메일을 읽는 중…',
      remove: '삭제',
      retrying: 'Gmail이 지금 응답하지 않아요. Fewmail이 알아서 다시 시도해요.',
      signIn: '로그인에 사용하는 계정',
      signInChosen: '로그인에 사용하는 계정입니다. 다른 계정을 선택하세요.',
      signInLost: 'Gmail 접근이 끊겼습니다. 다시 연결하려면 다시 로그인하세요.',
      synced: (ago: string) => `${ago} 동기화됨`,
      title: '메일함',
    },
    mcp: {
      disconnectHint: '다시 연결할 때까지 메일을 읽을 수 없어요.',
      allow: '허용',
      connected: (ago: string) => `${ago} 연결됨`,
      copy: 'URL 복사',
      defaultName: 'MCP 클라이언트',
      deny: '거부',
      description:
        '메일을 읽고, 답장 초안을 쓰고, 확인을 받은 뒤 보낼 수 있어요.',
      disconnect: '연결 해제',
      paste: '이 URL을 앱의 커넥터로 추가한 뒤 Fewmail에 로그인하세요.',
      request: (app: string) => `${app}에서 Fewmail을 사용하려고 해요`,
      title: 'Claude, Cursor 또는 MCP 클라이언트 연결',
    },
    morningDescription: (timezone: string) =>
      `뉴스레터 다이제스트와 월요일 주간 리포트를 내 시간대(${timezone}) 기준으로 보내요`,
    morningTitle: '아침 메시지',
    signedInWithGoogle: 'Google로 로그인됨',
    signOut: '로그아웃',
    notifications: {
      blocked:
        '알림이 차단되어 있어요. 브라우저의 사이트 설정에서 허용해 주세요.',
      browser: '이 브라우저',
      desktop: '이 컴퓨터',
      messengerOff: '긴급 메일은 Fewmail에만 표시돼요.',
      messengerOn: '긴급 메일이 바로 채팅으로 와요.',
      notConfigured: '이 서버에는 브라우저 알림이 설정되어 있지 않아요.',
      off: 'Fewmail을 닫아 두어도 긴급 메일을 여기서 받아요.',
      on: '긴급 메일이 여기에 표시돼요. 한꺼번에 여러 개가 오면 하나로 묶어요.',
      title: '알림',
      unsupported: '이 브라우저는 알림을 표시할 수 없어요.',
    },
    telegram: {
      connect: 'Telegram 연결',
      disconnect: '연결 해제',
      linked:
        '긴급 메일은 바로 도착해요. 채팅에서 초안을 승인하고 편집할 수 있어요.',
      linkedQuiet: '채팅에서 초안을 승인하고 편집할 수 있어요.',
      notConfigured: '이 서버에는 Telegram 봇이 설정되어 있지 않아요.',
      unlinked: 'Telegram에서 긴급 메일을 받고 초안을 승인하세요.',
    },
    whatsapp: {
      connect: 'WhatsApp 연결',
      disconnect: '연결 해제',
      linked:
        '긴급 메일은 바로 도착해요. 채팅에서 초안을 승인하고 편집할 수 있어요.',
      linkedQuiet: '채팅에서 초안을 승인하고 편집할 수 있어요.',
      notConfigured: '이 서버에는 WhatsApp 봇이 설정되어 있지 않아요.',
      unlinked: 'WhatsApp에서 긴급 메일을 받고 초안을 승인하세요.',
    },
    title: '설정',
  },
  site: {
    meta: {
      assistant:
        'Fewmail은 Gmail을 위한 AI 이메일 비서예요. 모든 메일을 먼저 읽고, 내 말투로 답장 초안을 쓰고, 나에게 필요한 것만 보여 줘요. 무료로 시작할 수 있어요.',
      assistantTitle: 'Gmail을 위한 AI 이메일 비서',
      compare:
        'Superhuman, Shortwave, SaneBox와 Fewmail 비교: 직접 더 빨리 읽는 도구가 아니라 대신 메일을 읽어 주는 AI 에이전트예요.',
      compareTitle: 'AI 이메일 비서 비교',
      home: 'Fewmail은 Gmail을 위한 AI 이메일 비서예요. 모든 메일을 읽고, 내 말투로 답장 초안을 쓰고, 나에게 필요한 것만 보여 줘요.',
      login:
        'Fewmail이 대신 Gmail을 읽고, 내 말투로 답하고, 정말 나에게 필요한 것만 보여 줘요.',
      mcp: 'Fewmail을 MCP 서버로 Claude, ChatGPT, Claude Code, Cursor에 연결하세요. 이미 쓰는 AI에서 Gmail을 읽고 정리할 수 있어요.',
      motto: '받은편지함에서 중요한 것만',
      pricing: (trialDays: number) =>
        `Fewmail의 홈, 분류, 규칙, 스팸 보호는 계속 무료예요. 에이전트 전체를 쓰는 Pro는 카드 없이 ${trialDays}일 무료로 시작해요.`,
      tagline: 'Gmail을 위한 AI 이메일 에이전트',
    },
    chapters: {
      pricing: {
        description:
          '홈, 분류, 규칙, 보호 기능은 평생 무료예요. Lite, Pro, Max에는 대신 읽고 써 주는 모든 기능이 더해져요. 큰 요금제일수록 그걸 더 많이 할 뿐이에요.',
        label: '요금',
        title: (usd: number) => `분류는 무료. 에이전트는 $${usd}부터.`,
      },
      questions: {
        description: '짧게 답했어요. 자세한 내용은 개인정보 처리방침에 있어요.',
        label: '자주 묻는 질문',
        title: 'Gmail을 연결하기 전에.',
      },
    },
    closing: {
      lead: 'Gmail 연결은 1분이면 돼요. Fewmail은 최근 3일 치 메일부터 시작하니, 첫 결정이 바로 기다리고 있어요.',
      title: '아침 시간을 되찾으세요.',
    },
    mcp: {
      answer:
        '금요일 킥오프 전에 서명한 계약서가 필요해요. 답장 초안은 이미 써 두었고 Fewmail 대기열에서 기다리고 있어요.',
      clients: '지원하는 앱',
      emphasis: 'Claude와 ChatGPT',
      free: '메일 읽기와 에이전트의 분류는 무료예요.',
      label: 'MCP',
      lead: 'Fewmail을 MCP 서버로 연결하고, 이미 쓰는 어시스턴트에서 메일에 대해 물어보세요. 메일을 보내거나 Gmail을 바꾸는 일은 여전히 내 동의를 먼저 구해요.',
      question: '이번 주에 Anna가 나한테 필요한 게 뭐야?',
      setup: '1분 만에 연결하기',
      title: 'Claude와 ChatGPT 안에서 만나는 내 메일.',
    },
    mcpPage: {
      copy: 'URL 복사',
      lead: 'Fewmail을 MCP 서버로 연결하고, 이미 쓰는 AI에서 메일에 대해 물어보세요. 메일 읽기와 에이전트의 분류는 무료이고, 초안·발송·규칙은 Pro에 있어요.',
      safety:
        '메일을 보내거나 Gmail을 바꾸는 일은 모두 먼저 동의를 구해요. 어시스턴트에게 명령하려는 이메일은 읽히기 전에 표시돼요. 메일은 절대 모델 학습에 쓰이지 않고, 어떤 앱이든 설정에서 연결을 끊을 수 있어요.',
      steps: {
        chatgpt:
          'Settings에서 이 URL로 커넥터(앱)를 추가한 뒤 Fewmail에 로그인하세요.',
        claude:
          'Settings → Connectors에서 이 URL로 사용자 지정 커넥터를 추가한 뒤 Fewmail에 로그인하세요.',
        code: '터미널에서 한 번 실행하고, Claude Code가 요청하면 Fewmail에 로그인하세요.',
        cursor:
          'mcp.json에 추가하고, Cursor가 요청하면 Fewmail에 로그인하세요.',
      },
      title: 'Claude, ChatGPT, 그리고 쓰는 도구 안의 Fewmail.',
    },
    assistantPage: {
      abilities: {
        ask: {
          description:
            '“내 비행기 언제 출발해?”라고 물으면 근거가 된 메일과 함께 답해 줘요. Fewmail, Telegram, WhatsApp에서도, Claude와 ChatGPT에서도요.',
          title: '메일에서 찾는 답',
        },
        drafts: {
          description:
            '답장은 미리 써 둬요. 내 어조로, 보낸 사람의 언어로 쓰고, 내가 승인할 때까지 대기열에서 기다려요.',
          title: '내 말투로 쓰는 답장 초안',
        },
        protection: {
          description:
            '바뀐 결제 정보, 비슷하게 꾸민 도메인, 알려진 사기는 행동하기 전에 경고해 줘요.',
          title: '피싱 경고',
        },
        reading: {
          description:
            '하루 치 뉴스레터를 주제별 요약 하나로 묶고, 문장마다 출처 메일로 연결해요.',
          title: '뉴스레터는 요약 하나로',
        },
        bots: {
          description:
            '어떤 메일을 어떻게 할지 한 문장으로 말하면 규칙이 돼요. 스스로 작동하는 건 내가 켠 규칙뿐이에요.',
          title: '평소 말로 쓰는 규칙',
        },
        sorting: {
          description:
            '모든 메일에 요약과 중요도 점수가 붙어서, 급한 건 위로 올라오고 영수증, 알림, 프로모션은 방해하지 않아요.',
          title: '모든 메일을 읽고 분류',
        },
      },
      abilitiesDescription:
        '모든 일은 지금 쓰는 Gmail 안에서 일어나고, 에이전트가 한 일은 하나하나 이유와 함께 기록돼요.',
      abilitiesLabel: '하는 일',
      abilitiesTitle: '또 하나의 받은편지함이 아닌 비서.',
      compareTitle: '다른 AI 이메일 도구와 비교하면.',
      faq: (trialDays: number) => [
        {
          answer:
            'AI로 메일을 대신 읽고, 분류하고, 답하는 소프트웨어예요. 대부분은 여전히 직접 읽어야 하는 받은편지함에 요약과 글쓰기 도움을 더할 뿐이에요. Fewmail은 한 걸음 더 나아가 모든 메일을 먼저 읽기 때문에, 나에게 필요한 것만 보게 돼요.',
          question: 'AI 이메일 비서란 무엇인가요?',
        },
        {
          answer:
            'Fewmail은 제목, 본문, 요약, 초안을 데이터베이스에 암호화해 저장하고, 내 메일을 절대 모델 학습에 쓰지 않으며, 내 동의 없이는 Gmail에서 아무것도 보내거나 바꾸지 않아요. 언제든 연결을 끊고 모든 데이터를 지울 수 있어요.',
          question: 'AI에게 메일을 읽게 해도 안전한가요?',
        },
        {
          answer:
            '답장 초안은 대신 써 주지만, 혼자 보내는 일은 절대 없어요. 초안은 하나하나 대기열에서 내 승인을 기다리고, 비슷한 초안은 한 번에 승인할 수 있어요.',
          question: '메일에 자동으로 답장할 수 있나요?',
        },
        {
          answer: `네. Free 요금제는 모든 메일을 분류하고, 나에게 필요한 것을 한 페이지에 모으고, 내 규칙을 실행하고, 스팸과 피싱을 막아 줘요. 평생 무료예요. 초안, 요약, 나머지 에이전트 기능은 유료 요금제에 있고, 모든 계정은 카드 없이 Pro ${trialDays}일로 시작해요.`,
          question: 'Gmail용 무료 AI 이메일 비서가 있나요?',
        },
      ],
      faqTitle: 'AI 이메일 비서에 대해.',
      lead: 'Fewmail은 Gmail에 도착하는 메일을 바로바로 모두 읽고, 잡음을 걷어 내고, 내 말투로 답장 초안을 쓰고, 내가 결정해야 할 몇 가지만 가져와요. 내 동의 없이는 아무것도 보내거나 바꾸지 않아요.',
      title: 'Gmail을 먼저 읽어 주는 AI 이메일 비서.',
    },
    comparePage: {
      lead: '메일 클라이언트는 모든 메일을 더 빨리 읽게 해 줘요. 필터는 메일을 폴더로 옮겨요. Fewmail은 에이전트예요. 메일을 읽고, 무엇이 기다려도 되는지 판단하고, 나머지만 물어봐요.',
      title: 'Fewmail 비교.',
    },
    comparison: {
      custom: '별도 문의',
      features: '기능별 비교',
      groups: {
        agent: '읽기와 답장',
        day: '나의 하루',
        reach: '쓸 수 있는 곳',
        safety: '보호',
      },
      labels: {
        ask: '메일에 무엇이든 질문',
        home: '나를 기다리는 일을 한 페이지에',
        calendar: '캘린더',
        drafts: '대신 써 주는 답장 초안',
        followUps: '후속 알림',
        gmail: 'Gmail과 Google Workspace',
        handOver: '스레드 맡기기',
        importance: '중요도순 정렬',
        keepApp: '쓰던 메일 앱 그대로',
        mcp: '내 도구를 위한 MCP',
        memory: '약속과 사람을 기억',
        otherProviders: 'iCloud, Yahoo 등 IMAP 메일',
        outlook: 'Outlook과 Microsoft 365',
        phishing: '피싱과 결제 정보 변경 경고',
        phone: '휴대폰에서',
        bots: '평소 말로 쓰는 규칙',
        snooze: '다시 알림',
        spamShield: '커뮤니티 스팸 방패',
        summaries: '메일 요약',
        teams: '팀 받은편지함',
        unsubscribe: '원클릭 구독 취소',
      },
      more: '다른 비교',
      no: '없음',
      noFreePlan: '무료 요금제 없음',
      ours: {
        ask: 'Pro에서',
        home: '실시간, 한 번에 승인, 무료',
        drafts: '내 말투로, 승인할 때만 전송, Pro에서',
        followUps: '답장을 기다리는 메일에 자동으로',
        handOver: '에이전트가 목표까지 처리, Pro에서',
        importance: '모든 메일에 점수, 무료',
        keepApp: '모든 것이 Gmail에 반영',
        mcp: 'Pro에서',
        memory: 'Pro에서',
        phone: 'Telegram과 WhatsApp, 음성까지, Pro에서',
        bots: '보관, 읽음 표시, 구독 취소, 무료',
        summaries: 'Pro에서',
        unsubscribe: '무시하는 발신자는 스팸으로',
      },
      plans: '요금제와 가격',
      read: '비교 읽기',
      source: (name: string, date: string) =>
        `${name} 정보는 공식 웹사이트에서 가져왔고 ${date}에 확인했어요. 가격과 기능은 바뀔 수 있으니 최신 정보는 해당 사이트에서 확인하세요.`,
      title: (name: string) => `Fewmail vs ${name}`,
      tryFree: 'Fewmail 무료로 써 보기',
      which: '나에게 맞는 건 어느 쪽일까요?',
      yes: '있음',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '메일함 4개와 모든 기능, AI Bundle 포함',
          lunch: '메일함 2개, 다시 알림과 리마인더',
          snack: '메일함 1개와 기본 필터',
        },
        summary:
          'SaneBox는 메일을 폴더로 분류하고, 최상위 요금제에서는 초안과 요약도 해 줘요. Fewmail은 먼저 모두 읽고, 나만 내릴 수 있는 몇 가지 결정만 한 페이지에 모아 줘요.',
        them: {
          home: '걸러진 메일의 일일 요약본',
          drafts: 'SaneDrafts, Dinner에서',
          followUps: 'SaneNoReplies',
          importance: '중요하지 않은 메일은 SaneLater로',
          keepApp: '폴더로 작동',
          otherProviders: '모든 IMAP 또는 Exchange 서버',
          phone: '메일 앱을 통해',
          bots: '메일을 폴더 사이로 옮겨 학습',
          snooze: 'Lunch부터',
          summaries: 'SaneSummary, Dinner에서',
          unsubscribe: 'SaneBlackHole 폴더',
        },
        verdict:
          '메일이 Gmail 밖에 있고 폴더만으로 충분하다면 SaneBox. Gmail을 쓰고 중요한 메일을 읽고, 요약하고, 답장까지 해 주길 원한다면 Fewmail.',
      },
      shortwave: {
        plans: {
          business: '사용자당',
          free: '대부분의 기능과 어시스턴트',
          max: '사용자당, 가장 강력한 모델',
          premier: '사용자당, 더 강력한 모델',
          pro: '전체 기록, AI 검색과 글쓰기',
        },
        summary:
          'Shortwave는 대화로 쓰는 AI 어시스턴트가 있는 메일 클라이언트예요. Fewmail은 먼저 메일을 읽고, 스스로 판단할 수 없는 것만 물어보는 에이전트예요.',
        them: {
          ask: 'AI 어시스턴트와 검색',
          drafts: '요청할 때',
          importance: '분할과 번들',
          keepApp: '메일 앱을 대체',
          memory: 'AI 메모리',
          otherProviders: 'Gmail로 전달해서',
          outlook: 'Microsoft 365 미지원',
          phone: 'iOS와 Android 앱',
          bots: 'AI 필터, 요금제별 3~50개',
          summaries: '모든 메일 상단에',
          teams: '공유 스레드와 댓글',
          unsubscribe: '원클릭 차단 포함',
        },
        verdict:
          '채팅 어시스턴트가 있는 새 받은편지함을 원한다면 Shortwave. 지금 쓰는 Gmail에서 볼 메일을 줄이고 싶다면 Fewmail.',
      },
      superhuman: {
        plans: {
          business: '멤버당 $33, 연간 결제. Auto Drafts와 Ask AI 추가',
          enterprise: 'SSO와 관리자 기능',
          starter: '멤버당 $25, 연간 결제',
        },
        summary:
          'Superhuman은 모든 메일을 더 빨리 처리하게 해 줘요. Fewmail은 대신 처리하고 내가 봐야 할 것만 보여줘요.',
        them: {
          ask: 'Ask AI, Business에서',
          drafts: 'Auto Drafts, Business에서',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox와 Auto Labels',
          keepApp: '메일 앱을 대체',
          mcp: 'Business에서',
          phone: 'iOS와 Android 앱',
          bots: 'Custom Auto Labels, Business에서',
          spamShield: '메일 서비스 제공자의 필터',
          summaries: 'Auto Summarize',
          teams: '공유 초안과 댓글',
        },
        verdict:
          '모든 메일을 직접, 더 빨리 처리하고 싶다면 Superhuman. 대부분의 메일을 아예 보고 싶지 않다면 Fewmail.',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          '많은 AI 메일 도구는 채팅창이 달린 새 받은편지함이에요. 여전히 모든 메일을 직접 읽고, 위에 요약이 붙을 뿐이죠. Fewmail은 지금 쓰는 Gmail 위에서 일하는 AI 에이전트예요. 모든 메일을 먼저 읽고, 내 말투로 답장 초안을 쓰고, 내가 결정해야 할 몇 가지만 가져와요.',
        question: 'Fewmail은 다른 AI 이메일 비서와 무엇이 다른가요?',
      },
      {
        answer:
          '아니요. Fewmail은 Gmail 위에서 작동해요. 하는 일은 모두 Gmail에도 그대로 반영되고, 쓰던 Gmail 앱도 함께 계속 쓸 수 있어요.',
        question: 'Gmail을 떠나야 하나요?',
      },
      {
        answer:
          '내 허락 없이는 절대 안 해요. 답장은 승인할 때까지 대기열에서 기다리고, 보관, 읽음 처리, 구독 취소를 스스로 할 수 있는 건 내가 만들었거나 남겨 둔 규칙뿐이에요. 한 일은 모두 처리됨에 표시돼요.',
        question: '메일을 알아서 보내거나 지우기도 하나요?',
      },
      {
        answer:
          '제목, 본문, 요약, 초안은 데이터베이스에 암호화되어 저장돼요. 내 메일은 절대 모델 학습에 쓰이지 않고, 스팸 방패는 사용자 사이에 키 해시만 공유할 뿐 주소나 내용은 공유하지 않아요.',
        question: '내 메일은 어떻게 되나요?',
      },
      {
        answer: `모든 새 계정은 카드 없이 Pro를 ${trialDays}일 동안 써요. 체험이 끝나면 그냥 Free로 남고, 아무것도 지워지거나 결제되지 않아요.`,
        question: '체험이 끝나면 어떻게 되나요?',
      },
      {
        answer:
          '초안은 답장하는 메일의 언어로 써요. 앱, 요약, Telegram 봇은 15개 언어 중 내가 고른 언어 하나로 말해요.',
        question: '어떤 언어를 지원하나요?',
      },
      {
        answer:
          '지금은 Gmail과 Google Workspace 계정이에요. 여러 메일함을 하나의 Fewmail에 추가하면 모든 메일이 같은 홈과 받은편지함으로 모여요.',
        question: '어떤 메일 계정을 쓸 수 있나요?',
      },
    ],
    features: {
      description:
        '예전엔 오후 내내 걸리던 메일 일을 뒤에서 처리하고, 확인할 수 있는 곳에 정리해 둬요.',
      items: {
        codes: {
          description:
            '새 코드는 홈 맨 위와 해당 이메일 옆에 있어 아무것도 열지 않고 복사할 수 있습니다. 무료.',
          title: '로그인 코드',
        },
        subscriptions: {
          description:
            '이번 달 메일을 보낸 모든 메일링 리스트와 실제로 연 메일 수. 어떤 것이든 키 하나로 해지. 무료.',
          title: '메일링 리스트',
        },
        ask: {
          description:
            '평소 말로 무엇이든 물어보면, 내 메일에서 찾은 답을 근거가 된 메일과 함께 보여줘요.',
          title: '메일에 묻기',
        },
        calendar: {
          description:
            '모든 메일함의 캘린더를 한 화면에. 메일로 제안된 회의는 내가 승인하면 일정이 돼요.',
          title: '캘린더',
        },
        clearOut: {
          description:
            '쌓인 메일을 한 번에 정리해요. 메일함마다 최대 50,000통, 모두 라벨 하나로 묶어 두니 되돌리기 한 번이면 전부 돌아와요. 무료.',
          title: '받은편지함 정리',
        },
        reading: {
          description:
            '오늘의 뉴스레터를 하나의 요약으로: 주제별 소식, 문장마다 출처 링크, 끝까지 읽을 만한 것까지.',
          title: '읽을거리',
        },
        voice: {
          description:
            '뉴스레터 요약을 소리로 들어 보세요. Telegram이나 WhatsApp에서 음성 메시지를 보내면 에이전트가 소리 내어 답합니다.',
          title: '읽지 말고 들으세요',
        },
        wrapped: {
          description:
            '메일로 본 내 한 달, 한 해. 무엇이 왔고, 무엇을 처리했고, 시간을 얼마나 아꼈는지 보여줘요. 공유할 수 있고, 이름은 절대 나오지 않아요.',
          title: '메일로 본 한 해',
        },
      },
      label: '그리고 나머지',
      title: '비서가 해 줄 법한 나머지 일도 전부.',
    },
    footer: {
      legal: '법적 고지',
      product: '제품',
      tagline: 'Gmail을 읽고 내가 봐야 할 것만 보여주는 AI 메일 에이전트.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: '이제 그만.',
      label: '사라지는 것',
      rows: [
        {
          fix: '받은편지함 정리가 쌓인 메일을 한 번에 치워요. 오래된 광고, 읽은 알림, 열지 않는 뉴스레터까지. 되돌리기 한 번이면 모든 메일이 돌아와요.',
          problem: '아무도 읽지 않을 수천 통의 메일.',
        },
        {
          fix: '답장은 내 말투와 상대의 언어로 미리 써 둬요. 비슷한 답장은 ⇧⏎로 한꺼번에 승인하고, 하나하나 확인할 수도 있어요.',
          problem: '한밤중에 메일 답장하기.',
        },
        {
          fix: '키 하나로 사람처럼 구독을 해지합니다: 원클릭, 구독 해지 페이지 또는 이메일. 그래도 계속 보내는 발신자는 잡아내 스팸으로 제안합니다.',
          problem: '구독한 적도 없는 뉴스레터.',
        },
        {
          fix: '오늘의 뉴스레터가 주제별 요약 하나가 되고, 끝까지 읽을 만한 것도 알려 줍니다.',
          problem: '읽으려고 했던 뉴스레터.',
        },
        {
          fix: '바뀐 결제 정보, 비슷하게 꾸민 도메인, 알려진 피싱은 행동하기 전에 경고해 줘요.',
          problem: '계좌 정보가 바뀐 청구서.',
        },
        {
          fix: '보낸 메일에서 한 약속은 기한이 되면 다시 알려 주고, 아무도 답하지 않은 스레드에는 후속 연락이 붙어요.',
          problem: '약속해 놓고 잊어버린 일.',
        },
        {
          fix: 'Telegram이나 WhatsApp으로는 급한 메일만 와요. 나머지는 이미 정리된 채로 홈에서 기다리니, 원할 때 보면 돼요.',
          problem: '혹시 몰라 저녁 먹다가도 메일 확인하기.',
        },
      ],
      title: '메일 고민, 이제 그만.',
    },
    hero: {
      needs: {
        emphasis: '나를 기다려요.',
        lead: (handled: string) =>
          `Anna는 계약서를 기다리고 있고, Northwind 청구서는 다음 주가 기한이며, Marco는 목요일에 시간을 잡고 싶어 해요. 뉴스레터와 알림 ${handled}통은 처리했고, 새 메일이 오면 홈이 알아서 업데이트돼요.`,
        tag: '홈 · 목요일 08:12',
        title: '세 가지가 나를 기다려요.',
      },
      fates: {
        archived: '보관',
        markedRead: '읽음 표시',
        spam: '스팸',
        summarised: '요약',
        unsubscribed: '구독 취소',
      },
      handled: ((slots) => [
        slots.count,
        '개 처리됨, 모두 이유와 함께',
      ]) as Rich<'count'>,
      inbox: '받은편지함',
      lead: '뉴스레터, 영수증, 알림, 피싱 링크, 그리고 그 사이 어딘가에 정말 중요한 메일 세 통. Fewmail은 그 모든 걸 대신 읽어 주는 AI 에이전트예요.',
      needYou: ((slots) => ['확인 필요 ', slots.count, '개']) as Rich<'count'>,
      queue: [
        {
          reason: '계약 기한 내일',
          summary: '금요일 킥오프 전에 서명한 계약서를 돌려받아야 해요.',
        },
        {
          reason: '청구서 · 11월 20일까지 $1,240',
          summary:
            '웹사이트 리디자인 10월 청구서예요. 계좌 정보는 지난번과 같아요.',
        },
        {
          reason: '회의 제안',
          summary:
            '목요일 15:00를 제안했어요. 16:00부터 시간이 비어서, 초안에서는 4시로 하자고 해요.',
        },
      ],
      reading: {
        emphasis: '하나도 빠짐없이',
        lead: '쓸모없는 메일은 보관하고, 열지 않는 뉴스레터는 구독을 취소하고, 사기는 문 앞에서 막아요. 한 일마다 이유를 적어 두니 언제든 확인할 수 있어요.',
        title: 'Fewmail이 하나도 빠짐없이 읽어요.',
      },
      remind: '11월 19일에 알림',
      remindPlan: '청구서 목록에 추가하고 11월 19일에 알려 줘요.',
      start: 'Google로 무료로 시작하기',
      title: '메일은 당신의 일이 아니에요.',
      home: '홈',
      tryQueue: '대기열 써 보기',
      unread: ((slots) => ['안 읽음 ', slots.count, '개']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        '받은편지함에 안 읽은 메일 ',
        slots.count,
        '개',
      ]) as Rich<'count'>,
      willDo: 'Fewmail이 할 일',
    },
    nav: {
      assistant: 'AI 이메일 비서',
      compare: '비교',
      features: '기능',
      mcp: 'MCP 서버',
      pricing: '요금',
      signIn: '로그인',
    },
    play: {
      again: '다시 정리하기',
      doneLead: (handled: string) =>
        `결정은 세 번만 했어요. 나머지 ${handled}통은 Fewmail이 처리하고 이유를 적어 뒀어요.`,
      doneTitle: '오늘은 여기까지예요.',
      emphasis: '2분이면 끝.',
      handled: [
        'Lumen Weekly: 최근 30호를 하나도 열지 않았어요',
        'paypa1-billing.com이 paypal.com처럼 보여요',
        'Parcelhub: 배송 알림, “영수증과 배송” 규칙으로',
      ],
      handledTitle: '자는 동안 처리한 것',
      label: '직접 해 보기',
      lead: '이제 아침은 이렇게 시작돼요. 초안은 써 있고, 이유도 적혀 있고, 결정은 내가 해요. 자, 한번 정리해 보세요.',
      left: (count: number) => `결정할 것 ${count}개`,
      title: '받은편지함 전체, 2분이면 끝.',
    },
    plans: {
      agent: '에이전트',
      details: '모든 플랜 자세히 보기',
      emails: '에이전트가 한 달에 읽는 이메일',
      everyPlan: '모든 플랜에 포함',
      messages: '또는 에이전트에게 보내는 메시지',
      oneAllowance:
        '에이전트가 하는 모든 일에 하나의 사용량: 쓴 만큼만, 잡음은 세지 않아요',
      forever: '평생',
      free: {
        description: '홈, 분류, 규칙, 보호. 평생 무료.',
      },
      max: {
        description: '바쁜 받은편지함을 위한, 같은 에이전트.',
      },
      monthly: '월간',
      per: { month: '/ 월', year: '/ 년' },
      lite: {
        description: '에이전트의 모든 것: 읽고, 쓰고, 기억해요.',
      },
      pro: {
        description: '같은 에이전트, 더 많은 메일을 위한 여유.',
      },
      tryFree: (days: number) => `${days}일 무료 체험`,
      yearly: '연간 · 두 달 무료',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `홈, 분류, 평소 말로 쓰는 규칙, 보호 기능은 평생 무료예요. Pro는 대신 읽고, 쓰고, 기억하는 에이전트이고, Max는 바쁜 받은편지함을 위해 여유를 더한 같은 에이전트예요. 모든 계정은 Pro ${trialDays}일로 시작하고, 끝나면 그냥 Free로 남아요.`,
      otherTool: '다른 도구를 고민 중인가요?',
      title: '받은편지함이 아니라 에이전트에 돈을 내세요.',
    },
    startFree: '무료로 시작하기',
    trialNote: (days: number) =>
      `Pro ${days}일, 카드 필요 없음. 그 뒤로는 원하는 만큼 무료예요.`,
    trust: {
      emphasis: '먼저 물어봐요',
      label: '내 메일, 내가 결정',
      places: '지금 쓰는 Gmail 위에서 작동하고, 여기서도 받아요',
      title: '행동하기 전에 먼저 물어봐요.',
      vows: [
        {
          description:
            '초안은 나를 기다려요. 보관, 읽음 처리, 구독 취소를 스스로 할 수 있는 건 내가 만들었거나 남겨 둔 규칙뿐이고, 규칙이 한 일은 모두 처리됨에 표시돼요.',
          title: '내 승인 없이는 아무것도 보내지 않아요.',
        },
        {
          description:
            '제목, 본문, 요약, 초안은 데이터베이스에 암호화되어 저장돼요. 저장한 초안은 Gmail에 남고, 저희 쪽에는 남지 않아요.',
          title: '저장할 때 암호화돼요.',
        },
        {
          description:
            '스팸 방패는 키 해시를 통해 모두에게서 배워요. 내 메일의 주소도, 단어 하나도 공유되지 않아요.',
          title: '모델 학습에는 절대 쓰지 않아요.',
        },
      ],
    },
  },
  skills: {
    bills: '다가오는 청구서와 결제',
    cancel: '유료 구독 해지하기',
    cleanup: '정리할 뉴스레터',
    followups: '아직 답이 없는 사람',
    reading: '오늘의 뉴스레터를 한 번에 요약',
    today: '오늘 챙겨야 할 일',
    waiting: '답장을 기다리는 사람',
    week: '이번 주 메일 요약',
  },
  snooze: {
    laterToday: '오늘 나중에',
    nextWeek: '다음 주',
    title: '다시 알림',
    tomorrow: '내일',
    unsnooze: '받은편지함으로',
    until: (date: string) => `${date}까지 다시 알림`,
    weekend: '이번 주말',
  },
  spam: {
    reasonList: '스팸 발신 도메인 공개 목록에 있어요',
    reasonPattern: {
      auth: '발신자 인증 실패: 주소가 위조됐어요',
      infra: '여러 Fewmail 사용자가 스팸으로 신고한 네트워크에서 보냈어요',
      link: '여러 Fewmail 사용자가 스팸으로 신고한 사이트로 연결돼요',
      signals: '새 도메인, 이상한 주소, 약한 인증이 함께 나타나요',
      template: '여러 Fewmail 사용자가 스팸으로 신고한 내용과 같아요',
    },
    reasonCommunity: '여러 Fewmail 사용자가 스팸으로 신고했어요',
    reasonYou: '이 발신자를 스팸으로 신고했어요',
    suspect: '스팸 같아요',
    imagesHidden: '스팸의 이미지는 숨겨져 있어요.',
    openFile: {
      action: '열기',
      description:
        '이 메일은 스팸함에 있어요. 보낸 사람을 신뢰할 때만 파일을 여세요.',
      title: (name: string) => `${name}을(를) 열까요?`,
    },
    showImages: '이미지 보기',
  },
  starterBots: {
    board: { name: '보드' },
    important: {
      instruction:
        '내가 직접 움직여야 하는 것: 내 답장을 기다리는 사람, 납부할 청구서, 보안 알림, 은행이나 정부 기관에서 온 모든 것. 홈에 두기',
      name: '중요',
    },
    later: {
      instruction:
        '알아 두면 좋지만 결정할 필요는 없는 것: 쓰고 있는 서비스의 소식, 배송, 일정과 날짜',
      name: '나중에',
    },
    quick: {
      instruction:
        '읽지 않고 치워 버릴 소음: 알림, 영수증, 뉴스레터, 프로모션, 모르는 곳의 영업 메일. 정리하기: 보관, 읽음 표시, 구독 취소 중 맞는 것으로',
      name: '빠르게',
    },
  },
  telegram: {
    approveAlike: '같은 종류의 카드를 한 번에 승인:',
    chatTaken:
      '이 채팅은 이미 다른 Fewmail 계정에 연결되어 있어요. 먼저 그 계정에서 Telegram 연결을 해제한 뒤(설정 → 연동) 링크를 다시 여세요.',
    queueChanged: '그사이 카드가 바뀌었어요. 지금 확인이 필요한 것은 이거예요:',
    heard: (text: string) => `들은 내용: “${text}”`,
    voiceFailed: '잘 알아듣지 못했어요. 다시 말하거나 입력해 주세요.',
    help: '필요한 것을 쓰거나 말해 주세요:\n• 메일에 대해 묻기: “넷플릭스 갱신일이 언제야?”\n• 답장 내용 말하기: “안나에게 내일 서명한다고 전해 줘”\n• 일 맡기기: “Medium 뉴스레터는 항상 보관해 줘”\n• 초안을 바꾸려면 그 초안에 답장하기',
    canceled: '취소했어요. 초안이 대기열로 돌아갔어요.',
    sendingIn: (seconds: number) => `${seconds}초 후 전송`,
    undo: '실행 취소',
    commands: { queue: '확인이 필요한 것' },
    connectFirst: (url: string) =>
      `안녕하세요! Fewmail이에요. 여기 Telegram에서 급한 메일이 오면 알려 드리고, 확인이 필요한 것을 보여 드리고, 승인한 답장을 보내 드려요.\n\n이 채팅은 아직 Fewmail에 연결되지 않았어요. 1분이면 돼요:\n1. Fewmail 설정 열기: ${url}\n2. 연동에서 “Telegram 연결”을 누르세요 (Fewmail Pro 기능이에요).\n3. Telegram이 여기로 다시 데려와요. 시작을 누르면 끝이에요.`,
    connected:
      '연결됐어요. 긴급한 메일이 오면 바로 알려드릴게요.\n\n/queue: 확인이 필요한 것',
    done: '완료',
    draft: '초안:',
    edit: '편집',
    editPrompt:
      '대신 쓸 내용을 보내거나, “/”로 시작해 어떻게 바꿀지 알려주세요. 예: “/더 격식 있게”.',
    newDraft: '새 초안:',
    nothing: '지금은 확인할 게 없어요.',
    proOnly:
      'Telegram은 Fewmail Pro 기능이에요. 업그레이드하려면 Fewmail에서 설정 → 요금제를 열어 주세요.',
    draftClipped:
      '여기서는 일부만 보여 줘요. “보내기”를 누르면 초안 전체가 전송돼요. 전체 내용은 Fewmail에서 확인하세요.',
    rewriting: '다시 쓰는 중…',
    send: '보내기',
    sendThis: '이대로 보내기',
    shorter: '더 짧게',
    skip: '건너뛰기',
    skipped: '건너뜀',
    somethingWrong: '문제가 발생했어요',
    urgent: '긴급',
    willSend: '보낼 내용:',
  },
  today: {
    working: '처리 중…',
    botSuggestion: {
      done: {
        archive: '이제부터 새 봇이 이 보낸 사람의 메일을 보관해요.',
        mark_read: '이제부터 새 봇이 이 보낸 사람의 메일을 읽음으로 표시해요.',
      },
      label: '추천 봇',
      lead: (count: number, effect: 'archive' | 'mark_read') =>
        effect === 'archive'
          ? `이번 달 ${count}통, 에이전트라면 모두 보관합니다`
          : `이번 달 ${count}통, 에이전트라면 모두 읽음으로 표시합니다`,
      no: '괜찮아요',
      yes: {
        archive: '항상 보관',
        mark_read: '항상 읽음으로 표시',
      },
    },
    newSender: {
      archive: '항상 보관',
      archived: '이제부터 새 봇이 이 보낸 사람의 메일을 보관해요.',
      keep: '평소대로 두기',
      label: '새 보낸 사람',
      lead: (count: number, opened: number) =>
        `2주 동안 ${count}통, ${opened === 0 ? '열어 본 메일 없음' : `${opened}통 열어 봄`}`,
    },
    readingNow: (total: number) =>
      `에이전트가 새 메일 ${total}통을 읽는 중이에요`,
    allDone: '모두 끝났어요. 확인할 게 없어요.',
    allDoneLead:
      '새 메일을 계속 읽고 있어요. 확인할 게 생기면 여기에 나타나요.',
    allowanceSpent: (date: string) =>
      `이번 달 에이전트 사용량을 모두 썼어요. 요약과 초안은 ${date}에 다시 돌아와요. 그때까지도 약속과 마감일은 계속 적어 둘게요.`,
    byBots: (n: number) => `${n}개는 봇이 처리했어요.`,
    decisions: '결정할 일',
    journal: {
      approved: '승인함',
      byBot: (bot: string) => `내 봇: ${bot}`,
      failed: '실패함',
      lead: '최근 7일. 메일과 캘린더의 모든 변경은 승인을 받았거나 알아서 처리하도록 맡긴 봇에 따른 거예요.',
      title: '메일에서 처리된 일',
    },
    progress: (done: number, total: number) => `${done}/${total}`,
    mostlyNoise: (people: number) =>
      people === 0
        ? '모두 뉴스레터와 알림이에요.'
        : `대부분 뉴스레터와 알림이고, 사람이 보낸 건 ${people}통뿐이에요.`,
    worth: {
      awaiting: (total: number) =>
        plural('ko', total, {
          one: () => '답장 기다리는 중 1개',
          other: (n) => `답장 기다리는 중 ${n}개`,
        }),
      dated: (total: number) =>
        plural('ko', total, {
          one: () => '날짜 있는 메일 1개',
          other: (n) => `날짜 있는 메일 ${n}개`,
        }),
    },
    worthKnowing: '알아 두면 좋은 것',
    canWait: '나중에 봐도 돼요',
    canWaitEmpty: {
      lead: '여유 있을 때 읽을 메일과 기다리는 답장이 여기에 모여요.',
      title: '기다리는 메일이 없어요.',
    },
    improve: {
      empty: {
        lead: '같은 발신자의 메일을 매번 같은 방식으로 처리하면 에이전트가 여기에서 봇을 제안해요.',
        title: '지금은 제안이 없어요.',
      },
      lead: (total: number) =>
        `에이전트가 만들어 줄 수 있는 봇이 ${total}개 있어요.`,
      title: '에이전트의 제안',
    },
    quick: '빠르게',
    needsLook: '확인 필요',
    tidy: {
      failed: (emails: string) =>
        `Gmail에서 ${emails}를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.`,
      confirm: (emails: string) => `${emails}를 정리할까요?`,
      running: '정리 중…',
      unsubscribeHint:
        'Fewmail이 구독을 취소할 메일링 리스트가 포함되어 있고, 구독 취소는 되돌릴 수 없어요.',
      archive: (n: number) => `보관 ${n}개`,
      review: '확인',
      reviewLead:
        '각 메일과 에이전트가 할 일, 그 이유예요. 맞는 건 승인하고, 그대로 둘 건 남겨 두세요.',
      reviewTitle: '에이전트의 제안 확인',
      done: (n: number) => `${n}개 정리함`,
      keep: '그대로 두기',
      mark_read: (n: number) => `읽음 표시 ${n}개`,
      run: '모두 승인',
      unsubscribe: (n: number) => `구독 취소 ${n}개`,
      untilYouApprove: '승인하기 전까지 메일은 바뀌지 않아요',
      spam: (n: number) => `스팸으로 ${n}개`,
      trash: (n: number) => `삭제 ${n}개`,
    },
    pauseListening: '일시정지',
    resumeListening: '이어 듣기',
    awaiting: '답장 대기 중',
    hint: {
      messengers: {
        lead: '급한 메일을 받고 초안을 승인하세요. 이미 쓰는 메신저에서요.',
        title: 'Telegram 또는 WhatsApp',
      },
      notNow: '나중에',
      setUp: '설정하기',
      turnOn: '켜기',
    },
    dates: '날짜와 일정',
    done: '완료',
    firstRead:
      '최근 3일간의 메일부터 시작해요. 확인할 게 생기면 여기에 바로 나타나요.',
    approvedMany: (n: number) => `${n}개 승인됨`,
    listen: '듣기',
    handled: {
      spam: (n: number) => `${n}개 스팸`,
      archived: (n: number) => `${n}개 보관`,
      markedRead: (n: number) => `${n}개 읽음 처리`,
      review: '검토',
      total: (n: number) => `${n}개 처리됨`,
      unsubscribed: (n: number) => `${n}개 구독 취소`,
    },
    headline: (n: number) =>
      n === 0 ? '모두 평온해요.' : `확인이 필요한 일이 ${n}개 있어요.`,
    period: (days: number) => (days === 1 ? '지난 하루' : `지난 ${days}일`),
    pulse: {
      lists: (n: number) => `메일링 리스트에서 ${n}통`,
      people: (n: number) => `사람에게서 ${n}통`,
      total: (n: number, period: string) => `${period} 메일 ${n}통`,
    },
    saved: (minutes: number) =>
      `이번 주 Fewmail이 아껴 준 시간: 약 ${formatMinutes('ko', minutes)}`,
    recent: (period: string) => `${period}의 다른 메일`,
    sent: '보냄',
    codes: '인증 코드',
  },
  bulk: {
    badge: (n: number) => `Fewmail 사용자 ${n}명 이상에게 발송됨`,
    reason: (n: number) =>
      `대량 메일: Fewmail 사용자 ${n}명 이상이 같은 내용을 받았어요`,
  },
  cold: {
    reason: '콜드 메일: 한 번도 메일을 보낸 적 없는 사람의 영업 메일이에요',
  },
  board: {
    lead: {
      coming: (total: number) =>
        plural('ko', total, {
          one: () => '마감일이 하나 다가와요.',
          other: (n) => `마감일이 ${n}개 다가와요.`,
        }),
      owed: (amounts: string) => `받을 돈: ${amounts}.`,
      promised: (total: number) =>
        plural('ko', total, {
          one: () => '한 가지를 약속했어요.',
          other: (n) => `${n}가지를 약속했어요.`,
        }),
      waiting: (total: number) =>
        plural('ko', total, {
          one: () => '아직 이행되지 않은 약속이 하나 있어요.',
          other: (n) => `아직 이행되지 않은 약속이 ${n}개 있어요.`,
        }),
    },
    section: {
      coming: '다가오는 일',
      owed: '받을 것',
      promised: '내가 한 약속',
      settled: '최근 끝난 일',
    },
    state: {
      acknowledged: '답은 왔지만 아직 안 됨',
      broken: '이뤄지지 않음',
      cancelled: '취소됨',
      fulfilled: '완료',
      in_progress: '진행 중',
      open: '기다리는 중',
      overdue: '기한 지남',
    },
    by: (date: string) => `${date}까지`,
    lastDay: (date: string) => `마감일: ${date}`,
    done: '완료',
    forget: '목록에서 삭제',
    reopen: '다시 열기',
    markedDone: '완료로 표시했어요',
    forgotten: '목록에서 삭제했어요',
    reopened: '다시 열었어요',
  },
  cleanup: {
    emails: (total: number) => `이메일 ${total}개`,
    reason: (total: number) => `이번 달 ${total}개, 하나도 열지 않았어요`,
    title: (total: number) => `열지 않는 뉴스레터 ${total}개 구독 취소`,
  },
  clearOut: {
    partial: 'Gmail이 정리 일부를 멈췄어요. 이미 옮긴 메일은 되돌릴 수 있어요.',
    groups: {
      lists: '한 번도 열지 않은 뉴스레터',
      notifications: '읽은 알림, 한 달 지난 메일',
      old: '1년 지난 모든 메일',
      promotions: '광고와 소셜, 3일 지난 메일',
    },
    done: (emails: string) => `${emails} 정리 완료`,
    empty: '정리할 메일이 없어요. 받은편지함이 이미 깔끔해요.',
    lead: (emails: string) =>
      `받은편지함에 ${emails}. 정리할 수 있는 메일이에요.`,
    leadCapped: (emails: string) =>
      `받은편지함에 ${emails} 이상. 정리할 수 있는 메일이에요.`,
    left: (emails: string) => `받은편지함에 남는 메일: ${emails}`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} 외 ${more}개` : names,
    ready: (emails: string) => `정리 가능: ${emails}`,
    review: '보기',
    run: (emails: string) => `${emails} 정리`,
    safe: '아무것도 삭제하지 않아요. 정리한 메일은 Fewmail/Cleared 라벨로 보관되고 한 번에 되돌릴 수 있어요. 뉴스레터는 구독도 해지해요.',
    scanning: '받은편지함 전체를 헤더만 읽고 있어요. 최대 1분.',
    title: '받은편지함 정리',
    undo: '모두 되돌리기',
    undone: (emails: string) => `받은편지함으로 돌아온 메일: ${emails}`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `가장 바쁜 요일: ${day} · 시간대: ${hours}`,
    copied: '링크를 복사했어요',
    copyLink: '링크 복사',
    cta: 'Fewmail로 나만의 기록 받기',
    emails: '통의 메일 수신',
    empty: '아직 이야기할 만큼 메일이 없어요. 며칠 뒤에 다시 와 주세요.',
    handled: '통의 메일을 Fewmail이 처리',
    handledHint:
      'Fewmail은 승인 없이 Gmail에서 아무것도 바꾸지 않아요. 봇이 알아서 처리하도록 맡기면 이런 메일을 대신 처리해요.',
    people: '가장 많이 보낸 사람',
    period: { month: '이번 달', year: '올해' },
    replies: 'Fewmail이 쓰고 보낸 답장',
    saveImage: '이미지 저장',
    saved: 'Fewmail이 아껴 준 시간',
    shareNote:
      '링크와 이미지에는 이 숫자만 담기고, 이름이나 주소는 담기지 않아요.',
    shared: { month: '메일로 본 한 달', year: '메일로 본 한 해' },
    spam: '막은 스팸',
    split: (people: string, lists: string, other: string) =>
      `사람에게서 ${people} · 뉴스레터에서 ${lists} · 기타 ${other}`,
    title: { month: '메일로 본 이번 달', year: '메일로 본 올해' },
    unsubscribed: '떠난 뉴스레터',
  },
  reading: {
    markAllRead: '모두 읽음으로 표시',
    summary: '뉴스레터 내용 요약',
    worth: '전문을 읽어 볼 만해요',
    leftOut: (n: number) => `요약에서 뺀 것: ${n}개, 새로운 내용이 없어요.`,
    note: {
      inSummary: '요약에 포함',
      leftOut: '제외',
    },
    digest: (n: number) => `뉴스레터: ${n}개`,
    lead: '하루치 뉴스레터를 한곳에 모아 받은편지함을 비워 둬요.',
    issues: '모든 호',
    empty: '아직 뉴스레터가 없어요',
    emptyHint:
      '매일 아침 에이전트가 뉴스레터에서 뽑은 소식을 여기에 정리해요. 각 줄은 출처 이메일로 연결돼요.',
    title: '읽을거리',
  },
  commitments: {
    title: '내가 한 약속',
  },
  headsUp: {
    deadline: '마감 임박',
    notYet: '그 뒤로 아무것도 오지 않았어요',
    price: '가격 인상',
    priceUp: (what: string, from: string, to: string) =>
      `${what}: ${from} → ${to}`,
    promised: '나에게 한 약속',
  },
  risk: {
    prompt_injection: (domain: string) =>
      `${domain}이(가) 이 이메일에 메일을 읽는 어시스턴트용 지시를 숨겼어요. 에이전트는 이를 무시해요. 전달하거나 요청대로 하지 마세요.`,
    known_phishing: (domain: string) =>
      `${domain}은(는) 활성 피싱 사이트 공개 목록에 있어요. 링크를 열거나 로그인하거나 결제하지 마세요.`,
    credential_phishing: (domain: string) =>
      `${domain}이 로그인하거나 카드·계정 정보를 입력하라고 요구해요. 은행과 서비스는 이메일로 그런 걸 요구하지 않아요. 링크를 누르거나 아무것도 입력하지 마세요.`,
    lookalike_domain: (domain: string) =>
      `${domain}처럼 보이지만 다른 주소예요. 링크를 누르거나 결제하지 마세요.`,
    new_sender_payment: (domain: string) =>
      `${domain}에서 온 첫 이메일인데 돈을 요청하고 있어요. 이미 신뢰하는 다른 경로로 확인하세요.`,
    spoofed_sender: (domain: string) =>
      `${domain}에서 보냈다고 하지만 ${domain}이 보낸 메일이 아니에요. 링크를 누르거나 결제하지 마세요.`,
    payment_change: (domain: string) =>
      `${domain}에서 새 결제 정보를 보냈어요. 결제하기 전에 전화로 확인하세요.`,
    title: '행동하기 전에 확인하세요',
  },
  upgrade: {
    hints: {
      board:
        'Fewmail Pro에 포함돼요. 에이전트가 메일에서 받은 약속, 한 약속, 마감일을 적어 두고 끝날 때까지 챙겨요.',
      chat: 'Fewmail Pro 기능이에요. 봇과 맡은 메일에 대해 이야기하면, 봇은 말한 때에 다시 찾아와요.',
      drafts:
        'Fewmail Pro 기능이에요. 에이전트가 내 말투로 답장을 쓰고, 나는 고쳐서 보내기만 하면 돼요.',
    },
  },
  whatsapp: {
    phoneTaken:
      '이 번호는 이미 다른 Fewmail 계정에 연결되어 있어요. 먼저 그 계정에서 WhatsApp 연결을 해제한 뒤(설정 → 연동) 메시지를 다시 보내세요.',
    connectFirst: (url: string) =>
      `안녕하세요! Fewmail입니다. 여기 WhatsApp에서 급한 메일이 오면 알려 드리고, 처리할 일을 보여 드리고, 승인한 답장을 보내 드려요.\n\n이 번호는 아직 Fewmail에 연결되지 않았어요. 1분이면 됩니다:\n1. Fewmail 설정 열기: ${url}\n2. 연동에서 “WhatsApp 연결”을 누르세요(Fewmail Pro 기능).\n3. 준비된 메시지와 함께 WhatsApp이 열리면 보내기만 하면 끝이에요.`,
    connected:
      '연결됐어요. 긴급한 메일이 오면 바로 알려 드릴게요. 텍스트나 음성 메시지로 어떤 메일에도 답장할 수 있어요.',
    proOnly:
      'WhatsApp은 Fewmail Pro 기능이에요. 업그레이드하려면 Fewmail에서 설정 → 요금제를 열어 주세요.',
  },
  zombie: {
    badge: (share: number) => `${share}%의 사람에게 구독 취소를 무시해요`,
    reason: '구독 취소 후에도 계속 메일을 보냈어요',
  },
}
