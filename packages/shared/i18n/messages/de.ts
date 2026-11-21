import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const de: Messages = {
  agent: {
    decideOnHome: 'Auf der Startseite entscheiden',
    fromAgent: 'Der Agent fragt',
    mcpAsks: (client: string) => `${client} bittet über MCP`,
    calendar: (email: string) => `Im Kalender von ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      dismiss_action: 'Diese Karte überspringen?',
      create_event: 'Diesen Termin hinzufügen?',
      delete_event: 'Diesen Termin löschen?',
      update_event: 'Diesen Termin ändern?',
      approve_action: 'Diese Aktion ausführen?',
      archive_thread: 'Diese Unterhaltung archivieren?',
      clear_out: 'Diese Gruppen aus dem Posteingang aufräumen?',
      undo_clear_out: 'Alle aufgeräumten E-Mails zurück in den Posteingang?',
      create_bot: 'Diesen Bot erstellen?',
      update_bot: 'Diesen Bot ändern?',
      reply: 'Diese Antwort senden?',
      send_email: 'Diese E-Mail senden?',
      snooze_thread: 'Diese Unterhaltung zurückstellen?',
      unsubscribe: 'Von diesem Absender abmelden?',
      tidy_mail: 'Diese ruhigen E-Mails aufräumen?',
      trash_thread: 'Diesen Verlauf in den Papierkorb verschieben?',
      report_spam: 'Diesen Absender als Spam melden?',
      mark_not_spam: 'Diesen Verlauf aus dem Spam holen?',
      move_to_inbox: 'Diesen Verlauf zurück in den Posteingang verschieben?',
    },
    retry: 'Erneut versuchen',
    steps: {
      create_event: 'Termin wird hinzugefügt',
      delete_event: 'Termin wird gelöscht',
      list_events: 'Kalender wird geprüft',
      update_event: 'Termin wird geändert',
      list_subscriptions: 'Lese Newsletter',
      approve_action: 'Wird ausgeführt',
      archive_thread: 'Wird archiviert',
      get_reading: 'Newsletter werden gelesen',
      get_wrapped: 'Ich zähle deine Mails',
      clear_out: 'Posteingang wird aufgeräumt',
      preview_clear_out: 'Ganzer Posteingang wird gelesen',
      undo_clear_out: 'Aufgeräumte E-Mails kommen zurück',
      create_bot: 'Bot wird erstellt',
      update_bot: 'Bot wird geändert',
      dismiss_action: 'Wird übersprungen',
      draft_reply: 'Antwort wird entworfen',
      create_draft: 'Entwurf wird gespeichert',
      find_people: 'Adresse wird gesucht',
      get_person: 'Person wird nachgeschlagen',
      get_today: 'Heute wird geprüft',
      list_handled: 'Erledigtes wird geprüft',
      list_mail: 'Mails werden durchsucht',
      get_bot_chat: 'Chat wird gelesen',
      list_bots: 'Deine Bots werden gelesen',
      read_thread: 'Unterhaltung wird gelesen',
      redraft_action: 'Entwurf wird umgeschrieben',
      refresh: 'Neue Mails werden abgerufen',
      remind_later: 'Erinnerung wird gestellt',
      send_email: 'Wird gesendet',
      snooze_thread: 'Wird zurückgestellt',
      unsubscribe: 'Wird abgemeldet',
      tidy_mail: 'Wird aufgeräumt',
      trash_thread: 'Verschiebe in den Papierkorb',
      report_spam: 'Melde Spam',
      mark_not_spam: 'Hole aus dem Spam',
      move_to_inbox: 'Verschiebe in den Posteingang',
      list_promises: 'Prüfe Versprechen',
      set_promise_status: 'Aktualisiere das Versprechen',
    },
    to: (recipients: string) => `An ${recipients}`,
    until: (time: string) => `Bis ${time}`,
    yes: {
      dismiss_action: 'Überspringen',
      create_event: 'Hinzufügen',
      delete_event: 'Löschen',
      update_event: 'Speichern',
      approve_action: 'Ausführen',
      archive_thread: 'Archivieren',
      clear_out: 'Aufräumen',
      undo_clear_out: 'Zurückholen',
      create_bot: 'Bot erstellen',
      update_bot: 'Speichern',
      reply: 'Senden',
      send_email: 'Senden',
      snooze_thread: 'Zurückstellen',
      unsubscribe: 'Abmelden',
      tidy_mail: 'Aufräumen',
      trash_thread: 'In den Papierkorb',
      report_spam: 'Als Spam melden',
      mark_not_spam: 'Kein Spam',
      move_to_inbox: 'Verschieben',
    },
  },
  compose: {
    attach: 'Dateien anhängen',
    attachmentsTooLarge: (limit: string) =>
      `Anhänge dürfen zusammen bis zu ${limit} groß sein.`,
    dropFiles: 'Dateien zum Anhängen ablegen',
    removeAttachment: 'Entfernen',
    discarded: 'Entwurf verworfen',
    backInQueue: 'Abgebrochen. Der Entwurf ist wieder auf der Startseite.',
    canceled: 'Abgebrochen. Deine E-Mail ist wieder im Editor.',
    cc: 'Cc',
    discard: 'Verwerfen',
    draftSaved: 'Entwurf gespeichert',
    forward: 'Weiterleiten',
    forwardedMessage: 'Weitergeleitete Nachricht',
    from: 'Von',
    invalidRecipients: 'Füge mindestens eine gültige E-Mail-Adresse hinzu.',
    later: {
      inHour: 'In einer Stunde',
      monday: 'Montagmorgen',
      pick: 'Datum & Uhrzeit wählen',
      schedule: 'Planen',
      time: 'Uhrzeit',
      tomorrow: 'Morgen früh',
    },
    new: 'Neue E-Mail',
    placeholder: 'Schreib deine E-Mail…',
    remind: {
      days: (total: number) =>
        plural('de', total, {
          one: () => 'Erinnern, wenn nach einem Tag keine Antwort',
          other: (n) => `Erinnern, wenn nach ${n} Tagen keine Antwort`,
        }),
      label: 'Erinnern',
      off: 'Keine Erinnerung',
    },
    reply: 'Antworten',
    scheduledFor: (date: string) => `Geplant für ${date}`,
    send: 'Senden',
    sendLater: 'Später senden',
    sendingIn: (seconds: number) => `Senden in ${seconds} s`,
    subject: 'Betreff',
    to: 'An',
    undo: 'Rückgängig',
    undoing: 'Wird rückgängig gemacht…',
    writeForMe: 'Schreib es für mich',
    writing: 'Schreibe…',
  },
  composer: {
    acceptSuggestion: 'Tab zum Übernehmen',
    bold: 'Fett',
    bulletList: 'Aufzählung',
    italic: 'Kursiv',
    link: 'Link',
    linkPlaceholder: 'Link einfügen oder eingeben',
    noSnippets: 'Keine passenden Textbausteine.',
    removeLink: 'Link entfernen',
  },
  reminders: {
    followUp: 'Nachfassen',
    noReply: 'Noch keine Antwort',
  },
  site: {
    meta: {
      assistant:
        'Fewmail ist ein KI-E-Mail-Assistent für Gmail, der jede Mail zuerst liest, Antworten in deinem Ton entwirft und dir nur zeigt, was deine Aufmerksamkeit braucht. Kostenlos starten.',
      assistantTitle: 'KI-E-Mail-Assistent für Gmail',
      compare:
        'Fewmail im Vergleich zu Superhuman, Shortwave und SaneBox: ein KI-Agent, der deine Mails liest, statt dich schneller selbst lesen zu lassen.',
      compareTitle: 'KI-E-Mail-Assistenten im Vergleich',
      home: 'Fewmail ist ein KI-E-Mail-Assistent für Gmail: Er liest jede Mail, entwirft Antworten in deinem Ton und zeigt dir nur, was deine Aufmerksamkeit braucht.',
      login:
        'Fewmail liest dein Gmail für dich, antwortet in deinem Ton und zeigt dir nur, was dich wirklich braucht.',
      mcp: 'Verbinde Fewmail als MCP-Server mit Claude, ChatGPT, Claude Code oder Cursor: Lies und sortiere dein Gmail aus der KI, die du schon nutzt.',
      motto: 'nur was in deinem Postfach zählt',
      pricing: (trialDays: number) =>
        `Fewmail ist für Startseite, Sortierung, Regeln und Spamschutz für immer kostenlos. Pro, der ganze Agent, beginnt mit ${trialDays} kostenlosen Tagen ohne Karte.`,
      tagline: 'der KI-E-Mail-Agent für Gmail',
    },
    chapters: {
      pricing: {
        description:
          'Startseite, Sortieren, Regeln und Schutz sind für immer kostenlos. Lite, Pro und Max bringen alles dazu, was für dich liest und schreibt; die größeren Pläne machen einfach mehr davon.',
        label: 'Preise',
        title: (usd: number) => `Sortieren kostenlos. Der Agent ab $${usd}.`,
      },
      questions: {
        description:
          'Die kurzen Antworten. Die langen stehen in der Datenschutzerklärung.',
        label: 'Fragen',
        title: 'Bevor du Gmail verbindest.',
      },
    },
    closing: {
      lead: 'Verbinde Gmail in einer Minute. Fewmail startet mit den Mails der letzten drei Tage, die ersten Entscheidungen warten also sofort auf dich.',
      title: 'Hol dir deine Morgen zurück.',
    },
    mcp: {
      answer:
        'Den unterschriebenen Vertrag, vor dem Kick-off am Freitag. Eine Antwort ist schon entworfen und wartet in deiner Fewmail-Warteschlange.',
      clients: 'Funktioniert mit',
      emphasis: 'Claude und ChatGPT.',
      free: 'Deine Mails lesen und das Sortieren durch den Agenten sind kostenlos.',
      label: 'MCP',
      lead: 'Verbinde Fewmail als MCP-Server und frag den Assistenten, den du schon nutzt, nach deinen Mails. Alles, was sendet oder Gmail ändert, wartet trotzdem auf deine Freigabe.',
      question: 'Was braucht Anna diese Woche von mir?',
      setup: 'In einer Minute verbunden',
      title: 'Deine Mails, direkt in Claude und ChatGPT.',
    },
    mcpPage: {
      copy: 'URL kopieren',
      lead: 'Verbinde Fewmail als MCP-Server und frag die KI, die du schon nutzt, nach deinen Mails. Lesen und das Sortieren durch den Agenten sind kostenlos; Entwürfe, Senden und Regeln gibt es mit Pro.',
      safety:
        'Alles, was eine E-Mail sendet oder Gmail ändert, braucht zuerst deine Freigabe. Eine E-Mail, die dem Assistenten Befehle geben will, wird markiert, bevor er sie liest. Deine Mails trainieren nie Modelle, und jede App lässt sich in den Einstellungen trennen.',
      steps: {
        chatgpt:
          'Füge in den Settings einen Connector (App) mit dieser URL hinzu und melde dich dann bei Fewmail an.',
        claude:
          'Füge unter Settings → Connectors einen eigenen Connector mit dieser URL hinzu und melde dich dann bei Fewmail an.',
        code: 'Führe das einmal im Terminal aus und melde dich bei Fewmail an, wenn Claude Code fragt.',
        cursor:
          'Füge das in deine mcp.json ein und melde dich bei Fewmail an, wenn Cursor fragt.',
      },
      title: 'Fewmail in Claude, ChatGPT und deinen Tools.',
    },
    assistantPage: {
      abilities: {
        ask: {
          description:
            'Frag „Wann geht mein Flug?“ und bekomm die Antwort samt den Mails, aus denen sie stammt: in Fewmail, Telegram oder WhatsApp oder aus Claude und ChatGPT.',
          title: 'Antworten aus deinen Mails',
        },
        drafts: {
          description:
            'Antworten werden im Voraus geschrieben, in deinem Ton und in der Sprache des Absenders, und warten in deiner Warteschlange, bis du sie freigibst.',
          title: 'Entwirft Antworten in deinem Ton',
        },
        protection: {
          description:
            'Geänderte Bankdaten, Doppelgänger-Domains und bekannte Betrugsmaschen lösen eine Warnung aus, bevor du handelst.',
          title: 'Warnt vor Phishing',
        },
        reading: {
          description:
            'Die Newsletter des Tages werden zu einer Zusammenfassung nach Thema, jeder Satz verlinkt mit der Mail, aus der er stammt.',
          title: 'Newsletter in einer Zusammenfassung',
        },
        bots: {
          description:
            'Beschreib in einem Satz, was mit bestimmten Mails passieren soll, und daraus wird eine Regel. Nur Regeln, die du einschaltest, handeln von selbst.',
          title: 'Regeln in einfachen Worten',
        },
        sorting: {
          description:
            'Jede Mail bekommt eine Zusammenfassung und eine Wichtigkeitsbewertung. So steigt Dringendes nach oben, und Belege, Benachrichtigungen und Werbung bleiben dir aus dem Weg.',
          title: 'Liest und sortiert jede Mail',
        },
      },
      abilitiesDescription:
        'Alles passiert in dem Gmail, das du schon nutzt, und alles, was der Agent tut, wird mit seinem Grund aufgeschrieben.',
      abilitiesLabel: 'Was er tut',
      abilitiesTitle: 'Ein Assistent, kein weiteres Postfach.',
      compareTitle: 'Im Vergleich mit anderen KI-Mail-Tools.',
      faq: (trialDays: number) => [
        {
          answer:
            'Software, die mit KI E-Mails für dich liest, sortiert und beantwortet. Die meisten ergänzen ein Postfach, das du weiter selbst liest, um Zusammenfassungen und Schreibhilfe. Fewmail geht weiter: Es liest zuerst alles, und du siehst nur, was deine Aufmerksamkeit braucht.',
          question: 'Was ist ein KI-E-Mail-Assistent?',
        },
        {
          answer:
            'Fewmail verschlüsselt Betreffzeilen, Inhalte, Zusammenfassungen und Entwürfe in seiner Datenbank, nutzt deine Mails nie zum Trainieren von Modellen und sendet oder ändert in Gmail nie etwas ohne deine Freigabe. Du kannst es jederzeit trennen und alles löschen.',
          question: 'Ist es sicher, KI meine Mails lesen zu lassen?',
        },
        {
          answer:
            'Es entwirft Antworten für dich, sendet aber nie eine von selbst. Jeder Entwurf wartet in deiner Warteschlange auf deine Freigabe, und ähnliche lassen sich gemeinsam freigeben.',
          question: 'Kann es Mails automatisch beantworten?',
        },
        {
          answer: `Ja. Der Free-Tarif sortiert jede Mail, sammelt alles, was deine Aufmerksamkeit braucht, auf einer Seite, führt deine Regeln aus und schützt dich vor Spam und Phishing, für immer. Entwürfe, Zusammenfassungen und der Rest des Agenten gehören zu den bezahlten Tarifen, und jedes Konto startet mit ${trialDays} Tagen Pro, ohne Karte.`,
          question:
            'Gibt es einen kostenlosen KI-E-Mail-Assistenten für Gmail?',
        },
      ],
      faqTitle: 'Über KI-E-Mail-Assistenten.',
      lead: 'Fewmail liest jede Mail in deinem Gmail, sobald sie ankommt, räumt den Lärm weg, entwirft Antworten in deinem Ton und bringt dir nur die wenigen Dinge, die deine Entscheidung brauchen. Nichts wird ohne deine Freigabe gesendet oder geändert.',
      title: 'Der KI-E-Mail-Assistent, der dein Gmail zuerst liest.',
    },
    comparePage: {
      lead: 'E-Mail-Programme machen dich schneller beim Lesen jeder einzelnen Mail. Filter schieben Mails in Ordner. Fewmail ist ein Agent: Es liest deine Mails, entscheidet, was warten kann, und fragt dich nur nach dem Rest.',
      title: 'Fewmail im Vergleich.',
    },
    comparison: {
      custom: 'Individuell',
      features: 'Funktion für Funktion',
      groups: {
        agent: 'Lesen und antworten',
        day: 'Dein Tag',
        reach: 'Wo es läuft',
        safety: 'Schutz',
      },
      labels: {
        ask: 'Frag deine Mails, was du willst',
        home: 'Alles, was deine Aufmerksamkeit braucht, auf einer Seite',
        calendar: 'Kalender',
        drafts: 'Antworten für dich entworfen',
        followUps: 'Erinnerungen zum Nachfassen',
        gmail: 'Gmail und Google Workspace',
        handOver: 'Einen Thread abgeben',
        importance: 'Nach Wichtigkeit sortiert',
        keepApp: 'Deine Mail-App bleibt',
        mcp: 'MCP für deine eigenen Tools',
        memory: 'Merkt sich Zusagen und Menschen',
        otherProviders: 'iCloud, Yahoo und andere IMAP-Mail',
        outlook: 'Outlook und Microsoft 365',
        phishing: 'Warnungen vor Phishing und geänderten Zahlungsdaten',
        phone: 'Auf dem Handy',
        bots: 'Regeln in einfachen Worten',
        snooze: 'Zurückstellen',
        spamShield: 'Community-Spamschutz',
        summaries: 'Zusammenfassungen',
        teams: 'Team-Postfach',
        unsubscribe: 'Abmelden mit einem Klick',
      },
      more: 'Weitere Vergleiche',
      no: 'Nein',
      noFreePlan: 'Kein kostenloser Tarif',
      ours: {
        ask: 'Mit Pro',
        home: 'Live, mit Sammelfreigabe, kostenlos',
        drafts: 'In deinem Ton, gesendet erst nach deiner Freigabe, mit Pro',
        followUps: 'Automatisch, bei Mails, die eine Antwort erwarten',
        handOver: 'Der Agent bringt ihn ans Ziel, mit Pro',
        importance: 'Jede Mail bewertet, kostenlos',
        keepApp: 'Alles erscheint in Gmail',
        mcp: 'Mit Pro',
        memory: 'Mit Pro',
        phone: 'Telegram und WhatsApp, mit Sprache, mit Pro',
        bots: 'Archivieren, als gelesen markieren oder abmelden, kostenlos',
        summaries: 'Mit Pro',
        unsubscribe: 'Wer es ignoriert, landet im Spam',
      },
      plans: 'Tarife und Preise',
      read: 'Zum Vergleich',
      source: (name: string, date: string) =>
        `Die Angaben zu ${name} stammen von der öffentlichen Website, Stand: ${date}. Preise und Funktionen ändern sich; das aktuelle Angebot findest du dort.`,
      title: (name: string) => `Fewmail vs. ${name}`,
      tryFree: 'Fewmail kostenlos testen',
      which: 'Was passt zu dir?',
      yes: 'Ja',
    },
    comparisons: {
      sanebox: {
        plans: {
          dinner: '4 Postfächer und alle Funktionen, AI Bundle inklusive',
          lunch: '2 Postfächer, Zurückstellen und Erinnerungen',
          snack: '1 Postfach und einfache Filter',
        },
        summary:
          'SaneBox sortiert Mails in Ordner und schreibt im größten Tarif auch Entwürfe und Zusammenfassungen. Fewmail liest zuerst alles und sammelt auf einer Seite die wenigen Entscheidungen, die nur du treffen kannst.',
        them: {
          home: 'Eine tägliche Übersicht gefilterter Mails',
          drafts: 'SaneDrafts, mit Dinner',
          followUps: 'SaneNoReplies',
          importance: 'Unwichtige Mails landen in SaneLater',
          keepApp: 'Arbeitet über Ordner',
          otherProviders: 'Jeder IMAP- oder Exchange-Server',
          phone: 'Über deine Mail-App',
          bots: 'Training durch Verschieben von Mails zwischen Ordnern',
          snooze: 'Ab Lunch',
          summaries: 'SaneSummary, mit Dinner',
          unsubscribe: 'Ordner SaneBlackHole',
        },
        verdict:
          'Nimm SaneBox, wenn deine Mails nicht in Gmail liegen und dir Ordner reichen. Nimm Fewmail, wenn du Gmail nutzt und die wichtigen Mails gelesen, zusammengefasst und beantwortet werden sollen.',
      },
      shortwave: {
        plans: {
          business: 'Pro Nutzer',
          free: 'Die meisten Funktionen und der Assistent',
          max: 'Pro Nutzer, die stärksten Modelle',
          premier: 'Pro Nutzer, stärkere Modelle',
          pro: 'Ganzer Verlauf, KI-Suche und Schreiben',
        },
        summary:
          'Shortwave ist ein E-Mail-Programm mit einem KI-Assistenten, mit dem du redest. Fewmail ist ein Agent, der zuerst selbst liest und dich nur fragt, was er nicht entscheiden kann.',
        them: {
          ask: 'KI-Assistent und Suche',
          drafts: 'Wenn du fragst',
          importance: 'Splits und Bündel',
          keepApp: 'Ersetzt deine Mail-App',
          memory: 'KI-Gedächtnis',
          otherProviders: 'An Gmail weitergeleitet',
          outlook: 'Microsoft 365 nicht unterstützt',
          phone: 'Apps für iOS und Android',
          bots: 'KI-Filter, 3 bis 50 je nach Tarif',
          summaries: 'Über jeder Mail',
          teams: 'Geteilte Threads und Kommentare',
          unsubscribe: 'Mit Blockieren per Klick',
        },
        verdict:
          'Nimm Shortwave, wenn du ein neues Postfach mit Chat-Assistent willst. Nimm Fewmail, wenn du weniger Mails sehen willst, im Gmail, das du schon nutzt.',
      },
      superhuman: {
        plans: {
          business:
            'Pro Mitglied, $33 bei jährlicher Zahlung. Dazu Auto Drafts und Ask AI',
          enterprise: 'SSO und Admin-Steuerung',
          starter: 'Pro Mitglied, $25 bei jährlicher Zahlung',
        },
        summary:
          'Mit Superhuman gehst du schneller durch jede Mail. Fewmail geht sie für dich durch und zeigt dir nur, was deine Aufmerksamkeit braucht.',
        them: {
          ask: 'Ask AI, mit Business',
          drafts: 'Auto Drafts, mit Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox und Auto Labels',
          keepApp: 'Ersetzt deine Mail-App',
          mcp: 'Mit Business',
          phone: 'Apps für iOS und Android',
          bots: 'Custom Auto Labels, mit Business',
          spamShield: 'Der Filter deines Anbieters',
          summaries: 'Auto Summarize',
          teams: 'Geteilte Entwürfe und Kommentare',
        },
        verdict:
          'Nimm Superhuman, wenn du jede Mail selbst anfassen willst, nur schneller. Nimm Fewmail, wenn du die meisten gar nicht erst sehen willst.',
      },
    },
    faq: (trialDays: number) => [
      {
        answer:
          'Viele KI-Mail-Tools sind ein neues Postfach mit Chatfenster: Du liest trotzdem jede Mail, nur mit einer Zusammenfassung obendrauf. Fewmail ist ein KI-Agent auf dem Gmail, das du schon nutzt. Er liest zuerst jede Mail, entwirft Antworten in deinem Ton und bringt dir nur die wenigen Entscheidungen, die deine Entscheidung brauchen.',
        question:
          'Was unterscheidet Fewmail von anderen KI-E-Mail-Assistenten?',
      },
      {
        answer:
          'Nein. Fewmail läuft auf Gmail. Alles, was es tut, siehst du auch in Gmail, und du kannst jede Gmail-App parallel weiter nutzen.',
        question: 'Muss ich Gmail verlassen?',
      },
      {
        answer:
          'Nie ohne dich. Antworten warten in deiner Warteschlange, bis du sie freigibst, und nur Regeln, die du angelegt oder behalten hast, dürfen selbst archivieren, als gelesen markieren oder abmelden. Alles, was es getan hat, steht unter Erledigt.',
        question: 'Kann es selbst Mails senden oder löschen?',
      },
      {
        answer:
          'Betreffzeilen, Inhalte, Zusammenfassungen und Entwürfe sind in unserer Datenbank verschlüsselt. Deine Mails werden nie zum Trainieren von Modellen verwendet, und der Spamschutz teilt zwischen Nutzern nur verschlüsselte Hashes, nie Adressen oder Inhalte.',
        question: 'Was passiert mit meinen Mails?',
      },
      {
        answer: `Jedes neue Konto bekommt ${trialDays} Tage Pro, ohne Karte. Danach bleibst du einfach bei Free; nichts wird gelöscht und nichts abgebucht.`,
        question: 'Was passiert nach der Testphase?',
      },
      {
        answer:
          'Entwürfe entstehen in der Sprache der Mail, auf die du antwortest. App, Zusammenfassungen und Telegram-Bot sprechen eine Sprache deiner Wahl, aus fünfzehn.',
        question: 'Welche Sprachen spricht es?',
      },
      {
        answer:
          'Derzeit Konten von Gmail und Google Workspace. Füge mehrere Postfächer zu einem Fewmail hinzu, und ihre Mails landen auf derselben Startseite und im selben Posteingang.',
        question: 'Welche E-Mail-Konten funktionieren?',
      },
    ],
    features: {
      description:
        'Die Teile von E-Mail, die früher einen Nachmittag gekostet haben, erledigt im Hintergrund und aufgelistet, wo du sie prüfen kannst.',
      items: {
        codes: {
          description:
            'Ein frischer Code wartet oben auf der Startseite und neben seiner Mail, zum Kopieren, ohne etwas zu öffnen. Kostenlos.',
          title: 'Anmeldecodes',
        },
        subscriptions: {
          description:
            'Jede Mailingliste, die diesen Monat geschrieben hat, und wie viele ihrer Mails du wirklich geöffnet hast. Mit einer Taste abbestellt. Kostenlos.',
          title: 'Newsletter',
        },
        ask: {
          description:
            'Frag in einfachen Worten, was du willst, und bekomm die Antwort aus deinen eigenen Mails, samt den Mails, aus denen sie stammt.',
          title: 'Frag deine Mails',
        },
        calendar: {
          description:
            'Die Kalender aller Postfächer in einer Ansicht. Ein Termin, der in einer Mail vorgeschlagen wird, landet im Kalender, sobald du ihn bestätigst.',
          title: 'Kalender',
        },
        clearOut: {
          description:
            'Der ganze Rückstau auf einmal raus, bis zu 50.000 Mails pro Postfach, alle unter einem Label, sodass Rückgängig jede einzelne zurückholt. Kostenlos.',
          title: 'Aufräumen',
        },
        reading: {
          description:
            'Eine Zusammenfassung der Newsletter des Tages: die Neuigkeiten nach Thema, jeder Satz mit seiner Quelle, und die, die sich ganz zu lesen lohnen.',
          title: 'Lesen',
        },
        voice: {
          description:
            'Lass dir die Zusammenfassung deiner Newsletter vorlesen. Schick in Telegram oder WhatsApp eine Sprachnachricht, und der Agent antwortet laut.',
          title: 'Hören statt lesen',
        },
        wrapped: {
          description:
            'Dein Monat oder Jahr in E-Mails: was reinkam, was erledigt wurde, wie viel Zeit du zurückbekommen hast. Zum Teilen, nie mit Namen.',
          title: 'Wrapped',
        },
      },
      label: 'Und der Rest',
      title: 'Alles andere, was ein Assistent für dich tun würde.',
    },
    footer: {
      legal: 'Rechtliches',
      product: 'Produkt',
      tagline:
        'Der KI-E-Mail-Agent, der dein Gmail liest und dir nur zeigt, was deine Aufmerksamkeit braucht.',
      versus: (name: string) => `vs. ${name}`,
    },
    gone: {
      emphasis: 'nicht mehr hast.',
      label: 'Was wegfällt',
      rows: [
        {
          fix: 'Aufräumen schafft den ganzen Rückstau auf einmal weg: alte Werbung, gelesene Benachrichtigungen, Verteiler, die du nie öffnest. Ein Rückgängig holt jede Mail zurück.',
          problem: 'Tausende Mails, die nie jemand lesen wird.',
        },
        {
          fix: 'Antworten sind schon vorab entworfen, in deinem Ton und in ihrer Sprache. Ähnliche gibst du mit ⇧⏎ zusammen frei, und jede kannst du vorher prüfen.',
          problem: 'Mails beantworten um Mitternacht.',
        },
        {
          fix: 'Eine Taste meldet dich ab, wie es ein Mensch täte: ein Klick, die Abmeldeseite oder eine E-Mail. Wer trotzdem weiterschreibt, wird erkannt und als Spam vorgeschlagen.',
          problem: 'Newsletter, die du nie abonniert hast.',
        },
        {
          fix: 'Die Newsletter des Tages werden zu einer Zusammenfassung nach Thema, die lesenswerten sind markiert.',
          problem: 'Newsletter, die du eigentlich lesen wolltest.',
        },
        {
          fix: 'Geänderte Zahlungsdaten, Doppelgänger-Domains und bekanntes Phishing lösen eine Warnung aus, bevor du handelst.',
          problem: 'Eine Rechnung mit neuer Bankverbindung.',
        },
        {
          fix: 'Was du in gesendeten Mails versprichst, kommt zurück, wenn es fällig ist, und Threads, auf die niemand geantwortet hat, bekommen ein Nachfassen.',
          problem: 'Das, was du versprochen und dann vergessen hast.',
        },
        {
          fix: 'Nur dringende Mails erreichen dich in Telegram oder WhatsApp. Der Rest wartet schon sortiert auf der Startseite, bis du reinschaust.',
          problem: 'Beim Abendessen Mails checken, nur für alle Fälle.',
        },
      ],
      title: 'E-Mail-Probleme, die du nicht mehr hast.',
    },
    hero: {
      needs: {
        emphasis: 'brauchen dich.',
        lead: (handled: string) =>
          `Anna wartet auf den Vertrag, die Rechnung von Northwind ist nächste Woche fällig und Marco möchte Donnerstag. ${handled} Newsletter und Benachrichtigungen sind erledigt, und die Startseite aktualisiert sich, sobald neue Mail kommt.`,
        tag: 'Startseite · Donnerstag, 08:12',
        title: 'Drei Dinge brauchen dich.',
      },
      fates: {
        archived: 'Archiviert',
        markedRead: 'Als gelesen markiert',
        spam: 'Spam',
        summarised: 'Zusammengefasst',
        unsubscribed: 'Abgemeldet',
      },
      handled: ((slots) => [
        slots.count,
        ' erledigt, jeweils mit Grund',
      ]) as Rich<'count'>,
      inbox: 'Posteingang',
      lead: 'Newsletter, Belege, Benachrichtigungen, ein Phishing-Link und irgendwo dazwischen die drei Mails, die wirklich zählen. Fewmail ist der KI-Agent, der das alles für dich liest.',
      needYou: ((slots) => [slots.count, ' brauchen dich']) as Rich<'count'>,
      queue: [
        {
          reason: 'Vertrag bis morgen',
          summary:
            'Braucht den unterschriebenen Vertrag vor dem Kick-off am Freitag.',
        },
        {
          reason: 'Rechnung · $1,240 fällig am 20. Nov.',
          summary:
            'Oktober-Rechnung für das Website-Redesign. Dieselbe Bankverbindung wie beim letzten Mal.',
        },
        {
          reason: 'Terminvorschlag',
          summary:
            'Schlägt Donnerstag um 15:00 vor. Du hast ab 16:00 Zeit, also fragt der Entwurf nach vier.',
        },
      ],
      reading: {
        emphasis: 'jede einzelne.',
        lead: 'Es archiviert das Rauschen, meldet dich von dem ab, was du nie öffnest, und hält Betrug an der Tür auf. Alles, was es tut, wird mit Grund notiert, damit du es prüfen kannst.',
        title: 'Fewmail liest jede einzelne.',
      },
      remind: 'Am 19. Nov. erinnern',
      remindPlan: 'Legt sie zu deinen Rechnungen und erinnert dich am 19. Nov.',
      start: 'Kostenlos mit Google starten',
      title: 'E-Mail ist nicht dein Job.',
      home: 'Startseite',
      tryQueue: 'Probier die Warteschlange aus',
      unread: ((slots) => [slots.count, ' ungelesen']) as Rich<'count'>,
      unreadInbox: ((slots) => [
        slots.count,
        ' ungelesen in deinem Posteingang',
      ]) as Rich<'count'>,
      willDo: 'Was Fewmail tut',
    },
    nav: {
      assistant: 'KI-E-Mail-Assistent',
      compare: 'Vergleich',
      features: 'Funktionen',
      mcp: 'MCP-Server',
      pricing: 'Preise',
      signIn: 'Anmelden',
    },
    play: {
      again: 'Noch einmal von vorn',
      doneLead: (handled: string) =>
        `Du hast drei Entscheidungen getroffen. Um die anderen ${handled} hat sich Fewmail gekümmert und aufgeschrieben, warum.`,
      doneTitle: 'Das war’s für heute.',
      emphasis: 'in zwei Minuten.',
      handled: [
        'Lumen Weekly: Du hast keine der letzten 30 Ausgaben geöffnet',
        'paypa1-billing.com sieht aus wie paypal.com',
        'Parcelhub: Versandbenachrichtigungen, nach der Regel „Belege und Versand“',
      ],
      handledTitle: 'Erledigt, während du geschlafen hast',
      label: 'Ausprobieren',
      lead: 'So sieht ein Morgen jetzt aus. Die Entwürfe sind geschrieben, die Gründe stehen dabei, du entscheidest. Los, arbeite sie ab.',
      left: (count: number) => `Noch ${count} zu entscheiden`,
      title: 'Dein ganzer Posteingang, in zwei Minuten.',
    },
    plans: {
      agent: 'Der Agent',
      details: 'Alle Pläne im Detail',
      emails: 'E-Mails, die der Agent im Monat liest',
      everyPlan: 'In jedem Plan',
      messages: 'oder Nachrichten an den Agenten',
      oneAllowance:
        'Ein Kontingent für alles, was der Agent tut: Du zahlst nur, was du nutzt, und Rauschen zählt nie',
      forever: 'für immer',
      free: {
        description: 'Startseite, Sortieren, Regeln und Schutz. Für immer.',
      },
      max: {
        description: 'Derselbe Agent für ein volles Postfach.',
      },
      monthly: 'Monatlich',
      per: { month: 'im Monat', year: 'im Jahr' },
      lite: {
        description:
          'Der ganze Agent: Er liest, schreibt und merkt sich alles.',
      },
      pro: {
        description: 'Derselbe Agent mit Platz für mehr Mail.',
      },
      tryFree: (days: number) => `${days} Tage kostenlos testen`,
      yearly: 'Jährlich · 2 Monate gratis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Startseite, Sortieren, Regeln in einfachen Worten und Schutz sind für immer kostenlos. Pro ist der Agent, der für dich liest, schreibt und sich alles merkt; Max ist derselbe Agent mit Platz für ein volles Postfach. Jedes Konto startet mit ${trialDays} Tagen Pro, und danach bleibst du einfach bei Free.`,
      otherTool: 'Denkst du über ein anderes Tool nach?',
      title: 'Zahl für den Agenten, nicht fürs Postfach.',
    },
    startFree: 'Kostenlos starten',
    trialNote: (days: number) =>
      `${days} Tage Pro, ohne Karte. Danach kostenlos, so lange du willst.`,
    trust: {
      emphasis: 'fragt',
      label: 'Deine Mails, deine Entscheidung',
      places: 'Läuft auf dem Gmail, das du schon nutzt, und erreicht dich in',
      title: 'Es fragt, bevor es handelt.',
      vows: [
        {
          description:
            'Entwürfe warten auf dich. Nur Regeln, die du angelegt oder behalten hast, dürfen selbst archivieren, als gelesen markieren oder abmelden, und alles, was sie getan haben, steht unter Erledigt.',
          title: 'Ohne deine Freigabe wird nichts gesendet.',
        },
        {
          description:
            'Betreffzeilen, Inhalte, Zusammenfassungen und Entwürfe sind in unserer Datenbank verschlüsselt. Gespeicherte Entwürfe bleiben in Gmail, nie bei uns.',
          title: 'Verschlüsselt gespeichert.',
        },
        {
          description:
            'Der Spamschutz lernt von allen über verschlüsselte Hashes. Keine einzige Adresse und kein Wort deiner Mails wird geteilt.',
          title: 'Nie zum Trainieren von Modellen verwendet.',
        },
      ],
    },
  },
  skills: {
    bills: 'Fällige Rechnungen und Zahlungen',
    cancel: 'Ein bezahltes Abo kündigen',
    cleanup: 'Newsletter zum Aufräumen',
    followups: 'Wer dir noch antworten muss',
    reading: 'Die Newsletter des Tages als ein Digest',
    today: 'Was heute ansteht',
    waiting: 'Wer auf deine Antwort wartet',
    week: 'Deine Woche im Postfach',
  },
  snooze: {
    laterToday: 'Später heute',
    nextWeek: 'Nächste Woche',
    title: 'Zurückstellen',
    tomorrow: 'Morgen',
    unsnooze: 'Zurück in den Posteingang',
    until: (date: string) => `Zurückgestellt bis ${date}`,
    weekend: 'Am Wochenende',
  },
  actionDone: {
    heads_up: 'Verstanden',
    commitment: 'Erledigt',
    confirm: 'Bestätigt',
    follow_up: 'Nachgefasst',
    pay: 'Bezahlt',
    read: 'Gelesen',
    renew: 'Verlängert',
    schedule: 'Eingeplant',
    security: 'Geprüft',
    sign: 'Unterschrieben',
  },
  actionLink: {
    confirm: 'Bestätigen',
    pay: 'Bezahlen',
    read: 'Lesen',
    renew: 'Verlängern',
    sign: 'Unterschreiben',
  },
  actionKind: {
    heads_up: 'Zur Info',
    cleanup: 'Alle abbestellen',
    consent: 'Zustimmen',
    commitment: 'Versprochen',
    security: 'Prüfen',
    spam: 'In den Spam',
    trash: 'In den Papierkorb',
    archive: 'Archivieren',
    follow_up: 'Nachfassen',
    mark_read: 'Als gelesen markieren',
    pay: 'Bezahlen',
    read: 'Lesenswert',
    reply: 'Antworten',
    schedule: 'Planen',
    unsubscribe: 'Abmelden',
  },
  actionStatus: {
    auto_done: 'vom Agenten erledigt',
    dismissed: 'übersprungen',
    done: 'erledigt',
    failed: 'fehlgeschlagen',
    pending: 'wartet auf der Startseite',
  },
  byBot: 'per Bot',
  calendar: {
    tomorrow: 'Morgen',
    allDay: 'Ganztägig',
    calendar: 'Kalender',
    create: 'Termin hinzufügen',
    delete: 'Löschen',
    deleted: 'Termin gelöscht',
    description: 'Beschreibung',
    editEvent: 'Termin bearbeiten',
    endBeforeStart: 'Der Termin endet, bevor er beginnt',
    ends: 'Ende',
    location: 'Ort',
    newEvent: 'Neuer Termin',
    next: 'Weiter',
    openInGoogle: 'In Google Kalender öffnen',
    previous: 'Zurück',
    save: 'Speichern',
    saved: 'Termin gespeichert',
    saving: 'Termin wird gespeichert…',
    scope: {
      this: 'Nur diesen Termin',
      following: 'Diesen und alle folgenden Termine',
      all: 'Alle Termine',
    },
    starts: 'Beginn',
    title: 'Kalender',
    titlePlaceholder: 'Titel hinzufügen',
    today: 'Heute',
    untitled: '(Kein Titel)',
    views: {
      day: 'Tag',
      week: 'Woche',
      month: 'Monat',
      year: 'Jahr',
    },
  },
  category: {
    calendar: 'Kalender',
    finance: 'Finanzen',
    newsletter: 'Newsletter',
    notification: 'Benachrichtigung',
    other: 'Sonstiges',
    person: 'Person',
    promotion: 'Werbung',
    receipt: 'Beleg',
    security: 'Sicherheit',
    travel: 'Reisen',
    work: 'Arbeit',
  },
  command: {
    compose: 'Neue E-Mail',
    appearance: 'Darstellung',
    upgrade: 'Auf Pro upgraden',
    theme: {
      dark: 'Dunkel',
      light: 'Hell',
      system: 'System',
    },
  },
  importance: [
    'Rauschen',
    'Gut zu wissen',
    'Braucht deine Aufmerksamkeit bald',
    'Dringend',
  ],
  justNow: 'gerade eben',
  errors: {
    crashTitle: 'Fewmail ist über diese Seite gestolpert',
    crashLead:
      'Deine Mails sind sicher, in Gmail hat sich nichts geändert. Lade neu – passiert es wieder, wissen wir schon Bescheid.',
    missingTitle: 'Unter dieser Adresse ist nichts',
    calendarAccess:
      'Fewmail hat keinen Zugriff auf diesen Kalender. Erlaube ihn auf der Kalenderseite.',
    failed: 'Etwas ist schiefgelaufen. Versuch es noch einmal.',
    needsPro: 'Dafür brauchst du Fewmail Pro.',
    alreadySent: 'Schon gesendet – Rückgängig geht nicht mehr.',
    consentChanged:
      'Das hat sich seit der Anfrage geändert. Sieh es dir noch einmal an und entscheide auf der Startseite.',
    notFound: 'Das gibt es nicht mehr – vielleicht wurde es gelöscht.',
    offline: 'Fewmail ist nicht erreichbar. Prüf deine Verbindung.',
  },
  desktop: {
    confirm: 'In der App anmelden',
    confirmLead: (code: string) =>
      `Fewmail auf deinem Computer möchte sich anmelden. Prüfe, dass dort ${code} steht.`,
    confirmTitle: 'In der App anmelden?',
    expired: 'Diese Anmeldung ist abgelaufen. Starte sie in der App neu.',
    lead: 'Du bist auf deinem Computer angemeldet. Du kannst diesen Tab schließen.',
    title: 'Zurück zur App',
    waiting: (code: string) =>
      `Mach im Browser weiter und prüfe, dass dort ${code} steht.`,
  },
  update: {
    available: 'Eine neue Version von Fewmail ist da.',
    reload: 'Neu laden',
  },
  keys: {
    forget: 'vergessen',
    reopen: 'wieder öffnen',
    attach: 'anhängen',
    done: 'erledigt',
    openLink: 'Link öffnen',
    writeReminder: 'Erinnerung schreiben',
    summary: 'Zusammenfassung',
    fromSender: 'mehr vom Absender',
    approvePicked: (n: number) => `${n} ausgewählte genehmigen`,
    pick: 'auswählen',
    pickAll: 'alle auswählen',
    markRead: 'als gelesen markieren',
    markUnread: 'als ungelesen markieren',
    unpick: 'Auswahl aufheben',
    pin: 'anheften',
    unpin: 'lösen',
    copyCode: 'Code kopieren',
    restore: 'in den Posteingang',
    calendarToday: 'heute',
    newEvent: 'neuer Termin',
    period: 'zurück / weiter',
    view: 'Ansicht',
    skills: 'Skills',
    unsubscribe: 'abbestellen',
    filter: 'Filter',
    reply: 'antworten',
    snooze: 'zurückstellen',
    trash: 'Papierkorb',
    archive: 'archivieren',
    approve: 'freigeben',
    approveAll: (n: number) => `alle ${n} dieser Art freigeben`,
    close: 'schließen',
    draftReply: 'Entwurf',
    edit: 'bearbeiten',
    expand: 'aufklappen / zuklappen',
    move: 'bewegen',
    stackEmail: 'nächste / vorige E-Mail',
    open: 'öffnen',
    rename: 'umbenennen',
    clearFilter: 'Filter löschen',
    search: 'suchen',
    send: 'senden',
    skip: 'überspringen',
    keep: 'behalten',
    stopEditing: 'fertig',
    rewrite: 'umschreiben',
    save: 'speichern',
    deleteEvent: 'löschen',
  },
  legal: {
    privacy: 'Datenschutzerklärung',
    englishOnly:
      'Dieses Dokument wird auf Englisch bereitgestellt; die englische Fassung ist verbindlich.',
    terms: 'Nutzungsbedingungen',
    updated: (date: string) => `Zuletzt aktualisiert am ${date}`,
  },
  limits: {
    usage: (date: string) =>
      `Das Kontingent des Agenten ist für diesen Monat aufgebraucht. Ab ${date} gibt es neues.`,
  },
  notices: {
    freeUpSpace: 'Speicher freigeben',
    mailLost:
      'Fewmail hat den Zugriff auf dein Gmail verloren und liest keine neue Post.',
    mailboxLost: (email: string) =>
      `Fewmail hat den Zugriff auf ${email} verloren.`,
    reconnect: 'Neu verbinden',
    sendLimit: (email: string, when: string) =>
      `${email} hat das tägliche Sendelimit von Gmail erreicht. Senden geht wieder ${when}.`,
    signInAgain: 'Neu anmelden',
    storageFull: (email: string) =>
      `${email} hat keinen Google-Speicher mehr, deshalb weist Gmail neue Mails ab.`,
    storageFullHint:
      'Gib Speicher frei oder hol dir mehr, um wieder Mails zu empfangen.',
  },
  login: {
    needsGmail:
      'Ohne Zugriff auf Gmail kann Fewmail nicht arbeiten. Melde dich erneut an und lass das Gmail-Häkchen auf Googles Seite gesetzt.',
    agree: ((slots) => [
      'Wenn du fortfährst, stimmst du den ',
      slots.terms,
      ' und der ',
      slots.privacy,
      ' zu.',
    ]) as Rich<'privacy' | 'terms'>,
    consent:
      'Ohne deine Freigabe wird nichts gesendet oder archiviert. Kalender und Kontakte sind optional.',
    continue: 'Weiter mit Google',
    lead: 'Fewmail liest deine Mails und zeigt nur, was deine Aufmerksamkeit braucht.',
    title: 'Nur, was zählt.',
  },
  mail: {
    inThread: (emails: string) => `${emails} in dieser Unterhaltung`,
    moreFrom: (name: string) => `Mehr von ${name}`,
    draftDeleted: 'Entwurf gelöscht',
    unsubscribeConfirm: (name: string) => `Von ${name} abmelden?`,
    unsubscribeHint:
      'Fewmail meldet dich vom Verteiler ab und archiviert diese Unterhaltung. Eine Abmeldung lässt sich nicht rückgängig machen.',
    unsubscribing: 'Wird abgemeldet…',
    pin: 'Anheften',
    unpin: 'Lösen',
    pinned: 'Angeheftet',
    showAll: (n: number) => `Alle ${n} zeigen`,
    showFewer: 'Weniger zeigen',
    inboxTotal: (count: string) => `${count} insgesamt`,
    markShownRead: (n: number) => `${n} als gelesen markieren`,
    oneTimeCode: {
      copied: 'Code kopiert',
      copy: 'Code kopieren',
    },
    openUnsubscribePage: 'Seite öffnen',
    unsubscribeYourself:
      'Diesen Newsletter musst du auf seiner Seite selbst abbestellen. Seine Mails sind bis dahin archiviert.',
    allMailboxes: 'Alle Postfächer',
    filterAbout: {
      focused: 'Wichtiges und Menschen zuerst, Hinweise eingeklappt',
      unread: 'Was du noch nicht gelesen hast, nach Art',
      categories:
        'Der ganze Posteingang nach Art, was deine Aufmerksamkeit braucht zuerst',
      inbox: 'Alles, Neuestes zuerst',
    },
    find: {
      recent: 'Letzte Suchen',
      tips: 'Tipps',
      clearRecent: 'Leeren',
      describeExample: 'Rechnungen von Anna letzten Monat',
      searching: 'Durchsuche deine Mails…',
      tip: {
        from: 'Mails von Anna',
        subject: 'Betreff enthält „invoice“',
        attachment: 'Mit Anhängen',
        pdf: 'Mit PDF-Anhang',
        unread: 'Ungelesene Unterhaltungen',
        week: 'Aus den letzten 7 Tagen',
        describe: 'Oder beschreib es in eigenen Worten',
      },
    },
    group: {
      named: 'Absender oder Betreff',
      mentioned: 'Im Text erwähnt',
      read: 'Gelesen',
      earlier: 'Früher',
      important: 'Wichtig',
      people: 'Menschen',
      plans: 'Termine und Reisen',
      money: 'Geld',
      updates: 'Benachrichtigungen',
      newsletters: 'Newsletter',
      promotions: 'Werbung',
    },
    unread: 'Ungelesen',
    block: 'Absender blockieren',
    ignoresUnsubscribe: (name: string) => `${name} ignoriert Abmeldungen`,
    ignoresUnsubscribeHint:
      'Fewmail hat um die Abmeldung gebeten, aber dieser Absender schreibt bekanntlich trotzdem weiter. Seine Mails ab jetzt in den Papierkorb? Das übernimmt ein Bot, und du kannst ihn auf der Startseite löschen.',
    blocked: 'Blockiert. Ihre Mails landen jetzt im Papierkorb.',
    forward: 'Weiterleiten',
    more: 'Mehr',
    close: 'Schließen',
    reply: 'Antworten',
    trash: 'In den Papierkorb',
    trashed: 'In den Papierkorb verschoben',
    movedToInbox: 'Zurück im Posteingang. Danke für den Hinweis.',
    moveToInbox: 'In den Posteingang',
    backInInbox: 'In den Posteingang verschoben',
    deleteDraft: 'Entwurf löschen',
    notSent: 'Nicht gesendet – zum erneuten Senden öffnen',
    noRecipients: 'Keine Empfänger',
    notSpam: 'Kein Spam',
    reportSpam: 'Als Spam melden',
    reportedSpam: 'Gemeldet. Ihre Mails landen jetzt im Spam.',
    archive: 'Archivieren',
    archived: 'Archiviert',
    markedRead: 'Als gelesen markiert',
    markUnread: 'Als ungelesen markieren',
    markedUnread: 'Als ungelesen markiert',
    attachment: 'Anhang',
    draftReply: 'Antwort entwerfen',
    due: (date: string) => `fällig am ${date}`,
    dueHint: 'Frist, die der Agent in dieser E-Mail gefunden hat',
    empty: {
      focused: 'Posteingang leer',
      unread: 'Alles gelesen',
      categories: 'Posteingang leer',
      inbox: 'Posteingang leer',
      snoozed: 'Nichts zurückgestellt',
      sent: 'Noch nichts gesendet',
      drafts: 'Keine Entwürfe',
      archive: 'Das Archiv ist leer',
      spam: 'Kein Spam',
      trash: 'Der Papierkorb ist leer',
    },
    emptyHint: {
      focused: 'Neue Mails erscheinen hier, sobald sie ankommen.',
      unread: 'Neue Mails erscheinen hier, sobald sie ankommen.',
      categories: 'Neue Mails erscheinen hier, sobald sie ankommen.',
      inbox: 'Neue Mails erscheinen hier, sobald sie ankommen.',
      snoozed:
        'Stell eine Mail zurück, um sie bis später wegzulegen: Sie kommt ungelesen in den Posteingang zurück.',
      sent: 'Mails, die du sendest, erscheinen hier.',
      drafts:
        'Mails, die du angefangen, aber nicht gesendet hast, warten hier.',
      archive: 'Archivierte Mails verlassen den Posteingang und warten hier.',
      spam: 'Spam landet hier statt im Posteingang.',
      trash: 'Gelöschte Mails bleiben hier 30 Tage lang.',
    },
    noResults: 'Nichts gefunden',
    noResultsHint: 'Versuch andere Wörter oder einen anderen Ordner.',
    expectsReply: 'Erwartet Antwort',
    filter: {
      categories: 'Kategorien',
      archive: 'Archiv',
      trash: 'Papierkorb',
      drafts: 'Entwürfe',
      spam: 'Spam',
      inbox: 'Posteingang',
      snoozed: 'Zurückgestellt',
      sent: 'Gesendet',
      focused: 'Fokus',
      unread: 'Ungelesen',
    },
    instruction:
      'Sag dem Agenten, wie er antworten soll, oder drück einfach Enter',
    open: 'Öffnen',
    search: 'Suchen oder beschreiben',
    openInGmail: 'In Gmail öffnen',
    openInNewTab: 'In neuem Tab öffnen',
    unsubscribe: 'Abmelden',
    unsubscribed: 'Abgemeldet',
    unsubscribeFailed:
      'Dieser Absender bietet keine Abmeldung per Klick, daher wurde die Mail archiviert.',
    you: 'Du',
    sent: 'Gesendet',
    writeReply: 'Antwort schreiben…',
    replyTo: 'Antwort an',
    date: 'Datum',
    authentication: 'Authentifizierung',
    toLine: (recipients: string) => `an ${recipients}`,
  },
  subscriptions: {
    leftBy: (percent: number) =>
      `${percent} % ihrer Leser bei Fewmail haben sich abgemeldet`,
    unsubscribeHint: (emails: string) =>
      `Fewmail meldet dich vom Verteiler ab und archiviert alles, was er geschickt hat (${emails} diesen Monat). Eine Abmeldung lässt sich nicht rückgängig machen.`,
    archivedOnly:
      'Dieser Absender bietet keine Abmeldung, die Fewmail nutzen kann, daher wurden seine Mails archiviert. Du bleibst aber im Verteiler, neue Mails kommen weiter.',
    count: (total: number) => `Verteiler: ${total}`,
    empty: 'Diesen Monat hat dir kein Verteiler geschrieben.',
    lead: 'Newsletter, Werbung und andere Verteiler, die dir diesen Monat geschrieben haben, die aktivsten zuerst. Bestell ab, was du nie liest: Fewmail trägt dich aus und archiviert alles, was der Verteiler geschickt hat.',
    opened: (total: number) =>
      total === 0 ? 'keine geöffnet' : `${total} geöffnet`,
    title: 'Newsletter',
    unsubscribe: 'Abbestellen',
    unsubscribed: 'Abbestellt',
  },
  nav: {
    board: 'Pinnwand',
    menu: 'Menü',
    labels: 'Labels',
    folders: 'Ordner',
    calendar: 'Kalender',
    subscriptions: 'Newsletter',
    wrapped: 'Rückblick',
    people: 'Personen',
    findPerson: 'Person suchen',
    personMail: 'E-Mails anzeigen',
    deleteContact: 'Kontakt löschen',
    contactDeleted: 'Kontakt gelöscht',
    clearSearch: 'Suche leeren',
    mail: 'Mail',
    reading: 'Lesen',
    settings: 'Einstellungen',
    syncFailed: 'Gmail-Sync fehlgeschlagen, neuer Versuch',
    syncing: 'Lese deinen Posteingang…',
    loading: 'Wird geladen',
    syncFailedIn: (email: string) =>
      `Sync von ${email} fehlgeschlagen, neuer Versuch`,
    syncingIn: (email: string) => `Lese ${email}…`,
    home: 'Startseite',
    trialLeft: (total: number) =>
      plural('de', total, {
        one: () => 'Pro-Testphase · noch 1 Tag',
        other: (n) => `Pro-Testphase · noch ${n} Tage`,
      }),
    usage: (percent: number) => `Agent · ${percent} % des Monats verbraucht`,
    watching: 'Der Agent behält deinen Posteingang im Blick',
  },
  notifications: {
    many: (total: number) =>
      plural('de', total, {
        other: (n) => `${n} Neuigkeiten von Fewmail`,
      }),
  },
  plan: {
    used: (percent: number) => `${percent} % verbraucht`,
    about: (emails: string, messages: string) =>
      `Etwa ${emails} gelesene E-Mails oder ${messages} Nachrichten an den Agenten im Monat, beliebig gemischt.`,
    free: 'Free',
    freeDescription:
      'Schnelle, ruhige Mail mit einfachen Regeln. Kostenlos, so lange du willst.',
    includes:
      'Jeder bezahlte Plan bringt den Agenten: jede Mail gelesen und zusammengefasst, Antworten in deinem Ton, Regeln in einfachen Worten, Telegram und MCP.',
    manage: 'Abrechnung verwalten',
    price: (usd: number) => `$${usd} / Monat`,
    priceYearly: (usd: number) => `$${usd} / Jahr`,
    lite: 'Lite',
    max: 'Max',
    pro: 'Pro',
    cancels: (plan: string, date: string) =>
      `${plan} bis ${date}, danach Free.`,
    choose: (plan: string) => `${plan} wählen`,
    proRenews: (date: string) => `Verlängert sich am ${date}.`,
    resets: (date: string) => `Wird am ${date} zurückgesetzt.`,
    title: 'Tarif',
    trial: 'Pro-Testphase',
    welcome: (plan: string) =>
      `Willkommen bei ${plan}. Der Agent ist wieder im Einsatz.`,
    yearly: 'Jährlich zahlen',
    yearlyHint: 'Zwei Monate gratis.',
    trialDescription: (date: string) =>
      `Alles aus Pro bis ${date}, danach kostenlos. Keine Karte nötig.`,
    upgrade: 'Andere Pläne',
    usage: 'Diesen Monat',
  },
  queue: {
    addToCalendar: 'In den Kalender',
    writeReminder: 'Erinnerung schreiben',
    approve: 'Genehmigen',
    delete: 'Löschen',
    pick: 'Auswählen',
    picked: (n: number) => `${n} ausgewählt`,
    unpick: 'Abwählen',
    askedByYou: 'Von dir angefragt',
    draftedInVoice: 'In deinem Ton entworfen',
    openEmail: 'E-Mail öffnen',
    send: 'Senden',
    rewrite: 'Umschreiben',
    shorterInstruction: 'Mach es kürzer.',
    new: 'Neu',
    skipStale: 'Alle überspringen',
    skipped: (n: number) => `Übersprungen: ${n}`,
    stale: (n: number) => `Älter als eine Woche: ${n}`,
    skip: 'Überspringen',
  },
  bots: {
    profile: 'Was ich tue',
    closeProfile: 'Schließen',
    change: 'Ändern',
    since: (date: string) => `Arbeitet seit ${date}`,
    status: {
      acts: 'Handelt selbst',
      asks: 'Fragt vor jeder E-Mail',
      last: (time: string) => `zuletzt um ${time}`,
      paused: (date: string) => `Pausiert bis ${date}`,
      reading: (n: number) =>
        plural('de', n, {
          one: () => `liest eine neue E-Mail`,
          other: (count) => `liest ${count} neue E-Mails`,
        }),
      waiting: (n: number) =>
        plural('de', n, {
          one: () => `Eine Sache wartet auf dich`,
          other: (count) => `${count} Dinge warten auf dich`,
        }),
      watching: 'Behält deine Mail im Blick',
    },
    intro: {
      acts: 'Ich handle selbst: Alles, was ich tue, steht hier, und du kannst es rückgängig machen.',
      asks: 'Bevor ich eine E-Mail anfasse, frage ich dich hier.',
      board:
        'Hallo! Ich behalte die Versprechen und Fristen aus deiner Mail im Blick: was man dir schuldet, was du versprochen hast und was bald fällig ist. Frag mich, wer dir was schuldet.',
      change: 'Wenn ich etwas anders machen soll, schreib mir einfach.',
      fewmail:
        'Hallo, ich bin Fewmail Bot. Ich lese alle Mails, die keiner deiner Bots übernimmt, und zeige dir nur, was dich braucht. In Gmail ändert sich nichts ohne deine Zustimmung. Frag mich alles zu deiner Mail oder bitte mich, einen Bot zu erstellen.',
      own: (name: string) => `Hallo, ich bin ${name}. Darum kümmere ich mich:`,
    },
    suggest: {
      actAlone: 'Handle selbst, ohne zu fragen',
      askFirst: 'Frag mich vor jeder E-Mail',
      important: 'Was braucht mich heute?',
      newBot: 'Erstell mir einen Bot für Rechnungen',
      owed: 'Wer schuldet mir was?',
      pauseWeek: 'Eine Woche Pause',
      promised: 'Was habe ich diese Woche versprochen?',
      waiting: 'Wer wartet auf meine Antwort?',
      week: 'Was hast du diese Woche gemacht?',
    },
    pause: {
      day: 'Bis morgen',
      hint: 'Pausiert nimmt er keine Mails; die übernimmt Fewmail Bot.',
      month: 'Einen Monat',
      resume: 'Fortsetzen',
      title: 'Pausieren',
      week: 'Eine Woche',
    },
    week: {
      approved: 'mit deiner Zustimmung',
      auto: 'selbst',
      title: 'Letzte 7 Tage',
      waiting: 'warten auf dich',
    },
    lately: 'Zuletzt',
    notifications: 'Benachrichtigungen',
    quiet: {
      hide: 'Ausblenden',
      show: 'Anzeigen',
      week: (n: number) =>
        plural('de', n, {
          one: () => `Eine Änderung in deiner Mail in den letzten 7 Tagen`,
          other: (count) =>
            `${count} Änderungen in deiner Mail in den letzten 7 Tagen`,
        }),
    },
    chatMenu: 'Chat-Aktionen',
    clear: 'Verlauf leeren',
    clearConfirm: (name: string) => `Chat mit ${name} leeren?`,
    clearHint:
      'Seine Nachrichten sind dann endgültig weg. Was er in deiner Mail getan hat, bleibt, ebenso seine Erinnerungen.',
    cleared: 'Verlauf geleert',
    deleteFolder: 'Ordner löschen',
    deleteFolderConfirm: (name: string) => `Ordner ${name} löschen?`,
    deleteFolderHint:
      'Seine Bots bleiben in der Liste, außerhalb jedes Ordners.',
    moveTo: 'In Ordner verschieben',
    newFolder: 'Neuer Ordner',
    noFolder: 'Kein Ordner',
    pin: 'Anheften',
    rename: 'Umbenennen',
    renameFolder: 'Ordner umbenennen',
    unpin: 'Lösen',
    add: 'Neuer Bot',
    answering: 'Schreibe…',
    cancelReply: 'Antwort abbrechen',
    cards: {
      autoDone: (n: number) =>
        plural('de', n, {
          one: () => 'Eine habe ich selbst erledigt.',
          other: (count) => `${count} habe ich selbst erledigt.`,
        }),
      dismissed: (n: number) =>
        plural('de', n, {
          one: () => 'Eine hast du übersprungen.',
          other: (count) => `${count} hast du übersprungen.`,
        }),
      done: (n: number) =>
        plural('de', n, {
          one: () => 'Eine ist erledigt, von dir freigegeben.',
          other: (count) => `${count} sind erledigt, von dir freigegeben.`,
        }),
      failed: (n: number) =>
        plural('de', n, {
          one: () => 'Eine hat Gmail abgelehnt.',
          other: (count) => `${count} hat Gmail abgelehnt.`,
        }),
      pending: (n: number) =>
        plural('de', n, {
          one: () => 'Eine wartet auf dich.',
          other: (count) => `${count} warten auf dich.`,
        }),
    },
    composer: (name: string) => `Schreib ${name} zu seinen Mails`,
    copied: 'Kopiert',
    copy: 'Kopieren',
    created: 'Bot erstellt. Er liest ab jetzt neue Mails.',
    delete: 'Bot löschen',
    deleteConfirm: (name: string) => `${name} löschen?`,
    deleteHint:
      'Sein Chat wird mitgelöscht. Seine Mails bleiben, wo sie sind, und neue Mails dieser Art gehen an Fewmail.',
    deleted: 'Bot gelöscht',
    earlier: 'Frühere anzeigen',
    edit: 'Bot-Einstellungen',
    effect: {
      always_show: 'Auf der Startseite halten',
      archive: 'Archivieren',
      collect: 'Nur sammeln',
      draft_reply: 'Antwort entwerfen',
      mark_read: 'Als gelesen markieren',
      promises: 'Die Versprechen und Fristen, die ich im Blick behalte',
      tidy: 'Aufräumen',
      trash: 'In den Papierkorb',
      unsubscribe: 'Abmelden',
    },
    empty: 'Noch nichts hier. Sobald Mail für mich kommt, schreibe ich hier.',
    enabled: 'Handelt selbst',
    enabledHint: {
      off: 'Aus: Er fragt bei jeder Mail erst nach deiner Freigabe.',
      on: 'An: Er handelt ohne zu fragen, alles, was er tut, steht in seinem Chat.',
    },
    instruction: 'Welche Mails und was er damit macht',
    instructionPlaceholder:
      'z. B. Rechnungen von Hetzner als gelesen markieren oder LinkedIn-Benachrichtigungen archivieren',
    mute: 'Stummschalten',
    muted: 'Stumm: keine Benachrichtigungen von diesem Bot',
    name: 'Name',
    namePlaceholder: 'z. B. Rechnungen',
    noPlan:
      'Ich kann dir nicht antworten: Im kostenlosen Plan habe ich keine Tokens für ein Gespräch. Abonniere, und ich bin ganz für dich da.',
    now: 'Wartet jetzt',
    nudge: {
      noReply: 'In dieser Unterhaltung gibt es noch keine Antwort.',
      replied: 'In dieser Unterhaltung kam seitdem eine Antwort.',
    },
    promises: (n: number) =>
      plural('de', n, {
        one: () => 'Ich habe ein Versprechen notiert.',
        other: (count) => `Ich habe ${count} Versprechen notiert.`,
      }),
    presets: 'Vorlagen',
    react: 'Reagieren',
    reaction: 'Reaktion',
    reply: 'Antworten',
    save: 'Speichern',
    saved: 'Gespeichert',
    simple: {
      title: {
        from: (value: string) => `Von „${value}“`,
        mailingList: () => 'Jede Mailingliste',
        subject: (value: string) => `Betreff enthält „${value}“`,
      },
    },
    spent: (date: string) =>
      `Bis ${date} kann ich nicht antworten: Das Kontingent für diesen Monat ist aufgebraucht.`,
    steps: (n: number) =>
      plural('de', n, {
        one: () => 'Ein Schritt',
        other: (count) => `${count} Schritte`,
      }),
    subscribe: 'Abonnieren',
    fewmail: 'Fewmail Bot',
    fewmailJob: 'Erstellt deine Bots, findet E-Mails und beantwortet Fragen',
    title: 'Bots',
    toLatest: 'Zur neuesten Nachricht',
    unmute: 'Stummschaltung aufheben',
    whatItDoes: 'Was er damit macht',
    you: 'Du',
  },
  settings: {
    disconnectConfirm: (name: string) => `${name} trennen?`,
    messengerDisconnectHint:
      'Der Bot schreibt dir dann nicht mehr. Zum erneuten Verbinden brauchst du einen neuen Link von dieser Seite.',
    readingDigest: {
      description:
        'Jeden Morgen kommen die Newsletter von gestern als eine Nachricht in Telegram und WhatsApp, oder als Mitteilung, wenn keins verbunden ist.',
      title: 'Newsletter-Digest',
    },
    knowledge: {
      description:
        'Preise, Adressen, Verfügbarkeit, wie du gern antwortest. Der Agent nutzt das in Entwürfen und der Autovervollständigung.',
      placeholder:
        'z. B. Beratung kostet $150/h. Freitags nehme ich keine Anrufe an. Meine Adresse ist…',
      title: 'Was der Agent wissen sollte',
    },
    labels: {
      description:
        'Sortiert Mails in Fewmail/…-Labels, damit Gmail auf deinem Handy dieselbe Ordnung zeigt.',
      title: 'Agent-Labels in Gmail',
    },
    snippets: {
      deleted: 'Textbaustein gelöscht',
      add: 'Textbaustein hinzufügen',
      body: 'Text',
      delete: 'Löschen',
      description:
        'Tippe ; im Editor, um einen Textbaustein per Name einzufügen.',
      name: 'Name',
      title: 'Textbausteine',
    },
    account: 'Konto',
    agent: 'Agent',
    deleteAccount: 'Konto löschen',
    deleteConfirm: 'Alles löschen',
    deleteDescription:
      'Löscht dein Konto, synchronisierte Mails, Entwürfe und Bots sofort aus Fewmail. Dein Gmail selbst bleibt unberührt. Ein bezahlter Plan endet sofort.',
    deleteFailed:
      'Das Konto wurde nicht gelöscht. Versuch es in einer Minute noch einmal.',
    deleteSignIn:
      'Melde dich zur Bestätigung noch einmal mit Google an und lösche das Konto dann.',
    deleteTitle: 'Fewmail-Konto löschen?',
    cancel: 'Abbrechen',
    integrations: 'Integrationen',
    language: 'Sprache',
    languageDescription:
      'App, Bot und Zusammenfassungen. Antworten folgen der Mail.',
    legal: 'Rechtliches',
    mailboxes: {
      removeConfirm: (email: string) => `${email} entfernen?`,
      removeHint:
        'Fewmail liest das Postfach nicht mehr und vergisst, was es dort gelesen hat. In Gmail ändert sich nichts.',
      add: 'Gmail hinzufügen',
      addDescription:
        'Mail eines weiteren Gmail-Kontos landet auf derselben Startseite und im selben Posteingang. Damit meldet sich niemand hier an: Eine Anmeldung damit öffnet ein eigenes Fewmail.',
      added: 'Postfach hinzugefügt. Die Mails erscheinen in einer Minute.',
      failed:
        'Das Postfach konnte nicht hinzugefügt werden. Erlaube den Gmail-Zugriff und versuche es erneut.',
      lost: 'Der Gmail-Zugriff ging verloren. Füge es erneut hinzu, um es wieder zu verbinden.',
      reading: 'Mails werden gelesen…',
      remove: 'Entfernen',
      retrying:
        'Gmail antwortet gerade nicht. Fewmail versucht es von selbst erneut.',
      signIn: 'Damit meldest du dich an',
      signInChosen: 'Mit diesem Konto meldest du dich an. Wähle ein anderes.',
      signInLost:
        'Der Gmail-Zugriff ging verloren. Melde dich erneut an, um ihn wiederherzustellen.',
      synced: (ago: string) => `Synchronisiert ${ago}`,
      title: 'Postfächer',
    },
    mcp: {
      disconnectHint:
        'Die App kann deine Mails dann nicht mehr lesen, bis du sie wieder verbindest.',
      allow: 'Erlauben',
      connected: (ago: string) => `Verbunden ${ago}`,
      copy: 'URL kopieren',
      defaultName: 'MCP-Client',
      deny: 'Ablehnen',
      description:
        'Sie können deine Mails lesen, Antworten entwerfen und nach deiner Bestätigung senden.',
      disconnect: 'Trennen',
      paste:
        'Füge diese URL als Connector in deiner App hinzu und melde dich bei Fewmail an.',
      request: (app: string) => `${app} möchte dein Fewmail nutzen`,
      title: 'Claude, Cursor oder einen beliebigen MCP-Client verbinden',
    },
    morningDescription: (timezone: string) =>
      `Newsletter-Digest und der Wochenbericht am Montag, in deiner Zeitzone, ${timezone}`,
    morningTitle: 'Morgennachrichten',
    signedInWithGoogle: 'Mit Google angemeldet',
    signOut: 'Abmelden',
    notifications: {
      blocked:
        'Benachrichtigungen sind blockiert. Erlaube sie in den Website-Einstellungen des Browsers.',
      browser: 'Dieser Browser',
      desktop: 'Dieser Computer',
      messengerOff: 'Dringende Mails bleiben in Fewmail.',
      messengerOn: 'Dringende Mails kommen sofort in den Chat.',
      notConfigured:
        'Browser-Benachrichtigungen sind auf diesem Server nicht eingerichtet.',
      off: 'Erhalte dringende Mails hier, auch wenn Fewmail geschlossen ist.',
      on: 'Dringende Mails erscheinen hier. Mehrere auf einmal kommen als eine.',
      title: 'Benachrichtigungen',
      unsupported: 'Dieser Browser kann keine Benachrichtigungen anzeigen.',
    },
    telegram: {
      connect: 'Telegram verbinden',
      disconnect: 'Trennen',
      linked:
        'Dringende Mails kommen sofort. Gib Entwürfe direkt im Chat frei oder bearbeite sie.',
      linkedQuiet: 'Gib Entwürfe direkt im Chat frei oder bearbeite sie.',
      notConfigured:
        'Der Telegram-Bot ist auf diesem Server nicht eingerichtet.',
      unlinked: 'Erhalte dringende Mails und gib Entwürfe in Telegram frei.',
    },
    whatsapp: {
      connect: 'WhatsApp verbinden',
      disconnect: 'Trennen',
      linked:
        'Dringende Mails kommen sofort. Gib Entwürfe direkt im Chat frei oder bearbeite sie.',
      linkedQuiet: 'Gib Entwürfe direkt im Chat frei oder bearbeite sie.',
      notConfigured:
        'Der WhatsApp-Bot ist auf diesem Server nicht eingerichtet.',
      unlinked: 'Erhalte dringende Mails und gib Entwürfe in WhatsApp frei.',
    },
    title: 'Einstellungen',
  },
  spam: {
    reasonList: 'Auf einer öffentlichen Liste von Spammer-Domains',
    reasonPattern: {
      auth: 'Absender-Authentifizierung fehlgeschlagen: Die Adresse ist gefälscht',
      infra:
        'Aus einem Netzwerk gesendet, das mehrere Fewmail-Nutzer als Spam gemeldet haben',
      link: 'Links zu Seiten, die mehrere Fewmail-Nutzer als Spam gemeldet haben',
      signals:
        'Neue Domain, seltsame Adresse und schwache Authentifizierung zugleich',
      template:
        'Derselbe Text, den mehrere Fewmail-Nutzer als Spam gemeldet haben',
    },
    reasonCommunity: 'Von mehreren Fewmail-Nutzern als Spam gemeldet',
    reasonYou: 'Du hast diesen Absender als Spam gemeldet',
    suspect: 'Wirkt wie Spam',
    imagesHidden: 'Bilder sind im Spam ausgeblendet.',
    openFile: {
      action: 'Öffnen',
      description:
        'Diese E-Mail liegt im Spam. Öffne ihre Dateien nur, wenn du dem Absender vertraust.',
      title: (name: string) => `${name} öffnen?`,
    },
    showImages: 'Bilder anzeigen',
  },
  starterBots: {
    board: { name: 'Pinnwand' },
    important: {
      instruction:
        'Was einen Schritt von mir braucht: Leute, die auf meine Antwort warten, fällige Rechnungen, Sicherheitswarnungen, alles von meiner Bank oder von Behörden. Auf der Startseite halten',
      name: 'Wichtig',
    },
    later: {
      instruction:
        'Gut zu wissen, aber ohne Entscheidung: Neuigkeiten von Diensten, die ich nutze, Lieferungen, Termine und Daten',
      name: 'Kann warten',
    },
    quick: {
      instruction:
        'Rauschen, das ich ungelesen wegräumen würde: Benachrichtigungen, Belege, Newsletter, Werbung und Kaltakquise. Aufräumen: archivieren, als gelesen markieren oder abmelden, je nachdem, was passt',
      name: 'Schnell',
    },
  },
  telegram: {
    approveAlike: 'Alle Karten einer Art auf einmal freigeben:',
    chatTaken:
      'Dieser Chat ist schon mit einem anderen Fewmail-Konto verbunden. Trenne Telegram zuerst dort (Einstellungen → Integrationen) und öffne den Link dann noch einmal.',
    queueChanged:
      'Die Karten haben sich inzwischen geändert. Das braucht dich jetzt:',
    heard: (text: string) => `Verstanden: „${text}“`,
    voiceFailed:
      'Das konnte ich nicht verstehen. Versuch es noch mal oder schreib es.',
    help: 'Schreib oder sag, was du brauchst:\n• frag nach deiner Mail: „Wann verlängert sich Netflix?“\n• sag, was ich antworten soll: „Sag Anna, dass ich morgen unterschreibe“\n• gib mir eine Aufgabe: „archiviere Newsletter von Medium immer“\n• antworte auf einen meiner Entwürfe, um ihn zu ändern',
    canceled: 'Abgebrochen. Der Entwurf ist wieder in deiner Warteschlange.',
    sendingIn: (seconds: number) => `Senden in ${seconds} s`,
    undo: 'Rückgängig',
    commands: { queue: 'Was deine Aufmerksamkeit braucht' },
    connectFirst: (url: string) =>
      `Hi! Ich bin Fewmail. Hier in Telegram sage ich dir, wenn dringende Mail kommt, zeige, was deine Aufmerksamkeit braucht, und sende die Antworten, die du freigibst.\n\nDieser Chat ist noch nicht mit deinem Fewmail verbunden. Das dauert eine Minute:\n1. Öffne die Fewmail-Einstellungen: ${url}\n2. Tippe unter Integrationen auf „Telegram verbinden“ (Teil von Fewmail Pro).\n3. Telegram bringt dich hierher zurück – tippe auf Start, und fertig.`,
    connected:
      'Verbunden. Ich melde mich, wenn etwas Dringendes kommt.\n\n/queue: was deine Aufmerksamkeit braucht',
    done: 'Erledigt',
    draft: 'Entwurf:',
    edit: 'Bearbeiten',
    editPrompt:
      'Schick mir den Text, der stattdessen verwendet werden soll, oder sag mir mit „/“ am Anfang, wie ich ihn ändern soll, z. B. „/förmlicher“.',
    newDraft: 'Neuer Entwurf:',
    nothing: 'Gerade braucht dich nichts.',
    proOnly:
      'Telegram ist Teil von Fewmail Pro. Öffne in Fewmail Einstellungen → Tarif, um zu upgraden.',
    draftClipped:
      'Hier gekürzt. „Senden“ verschickt den ganzen Entwurf – lies ihn in Fewmail.',
    rewriting: 'Schreibe neu…',
    send: 'Senden',
    sendThis: 'So senden',
    shorter: 'Kürzer',
    skip: 'Überspringen',
    skipped: 'Übersprungen',
    somethingWrong: 'Etwas ist schiefgelaufen',
    urgent: 'Dringend',
    willSend: 'Wird gesendet:',
  },
  today: {
    working: 'Wird erledigt…',
    botSuggestion: {
      done: {
        archive:
          'Ein neuer Bot archiviert ab jetzt die Mails dieses Absenders.',
        mark_read:
          'Ein neuer Bot markiert die Mails dieses Absenders ab jetzt als gelesen.',
      },
      label: 'Vorgeschlagener Bot',
      lead: (count: number, effect: 'archive' | 'mark_read') =>
        effect === 'archive'
          ? `${count} E-Mails in diesem Monat, und der Agent würde jede archivieren`
          : `${count} E-Mails in diesem Monat, und der Agent würde jede als gelesen markieren`,
      no: 'Nein, danke',
      yes: {
        archive: 'Immer archivieren',
        mark_read: 'Immer als gelesen markieren',
      },
    },
    newSender: {
      archive: 'Immer archivieren',
      archived: 'Ein neuer Bot archiviert ab jetzt die Mails dieses Absenders.',
      keep: 'Wie gewohnt behalten',
      label: 'Neuer Absender',
      lead: (count: number, opened: number) =>
        `${count} Mails in zwei Wochen, ${opened === 0 ? 'keine geöffnet' : `${opened} geöffnet`}`,
    },
    readingNow: (total: number) =>
      plural('de', total, {
        one: () => 'Der Agent liest eine neue Mail',
        other: (n) => `Der Agent liest ${n} neue Mails`,
      }),
    allDone: 'Alles erledigt. Es gibt nichts zu tun.',
    allDoneLead:
      'Ich lese weiterhin neue E-Mails. Alles, was deine Aufmerksamkeit braucht, erscheint hier.',
    allowanceSpent: (date: string) =>
      `Das Kontingent des Agenten ist für diesen Monat aufgebraucht: Zusammenfassungen und Entwürfe gibt es ab ${date} wieder. Bis dahin schreibe ich Versprechen und Fristen weiter auf.`,
    byBots: (n: number) => `Deine Bots haben ${n} erledigt.`,
    decisions: 'Entscheidungen',
    journal: {
      approved: 'Von dir freigegeben',
      byBot: (bot: string) => `Dein Bot: ${bot}`,
      failed: 'Hat nicht geklappt',
      lead: 'Die letzten 7 Tage. Jede Änderung in deiner Mail oder deinem Kalender wurde von dir freigegeben oder von einem Bot gemacht, den du selbst handeln lässt.',
      title: 'In deinem Postfach erledigt',
    },
    progress: (done: number, total: number) => `${done} von ${total}`,
    mostlyNoise: (people: number) =>
      people === 0
        ? 'Alles Newsletter und Benachrichtigungen.'
        : `Meist Newsletter und Benachrichtigungen, nur ${people} von Menschen.`,
    worth: {
      awaiting: (total: number) =>
        plural('de', total, {
          one: () => '1 wartet auf Antwort',
          other: (n) => `${n} warten auf Antwort`,
        }),
      dated: (total: number) =>
        plural('de', total, {
          one: () => '1 mit Datum',
          other: (n) => `${n} mit Datum`,
        }),
    },
    worthKnowing: 'Gut zu wissen',
    canWait: 'Kann warten',
    canWaitEmpty: {
      lead: 'E-Mails für einen ruhigen Moment und Antworten, auf die du wartest, sammeln sich hier.',
      title: 'Nichts wartet.',
    },
    improve: {
      empty: {
        lead: 'Wenn der Agent sieht, dass du einen Absender immer wieder gleich behandelst, schlägt er hier einen Bot vor.',
        title: 'Gerade keine Vorschläge.',
      },
      lead: (total: number) =>
        plural('de', total, {
          one: () => 'Ein Bot, den der Agent für dich erstellen könnte.',
          other: (n) => `${n} Bots, die der Agent für dich erstellen könnte.`,
        }),
      title: 'Der Agent schlägt vor',
    },
    quick: 'Schnell',
    needsLook: 'Braucht deine Aufmerksamkeit',
    tidy: {
      failed: (emails: string) =>
        `Gmail hat ${emails} nicht geändert. Versuch es gleich noch einmal.`,
      confirm: (emails: string) => `${emails} aufräumen?`,
      running: 'Wird aufgeräumt…',
      unsubscribeHint:
        'Darunter sind Verteiler, von denen Fewmail dich abmeldet, und eine Abmeldung lässt sich nicht rückgängig machen.',
      archive: (n: number) => `${n} archivieren`,
      review: 'Prüfen',
      reviewLead:
        'Jede E-Mail mit dem, was der Agent tun würde, und warum. Bestätige, was passt, und behalte, was bleiben soll, wie es ist.',
      reviewTitle: 'Prüfe, was der Agent vorschlägt',
      done: (n: number) => `${n} aufgeräumt`,
      keep: 'Behalten',
      mark_read: (n: number) => `${n} als gelesen markieren`,
      run: 'Alle bestätigen',
      unsubscribe: (n: number) => `${n} abbestellen`,
      untilYouApprove:
        'In deinem Postfach ändert sich nichts, bis du zustimmst',
      spam: (n: number) => `${n} in Spam`,
      trash: (n: number) => `${n} löschen`,
    },
    pauseListening: 'Pause',
    resumeListening: 'Weiter',
    awaiting: 'Wartet auf Antwort',
    hint: {
      messengers: {
        lead: 'Erhalte dringende Mails und gib Entwürfe frei, im Messenger, den du schon nutzt.',
        title: 'Telegram oder WhatsApp',
      },
      notNow: 'Nicht jetzt',
      setUp: 'Einrichten',
      turnOn: 'Einschalten',
    },
    dates: 'Termine und Fristen',
    done: 'Erledigt',
    firstRead:
      'Zuerst die E-Mails der letzten drei Tage. Alles, was deine Aufmerksamkeit braucht, erscheint hier automatisch.',
    approvedMany: (n: number) => `${n} freigegeben`,
    listen: 'Anhören',
    handled: {
      spam: (n: number) => `${n} als Spam`,
      archived: (n: number) => `${n} archiviert`,
      markedRead: (n: number) => `${n} als gelesen markiert`,
      review: 'Ansehen',
      total: (n: number) => `${n} erledigt`,
      unsubscribed: (n: number) => `${n} abgemeldet`,
    },
    headline: (total: number) =>
      total === 0
        ? 'Alles ruhig.'
        : plural('de', total, {
            one: () => 'Eine Sache braucht deine Aufmerksamkeit.',
            other: (n) => `${n} Dinge brauchen deine Aufmerksamkeit.`,
          }),
    period: (days: number) =>
      days === 1 ? 'in den letzten 24 Stunden' : `in den letzten ${days} Tagen`,
    pulse: {
      lists: (n: number) => `${n} aus Newslettern`,
      people: (n: number) => `${n} von Menschen`,
      total: (total: number, period: string) =>
        plural('de', total, {
          one: (n) => `${n} E-Mail ${period}`,
          other: (n) => `${n} E-Mails ${period}`,
        }),
    },
    saved: (minutes: number) =>
      `Fewmail hat dir diese Woche etwa ${formatMinutes('de', minutes)} gespart`,
    recent: (period: string) => `Außerdem ${period}`,
    sent: 'Gesendet',
    codes: 'Anmeldecodes',
  },
  bulk: {
    badge: (n: number) => `An ${n}+ Fewmail-Nutzer gesendet`,
    reason: (n: number) =>
      `Massenmail: ${n}+ Fewmail-Nutzer haben denselben Text bekommen`,
  },
  cold: {
    reason:
      'Kaltakquise: Jemand Fremdes will dir etwas verkaufen, du hast nie an diese Adresse geschrieben',
  },
  board: {
    lead: {
      coming: (total: number) =>
        plural('de', total, {
          one: () => 'Eine Frist läuft bald ab.',
          other: (n) => `${n} Fristen laufen bald ab.`,
        }),
      owed: (amounts: string) => `Dir stehen ${amounts} zu.`,
      promised: (total: number) =>
        plural('de', total, {
          one: () => 'Du hast eine Sache versprochen.',
          other: (n) => `Du hast ${n} Dinge versprochen.`,
        }),
      waiting: (total: number) =>
        plural('de', total, {
          one: () => 'Ein Versprechen an dich ist noch offen.',
          other: (n) => `${n} Versprechen an dich sind noch offen.`,
        }),
    },
    section: {
      coming: 'Steht bevor',
      owed: 'Dir geschuldet',
      promised: 'Du hast versprochen',
      settled: 'Kürzlich erledigt',
    },
    state: {
      acknowledged: 'sie haben geantwortet, noch nicht erledigt',
      broken: 'ist nicht passiert',
      cancelled: 'abgesagt',
      fulfilled: 'erledigt',
      in_progress: 'unterwegs',
      open: 'wartet',
      overdue: 'überfällig',
    },
    by: (date: string) => `bis ${date}`,
    lastDay: (date: string) => `Frist: ${date}`,
    done: 'Erledigt',
    forget: 'Vergessen',
    reopen: 'Wieder öffnen',
    markedDone: 'Als erledigt markiert',
    forgotten: 'Vergessen',
    reopened: 'Wieder geöffnet',
  },
  cleanup: {
    emails: (total: number) =>
      plural('de', total, {
        one: () => '1 Mail',
        other: (n) => `${n} Mails`,
      }),
    reason: (total: number) => `${total} Mails diesen Monat, keine geöffnet`,
    title: (total: number) =>
      plural('de', total, {
        one: () => 'Einen Newsletter abbestellen, den du nie öffnest',
        other: (n) => `${n} Newsletter abbestellen, die du nie öffnest`,
      }),
  },
  clearOut: {
    partial:
      'Gmail hat einen Teil des Aufräumens abgebrochen. Was schon verschoben wurde, kann zurück.',
    groups: {
      lists: 'Newsletter, die du nie öffnest',
      notifications: 'Gelesene Benachrichtigungen, älter als ein Monat',
      old: 'Alles, was älter als ein Jahr ist',
      promotions: 'Werbung und Soziales, älter als 3 Tage',
    },
    done: (emails: string) => `${emails} aufgeräumt`,
    empty: 'Nichts aufzuräumen: Der Posteingang ist schon in Ordnung.',
    lead: (emails: string) => `${emails} im Posteingang. Das kann weg.`,
    leadCapped: (emails: string) =>
      `Mehr als ${emails} im Posteingang. Das kann weg.`,
    left: (emails: string) => `${emails} bleiben im Posteingang`,
    listsFrom: (names: string, more: number) =>
      more ? `${names} und ${more} weitere` : names,
    ready: (emails: string) => `${emails} können weg`,
    review: 'Ansehen',
    run: (emails: string) => `${emails} aufräumen`,
    safe: 'Nichts wird gelöscht. Aufgeräumte E-Mails landen im Archiv mit dem Label Fewmail/Cleared und kommen mit einem Klick zurück; Newsletter werden zusätzlich abbestellt.',
    scanning:
      'Ich lese den ganzen Posteingang, nur die Kopfzeilen. Bis zu einer Minute.',
    title: 'Posteingang aufräumen',
    undo: 'Alles zurückholen',
    undone: (emails: string) => `${emails} wieder im Posteingang`,
  },
  wrapped: {
    busiest: (day: string, hours: string) =>
      `Aktivster Tag: ${day} · aktivste Stunde: ${hours}`,
    copied: 'Link kopiert',
    copyLink: 'Link kopieren',
    cta: 'Hol dir deins mit Fewmail',
    emails: 'E-Mails kamen an',
    empty:
      'Noch zu wenig Mail für eine Geschichte. Schau in ein paar Tagen wieder vorbei.',
    handled: 'E-Mails von Fewmail erledigt',
    handledHint:
      'Fewmail ändert in Gmail nichts ohne deine Freigabe. Lass einen Bot selbst handeln, dann erledigt er solche Mails für dich.',
    people: 'Wer am meisten schrieb',
    period: { month: 'Dieser Monat', year: 'Dieses Jahr' },
    replies: 'Antworten von Fewmail entworfen und gesendet',
    saveImage: 'Bild speichern',
    saved: 'von Fewmail gespart',
    shareNote:
      'Link und Bild zeigen nur diese Zahlen, nie Namen oder Adressen.',
    shared: { month: 'Ein Monat in E-Mails', year: 'Ein Jahr in E-Mails' },
    spam: 'Spam-Mails gestoppt',
    split: (people: string, lists: string, other: string) =>
      `${people} von Menschen · ${lists} von Newslettern · ${other} sonstige`,
    title: { month: 'Dein Monat in E-Mails', year: 'Dein Jahr in E-Mails' },
    unsubscribed: 'Newsletter verlassen',
  },
  reading: {
    markAllRead: 'Alle als gelesen markieren',
    summary: 'Was deine Newsletter schreiben',
    worth: 'In voller Länge lesenswert',
    leftOut: (n: number) => `Ausgelassen: ${n}, nichts Neues darin.`,
    note: {
      inSummary: 'In der Zusammenfassung',
      leftOut: 'Ausgelassen',
    },
    digest: (n: number) => `Newsletter: ${n}`,
    lead: 'Die Newsletter eines Tages an einem Ort, damit sie den Posteingang nicht füllen.',
    issues: 'Alle Ausgaben',
    empty: 'Noch keine Newsletter',
    emptyHint:
      'Jeden Morgen schreibt der Agent hier die Neuigkeiten aus deinen Newslettern zusammen, jede Zeile verlinkt mit der E-Mail, aus der sie stammt.',
    title: 'Lesen',
  },
  commitments: {
    title: 'Du hast versprochen',
  },
  headsUp: {
    deadline: 'Bald letzter Tag',
    notYet: 'Seitdem kam nichts',
    price: 'Preis gestiegen',
    priceUp: (what: string, from: string, to: string) =>
      `${what}: ${to} statt ${from}`,
    promised: 'Dir versprochen',
  },
  risk: {
    prompt_injection: (domain: string) =>
      `${domain} hat in dieser E-Mail Anweisungen für Assistenten versteckt, die Mails lesen. Der Agent ignoriert sie; leite sie nicht weiter und tu nicht, was sie verlangt.`,
    known_phishing: (domain: string) =>
      `${domain} steht auf einer öffentlichen Liste aktiver Phishing-Seiten. Keine Links öffnen, nicht anmelden, nichts bezahlen.`,
    credential_phishing: (domain: string) =>
      `${domain} will, dass du dich anmeldest oder Karten- oder Kontodaten eingibst. Banken und Dienste fragen per Mail nie danach: Klick keine Links an und gib nichts ein.`,
    lookalike_domain: (domain: string) =>
      `Sieht aus wie ${domain}, ist aber eine andere Adresse. Klick keine Links an und zahl nichts.`,
    new_sender_payment: (domain: string) =>
      `Erste Mail von ${domain}, und es geht um Geld. Prüf das über einen Weg, dem du schon vertraust.`,
    spoofed_sender: (domain: string) =>
      `Gibt vor, von ${domain} zu sein, aber ${domain} hat sie nicht gesendet. Klicke auf keine Links und zahle nichts.`,
    payment_change: (domain: string) =>
      `Neue Zahlungsdaten von ${domain}. Bestätige sie telefonisch, bevor du zahlst.`,
    title: 'Erst prüfen, dann handeln',
  },
  upgrade: {
    hints: {
      board:
        'Teil von Fewmail Pro: Der Agent schreibt auf, was dir versprochen wurde, was du versprochen hast und die letzten Tage aus deiner Mail, und behält jedes im Blick, bis es erledigt ist.',
      chat: 'Teil von Fewmail Pro: Sprich mit deinen Bots über ihre Mails, und sie melden sich bei dir, wann sie es versprochen haben.',
      drafts:
        'Teil von Fewmail Pro: Der Agent schreibt die Antwort in deinem Stil, du bearbeitest und sendest sie.',
    },
  },
  whatsapp: {
    phoneTaken:
      'Diese Nummer ist schon mit einem anderen Fewmail-Konto verbunden. Trenne WhatsApp zuerst dort (Einstellungen → Integrationen) und sende die Nachricht dann noch einmal.',
    connectFirst: (url: string) =>
      `Hi! Ich bin Fewmail. Hier in WhatsApp sage ich dir, wenn dringende Mail kommt, zeige, was deine Aufmerksamkeit braucht, und sende die Antworten, die du freigibst.\n\nDiese Nummer ist noch nicht mit deinem Fewmail verbunden. Das dauert eine Minute:\n1. Öffne die Fewmail-Einstellungen: ${url}\n2. Tippe unter Integrationen auf „WhatsApp verbinden“ (Teil von Fewmail Pro).\n3. WhatsApp öffnet sich mit einer fertigen Nachricht – sende sie, und fertig.`,
    connected:
      'Verbunden. Ich melde mich, wenn etwas Dringendes kommt. Schreib oder sprich eine Nachricht ein, um auf eine Mail zu antworten.',
    proOnly:
      'WhatsApp ist Teil von Fewmail Pro. Öffne in Fewmail Einstellungen → Tarif, um zu upgraden.',
  },
  zombie: {
    badge: (share: number) => `Ignoriert Abmeldungen bei ${share}% der Leute`,
    reason: 'Hat dir nach der Abmeldung weiter geschrieben',
  },
}
