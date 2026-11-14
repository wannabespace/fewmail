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
      delete_board: 'Supprimer ce tableau et tout son contenu ?',
      create_event: 'Ajouter cet événement ?',
      delete_event: 'Supprimer cet événement ?',
      update_event: 'Modifier cet événement ?',
      approve_action: 'Effectuer cette action ?',
      archive_thread: 'Archiver cette conversation ?',
      clear_out: 'Faire le ménage dans ces groupes d’e-mails ?',
      undo_clear_out:
        'Remettre dans la boîte de réception tout ce qui a été rangé ?',
      create_rule: 'Ajouter cette règle ?',
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
      list_subscriptions: 'Lecture des abonnements',
      approve_action: 'Validation',
      archive_thread: 'Archivage',
      get_reading: 'Lecture des newsletters',
      get_wrapped: 'Je compte ton courrier',
      clear_out: 'Ménage de la boîte de réception',
      preview_clear_out: 'Lecture de toute la boîte de réception',
      undo_clear_out: 'Retour des e-mails rangés',
      create_rule: 'Ajout d’une règle',
      dismiss_action: 'Ignorer',
      draft_reply: 'Rédaction d’une réponse',
      create_draft: 'Enregistrement du brouillon',
      get_board: 'Lecture du tableau',
      get_person: 'Recherche de la personne',
      get_today: 'Point sur aujourd’hui',
      list_boards: 'Ouverture des tableaux',
      list_handled: 'Lecture de ce qui a été traité',
      list_mail: 'Recherche dans les e-mails',
      list_rules: 'Lecture des règles',
      read_thread: 'Lecture de la conversation',
      redraft_action: 'Réécriture du brouillon',
      refresh: 'Relève du courrier',
      send_email: 'Envoi',
      snooze_thread: 'Report',
      unsubscribe: 'Désabonnement',
      tidy_mail: 'Rangement',
      trash_thread: 'Mise à la corbeille',
      report_spam: 'Signalement du spam',
      mark_not_spam: 'Sortie des spams',
      move_to_inbox: 'Remise dans la boîte de réception',
      create_board: 'Création d’un tableau',
      update_board: 'Modification du tableau',
      delete_board: 'Suppression du tableau',
      add_board_chart: 'Ajout d’un graphique',
      add_to_board: 'Ajout au tableau',
      edit_board_entry: 'Correction de l’entrée',
      remove_board_entry: 'Retrait du tableau',
      rename_board_group: 'Renommage du groupe',
    },
    to: (recipients: string) => `À ${recipients}`,
    until: (time: string) => `Jusqu’à ${time}`,
    yes: {
      dismiss_action: 'Passer',
      delete_board: 'Supprimer',
      create_event: 'Ajouter',
      delete_event: 'Supprimer',
      update_event: 'Enregistrer',
      approve_action: 'Valider',
      archive_thread: 'Archiver',
      clear_out: 'Faire le ménage',
      undo_clear_out: 'Remettre',
      create_rule: 'Ajouter',
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
  ask: {
    label: (question: string) => `Demander à Fewmail : « ${question} »`,
    thinking: 'Je parcours vos e-mails…',
  },
  compose: {
    discarded: 'Brouillon supprimé',
    backInQueue: 'Annulé. Le brouillon est de retour dans Accueil.',
    canceled: 'Annulé. Votre e-mail est de retour dans l’éditeur.',
    cc: 'Cc',
    discard: 'Supprimer',
    draftSaved: 'Brouillon enregistré',
    forward: 'Transférer',
    forwardedMessage: 'Message transféré',
    from: 'De',
    instructionPlaceholder: 'Quel ton adopter ? (facultatif)',
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
          one: () => 'Me rappeler sans réponse sous un jour',
          many: (n) => `Me rappeler sans réponse sous ${n} jours`,
          other: (n) => `Me rappeler sans réponse sous ${n} jours`,
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
    chapters: {
      pricing: {
        description:
          'Le tri, les règles et la protection sont gratuits pour toujours. Lite, Pro et Max ajoutent tout ce qui lit et écrit à votre place ; les plus grandes formules en font simplement plus.',
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
        'Le contrat signé, avant le lancement de vendredi. Une réponse est déjà rédigée et vous attend dans votre file Fewmail.',
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
      lead: 'Connecte Fewmail comme serveur MCP et interroge ta boîte depuis l’IA que tu utilises déjà. Lire tes e-mails et le tri de l’agent sont gratuits ; brouillons, envois et règles viennent avec Pro.',
      safety:
        'Tout ce qui envoie un e-mail ou modifie Gmail demande d’abord ton accord. Tes e-mails n’entraînent jamais de modèles, et tu peux déconnecter n’importe quelle app dans les réglages.',
      steps: {
        chatgpt:
          'Dans Settings, ajoute un connecteur (app) avec cette URL, puis connecte-toi à Fewmail.',
        claude:
          'Dans Settings → Connectors, ajoute un connecteur personnalisé avec cette URL, puis connecte-toi à Fewmail.',
        code: 'Lance ceci une fois dans un terminal, puis connecte-toi à Fewmail quand Claude Code le demande.',
        cursor:
          'Ajoute ceci à ton mcp.json, puis connecte-toi à Fewmail quand Cursor le demande.',
      },
      title: 'Fewmail dans Claude, ChatGPT et tes outils.',
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
        home: 'Ce qui vous attend, sur une seule page',
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
        rules: 'Des règles en langage courant',
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
        home: 'En direct, approbation groupée, avec Pro',
        drafts: 'À votre façon, envoyées seulement avec votre accord, avec Pro',
        followUps: 'Automatiques, sur les e-mails qui attendent une réponse',
        handOver: 'L’agent la mène à son but, avec Pro',
        importance: 'Chaque e-mail noté, gratuit',
        keepApp: 'Tout apparaît dans Gmail',
        mcp: 'Avec Pro',
        memory: 'Avec Pro',
        phone: 'Telegram et WhatsApp, à la voix, avec Pro',
        rules: 'Archiver, marquer comme lu ou se désabonner, gratuit',
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
          rules: 'Un apprentissage en déplaçant les e-mails entre dossiers',
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
          rules: 'Filtres IA, de 3 à 50 selon la formule',
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
          'Superhuman vous fait parcourir chaque e-mail plus vite. Fewmail les parcourt pour vous et ne vous montre que ce qui a besoin de vous.',
        them: {
          ask: 'Ask AI, avec Business',
          drafts: 'Auto Drafts, avec Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox et Auto Labels',
          keepApp: 'Remplace votre app mail',
          mcp: 'Avec Business',
          phone: 'Apps iOS et Android',
          rules: 'Custom Auto Labels, avec Business',
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
          'Non. Fewmail fonctionne par-dessus Gmail. Tout ce qu’il fait apparaît aussi dans Gmail, et vous pouvez continuer à utiliser n’importe quelle app Gmail en parallèle.',
        question: 'Dois-je quitter Gmail ?',
      },
      {
        answer:
          'Jamais sans vous. Les réponses attendent dans votre file jusqu’à ce que vous les approuviez, et seules les règles que vous avez créées ou conservées peuvent archiver, marquer comme lu ou se désabonner seules. Tout ce qu’il a fait est listé dans Traités.',
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
          'Les comptes Gmail et Google Workspace, pour l’instant. Ajoutez plusieurs boîtes à un même Fewmail : leurs e-mails rejoignent le même Accueil et la même boîte de réception.',
        question: 'Quels comptes e-mail sont compatibles ?',
      },
    ],
    features: {
      description:
        'Ce qui vous prenait tout un après-midi, fait en arrière-plan et listé là où vous pouvez le vérifier.',
      items: {
        ask: {
          description:
            'Posez une question avec vos mots et obtenez la réponse tirée de vos propres e-mails, avec les messages d’où elle vient.',
          title: 'Interrogez vos e-mails',
        },
        boards: {
          description:
            'Argent, abonnements payants, voyages, commandes : décrivez ce que vous voulez suivre et l’agent le rassemble à partir d’un an d’e-mails au plus, avec des graphiques.',
          title: 'Tableaux',
        },
        calendar: {
          description:
            'Le calendrier de chaque boîte dans une seule vue. Une réunion proposée dans un e-mail devient un événement dès que vous dites oui.',
          title: 'Calendrier',
        },
        clearOut: {
          description:
            'Tout l’arriéré dégagé d’un coup, jusqu’à 50 000 e-mails par boîte, rangés sous un seul libellé pour qu’une seule annulation les ramène tous. Gratuit.',
          title: 'Faire le ménage',
        },
        reading: {
          description:
            'Les newsletters du jour dans une seule liste au calme, chacune résumée en quelques phrases.',
          title: 'Lecture',
        },
        voice: {
          description:
            'Appuyez sur Écouter dans Accueil pour entendre ce qui vous attend. Parlez à l’agent dans l’app, Telegram ou WhatsApp : il vous répond à voix haute.',
          title: 'Écoutez ce qui vous attend',
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
        'L’agent e-mail qui lit votre Gmail et ne vous montre que ce qui a besoin de vous.',
      versus: (name: string) => `vs ${name}`,
    },
    gone: {
      emphasis: 'n’aurez plus.',
      label: 'Ce qui disparaît',
      rows: [
        {
          fix: 'Faire le ménage vide tout l’arriéré d’un coup : vieilles pubs, notifications lues, listes que vous n’ouvrez jamais. Une seule annulation ramène chaque e-mail.',
          problem: 'Des milliers d’e-mails que personne ne lira jamais.',
        },
        {
          fix: 'Les réponses sont rédigées à l’avance, à votre façon et dans leur langue. Les réponses semblables s’approuvent ensemble avec ⇧⏎, et chacune reste à vous de vérifier.',
          problem: 'Répondre à ses e-mails à minuit.',
        },
        {
          fix: 'Une touche vous désabonne comme le ferait une personne : un clic, la page de désabonnement ou un e-mail. Les expéditeurs qui continuent d’écrire partent directement en spam.',
          problem:
            'Des newsletters auxquelles vous ne vous êtes jamais inscrit.',
        },
        {
          fix: 'Lecture rassemble les newsletters du jour dans une seule liste, chacune résumée en quelques phrases.',
          problem: 'Les newsletters que vous comptiez lire.',
        },
        {
          fix: 'Coordonnées bancaires modifiées, domaines qui en imitent un autre et phishing connu déclenchent une alerte avant que vous n’agissiez.',
          problem: 'Une facture avec de nouvelles coordonnées bancaires.',
        },
        {
          fix: 'Les promesses faites dans vos e-mails envoyés vous reviennent à l’échéance, et les fils restés sans réponse sont relancés.',
          problem: 'Ce que vous aviez promis, puis oublié.',
        },
        {
          fix: 'Seuls les e-mails urgents vous parviennent dans Telegram ou WhatsApp. Le reste vous attend dans Accueil, déjà trié, quand vous voulez.',
          problem: 'Vérifier ses e-mails au dîner, au cas où.',
        },
      ],
      title: 'Les soucis d’e-mail que vous n’aurez plus.',
    },
    hero: {
      needs: {
        emphasis: 'ont besoin de vous.',
        lead: (handled: string) =>
          `Anna attend le contrat, la facture de Northwind arrive à échéance la semaine prochaine et Marco veut un créneau jeudi. ${handled} newsletters et notifications ont été traitées, et Accueil se met à jour dès qu’un nouvel e-mail arrive.`,
        tag: 'Accueil · jeudi, 08:12',
        title: 'Trois choses ont besoin de vous.',
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
      lead: 'Newsletters, reçus, notifications, un lien de phishing et, quelque part là-dedans, les trois e-mails qui comptent vraiment. Fewmail est l’agent qui lit tout ça pour vous.',
      needYou: ((slots) => [
        slots.count,
        ' ont besoin de vous',
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
      home: 'Accueil',
      tryQueue: 'Essayer la file',
      unread: ((slots) => [slots.count, ' non lus']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' non lus dans votre boîte',
      ]) as Rich<'count'>,
      willDo: 'Fewmail va',
    },
    nav: {
      compare: 'Comparer',
      features: 'Fonctionnalités',
      mcp: 'Serveur MCP',
      pricing: 'Tarifs',
      signIn: 'Se connecter',
    },
    play: {
      again: 'Recommencer',
      doneLead: (handled: string) =>
        `Vous avez pris trois décisions. Fewmail s’est occupé des ${handled} autres et a noté pourquoi.`,
      doneTitle: 'C’est tout pour aujourd’hui.',
      emphasis: 'en deux minutes.',
      handled: [
        'Lumen Weekly : vous n’avez ouvert aucun des 30 derniers numéros',
        'paypa1-billing.com imite paypal.com',
        'Parcelhub : avis de livraison, selon la règle « Reçus et livraisons »',
      ],
      handledTitle: 'Traités pendant votre sommeil',
      label: 'Essayez',
      lead: 'Voilà à quoi ressemble une matinée désormais. Les brouillons sont rédigés, les raisons sont données, c’est vous qui décidez. Allez-y, videz la file.',
      left: (count: number) => `${count} à décider`,
      title: 'Toute votre boîte, en deux minutes.',
    },
    plans: {
      about: (emails: string, messages: string) =>
        `Environ ${emails} e-mails lus ou ${messages} messages à l’agent par mois`,
      oneAllowance:
        'Une seule enveloppe pour tout ce que fait l’agent : vous payez ce que vous utilisez, et le bruit ne compte jamais',
      everythingIn: (plan: string) => `Tout ce qu’offre ${plan}, plus`,
      forever: 'pour toujours',
      free: {
        description: 'Le tri, les règles et la protection. Pour toujours.',
        features: [
          'Chaque e-mail trié et noté selon son importance',
          'Des règles en langage courant qui archivent, marquent comme lu ou désabonnent',
          'Bouclier anti-spam communautaire et alertes de phishing',
          'Expéditeurs zombies repérés après votre désabonnement',
          'Relances automatiques des e-mails qui attendent une réponse',
          'Reporter, extraits et libellés Fewmail dans Gmail',
        ],
      },
      max: {
        description: 'Le même agent, pour une boîte très chargée.',
      },
      monthly: 'Mensuel',
      per: { month: 'par mois', year: 'par an' },
      lite: {
        description: 'L’agent complet : il lit, écrit et se souvient.',
        features: [
          'Accueil : une seule file de décisions en direct, à approuver une par une ou d’un coup',
          'Réponses rédigées à votre façon, envoyées seulement avec votre accord',
          'Telegram : les e-mails urgents, les approbations et les consignes vocales',
          'Promesses et contacts mémorisés, tableaux avec graphiques pour l’argent ou tout ce que vous suivez',
          'Interrogez vos e-mails sur tout, et MCP pour vos propres outils',
        ],
      },
      pro: {
        description: 'Le même agent, avec de la place pour plus de mails.',
      },
      tryFree: (days: number) => `Essai gratuit de ${days} jours`,
      yearly: 'Annuel · 2 mois offerts',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Le tri, les règles en langage courant et la protection sont gratuits pour toujours. Pro, c’est l’agent qui lit, écrit et se souvient pour vous ; Max, c’est le même agent avec de la marge pour une boîte très chargée. Chaque compte démarre avec ${trialDays} jours de Pro, et ensuite vous restez simplement en Gratuit.`,
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
            'Les brouillons vous attendent. Seules les règles que vous avez créées ou conservées peuvent archiver, marquer comme lu ou désabonner d’elles-mêmes, et tout ce qu’elles ont fait est listé dans Traités.',
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
    confirm: 'J’ai confirmé',
    follow_up: 'J’ai relancé',
    pay: 'J’ai payé',
    read: 'J’ai lu',
    renew: 'J’ai renouvelé',
    schedule: 'J’ai planifié',
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
    cleanup: 'Se désabonner de tout',
    consent: 'Approuver',
    commitment: 'Fait',
    security: 'J’ai vérifié',
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
  byRule: 'par une règle',
  calendar: {
    tomorrow: 'Demain',
    noAccess: {
      allow: 'Autoriser l’accès',
      description:
        'Google n’a pas été autorisé à partager votre agenda avec Fewmail. Autorisez-le pour voir et ajouter des événements ici.',
      title: 'Agenda non connecté',
    },
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
    agent: 'Agent',
    appearance: 'Apparence',
    goTo: 'Aller à',
    mail: 'E-mails',
    nothingMatches: 'Aucun résultat.',
    placeholder: 'Pose une question sur tes e-mails ou lance une commande…',
    upgrade: 'Passer à Pro',
    teachRule: 'Apprendre une nouvelle règle',
    theme: {
      dark: 'Sombre',
      light: 'Clair',
      system: 'Système',
    },
  },
  importance: ['Bruit', 'Bon à savoir', 'Bientôt pour vous', 'Urgent'],
  justNow: 'à l’instant',
  errors: {
    calendarAccess:
      'Fewmail n’a pas accès à cet agenda. Autorisez-le depuis la page Agenda.',
    failed: 'Un problème est survenu. Réessaie.',
    needsPro: 'Il faut Fewmail Pro pour cela.',
    alreadySent: 'Déjà envoyé, trop tard pour annuler.',
    notFound: 'Ceci n’existe plus. Il a peut-être été supprimé.',
    offline: 'Impossible de joindre Fewmail. Vérifie ta connexion.',
  },
  update: {
    available: 'Une nouvelle version de Fewmail est disponible.',
    reload: 'Recharger',
  },
  keys: {
    done: 'fait',
    openLink: 'ouvrir le lien',
    writeReminder: 'écrire une relance',
    summary: 'résumé',
    fromSender: 'plus de cet expéditeur',
    approvePicked: (n: number) => `approuver les ${n} choisis`,
    pick: 'choisir',
    pickAll: 'tout choisir',
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
    ask: 'poser une question',
    archive: 'archiver',
    approve: 'approuver',
    approveAll: (n: number) => `approuver les ${n} de ce type`,
    close: 'fermer',
    draftReply: 'brouillon',
    edit: 'modifier',
    move: 'naviguer',
    open: 'ouvrir',
    notOnBoard: 'pas sur ce tableau',
    rename: 'renommer',
    clearFilter: 'effacer le filtre',
    search: 'rechercher',
    send: 'envoyer',
    skip: 'passer',
    stopEditing: 'terminer',
    rewrite: 'réécrire',
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
      'Fewmail demande à lire, organiser et envoyer vos e-mails Gmail pour vous. Rien n’est envoyé ni archivé sans votre accord, sauf si vous créez une règle qui l’autorise. Il demande aussi ton Google Agenda, que tu peux décocher.',
    continue: 'Continuer avec Google',
    lead: 'Fewmail lit votre boîte de réception pour vous, répond avec votre style et ne vous montre que ce qui a vraiment besoin de vous.',
    messengers:
      'Aussi dans les messageries, à commencer par Telegram : recevez les e-mails urgents, approuvez les réponses ou envoyez simplement un message vocal.',
    title: 'L’essentiel, rien de plus.',
  },
  mail: {
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
    oneTimeCode: {
      archive: 'Copier et archiver',
      copied: 'Code copié',
      copy: 'Copier le code',
      trash: 'Copier et supprimer',
    },
    openUnsubscribePage: 'Ouvrir la page',
    unsubscribeYourself:
      'Pour quitter cette liste, termine sur sa page. Ses e-mails sont archivés en attendant.',
    allMailboxes: 'Toutes les boîtes',
    filterAbout: {
      focused: 'L’important et les personnes d’abord, notifications repliées',
      unread: 'Ce que tu n’as pas encore lu, par type',
      inbox: 'Tout, le plus récent en haut',
    },
    find: {
      back: 'Retour au courrier',
      open: 'Rechercher',
      recent: 'Recherches récentes',
      tips: 'Astuces',
      clearRecent: 'Effacer',
      describeExample: 'factures d’Anna le mois dernier',
      searching: 'Recherche dans tes e-mails…',
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
      'Fewmail a demandé le désabonnement, mais cet expéditeur est connu pour continuer d’écrire. Envoyer ses e-mails à la corbeille désormais ? Tu peux l’annuler dans Règles.',
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
    noThread: 'Choisissez un e-mail pour le lire ici',
    deleteDraft: 'Supprimer le brouillon',
    notSent: 'Non envoyé. Ouvrez pour réessayer',
    noRecipients: 'Aucun destinataire',
    notSpam: 'Pas un spam',
    reportSpam: 'Signaler comme spam',
    reportedSpam: 'Signalé. Ses e-mails vont désormais en spam.',
    archive: 'Archiver',
    archived: 'Archivé',
    attachment: 'pièce jointe',
    draftReply: 'Rédiger une réponse',
    drafting: 'Rédaction…',
    draftWaiting: 'Le brouillon vous attend dans Accueil',
    due: (date: string) => `échéance le ${date}`,
    dueHint: 'Échéance trouvée par l’agent dans cet e-mail',
    empty: 'Aucun e-mail ici',
    emptyHint: 'Les nouveaux e-mails apparaîtront ici dès leur arrivée.',
    noResults: 'Aucun résultat',
    noResultsHint: 'Essayez d’autres mots ou un autre dossier.',
    expectsReply: 'Attend une réponse',
    filter: {
      archive: 'Archives',
      trash: 'Corbeille',
      drafts: 'Brouillons',
      spam: 'Spam',
      inbox: 'Boîte de réception',
      snoozed: 'En attente',
      focused: 'Essentiel',
      unread: 'Non lus',
    },
    instruction:
      'Dites à l’agent comment répondre, ou appuyez simplement sur Entrée',
    open: 'Ouvrir',
    search: 'Recherchez ou décrivez : factures d’Anna le mois dernier',
    openInGmail: 'Ouvrir dans Gmail',
    unsubscribe: 'Se désabonner',
    unsubscribed: 'Désabonné',
    unsubscribeFailed:
      'Cet expéditeur ne propose pas de désabonnement en un clic, l’e-mail a donc été archivé.',
    you: 'Vous',
    replyTo: 'Répondre à',
    date: 'Date',
    authentication: 'Authentification',
    toLine: (recipients: string) => `à ${recipients}`,
  },
  subscriptions: {
    unsubscribeHint: (emails: string) =>
      `Fewmail vous désabonne de la liste et archive tout ce qu’elle a envoyé (${emails} ce mois-ci). Un désabonnement ne peut pas être annulé.`,
    archivedOnly:
      'Cet expéditeur n’a pas de désabonnement en un clic, ses e-mails ont donc été archivés. S’ils continuent d’arriver, ils iront en spam.',
    count: (total: number) => `Listes de diffusion : ${total}`,
    empty: 'Aucune liste de diffusion ne vous a écrit ce mois-ci.',
    lead: 'Les listes de diffusion qui vous ont écrit ce mois-ci, les plus actives d’abord. Se désabonner archive tout ce qu’elles ont envoyé ; ce qui arrive encore deux semaines plus tard part en spam.',
    opened: (total: number) =>
      total === 0 ? 'aucun ouvert' : `${total} ouverts`,
    title: 'Abonnements',
    unsubscribe: 'Se désabonner',
    unsubscribed: 'Désabonné',
  },
  nav: {
    labels: 'Libellés',
    folders: 'Dossiers',
    calendar: 'Calendrier',
    subscriptions: 'Abonnements',
    boards: 'Tableaux',
    newBoard: 'Nouveau tableau',
    mail: 'E-mails',
    reading: 'Lecture',
    rules: 'Règles',
    search: 'Rechercher ou demander…',
    settings: 'Réglages',
    syncFailed: 'Échec de la synchro Gmail, nouvelle tentative',
    syncing: 'Lecture de votre boîte…',
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
  onboarding: {
    boardsHint: (max: number) =>
      `Des pages que l’agent remplit à partir de vos e-mails, en commençant par les trois derniers mois. Choisissez-en jusqu’à ${max} ; vous pourrez ajouter les vôtres plus tard.`,
    boardsTitle: 'Que doit rassembler l’agent pour vous ?',
    languageHint:
      'L’app, les résumés et les explications utilisent cette langue. Les réponses suivent toujours la langue de l’e-mail auquel vous répondez.',
    languageTitle: 'Dans quelle langue Fewmail doit-il parler ?',
    lead: 'Deux réponses rapides. Vous pourrez tout modifier plus tard dans les Réglages.',
    reading: 'Lecture de votre boîte…',
    start: 'Commencer',
    title: 'Configurons votre agent.',
  },
  plan: {
    used: (percent: number) => `${percent} % utilisé`,
    about: (emails: string, messages: string) =>
      `Environ ${emails} e-mails lus ou ${messages} messages à l’agent par mois, dans n’importe quelle proportion.`,
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
    edit: 'Modifier',
    open: 'Ouvrir',
    send: 'Envoyer',
    rewrite: 'Réécrire',
    shorterInstruction: 'Fais plus court.',
    new: 'Nouveau',
    skipStale: 'Les passer',
    skipped: (n: number) => `Passées : ${n}`,
    stale: (n: number) => `Plus d’une semaine : ${n}`,
    skip: 'Passer',
  },
  rules: {
    deleted: 'Règle supprimée',
    add: 'Ajouter une règle',
    count: (total: number) =>
      plural('fr', total, {
        one: (n) => `${n} règle`,
        other: (n) => `${n} règles`,
      }),
    delete: 'Supprimer',
    describe: {
      alwaysShow: 'Arrive toujours dans Accueil',
      autonomous: 'Fait automatiquement, listé dans les e-mails traités',
      draft: 'Un brouillon vous attend dans Accueil',
    },
    effect: {
      trash: 'Le mettre à la corbeille',
      always_show: 'Toujours me montrer',
      archive: 'L’archiver',
      draft_reply: 'Rédiger une réponse',
      mark_read: 'Marquer comme lu',
      unsubscribe: 'Se désabonner',
    },
    enabled: 'Règle activée',
    lead: 'Dites à l’agent avec vos mots quoi faire de certains e-mails. Il compare chaque e-mail à ces règles.',
    newTitle: 'Apprendre une nouvelle règle',
    placeholder: 'ex. Factures de Hetzner ou notifications LinkedIn',
    leadFree:
      'Archivez, marquez comme lu ou désabonnez-vous automatiquement. Les règles s’appliquent aux nouveaux e-mails dès leur arrivée.',
    simple: {
      appliedAutomatically: 'Appliquée automatiquement aux nouveaux e-mails',
      field: {
        from: 'De',
        mailingList: 'Toute liste de diffusion',
        subject: 'L’objet contient',
      },
      title: {
        from: (value: string) => `De « ${value} »`,
        mailingList: () => 'Toute liste de diffusion',
        subject: (value: string) => `L’objet contient « ${value} »`,
      },
      valuePlaceholder: 'anna@example.com, un nom ou un mot',
      whichField: 'Critère',
    },
    title: 'Règles',
    whatAgentDoes: 'Ce que fait l’agent',
    whichEmails: 'Quels e-mails',
  },
  settings: {
    disconnectConfirm: (name: string) => `Déconnecter ${name} ?`,
    messengerDisconnectHint:
      'Le bot ne vous écrira plus. Pour le reconnecter, il faudra un nouveau lien depuis cette page.',
    readingDigest: {
      description:
        'Chaque matin, les newsletters de la veille arrivent dans Telegram et WhatsApp en un seul message.',
      title: 'Résumé des newsletters',
    },
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
    morningDescription: (timezone: string) =>
      `Résumé des newsletters et rapport hebdomadaire du lundi, dans votre fuseau horaire, ${timezone}`,
    morningTitle: 'Messages du matin',
    deleteAccount: 'Supprimer le compte',
    deleteConfirm: 'Tout supprimer',
    deleteDescription:
      'Supprime immédiatement de Fewmail votre compte, les e-mails synchronisés, les brouillons et les règles. Votre Gmail lui-même n’est pas touché.',
    deleteTitle: 'Supprimer votre compte Fewmail ?',
    cancel: 'Annuler',
    integrations: 'Intégrations',
    language: 'Langue',
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
      signIn: 'Vous vous connectez avec celle-ci',
      signInChosen:
        'C’est le compte avec lequel vous vous connectez. Choisissez-en un autre.',
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
    reasonYou: 'Tu as signalé cet expéditeur comme spam',
    suspect: 'Ressemble à du spam',
  },
  starterRules: {
    alwaysShow:
      'Alertes de sécurité, factures à payer, tout ce qui vient de ma banque ou de l’administration',
    newsletters: 'Newsletters et récapitulatifs',
    notifications: 'Notifications automatiques des outils et services',
    promotions: 'Promotions, marketing et prospection commerciale à froid',
    receipts: 'Reçus, confirmations de commande et d’expédition',
  },
  telegram: {
    approveAlike: 'Approuver d’un coup toutes les cartes d’un même type :',
    heard: (text: string) => `Entendu : « ${text} »`,
    voiceFailed: 'Je n’ai pas compris. Réessayez ou écrivez-le.',
    help: 'Écrivez ou dites ce qu’il vous faut :\n• une question sur vos e-mails : « quand Netflix se renouvelle-t-il ? »\n• quoi répondre : « dis à Anna que je signe demain »\n• une tâche : « crée un tableau pour les voyages »\n• répondez à l’un de mes brouillons pour le modifier',
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
    allKinds: 'Tous',
    ruleOffer: {
      lead: 'L’agent peut s’en charger seul pour les e-mails concernés. La règle reste désactivée tant que tu ne dis pas oui.',
      no: 'Laisser désactivée',
      turnedOn: 'Activée. Modifiable dans Règles.',
      yes: 'Activer',
    },
    newSender: {
      archive: 'Toujours archiver',
      archived:
        'Les nouveaux e-mails de cet expéditeur seront archivés. Tu peux changer ça dans Règles.',
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
    acted: (total: number) =>
      plural('fr', total, {
        one: () => 'L’agent a fait une chose pour toi',
        many: (n) => `L’agent a fait ${n} choses pour toi`,
        other: (n) => `L’agent a fait ${n} choses pour toi`,
      }),
    allDone: 'Tout est fait. Rien ne t’attend.',
    allDoneLead:
      'Je continue à lire les nouveaux e-mails, et ce qui demande ton attention apparaîtra ici.',
    byRules: (n: number) => `Tes règles se sont occupées de ${n}.`,
    decisions: 'Décisions',
    journal: {
      approved: 'Tu as dit oui',
      byRule: (rule: string) => `Ta règle : ${rule}`,
      empty:
        'Rien pour l’instant. Tant que tu ne dis pas oui, l’agent se contente de lire.',
      failed: 'N’a pas fonctionné',
      now: 'Maintenant',
      lead: 'Les 7 derniers jours. Chaque changement dans tes e-mails, ton agenda ou tes tableaux a eu ton oui ou une règle que tu as activée.',
      title: 'Ce que l’agent a fait',
    },
    progress: (done: number, total: number) => `${done} sur ${total}`,
    readAll:
      'Je les ai tous lus, et rien ne change dans tes e-mails sans ton oui.',
    worthKnowing: 'Bon à savoir',
    tidy: {
      confirm: (emails: string) => `Ranger ${emails} ?`,
      running: 'Rangement…',
      unsubscribeHint:
        'Certains sont des listes dont Fewmail vous désabonnera, ce qui ne peut pas être annulé. Détails (D) montre d’abord chaque e-mail.',
      archive: (n: number) => `${n} à archiver`,
      details: 'Détails',
      done: (n: number) => `${n} rangés`,
      keep: 'Garder',
      mark_read: (n: number) => `${n} à marquer comme lus`,
      run: 'Ranger',
      total: (n: number) => `E-mails calmes à ranger : ${n}`,
      unsubscribe: (n: number) => `${n} à désabonner`,
    },
    stopListening: 'Arrêter',
    awaiting: 'En attente de réponse',
    hint: {
      notNow: 'Pas maintenant',
      setUp: 'Configurer',
      turnOn: 'Activer',
    },
    dates: 'Dates et rendez-vous',
    done: 'Fait',
    firstRead:
      'Je lis tes e-mails des trois derniers jours. Ce qui demande ton attention apparaîtra ici tout seul, et rien ne change tant que tu ne dis pas oui.',
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
    nothingNeedsYou:
      'Rien ne vous attend pour l’instant. Les nouveaux e-mails sont lus dès leur arrivée.',
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
      `Fewmail t’a fait gagner environ ${formatMinutes('fr', minutes)} cette semaine`,
    savedHow: (handled: number, replies: number) =>
      `Traités tout seul : ${handled} · Réponses envoyées depuis les brouillons : ${replies}`,
    recent: (period: string) => `Aussi ${period}`,
    sent: 'Envoyé',
    codes: 'Codes de connexion',
    worthAttention: 'Mérite votre attention',
  },
  boards: {
    chartRemoved: 'Graphique retiré',
    addTo: 'Ajouter à un tableau',
    added: (board: string) => `Ajouté à ${board}`,
    cancel: 'Annuler',
    chart: {
      add: 'Ajouter un graphique',
      ask: 'Décris le graphique',
      askPlaceholder: 'Dépenses par boutique, commandes par statut…',
      currency: 'Devise',
      edit: 'Réglages du graphique',
      empty: 'Rien à afficher pour l’instant',
      groupBy: 'Regroupé par',
      groupings: {
        group: 'Qui ou quoi',
        month: 'Mois',
        status: 'Statut',
        week: 'Semaine',
      },
      measure: 'Affiche',
      measures: { count: 'Nombre', sum: 'Montant total' },
      moveEarlier: 'Avancer',
      moveLater: 'Reculer',
      other: 'Autres',
      remove: 'Retirer le graphique',
      skipped: (n: number) =>
        `Non comptées : ${n} dans une autre devise ou sans montant`,
      title: 'Titre du graphique',
      type: 'Type de graphique',
      types: {
        area: 'Aire',
        bar: 'Barres',
        line: 'Ligne',
        pie: 'Camembert',
      },
      untitled: 'Nouveau graphique',
      weekOf: (date: string) => `Semaine du ${date}`,
    },
    charts: 'Graphiques',
    create: 'Créer le tableau',
    delete: 'Supprimer le tableau',
    deleteConfirm: (name: string) => `Supprimer « ${name} » ?`,
    deleteHint:
      'Ses entrées et graphiques partent avec lui. Tes e-mails restent où ils sont.',
    describe: 'Changer ce qu’il rassemble',
    description: 'Ce qu’il rassemble',
    descriptionPlaceholder:
      'Voyages : vols, hôtels et locations de voiture, avec leur coût',
    due: (when: string) => `À venir : ${when}`,
    empty:
      'Encore vide. Les e-mails correspondants apparaîtront ici dès leur arrivée.',
    entries: (total: number) =>
      plural('fr', total, {
        one: () => 'Une entrée',
        other: (n) => `${n} entrées`,
      }),
    entry: {
      edited: 'Modifiée par toi',
      nextOn: (date: string) => `prochaine : ${date}`,
      remove: 'Pas sur ce tableau',
      removed: 'Retirée du tableau. Il en tiendra compte.',
    },
    expected: (when: string) => `Prévu ${when}`,
    filter: {
      clear: 'Effacer le filtre',
      nothing: 'Aucune entrée ne correspond.',
      search: 'Rechercher des entrées',
    },
    groups: {
      every: {
        month: 'chaque mois',
        quarter: 'chaque trimestre',
        week: 'chaque semaine',
        year: 'chaque année',
      },
      expected: (date: string) => `prévu ${date}`,
      next: (date: string) => `prochain : ${date}`,
      perMonth: (amount: string) => `${amount} / mois`,
      rename: 'Renommer le groupe',
      renameHint: 'Donne-lui le nom d’un autre groupe pour les fusionner.',
      showAll: (n: number) => `Tout afficher (${n})`,
      showFewer: 'Afficher moins',
      title: 'Par qui ou quoi',
    },
    history: {
      capped: (n: number) =>
        `Les ${n} e-mails correspondants les plus récents de la période ont été lus.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Parcours des e-mails de la période…'
          : `Lecture : ${plural('fr', found, { one: () => 'un e-mail', other: (n) => `${n} e-mails` })} · ${plural('fr', entries, { one: () => 'une entrée', other: (n) => `${n} entrées` })} pour l’instant`,
    },
    menu: 'Actions du tableau',
    moveDown: 'Descendre',
    moveUp: 'Monter',
    name: 'Nom',
    namePlaceholder: 'Voyages',
    new: 'Nouveau tableau',
    newHint:
      'Décris avec tes mots ce qu’il faut rassembler. Fewmail le retrouve dans tes e-mails aussi loin que tu choisis, choisit les graphiques et tient le tout à jour.',
    period: 'Période',
    periods: {
      1: 'Dernier jour',
      7: 'Dernière semaine',
      30: 'Dernier mois',
      90: '3 derniers mois',
      180: '6 derniers mois',
      365: 'Dernière année',
    },
    planning: 'Mise en place…',
    redescribe: 'Enregistrer et relire',
    redescribeHint:
      'Relit la période avec la nouvelle description. Les entrées que tu as modifiées ou retirées restent.',
    rename: 'Renommer le tableau',
    save: 'Enregistrer',
    settings: {
      bannerDays: 'Prévenir avant une date',
      days: (n: number) =>
        plural('fr', n, {
          one: () => '1 jour avant',
          other: (count) => `${count} jours avant`,
        }),
      hint: 'Jusqu’où le tableau remonte et quand il te prévient avant une date.',
      never: 'Jamais',
      title: 'Réglages du tableau',
    },
    starter: {
      events: {
        description:
          'Billets, réservations et rendez-vous : où je dois être, quand et avec qui.',
        name: 'Événements',
      },
      health: {
        description:
          'Rendez-vous médicaux, ordonnances, résultats et remboursements : qui j’ai vu, quand et combien ça a coûté.',
        name: 'Santé',
      },
      home: {
        description:
          'Loyer, charges, travaux et contrats pour mon logement : ce qui est dû, à qui et combien.',
        name: 'Logement',
      },
      invoices: {
        description:
          'Factures que j’émets et reçois pour mon travail : client ou fournisseur, montant, échéance et si elle est payée.',
        name: 'Factures pro',
      },
      jobs: {
        description:
          'Candidatures, entretiens et offres : quelle entreprise, quel poste et où en est chacune.',
        name: 'Recherche d’emploi',
      },
      learning: {
        description:
          'Cours, formations et courriers de l’école ou de la fac : échéances, notes, certificats et ce qu’ils coûtent.',
        name: 'Formation',
      },
      money: {
        description:
          'Paiements, abonnements, factures et remboursements : ce que je paie, à qui et combien.',
        name: 'Argent',
      },
      orders: {
        description:
          'Commandes en ligne et livraisons : ce que j’ai acheté, chez qui et où en est le colis.',
        name: 'Commandes',
      },
      subscriptions: {
        description:
          'Les services que je paie régulièrement : combien coûte chacun, à quelle fréquence et quand il se renouvelle.',
        name: 'Abonnements payants',
      },
      trips: {
        description:
          'Vols, trains, hôtels et locations : où je vais, quand et combien ça coûte.',
        name: 'Voyages',
      },
    },
    summary: {
      lastMonth: 'Mois dernier',
      perMonth: (amount: string) => `${amount} par mois`,
      recurring: (n: number) =>
        plural('fr', n, {
          one: () => 'Un récurrent',
          other: (count) => `${count} récurrents`,
        }),
      thisMonth: 'Ce mois-ci',
      upcoming: 'Échéance sous 30 jours',
    },
  },
  bulk: {
    badge: (n: number) => `Envoyé à plus de ${n} utilisateurs de Fewmail`,
    reason: (n: number) =>
      `E-mail de masse : plus de ${n} utilisateurs de Fewmail ont reçu le même texte`,
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
    groups: {
      lists: 'Newsletters que tu n’ouvres jamais',
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
    run: (emails: string) => `Ranger ${emails}`,
    safe: 'Rien n’est supprimé. Les e-mails rangés sont archivés avec le libellé Fewmail/Cleared et reviennent en un clic ; tu es aussi désabonné des newsletters.',
    scanning:
      'Je lis toute la boîte de réception, en-têtes seulement. Jusqu’à une minute.',
    title: 'Faire le ménage dans la boîte de réception',
    undo: 'Tout remettre',
    undone: (emails: string) =>
      `${emails} de retour dans la boîte de réception`,
  },
  wrapped: {
    busiest: (day: string, hour: string) =>
      `Pic d’activité : ${day}, vers ${hour}`,
    copied: 'Lien copié',
    copyLink: 'Copier le lien',
    cta: 'Obtiens le tien avec Fewmail',
    emails: 'e-mails reçus',
    empty:
      'Pas encore assez d’e-mails pour raconter l’histoire. Reviens dans quelques jours.',
    handled: 'traités par Fewmail tout seul',
    people: 'Qui a le plus écrit',
    period: { month: 'Ce mois-ci', year: 'Cette année' },
    replies: 'réponses rédigées par Fewmail et envoyées',
    saveImage: 'Enregistrer l’image',
    saved: 'gagnés grâce à Fewmail',
    shareNote:
      'Le lien et l’image ne montrent que ces chiffres, jamais de noms ni d’adresses.',
    shared: { month: 'Un mois en e-mails', year: 'Une année en e-mails' },
    spam: 'spams arrêtés',
    split: (people: string, lists: string) =>
      `${people} de personnes · ${lists} de newsletters`,
    title: { month: 'Ton mois en e-mails', year: 'Ton année en e-mails' },
    unsubscribed: 'newsletters quittées',
  },
  reading: {
    summary: 'Ce que disent vos newsletters',
    worth: 'À lire en entier',
    leftOut: (n: number) => `Laissées de côté : ${n}, rien de nouveau.`,
    since: (n: number) =>
      `Arrivées après le résumé : ${n}, elles seront dans le prochain.`,
    note: {
      inSummary: 'Dans le résumé',
      leftOut: 'Laissée de côté',
      since: 'Après le résumé',
    },
    digest: (n: number) => `Newsletters du jour : ${n}`,
    lead: 'Les newsletters du dernier jour au même endroit, pour qu’elles n’encombrent pas la boîte de réception.',
    title: 'Lecture',
  },
  commitments: {
    title: 'Vous avez promis',
  },
  people: {
    firstContact: (date: string) => `Échanges depuis ${date}`,
    lastContact: (date: string) => `Dernier e-mail le ${date}`,
    open: 'En attente dans d’autres fils',
    promised: 'Vous avez promis',
    threads: (total: number) =>
      plural('fr', total, {
        one: () => '1 conversation',
        many: (n) => `${n} conversations`,
        other: (n) => `${n} conversations`,
      }),
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} figure sur une liste publique de sites d’hameçonnage actifs. N’ouvrez aucun lien, ne vous connectez pas et ne payez pas.`,
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
    ask: 'Interroge tes e-mails',
    hints: {
      ask: 'Inclus dans Fewmail Pro : demande ce que tu veux avec tes mots et obtiens la réponse tirée de tes propres e-mails.',
      boards:
        'Inclus dans Fewmail Pro : décris ce qu’il faut rassembler, l’agent le retrouve dans tes e-mails et le tient à jour.',
      drafts:
        'Inclus dans Fewmail Pro : l’agent rédige la réponse dans ton style, tu la modifies et l’envoies.',
      home: 'Inclus dans Fewmail Pro : les e-mails qui ont besoin de toi, avec des réponses déjà rédigées, mis à jour à chaque nouvel e-mail.',
    },
  },
  whatsapp: {
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
