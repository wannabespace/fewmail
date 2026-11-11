import type { Rich } from '../locales'
import { plural } from '../locales'
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
    chats: 'Conversas',
    confirm: {
      approve_action: 'Fazer esta ação?',
      archive_thread: 'Arquivar esta conversa?',
      create_rule: 'Adicionar esta regra?',
      handle_thread: 'Entregar esta conversa ao agente?',
      reply: 'Enviar esta resposta?',
      send_email: 'Enviar este e-mail?',
      snooze_thread: 'Adiar esta conversa?',
      unsubscribe: 'Cancelar a inscrição deste remetente?',
    },
    decline: 'Não',
    declined: 'Você recusou',
    deleteChat: 'Excluir conversa',
    failed: 'O agente não conseguiu terminar. Tente de novo.',
    lead: 'Pergunte sobre seus e-mails ou diga o que fazer. Tudo o que envia ou altera o Gmail espera o seu sim.',
    newChat: 'Nova conversa',
    noChats: 'Nenhuma conversa ainda',
    placeholder: 'Pergunte sobre seus e-mails ou diga o que fazer…',
    retry: 'Tentar de novo',
    send: 'Enviar',
    steps: {
      list_subscriptions: 'Lendo inscrições',
      approve_action: 'Aprovando',
      archive_thread: 'Arquivando',
      create_rule: 'Adicionando uma regra',
      dismiss_action: 'Pulando',
      draft_reply: 'Escrevendo uma resposta',
      create_draft: 'Salvando um rascunho',
      get_board: 'Lendo o quadro',
      get_person: 'Procurando a pessoa',
      get_today: 'Vendo o dia',
      handle_thread: 'Entregando a conversa',
      list_boards: 'Abrindo quadros',
      list_mail: 'Buscando nos e-mails',
      list_rules: 'Lendo regras',
      read_thread: 'Lendo a conversa',
      redraft_action: 'Reescrevendo o rascunho',
      refresh: 'Buscando e-mails novos',
      send_email: 'Enviando',
      snooze_thread: 'Adiando',
      unsubscribe: 'Cancelando inscrição',
    },
    stop: 'Parar',
    thinking: 'Pensando…',
    title: 'O que posso fazer por você?',
    to: (recipients: string) => `Para ${recipients}`,
    until: (time: string) => `Até ${time}`,
    yes: {
      approve_action: 'Aprovar',
      archive_thread: 'Arquivar',
      create_rule: 'Adicionar',
      handle_thread: 'Entregar',
      reply: 'Enviar',
      send_email: 'Enviar',
      snooze_thread: 'Adiar',
      unsubscribe: 'Cancelar inscrição',
    },
  },
  ask: {
    label: (question: string) => `Perguntar ao Fewmail: “${question}”`,
    thinking: 'Procurando nos seus e-mails…',
  },
  byRule: 'por uma regra',
  boards: {
    chart: {
      add: 'Adicionar gráfico',
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
      other: 'Outros',
      remove: 'Remover gráfico',
      title: 'Título do gráfico',
      type: 'Tipo de gráfico',
      types: {
        area: 'Área',
        bar: 'Barras',
        line: 'Linha',
        pie: 'Pizza',
      },
      untitled: 'Novo gráfico',
    },
    charts: 'Gráficos',
    create: 'Criar painel',
    delete: 'Excluir painel',
    description: 'O que ele reúne',
    descriptionPlaceholder:
      'Viagens: voos, hotéis e aluguel de carro, com quanto custaram',
    edit: 'Editar painel',
    editHint:
      'Se você mudar o que ele reúne, os últimos seis meses são lidos de novo.',
    empty: 'Ainda vazio. E-mails que combinam aparecem aqui assim que chegam.',
    entries: (total: number) =>
      plural('pt', total, {
        one: () => 'Um registro',
        other: (n) => `${n} registros`,
      }),
    name: 'Nome',
    namePlaceholder: 'Viagens',
    new: 'Novo painel',
    newHint:
      'Descreva com suas palavras o que reunir. O Fewmail encontra isso nos e-mails dos últimos seis meses, escolhe os gráficos e mantém tudo atualizado.',
    planning: 'Preparando…',
    readingHistory: 'Lendo os e-mails dos últimos seis meses…',
    save: 'Salvar',
    starter: {
      events: {
        description:
          'Ingressos, reservas e compromissos: onde preciso estar, quando e com quem.',
        name: 'Eventos',
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
      trips: {
        description:
          'Voos, trens, hotéis e aluguéis: para onde vou, quando e quanto custa.',
        name: 'Viagens',
      },
    },
  },
  bulk: {
    badge: (n: number) => `Enviado para ${n}+ usuários do Fewmail`,
    reason: (n: number) =>
      `E-mail em massa: ${n}+ usuários do Fewmail receberam o mesmo texto`,
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
  commitments: {
    title: 'Você prometeu',
  },
  compose: {
    backInQueue: 'Cancelado. O rascunho voltou para Hoje.',
    canceled: 'Cancelado. Seu e-mail voltou para o editor.',
    cc: 'Cc',
    discard: 'Descartar',
    draftSaved: 'Rascunho salvo',
    saveDraft: 'Salvar rascunho',
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
    checkMail: 'Verificar novos e-mails',
    goTo: 'Ir para',
    inboxUpToDate: 'Caixa de entrada em dia',
    mail: 'E-mail',
    nothingMatches: 'Nada encontrado.',
    placeholder: 'Busque e-mails ou execute um comando…',
    rewriteBrief: 'Reescrever o resumo',
    searchFor: (query: string) => `Buscar e-mails por “${query}”`,
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
  keys: {
    unsubscribe: 'cancelar inscrição',
    filter: 'filtro',
    reply: 'responder',
    snooze: 'adiar',
    anything: 'qualquer coisa',
    approve: 'aprovar',
    archive: 'arquivar',
    close: 'fechar',
    draftReply: 'rascunhar',
    edit: 'editar',
    move: 'mover',
    open: 'abrir',
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
      'O Fewmail pede permissão para ler, organizar e enviar seus e-mails do Gmail. Nada é enviado nem arquivado sem o seu aval, a menos que você crie uma regra que permita.',
    continue: 'Continuar com o Google',
    lead: 'O Fewmail lê sua caixa de entrada por você, responde com a sua voz e só mostra o que realmente precisa de você.',
    messengers:
      'Também em mensageiros, começando pelo Telegram: receba o resumo, aprove respostas ou simplesmente envie uma mensagem de voz.',
    title: 'Só o que importa.',
  },
  mail: {
    allMailboxes: 'Todas as caixas',
    unread: 'Não lido',
    block: 'Bloquear remetente',
    blocked: 'Bloqueado. Os e-mails dele agora vão para a lixeira.',
    forward: 'Encaminhar',
    more: 'Mais',
    reply: 'Responder',
    trash: 'Mover para lixeira',
    trashed: 'Movido para a lixeira',
    movedToInbox: 'De volta à caixa de entrada. Valeu por avisar.',
    noThread: 'Escolha um e-mail para lê-lo aqui',
    deleteDraft: 'Excluir rascunho',
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
    empty: 'Nenhum e-mail aqui.',
    expectsReply: 'Aguarda resposta',
    filter: {
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
    subscriptions: 'Inscrições',
    agent: 'Agente',
    boards: 'Painéis',
    newBoard: 'Novo painel',
    mail: 'E-mail',
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
    open: 'Abrir conversas',
    promised: 'Você prometeu',
    threads: (total: number) =>
      plural('pt', total, {
        one: () => '1 conversa',
        other: (n) => `${n} conversas`,
      }),
  },
  queue: {
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
      copyNow: 'Copie esta configuração agora: a chave só aparece uma vez.',
      create: 'Criar chave',
      defaultName: 'Cliente MCP',
      description:
        'Eles podem ler seu resumo e seus e-mails, rascunhar respostas e enviá-las depois que você confirmar.',
      keyName: 'Nome da chave',
      neverUsed: 'Nunca usada',
      revoke: 'Revogar',
      title: 'Conecte Claude, Cursor ou qualquer cliente MCP',
      used: (ago: string) => `Usada ${ago}`,
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
  skills: {
    bills: 'Contas e pagamentos a vencer',
    cleanup: 'Newsletters para limpar',
    followups: 'Quem ainda não te respondeu',
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
    heard: (text: string) => `Entendi: “${text}”`,
    voiceFailed: 'Não consegui entender. Tente de novo ou digite.',
    help: 'Escreva ou diga o que precisa:\n• pergunte sobre seus e-mails: “quando a Netflix renova?”\n• diga o que responder: “diga à Ana que assino amanhã”\n• responda a um dos meus rascunhos para mudá-lo',
    canceled: 'Cancelado. O rascunho voltou para sua fila.',
    sendingIn: (seconds: number) => `Enviando em ${seconds} s`,
    undo: 'Desfazer',
    commands: { brief: 'Resumo de hoje', queue: 'O que precisa de você' },
    connectFirst:
      'Abra Fewmail → Configurações → Integrações e toque em “Conectar Telegram” primeiro.',
    connected:
      'Conectado. Vou enviar seu resumo toda manhã e avisar quando chegar algo urgente.\n\n/brief — resumo de hoje\n/queue — o que precisa de você',
    done: 'Feito',
    draft: 'Rascunho:',
    edit: 'Editar',
    editPrompt:
      'Envie o texto que devo usar no lugar, ou diga como mudar começando com “/”, ex.: “/mais formal”.',
    newDraft: 'Novo rascunho:',
    nothing: 'Nada precisa de você agora.',
    proOnly:
      'O Telegram faz parte do Fewmail Pro. Abra Configurações → Plano no Fewmail para assinar.',
    queueHint: '/queue — o que precisa de você',
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
    briefArrives: (time: string) => `Seu resumo chega todo dia às ${time}.`,
    briefFrom: (time: string) => `resumo das ${time}`,
    dates: 'Datas e reuniões',
    done: 'Feito',
    firstRead:
      'Lendo seus e-mails dos últimos três dias. O que precisar de você aparece aqui sozinho.',
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
    pulse: {
      lists: (n: number) => `${n} de listas de e-mail`,
      people: (n: number) => `${n} de pessoas`,
      total: (total: number) =>
        plural('pt', total, {
          one: (n) => `${n} e-mail no último dia`,
          other: (n) => `${n} e-mails no último dia`,
        }),
    },
    recent: 'Também no último dia',
    sent: 'Enviado',
    worthAttention: 'Merece sua atenção',
    writeNow: 'Escrever agora',
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
