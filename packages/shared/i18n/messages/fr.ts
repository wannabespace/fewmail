import type { Rich } from '../locales'
import { plural } from '../locales'
import type { Messages } from './en'

export const fr: Messages = {
  ask: {
    label: (question: string) => `Demander à Fewmail : « ${question} »`,
    thinking: 'Je parcours vos e-mails…',
  },
  compose: {
    backInQueue: 'Annulé. Le brouillon est de retour dans Aujourd’hui.',
    canceled: 'Annulé. Votre e-mail est de retour dans l’éditeur.',
    cc: 'Cc',
    discard: 'Supprimer',
    forward: 'Transférer',
    forwardedMessage: 'Message transféré',
    from: 'De',
    instructionPlaceholder: 'Quel ton adopter ? (facultatif)',
    invalidRecipients: 'Ajoutez au moins une adresse e-mail valide.',
    later: {
      inHour: 'Dans une heure',
      monday: 'Lundi matin',
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
  snooze: {
    laterToday: 'Plus tard aujourd’hui',
    nextWeek: 'La semaine prochaine',
    title: 'Reporter',
    tomorrow: 'Demain',
    unsnooze: 'Remettre en boîte de réception',
    until: (date: string) => `Reporté jusqu’au ${date}`,
    weekend: 'Ce week-end',
  },
  actionKind: {
    cleanup: 'Se désabonner de tout',
    commitment: 'Fait',
    security: 'J’ai vérifié',
    task: 'Envoyer',
    spam: 'Mis en spam',
    trash: 'Mettre à la corbeille',
    archive: 'Archiver',
    follow_up: 'Relancer',
    mark_read: 'Marquer lu',
    pay: 'Payer',
    read: 'Lire',
    reply: 'Répondre',
    schedule: 'Planifier',
    unsubscribe: 'Se désabonner',
  },
  actionStatus: {
    auto_done: 'fait par l’agent',
    dismissed: 'ignoré',
    done: 'fait',
    failed: 'échec',
    pending: 'en attente dans Aujourd’hui',
  },
  byRule: 'par une règle',
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
    checkMail: 'Vérifier les nouveaux e-mails',
    goTo: 'Aller à',
    inboxUpToDate: 'Boîte de réception à jour',
    mail: 'E-mails',
    nothingMatches: 'Aucun résultat.',
    placeholder: 'Rechercher un e-mail ou lancer une commande…',
    rewriteBrief: 'Réécrire le brief',
    searchFor: (query: string) => `Rechercher « ${query} » dans les e-mails`,
    upgrade: 'Passer à Pro',
    teachRule: 'Apprendre une nouvelle règle',
    theme: {
      dark: 'Thème sombre',
      light: 'Thème clair',
      system: 'Comme le système',
    },
  },
  importance: ['Bruit', 'Bon à savoir', 'Bientôt pour vous', 'Urgent'],
  keys: {
    reply: 'répondre',
    snooze: 'reporter',
    anything: 'n’importe quoi',
    archive: 'archiver',
    approve: 'approuver',
    close: 'fermer',
    draftReply: 'brouillon',
    edit: 'modifier',
    move: 'naviguer',
    open: 'ouvrir',
    search: 'rechercher',
    send: 'envoyer',
    skip: 'passer',
    stopEditing: 'terminer',
  },
  legal: {
    privacy: 'Politique de confidentialité',
    englishOnly:
      'Ce document est fourni en anglais, qui en est la version faisant foi.',
    terms: 'Conditions d’utilisation',
    updated: (date: string) => `Dernière mise à jour : ${date}`,
  },
  login: {
    agree: ((slots) => [
      'En continuant, vous acceptez les ',
      slots.terms,
      ' et la ',
      slots.privacy,
      '.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Fewmail demande à lire, organiser et envoyer vos e-mails Gmail pour vous. Rien n’est envoyé ni archivé sans votre accord, sauf si vous créez une règle qui l’autorise.',
    continue: 'Continuer avec Google',
    lead: 'Fewmail lit votre boîte de réception pour vous, répond avec votre style et ne vous montre que ce qui a vraiment besoin de vous.',
    messengers:
      'Aussi dans les messageries, à commencer par Telegram : recevez le brief, approuvez les réponses ou envoyez simplement un message vocal.',
    title: 'L’essentiel, rien de plus.',
  },
  mail: {
    block: 'Bloquer l’expéditeur',
    blocked: 'Bloqué. Ses e-mails vont désormais à la corbeille.',
    forward: 'Transférer',
    more: 'Plus',
    reply: 'Répondre',
    trash: 'Mettre à la corbeille',
    trashed: 'Mis à la corbeille',
    movedToInbox:
      'Remis dans la boîte de réception. Merci de nous l’avoir dit.',
    noThread: 'Choisissez un e-mail pour le lire ici',
    notSpam: 'Pas un spam',
    reportSpam: 'Signaler comme spam',
    reportedSpam: 'Signalé. Ses e-mails vont désormais en spam.',
    archive: 'Archiver',
    archived: 'Archivé',
    attachment: 'pièce jointe',
    draftReply: 'Rédiger une réponse',
    drafting: 'Rédaction…',
    draftWaiting: 'Le brouillon vous attend dans Aujourd’hui',
    due: (date: string) => `échéance le ${date}`,
    empty: 'Aucun e-mail ici.',
    expectsReply: 'Attend une réponse',
    filter: {
      spam: 'Spam',
      inbox: 'Boîte de réception',
      snoozed: 'En attente',
      important: 'Importants',
      needs_reply: 'À répondre',
      quiet: 'Calmes',
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
  },
  nav: {
    boards: 'Tableaux',
    newBoard: 'Nouveau tableau',
    mail: 'E-mails',
    rules: 'Règles',
    search: 'Rechercher ou demander…',
    settings: 'Réglages',
    syncFailed: 'Échec de la synchro Gmail, nouvelle tentative',
    syncing: 'Lecture de votre boîte…',
    today: 'Aujourd’hui',
    trialLeft: (total: number) =>
      plural('fr', total, {
        one: (n) => `Essai Pro · ${n} jour restant`,
        many: (n) => `Essai Pro · ${n} jours restants`,
        other: (n) => `Essai Pro · ${n} jours restants`,
      }),
    watching: 'L’agent surveille votre boîte',
  },
  notifications: {
    many: (total: number) =>
      plural('fr', total, {
        other: (n) => `${n} nouveautés de Fewmail`,
      }),
  },
  onboarding: {
    languageHint:
      'L’app, les briefs, les résumés et les explications utilisent cette langue. Les réponses suivent toujours la langue de l’e-mail auquel vous répondez.',
    languageTitle: 'Dans quelle langue Fewmail doit-il parler ?',
    lead: 'Deux réponses rapides. Vous pourrez tout changer plus tard dans les Réglages.',
    personaTitle: 'Comment utilisez-vous vos e-mails ?',
    reading: 'Lecture de votre boîte…',
    start: 'Commencer',
    title: 'Configurons votre agent.',
  },
  plan: {
    free: 'Gratuit',
    freeDescription:
      'Des e-mails rapides et sereins avec des règles simples. Gratuit aussi longtemps que vous le souhaitez.',
    includes:
      'Pro ajoute l’agent : un brief quotidien, chaque e-mail lu et résumé, des réponses rédigées à votre façon, des règles en langage courant, Telegram et MCP.',
    manage: 'Gérer la facturation',
    price: (usd: number) => `$${usd} / mois`,
    pro: 'Pro',
    proCancels: (date: string) => `Pro jusqu’au ${date}, puis Gratuit.`,
    proRenews: (date: string) => `Renouvellement le ${date}.`,
    title: 'Formule',
    trial: 'Essai Pro',
    trialDescription: (date: string) =>
      `Toutes les fonctions Pro jusqu’au ${date}. Ensuite, Fewmail reste gratuit avec des règles simples, sans carte bancaire.`,
    upgrade: 'Passer à Pro',
    welcome: 'Bienvenue dans Pro. L’agent reprend du service.',
  },
  persona: {
    reader: {
      description:
        'Je lis surtout. Gardez ma boîte au calme, gérez le bruit et ne laissez rien d’important passer.',
      title: 'Je lis surtout',
    },
    responder: {
      description:
        'Je réponds beaucoup. Mettez en premier ceux qui attendent ma réponse et rédigez des brouillons avec mon style.',
      title: 'Je réponds beaucoup',
    },
  },
  queue: {
    draftedInVoice: 'Rédigé avec votre style',
    edit: 'Modifier',
    open: 'Ouvrir',
    send: 'Envoyer',
    shorter: 'Plus court',
    shorterInstruction: 'Fais plus court.',
    skip: 'Passer',
  },
  rules: {
    actWithoutAsking: 'Agir sans demander',
    add: 'Ajouter une règle',
    count: (total: number) =>
      plural('fr', total, {
        one: (n) => `${n} règle`,
        other: (n) => `${n} règles`,
      }),
    delete: 'Supprimer',
    describe: {
      alwaysShow: 'Arrive toujours dans Aujourd’hui',
      autonomous: 'Fait automatiquement, listé dans les e-mails traités',
      draft: 'Un brouillon vous attend dans Aujourd’hui',
      suggested: 'Suggéré dans Aujourd’hui, vous confirmez',
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
    lead: 'Dites à l’agent avec vos mots quoi faire de certains e-mails. Il compare chaque e-mail à ces règles, de haut en bas.',
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
    withoutAsking: 'Sans demander',
  },
  settings: {
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
    briefDescription: (timezone: string) =>
      `Dans votre fuseau horaire, ${timezone}`,
    briefTitle: 'Brief quotidien',
    deleteAccount: 'Supprimer le compte',
    deleteConfirm: 'Tout supprimer',
    deleteDescription:
      'Supprime immédiatement de Fewmail votre compte, les e-mails synchronisés, brouillons, règles et briefs. Votre Gmail lui-même n’est pas touché.',
    deleteTitle: 'Supprimer votre compte Fewmail ?',
    cancel: 'Annuler',
    integrations: 'Intégrations',
    language: 'Langue',
    languageDescription:
      'App, briefs et résumés. Les réponses suivent l’e-mail.',
    legal: 'Mentions légales',
    mailboxes: {
      add: 'Ajouter Gmail',
      addDescription:
        'Le courrier d’un autre compte Gmail rejoint le même Aujourd’hui et la même boîte de réception. Il ne connecte jamais personne ici : se connecter avec lui ouvre un Fewmail distinct.',
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
      copyNow:
        'Copiez cette configuration maintenant : la clé ne s’affiche qu’une fois.',
      create: 'Créer une clé',
      defaultName: 'Client MCP',
      description:
        'Ils peuvent lire votre brief et vos e-mails, rédiger des réponses et les envoyer après votre confirmation.',
      keyName: 'Nom de la clé',
      neverUsed: 'Jamais utilisée',
      revoke: 'Révoquer',
      title: 'Connecter Claude, Cursor ou tout client MCP',
      used: (ago: string) => `Utilisée ${ago}`,
    },
    persona: 'Votre usage des e-mails',
    signedInWithGoogle: 'Connecté avec Google',
    signOut: 'Se déconnecter',
    notifications: {
      blocked:
        'Les notifications sont bloquées. Autorisez-les dans les paramètres du site du navigateur.',
      browser: 'Ce navigateur',
      notConfigured:
        'Les notifications du navigateur ne sont pas configurées sur ce serveur.',
      off: 'Recevez ici les e-mails urgents et le brief quotidien, même quand Fewmail est fermé.',
      on: 'Les e-mails urgents et le brief quotidien s’affichent ici. Plusieurs à la fois arrivent en une seule.',
      title: 'Notifications',
      unsupported: 'Ce navigateur ne peut pas afficher de notifications.',
    },
    telegram: {
      connect: 'Connecter Telegram',
      disconnect: 'Déconnecter',
      linked:
        'Votre brief arrive chaque matin, les e-mails urgents tout de suite. Approuvez et modifiez les brouillons depuis le chat.',
      notConfigured: 'Le bot Telegram n’est pas configuré sur ce serveur.',
      unlinked: 'Recevez le brief et approuvez les brouillons depuis Telegram.',
    },
    whatsapp: {
      connect: 'Connecter WhatsApp',
      disconnect: 'Déconnecter',
      linked:
        'Votre brief arrive chaque matin, les e-mails urgents tout de suite. Approuvez et modifiez les brouillons depuis le chat.',
      notConfigured: 'Le bot WhatsApp n’est pas configuré sur ce serveur.',
      unlinked: 'Recevez le brief et approuvez les brouillons depuis WhatsApp.',
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
    people:
      'E-mails de vraies personnes qui me posent une question ou attendent ma réponse',
    promotions: 'Promotions, marketing et prospection commerciale à froid',
    receipts: 'Reçus, confirmations de commande et d’expédition',
  },
  telegram: {
    heard: (text: string) => `Entendu : « ${text} »`,
    voiceFailed: 'Je n’ai pas compris. Réessayez ou écrivez-le.',
    whichEmail:
      'Quel e-mail ? Répondez à l’un de mes messages avec ce qu’il faut dire.',
    canceled: 'Annulé. Le brouillon est de retour dans votre file.',
    sendingIn: (seconds: number) => `Envoi dans ${seconds} s`,
    undo: 'Annuler',
    commands: { brief: 'Brief du jour', queue: 'Ce qui vous attend' },
    connectFirst:
      'Ouvrez d’abord Fewmail → Réglages → Intégrations et touchez « Connecter Telegram ».',
    connected:
      'Connecté. Je vous enverrai votre brief chaque matin et vous préviendrai dès que quelque chose d’urgent arrive.\n\n/brief — brief du jour\n/queue — ce qui vous attend',
    done: 'Fait',
    draft: 'Brouillon :',
    edit: 'Modifier',
    editPrompt:
      'Envoyez-moi le texte à utiliser à la place, ou dites-moi comment le modifier en commençant par « / », ex. « /plus formel ».',
    newDraft: 'Nouveau brouillon :',
    nothing: 'Rien ne vous attend pour l’instant.',
    proOnly:
      'Telegram fait partie de Fewmail Pro. Ouvrez Réglages → Formule dans Fewmail pour passer à Pro.',
    queueHint: '/queue — ce qui vous attend',
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
    hint: {
      notNow: 'Pas maintenant',
      setUp: 'Configurer',
      turnOn: 'Activer',
    },
    later: (total: number, time: string) =>
      plural('fr', total, {
        one: () => `Une autre arrive à ${time}`,
        many: (n) => `${n} autres arrivent à ${time}`,
        other: (n) => `${n} autres arrivent à ${time}`,
      }),
    briefArrives: (time: string) => `Votre brief arrive chaque jour à ${time}.`,
    briefFrom: (time: string) => `brief de ${time}`,
    done: 'Fait',
    firstRead:
      'Je lis tes e-mails des trois derniers jours. Ce qui demande ton attention apparaîtra ici tout seul.',
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
    sent: 'Envoyé',
    waitingOnYou: 'Vous attendent',
    worthAttention: 'Mérite votre attention',
    writeNow: 'L’écrire maintenant',
    writing: 'Rédaction…',
  },
  boards: {
    chart: {
      add: 'Ajouter un graphique',
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
      other: 'Autres',
      remove: 'Retirer le graphique',
      title: 'Titre du graphique',
      type: 'Type de graphique',
      types: {
        area: 'Aire',
        bar: 'Barres',
        line: 'Ligne',
        pie: 'Camembert',
      },
      untitled: 'Nouveau graphique',
    },
    charts: 'Graphiques',
    create: 'Créer le tableau',
    delete: 'Supprimer le tableau',
    description: 'Ce qu’il rassemble',
    descriptionPlaceholder:
      'Voyages : vols, hôtels et locations de voiture, avec leur coût',
    edit: 'Modifier le tableau',
    editHint:
      'Si tu changes ce qu’il rassemble, les six derniers mois sont relus.',
    empty:
      'Encore vide. Les e-mails correspondants apparaîtront ici dès leur arrivée.',
    entries: (total: number) =>
      plural('fr', total, {
        one: () => 'Une entrée',
        other: (n) => `${n} entrées`,
      }),
    name: 'Nom',
    namePlaceholder: 'Voyages',
    new: 'Nouveau tableau',
    newHint:
      'Décris avec tes mots ce qu’il faut rassembler. Fewmail le retrouve dans les e-mails des six derniers mois, choisit les graphiques et tient le tout à jour.',
    planning: 'Mise en place…',
    readingHistory: 'Lecture des e-mails des six derniers mois…',
    save: 'Enregistrer',
    starter: {
      money: {
        description:
          'Paiements, abonnements, factures et remboursements : ce que je paie, à qui et combien.',
        name: 'Argent',
      },
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
  commitments: {
    title: 'Vous avez promis',
  },
  people: {
    firstContact: (date: string) => `Échanges depuis ${date}`,
    lastContact: (date: string) => `Dernier e-mail le ${date}`,
    open: 'Voir les échanges',
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
  tasks: {
    active: (goal: string) => `L’agent s’en occupe : ${goal}`,
    auto: 'Envoyer les e-mails sans me demander',
    autoHint:
      'Chaque e-mail attend quand même quelques secondes pour que vous puissiez annuler.',
    cancel: 'Arrêter',
    done: 'Tâche terminée',
    goal: 'Que doit obtenir l’agent ?',
    goalPlaceholder:
      'ex. Faire renvoyer la facture avec notre nouvelle adresse',
    handle: 'S’en occuper…',
    next: 'Étape suivante',
    start: 'Démarrer',
    started: 'L’agent s’en occupe.',
  },
  whatsapp: {
    connectFirst:
      'Ouvrez d’abord Fewmail → Réglages → Intégrations et touchez « Connecter WhatsApp ».',
    connected:
      'Connecté. Je vous enverrai le brief chaque matin et vous écrirai dès qu’un e-mail urgent arrive. Envoyez un texte ou un message vocal pour répondre à un e-mail.',
    proOnly:
      'WhatsApp fait partie de Fewmail Pro. Ouvrez Réglages → Formule dans Fewmail pour passer à Pro.',
  },
  zombie: {
    badge: (share: number) =>
      `Ignore les désabonnements pour ${share} % des gens`,
    reason: 'A continué à vous écrire après votre désabonnement',
  },
}
