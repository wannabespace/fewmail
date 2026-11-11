import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const es: Messages = {
  ask: {
    label: (question: string) => `Preguntar a Fewmail: «${question}»`,
    thinking: 'Buscando en tu correo…',
  },
  compose: {
    backInQueue: 'Cancelado. El borrador vuelve a estar en Hoy.',
    canceled: 'Cancelado. Tu correo vuelve a estar en el editor.',
    cc: 'Cc',
    discard: 'Descartar',
    forward: 'Reenviar',
    forwardedMessage: 'Mensaje reenviado',
    instructionPlaceholder: '¿Cómo debería sonar? (opcional)',
    invalidRecipients: 'Añade al menos una dirección válida.',
    later: {
      inHour: 'En una hora',
      monday: 'El lunes por la mañana',
      tomorrow: 'Mañana por la mañana',
    },
    new: 'Nuevo correo',
    placeholder: 'Escribe tu correo…',
    remind: {
      days: (total: number) =>
        plural('es', total, {
          one: () => 'Recuérdame si no responden en un día',
          many: (n) => `Recuérdame si no responden en ${n} días`,
          other: (n) => `Recuérdame si no responden en ${n} días`,
        }),
      label: 'Recordarme',
      off: 'Sin recordatorio',
    },
    reply: 'Responder',
    scheduledFor: (date: string) => `Programado para el ${date}`,
    send: 'Enviar',
    sendLater: 'Enviar más tarde',
    sendingIn: (seconds: number) => `Enviando en ${seconds} s`,
    subject: 'Asunto',
    to: 'Para',
    undo: 'Deshacer',
    writeForMe: 'Escríbelo por mí',
    writing: 'Escribiendo…',
  },
  composer: {
    acceptSuggestion: 'Tab para aceptar',
    bold: 'Negrita',
    bulletList: 'Lista con viñetas',
    italic: 'Cursiva',
    link: 'Enlace',
    linkPlaceholder: 'Pega o escribe un enlace',
    noSnippets: 'Ningún fragmento coincide.',
    removeLink: 'Quitar enlace',
  },
  reminders: {
    followUp: 'Hacer seguimiento',
    noReply: 'Aún sin respuesta',
  },
  snooze: {
    laterToday: 'Más tarde hoy',
    nextWeek: 'La próxima semana',
    title: 'Posponer',
    tomorrow: 'Mañana',
    unsnooze: 'Volver a recibidos',
    until: (date: string) => `Pospuesto hasta el ${date}`,
    weekend: 'Este fin de semana',
  },
  actionKind: {
    cleanup: 'Darse de baja de todos',
    commitment: 'Hecho',
    security: 'Ya lo comprobé',
    subscription: 'Entendido',
    task: 'Enviar',
    spam: 'Movido a spam',
    trash: 'Mover a la papelera',
    archive: 'Archivar',
    follow_up: 'Hacer seguimiento',
    mark_read: 'Marcar leído',
    pay: 'Pagar',
    read: 'Leer',
    reply: 'Responder',
    schedule: 'Agendar',
    unsubscribe: 'Darse de baja',
  },
  actionStatus: {
    auto_done: 'hecho por el agente',
    dismissed: 'omitido',
    done: 'hecho',
    failed: 'falló',
    pending: 'esperando en Hoy',
  },
  byRule: 'por una regla',
  category: {
    calendar: 'Calendario',
    finance: 'Finanzas',
    newsletter: 'Newsletter',
    notification: 'Notificación',
    other: 'Otro',
    person: 'Persona',
    promotion: 'Promoción',
    receipt: 'Recibo',
    security: 'Seguridad',
    travel: 'Viajes',
    work: 'Trabajo',
  },
  command: {
    compose: 'Nuevo correo',
    agent: 'Agente',
    appearance: 'Apariencia',
    checkMail: 'Buscar correo nuevo',
    goTo: 'Ir a',
    inboxUpToDate: 'La bandeja está al día',
    mail: 'Correo',
    nothingMatches: 'Sin resultados.',
    placeholder: 'Busca en el correo o ejecuta un comando…',
    rewriteBrief: 'Reescribir el resumen',
    searchFor: (query: string) => `Buscar «${query}» en el correo`,
    upgrade: 'Pasar a Pro',
    teachRule: 'Enseñar una regla nueva',
    theme: {
      dark: 'Usar tema oscuro',
      light: 'Usar tema claro',
      system: 'Igual que el sistema',
    },
  },
  importance: ['Ruido', 'Bueno saberlo', 'Te necesita pronto', 'Urgente'],
  keys: {
    reply: 'responder',
    snooze: 'posponer',
    anything: 'lo que sea',
    archive: 'archivar',
    approve: 'aprobar',
    close: 'cerrar',
    draftReply: 'borrador',
    edit: 'editar',
    move: 'mover',
    open: 'abrir',
    search: 'buscar',
    send: 'enviar',
    skip: 'omitir',
    stopEditing: 'dejar de editar',
  },
  legal: {
    privacy: 'Política de privacidad',
    englishOnly:
      'Este documento se ofrece en inglés, que es la versión vinculante.',
    terms: 'Términos del servicio',
    updated: (date: string) => `Última actualización: ${date}`,
  },
  login: {
    agree: ((slots) => [
      'Al continuar aceptas los ',
      slots.terms,
      ' y la ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail pide permiso para leer, organizar y enviar Gmail por ti. No se envía ni se archiva nada sin tu permiso, salvo que escribas una regla que lo permita.',
    continue: 'Continuar con Google',
    lead: 'Fewmail lee tu bandeja por ti, responde con tu voz y solo te muestra lo que de verdad te necesita.',
    title: 'Solo lo que importa.',
  },
  mail: {
    block: 'Bloquear remitente',
    blocked: 'Bloqueado. Sus correos ahora van a la papelera.',
    forward: 'Reenviar',
    more: 'Más',
    reply: 'Responder',
    trash: 'Mover a la papelera',
    trashed: 'Movido a la papelera',
    movedToInbox: 'Devuelto a la bandeja de entrada. Gracias por avisar.',
    notSpam: 'No es spam',
    reportSpam: 'Marcar como spam',
    reportedSpam: 'Marcado. Sus correos ahora van a spam.',
    archive: 'Archivar',
    archived: 'Archivado',
    attachment: 'adjunto',
    draftReply: 'Redactar respuesta',
    drafting: 'Redactando…',
    draftWaiting: 'El borrador te espera en Hoy',
    due: (date: string) => `vence el ${date}`,
    empty: 'No hay correos aquí.',
    expectsReply: 'Espera respuesta',
    filter: {
      spam: 'Spam',
      inbox: 'Recibidos',
      snoozed: 'Pospuestos',
      important: 'Importantes',
      needs_reply: 'Por responder',
      quiet: 'Tranquilos',
    },
    instruction: 'Dile al agente cómo responder, o pulsa Enter',
    open: 'Abrir',
    search: 'Busca con la sintaxis de Gmail: from:anna has:attachment',
    openInGmail: 'Abrir en Gmail',
    unsubscribe: 'Darse de baja',
    unsubscribed: 'Baja hecha',
    unsubscribeFailed:
      'Este remitente no permite darse de baja con un clic, así que el correo se archivó.',
    you: 'Tú',
  },
  nav: {
    money: 'Dinero',
    mail: 'Correo',
    rules: 'Reglas',
    search: 'Busca o pregunta…',
    settings: 'Ajustes',
    syncFailed: 'Falló la sincronización con Gmail, reintentando',
    syncing: 'Leyendo tu bandeja…',
    today: 'Hoy',
    trialLeft: (total: number) =>
      plural('es', total, {
        one: (n) => `Prueba de Pro · queda ${n} día`,
        many: (n) => `Prueba de Pro · quedan ${n} días`,
        other: (n) => `Prueba de Pro · quedan ${n} días`,
      }),
    watching: 'El agente vigila tu bandeja',
  },
  onboarding: {
    briefTitle: '¿Cuándo quieres tu resumen?',
    languageHint:
      'La app, los resúmenes y las explicaciones usan este idioma. Las respuestas siempre siguen el idioma del correo que contestas.',
    languageTitle: '¿En qué idioma debe hablar Fewmail?',
    lead: 'Tres respuestas rápidas. Puedes cambiarlas luego en Ajustes.',
    personaTitle: '¿Cómo usas el correo?',
    reading: 'Leyendo tu bandeja…',
    start: 'Empezar',
    title: 'Configuremos tu agente.',
  },
  plan: {
    free: 'Gratis',
    freeDescription:
      'Correo rápido y tranquilo con reglas simples. Gratis todo el tiempo que quieras.',
    includes:
      'Pro añade el agente: un resumen diario, cada correo leído y resumido, respuestas redactadas con tu voz, reglas en palabras sencillas, Telegram y MCP.',
    manage: 'Gestionar facturación',
    price: (usd: number) => `$${usd} / mes`,
    pro: 'Pro',
    proCancels: (date: string) => `Pro hasta el ${date}, después Gratis.`,
    proRenews: (date: string) => `Se renueva el ${date}.`,
    title: 'Plan',
    trial: 'Prueba de Pro',
    trialDescription: (date: string) =>
      `Todas las funciones de Pro hasta el ${date}. Después Fewmail sigue siendo gratis con reglas simples, sin tarjeta.`,
    upgrade: 'Pasar a Pro',
    welcome:
      'Te damos la bienvenida a Pro. El agente vuelve a estar en marcha.',
  },
  persona: {
    reader: {
      description:
        'Sobre todo leo. Mantén mi bandeja tranquila, ocúpate del ruido y que no se escape nada importante.',
      title: 'Sobre todo leo',
    },
    responder: {
      description:
        'Respondo mucho. Pon primero a quienes esperan mi respuesta y redacta borradores con mi voz.',
      title: 'Respondo mucho',
    },
  },
  queue: {
    draftedInVoice: 'Redactado con tu voz',
    edit: 'Editar',
    open: 'Abrir',
    send: 'Enviar',
    shorter: 'Más corto',
    shorterInstruction: 'Hazlo más corto.',
    skip: 'Omitir',
  },
  rules: {
    actWithoutAsking: 'Actuar sin preguntar',
    add: 'Añadir regla',
    count: (total: number) =>
      plural('es', total, {
        one: () => '1 regla',
        other: (n) => `${n} reglas`,
      }),
    delete: 'Eliminar',
    describe: {
      alwaysShow: 'Siempre llega a Hoy',
      autonomous: 'Se hace solo y aparece en gestionados',
      draft: 'Un borrador te espera en Hoy',
      suggested: 'Se sugiere en Hoy y tú confirmas',
    },
    effect: {
      trash: 'Moverlo a la papelera',
      always_show: 'Mostrármelo siempre',
      archive: 'Archivarlo',
      draft_reply: 'Redactar respuesta',
      mark_read: 'Marcar como leído',
      unsubscribe: 'Darse de baja',
    },
    enabled: 'Regla activada',
    lead: 'Dile al agente con tus palabras qué hacer con cierto correo. Revisa cada correo con estas reglas, de arriba abajo.',
    newTitle: 'Enseñar una regla nueva',
    placeholder: 'p. ej. Facturas de Hetzner o notificaciones de LinkedIn',
    leadFree:
      'Archiva, marca como leído o date de baja automáticamente. Las reglas se aplican al correo nuevo en cuanto llega.',
    simple: {
      appliedAutomatically: 'Se aplica automáticamente al correo nuevo',
      field: {
        from: 'De',
        mailingList: 'Cualquier lista de correo',
        subject: 'El asunto contiene',
      },
      title: {
        from: (value: string) => `De «${value}»`,
        mailingList: () => 'Cualquier lista de correo',
        subject: (value: string) => `El asunto contiene «${value}»`,
      },
      valuePlaceholder: 'anna@example.com, un nombre o una palabra',
      whichField: 'Coincidir por',
    },
    title: 'Reglas',
    whatAgentDoes: 'Qué hace el agente',
    whichEmails: 'Qué correos',
    withoutAsking: 'Sin preguntar',
  },
  settings: {
    knowledge: {
      description:
        'Precios, direcciones, disponibilidad, cómo te gusta responder. El agente lo usa en borradores y autocompletado.',
      placeholder:
        'p. ej. La consultoría cuesta $150/h. Los viernes no atiendo llamadas. Mi dirección es…',
      title: 'Lo que el agente debe saber',
    },
    labels: {
      description:
        'Ordena el correo en etiquetas Fewmail/… para que Gmail en tu móvil muestre el mismo orden.',
      title: 'Etiquetas del agente en Gmail',
    },
    snippets: {
      add: 'Añadir fragmento',
      body: 'Texto',
      delete: 'Eliminar',
      description:
        'Escribe ; en el editor para insertar un fragmento por su nombre.',
      name: 'Nombre',
      title: 'Fragmentos',
    },
    account: 'Cuenta',
    agent: 'Agente',
    briefDescription: (timezone: string) => `En tu zona horaria, ${timezone}`,
    briefTitle: 'Resumen diario',
    deleteAccount: 'Eliminar cuenta',
    deleteConfirm: 'Eliminar todo',
    deleteDescription:
      'Elimina de inmediato tu cuenta, el correo sincronizado, borradores, reglas y resúmenes de Fewmail. Tu Gmail no se toca.',
    deleteTitle: '¿Eliminar tu cuenta de Fewmail?',
    cancel: 'Cancelar',
    integrations: 'Integraciones',
    language: 'Idioma',
    languageDescription:
      'App, resúmenes y síntesis. Las respuestas siguen al correo.',
    legal: 'Legal',
    mcp: {
      copyNow:
        'Copia esta configuración ahora: la clave solo se muestra una vez.',
      create: 'Crear clave',
      defaultName: 'Cliente MCP',
      description:
        'Pueden leer tu resumen y tu correo, redactar respuestas y enviarlas cuando confirmes.',
      keyName: 'Nombre de la clave',
      neverUsed: 'Nunca usada',
      revoke: 'Revocar',
      title: 'Conecta Claude, Cursor o cualquier cliente MCP',
      used: (ago: string) => `Usada ${ago}`,
    },
    persona: 'Cómo usas el correo',
    signedInWithGoogle: 'Sesión iniciada con Google',
    signOut: 'Cerrar sesión',
    telegram: {
      connect: 'Conectar Telegram',
      disconnect: 'Desconectar',
      linked:
        'Tu resumen llega cada mañana y el correo urgente, al momento. Aprueba y edita borradores desde el chat.',
      notConfigured: 'El bot de Telegram no está configurado en este servidor.',
      unlinked: 'Recibe el resumen y aprueba borradores desde Telegram.',
    },
    title: 'Ajustes',
  },
  spam: {
    reasonCommunity: 'Varios usuarios de Fewmail lo marcaron como spam',
    reasonYou: 'Marcaste a este remitente como spam',
  },
  starterRules: {
    alwaysShow:
      'Alertas de seguridad, facturas por pagar, cualquier cosa de mi banco o de la administración pública',
    newsletters: 'Newsletters y boletines',
    notifications: 'Notificaciones automáticas de herramientas y servicios',
    people:
      'Correos de personas reales que me hacen una pregunta o esperan mi respuesta',
    promotions: 'Promociones, marketing y correos de venta en frío',
    receipts: 'Recibos, confirmaciones de pedido y de envío',
  },
  telegram: {
    heard: (text: string) => `He oído: «${text}»`,
    voiceFailed: 'No lo he entendido. Inténtalo de nuevo o escríbelo.',
    whichEmail:
      '¿Qué correo? Responde a uno de mis mensajes con lo que quieres decir.',
    canceled: 'Cancelado. El borrador vuelve a tu cola.',
    sendingIn: (seconds: number) => `Enviando en ${seconds} s`,
    undo: 'Deshacer',
    commands: { brief: 'Resumen de hoy', queue: 'Lo que te necesita' },
    connectFirst:
      'Primero abre Fewmail → Ajustes → Integraciones y toca «Conectar Telegram».',
    connected:
      'Conectado. Te enviaré el resumen cada mañana y te avisaré cuando llegue algo urgente.\n\n/brief — resumen de hoy\n/queue — lo que te necesita',
    done: 'Hecho',
    draft: 'Borrador:',
    edit: 'Editar',
    editPrompt:
      'Envíame el texto que quieres usar, o dime cómo cambiarlo empezando por «/», p. ej. «/más formal».',
    newDraft: 'Nuevo borrador:',
    nothing: 'Ahora mismo nada te necesita.',
    proOnly:
      'Telegram forma parte de Fewmail Pro. Abre Ajustes → Plan en Fewmail para pasarte.',
    queueHint: '/queue — lo que te necesita',
    rewriting: 'Reescribiendo…',
    send: 'Enviar',
    sendThis: 'Enviar esto',
    shorter: 'Más corto',
    skip: 'Omitir',
    skipped: 'Omitido',
    somethingWrong: 'Algo salió mal',
    urgent: 'Urgente',
    willSend: 'Enviaré:',
  },
  today: {
    later: (total: number, time: string) =>
      plural('es', total, {
        one: () => `Llega una más a las ${time}`,
        many: (n) => `Llegan ${n} más a las ${time}`,
        other: (n) => `Llegan ${n} más a las ${time}`,
      }),
    briefArrives: (time: string) => `Tu resumen llega cada día a las ${time}.`,
    briefFrom: (time: string) => `resumen de las ${time}`,
    done: 'Hecho',
    handled: {
      spam: (n: number) => `A spam: ${n}`,
      archived: (n: number) => `Archivados: ${n}`,
      markedRead: (n: number) => `Marcados como leídos: ${n}`,
      review: 'Revisar',
      total: (n: number) => `Gestionados: ${n}`,
      unsubscribed: (n: number) => `Bajas: ${n}`,
    },
    headline: (total: number) =>
      total === 0
        ? 'Todo en calma.'
        : plural('es', total, {
            one: () => 'Una cosa te necesita.',
            other: (n) => `${n} cosas te necesitan.`,
          }),
    nothingNeedsYou:
      'Ahora mismo nada te necesita. El correo nuevo se lee en cuanto llega.',
    sent: 'Enviado',
    waitingOnYou: 'Te esperan',
    worthAttention: 'Merece tu atención',
    writeNow: 'Escribirlo ahora',
    writing: 'Escribiendo…',
  },
  bulk: {
    badge: (n: number) => `Enviado a más de ${n} usuarios de Fewmail`,
    reason: (n: number) =>
      `Envío masivo: más de ${n} usuarios de Fewmail recibieron el mismo texto`,
  },
  cleanup: {
    emails: (total: number) =>
      plural('es', total, {
        one: () => '1 correo',
        many: (n) => `${n} correos`,
        other: (n) => `${n} correos`,
      }),
    reason: (total: number) => `${total} correos este mes, ninguno abierto`,
    title: (total: number) =>
      plural('es', total, {
        one: () => 'Darse de baja de un boletín que nunca abres',
        many: (n) => `Darse de baja de ${n} boletines que nunca abres`,
        other: (n) => `Darse de baja de ${n} boletines que nunca abres`,
      }),
  },
  commitments: {
    title: 'Lo prometiste',
  },
  money: {
    due: (date: string) => `Vence el ${date}`,
    empty:
      'Aún nada. Los recibos, facturas y suscripciones aparecerán aquí a medida que lleguen.',
    lastCharged: (date: string) => `Último cargo: ${date}`,
    lead: 'Todo lo que Fewmail encontró en tus recibos y facturas.',
    monthlyTotal: 'Cada mes en suscripciones',
    period: { month: 'mensual', week: 'semanal', year: 'anual' },
    priceUp: (merchant: string, from: string, to: string) =>
      `${merchant} ahora cuesta ${to} (antes ${from})`,
    priceUpTitle: (merchant: string) => `${merchant} ha subido de precio`,
    recent: 'Compras recientes',
    subscriptions: 'Suscripciones',
    title: 'Dinero',
    upcoming: 'Facturas pendientes',
  },
  people: {
    firstContact: (date: string) => `Os escribís desde ${date}`,
    lastContact: (date: string) => `Último correo: ${date}`,
    open: 'Abrir conversaciones',
    promised: 'Lo prometiste',
    threads: (total: number) =>
      plural('es', total, {
        one: () => '1 conversación',
        many: (n) => `${n} conversaciones`,
        other: (n) => `${n} conversaciones`,
      }),
  },
  risk: {
    lookalike_domain: (domain: string) =>
      `Parece ${domain}, pero es otra dirección. No hagas clic en enlaces ni pagues.`,
    new_sender_payment: (domain: string) =>
      `Primer correo de ${domain} y pide dinero. Compruébalo por un canal en el que ya confíes.`,
    payment_change: (domain: string) =>
      `Nuevos datos de pago de ${domain}. Confírmalo por teléfono antes de pagar.`,
    title: 'Compruébalo antes de actuar',
  },
  tasks: {
    active: (goal: string) => `El agente se encarga: ${goal}`,
    auto: 'Enviar correos sin preguntarme',
    autoHint: 'Cada correo espera unos segundos para que puedas deshacerlo.',
    cancel: 'Detener',
    done: 'Tarea completada',
    goal: '¿Qué debe conseguir el agente?',
    goalPlaceholder:
      'p. ej. Que reenvíen la factura con nuestra nueva dirección',
    handle: 'Encárgate de esto…',
    next: 'Siguiente paso',
    start: 'Empezar',
    started: 'El agente se encarga.',
  },
  zombie: {
    badge: (share: number) => `Ignora las bajas del ${share}% de la gente`,
    reason: 'Siguió escribiéndote después de darte de baja',
  },
}
