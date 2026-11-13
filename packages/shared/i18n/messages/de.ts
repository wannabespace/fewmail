import type { Rich } from '../locales'
import { formatMinutes, plural } from '../locales'
import type { Messages } from './en'

export const de: Messages = {
  agent: {
    collapse: 'Einklappen',
    voice: 'Mit dem Agenten sprechen',
    voiceStop: 'Stoppen und senden',
    chats: 'Chats',
    calendar: (email: string) => `Im Kalender von ${email}`,
    cc: (recipients: string) => `Cc ${recipients}`,
    confirm: {
      create_schedule: 'Das regelmäßig ausführen?',
      create_event: 'Diesen Termin hinzufügen?',
      delete_event: 'Diesen Termin löschen?',
      update_event: 'Diesen Termin ändern?',
      approve_action: 'Diese Aktion ausführen?',
      archive_thread: 'Diese Unterhaltung archivieren?',
      clear_out: 'Diese Gruppen aus dem Posteingang aufräumen?',
      undo_clear_out: 'Alle aufgeräumten E-Mails zurück in den Posteingang?',
      create_rule: 'Diese Regel hinzufügen?',
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
    decline: 'Nein',
    declined: 'Abgelehnt',
    stepCount: (count: number) =>
      plural('de', count, {
        one: () => 'Ein Schritt',
        other: (n) => `${n} Schritte`,
      }),
    detach: 'Diese E-Mail nicht anhängen',
    deleteChat: 'Chat löschen',
    deleteChatConfirm: 'Diesen Chat löschen?',
    deleteChatHint:
      'Die Unterhaltung ist dann endgültig weg. Deine Mails bleiben, wo sie sind.',
    failed: 'Der Agent konnte nicht fertig werden. Versuch es noch einmal.',
    newChat: 'Neuer Chat',
    noChats: 'Noch keine Chats',
    cancelEdit: 'Bearbeiten abbrechen',
    copy: 'Kopieren',
    edit: 'Bearbeiten',
    editing: 'Du bearbeitest deine Nachricht',
    regenerate: 'Neu antworten',
    skills: 'Skills',
    placeholder: 'Frag nach deinen Mails oder tipp / für Skills',
    retry: 'Erneut versuchen',
    send: 'Senden',
    steps: {
      create_schedule: 'Zeitplan wird eingerichtet',
      delete_schedule: 'Zeitplan wird beendet',
      list_schedules: 'Zeitpläne werden gelesen',
      create_event: 'Termin wird hinzugefügt',
      delete_event: 'Termin wird gelöscht',
      list_events: 'Kalender wird geprüft',
      update_event: 'Termin wird geändert',
      list_subscriptions: 'Lese Abos',
      approve_action: 'Wird ausgeführt',
      archive_thread: 'Wird archiviert',
      get_reading: 'Newsletter werden gelesen',
      get_wrapped: 'Ich zähle deine Mails',
      clear_out: 'Posteingang wird aufgeräumt',
      preview_clear_out: 'Ganzer Posteingang wird gelesen',
      undo_clear_out: 'Aufgeräumte E-Mails kommen zurück',
      create_rule: 'Regel wird hinzugefügt',
      dismiss_action: 'Wird übersprungen',
      draft_reply: 'Antwort wird entworfen',
      create_draft: 'Entwurf wird gespeichert',
      get_board: 'Board wird gelesen',
      get_person: 'Person wird nachgeschlagen',
      get_today: 'Heute wird geprüft',
      list_boards: 'Boards werden geöffnet',
      list_handled: 'Erledigtes wird geprüft',
      list_mail: 'Mails werden durchsucht',
      list_rules: 'Regeln werden gelesen',
      read_thread: 'Unterhaltung wird gelesen',
      redraft_action: 'Entwurf wird umgeschrieben',
      refresh: 'Neue Mails werden abgerufen',
      send_email: 'Wird gesendet',
      snooze_thread: 'Wird zurückgestellt',
      unsubscribe: 'Wird abgemeldet',
      tidy_mail: 'Wird aufgeräumt',
      trash_thread: 'Verschiebe in den Papierkorb',
      report_spam: 'Melde Spam',
      mark_not_spam: 'Hole aus dem Spam',
      move_to_inbox: 'Verschiebe in den Posteingang',
      create_board: 'Erstelle ein Board',
      update_board: 'Ändere das Board',
      delete_board: 'Lösche das Board',
      add_board_chart: 'Füge ein Diagramm hinzu',
      add_to_board: 'Lege es aufs Board',
      edit_board_entry: 'Korrigiere den Eintrag',
      remove_board_entry: 'Entferne es vom Board',
      rename_board_group: 'Benenne die Gruppe um',
    },
    stop: 'Stopp',
    thinking: 'Denke nach…',
    to: (recipients: string) => `An ${recipients}`,
    until: (time: string) => `Bis ${time}`,
    yes: {
      create_schedule: 'Einplanen',
      create_event: 'Hinzufügen',
      delete_event: 'Löschen',
      update_event: 'Speichern',
      approve_action: 'Ausführen',
      archive_thread: 'Archivieren',
      clear_out: 'Aufräumen',
      undo_clear_out: 'Zurückholen',
      create_rule: 'Hinzufügen',
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
  ask: {
    label: (question: string) => `Fewmail fragen: „${question}“`,
    openChat: 'Im Chat öffnen',
    thinking: 'Durchsuche deine Mails…',
  },
  compose: {
    backInQueue: 'Abgebrochen. Der Entwurf ist wieder auf der Startseite.',
    canceled: 'Abgebrochen. Deine E-Mail ist wieder im Editor.',
    cc: 'Cc',
    discard: 'Verwerfen',
    draftSaved: 'Entwurf gespeichert',
    forward: 'Weiterleiten',
    forwardedMessage: 'Weitergeleitete Nachricht',
    from: 'Von',
    instructionPlaceholder: 'Wie soll sie klingen? (optional)',
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
    chapters: {
      pricing: {
        description:
          'Sortieren, Regeln und Schutz sind für immer kostenlos. Lite, Pro und Max bringen alles dazu, was für dich liest und schreibt; die größeren Pläne machen einfach mehr davon.',
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
      lead: 'Verbinde Fewmail als MCP-Server und frag den Assistenten, den du schon nutzt, nach deinen Mails. Alles, was sendet oder Gmail ändert, fragt trotzdem nach deinem Ja.',
      question: 'Was braucht Anna diese Woche von mir?',
      setup: 'In einer Minute verbunden',
      title: 'Deine Mails, direkt in Claude und ChatGPT.',
    },
    mcpPage: {
      copy: 'URL kopieren',
      lead: 'Verbinde Fewmail als MCP-Server und frag die KI, die du schon nutzt, nach deinen Mails. Lesen und das Sortieren durch den Agenten sind kostenlos; Entwürfe, Senden und Regeln gibt es mit Pro.',
      safety:
        'Alles, was eine E-Mail sendet oder Gmail ändert, fragt zuerst nach deinem Ja. Deine Mails trainieren nie Modelle, und jede App lässt sich in den Einstellungen trennen.',
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
        home: 'Alles, was dich braucht, auf einer Seite',
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
        rules: 'Regeln in einfachen Worten',
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
        home: 'Live, mit Sammelfreigabe, mit Pro',
        drafts: 'In deinem Ton, gesendet erst nach deiner Freigabe, mit Pro',
        followUps: 'Automatisch, bei Mails, die eine Antwort erwarten',
        handOver: 'Der Agent bringt ihn ans Ziel, mit Pro',
        importance: 'Jede Mail bewertet, kostenlos',
        keepApp: 'Alles erscheint in Gmail',
        mcp: 'Mit Pro',
        memory: 'Mit Pro',
        phone: 'Telegram und WhatsApp, mit Sprache, mit Pro',
        rules: 'Archivieren, als gelesen markieren oder abmelden, kostenlos',
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
          rules: 'Training durch Verschieben von Mails zwischen Ordnern',
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
          rules: 'KI-Filter, 3 bis 50 je nach Tarif',
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
          'Mit Superhuman gehst du schneller durch jede Mail. Fewmail geht sie für dich durch und zeigt dir nur, was dich braucht.',
        them: {
          ask: 'Ask AI, mit Business',
          drafts: 'Auto Drafts, mit Business',
          followUps: 'Auto Reminders',
          importance: 'Split Inbox und Auto Labels',
          keepApp: 'Ersetzt deine Mail-App',
          mcp: 'Mit Business',
          phone: 'Apps für iOS und Android',
          rules: 'Custom Auto Labels, mit Business',
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
        ask: {
          description:
            'Frag in einfachen Worten, was du willst, und bekomm die Antwort aus deinen eigenen Mails, samt den Mails, aus denen sie stammt.',
          title: 'Frag deine Mails',
        },
        boards: {
          description:
            'Geld, bezahlte Abos, Reisen, Bestellungen: Beschreib, was erfasst werden soll, und der Agent sammelt es aus bis zu einem Jahr Mails, mit Diagrammen.',
          title: 'Boards',
        },
        calendar: {
          description:
            'Die Kalender aller Postfächer in einer Ansicht. Ein Termin, der in einer Mail vorgeschlagen wird, landet im Kalender, sobald du Ja sagst.',
          title: 'Kalender',
        },
        clearOut: {
          description:
            'Der ganze Rückstau auf einmal raus, bis zu 50.000 Mails pro Postfach, alle unter einem Label, sodass Rückgängig jede einzelne zurückholt. Kostenlos.',
          title: 'Aufräumen',
        },
        forward: {
          description:
            'Leite eine Mail mit einer Notiz obendrauf weiter, „finde nächste Woche einen Termin mit ihnen“, und der Agent übernimmt.',
          title: 'An den Agenten weiterleiten',
        },
        reading: {
          description:
            'Die Newsletter des Tages in einer ruhigen Liste, jeder in ein paar Sätzen zusammengefasst.',
          title: 'Lesen',
        },
        voice: {
          description:
            'Tippe auf der Startseite auf „Anhören“ und hör, was dich braucht. Sprich mit dem Agenten in der App, in Telegram oder WhatsApp, und er antwortet laut.',
          title: 'Hör, was dich braucht',
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
        'Der E-Mail-Agent, der dein Gmail liest und dir nur zeigt, was dich braucht.',
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
          fix: 'Eine Taste meldet dich ab, so wie es ein Mensch tun würde: ein Klick, die Abmeldeseite oder eine Mail. Absender, die trotzdem weiterschreiben, landen direkt im Spam.',
          problem: 'Newsletter, die du nie abonniert hast.',
        },
        {
          fix: 'Lesen sammelt die Newsletter des Tages in einer Liste, jeder in ein paar Sätzen zusammengefasst.',
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
      lead: 'Newsletter, Belege, Benachrichtigungen, ein Phishing-Link und irgendwo dazwischen die drei Mails, die wirklich zählen. Fewmail ist der Agent, der das alles für dich liest.',
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
      about: (emails: string, messages: string) =>
        `Etwa ${emails} gelesene E-Mails oder ${messages} Nachrichten an den Agenten im Monat`,
      oneAllowance:
        'Ein Kontingent für alles, was der Agent tut: Du zahlst nur, was du nutzt, und Rauschen zählt nie',
      everythingIn: (plan: string) => `Alles aus ${plan}, plus`,
      forever: 'für immer',
      free: {
        description: 'Sortieren, Regeln und Schutz. Für immer.',
        features: [
          'Jede Mail sortiert und nach Wichtigkeit bewertet',
          'Regeln in einfachen Worten, die archivieren, als gelesen markieren oder abmelden',
          'Community-Spamschutz und Phishing-Warnungen',
          'Zombie-Absender, die nach dem Abmelden weiterschreiben, werden erkannt',
          'Automatisches Nachfassen bei Mails, die eine Antwort erwarten',
          'Zurückstellen, Textbausteine und Fewmail-Labels in Gmail',
        ],
      },
      max: {
        description: 'Derselbe Agent für ein volles Postfach.',
      },
      monthly: 'Monatlich',
      per: { month: 'im Monat', year: 'im Jahr' },
      lite: {
        description:
          'Der ganze Agent: Er liest, schreibt und merkt sich alles.',
        features: [
          'Startseite: eine Live-Warteschlange von Entscheidungen, einzeln oder gesammelt freigegeben',
          'Antworten in deinem Ton, gesendet erst nach deiner Freigabe',
          'Telegram: dringende Mails, Freigaben und Sprachbefehle',
          'Versprechen und Personen im Gedächtnis, Boards mit Diagrammen für Geld oder alles, was du erfasst',
          'Frag deine Mails alles, dazu MCP für deine eigenen Tools',
        ],
      },
      pro: {
        description: 'Derselbe Agent mit Platz für mehr Mail.',
      },
      tryFree: (days: number) => `${days} Tage kostenlos testen`,
      yearly: 'Jährlich · 2 Monate gratis',
    },
    pricingPage: {
      lead: (trialDays: number) =>
        `Sortieren, Regeln in einfachen Worten und Schutz sind für immer kostenlos. Pro ist der Agent, der für dich liest, schreibt und sich alles merkt; Max ist derselbe Agent mit Platz für ein volles Postfach. Jedes Konto startet mit ${trialDays} Tagen Pro, und danach bleibst du einfach bei Free.`,
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
          title: 'Ohne dein Ja wird nichts gesendet.',
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
  actionKind: {
    cleanup: 'Alle abbestellen',
    commitment: 'Erledigt',
    security: 'Geprüft',
    spam: 'In Spam verschoben',
    trash: 'In den Papierkorb',
    archive: 'Archivieren',
    follow_up: 'Nachfassen',
    mark_read: 'Gelesen',
    pay: 'Bezahlen',
    read: 'Lesen',
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
  byRule: 'per Regel',
  calendar: {
    tomorrow: 'Morgen',
    noAccess: {
      allow: 'Zugriff erlauben',
      description:
        'Google durfte deinen Kalender nicht mit Fewmail teilen. Erlaube es, um Termine hier zu sehen und anzulegen.',
      title: 'Kalender nicht verbunden',
    },
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
    agent: 'Agent',
    appearance: 'Darstellung',
    goTo: 'Gehe zu',
    mail: 'Mail',
    nothingMatches: 'Keine Treffer.',
    placeholder: 'Frag nach deinen Mails oder führe einen Befehl aus…',
    upgrade: 'Auf Pro upgraden',
    teachRule: 'Neue Regel beibringen',
    theme: {
      dark: 'Dunkel',
      light: 'Hell',
      system: 'System',
    },
  },
  importance: ['Rauschen', 'Gut zu wissen', 'Braucht dich bald', 'Dringend'],
  justNow: 'gerade eben',
  errors: {
    calendarAccess:
      'Fewmail hat keinen Zugriff auf diesen Kalender. Erlaube ihn auf der Kalenderseite.',
    failed: 'Etwas ist schiefgelaufen. Versuch es noch einmal.',
    needsPro: 'Dafür brauchst du Fewmail Pro.',
    alreadySent: 'Schon gesendet – Rückgängig geht nicht mehr.',
    notFound: 'Das gibt es nicht mehr – vielleicht wurde es gelöscht.',
    offline: 'Fewmail ist nicht erreichbar. Prüf deine Verbindung.',
  },
  update: {
    available: 'Eine neue Version von Fewmail ist da.',
    reload: 'Neu laden',
  },
  keys: {
    summary: 'Zusammenfassung',
    askAgent: 'Agent fragen',
    fromSender: 'mehr vom Absender',
    approvePicked: (n: number) => `${n} ausgewählte genehmigen`,
    pick: 'auswählen',
    pickAll: 'alle auswählen',
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
    ask: 'danach fragen',
    archive: 'archivieren',
    approve: 'freigeben',
    approveAll: (n: number) => `alle ${n} dieser Art freigeben`,
    close: 'schließen',
    draftReply: 'Entwurf',
    edit: 'bearbeiten',
    move: 'bewegen',
    open: 'öffnen',
    notOnBoard: 'nicht auf diesem Board',
    rename: 'umbenennen',
    clearFilter: 'Filter löschen',
    search: 'suchen',
    send: 'senden',
    skip: 'überspringen',
    stopEditing: 'fertig',
    rewrite: 'umschreiben',
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
      'Fewmail bittet darum, Gmail für dich zu lesen, zu ordnen und zu senden. Ohne dein Okay wird nichts gesendet und nichts archiviert, außer du legst eine Regel an, die es erlaubt. Außerdem bittet es um deinen Google Kalender, den du abwählen kannst.',
    continue: 'Weiter mit Google',
    lead: 'Fewmail liest deinen Posteingang für dich, antwortet in deinem Ton und zeigt dir nur, was dich wirklich braucht.',
    messengers:
      'Funktioniert auch in Messengern, zuerst in Telegram: dringende Mails erhalten, Antworten freigeben oder einfach eine Sprachnachricht schicken.',
    title: 'Nur, was zählt.',
  },
  mail: {
    pin: 'Anheften',
    unpin: 'Lösen',
    pinned: 'Angeheftet',
    showAll: (n: number) => `Alle ${n} zeigen`,
    showFewer: 'Weniger zeigen',
    oneTimeCode: {
      archive: 'Kopieren und archivieren',
      copied: 'Code kopiert',
      copy: 'Code kopieren',
      trash: 'Kopieren und löschen',
    },
    openUnsubscribePage: 'Seite öffnen',
    unsubscribeYourself:
      'Diesen Newsletter musst du auf seiner Seite selbst abbestellen. Seine Mails sind bis dahin archiviert.',
    allMailboxes: 'Alle Postfächer',
    filterAbout: {
      focused: 'Wichtiges und Menschen zuerst, Hinweise eingeklappt',
      unread: 'Was du noch nicht gelesen hast, nach Art',
      inbox: 'Alles, Neuestes zuerst',
    },
    find: {
      back: 'Zurück zur Post',
      open: 'Suchen',
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
    noThread: 'Wähle eine E-Mail, um sie hier zu lesen',
    deleteDraft: 'Entwurf löschen',
    notSent: 'Nicht gesendet – zum erneuten Senden öffnen',
    noRecipients: 'Keine Empfänger',
    notSpam: 'Kein Spam',
    reportSpam: 'Als Spam melden',
    reportedSpam: 'Gemeldet. Ihre Mails landen jetzt im Spam.',
    archive: 'Archivieren',
    archived: 'Archiviert',
    attachment: 'Anhang',
    draftReply: 'Antwort entwerfen',
    drafting: 'Entwerfe…',
    draftWaiting: 'Entwurf wartet auf der Startseite',
    due: (date: string) => `fällig am ${date}`,
    dueHint: 'Frist, die der Agent in dieser E-Mail gefunden hat',
    empty: 'Hier sind keine Mails',
    emptyHint: 'Neue Mails erscheinen hier, sobald sie ankommen.',
    noResults: 'Nichts gefunden',
    noResultsHint: 'Versuch andere Wörter oder einen anderen Ordner.',
    expectsReply: 'Erwartet Antwort',
    filter: {
      archive: 'Archiv',
      trash: 'Papierkorb',
      drafts: 'Entwürfe',
      spam: 'Spam',
      inbox: 'Posteingang',
      snoozed: 'Zurückgestellt',
      focused: 'Fokus',
      unread: 'Ungelesen',
    },
    instruction:
      'Sag dem Agenten, wie er antworten soll, oder drück einfach Enter',
    open: 'Öffnen',
    search: 'Suchen oder beschreiben: Rechnungen von Anna letzten Monat',
    openInGmail: 'In Gmail öffnen',
    unsubscribe: 'Abmelden',
    unsubscribed: 'Abgemeldet',
    unsubscribeFailed:
      'Dieser Absender bietet keine Abmeldung per Klick, daher wurde die Mail archiviert.',
    you: 'Du',
  },
  subscriptions: {
    archivedOnly:
      'Dieser Absender bietet kein Abbestellen per Klick, daher wurden seine Mails archiviert. Kommen weiter welche, gehen sie in den Spam.',
    count: (total: number) => `Verteiler: ${total}`,
    empty: 'Diesen Monat hat dir kein Verteiler geschrieben.',
    lead: 'Verteiler, die dir diesen Monat geschrieben haben, die aktivsten zuerst. Abbestellen archiviert alles, was sie geschickt haben; Mails, die zwei Wochen später noch kommen, landen im Spam.',
    opened: (total: number) =>
      total === 0 ? 'keine geöffnet' : `${total} geöffnet`,
    title: 'Abos',
    unsubscribe: 'Abbestellen',
    unsubscribed: 'Abbestellt',
  },
  nav: {
    labels: 'Labels',
    folders: 'Ordner',
    calendar: 'Kalender',
    subscriptions: 'Abos',
    boards: 'Boards',
    newBoard: 'Neues Board',
    mail: 'Mail',
    reading: 'Lesen',
    rules: 'Regeln',
    search: 'Suchen oder fragen…',
    settings: 'Einstellungen',
    syncFailed: 'Gmail-Sync fehlgeschlagen, neuer Versuch',
    syncing: 'Lese deinen Posteingang…',
    home: 'Startseite',
    trialLeft: (total: number) =>
      plural('de', total, {
        one: () => 'Pro-Testphase · noch 1 Tag',
        other: (n) => `Pro-Testphase · noch ${n} Tage`,
      }),
    usage: (percent: number) => `Agent · ${percent} % des Monats verbraucht`,
    watching: 'Der Agent behält deinen Posteingang im Blick',
  },
  schedule: {
    awaitsAnswer:
      'Diesen Lauf habe ich übersprungen: Der letzte wartet in diesem Chat noch auf deine Antwort.',
    failed:
      'Dieser geplante Lauf ist fehlgeschlagen. Ich versuche es beim nächsten erneut.',
    limitReached: (day: string) =>
      `Das Kontingent des Agenten ist für diesen Monat aufgebraucht, daher überspringt der Zeitplan Läufe bis zum ${day}.`,
    open: 'In Fewmail öffnen',
    stopped:
      'Dieser Zeitplan ist dreimal hintereinander fehlgeschlagen, deshalb habe ich ihn gestoppt. Bitte mich, ihn neu einzurichten, wenn du ihn zurück willst.',
  },
  notifications: {
    many: (total: number) =>
      plural('de', total, {
        other: (n) => `${n} Neuigkeiten von Fewmail`,
      }),
  },
  onboarding: {
    boardsHint: (max: number) =>
      `Seiten, die der Agent aus deinen Mails füllt, beginnend mit den letzten drei Monaten. Wähle bis zu ${max}; eigene kannst du später hinzufügen.`,
    boardsTitle: 'Was soll der Agent für dich sammeln?',
    languageHint:
      'App, Zusammenfassungen und Erklärungen nutzen diese Sprache. Antworten folgen immer der Sprache der Mail, auf die du antwortest.',
    languageTitle: 'Welche Sprache soll Fewmail sprechen?',
    lead: 'Zwei kurze Antworten. Du kannst alles später in den Einstellungen ändern.',
    reading: 'Lese deinen Posteingang…',
    start: 'Los geht’s',
    title: 'Richten wir deinen Agenten ein.',
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
    approve: 'Genehmigen',
    delete: 'Löschen',
    pick: 'Auswählen',
    picked: (n: number) => `${n} ausgewählt`,
    unpick: 'Abwählen',
    askedByYou: 'Von dir angefragt',
    draftedInVoice: 'In deinem Ton entworfen',
    edit: 'Bearbeiten',
    open: 'Öffnen',
    send: 'Senden',
    rewrite: 'Umschreiben',
    shorterInstruction: 'Mach es kürzer.',
    new: 'Neu',
    skipStale: 'Alle überspringen',
    skipped: (n: number) => `Übersprungen: ${n}`,
    stale: (n: number) => `Älter als eine Woche: ${n}`,
    skip: 'Überspringen',
  },
  rules: {
    deleted: 'Regel gelöscht',
    add: 'Regel hinzufügen',
    count: (total: number) =>
      plural('de', total, {
        one: () => '1 Regel',
        other: (n) => `${n} Regeln`,
      }),
    delete: 'Löschen',
    describe: {
      alwaysShow: 'Landet immer auf der Startseite',
      autonomous: 'Wird selbst erledigt, steht unter Erledigt',
      draft: 'Ein Entwurf wartet auf der Startseite auf dich',
    },
    effect: {
      trash: 'In den Papierkorb',
      always_show: 'Immer anzeigen',
      archive: 'Archivieren',
      draft_reply: 'Antwort entwerfen',
      mark_read: 'Als gelesen markieren',
      unsubscribe: 'Abmelden',
    },
    enabled: 'Regel aktiv',
    lead: 'Sag dem Agenten in einfachen Worten, was er mit bestimmten Mails tun soll. Er prüft jede Mail anhand dieser Regeln.',
    newTitle: 'Neue Regel beibringen',
    placeholder:
      'z. B. Rechnungen von Hetzner oder Benachrichtigungen von LinkedIn',
    leadFree:
      'Automatisch archivieren, als gelesen markieren oder abmelden. Regeln greifen bei neuer Mail, sobald sie ankommt.',
    simple: {
      appliedAutomatically: 'Wird automatisch auf neue Mail angewendet',
      field: {
        from: 'Von',
        mailingList: 'Jede Mailingliste',
        subject: 'Betreff enthält',
      },
      title: {
        from: (value: string) => `Von „${value}“`,
        mailingList: () => 'Jede Mailingliste',
        subject: (value: string) => `Betreff enthält „${value}“`,
      },
      valuePlaceholder: 'anna@example.com, ein Name oder ein Wort',
      whichField: 'Abgleichen nach',
    },
    title: 'Regeln',
    whatAgentDoes: 'Was der Agent tut',
    whichEmails: 'Welche Mails',
  },
  settings: {
    readingDigest: {
      description:
        'Jeden Morgen kommen die Newsletter des letzten Tages als eine Nachricht in Telegram und WhatsApp.',
      title: 'Newsletter-Digest',
    },
    forward: {
      copy: 'Adresse kopieren',
      description:
        'Sende oder leite eine E-Mail aus deinem eigenen Postfach an diese Adresse, mit einer Notiz oben, was zu tun ist. Die Antwort kommt in Telegram oder WhatsApp und in einen Chat hier.',
      title: 'An den Agenten weiterleiten',
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
    schedules: {
      delete: 'Löschen',
      description:
        'Bitte den Agenten im Chat, etwas regelmäßig zu tun, etwa „jeden Freitag um 17:00 die Rechnungen der Woche sammeln“. Jeder Lauf landet in einem eigenen Chat, wo du alles bestätigst, was er senden möchte.',
      title: 'Zeitpläne',
    },
    snippets: {
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
      'Löscht dein Konto, synchronisierte Mails, Entwürfe und Regeln sofort aus Fewmail. Dein Gmail selbst bleibt unberührt.',
    deleteTitle: 'Fewmail-Konto löschen?',
    cancel: 'Abbrechen',
    integrations: 'Integrationen',
    language: 'Sprache',
    languageDescription:
      'App, Bot und Zusammenfassungen. Antworten folgen der Mail.',
    legal: 'Rechtliches',
    mailboxes: {
      add: 'Gmail hinzufügen',
      addDescription:
        'Mail eines weiteren Gmail-Kontos landet auf derselben Startseite und im selben Posteingang. Damit meldet sich niemand hier an: Eine Anmeldung damit öffnet ein eigenes Fewmail.',
      added: 'Postfach hinzugefügt. Die Mails erscheinen in einer Minute.',
      failed:
        'Das Postfach konnte nicht hinzugefügt werden. Erlaube den Gmail-Zugriff und versuche es erneut.',
      lost: 'Der Gmail-Zugriff ging verloren. Füge es erneut hinzu, um es wieder zu verbinden.',
      reading: 'Mails werden gelesen…',
      remove: 'Entfernen',
      signIn: 'Damit meldest du dich an',
      signInChosen: 'Mit diesem Konto meldest du dich an. Wähle ein anderes.',
      synced: (ago: string) => `Synchronisiert ${ago}`,
      title: 'Postfächer',
    },
    mcp: {
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
  },
  starterRules: {
    alwaysShow:
      'Sicherheitswarnungen, fällige Rechnungen, alles von meiner Bank oder von Behörden',
    newsletters: 'Newsletter und Digests',
    notifications: 'Automatische Benachrichtigungen von Tools und Diensten',
    promotions: 'Angebote, Marketing und Kaltakquise-Mails',
    receipts: 'Belege, Bestell- und Versandbestätigungen',
  },
  telegram: {
    approveAlike: 'Alle Karten einer Art auf einmal freigeben:',
    heard: (text: string) => `Verstanden: „${text}“`,
    voiceFailed:
      'Das konnte ich nicht verstehen. Versuch es noch mal oder schreib es.',
    help: 'Schreib oder sag, was du brauchst:\n• frag nach deiner Mail: „Wann verlängert sich Netflix?“\n• sag, was ich antworten soll: „Sag Anna, dass ich morgen unterschreibe“\n• gib mir eine Aufgabe: „leg ein Board für Reisen an“\n• antworte auf einen meiner Entwürfe, um ihn zu ändern',
    canceled: 'Abgebrochen. Der Entwurf ist wieder in deiner Warteschlange.',
    sendingIn: (seconds: number) => `Senden in ${seconds} s`,
    undo: 'Rückgängig',
    commands: { queue: 'Was dich braucht' },
    connectFirst: (url: string) =>
      `Hi! Ich bin Fewmail. Hier in Telegram sage ich dir, wenn dringende Mail kommt, zeige, was dich braucht, und sende die Antworten, die du freigibst.\n\nDieser Chat ist noch nicht mit deinem Fewmail verbunden. Das dauert eine Minute:\n1. Öffne die Fewmail-Einstellungen: ${url}\n2. Tippe unter Integrationen auf „Telegram verbinden“ (Teil von Fewmail Pro).\n3. Telegram bringt dich hierher zurück – tippe auf Start, und fertig.`,
    connected:
      'Verbunden. Ich melde mich, wenn etwas Dringendes kommt.\n\n/queue: was dich braucht',
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
    tidy: {
      archive: (n: number) => `${n} archivieren`,
      details: 'Details',
      done: (n: number) => `${n} aufgeräumt`,
      keep: 'Behalten',
      mark_read: (n: number) => `${n} als gelesen markieren`,
      run: 'Aufräumen',
      total: (n: number) => `Ruhige E-Mails zum Aufräumen: ${n}`,
      unsubscribe: (n: number) => `${n} abbestellen`,
    },
    stopListening: 'Stopp',
    awaiting: 'Wartet auf Antwort',
    hint: {
      notNow: 'Nicht jetzt',
      setUp: 'Einrichten',
      turnOn: 'Einschalten',
    },
    dates: 'Termine und Fristen',
    done: 'Erledigt',
    firstRead:
      'Ich lese die Mails der letzten drei Tage. Was dich braucht, erscheint hier von selbst.',
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
            one: () => 'Eine Sache braucht dich.',
            other: (n) => `${n} Sachen brauchen dich.`,
          }),
    nothingNeedsYou:
      'Gerade braucht dich nichts. Neue Mails werden gelesen, sobald sie ankommen.',
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
    savedHow: (handled: number, replies: number) =>
      `Selbst erledigt: ${handled} · Antworten aus Entwürfen: ${replies}`,
    recent: (period: string) => `Außerdem ${period}`,
    sent: 'Gesendet',
    codes: 'Anmeldecodes',
    worthAttention: 'Einen Blick wert',
  },
  boards: {
    addTo: 'Zu einem Board hinzufügen',
    added: (board: string) => `Zu ${board} hinzugefügt`,
    cancel: 'Abbrechen',
    chart: {
      add: 'Diagramm hinzufügen',
      ask: 'Beschreibe das Diagramm',
      askPlaceholder: 'Ausgaben pro Shop, Bestellungen nach Status…',
      currency: 'Währung',
      edit: 'Diagramm-Einstellungen',
      empty: 'Noch nichts zu zeichnen',
      groupBy: 'Gruppiert nach',
      groupings: {
        group: 'Wer oder was',
        month: 'Monat',
        status: 'Status',
        week: 'Woche',
      },
      measure: 'Zeigt',
      measures: { count: 'Anzahl', sum: 'Gesamtbetrag' },
      moveEarlier: 'Nach vorne',
      moveLater: 'Nach hinten',
      other: 'Sonstiges',
      remove: 'Diagramm entfernen',
      skipped: (n: number) =>
        `Nicht gezählt: ${n} in anderer Währung oder ohne Betrag`,
      title: 'Diagrammtitel',
      type: 'Diagrammtyp',
      types: {
        area: 'Fläche',
        bar: 'Balken',
        line: 'Linie',
        pie: 'Kreis',
      },
      untitled: 'Neues Diagramm',
      weekOf: (date: string) => `Woche ab ${date}`,
    },
    charts: 'Diagramme',
    create: 'Board erstellen',
    delete: 'Board löschen',
    deleteConfirm: (name: string) => `„${name}“ löschen?`,
    deleteHint:
      'Einträge und Diagramme werden mitgelöscht. Deine Mails bleiben, wo sie sind.',
    describe: 'Ändern, was es sammelt',
    description: 'Was es sammelt',
    descriptionPlaceholder:
      'Reisen: Flüge, Hotels und Mietwagen, mit den Kosten',
    due: (when: string) => `Steht an: ${when}`,
    empty: 'Noch leer. Passende E-Mails erscheinen hier, sobald sie ankommen.',
    entries: (total: number) =>
      plural('de', total, {
        one: () => 'Ein Eintrag',
        other: (n) => `${n} Einträge`,
      }),
    entry: {
      edited: 'Von dir bearbeitet',
      nextOn: (date: string) => `nächstes: ${date}`,
      remove: 'Nicht auf diesem Board',
      removed: 'Vom Board genommen. Es lernt daraus.',
    },
    expected: (when: string) => `Erwartet ${when}`,
    filter: {
      clear: 'Filter löschen',
      nothing: 'Keine passenden Einträge.',
      search: 'Einträge durchsuchen',
    },
    groups: {
      every: {
        month: 'jeden Monat',
        quarter: 'jedes Quartal',
        week: 'jede Woche',
        year: 'jedes Jahr',
      },
      expected: (date: string) => `erwartet ${date}`,
      next: (date: string) => `nächstes: ${date}`,
      perMonth: (amount: string) => `${amount} / Monat`,
      rename: 'Gruppe umbenennen',
      renameHint:
        'Gib ihr den Namen einer anderen Gruppe, um beide zusammenzuführen.',
      showAll: (n: number) => `Alle ${n} anzeigen`,
      showFewer: 'Weniger anzeigen',
      title: 'Nach wer oder was',
    },
    history: {
      capped: (n: number) =>
        `Die neuesten ${n} passenden Mails des Zeitraums gelesen.`,
      reading: (found: number | null, entries: number) =>
        found === null
          ? 'Durchsuche die Mails des Zeitraums…'
          : `Lese ${plural('de', found, { one: () => 'eine Mail', other: (n) => `${n} Mails` })} · bisher ${plural('de', entries, { one: () => 'ein Eintrag', other: (n) => `${n} Einträge` })}`,
    },
    menu: 'Board-Aktionen',
    moveDown: 'Nach unten',
    moveUp: 'Nach oben',
    name: 'Name',
    namePlaceholder: 'Reisen',
    new: 'Neues Board',
    newHint:
      'Beschreibe in eigenen Worten, was gesammelt werden soll. Fewmail findet es in deinen Mails so weit zurück, wie du wählst, wählt die Diagramme und hält alles aktuell.',
    period: 'Zeitraum',
    periods: {
      1: 'Letzter Tag',
      7: 'Letzte Woche',
      30: 'Letzter Monat',
      90: 'Letzte 3 Monate',
      180: 'Letzte 6 Monate',
      365: 'Letztes Jahr',
    },
    planning: 'Wird eingerichtet…',
    redescribe: 'Speichern und neu lesen',
    redescribeHint:
      'Liest den Zeitraum mit der neuen Beschreibung neu. Von dir bearbeitete oder entfernte Einträge bleiben.',
    rename: 'Board umbenennen',
    save: 'Speichern',
    settings: {
      bannerDays: 'Hinweis vor einem Termin',
      days: (n: number) =>
        plural('de', n, {
          one: () => '1 Tag vorher',
          other: (count) => `${count} Tage vorher`,
        }),
      hint: 'Wie weit das Board zurück sammelt und wann es dich vor einem Datum warnt.',
      never: 'Nie',
      title: 'Board-Einstellungen',
    },
    starter: {
      events: {
        description:
          'Tickets, Reservierungen und Termine: wo ich sein muss, wann und mit wem.',
        name: 'Termine',
      },
      health: {
        description:
          'Arzttermine, Rezepte, Befunde und Versicherungserstattungen: bei wem ich war, wann und was es gekostet hat.',
        name: 'Gesundheit',
      },
      home: {
        description:
          'Miete, Nebenkosten, Reparaturen und Verträge für meine Wohnung: was fällig ist, an wen und wie viel.',
        name: 'Zuhause',
      },
      invoices: {
        description:
          'Rechnungen, die ich für meine Arbeit schreibe und bekomme: Kunde oder Lieferant, Betrag, Fälligkeit und ob sie bezahlt ist.',
        name: 'Geschäftsrechnungen',
      },
      jobs: {
        description:
          'Bewerbungen, Vorstellungsgespräche und Angebote: welche Firma, welche Stelle und wo jede gerade steht.',
        name: 'Jobsuche',
      },
      learning: {
        description:
          'Kurse, Unterricht und Post von Schule oder Uni: Fristen, Noten, Zertifikate und was es kostet.',
        name: 'Lernen',
      },
      money: {
        description:
          'Zahlungen, Abos, Rechnungen und Erstattungen: wofür ich zahle, an wen und wie viel.',
        name: 'Geld',
      },
      orders: {
        description:
          'Online-Bestellungen und Lieferungen: was ich gekauft habe, bei wem und wo es gerade ist.',
        name: 'Bestellungen',
      },
      subscriptions: {
        description:
          'Dienste, für die ich regelmäßig zahle: was jeder kostet, wie oft und wann er sich verlängert.',
        name: 'Bezahlte Abos',
      },
      trips: {
        description:
          'Flüge, Züge, Hotels und Mietwagen: wohin ich reise, wann und was es kostet.',
        name: 'Reisen',
      },
    },
    summary: {
      lastMonth: 'Letzter Monat',
      perMonth: (amount: string) => `${amount} im Monat`,
      recurring: (n: number) =>
        plural('de', n, {
          one: () => 'Ein wiederkehrender',
          other: (count) => `${count} wiederkehrende`,
        }),
      thisMonth: 'Dieser Monat',
      upcoming: 'Fällig in 30 Tagen',
    },
  },
  bulk: {
    badge: (n: number) => `An ${n}+ Fewmail-Nutzer gesendet`,
    reason: (n: number) =>
      `Massenmail: ${n}+ Fewmail-Nutzer haben denselben Text bekommen`,
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
    run: (emails: string) => `${emails} aufräumen`,
    safe: 'Nichts wird gelöscht. Aufgeräumte E-Mails landen im Archiv mit dem Label Fewmail/Cleared und kommen mit einem Klick zurück; Newsletter werden zusätzlich abbestellt.',
    scanning:
      'Ich lese den ganzen Posteingang, nur die Kopfzeilen. Bis zu einer Minute.',
    title: 'Posteingang aufräumen',
    undo: 'Alles zurückholen',
    undone: (emails: string) => `${emails} wieder im Posteingang`,
  },
  wrapped: {
    busiest: (day: string, hour: string) =>
      `Am meisten los: ${day}, gegen ${hour}`,
    copied: 'Link kopiert',
    copyLink: 'Link kopieren',
    cta: 'Hol dir deins mit Fewmail',
    emails: 'E-Mails kamen an',
    empty:
      'Noch zu wenig Mail für eine Geschichte. Schau in ein paar Tagen wieder vorbei.',
    handled: 'von Fewmail selbst erledigt',
    people: 'Wer am meisten schrieb',
    period: { month: 'Dieser Monat', year: 'Dieses Jahr' },
    replies: 'Antworten von Fewmail entworfen und gesendet',
    saveImage: 'Bild speichern',
    saved: 'von Fewmail gespart',
    shareNote:
      'Link und Bild zeigen nur diese Zahlen, nie Namen oder Adressen.',
    shared: { month: 'Ein Monat in E-Mails', year: 'Ein Jahr in E-Mails' },
    spam: 'Spam-Mails gestoppt',
    split: (people: string, lists: string) =>
      `${people} von Menschen · ${lists} von Newslettern`,
    title: { month: 'Dein Monat in E-Mails', year: 'Dein Jahr in E-Mails' },
    unsubscribed: 'Newsletter verlassen',
  },
  forward: {
    done: 'Deine weitergeleitete E-Mail',
  },
  reading: {
    summary: 'Was deine Newsletter schreiben',
    worth: 'Lohnt sich ganz zu lesen',
    leftOut: (n: number) => `Ausgelassen: ${n}, nichts Neues darin.`,
    since: (n: number) =>
      `Nach der Zusammenfassung gekommen: ${n}, sie stehen in der nächsten.`,
    note: {
      inSummary: 'In der Zusammenfassung',
      leftOut: 'Ausgelassen',
      since: 'Nach der Zusammenfassung',
    },
    digest: (n: number) => `Newsletter heute: ${n}`,
    empty: 'Keine Newsletter am letzten Tag.',
    lead: 'Die Newsletter des letzten Tages an einem Ort, damit sie den Posteingang nicht füllen.',
    title: 'Lesen',
  },
  commitments: {
    title: 'Du hast versprochen',
  },
  people: {
    firstContact: (date: string) => `Ihr schreibt seit ${date}`,
    lastContact: (date: string) => `Letzte Mail am ${date}`,
    open: 'Wartet in anderen Threads',
    promised: 'Du hast versprochen',
    threads: (total: number) =>
      plural('de', total, {
        one: () => '1 Unterhaltung',
        other: (n) => `${n} Unterhaltungen`,
      }),
  },
  risk: {
    known_phishing: (domain: string) =>
      `${domain} steht auf einer öffentlichen Liste aktiver Phishing-Seiten. Keine Links öffnen, nicht anmelden, nichts bezahlen.`,
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
    ask: 'Frag deine Mails',
    hints: {
      agent:
        'Teil von Fewmail Pro: Frag nach deinen Mails oder sag, was zu tun ist – der Agent erledigt es und wartet auf dein Ja, bevor sich in Gmail etwas ändert.',
      ask: 'Teil von Fewmail Pro: Frag alles in eigenen Worten und bekomm die Antwort aus deinen eigenen Mails.',
      boards:
        'Teil von Fewmail Pro: Beschreibe, was gesammelt werden soll, und der Agent findet es in deinen Mails und hält es aktuell.',
      drafts:
        'Teil von Fewmail Pro: Der Agent schreibt die Antwort in deinem Stil, du bearbeitest und sendest sie.',
      home: 'Teil von Fewmail Pro: die Mails, die dich brauchen, mit fertigen Antwortentwürfen, aktualisiert, sobald Mail ankommt.',
    },
  },
  whatsapp: {
    connectFirst: (url: string) =>
      `Hi! Ich bin Fewmail. Hier in WhatsApp sage ich dir, wenn dringende Mail kommt, zeige, was dich braucht, und sende die Antworten, die du freigibst.\n\nDiese Nummer ist noch nicht mit deinem Fewmail verbunden. Das dauert eine Minute:\n1. Öffne die Fewmail-Einstellungen: ${url}\n2. Tippe unter Integrationen auf „WhatsApp verbinden“ (Teil von Fewmail Pro).\n3. WhatsApp öffnet sich mit einer fertigen Nachricht – sende sie, und fertig.`,
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
