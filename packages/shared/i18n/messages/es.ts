import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const es: Messages = {
  agent: {
    voice: 'Hablar con el agente',
    voiceStop: 'Detener y enviar',
    chats: 'Chats',
    autonomy: {
      ask: 'Te pregunta antes de cada correo',
      auto: (most: number) =>
        `Envía los correos por su cuenta, sin preguntarte (hasta ${most})`,
    },
    calendar: (email: string) => `En el calendario de ${email}`,
    cc: (recipients: string) => `CC ${recipients}`,
    confirm: {
      create_schedule: '¿Ejecutar esto de forma programada?',
      create_event: '¿Añadir este evento?',
      delete_event: '¿Eliminar este evento?',
      update_event: '¿Cambiar este evento?',
      approve_action: '¿Hacer esta acción?',
      archive_thread: '¿Archivar esta conversación?',
      clear_out: '¿Limpiar estos grupos de correo de la bandeja?',
      undo_clear_out: '¿Devolver a la bandeja todo lo limpiado?',
      create_rule: '¿Añadir esta regla?',
      handle_thread: '¿Dejar esta conversación al agente?',
      reply: '¿Enviar esta respuesta?',
      send_email: '¿Enviar este correo?',
      snooze_thread: '¿Posponer esta conversación?',
      unsubscribe: '¿Darte de baja de este remitente?',
      trash_thread: '¿Mover este hilo a la papelera?',
      report_spam: '¿Marcar este remitente como spam?',
      mark_not_spam: '¿Sacar este hilo del spam?',
      move_to_inbox: '¿Devolver este hilo a la bandeja de entrada?',
    },
    decline: 'No',
    declined: 'Dijiste que no',
    detach: 'No adjuntar este correo',
    deleteChat: 'Eliminar chat',
    failed: 'El agente no pudo terminar. Inténtalo de nuevo.',
    lead: 'Pregunta por tu correo o di qué hacer. Todo lo que envía o cambia Gmail espera tu sí.',
    newChat: 'Nuevo chat',
    closeChat: 'Cerrar pestaña',
    switchChat: 'Cambiar de chat',
    noChats: 'Aún no hay chats',
    cancelEdit: 'Cancelar edición',
    copy: 'Copiar',
    edit: 'Editar',
    editing: 'Editando tu mensaje',
    regenerate: 'Responder de nuevo',
    skills: 'Habilidades',
    placeholder: 'Pregunta por tu correo o escribe / para ver habilidades',
    retry: 'Reintentar',
    send: 'Enviar',
    steps: {
      create_schedule: 'Creando la programación',
      delete_schedule: 'Deteniendo la programación',
      list_schedules: 'Leyendo las programaciones',
      create_event: 'Añadiendo un evento',
      delete_event: 'Eliminando el evento',
      list_events: 'Mirando el calendario',
      update_event: 'Cambiando el evento',
      list_subscriptions: 'Revisando suscripciones',
      approve_action: 'Aprobando',
      archive_thread: 'Archivando',
      get_reading: 'Leyendo los boletines',
      get_wrapped: 'Contando tu correo',
      clear_out: 'Limpiando la bandeja',
      preview_clear_out: 'Leyendo toda la bandeja',
      undo_clear_out: 'Devolviendo el correo limpiado',
      create_rule: 'Añadiendo una regla',
      dismiss_action: 'Omitiendo',
      draft_reply: 'Redactando una respuesta',
      create_draft: 'Guardando un borrador',
      get_board: 'Leyendo el tablero',
      get_person: 'Buscando a la persona',
      get_today: 'Revisando hoy',
      handle_thread: 'Pasando la conversación',
      list_boards: 'Abriendo tableros',
      list_handled: 'Revisando lo gestionado',
      list_mail: 'Buscando en el correo',
      list_rules: 'Leyendo reglas',
      read_thread: 'Leyendo la conversación',
      redraft_action: 'Reescribiendo el borrador',
      refresh: 'Buscando correo nuevo',
      send_email: 'Enviando',
      snooze_thread: 'Posponiendo',
      unsubscribe: 'Dando de baja',
      trash_thread: 'Moviendo a la papelera',
      report_spam: 'Marcando como spam',
      mark_not_spam: 'Sacando del spam',
      move_to_inbox: 'Moviendo a la bandeja de entrada',
      create_board: 'Creando un tablero',
      update_board: 'Cambiando el tablero',
      delete_board: 'Eliminando el tablero',
      add_board_chart: 'Añadiendo un gráfico',
      add_to_board: 'Añadiendo al tablero',
      edit_board_entry: 'Corrigiendo la entrada',
      remove_board_entry: 'Quitando del tablero',
      rename_board_group: 'Renombrando el grupo',
    },
    stop: 'Detener',
    thinking: 'Pensando…',
    title: '¿Qué puedo hacer por ti?',
    to: (recipients: string) => `Para ${recipients}`,
    until: (time: string) => `Hasta ${time}`,
    yes: {
      create_schedule: 'Programar',
      create_event: 'Añadir',
      delete_event: 'Eliminar',
      update_event: 'Guardar',
      approve_action: 'Aprobar',
      archive_thread: 'Archivar',
      clear_out: 'Limpiar',
      undo_clear_out: 'Devolver',
      create_rule: 'Añadir',
      handle_thread: 'Dejar al agente',
      reply: 'Enviar',
      send_email: 'Enviar',
      snooze_thread: 'Posponer',
      unsubscribe: 'Darme de baja',
      trash_thread: 'A la papelera',
      report_spam: 'Es spam',
      mark_not_spam: 'No es spam',
      move_to_inbox: 'Devolver',
    },
  },
  ask: {
    label: (question: string) => `Preguntar a Fewmail: «${question}»`,
    thinking: 'Buscando en tu correo…',
  },
  compose: {
    backInQueue: 'Cancelado. El borrador vuelve a estar en Hoy.',
    canceled: 'Cancelado. Tu correo vuelve a estar en el editor.',
    cc: 'Cc',
    discard: 'Descartar',
    draftSaved: 'Borrador guardado',
    saveDraft: 'Guardar borrador',
    forward: 'Reenviar',
    forwardedMessage: 'Mensaje reenviado',
    from: 'De',
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
  site: {
    chapters: {
      pricing: {
        description:
          'Ordenar el correo, las reglas y la protección son gratis para siempre. Pro y Max añaden todo lo que lee y escribe por ti; Max simplemente hace más.',
        label: 'Precios',
        title: (usd: number) => `Ordenar es gratis. El agente, desde $${usd}.`,
      },
      questions: {
        description:
          'Las respuestas cortas. Las largas están en la política de privacidad.',
        label: 'Preguntas',
        title: 'Antes de conectar Gmail.',
      },
    },
    closing: {
      lead: 'Conecta Gmail en un minuto. Fewmail empieza con el correo de los últimos tres días, así que las primeras decisiones ya te están esperando.',
      title: 'Recupera tus mañanas.',
    },
    mcp: {
      answer:
        'El contrato firmado, antes del arranque del viernes. Ya hay una respuesta redactada esperándote en tu cola de Fewmail.',
      clients: 'Funciona con',
      emphasis: 'Claude y ChatGPT.',
      free: 'Leer tu correo y la clasificación del agente son gratis.',
      label: 'MCP',
      lead: 'Conecta Fewmail como servidor MCP y pregunta por tu correo desde el asistente que ya usas. Todo lo que envía o cambia algo en Gmail sigue pidiéndote un sí.',
      question: '¿Qué necesita Anna de mí esta semana?',
      setup: 'Conéctalo en un minuto',
      title: 'Tu correo, dentro de Claude y ChatGPT.',
    },
    mcpPage: {
      copy: 'Copiar URL',
      lead: 'Conecta Fewmail como servidor MCP y pregunta por tu correo desde la IA que ya usas. Leer tu correo y la clasificación del agente son gratis; borradores, envíos y reglas vienen con Pro.',
      safety:
        'Todo lo que envía un correo o cambia Gmail te pide un sí antes. Tu correo nunca entrena modelos y puedes desconectar cualquier app en Ajustes.',
      steps: {
        chatgpt:
          'En Settings, añade un conector (app) con esta URL y luego inicia sesión en Fewmail.',
        claude:
          'En Settings → Connectors, añade un conector personalizado con esta URL y luego inicia sesión en Fewmail.',
        code: 'Ejecuta esto una vez en una terminal e inicia sesión en Fewmail cuando Claude Code lo pida.',
        cursor:
          'Añade esto a tu mcp.json e inicia sesión en Fewmail cuando Cursor lo pida.',
      },
      title: 'Fewmail dentro de Claude, ChatGPT y tus herramientas.',
    },
    comparePage: {
      lead: 'Los clientes de correo te ayudan a leer cada correo más rápido. Los filtros mueven el correo a carpetas. Fewmail es un agente: lee el correo, decide qué puede esperar y solo te pregunta por el resto.',
      title: 'Fewmail frente a los demás.',
    },
    comparison: {
      custom: 'A medida',
      features: 'Función por función',
      groups: {
        agent: 'Leer y responder',
        day: 'Tu día',
        reach: 'Dónde funciona',
        safety: 'Protección',
      },
      labels: {
        ask: 'Pregúntale lo que quieras a tu correo',
        brief: 'Resumen diario',
        calendar: 'Calendario',
        drafts: 'Respuestas redactadas para ti',
        followUps: 'Recordatorios de seguimiento',
        gmail: 'Gmail y Google Workspace',
        handOver: 'Delegar un hilo',
        importance: 'Ordenado por importancia',
        keepApp: 'Sigue con tu app de correo',
        mcp: 'MCP para tus propias herramientas',
        memory: 'Recuerda promesas y personas',
        otherProviders: 'iCloud, Yahoo y otro correo IMAP',
        outlook: 'Outlook y Microsoft 365',
        phishing: 'Avisos de phishing y de cambios de pago',
        phone: 'En tu móvil',
        rules: 'Reglas en palabras sencillas',
        snooze: 'Posponer',
        spamShield: 'Escudo antispam comunitario',
        summaries: 'Resúmenes de correos',
        teams: 'Bandeja de equipo',
        unsubscribe: 'Baja con un clic',
      },
      more: 'Más comparaciones',
      no: 'No',
      noFreePlan: 'Sin plan gratuito',
      ours: {
        ask: 'Con Pro',
        brief: 'En tu idioma, con Pro',
        drafts: 'Con tu voz, enviadas solo cuando las apruebas, con Pro',
        followUps: 'Automáticos, en correos que esperan respuesta',
        handOver: 'El agente lo lleva hasta su objetivo, con Pro',
        importance: 'Cada correo puntuado, gratis',
        keepApp: 'Todo aparece en Gmail',
        mcp: 'Con Pro',
        memory: 'Con Pro',
        phone: 'Telegram y WhatsApp, con voz, con Pro',
        rules: 'Archivar, marcar como leído o darse de baja, gratis',
        summaries: 'Con Pro',
        unsubscribe: 'Quien lo ignore acaba en spam',
      },
      plans: 'Planes y precios',
      read: 'Leer la comparación',
      source: (name: string, date: string) =>
        `Los datos de ${name} vienen de su web pública, consultada en ${date}. Los precios y las funciones cambian; consulta su web para ver la oferta actual.`,
      title: (name: string) => `Fewmail vs ${name}`,
      tryFree: 'Prueba Fewmail gratis',
      which: '¿Cuál es para ti?',
      yes: 'Sí',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 buzones y todas las funciones, AI Bundle incluido',
          lunch: '2 buzones, posponer y recordatorios',
          snack: '1 buzón y filtrado básico',
        },
        summary:
          'SaneBox ordena el correo en carpetas y, en su plan más alto, también redacta y resume. Fewmail lo lee todo primero y te entrega un solo resumen y las pocas decisiones que solo tú puedes tomar.',
        them: {
          brief: 'Un boletín diario del correo filtrado',
          drafts: 'SaneDrafts, con Dinner',
          followUps: 'SaneNoReplies',
          importance: 'El correo poco importante va a SaneLater',
          keepApp: 'Funciona con carpetas',
          otherProviders: 'Cualquier servidor IMAP o Exchange',
          phone: 'A través de tu app de correo',
          rules: 'Se entrena moviendo correo entre carpetas',
          snooze: 'Desde Lunch',
          summaries: 'SaneSummary, con Dinner',
          unsubscribe: 'Carpeta SaneBlackHole',
        },
        verdict:
          'Elige SaneBox si tu correo está fuera de Gmail y te bastan las carpetas. Elige Fewmail si usas Gmail y quieres que el correo importante se lea, se resuma y se responda.',
      },
      shortwave: {
        plans: {
          business: 'Por usuario',
          free: 'Casi todas las funciones y el asistente',
          max: 'Por usuario, los modelos más potentes',
          premier: 'Por usuario, modelos más potentes',
          pro: 'Historial completo, búsqueda y redacción con IA',
        },
        summary:
          'Shortwave es un cliente de correo con un asistente de IA con el que hablas. Fewmail es un agente que lee primero y solo te pregunta lo que no puede decidir.',
        them: {
          ask: 'Asistente de IA y búsqueda',
          drafts: 'Cuando lo pides',
          importance: 'Splits y agrupaciones',
          keepApp: 'Sustituye tu app de correo',
          memory: 'Memoria de IA',
          otherProviders: 'Reenviado a Gmail',
          outlook: 'Microsoft 365 no compatible',
          phone: 'Apps para iOS y Android',
          rules: 'Filtros de IA, de 3 a 50 según el plan',
          summaries: 'Encima de cada correo',
          teams: 'Hilos y comentarios compartidos',
          unsubscribe: 'Con bloqueo en un clic',
        },
        verdict:
          'Elige Shortwave si quieres una bandeja nueva con un asistente de chat. Elige Fewmail si quieres mirar menos correos, en el Gmail que ya usas.',
      },
      superhuman: {
        plans: {
          business:
            'Por miembro, $33 con pago anual. Añade Auto Drafts y Ask AI',
          enterprise: 'SSO y controles de administración',
          starter: 'Por miembro, $25 con pago anual',
        },
        summary:
          'Superhuman te hace más rápido revisando cada correo. Fewmail los revisa por ti y solo te enseña lo que te necesita.',
        them: {
          ask: 'Ask AI, con Business',
          drafts: 'Auto Drafts, con Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox y Auto Labels',
          keepApp: 'Sustituye tu app de correo',
          mcp: 'Con Business',
          phone: 'Apps para iOS y Android',
          rules: 'Custom Auto Labels, con Business',
          spamShield: 'El filtro de tu proveedor',
          summaries: 'Auto Summarize',
          teams: 'Borradores y comentarios compartidos',
        },
        verdict:
          'Elige Superhuman si quieres tocar cada correo tú mismo, pero más rápido. Elige Fewmail si prefieres no ver la mayoría.',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'No. Fewmail funciona sobre Gmail. Todo lo que hace se ve también en Gmail, y puedes seguir usando cualquier app de Gmail a la vez.',
        question: '¿Tengo que dejar Gmail?',
      },
      {
        answer:
          'Nunca sin ti. Las respuestas esperan en tu cola hasta que las apruebas, y solo las reglas que creaste o mantuviste pueden archivar, marcar como leído o darse de baja por su cuenta. Todo lo que hizo aparece en Gestionados.',
        question: '¿Puede enviar o borrar correo por su cuenta?',
      },
      {
        answer:
          'Asuntos, cuerpos, resúmenes y borradores se guardan cifrados en nuestra base de datos. Tu correo nunca se usa para entrenar modelos, y el escudo antispam solo comparte hashes con clave entre usuarios, nunca direcciones ni contenido.',
        question: '¿Qué pasa con mi correo?',
      },
      {
        answer: `Cada cuenta nueva recibe ${trialDays} días de Pro, sin tarjeta. Cuando terminan, simplemente sigues en Gratis: no se borra nada y no se cobra nada.`,
        question: '¿Qué pasa después de la prueba?',
      },
      {
        answer:
          'Los borradores se escriben en el idioma del correo al que respondes. La app, el resumen y el bot de Telegram hablan el idioma que elijas, entre quince.',
        question: '¿Qué idiomas habla?',
      },
      {
        answer:
          'Por ahora, cuentas de Gmail y Google Workspace. Añade varios buzones a un mismo Fewmail y su correo llega al mismo resumen y a la misma bandeja.',
        question: '¿Qué cuentas de correo funcionan?',
      },
    ],
    features: {
      description:
        'Las partes del correo que antes te llevaban una tarde, hechas en segundo plano y anotadas donde puedes revisarlas.',
      items: {
        ask: {
          description:
            'Pregunta lo que quieras con tus palabras y obtén la respuesta de tu propio correo, con los correos de donde sale.',
          title: 'Pregunta a tu correo',
        },
        boards: {
          description:
            'Dinero, suscripciones de pago, viajes, pedidos: describe qué quieres seguir y el agente lo reúne de medio año de correo, con gráficos.',
          title: 'Tableros',
        },
        calendar: {
          description:
            'El calendario de cada buzón en una sola vista. Una reunión propuesta en un correo se convierte en evento cuando dices que sí.',
          title: 'Calendario',
        },
        clearOut: {
          description:
            'Todo lo acumulado fuera de una vez, hasta 50.000 correos por buzón, bajo una misma etiqueta para que un solo clic los devuelva todos. Gratis.',
          title: 'Limpiar la bandeja',
        },
        forward: {
          description:
            'Reenvía un correo con una nota encima, «búscame un hueco con ellos la semana que viene», y el agente se encarga del resto.',
          title: 'Reenviar al agente',
        },
        handle: {
          description:
            'Delega una conversación con un objetivo y el agente la lleva hasta el final, preguntándote antes de cada envío.',
          title: 'Encárgate de esto',
        },
        reading: {
          description:
            'Los boletines del día en una lista tranquila, cada uno resumido en unas pocas frases.',
          title: 'Lectura',
        },
        voice: {
          description:
            'Escucha el resumen en Telegram, WhatsApp o la app, y contesta al bot con un mensaje de voz.',
          title: 'Escucha el resumen',
        },
        wrapped: {
          description:
            'Tu mes o tu año en el correo: lo que llegó, lo que se gestionó y cuánto tiempo recuperaste. Para compartir, nunca con un nombre.',
          title: 'Tu año en el correo',
        },
      },
      label: 'Y todo lo demás',
      title: 'Todo lo demás que haría un asistente.',
    },
    footer: {
      legal: 'Legal',
      product: 'Producto',
      tagline:
        'El agente de correo que lee tu Gmail y solo te enseña lo que te necesita.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'dejas de tener.',
      label: 'Lo que desaparece',
      rows: [
        {
          fix: 'Limpiar la bandeja saca todo lo acumulado de una vez: anuncios viejos, notificaciones leídas, listas que nunca abres. Un solo clic devuelve cada correo.',
          problem: 'Miles de correos que nadie va a leer nunca.',
        },
        {
          fix: 'Las respuestas se redactan por adelantado, con tu voz y en su idioma. Las parecidas se aprueban juntas con ⇧⏎, y cada una sigue siendo tuya para revisarla.',
          problem: 'Contestar correos a medianoche.',
        },
        {
          fix: 'Una tecla te da de baja como lo haría una persona: un clic, la página de baja o un correo. Quien sigue escribiendo va directo a spam.',
          problem: 'Boletines a los que nunca te suscribiste.',
        },
        {
          fix: 'Lectura reúne los boletines del día en una lista, cada uno resumido en unas pocas frases.',
          problem: 'Boletines que pensabas leer.',
        },
        {
          fix: 'Los datos de pago cambiados, los dominios que imitan a otros y el phishing conocido muestran un aviso antes de que actúes.',
          problem: 'Una factura con datos bancarios nuevos.',
        },
        {
          fix: 'Lo que prometes en el correo enviado vuelve a ti cuando toca, y las conversaciones que nadie contestó reciben un seguimiento.',
          problem: 'Lo que prometiste y se te olvidó.',
        },
        {
          fix: 'Solo el correo urgente te llega a Telegram o WhatsApp. El resto espera al resumen de la mañana, que también puedes escuchar.',
          problem: 'Mirar el correo en plena cena, por si acaso.',
        },
      ],
      title: 'Problemas de correo que dejas de tener.',
    },
    hero: {
      brief: {
        emphasis: 'te necesitan.',
        lead: (handled: string) =>
          `Anna espera el contrato, la factura de Northwind vence la semana que viene y Marco quiere el jueves. Se gestionaron ${handled} boletines y notificaciones.`,
        tag: 'Resumen del jueves · 08:00',
        title: 'Tres cosas te necesitan.',
      },
      fates: {
        archived: 'Archivado',
        markedRead: 'Marcado como leído',
        spam: 'Spam',
        summarised: 'Resumido',
        unsubscribed: 'Dado de baja',
      },
      handled: ((slots) => [
        slots.count,
        ' gestionados, cada uno con su motivo',
      ]) as Rich<'count'>,
      inbox: 'Bandeja de entrada',
      lead: 'Boletines, recibos, avisos, un enlace de phishing y, en algún lugar entre todo eso, los tres correos que de verdad importan. Fewmail es el agente que lo lee todo por ti.',
      needYou: ((slots) => [slots.count, ' te necesitan']) as Rich<'count'>,
      queue: [
        {
          reason: 'El contrato vence mañana',
          summary:
            'Necesita el contrato firmado antes del arranque del viernes.',
        },
        {
          reason: 'Factura · $1,240, vence el 20 de nov.',
          summary:
            'Factura de octubre por el rediseño de la web. Los mismos datos bancarios que la última vez.',
        },
        {
          reason: 'Propuesta de reunión',
          summary:
            'Propone el jueves a las 15:00. Estás libre desde las 16:00, así que el borrador propone las cuatro.',
        },
      ],
      reading: {
        emphasis: 'todos.',
        lead: 'Archiva el ruido, te da de baja de lo que nunca abres y deja la estafa en la puerta. Cada cosa que hace queda anotada con su motivo, para que puedas revisarla.',
        title: 'Fewmail los lee todos.',
      },
      remind: 'Recuérdamelo el 19 de nov.',
      remindPlan: 'La añade a tus facturas y te lo recuerda el 19 de nov.',
      start: 'Empieza gratis con Google',
      title: 'El correo no es tu trabajo.',
      today: 'Hoy',
      tryQueue: 'Prueba la cola',
      unread: ((slots) => [slots.count, ' sin leer']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' sin leer en tu bandeja',
      ]) as Rich<'count'>,
      willDo: 'Lo que hará Fewmail',
    },
    nav: {
      compare: 'Comparar',
      features: 'Funciones',
      mcp: 'Servidor MCP',
      pricing: 'Precios',
      signIn: 'Iniciar sesión',
    },
    play: {
      again: 'Vaciarla otra vez',
      doneLead: (handled: string) =>
        `Tomaste tres decisiones. Fewmail se encargó de los otros ${handled} y anotó por qué.`,
      doneTitle: 'Eso es todo por hoy.',
      emphasis: 'en dos minutos.',
      handled: [
        'Lumen Weekly: no abriste ninguno de los últimos 30 números',
        'paypa1-billing.com se hace pasar por paypal.com',
        'Parcelhub: avisos de entrega, por la regla «Recibos y envíos»',
      ],
      handledTitle: 'Gestionado mientras dormías',
      label: 'Pruébalo',
      lead: 'Así es ahora una mañana. Los borradores están escritos, cada cosa tiene su motivo y tú decides. Adelante, vacíala.',
      left: (count: number) => `${count} por decidir`,
      title: 'Toda tu bandeja, en dos minutos.',
    },
    plans: {
      everythingIn: (plan: string) => `Todo lo de ${plan}, y además`,
      forever: 'para siempre',
      free: {
        description:
          'La clasificación, las reglas y la protección. Para siempre.',
        features: [
          'Cada correo clasificado y puntuado por importancia',
          'Reglas en palabras sencillas que archivan, marcan como leído o dan de baja',
          'Escudo antispam comunitario y avisos de phishing',
          'Remitentes zombi detectados después de darte de baja',
          'Seguimientos automáticos del correo que espera respuesta',
          'Posponer, fragmentos y etiquetas Fewmail en Gmail',
        ],
      },
      max: {
        description: 'El mismo agente para una bandeja con mucho movimiento.',
        emails: (emails: string) => `${emails} correos leídos al mes`,
        messages: (messages: number) => `${messages} mensajes al agente al mes`,
        unlimited: 'Tableros y conversaciones delegadas sin límite',
      },
      monthly: 'Mensual',
      per: { month: 'al mes', year: 'al año' },
      pro: {
        description: 'El agente completo: lee, escribe y recuerda.',
        features: [
          'Hoy: un resumen diario y una sola cola de decisiones',
          'Respuestas redactadas con tu voz, enviadas solo cuando las apruebas',
          'Telegram: el resumen, las aprobaciones y las instrucciones por voz',
          '«Encárgate de esto»: el agente lleva una conversación hasta su objetivo',
          'Promesas y personas recordadas, tableros con gráficos para el dinero o lo que quieras seguir',
          'Pregunta lo que quieras a tu correo, y MCP para tus propias herramientas',
        ],
        limits: (emails: string, messages: number) =>
          `${emails} correos leídos y ${messages} mensajes al agente al mes; el ruido nunca cuenta`,
      },
      tryFree: (days: number) => `Pruébalo gratis ${days} días`,
      yearly: 'Anual · 2 meses gratis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `La clasificación, las reglas en palabras sencillas y la protección son gratis para siempre. Pro es el agente que lee, escribe y recuerda por ti; Max es el mismo agente con espacio para una bandeja con mucho movimiento. Cada cuenta empieza con ${trialDays} días de Pro, y cuando terminan simplemente sigues en Gratis.`,
      otherTool: '¿Estás pensando en otra herramienta?',
      title: 'Paga por el agente, no por la bandeja.',
    },
    startFree: 'Empieza gratis',
    trialNote: (days: number) =>
      `${days} días de Pro, sin tarjeta. Después, gratis todo el tiempo que quieras.`,
    trust: {
      emphasis: 'Pregunta',
      label: 'Tu correo, tu decisión',
      places: 'Funciona sobre el Gmail que ya usas y te encuentra en',
      title: 'Pregunta antes de actuar.',
      vows: [
        {
          description:
            'Los borradores te esperan. Solo las reglas que creaste o mantuviste pueden archivar, marcar como leído o darte de baja por su cuenta, y todo lo que hicieron aparece en Gestionados.',
          title: 'Nada se envía sin tu sí.',
        },
        {
          description:
            'Asuntos, cuerpos, resúmenes y borradores se guardan cifrados en nuestra base de datos. Los borradores guardados se quedan en Gmail, nunca con nosotros.',
          title: 'Cifrado en reposo.',
        },
        {
          description:
            'El escudo antispam aprende de todos mediante hashes con clave. No se comparte ni una dirección ni una palabra de tu correo.',
          title: 'Nunca se usa para entrenar modelos.',
        },
      ],
    },
  },
  skills: {
    bills: 'Facturas y pagos pendientes',
    cancel: 'Cancelar una suscripción de pago',
    cleanup: 'Boletines para limpiar',
    followups: 'Quién te debe una respuesta',
    reading: 'Los boletines del día en un resumen',
    today: 'Lo que te necesita hoy',
    waiting: 'Quién espera tu respuesta',
    week: 'Tu semana en el correo',
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
  calendar: {
    allDay: 'Todo el día',
    calendar: 'Calendario',
    create: 'Añadir evento',
    delete: 'Eliminar',
    deleted: 'Evento eliminado',
    description: 'Descripción',
    editEvent: 'Editar evento',
    endBeforeStart: 'El evento termina antes de empezar',
    ends: 'Termina',
    location: 'Ubicación',
    newEvent: 'Nuevo evento',
    next: 'Siguiente',
    openInGoogle: 'Abrir en Google Calendar',
    previous: 'Anterior',
    save: 'Guardar',
    saved: 'Evento guardado',
    starts: 'Empieza',
    title: 'Calendario',
    titlePlaceholder: 'Añade un título',
    today: 'Hoy',
    untitled: '(Sin título)',
    views: {
      day: 'Día',
      week: 'Semana',
      month: 'Mes',
      year: 'Año',
    },
  },
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
    goTo: 'Ir a',
    mail: 'Correo',
    nothingMatches: 'Sin resultados.',
    placeholder: 'Pregunta por tu correo o ejecuta un comando…',
    commandsOnly: 'Ejecuta un comando…',
    rewriteBrief: 'Reescribir el resumen',
    upgrade: 'Pasar a Pro',
    teachRule: 'Enseñar una regla nueva',
    theme: {
      dark: 'Usar tema oscuro',
      light: 'Usar tema claro',
      system: 'Igual que el sistema',
    },
  },
  importance: ['Ruido', 'Bueno saberlo', 'Te necesita pronto', 'Urgente'],
  justNow: 'justo ahora',
  errors: {
    failed: 'Algo salió mal. Inténtalo de nuevo.',
    needsPro: 'Esto requiere Fewmail Pro.',
    alreadySent: 'Ya se envió; es tarde para deshacerlo.',
    notFound: 'Esto ya no existe; puede que se haya eliminado.',
    offline: 'No se puede conectar con Fewmail. Revisa tu conexión.',
  },
  update: {
    available: 'Hay una nueva versión de Fewmail.',
    reload: 'Recargar',
  },
  keys: {
    restore: 'a la bandeja de entrada',
    calendarToday: 'hoy',
    newEvent: 'nuevo evento',
    period: 'anterior / siguiente',
    view: 'vista',
    group: 'agrupar',
    skills: 'habilidades',
    unsubscribe: 'darse de baja',
    filter: 'filtro',
    reply: 'responder',
    snooze: 'posponer',
    trash: 'papelera',
    ask: 'preguntar sobre él',
    archive: 'archivar',
    approve: 'aprobar',
    approveAll: (n: number) => `aprobar las ${n} de este tipo`,
    close: 'cerrar',
    draftReply: 'borrador',
    edit: 'editar',
    move: 'mover',
    open: 'abrir',
    notOnBoard: 'no es de este tablero',
    rename: 'renombrar',
    clearFilter: 'quitar filtro',
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
  limits: {
    boards: (total: number) =>
      `Tu plan incluye ${total} tableros. Borra uno o cámbiate a Max en Ajustes → Plan.`,
    messages: (date: string) =>
      `Se acabaron los mensajes al agente de este mes. Vuelven el ${date}.`,
    tasks: (total: number) =>
      `Tu plan gestiona ${total} hilos a la vez. Deja que termine uno o cámbiate a Max en Ajustes → Plan.`,
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
      'Fewmail pide permiso para leer, organizar y enviar Gmail por ti. No se envía ni se archiva nada sin tu permiso, salvo que escribas una regla que lo permita. También pide acceso a tu Google Calendar, que puedes desmarcar.',
    continue: 'Continuar con Google',
    lead: 'Fewmail lee tu bandeja por ti, responde con tu voz y solo te muestra lo que de verdad te necesita.',
    messengers:
      'También en mensajería, empezando por Telegram: recibe el resumen, aprueba respuestas o simplemente envía un mensaje de voz.',
    title: 'Solo lo que importa.',
  },
  mail: {
    openUnsubscribePage: 'Abrir página',
    unsubscribeYourself:
      'Para dejar esta lista tienes que terminar en su página. Mientras tanto, su correo queda archivado.',
    allMailboxes: 'Todos los buzones',
    group: {
      category: 'Categoría',
      importance: 'Importancia',
      none: 'Sin grupos',
      sender: 'Remitente',
      title: 'Agrupar',
    },
    unread: 'No leído',
    block: 'Bloquear remitente',
    blocked: 'Bloqueado. Sus correos ahora van a la papelera.',
    forward: 'Reenviar',
    more: 'Más',
    close: 'Cerrar',
    reply: 'Responder',
    trash: 'Mover a la papelera',
    trashed: 'Movido a la papelera',
    movedToInbox: 'Devuelto a la bandeja de entrada. Gracias por avisar.',
    moveToInbox: 'A la bandeja de entrada',
    backInInbox: 'Movido a la bandeja de entrada',
    noThread: 'Elige un correo para leerlo aquí',
    deleteDraft: 'Eliminar borrador',
    notSent: 'No enviado: ábrelo para reintentar',
    noRecipients: 'Sin destinatarios',
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
    dueHint: 'Plazo que el agente encontró en este correo',
    empty: 'No hay correos aquí',
    emptyHint: 'Los correos nuevos aparecerán aquí en cuanto lleguen.',
    expectsReply: 'Espera respuesta',
    filter: {
      archive: 'Archivo',
      trash: 'Papelera',
      drafts: 'Borradores',
      spam: 'Spam',
      inbox: 'Recibidos',
      snoozed: 'Pospuestos',
      important: 'Importantes',
      needs_reply: 'Por responder',
      quiet: 'Tranquilos',
    },
    instruction: 'Dile al agente cómo responder, o pulsa Enter',
    open: 'Abrir',
    search: 'Busca o describe: facturas de Anna del mes pasado',
    openInGmail: 'Abrir en Gmail',
    unsubscribe: 'Darse de baja',
    unsubscribed: 'Baja hecha',
    unsubscribeFailed:
      'Este remitente no permite darse de baja con un clic, así que el correo se archivó.',
    you: 'Tú',
  },
  subscriptions: {
    archivedOnly:
      'Este remitente no permite darse de baja con un clic, así que se archivó su correo. Si sigue llegando, irá a spam.',
    count: (total: number) => `Listas de correo: ${total}`,
    empty: 'Ninguna lista de correo te escribió este mes.',
    lead: 'Listas de correo que te escribieron este mes, las más activas primero. Darte de baja archiva todo lo que enviaron; lo que siga llegando dos semanas después va a spam.',
    opened: (total: number) =>
      total === 0 ? 'ninguno abierto' : `${total} abiertos`,
    title: 'Suscripciones',
    unsubscribe: 'Darse de baja',
    unsubscribed: 'Baja hecha',
  },
  nav: {
    calendar: 'Calendario',
    subscriptions: 'Suscripciones',
    agent: 'Agente',
    boards: 'Tableros',
    newBoard: 'Nuevo tablero',
    mail: 'Correo',
    reading: 'Lectura',
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
    usage: (percent: number) => `Agente · ${percent} % del mes usado`,
    watching: 'El agente vigila tu bandeja',
  },
  schedule: {
    awaitsAnswer:
      'Me salté esta ejecución: la anterior aún espera tu respuesta en este chat.',
    failed:
      'Esta ejecución programada falló. Lo intentaré de nuevo en la siguiente.',
    limitReached: (day: string) =>
      `Los mensajes de este mes se han agotado, así que la programación omite ejecuciones hasta el ${day}.`,
    open: 'Abrir en Fewmail',
    stopped:
      'Esta programación falló tres veces seguidas, así que la detuve. Pídeme que la configure de nuevo cuando la quieras.',
  },
  notifications: {
    many: (total: number) =>
      plural('es', total, {
        other: (n) => `${n} novedades de Fewmail`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Páginas que el agente llena con tu correo, empezando por el último medio año. Elige hasta ${max}; luego puedes añadir las tuyas.`,
    boardsTitle: '¿Qué debe reunir el agente para ti?',
    languageHint:
      'La app, los resúmenes y las explicaciones usan este idioma. Las respuestas siempre siguen el idioma del correo que contestas.',
    languageTitle: '¿En qué idioma debe hablar Fewmail?',
    lead: 'Dos respuestas rápidas. Puedes cambiarlo todo más tarde en Ajustes.',
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
    priceYearly: (usd: number) => `$${usd} / año`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `${emails} correos y ${messages} mensajes al mes; tableros e hilos delegados sin límite.`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `${emails} correos y ${messages} mensajes al mes.`,
    cancels: (plan: string, date: string) =>
      `${plan} hasta el ${date}, después Gratis.`,
    choose: (plan: string) => `Elegir ${plan}`,
    proRenews: (date: string) => `Se renueva el ${date}.`,
    resets: (date: string) => `Se reinicia el ${date}.`,
    title: 'Plan',
    trial: 'Prueba de Pro',
    welcome: (plan: string) =>
      `Te damos la bienvenida a ${plan}. El agente vuelve a estar en marcha.`,
    yearly: 'Pagar anualmente',
    yearlyHint: 'Dos meses gratis.',
    emailsUsed: (used: string, total: string) => `${used} de ${total} correos`,
    messagesUsed: (used: string, total: string) =>
      `${used} de ${total} mensajes`,
    trialDescription: (date: string) =>
      `Todo Pro hasta el ${date}, luego gratis. Sin tarjeta.`,
    upgrade: 'Otros planes',
    usage: 'Este mes',
  },
  queue: {
    askedByYou: 'Lo pediste tú',
    draftedInVoice: 'Redactado con tu voz',
    edit: 'Editar',
    open: 'Abrir',
    send: 'Enviar',
    shorter: 'Más corto',
    shorterInstruction: 'Hazlo más corto.',
    skip: 'Omitir',
  },
  rules: {
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
  },
  settings: {
    readingDigest: {
      description:
        'Después del resumen, los boletines del día llegan a Telegram y WhatsApp en un solo mensaje.',
      title: 'Resumen de boletines',
    },
    voiceBrief: {
      description:
        'El resumen también llega a Telegram y WhatsApp como nota de voz.',
      title: 'Resumen en audio',
    },
    forward: {
      copy: 'Copiar dirección',
      description:
        'Envía o reenvía cualquier correo a esta dirección desde tu propio buzón, con una nota arriba diciendo qué hacer. La respuesta llega por Telegram o WhatsApp y a un chat aquí.',
      title: 'Reenviar al agente',
    },
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
    schedules: {
      delete: 'Eliminar',
      description:
        'Pide al agente en el chat que haga algo con regularidad, como «cada viernes a las 17:00 reúne las facturas de la semana». Cada ejecución llega a su propio chat, donde apruebas lo que quiera enviar.',
      title: 'Programaciones',
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
    mailboxes: {
      add: 'Añadir Gmail',
      addDescription:
        'El correo de otra cuenta de Gmail llega al mismo Hoy y a la misma bandeja. Nunca sirve para entrar aquí: iniciar sesión con ella abre un Fewmail aparte.',
      added: 'Buzón añadido. Su correo aparecerá en un minuto.',
      failed:
        'No se pudo añadir el buzón. Permite el acceso a Gmail e inténtalo de nuevo.',
      lost: 'Se perdió el acceso a Gmail. Añádelo de nuevo para reconectarlo.',
      reading: 'Leyendo el correo…',
      remove: 'Quitar',
      signIn: 'Inicias sesión con esta',
      signInChosen: 'Es la cuenta con la que inicias sesión. Elige otra.',
      synced: (ago: string) => `Sincronizado ${ago}`,
      title: 'Buzones',
    },
    mcp: {
      allow: 'Permitir',
      connected: (ago: string) => `Conectado ${ago}`,
      copy: 'Copiar URL',
      defaultName: 'Cliente MCP',
      deny: 'Rechazar',
      description:
        'Pueden leer tu resumen y tu correo, redactar respuestas y enviarlas cuando confirmes.',
      disconnect: 'Desconectar',
      paste:
        'Añade esta URL como conector en tu app e inicia sesión en Fewmail.',
      request: (app: string) => `${app} quiere usar tu Fewmail`,
      title: 'Conecta Claude, Cursor o cualquier cliente MCP',
    },
    signedInWithGoogle: 'Sesión iniciada con Google',
    signOut: 'Cerrar sesión',
    notifications: {
      blocked:
        'Las notificaciones están bloqueadas. Permítelas en la configuración del sitio del navegador.',
      browser: 'Este navegador',
      notConfigured:
        'Las notificaciones del navegador no están configuradas en este servidor.',
      off: 'Recibe aquí el correo urgente y el resumen diario, incluso con Fewmail cerrado.',
      on: 'El correo urgente y el resumen diario aparecen aquí. Varios a la vez llegan como uno.',
      title: 'Notificaciones',
      unsupported: 'Este navegador no puede mostrar notificaciones.',
    },
    telegram: {
      connect: 'Conectar Telegram',
      disconnect: 'Desconectar',
      linked:
        'Tu resumen llega cada mañana y el correo urgente, al momento. Aprueba y edita borradores desde el chat.',
      notConfigured: 'El bot de Telegram no está configurado en este servidor.',
      unlinked: 'Recibe el resumen y aprueba borradores desde Telegram.',
    },
    whatsapp: {
      connect: 'Conectar WhatsApp',
      disconnect: 'Desconectar',
      linked:
        'Tu resumen llega cada mañana y el correo urgente, al momento. Aprueba y edita borradores desde el chat.',
      notConfigured: 'El bot de WhatsApp no está configurado en este servidor.',
      unlinked: 'Recibe el resumen y aprueba borradores desde WhatsApp.',
    },
    title: 'Ajustes',
  },
  spam: {
    reasonList: 'En una lista pública de dominios de spam',
    reasonPattern: {
      auth: 'Falló la autenticación del remitente: la dirección es falsa',
      infra:
        'Enviado desde una red que varios usuarios de Fewmail marcaron como spam',
      link: 'Enlaces a sitios que varios usuarios de Fewmail marcaron como spam',
      signals: 'Dominio nuevo, dirección rara y autenticación débil a la vez',
      template:
        'El mismo texto que varios usuarios de Fewmail marcaron como spam',
    },
    reasonCommunity: 'Varios usuarios de Fewmail lo marcaron como spam',
    reasonYou: 'Marcaste a este remitente como spam',
    suspect: 'Parece spam',
  },
  starterRules: {
    alwaysShow:
      'Alertas de seguridad, facturas por pagar, cualquier cosa de mi banco o de la administración pública',
    newsletters: 'Newsletters y boletines',
    notifications: 'Notificaciones automáticas de herramientas y servicios',
    promotions: 'Promociones, marketing y correos de venta en frío',
    receipts: 'Recibos, confirmaciones de pedido y de envío',
  },
  telegram: {
    approveAlike: 'Aprobar a la vez todas las tarjetas de un tipo:',
    listen: '🔊 Escuchar',
    heard: (text: string) => `He oído: «${text}»`,
    voiceFailed: 'No lo he entendido. Inténtalo de nuevo o escríbelo.',
    help: 'Escribe o di lo que necesitas:\n• pregunta por tu correo: «¿cuándo se renueva Netflix?»\n• di qué responder: «dile a Ana que firmo mañana»\n• responde a uno de mis borradores para cambiarlo',
    canceled: 'Cancelado. El borrador vuelve a tu cola.',
    sendingIn: (seconds: number) => `Enviando en ${seconds} s`,
    undo: 'Deshacer',
    commands: { brief: 'Resumen de hoy', queue: 'Lo que te necesita' },
    connectFirst:
      'Primero abre Fewmail → Ajustes → Integraciones y toca «Conectar Telegram».',
    connected:
      'Conectado. Te enviaré el resumen cada mañana y te avisaré cuando llegue algo urgente.\n\n/brief: resumen de hoy\n/queue: lo que te necesita',
    done: 'Hecho',
    draft: 'Borrador:',
    edit: 'Editar',
    editPrompt:
      'Envíame el texto que quieres usar, o dime cómo cambiarlo empezando por «/», p. ej. «/más formal».',
    newDraft: 'Nuevo borrador:',
    nothing: 'Ahora mismo nada te necesita.',
    proOnly:
      'Telegram forma parte de Fewmail Pro. Abre Ajustes → Plan en Fewmail para pasarte.',
    draftClipped:
      'Recortado aquí. «Enviar» envía el borrador completo: léelo en Fewmail.',
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
    awaiting: 'Esperando respuesta',
    hint: {
      notNow: 'Ahora no',
      setUp: 'Configurar',
      turnOn: 'Activar',
    },
    later: (total: number, time: string) =>
      plural('es', total, {
        one: () => `Llega una más a las ${time}`,
        many: (n) => `Llegan ${n} más a las ${time}`,
        other: (n) => `Llegan ${n} más a las ${time}`,
      }),
    briefAt: (time: string) => `resumen diario a las ${time}`,
    dates: 'Fechas y reuniones',
    done: 'Hecho',
    firstRead:
      'Leyendo tu correo de los últimos tres días. Lo que te necesite aparecerá aquí solo.',
    approvedMany: (n: number) => `${n} aprobadas`,
    listen: 'Escuchar el resumen',
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
    period: (days: number) =>
      days === 1 ? 'en el último día' : `en los últimos ${days} días`,
    pulse: {
      lists: (n: number) => `${n} de listas de correo`,
      people: (n: number) => `${n} de personas`,
      total: (total: number, period: string) =>
        plural('es', total, {
          one: (n) => `${n} correo ${period}`,
          other: (n) => `${n} correos ${period}`,
        }),
    },
    saved: (minutes: number) =>
      `Fewmail te ahorró cerca de ${formatMinutes('es', minutes)} esta semana`,
    savedHow: (handled: number, replies: number) =>
      `Gestionados por su cuenta: ${handled} · Respuestas enviadas desde borradores: ${replies}`,
    recent: (period: string) => `También ${period}`,
    sent: 'Enviado',
    worthAttention: 'Merece tu atención',
    writing: 'Escribiendo…',
  },
  boards: {
    addTo: 'Añadir a un tablero',
    added: (board: string) => `Añadido a ${board}`,
    cancel: 'Cancelar',
    chart: {
      add: 'Añadir gráfico',
      ask: 'Describe el gráfico',
      askPlaceholder: 'Gasto por tienda, pedidos por estado…',
      currency: 'Moneda',
      edit: 'Ajustes del gráfico',
      empty: 'Aún no hay nada que dibujar',
      groupBy: 'Agrupado por',
      groupings: {
        group: 'Quién o qué',
        month: 'Mes',
        status: 'Estado',
        week: 'Semana',
      },
      measure: 'Muestra',
      measures: { count: 'Cantidad', sum: 'Importe total' },
      moveEarlier: 'Mover antes',
      moveLater: 'Mover después',
      other: 'Otros',
      remove: 'Quitar gráfico',
      skipped: (n: number) => `Sin contar: ${n} en otra moneda o sin importe`,
      title: 'Título del gráfico',
      type: 'Tipo de gráfico',
      types: {
        area: 'Área',
        bar: 'Barras',
        line: 'Línea',
        pie: 'Circular',
      },
      untitled: 'Nuevo gráfico',
      weekOf: (date: string) => `Semana del ${date}`,
    },
    charts: 'Gráficos',
    create: 'Crear tablero',
    delete: 'Eliminar tablero',
    deleteConfirm: (name: string) => `¿Eliminar «${name}»?`,
    deleteHint:
      'Sus entradas y gráficos se eliminan con él. Tu correo se queda donde está.',
    describe: 'Cambiar qué recopila',
    description: 'Qué recopila',
    descriptionPlaceholder:
      'Viajes: vuelos, hoteles y alquiler de coches, con lo que costaron',
    due: (when: string) => `Próximamente: ${when}`,
    empty:
      'Aún está vacío. Los correos que encajen aparecerán aquí en cuanto lleguen.',
    emptyQuery: 'Busca correos que coincidan con',
    entries: (total: number) =>
      plural('es', total, {
        one: () => 'Una entrada',
        other: (n) => `${n} entradas`,
      }),
    entry: {
      amount: 'Importe',
      currency: 'Moneda',
      date: 'Fecha',
      edit: 'Editar entrada',
      edited: 'Editada por ti',
      group: 'Quién o qué',
      next: 'Próxima fecha',
      nextOn: (date: string) => `próxima: ${date}`,
      remove: 'No es de este tablero',
      removed: 'Quitada del tablero. Aprende de ello.',
      status: 'Estado',
      title: 'Título',
    },
    expected: (when: string) => `Previsto ${when}`,
    filter: {
      clear: 'Quitar filtro',
      nothing: 'Ninguna entrada coincide.',
      search: 'Buscar entradas',
    },
    groups: {
      every: {
        month: 'cada mes',
        quarter: 'cada trimestre',
        week: 'cada semana',
        year: 'cada año',
      },
      expected: (date: string) => `previsto ${date}`,
      next: (date: string) => `próximo: ${date}`,
      perMonth: (amount: string) => `${amount} / mes`,
      rename: 'Renombrar grupo',
      renameHint: 'Ponle el nombre de otro grupo para unirlos.',
      showAll: (n: number) => `Ver los ${n}`,
      showFewer: 'Ver menos',
      title: 'Por quién o qué',
    },
    history: {
      capped: (n: number) =>
        `Leídos los ${n} correos coincidentes más recientes de los últimos seis meses.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Revisando el correo de los últimos seis meses…'
          : `Leyendo ${plural('es', found, { one: () => 'un correo', other: (n) => `${n} correos` })} de los últimos seis meses · ${plural('es', entries, { one: () => 'una entrada', other: (n) => `${n} entradas` })} por ahora`,
    },
    menu: 'Acciones del tablero',
    moveDown: 'Bajar',
    moveUp: 'Subir',
    name: 'Nombre',
    namePlaceholder: 'Viajes',
    new: 'Nuevo tablero',
    newHint:
      'Describe con tus palabras qué recopilar. Fewmail lo busca en el correo de los últimos seis meses, elige los gráficos y lo mantiene al día.',
    planning: 'Preparándolo…',
    redescribe: 'Guardar y volver a leer',
    redescribeHint:
      'Vuelve a leer los últimos seis meses con la nueva descripción. Las entradas que editaste o quitaste se mantienen.',
    rename: 'Renombrar tablero',
    save: 'Guardar',
    settings: {
      bannerDays: 'Aviso antes de una fecha',
      days: (n: number) =>
        plural('es', n, {
          one: () => '1 día antes',
          other: (count) => `${count} días antes`,
        }),
      hint: 'Cómo encuentra el tablero su correo y cuándo te avisa.',
      never: 'Nunca',
      query: 'Búsqueda de Gmail',
      queryHint: 'Al cambiarla se vuelven a leer los últimos seis meses.',
      title: 'Búsqueda y avisos',
    },
    starter: {
      events: {
        description:
          'Entradas, reservas y citas: dónde tengo que estar, cuándo y con quién.',
        name: 'Eventos',
      },
      health: {
        description:
          'Citas médicas, recetas, resultados y reembolsos del seguro: a quién vi, cuándo y cuánto costó.',
        name: 'Salud',
      },
      home: {
        description:
          'Alquiler, suministros, reparaciones y contratos de mi vivienda: qué vence, a quién y cuánto.',
        name: 'Hogar',
      },
      invoices: {
        description:
          'Facturas que emito y recibo por mi trabajo: cliente o proveedor, importe, vencimiento y si está pagada.',
        name: 'Facturas',
      },
      jobs: {
        description:
          'Candidaturas, entrevistas y ofertas: qué empresa, qué puesto y en qué punto está cada una.',
        name: 'Búsqueda de empleo',
      },
      learning: {
        description:
          'Cursos, clases y correo del colegio o la universidad: plazos, notas, certificados y lo que cuestan.',
        name: 'Formación',
      },
      money: {
        description:
          'Pagos, suscripciones, facturas y reembolsos: qué pago, a quién y cuánto.',
        name: 'Dinero',
      },
      orders: {
        description:
          'Pedidos en línea y entregas: qué compré, a quién y dónde está.',
        name: 'Pedidos',
      },
      subscriptions: {
        description:
          'Servicios que pago con regularidad: cuánto cuesta cada uno, cada cuánto y cuándo se renueva.',
        name: 'Suscripciones de pago',
      },
      trips: {
        description:
          'Vuelos, trenes, hoteles y alquileres: adónde voy, cuándo y cuánto cuesta.',
        name: 'Viajes',
      },
    },
    summary: {
      lastMonth: 'Mes pasado',
      perMonth: (amount: string) => `${amount} al mes`,
      recurring: (n: number) =>
        plural('es', n, {
          one: () => 'Uno recurrente',
          other: (count) => `${count} recurrentes`,
        }),
      thisMonth: 'Este mes',
      upcoming: 'Vence en 30 días',
    },
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
  clearOut: {
    groups: {
      lists: 'Boletines que nunca abres',
      notifications: 'Notificaciones leídas, de más de un mes',
      old: 'Todo lo de hace más de un año',
      promotions: 'Publicidad y redes sociales, de más de 3 días',
    },
    done: (emails: string) => `${emails} limpiados`,
    empty: 'Nada que limpiar: la bandeja ya está en orden.',
    lead: (emails: string) => `${emails} en la bandeja. Esto puede irse.`,
    leadCapped: (emails: string) =>
      `Más de ${emails} en la bandeja. Esto puede irse.`,
    left: (emails: string) => `Quedan ${emails} en la bandeja`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} y ${more} más` : names,
    run: (emails: string) => `Limpiar ${emails}`,
    safe: 'No se borra nada. El correo limpiado se archiva con la etiqueta Fewmail/Cleared y vuelve con un clic; además, te das de baja de los boletines.',
    scanning: 'Leo toda la bandeja, solo los encabezados. Hasta un minuto.',
    title: 'Limpiar la bandeja de entrada',
    undo: 'Devolverlo todo',
    undone: (emails: string) => `${emails} de vuelta en la bandeja`,
  },
  wrapped: {
    busiest: (day: string, hour: string) =>
      `Más ajetreo: ${day}, hacia las ${hour}`,
    copied: 'Enlace copiado',
    copyLink: 'Copiar enlace',
    cta: 'Consigue el tuyo con Fewmail',
    emails: 'correos recibidos',
    empty:
      'Aún no hay correo suficiente para contar la historia. Vuelve en unos días.',
    handled: 'gestionados por Fewmail por su cuenta',
    people: 'Quién escribió más',
    period: { month: 'Este mes', year: 'Este año' },
    replies: 'respuestas redactadas por Fewmail y enviadas',
    saveImage: 'Guardar imagen',
    saved: 'ahorrados por Fewmail',
    shareNote:
      'El enlace y la imagen muestran solo estas cifras, nunca nombres ni direcciones.',
    shared: { month: 'Un mes en el correo', year: 'Un año en el correo' },
    spam: 'correos de spam frenados',
    split: (people: string, lists: string) =>
      `${people} de personas · ${lists} de boletines`,
    title: { month: 'Tu mes en el correo', year: 'Tu año en el correo' },
    unsubscribed: 'boletines abandonados',
  },
  forward: {
    done: 'Tu correo reenviado',
  },
  reading: {
    digest: (n: number) => `Boletines de hoy: ${n}`,
    empty: 'No hubo boletines en el último día.',
    lead: 'Los boletines del último día en un solo lugar, para que no llenen la bandeja.',
    title: 'Lectura',
  },
  commitments: {
    title: 'Lo prometiste',
  },
  people: {
    firstContact: (date: string) => `Os escribís desde ${date}`,
    lastContact: (date: string) => `Último correo: ${date}`,
    open: 'Pendiente en otros hilos',
    promised: 'Lo prometiste',
    threads: (total: number) =>
      plural('es', total, {
        one: () => '1 conversación',
        many: (n) => `${n} conversaciones`,
        other: (n) => `${n} conversaciones`,
      }),
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} está en una lista pública de sitios de phishing activos. No abras enlaces, no inicies sesión ni pagues.`,
    lookalike_domain: (domain: string) =>
      `Parece ${domain}, pero es otra dirección. No hagas clic en enlaces ni pagues.`,
    new_sender_payment: (domain: string) =>
      `Primer correo de ${domain} y pide dinero. Compruébalo por un canal en el que ya confíes.`,
    spoofed_sender: (domain: string) =>
      `Dice venir de ${domain}, pero ${domain} no lo envió. No hagas clic en enlaces ni pagues.`,
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
  whatsapp: {
    connectFirst:
      'Primero abre Fewmail → Ajustes → Integraciones y toca «Conectar WhatsApp».',
    connected:
      'Conectado. Te enviaré el resumen cada mañana y te escribiré cuando llegue algo urgente. Envía texto o un mensaje de voz para responder cualquier correo.',
    proOnly:
      'WhatsApp forma parte de Fewmail Pro. Abre Ajustes → Plan en Fewmail para pasarte.',
  },
  zombie: {
    badge: (share: number) => `Ignora las bajas del ${share}% de la gente`,
    reason: 'Siguió escribiéndote después de darte de baja',
  },
}
