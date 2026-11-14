import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const es: Messages = {
  agent: {
    allChats: 'Todos los chats',
    chatsLead:
      'Cada conversación con el agente y lo que hace por ti de forma programada.',
    waiting: 'Esperan tu sí',
    waitingShort: 'espera tu sí',
    hide: 'Ocultar el agente',
    show: 'Mostrar el agente',
    voice: 'Hablar con el agente',
    voiceStop: 'Detener y enviar',
    chats: 'Chats',
    calendar: (email: string) => `En el calendario de ${email}`,
    cc: (recipients: string) => `CC ${recipients}`,
    confirm: {
      delete_board: '¿Eliminar este tablero y todo lo que contiene?',
      delete_schedule: '¿Detener esta programación?',
      create_schedule: '¿Ejecutar esto de forma programada?',
      create_event: '¿Añadir este evento?',
      delete_event: '¿Eliminar este evento?',
      update_event: '¿Cambiar este evento?',
      approve_action: '¿Hacer esta acción?',
      archive_thread: '¿Archivar esta conversación?',
      clear_out: '¿Limpiar estos grupos de correo de la bandeja?',
      undo_clear_out: '¿Devolver a la bandeja todo lo limpiado?',
      create_rule: '¿Añadir esta regla?',
      reply: '¿Enviar esta respuesta?',
      send_email: '¿Enviar este correo?',
      snooze_thread: '¿Posponer esta conversación?',
      unsubscribe: '¿Darte de baja de este remitente?',
      tidy_mail: '¿Ordenar estos correos tranquilos?',
      trash_thread: '¿Mover este hilo a la papelera?',
      report_spam: '¿Marcar este remitente como spam?',
      mark_not_spam: '¿Sacar este hilo del spam?',
      move_to_inbox: '¿Devolver este hilo a la bandeja de entrada?',
    },
    decline: 'No',
    declined: 'Dijiste que no',
    stepCount: (count: number) =>
      plural('es', count, {
        one: () => 'Un paso',
        many: (n) => `${n} pasos`,
        other: (n) => `${n} pasos`,
      }),
    detach: 'No adjuntar este correo',
    deleteChat: 'Eliminar chat',
    deleteChatConfirm: '¿Eliminar este chat?',
    deleteChatHint:
      'La conversación se borra para siempre. Tu correo se queda donde está.',
    failed: 'El agente no pudo terminar. Inténtalo de nuevo.',
    newChat: 'Nuevo chat',
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
      tidy_mail: 'Ordenando',
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
    to: (recipients: string) => `Para ${recipients}`,
    until: (time: string) => `Hasta ${time}`,
    yes: {
      delete_board: 'Eliminar',
      delete_schedule: 'Detener',
      create_schedule: 'Programar',
      create_event: 'Añadir',
      delete_event: 'Eliminar',
      update_event: 'Guardar',
      approve_action: 'Aprobar',
      archive_thread: 'Archivar',
      clear_out: 'Limpiar',
      undo_clear_out: 'Devolver',
      create_rule: 'Añadir',
      reply: 'Enviar',
      send_email: 'Enviar',
      snooze_thread: 'Posponer',
      unsubscribe: 'Darme de baja',
      tidy_mail: 'Ordenar',
      trash_thread: 'A la papelera',
      report_spam: 'Es spam',
      mark_not_spam: 'No es spam',
      move_to_inbox: 'Devolver',
    },
  },
  ask: {
    label: (question: string) => `Preguntar a Fewmail: «${question}»`,
    openChat: 'Abrir en el chat',
    thinking: 'Buscando en tu correo…',
  },
  compose: {
    discarded: 'Borrador descartado',
    backInQueue: 'Cancelado. El borrador vuelve a estar en Inicio.',
    canceled: 'Cancelado. Tu correo vuelve a estar en el editor.',
    cc: 'Cc',
    discard: 'Descartar',
    draftSaved: 'Borrador guardado',
    forward: 'Reenviar',
    forwardedMessage: 'Mensaje reenviado',
    from: 'De',
    instructionPlaceholder: '¿Cómo debería sonar? (opcional)',
    invalidRecipients: 'Añade al menos una dirección válida.',
    later: {
      inHour: 'En una hora',
      monday: 'El lunes por la mañana',
      pick: 'Elegir fecha y hora',
      schedule: 'Programar',
      time: 'Hora',
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
          'Ordenar el correo, las reglas y la protección son gratis para siempre. Lite, Pro y Max añaden todo lo que lee y escribe por ti; los planes mayores simplemente hacen más.',
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
        home: 'Lo que te necesita, en una sola página',
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
        home: 'En vivo, con aprobación en lote, con Pro',
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
          'SaneBox ordena el correo en carpetas y, en su plan más alto, también redacta y resume. Fewmail lo lee todo primero y reúne en una sola página las pocas decisiones que solo tú puedes tomar.',
        them: {
          home: 'Un boletín diario del correo filtrado',
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
          'Los borradores se escriben en el idioma del correo al que respondes. La app, los resúmenes y el bot de Telegram hablan el idioma que elijas, entre quince.',
        question: '¿Qué idiomas habla?',
      },
      {
        answer:
          'Por ahora, cuentas de Gmail y Google Workspace. Añade varios buzones a un mismo Fewmail y su correo llega al mismo Inicio y a la misma bandeja.',
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
            'Dinero, suscripciones de pago, viajes, pedidos: describe qué quieres seguir y el agente lo reúne de hasta un año de correo, con gráficos.',
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
        reading: {
          description:
            'Los boletines del día en una lista tranquila, cada uno resumido en unas pocas frases.',
          title: 'Lectura',
        },
        voice: {
          description:
            'Pulsa Escuchar en Inicio y oye lo que te necesita. Habla con el agente en la app, Telegram o WhatsApp y te contesta en voz alta.',
          title: 'Escucha lo que te necesita',
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
          fix: 'Solo el correo urgente te llega a Telegram o WhatsApp. El resto te espera en Inicio, ya ordenado, para cuando quieras mirarlo.',
          problem: 'Mirar el correo en plena cena, por si acaso.',
        },
      ],
      title: 'Problemas de correo que dejas de tener.',
    },
    hero: {
      needs: {
        emphasis: 'te necesitan.',
        lead: (handled: string) =>
          `Anna espera el contrato, la factura de Northwind vence la semana que viene y Marco quiere el jueves. Se gestionaron ${handled} boletines y notificaciones, e Inicio se actualiza solo en cuanto llega correo nuevo.`,
        tag: 'Inicio · jueves, 08:12',
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
      home: 'Inicio',
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
      about: (emails: string, messages: string) =>
        `Unos ${emails} correos leídos o ${messages} mensajes al agente al mes`,
      oneAllowance:
        'Un solo saldo para todo lo que hace el agente: pagas lo que usas y el ruido nunca cuenta',
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
      },
      monthly: 'Mensual',
      per: { month: 'al mes', year: 'al año' },
      lite: {
        description: 'El agente completo: lee, escribe y recuerda.',
        features: [
          'Inicio: una sola cola de decisiones en vivo, aprobadas de una en una o en lote',
          'Respuestas redactadas con tu voz, enviadas solo cuando las apruebas',
          'Telegram: el correo urgente, las aprobaciones y las instrucciones por voz',
          'Promesas y personas recordadas, tableros con gráficos para el dinero o lo que quieras seguir',
          'Pregunta lo que quieras a tu correo, y MCP para tus propias herramientas',
        ],
      },
      pro: {
        description: 'El mismo agente con espacio para más correo.',
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
    spam: 'Movido a spam',
    trash: 'Mover a la papelera',
    archive: 'Archivar',
    follow_up: 'Hacer seguimiento',
    mark_read: 'Marcar leído',
    pay: 'Pagar',
    read: 'Vale la pena leer',
    reply: 'Responder',
    schedule: 'Agendar',
    unsubscribe: 'Darse de baja',
  },
  actionStatus: {
    auto_done: 'hecho por el agente',
    dismissed: 'omitido',
    done: 'hecho',
    failed: 'falló',
    pending: 'esperando en Inicio',
  },
  byRule: 'por una regla',
  calendar: {
    tomorrow: 'Mañana',
    noAccess: {
      allow: 'Permitir acceso',
      description:
        'Google no tiene permiso para compartir tu calendario con Fewmail. Permítelo para ver y añadir eventos aquí.',
      title: 'El calendario no está conectado',
    },
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
    upgrade: 'Pasar a Pro',
    teachRule: 'Enseñar una regla nueva',
    theme: {
      dark: 'Oscuro',
      light: 'Claro',
      system: 'Sistema',
    },
  },
  importance: ['Ruido', 'Bueno saberlo', 'Te necesita pronto', 'Urgente'],
  justNow: 'justo ahora',
  errors: {
    calendarAccess:
      'Fewmail no tiene acceso a este calendario. Permítelo en la página Calendario.',
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
    summary: 'resumen',
    askAgent: 'preguntar al agente',
    fromSender: 'más del remitente',
    approvePicked: (n: number) => `aprobar ${n} seleccionados`,
    pick: 'seleccionar',
    pickAll: 'seleccionar todo',
    unpick: 'quitar selección',
    pin: 'fijar',
    unpin: 'desfijar',
    copyCode: 'copiar código',
    restore: 'a la bandeja de entrada',
    calendarToday: 'hoy',
    newEvent: 'nuevo evento',
    period: 'anterior / siguiente',
    view: 'vista',
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
    rewrite: 'reescribir',
  },
  legal: {
    privacy: 'Política de privacidad',
    englishOnly:
      'Este documento se ofrece en inglés, que es la versión vinculante.',
    terms: 'Términos del servicio',
    updated: (date: string) => `Última actualización: ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `Se acabó el uso del agente de este mes. Vuelve el ${date}.`,
  },
  notices: {
    freeUpSpace: 'Liberar espacio',
    mailLost:
      'Fewmail perdió el acceso a tu Gmail y no está leyendo el correo nuevo.',
    mailboxLost: (email: string) => `Fewmail perdió el acceso a ${email}.`,
    reconnect: 'Volver a conectar',
    sendLimit: (email: string, when: string) =>
      `${email} alcanzó el límite diario de envío de Gmail. Podrás enviar de nuevo ${when}.`,
    signInAgain: 'Volver a entrar',
    storageFull: (email: string) =>
      `${email} se quedó sin almacenamiento de Google, así que Gmail rechaza el correo nuevo.`,
    storageFullHint:
      'Libera espacio o consigue más almacenamiento para volver a recibir correo.',
  },
  login: {
    needsGmail:
      'Fewmail necesita acceso a tu Gmail. Vuelve a entrar y deja marcada la casilla de Gmail en la pantalla de Google.',
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
      'También en mensajería, empezando por Telegram: recibe el correo urgente, aprueba respuestas o simplemente envía un mensaje de voz.',
    title: 'Solo lo que importa.',
  },
  mail: {
    draftDeleted: 'Borrador eliminado',
    unsubscribeConfirm: (name: string) => `¿Darte de baja de ${name}?`,
    unsubscribeHint:
      'Fewmail te da de baja de la lista y archiva esta conversación. Darse de baja no se puede deshacer.',
    unsubscribing: 'Dándote de baja…',
    pin: 'Fijar',
    unpin: 'Desfijar',
    pinned: 'Fijados',
    showAll: (n: number) => `Ver los ${n}`,
    showFewer: 'Ver menos',
    oneTimeCode: {
      archive: 'Copiar y archivar',
      copied: 'Código copiado',
      copy: 'Copiar código',
      trash: 'Copiar y eliminar',
    },
    openUnsubscribePage: 'Abrir página',
    unsubscribeYourself:
      'Para dejar esta lista tienes que terminar en su página. Mientras tanto, su correo queda archivado.',
    allMailboxes: 'Todos los buzones',
    filterAbout: {
      focused: 'Lo importante y las personas primero, avisos plegados',
      unread: 'Lo que aún no has leído, por tipo',
      inbox: 'Todo, lo más reciente primero',
    },
    find: {
      back: 'Volver al correo',
      open: 'Buscar',
      recent: 'Búsquedas recientes',
      tips: 'Consejos',
      clearRecent: 'Borrar',
      describeExample: 'facturas de Anna del mes pasado',
      searching: 'Buscando en tu correo…',
      tip: {
        from: 'Correos de Anna',
        subject: 'El asunto menciona «invoice»',
        attachment: 'Con adjuntos',
        pdf: 'Con un PDF adjunto',
        unread: 'Conversaciones sin leer',
        week: 'De los últimos 7 días',
        describe: 'O descríbelo con tus palabras',
      },
    },
    group: {
      read: 'Leídos',
      earlier: 'Anteriores',
      important: 'Importantes',
      people: 'Personas',
      plans: 'Agenda y viajes',
      money: 'Dinero',
      updates: 'Notificaciones',
      newsletters: 'Boletines',
      promotions: 'Promociones',
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
    draftWaiting: 'El borrador te espera en Inicio',
    due: (date: string) => `vence el ${date}`,
    dueHint: 'Plazo que el agente encontró en este correo',
    empty: 'No hay correos aquí',
    emptyHint: 'Los correos nuevos aparecerán aquí en cuanto lleguen.',
    noResults: 'No se encontró nada',
    noResultsHint: 'Prueba con otras palabras o en otra carpeta.',
    expectsReply: 'Espera respuesta',
    filter: {
      archive: 'Archivo',
      trash: 'Papelera',
      drafts: 'Borradores',
      spam: 'Spam',
      inbox: 'Recibidos',
      snoozed: 'Pospuestos',
      focused: 'Enfoque',
      unread: 'No leídos',
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
    replyTo: 'Responder a',
    date: 'Fecha',
    authentication: 'Autenticación',
    toLine: (recipients: string) => `para ${recipients}`,
  },
  subscriptions: {
    unsubscribeHint: (emails: string) =>
      `Fewmail te da de baja de la lista y archiva todo lo que envió (${emails} este mes). Darse de baja no se puede deshacer.`,
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
    labels: 'Etiquetas',
    folders: 'Carpetas',
    calendar: 'Calendario',
    subscriptions: 'Suscripciones',
    boards: 'Tableros',
    newBoard: 'Nuevo tablero',
    mail: 'Correo',
    reading: 'Lectura',
    rules: 'Reglas',
    search: 'Busca o pregunta…',
    settings: 'Ajustes',
    syncFailed: 'Falló la sincronización con Gmail, reintentando',
    syncing: 'Leyendo tu bandeja…',
    syncFailedIn: (email: string) =>
      `Falló la sincronización de ${email}, reintentando`,
    syncingIn: (email: string) => `Leyendo ${email}…`,
    home: 'Inicio',
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
      `El uso del agente de este mes se ha agotado, así que la programación omite ejecuciones hasta el ${day}.`,
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
      `Páginas que el agente llena con tu correo, empezando por los últimos tres meses. Elige hasta ${max}; luego puedes añadir las tuyas.`,
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
    used: (percent: number) => `${percent} % usado`,
    about: (emails: string, messages: string) =>
      `Unos ${emails} correos leídos o ${messages} mensajes al agente al mes, en cualquier combinación.`,
    free: 'Gratis',
    freeDescription:
      'Correo rápido y tranquilo con reglas simples. Gratis todo el tiempo que quieras.',
    includes:
      'Cada plan de pago añade el agente: cada correo leído y resumido, respuestas redactadas con tu voz, reglas en palabras sencillas, Telegram y MCP.',
    manage: 'Gestionar facturación',
    price: (usd: number) => `$${usd} / mes`,
    priceYearly: (usd: number) => `$${usd} / año`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
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
    trialDescription: (date: string) =>
      `Todo Pro hasta el ${date}, luego gratis. Sin tarjeta.`,
    upgrade: 'Otros planes',
    usage: 'Este mes',
  },
  queue: {
    approve: 'Aprobar',
    delete: 'Eliminar',
    pick: 'Seleccionar',
    picked: (n: number) => `${n} seleccionados`,
    unpick: 'Quitar',
    askedByYou: 'Lo pediste tú',
    draftedInVoice: 'Redactado con tu voz',
    edit: 'Editar',
    open: 'Abrir',
    send: 'Enviar',
    rewrite: 'Reescribir',
    shorterInstruction: 'Hazlo más corto.',
    new: 'Nuevo',
    skipStale: 'Omitirlas',
    skipped: (n: number) => `Omitidas: ${n}`,
    stale: (n: number) => `De hace más de una semana: ${n}`,
    skip: 'Omitir',
  },
  rules: {
    deleted: 'Regla eliminada',
    add: 'Añadir regla',
    count: (total: number) =>
      plural('es', total, {
        one: () => '1 regla',
        other: (n) => `${n} reglas`,
      }),
    delete: 'Eliminar',
    describe: {
      alwaysShow: 'Siempre llega a Inicio',
      autonomous: 'Se hace solo y aparece en gestionados',
      draft: 'Un borrador te espera en Inicio',
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
    lead: 'Dile al agente con tus palabras qué hacer con cierto correo. Revisa cada correo con estas reglas.',
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
    disconnectConfirm: (name: string) => `¿Desconectar ${name}?`,
    messengerDisconnectHint:
      'El bot dejará de escribirte. Para volver a conectarlo hará falta un enlace nuevo de esta página.',
    readingDigest: {
      description:
        'Cada mañana, los boletines del último día llegan a Telegram y WhatsApp en un solo mensaje.',
      title: 'Resumen de boletines',
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
      deleted: 'Programación eliminada',
      delete: 'Eliminar',
      description:
        'Pide al agente en el chat que haga algo con regularidad, como «cada viernes a las 17:00 reúne las facturas de la semana». Cada ejecución llega a su propio chat, donde apruebas lo que quiera enviar.',
      title: 'Programaciones',
    },
    snippets: {
      deleted: 'Fragmento eliminado',
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
    morningDescription: (timezone: string) =>
      `Resumen de boletines e informe semanal del lunes, en tu zona horaria, ${timezone}`,
    morningTitle: 'Mensajes de la mañana',
    deleteAccount: 'Eliminar cuenta',
    deleteConfirm: 'Eliminar todo',
    deleteDescription:
      'Elimina de inmediato tu cuenta, el correo sincronizado, borradores y reglas de Fewmail. Tu Gmail no se toca.',
    deleteTitle: '¿Eliminar tu cuenta de Fewmail?',
    cancel: 'Cancelar',
    integrations: 'Integraciones',
    language: 'Idioma',
    languageDescription:
      'App, bot y resúmenes. Las respuestas siguen al correo.',
    legal: 'Legal',
    mailboxes: {
      removeConfirm: (email: string) => `¿Quitar ${email}?`,
      removeHint:
        'Fewmail deja de leer este buzón y olvida lo que leyó. En Gmail no cambia nada.',
      add: 'Añadir Gmail',
      addDescription:
        'El correo de otra cuenta de Gmail llega al mismo Inicio y a la misma bandeja. Nunca sirve para entrar aquí: iniciar sesión con ella abre un Fewmail aparte.',
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
      disconnectHint:
        'Dejará de poder leer tu correo hasta que lo vuelvas a conectar.',
      allow: 'Permitir',
      connected: (ago: string) => `Conectado ${ago}`,
      copy: 'Copiar URL',
      defaultName: 'Cliente MCP',
      deny: 'Rechazar',
      description:
        'Pueden leer tu correo, redactar respuestas y enviarlas cuando confirmes.',
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
      messengerOff: 'El correo urgente se queda en Fewmail.',
      messengerOn: 'El correo urgente llega al chat al momento.',
      notConfigured:
        'Las notificaciones del navegador no están configuradas en este servidor.',
      off: 'Recibe aquí el correo urgente, incluso con Fewmail cerrado.',
      on: 'El correo urgente aparece aquí. Varios a la vez llegan como uno.',
      title: 'Notificaciones',
      unsupported: 'Este navegador no puede mostrar notificaciones.',
    },
    telegram: {
      connect: 'Conectar Telegram',
      disconnect: 'Desconectar',
      linked:
        'El correo urgente llega al momento. Aprueba y edita borradores desde el chat.',
      linkedQuiet: 'Aprueba y edita borradores desde el chat.',
      notConfigured: 'El bot de Telegram no está configurado en este servidor.',
      unlinked: 'Recibe el correo urgente y aprueba borradores desde Telegram.',
    },
    whatsapp: {
      connect: 'Conectar WhatsApp',
      disconnect: 'Desconectar',
      linked:
        'El correo urgente llega al momento. Aprueba y edita borradores desde el chat.',
      linkedQuiet: 'Aprueba y edita borradores desde el chat.',
      notConfigured: 'El bot de WhatsApp no está configurado en este servidor.',
      unlinked: 'Recibe el correo urgente y aprueba borradores desde WhatsApp.',
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
    heard: (text: string) => `He oído: «${text}»`,
    voiceFailed: 'No lo he entendido. Inténtalo de nuevo o escríbelo.',
    help: 'Escribe o di lo que necesitas:\n• pregunta por tu correo: «¿cuándo se renueva Netflix?»\n• di qué responder: «dile a Ana que firmo mañana»\n• pídeme algo: «crea un tablero para viajes»\n• responde a uno de mis borradores para cambiarlo',
    canceled: 'Cancelado. El borrador vuelve a tu cola.',
    sendingIn: (seconds: number) => `Enviando en ${seconds} s`,
    undo: 'Deshacer',
    commands: { queue: 'Lo que te necesita' },
    connectFirst: (url: string) =>
      `¡Hola! Soy Fewmail. Aquí en Telegram te aviso cuando llega correo urgente, te muestro lo que te necesita y envío las respuestas que apruebes.\n\nEste chat aún no está conectado a tu Fewmail. Lleva un minuto:\n1. Abre los ajustes de Fewmail: ${url}\n2. En Integraciones, toca «Conectar Telegram» (es parte de Fewmail Pro).\n3. Telegram te traerá de vuelta aquí: pulsa Iniciar y listo.`,
    connected:
      'Conectado. Te avisaré cuando llegue algo urgente.\n\n/queue: lo que te necesita',
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
    working: 'En ello…',
    tidy: {
      confirm: (emails: string) => `¿Ordenar ${emails}?`,
      running: 'Ordenando…',
      unsubscribeHint:
        'Algunos son listas de las que Fewmail te dará de baja, y eso no se puede deshacer. Detalles (D) muestra antes cada correo.',
      archive: (n: number) => `${n} para archivar`,
      details: 'Detalles',
      done: (n: number) => `${n} ordenados`,
      keep: 'Conservar',
      mark_read: (n: number) => `${n} para marcar como leídos`,
      run: 'Ordenar',
      total: (n: number) => `Correos tranquilos para ordenar: ${n}`,
      unsubscribe: (n: number) => `${n} para darse de baja`,
    },
    stopListening: 'Detener',
    awaiting: 'Esperando respuesta',
    hint: {
      notNow: 'Ahora no',
      setUp: 'Configurar',
      turnOn: 'Activar',
    },
    dates: 'Fechas y reuniones',
    done: 'Hecho',
    firstRead:
      'Leyendo tu correo de los últimos tres días. Lo que te necesite aparecerá aquí solo.',
    approvedMany: (n: number) => `${n} aprobadas`,
    listen: 'Escuchar',
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
    codes: 'Códigos de acceso',
    worthAttention: 'Merece tu atención',
  },
  boards: {
    chartRemoved: 'Gráfico quitado',
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
    entries: (total: number) =>
      plural('es', total, {
        one: () => 'Una entrada',
        other: (n) => `${n} entradas`,
      }),
    entry: {
      edited: 'Editada por ti',
      nextOn: (date: string) => `próxima: ${date}`,
      remove: 'No es de este tablero',
      removed: 'Quitada del tablero. Aprende de ello.',
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
        `Leídos los ${n} correos coincidentes más recientes del periodo.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Revisando el correo del periodo…'
          : `Leyendo ${plural('es', found, { one: () => 'un correo', other: (n) => `${n} correos` })} · ${plural('es', entries, { one: () => 'una entrada', other: (n) => `${n} entradas` })} por ahora`,
    },
    menu: 'Acciones del tablero',
    moveDown: 'Bajar',
    moveUp: 'Subir',
    name: 'Nombre',
    namePlaceholder: 'Viajes',
    new: 'Nuevo tablero',
    newHint:
      'Describe con tus palabras qué recopilar. Fewmail lo busca en tu correo hasta donde elijas, elige los gráficos y lo mantiene al día.',
    period: 'Periodo',
    periods: {
      1: 'Último día',
      7: 'Última semana',
      30: 'Último mes',
      90: 'Últimos 3 meses',
      180: 'Últimos 6 meses',
      365: 'Último año',
    },
    planning: 'Preparándolo…',
    redescribe: 'Guardar y volver a leer',
    redescribeHint:
      'Vuelve a leer el periodo con la nueva descripción. Las entradas que editaste o quitaste se mantienen.',
    rename: 'Renombrar tablero',
    save: 'Guardar',
    settings: {
      bannerDays: 'Aviso antes de una fecha',
      days: (n: number) =>
        plural('es', n, {
          one: () => '1 día antes',
          other: (count) => `${count} días antes`,
        }),
      hint: 'Hasta dónde recopila el tablero y cuándo te avisa antes de una fecha.',
      never: 'Nunca',
      title: 'Ajustes del tablero',
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
  reading: {
    summary: 'Lo que dicen tus boletines',
    worth: 'Vale la pena leerlo entero',
    leftOut: (n: number) => `Fuera del resumen: ${n}, nada nuevo.`,
    since: (n: number) =>
      `Llegaron después del resumen: ${n}, irán en el siguiente.`,
    note: {
      inSummary: 'En el resumen',
      leftOut: 'Fuera del resumen',
      since: 'Después del resumen',
    },
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
  upgrade: {
    ask: 'Pregunta a tu correo',
    hints: {
      agent:
        'Parte de Fewmail Pro: pregunta por tu correo o di qué hacer, y el agente lo hace, esperando tu sí antes de cambiar nada en Gmail.',
      ask: 'Parte de Fewmail Pro: pregunta lo que quieras con tus palabras y obtén la respuesta de tu propio correo.',
      boards:
        'Parte de Fewmail Pro: describe qué recopilar y el agente lo encuentra en tu correo y lo mantiene al día.',
      drafts:
        'Parte de Fewmail Pro: el agente escribe la respuesta con tu estilo, y tú la editas y la envías.',
      home: 'Parte de Fewmail Pro: los correos que te necesitan, con las respuestas ya redactadas, al día a medida que llega el correo.',
    },
  },
  whatsapp: {
    connectFirst: (url: string) =>
      `¡Hola! Soy Fewmail. Aquí en WhatsApp te aviso cuando llega correo urgente, te muestro lo que te necesita y envío las respuestas que apruebes.\n\nEste número aún no está conectado a tu Fewmail. Lleva un minuto:\n1. Abre los ajustes de Fewmail: ${url}\n2. En Integraciones, toca «Conectar WhatsApp» (es parte de Fewmail Pro).\n3. WhatsApp se abre con un mensaje listo: envíalo y listo.`,
    connected:
      'Conectado. Te escribiré cuando llegue algo urgente. Envía texto o un mensaje de voz para responder cualquier correo.',
    proOnly:
      'WhatsApp forma parte de Fewmail Pro. Abre Ajustes → Plan en Fewmail para pasarte.',
  },
  zombie: {
    badge: (share: number) => `Ignora las bajas del ${share}% de la gente`,
    reason: 'Siguió escribiéndote después de darte de baja',
  },
}
