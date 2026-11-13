import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const it: Messages = {
  agent: {
    collapse: 'Comprimi',
    voice: 'Parla con l’agente',
    voiceStop: 'Ferma e invia',
    chats: 'Chat',
    autonomy: {
      ask: 'Ti chiede prima di ogni email',
      auto: (most: number) =>
        `Invia le email da solo, senza chiederti (fino a ${most})`,
    },
    calendar: (email: string) => `Nel calendario di ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      create_schedule: 'Eseguire questo in modo pianificato?',
      create_event: 'Aggiungere questo evento?',
      delete_event: 'Eliminare questo evento?',
      update_event: 'Modificare questo evento?',
      approve_action: 'Eseguire questa azione?',
      archive_thread: 'Archiviare questa conversazione?',
      clear_out: 'Fare pulizia di questi gruppi di email?',
      undo_clear_out:
        'Riportare nella posta in arrivo tutto ciò che è stato tolto?',
      create_rule: 'Aggiungere questa regola?',
      handle_thread: 'Affidare questa conversazione all’agente?',
      reply: 'Inviare questa risposta?',
      send_email: 'Inviare questa email?',
      snooze_thread: 'Posticipare questa conversazione?',
      unsubscribe: 'Annullare l’iscrizione da questo mittente?',
      tidy_mail: 'Riordinare queste email tranquille?',
      trash_thread: 'Spostare questa conversazione nel cestino?',
      report_spam: 'Segnalare questo mittente come spam?',
      mark_not_spam: 'Togliere questa conversazione dallo spam?',
      move_to_inbox: 'Riportare questa conversazione nella posta in arrivo?',
    },
    decline: 'No',
    declined: 'Hai detto di no',
    stepCount: (count: number) =>
      plural('it', count, {
        one: () => 'Un passaggio',
        many: (n) => `${n} passaggi`,
        other: (n) => `${n} passaggi`,
      }),
    detach: 'Non allegare questa email',
    deleteChat: 'Elimina chat',
    deleteChatConfirm: 'Eliminare questa chat?',
    deleteChatHint:
      'La conversazione sparisce per sempre. La tua posta resta dov’è.',
    failed: 'L’agente non è riuscito a finire. Riprova.',
    newChat: 'Nuova chat',
    noChats: 'Ancora nessuna chat',
    cancelEdit: 'Annulla modifica',
    copy: 'Copia',
    edit: 'Modifica',
    editing: 'Stai modificando il messaggio',
    regenerate: 'Rispondi di nuovo',
    skills: 'Skill',
    placeholder: 'Chiedi della tua posta o digita / per le skill',
    retry: 'Riprova',
    send: 'Invia',
    steps: {
      create_schedule: 'Imposto la pianificazione',
      delete_schedule: 'Fermo la pianificazione',
      list_schedules: 'Leggo le pianificazioni',
      create_event: 'Aggiungo un evento',
      delete_event: 'Elimino l’evento',
      list_events: 'Controllo il calendario',
      update_event: 'Modifico l’evento',
      list_subscriptions: 'Leggo le iscrizioni',
      approve_action: 'Eseguo',
      archive_thread: 'Archivio',
      get_reading: 'Lettura delle newsletter',
      get_wrapped: 'Conto la tua posta',
      clear_out: 'Pulizia della posta in arrivo',
      preview_clear_out: 'Lettura di tutta la posta in arrivo',
      undo_clear_out: 'Le email tolte tornano indietro',
      create_rule: 'Aggiungo una regola',
      dismiss_action: 'Salto',
      draft_reply: 'Scrivo una risposta',
      create_draft: 'Salvo una bozza',
      get_board: 'Leggo la bacheca',
      get_person: 'Cerco la persona',
      get_today: 'Controllo oggi',
      handle_thread: 'Affido la conversazione',
      list_boards: 'Apro le bacheche',
      list_handled: 'Controllo ciò che è stato gestito',
      list_mail: 'Cerco nella posta',
      list_rules: 'Leggo le regole',
      read_thread: 'Leggo la conversazione',
      redraft_action: 'Riscrivo la bozza',
      refresh: 'Controllo la nuova posta',
      send_email: 'Invio',
      snooze_thread: 'Posticipo',
      unsubscribe: 'Annullo l’iscrizione',
      tidy_mail: 'Riordino',
      trash_thread: 'Sposto nel cestino',
      report_spam: 'Segnalo come spam',
      mark_not_spam: 'Tolgo dallo spam',
      move_to_inbox: 'Sposto nella posta in arrivo',
      create_board: 'Creo una bacheca',
      update_board: 'Modifico la bacheca',
      delete_board: 'Elimino la bacheca',
      add_board_chart: 'Aggiungo un grafico',
      add_to_board: 'Lo metto in bacheca',
      edit_board_entry: 'Correggo la voce',
      remove_board_entry: 'Lo tolgo dalla bacheca',
      rename_board_group: 'Rinomino il gruppo',
    },
    stop: 'Ferma',
    thinking: 'Sto pensando…',
    to: (recipients: string) => `A ${recipients}`,
    until: (time: string) => `Fino a ${time}`,
    yes: {
      create_schedule: 'Pianifica',
      create_event: 'Aggiungi',
      delete_event: 'Elimina',
      update_event: 'Salva',
      approve_action: 'Esegui',
      archive_thread: 'Archivia',
      clear_out: 'Fai pulizia',
      undo_clear_out: 'Riporta',
      create_rule: 'Aggiungi',
      handle_thread: 'Affida',
      reply: 'Invia',
      send_email: 'Invia',
      snooze_thread: 'Posticipa',
      unsubscribe: 'Annulla iscrizione',
      tidy_mail: 'Riordina',
      trash_thread: 'Nel cestino',
      report_spam: 'Segnala spam',
      mark_not_spam: 'Non è spam',
      move_to_inbox: 'Riporta',
    },
  },
  ask: {
    label: (question: string) => `Chiedi a Fewmail: «${question}»`,
    openChat: 'Apri nella chat',
    thinking: 'Sto cercando nella tua posta…',
  },
  compose: {
    backInQueue: 'Annullato. La bozza è di nuovo in Home.',
    canceled: 'Annullato. La tua email è di nuovo nell’editor.',
    cc: 'Cc',
    discard: 'Elimina',
    draftSaved: 'Bozza salvata',
    forward: 'Inoltra',
    forwardedMessage: 'Messaggio inoltrato',
    from: 'Da',
    instructionPlaceholder: 'Che tono deve avere? (facoltativo)',
    invalidRecipients: 'Aggiungi almeno un indirizzo email valido.',
    later: {
      inHour: 'Tra un’ora',
      monday: 'Lunedì mattina',
      pick: 'Scegli data e ora',
      schedule: 'Programma',
      time: 'Ora',
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
  site: {
    chapters: {
      pricing: {
        description:
          'Smistamento, regole e protezione sono gratis per sempre. Pro e Max aggiungono tutto ciò che legge e scrive per te; Max semplicemente ne fa di più.',
        label: 'Prezzi',
        title: (usd: number) =>
          `Lo smistamento è gratis. L’agente, da $${usd}.`,
      },
      questions: {
        description:
          'Le risposte brevi. Quelle lunghe sono nell’informativa sulla privacy.',
        label: 'Domande',
        title: 'Prima di collegare Gmail.',
      },
    },
    closing: {
      lead: 'Collega Gmail in un minuto. Fewmail parte dalla posta degli ultimi tre giorni, così le prime decisioni ti aspettano subito.',
      title: 'Riprenditi le mattine.',
    },
    mcp: {
      answer:
        'Il contratto firmato, prima del kickoff di venerdì. Una risposta è già pronta e ti aspetta nella tua coda di Fewmail.',
      clients: 'Funziona con',
      emphasis: 'Claude e ChatGPT.',
      free: 'Leggere la posta e lo smistamento dell’agente sono gratis.',
      label: 'MCP',
      lead: 'Collega Fewmail come server MCP e chiedi della tua posta all’assistente che usi già. Tutto ciò che invia un’email o cambia Gmail chiede comunque il tuo sì.',
      question: 'Di cosa ha bisogno Anna da me questa settimana?',
      setup: 'Collegalo in un minuto',
      title: 'La tua posta, dentro Claude e ChatGPT.',
    },
    mcpPage: {
      copy: 'Copia URL',
      lead: 'Collega Fewmail come server MCP e chiedi della tua posta dall’IA che usi già. Leggere la posta e lo smistamento dell’agente sono gratis; bozze, invii e regole arrivano con Pro.',
      safety:
        'Tutto ciò che invia un’email o cambia Gmail chiede prima il tuo sì. La tua posta non addestra mai modelli e puoi scollegare qualsiasi app nelle impostazioni.',
      steps: {
        chatgpt:
          'In Settings aggiungi un connettore (app) con questo URL, poi accedi a Fewmail.',
        claude:
          'In Settings → Connectors aggiungi un connettore personalizzato con questo URL, poi accedi a Fewmail.',
        code: 'Esegui questo una volta nel terminale, poi accedi a Fewmail quando Claude Code lo chiede.',
        cursor:
          'Aggiungi questo al tuo mcp.json, poi accedi a Fewmail quando Cursor lo chiede.',
      },
      title: 'Fewmail dentro Claude, ChatGPT e i tuoi strumenti.',
    },
    comparePage: {
      lead: 'I client di posta ti rendono più veloce a leggere ogni email. I filtri spostano la posta nelle cartelle. Fewmail è un agente: legge la posta, decide cosa può aspettare e ti chiede solo del resto.',
      title: 'Fewmail a confronto.',
    },
    comparison: {
      custom: 'Su misura',
      features: 'Funzione per funzione',
      groups: {
        agent: 'Leggere e rispondere',
        day: 'La tua giornata',
        reach: 'Dove funziona',
        safety: 'Protezione',
      },
      labels: {
        ask: 'Chiedi qualsiasi cosa alla tua posta',
        home: 'Ciò che ha bisogno di te, in una sola pagina',
        calendar: 'Calendario',
        drafts: 'Risposte scritte per te',
        followUps: 'Promemoria per i solleciti',
        gmail: 'Gmail e Google Workspace',
        handOver: 'Affidare una conversazione',
        importance: 'Ordinata per importanza',
        keepApp: 'Tieni la tua app di posta',
        mcp: 'MCP per i tuoi strumenti',
        memory: 'Ricorda promesse e persone',
        otherProviders: 'iCloud, Yahoo e altra posta IMAP',
        outlook: 'Outlook e Microsoft 365',
        phishing: 'Avvisi di phishing e di cambio coordinate di pagamento',
        phone: 'Sul telefono',
        rules: 'Regole a parole semplici',
        snooze: 'Posticipa',
        spamShield: 'Scudo antispam della community',
        summaries: 'Riassunti delle email',
        teams: 'Casella del team',
        unsubscribe: 'Disiscrizione con un clic',
      },
      more: 'Altri confronti',
      no: 'No',
      noFreePlan: 'Nessun piano gratuito',
      ours: {
        ask: 'Con Pro',
        home: 'In tempo reale, approvazione in blocco, con Pro',
        drafts: 'Con la tua voce, inviate solo quando approvi, con Pro',
        followUps: 'Automatici, sulle email che attendono risposta',
        handOver: 'L’agente la porta al suo obiettivo, con Pro',
        importance: 'Ogni email valutata, gratis',
        keepApp: 'Tutto compare in Gmail',
        mcp: 'Con Pro',
        memory: 'Con Pro',
        phone: 'Telegram e WhatsApp, anche a voce, con Pro',
        rules: 'Archivia, segna come letta o disiscriviti, gratis',
        summaries: 'Con Pro',
        unsubscribe: 'Chi la ignora finisce nello spam',
      },
      plans: 'Piani e prezzi',
      read: 'Leggi il confronto',
      source: (name: string, date: string) =>
        `I dati su ${name} provengono dal suo sito pubblico, consultato a ${date}. Prezzi e funzioni cambiano; controlla il loro sito per l’offerta attuale.`,
      title: (name: string) => `Fewmail vs ${name}`,
      tryFree: 'Prova Fewmail gratis',
      which: 'Quale fa per te?',
      yes: 'Sì',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 caselle e tutte le funzioni, AI Bundle incluso',
          lunch: '2 caselle, posticipo e promemoria',
          snack: '1 casella e filtri di base',
        },
        summary:
          'SaneBox smista la posta nelle cartelle e, nel piano più alto, scrive bozze e riassunti. Fewmail legge prima tutto e raccoglie in una sola pagina le poche decisioni che spettano solo a te.',
        them: {
          home: 'Un riepilogo quotidiano della posta filtrata',
          drafts: 'SaneDrafts, con Dinner',
          followUps: 'SaneNoReplies',
          importance: 'La posta meno importante va in SaneLater',
          keepApp: 'Funziona tramite cartelle',
          otherProviders: 'Qualsiasi server IMAP o Exchange',
          phone: 'Tramite la tua app di posta',
          rules: 'Si addestra spostando la posta tra le cartelle',
          snooze: 'Da Lunch',
          summaries: 'SaneSummary, con Dinner',
          unsubscribe: 'Cartella SaneBlackHole',
        },
        verdict:
          'Scegli SaneBox se la tua posta è fuori da Gmail e ti bastano le cartelle. Scegli Fewmail se usi Gmail e vuoi che la posta importante venga letta, riassunta e gestita.',
      },
      shortwave: {
        plans: {
          business: 'Per utente',
          free: 'Quasi tutte le funzioni e l’assistente',
          max: 'Per utente, i modelli più potenti',
          premier: 'Per utente, modelli più potenti',
          pro: 'Cronologia completa, ricerca e scrittura con AI',
        },
        summary:
          'Shortwave è un client di posta con un assistente AI con cui parli. Fewmail è un agente che legge per primo e ti chiede solo ciò che non può decidere.',
        them: {
          ask: 'Assistente AI e ricerca',
          drafts: 'Quando lo chiedi',
          importance: 'Split e raggruppamenti',
          keepApp: 'Sostituisce la tua app di posta',
          memory: 'Memoria AI',
          otherProviders: 'Inoltrata in Gmail',
          outlook: 'Microsoft 365 non supportato',
          phone: 'App per iOS e Android',
          rules: 'Filtri AI, da 3 a 50 secondo il piano',
          summaries: 'In cima a ogni email',
          teams: 'Conversazioni e commenti condivisi',
          unsubscribe: 'Con blocco in un clic',
        },
        verdict:
          'Scegli Shortwave se vuoi una nuova casella con un assistente in chat. Scegli Fewmail se vuoi guardare meno email, nel Gmail che usi già.',
      },
      superhuman: {
        plans: {
          business:
            'Per membro, $33 con fatturazione annuale. Aggiunge Auto Drafts e Ask AI',
          enterprise: 'SSO e controlli di amministrazione',
          starter: 'Per membro, $25 con fatturazione annuale',
        },
        summary:
          'Superhuman ti rende più veloce a passare in rassegna ogni email. Fewmail le passa in rassegna per te e ti mostra solo ciò che richiede te.',
        them: {
          ask: 'Ask AI, con Business',
          drafts: 'Auto Drafts, con Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox e Auto Labels',
          keepApp: 'Sostituisce la tua app di posta',
          mcp: 'Con Business',
          phone: 'App per iOS e Android',
          rules: 'Custom Auto Labels, con Business',
          spamShield: 'Il filtro del tuo provider',
          summaries: 'Auto Summarize',
          teams: 'Bozze e commenti condivisi',
        },
        verdict:
          'Scegli Superhuman se vuoi toccare ogni email da solo, più in fretta. Scegli Fewmail se preferisci non vederne la maggior parte.',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'No. Fewmail funziona sopra Gmail. Tutto ciò che fa compare anche in Gmail, e puoi continuare a usare qualsiasi app Gmail insieme a lui.',
        question: 'Devo lasciare Gmail?',
      },
      {
        answer:
          'Mai senza di te. Le risposte aspettano nella tua coda finché non le approvi, e solo le regole che hai creato o tenuto possono archiviare, segnare come letto o disiscriverti da sole. Tutto ciò che ha fatto è elencato in Gestite.',
        question: 'Può inviare o eliminare email da solo?',
      },
      {
        answer:
          'Oggetti, testi, riepiloghi e bozze sono cifrati nel nostro database. La tua posta non viene mai usata per addestrare modelli, e lo scudo antispam condivide tra gli utenti solo hash con chiave, mai indirizzi o contenuti.',
        question: 'Cosa succede alla mia posta?',
      },
      {
        answer: `Ogni nuovo account riceve ${trialDays} giorni di Pro, senza carta. Alla fine resti semplicemente su Gratis: non si cancella nulla e non si addebita nulla.`,
        question: 'Cosa succede dopo la prova?',
      },
      {
        answer:
          'Le bozze sono scritte nella lingua dell’email a cui rispondi. L’app, i riassunti e il bot Telegram parlano la lingua che scegli, tra quindici.',
        question: 'Quali lingue parla?',
      },
      {
        answer:
          'Per ora account Gmail e Google Workspace. Aggiungi più caselle a un solo Fewmail e la loro posta arriva nella stessa Home e nella stessa casella.',
        question: 'Quali account email funzionano?',
      },
    ],
    features: {
      description:
        'Le parti della posta che prima ti rubavano un pomeriggio, fatte in background ed elencate dove puoi controllarle.',
      items: {
        ask: {
          description:
            'Chiedi qualsiasi cosa a parole tue e ottieni la risposta dalla tua posta, con le email da cui proviene.',
          title: 'Chiedi alla tua posta',
        },
        boards: {
          description:
            'Soldi, abbonamenti a pagamento, viaggi, ordini: descrivi cosa tenere d’occhio e l’agente lo raccoglie da fino a un anno di posta, con grafici.',
          title: 'Bacheche',
        },
        calendar: {
          description:
            'Il calendario di ogni casella in un’unica vista. Una riunione proposta in un’email diventa un evento appena dici sì.',
          title: 'Calendario',
        },
        clearOut: {
          description:
            'Tutto l’arretrato via in un colpo, fino a 50.000 email per casella, tutte sotto un’unica etichetta, così con «Riporta tutto» tornano tutte indietro. Gratis.',
          title: 'Fai pulizia',
        },
        forward: {
          description:
            'Inoltra un’email con una nota in cima, «trova un momento con loro la settimana prossima», e l’agente pensa al resto.',
          title: 'Inoltra all’agente',
        },
        handle: {
          description:
            'Affida un thread con un obiettivo e l’agente lo porta fino in fondo, chiedendo prima di ogni invio.',
          title: 'Occupatene tu',
        },
        reading: {
          description:
            'Le newsletter del giorno in un’unica lista tranquilla, ognuna riassunta in poche frasi.',
          title: 'Lettura',
        },
        voice: {
          description:
            'Premi Ascolta in Home e senti ciò che ha bisogno di te. Parla con l’agente nell’app, su Telegram o su WhatsApp e ti risponde a voce.',
          title: 'Ascolta ciò che ha bisogno di te',
        },
        wrapped: {
          description:
            'Il tuo mese o il tuo anno in email: cosa è arrivato, cosa è stato gestito, quanto tempo hai recuperato. Da condividere, mai con un nome.',
          title: 'Il tuo anno in email',
        },
      },
      label: 'E il resto',
      title: 'Tutto il resto che farebbe un assistente.',
    },
    footer: {
      legal: 'Note legali',
      product: 'Prodotto',
      tagline:
        'L’agente email che legge il tuo Gmail e ti mostra solo ciò che richiede te.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'non avrai più.',
      label: 'Cosa sparisce',
      rows: [
        {
          fix: 'Fai pulizia toglie tutto l’arretrato in un colpo: vecchie pubblicità, notifiche lette, liste che non apri mai. Con un solo «Riporta tutto» ogni email torna indietro.',
          problem: 'Migliaia di email che nessuno leggerà mai.',
        },
        {
          fix: 'Le risposte sono scritte in anticipo, con la tua voce e nella loro lingua. Quelle simili si approvano insieme con ⇧⏎, e puoi comunque controllarle una per una.',
          problem: 'Rispondere alle email a mezzanotte.',
        },
        {
          fix: 'Un tasto ti disiscrive come farebbe una persona: un clic, la pagina di disiscrizione o un’email. Chi continua a scrivere finisce dritto nello spam.',
          problem: 'Newsletter a cui non ti sei mai iscritto.',
        },
        {
          fix: 'Lettura raccoglie le newsletter del giorno in un’unica lista, ognuna riassunta in poche frasi.',
          problem: 'Newsletter che volevi leggere.',
        },
        {
          fix: 'Coordinate di pagamento cambiate, domini che ne imitano altri e phishing noto fanno scattare un avviso prima che tu agisca.',
          problem: 'Una fattura con nuove coordinate bancarie.',
        },
        {
          fix: 'Le promesse che fai nella posta inviata tornano da te quando scadono, e i thread senza risposta ricevono un sollecito.',
          problem: 'Quella cosa che avevi promesso e poi dimenticato.',
        },
        {
          fix: 'Solo la posta urgente ti raggiunge su Telegram o WhatsApp. Il resto ti aspetta in Home, già in ordine, per quando vuoi guardarlo.',
          problem: 'Controllare la posta a cena, per sicurezza.',
        },
      ],
      title: 'I problemi di posta che non avrai più.',
    },
    hero: {
      needs: {
        emphasis: 'hanno bisogno di te.',
        lead: (handled: string) =>
          `Anna aspetta il contratto, la fattura di Northwind scade la settimana prossima e Marco vuole giovedì. ${handled} newsletter e notifiche sono state gestite, e Home si aggiorna da sola appena arriva nuova posta.`,
        tag: 'Home · giovedì, 08:12',
        title: 'Tre cose hanno bisogno di te.',
      },
      fates: {
        archived: 'Archiviata',
        markedRead: 'Segnata come letta',
        spam: 'Spam',
        summarised: 'Riassunta',
        unsubscribed: 'Disiscrizione',
      },
      handled: ((slots) => [
        slots.count,
        ' gestite, ognuna con il suo motivo',
      ]) as Rich<'count'>,
      inbox: 'Posta in arrivo',
      lead: 'Newsletter, ricevute, notifiche, un link di phishing e, da qualche parte lì in mezzo, le tre email che contano davvero. Fewmail è l’agente che le legge tutte per te.',
      needYou: ((slots) => [
        slots.count,
        ' hanno bisogno di te',
      ]) as Rich<'count'>,
      queue: [
        {
          reason: 'Contratto entro domani',
          summary: 'Serve il contratto firmato prima del kickoff di venerdì.',
        },
        {
          reason: 'Fattura · $1,240 entro il 20 nov',
          summary:
            'Fattura di ottobre per il restyling del sito. Stesse coordinate bancarie dell’ultima volta.',
        },
        {
          reason: 'Riunione proposta',
          summary:
            'Propone giovedì alle 15:00. Sei libero solo dalle 16:00, quindi la bozza chiede quell’orario.',
        },
      ],
      reading: {
        emphasis: 'le legge tutte.',
        lead: 'Archivia il rumore, ti disiscrive da ciò che non apri mai e ferma la truffa alla porta. Ogni cosa che fa viene annotata con il motivo, così puoi controllarla.',
        title: 'Fewmail le legge tutte.',
      },
      remind: 'Ricordamelo il 19 nov',
      remindPlan: 'La aggiunge alle tue bollette e te la ricorda il 19 nov.',
      start: 'Inizia gratis con Google',
      title: 'La posta non è il tuo lavoro.',
      home: 'Home',
      tryQueue: 'Prova la coda',
      unread: ((slots) => [slots.count, ' non lette']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' non lette nella posta in arrivo',
      ]) as Rich<'count'>,
      willDo: 'Cosa farà Fewmail',
    },
    nav: {
      compare: 'Confronto',
      features: 'Funzioni',
      mcp: 'Server MCP',
      pricing: 'Prezzi',
      signIn: 'Accedi',
    },
    play: {
      again: 'Svuotala di nuovo',
      doneLead: (handled: string) =>
        `Hai preso tre decisioni. Fewmail si è occupato delle altre ${handled} e ha annotato il perché.`,
      doneTitle: 'Per oggi è tutto.',
      emphasis: 'in due minuti.',
      handled: [
        'Lumen Weekly: non hai aperto nessuno degli ultimi 30 numeri',
        'paypa1-billing.com imita paypal.com',
        'Parcelhub: avvisi di consegna, con la regola «Ricevute e spedizioni»',
      ],
      handledTitle: 'Gestite mentre dormivi',
      label: 'Provalo',
      lead: 'Ecco com’è una mattina adesso. Le bozze sono scritte, i motivi sono spiegati, decidi tu. Dai, svuotala.',
      left: (count: number) => `${count} da decidere`,
      title: 'Tutta la tua posta, in due minuti.',
    },
    plans: {
      everythingIn: (plan: string) => `Tutto di ${plan}, in più`,
      forever: 'per sempre',
      free: {
        description: 'Smistamento, regole e protezione. Per sempre.',
        features: [
          'Ogni email smistata e valutata per importanza',
          'Regole a parole semplici che archiviano, segnano come lette o disiscrivono',
          'Scudo antispam della community e avvisi di phishing',
          'Mittenti zombie scovati dopo la disiscrizione',
          'Solleciti automatici sulla posta che attende risposta',
          'Posticipa, snippet ed etichette Fewmail in Gmail',
        ],
      },
      max: {
        description: 'Lo stesso agente per una casella piena.',
        emails: (emails: string) => `${emails} email lette al mese`,
        messages: (messages: number) =>
          `${messages} messaggi all’agente al mese`,
        unlimited: 'Bacheche e thread affidati senza limiti',
      },
      monthly: 'Mensile',
      per: { month: 'al mese', year: 'all’anno' },
      pro: {
        description: 'L’agente completo: legge, scrive e ricorda.',
        features: [
          'Home: una sola coda di decisioni in tempo reale, da approvare una alla volta o in blocco',
          'Risposte scritte con la tua voce, inviate solo quando approvi',
          'Telegram: la posta urgente, le approvazioni e le istruzioni vocali',
          '«Occupatene tu»: l’agente porta un thread al suo obiettivo',
          'Promesse e persone ricordate, bacheche con grafici per i soldi o qualsiasi cosa tu segua',
          'Chiedi qualsiasi cosa alla tua posta, più MCP per i tuoi strumenti',
        ],
        limits: (emails: string, messages: number) =>
          `${emails} email lette e ${messages} messaggi all’agente al mese; il rumore non conta mai`,
      },
      tryFree: (days: number) => `Prova gratis per ${days} giorni`,
      yearly: 'Annuale · 2 mesi gratis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Smistamento, regole a parole semplici e protezione sono gratis per sempre. Pro è l’agente che legge, scrive e ricorda per te; Max è lo stesso agente con spazio per una casella piena. Ogni account parte con ${trialDays} giorni di Pro, e alla fine resti semplicemente su Gratis.`,
      otherTool: 'Stai valutando un altro strumento?',
      title: 'Paghi l’agente, non la casella.',
    },
    startFree: 'Inizia gratis',
    trialNote: (days: number) =>
      `${days} giorni di Pro, senza carta. Poi gratis per tutto il tempo che vuoi.`,
    trust: {
      emphasis: 'Chiede',
      label: 'La tua posta, la tua parola',
      places: 'Funziona sopra il Gmail che usi già, e ti raggiunge su',
      title: 'Chiede prima di agire.',
      vows: [
        {
          description:
            'Le bozze ti aspettano. Solo le regole che hai creato o tenuto possono archiviare, segnare come letto o disiscriverti da sole, e tutto ciò che hanno fatto è elencato in Gestite.',
          title: 'Non parte nulla senza il tuo sì.',
        },
        {
          description:
            'Oggetti, testi, riepiloghi e bozze sono cifrati nel nostro database. Le bozze salvate restano in Gmail, mai da noi.',
          title: 'Cifrata a riposo.',
        },
        {
          description:
            'Lo scudo antispam impara da tutti tramite hash con chiave. Non si condivide un solo indirizzo né una parola della tua posta.',
          title: 'Mai usata per addestrare modelli.',
        },
      ],
    },
  },
  skills: {
    bills: 'Bollette e pagamenti in scadenza',
    cancel: 'Disdire un abbonamento a pagamento',
    cleanup: 'Newsletter da sfoltire',
    followups: 'Chi ti deve una risposta',
    reading: 'Le newsletter del giorno in un unico riassunto',
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
    pending: 'in attesa in Home',
  },
  byRule: 'da una regola',
  calendar: {
    tomorrow: 'Domani',
    noAccess: {
      allow: 'Consenti accesso',
      description:
        'Google non ha il permesso di condividere il tuo calendario con Fewmail. Consentilo per vedere e aggiungere eventi qui.',
      title: 'Calendario non collegato',
    },
    allDay: 'Tutto il giorno',
    calendar: 'Calendario',
    create: 'Aggiungi evento',
    delete: 'Elimina',
    deleted: 'Evento eliminato',
    description: 'Descrizione',
    editEvent: 'Modifica evento',
    endBeforeStart: 'L’evento finisce prima di iniziare',
    ends: 'Fine',
    location: 'Luogo',
    newEvent: 'Nuovo evento',
    next: 'Successivo',
    openInGoogle: 'Apri in Google Calendar',
    previous: 'Precedente',
    save: 'Salva',
    saved: 'Evento salvato',
    starts: 'Inizio',
    title: 'Calendario',
    titlePlaceholder: 'Aggiungi un titolo',
    today: 'Oggi',
    untitled: '(Senza titolo)',
    views: {
      day: 'Giorno',
      week: 'Settimana',
      month: 'Mese',
      year: 'Anno',
    },
  },
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
    goTo: 'Vai a',
    mail: 'Posta',
    nothingMatches: 'Nessun risultato.',
    placeholder: 'Chiedi della tua posta o esegui un comando…',
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
  errors: {
    calendarAccess:
      'Fewmail non ha accesso a questo calendario. Consentilo dalla pagina Calendario.',
    failed: 'Qualcosa è andato storto. Riprova.',
    needsPro: 'Serve Fewmail Pro.',
    alreadySent: 'Già inviata: è tardi per annullare.',
    notFound: 'Non esiste più: forse è stato eliminato.',
    offline: 'Impossibile raggiungere Fewmail. Controlla la connessione.',
  },
  update: {
    available: 'È disponibile una nuova versione di Fewmail.',
    reload: 'Ricarica',
  },
  keys: {
    askAgent: 'chiedi all’agente',
    fromSender: 'altro dal mittente',
    approvePicked: (n: number) => `approva ${n} selezionati`,
    pick: 'seleziona',
    pickAll: 'seleziona tutto',
    unpick: 'annulla selezione',
    pin: 'fissa',
    unpin: 'sblocca',
    copyCode: 'copia codice',
    restore: 'nella posta in arrivo',
    calendarToday: 'oggi',
    newEvent: 'nuovo evento',
    period: 'precedente / successivo',
    view: 'vista',
    skills: 'skill',
    unsubscribe: 'disiscriviti',
    filter: 'filtro',
    reply: 'rispondi',
    snooze: 'posticipa',
    trash: 'cestino',
    ask: 'chiedi a riguardo',
    archive: 'archivia',
    approve: 'approva',
    approveAll: (n: number) => `approva tutte le ${n} di questo tipo`,
    close: 'chiudi',
    draftReply: 'bozza',
    edit: 'modifica',
    move: 'sposta',
    open: 'apri',
    notOnBoard: 'non è di questa bacheca',
    rename: 'rinomina',
    clearFilter: 'azzera filtro',
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
  notices: {
    freeUpSpace: 'Libera spazio',
    mailLost:
      'Fewmail ha perso l’accesso al tuo Gmail e non legge la posta nuova.',
    mailboxLost: (email: string) => `Fewmail ha perso l’accesso a ${email}.`,
    reconnect: 'Ricollega',
    sendLimit: (email: string, when: string) =>
      `${email} ha raggiunto il limite giornaliero di invio di Gmail. Potrai inviare di nuovo ${when}.`,
    signInAgain: 'Accedi di nuovo',
    storageFull: (email: string) =>
      `${email} ha finito lo spazio Google, quindi Gmail rifiuta le nuove email.`,
    storageFullHint:
      'Libera spazio o prendi più archiviazione per ricevere di nuovo la posta.',
  },
  login: {
    needsGmail:
      'Fewmail ha bisogno del tuo Gmail. Accedi di nuovo e lascia spuntata la casella Gmail nella schermata di Google.',
    agree: ((slots) => [
      'Continuando accetti i ',
      slots.terms,
      ' e l’',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail chiede di leggere, organizzare e inviare Gmail per te. Niente viene inviato né archiviato senza il tuo ok, a meno che tu non scriva una regola che lo consenta. Chiede anche il tuo Google Calendar, che puoi deselezionare.',
    continue: 'Continua con Google',
    lead: 'Fewmail legge la posta per te, risponde con la tua voce e ti mostra solo ciò che ha davvero bisogno di te.',
    messengers:
      'Funziona anche nelle app di messaggistica, a partire da Telegram: ricevi la posta urgente, approva le risposte o invia semplicemente un vocale.',
    title: 'Solo ciò che conta.',
  },
  mail: {
    pin: 'Fissa in alto',
    unpin: 'Togli dai fissati',
    pinned: 'Fissati',
    showAll: (n: number) => `Mostra tutti e ${n}`,
    showFewer: 'Mostra meno',
    oneTimeCode: {
      archive: 'Copia e archivia',
      copied: 'Codice copiato',
      copy: 'Copia codice',
      trash: 'Copia ed elimina',
    },
    openUnsubscribePage: 'Apri pagina',
    unsubscribeYourself:
      'Per lasciare questa lista devi finire sulla sua pagina. Intanto la sua posta è archiviata.',
    allMailboxes: 'Tutte le caselle',
    filterAbout: {
      focused: 'Prima l’importante e le persone, avvisi raccolti',
      unread: 'Ciò che non hai ancora letto, per tipo',
      inbox: 'Tutto, dal più recente',
    },
    find: {
      back: 'Torna alla posta',
      open: 'Cerca',
      recent: 'Ricerche recenti',
      tips: 'Suggerimenti',
      clearRecent: 'Cancella',
      describeExample: 'fatture di Anna del mese scorso',
      searching: 'Cerco nella tua posta…',
      tip: {
        from: 'Email da Anna',
        subject: 'L’oggetto cita “invoice”',
        attachment: 'Con allegati',
        pdf: 'Con un PDF allegato',
        unread: 'Conversazioni non lette',
        week: 'Degli ultimi 7 giorni',
        describe: 'Oppure descrivilo a parole tue',
      },
    },
    group: {
      read: 'Letti',
      earlier: 'Precedenti',
      important: 'Importanti',
      people: 'Persone',
      plans: 'Calendario e viaggi',
      money: 'Soldi',
      updates: 'Notifiche',
      newsletters: 'Newsletter',
      promotions: 'Promozioni',
    },
    unread: 'Non letto',
    block: 'Blocca mittente',
    blocked: 'Bloccato. Le sue email ora finiscono nel cestino.',
    forward: 'Inoltra',
    more: 'Altro',
    close: 'Chiudi',
    reply: 'Rispondi',
    trash: 'Sposta nel cestino',
    trashed: 'Spostata nel cestino',
    moveToInbox: 'Nella posta in arrivo',
    backInInbox: 'Spostato nella posta in arrivo',
    movedToInbox:
      'Riportata nella posta in arrivo. Grazie per la segnalazione.',
    noThread: 'Scegli un’email per leggerla qui',
    deleteDraft: 'Elimina bozza',
    notSent: 'Non inviata: apri per riprovare',
    noRecipients: 'Nessun destinatario',
    notSpam: 'Non è spam',
    reportSpam: 'Segnala come spam',
    reportedSpam: 'Segnalato. Le sue email ora finiscono nello spam.',
    archive: 'Archivia',
    archived: 'Archiviata',
    attachment: 'allegato',
    draftReply: 'Scrivi bozza',
    drafting: 'Scrivo…',
    draftWaiting: 'La bozza ti aspetta in Home',
    due: (date: string) => `scade il ${date}`,
    dueHint: 'Scadenza trovata dall’agente in questa email',
    empty: 'Nessuna email qui',
    emptyHint: 'Le nuove email compariranno qui appena arrivano.',
    noResults: 'Nessun risultato',
    noResultsHint: 'Prova altre parole o un’altra cartella.',
    expectsReply: 'Attende risposta',
    filter: {
      archive: 'Archivio',
      trash: 'Cestino',
      drafts: 'Bozze',
      spam: 'Spam',
      inbox: 'In arrivo',
      snoozed: 'Posticipate',
      focused: 'In primo piano',
      unread: 'Non letti',
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
    folders: 'Cartelle',
    calendar: 'Calendario',
    subscriptions: 'Iscrizioni',
    boards: 'Bacheche',
    newBoard: 'Nuova bacheca',
    mail: 'Posta',
    reading: 'Lettura',
    rules: 'Regole',
    search: 'Cerca o chiedi…',
    settings: 'Impostazioni',
    syncFailed: 'Sincronizzazione Gmail non riuscita, riprovo',
    syncing: 'Leggo la tua posta…',
    home: 'Home',
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
    awaitsAnswer:
      'Ho saltato questa esecuzione: la precedente aspetta ancora la tua risposta in questa chat.',
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
      `Pagine che l’agente riempie con la tua posta, a partire dagli ultimi tre mesi. Scegline fino a ${max}; le tue puoi aggiungerle dopo.`,
    boardsTitle: 'Cosa deve raccogliere l’agente per te?',
    languageHint:
      'App, riepiloghi e spiegazioni usano questa lingua. Le risposte seguono sempre la lingua dell’email a cui rispondi.',
    languageTitle: 'In che lingua deve parlare Fewmail?',
    lead: 'Due risposte veloci. Puoi cambiare tutto più tardi nelle Impostazioni.',
    reading: 'Leggo la tua posta…',
    start: 'Inizia',
    title: 'Configuriamo il tuo agente.',
  },
  plan: {
    free: 'Gratis',
    freeDescription:
      'Email veloce e tranquilla con regole semplici. Gratis per tutto il tempo che vuoi.',
    includes:
      'Pro aggiunge l’agente: ogni email letta e riassunta, risposte scritte con la tua voce, regole a parole semplici, Telegram e MCP.',
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
  queue: {
    approve: 'Approva',
    delete: 'Elimina',
    pick: 'Seleziona',
    picked: (n: number) => `${n} selezionati`,
    unpick: 'Deseleziona',
    askedByYou: 'Richiesto da te',
    draftedInVoice: 'Scritto con la tua voce',
    edit: 'Modifica',
    open: 'Apri',
    send: 'Invia',
    shorter: 'Più breve',
    shorterInstruction: 'Rendila più breve.',
    skip: 'Salta',
  },
  rules: {
    deleted: 'Regola eliminata',
    add: 'Aggiungi regola',
    count: (total: number) =>
      plural('it', total, {
        one: () => '1 regola',
        other: (n) => `${n} regole`,
      }),
    delete: 'Elimina',
    describe: {
      alwaysShow: 'Arriva sempre in Home',
      autonomous: 'Fatto in autonomia, elencato tra le gestite',
      draft: 'Una bozza ti aspetta in Home',
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
    lead: 'Di’ all’agente a parole tue cosa fare con certe email. Confronta ogni email con queste regole.',
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
    readingDigest: {
      description:
        'Ogni mattina, le newsletter dell’ultimo giorno arrivano su Telegram e WhatsApp in un solo messaggio.',
      title: 'Riepilogo newsletter',
    },
    forward: {
      copy: 'Copia indirizzo',
      description:
        'Invia o inoltra qualsiasi email a questo indirizzo dalla tua casella, con una nota in alto su cosa fare. La risposta arriva su Telegram o WhatsApp e in una chat qui.',
      title: 'Inoltra all’agente',
    },
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
    morningDescription: (timezone: string) =>
      `Riepilogo delle newsletter e report settimanale del lunedì, nel tuo fuso orario, ${timezone}`,
    morningTitle: 'Messaggi del mattino',
    deleteAccount: 'Elimina account',
    deleteConfirm: 'Elimina tutto',
    deleteDescription:
      'Elimina subito da Fewmail il tuo account, la posta sincronizzata, le bozze e le regole. Il tuo Gmail non viene toccato.',
    deleteTitle: 'Eliminare il tuo account Fewmail?',
    cancel: 'Annulla',
    integrations: 'Integrazioni',
    language: 'Lingua',
    languageDescription: 'App, bot e riepiloghi. Le risposte seguono l’email.',
    legal: 'Note legali',
    mailboxes: {
      add: 'Aggiungi Gmail',
      addDescription:
        'La posta di un altro account Gmail arriva nella stessa Home e nella stessa casella. Non fa mai accedere nessuno qui: accedere con quell’account apre un Fewmail separato.',
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
      allow: 'Consenti',
      connected: (ago: string) => `Collegato ${ago}`,
      copy: 'Copia URL',
      defaultName: 'Client MCP',
      deny: 'Rifiuta',
      description:
        'Possono leggere la tua posta, scrivere bozze e inviarle dopo la tua conferma.',
      disconnect: 'Scollega',
      paste:
        'Aggiungi questo URL come connettore nella tua app, poi accedi a Fewmail.',
      request: (app: string) => `${app} vuole usare il tuo Fewmail`,
      title: 'Collega Claude, Cursor o qualsiasi client MCP',
    },
    signedInWithGoogle: 'Accesso con Google',
    signOut: 'Esci',
    notifications: {
      blocked:
        'Le notifiche sono bloccate. Consentile nelle impostazioni del sito del browser.',
      browser: 'Questo browser',
      notConfigured:
        'Le notifiche del browser non sono configurate su questo server.',
      off: 'Ricevi qui le email urgenti, anche con Fewmail chiuso.',
      on: 'Le email urgenti compaiono qui. Più insieme arrivano come una sola.',
      title: 'Notifiche',
      unsupported: 'Questo browser non può mostrare notifiche.',
    },
    telegram: {
      connect: 'Collega Telegram',
      disconnect: 'Scollega',
      linked:
        'La posta urgente arriva subito. Approva e modifica le bozze dalla chat.',
      notConfigured: 'Il bot Telegram non è configurato su questo server.',
      unlinked: 'Ricevi la posta urgente e approva le bozze da Telegram.',
    },
    whatsapp: {
      connect: 'Collega WhatsApp',
      disconnect: 'Scollega',
      linked:
        'La posta urgente arriva subito. Approva e modifica le bozze dalla chat.',
      notConfigured: 'Il bot WhatsApp non è configurato su questo server.',
      unlinked: 'Ricevi la posta urgente e approva le bozze da WhatsApp.',
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
    promotions: 'Promozioni, marketing ed email di vendita a freddo',
    receipts: 'Ricevute, conferme d’ordine e di spedizione',
  },
  telegram: {
    approveAlike: 'Approva insieme tutte le schede di un tipo:',
    heard: (text: string) => `Ho sentito: “${text}”`,
    voiceFailed: 'Non ho capito. Riprova o scrivilo.',
    help: 'Scrivi o di’ cosa ti serve:\n• chiedi della tua posta: «quando si rinnova Netflix?»\n• di’ cosa rispondere: «di’ ad Anna che firmo domani»\n• dammi un compito: «crea una bacheca per i viaggi»\n• rispondi a una mia bozza per cambiarla',
    canceled: 'Annullato. La bozza è di nuovo nella tua coda.',
    sendingIn: (seconds: number) => `Invio tra ${seconds} s`,
    undo: 'Annulla',
    commands: { queue: 'Cosa ti aspetta' },
    connectFirst: (url: string) =>
      `Ciao! Sono Fewmail. Qui su Telegram ti avviso quando arriva posta urgente, ti mostro cosa richiede te e invio le risposte che approvi.\n\nQuesta chat non è ancora collegata al tuo Fewmail. Ci vuole un minuto:\n1. Apri le impostazioni di Fewmail: ${url}\n2. In Integrazioni, tocca “Collega Telegram” (fa parte di Fewmail Pro).\n3. Telegram ti riporta qui: premi Avvia e sei a posto.`,
    connected:
      'Collegato. Ti avviserò quando arriva qualcosa di urgente.\n\n/queue: cosa ti aspetta',
    done: 'Fatto',
    draft: 'Bozza:',
    edit: 'Modifica',
    editPrompt:
      'Mandami il testo da usare al suo posto, o dimmi come cambiarlo iniziando con “/”, es. “/più formale”.',
    newDraft: 'Nuova bozza:',
    nothing: 'Al momento niente ti aspetta.',
    proOnly:
      'Telegram fa parte di Fewmail Pro. Apri Impostazioni → Piano in Fewmail per passare a Pro.',
    draftClipped:
      'Accorciata qui. «Invia» manda la bozza completa: leggila in Fewmail.',
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
    tidy: {
      archive: (n: number) => `${n} da archiviare`,
      details: 'Dettagli',
      done: (n: number) => `${n} riordinate`,
      keep: 'Tieni',
      mark_read: (n: number) => `${n} da segnare come lette`,
      run: 'Riordina',
      total: (n: number) => `Email tranquille da riordinare: ${n}`,
      unsubscribe: (n: number) => `${n} da cui disiscriversi`,
    },
    stopListening: 'Interrompi',
    awaiting: 'In attesa di risposta',
    hint: {
      notNow: 'Non ora',
      setUp: 'Configura',
      turnOn: 'Attiva',
    },
    dates: 'Date e riunioni',
    done: 'Fatto',
    firstRead:
      'Sto leggendo la posta degli ultimi tre giorni. Ciò che ha bisogno di te comparirà qui da solo.',
    approvedMany: (n: number) => `${n} approvate`,
    listen: 'Ascolta',
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
    period: (days: number) =>
      days === 1 ? 'nell’ultimo giorno' : `negli ultimi ${days} giorni`,
    pulse: {
      lists: (n: number) => `${n} da mailing list`,
      people: (n: number) => `${n} da persone`,
      total: (n: number, period: string) => `${n} email ${period}`,
    },
    saved: (minutes: number) =>
      `Questa settimana Fewmail ti ha fatto risparmiare circa ${formatMinutes('it', minutes)}`,
    savedHow: (handled: number, replies: number) =>
      `Gestite da solo: ${handled} · Risposte inviate dalle bozze: ${replies}`,
    recent: (period: string) => `Anche ${period}`,
    sent: 'Inviata',
    worthAttention: 'Merita attenzione',
  },
  boards: {
    addTo: 'Aggiungi a una bacheca',
    added: (board: string) => `Aggiunta a ${board}`,
    cancel: 'Annulla',
    chart: {
      add: 'Aggiungi grafico',
      ask: 'Descrivi il grafico',
      askPlaceholder: 'Spese per negozio, ordini per stato…',
      currency: 'Valuta',
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
      moveEarlier: 'Sposta prima',
      moveLater: 'Sposta dopo',
      other: 'Altro',
      remove: 'Rimuovi grafico',
      skipped: (n: number) =>
        `Non conteggiate: ${n} in un'altra valuta o senza importo`,
      title: 'Titolo del grafico',
      type: 'Tipo di grafico',
      types: {
        area: 'Area',
        bar: 'Barre',
        line: 'Linea',
        pie: 'Torta',
      },
      untitled: 'Nuovo grafico',
      weekOf: (date: string) => `Settimana dal ${date}`,
    },
    charts: 'Grafici',
    create: 'Crea bacheca',
    delete: 'Elimina bacheca',
    deleteConfirm: (name: string) => `Eliminare «${name}»?`,
    deleteHint:
      'Le sue voci e i suoi grafici vengono eliminati con lei. La tua posta resta dov’è.',
    describe: 'Cambia cosa raccoglie',
    description: 'Cosa raccoglie',
    descriptionPlaceholder:
      'Viaggi: voli, hotel e noleggi auto, con quanto sono costati',
    due: (when: string) => `In arrivo: ${when}`,
    empty:
      'Ancora vuota. Le email pertinenti compariranno qui appena arrivano.',
    entries: (total: number) =>
      plural('it', total, {
        one: () => 'Una voce',
        other: (n) => `${n} voci`,
      }),
    entry: {
      edited: 'Modificata da te',
      nextOn: (date: string) => `prossima: ${date}`,
      remove: 'Non è di questa bacheca',
      removed: 'Tolta dalla bacheca. Ne terrà conto.',
    },
    expected: (when: string) => `Previsto ${when}`,
    filter: {
      clear: 'Azzera filtro',
      nothing: 'Nessuna voce corrisponde.',
      search: 'Cerca nelle voci',
    },
    groups: {
      every: {
        month: 'ogni mese',
        quarter: 'ogni trimestre',
        week: 'ogni settimana',
        year: 'ogni anno',
      },
      expected: (date: string) => `previsto ${date}`,
      next: (date: string) => `prossimo: ${date}`,
      perMonth: (amount: string) => `${amount} / mese`,
      rename: 'Rinomina gruppo',
      renameHint: 'Dagli il nome di un altro gruppo per unirli.',
      showAll: (n: number) => `Mostra tutti (${n})`,
      showFewer: 'Mostra meno',
      title: 'Per chi o cosa',
    },
    history: {
      capped: (n: number) =>
        `Lette le ${n} email corrispondenti più recenti del periodo.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Guardo la posta del periodo…'
          : `Leggo ${plural('it', found, { one: () => 'un’email', other: (n) => `${n} email` })} · ${plural('it', entries, { one: () => 'una voce', other: (n) => `${n} voci` })} finora`,
    },
    menu: 'Azioni della bacheca',
    moveDown: 'Sposta giù',
    moveUp: 'Sposta su',
    name: 'Nome',
    namePlaceholder: 'Viaggi',
    new: 'Nuova bacheca',
    newHint:
      'Descrivi con parole tue cosa raccogliere. Fewmail lo trova nella posta fin dove scegli, sceglie i grafici e la tiene aggiornata.',
    period: 'Periodo',
    periods: {
      1: 'Ultimo giorno',
      7: 'Ultima settimana',
      30: 'Ultimo mese',
      90: 'Ultimi 3 mesi',
      180: 'Ultimi 6 mesi',
      365: 'Ultimo anno',
    },
    planning: 'Preparazione…',
    redescribe: 'Salva e rileggi',
    redescribeHint:
      'Rilegge il periodo con la nuova descrizione. Le voci che hai modificato o tolto restano.',
    rename: 'Rinomina bacheca',
    save: 'Salva',
    settings: {
      bannerDays: 'Avviso prima di una data',
      days: (n: number) =>
        plural('it', n, {
          one: () => '1 giorno prima',
          other: (count) => `${count} giorni prima`,
        }),
      hint: 'Fin dove raccoglie la bacheca e quando ti avvisa prima di una data.',
      never: 'Mai',
      title: 'Impostazioni della bacheca',
    },
    starter: {
      events: {
        description:
          'Biglietti, prenotazioni e appuntamenti: dove devo essere, quando e con chi.',
        name: 'Eventi',
      },
      health: {
        description:
          'Visite mediche, ricette, referti e rimborsi dell’assicurazione: chi ho visto, quando e quanto è costato.',
        name: 'Salute',
      },
      home: {
        description:
          'Affitto, utenze, riparazioni e contratti della casa: cosa scade, a chi e quanto.',
        name: 'Casa',
      },
      invoices: {
        description:
          'Fatture che emetto e ricevo per lavoro: cliente o fornitore, importo, scadenza e se è pagata.',
        name: 'Fatture',
      },
      jobs: {
        description:
          'Candidature, colloqui e offerte: quale azienda, quale ruolo e a che punto è ciascuna.',
        name: 'Ricerca di lavoro',
      },
      learning: {
        description:
          'Corsi, lezioni e posta da scuola o università: scadenze, voti, certificati e quanto costano.',
        name: 'Formazione',
      },
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
          'I servizi che pago regolarmente: quanto costa ciascuno, ogni quanto e quando si rinnova.',
        name: 'Abbonamenti a pagamento',
      },
      trips: {
        description:
          'Voli, treni, hotel e noleggi: dove vado, quando e quanto costa.',
        name: 'Viaggi',
      },
    },
    summary: {
      lastMonth: 'Mese scorso',
      perMonth: (amount: string) => `${amount} al mese`,
      recurring: (n: number) =>
        plural('it', n, {
          one: () => 'Uno ricorrente',
          other: (count) => `${count} ricorrenti`,
        }),
      thisMonth: 'Questo mese',
      upcoming: 'In scadenza entro 30 giorni',
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
  clearOut: {
    groups: {
      lists: 'Newsletter che non apri mai',
      notifications: 'Notifiche lette, più vecchie di un mese',
      old: 'Tutto ciò che ha più di un anno',
      promotions: 'Pubblicità e social, più vecchie di 3 giorni',
    },
    done: (emails: string) => `${emails} tolte`,
    empty: 'Niente da togliere: la posta in arrivo è già in ordine.',
    lead: (emails: string) =>
      `${emails} nella posta in arrivo. Ecco cosa può andare.`,
    leadCapped: (emails: string) =>
      `Più di ${emails} nella posta in arrivo. Ecco cosa può andare.`,
    left: (emails: string) => `Restano ${emails} nella posta in arrivo`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} e altre ${more}` : names,
    run: (emails: string) => `Togli ${emails}`,
    safe: 'Non si cancella nulla. Le email tolte vanno in archivio con l’etichetta Fewmail/Cleared e tornano con un clic; dalle newsletter ti disiscrivo anche.',
    scanning:
      'Leggo tutta la posta in arrivo, solo le intestazioni. Fino a un minuto.',
    title: 'Fai pulizia nella posta in arrivo',
    undo: 'Riporta tutto',
    undone: (emails: string) => `${emails} di nuovo nella posta in arrivo`,
  },
  wrapped: {
    busiest: (day: string, hour: string) =>
      `Il momento più pieno: ${day}, verso le ${hour}`,
    copied: 'Link copiato',
    copyLink: 'Copia link',
    cta: 'Ottieni il tuo con Fewmail',
    emails: 'email arrivate',
    empty:
      'Ancora troppa poca posta per raccontare la storia. Torna tra qualche giorno.',
    handled: 'gestite da Fewmail da solo',
    people: 'Chi ha scritto di più',
    period: { month: 'Questo mese', year: 'Quest’anno' },
    replies: 'risposte scritte da Fewmail e inviate',
    saveImage: 'Salva immagine',
    saved: 'risparmiati da Fewmail',
    shareNote:
      'Link e immagine mostrano solo questi numeri, mai nomi o indirizzi.',
    shared: { month: 'Un mese in email', year: 'Un anno in email' },
    spam: 'email di spam fermate',
    split: (people: string, lists: string) =>
      `${people} da persone · ${lists} da newsletter`,
    title: { month: 'Il tuo mese in email', year: 'Il tuo anno in email' },
    unsubscribed: 'newsletter abbandonate',
  },
  forward: {
    done: 'La tua email inoltrata',
  },
  reading: {
    digest: (n: number) => `Newsletter di oggi: ${n}`,
    empty: 'Nessuna newsletter nell’ultimo giorno.',
    lead: 'Le newsletter dell’ultimo giorno in un solo posto, così non affollano la posta in arrivo.',
    title: 'Lettura',
  },
  commitments: {
    title: 'Hai promesso',
  },
  people: {
    firstContact: (date: string) => `Vi scrivete dal ${date}`,
    lastContact: (date: string) => `Ultima email il ${date}`,
    open: 'In attesa in altre conversazioni',
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
  upgrade: {
    ask: 'Chiedi alla tua posta',
    hints: {
      agent:
        'Incluso in Fewmail Pro: chiedi della tua posta o di’ cosa fare, e l’agente lo fa, aspettando il tuo sì prima di cambiare qualcosa in Gmail.',
      ask: 'Incluso in Fewmail Pro: chiedi qualsiasi cosa con parole tue e ricevi la risposta dalla tua posta.',
      boards:
        'Incluso in Fewmail Pro: descrivi cosa raccogliere e l’agente lo trova nella tua posta e lo tiene aggiornato.',
      drafts:
        'Incluso in Fewmail Pro: l’agente scrive la risposta nel tuo stile, tu la modifichi e la invii.',
      home: 'Incluso in Fewmail Pro: le email che hanno bisogno di te, con le risposte già scritte, aggiornate man mano che arriva la posta.',
      tasks:
        'Incluso in Fewmail Pro: affida la conversazione all’agente e lui la porta a termine, chiedendo prima di ogni email che invia.',
    },
  },
  whatsapp: {
    connectFirst: (url: string) =>
      `Ciao! Sono Fewmail. Qui su WhatsApp ti avviso quando arriva posta urgente, ti mostro cosa ti aspetta e invio le risposte che approvi.\n\nQuesto numero non è ancora collegato al tuo Fewmail. Ci vuole un minuto:\n1. Apri le impostazioni di Fewmail: ${url}\n2. In Integrazioni, tocca “Collega WhatsApp” (fa parte di Fewmail Pro).\n3. WhatsApp si apre con un messaggio pronto: invialo e hai finito.`,
    connected:
      'Collegato. Ti scriverò quando arriva qualcosa di urgente. Manda un testo o un vocale per rispondere a qualsiasi email.',
    proOnly:
      'WhatsApp fa parte di Fewmail Pro. Apri Impostazioni → Piano in Fewmail per passare a Pro.',
  },
  zombie: {
    badge: (share: number) =>
      `Ignora le disiscrizioni per il ${share}% delle persone`,
    reason: 'Ha continuato a scriverti dopo la disiscrizione',
  },
}
