import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const pt: Messages = {
  actionKind: {
    cleanup: 'Cancelar todas',
    commitment: 'Feito',
    security: 'Já verifiquei',
    task: 'Enviar',
    spam: 'Movido para spam',
    archive: 'Arquivar',
    follow_up: 'Acompanhar',
    mark_read: 'Marcar como lido',
    pay: 'Pagar',
    read: 'Ler',
    reply: 'Responder',
    schedule: 'Agendar',
    trash: 'Mover para lixeira',
    unsubscribe: 'Cancelar inscrição',
  },
  actionStatus: {
    auto_done: 'feito pelo agente',
    dismissed: 'pulado',
    done: 'feito',
    failed: 'falhou',
    pending: 'aguardando em Hoje',
  },
  agent: {
    voice: 'Falar com o agente',
    voiceStop: 'Parar e enviar',
    chats: 'Conversas',
    autonomy: {
      ask: 'Pergunta a você antes de cada e-mail',
      auto: (most: number) =>
        `Envia os e-mails sozinho, sem perguntar a você (até ${most})`,
    },
    calendar: (email: string) => `Na agenda de ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      create_schedule: 'Executar isto de forma agendada?',
      create_event: 'Adicionar este evento?',
      delete_event: 'Eliminar este evento?',
      update_event: 'Alterar este evento?',
      approve_action: 'Fazer esta ação?',
      archive_thread: 'Arquivar esta conversa?',
      clear_out: 'Limpar estes grupos de e-mails da caixa de entrada?',
      undo_clear_out:
        'Trazer de volta para a caixa de entrada tudo o que foi limpo?',
      create_rule: 'Adicionar esta regra?',
      handle_thread: 'Entregar esta conversa ao agente?',
      reply: 'Enviar esta resposta?',
      send_email: 'Enviar este e-mail?',
      snooze_thread: 'Adiar esta conversa?',
      unsubscribe: 'Cancelar a inscrição deste remetente?',
      trash_thread: 'Mover esta conversa para a lixeira?',
      report_spam: 'Denunciar este remetente como spam?',
      mark_not_spam: 'Tirar esta conversa do spam?',
      move_to_inbox: 'Devolver esta conversa à caixa de entrada?',
    },
    decline: 'Não',
    declined: 'Você recusou',
    detach: 'Não anexar este e-mail',
    deleteChat: 'Excluir conversa',
    failed: 'O agente não conseguiu terminar. Tente de novo.',
    lead: 'Pergunte sobre seus e-mails ou diga o que fazer. Tudo o que envia ou altera o Gmail espera o seu sim.',
    newChat: 'Nova conversa',
    closeChat: 'Fechar aba',
    switchChat: 'Trocar de conversa',
    noChats: 'Nenhuma conversa ainda',
    cancelEdit: 'Cancelar edição',
    copy: 'Copiar',
    edit: 'Editar',
    editing: 'Editando sua mensagem',
    regenerate: 'Responder de novo',
    skills: 'Habilidades',
    placeholder: 'Pergunte sobre seus e-mails ou digite / para habilidades',
    retry: 'Tentar de novo',
    send: 'Enviar',
    steps: {
      create_schedule: 'Criando o agendamento',
      delete_schedule: 'Parando o agendamento',
      list_schedules: 'Lendo os agendamentos',
      create_event: 'A adicionar um evento',
      delete_event: 'A eliminar o evento',
      list_events: 'A ver o calendário',
      update_event: 'A alterar o evento',
      list_subscriptions: 'Lendo inscrições',
      approve_action: 'Aprovando',
      archive_thread: 'Arquivando',
      get_reading: 'Lendo as newsletters',
      get_wrapped: 'Contando seu e-mail',
      clear_out: 'Limpando a caixa de entrada',
      preview_clear_out: 'Lendo toda a caixa de entrada',
      undo_clear_out: 'Trazendo de volta os e-mails limpos',
      create_rule: 'Adicionando uma regra',
      dismiss_action: 'Pulando',
      draft_reply: 'Escrevendo uma resposta',
      create_draft: 'Salvando um rascunho',
      get_board: 'Lendo o quadro',
      get_person: 'Procurando a pessoa',
      get_today: 'Vendo o dia',
      handle_thread: 'Entregando a conversa',
      list_boards: 'Abrindo quadros',
      list_handled: 'Conferindo o que foi tratado',
      list_mail: 'Buscando nos e-mails',
      list_rules: 'Lendo regras',
      read_thread: 'Lendo a conversa',
      redraft_action: 'Reescrevendo o rascunho',
      refresh: 'Buscando e-mails novos',
      send_email: 'Enviando',
      snooze_thread: 'Adiando',
      unsubscribe: 'Cancelando inscrição',
      trash_thread: 'Movendo para a lixeira',
      report_spam: 'Denunciando spam',
      mark_not_spam: 'Tirando do spam',
      move_to_inbox: 'Movendo para a caixa de entrada',
      create_board: 'Criando um quadro',
      update_board: 'Alterando o painel',
      delete_board: 'Excluindo o painel',
      add_board_chart: 'Adicionando um gráfico',
      add_to_board: 'Colocando no painel',
      edit_board_entry: 'Corrigindo o registro',
      remove_board_entry: 'Tirando do painel',
      rename_board_group: 'Renomeando o grupo',
    },
    stop: 'Parar',
    thinking: 'Pensando…',
    title: 'O que posso fazer por você?',
    to: (recipients: string) => `Para ${recipients}`,
    until: (time: string) => `Até ${time}`,
    yes: {
      create_schedule: 'Agendar',
      create_event: 'Adicionar',
      delete_event: 'Eliminar',
      update_event: 'Guardar',
      approve_action: 'Aprovar',
      archive_thread: 'Arquivar',
      clear_out: 'Limpar',
      undo_clear_out: 'Trazer de volta',
      create_rule: 'Adicionar',
      handle_thread: 'Entregar',
      reply: 'Enviar',
      send_email: 'Enviar',
      snooze_thread: 'Adiar',
      unsubscribe: 'Cancelar inscrição',
      trash_thread: 'Para a lixeira',
      report_spam: 'Denunciar spam',
      mark_not_spam: 'Não é spam',
      move_to_inbox: 'Devolver',
    },
  },
  ask: {
    label: (question: string) => `Perguntar ao Fewmail: “${question}”`,
    openChat: 'Abrir no chat',
    thinking: 'Procurando nos seus e-mails…',
  },
  byRule: 'por uma regra',
  boards: {
    addTo: 'Adicionar ao painel',
    added: (board: string) => `Adicionado a ${board}`,
    cancel: 'Cancelar',
    chart: {
      add: 'Adicionar gráfico',
      ask: 'Descreva o gráfico',
      askPlaceholder: 'Gastos por loja, pedidos por status…',
      currency: 'Moeda',
      edit: 'Ajustes do gráfico',
      empty: 'Ainda não há nada para mostrar',
      groupBy: 'Agrupado por',
      groupings: {
        group: 'Quem ou o quê',
        month: 'Mês',
        status: 'Status',
        week: 'Semana',
      },
      measure: 'Mostra',
      measures: { count: 'Quantidade', sum: 'Valor total' },
      moveEarlier: 'Mover para antes',
      moveLater: 'Mover para depois',
      other: 'Outros',
      remove: 'Remover gráfico',
      skipped: (n: number) => `Não contados: ${n} em outra moeda ou sem valor`,
      title: 'Título do gráfico',
      type: 'Tipo de gráfico',
      types: {
        area: 'Área',
        bar: 'Barras',
        line: 'Linha',
        pie: 'Pizza',
      },
      untitled: 'Novo gráfico',
      weekOf: (date: string) => `Semana de ${date}`,
    },
    charts: 'Gráficos',
    create: 'Criar painel',
    delete: 'Excluir painel',
    deleteConfirm: (name: string) => `Excluir “${name}”?`,
    deleteHint:
      'Os registros e gráficos vão junto. Seus e-mails ficam onde estão.',
    describe: 'Mudar o que ele reúne',
    description: 'O que ele reúne',
    descriptionPlaceholder:
      'Viagens: voos, hotéis e aluguel de carro, com quanto custaram',
    due: (when: string) => `Em breve: ${when}`,
    empty: 'Ainda vazio. E-mails que combinam aparecem aqui assim que chegam.',
    emptyQuery: 'Ele procura e-mails que correspondem a',
    entries: (total: number) =>
      plural('pt', total, {
        one: () => 'Um registro',
        other: (n) => `${n} registros`,
      }),
    entry: {
      amount: 'Valor',
      currency: 'Moeda',
      date: 'Data',
      edit: 'Editar registro',
      edited: 'Editado por você',
      group: 'Quem ou o quê',
      next: 'Próxima data',
      nextOn: (date: string) => `próximo: ${date}`,
      remove: 'Não é deste painel',
      removed: 'Tirado do painel. Ele aprende com isso.',
      status: 'Status',
      title: 'Título',
    },
    expected: (when: string) => `Previsto para ${when}`,
    filter: {
      clear: 'Limpar filtro',
      nothing: 'Nenhum registro encontrado.',
      search: 'Buscar registros',
    },
    groups: {
      every: {
        month: 'todo mês',
        quarter: 'todo trimestre',
        week: 'toda semana',
        year: 'todo ano',
      },
      expected: (date: string) => `previsto para ${date}`,
      next: (date: string) => `próximo: ${date}`,
      perMonth: (amount: string) => `${amount} / mês`,
      rename: 'Renomear grupo',
      renameHint: 'Dê o nome de outro grupo para juntar os dois.',
      showAll: (n: number) => `Mostrar todos os ${n}`,
      showFewer: 'Mostrar menos',
      title: 'Por quem ou o quê',
    },
    history: {
      capped: (n: number) =>
        `Lidos os ${n} e-mails correspondentes mais recentes dos últimos seis meses.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Olhando os e-mails dos últimos seis meses…'
          : `Lendo ${plural('pt', found, { one: () => 'um e-mail', other: (n) => `${n} e-mails` })} dos últimos seis meses · ${plural('pt', entries, { one: () => 'um registro', other: (n) => `${n} registros` })} até agora`,
    },
    menu: 'Ações do painel',
    moveDown: 'Mover para baixo',
    moveUp: 'Mover para cima',
    name: 'Nome',
    namePlaceholder: 'Viagens',
    new: 'Novo painel',
    newHint:
      'Descreva com suas palavras o que reunir. O Fewmail encontra isso nos e-mails dos últimos seis meses, escolhe os gráficos e mantém tudo atualizado.',
    planning: 'Preparando…',
    redescribe: 'Salvar e ler de novo',
    redescribeHint:
      'Lê os últimos seis meses de novo com a nova descrição. Registros que você editou ou tirou continuam como estão.',
    rename: 'Renomear painel',
    save: 'Salvar',
    settings: {
      bannerDays: 'Aviso antes de uma data',
      days: (n: number) =>
        plural('pt', n, {
          one: () => '1 dia antes',
          other: (count) => `${count} dias antes`,
        }),
      hint: 'Como o painel encontra seus e-mails e quando avisa você.',
      never: 'Nunca',
      query: 'Busca do Gmail',
      queryHint: 'Mudar isso lê os últimos seis meses de novo.',
      title: 'Busca e avisos',
    },
    starter: {
      events: {
        description:
          'Ingressos, reservas e compromissos: onde preciso estar, quando e com quem.',
        name: 'Eventos',
      },
      health: {
        description:
          'Consultas, receitas, resultados de exames e reembolsos do seguro: com quem, quando e quanto custou.',
        name: 'Saúde',
      },
      home: {
        description:
          'Aluguel, contas de consumo, reparos e contratos da casa: o que vence, para quem e quanto.',
        name: 'Casa',
      },
      invoices: {
        description:
          'Faturas que emito e recebo pelo trabalho: cliente ou fornecedor, valor, vencimento e se está paga.',
        name: 'Faturas',
      },
      jobs: {
        description:
          'Candidaturas, entrevistas e ofertas: qual empresa, qual vaga e em que etapa está cada uma.',
        name: 'Busca de emprego',
      },
      learning: {
        description:
          'Cursos, aulas e e-mails da escola ou faculdade: prazos, notas, certificados e quanto custam.',
        name: 'Estudos',
      },
      money: {
        description:
          'Pagamentos, assinaturas, contas e reembolsos: pelo que pago, a quem e quanto.',
        name: 'Dinheiro',
      },
      orders: {
        description:
          'Pedidos online e entregas: o que comprei, de quem e onde está.',
        name: 'Pedidos',
      },
      subscriptions: {
        description:
          'Serviços que pago com regularidade: quanto custa cada um, com que frequência e quando renova.',
        name: 'Assinaturas pagas',
      },
      trips: {
        description:
          'Voos, trens, hotéis e aluguéis: para onde vou, quando e quanto custa.',
        name: 'Viagens',
      },
    },
    summary: {
      lastMonth: 'Mês passado',
      perMonth: (amount: string) => `${amount} por mês`,
      recurring: (n: number) =>
        plural('pt', n, {
          one: () => 'Um recorrente',
          other: (count) => `${count} recorrentes`,
        }),
      thisMonth: 'Este mês',
      upcoming: 'Vence em 30 dias',
    },
  },
  bulk: {
    badge: (n: number) => `Enviado para ${n}+ usuários do Fewmail`,
    reason: (n: number) =>
      `E-mail em massa: ${n}+ usuários do Fewmail receberam o mesmo texto`,
  },
  calendar: {
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
    run: (emails: string) => `Limpar ${emails}`,
    safe: 'Nada é apagado. Os e-mails limpos vão para o arquivo com o marcador Fewmail/Cleared e voltam com um clique; das newsletters você também sai.',
    scanning: 'Leio toda a caixa de entrada, só os cabeçalhos. Até um minuto.',
    title: 'Limpar a caixa de entrada',
    undo: 'Trazer tudo de volta',
    undone: (emails: string) => `${emails} de volta na caixa de entrada`,
  },
  wrapped: {
    busiest: (day: string, hour: string) =>
      `Mais movimento: ${day}, por volta das ${hour}`,
    copied: 'Link copiado',
    copyLink: 'Copiar link',
    cta: 'Tenha o seu com o Fewmail',
    emails: 'e-mails chegaram',
    empty:
      'Ainda há pouco e-mail para contar a história. Volte em alguns dias.',
    handled: 'resolvidos pelo Fewmail sozinho',
    people: 'Quem mais escreveu',
    period: { month: 'Este mês', year: 'Este ano' },
    replies: 'respostas escritas pelo Fewmail e enviadas',
    saveImage: 'Salvar imagem',
    saved: 'poupados pelo Fewmail',
    shareNote:
      'O link e a imagem mostram só estes números, nunca nomes ou endereços.',
    shared: { month: 'Um mês em e-mails', year: 'Um ano em e-mails' },
    spam: 'e-mails de spam barrados',
    split: (people: string, lists: string) =>
      `${people} de pessoas · ${lists} de newsletters`,
    title: { month: 'Seu mês em e-mails', year: 'Seu ano em e-mails' },
    unsubscribed: 'newsletters deixadas',
  },
  forward: {
    done: 'Seu e-mail encaminhado',
  },
  reading: {
    digest: (n: number) => `Newsletters de hoje: ${n}`,
    empty: 'Nenhuma newsletter no último dia.',
    lead: 'As newsletters do último dia num só lugar, para não lotarem a caixa de entrada.',
    title: 'Leitura',
  },
  commitments: {
    title: 'Você prometeu',
  },
  compose: {
    backInQueue: 'Cancelado. O rascunho voltou para Hoje.',
    canceled: 'Cancelado. Seu e-mail voltou para o editor.',
    cc: 'Cc',
    discard: 'Descartar',
    draftSaved: 'Rascunho salvo',
    forward: 'Encaminhar',
    forwardedMessage: 'Mensagem encaminhada',
    from: 'De',
    instructionPlaceholder: 'Como deve soar? (opcional)',
    invalidRecipients: 'Adicione pelo menos um e-mail válido.',
    later: {
      inHour: 'Em uma hora',
      monday: 'Segunda de manhã',
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
    writeForMe: 'Escreva por mim',
    writing: 'Escrevendo…',
  },
  command: {
    compose: 'Novo e-mail',
    agent: 'Agente',
    appearance: 'Aparência',
    goTo: 'Ir para',
    mail: 'E-mail',
    nothingMatches: 'Nada encontrado.',
    placeholder: 'Pergunte sobre seus e-mails ou execute um comando…',
    commandsOnly: 'Execute um comando…',
    rewriteBrief: 'Reescrever o resumo',
    teachRule: 'Ensinar uma nova regra',
    upgrade: 'Assinar o Pro',
    theme: {
      dark: 'Usar tema escuro',
      light: 'Usar tema claro',
      system: 'Seguir o sistema',
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
  importance: ['Ruído', 'Bom saber', 'Precisa de você em breve', 'Urgente'],
  justNow: 'agora mesmo',
  errors: {
    failed: 'Algo deu errado. Tente novamente.',
    needsPro: 'Isso requer o Fewmail Pro.',
    alreadySent: 'Já foi enviado, tarde demais para desfazer.',
    notFound: 'Isso não existe mais. Talvez tenha sido excluído.',
    offline: 'Não foi possível conectar ao Fewmail. Verifique sua conexão.',
  },
  update: {
    available: 'Uma nova versão do Fewmail está disponível.',
    reload: 'Recarregar',
  },
  keys: {
    restore: 'para a caixa de entrada',
    calendarToday: 'hoje',
    newEvent: 'novo evento',
    period: 'anterior / seguinte',
    view: 'vista',
    group: 'agrupar',
    skills: 'habilidades',
    unsubscribe: 'cancelar inscrição',
    filter: 'filtro',
    reply: 'responder',
    snooze: 'adiar',
    trash: 'lixeira',
    ask: 'perguntar sobre ele',
    approve: 'aprovar',
    approveAll: (n: number) => `aprovar as ${n} deste tipo`,
    archive: 'arquivar',
    close: 'fechar',
    draftReply: 'rascunhar',
    edit: 'editar',
    move: 'mover',
    open: 'abrir',
    notOnBoard: 'não é deste painel',
    rename: 'renomear',
    clearFilter: 'limpar filtro',
    search: 'buscar',
    send: 'enviar',
    skip: 'pular',
    stopEditing: 'parar de editar',
  },
  legal: {
    privacy: 'Política de Privacidade',
    englishOnly:
      'Este documento é fornecido em inglês, que é a versão vinculante.',
    terms: 'Termos de Serviço',
    updated: (date: string) => `Atualizado em ${date}`,
  },
  limits: {
    boards: (total: number) =>
      `Seu plano inclui ${total} quadros. Exclua um ou mude para o Max em Configurações → Plano.`,
    messages: (date: string) =>
      `As mensagens ao agente deste mês acabaram. Elas voltam em ${date}.`,
    tasks: (total: number) =>
      `Seu plano cuida de ${total} conversas por vez. Espere uma terminar ou mude para o Max em Configurações → Plano.`,
  },
  login: {
    agree: ((slots) => [
      'Ao continuar, você concorda com os ',
      slots.terms,
      ' e a ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'O Fewmail pede permissão para ler, organizar e enviar seus e-mails do Gmail. Nada é enviado nem arquivado sem o seu aval, a menos que você crie uma regra que permita. Também pede acesso ao teu Google Agenda, que podes desmarcar.',
    continue: 'Continuar com o Google',
    lead: 'O Fewmail lê sua caixa de entrada por você, responde com a sua voz e só mostra o que realmente precisa de você.',
    messengers:
      'Também em mensageiros, começando pelo Telegram: receba o resumo, aprove respostas ou simplesmente envie uma mensagem de voz.',
    title: 'Só o que importa.',
  },
  mail: {
    openUnsubscribePage: 'Abrir página',
    unsubscribeYourself:
      'Para sair desta lista, termine na página dela. Enquanto isso, o e-mail fica arquivado.',
    allMailboxes: 'Todas as caixas',
    group: {
      category: 'Categoria',
      importance: 'Importância',
      none: 'Sem grupos',
      sender: 'Remetente',
      title: 'Agrupar',
    },
    unread: 'Não lido',
    block: 'Bloquear remetente',
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
    noThread: 'Escolha um e-mail para lê-lo aqui',
    deleteDraft: 'Excluir rascunho',
    notSent: 'Não enviado. Abra para tentar de novo',
    noRecipients: 'Sem destinatários',
    notSpam: 'Não é spam',
    reportSpam: 'Denunciar spam',
    reportedSpam: 'Denunciado. Os e-mails dele agora vão para o spam.',
    archive: 'Arquivar',
    archived: 'Arquivado',
    attachment: 'anexo',
    draftReply: 'Rascunhar resposta',
    drafting: 'Escrevendo…',
    draftWaiting: 'O rascunho está aguardando em Hoje',
    due: (date: string) => `vence em ${date}`,
    dueHint: 'Prazo que o agente encontrou neste e-mail',
    empty: 'Nenhum e-mail aqui',
    emptyHint: 'Novos e-mails aparecem aqui assim que chegam.',
    expectsReply: 'Aguarda resposta',
    filter: {
      archive: 'Arquivo',
      trash: 'Lixeira',
      drafts: 'Rascunhos',
      spam: 'Spam',
      inbox: 'Entrada',
      snoozed: 'Adiados',
      important: 'Importantes',
      needs_reply: 'A responder',
      quiet: 'Silenciosos',
    },
    instruction: 'Diga ao agente como responder ou só aperte Enter',
    open: 'Abrir',
    search: 'Busque ou descreva: faturas da Anna do mês passado',
    openInGmail: 'Abrir no Gmail',
    unsubscribe: 'Cancelar inscrição',
    unsubscribed: 'Inscrição cancelada',
    unsubscribeFailed:
      'Este remetente não tem cancelamento de inscrição com um clique, então o e-mail foi arquivado.',
    you: 'Você',
  },
  subscriptions: {
    archivedOnly:
      'Este remetente não tem cancelamento com um clique, então os e-mails foram arquivados. Se continuarem chegando, vão para o spam.',
    count: (total: number) => `Listas de e-mail: ${total}`,
    empty: 'Nenhuma lista de e-mail escreveu para você este mês.',
    lead: 'Listas de e-mail que escreveram para você este mês, as mais ativas primeiro. Cancelar a inscrição arquiva tudo o que enviaram; o que ainda chegar duas semanas depois vai para o spam.',
    opened: (total: number) =>
      total === 0 ? 'nenhum aberto' : `${total} abertos`,
    title: 'Inscrições',
    unsubscribe: 'Cancelar inscrição',
    unsubscribed: 'Inscrição cancelada',
  },
  nav: {
    calendar: 'Calendário',
    subscriptions: 'Inscrições',
    agent: 'Agente',
    boards: 'Painéis',
    newBoard: 'Novo painel',
    mail: 'E-mail',
    reading: 'Leitura',
    rules: 'Regras',
    search: 'Buscar ou perguntar…',
    settings: 'Configurações',
    syncFailed: 'Falha ao sincronizar o Gmail, tentando de novo',
    syncing: 'Lendo sua caixa de entrada…',
    today: 'Hoje',
    trialLeft: (total: number) =>
      plural('pt', total, {
        one: () => 'Teste do Pro · falta 1 dia',
        other: (n) => `Teste do Pro · faltam ${n} dias`,
      }),
    usage: (percent: number) => `Agente · ${percent}% do mês usado`,
    watching: 'O agente está de olho na sua caixa de entrada',
  },
  schedule: {
    awaitsAnswer:
      'Pulei esta execução: a anterior ainda espera sua resposta neste chat.',
    failed: 'Esta execução agendada falhou. Vou tentar de novo na próxima.',
    limitReached: (day: string) =>
      `As mensagens deste mês acabaram, então o agendamento pula execuções até ${day}.`,
    open: 'Abrir no Fewmail',
    stopped:
      'Este agendamento falhou três vezes seguidas, então eu o parei. Peça para eu configurá-lo de novo quando quiser.',
  },
  notifications: {
    many: (total: number) =>
      plural('pt', total, {
        other: (n) => `${n} novidades do Fewmail`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Páginas que o agente preenche com seus e-mails, começando pelo último meio ano. Escolha até ${max}; você pode criar as suas depois.`,
    boardsTitle: 'O que o agente deve juntar para você?',
    languageHint:
      'O app, os resumos e as explicações usam este idioma. As respostas sempre seguem o idioma do e-mail que você responde.',
    languageTitle: 'Em qual idioma o Fewmail deve falar?',
    lead: 'Duas respostas rápidas. Você pode mudar tudo depois nas Configurações.',
    reading: 'Lendo sua caixa de entrada…',
    start: 'Começar',
    title: 'Vamos configurar seu agente.',
  },
  plan: {
    free: 'Grátis',
    freeDescription:
      'E-mail rápido e tranquilo com regras simples. Grátis pelo tempo que você quiser.',
    includes:
      'O Pro adiciona o agente: um resumo diário, cada e-mail lido e resumido, respostas redigidas no seu estilo, regras em palavras simples, Telegram e MCP.',
    manage: 'Gerenciar cobrança',
    price: (usd: number) => `$${usd} / mês`,
    priceYearly: (usd: number) => `$${usd} / ano`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `${emails} e-mails e ${messages} mensagens por mês; quadros e conversas entregues sem limite.`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `${emails} e-mails e ${messages} mensagens por mês.`,
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
    emailsUsed: (used: string, total: string) => `${used} de ${total} e-mails`,
    messagesUsed: (used: string, total: string) =>
      `${used} de ${total} mensagens`,
    trialDescription: (date: string) =>
      `Tudo do Pro até ${date}, depois grátis. Sem cartão.`,
    upgrade: 'Outros planos',
    usage: 'Este mês',
  },
  people: {
    firstContact: (date: string) => `Trocando e-mails desde ${date}`,
    lastContact: (date: string) => `Último e-mail em ${date}`,
    open: 'Pendente em outras conversas',
    promised: 'Você prometeu',
    threads: (total: number) =>
      plural('pt', total, {
        one: () => '1 conversa',
        other: (n) => `${n} conversas`,
      }),
  },
  queue: {
    askedByYou: 'Pedido por você',
    draftedInVoice: 'Escrito com a sua voz',
    edit: 'Editar',
    open: 'Abrir',
    send: 'Enviar',
    shorter: 'Mais curto',
    shorterInstruction: 'Deixe mais curto.',
    skip: 'Pular',
  },
  reminders: {
    followUp: 'Cobrar resposta',
    noReply: 'Ainda sem resposta',
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} está em uma lista pública de sites de phishing ativos. Não abra links, não faça login e não pague.`,
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
  rules: {
    add: 'Adicionar regra',
    count: (total: number) =>
      plural('pt', total, {
        one: (n) => `${n} regra`,
        other: (n) => `${n} regras`,
      }),
    delete: 'Excluir',
    describe: {
      alwaysShow: 'Sempre aparece em Hoje',
      autonomous: 'Feito sozinho, listado em resolvidos',
      draft: 'Um rascunho espera por você em Hoje',
    },
    effect: {
      always_show: 'Sempre me mostrar',
      archive: 'Arquivar',
      draft_reply: 'Rascunhar resposta',
      mark_read: 'Marcar como lido',
      trash: 'Mover para lixeira',
      unsubscribe: 'Cancelar inscrição',
    },
    enabled: 'Regra ativada',
    lead: 'Diga ao agente, com palavras simples, o que fazer com certos e-mails. Ele confere cada e-mail com estas regras, de cima para baixo.',
    newTitle: 'Ensinar uma nova regra',
    leadFree:
      'Arquive, marque como lido ou cancele inscrições automaticamente. As regras são aplicadas aos novos e-mails assim que chegam.',
    placeholder: 'ex.: Faturas da Hetzner ou notificações do LinkedIn',
    simple: {
      appliedAutomatically: 'Aplicada automaticamente aos novos e-mails',
      field: {
        from: 'De',
        mailingList: 'Qualquer lista de e-mails',
        subject: 'Assunto contém',
      },
      title: {
        from: (value: string) => `De “${value}”`,
        mailingList: () => 'Qualquer lista de e-mails',
        subject: (value: string) => `Assunto contém “${value}”`,
      },
      valuePlaceholder: 'anna@example.com, um nome ou uma palavra',
      whichField: 'Corresponder por',
    },
    title: 'Regras',
    whatAgentDoes: 'O que o agente faz',
    whichEmails: 'Quais e-mails',
  },
  settings: {
    readingDigest: {
      description:
        'Depois do resumo, as newsletters do dia chegam ao Telegram e WhatsApp numa só mensagem.',
      title: 'Resumo de newsletters',
    },
    voiceBrief: {
      description:
        'O resumo também chega ao Telegram e WhatsApp como mensagem de voz.',
      title: 'Resumo em áudio',
    },
    forward: {
      copy: 'Copiar endereço',
      description:
        'Envie ou encaminhe qualquer e-mail para este endereço a partir da sua caixa, com uma nota no topo dizendo o que fazer. A resposta chega no Telegram ou WhatsApp e num chat aqui.',
      title: 'Encaminhar para o agente',
    },
    account: 'Conta',
    agent: 'Agente',
    briefDescription: (timezone: string) => `No seu fuso horário, ${timezone}`,
    briefTitle: 'Resumo diário',
    deleteAccount: 'Excluir conta',
    deleteConfirm: 'Excluir tudo',
    deleteDescription:
      'Exclui na hora sua conta, e-mails sincronizados, rascunhos, regras e resumos do Fewmail. Seu Gmail não é afetado.',
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
    languageDescription:
      'App, resumos e sínteses. As respostas seguem o e-mail.',
    legal: 'Jurídico',
    mailboxes: {
      add: 'Adicionar Gmail',
      addDescription:
        'O e-mail de outra conta do Gmail chega ao mesmo Hoje e à mesma caixa de entrada. Ela nunca entra aqui: entrar com ela abre um Fewmail separado.',
      added: 'Caixa adicionada. Os e-mails aparecem em um minuto.',
      failed:
        'Não foi possível adicionar a caixa. Permita o acesso ao Gmail e tente de novo.',
      lost: 'O acesso ao Gmail foi perdido. Adicione de novo para reconectar.',
      reading: 'Lendo os e-mails…',
      remove: 'Remover',
      signIn: 'Você entra com esta',
      signInChosen: 'Essa é a conta com que você entra. Escolha outra.',
      synced: (ago: string) => `Sincronizada ${ago}`,
      title: 'Caixas de e-mail',
    },
    mcp: {
      allow: 'Permitir',
      connected: (ago: string) => `Conectado ${ago}`,
      copy: 'Copiar URL',
      defaultName: 'Cliente MCP',
      deny: 'Recusar',
      description:
        'Eles podem ler seu resumo e seus e-mails, rascunhar respostas e enviá-las depois que você confirmar.',
      disconnect: 'Desconectar',
      paste: 'Adicione esta URL como conector no seu app e entre no Fewmail.',
      request: (app: string) => `${app} quer usar seu Fewmail`,
      title: 'Conecte Claude, Cursor ou qualquer cliente MCP',
    },
    signedInWithGoogle: 'Conectado com o Google',
    signOut: 'Sair',
    schedules: {
      delete: 'Excluir',
      description:
        'Peça ao agente no chat para fazer algo com regularidade, como “toda sexta às 17:00 junte as faturas da semana”. Cada execução chega no próprio chat, onde você aprova o que ele quiser enviar.',
      title: 'Agendamentos',
    },
    snippets: {
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
      notConfigured:
        'As notificações do navegador não estão configuradas neste servidor.',
      off: 'Receba aqui e-mails urgentes e o resumo diário, mesmo com o Fewmail fechado.',
      on: 'E-mails urgentes e o resumo diário aparecem aqui. Vários de uma vez chegam como um só.',
      title: 'Notificações',
      unsupported: 'Este navegador não consegue mostrar notificações.',
    },
    telegram: {
      connect: 'Conectar Telegram',
      disconnect: 'Desconectar',
      linked:
        'Seu resumo chega toda manhã, e-mails urgentes na hora. Aprove e edite rascunhos pelo chat.',
      notConfigured: 'O bot do Telegram não está configurado neste servidor.',
      unlinked: 'Receba o resumo e aprove rascunhos pelo Telegram.',
    },
    whatsapp: {
      connect: 'Conectar WhatsApp',
      disconnect: 'Desconectar',
      linked:
        'Seu resumo chega toda manhã, e-mails urgentes na hora. Aprove e edite rascunhos pelo chat.',
      notConfigured: 'O bot do WhatsApp não está configurado neste servidor.',
      unlinked: 'Receba o resumo e aprove rascunhos pelo WhatsApp.',
    },
    title: 'Configurações',
  },
  site: {
    chapters: {
      pricing: {
        description:
          'A organização, as regras e a proteção são grátis para sempre. Pro e Max adicionam tudo o que lê e escreve por você; o Max simplesmente faz mais.',
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
        'O contrato assinado, antes do kickoff de sexta. Uma resposta já está escrita e esperando na sua fila do Fewmail.',
      clients: 'Funciona com',
      emphasis: 'no Claude e no ChatGPT.',
      free: 'Ler seus e-mails e a triagem do agente são grátis.',
      label: 'MCP',
      lead: 'Conecte o Fewmail como servidor MCP e pergunte sobre seus e-mails no assistente que você já usa. Tudo o que envia ou muda algo no Gmail continua pedindo o seu sim.',
      question: 'Do que a Anna precisa de mim esta semana?',
      setup: 'Conecte em um minuto',
      title: 'Seus e-mails, no Claude e no ChatGPT.',
    },
    mcpPage: {
      copy: 'Copiar URL',
      lead: 'Conecte o Fewmail como servidor MCP e pergunte sobre seu e-mail na IA que você já usa. Ler o e-mail e a triagem do agente são grátis; rascunhos, envios e regras vêm com o Pro.',
      safety:
        'Tudo o que envia um e-mail ou muda o Gmail pede seu sim antes. Seu e-mail nunca treina modelos, e você pode desconectar qualquer app nas configurações.',
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
        brief: 'Resumo diário',
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
        rules: 'Regras em palavras simples',
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
        brief: 'No seu idioma, no Pro',
        drafts: 'Com a sua voz, enviadas só quando você aprova, no Pro',
        followUps: 'Automáticos, em e-mails que esperam resposta',
        handOver: 'O agente conduz até o objetivo, no Pro',
        importance: 'Cada e-mail pontuado, grátis',
        keepApp: 'Tudo aparece no Gmail',
        mcp: 'No Pro',
        memory: 'No Pro',
        phone: 'Telegram e WhatsApp, com voz, no Pro',
        rules: 'Arquivar, marcar como lido ou cancelar inscrição, grátis',
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
          'O SaneBox organiza os e-mails em pastas e, no plano mais alto, também escreve rascunhos e resume. O Fewmail lê tudo primeiro e entrega a você um único resumo e as poucas decisões que só você pode tomar.',
        them: {
          brief: 'Um compilado diário dos e-mails filtrados',
          drafts: 'SaneDrafts, no Dinner',
          followUps: 'SaneNoReplies',
          importance: 'E-mails sem importância vão para o SaneLater',
          keepApp: 'Funciona por pastas',
          otherProviders: 'Qualquer servidor IMAP ou Exchange',
          phone: 'Pelo seu app de e-mail',
          rules: 'Treinado movendo e-mails entre pastas',
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
          rules: 'Filtros de IA, de 3 a 50 conforme o plano',
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
          'O Superhuman deixa você mais rápido para passar por cada e-mail. O Fewmail passa por eles por você e mostra só o que precisa de você.',
        them: {
          ask: 'Ask AI, no Business',
          drafts: 'Auto Drafts, no Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox e Auto Labels',
          keepApp: 'Substitui seu app de e-mail',
          mcp: 'No Business',
          phone: 'Apps para iOS e Android',
          rules: 'Custom Auto Labels, no Business',
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
          'Não. O Fewmail funciona por cima do Gmail. Tudo o que ele faz aparece também no Gmail, e você pode continuar usando qualquer app do Gmail ao mesmo tempo.',
        question: 'Preciso sair do Gmail?',
      },
      {
        answer:
          'Nunca sem você. As respostas esperam na sua fila até você aprovar, e só as regras que você criou ou manteve podem arquivar, marcar como lido ou cancelar inscrições sozinhas. Tudo o que ele fez aparece em Resolvidos.',
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
          'Os rascunhos são escritos no idioma do e-mail que você está respondendo. O app, o resumo e o bot do Telegram falam um idioma que você escolhe, entre quinze.',
        question: 'Quais idiomas ele fala?',
      },
      {
        answer:
          'Contas do Gmail e do Google Workspace, por enquanto. Adicione várias caixas de e-mail a um mesmo Fewmail e os e-mails delas chegam no mesmo resumo e na mesma caixa de entrada.',
        question: 'Quais contas de e-mail funcionam?',
      },
    ],
    features: {
      description:
        'As partes do e-mail que antes tomavam uma tarde, feitas em segundo plano e listadas onde você pode conferir.',
      items: {
        ask: {
          description:
            'Pergunte qualquer coisa com suas palavras e receba a resposta a partir dos seus próprios e-mails, com os e-mails de onde ela veio.',
          title: 'Pergunte aos seus e-mails',
        },
        boards: {
          description:
            'Dinheiro, assinaturas pagas, viagens, pedidos: descreva o que acompanhar e o agente reúne tudo de meio ano de e-mails, com gráficos.',
          title: 'Painéis',
        },
        calendar: {
          description:
            'O calendário de cada caixa de e-mail numa só visão. Uma reunião proposta num e-mail vira evento quando você diz sim.',
          title: 'Calendário',
        },
        clearOut: {
          description:
            'Todo o acúmulo fora de uma vez, até 50.000 e-mails por caixa, todos sob um mesmo marcador para que um clique traga cada um de volta. Grátis.',
          title: 'Limpar a caixa de entrada',
        },
        forward: {
          description:
            'Encaminhe um e-mail com uma nota em cima, “marque um horário com eles semana que vem”, e o agente cuida do resto.',
          title: 'Encaminhar para o agente',
        },
        handle: {
          description:
            'Entregue uma conversa com um objetivo e o agente leva até o fim, perguntando antes de cada envio.',
          title: 'Cuidar disso',
        },
        reading: {
          description:
            'As newsletters do dia numa lista tranquila, cada uma resumida em poucas frases.',
          title: 'Leitura',
        },
        voice: {
          description:
            'Ouça o resumo no Telegram, no WhatsApp ou no app, e responda ao bot com um áudio.',
          title: 'Ouça o resumo',
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
        'O agente de e-mail que lê o seu Gmail e só mostra o que precisa de você.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'deixa de ter.',
      label: 'O que vai embora',
      rows: [
        {
          fix: 'Limpar a caixa de entrada tira todo o acúmulo de uma vez: anúncios antigos, notificações lidas, listas que você nunca abre. Um clique traz cada e-mail de volta.',
          problem: 'Milhares de e-mails que ninguém nunca vai ler.',
        },
        {
          fix: 'As respostas ficam escritas com antecedência, com a sua voz e no idioma de quem escreveu. As parecidas são aprovadas juntas com ⇧⏎, e cada uma continua sendo sua para conferir.',
          problem: 'Responder e-mails à meia-noite.',
        },
        {
          fix: 'Uma tecla cancela a inscrição como uma pessoa faria: um clique, a página de cancelamento ou um e-mail. Quem continua escrevendo vai direto para o spam.',
          problem: 'Newsletters que você nunca assinou.',
        },
        {
          fix: 'A Leitura reúne as newsletters do dia numa lista, cada uma resumida em poucas frases.',
          problem: 'Newsletters que você queria ler.',
        },
        {
          fix: 'Dados de pagamento alterados, domínios que imitam outros e phishing conhecido geram um alerta antes de você agir.',
          problem: 'Uma fatura com novos dados bancários.',
        },
        {
          fix: 'As promessas que você faz nos e-mails enviados voltam no prazo, e conversas que ninguém respondeu ganham uma cobrança.',
          problem: 'Aquilo que você prometeu e esqueceu.',
        },
        {
          fix: 'Só os e-mails urgentes chegam no Telegram ou no WhatsApp. O resto espera o resumo da manhã, que você também pode ouvir.',
          problem: 'Olhar o e-mail no jantar, só por garantia.',
        },
      ],
      title: 'Problemas de e-mail que você deixa de ter.',
    },
    hero: {
      brief: {
        emphasis: 'precisam de você.',
        lead: (handled: string) =>
          `A Anna está esperando o contrato, a fatura da Northwind vence semana que vem e o Marco quer quinta. ${handled} newsletters e notificações foram resolvidas.`,
        tag: 'Resumo de quinta · 08:00',
        title: 'Três coisas precisam de você.',
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
      lead: 'Newsletters, recibos, avisos, um link de phishing e, em algum lugar no meio disso tudo, os três e-mails que realmente importam. O Fewmail é o agente que lê tudo isso por você.',
      needYou: ((slots) => [slots.count, ' precisam de você']) as Rich<'count'>,
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
      today: 'Hoje',
      tryQueue: 'Experimente a fila',
      unread: ((slots) => [slots.count, ' não lidos']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' não lidos na sua caixa de entrada',
      ]) as Rich<'count'>,
      willDo: 'O que o Fewmail vai fazer',
    },
    nav: {
      compare: 'Comparar',
      features: 'Recursos',
      mcp: 'Servidor MCP',
      pricing: 'Preços',
      signIn: 'Entrar',
    },
    play: {
      again: 'Limpar de novo',
      doneLead: (handled: string) =>
        `Você tomou três decisões. O Fewmail cuidou dos outros ${handled} e anotou o porquê.`,
      doneTitle: 'Por hoje é só.',
      emphasis: 'em dois minutos.',
      handled: [
        'Lumen Weekly: você não abriu nenhuma das últimas 30 edições',
        'paypa1-billing.com se parece com paypal.com',
        'Parcelhub: avisos de entrega, pela regra “Recibos e entregas”',
      ],
      handledTitle: 'Resolvido enquanto você dormia',
      label: 'Experimente',
      lead: 'É assim que uma manhã fica agora. Os rascunhos estão escritos, os motivos estão explicados, você decide. Vá em frente, limpe tudo.',
      left: (count: number) => `${count} para decidir`,
      title: 'Sua caixa de entrada inteira, em dois minutos.',
    },
    plans: {
      everythingIn: (plan: string) => `Tudo do ${plan}, e mais`,
      forever: 'para sempre',
      free: {
        description: 'A organização, as regras e a proteção. Para sempre.',
        features: [
          'Cada e-mail organizado e classificado por importância',
          'Regras em palavras simples que arquivam, marcam como lido ou cancelam inscrições',
          'Escudo antispam comunitário e alertas de phishing',
          'Remetentes zumbis pegos depois que você cancela a inscrição',
          'Cobranças automáticas de resposta em e-mails que aguardam retorno',
          'Adiar, snippets e marcadores Fewmail no Gmail',
        ],
      },
      max: {
        description: 'O mesmo agente para uma caixa de entrada movimentada.',
        emails: (emails: string) => `${emails} e-mails lidos por mês`,
        messages: (messages: number) =>
          `${messages} mensagens ao agente por mês`,
        unlimited: 'Painéis e conversas entregues sem limite',
      },
      monthly: 'Mensal',
      per: { month: 'por mês', year: 'por ano' },
      pro: {
        description: 'O agente completo: ele lê, escreve e lembra.',
        features: [
          'Hoje: um resumo diário e uma única fila de decisões',
          'Respostas escritas com a sua voz, enviadas só quando você aprova',
          'Telegram: o resumo, as aprovações e as instruções por voz',
          '“Cuidar disso”: o agente leva uma conversa até o objetivo',
          'Promessas e pessoas lembradas, painéis com gráficos para dinheiro ou o que você quiser acompanhar',
          'Pergunte qualquer coisa aos seus e-mails, e MCP para suas próprias ferramentas',
        ],
        limits: (emails: string, messages: number) =>
          `${emails} e-mails lidos e ${messages} mensagens ao agente por mês; ruído nunca conta`,
      },
      tryFree: (days: number) => `Teste grátis por ${days} dias`,
      yearly: 'Anual · 2 meses grátis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `A organização, as regras em palavras simples e a proteção são grátis para sempre. O Pro é o agente que lê, escreve e lembra por você; o Max é o mesmo agente com espaço para uma caixa de entrada movimentada. Toda conta começa com ${trialDays} dias de Pro e, quando eles terminam, você simplesmente fica no Grátis.`,
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
            'Os rascunhos esperam por você. Só as regras que você criou ou manteve podem arquivar, marcar como lido ou cancelar inscrições sozinhas, e tudo o que elas fizeram aparece em Resolvidos.',
          title: 'Nada é enviado sem o seu sim.',
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
    today: 'O que precisa de você hoje',
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
  },
  starterRules: {
    alwaysShow:
      'Alertas de segurança, contas a vencer, qualquer coisa do meu banco ou do governo',
    newsletters: 'Newsletters e resumos periódicos',
    notifications: 'Notificações automáticas de ferramentas e serviços',
    promotions: 'Promoções, marketing e e-mails de vendas não solicitados',
    receipts: 'Recibos, confirmações de pedido e de envio',
  },
  tasks: {
    active: (goal: string) => `O agente está cuidando disso: ${goal}`,
    auto: 'Enviar e-mails sem me perguntar',
    autoHint:
      'Cada e-mail ainda espera alguns segundos para você poder desfazer.',
    cancel: 'Parar',
    done: 'Tarefa concluída',
    goal: 'O que o agente deve conseguir?',
    goalPlaceholder: 'ex.: Pedir a fatura de novo com nosso endereço novo',
    handle: 'Cuidar disso…',
    next: 'Próximo passo',
    start: 'Começar',
    started: 'O agente está cuidando disso.',
  },
  telegram: {
    approveAlike: 'Aprovar de uma vez todos os cartões de um tipo:',
    listen: '🔊 Ouvir',
    heard: (text: string) => `Entendi: “${text}”`,
    voiceFailed: 'Não consegui entender. Tente de novo ou digite.',
    help: 'Escreva ou diga o que precisa:\n• pergunte sobre seus e-mails: “quando a Netflix renova?”\n• diga o que responder: “diga à Ana que assino amanhã”\n• peça uma tarefa: “crie um quadro para viagens”\n• responda a um dos meus rascunhos para mudá-lo',
    canceled: 'Cancelado. O rascunho voltou para sua fila.',
    sendingIn: (seconds: number) => `Enviando em ${seconds} s`,
    undo: 'Desfazer',
    commands: { brief: 'Resumo de hoje', queue: 'O que precisa de você' },
    connectFirst:
      'Abra Fewmail → Configurações → Integrações e toque em “Conectar Telegram” primeiro.',
    connected:
      'Conectado. Vou enviar seu resumo toda manhã e avisar quando chegar algo urgente.\n\n/brief: resumo de hoje\n/queue: o que precisa de você',
    done: 'Feito',
    draft: 'Rascunho:',
    edit: 'Editar',
    editPrompt:
      'Envie o texto que devo usar no lugar, ou diga como mudar começando com “/”, ex.: “/mais formal”.',
    newDraft: 'Novo rascunho:',
    nothing: 'Nada precisa de você agora.',
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
    awaiting: 'Aguardando resposta',
    hint: {
      notNow: 'Agora não',
      setUp: 'Configurar',
      turnOn: 'Ativar',
    },
    later: (total: number, time: string) =>
      plural('pt', total, {
        one: () => `Mais um chega às ${time}`,
        other: (n) => `Mais ${n} chegam às ${time}`,
      }),
    briefAt: (time: string) => `resumo diário às ${time}`,
    dates: 'Datas e reuniões',
    done: 'Feito',
    firstRead:
      'Lendo seus e-mails dos últimos três dias. O que precisar de você aparece aqui sozinho.',
    approvedMany: (n: number) => `${n} aprovadas`,
    listen: 'Ouvir o resumo',
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
            one: () => 'Uma coisa precisa de você.',
            other: (n) => `${n} coisas precisam de você.`,
          }),
    nothingNeedsYou:
      'Nada precisa de você agora. Novos e-mails são lidos assim que chegam.',
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
    savedHow: (handled: number, replies: number) =>
      `Resolvidos sozinho: ${handled} · Respostas enviadas a partir de rascunhos: ${replies}`,
    recent: (period: string) => `Também ${period}`,
    sent: 'Enviado',
    worthAttention: 'Merece sua atenção',
    writing: 'Escrevendo…',
  },
  whatsapp: {
    connectFirst:
      'Abra Fewmail → Configurações → Integrações e toque em “Conectar WhatsApp” primeiro.',
    connected:
      'Conectado. Vou enviar o resumo toda manhã e avisar quando chegar algo urgente. Envie texto ou uma mensagem de voz para responder a qualquer e-mail.',
    proOnly:
      'O WhatsApp faz parte do Fewmail Pro. Abra Configurações → Plano no Fewmail para assinar.',
  },
  zombie: {
    badge: (share: number) => `Ignora o cancelamento de ${share}% das pessoas`,
    reason: 'Continuou enviando e-mails depois que você cancelou a inscrição',
  },
}
