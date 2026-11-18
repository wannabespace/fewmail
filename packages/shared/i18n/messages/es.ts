import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const es: Messages = {
  agent: {
    decideOnHome: 'Decide en Inicio',
    fromAgent: 'Lo pide el agente',
    mcpAsks: (client: string) => `${client} pide a través de MCP`,
    calendar: (email: string) => `En el calendario de ${email}`,
    cc: (recipients: string) => `CC ${recipients}`,
    confirm: {
      dismiss_action: '¿Omitir esta tarjeta?',
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
    retry: 'Reintentar',
    steps: {
      create_event: 'Añadiendo un evento',
      delete_event: 'Eliminando el evento',
      list_events: 'Mirando el calendario',
      update_event: 'Cambiando el evento',
      list_subscriptions: 'Revisando listas de correo',
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
      find_people: 'Buscando la dirección',
      get_person: 'Buscando a la persona',
      get_today: 'Revisando hoy',
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
      list_promises: 'Revisando promesas',
      set_promise_status: 'Actualizando la promesa',
    },
    to: (recipients: string) => `Para ${recipients}`,
    until: (time: string) => `Hasta ${time}`,
    yes: {
      dismiss_action: 'Omitir',
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
  compose: {
    attach: 'Adjuntar archivos',
    attachmentsTooLarge: (limit: string) =>
      `Los adjuntos pueden sumar hasta ${limit}.`,
    dropFiles: 'Suelta los archivos para adjuntarlos',
    removeAttachment: 'Quitar',
    discarded: 'Borrador descartado',
    backInQueue: 'Cancelado. El borrador vuelve a estar en Inicio.',
    canceled: 'Cancelado. Tu correo vuelve a estar en el editor.',
    cc: 'Cc',
    discard: 'Descartar',
    draftSaved: 'Borrador guardado',
    forward: 'Reenviar',
    forwardedMessage: 'Mensaje reenviado',
    from: 'De',
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
    undoing: 'Deshaciendo…',
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
    meta: {
      assistant:
        'Fewmail es un asistente de correo con IA para Gmail que lee primero cada email, redacta respuestas con tu voz y te muestra solo lo que requiere tu atención. Empieza gratis.',
      assistantTitle: 'Asistente de correo con IA para Gmail',
      compare:
        'Cómo se compara Fewmail con Superhuman, Shortwave y SaneBox: un agente de IA que lee tu correo en lugar de una forma más rápida de leerlo tú.',
      compareTitle: 'Asistentes de correo con IA comparados',
      home: 'Fewmail es un asistente de correo con IA para Gmail: lee cada email, redacta respuestas con tu voz y te muestra solo lo que requiere tu atención.',
      login:
        'Fewmail lee tu Gmail por ti, responde con tu voz y solo te muestra lo que de verdad requiere tu atención.',
      mcp: 'Conecta Fewmail a Claude, ChatGPT, Claude Code o Cursor como servidor MCP: lee y ordena tu Gmail desde la IA que ya usas.',
      motto: 'solo lo que importa en tu bandeja',
      pricing: (trialDays: number) =>
        `Fewmail es gratis para siempre para Inicio, ordenar, reglas y protección contra spam. Pro, el agente completo, empieza con ${trialDays} días gratis y sin tarjeta.`,
      tagline: 'el agente de correo con IA para Gmail',
    },
    chapters: {
      pricing: {
        description:
          'Inicio, ordenar el correo, las reglas y la protección son gratis para siempre. Lite, Pro y Max añaden todo lo que lee y escribe por ti; los planes mayores simplemente hacen más.',
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
        'Todo lo que envía un correo o cambia Gmail te pide un sí antes. Un correo que intenta dar órdenes al asistente se marca antes de que lo lea. Tu correo nunca entrena modelos y puedes desconectar cualquier app en Ajustes.',
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
    assistantPage: {
      abilities: {
        ask: {
          description:
            'Pregunta «¿a qué hora sale mi vuelo?» y recibe la respuesta con los correos de los que viene, en Fewmail, Telegram o WhatsApp, o desde Claude y ChatGPT.',
          title: 'Respuestas desde tu correo',
        },
        drafts: {
          description:
            'Las respuestas se escriben por adelantado, con tu tono y en el idioma del remitente, y esperan en tu cola hasta que las apruebas.',
          title: 'Redacta respuestas con tu voz',
        },
        protection: {
          description:
            'Datos bancarios cambiados, dominios que imitan a otros y estafas conocidas activan un aviso antes de que actúes.',
          title: 'Avisa del phishing',
        },
        reading: {
          description:
            'Los boletines del día se convierten en un solo resumen por tema, con cada frase enlazada al correo del que sale.',
          title: 'Boletines en un solo resumen',
        },
        rules: {
          description:
            'Describe en una frase qué debe pasar con cierto correo y se convierte en una regla. Solo las reglas que activas actúan por su cuenta.',
          title: 'Reglas en palabras sencillas',
        },
        sorting: {
          description:
            'Cada correo recibe un resumen y una puntuación de importancia: lo urgente sube y los recibos, las notificaciones y las promociones dejan de estorbarte.',
          title: 'Lee y ordena cada correo',
        },
      },
      abilitiesDescription:
        'Todo ocurre en el Gmail que ya usas, y cada cosa que hace el agente queda anotada con su motivo.',
      abilitiesLabel: 'Lo que hace',
      abilitiesTitle: 'Un asistente, no otra bandeja de entrada.',
      compareTitle: 'Cómo se compara con otras herramientas de correo con IA.',
      faq: (trialDays: number) => [
        {
          answer:
            'Un software que usa IA para leer, ordenar y responder tu correo por ti. La mayoría añade resúmenes y ayuda para escribir a una bandeja que sigues leyendo tú. Fewmail va más allá: lo lee todo primero, así que solo ves lo que requiere tu atención.',
          question: '¿Qué es un asistente de correo con IA?',
        },
        {
          answer:
            'Fewmail cifra asuntos, cuerpos, resúmenes y borradores en su base de datos, nunca usa tu correo para entrenar modelos y nunca envía ni cambia nada en Gmail sin tu sí. Puedes desconectarlo y borrarlo todo cuando quieras.',
          question: '¿Es seguro dejar que la IA lea mi correo?',
        },
        {
          answer:
            'Te redacta las respuestas, pero nunca envía ninguna por su cuenta. Cada borrador espera tu aprobación en tu cola, y los parecidos se pueden aprobar juntos.',
          question: '¿Puede responder correos automáticamente?',
        },
        {
          answer: `Sí. El plan Gratis ordena cada correo, reúne lo que requiere tu atención en una sola página, aplica tus reglas y te protege del spam y el phishing, para siempre. Los borradores, los resúmenes y el resto del agente vienen con los planes de pago, y cada cuenta empieza con ${trialDays} días de Pro, sin tarjeta.`,
          question: '¿Hay un asistente de correo con IA gratis para Gmail?',
        },
      ],
      faqTitle: 'Sobre los asistentes de correo con IA.',
      lead: 'Fewmail lee cada correo de tu Gmail en cuanto llega, quita el ruido, redacta respuestas con tu voz y te trae solo las pocas cosas que necesitan tu decisión. Nada se envía ni se cambia sin tu sí.',
      title: 'El asistente de correo con IA que lee tu Gmail antes que tú.',
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
        home: 'Lo que requiere tu atención, en una sola página',
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
        home: 'En vivo, con aprobación en lote, gratis',
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
          'Superhuman te hace más rápido revisando cada correo. Fewmail los revisa por ti y solo te enseña lo que requiere tu atención.',
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
          'Muchas herramientas de correo con IA son una bandeja nueva con un chat: sigues leyendo cada email, ahora con un resumen encima. Fewmail es un agente de IA sobre el Gmail que ya usas. Lee primero cada email, redacta respuestas con tu voz y te trae solo las pocas decisiones que requieren tu atención.',
        question:
          '¿En qué se diferencia Fewmail de otros asistentes de correo con IA?',
      },
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
        codes: {
          description:
            'Un código reciente espera arriba en Inicio y junto a su correo, listo para copiar sin abrir nada. Gratis.',
          title: 'Códigos de acceso',
        },
        subscriptions: {
          description:
            'Cada lista que te escribió este mes, con cuántos de sus correos abriste de verdad. Date de baja de cualquiera con una tecla. Gratis.',
          title: 'Listas de correo',
        },
        ask: {
          description:
            'Pregunta lo que quieras con tus palabras y obtén la respuesta de tu propio correo, con los correos de donde sale.',
          title: 'Pregunta a tu correo',
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
            'Un resumen de los boletines del día: las noticias por tema, cada frase enlazada a su fuente, y los que vale la pena leer enteros.',
          title: 'Lectura',
        },
        voice: {
          description:
            'Haz que te lean el resumen de tus boletines. Envía un mensaje de voz por Telegram o WhatsApp y el agente te responde en voz alta.',
          title: 'Escucha en vez de leer',
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
        'El agente de correo con IA que lee tu Gmail y solo te enseña lo que requiere tu atención.',
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
          fix: 'Una tecla te da de baja como lo haría una persona: un clic, la página de baja o un correo. Quien sigue escribiendo queda detectado y se propone como spam.',
          problem: 'Boletines a los que nunca te suscribiste.',
        },
        {
          fix: 'Los boletines del día se convierten en un resumen por temas, con los que vale la pena leer enteros señalados.',
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
        emphasis: 'requieren tu atención.',
        lead: (handled: string) =>
          `Anna espera el contrato, la factura de Northwind vence la semana que viene y Marco quiere el jueves. Se gestionaron ${handled} boletines y notificaciones, e Inicio se actualiza solo en cuanto llega correo nuevo.`,
        tag: 'Inicio · jueves, 08:12',
        title: 'Tres cosas requieren tu atención.',
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
      lead: 'Boletines, recibos, avisos, un enlace de phishing y, en algún lugar entre todo eso, los tres correos que de verdad importan. Fewmail es el agente de IA que lo lee todo por ti.',
      needYou: ((slots) => [
        slots.count,
        ' requieren tu atención',
      ]) as Rich<'count'>,
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
      assistant: 'Asistente de correo con IA',
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
      agent: 'El agente',
      details: 'Ver todos los planes en detalle',
      emails: 'Correos que el agente lee al mes',
      everyPlan: 'En todos los planes',
      messages: 'o mensajes al agente',
      oneAllowance:
        'Un solo saldo para todo lo que hace el agente: pagas lo que usas y el ruido nunca cuenta',
      forever: 'para siempre',
      free: {
        description:
          'Inicio, clasificación, reglas y protección. Para siempre.',
      },
      max: {
        description: 'El mismo agente para una bandeja con mucho movimiento.',
      },
      monthly: 'Mensual',
      per: { month: 'al mes', year: 'al año' },
      lite: {
        description: 'El agente completo: lee, escribe y recuerda.',
      },
      pro: {
        description: 'El mismo agente con espacio para más correo.',
      },
      tryFree: (days: number) => `Pruébalo gratis ${days} días`,
      yearly: 'Anual · 2 meses gratis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Inicio, la clasificación, las reglas en palabras sencillas y la protección son gratis para siempre. Pro es el agente que lee, escribe y recuerda por ti; Max es el mismo agente con espacio para una bandeja con mucho movimiento. Cada cuenta empieza con ${trialDays} días de Pro, y cuando terminan simplemente sigues en Gratis.`,
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
    today: 'Lo que requiere tu atención hoy',
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
  actionDone: {
    heads_up: 'Entendido',
    commitment: 'Hecho',
    confirm: 'Ya lo confirmé',
    follow_up: 'Ya hice seguimiento',
    pay: 'Ya lo pagué',
    read: 'Ya lo leí',
    renew: 'Ya lo renové',
    schedule: 'Ya lo agendé',
    security: 'Ya lo comprobé',
    sign: 'Ya lo firmé',
  },
  actionLink: {
    confirm: 'Confirmar',
    pay: 'Pagar',
    read: 'Leer',
    renew: 'Renovar',
    sign: 'Firmar',
  },
  actionKind: {
    heads_up: 'Aviso',
    cleanup: 'Darse de baja de todos',
    consent: 'Aprobar',
    commitment: 'Prometido',
    security: 'Compruébalo',
    spam: 'Mover a spam',
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
    saving: 'Guardando el evento…',
    scope: {
      this: 'Solo este evento',
      following: 'Este y los siguientes eventos',
      all: 'Todos los eventos',
    },
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
    appearance: 'Apariencia',
    upgrade: 'Pasar a Pro',
    theme: {
      dark: 'Oscuro',
      light: 'Claro',
      system: 'Sistema',
    },
  },
  importance: [
    'Ruido',
    'Bueno saberlo',
    'Requiere tu atención pronto',
    'Urgente',
  ],
  justNow: 'justo ahora',
  errors: {
    calendarAccess:
      'Fewmail no tiene acceso a este calendario. Permítelo en la página Calendario.',
    failed: 'Algo salió mal. Inténtalo de nuevo.',
    needsPro: 'Esto requiere Fewmail Pro.',
    alreadySent: 'Ya se envió; es tarde para deshacerlo.',
    consentChanged:
      'Esto cambió desde que se pidió. Míralo de nuevo y decide en Inicio.',
    notFound: 'Esto ya no existe; puede que se haya eliminado.',
    offline: 'No se puede conectar con Fewmail. Revisa tu conexión.',
  },
  desktop: {
    confirm: 'Iniciar sesión en la app',
    confirmLead: (code: string) =>
      `Fewmail en tu equipo pide iniciar sesión. Comprueba que muestra ${code}.`,
    confirmTitle: '¿Iniciar sesión en la app?',
    expired: 'Este inicio de sesión caducó. Vuelve a empezarlo en la app.',
    lead: 'Ya iniciaste sesión en tu equipo. Puedes cerrar esta pestaña.',
    title: 'Vuelve a la app',
    waiting: (code: string) =>
      `Continúa en tu navegador y comprueba que muestra ${code}.`,
  },
  update: {
    available: 'Hay una nueva versión de Fewmail.',
    reload: 'Recargar',
  },
  keys: {
    forget: 'olvidar',
    reopen: 'reabrir',
    attach: 'adjuntar',
    done: 'hecho',
    openLink: 'abrir enlace',
    writeReminder: 'escribir un recordatorio',
    summary: 'resumen',
    fromSender: 'más del remitente',
    approvePicked: (n: number) => `aprobar ${n} seleccionados`,
    pick: 'seleccionar',
    pickAll: 'seleccionar todo',
    markRead: 'marcar leído',
    markUnread: 'marcar no leído',
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
    archive: 'archivar',
    approve: 'aprobar',
    approveAll: (n: number) => `aprobar las ${n} de este tipo`,
    close: 'cerrar',
    draftReply: 'borrador',
    edit: 'editar',
    expand: 'desplegar / plegar',
    move: 'mover',
    stackEmail: 'correo siguiente / anterior',
    open: 'abrir',
    rename: 'renombrar',
    clearFilter: 'quitar filtro',
    search: 'buscar',
    send: 'enviar',
    skip: 'omitir',
    keep: 'conservar',
    stopEditing: 'dejar de editar',
    rewrite: 'reescribir',
    save: 'guardar',
    deleteEvent: 'eliminar',
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
      'Nada se envía ni se archiva sin tu permiso. El calendario y los contactos son opcionales.',
    continue: 'Continuar con Google',
    lead: 'Fewmail lee tu correo y solo te muestra lo que requiere tu atención.',
    title: 'Solo lo que importa.',
  },
  mail: {
    inThread: (emails: string) => `${emails} en esta conversación`,
    moreFrom: (name: string) => `Más de ${name}`,
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
    inboxTotal: (count: string) => `${count} en total`,
    markShownRead: (total: number) =>
      plural('es', total, {
        one: (n) => `Marcar ${n} como leído`,
        other: (n) => `Marcar ${n} como leídos`,
      }),
    oneTimeCode: {
      copied: 'Código copiado',
      copy: 'Copiar código',
    },
    openUnsubscribePage: 'Abrir página',
    unsubscribeYourself:
      'Para dejar esta lista tienes que terminar en su página. Mientras tanto, su correo queda archivado.',
    allMailboxes: 'Todos los buzones',
    filterAbout: {
      focused: 'Lo importante y las personas primero, avisos plegados',
      unread: 'Lo que aún no has leído, por tipo',
      categories:
        'Toda la bandeja por tipo, lo que requiere tu atención primero',
      inbox: 'Todo, lo más reciente primero',
    },
    find: {
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
      named: 'Remitente o asunto',
      mentioned: 'Mencionado en el texto',
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
    ignoresUnsubscribe: (name: string) => `${name} ignora las bajas`,
    ignoresUnsubscribeHint:
      'Fewmail pidió la baja, pero se sabe que este remitente sigue escribiendo. ¿Enviar su correo a la papelera a partir de ahora? Puedes deshacerlo en Reglas.',
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
    deleteDraft: 'Eliminar borrador',
    notSent: 'No enviado: ábrelo para reintentar',
    noRecipients: 'Sin destinatarios',
    notSpam: 'No es spam',
    reportSpam: 'Marcar como spam',
    reportedSpam: 'Marcado. Sus correos ahora van a spam.',
    archive: 'Archivar',
    archived: 'Archivado',
    markedRead: 'Marcado como leído',
    markUnread: 'Marcar como no leído',
    markedUnread: 'Marcado como no leído',
    attachment: 'adjunto',
    draftReply: 'Redactar respuesta',
    due: (date: string) => `vence el ${date}`,
    dueHint: 'Plazo que el agente encontró en este correo',
    empty: {
      focused: 'Bandeja vacía',
      unread: 'Todo leído',
      categories: 'Bandeja vacía',
      inbox: 'Bandeja vacía',
      snoozed: 'Nada pospuesto',
      sent: 'Aún no has enviado nada',
      drafts: 'No hay borradores',
      archive: 'El archivo está vacío',
      spam: 'No hay spam',
      trash: 'La papelera está vacía',
    },
    emptyHint: {
      focused: 'Los correos nuevos aparecerán aquí en cuanto lleguen.',
      unread: 'Los correos nuevos aparecerán aquí en cuanto lleguen.',
      categories: 'Los correos nuevos aparecerán aquí en cuanto lleguen.',
      inbox: 'Los correos nuevos aparecerán aquí en cuanto lleguen.',
      snoozed:
        'Pospón un correo para apartarlo hasta más tarde: volverá a Recibidos sin leer.',
      sent: 'Los correos que envíes aparecerán aquí.',
      drafts: 'Los correos que empieces y no envíes esperan aquí.',
      archive: 'Los correos archivados salen de Recibidos y esperan aquí.',
      spam: 'El spam llega aquí, fuera de tu bandeja.',
      trash: 'Los correos eliminados se quedan aquí 30 días.',
    },
    noResults: 'No se encontró nada',
    noResultsHint: 'Prueba con otras palabras o en otra carpeta.',
    expectsReply: 'Espera respuesta',
    filter: {
      categories: 'Categorías',
      archive: 'Archivo',
      trash: 'Papelera',
      drafts: 'Borradores',
      spam: 'Spam',
      inbox: 'Recibidos',
      snoozed: 'Pospuestos',
      sent: 'Enviados',
      focused: 'Enfoque',
      unread: 'No leídos',
    },
    instruction: 'Dile al agente cómo responder, o pulsa Enter',
    open: 'Abrir',
    search: 'Busca o describe',
    openInGmail: 'Abrir en Gmail',
    openInNewTab: 'Abrir en una pestaña nueva',
    unsubscribe: 'Darse de baja',
    unsubscribed: 'Baja hecha',
    unsubscribeFailed:
      'Este remitente no permite darse de baja con un clic, así que el correo se archivó.',
    you: 'Tú',
    sent: 'Enviado',
    writeReply: 'Escribe una respuesta…',
    replyTo: 'Responder a',
    date: 'Fecha',
    authentication: 'Autenticación',
    toLine: (recipients: string) => `para ${recipients}`,
  },
  subscriptions: {
    leftBy: (percent: number) =>
      `${percent} % de sus lectores en Fewmail se dieron de baja`,
    unsubscribeHint: (emails: string) =>
      `Fewmail te da de baja de la lista y archiva todo lo que envió (${emails} este mes). Darse de baja no se puede deshacer.`,
    archivedOnly:
      'Este remitente no ofrece una baja que Fewmail pueda usar, así que se archivó su correo, pero sigues en la lista y seguirán llegando correos nuevos.',
    count: (total: number) => `Listas de correo: ${total}`,
    empty: 'Ninguna lista de correo te escribió este mes.',
    lead: 'Boletines, promociones y otras listas de correo que te escribieron este mes, las más activas primero. Date de baja de lo que nunca lees: Fewmail sale de la lista y archiva todo lo que envió.',
    opened: (total: number) =>
      total === 0 ? 'ninguno abierto' : `${total} abiertos`,
    title: 'Listas de correo',
    unsubscribe: 'Darse de baja',
    unsubscribed: 'Baja hecha',
  },
  nav: {
    board: 'Tablero',
    menu: 'Menú',
    labels: 'Etiquetas',
    folders: 'Carpetas',
    calendar: 'Calendario',
    subscriptions: 'Listas de correo',
    wrapped: 'Resumen',
    people: 'Personas',
    findPerson: 'Buscar a alguien',
    personMail: 'Ver correos',
    deleteContact: 'Eliminar contacto',
    contactDeleted: 'Contacto eliminado',
    clearSearch: 'Borrar búsqueda',
    mail: 'Correo',
    reading: 'Lectura',
    rules: 'Reglas',
    settings: 'Ajustes',
    syncFailed: 'Falló la sincronización con Gmail, reintentando',
    syncing: 'Leyendo tu bandeja…',
    loading: 'Cargando',
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
  notifications: {
    many: (total: number) =>
      plural('es', total, {
        other: (n) => `${n} novedades de Fewmail`,
      }),
  },
  onboarding: {
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
    addToCalendar: 'Añadir al calendario',
    writeReminder: 'Escribir un recordatorio',
    approve: 'Aprobar',
    delete: 'Eliminar',
    pick: 'Seleccionar',
    picked: (n: number) => `${n} seleccionados`,
    unpick: 'Quitar',
    askedByYou: 'Lo pediste tú',
    draftedInVoice: 'Redactado con tu voz',
    openEmail: 'Abrir el correo',
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
      alwaysShow: 'Siempre queda en Inicio, nunca se oculta',
      autonomous: 'Se hace solo y aparece en gestionados',
      draft: 'Un borrador te espera en Inicio',
    },
    effect: {
      trash: 'Moverlo a la papelera',
      always_show: 'No perdérmelo',
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
        'Cada mañana, los boletines de ayer llegan a Telegram y WhatsApp en un solo mensaje, o como notificación si no tienes ninguno conectado.',
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
      'Elimina de inmediato tu cuenta, el correo sincronizado, borradores y reglas de Fewmail. Tu Gmail no se toca. Un plan de pago se cancela de inmediato.',
    deleteFailed: 'La cuenta no se eliminó. Inténtalo de nuevo en un minuto.',
    deleteSignIn:
      'Para confirmar que eres tú, vuelve a iniciar sesión con Google y luego elimina la cuenta.',
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
      retrying:
        'Gmail no responde ahora mismo. Fewmail lo volverá a intentar solo.',
      signIn: 'Inicias sesión con esta',
      signInChosen: 'Es la cuenta con la que inicias sesión. Elige otra.',
      signInLost:
        'Se perdió el acceso a Gmail. Vuelve a iniciar sesión para reconectarlo.',
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
      desktop: 'Este equipo',
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
    imagesHidden: 'Las imágenes están ocultas en el spam.',
    openFile: {
      action: 'Abrir',
      description:
        'Este correo está en spam. Abre sus archivos solo si confías en el remitente.',
      title: (name: string) => `¿Abrir ${name}?`,
    },
    showImages: 'Mostrar imágenes',
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
    chatTaken:
      'Este chat ya está conectado a otra cuenta de Fewmail. Desconecta Telegram allí primero (Ajustes → Integraciones) y vuelve a abrir el enlace.',
    queueChanged:
      'Las tarjetas cambiaron desde entonces. Esto es lo que requiere tu atención ahora:',
    heard: (text: string) => `He oído: «${text}»`,
    voiceFailed: 'No lo he entendido. Inténtalo de nuevo o escríbelo.',
    help: 'Escribe o di lo que necesitas:\n• pregunta por tu correo: «¿cuándo se renueva Netflix?»\n• di qué responder: «dile a Ana que firmo mañana»\n• pídeme algo: «archiva siempre los boletines de Medium»\n• responde a uno de mis borradores para cambiarlo',
    canceled: 'Cancelado. El borrador vuelve a tu cola.',
    sendingIn: (seconds: number) => `Enviando en ${seconds} s`,
    undo: 'Deshacer',
    commands: { queue: 'Lo que requiere tu atención' },
    connectFirst: (url: string) =>
      `¡Hola! Soy Fewmail. Aquí en Telegram te aviso cuando llega correo urgente, te muestro lo que requiere tu atención y envío las respuestas que apruebes.\n\nEste chat aún no está conectado a tu Fewmail. Lleva un minuto:\n1. Abre los ajustes de Fewmail: ${url}\n2. En Integraciones, toca «Conectar Telegram» (es parte de Fewmail Pro).\n3. Telegram te traerá de vuelta aquí: pulsa Iniciar y listo.`,
    connected:
      'Conectado. Te avisaré cuando llegue algo urgente.\n\n/queue: lo que requiere tu atención',
    done: 'Hecho',
    draft: 'Borrador:',
    edit: 'Editar',
    editPrompt:
      'Envíame el texto que quieres usar, o dime cómo cambiarlo empezando por «/», p. ej. «/más formal».',
    newDraft: 'Nuevo borrador:',
    nothing: 'Ahora mismo nada requiere tu atención.',
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
    ruleSuggestion: {
      done: {
        archive:
          'El correo nuevo de este remitente se archivará. Puedes cambiarlo en Reglas.',
        mark_read:
          'El correo nuevo de este remitente se marcará como leído. Puedes cambiarlo en Reglas.',
      },
      label: 'Regla sugerida',
      lead: (count: number, effect: 'archive' | 'mark_read') =>
        effect === 'archive'
          ? `${count} correos este mes, y el agente archivaría cada uno`
          : `${count} correos este mes, y el agente marcaría cada uno como leído`,
      no: 'No, gracias',
      yes: {
        archive: 'Archivar siempre',
        mark_read: 'Marcar siempre como leído',
      },
    },
    ruleOffer: {
      lead: 'El agente puede hacer esto solo con el correo que coincida. Sigue desactivada hasta que digas que sí.',
      no: 'Dejar desactivada',
      turnedOn: 'Activada. Cámbiala en Reglas.',
      yes: 'Activar',
    },
    newSender: {
      archive: 'Archivar siempre',
      archived:
        'El correo nuevo de este remitente se archivará. Puedes cambiarlo en Reglas.',
      keep: 'Mantener como siempre',
      label: 'Remitente nuevo',
      lead: (count: number, opened: number) =>
        `${count} correos en dos semanas, ${opened === 0 ? 'ninguno abierto' : `${opened} abiertos`}`,
    },
    readingNow: (total: number) =>
      plural('es', total, {
        one: () => 'El agente está leyendo un correo nuevo',
        many: (n) => `El agente está leyendo ${n} correos nuevos`,
        other: (n) => `El agente está leyendo ${n} correos nuevos`,
      }),
    allDone: 'Todo listo. No tienes nada pendiente.',
    allDoneLead:
      'Sigo leyendo el correo nuevo. Todo lo que requiera tu atención aparecerá aquí.',
    allowanceSpent: (date: string) =>
      `Se acabó el uso del agente de este mes: los resúmenes y borradores vuelven el ${date}. Hasta entonces sigo anotando promesas y fechas límite.`,
    byRules: (n: number) => `Tus reglas se encargaron de ${n}.`,
    decisions: 'Decisiones',
    journal: {
      approved: 'Dijiste que sí',
      byRule: (rule: string) => `Tu regla: ${rule}`,
      failed: 'No funcionó',
      lead: 'Los últimos 7 días. Cada cambio en tu correo o calendario tuvo tu sí o una regla que activaste.',
      title: 'Hecho en tu correo',
    },
    progress: (done: number, total: number) => `${done} de ${total}`,
    mostlyNoise: (people: number) =>
      people === 0
        ? 'Todo son boletines y notificaciones.'
        : `Casi todo boletines y notificaciones; solo ${people} de personas.`,
    worth: {
      awaiting: (total: number) =>
        plural('es', total, {
          one: () => '1 esperando respuesta',
          other: (n) => `${n} esperando respuesta`,
        }),
      dated: (total: number) =>
        plural('es', total, {
          one: () => '1 con fecha',
          other: (n) => `${n} con fecha`,
        }),
    },
    worthKnowing: 'Para tener en cuenta',
    canWait: 'Puede esperar',
    canWaitEmpty: {
      lead: 'Aquí se reúnen los correos para leer cuando tengas un momento y las respuestas que esperas.',
      title: 'Nada en espera.',
    },
    improve: {
      empty: {
        lead: 'Cuando el agente vea que tratas a un remitente siempre igual, te ofrecerá una regla aquí.',
        title: 'Ninguna sugerencia por ahora.',
      },
      lead: (total: number) =>
        plural('es', total, {
          one: () => 'Una regla que el agente podría seguir por ti.',
          many: (n) => `${n} reglas que el agente podría seguir por ti.`,
          other: (n) => `${n} reglas que el agente podría seguir por ti.`,
        }),
      title: 'El agente sugiere',
    },
    quick: 'Rápido',
    needsLook: 'Requiere tu atención',
    tidy: {
      failed: (emails: string) =>
        `Gmail no cambió ${emails}. Inténtalo de nuevo en un momento.`,
      confirm: (emails: string) => `¿Ordenar ${emails}?`,
      running: 'Ordenando…',
      unsubscribeHint:
        'Algunos son listas de las que Fewmail te dará de baja, y eso no se puede deshacer.',
      archive: (n: number) => `${n} para archivar`,
      review: 'Revisar',
      reviewLead:
        'Cada correo con lo que haría el agente y por qué. Aprueba lo que te parezca bien y conserva lo que deba quedarse como está.',
      reviewTitle: 'Revisa lo que propone el agente',
      done: (n: number) => `${n} ordenados`,
      keep: 'Conservar',
      mark_read: (n: number) => `${n} para marcar como leídos`,
      run: 'Aprobar todo',
      unsubscribe: (n: number) => `${n} para darse de baja`,
      untilYouApprove: 'Nada cambia en tu correo hasta que lo apruebes',
      spam: (n: number) => `${n} a spam`,
      trash: (n: number) => `${n} para borrar`,
    },
    pauseListening: 'Pausar',
    resumeListening: 'Reanudar',
    awaiting: 'Esperando respuesta',
    hint: {
      messengers: {
        lead: 'Recibe el correo urgente y aprueba borradores en el mensajero que ya usas.',
        title: 'Telegram o WhatsApp',
      },
      notNow: 'Ahora no',
      setUp: 'Configurar',
      turnOn: 'Activar',
    },
    dates: 'Fechas y reuniones',
    done: 'Hecho',
    firstRead:
      'Empezamos por tu correo de los últimos tres días. Todo lo que requiera tu atención aparecerá aquí automáticamente.',
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
            one: () => 'Una cosa requiere tu atención.',
            other: (n) => `${n} cosas requieren tu atención.`,
          }),
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
    recent: (period: string) => `También ${period}`,
    sent: 'Enviado',
    codes: 'Códigos de acceso',
  },
  bulk: {
    badge: (n: number) => `Enviado a más de ${n} usuarios de Fewmail`,
    reason: (n: number) =>
      `Envío masivo: más de ${n} usuarios de Fewmail recibieron el mismo texto`,
  },
  cold: {
    reason: 'Contacto en frío: alguien a quien nunca escribiste te ofrece algo',
  },
  board: {
    empty: {
      lead: 'Las promesas que te hacen, las que haces tú y las fechas límite aparecen aquí automáticamente a partir de tu correo.',
      title: 'Nada pendiente.',
    },
    lead: {
      coming: (total: number) =>
        plural('es', total, {
          one: () => 'Se acerca una fecha límite.',
          other: (n) => `Se acercan ${n} fechas límite.`,
        }),
      owed: (amounts: string) => `Te deben ${amounts}.`,
      promised: (total: number) =>
        plural('es', total, {
          one: () => 'Prometiste una cosa.',
          other: (n) => `Prometiste ${n} cosas.`,
        }),
      waiting: (total: number) =>
        plural('es', total, {
          one: () => 'Una promesa que te hicieron sigue abierta.',
          other: (n) => `${n} promesas que te hicieron siguen abiertas.`,
        }),
    },
    section: {
      coming: 'Se acerca',
      owed: 'Te deben',
      promised: 'Prometiste',
      settled: 'Cerrado hace poco',
    },
    state: {
      acknowledged: 'respondieron, aún sin hacer',
      broken: 'no pasó',
      cancelled: 'cancelado',
      fulfilled: 'hecho',
      in_progress: 'en camino',
      open: 'esperando',
      overdue: 'vencido',
    },
    by: (date: string) => `hasta el ${date}`,
    lastDay: (date: string) => `fecha límite: ${date}`,
    done: 'Hecho',
    forget: 'Olvidar',
    reopen: 'Reabrir',
    markedDone: 'Marcado como hecho',
    forgotten: 'Olvidado',
    reopened: 'Reabierto',
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
    partial:
      'Gmail detuvo parte de la limpieza. Lo que ya se movió puede volver.',
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
    ready: (emails: string) => `Se pueden quitar ${emails}`,
    review: 'Revisar',
    run: (emails: string) => `Limpiar ${emails}`,
    safe: 'No se borra nada. El correo limpiado se archiva con la etiqueta Fewmail/Cleared y vuelve con un clic; además, te das de baja de los boletines.',
    scanning: 'Leo toda la bandeja, solo los encabezados. Hasta un minuto.',
    title: 'Limpiar la bandeja de entrada',
    undo: 'Devolverlo todo',
    undone: (emails: string) => `${emails} de vuelta en la bandeja`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `Día con más correo: ${day} · hora con más correo: ${hours}`,
    copied: 'Enlace copiado',
    copyLink: 'Copiar enlace',
    cta: 'Consigue el tuyo con Fewmail',
    emails: 'correos recibidos',
    empty:
      'Aún no hay correo suficiente para contar la historia. Vuelve en unos días.',
    handled: 'correos gestionados por Fewmail',
    handledHint:
      'Fewmail no cambia nada en Gmail sin tu sí. Activa una regla y gestionará este correo por su cuenta.',
    people: 'Quién escribió más',
    period: { month: 'Este mes', year: 'Este año' },
    replies: 'respuestas redactadas por Fewmail y enviadas',
    saveImage: 'Guardar imagen',
    saved: 'ahorrados por Fewmail',
    shareNote:
      'El enlace y la imagen muestran solo estas cifras, nunca nombres ni direcciones.',
    shared: { month: 'Un mes en el correo', year: 'Un año en el correo' },
    spam: 'correos de spam frenados',
    split: (people: string, lists: string, other: string) =>
      `${people} de personas · ${lists} de boletines · ${other} otros`,
    title: { month: 'Tu mes en el correo', year: 'Tu año en el correo' },
    unsubscribed: 'boletines abandonados',
  },
  reading: {
    markAllRead: 'Marcar todo como leído',
    summary: 'Lo que dicen tus boletines',
    worth: 'Vale la pena leerlo entero',
    leftOut: (n: number) => `Fuera del resumen: ${n}, nada nuevo.`,
    note: {
      inSummary: 'En el resumen',
      leftOut: 'Fuera del resumen',
    },
    digest: (n: number) => `Boletines: ${n}`,
    lead: 'Los boletines de un día en un solo lugar, para que no llenen la bandeja.',
    issues: 'Todas las ediciones',
    empty: 'Aún no hay boletines',
    emptyHint:
      'Cada mañana el agente escribirá aquí las noticias de tus boletines, cada línea enlazada al correo del que salió.',
    title: 'Lectura',
  },
  commitments: {
    title: 'Lo prometiste',
  },
  headsUp: {
    deadline: 'Último día pronto',
    notYet: 'No ha llegado nada desde entonces',
    price: 'Subió el precio',
    priceUp: (what: string, from: string, to: string) =>
      `${what}: ${to} en vez de ${from}`,
    promised: 'Te lo prometieron',
  },
  risk: {
    prompt_injection: (domain: string) =>
      `${domain} escondió en este correo instrucciones para asistentes que leen el correo. El agente las ignora; no lo reenvíes ni hagas lo que pide.`,
    known_phishing: (domain: string) =>
      `${domain} está en una lista pública de sitios de phishing activos. No abras enlaces, no inicies sesión ni pagues.`,
    credential_phishing: (domain: string) =>
      `${domain} te pide iniciar sesión o introducir datos de tu tarjeta o cuenta. Los bancos y servicios nunca lo piden por correo: no hagas clic en enlaces ni introduzcas nada.`,
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
    hints: {
      board:
        'Parte de Fewmail Pro: el agente anota lo que te prometieron, lo que prometiste y las fechas límite de tu correo, y sigue cada una hasta que se cumple.',
      drafts:
        'Parte de Fewmail Pro: el agente escribe la respuesta con tu estilo, y tú la editas y la envías.',
    },
  },
  whatsapp: {
    phoneTaken:
      'Este número ya está conectado a otra cuenta de Fewmail. Desconecta WhatsApp allí primero (Ajustes → Integraciones) y vuelve a enviar el mensaje.',
    connectFirst: (url: string) =>
      `¡Hola! Soy Fewmail. Aquí en WhatsApp te aviso cuando llega correo urgente, te muestro lo que requiere tu atención y envío las respuestas que apruebes.\n\nEste número aún no está conectado a tu Fewmail. Lleva un minuto:\n1. Abre los ajustes de Fewmail: ${url}\n2. En Integraciones, toca «Conectar WhatsApp» (es parte de Fewmail Pro).\n3. WhatsApp se abre con un mensaje listo: envíalo y listo.`,
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
