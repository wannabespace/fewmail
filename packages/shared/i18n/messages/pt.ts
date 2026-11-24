import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const pt: Messages = {
  actionDone: {
    heads_up: 'Entendi',
    commitment: 'Feito',
    confirm: 'Já confirmei',
    follow_up: 'Já acompanhei',
    pay: 'Já paguei',
    read: 'Já li',
    renew: 'Já renovei',
    schedule: 'Já agendei',
    security: 'Já verifiquei',
    sign: 'Já assinei',
  },
  actionLink: {
    confirm: 'Confirmar',
    pay: 'Pagar',
    read: 'Ler',
    renew: 'Renovar',
    sign: 'Assinar',
  },
  actionKind: {
    heads_up: 'Atenção',
    cleanup: 'Cancelar todas',
    consent: 'Aprovar',
    commitment: 'Prometido',
    security: 'Verificar',
    spam: 'Mover para spam',
    archive: 'Arquivar',
    follow_up: 'Acompanhar',
    mark_read: 'Marcar como lido',
    pay: 'Pagar',
    read: 'Vale a pena ler',
    reply: 'Responder',
    schedule: 'Agendar',
    trash: 'Mover para lixeira',
    unsubscribe: 'Cancelar inscrição',
  },
  actionStatus: {
    auto_done: 'feito sozinho',
    dismissed: 'pulado',
    done: 'feito',
    failed: 'falhou',
    pending: 'aguarda você',
  },
  agent: {
    decideOnHome: 'Decida no Fewmail',
    fromAgent: 'O agente pede',
    mcpAsks: (client: string) => `${client} pede via MCP`,
    calendar: (email: string) => `Na agenda de ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      dismiss_action: 'Pular este cartão?',
      create_event: 'Adicionar este evento?',
      delete_event: 'Eliminar este evento?',
      update_event: 'Alterar este evento?',
      approve_action: 'Fazer esta ação?',
      archive_thread: 'Arquivar esta conversa?',
      clear_out: 'Limpar estes grupos de e-mails da caixa de entrada?',
      undo_clear_out:
        'Trazer de volta para a caixa de entrada tudo o que foi limpo?',
      create_bot: 'Criar este bot?',
      update_bot: 'Alterar este bot?',
      reply: 'Enviar esta resposta?',
      send_email: 'Enviar este e-mail?',
      snooze_thread: 'Adiar esta conversa?',
      unsubscribe: 'Cancelar a inscrição deste remetente?',
      tidy_mail: 'Arrumar estes e-mails tranquilos?',
      trash_thread: 'Mover esta conversa para a lixeira?',
      report_spam: 'Denunciar este remetente como spam?',
      mark_not_spam: 'Tirar esta conversa do spam?',
      move_to_inbox: 'Devolver esta conversa à caixa de entrada?',
    },
    retry: 'Tentar de novo',
    steps: {
      create_event: 'A adicionar um evento',
      delete_event: 'A eliminar o evento',
      list_events: 'A ver o calendário',
      update_event: 'A alterar o evento',
      list_subscriptions: 'Lendo listas de e-mail',
      approve_action: 'Aprovando',
      archive_thread: 'Arquivando',
      get_reading: 'Lendo as newsletters',
      get_wrapped: 'Contando seu e-mail',
      clear_out: 'Limpando a caixa de entrada',
      preview_clear_out: 'Lendo toda a caixa de entrada',
      undo_clear_out: 'Trazendo de volta os e-mails limpos',
      create_bot: 'Criando um bot',
      update_bot: 'Alterando um bot',
      dismiss_action: 'Pulando',
      draft_reply: 'Escrevendo uma resposta',
      create_draft: 'Salvando um rascunho',
      find_people: 'Procurando o endereço',
      get_person: 'Procurando a pessoa',
      get_today: 'Vendo o dia',
      list_handled: 'Conferindo o que foi tratado',
      list_mail: 'Buscando nos e-mails',
      get_bot_chat: 'Lendo o chat',
      list_bots: 'Lendo seus bots',
      read_thread: 'Lendo a conversa',
      redraft_action: 'Reescrevendo o rascunho',
      refresh: 'Buscando e-mails novos',
      remind_later: 'Criando um lembrete',
      send_email: 'Enviando',
      snooze_thread: 'Adiando',
      unsubscribe: 'Cancelando inscrição',
      tidy_mail: 'Arrumando',
      trash_thread: 'Movendo para a lixeira',
      report_spam: 'Denunciando spam',
      mark_not_spam: 'Tirando do spam',
      move_to_inbox: 'Movendo para a caixa de entrada',
      list_promises: 'Verificando promessas',
      set_promise_status: 'Atualizando a promessa',
    },
    to: (recipients: string) => `Para ${recipients}`,
    until: (time: string) => `Até ${time}`,
    yes: {
      dismiss_action: 'Pular',
      create_event: 'Adicionar',
      delete_event: 'Eliminar',
      update_event: 'Guardar',
      approve_action: 'Aprovar',
      archive_thread: 'Arquivar',
      clear_out: 'Limpar',
      undo_clear_out: 'Trazer de volta',
      create_bot: 'Criar bot',
      update_bot: 'Salvar',
      reply: 'Enviar',
      send_email: 'Enviar',
      snooze_thread: 'Adiar',
      unsubscribe: 'Cancelar inscrição',
      tidy_mail: 'Arrumar',
      trash_thread: 'Para a lixeira',
      report_spam: 'Denunciar spam',
      mark_not_spam: 'Não é spam',
      move_to_inbox: 'Devolver',
    },
  },
  byBot: 'por um bot',
  bulk: {
    badge: (n: number) => `Enviado para ${n}+ usuários do Fewmail`,
    reason: (n: number) =>
      `E-mail em massa: ${n}+ usuários do Fewmail receberam o mesmo texto`,
  },
  cold: {
    reason:
      'Contato frio: um desconhecido oferecendo algo, e você nunca escreveu para esse endereço',
  },
  calendar: {
    tomorrow: 'Amanhã',
    allDay: 'Dia inteiro',
    calendar: 'Calendário',
    create: 'Adicionar evento',
    delete: 'Eliminar',
    deleted: 'Evento eliminado',
    description: 'Descrição',
    editEvent: 'Editar evento',
    endBeforeStart: 'O evento termina antes de começar',
    ends: 'Fim',
    location: 'Local',
    newEvent: 'Novo evento',
    next: 'Seguinte',
    openInGoogle: 'Abrir no Google Agenda',
    previous: 'Anterior',
    save: 'Guardar',
    saved: 'Evento guardado',
    saving: 'A guardar o evento…',
    scope: {
      this: 'Só este evento',
      following: 'Este e os seguintes',
      all: 'Todos os eventos',
    },
    starts: 'Início',
    title: 'Calendário',
    titlePlaceholder: 'Adicione um título',
    today: 'Hoje',
    untitled: '(Sem título)',
    views: {
      day: 'Dia',
      week: 'Semana',
      month: 'Mês',
      year: 'Ano',
    },
  },
  category: {
    calendar: 'Agenda',
    finance: 'Finanças',
    newsletter: 'Newsletter',
    notification: 'Notificação',
    other: 'Outros',
    person: 'Pessoa',
    promotion: 'Promoção',
    receipt: 'Recibo',
    security: 'Segurança',
    travel: 'Viagem',
    work: 'Trabalho',
  },
  board: {
    lead: {
      coming: (total: number) =>
        plural('pt', total, {
          one: () => 'Um prazo está chegando.',
          other: (n) => `${n} prazos estão chegando.`,
        }),
      owed: (amounts: string) => `Te devem ${amounts}.`,
      promised: (total: number) =>
        plural('pt', total, {
          one: () => 'Você prometeu uma coisa.',
          other: (n) => `Você prometeu ${n} coisas.`,
        }),
      waiting: (total: number) =>
        plural('pt', total, {
          one: () => 'Uma promessa feita a você ainda está aberta.',
          other: (n) => `${n} promessas feitas a você ainda estão abertas.`,
        }),
    },
    section: {
      coming: 'Chegando',
      owed: 'Te devem',
      promised: 'Você prometeu',
    },
    state: {
      acknowledged: 'responderam, ainda não feito',
      broken: 'não aconteceu',
      cancelled: 'cancelado',
      fulfilled: 'feito',
      in_progress: 'a caminho',
      open: 'aguardando',
      overdue: 'atrasado',
    },
    by: (date: string) => `até ${date}`,
    lastDay: (date: string) => `prazo: ${date}`,
    done: 'Feito',
    forget: 'Esquecer',
    reopen: 'Reabrir',
    markedDone: 'Marcado como feito',
    forgotten: 'Esquecido',
    reopened: 'Reaberto',
  },
  cleanup: {
    emails: (total: number) =>
      plural('pt', total, {
        one: () => '1 e-mail',
        other: (n) => `${n} e-mails`,
      }),
    reason: (total: number) => `${total} e-mails este mês, nenhum aberto`,
    title: (total: number) =>
      plural('pt', total, {
        one: () => 'Cancele a inscrição de uma newsletter que você nunca abre',
        other: (n) =>
          `Cancele a inscrição de ${n} newsletters que você nunca abre`,
      }),
  },
  clearOut: {
    partial:
      'O Gmail interrompeu parte da limpeza. O que já foi movido pode voltar.',
    groups: {
      lists: 'Newsletters que você nunca abre',
      notifications: 'Notificações lidas, com mais de um mês',
      old: 'Tudo com mais de um ano',
      promotions: 'Anúncios e redes sociais, com mais de 3 dias',
    },
    done: (emails: string) => `${emails} limpos`,
    empty: 'Nada para limpar: a caixa de entrada já está em ordem.',
    lead: (emails: string) => `${emails} na caixa de entrada. Isto pode sair.`,
    leadCapped: (emails: string) =>
      `Mais de ${emails} na caixa de entrada. Isto pode sair.`,
    left: (emails: string) => `Ficam ${emails} na caixa de entrada`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} e mais ${more}` : names,
    ready: (emails: string) => `Dá para tirar ${emails}`,
    review: 'Revisar',
    run: (emails: string) => `Limpar ${emails}`,
    safe: 'Nada é apagado. Os e-mails limpos vão para o arquivo com o marcador Fewmail/Cleared e voltam com um clique; das newsletters você também sai.',
    scanning: 'Leio toda a caixa de entrada, só os cabeçalhos. Até um minuto.',
    title: 'Limpar a caixa de entrada',
    undo: 'Trazer tudo de volta',
    undone: (emails: string) => `${emails} de volta na caixa de entrada`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `Dia mais movimentado: ${day} · hora mais movimentada: ${hours}`,
    copied: 'Link copiado',
    copyLink: 'Copiar link',
    cta: 'Tenha o seu com o Fewmail',
    emails: 'e-mails chegaram',
    empty:
      'Ainda há pouco e-mail para contar a história. Volte em alguns dias.',
    handled: 'e-mails resolvidos pelo Fewmail',
    handledHint:
      'O Fewmail não muda nada no Gmail sem a sua aprovação. Deixe um bot agir sozinho e ele vai resolver esses e-mails por você.',
    people: 'Quem mais escreveu',
    period: { month: 'Este mês', year: 'Este ano' },
    replies: 'respostas escritas pelo Fewmail e enviadas',
    saveImage: 'Salvar imagem',
    saved: 'poupados pelo Fewmail',
    shareNote:
      'O link e a imagem mostram só estes números, nunca nomes ou endereços.',
    shared: { month: 'Um mês em e-mails', year: 'Um ano em e-mails' },
    spam: 'e-mails de spam barrados',
    split: (people: string, lists: string, other: string) =>
      `${people} de pessoas · ${lists} de newsletters · ${other} outros`,
    title: { month: 'Seu mês em e-mails', year: 'Seu ano em e-mails' },
    unsubscribed: 'newsletters deixadas',
  },
  reading: {
    markAllRead: 'Marcar tudo como lido',
    summary: 'O que as suas newsletters disseram',
    worth: 'Vale a pena ler inteira',
    leftOut: (n: number) => `Fora do resumo: ${n}, nada de novo.`,
    note: {
      inSummary: 'No resumo',
      leftOut: 'Fora do resumo',
    },
    digest: (n: number) => `Newsletters: ${n}`,
    lead: 'As newsletters de um dia num só lugar, para não lotarem a caixa de entrada.',
    issues: 'Todas as edições',
    empty: 'Ainda não há newsletters',
    emptyHint:
      'Toda manhã o agente vai escrever aqui as notícias das suas newsletters, cada linha ligada ao e-mail de onde veio.',
    title: 'Leitura',
  },
  commitments: {
    title: 'Você prometeu',
  },
  compose: {
    attach: 'Anexar arquivos',
    attachmentsTooLarge: (limit: string) =>
      `Os anexos podem somar até ${limit}.`,
    dropFiles: 'Solte os arquivos para anexar',
    removeAttachment: 'Remover',
    discarded: 'Rascunho descartado',
    backInQueue: 'Cancelado. O rascunho espera de novo no chat do seu bot.',
    canceled: 'Cancelado. Seu e-mail voltou para o editor.',
    cc: 'Cc',
    discard: 'Descartar',
    draftSaved: 'Rascunho salvo',
    forward: 'Encaminhar',
    forwardedMessage: 'Mensagem encaminhada',
    from: 'De',
    invalidRecipients: 'Adicione pelo menos um e-mail válido.',
    later: {
      inHour: 'Em uma hora',
      monday: 'Segunda de manhã',
      pick: 'Escolher data e hora',
      schedule: 'Agendar',
      time: 'Hora',
      tomorrow: 'Amanhã de manhã',
    },
    new: 'Novo e-mail',
    placeholder: 'Escreva seu e-mail…',
    remind: {
      days: (total: number) =>
        plural('pt', total, {
          one: () => 'Lembrar se não houver resposta em 1 dia',
          other: (n) => `Lembrar se não houver resposta em ${n} dias`,
        }),
      label: 'Lembrar-me',
      off: 'Sem lembrete',
    },
    reply: 'Responder',
    scheduledFor: (date: string) => `Agendado para ${date}`,
    send: 'Enviar',
    sendLater: 'Enviar depois',
    sendingIn: (seconds: number) => `Enviando em ${seconds} s`,
    subject: 'Assunto',
    to: 'Para',
    undo: 'Desfazer',
    undoing: 'Desfazendo…',
    writeForMe: 'Escreva por mim',
    writing: 'Escrevendo…',
  },
  command: {
    compose: 'Novo e-mail',
    appearance: 'Aparência',
    upgrade: 'Assinar o Pro',
    theme: {
      dark: 'Escuro',
      light: 'Claro',
      system: 'Sistema',
    },
  },
  composer: {
    acceptSuggestion: 'Tab para aceitar',
    bold: 'Negrito',
    bulletList: 'Lista com marcadores',
    italic: 'Itálico',
    link: 'Link',
    linkPlaceholder: 'Cole ou digite um link',
    noSnippets: 'Nenhum snippet encontrado.',
    removeLink: 'Remover link',
  },
  importance: [
    'Ruído',
    'Bom saber',
    'Precisa da sua atenção em breve',
    'Urgente',
  ],
  justNow: 'agora mesmo',
  errors: {
    crashTitle: 'O Fewmail tropeçou nesta página',
    crashLead:
      'Seus e-mails estão seguros e nada mudou no Gmail. Recarregue; se acontecer de novo, já estamos sabendo.',
    missingTitle: 'Não há nada neste endereço',
    calendarAccess:
      'O Fewmail não tem acesso a esta agenda. Permita na página Agenda.',
    failed: 'Algo deu errado. Tente novamente.',
    needsPro: 'Isso requer o Fewmail Pro.',
    alreadySent: 'Já foi enviado, tarde demais para desfazer.',
    consentChanged:
      'Isso mudou desde o pedido. Veja de novo e decida no chat do bot.',
    notFound: 'Isso não existe mais. Talvez tenha sido excluído.',
    offline: 'Não foi possível conectar ao Fewmail. Verifique sua conexão.',
  },
  desktop: {
    confirm: 'Entrar no app',
    confirmLead: (code: string) =>
      `O Fewmail no seu computador pede para entrar. Confira se ele mostra ${code}.`,
    confirmTitle: 'Entrar no app?',
    expired: 'Este login expirou. Comece de novo no app.',
    lead: 'Você entrou no seu computador. Você pode fechar esta aba.',
    title: 'Volte para o app',
    waiting: (code: string) =>
      `Continue no navegador e confira se ele mostra ${code}.`,
  },
  update: {
    available: 'Uma nova versão do Fewmail está disponível.',
    reload: 'Recarregar',
  },
  keys: {
    forget: 'esquecer',
    reopen: 'reabrir',
    attach: 'anexar',
    done: 'feito',
    openLink: 'abrir link',
    writeReminder: 'escrever um lembrete',
    summary: 'resumo',
    fromSender: 'mais do remetente',
    approvePicked: (n: number) => `aprovar ${n} selecionados`,
    pick: 'selecionar',
    pickAll: 'selecionar tudo',
    markRead: 'marcar como lido',
    markUnread: 'marcar como não lido',
    unpick: 'limpar seleção',
    pin: 'fixar',
    unpin: 'desafixar',
    copyCode: 'copiar código',
    restore: 'para a caixa de entrada',
    calendarToday: 'hoje',
    newEvent: 'novo evento',
    period: 'anterior / seguinte',
    view: 'vista',
    skills: 'habilidades',
    unsubscribe: 'cancelar inscrição',
    filter: 'filtro',
    reply: 'responder',
    snooze: 'adiar',
    trash: 'lixeira',
    approve: 'aprovar',
    approveAll: (n: number) => `aprovar as ${n} deste tipo`,
    archive: 'arquivar',
    close: 'fechar',
    draftReply: 'rascunhar',
    edit: 'editar',
    expand: 'expandir / recolher',
    move: 'mover',
    stackEmail: 'e-mail seguinte / anterior',
    open: 'abrir',
    rename: 'renomear',
    clearFilter: 'limpar filtro',
    search: 'buscar',
    send: 'enviar',
    skip: 'pular',
    keep: 'manter',
    stopEditing: 'parar de editar',
    rewrite: 'reescrever',
    save: 'salvar',
    deleteEvent: 'excluir',
  },
  legal: {
    privacy: 'Política de Privacidade',
    englishOnly:
      'Este documento é fornecido em inglês, que é a versão vinculante.',
    terms: 'Termos de Serviço',
    updated: (date: string) => `Atualizado em ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `A cota do agente deste mês acabou. Ela volta em ${date}.`,
  },
  notices: {
    freeUpSpace: 'Liberar espaço',
    mailLost:
      'O Fewmail perdeu o acesso ao seu Gmail e não está lendo e-mails novos.',
    mailboxLost: (email: string) => `O Fewmail perdeu o acesso a ${email}.`,
    reconnect: 'Reconectar',
    sendLimit: (email: string, when: string) =>
      `${email} atingiu o limite diário de envio do Gmail. O envio volta a funcionar ${when}.`,
    signInAgain: 'Entrar de novo',
    storageFull: (email: string) =>
      `${email} ficou sem armazenamento no Google, então o Gmail está recusando e-mails novos.`,
    storageFullHint:
      'Libere espaço ou consiga mais armazenamento para voltar a receber e-mails.',
  },
  login: {
    needsGmail:
      'O Fewmail precisa do seu Gmail para funcionar. Entre de novo e deixe a caixa do Gmail marcada na tela do Google.',
    agree: ((slots) => [
      'Ao continuar, você concorda com os ',
      slots.terms,
      ' e a ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Nada é enviado nem arquivado sem o seu aval. Agenda e contatos são opcionais.',
    continue: 'Continuar com o Google',
    lead: 'O Fewmail lê seu e-mail e só mostra o que precisa da sua atenção.',
    title: 'Só o que importa.',
  },
  mail: {
    inThread: (emails: string) => `${emails} nesta conversa`,
    moreFrom: (name: string) => `Mais de ${name}`,
    draftDeleted: 'Rascunho excluído',
    unsubscribeConfirm: (name: string) => `Cancelar inscrição de ${name}?`,
    unsubscribeHint:
      'O Fewmail cancela sua inscrição na lista e arquiva esta conversa. Cancelar uma inscrição não pode ser desfeito.',
    unsubscribing: 'Cancelando inscrição…',
    pin: 'Fixar',
    unpin: 'Desafixar',
    pinned: 'Fixados',
    showAll: (n: number) => `Mostrar todos os ${n}`,
    showFewer: 'Mostrar menos',
    inboxTotal: (count: string) => `${count} no total`,
    markShownRead: (total: number) =>
      plural('pt', total, {
        one: (n) => `Marcar ${n} como lido`,
        other: (n) => `Marcar ${n} como lidos`,
      }),
    oneTimeCode: {
      copied: 'Código copiado',
      copy: 'Copiar código',
    },
    openUnsubscribePage: 'Abrir página',
    unsubscribeYourself:
      'Para sair desta lista, termine na página dela. Enquanto isso, o e-mail fica arquivado.',
    allMailboxes: 'Todas as caixas',
    filterAbout: {
      focused: 'O importante e as pessoas primeiro, avisos recolhidos',
      unread: 'O que você ainda não leu, por tipo',
      categories:
        'A caixa inteira por tipo, o que precisa da sua atenção primeiro',
      inbox: 'Tudo, mais recentes primeiro',
    },
    find: {
      recent: 'Buscas recentes',
      tips: 'Dicas',
      clearRecent: 'Limpar',
      describeExample: 'faturas da Anna do mês passado',
      searching: 'Procurando no seu e-mail…',
      tip: {
        from: 'E-mails da Anna',
        subject: 'Assunto menciona “invoice”',
        attachment: 'Com anexos',
        pdf: 'Com PDF anexado',
        unread: 'Conversas não lidas',
        week: 'Dos últimos 7 dias',
        describe: 'Ou descreva com suas palavras',
      },
    },
    group: {
      named: 'Remetente ou assunto',
      mentioned: 'Mencionado no texto',
      read: 'Lidos',
      earlier: 'Anteriores',
      important: 'Importantes',
      people: 'Pessoas',
      plans: 'Agenda e viagens',
      money: 'Dinheiro',
      updates: 'Notificações',
      newsletters: 'Newsletters',
      promotions: 'Promoções',
    },
    unread: 'Não lido',
    block: 'Bloquear remetente',
    ignoresUnsubscribe: (name: string) =>
      `${name} ignora cancelamentos de inscrição`,
    ignoresUnsubscribeHint:
      'O Fewmail pediu o cancelamento, mas este remetente é conhecido por continuar escrevendo. Mandar os e-mails dele para a lixeira daqui em diante? Um bot vai fazer isso, e você pode excluí-lo entre seus bots.',
    blocked: 'Bloqueado. Os e-mails dele agora vão para a lixeira.',
    forward: 'Encaminhar',
    more: 'Mais',
    close: 'Fechar',
    reply: 'Responder',
    trash: 'Mover para lixeira',
    trashed: 'Movido para a lixeira',
    moveToInbox: 'Para a caixa de entrada',
    backInInbox: 'Movido para a caixa de entrada',
    movedToInbox: 'De volta à caixa de entrada. Valeu por avisar.',
    deleteDraft: 'Excluir rascunho',
    notSent: 'Não enviado. Abra para tentar de novo',
    noRecipients: 'Sem destinatários',
    notSpam: 'Não é spam',
    reportSpam: 'Denunciar spam',
    reportedSpam: 'Denunciado. Os e-mails dele agora vão para o spam.',
    archive: 'Arquivar',
    archived: 'Arquivado',
    markedRead: 'Marcado como lido',
    markUnread: 'Marcar como não lido',
    markedUnread: 'Marcado como não lido',
    attachment: 'anexo',
    draftReply: 'Rascunhar resposta',
    due: (date: string) => `vence em ${date}`,
    dueHint: 'Prazo que o agente encontrou neste e-mail',
    empty: {
      focused: 'Caixa de entrada vazia',
      unread: 'Tudo lido',
      categories: 'Caixa de entrada vazia',
      inbox: 'Caixa de entrada vazia',
      snoozed: 'Nada adiado',
      sent: 'Nada enviado ainda',
      drafts: 'Nenhum rascunho',
      archive: 'O arquivo está vazio',
      spam: 'Nenhum spam',
      trash: 'A lixeira está vazia',
    },
    emptyHint: {
      focused: 'Novos e-mails aparecem aqui assim que chegam.',
      unread: 'Novos e-mails aparecem aqui assim que chegam.',
      categories: 'Novos e-mails aparecem aqui assim que chegam.',
      inbox: 'Novos e-mails aparecem aqui assim que chegam.',
      snoozed:
        'Adie um e-mail para guardá-lo até mais tarde: ele volta para a entrada como não lido.',
      sent: 'Os e-mails que você envia aparecem aqui.',
      drafts: 'Os e-mails que você começou e não enviou esperam aqui.',
      archive: 'E-mails arquivados saem da entrada e esperam aqui.',
      spam: 'O spam chega aqui, fora da sua caixa de entrada.',
      trash: 'E-mails excluídos ficam aqui por 30 dias.',
    },
    noResults: 'Nada encontrado',
    noResultsHint: 'Tente outras palavras ou outra pasta.',
    expectsReply: 'Aguarda resposta',
    filter: {
      categories: 'Categorias',
      archive: 'Arquivo',
      trash: 'Lixeira',
      drafts: 'Rascunhos',
      spam: 'Spam',
      inbox: 'Entrada',
      snoozed: 'Adiados',
      sent: 'Enviados',
      focused: 'Foco',
      unread: 'Não lidos',
    },
    instruction: 'Diga ao agente como responder ou só aperte Enter',
    open: 'Abrir',
    search: 'Busque ou descreva',
    openInGmail: 'Abrir no Gmail',
    openInNewTab: 'Abrir em uma nova aba',
    unsubscribe: 'Cancelar inscrição',
    unsubscribed: 'Inscrição cancelada',
    unsubscribeFailed:
      'Este remetente não tem um cancelamento que o Fewmail consiga usar, então o e-mail foi arquivado, mas você continua na lista.',
    you: 'Você',
    sent: 'Enviado',
    writeReply: 'Escreva uma resposta…',
    replyTo: 'Responder para',
    date: 'Data',
    authentication: 'Autenticação',
    toLine: (recipients: string) => `para ${recipients}`,
  },
  subscriptions: {
    leftBy: (percent: number) =>
      `${percent}% dos leitores no Fewmail cancelaram a inscrição`,
    unsubscribeHint:
      'O Fewmail cancela sua inscrição na lista e arquiva tudo o que ela enviou. Cancelar uma inscrição não pode ser desfeito.',
    archivedOnly:
      'Este remetente não tem um cancelamento que o Fewmail consiga usar, então os e-mails foram arquivados, mas você continua na lista e novos e-mails vão continuar chegando.',
    count: (total: number) => `Listas de e-mail: ${total}`,
    empty: 'Nenhuma lista de e-mail escreveu para você este mês.',
    lead: 'Newsletters, promoções e outras listas de e-mail que escreveram para você este mês, as mais ativas primeiro. Cancele a inscrição do que você nunca lê: o Fewmail sai da lista e arquiva tudo o que ela enviou.',
    opened: (total: number) =>
      total === 0 ? 'nenhum aberto' : `${total} abertos`,
    title: 'Listas de e-mail',
    unsubscribe: 'Cancelar inscrição',
    unsubscribed: 'Inscrição cancelada',
  },
  nav: {
    board: 'Quadro',
    menu: 'Menu',
    collapseSidebar: 'Recolher a barra lateral',
    expandSidebar: 'Expandir a barra lateral',
    labels: 'Marcadores',
    folders: 'Pastas',
    calendar: 'Calendário',
    subscriptions: 'Listas de e-mail',
    wrapped: 'Retrospectiva',
    people: 'Pessoas',
    findPerson: 'Procurar pessoa',
    personMail: 'Ver e-mails',
    deleteContact: 'Excluir contato',
    contactDeleted: 'Contato excluído',
    clearSearch: 'Limpar pesquisa',
    mail: 'E-mail',
    reading: 'Leitura',
    settings: 'Configurações',
    syncFailed: 'Falha ao sincronizar o Gmail, tentando de novo',
    syncing: 'Lendo sua caixa de entrada…',
    loading: 'Carregando',
    syncFailedIn: (email: string) =>
      `Falha ao sincronizar ${email}, tentando de novo`,
    syncingIn: (email: string) => `Lendo ${email}…`,
    home: 'Bots',
    trialLeft: (total: number) =>
      plural('pt', total, {
        one: () => 'Teste do Pro · falta 1 dia',
        other: (n) => `Teste do Pro · faltam ${n} dias`,
      }),
    usage: (percent: number) => `Agente · ${percent}% do mês usado`,
    watching: 'O agente está de olho na sua caixa de entrada',
  },
  notifications: {
    many: (total: number) =>
      plural('pt', total, {
        other: (n) => `${n} novidades do Fewmail`,
      }),
    testBody: 'É assim que o e-mail urgente vai aparecer.',
    testTitle: 'As notificações funcionam',
  },
  plan: {
    used: (percent: number) => `${percent}% usado`,
    base: 'O limite mensal básico do agente.',
    times: (times: number) => `Limite mensal ${times}× maior.`,
    free: 'Grátis',
    freeDescription:
      'E-mail rápido e tranquilo com regras simples. Grátis pelo tempo que você quiser.',
    includes:
      'Todo plano pago adiciona o agente: cada e-mail lido e resumido, respostas redigidas no seu estilo, regras em palavras simples, Telegram e MCP.',
    manage: 'Gerenciar cobrança',
    price: (usd: number) => `$${usd} / mês`,
    priceYearly: (usd: number) => `$${usd} / ano`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
    cancels: (plan: string, date: string) =>
      `${plan} até ${date}, depois Grátis.`,
    choose: (plan: string) => `Escolher ${plan}`,
    proRenews: (date: string) => `Renova em ${date}.`,
    resets: (date: string) => `Reinicia em ${date}.`,
    title: 'Plano',
    trial: 'Teste do Pro',
    welcome: (plan: string) =>
      `Boas-vindas ao ${plan}. O agente está de volta ao trabalho.`,
    yearly: 'Pagar anualmente',
    yearlyHint: 'Dois meses grátis.',
    trialDescription: (date: string) =>
      `Tudo do Pro até ${date}, depois grátis. Sem cartão.`,
    upgrade: 'Outros planos',
    usage: 'Este mês',
  },
  headsUp: {
    deadline: 'Último dia em breve',
    notYet: 'Nada chegou desde então',
    price: 'O preço subiu',
    priceUp: (what: string, from: string, to: string) =>
      `${what}: ${to} em vez de ${from}`,
    promised: 'Prometeram a você',
  },
  queue: {
    addToCalendar: 'Adicionar à agenda',
    writeReminder: 'Escrever um lembrete',
    approve: 'Aprovar',
    delete: 'Excluir',
    pick: 'Selecionar',
    picked: (n: number) => `${n} selecionados`,
    unpick: 'Desmarcar',
    askedByYou: 'Pedido por você',
    draftedInVoice: 'Escrito com a sua voz',
    openEmail: 'Abrir o e-mail',
    send: 'Enviar',
    rewrite: 'Reescrever',
    shorterInstruction: 'Deixe mais curto.',
    new: 'Novo',
    skipStale: 'Pular todas',
    skipped: (n: number) => `Puladas: ${n}`,
    stale: (n: number) => `Com mais de uma semana: ${n}`,
    skip: 'Pular',
  },
  reminders: {
    followUp: 'Cobrar resposta',
    noReply: 'Ainda sem resposta',
  },
  risk: {
    prompt_injection: (domain: string) =>
      `${domain} escondeu neste e-mail instruções para assistentes que leem e-mails. O agente as ignora; não encaminhe nem faça o que ele pede.`,
    known_phishing: (domain: string) =>
      `${domain} está em uma lista pública de sites de phishing ativos. Não abra links, não faça login e não pague.`,
    credential_phishing: (domain: string) =>
      `${domain} pede que você entre na conta ou informe dados do cartão ou da conta. Bancos e serviços nunca pedem isso por e-mail: não clique em links nem digite nada.`,
    lookalike_domain: (domain: string) =>
      `Parece ${domain}, mas é outro endereço. Não clique em links nem faça pagamentos.`,
    new_sender_payment: (domain: string) =>
      `Primeiro e-mail de ${domain} e já pede dinheiro. Confirme por um canal em que você já confia.`,
    spoofed_sender: (domain: string) =>
      `Diz ser de ${domain}, mas ${domain} não enviou. Não clique em links nem pague.`,
    payment_change: (domain: string) =>
      `Novos dados de pagamento de ${domain}. Confirme por telefone antes de pagar.`,
    title: 'Verifique antes de agir',
  },
  bots: {
    profile: 'O que eu faço',
    closeProfile: 'Fechar',
    since: (date: string) => `Trabalhando desde ${date}`,
    status: {
      acts: 'Age sozinho',
      asks: 'Pergunta antes de cada e-mail',
      last: (time: string) => `último às ${time}`,
      paused: (date: string) => `Pausado até ${date}`,
      reading: (n: number) =>
        plural('pt', n, {
          one: () => `lendo um e-mail novo`,
          many: (count) => `lendo ${count} e-mails novos`,
          other: (count) => `lendo ${count} e-mails novos`,
        }),
      waiting: (n: number) =>
        plural('pt', n, {
          one: () => `Uma coisa espera por você`,
          many: (count) => `${count} coisas esperam por você`,
          other: (count) => `${count} coisas esperam por você`,
        }),
      watching: 'De olho no seu e-mail',
    },
    intro: {
      acts: 'Eu ajo sozinho, sem você: tudo o que faço aparece aqui, e você pode desfazer.',
      asks: 'Antes de mexer em um e-mail, eu pergunto aqui. Me deixe agir sozinho e eu cuido disso sem você.',
      board:
        'Oi! Acompanho as promessas e os prazos do seu e-mail: o que te devem, o que você prometeu e o que vence logo, e te lembro quando chega a hora. Pergunte quem te deve o quê.',
      change:
        'Me escreva para mudar o que eu faço ou para eu te lembrar de algo.',
      fewmail:
        'Oi, eu sou o Fewmail Bot. Leio todo o e-mail que nenhum dos seus bots pega e mostro só o que precisa de você. Nada muda no Gmail sem a sua aprovação. Pergunte qualquer coisa sobre seu e-mail, peça para eu te lembrar de algo ou para criar um bot que cuide de parte dele sem você.',
      own: (name: string) => `Oi, eu sou ${name}. É disto que eu cuido:`,
    },
    pause: {
      day: 'Até amanhã',
      hint: 'Pausado, ele não pega e-mails; o Fewmail Bot fica com eles.',
      month: 'Por um mês',
      resume: 'Retomar',
      title: 'Pausar',
      week: 'Por uma semana',
    },
    week: {
      approved: 'com sua aprovação',
      auto: 'sozinho',
      title: 'Últimos 7 dias',
      waiting: 'esperam por você',
    },
    lately: 'Recentes',
    notifications: 'Notificações',
    quiet: {
      hide: 'Ocultar',
      show: 'Mostrar',
      week: (n: number) =>
        plural('pt', n, {
          one: () => `Uma mudança no seu e-mail nos últimos 7 dias`,
          many: (count) => `${count} mudanças no seu e-mail nos últimos 7 dias`,
          other: (count) =>
            `${count} mudanças no seu e-mail nos últimos 7 dias`,
        }),
    },
    chatMenu: 'Ações do chat',
    clear: 'Limpar histórico',
    clearConfirm: (name: string) => `Limpar o chat com ${name}?`,
    clearHint:
      'As mensagens somem para sempre. O que ele fez no seu e-mail fica, assim como os lembretes que criou.',
    cleared: 'Histórico limpo',
    deleteFolder: 'Excluir pasta',
    deleteFolderConfirm: (name: string) => `Excluir a pasta ${name}?`,
    deleteFolderHint: 'Os bots dela ficam na lista, fora de qualquer pasta.',
    moveTo: 'Mover para pasta',
    newFolder: 'Nova pasta',
    noFolder: 'Sem pasta',
    pin: 'Fixar',
    rename: 'Renomear',
    renameFolder: 'Renomear pasta',
    unpin: 'Desafixar',
    add: 'Novo bot',
    answering: 'Escrevendo…',
    cancelReply: 'Cancelar resposta',
    cards: {
      autoDone: (n: number) =>
        plural('pt', n, {
          one: () => 'Resolvi um sozinho.',
          many: (count) => `Resolvi ${count} sozinho.`,
          other: (count) => `Resolvi ${count} sozinho.`,
        }),
      dismissed: (n: number) =>
        plural('pt', n, {
          one: () => 'Você pulou um.',
          many: (count) => `Você pulou ${count}.`,
          other: (count) => `Você pulou ${count}.`,
        }),
      done: (n: number) =>
        plural('pt', n, {
          one: () => 'Um foi feito com a sua aprovação.',
          many: (count) => `${count} foram feitos com a sua aprovação.`,
          other: (count) => `${count} foram feitos com a sua aprovação.`,
        }),
      failed: (n: number) =>
        plural('pt', n, {
          one: () => 'O Gmail recusou um.',
          many: (count) => `O Gmail recusou ${count}.`,
          other: (count) => `O Gmail recusou ${count}.`,
        }),
      pending: (n: number) =>
        plural('pt', n, {
          one: () => 'Um espera por você.',
          many: (count) => `${count} esperam por você.`,
          other: (count) => `${count} esperam por você.`,
        }),
    },
    composer: (name: string) => `Escreva para ${name} sobre os e-mails dele`,
    copied: 'Copiado',
    copy: 'Copiar',
    created: 'Bot criado. Ele lê os e-mails novos a partir de agora.',
    delete: 'Excluir bot',
    deleteConfirm: (name: string) => `Excluir ${name}?`,
    deleteHint:
      'O chat dele vai junto. Os e-mails dele ficam onde estão, e e-mails novos parecidos vão para o Fewmail.',
    deleted: 'Bot excluído',
    earlier: 'Mostrar anteriores',
    edit: 'Configurações do bot',
    effect: {
      always_show: 'Mostrar-me cada um',
      archive: 'Arquivar',
      collect: 'Só reunir',
      draft_reply: 'Rascunhar resposta',
      mark_read: 'Marcar como lido',
      promises: 'As promessas e prazos que acompanho',
      tidy: 'Arrumar',
      trash: 'Mover para lixeira',
      unsubscribe: 'Cancelar inscrição',
    },
    empty: 'Nada aqui ainda. Quando chegar um e-mail meu, eu escrevo aqui.',
    enabled: 'Age sozinho',
    enabledHint: {
      off: 'Desligado, ele pede a sua aprovação para cada e-mail antes.',
      on: 'Ligado, ele age sem perguntar; tudo o que faz aparece no chat dele.',
    },
    instruction: 'Quais e-mails e o que fazer com eles',
    instructionPlaceholder:
      'ex.: Marcar como lidas as faturas da Hetzner ou arquivar as notificações do LinkedIn',
    mute: 'Silenciar',
    muted: 'Silenciado: sem notificações deste bot',
    name: 'Nome',
    namePlaceholder: 'ex.: Faturas',
    noPlan:
      'Não consigo responder: no plano gratuito não tenho tokens para uma conversa. Assine e fico todo seu.',
    now: 'Esperando agora',
    suggestions: 'Sugestões',
    nudge: {
      noReply: 'Ainda não há resposta nessa conversa.',
      replied: 'Desde então chegou uma resposta nessa conversa.',
    },
    promises: (n: number) =>
      plural('pt', n, {
        one: () => 'Anotei uma promessa.',
        many: (count) => `Anotei ${count} promessas.`,
        other: (count) => `Anotei ${count} promessas.`,
      }),
    presets: 'Modelos',
    react: 'Reagir',
    reaction: 'Reação',
    reply: 'Responder',
    save: 'Salvar',
    saved: 'Salvo',
    simple: {
      title: {
        from: (value: string) => `De “${value}”`,
        mailingList: () => 'Qualquer lista de e-mails',
        subject: (value: string) => `Assunto contém “${value}”`,
      },
    },
    spent: (date: string) =>
      `Não consigo responder até ${date}: a cota deste mês acabou.`,
    steps: (n: number) =>
      plural('pt', n, {
        one: () => 'Um passo',
        other: (count) => `${count} passos`,
      }),
    subscribe: 'Assinar',
    fewmail: 'Fewmail Bot',
    fewmailJob: 'Cria seus bots, encontra e-mails e responde perguntas',
    title: 'Bots',
    toLatest: 'Ir para o mais recente',
    unmute: 'Reativar notificações',
    whatItDoes: 'O que ele faz com eles',
    you: 'Você',
  },
  settings: {
    disconnectConfirm: (name: string) => `Desconectar ${name}?`,
    messengerDisconnectHint:
      'O bot vai parar de escrever para você. Para conectar de novo, será preciso um novo link desta página.',
    account: 'Conta',
    agent: 'Agente',
    deleteAccount: 'Excluir conta',
    deleteConfirm: 'Excluir tudo',
    deleteDescription:
      'Exclui na hora sua conta, e-mails sincronizados, rascunhos e bots do Fewmail. Seu Gmail não é afetado. Um plano pago é cancelado na hora.',
    deleteFailed: 'A conta não foi excluída. Tente de novo em um minuto.',
    deleteSignIn:
      'Para confirmar que é você, entre de novo com o Google e depois exclua a conta.',
    deleteTitle: 'Excluir sua conta do Fewmail?',
    cancel: 'Cancelar',
    integrations: 'Integrações',
    knowledge: {
      description:
        'Preços, endereços, disponibilidade, como você gosta de responder. O agente usa isso em rascunhos e no preenchimento automático.',
      placeholder:
        'ex.: Consultoria custa $150/h. Não atendo ligações às sextas. Meu endereço é…',
      title: 'O que o agente deve saber',
    },
    labels: {
      description:
        'Organize os e-mails em marcadores Fewmail/… para que o Gmail no celular mostre a mesma ordem.',
      title: 'Marcadores do agente no Gmail',
    },
    language: 'Idioma',
    languageSearch: 'Buscar idioma',
    languageDescription: 'App, bot e resumos. As respostas seguem o e-mail.',
    legal: 'Jurídico',
    mailboxes: {
      removeConfirm: (email: string) => `Remover ${email}?`,
      removeHint:
        'O Fewmail para de ler esta caixa e esquece o que leu nela. Nada muda no Gmail.',
      add: 'Adicionar Gmail',
      addDescription:
        'O e-mail de outra conta do Gmail chega aos mesmos bots e à mesma caixa de entrada. Ela nunca entra aqui: entrar com ela abre um Fewmail separado.',
      added: 'Caixa adicionada. Os e-mails aparecem em um minuto.',
      failed:
        'Não foi possível adicionar a caixa. Permita o acesso ao Gmail e tente de novo.',
      lost: 'O acesso ao Gmail foi perdido. Adicione de novo para reconectar.',
      reading: 'Lendo os e-mails…',
      remove: 'Remover',
      retrying:
        'O Gmail não está respondendo agora. O Fewmail tenta de novo sozinho.',
      signIn: 'Você entra com esta',
      signInChosen: 'Essa é a conta com que você entra. Escolha outra.',
      signInLost:
        'O acesso ao Gmail foi perdido. Entre de novo para reconectar.',
      synced: (ago: string) => `Sincronizada ${ago}`,
      title: 'Caixas de e-mail',
    },
    mcp: {
      disconnectHint:
        'Ele não poderá mais ler seus e-mails até você conectá-lo de novo.',
      allow: 'Permitir',
      connected: (ago: string) => `Conectado ${ago}`,
      copy: 'Copiar URL',
      defaultName: 'Cliente MCP',
      deny: 'Recusar',
      description:
        'Eles podem ler seus e-mails, rascunhar respostas e enviá-las depois que você confirmar.',
      disconnect: 'Desconectar',
      paste: 'Adicione esta URL como conector no seu app e entre no Fewmail.',
      request: (app: string) => `${app} quer usar seu Fewmail`,
      title: 'Conecte Claude, Cursor ou qualquer cliente MCP',
    },
    signedInWithGoogle: 'Conectado com o Google',
    signOut: 'Sair',
    snippets: {
      deleted: 'Snippet excluído',
      add: 'Adicionar snippet',
      body: 'Texto',
      delete: 'Excluir',
      description: 'Digite ; no editor para inserir um snippet pelo nome.',
      name: 'Nome',
      title: 'Snippets',
    },
    notifications: {
      blocked:
        'As notificações estão bloqueadas. Permita-as nas configurações do site no navegador.',
      browser: 'Este navegador',
      desktop: 'Este computador',
      messengerOff: 'E-mails urgentes ficam no Fewmail.',
      messengerOn: 'E-mails urgentes chegam ao chat na hora.',
      notConfigured:
        'As notificações do navegador não estão configuradas neste servidor.',
      off: 'Receba aqui e-mails urgentes, mesmo com o Fewmail fechado.',
      on: 'E-mails urgentes aparecem aqui. Vários de uma vez chegam como um só.',
      title: 'Notificações',
      test: 'Enviar um teste',
      testFailed: 'Não chegou. Desative e ative as notificações de novo.',
      testSent:
        'Enviado. Não apareceu? Permita as notificações do navegador nas configurações do computador.',
      testSentDesktop:
        'Enviado. Não apareceu? Permita as notificações do Fewmail nas configurações do computador.',
      unsupported: 'Este navegador não consegue mostrar notificações.',
    },
    telegram: {
      connect: 'Conectar Telegram',
      disconnect: 'Desconectar',
      linked:
        'E-mails urgentes chegam na hora. Aprove e edite rascunhos pelo chat.',
      linkedQuiet: 'Aprove e edite rascunhos pelo chat.',
      notConfigured: 'O bot do Telegram não está configurado neste servidor.',
      unlinked: 'Receba e-mails urgentes e aprove rascunhos pelo Telegram.',
    },
    whatsapp: {
      connect: 'Conectar WhatsApp',
      disconnect: 'Desconectar',
      linked:
        'E-mails urgentes chegam na hora. Aprove e edite rascunhos pelo chat.',
      linkedQuiet: 'Aprove e edite rascunhos pelo chat.',
      notConfigured: 'O bot do WhatsApp não está configurado neste servidor.',
      unlinked: 'Receba e-mails urgentes e aprove rascunhos pelo WhatsApp.',
    },
    title: 'Configurações',
  },
  site: {
    meta: {
      assistant:
        'O Fewmail é um assistente de e-mail com IA para o Gmail que lê cada e-mail primeiro, escreve respostas com a sua voz e mostra só o que precisa da sua atenção. Comece grátis.',
      assistantTitle: 'Assistente de e-mail com IA para o Gmail',
      compare:
        'Como o Fewmail se compara ao Superhuman, Shortwave e SaneBox: um agente de IA que lê seus e-mails em vez de um jeito mais rápido de você mesmo lê-los.',
      compareTitle: 'Assistentes de e-mail com IA comparados',
      home: 'O Fewmail é um assistente de e-mail com IA para o Gmail: lê cada e-mail, escreve respostas com a sua voz e mostra só o que precisa da sua atenção.',
      login:
        'O Fewmail lê o seu Gmail por você, responde com a sua voz e só mostra o que realmente precisa da sua atenção.',
      mcp: 'Conecte o Fewmail ao Claude, ChatGPT, Claude Code ou Cursor como servidor MCP: leia e organize seu Gmail pela IA que você já usa.',
      motto: 'só o que importa na sua caixa',
      pricing: (trialDays: number) =>
        `O Fewmail é grátis para sempre para os bots, organizar e proteger contra spam. O Pro, o agente completo, começa com ${trialDays} dias grátis e sem cartão.`,
      tagline: 'o agente de e-mail com IA para o Gmail',
    },
    chapters: {
      pricing: {
        description:
          'Os bots, a organização e a proteção são grátis para sempre. Lite, Pro e Max adicionam tudo o que lê e escreve por você; os planos maiores simplesmente fazem mais.',
        label: 'Preços',
        title: (usd: number) =>
          `Organizar é grátis. O agente, a partir de $${usd}.`,
      },
      questions: {
        description:
          'As respostas curtas. As longas estão na política de privacidade.',
        label: 'Perguntas',
        title: 'Antes de conectar o Gmail.',
      },
    },
    closing: {
      lead: 'Conecte o Gmail em um minuto. O Fewmail começa pelos e-mails dos últimos três dias, então as primeiras decisões já estão esperando por você.',
      title: 'Recupere suas manhãs.',
    },
    mcp: {
      answer:
        'O contrato assinado, antes do kickoff de sexta. Uma resposta já está escrita e espera a sua aprovação no Fewmail.',
      clients: 'Funciona com',
      emphasis: 'no Claude e no ChatGPT.',
      free: 'Ler seus e-mails e a triagem do agente são grátis.',
      label: 'MCP',
      lead: 'Conecte o Fewmail como servidor MCP e pergunte sobre seus e-mails no assistente que você já usa. Tudo o que envia ou muda algo no Gmail continua pedindo a sua aprovação.',
      question: 'Do que a Anna precisa de mim esta semana?',
      setup: 'Conecte em um minuto',
      title: 'Seus e-mails, no Claude e no ChatGPT.',
    },
    mcpPage: {
      copy: 'Copiar URL',
      lead: 'Conecte o Fewmail como servidor MCP e pergunte sobre seu e-mail na IA que você já usa. Ler o e-mail e a triagem do agente são grátis; rascunhos, envios e bots que escrevem vêm com o Pro.',
      safety:
        'Tudo o que envia um e-mail ou muda o Gmail pede sua aprovação antes. Um e-mail que tenta dar ordens ao assistente é sinalizado antes que ele o leia. Seu e-mail nunca treina modelos, e você pode desconectar qualquer app nas configurações.',
      steps: {
        chatgpt:
          'Em Settings, adicione um conector (app) com esta URL e entre no Fewmail.',
        claude:
          'Em Settings → Connectors, adicione um conector personalizado com esta URL e entre no Fewmail.',
        code: 'Rode isto uma vez no terminal e entre no Fewmail quando o Claude Code pedir.',
        cursor:
          'Adicione isto ao seu mcp.json e entre no Fewmail quando o Cursor pedir.',
      },
      title: 'Fewmail dentro do Claude, ChatGPT e das suas ferramentas.',
    },
    assistantPage: {
      abilities: {
        ask: {
          description:
            'Pergunte “quando sai o meu voo?” e receba a resposta com os e-mails de onde ela veio, no Fewmail, no Telegram ou no WhatsApp, ou pelo Claude e pelo ChatGPT.',
          title: 'Respostas tiradas dos seus e-mails',
        },
        drafts: {
          description:
            'As respostas são escritas com antecedência, no seu tom e no idioma de quem enviou, e esperam no chat do bot delas até você aprovar.',
          title: 'Escreve respostas com a sua voz',
        },
        protection: {
          description:
            'Dados de pagamento alterados, domínios que imitam outros e golpes conhecidos geram um alerta antes de você agir.',
          title: 'Alerta sobre phishing',
        },
        reading: {
          description:
            'As newsletters do dia viram um único resumo por tema, com cada frase ligada ao e-mail de onde veio.',
          title: 'Newsletters em um só resumo',
        },
        bots: {
          description:
            'Descreva em uma frase o que deve acontecer com certos e-mails e isso vira um bot com o próprio chat. Só os bots que você deixa agir fazem isso sozinhos.',
          title: 'Bots em palavras simples',
        },
        sorting: {
          description:
            'Cada e-mail ganha um resumo e uma nota de importância, então o urgente sobe e recibos, notificações e promoções saem do seu caminho.',
          title: 'Lê e organiza cada e-mail',
        },
      },
      abilitiesDescription:
        'Tudo acontece no Gmail que você já usa, e cada coisa que o agente faz fica registrada com o motivo.',
      abilitiesLabel: 'O que ele faz',
      abilitiesTitle: 'Um assistente, não mais uma caixa de entrada.',
      compareTitle:
        'Como ele se compara a outras ferramentas de e-mail com IA.',
      faq: (trialDays: number) => [
        {
          answer:
            'Um software que usa IA para ler, organizar e responder e-mails por você. A maioria só adiciona resumos e ajuda na escrita a uma caixa de entrada que você continua lendo sozinho. O Fewmail vai além: ele lê tudo primeiro, para você ver só o que precisa da sua atenção.',
          question: 'O que é um assistente de e-mail com IA?',
        },
        {
          answer:
            'O Fewmail criptografa assuntos, corpos, resumos e rascunhos no banco de dados, nunca usa seus e-mails para treinar modelos e nunca envia nem muda nada no Gmail sem a sua aprovação. Você pode desconectá-lo e apagar tudo quando quiser.',
          question: 'É seguro deixar uma IA ler meus e-mails?',
        },
        {
          answer:
            'Ele escreve os rascunhos para você, mas nunca envia nenhum sozinho. Cada rascunho espera pela sua aprovação no chat do bot dele, e os parecidos podem ser aprovados juntos.',
          question: 'Ele pode responder e-mails automaticamente?',
        },
        {
          answer: `Sim. O plano Grátis organiza cada e-mail, reúne nos chats dos seus bots o que precisa da sua atenção, faz seus bots trabalharem e protege você contra spam e phishing, para sempre. Rascunhos, resumos e o resto do agente vêm com os planos pagos, e toda conta começa com ${trialDays} dias de Pro, sem cartão.`,
          question:
            'Existe um assistente de e-mail com IA grátis para o Gmail?',
        },
      ],
      faqTitle: 'Sobre assistentes de e-mail com IA.',
      lead: 'O Fewmail lê cada e-mail do seu Gmail assim que ele chega, tira o ruído, escreve respostas com a sua voz e traz só as poucas coisas que precisam da sua decisão. Nada é enviado ou alterado sem a sua aprovação.',
      title: 'O assistente de e-mail com IA que lê o seu Gmail primeiro.',
    },
    comparePage: {
      lead: 'Clientes de e-mail fazem você ler cada e-mail mais rápido. Filtros movem e-mails para pastas. O Fewmail é um agente: ele lê os e-mails, decide o que pode esperar e só pergunta a você sobre o resto.',
      title: 'Fewmail comparado.',
    },
    comparison: {
      custom: 'Personalizado',
      features: 'Recurso por recurso',
      groups: {
        agent: 'Leitura e respostas',
        day: 'Seu dia',
        reach: 'Onde funciona',
        safety: 'Proteção',
      },
      labels: {
        ask: 'Pergunte qualquer coisa aos seus e-mails',
        home: 'O que precisa da sua atenção, num só lugar',
        calendar: 'Agenda',
        drafts: 'Respostas escritas para você',
        followUps: 'Lembretes de acompanhamento',
        gmail: 'Gmail e Google Workspace',
        handOver: 'Entregar uma conversa',
        importance: 'Ordenado por importância',
        keepApp: 'Mantenha seu app de e-mail',
        mcp: 'MCP para suas próprias ferramentas',
        memory: 'Lembra promessas e pessoas',
        otherProviders: 'iCloud, Yahoo e outros e-mails IMAP',
        outlook: 'Outlook e Microsoft 365',
        phishing: 'Alertas de phishing e de mudança nos dados de pagamento',
        phone: 'No seu celular',
        bots: 'Bots em palavras simples',
        snooze: 'Adiar',
        spamShield: 'Escudo antispam comunitário',
        summaries: 'Resumos de e-mails',
        teams: 'Caixa de entrada da equipe',
        unsubscribe: 'Cancelar inscrição com um clique',
      },
      more: 'Mais comparações',
      no: 'Não',
      noFreePlan: 'Sem plano gratuito',
      ours: {
        ask: 'No Pro',
        home: 'Ao vivo, com aprovação em lote, grátis',
        drafts: 'Com a sua voz, enviadas só quando você aprova, no Pro',
        followUps: 'Automáticos, em e-mails que esperam resposta',
        handOver: 'O agente conduz até o objetivo, no Pro',
        importance: 'Cada e-mail pontuado, grátis',
        keepApp: 'Tudo aparece no Gmail',
        mcp: 'No Pro',
        memory: 'No Pro',
        phone: 'Telegram e WhatsApp, com voz, no Pro',
        bots: 'Arquivar, marcar como lido ou cancelar inscrição, grátis',
        summaries: 'No Pro',
        unsubscribe: 'Quem ignorar vai para o spam',
      },
      plans: 'Planos e preços',
      read: 'Ler a comparação',
      source: (name: string, date: string) =>
        `Os dados do ${name} vêm do site público dele, consultado em ${date}. Preços e recursos mudam; confira o site para ver a oferta atual.`,
      title: (name: string) => `Fewmail vs ${name}`,
      tryFree: 'Experimente o Fewmail grátis',
      which: 'Qual é o ideal para você?',
      yes: 'Sim',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 caixas de e-mail e todos os recursos, AI Bundle incluído',
          lunch: '2 caixas de e-mail, adiar e lembretes',
          snack: '1 caixa de e-mail e filtragem básica',
        },
        summary:
          'O SaneBox organiza os e-mails em pastas e, no plano mais alto, também escreve rascunhos e resume. O Fewmail lê tudo primeiro e reúne numa só página as poucas decisões que só você pode tomar.',
        them: {
          home: 'Um compilado diário dos e-mails filtrados',
          drafts: 'SaneDrafts, no Dinner',
          followUps: 'SaneNoReplies',
          importance: 'E-mails sem importância vão para o SaneLater',
          keepApp: 'Funciona por pastas',
          otherProviders: 'Qualquer servidor IMAP ou Exchange',
          phone: 'Pelo seu app de e-mail',
          bots: 'Treinado movendo e-mails entre pastas',
          snooze: 'A partir do Lunch',
          summaries: 'SaneSummary, no Dinner',
          unsubscribe: 'Pasta SaneBlackHole',
        },
        verdict:
          'Escolha o SaneBox se seus e-mails ficam fora do Gmail e pastas bastam. Escolha o Fewmail se você usa o Gmail e quer os e-mails importantes lidos, resumidos e respondidos.',
      },
      shortwave: {
        plans: {
          business: 'Por usuário',
          free: 'A maioria dos recursos e o assistente',
          max: 'Por usuário, os modelos mais fortes',
          premier: 'Por usuário, modelos mais fortes',
          pro: 'Histórico completo, busca e escrita com IA',
        },
        summary:
          'O Shortwave é um cliente de e-mail com um assistente de IA com quem você conversa. O Fewmail é um agente que lê primeiro e só pergunta a você o que não consegue decidir.',
        them: {
          ask: 'Assistente de IA e busca',
          drafts: 'Quando você pede',
          importance: 'Divisões e agrupamentos',
          keepApp: 'Substitui seu app de e-mail',
          memory: 'Memória de IA',
          otherProviders: 'Encaminhados para o Gmail',
          outlook: 'Sem suporte a Microsoft 365',
          phone: 'Apps para iOS e Android',
          bots: 'Filtros de IA, de 3 a 50 conforme o plano',
          summaries: 'No topo de cada e-mail',
          teams: 'Conversas e comentários compartilhados',
          unsubscribe: 'Com bloqueio em um clique',
        },
        verdict:
          'Escolha o Shortwave se você quer uma nova caixa de entrada com um assistente de chat. Escolha o Fewmail se você quer olhar menos e-mails, no Gmail que você já usa.',
      },
      superhuman: {
        plans: {
          business:
            'Por membro, $33 com cobrança anual. Inclui Auto Drafts e Ask AI',
          enterprise: 'SSO e controles de administração',
          starter: 'Por membro, $25 com cobrança anual',
        },
        summary:
          'O Superhuman deixa você mais rápido para passar por cada e-mail. O Fewmail passa por eles por você e mostra só o que precisa da sua atenção.',
        them: {
          ask: 'Ask AI, no Business',
          drafts: 'Auto Drafts, no Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox e Auto Labels',
          keepApp: 'Substitui seu app de e-mail',
          mcp: 'No Business',
          phone: 'Apps para iOS e Android',
          bots: 'Custom Auto Labels, no Business',
          spamShield: 'O filtro do seu provedor',
          summaries: 'Auto Summarize',
          teams: 'Rascunhos e comentários compartilhados',
        },
        verdict:
          'Escolha o Superhuman se você quer mexer em cada e-mail sozinho, mais rápido. Escolha o Fewmail se você prefere nem ver a maioria deles.',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'Muitas ferramentas de e-mail com IA são uma caixa de entrada nova com um chat: você continua lendo cada e-mail, agora com um resumo em cima. O Fewmail é um agente de IA que funciona no Gmail que você já usa. Ele lê cada e-mail primeiro, escreve respostas com a sua voz e traz só as poucas decisões que precisam da sua atenção.',
        question:
          'Em que o Fewmail é diferente de outros assistentes de e-mail com IA?',
      },
      {
        answer:
          'Não. O Fewmail funciona por cima do Gmail. Tudo o que ele faz aparece também no Gmail, e você pode continuar usando qualquer app do Gmail ao mesmo tempo.',
        question: 'Preciso sair do Gmail?',
      },
      {
        answer:
          'Nunca sem você. As respostas esperam no chat do bot delas até você aprovar, e um bot só arquiva, marca como lido ou cancela inscrições sozinho depois que você deixa. Tudo o que ele fez fica no chat dele, com o motivo.',
        question: 'Ele pode enviar ou apagar e-mails sozinho?',
      },
      {
        answer:
          'Assuntos, corpos, resumos e rascunhos são criptografados no nosso banco de dados. Seus e-mails nunca são usados para treinar modelos, e o escudo antispam compartilha entre usuários só hashes com chave, nunca endereços ou conteúdo.',
        question: 'O que acontece com meus e-mails?',
      },
      {
        answer: `Toda conta nova ganha ${trialDays} dias de Pro, sem cartão. Quando terminam, você simplesmente fica no Grátis: nada é apagado e nada é cobrado.`,
        question: 'O que acontece depois do teste?',
      },
      {
        answer:
          'Os rascunhos são escritos no idioma do e-mail que você está respondendo. O app, os resumos e o bot do Telegram falam um idioma que você escolhe, entre quinze.',
        question: 'Quais idiomas ele fala?',
      },
      {
        answer:
          'Contas do Gmail e do Google Workspace, por enquanto. Adicione várias caixas de e-mail a um mesmo Fewmail e os e-mails delas chegam aos mesmos bots e à mesma caixa de entrada.',
        question: 'Quais contas de e-mail funcionam?',
      },
    ],
    features: {
      description:
        'As partes do e-mail que antes tomavam uma tarde, feitas em segundo plano e listadas onde você pode conferir.',
      items: {
        calendar: {
          description:
            'O calendário de cada caixa de e-mail numa só visão. Uma reunião proposta num e-mail vira evento quando você aprova.',
          title: 'Calendário',
        },
        codes: {
          description:
            'Um código recente espera no topo de cada página e ao lado do e-mail, pronto para copiar sem abrir nada. Grátis.',
          title: 'Códigos de acesso',
        },
        messengers: {
          description:
            'E-mails urgentes chegam na hora no Telegram ou no WhatsApp. Pergunte sobre seus e-mails e aprove rascunhos por lá, por texto ou por voz.',
          title: 'Telegram e WhatsApp',
        },
        reading: {
          description:
            'Toda manhã, uma edição com as newsletters de ontem: as notícias por tema, cada frase ligada à fonte, e as que valem a leitura completa.',
          title: 'Leitura',
        },
        shield: {
          description:
            'Denuncie um spammer uma vez e todos os usuários do Fewmail ficam mais protegidos. O que o escudo pega espera a sua aprovação antes de ser movido. Grátis.',
          title: 'Escudo antispam',
        },
        subscriptions: {
          description:
            'Cada lista que escreveu este mês, com quantos dos seus e-mails você realmente abriu. Cancele qualquer uma com uma tecla. Grátis.',
          title: 'Listas de e-mail',
        },
        voice: {
          description:
            'Ouça o resumo das suas newsletters em voz alta. Mande uma mensagem de voz no Telegram ou WhatsApp e o agente responde falando.',
          title: 'Ouça em vez de ler',
        },
        wrapped: {
          description:
            'Seu mês ou seu ano em e-mails: o que chegou, o que foi resolvido, quanto tempo você ganhou de volta. Para compartilhar, nunca com um nome.',
          title: 'Seu ano em e-mails',
        },
      },
      label: 'E o resto',
      title: 'Tudo o mais que um assistente faria.',
    },
    footer: {
      legal: 'Jurídico',
      product: 'Produto',
      tagline:
        'O agente de e-mail com IA que lê o seu Gmail e só mostra o que precisa da sua atenção.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'deixa de ter.',
      label: 'O que vai embora',
      rows: [
        {
          fix: 'Peça ao Fewmail Bot para limpar o acúmulo: anúncios antigos, notificações lidas, listas que você nunca abre, tudo movido de uma vez. Um clique traz cada e-mail de volta.',
          problem: 'Milhares de e-mails que ninguém nunca vai ler.',
        },
        {
          fix: 'As respostas ficam escritas com antecedência, com a sua voz e no idioma de quem escreveu. As parecidas são aprovadas juntas com ⇧⏎, e cada uma continua sendo sua para conferir.',
          problem: 'Responder e-mails à meia-noite.',
        },
        {
          fix: 'Uma tecla cancela a inscrição como uma pessoa faria: um clique, a página de cancelamento ou um e-mail. Quem continua escrevendo é detectado e sugerido como spam.',
          problem: 'Newsletters que você nunca assinou.',
        },
        {
          fix: 'Toda manhã a Leitura transforma as newsletters de ontem numa só edição por tema, com as que valem a leitura completa indicadas.',
          problem: 'Newsletters que você queria ler.',
        },
        {
          fix: 'Dados de pagamento alterados, domínios que imitam outros e phishing conhecido geram um alerta antes de você agir.',
          problem: 'Uma fatura com novos dados bancários.',
        },
        {
          fix: 'O Quadro anota o que você prometeu e o que devem a você, e traz cada coisa de volta no dia certo. Conversas que ninguém respondeu ganham uma cobrança.',
          problem: 'Aquilo que você prometeu e esqueceu.',
        },
        {
          fix: 'Só os e-mails urgentes chegam no Telegram ou no WhatsApp. O resto espera nos chats dos seus bots, já organizado, para quando você quiser olhar.',
          problem: 'Olhar o e-mail no jantar, só por garantia.',
        },
      ],
      title: 'Problemas de e-mail que você deixa de ter.',
    },
    hero: {
      needs: {
        emphasis: 'precisam da sua atenção.',
        lead: (handled: string, bot: string) =>
          `A Anna está esperando o contrato, a fatura da Northwind vence semana que vem e o Marco quer quinta. Seus bots cuidaram de ${handled} newsletters e notificações, e estas três esperam por você em ${bot}.`,
        tag: (bot: string) => `${bot} · quinta, 08:12`,
        title: 'Três coisas precisam da sua atenção.',
      },
      fates: {
        archived: 'Arquivado',
        markedRead: 'Marcado como lido',
        spam: 'Spam',
        summarised: 'Resumido',
        unsubscribed: 'Inscrição cancelada',
      },
      handled: ((slots) => [
        slots.count,
        ' resolvidos, cada um com um motivo',
      ]) as Rich<'count'>,
      inbox: 'Caixa de entrada',
      lead: 'Newsletters, recibos, avisos, um link de phishing e, em algum lugar no meio disso tudo, os três e-mails que realmente importam. O Fewmail é o agente de IA que lê tudo isso por você.',
      needYou: ((slots) => [
        slots.count,
        ' precisam da sua atenção',
      ]) as Rich<'count'>,
      queue: [
        {
          reason: 'Contrato vence amanhã',
          summary: 'Precisa do contrato assinado antes do kickoff de sexta.',
        },
        {
          reason: 'Fatura · $1,240 até 20 de nov.',
          summary:
            'Fatura de outubro do redesign do site. Mesmos dados bancários da última vez.',
        },
        {
          reason: 'Reunião proposta',
          summary:
            'Sugere quinta às 15:00. Você está livre a partir das 16:00, então o rascunho propõe às quatro.',
        },
      ],
      reading: {
        emphasis: 'cada um.',
        lead: 'Ele arquiva o ruído, cancela as inscrições que você nunca abre e barra o golpe na porta. Cada coisa que ele faz fica registrada com o motivo, para você conferir.',
        title: 'O Fewmail lê cada um.',
      },
      remind: 'Lembrar em 19 de nov.',
      remindPlan: 'Adiciona às suas contas e lembra você em 19 de nov.',
      start: 'Comece grátis com o Google',
      title: 'E-mail não é o seu trabalho.',
      seeBots: 'Conheça os bots',
      unread: ((slots) => [slots.count, ' não lidos']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' não lidos na sua caixa de entrada',
      ]) as Rich<'count'>,
      willDo: 'O que o Fewmail vai fazer',
    },
    nav: {
      assistant: 'Assistente de e-mail com IA',
      compare: 'Comparar',
      features: 'Recursos',
      mcp: 'Servidor MCP',
      pricing: 'Preços',
      signIn: 'Entrar',
    },
    bots: {
      again: 'Começar de novo',
      board: {
        coming: { state: 'vira pago · 28 de nov.', text: 'Teste do Coursely' },
        owed: {
          state: 'aguardando · até 22 de nov.',
          text: 'Northwind: reembolso de $120 pela cobrança dupla',
        },
        promised: {
          state: 'até quinta',
          text: 'Mandar os slides para o Marco antes da revisão',
        },
      },
      emphasis: 'cada tipo de e-mail.',
      fewmail: {
        approve: 'Aprovar',
        ask: 'Faturas da Hetzner: marque como lidas',
        botName: 'Faturas da Hetzner',
        digest: (total: number, people: number) =>
          `${plural('pt', total, {
            one: () => 'Um e-mail',
            other: (n) => `${n} e-mails`,
          })} no último dia. Quase tudo newsletters e notificações, e ${plural(
            'pt',
            people,
            {
              one: () => 'só um de uma pessoa',
              other: (n) => `só ${n} de pessoas`,
            }
          )}.`,
        proposal: 'Aqui está o bot. Aprove e ele começa com os e-mails novos.',
      },
      label: 'Bots',
      later: 'Quatro coisas que vale saber, nada para decidir.',
      lead: 'Cada bot lê o próprio tipo de e-mail assim que chega e conta no chat dele o que fez e o que espera por você. Passe de um para outro, ou aperte [ e ].',
      points: [
        {
          description:
            'Cada e-mail vai para o bot responsável por ele: Importante, Pode esperar, Rápido ou um que você criou. O que nenhum bot pega fica com o Fewmail Bot.',
          title: 'Eles organizam assim que o e-mail chega.',
        },
        {
          description:
            'Um bot pergunta antes de mexer em cada e-mail até você deixar que ele aja sozinho. Tudo o que ele fez fica no chat dele, com o motivo.',
          title: 'Eles perguntam até você confiar.',
        },
        {
          description:
            'Diga ao Fewmail Bot “faturas da Hetzner: marque como lidas” e aprove o bot que ele cria. Pause, mude ou apague um bot do mesmo jeito.',
          title: 'Crie um com uma frase.',
        },
      ],
      quick:
        'Mira, da Growthly, é prospecção fria: uma desconhecida oferecendo algo, e você nunca escreveu para ela.',
      settled: {
        remind: 'lembrete criado',
        send: 'resposta enviada',
        skip: 'pulado',
      },
      title: 'Um chat para cada tipo de e-mail.',
    },
    plans: {
      agent: 'O agente',
      details: 'Ver todos os planos em detalhe',
      usage: 'Limite do agente por mês',
      everyPlan: 'Em todos os planos',
      oneAllowance:
        'Uma só cota para tudo o que o agente faz: você paga pelo que usa, e ruído nunca conta',
      forever: 'para sempre',
      free: {
        description: 'Os bots, a organização e a proteção. Para sempre.',
      },
      max: {
        description: 'O mesmo agente para uma caixa de entrada movimentada.',
      },
      monthly: 'Mensal',
      per: { month: 'por mês', year: 'por ano' },
      lite: {
        description: 'O agente completo: ele lê, escreve e lembra.',
      },
      pro: {
        description: 'O mesmo agente, com espaço para mais e-mails.',
      },
      tryFree: (days: number) => `Teste grátis por ${days} dias`,
      yearly: 'Anual · 2 meses grátis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Bots em palavras simples, a organização e a proteção são grátis para sempre. O Pro é o agente que lê, escreve e lembra por você; o Max é o mesmo agente com espaço para uma caixa de entrada movimentada. Toda conta começa com ${trialDays} dias de Pro e, quando eles terminam, você simplesmente fica no Grátis.`,
      otherTool: 'Pensando em outra ferramenta?',
      title: 'Pague pelo agente, não pela caixa de entrada.',
    },
    startFree: 'Comece grátis',
    trialNote: (days: number) =>
      `${days} dias de Pro, sem cartão. Depois, grátis pelo tempo que você quiser.`,
    trust: {
      emphasis: 'pergunta',
      label: 'Seus e-mails, sua decisão',
      places: 'Funciona por cima do Gmail que você já usa e encontra você em',
      title: 'Ele pergunta antes de agir.',
      vows: [
        {
          description:
            'Os rascunhos esperam por você. Um bot só move e-mails sozinho depois que você deixa, e tudo o que ele fez fica no chat dele com o motivo.',
          title: 'Nada é enviado sem a sua aprovação.',
        },
        {
          description:
            'Assuntos, corpos, resumos e rascunhos são criptografados no nosso banco de dados. Os rascunhos salvos ficam no Gmail, nunca com a gente.',
          title: 'Criptografado em repouso.',
        },
        {
          description:
            'O escudo antispam aprende com todo mundo por meio de hashes com chave. Nem um endereço nem uma palavra dos seus e-mails é compartilhado.',
          title: 'Nunca usado para treinar modelos.',
        },
      ],
    },
  },
  skills: {
    bills: 'Contas e pagamentos a vencer',
    cancel: 'Cancelar uma assinatura paga',
    cleanup: 'Newsletters para limpar',
    followups: 'Quem ainda não te respondeu',
    reading: 'As newsletters do dia num só resumo',
    today: 'O que precisa da sua atenção hoje',
    waiting: 'Quem espera sua resposta',
    week: 'Sua semana no e-mail',
  },
  snooze: {
    laterToday: 'Mais tarde hoje',
    nextWeek: 'Próxima semana',
    title: 'Adiar',
    tomorrow: 'Amanhã',
    unsnooze: 'Voltar para a entrada',
    until: (date: string) => `Adiado até ${date}`,
    weekend: 'Neste fim de semana',
  },
  spam: {
    reasonList: 'Em uma lista pública de domínios de spammers',
    reasonPattern: {
      auth: 'Falha na autenticação do remetente: o endereço é falso',
      infra:
        'Enviado de uma rede denunciada como spam por vários usuários do Fewmail',
      link: 'Links para sites denunciados como spam por vários usuários do Fewmail',
      signals:
        'Domínio novo, endereço estranho e autenticação fraca ao mesmo tempo',
      template:
        'Mesmo texto denunciado como spam por vários usuários do Fewmail',
    },
    reasonCommunity: 'Denunciado como spam por vários usuários do Fewmail',
    reasonYou: 'Você denunciou este remetente como spam',
    suspect: 'Parece spam',
    imagesHidden: 'As imagens ficam ocultas no spam.',
    openFile: {
      action: 'Abrir',
      description:
        'Este e-mail está no spam. Abra os arquivos dele só se confiar no remetente.',
      title: (name: string) => `Abrir ${name}?`,
    },
    showImages: 'Mostrar imagens',
  },
  starterBots: {
    board: { name: 'Quadro' },
    important: {
      instruction:
        'O que precisa de um passo meu: pessoas esperando minha resposta, contas a vencer, alertas de segurança, qualquer coisa do meu banco ou do governo. Mostrar-me cada um',
      name: 'Importante',
    },
    later: {
      instruction:
        'Bom saber, mas sem decisão: novidades dos serviços que uso, entregas, eventos e datas',
      name: 'Pode esperar',
    },
    quick: {
      instruction:
        'Ruído que eu limparia sem ler: notificações, recibos, newsletters, promoções e vendas frias. Arrumar: arquivar, marcar como lido ou cancelar inscrição, o que couber',
      name: 'Rápido',
    },
  },
  telegram: {
    approveAlike: 'Aprovar de uma vez todos os cartões de um tipo:',
    chatTaken:
      'Este chat já está conectado a outra conta do Fewmail. Desconecte o Telegram de lá primeiro (Configurações → Integrações) e abra o link de novo.',
    queueChanged:
      'Os cartões mudaram desde então. Isto é o que precisa da sua atenção agora:',
    heard: (text: string) => `Entendi: “${text}”`,
    voiceFailed: 'Não consegui entender. Tente de novo ou digite.',
    help: 'Escreva ou diga o que precisa:\n• pergunte sobre seus e-mails: “quando a Netflix renova?”\n• diga o que responder: “diga à Ana que assino amanhã”\n• peça uma tarefa: “sempre arquive as newsletters do Medium”\n• responda a um dos meus rascunhos para mudá-lo',
    canceled: 'Cancelado. O rascunho voltou para sua fila.',
    sendingIn: (seconds: number) => `Enviando em ${seconds} s`,
    undo: 'Desfazer',
    commands: { queue: 'O que precisa da sua atenção' },
    connectFirst: (url: string) =>
      `Olá! Eu sou o Fewmail. Aqui no Telegram eu aviso quando chega e-mail urgente, mostro o que precisa da sua atenção e envio as respostas que você aprovar.\n\nEste chat ainda não está conectado ao seu Fewmail. Leva um minuto:\n1. Abra as configurações do Fewmail: ${url}\n2. Em Integrações, toque em “Conectar Telegram” (faz parte do Fewmail Pro).\n3. O Telegram traz você de volta para cá: toque em Iniciar e pronto.`,
    connected:
      'Conectado. Vou avisar quando chegar algo urgente.\n\n/queue: o que precisa da sua atenção',
    done: 'Feito',
    draft: 'Rascunho:',
    edit: 'Editar',
    editPrompt:
      'Envie o texto que devo usar no lugar, ou diga como mudar começando com “/”, ex.: “/mais formal”.',
    newDraft: 'Novo rascunho:',
    nothing: 'Nada precisa da sua atenção agora.',
    proOnly:
      'O Telegram faz parte do Fewmail Pro. Abra Configurações → Plano no Fewmail para assinar.',
    draftClipped:
      'Encurtado aqui. “Enviar” envia o rascunho completo. Leia no Fewmail.',
    rewriting: 'Reescrevendo…',
    send: 'Enviar',
    sendThis: 'Enviar isto',
    shorter: 'Mais curto',
    skip: 'Pular',
    skipped: 'Pulado',
    somethingWrong: 'Algo deu errado',
    urgent: 'Urgente',
    willSend: 'Vou enviar:',
  },
  today: {
    working: 'Fazendo…',
    botSuggestion: {
      done: {
        archive:
          'Um bot novo arquiva os e-mails deste remetente a partir de agora.',
        mark_read:
          'Um bot novo marca os e-mails deste remetente como lidos a partir de agora.',
      },
      label: 'Bot sugerido',
      lead: (count: number, effect: 'archive' | 'mark_read') =>
        effect === 'archive'
          ? `${count} e-mails este mês, e o agente arquivaria cada um`
          : `${count} e-mails este mês, e o agente marcaria cada um como lido`,
      no: 'Não, obrigado',
      yes: {
        archive: 'Sempre arquivar',
        mark_read: 'Sempre marcar como lido',
      },
    },
    newSender: {
      archive: 'Sempre arquivar',
      archived:
        'Um bot novo arquiva os e-mails deste remetente a partir de agora.',
      keep: 'Manter como sempre',
      label: 'Remetente novo',
      lead: (count: number, opened: number) =>
        `${count} e-mails em duas semanas, ${opened === 0 ? 'nenhum aberto' : `${opened} abertos`}`,
    },
    readingNow: (total: number) =>
      plural('pt', total, {
        one: () => 'O agente está lendo um e-mail novo',
        many: (n) => `O agente está lendo ${n} e-mails novos`,
        other: (n) => `O agente está lendo ${n} e-mails novos`,
      }),
    allDone: 'Tudo pronto. Não há nada pendente.',
    allDoneLead:
      'Continuo lendo os e-mails novos. Tudo o que precisar da sua atenção aparece aqui.',
    allowanceSpent: (date: string) =>
      `A cota do agente deste mês acabou: resumos e rascunhos voltam em ${date}. Até lá, continuo anotando promessas e prazos.`,
    byBots: (n: number) => `Seus bots cuidaram de ${n}.`,
    decisions: 'Decisões',
    journal: {
      approved: 'Aprovado por você',
      byBot: (bot: string) => `Seu bot: ${bot}`,
      failed: 'Não deu certo',
      lead: 'Os últimos 7 dias. Cada mudança no seu e-mail ou agenda foi aprovada por você ou feita por um bot que você deixou agir sozinho.',
      title: 'Feito no seu e-mail',
    },
    progress: (done: number, total: number) => `${done} de ${total}`,
    mostlyNoise: (people: number) =>
      people === 0
        ? 'Tudo newsletters e notificações.'
        : `Quase tudo newsletters e notificações, só ${people} de pessoas.`,
    worth: {
      awaiting: (total: number) =>
        plural('pt', total, {
          one: () => '1 aguardando resposta',
          other: (n) => `${n} aguardando resposta`,
        }),
      dated: (total: number) =>
        plural('pt', total, {
          one: () => '1 com data',
          other: (n) => `${n} com data`,
        }),
    },
    worthKnowing: 'Bom saber',
    canWait: 'Pode esperar',
    canWaitEmpty: {
      lead: 'Os e-mails para ler quando você tiver um tempo e as respostas que você aguarda se reúnem aqui.',
      title: 'Nada esperando.',
    },
    improve: {
      empty: {
        lead: 'Quando o agente perceber que você trata um remetente sempre do mesmo jeito, ele sugere um bot aqui.',
        title: 'Nenhuma sugestão por enquanto.',
      },
      lead: (total: number) =>
        plural('pt', total, {
          one: () => 'Um bot que o agente poderia criar para você.',
          many: (n) => `${n} bots que o agente poderia criar para você.`,
          other: (n) => `${n} bots que o agente poderia criar para você.`,
        }),
      title: 'O agente sugere',
    },
    quick: 'Rápido',
    needsLook: 'Precisa da sua atenção',
    tidy: {
      failed: (emails: string) =>
        `O Gmail não alterou ${emails}. Tente novamente em instantes.`,
      confirm: (emails: string) => `Arrumar ${emails}?`,
      running: 'Arrumando…',
      unsubscribeHint:
        'Alguns são listas das quais o Fewmail vai cancelar sua inscrição, e isso não pode ser desfeito.',
      review: 'Revisar',
      reviewLead:
        'Proponho tirar estes e-mails do caminho, com o motivo ao lado de cada um. Aprove todos de uma vez ou mantenha os que devem ficar.',
      reviewTitle: 'Revise o que o agente sugere',
      done: (n: number) => `${n} arrumados`,
      keep: 'Manter',
      run: 'Aprovar tudo',
      untilYouApprove: 'Nada muda no seu e-mail até você aprovar',
    },
    pauseListening: 'Pausar',
    resumeListening: 'Retomar',
    awaiting: 'Aguardando resposta',
    hint: {
      messengers: {
        lead: 'Receba o e-mail urgente e aprove rascunhos no mensageiro que você já usa.',
        title: 'Telegram ou WhatsApp',
      },
      notNow: 'Agora não',
      setUp: 'Configurar',
      turnOn: 'Ativar',
    },
    dates: 'Datas e reuniões',
    done: 'Feito',
    firstRead:
      'Começamos pelos seus e-mails dos últimos três dias. O que precisar da sua atenção aparece aqui automaticamente.',
    approvedMany: (n: number) => `${n} aprovadas`,
    listen: 'Ouvir',
    handled: {
      spam: (total: number) =>
        plural('pt', total, {
          one: (n) => `${n} para spam`,
          other: (n) => `${n} para spam`,
        }),
      archived: (total: number) =>
        plural('pt', total, {
          one: (n) => `${n} arquivado`,
          other: (n) => `${n} arquivados`,
        }),
      markedRead: (total: number) =>
        plural('pt', total, {
          one: (n) => `${n} marcado como lido`,
          other: (n) => `${n} marcados como lidos`,
        }),
      review: 'Revisar',
      total: (total: number) =>
        plural('pt', total, {
          one: (n) => `${n} resolvido`,
          other: (n) => `${n} resolvidos`,
        }),
      unsubscribed: (total: number) =>
        plural('pt', total, {
          one: (n) => `${n} inscrição cancelada`,
          other: (n) => `${n} inscrições canceladas`,
        }),
    },
    headline: (total: number) =>
      total === 0
        ? 'Tudo tranquilo.'
        : plural('pt', total, {
            one: () => 'Uma coisa precisa da sua atenção.',
            other: (n) => `${n} coisas precisam da sua atenção.`,
          }),
    period: (days: number) =>
      days === 1 ? 'no último dia' : `nos últimos ${days} dias`,
    pulse: {
      lists: (n: number) => `${n} de listas de e-mail`,
      people: (n: number) => `${n} de pessoas`,
      total: (total: number, period: string) =>
        plural('pt', total, {
          one: (n) => `${n} e-mail ${period}`,
          other: (n) => `${n} e-mails ${period}`,
        }),
    },
    saved: (minutes: number) =>
      `O Fewmail te poupou cerca de ${formatMinutes('pt', minutes)} esta semana`,
    recent: (period: string) => `Também ${period}`,
    sent: 'Enviado',
  },
  upgrade: {
    hints: {
      board:
        'Parte do Fewmail Pro: o agente anota o que te prometeram, o que você prometeu e os prazos do seu e-mail, e acompanha cada um até ser concluído.',
      chat: 'Parte do Fewmail Pro: converse com seus bots sobre os e-mails deles, e eles voltam até você quando disseram que voltariam.',
      drafts:
        'Parte do Fewmail Pro: o agente escreve a resposta no seu estilo, e você edita e envia.',
    },
  },
  whatsapp: {
    phoneTaken:
      'Este número já está conectado a outra conta do Fewmail. Desconecte o WhatsApp de lá primeiro (Configurações → Integrações) e envie a mensagem de novo.',
    connectFirst: (url: string) =>
      `Oi! Eu sou o Fewmail. Aqui no WhatsApp eu aviso quando chega e-mail urgente, mostro o que precisa da sua atenção e envio as respostas que você aprovar.\n\nEste número ainda não está conectado ao seu Fewmail. Leva um minuto:\n1. Abra as configurações do Fewmail: ${url}\n2. Em Integrações, toque em “Conectar WhatsApp” (faz parte do Fewmail Pro).\n3. O WhatsApp abre com uma mensagem pronta, envie e pronto.`,
    connected:
      'Conectado. Vou avisar quando chegar algo urgente. Envie texto ou uma mensagem de voz para responder a qualquer e-mail.',
    proOnly:
      'O WhatsApp faz parte do Fewmail Pro. Abra Configurações → Plano no Fewmail para assinar.',
  },
  zombie: {
    badge: (share: number) => `Ignora o cancelamento de ${share}% das pessoas`,
    reason: 'Continuou enviando e-mails depois que você cancelou a inscrição',
  },
}
