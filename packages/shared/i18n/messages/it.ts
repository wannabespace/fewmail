import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const it: Messages = {
  agent: {
    chats: 'Chat',
    confirm: {
      approve_action: 'Eseguire questa azione?',
      archive_thread: 'Archiviare questa conversazione?',
      create_rule: 'Aggiungere questa regola?',
      handle_thread: 'Affidare questa conversazione all’agente?',
      reply: 'Inviare questa risposta?',
      send_email: 'Inviare questa email?',
      snooze_thread: 'Posticipare questa conversazione?',
      unsubscribe: 'Annullare l’iscrizione da questo mittente?',
    },
    decline: 'No',
    declined: 'Hai detto di no',
    deleteChat: 'Elimina chat',
    failed: 'L’agente non è riuscito a finire. Riprova.',
    lead: 'Chiedi della tua posta o di’ cosa fare. Tutto ciò che invia o modifica Gmail aspetta il tuo sì.',
    newChat: 'Nuova chat',
    noChats: 'Ancora nessuna chat',
    placeholder: 'Chiedi della tua posta o di’ cosa fare…',
    retry: 'Riprova',
    send: 'Invia',
    steps: {
      list_subscriptions: 'Leggo le iscrizioni',
      approve_action: 'Eseguo',
      archive_thread: 'Archivio',
      create_rule: 'Aggiungo una regola',
      dismiss_action: 'Salto',
      draft_reply: 'Scrivo una risposta',
      get_board: 'Leggo la bacheca',
      get_person: 'Cerco la persona',
      get_today: 'Controllo oggi',
      handle_thread: 'Affido la conversazione',
      list_boards: 'Apro le bacheche',
      list_mail: 'Cerco nella posta',
      list_rules: 'Leggo le regole',
      read_thread: 'Leggo la conversazione',
      redraft_action: 'Riscrivo la bozza',
      refresh: 'Controllo la nuova posta',
      send_email: 'Invio',
      snooze_thread: 'Posticipo',
      unsubscribe: 'Annullo l’iscrizione',
    },
    stop: 'Ferma',
    thinking: 'Sto pensando…',
    title: 'Cosa posso fare per te?',
    to: (recipients: string) => `A ${recipients}`,
    until: (time: string) => `Fino a ${time}`,
    yes: {
      approve_action: 'Esegui',
      archive_thread: 'Archivia',
      create_rule: 'Aggiungi',
      handle_thread: 'Affida',
      reply: 'Invia',
      send_email: 'Invia',
      snooze_thread: 'Posticipa',
      unsubscribe: 'Annulla iscrizione',
    },
  },
  ask: {
    label: (question: string) => `Chiedi a Fewmail: «${question}»`,
    thinking: 'Sto cercando nella tua posta…',
  },
  compose: {
    backInQueue: 'Annullato. La bozza è di nuovo in Oggi.',
    canceled: 'Annullato. La tua email è di nuovo nell’editor.',
    cc: 'Cc',
    discard: 'Elimina',
    forward: 'Inoltra',
    forwardedMessage: 'Messaggio inoltrato',
    from: 'Da',
    instructionPlaceholder: 'Che tono deve avere? (facoltativo)',
    invalidRecipients: 'Aggiungi almeno un indirizzo email valido.',
    later: {
      inHour: 'Tra un’ora',
      monday: 'Lunedì mattina',
      tomorrow: 'Domani mattina',
    },
    new: 'Nuova email',
    placeholder: 'Scrivi la tua email…',
    remind: {
      days: (total: number) =>
        plural('it', total, {
          one: () => 'Ricordamelo se non rispondono entro un giorno',
          many: (n) => `Ricordamelo se non rispondono entro ${n} giorni`,
          other: (n) => `Ricordamelo se non rispondono entro ${n} giorni`,
        }),
      label: 'Ricordamelo',
      off: 'Nessun promemoria',
    },
    reply: 'Rispondi',
    scheduledFor: (date: string) => `Programmata per il ${date}`,
    send: 'Invia',
    sendLater: 'Invia più tardi',
    sendingIn: (seconds: number) => `Invio tra ${seconds} s`,
    subject: 'Oggetto',
    to: 'A',
    undo: 'Annulla',
    writeForMe: 'Scrivila tu',
    writing: 'Sto scrivendo…',
  },
  composer: {
    acceptSuggestion: 'Tab per accettare',
    bold: 'Grassetto',
    bulletList: 'Elenco puntato',
    italic: 'Corsivo',
    link: 'Link',
    linkPlaceholder: 'Incolla o scrivi un link',
    noSnippets: 'Nessuno snippet corrisponde.',
    removeLink: 'Rimuovi link',
  },
  reminders: {
    followUp: 'Sollecita',
    noReply: 'Ancora nessuna risposta',
  },
  skills: {
    bills: 'Bollette e pagamenti in scadenza',
    cleanup: 'Newsletter da sfoltire',
    followups: 'Chi ti deve una risposta',
    today: 'Cosa ti serve oggi',
    waiting: 'Chi aspetta la tua risposta',
    week: 'La tua settimana di posta',
  },
  snooze: {
    laterToday: 'Più tardi oggi',
    nextWeek: 'La prossima settimana',
    title: 'Posticipa',
    tomorrow: 'Domani',
    unsnooze: 'Torna in arrivo',
    until: (date: string) => `Posticipata fino al ${date}`,
    weekend: 'Questo weekend',
  },
  actionKind: {
    cleanup: 'Disiscriviti da tutte',
    commitment: 'Fatto',
    security: 'Ho controllato',
    task: 'Invia',
    spam: 'Spostata nello spam',
    trash: 'Sposta nel cestino',
    archive: 'Archivia',
    follow_up: 'Sollecita',
    mark_read: 'Segna letto',
    pay: 'Paga',
    read: 'Leggi',
    reply: 'Rispondi',
    schedule: 'Pianifica',
    unsubscribe: 'Disiscriviti',
  },
  actionStatus: {
    auto_done: 'fatto dall’agente',
    dismissed: 'saltato',
    done: 'fatto',
    failed: 'non riuscito',
    pending: 'in attesa in Oggi',
  },
  byRule: 'da una regola',
  category: {
    calendar: 'Calendario',
    finance: 'Finanze',
    newsletter: 'Newsletter',
    notification: 'Notifica',
    other: 'Altro',
    person: 'Persona',
    promotion: 'Promozione',
    receipt: 'Ricevuta',
    security: 'Sicurezza',
    travel: 'Viaggi',
    work: 'Lavoro',
  },
  command: {
    compose: 'Nuova email',
    agent: 'Agente',
    appearance: 'Aspetto',
    checkMail: 'Controlla nuova posta',
    goTo: 'Vai a',
    inboxUpToDate: 'La posta è aggiornata',
    mail: 'Posta',
    nothingMatches: 'Nessun risultato.',
    placeholder: 'Cerca nella posta o esegui un comando…',
    rewriteBrief: 'Riscrivi il brief',
    searchFor: (query: string) => `Cerca “${query}” nella posta`,
    upgrade: 'Passa a Pro',
    teachRule: 'Insegna una nuova regola',
    theme: {
      dark: 'Tema scuro',
      light: 'Tema chiaro',
      system: 'Come il sistema',
    },
  },
  importance: ['Rumore', 'Buono a sapersi', 'Presto per te', 'Urgente'],
  justNow: 'proprio ora',
  keys: {
    unsubscribe: 'disiscriviti',
    filter: 'filtro',
    reply: 'rispondi',
    snooze: 'posticipa',
    anything: 'qualsiasi cosa',
    archive: 'archivia',
    approve: 'approva',
    close: 'chiudi',
    draftReply: 'bozza',
    edit: 'modifica',
    move: 'sposta',
    open: 'apri',
    search: 'cerca',
    send: 'invia',
    skip: 'salta',
    stopEditing: 'fine modifica',
  },
  legal: {
    privacy: 'Informativa sulla privacy',
    englishOnly:
      'Questo documento è fornito in inglese, che ne è la versione vincolante.',
    terms: 'Termini di servizio',
    updated: (date: string) => `Ultimo aggiornamento: ${date}`,
  },
  limits: {
    boards: (total: number) =>
      `Il tuo piano include ${total} bacheche. Eliminane una o passa a Max in Impostazioni → Piano.`,
    messages: (date: string) =>
      `I messaggi all’agente di questo mese sono finiti. Tornano il ${date}.`,
    tasks: (total: number) =>
      `Il tuo piano gestisce ${total} thread alla volta. Lascia che uno finisca o passa a Max in Impostazioni → Piano.`,
  },
  login: {
    agree: ((slots) => [
      'Continuando accetti i ',
      slots.terms,
      ' e l’',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail chiede di leggere, organizzare e inviare Gmail per te. Niente viene inviato né archiviato senza il tuo ok, a meno che tu non scriva una regola che lo consenta.',
    continue: 'Continua con Google',
    lead: 'Fewmail legge la posta per te, risponde con la tua voce e ti mostra solo ciò che ha davvero bisogno di te.',
    messengers:
      'Funziona anche nelle app di messaggistica, a partire da Telegram: ricevi il brief, approva le risposte o invia semplicemente un vocale.',
    title: 'Solo ciò che conta.',
  },
  mail: {
    allMailboxes: 'Tutte le caselle',
    unread: 'Non letto',
    block: 'Blocca mittente',
    blocked: 'Bloccato. Le sue email ora finiscono nel cestino.',
    forward: 'Inoltra',
    more: 'Altro',
    reply: 'Rispondi',
    trash: 'Sposta nel cestino',
    trashed: 'Spostata nel cestino',
    movedToInbox:
      'Riportata nella posta in arrivo. Grazie per la segnalazione.',
    noThread: 'Scegli un’email per leggerla qui',
    notSpam: 'Non è spam',
    reportSpam: 'Segnala come spam',
    reportedSpam: 'Segnalato. Le sue email ora finiscono nello spam.',
    archive: 'Archivia',
    archived: 'Archiviata',
    attachment: 'allegato',
    draftReply: 'Scrivi bozza',
    drafting: 'Scrivo…',
    draftWaiting: 'La bozza ti aspetta in Oggi',
    due: (date: string) => `scade il ${date}`,
    empty: 'Nessuna email qui.',
    expectsReply: 'Attende risposta',
    filter: {
      spam: 'Spam',
      inbox: 'In arrivo',
      snoozed: 'Posticipate',
      important: 'Importanti',
      needs_reply: 'Da rispondere',
      quiet: 'Tranquille',
    },
    instruction: 'Di’ all’agente come rispondere, o premi Invio',
    open: 'Apri',
    search: 'Cerca o descrivi: fatture di Anna del mese scorso',
    openInGmail: 'Apri in Gmail',
    unsubscribe: 'Annulla iscrizione',
    unsubscribed: 'Iscrizione annullata',
    unsubscribeFailed:
      'Questo mittente non permette di annullare l’iscrizione con un clic, quindi l’email è stata archiviata.',
    you: 'Tu',
  },
  subscriptions: {
    archivedOnly:
      'Questo mittente non ha la disiscrizione con un clic, quindi la sua posta è stata archiviata. Se continua ad arrivare, finirà nello spam.',
    count: (total: number) => `Mailing list: ${total}`,
    empty: 'Nessuna mailing list ti ha scritto questo mese.',
    lead: 'Le mailing list che ti hanno scritto questo mese, le più attive prima. Disiscriversi archivia tutto ciò che hanno inviato; la posta che arriva ancora due settimane dopo va nello spam.',
    opened: (total: number) =>
      total === 0 ? 'nessuna aperta' : `${total} aperte`,
    title: 'Iscrizioni',
    unsubscribe: 'Disiscriviti',
    unsubscribed: 'Disiscritto',
  },
  nav: {
    subscriptions: 'Iscrizioni',
    agent: 'Agente',
    boards: 'Bacheche',
    newBoard: 'Nuova bacheca',
    mail: 'Posta',
    rules: 'Regole',
    search: 'Cerca o chiedi…',
    settings: 'Impostazioni',
    syncFailed: 'Sincronizzazione Gmail non riuscita, riprovo',
    syncing: 'Leggo la tua posta…',
    today: 'Oggi',
    trialLeft: (total: number) =>
      plural('it', total, {
        one: (n) => `Prova Pro · ${n} giorno rimasto`,
        many: (n) => `Prova Pro · ${n} giorni rimasti`,
        other: (n) => `Prova Pro · ${n} giorni rimasti`,
      }),
    usage: (percent: number) => `Agente · ${percent}% del mese usato`,
    watching: 'L’agente tiene d’occhio la tua posta',
  },
  schedule: {
    failed:
      'Questa esecuzione pianificata non è riuscita. Riproverò alla prossima.',
    limitReached: (day: string) =>
      `I messaggi di questo mese sono esauriti, quindi la pianificazione salta le esecuzioni fino al ${day}.`,
    open: 'Apri in Fewmail',
    stopped:
      'Questa pianificazione è fallita tre volte di seguito, quindi l’ho fermata. Chiedimi di reimpostarla quando la vuoi.',
  },
  notifications: {
    many: (total: number) =>
      plural('it', total, {
        other: (n) => `${n} novità da Fewmail`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Pagine che l’agente riempie con la tua posta, a partire dagli ultimi sei mesi. Scegline fino a ${max}; le tue puoi aggiungerle dopo.`,
    boardsTitle: 'Cosa deve raccogliere l’agente per te?',
    languageHint:
      'App, brief, riepiloghi e spiegazioni usano questa lingua. Le risposte seguono sempre la lingua dell’email a cui rispondi.',
    languageTitle: 'In che lingua deve parlare Fewmail?',
    lead: 'Tre risposte veloci. Puoi cambiare tutto più tardi nelle Impostazioni.',
    personaTitle: 'Come usi l’email?',
    reading: 'Leggo la tua posta…',
    start: 'Inizia',
    title: 'Configuriamo il tuo agente.',
  },
  plan: {
    free: 'Gratis',
    freeDescription:
      'Email veloce e tranquilla con regole semplici. Gratis per tutto il tempo che vuoi.',
    includes:
      'Pro aggiunge l’agente: un riepilogo quotidiano, ogni email letta e riassunta, risposte scritte con la tua voce, regole a parole semplici, Telegram e MCP.',
    manage: 'Gestisci fatturazione',
    price: (usd: number) => `$${usd} / mese`,
    priceYearly: (usd: number) => `$${usd} / anno`,
    max: 'Max',
    maxLimits: (emails: string, messages: string) =>
      `${emails} email e ${messages} messaggi al mese; bacheche e thread affidati senza limiti.`,
    pro: 'Pro',
    proLimits: (emails: string, messages: string) =>
      `${emails} email e ${messages} messaggi al mese.`,
    cancels: (plan: string, date: string) =>
      `${plan} fino al ${date}, poi Gratis.`,
    choose: (plan: string) => `Scegli ${plan}`,
    proRenews: (date: string) => `Si rinnova il ${date}.`,
    resets: (date: string) => `Si azzera il ${date}.`,
    title: 'Piano',
    trial: 'Prova Pro',
    welcome: (plan: string) =>
      `Benvenuto in ${plan}. L’agente è di nuovo al lavoro.`,
    yearly: 'Paga annualmente',
    yearlyHint: 'Due mesi gratis.',
    emailsUsed: (used: string, total: string) => `${used} di ${total} email`,
    messagesUsed: (used: string, total: string) =>
      `${used} di ${total} messaggi`,
    trialDescription: (date: string) =>
      `Tutto Pro fino al ${date}, poi gratis. Nessuna carta.`,
    upgrade: 'Altri piani',
    usage: 'Questo mese',
  },
  persona: {
    reader: {
      description:
        'Tieni calma la mia posta, gestisci il rumore e non lasciarti sfuggire niente di importante.',
      title: 'Leggo soprattutto',
    },
    responder: {
      description:
        'Metti prima chi aspetta una mia risposta e prepara bozze con la mia voce.',
      title: 'Rispondo molto',
    },
  },
  queue: {
    draftedInVoice: 'Scritto con la tua voce',
    edit: 'Modifica',
    open: 'Apri',
    send: 'Invia',
    shorter: 'Più breve',
    shorterInstruction: 'Rendila più breve.',
    skip: 'Salta',
  },
  rules: {
    add: 'Aggiungi regola',
    count: (total: number) =>
      plural('it', total, {
        one: () => '1 regola',
        other: (n) => `${n} regole`,
      }),
    delete: 'Elimina',
    describe: {
      alwaysShow: 'Arriva sempre in Oggi',
      autonomous: 'Fatto in autonomia, elencato tra le gestite',
      draft: 'Una bozza ti aspetta in Oggi',
    },
    effect: {
      trash: 'Spostala nel cestino',
      always_show: 'Mostramela sempre',
      archive: 'Archiviala',
      draft_reply: 'Scrivi una bozza',
      mark_read: 'Segna come letta',
      unsubscribe: 'Disiscriviti',
    },
    enabled: 'Regola attiva',
    lead: 'Di’ all’agente a parole tue cosa fare con certe email. Confronta ogni email con queste regole, dall’alto in basso.',
    newTitle: 'Insegna una nuova regola',
    placeholder: 'es. Fatture di Hetzner o notifiche di LinkedIn',
    leadFree:
      'Archivia, segna come letta o annulla l’iscrizione in automatico. Le regole si applicano alla nuova posta appena arriva.',
    simple: {
      appliedAutomatically: 'Applicata automaticamente alla nuova posta',
      field: {
        from: 'Da',
        mailingList: 'Qualsiasi mailing list',
        subject: 'L’oggetto contiene',
      },
      title: {
        from: (value: string) => `Da «${value}»`,
        mailingList: () => 'Qualsiasi mailing list',
        subject: (value: string) => `L’oggetto contiene «${value}»`,
      },
      valuePlaceholder: 'anna@example.com, un nome o una parola',
      whichField: 'Confronta per',
    },
    title: 'Regole',
    whatAgentDoes: 'Cosa fa l’agente',
    whichEmails: 'Quali email',
  },
  settings: {
    knowledge: {
      description:
        'Prezzi, indirizzi, disponibilità, come ti piace rispondere. L’agente lo usa nelle bozze e nel completamento automatico.',
      placeholder:
        'es. La consulenza costa $150/h. Il venerdì non prendo chiamate. Il mio indirizzo è…',
      title: 'Cosa deve sapere l’agente',
    },
    labels: {
      description:
        'Ordina la posta in etichette Fewmail/… così Gmail sul telefono mostra lo stesso ordine.',
      title: 'Etichette dell’agente in Gmail',
    },
    schedules: {
      delete: 'Elimina',
      description:
        'Chiedi all’agente in chat di fare qualcosa regolarmente, come «ogni venerdì alle 17:00 raccogli le fatture della settimana». Ogni esecuzione arriva in una chat dedicata, dove approvi ciò che vuole inviare.',
      title: 'Pianificazioni',
    },
    snippets: {
      add: 'Aggiungi snippet',
      body: 'Testo',
      delete: 'Elimina',
      description: 'Digita ; nell’editor per inserire uno snippet per nome.',
      name: 'Nome',
      title: 'Snippet',
    },
    account: 'Account',
    agent: 'Agente',
    briefDescription: (timezone: string) => `Nel tuo fuso orario, ${timezone}`,
    briefTitle: 'Brief giornaliero',
    deleteAccount: 'Elimina account',
    deleteConfirm: 'Elimina tutto',
    deleteDescription:
      'Elimina subito da Fewmail il tuo account, la posta sincronizzata, bozze, regole e brief. Il tuo Gmail non viene toccato.',
    deleteTitle: 'Eliminare il tuo account Fewmail?',
    cancel: 'Annulla',
    integrations: 'Integrazioni',
    language: 'Lingua',
    languageDescription:
      'App, brief e riepiloghi. Le risposte seguono l’email.',
    legal: 'Note legali',
    mailboxes: {
      add: 'Aggiungi Gmail',
      addDescription:
        'La posta di un altro account Gmail arriva nello stesso Oggi e nella stessa casella. Non fa mai accedere nessuno qui: accedere con quell’account apre un Fewmail separato.',
      added: 'Casella aggiunta. La posta compare tra un minuto.',
      failed:
        'Impossibile aggiungere la casella. Consenti l’accesso a Gmail e riprova.',
      lost: 'Accesso a Gmail perso. Aggiungila di nuovo per ricollegarla.',
      reading: 'Lettura della posta…',
      remove: 'Rimuovi',
      signIn: 'Accedi con questa',
      signInChosen: 'È l’account con cui accedi. Scegline un altro.',
      synced: (ago: string) => `Sincronizzata ${ago}`,
      title: 'Caselle di posta',
    },
    mcp: {
      copyNow:
        'Copia ora questa configurazione: la chiave viene mostrata una sola volta.',
      create: 'Crea chiave',
      defaultName: 'Client MCP',
      description:
        'Possono leggere il tuo brief e la posta, scrivere bozze e inviarle dopo la tua conferma.',
      keyName: 'Nome della chiave',
      neverUsed: 'Mai usata',
      revoke: 'Revoca',
      title: 'Collega Claude, Cursor o qualsiasi client MCP',
      used: (ago: string) => `Usata ${ago}`,
    },
    persona: 'Come usi l’email',
    signedInWithGoogle: 'Accesso con Google',
    signOut: 'Esci',
    notifications: {
      blocked:
        'Le notifiche sono bloccate. Consentile nelle impostazioni del sito del browser.',
      browser: 'Questo browser',
      notConfigured:
        'Le notifiche del browser non sono configurate su questo server.',
      off: 'Ricevi qui le email urgenti e il brief giornaliero, anche con Fewmail chiuso.',
      on: 'Le email urgenti e il brief giornaliero compaiono qui. Più insieme arrivano come una sola.',
      title: 'Notifiche',
      unsupported: 'Questo browser non può mostrare notifiche.',
    },
    telegram: {
      connect: 'Collega Telegram',
      disconnect: 'Scollega',
      linked:
        'Il brief arriva ogni mattina, la posta urgente subito. Approva e modifica le bozze dalla chat.',
      notConfigured: 'Il bot Telegram non è configurato su questo server.',
      unlinked: 'Ricevi il brief e approva le bozze da Telegram.',
    },
    whatsapp: {
      connect: 'Collega WhatsApp',
      disconnect: 'Scollega',
      linked:
        'Il brief arriva ogni mattina, la posta urgente subito. Approva e modifica le bozze dalla chat.',
      notConfigured: 'Il bot WhatsApp non è configurato su questo server.',
      unlinked: 'Ricevi il brief e approva le bozze da WhatsApp.',
    },
    title: 'Impostazioni',
  },
  spam: {
    reasonList: 'In un elenco pubblico di domini di spammer',
    reasonPattern: {
      auth: 'Autenticazione del mittente fallita: l’indirizzo è falso',
      infra:
        'Inviato da una rete segnalata come spam da diversi utenti Fewmail',
      link: 'Link a siti segnalati come spam da diversi utenti Fewmail',
      signals:
        'Dominio nuovo, indirizzo strano e autenticazione debole insieme',
      template: 'Stesso testo segnalato come spam da diversi utenti Fewmail',
    },
    reasonCommunity: 'Segnalato come spam da diversi utenti Fewmail',
    reasonYou: 'Hai segnalato questo mittente come spam',
    suspect: 'Sembra spam',
  },
  starterRules: {
    alwaysShow:
      'Avvisi di sicurezza, bollette in scadenza, qualsiasi cosa dalla mia banca o dalla pubblica amministrazione',
    newsletters: 'Newsletter e digest',
    notifications: 'Notifiche automatiche di strumenti e servizi',
    people:
      'Email di persone reali che mi fanno una domanda o aspettano una mia risposta',
    promotions: 'Promozioni, marketing ed email di vendita a freddo',
    receipts: 'Ricevute, conferme d’ordine e di spedizione',
  },
  telegram: {
    heard: (text: string) => `Ho sentito: “${text}”`,
    voiceFailed: 'Non ho capito. Riprova o scrivilo.',
    help: 'Scrivi o di’ cosa ti serve:\n• chiedi della tua posta: «quando si rinnova Netflix?»\n• di’ cosa rispondere: «di’ ad Anna che firmo domani»\n• rispondi a una mia bozza per cambiarla',
    canceled: 'Annullato. La bozza è di nuovo nella tua coda.',
    sendingIn: (seconds: number) => `Invio tra ${seconds} s`,
    undo: 'Annulla',
    commands: { brief: 'Brief di oggi', queue: 'Cosa ti aspetta' },
    connectFirst:
      'Prima apri Fewmail → Impostazioni → Integrazioni e tocca “Collega Telegram”.',
    connected:
      'Collegato. Ti invierò il brief ogni mattina e ti avviserò quando arriva qualcosa di urgente.\n\n/brief — brief di oggi\n/queue — cosa ti aspetta',
    done: 'Fatto',
    draft: 'Bozza:',
    edit: 'Modifica',
    editPrompt:
      'Mandami il testo da usare al suo posto, o dimmi come cambiarlo iniziando con “/”, es. “/più formale”.',
    newDraft: 'Nuova bozza:',
    nothing: 'Al momento niente ti aspetta.',
    proOnly:
      'Telegram fa parte di Fewmail Pro. Apri Impostazioni → Piano in Fewmail per passare a Pro.',
    queueHint: '/queue — cosa ti aspetta',
    rewriting: 'Riscrivo…',
    send: 'Invia',
    sendThis: 'Invia questa',
    shorter: 'Più breve',
    skip: 'Salta',
    skipped: 'Saltata',
    somethingWrong: 'Qualcosa è andato storto',
    urgent: 'Urgente',
    willSend: 'Invierò:',
  },
  today: {
    hint: {
      notNow: 'Non ora',
      setUp: 'Configura',
      turnOn: 'Attiva',
    },
    later: (total: number, time: string) =>
      plural('it', total, {
        one: () => `Un’altra arriva alle ${time}`,
        many: (n) => `Altre ${n} arrivano alle ${time}`,
        other: (n) => `Altre ${n} arrivano alle ${time}`,
      }),
    briefArrives: (time: string) => `Il brief arriva ogni giorno alle ${time}.`,
    briefFrom: (time: string) => `brief delle ${time}`,
    done: 'Fatto',
    firstRead:
      'Sto leggendo la posta degli ultimi tre giorni. Ciò che ha bisogno di te comparirà qui da solo.',
    handled: {
      spam: (n: number) => `Nello spam: ${n}`,
      archived: (n: number) => `Archiviate: ${n}`,
      markedRead: (n: number) => `Segnate come lette: ${n}`,
      review: 'Rivedi',
      total: (n: number) => `Gestite: ${n}`,
      unsubscribed: (n: number) => `Disiscrizioni: ${n}`,
    },
    headline: (total: number) =>
      total === 0
        ? 'Tutto tranquillo.'
        : plural('it', total, {
            one: () => 'Una cosa ha bisogno di te.',
            many: (n) => `${n} cose hanno bisogno di te.`,
            other: (n) => `${n} cose hanno bisogno di te.`,
          }),
    nothingNeedsYou:
      'Al momento niente ha bisogno di te. La nuova posta viene letta appena arriva.',
    sent: 'Inviata',
    waitingOnYou: 'Ti aspettano',
    worthAttention: 'Merita attenzione',
    writeNow: 'Scrivila ora',
    writing: 'Scrivo…',
  },
  boards: {
    chart: {
      add: 'Aggiungi grafico',
      edit: 'Impostazioni del grafico',
      empty: 'Ancora niente da disegnare',
      groupBy: 'Raggruppato per',
      groupings: {
        group: 'Chi o cosa',
        month: 'Mese',
        status: 'Stato',
        week: 'Settimana',
      },
      measure: 'Mostra',
      measures: { count: 'Numero', sum: 'Importo totale' },
      other: 'Altro',
      remove: 'Rimuovi grafico',
      title: 'Titolo del grafico',
      type: 'Tipo di grafico',
      types: {
        area: 'Area',
        bar: 'Barre',
        line: 'Linea',
        pie: 'Torta',
      },
      untitled: 'Nuovo grafico',
    },
    charts: 'Grafici',
    create: 'Crea bacheca',
    delete: 'Elimina bacheca',
    description: 'Cosa raccoglie',
    descriptionPlaceholder:
      'Viaggi: voli, hotel e noleggi auto, con quanto sono costati',
    edit: 'Modifica bacheca',
    editHint: 'Se cambi cosa raccoglie, gli ultimi sei mesi vengono riletti.',
    empty:
      'Ancora vuota. Le email pertinenti compariranno qui appena arrivano.',
    entries: (total: number) =>
      plural('it', total, {
        one: () => 'Una voce',
        other: (n) => `${n} voci`,
      }),
    name: 'Nome',
    namePlaceholder: 'Viaggi',
    new: 'Nuova bacheca',
    newHint:
      'Descrivi con parole tue cosa raccogliere. Fewmail lo trova nella posta degli ultimi sei mesi, sceglie i grafici e la tiene aggiornata.',
    planning: 'Preparazione…',
    readingHistory: 'Leggo la posta degli ultimi sei mesi…',
    save: 'Salva',
    starter: {
      money: {
        description:
          'Pagamenti, abbonamenti, bollette e rimborsi: cosa pago, a chi e quanto.',
        name: 'Soldi',
      },
      orders: {
        description:
          'Ordini online e consegne: cosa ho comprato, da chi e dove si trova.',
        name: 'Ordini',
      },
      subscriptions: {
        description:
          'Abbonamenti e iscrizioni: cosa si rinnova, ogni quanto e a che prezzo.',
        name: 'Abbonamenti',
      },
      trips: {
        description:
          'Voli, treni, hotel e noleggi: dove vado, quando e quanto costa.',
        name: 'Viaggi',
      },
    },
  },
  bulk: {
    badge: (n: number) => `Inviata a oltre ${n} utenti Fewmail`,
    reason: (n: number) =>
      `Email di massa: oltre ${n} utenti Fewmail hanno ricevuto lo stesso testo`,
  },
  cleanup: {
    emails: (total: number) =>
      plural('it', total, {
        one: () => '1 email',
        many: (n) => `${n} email`,
        other: (n) => `${n} email`,
      }),
    reason: (total: number) => `${total} email questo mese, nessuna aperta`,
    title: (total: number) =>
      plural('it', total, {
        one: () => 'Disiscriviti da una newsletter che non apri mai',
        many: (n) => `Disiscriviti da ${n} newsletter che non apri mai`,
        other: (n) => `Disiscriviti da ${n} newsletter che non apri mai`,
      }),
  },
  commitments: {
    title: 'Hai promesso',
  },
  people: {
    firstContact: (date: string) => `Vi scrivete dal ${date}`,
    lastContact: (date: string) => `Ultima email il ${date}`,
    open: 'Apri le conversazioni',
    promised: 'Hai promesso',
    threads: (total: number) =>
      plural('it', total, {
        one: () => '1 conversazione',
        many: (n) => `${n} conversazioni`,
        other: (n) => `${n} conversazioni`,
      }),
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} è in un elenco pubblico di siti di phishing attivi. Non aprire link, non accedere e non pagare.`,
    lookalike_domain: (domain: string) =>
      `Sembra ${domain}, ma è un indirizzo diverso. Non cliccare sui link e non pagare.`,
    new_sender_payment: (domain: string) =>
      `Prima email da ${domain} e chiede soldi. Verifica tramite un canale di cui già ti fidi.`,
    spoofed_sender: (domain: string) =>
      `Dice di venire da ${domain}, ma ${domain} non l’ha inviato. Non cliccare link e non pagare.`,
    payment_change: (domain: string) =>
      `Nuovi dati di pagamento da ${domain}. Conferma per telefono prima di pagare.`,
    title: 'Controlla prima di agire',
  },
  tasks: {
    active: (goal: string) => `L’agente se ne occupa: ${goal}`,
    auto: 'Invia le email senza chiedermelo',
    autoHint:
      'Ogni email aspetta comunque qualche secondo, così puoi annullarla.',
    cancel: 'Ferma',
    done: 'Attività completata',
    goal: 'Cosa deve ottenere l’agente?',
    goalPlaceholder:
      'es. Farsi rimandare la fattura con il nostro nuovo indirizzo',
    handle: 'Occupatene tu…',
    next: 'Prossimo passo',
    start: 'Avvia',
    started: 'L’agente se ne occupa.',
  },
  whatsapp: {
    connectFirst:
      'Prima apri Fewmail → Impostazioni → Integrazioni e tocca “Collega WhatsApp”.',
    connected:
      'Collegato. Ti invierò il brief ogni mattina e ti scriverò quando arriva qualcosa di urgente. Manda un testo o un vocale per rispondere a qualsiasi email.',
    proOnly:
      'WhatsApp fa parte di Fewmail Pro. Apri Impostazioni → Piano in Fewmail per passare a Pro.',
  },
  zombie: {
    badge: (share: number) =>
      `Ignora le disiscrizioni per il ${share}% delle persone`,
    reason: 'Ha continuato a scriverti dopo la disiscrizione',
  },
}
