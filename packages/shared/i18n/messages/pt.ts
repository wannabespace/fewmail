import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const pt: Messages = {
  actionKind: {
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
  ask: {
    label: (question: string) => `Perguntar ao Fewmail: “${question}”`,
    thinking: 'Procurando nos seus e-mails…',
  },
  byRule: 'por uma regra',
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
  compose: {
    backInQueue: 'Cancelado. O rascunho voltou para Hoje.',
    canceled: 'Cancelado. Seu e-mail voltou para o editor.',
    cc: 'Cc',
    discard: 'Descartar',
    forward: 'Encaminhar',
    forwardedMessage: 'Mensagem encaminhada',
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
  keys: {
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
    title: 'Leia menos e-mails.',
  },
  mail: {
    block: 'Bloquear remetente',
    blocked: 'Bloqueado. Os e-mails dele agora vão para a lixeira.',
    forward: 'Encaminhar',
    more: 'Mais',
    reply: 'Responder',
    trash: 'Mover para lixeira',
    trashed: 'Movido para a lixeira',
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
      inbox: 'Entrada',
      snoozed: 'Adiados',
      important: 'Importantes',
      needs_reply: 'A responder',
      quiet: 'Silenciosos',
    },
    instruction: 'Diga ao agente como responder ou só aperte Enter',
    open: 'Abrir',
    search: 'Busque com a sintaxe do Gmail: from:anna has:attachment',
    openInGmail: 'Abrir no Gmail',
    unsubscribe: 'Cancelar inscrição',
    unsubscribed: 'Inscrição cancelada',
    unsubscribeFailed:
      'Este remetente não tem cancelamento de inscrição com um clique, então o e-mail foi arquivado.',
    you: 'Você',
  },
  nav: {
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
    watching: 'O agente está de olho na sua caixa de entrada',
  },
  onboarding: {
    briefTitle: 'Quando seu resumo deve ficar pronto?',
    languageHint:
      'O app, os resumos e as explicações usam este idioma. As respostas sempre seguem o idioma do e-mail que você responde.',
    languageTitle: 'Em qual idioma o Fewmail deve falar?',
    lead: 'Três respostas rápidas. Você pode mudar tudo depois em Configurações.',
    personaTitle: 'Como você usa o e-mail?',
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
    pro: 'Pro',
    proCancels: (date: string) => `Pro até ${date}, depois Grátis.`,
    proRenews: (date: string) => `Renova em ${date}.`,
    title: 'Plano',
    trial: 'Teste do Pro',
    trialDescription: (date: string) =>
      `Todos os recursos do Pro até ${date}. Depois, o Fewmail continua grátis com regras simples — sem precisar de cartão.`,
    upgrade: 'Assinar o Pro',
    welcome: 'Boas-vindas ao Pro. O agente está de volta ao trabalho.',
  },
  persona: {
    reader: {
      description:
        'Eu mais leio. Mantenha minha caixa de entrada tranquila, cuide do ruído e não deixe nada importante passar.',
      title: 'Eu mais leio',
    },
    responder: {
      description:
        'Eu respondo muito. Coloque primeiro quem está esperando por mim e deixe respostas rascunhadas com a minha voz.',
      title: 'Eu respondo muito',
    },
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
  rules: {
    actWithoutAsking: 'Agir sem perguntar',
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
      suggested: 'Sugerido em Hoje, você confirma',
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
    withoutAsking: 'Sem perguntar',
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
    persona: 'Como você usa o e-mail',
    signedInWithGoogle: 'Conectado com o Google',
    signOut: 'Sair',
    snippets: {
      add: 'Adicionar snippet',
      body: 'Texto',
      delete: 'Excluir',
      description: 'Digite ; no editor para inserir um snippet pelo nome.',
      name: 'Nome',
      title: 'Snippets',
    },
    telegram: {
      connect: 'Conectar Telegram',
      disconnect: 'Desconectar',
      linked:
        'Seu resumo chega toda manhã, e-mails urgentes na hora. Aprove e edite rascunhos pelo chat.',
      notConfigured: 'O bot do Telegram não está configurado neste servidor.',
      unlinked: 'Receba o resumo e aprove rascunhos pelo Telegram.',
    },
    title: 'Configurações',
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
  starterRules: {
    alwaysShow:
      'Alertas de segurança, contas a vencer, qualquer coisa do meu banco ou do governo',
    newsletters: 'Newsletters e resumos periódicos',
    notifications: 'Notificações automáticas de ferramentas e serviços',
    people:
      'E-mails de pessoas reais que me fazem uma pergunta ou esperam minha resposta',
    promotions: 'Promoções, marketing e e-mails de vendas não solicitados',
    receipts: 'Recibos, confirmações de pedido e de envio',
  },
  telegram: {
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
    briefArrives: (time: string) => `Seu resumo chega todo dia às ${time}.`,
    briefFrom: (time: string) => `resumo das ${time}`,
    done: 'Feito',
    handled: {
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
    sent: 'Enviado',
    waitingOnYou: 'Esperando por você',
    worthAttention: 'Merece sua atenção',
    writeNow: 'Escrever agora',
    writing: 'Escrevendo…',
  },
}
