import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const fr: Messages = {
  agent: {
    decideOnHome: 'Décider sur l’accueil',
    fromAgent: 'L’agent demande',
    mcpAsks: (client: string) => `${client} demande via MCP`,
    calendar: (email: string) => `Dans l’agenda de ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      dismiss_action: 'Passer cette carte ?',
      create_event: 'Ajouter cet événement ?',
      delete_event: 'Supprimer cet événement ?',
      update_event: 'Modifier cet événement ?',
      approve_action: 'Effectuer cette action ?',
      archive_thread: 'Archiver cette conversation ?',
      clear_out: 'Faire le ménage dans ces groupes d’e-mails ?',
      undo_clear_out:
        'Remettre dans la boîte de réception tout ce qui a été rangé ?',
      create_bot: 'Créer ce bot ?',
      update_bot: 'Modifier ce bot ?',
      reply: 'Envoyer cette réponse ?',
      send_email: 'Envoyer cet e-mail ?',
      snooze_thread: 'Reporter cette conversation ?',
      unsubscribe: 'Se désabonner de cet expéditeur ?',
      tidy_mail: 'Ranger ces e-mails calmes ?',
      trash_thread: 'Mettre ce fil à la corbeille ?',
      report_spam: 'Signaler cet expéditeur comme spam ?',
      mark_not_spam: 'Sortir ce fil des spams ?',
      move_to_inbox: 'Remettre ce fil dans la boîte de réception ?',
    },
    retry: 'Réessayer',
    steps: {
      create_event: 'Ajout d’un événement',
      delete_event: 'Suppression de l’événement',
      list_events: 'Lecture du calendrier',
      update_event: 'Modification de l’événement',
      list_subscriptions: 'Lecture des listes de diffusion',
      approve_action: 'Validation',
      archive_thread: 'Archivage',
      get_reading: 'Lecture des newsletters',
      get_wrapped: 'Je compte votre courrier',
      clear_out: 'Ménage de la boîte de réception',
      preview_clear_out: 'Lecture de toute la boîte de réception',
      undo_clear_out: 'Retour des e-mails rangés',
      create_bot: 'Création d’un bot',
      update_bot: 'Modification d’un bot',
      dismiss_action: 'Ignorer',
      draft_reply: 'Rédaction d’une réponse',
      create_draft: 'Enregistrement du brouillon',
      find_people: "Recherche de l'adresse",
      get_person: 'Recherche de la personne',
      get_today: 'Point sur aujourd’hui',
      list_handled: 'Lecture de ce qui a été traité',
      list_mail: 'Recherche dans les e-mails',
      get_bot_chat: 'Lecture du chat',
      list_bots: 'Lecture de vos bots',
      read_thread: 'Lecture de la conversation',
      redraft_action: 'Réécriture du brouillon',
      refresh: 'Relève du courrier',
      remind_later: 'Création d’un rappel',
      send_email: 'Envoi',
      snooze_thread: 'Report',
      unsubscribe: 'Désabonnement',
      tidy_mail: 'Rangement',
      trash_thread: 'Mise à la corbeille',
      report_spam: 'Signalement du spam',
      mark_not_spam: 'Sortie des spams',
      move_to_inbox: 'Remise dans la boîte de réception',
      list_promises: 'Vérification des promesses',
      set_promise_status: 'Mise à jour de la promesse',
    },
    to: (recipients: string) => `À ${recipients}`,
    until: (time: string) => `Jusqu’à ${time}`,
    yes: {
      dismiss_action: 'Passer',
      create_event: 'Ajouter',
      delete_event: 'Supprimer',
      update_event: 'Enregistrer',
      approve_action: 'Valider',
      archive_thread: 'Archiver',
      clear_out: 'Faire le ménage',
      undo_clear_out: 'Remettre',
      create_bot: 'Créer le bot',
      update_bot: 'Enregistrer',
      reply: 'Envoyer',
      send_email: 'Envoyer',
      snooze_thread: 'Reporter',
      unsubscribe: 'Se désabonner',
      tidy_mail: 'Ranger',
      trash_thread: 'Mettre à la corbeille',
      report_spam: 'Signaler comme spam',
      mark_not_spam: 'Pas un spam',
      move_to_inbox: 'Remettre',
    },
  },
  compose: {
    attach: 'Joindre des fichiers',
    attachmentsTooLarge: (limit: string) =>
      `Les pièces jointes peuvent totaliser jusqu'à ${limit}.`,
    dropFiles: 'Déposez les fichiers pour les joindre',
    removeAttachment: 'Retirer',
    discarded: 'Brouillon supprimé',
    backInQueue: 'Annulé. Le brouillon est de retour dans Accueil.',
    canceled: 'Annulé. Votre e-mail est de retour dans l’éditeur.',
    cc: 'Cc',
    discard: 'Supprimer',
    draftSaved: 'Brouillon enregistré',
    forward: 'Transférer',
    forwardedMessage: 'Message transféré',
    from: 'De',
    invalidRecipients: 'Ajoutez au moins une adresse e-mail valide.',
    later: {
      inHour: 'Dans une heure',
      monday: 'Lundi matin',
      pick: 'Choisir la date et l’heure',
      schedule: 'Programmer',
      time: 'Heure',
      tomorrow: 'Demain matin',
    },
    new: 'Nouvel e-mail',
    placeholder: 'Rédigez votre e-mail…',
    remind: {
      days: (total: number) =>
        plural('fr', total, {
          one: () => 'Me rappeler si aucune réponse après un jour',
          many: (n) => `Me rappeler si aucune réponse après ${n} jours`,
          other: (n) => `Me rappeler si aucune réponse après ${n} jours`,
        }),
      label: 'Me rappeler',
      off: 'Pas de rappel',
    },
    reply: 'Répondre',
    scheduledFor: (date: string) => `Programmé pour le ${date}`,
    send: 'Envoyer',
    sendLater: 'Envoyer plus tard',
    sendingIn: (seconds: number) => `Envoi dans ${seconds} s`,
    subject: 'Objet',
    to: 'À',
    undo: 'Annuler',
    undoing: 'Annulation…',
    writeForMe: 'Rédigez-le pour moi',
    writing: 'Rédaction…',
  },
  composer: {
    acceptSuggestion: 'Tab pour accepter',
    bold: 'Gras',
    bulletList: 'Liste à puces',
    italic: 'Italique',
    link: 'Lien',
    linkPlaceholder: 'Collez ou saisissez un lien',
    noSnippets: 'Aucun extrait ne correspond.',
    removeLink: 'Supprimer le lien',
  },
  reminders: {
    followUp: 'Relancer',
    noReply: 'Pas encore de réponse',
  },
  site: {
    meta: {
      assistant:
        'Fewmail est un assistant e-mail IA pour Gmail qui lit chaque e-mail avant vous, rédige les réponses avec votre ton et ne vous montre que ce qui demande votre attention. Gratuit pour commencer.',
      assistantTitle: 'Assistant e-mail IA pour Gmail',
      compare:
        "Fewmail face à Superhuman, Shortwave et SaneBox : un agent IA qui lit votre courrier plutôt qu'un moyen plus rapide de le lire vous-même.",
      compareTitle: 'Assistants e-mail IA comparés',
      home: 'Fewmail est un assistant e-mail IA pour Gmail : il lit chaque e-mail, rédige les réponses avec votre ton et ne vous montre que ce qui demande votre attention.',
      login:
        'Fewmail lit votre Gmail pour vous, répond avec votre ton et ne vous montre que ce qui demande vraiment votre attention.',
      mcp: "Connectez Fewmail à Claude, ChatGPT, Claude Code ou Cursor comme serveur MCP : lisez et triez votre Gmail depuis l'IA que vous utilisez déjà.",
      motto: "seulement l'essentiel de votre boîte",
      pricing: (trialDays: number) =>
        `Fewmail est gratuit pour toujours pour les bots, le tri et la protection anti-spam. Pro, l'agent complet, commence par ${trialDays} jours gratuits, sans carte.`,
      tagline: "l'agent e-mail IA pour Gmail",
    },
    chapters: {
      pricing: {
        description:
          'Les bots, le tri et la protection sont gratuits pour toujours. Lite, Pro et Max ajoutent tout ce qui lit et écrit à votre place ; les plus grandes formules en font simplement plus.',
        label: 'Tarifs',
        title: (usd: number) =>
          `Le tri est gratuit. L’agent, à partir de $${usd}.`,
      },
      questions: {
        description:
          'Les réponses courtes. Les longues sont dans la politique de confidentialité.',
        label: 'Questions',
        title: 'Avant de connecter Gmail.',
      },
    },
    closing: {
      lead: 'Connectez Gmail en une minute. Fewmail commence par les e-mails des trois derniers jours : vos premières décisions vous attendent tout de suite.',
      title: 'Retrouvez vos matinées.',
    },
    mcp: {
      answer:
        'Le contrat signé, avant le lancement de vendredi. Une réponse est déjà rédigée et attend votre accord dans Fewmail.',
      clients: 'Fonctionne avec',
      emphasis: 'Claude et ChatGPT.',
      free: 'La lecture de vos e-mails et le tri de l’agent sont gratuits.',
      label: 'MCP',
      lead: 'Connectez Fewmail comme serveur MCP et interrogez vos e-mails depuis l’assistant que vous utilisez déjà. Tout ce qui envoie un e-mail ou modifie Gmail attend toujours votre accord.',
      question: 'De quoi Anna a-t-elle besoin de ma part cette semaine ?',
      setup: 'Connecter en une minute',
      title: 'Vos e-mails, dans Claude et ChatGPT.',
    },
    mcpPage: {
      copy: 'Copier l’URL',
      lead: 'Connectez Fewmail comme serveur MCP et interrogez votre boîte depuis l’assistant que vous utilisez déjà. La lecture des e-mails et le tri de l’agent sont gratuits ; les brouillons, les envois et les bots qui écrivent sont inclus dans Pro.',
      safety:
        'Tout envoi ou changement dans Gmail demande d’abord votre accord. Un e-mail qui tente de donner des ordres à l’assistant est signalé avant qu’il ne le lise. Vos e-mails ne servent jamais à entraîner des modèles, et vous pouvez déconnecter chaque application dans les réglages.',
      steps: {
        chatgpt:
          'Dans Settings, ajoutez un connecteur (app) avec cette URL, puis connectez-vous à Fewmail.',
        claude:
          'Dans Settings → Connectors, ajoutez un connecteur personnalisé avec cette URL, puis connectez-vous à Fewmail.',
        code: 'Exécutez cette commande une fois dans un terminal, puis connectez-vous à Fewmail quand Claude Code le demande.',
        cursor:
          'Ajoutez ceci à votre mcp.json, puis connectez-vous à Fewmail quand Cursor le demande.',
      },
      title: 'Fewmail dans Claude, ChatGPT et vos outils.',
    },
    assistantPage: {
      abilities: {
        ask: {
          description:
            'Demandez « À quelle heure part mon vol ? » et obtenez la réponse avec les e-mails d’où elle vient, dans Fewmail, Telegram ou WhatsApp, ou depuis Claude et ChatGPT.',
          title: 'Des réponses tirées de vos e-mails',
        },
        drafts: {
          description:
            'Les réponses sont rédigées à l’avance, avec votre ton et dans la langue de l’expéditeur, et attendent dans le chat de leur bot que vous les approuviez.',
          title: 'Rédige les réponses avec votre ton',
        },
        protection: {
          description:
            'Coordonnées bancaires modifiées, domaines sosies et arnaques connues déclenchent une alerte avant que vous n’agissiez.',
          title: 'Alerte contre le phishing',
        },
        reading: {
          description:
            'Les newsletters du jour deviennent un seul résumé par thème, chaque phrase reliée à l’e-mail d’où elle vient.',
          title: 'Les newsletters en un résumé',
        },
        bots: {
          description:
            'Décrivez en une phrase ce qui doit arriver à certains e-mails, et cela devient un bot avec son propre chat. Seuls les bots que vous laissez agir le font d’eux-mêmes.',
          title: 'Des bots en langage courant',
        },
        sorting: {
          description:
            'Chaque e-mail reçoit un résumé et une note d’importance : l’urgent remonte, et les reçus, notifications et promotions ne vous gênent plus.',
          title: 'Lit et trie chaque e-mail',
        },
      },
      abilitiesDescription:
        'Tout se passe dans le Gmail que vous utilisez déjà, et chaque action de l’agent est notée avec sa raison.',
      abilitiesLabel: 'Ce qu’il fait',
      abilitiesTitle: 'Un assistant, pas une boîte de plus.',
      compareTitle: 'Face aux autres outils e-mail IA.',
      faq: (trialDays: number) => [
        {
          answer:
            'Un logiciel qui utilise l’IA pour lire, trier et répondre à vos e-mails à votre place. La plupart ajoutent des résumés et une aide à l’écriture à une boîte que vous lisez encore vous-même. Fewmail va plus loin : il lit tout d’abord, pour que vous ne voyiez que ce qui demande votre attention.',
          question: 'Qu’est-ce qu’un assistant e-mail IA ?',
        },
        {
          answer:
            'Fewmail chiffre les objets, contenus, résumés et brouillons dans sa base de données, n’utilise jamais vos e-mails pour entraîner des modèles et n’envoie ni ne modifie jamais rien dans Gmail sans votre accord. Vous pouvez le déconnecter et tout supprimer à tout moment.',
          question: 'Est-il sûr de laisser une IA lire mes e-mails ?',
        },
        {
          answer:
            'Il rédige les réponses pour vous, mais n’en envoie jamais aucune de lui-même. Chaque brouillon attend votre approbation dans le chat de son bot, et les brouillons similaires peuvent être approuvés ensemble.',
          question: 'Peut-il répondre aux e-mails automatiquement ?',
        },
        {
          answer: `Oui. La formule Gratuit trie chaque e-mail, réunit dans les chats de vos bots ce qui demande votre attention, fait travailler vos bots et vous protège du spam et du phishing, pour toujours. Les brouillons, les résumés et le reste de l’agent viennent avec les formules payantes, et chaque compte commence avec ${trialDays} jours de Pro, sans carte.`,
          question: 'Existe-t-il un assistant e-mail IA gratuit pour Gmail ?',
        },
      ],
      faqTitle: 'À propos des assistants e-mail IA.',
      lead: 'Fewmail lit chaque e-mail de votre Gmail dès son arrivée, élimine le bruit, rédige les réponses avec votre ton et ne vous apporte que les quelques sujets qui demandent votre décision. Rien n’est envoyé ni modifié sans votre accord.',
      title: 'L’assistant e-mail IA qui lit votre Gmail avant vous.',
    },
    comparePage: {
      lead: 'Les clients mail vous font lire chaque e-mail plus vite. Les filtres rangent les e-mails dans des dossiers. Fewmail est un agent : il lit les e-mails, décide de ce qui peut attendre et ne vous interroge que sur le reste.',
      title: 'Fewmail face aux autres.',
    },
    comparison: {
      custom: 'Sur mesure',
      features: 'Fonction par fonction',
      groups: {
        agent: 'Lire et répondre',
        day: 'Votre journée',
        reach: 'Où ça marche',
        safety: 'Protection',
      },
      labels: {
        ask: 'Posez n’importe quelle question à vos e-mails',
        home: 'Ce qui vous attend, en un seul endroit',
        calendar: 'Agenda',
        drafts: 'Réponses rédigées pour vous',
        followUps: 'Rappels de relance',
        gmail: 'Gmail et Google Workspace',
        handOver: 'Confier une conversation',
        importance: 'Trié par importance',
        keepApp: 'Gardez votre app mail',
        mcp: 'MCP pour vos propres outils',
        memory: 'Retient les promesses et les gens',
        otherProviders: 'iCloud, Yahoo et autres e-mails IMAP',
        outlook: 'Outlook et Microsoft 365',
        phishing:
          'Alertes de phishing et de changement de coordonnées bancaires',
        phone: 'Sur votre téléphone',
        bots: 'Des bots en langage courant',
        snooze: 'Mise en attente',
        spamShield: 'Bouclier anti-spam communautaire',
        summaries: 'Résumés d’e-mails',
        teams: 'Boîte d’équipe',
        unsubscribe: 'Désabonnement en un clic',
      },
      more: 'Autres comparatifs',
      no: 'Non',
      noFreePlan: 'Pas de formule gratuite',
      ours: {
        ask: 'Avec Pro',
        home: 'En direct, approbation groupée, gratuit',
        drafts: 'À votre façon, envoyées seulement avec votre accord, avec Pro',
        followUps: 'Automatiques, sur les e-mails qui attendent une réponse',
        handOver: 'L’agent la mène à son but, avec Pro',
        importance: 'Chaque e-mail noté, gratuit',
        keepApp: 'Tout apparaît dans Gmail',
        mcp: 'Avec Pro',
        memory: 'Avec Pro',
        phone: 'Telegram et WhatsApp, à la voix, avec Pro',
        bots: 'Archiver, marquer comme lu ou se désabonner, gratuit',
        summaries: 'Avec Pro',
        unsubscribe: 'Les expéditeurs qui l’ignorent partent en spam',
      },
      plans: 'Formules et prix',
      read: 'Lire le comparatif',
      source: (name: string, date: string) =>
        `Les informations sur ${name} proviennent de son site public, consulté en ${date}. Les prix et les fonctionnalités évoluent ; consultez son site pour l’offre actuelle.`,
      title: (name: string) => `Fewmail vs ${name}`,
      tryFree: 'Essayer Fewmail gratuitement',
      which: 'Lequel est fait pour vous ?',
      yes: 'Oui',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 boîtes mail et toutes les fonctions, AI Bundle inclus',
          lunch: '2 boîtes mail, mise en attente et rappels',
          snack: '1 boîte mail et un filtrage de base',
        },
        summary:
          'SaneBox range les e-mails dans des dossiers et, avec sa formule la plus haute, rédige et résume aussi. Fewmail lit tout d’abord et réunit sur une seule page les quelques décisions que vous seul pouvez prendre.',
        them: {
          home: 'Un récapitulatif quotidien des e-mails filtrés',
          drafts: 'SaneDrafts, avec Dinner',
          followUps: 'SaneNoReplies',
          importance: 'E-mails secondaires déplacés dans SaneLater',
          keepApp: 'Fonctionne avec des dossiers',
          otherProviders: 'Tout serveur IMAP ou Exchange',
          phone: 'Via votre app mail',
          bots: 'Un apprentissage en déplaçant les e-mails entre dossiers',
          snooze: 'Dès Lunch',
          summaries: 'SaneSummary, avec Dinner',
          unsubscribe: 'Dossier SaneBlackHole',
        },
        verdict:
          'Choisissez SaneBox si vos e-mails sont hors de Gmail et que des dossiers vous suffisent. Choisissez Fewmail si vous utilisez Gmail et voulez que les e-mails importants soient lus, résumés et traités.',
      },
      shortwave: {
        plans: {
          business: 'Par utilisateur',
          free: 'La plupart des fonctions et l’assistant',
          max: 'Par utilisateur, les modèles les plus puissants',
          premier: 'Par utilisateur, des modèles plus puissants',
          pro: 'Tout l’historique, recherche et rédaction par IA',
        },
        summary:
          'Shortwave est un client mail doté d’un assistant IA avec qui vous discutez. Fewmail est un agent qui lit d’abord et ne vous demande que ce qu’il ne peut pas décider.',
        them: {
          ask: 'Assistant IA et recherche',
          drafts: 'Quand vous le demandez',
          importance: 'Splits et regroupements',
          keepApp: 'Remplace votre app mail',
          memory: 'Mémoire IA',
          otherProviders: 'Transférés vers Gmail',
          outlook: 'Microsoft 365 non pris en charge',
          phone: 'Apps iOS et Android',
          bots: 'Filtres IA, de 3 à 50 selon la formule',
          summaries: 'En haut de chaque e-mail',
          teams: 'Conversations et commentaires partagés',
          unsubscribe: 'Avec blocage en un clic',
        },
        verdict:
          'Choisissez Shortwave pour une nouvelle boîte avec un assistant à qui parler. Choisissez Fewmail pour avoir moins d’e-mails sous les yeux, dans le Gmail que vous utilisez déjà.',
      },
      superhuman: {
        plans: {
          business:
            'Par membre, $33 en facturation annuelle. Ajoute Auto Drafts et Ask AI',
          enterprise: 'SSO et contrôles d’administration',
          starter: 'Par membre, $25 en facturation annuelle',
        },
        summary:
          'Superhuman vous fait parcourir chaque e-mail plus vite. Fewmail les parcourt pour vous et ne vous montre que ce qui demande votre attention.',
        them: {
          ask: 'Ask AI, avec Business',
          drafts: 'Auto Drafts, avec Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox et Auto Labels',
          keepApp: 'Remplace votre app mail',
          mcp: 'Avec Business',
          phone: 'Apps iOS et Android',
          bots: 'Custom Auto Labels, avec Business',
          spamShield: 'Le filtre de votre fournisseur',
          summaries: 'Auto Summarize',
          teams: 'Brouillons et commentaires partagés',
        },
        verdict:
          'Choisissez Superhuman si vous voulez traiter chaque e-mail vous-même, plus vite. Choisissez Fewmail si vous préférez ne pas voir la plupart d’entre eux.',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'Beaucoup d’outils e-mail IA sont une nouvelle boîte avec un chat : vous lisez toujours chaque e-mail, simplement avec un résumé en plus. Fewmail est un agent IA qui travaille sur le Gmail que vous utilisez déjà. Il lit d’abord chaque e-mail, rédige les réponses avec votre ton et ne vous apporte que les quelques décisions qui demandent votre attention.',
        question:
          'En quoi Fewmail diffère-t-il des autres assistants e-mail IA ?',
      },
      {
        answer:
          'Non. Fewmail fonctionne par-dessus Gmail. Tout ce qu’il fait apparaît aussi dans Gmail, et vous pouvez continuer à utiliser n’importe quelle app Gmail en parallèle.',
        question: 'Dois-je quitter Gmail ?',
      },
      {
        answer:
          'Jamais sans vous. Les réponses attendent dans le chat de leur bot jusqu’à ce que vous les approuviez, et un bot n’archive, ne marque comme lu ou ne désabonne de lui-même qu’une fois que vous l’y autorisez. Tout ce qu’il a fait reste dans son chat, avec la raison.',
        question: 'Peut-il envoyer ou supprimer des e-mails tout seul ?',
      },
      {
        answer:
          'Objets, contenus, résumés et brouillons sont chiffrés dans notre base de données. Vos e-mails ne servent jamais à entraîner des modèles, et le bouclier anti-spam ne partage entre utilisateurs que des empreintes cryptographiques à clé, jamais d’adresses ni de contenu.',
        question: 'Que deviennent mes e-mails ?',
      },
      {
        answer: `Chaque nouveau compte reçoit ${trialDays} jours de Pro, sans carte. Ensuite, vous restez simplement en Gratuit : rien n’est supprimé, rien n’est facturé.`,
        question: 'Que se passe-t-il après l’essai ?',
      },
      {
        answer:
          'Les brouillons sont rédigés dans la langue de l’e-mail auquel vous répondez. L’app, les résumés et le bot Telegram parlent la langue de votre choix, parmi quinze.',
        question: 'Quelles langues parle-t-il ?',
      },
      {
        answer:
          'Les comptes Gmail et Google Workspace, pour l’instant. Ajoutez plusieurs boîtes à un même Fewmail : leurs e-mails rejoignent les mêmes bots et la même boîte de réception.',
        question: 'Quels comptes e-mail sont compatibles ?',
      },
    ],
    features: {
      description:
        'Ce qui vous prenait tout un après-midi, fait en arrière-plan et listé là où vous pouvez le vérifier.',
      items: {
        calendar: {
          description:
            'Le calendrier de chaque boîte dans une seule vue. Une réunion proposée dans un e-mail devient un événement dès que vous l’approuvez.',
          title: 'Calendrier',
        },
        codes: {
          description:
            'Un code récent attend en haut de vos chats et à côté de son e-mail, prêt à copier sans rien ouvrir. Gratuit.',
          title: 'Codes de connexion',
        },
        messengers: {
          description:
            'Les e-mails urgents vous parviennent aussitôt dans Telegram ou WhatsApp. Interrogez vos e-mails et approuvez les brouillons depuis là, par écrit ou à la voix.',
          title: 'Telegram et WhatsApp',
        },
        reading: {
          description:
            'Chaque matin, un numéro des newsletters de la veille : l’actualité par thème, chaque phrase reliée à sa source, et celles qui méritent d’être lues en entier.',
          title: 'Lecture',
        },
        shield: {
          description:
            'Signalez un spammeur une fois et tous les utilisateurs de Fewmail sont mieux protégés. Ce que le bouclier intercepte attend votre accord avant d’être déplacé. Gratuit.',
          title: 'Bouclier anti-spam',
        },
        subscriptions: {
          description:
            'Chaque liste qui vous a écrit ce mois-ci, avec le nombre de ses e-mails vraiment ouverts. Désabonnez-vous de n’importe laquelle d’une touche. Gratuit.',
          title: 'Listes de diffusion',
        },
        voice: {
          description:
            'Faites-vous lire le résumé de vos newsletters. Envoyez un message vocal sur Telegram ou WhatsApp et l’agent répond à voix haute.',
          title: 'Écouter plutôt que lire',
        },
        wrapped: {
          description:
            'Votre mois ou votre année en e-mails : ce qui est arrivé, ce qui a été traité, combien de temps vous avez gagné. À partager, jamais avec un nom.',
          title: 'Votre bilan e-mail',
        },
      },
      label: 'Et le reste',
      title: 'Tout ce qu’un assistant ferait d’autre.',
    },
    footer: {
      legal: 'Mentions légales',
      product: 'Produit',
      tagline:
        'L’agent e-mail IA qui lit votre Gmail et ne vous montre que ce qui demande votre attention.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'n’aurez plus.',
      label: 'Ce qui disparaît',
      rows: [
        {
          fix: 'Demandez à Fewmail Bot de vider l’arriéré : vieilles pubs, notifications lues, listes que vous n’ouvrez jamais, tout déplacé d’un coup. Une seule annulation ramène chaque e-mail.',
          problem: 'Des milliers d’e-mails que personne ne lira jamais.',
        },
        {
          fix: 'Les réponses sont rédigées à l’avance, à votre façon et dans leur langue. Les réponses semblables s’approuvent ensemble avec ⇧⏎, et chacune reste à vous de vérifier.',
          problem: 'Répondre à ses e-mails à minuit.',
        },
        {
          fix: 'Une touche vous désabonne comme le ferait une personne : un clic, la page de désabonnement ou un e-mail. Les expéditeurs qui continuent sont repérés et proposés comme spam.',
          problem:
            'Des newsletters auxquelles vous ne vous êtes jamais inscrit.',
        },
        {
          fix: 'Chaque matin, Lecture fait des newsletters de la veille un seul numéro par thème, avec celles qui méritent une lecture complète signalées.',
          problem: 'Les newsletters que vous comptiez lire.',
        },
        {
          fix: 'Coordonnées bancaires modifiées, domaines qui en imitent un autre et phishing connu déclenchent une alerte avant que vous n’agissiez.',
          problem: 'Une facture avec de nouvelles coordonnées bancaires.',
        },
        {
          fix: 'Le Tableau note ce que vous avez promis et ce qu’on vous doit, et vous ramène chaque chose le jour venu. Les fils restés sans réponse sont relancés.',
          problem: 'Ce que vous aviez promis, puis oublié.',
        },
        {
          fix: 'Seuls les e-mails urgents vous parviennent dans Telegram ou WhatsApp. Le reste vous attend dans les chats de vos bots, déjà trié, quand vous voulez.',
          problem: 'Vérifier ses e-mails au dîner, au cas où.',
        },
      ],
      title: 'Les soucis d’e-mail que vous n’aurez plus.',
    },
    hero: {
      needs: {
        emphasis: 'demandent votre attention.',
        lead: (handled: string, bot: string) =>
          `Anna attend le contrat, la facture de Northwind arrive à échéance la semaine prochaine et Marco veut un créneau jeudi. Vos bots se sont occupés de ${handled} newsletters et notifications, et ces trois-là vous attendent dans ${bot}.`,
        tag: (bot: string) => `${bot} · jeudi, 08:12`,
        title: 'Trois choses demandent votre attention.',
      },
      fates: {
        archived: 'Archivé',
        markedRead: 'Marqué lu',
        spam: 'Spam',
        summarised: 'Résumé',
        unsubscribed: 'Désabonné',
      },
      handled: ((slots) => [
        slots.count,
        ' traités, chacun avec sa raison',
      ]) as Rich<'count'>,
      inbox: 'Boîte de réception',
      lead: 'Newsletters, reçus, notifications, un lien de phishing et, quelque part là-dedans, les trois e-mails qui comptent vraiment. Fewmail est l’agent IA qui lit tout ça pour vous.',
      needYou: ((slots) => [
        slots.count,
        ' demandent votre attention',
      ]) as Rich<'count'>,
      queue: [
        {
          reason: 'Contrat attendu demain',
          summary:
            'Il lui faut le contrat signé avant le lancement de vendredi.',
        },
        {
          reason: 'Facture · $1,240 à régler le 20 nov.',
          summary:
            'Facture d’octobre pour la refonte du site web. Mêmes coordonnées bancaires que la dernière fois.',
        },
        {
          reason: 'Réunion proposée',
          summary:
            'Propose jeudi à 15:00. Vous n’êtes libre qu’à partir de 16:00, le brouillon demande donc ce créneau.',
        },
      ],
      reading: {
        emphasis: 'les lit tous.',
        lead: 'Il archive le bruit, vous désabonne de ce que vous n’ouvrez jamais et arrête l’arnaque à la porte. Chaque action est notée avec sa raison, pour que vous puissiez vérifier.',
        title: 'Fewmail les lit tous.',
      },
      remind: 'Me le rappeler le 19 nov.',
      remindPlan:
        'Ajouter la facture à vos paiements et vous la rappeler le 19 nov.',
      start: 'Commencer gratuitement avec Google',
      title: 'Les e-mails ne sont pas votre métier.',
      seeBots: 'Découvrir les bots',
      unread: ((slots) => [slots.count, ' non lus']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' non lus dans votre boîte',
      ]) as Rich<'count'>,
      willDo: 'Fewmail va',
    },
    nav: {
      assistant: 'Assistant e-mail IA',
      compare: 'Comparer',
      features: 'Fonctionnalités',
      mcp: 'Serveur MCP',
      pricing: 'Tarifs',
      signIn: 'Se connecter',
    },
    bots: {
      again: 'Recommencer',
      board: {
        coming: { state: 'devient payant · 28 nov.', text: 'Essai Coursely' },
        owed: {
          state: 'en attente · avant le 22 nov.',
          text: 'Northwind : remboursement de $120 pour le double prélèvement',
        },
        promised: {
          state: 'pour jeudi',
          text: 'Envoyer les slides à Marco avant la revue',
        },
      },
      emphasis: 'chaque type d’e-mail.',
      fewmail: {
        approve: 'Approuver',
        ask: 'Factures de Hetzner : marquez-les comme lues',
        botName: 'Factures Hetzner',
        digest: (total: number, people: number) =>
          `${plural('fr', total, {
            one: () => 'Un e-mail',
            other: (n) => `${n} e-mails`,
          })} ces dernières 24 heures. Surtout des newsletters et des notifications, et ${plural(
            'fr',
            people,
            {
              one: () => 'un seul écrit par une personne',
              other: (n) => `seulement ${n} écrits par des personnes`,
            }
          )}.`,
        proposal:
          'Voici le bot. Approuvez-le et il commencera avec les nouveaux e-mails.',
      },
      label: 'Bots',
      later: 'Quatre choses bonnes à savoir, rien à décider.',
      lead: 'Chaque bot lit son propre type d’e-mails dès leur arrivée et vous dit dans son chat ce qu’il a fait et ce qui vous attend. Passez de l’un à l’autre, ou appuyez sur [ et ].',
      points: [
        {
          description:
            'Chaque e-mail va au bot dont c’est le travail : Important, Peut attendre, Rapide, ou un bot que vous avez créé. Ce qu’aucun bot ne prend reste chez Fewmail Bot.',
          title: 'Ils trient dès l’arrivée.',
        },
        {
          description:
            'Un bot demande avant de toucher à chaque e-mail, jusqu’à ce que vous le laissiez agir seul. Tout ce qu’il a fait reste dans son chat, avec la raison.',
          title: 'Ils demandent tant que vous ne leur faites pas confiance.',
        },
        {
          description:
            'Dites à Fewmail Bot « factures de Hetzner : marquez-les comme lues » et approuvez le bot qu’il crée. Mettez un bot en pause, modifiez-le ou supprimez-le de la même façon.',
          title: 'Créez-en un en une phrase.',
        },
      ],
      quick:
        'Mira, de Growthly, fait de la prospection à froid : une inconnue qui vous démarche, et vous ne lui avez jamais écrit.',
      settled: {
        remind: 'rappel programmé',
        send: 'réponse envoyée',
        skip: 'ignoré',
      },
      title: 'Un chat pour chaque type d’e-mail.',
    },
    plans: {
      agent: 'L’agent',
      details: 'Voir toutes les formules en détail',
      usage: 'Limite de l’agent par mois',
      everyPlan: 'Dans chaque formule',
      oneAllowance:
        'Une seule enveloppe pour tout ce que fait l’agent : vous payez ce que vous utilisez, et le bruit ne compte jamais',
      forever: 'pour toujours',
      free: {
        description: 'Les bots, le tri et la protection. Pour toujours.',
      },
      max: {
        description: 'Le même agent, pour une boîte très chargée.',
      },
      monthly: 'Mensuel',
      per: { month: 'par mois', year: 'par an' },
      lite: {
        description: 'L’agent complet : il lit, écrit et se souvient.',
      },
      pro: {
        description: 'Le même agent, avec de la place pour plus de mails.',
      },
      tryFree: (days: number) => `Essai gratuit de ${days} jours`,
      yearly: 'Annuel · 2 mois offerts',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Les bots en langage courant, le tri et la protection sont gratuits pour toujours. Pro, c’est l’agent qui lit, écrit et se souvient pour vous ; Max, c’est le même agent avec de la marge pour une boîte très chargée. Chaque compte démarre avec ${trialDays} jours de Pro, et ensuite vous restez simplement en Gratuit.`,
      otherTool: 'Vous hésitez avec un autre outil ?',
      title: 'Payez pour l’agent, pas pour la boîte.',
    },
    startFree: 'Commencer gratuitement',
    trialNote: (days: number) =>
      `${days} jours de Pro, sans carte. Puis gratuit aussi longtemps que vous voulez.`,
    trust: {
      emphasis: 'demande',
      label: 'Vos e-mails, votre décision',
      places:
        'Fonctionne par-dessus le Gmail que vous utilisez déjà, et vous rejoint dans',
      title: 'Il demande avant d’agir.',
      vows: [
        {
          description:
            'Les brouillons vous attendent. Un bot ne déplace des e-mails de lui-même qu’une fois que vous l’y autorisez, et tout ce qu’il a fait reste dans son chat avec la raison.',
          title: 'Rien ne part sans votre accord.',
        },
        {
          description:
            'Objets, contenus, résumés et brouillons sont chiffrés dans notre base de données. Les brouillons enregistrés restent dans Gmail, jamais chez nous.',
          title: 'Chiffré au repos.',
        },
        {
          description:
            'Le bouclier anti-spam apprend de tous grâce à des empreintes à clé. Pas une adresse ni un mot de vos e-mails n’est partagé.',
          title: 'Jamais utilisé pour entraîner des modèles.',
        },
      ],
    },
  },
  skills: {
    bills: 'Factures et paiements à venir',
    cancel: 'Résilier un abonnement payant',
    cleanup: 'Newsletters à faire le tri',
    followups: 'Qui vous doit une réponse',
    reading: 'Les newsletters du jour en un seul résumé',
    today: 'Ce qui vous attend aujourd’hui',
    waiting: 'Qui attend votre réponse',
    week: 'Votre semaine en e-mails',
  },
  snooze: {
    laterToday: 'Plus tard aujourd’hui',
    nextWeek: 'La semaine prochaine',
    title: 'Reporter',
    tomorrow: 'Demain',
    unsnooze: 'Remettre en boîte de réception',
    until: (date: string) => `Reporté jusqu’au ${date}`,
    weekend: 'Ce week-end',
  },
  actionDone: {
    heads_up: 'Compris',
    commitment: 'Fait',
    confirm: 'J’ai confirmé',
    follow_up: 'J’ai relancé',
    pay: 'J’ai payé',
    read: 'J’ai lu',
    renew: 'J’ai renouvelé',
    schedule: 'J’ai planifié',
    security: 'J’ai vérifié',
    sign: 'J’ai signé',
  },
  actionLink: {
    confirm: 'Confirmer',
    pay: 'Payer',
    read: 'Lire',
    renew: 'Renouveler',
    sign: 'Signer',
  },
  actionKind: {
    heads_up: 'À savoir',
    cleanup: 'Se désabonner de tout',
    consent: 'Approuver',
    commitment: 'Promis',
    security: 'Vérifier',
    spam: 'Mettre en spam',
    trash: 'Mettre à la corbeille',
    archive: 'Archiver',
    follow_up: 'Relancer',
    mark_read: 'Marquer lu',
    pay: 'Payer',
    read: 'À lire',
    reply: 'Répondre',
    schedule: 'Planifier',
    unsubscribe: 'Se désabonner',
  },
  actionStatus: {
    auto_done: 'fait par l’agent',
    dismissed: 'ignoré',
    done: 'fait',
    failed: 'échec',
    pending: 'en attente dans Accueil',
  },
  byBot: 'par un bot',
  calendar: {
    tomorrow: 'Demain',
    allDay: 'Toute la journée',
    calendar: 'Calendrier',
    create: 'Ajouter l’événement',
    delete: 'Supprimer',
    deleted: 'Événement supprimé',
    description: 'Description',
    editEvent: 'Modifier l’événement',
    endBeforeStart: 'L’événement se termine avant de commencer',
    ends: 'Fin',
    location: 'Lieu',
    newEvent: 'Nouvel événement',
    next: 'Suivant',
    openInGoogle: 'Ouvrir dans Google Agenda',
    previous: 'Précédent',
    save: 'Enregistrer',
    saved: 'Événement enregistré',
    saving: 'Enregistrement de l’événement…',
    scope: {
      this: 'Cet événement',
      following: 'Cet événement et les suivants',
      all: 'Tous les événements',
    },
    starts: 'Début',
    title: 'Calendrier',
    titlePlaceholder: 'Ajouter un titre',
    today: 'Aujourd’hui',
    untitled: '(Sans titre)',
    views: {
      day: 'Jour',
      week: 'Semaine',
      month: 'Mois',
      year: 'Année',
    },
  },
  category: {
    calendar: 'Agenda',
    finance: 'Finances',
    newsletter: 'Newsletter',
    notification: 'Notification',
    other: 'Autre',
    person: 'Personne',
    promotion: 'Promotion',
    receipt: 'Reçu',
    security: 'Sécurité',
    travel: 'Voyage',
    work: 'Travail',
  },
  command: {
    compose: 'Nouvel e-mail',
    appearance: 'Apparence',
    upgrade: 'Passer à Pro',
    theme: {
      dark: 'Sombre',
      light: 'Clair',
      system: 'Système',
    },
  },
  importance: ['Bruit', 'Bon à savoir', 'Bientôt pour vous', 'Urgent'],
  justNow: 'à l’instant',
  errors: {
    crashTitle: 'Fewmail a trébuché sur cette page',
    crashLead:
      'Vos e-mails sont en sécurité et rien n’a changé dans Gmail. Rechargez ; si cela se reproduit, nous sommes déjà prévenus.',
    missingTitle: 'Il n’y a rien à cette adresse',
    calendarAccess:
      'Fewmail n’a pas accès à cet agenda. Autorisez-le depuis la page Agenda.',
    failed: 'Un problème est survenu. Réessayez.',
    needsPro: 'Il faut Fewmail Pro pour cela.',
    alreadySent: 'Déjà envoyé, trop tard pour annuler.',
    consentChanged:
      'Le contenu a changé depuis la demande. Vérifiez-le à nouveau et décidez sur l’Accueil.',
    notFound: 'Ceci n’existe plus. Il a peut-être été supprimé.',
    offline: 'Impossible de joindre Fewmail. Vérifiez votre connexion.',
  },
  desktop: {
    confirm: 'Se connecter à l’app',
    confirmLead: (code: string) =>
      `Fewmail sur votre ordinateur demande à se connecter. Vérifiez qu’il affiche ${code}.`,
    confirmTitle: 'Se connecter à l’app ?',
    expired: 'Cette connexion a expiré. Recommencez depuis l’app.',
    lead: 'La connexion sur votre ordinateur est faite. Vous pouvez fermer cet onglet.',
    title: 'Retour à l’app',
    waiting: (code: string) =>
      `Continuez dans votre navigateur et vérifiez qu’il affiche ${code}.`,
  },
  update: {
    available: 'Une nouvelle version de Fewmail est disponible.',
    reload: 'Recharger',
  },
  keys: {
    forget: 'oublier',
    reopen: 'rouvrir',
    attach: 'joindre',
    done: 'fait',
    openLink: 'ouvrir le lien',
    writeReminder: 'écrire une relance',
    summary: 'résumé',
    fromSender: 'plus de cet expéditeur',
    approvePicked: (n: number) => `approuver les ${n} choisis`,
    pick: 'choisir',
    pickAll: 'tout choisir',
    markRead: 'marquer lu',
    markUnread: 'marquer non lu',
    unpick: 'effacer la sélection',
    pin: 'épingler',
    unpin: 'désépingler',
    copyCode: 'copier le code',
    restore: 'vers la boîte de réception',
    calendarToday: 'aujourd’hui',
    newEvent: 'nouvel événement',
    period: 'précédent / suivant',
    view: 'vue',
    skills: 'compétences',
    unsubscribe: 'se désabonner',
    filter: 'filtre',
    reply: 'répondre',
    snooze: 'reporter',
    trash: 'corbeille',
    archive: 'archiver',
    approve: 'approuver',
    approveAll: (n: number) => `approuver les ${n} de ce type`,
    close: 'fermer',
    draftReply: 'brouillon',
    edit: 'modifier',
    expand: 'déplier / replier',
    move: 'naviguer',
    stackEmail: 'e-mail suivant / précédent',
    open: 'ouvrir',
    rename: 'renommer',
    clearFilter: 'effacer le filtre',
    search: 'rechercher',
    send: 'envoyer',
    skip: 'passer',
    keep: 'garder',
    stopEditing: 'terminer',
    rewrite: 'réécrire',
    save: 'enregistrer',
    deleteEvent: 'supprimer',
  },
  legal: {
    privacy: 'Politique de confidentialité',
    englishOnly:
      'Ce document est fourni en anglais, qui en est la version faisant foi.',
    terms: 'Conditions d’utilisation',
    updated: (date: string) => `Dernière mise à jour : ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `L’enveloppe de l’agent pour ce mois est épuisée. Elle revient le ${date}.`,
  },
  notices: {
    freeUpSpace: 'Libérer de l’espace',
    mailLost:
      'Fewmail a perdu l’accès à votre Gmail et ne lit plus les nouveaux e-mails.',
    mailboxLost: (email: string) => `Fewmail a perdu l’accès à ${email}.`,
    reconnect: 'Reconnecter',
    sendLimit: (email: string, when: string) =>
      `${email} a atteint la limite d’envoi quotidienne de Gmail. L’envoi refonctionnera ${when}.`,
    signInAgain: 'Se reconnecter',
    storageFull: (email: string) =>
      `${email} n’a plus de stockage Google, donc Gmail refuse les nouveaux e-mails.`,
    storageFullHint:
      'Libère de l’espace ou prends plus de stockage pour recevoir à nouveau des e-mails.',
  },
  login: {
    needsGmail:
      'Fewmail a besoin d’accéder à votre Gmail. Reconnectez-vous et laissez la case Gmail cochée sur l’écran de Google.',
    agree: ((slots) => [
      'En continuant, vous acceptez les ',
      slots.terms,
      ' et la ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Rien n’est envoyé ni archivé sans votre accord. L’agenda et les contacts sont facultatifs.',
    continue: 'Continuer avec Google',
    lead: 'Fewmail lit vos e-mails et ne vous montre que ce qui demande votre attention.',
    title: 'L’essentiel, rien de plus.',
  },
  mail: {
    inThread: (emails: string) => `${emails} dans cette conversation`,
    moreFrom: (name: string) => `Plus de ${name}`,
    draftDeleted: 'Brouillon supprimé',
    unsubscribeConfirm: (name: string) => `Se désabonner de ${name} ?`,
    unsubscribeHint:
      'Fewmail vous désabonne de la liste et archive cette conversation. Un désabonnement ne peut pas être annulé.',
    unsubscribing: 'Désabonnement…',
    pin: 'Épingler',
    unpin: 'Désépingler',
    pinned: 'Épinglés',
    showAll: (n: number) => `Tout afficher (${n})`,
    showFewer: 'Afficher moins',
    inboxTotal: (count: string) => `${count} au total`,
    markShownRead: (total: number) =>
      plural('fr', total, {
        one: (n) => `Marquer ${n} comme lu`,
        other: (n) => `Marquer ${n} comme lus`,
      }),
    oneTimeCode: {
      copied: 'Code copié',
      copy: 'Copier le code',
    },
    openUnsubscribePage: 'Ouvrir la page',
    unsubscribeYourself:
      'Pour quitter cette liste, termine sur sa page. Ses e-mails sont archivés en attendant.',
    allMailboxes: 'Toutes les boîtes',
    filterAbout: {
      focused: 'L’important et les personnes d’abord, notifications repliées',
      unread: 'Ce que vous n’avez pas encore lu, par type',
      categories:
        'Toute la boîte par type, les e-mails qui demandent votre attention en premier',
      inbox: 'Tout, le plus récent en haut',
    },
    find: {
      recent: 'Recherches récentes',
      tips: 'Astuces',
      clearRecent: 'Effacer',
      describeExample: 'factures d’Anna le mois dernier',
      searching: 'Recherche dans vos e-mails…',
      tip: {
        from: 'E-mails d’Anna',
        subject: 'L’objet mentionne « invoice »',
        attachment: 'Avec pièces jointes',
        pdf: 'Avec un PDF joint',
        unread: 'Conversations non lues',
        week: 'Des 7 derniers jours',
        describe: 'Ou décrivez-le avec vos mots',
      },
    },
    group: {
      named: 'Expéditeur ou objet',
      mentioned: 'Mentionné dans le texte',
      read: 'Lus',
      earlier: 'Plus anciens',
      important: 'Importants',
      people: 'Personnes',
      plans: 'Agenda et voyages',
      money: 'Argent',
      updates: 'Notifications',
      newsletters: 'Newsletters',
      promotions: 'Promotions',
    },
    unread: 'Non lu',
    block: 'Bloquer l’expéditeur',
    ignoresUnsubscribe: (name: string) => `${name} ignore les désabonnements`,
    ignoresUnsubscribeHint:
      'Fewmail a demandé le désabonnement, mais cet expéditeur est connu pour continuer d’écrire. Envoyer ses e-mails à la corbeille désormais ? Un bot s’en chargera, et vous pourrez le supprimer depuis l’Accueil.',
    blocked: 'Bloqué. Ses e-mails vont désormais à la corbeille.',
    forward: 'Transférer',
    more: 'Plus',
    close: 'Fermer',
    reply: 'Répondre',
    trash: 'Mettre à la corbeille',
    trashed: 'Mis à la corbeille',
    moveToInbox: 'Vers la boîte de réception',
    backInInbox: 'Remis dans la boîte de réception',
    movedToInbox:
      'Remis dans la boîte de réception. Merci de nous l’avoir dit.',
    deleteDraft: 'Supprimer le brouillon',
    notSent: 'Non envoyé. Ouvrez pour réessayer',
    noRecipients: 'Aucun destinataire',
    notSpam: 'Pas un spam',
    reportSpam: 'Signaler comme spam',
    reportedSpam: 'Signalé. Ses e-mails vont désormais en spam.',
    archive: 'Archiver',
    archived: 'Archivé',
    markedRead: 'Marqué comme lu',
    markUnread: 'Marquer comme non lu',
    markedUnread: 'Marqué comme non lu',
    attachment: 'pièce jointe',
    draftReply: 'Rédiger une réponse',
    due: (date: string) => `échéance le ${date}`,
    dueHint: 'Échéance trouvée par l’agent dans cet e-mail',
    empty: {
      focused: 'Boîte de réception vide',
      unread: 'Tout est lu',
      categories: 'Boîte de réception vide',
      inbox: 'Boîte de réception vide',
      snoozed: 'Rien en attente',
      sent: 'Aucun envoi pour l’instant',
      drafts: 'Aucun brouillon',
      archive: 'Les archives sont vides',
      spam: 'Aucun spam',
      trash: 'La corbeille est vide',
    },
    emptyHint: {
      focused: 'Les nouveaux e-mails apparaîtront ici dès leur arrivée.',
      unread: 'Les nouveaux e-mails apparaîtront ici dès leur arrivée.',
      categories: 'Les nouveaux e-mails apparaîtront ici dès leur arrivée.',
      inbox: 'Les nouveaux e-mails apparaîtront ici dès leur arrivée.',
      snoozed:
        'Reportez un e-mail pour le mettre de côté : il reviendra non lu dans la boîte de réception.',
      sent: 'Les e-mails que vous envoyez apparaissent ici.',
      drafts: 'Les e-mails commencés mais pas envoyés attendent ici.',
      archive:
        'Les e-mails archivés quittent la boîte de réception et attendent ici.',
      spam: 'Le spam arrive ici, hors de votre boîte de réception.',
      trash: 'Les e-mails supprimés restent ici 30 jours.',
    },
    noResults: 'Aucun résultat',
    noResultsHint: 'Essayez d’autres mots ou un autre dossier.',
    expectsReply: 'Attend une réponse',
    filter: {
      categories: 'Catégories',
      archive: 'Archives',
      trash: 'Corbeille',
      drafts: 'Brouillons',
      spam: 'Spam',
      inbox: 'Boîte de réception',
      snoozed: 'En attente',
      sent: 'Envoyés',
      focused: 'Essentiel',
      unread: 'Non lus',
    },
    instruction:
      'Dites à l’agent comment répondre, ou appuyez simplement sur Entrée',
    open: 'Ouvrir',
    search: 'Recherchez ou décrivez',
    openInGmail: 'Ouvrir dans Gmail',
    openInNewTab: 'Ouvrir dans un nouvel onglet',
    unsubscribe: 'Se désabonner',
    unsubscribed: 'Désabonné',
    unsubscribeFailed:
      'Cet expéditeur ne propose pas de désabonnement en un clic, l’e-mail a donc été archivé.',
    you: 'Vous',
    sent: 'Envoyé',
    writeReply: 'Écrire une réponse…',
    replyTo: 'Répondre à',
    date: 'Date',
    authentication: 'Authentification',
    toLine: (recipients: string) => `à ${recipients}`,
  },
  subscriptions: {
    leftBy: (percent: number) =>
      `${percent} % de ses lecteurs sur Fewmail se sont désabonnés`,
    unsubscribeHint: (emails: string) =>
      `Fewmail vous désabonne de la liste et archive tout ce qu’elle a envoyé (${emails} ce mois-ci). Un désabonnement ne peut pas être annulé.`,
    archivedOnly:
      'Cet expéditeur n’offre pas de désabonnement que Fewmail puisse utiliser, ses e-mails ont donc été archivés, mais vous restez sur la liste et les nouveaux continueront d’arriver.',
    count: (total: number) => `Listes de diffusion : ${total}`,
    empty: 'Aucune liste de diffusion ne vous a écrit ce mois-ci.',
    lead: 'Newsletters, promotions et autres listes de diffusion qui vous ont écrit ce mois-ci, les plus actives d’abord. Désabonnez-vous de ce que vous ne lisez jamais : Fewmail quitte la liste et archive tout ce qu’elle a envoyé.',
    opened: (total: number) =>
      total === 0 ? 'aucun ouvert' : `${total} ouverts`,
    title: 'Listes de diffusion',
    unsubscribe: 'Se désabonner',
    unsubscribed: 'Désabonné',
  },
  nav: {
    board: 'Tableau',
    menu: 'Menu',
    collapseSidebar: 'Réduire la barre latérale',
    expandSidebar: 'Développer la barre latérale',
    labels: 'Libellés',
    folders: 'Dossiers',
    calendar: 'Calendrier',
    subscriptions: 'Listes de diffusion',
    wrapped: 'Bilan',
    people: 'Personnes',
    findPerson: 'Trouver quelqu’un',
    personMail: 'Voir les e-mails',
    deleteContact: 'Supprimer le contact',
    contactDeleted: 'Contact supprimé',
    clearSearch: 'Effacer la recherche',
    mail: 'E-mails',
    reading: 'Lecture',
    settings: 'Réglages',
    syncFailed: 'Échec de la synchro Gmail, nouvelle tentative',
    syncing: 'Lecture de votre boîte…',
    loading: 'Chargement',
    syncFailedIn: (email: string) =>
      `Échec de la synchro de ${email}, nouvelle tentative`,
    syncingIn: (email: string) => `Lecture de ${email}…`,
    home: 'Accueil',
    trialLeft: (total: number) =>
      plural('fr', total, {
        one: (n) => `Essai Pro · ${n} jour restant`,
        many: (n) => `Essai Pro · ${n} jours restants`,
        other: (n) => `Essai Pro · ${n} jours restants`,
      }),
    usage: (percent: number) => `Agent · ${percent} % du mois utilisé`,
    watching: 'L’agent surveille votre boîte',
  },
  notifications: {
    many: (total: number) =>
      plural('fr', total, {
        other: (n) => `${n} nouveautés de Fewmail`,
      }),
  },
  plan: {
    used: (percent: number) => `${percent} % utilisé`,
    base: 'La limite mensuelle de base de l’agent.',
    times: (times: number) => `Limite mensuelle ${times}× plus élevée.`,
    free: 'Gratuit',
    freeDescription:
      'Des e-mails rapides et sereins avec des règles simples. Gratuit aussi longtemps que vous le souhaitez.',
    includes:
      'Chaque formule payante ajoute l’agent : chaque e-mail lu et résumé, des réponses rédigées à votre façon, des règles en langage courant, Telegram et MCP.',
    manage: 'Gérer la facturation',
    price: (usd: number) => `$${usd} / mois`,
    priceYearly: (usd: number) => `$${usd} / an`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
    cancels: (plan: string, date: string) =>
      `${plan} jusqu’au ${date}, puis Gratuit.`,
    choose: (plan: string) => `Choisir ${plan}`,
    proRenews: (date: string) => `Renouvellement le ${date}.`,
    resets: (date: string) => `Remis à zéro le ${date}.`,
    title: 'Formule',
    trial: 'Essai Pro',
    welcome: (plan: string) =>
      `Bienvenue dans ${plan}. L’agent reprend du service.`,
    yearly: 'Payer à l’année',
    yearlyHint: 'Deux mois offerts.',
    trialDescription: (date: string) =>
      `Tout Pro jusqu’au ${date}, puis gratuit. Sans carte.`,
    upgrade: 'Autres formules',
    usage: 'Ce mois-ci',
  },
  queue: {
    addToCalendar: 'Ajouter à l’agenda',
    writeReminder: 'Écrire une relance',
    approve: 'Approuver',
    delete: 'Supprimer',
    pick: 'Choisir',
    picked: (n: number) => `${n} choisis`,
    unpick: 'Retirer',
    askedByYou: 'Demandé par vous',
    draftedInVoice: 'Rédigé avec votre style',
    openEmail: 'Ouvrir l’e-mail',
    send: 'Envoyer',
    rewrite: 'Réécrire',
    shorterInstruction: 'Fais plus court.',
    new: 'Nouveau',
    skipStale: 'Les passer',
    skipped: (n: number) => `Passées : ${n}`,
    stale: (n: number) => `Plus d’une semaine : ${n}`,
    skip: 'Passer',
  },
  bots: {
    profile: 'Ce que je fais',
    closeProfile: 'Fermer',
    change: 'Modifier',
    since: (date: string) => `Actif depuis le ${date}`,
    status: {
      acts: 'Agit seul',
      asks: 'Demande avant chaque e-mail',
      last: (time: string) => `dernier à ${time}`,
      paused: (date: string) => `En pause jusqu’au ${date}`,
      reading: (n: number) =>
        plural('fr', n, {
          one: () => `lit un nouvel e-mail`,
          many: (count) => `lit ${count} nouveaux e-mails`,
          other: (count) => `lit ${count} nouveaux e-mails`,
        }),
      waiting: (n: number) =>
        plural('fr', n, {
          one: () => `Une chose vous attend`,
          many: (count) => `${count} choses vous attendent`,
          other: (count) => `${count} choses vous attendent`,
        }),
      watching: 'Surveille votre courrier',
    },
    intro: {
      acts: 'J’agis seul : tout ce que je fais s’affiche ici, et vous pouvez l’annuler.',
      asks: 'Avant de toucher à un e-mail, je vous le demande ici.',
      board:
        'Bonjour ! Je suis les promesses et les échéances de votre courrier : ce qu’on vous doit, ce que vous avez promis et ce qui arrive bientôt. Demandez-moi qui vous doit quoi.',
      change: 'Pour changer ce que je fais, écrivez-moi simplement.',
      fewmail:
        'Bonjour, je suis Fewmail Bot. Je lis tout le courrier qu’aucun de vos bots ne prend et je ne vous montre que ce qui demande votre attention. Rien ne change dans Gmail sans votre accord. Posez-moi vos questions sur votre courrier, ou demandez-moi de créer un bot.',
      own: (name: string) =>
        `Bonjour, je suis ${name}. Voici ce dont je m’occupe :`,
    },
    pause: {
      day: 'Jusqu’à demain',
      hint: 'En pause, il ne prend aucun e-mail ; Fewmail Bot s’en charge.',
      month: 'Un mois',
      resume: 'Reprendre',
      title: 'Mettre en pause',
      week: 'Une semaine',
    },
    week: {
      approved: 'avec votre accord',
      auto: 'seul',
      title: '7 derniers jours',
      waiting: 'vous attendent',
    },
    lately: 'Récemment',
    notifications: 'Notifications',
    quiet: {
      hide: 'Masquer',
      show: 'Afficher',
      week: (n: number) =>
        plural('fr', n, {
          one: () =>
            `Une modification dans votre courrier ces 7 derniers jours`,
          many: (count) =>
            `${count} modifications dans votre courrier ces 7 derniers jours`,
          other: (count) =>
            `${count} modifications dans votre courrier ces 7 derniers jours`,
        }),
    },
    chatMenu: 'Actions du chat',
    clear: 'Effacer l’historique',
    clearConfirm: (name: string) => `Effacer le chat avec ${name} ?`,
    clearHint:
      'Ses messages partent pour de bon. Ce qu’il a fait dans vos e-mails reste, tout comme ses rappels.',
    cleared: 'Historique effacé',
    deleteFolder: 'Supprimer le dossier',
    deleteFolderConfirm: (name: string) => `Supprimer le dossier ${name} ?`,
    deleteFolderHint: 'Ses bots restent dans la liste, hors de tout dossier.',
    moveTo: 'Déplacer vers un dossier',
    newFolder: 'Nouveau dossier',
    noFolder: 'Aucun dossier',
    pin: 'Épingler',
    rename: 'Renommer',
    renameFolder: 'Renommer le dossier',
    unpin: 'Désépingler',
    add: 'Nouveau bot',
    answering: 'J’écris…',
    cancelReply: 'Annuler la réponse',
    cards: {
      autoDone: (n: number) =>
        plural('fr', n, {
          one: () => 'J’en ai traité un tout seul.',
          many: (count) => `J’en ai traité ${count} tout seul.`,
          other: (count) => `J’en ai traité ${count} tout seul.`,
        }),
      dismissed: (n: number) =>
        plural('fr', n, {
          one: () => 'Vous en avez ignoré un.',
          many: (count) => `Vous en avez ignoré ${count}.`,
          other: (count) => `Vous en avez ignoré ${count}.`,
        }),
      done: (n: number) =>
        plural('fr', n, {
          one: () => 'Un est fait après votre accord.',
          many: (count) => `${count} sont faits après votre accord.`,
          other: (count) => `${count} sont faits après votre accord.`,
        }),
      failed: (n: number) =>
        plural('fr', n, {
          one: () => 'Gmail en a refusé un.',
          many: (count) => `Gmail en a refusé ${count}.`,
          other: (count) => `Gmail en a refusé ${count}.`,
        }),
      pending: (n: number) =>
        plural('fr', n, {
          one: () => 'Un vous attend.',
          many: (count) => `${count} vous attendent.`,
          other: (count) => `${count} vous attendent.`,
        }),
    },
    composer: (name: string) => `Écrivez à ${name} au sujet de ses e-mails`,
    copied: 'Copié',
    copy: 'Copier',
    created: 'Bot créé. Il lit les nouveaux e-mails dès maintenant.',
    delete: 'Supprimer le bot',
    deleteConfirm: (name: string) => `Supprimer ${name} ?`,
    deleteHint:
      'Son chat part avec lui. Ses e-mails restent où ils sont, et les nouveaux e-mails du même genre iront à Fewmail.',
    deleted: 'Bot supprimé',
    earlier: 'Afficher les précédents',
    edit: 'Réglages du bot',
    effect: {
      always_show: 'Le garder sur l’Accueil',
      archive: 'L’archiver',
      collect: 'Juste le recueillir',
      draft_reply: 'Rédiger une réponse',
      mark_read: 'Le marquer comme lu',
      promises: 'Les promesses et dates limites que je suis',
      tidy: 'Le ranger',
      trash: 'Le mettre à la corbeille',
      unsubscribe: 'Se désabonner',
    },
    empty:
      'Rien ici pour l’instant. Quand un e-mail pour moi arrive, j’écris ici.',
    enabled: 'Agit tout seul',
    enabledHint: {
      off: 'Désactivé, il demande d’abord votre accord pour chaque e-mail.',
      on: 'Activé, il agit sans demander ; tout ce qu’il fait s’affiche dans son chat.',
    },
    instruction: 'Quels e-mails et quoi en faire',
    instructionPlaceholder:
      'ex. Marquer comme lues les factures de Hetzner ou archiver les notifications LinkedIn',
    mute: 'Mettre en sourdine',
    muted: 'En sourdine : aucune notification de ce bot',
    name: 'Nom',
    namePlaceholder: 'ex. Factures',
    noPlan:
      'Je ne peux pas vous répondre : avec le forfait gratuit, je n’ai pas de jetons pour une conversation. Abonnez-vous, et je suis tout à vous.',
    now: 'En attente',
    nudge: {
      noReply: 'Pas encore de réponse dans cette conversation.',
      replied: 'Une réponse est arrivée depuis dans cette conversation.',
    },
    promises: (n: number) =>
      plural('fr', n, {
        one: () => 'J’ai noté une promesse.',
        many: (count) => `J’ai noté ${count} promesses.`,
        other: (count) => `J’ai noté ${count} promesses.`,
      }),
    presets: 'Modèles',
    react: 'Réagir',
    reaction: 'Réaction',
    reply: 'Répondre',
    save: 'Enregistrer',
    saved: 'Enregistré',
    simple: {
      title: {
        from: (value: string) => `De « ${value} »`,
        mailingList: () => 'Toute liste de diffusion',
        subject: (value: string) => `L’objet contient « ${value} »`,
      },
    },
    spent: (date: string) =>
      `Je ne peux pas répondre avant le ${date} : l’enveloppe de ce mois est épuisée.`,
    steps: (n: number) =>
      plural('fr', n, {
        one: () => 'Une étape',
        many: (count) => `${count} étapes`,
        other: (count) => `${count} étapes`,
      }),
    subscribe: 'S’abonner',
    fewmail: 'Fewmail Bot',
    fewmailJob: 'Crée vos bots, trouve des e-mails et répond aux questions',
    title: 'Bots',
    toLatest: 'Aller au plus récent',
    unmute: 'Réactiver',
    whatItDoes: 'Ce qu’il en fait',
    you: 'Toi',
  },
  settings: {
    disconnectConfirm: (name: string) => `Déconnecter ${name} ?`,
    messengerDisconnectHint:
      'Le bot ne vous écrira plus. Pour le reconnecter, il faudra un nouveau lien depuis cette page.',
    knowledge: {
      description:
        'Tarifs, adresses, disponibilités, votre façon de répondre. L’agent s’en sert dans les brouillons et l’autocomplétion.',
      placeholder:
        'p. ex. Le conseil est facturé $150/h. Je ne prends pas d’appels le vendredi. Mon adresse est…',
      title: 'Ce que l’agent doit savoir',
    },
    labels: {
      description:
        'Classe les e-mails dans des libellés Fewmail/… pour que Gmail sur votre téléphone affiche le même ordre.',
      title: 'Libellés de l’agent dans Gmail',
    },
    snippets: {
      deleted: 'Extrait supprimé',
      add: 'Ajouter un extrait',
      body: 'Texte',
      delete: 'Supprimer',
      description:
        'Tapez ; dans l’éditeur pour insérer un extrait par son nom.',
      name: 'Nom',
      title: 'Extraits',
    },
    account: 'Compte',
    agent: 'Agent',
    deleteAccount: 'Supprimer le compte',
    deleteConfirm: 'Tout supprimer',
    deleteDescription:
      'Supprime immédiatement de Fewmail votre compte, les e-mails synchronisés, les brouillons et les bots. Votre Gmail lui-même n’est pas touché. Un forfait payant est résilié immédiatement.',
    deleteFailed: 'Le compte n’a pas été supprimé. Réessayez dans une minute.',
    deleteSignIn:
      'Pour confirmer que c’est bien vous, reconnectez-vous avec Google, puis supprimez le compte.',
    deleteTitle: 'Supprimer votre compte Fewmail ?',
    cancel: 'Annuler',
    integrations: 'Intégrations',
    language: 'Langue',
    languageSearch: 'Rechercher une langue',
    languageDescription: 'App, bot et résumés. Les réponses suivent l’e-mail.',
    legal: 'Mentions légales',
    mailboxes: {
      removeConfirm: (email: string) => `Retirer ${email} ?`,
      removeHint:
        'Fewmail cesse de lire cette boîte et oublie ce qu’il y a lu. Rien ne change dans Gmail.',
      add: 'Ajouter Gmail',
      addDescription:
        'Le courrier d’un autre compte Gmail rejoint le même Accueil et la même boîte de réception. Il ne connecte jamais personne ici : se connecter avec lui ouvre un Fewmail distinct.',
      added: 'Boîte ajoutée. Son courrier apparaît dans une minute.',
      failed:
        'Impossible d’ajouter la boîte. Autorisez l’accès à Gmail et réessayez.',
      lost: 'L’accès à Gmail a été perdu. Ajoutez-la de nouveau pour la reconnecter.',
      reading: 'Lecture du courrier…',
      remove: 'Retirer',
      retrying:
        'Gmail ne répond pas pour le moment. Fewmail réessaiera de lui-même.',
      signIn: 'Vous vous connectez avec celle-ci',
      signInChosen:
        'C’est le compte avec lequel vous vous connectez. Choisissez-en un autre.',
      signInLost:
        'L’accès à Gmail a été perdu. Reconnectez-vous pour le rétablir.',
      synced: (ago: string) => `Synchronisé ${ago}`,
      title: 'Boîtes mail',
    },
    mcp: {
      disconnectHint:
        'Elle ne pourra plus lire vos e-mails tant que vous ne la reconnecterez pas.',
      allow: 'Autoriser',
      connected: (ago: string) => `Connecté ${ago}`,
      copy: 'Copier l’URL',
      defaultName: 'Client MCP',
      deny: 'Refuser',
      description:
        'Ils peuvent lire vos e-mails, rédiger des réponses et les envoyer après votre confirmation.',
      disconnect: 'Déconnecter',
      paste:
        'Ajoutez cette URL comme connecteur dans votre app, puis connectez-vous à Fewmail.',
      request: (app: string) => `${app} souhaite utiliser votre Fewmail`,
      title: 'Connecter Claude, Cursor ou tout client MCP',
    },
    signedInWithGoogle: 'Connecté avec Google',
    signOut: 'Se déconnecter',
    notifications: {
      blocked:
        'Les notifications sont bloquées. Autorisez-les dans les paramètres du site du navigateur.',
      browser: 'Ce navigateur',
      desktop: 'Cet ordinateur',
      messengerOff: 'Les e-mails urgents restent dans Fewmail.',
      messengerOn: 'Les e-mails urgents arrivent aussitôt dans le chat.',
      notConfigured:
        'Les notifications du navigateur ne sont pas configurées sur ce serveur.',
      off: 'Recevez ici les e-mails urgents, même quand Fewmail est fermé.',
      on: 'Les e-mails urgents s’affichent ici. Plusieurs à la fois arrivent en une seule.',
      title: 'Notifications',
      unsupported: 'Ce navigateur ne peut pas afficher de notifications.',
    },
    telegram: {
      connect: 'Connecter Telegram',
      disconnect: 'Déconnecter',
      linked:
        'Les e-mails urgents arrivent tout de suite. Approuvez et modifiez les brouillons depuis le chat.',
      linkedQuiet: 'Approuvez et modifiez les brouillons depuis le chat.',
      notConfigured: 'Le bot Telegram n’est pas configuré sur ce serveur.',
      unlinked:
        'Recevez les e-mails urgents et approuvez les brouillons depuis Telegram.',
    },
    whatsapp: {
      connect: 'Connecter WhatsApp',
      disconnect: 'Déconnecter',
      linked:
        'Les e-mails urgents arrivent tout de suite. Approuvez et modifiez les brouillons depuis le chat.',
      linkedQuiet: 'Approuvez et modifiez les brouillons depuis le chat.',
      notConfigured: 'Le bot WhatsApp n’est pas configuré sur ce serveur.',
      unlinked:
        'Recevez les e-mails urgents et approuvez les brouillons depuis WhatsApp.',
    },
    title: 'Réglages',
  },
  spam: {
    reasonList: 'Sur une liste publique de domaines de spammeurs',
    reasonPattern: {
      auth: 'Échec de l’authentification de l’expéditeur : l’adresse est falsifiée',
      infra:
        'Envoyé depuis un réseau signalé comme spam par plusieurs utilisateurs de Fewmail',
      link: 'Liens vers des sites signalés comme spam par plusieurs utilisateurs de Fewmail',
      signals:
        'Domaine récent, adresse étrange et authentification faible à la fois',
      template:
        'Même texte que celui signalé comme spam par plusieurs utilisateurs de Fewmail',
    },
    reasonCommunity: 'Signalé comme spam par plusieurs utilisateurs de Fewmail',
    reasonYou: 'Vous avez signalé cet expéditeur comme spam',
    suspect: 'Ressemble à du spam',
    imagesHidden: 'Les images sont masquées dans les spams.',
    openFile: {
      action: 'Ouvrir',
      description:
        'Cet e-mail est dans les spams. N’ouvrez ses fichiers que si vous faites confiance à l’expéditeur.',
      title: (name: string) => `Ouvrir ${name} ?`,
    },
    showImages: 'Afficher les images',
  },
  starterBots: {
    board: { name: 'Tableau' },
    important: {
      instruction:
        'Ce qui demande une action de ma part : les personnes qui attendent ma réponse, les factures à payer, les alertes de sécurité, tout ce qui vient de ma banque ou de l’administration. Les garder sur l’Accueil',
      name: 'Important',
    },
    later: {
      instruction:
        'Bon à savoir, sans décision à prendre : les nouvelles des services que j’utilise, les livraisons, les événements et les dates',
      name: 'Peut attendre',
    },
    quick: {
      instruction:
        'Du bruit que je supprimerais sans le lire : notifications, reçus, newsletters, promotions et prospection commerciale. Les ranger : archiver, marquer comme lu ou se désabonner, selon le cas',
      name: 'Rapide',
    },
  },
  telegram: {
    approveAlike: 'Approuver d’un coup toutes les cartes d’un même type :',
    chatTaken:
      'Ce chat est déjà relié à un autre compte Fewmail. Déconnectez d’abord Telegram de ce compte (Réglages → Intégrations), puis rouvrez le lien.',
    queueChanged:
      'Les cartes ont changé entre-temps. Voici ce qui vous attend maintenant :',
    heard: (text: string) => `Entendu : « ${text} »`,
    voiceFailed: 'Je n’ai pas compris. Réessayez ou écrivez-le.',
    help: 'Écrivez ou dites ce qu’il vous faut :\n• une question sur vos e-mails : « quand Netflix se renouvelle-t-il ? »\n• quoi répondre : « dis à Anna que je signe demain »\n• une tâche : « archive toujours les newsletters de Medium »\n• répondez à l’un de mes brouillons pour le modifier',
    canceled: 'Annulé. Le brouillon est de retour dans votre file.',
    sendingIn: (seconds: number) => `Envoi dans ${seconds} s`,
    undo: 'Annuler',
    commands: { queue: 'Ce qui vous attend' },
    connectFirst: (url: string) =>
      `Bonjour ! Je suis Fewmail. Ici, dans Telegram, je vous préviens quand un e-mail urgent arrive, je vous montre ce qui vous attend et j’envoie les réponses que vous approuvez.\n\nCe chat n’est pas encore relié à votre Fewmail. Cela prend une minute :\n1. Ouvrez les réglages de Fewmail : ${url}\n2. Dans Intégrations, touchez « Connecter Telegram » (inclus dans Fewmail Pro).\n3. Telegram vous ramène ici : appuyez sur Démarrer, et c’est prêt.`,
    connected:
      'Connecté. Je vous préviendrai dès que quelque chose d’urgent arrive.\n\n/queue : ce qui vous attend',
    done: 'Fait',
    draft: 'Brouillon :',
    edit: 'Modifier',
    editPrompt:
      'Envoyez-moi le texte à utiliser à la place, ou dites-moi comment le modifier en commençant par « / », ex. « /plus formel ».',
    newDraft: 'Nouveau brouillon :',
    nothing: 'Rien ne vous attend pour l’instant.',
    proOnly:
      'Telegram fait partie de Fewmail Pro. Ouvrez Réglages → Formule dans Fewmail pour passer à Pro.',
    draftClipped:
      'Raccourci ici. « Envoyer » envoie le brouillon complet : lisez-le dans Fewmail.',
    rewriting: 'Réécriture…',
    send: 'Envoyer',
    sendThis: 'Envoyer ceci',
    shorter: 'Plus court',
    skip: 'Passer',
    skipped: 'Ignoré',
    somethingWrong: 'Un problème est survenu',
    urgent: 'Urgent',
    willSend: 'J’enverrai :',
  },
  today: {
    working: 'En cours…',
    botSuggestion: {
      done: {
        archive:
          'Un nouveau bot archive désormais les e-mails de cet expéditeur.',
        mark_read:
          'Un nouveau bot marque désormais comme lus les e-mails de cet expéditeur.',
      },
      label: 'Bot suggéré',
      lead: (count: number, effect: 'archive' | 'mark_read') =>
        effect === 'archive'
          ? `${count} e-mails ce mois-ci, que l’agent propose tous d’archiver`
          : `${count} e-mails ce mois-ci, que l’agent propose tous de marquer comme lus`,
      no: 'Non, merci',
      yes: {
        archive: 'Toujours archiver',
        mark_read: 'Toujours marquer comme lu',
      },
    },
    newSender: {
      archive: 'Toujours archiver',
      archived:
        'Un nouveau bot archive désormais les e-mails de cet expéditeur.',
      keep: 'Garder comme d’habitude',
      label: 'Nouvel expéditeur',
      lead: (count: number, opened: number) =>
        `${count} e-mails en deux semaines, ${opened === 0 ? 'aucun ouvert' : `${opened} ouverts`}`,
    },
    readingNow: (total: number) =>
      plural('fr', total, {
        one: () => 'L’agent lit un nouvel e-mail',
        many: (n) => `L’agent lit ${n} nouveaux e-mails`,
        other: (n) => `L’agent lit ${n} nouveaux e-mails`,
      }),
    allDone: 'Tout est fait. Rien ne vous attend.',
    allDoneLead:
      'Je continue à lire les nouveaux e-mails, et ce qui demande votre attention apparaîtra ici.',
    allowanceSpent: (date: string) =>
      `L’enveloppe de l’agent pour ce mois est épuisée : les résumés et brouillons reviennent le ${date}. D’ici là, je note toujours les promesses et les dates limites.`,
    byBots: (n: number) => `Vos bots ont traité ${n} e-mails.`,
    decisions: 'Décisions',
    journal: {
      approved: 'Approuvé par vous',
      byBot: (bot: string) => `Votre bot : ${bot}`,
      failed: 'N’a pas fonctionné',
      lead: 'Les 7 derniers jours. Chaque changement dans vos e-mails ou votre agenda a été approuvé par vous ou effectué par un bot que vous laissez agir seul.',
      title: 'Fait dans votre boîte',
    },
    progress: (done: number, total: number) => `${done} sur ${total}`,
    mostlyNoise: (people: number) =>
      people === 0
        ? 'Uniquement des newsletters et des notifications.'
        : `Surtout des newsletters et des notifications, seulement ${people} de vraies personnes.`,
    worth: {
      awaiting: (total: number) =>
        plural('fr', total, {
          one: () => '1 en attente de réponse',
          other: (n) => `${n} en attente de réponse`,
        }),
      dated: (total: number) =>
        plural('fr', total, {
          one: () => '1 avec une date',
          other: (n) => `${n} avec une date`,
        }),
    },
    worthKnowing: 'Bon à savoir',
    canWait: 'Peut attendre',
    canWaitEmpty: {
      lead: 'Les e-mails à lire quand vous aurez un moment et les réponses que vous attendez se rassemblent ici.',
      title: 'Rien n’attend.',
    },
    improve: {
      empty: {
        lead: 'Quand l’agent voit que vous traitez un expéditeur toujours de la même façon, il vous propose un bot ici.',
        title: 'Aucune suggestion pour l’instant.',
      },
      lead: (total: number) =>
        plural('fr', total, {
          one: () => 'Un bot que l’agent pourrait créer pour vous.',
          many: (n) => `${n} bots que l’agent pourrait créer pour vous.`,
          other: (n) => `${n} bots que l’agent pourrait créer pour vous.`,
        }),
      title: 'L’agent propose',
    },
    quick: 'Rapide',
    needsLook: 'Pour vous',
    tidy: {
      failed: (emails: string) =>
        `Gmail n’a pas modifié ${emails}. Réessayez dans un instant.`,
      confirm: (emails: string) => `Ranger ${emails} ?`,
      running: 'Rangement…',
      unsubscribeHint:
        'Certains sont des listes dont Fewmail vous désabonnera, ce qui ne peut pas être annulé.',
      review: 'Vérifier',
      reviewLead:
        'Je propose de ranger ces e-mails, avec la raison à côté de chacun. Approuvez-les tous d’un coup ou gardez ceux qui doivent rester.',
      reviewTitle: 'Vérifiez ce que l’agent propose',
      done: (n: number) => `${n} rangés`,
      keep: 'Garder',
      run: 'Tout approuver',
      untilYouApprove:
        'Rien ne change dans votre boîte tant que vous n’approuvez pas',
    },
    pauseListening: 'Pause',
    resumeListening: 'Reprendre',
    awaiting: 'En attente de réponse',
    hint: {
      messengers: {
        lead: 'Recevez le courrier urgent et validez les brouillons dans la messagerie que vous utilisez déjà.',
        title: 'Telegram ou WhatsApp',
      },
      notNow: 'Pas maintenant',
      setUp: 'Configurer',
      turnOn: 'Activer',
    },
    dates: 'Dates et rendez-vous',
    done: 'Fait',
    firstRead:
      'D’abord vos e-mails des trois derniers jours. Ce qui demande votre attention apparaîtra ici tout seul.',
    approvedMany: (n: number) => `${n} approuvées`,
    listen: 'Écouter',
    handled: {
      spam: (n: number) => `En spam : ${n}`,
      archived: (n: number) => `Archivés : ${n}`,
      markedRead: (n: number) => `Marqués comme lus : ${n}`,
      review: 'Revoir',
      total: (n: number) => `Traités : ${n}`,
      unsubscribed: (n: number) => `Désabonnements : ${n}`,
    },
    headline: (total: number) =>
      total === 0
        ? 'Tout est calme.'
        : plural('fr', total, {
            one: () => 'Une chose vous attend.',
            many: (n) => `${n} choses vous attendent.`,
            other: (n) => `${n} choses vous attendent.`,
          }),
    period: (days: number) =>
      days === 1 ? 'ces dernières 24 h' : `ces ${days} derniers jours`,
    pulse: {
      lists: (n: number) => `${n} de listes de diffusion`,
      people: (n: number) => `${n} de personnes`,
      total: (total: number, period: string) =>
        plural('fr', total, {
          one: (n) => `${n} e-mail ${period}`,
          other: (n) => `${n} e-mails ${period}`,
        }),
    },
    saved: (minutes: number) =>
      `Fewmail vous a fait gagner environ ${formatMinutes('fr', minutes)} cette semaine`,
    recent: (period: string) => `Aussi ${period}`,
    sent: 'Envoyé',
    codes: 'Codes de connexion',
  },
  bulk: {
    badge: (n: number) => `Envoyé à plus de ${n} utilisateurs de Fewmail`,
    reason: (n: number) =>
      `E-mail de masse : plus de ${n} utilisateurs de Fewmail ont reçu le même texte`,
  },
  cold: {
    reason:
      'Prospection à froid : quelqu’un à qui vous n’avez jamais écrit vous démarche',
  },
  board: {
    lead: {
      coming: (total: number) =>
        plural('fr', total, {
          one: () => 'Une date limite approche.',
          other: (n) => `${n} dates limites approchent.`,
        }),
      owed: (amounts: string) => `On vous doit ${amounts}.`,
      promised: (total: number) =>
        plural('fr', total, {
          one: () => 'Vous avez promis une chose.',
          other: (n) => `Vous avez promis ${n} choses.`,
        }),
      waiting: (total: number) =>
        plural('fr', total, {
          one: () => 'Une promesse qui vous a été faite reste à tenir.',
          other: (n) =>
            `${n} promesses qui vous ont été faites restent à tenir.`,
        }),
    },
    section: {
      coming: 'À venir',
      owed: 'On vous doit',
      promised: 'Vous avez promis',
    },
    state: {
      acknowledged: 'ils ont répondu, pas encore fait',
      broken: 'ne s’est pas fait',
      cancelled: 'annulé',
      fulfilled: 'fait',
      in_progress: 'en route',
      open: 'en attente',
      overdue: 'en retard',
    },
    by: (date: string) => `au plus tard le ${date}`,
    lastDay: (date: string) => `date limite : ${date}`,
    done: 'Fait',
    forget: 'Oublier',
    reopen: 'Rouvrir',
    markedDone: 'Marqué comme fait',
    forgotten: 'Oublié',
    reopened: 'Rouvert',
  },
  cleanup: {
    emails: (total: number) =>
      plural('fr', total, {
        one: () => '1 e-mail',
        many: (n) => `${n} e-mails`,
        other: (n) => `${n} e-mails`,
      }),
    reason: (total: number) => `${total} e-mails ce mois-ci, aucun ouvert`,
    title: (total: number) =>
      plural('fr', total, {
        one: () => 'Se désabonner d’une newsletter que vous n’ouvrez jamais',
        many: (n) =>
          `Se désabonner de ${n} newsletters que vous n’ouvrez jamais`,
        other: (n) =>
          `Se désabonner de ${n} newsletters que vous n’ouvrez jamais`,
      }),
  },
  clearOut: {
    partial:
      'Gmail a interrompu une partie du ménage. Ce qui a déjà été rangé peut revenir.',
    groups: {
      lists: 'Newsletters que vous n’ouvrez jamais',
      notifications: 'Notifications lues, de plus d’un mois',
      old: 'Tout ce qui a plus d’un an',
      promotions: 'Pubs et réseaux sociaux, de plus de 3 jours',
    },
    done: (emails: string) => `${emails} rangés`,
    empty: 'Rien à ranger : la boîte de réception est déjà en ordre.',
    lead: (emails: string) =>
      `${emails} dans la boîte de réception. Voici ce qui peut partir.`,
    leadCapped: (emails: string) =>
      `Plus de ${emails} dans la boîte de réception. Voici ce qui peut partir.`,
    left: (emails: string) => `${emails} restent dans la boîte de réception`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} et ${more} autres` : names,
    ready: (emails: string) => `${emails} peuvent partir`,
    review: 'Voir',
    run: (emails: string) => `Ranger ${emails}`,
    safe: 'Rien n’est supprimé. Les e-mails rangés sont archivés avec le libellé Fewmail/Cleared et reviennent en un clic ; les abonnements aux newsletters concernées sont aussi résiliés.',
    scanning:
      'Je lis toute la boîte de réception, en-têtes seulement. Jusqu’à une minute.',
    title: 'Faire le ménage dans la boîte de réception',
    undo: 'Tout remettre',
    undone: (emails: string) =>
      `${emails} de retour dans la boîte de réception`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `Jour le plus chargé : ${day} · heure la plus chargée : ${hours}`,
    copied: 'Lien copié',
    copyLink: 'Copier le lien',
    cta: 'Obtiens le tien avec Fewmail',
    emails: 'e-mails reçus',
    empty:
      'Pas encore assez d’e-mails pour raconter l’histoire. Revenez dans quelques jours.',
    handled: 'e-mails traités par Fewmail',
    handledHint:
      'Fewmail ne change rien dans Gmail sans votre accord. Laissez un bot agir seul, et il traitera ce courrier pour vous.',
    people: 'Qui a le plus écrit',
    period: { month: 'Ce mois-ci', year: 'Cette année' },
    replies: 'réponses rédigées par Fewmail et envoyées',
    saveImage: 'Enregistrer l’image',
    saved: 'gagnés grâce à Fewmail',
    shareNote:
      'Le lien et l’image ne montrent que ces chiffres, jamais de noms ni d’adresses.',
    shared: { month: 'Un mois en e-mails', year: 'Une année en e-mails' },
    spam: 'spams arrêtés',
    split: (people: string, lists: string, other: string) =>
      `${people} de personnes · ${lists} de newsletters · ${other} autres`,
    title: { month: 'Votre mois en e-mails', year: 'Votre année en e-mails' },
    unsubscribed: 'newsletters quittées',
  },
  reading: {
    markAllRead: 'Tout marquer comme lu',
    summary: 'Ce que disent vos newsletters',
    worth: 'À lire en entier',
    leftOut: (n: number) => `Laissées de côté : ${n}, rien de nouveau.`,
    note: {
      inSummary: 'Dans le résumé',
      leftOut: 'Laissée de côté',
    },
    digest: (n: number) => `Newsletters : ${n}`,
    lead: 'Les newsletters d’une journée au même endroit, pour qu’elles n’encombrent pas la boîte de réception.',
    issues: 'Toutes les éditions',
    empty: 'Pas encore de newsletters',
    emptyHint:
      'Chaque matin, l’agent écrira ici les nouvelles de vos newsletters, chaque ligne liée à l’e-mail d’où elle vient.',
    title: 'Lecture',
  },
  commitments: {
    title: 'Vous avez promis',
  },
  headsUp: {
    deadline: 'Dernier jour bientôt',
    notYet: 'Rien reçu depuis',
    price: 'Prix en hausse',
    priceUp: (what: string, from: string, to: string) =>
      `${what} : ${to} au lieu de ${from}`,
    promised: 'On vous l’a promis',
  },
  risk: {
    prompt_injection: (domain: string) =>
      `${domain} a caché dans cet e-mail des instructions pour les assistants qui lisent le courrier. L’agent les ignore ; ne le transférez pas et ne faites pas ce qu’il demande.`,
    known_phishing: (domain: string) =>
      `${domain} figure sur une liste publique de sites d’hameçonnage actifs. N’ouvrez aucun lien, ne vous connectez pas et ne payez pas.`,
    credential_phishing: (domain: string) =>
      `${domain} vous demande de vous connecter ou de saisir vos données de carte ou de compte. Les banques et les services ne le demandent jamais par e-mail : ne cliquez sur aucun lien et ne saisissez rien.`,
    lookalike_domain: (domain: string) =>
      `Ressemble à ${domain}, mais c’est une autre adresse. Ne cliquez sur aucun lien et ne payez pas.`,
    new_sender_payment: (domain: string) =>
      `Premier e-mail de ${domain}, et il demande de l’argent. Vérifiez par un canal auquel vous faites déjà confiance.`,
    spoofed_sender: (domain: string) =>
      `Prétend venir de ${domain}, mais ${domain} ne l’a pas envoyé. Ne cliquez sur aucun lien et ne payez pas.`,
    payment_change: (domain: string) =>
      `Nouvelles coordonnées de paiement de ${domain}. Confirmez par téléphone avant de payer.`,
    title: 'Vérifiez avant d’agir',
  },
  upgrade: {
    hints: {
      board:
        'Inclus dans Fewmail Pro : l’agent note les promesses qui vous sont faites, vos engagements et les dates limites de vos e-mails, puis les suit jusqu’à leur résolution.',
      chat: 'Inclus dans Fewmail Pro : parlez à vos bots de leurs e-mails, et ils reviennent vers vous au moment promis.',
      drafts:
        'Inclus dans Fewmail Pro : l’agent rédige la réponse dans votre style, puis vous la modifiez et l’envoyez.',
    },
  },
  whatsapp: {
    phoneTaken:
      'Ce numéro est déjà relié à un autre compte Fewmail. Déconnectez d’abord WhatsApp de ce compte (Réglages → Intégrations), puis renvoyez le message.',
    connectFirst: (url: string) =>
      `Bonjour ! Je suis Fewmail. Ici, sur WhatsApp, je vous préviens quand un e-mail urgent arrive, je vous montre ce qui vous attend et j’envoie les réponses que vous approuvez.\n\nCe numéro n’est pas encore connecté à votre Fewmail. Ça prend une minute :\n1. Ouvrez les réglages de Fewmail : ${url}\n2. Dans Intégrations, touchez « Connecter WhatsApp » (inclus dans Fewmail Pro).\n3. WhatsApp s’ouvre avec un message prêt : envoyez-le, et c’est fait.`,
    connected:
      'Connecté. Je vous écrirai dès qu’un e-mail urgent arrive. Envoyez un texte ou un message vocal pour répondre à un e-mail.',
    proOnly:
      'WhatsApp fait partie de Fewmail Pro. Ouvrez Réglages → Formule dans Fewmail pour passer à Pro.',
  },
  zombie: {
    badge: (share: number) =>
      `Ignore les désabonnements pour ${share} % des gens`,
    reason: 'A continué à vous écrire après votre désabonnement',
  },
}
