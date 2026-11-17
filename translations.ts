// `en` defines the shape; `pl` and `de` are typed against it. Headlines are
// split into titleStart / titleAccent / titleEnd so the gradient word can sit
// anywhere in the sentence.

export const LANGUAGES = ["en", "pl", "de"] as const;
export type Language = (typeof LANGUAGES)[number];

const en = {
  meta: {
    languageName: "English",
    switcherLabel: "Language",
  },
  common: {
    backToTop: "Back to top",
  },
  quickAccess: {
    label: "Quick access",
    resumeTitle: "Resume & Interactive CLI",
    resumeSubtitle: "Access my PDF CV or explore via terminal.",
    businessTitle: "VictoriaCamp-IT",
    businessSubtitle: "My commercial campervan conversion business.",
    newTab: "opens in a new tab",
  },
  hero: {
    availability: "Available for B2B projects",
    subtitle: "Software Engineer & B2B Tech Partner",
    description:
      "Bridging the gap between robust software architecture and real-world business logic. Building scalable web applications, custom ERPs, and AI integrations.",
    ctaWork: "Explore My Work",
    ctaAbout: "About Me",
    ctaContact: "Let's Talk Business",
    badgeDatabase: "Database",
  },
  resume: {
    eyebrow: "// 02 — Resume & Experience",
    titleStart: "Engineering meets",
    titleAccent: "business",
    titleEnd: ".",
    cards: {
      about: "About Me",
      experience: "Experience",
      education: "Education & Certifications",
      stack: "Tech Stack & Tools",
      softSkills: "Soft Skills & Languages",
      hobbies: "After Hours",
    },
    about:
      "Full-stack Developer & Tech Entrepreneur. Specializing in delivering reliable web applications and B2B solutions. I take full responsibility for end-to-end project execution, combining network engineering, modern development, and business acumen.",
    job: {
      role: "Owner / Project Manager",
      period: "Own business",
      description:
        "Full business lifecycle management. Responsible for B2B client acquisition, marketing, quoting, and coordinating subcontractors. Extensive experience in logistics, budget planning, and solving real business problems, including foreign client relations.",
      tags: [
        "B2B Sales",
        "Marketing",
        "Quoting",
        "Subcontractors",
        "Logistics",
        "Budgeting",
        "International clients",
      ],
    },
    // Order matches the icons in ResumeSection.
    education: [
      {
        title: "Industrial Computer Networks",
        detail: "Computer Science · University of Zielona Góra",
        badge: "Currently",
      },
      {
        title: "IT Technician Diploma",
        detail: "Professional technician qualification in IT",
        badge: "Diploma",
      },
      {
        title: "State Exams: EE.08 & EE.09",
        detail:
          "EE.08 — Assembly and operation of computer systems and networks. EE.09 — Programming, web development, and databases.",
        badge: "Certified",
      },
      {
        title: "Cisco Certification",
        detail: "Proven knowledge in network infrastructure.",
        badge: "Cisco",
      },
    ],
    stack: {
      core: {
        title: "Core",
        items: ["React", "Next.js", "Python", "Databases"],
      },
      infrastructure: {
        title: "Infrastructure",
        items: [
          "Industrial computer networks",
          "Local network infrastructure",
          "Server administration",
        ],
      },
      workflow: {
        title: "Workflow",
        items: ["Git", "GitHub", "Jira"],
      },
    },
    languages: [
      { name: "Polish", level: "Native" },
      { name: "English", level: "Fluent" },
      { name: "German", level: "Business written" },
    ],
    teamworkLabel: "Teamwork",
    teamwork: [
      "Coordinating subcontractors",
      "Leading university group projects",
    ],
    hobbies: ["Strength training", "Playing guitar", "Football", "PC gaming"],
  },
  projects: {
    eyebrow: "// 03 — Projects & Showcase",
    titleStart: "Built to",
    titleAccent: "ship",
    titleEnd: ".",
    intro:
      "Beyond standard web development. A collection of interactive demos highlighting my versatility across network telemetry, backend logic, and AI modeling.",
    featured: "Featured",
    launch: "Launch App",
    comingSoon: "Live demo coming soon",
    items: {
      camper: {
        category: "Industrial IoT · Live demo",
        title: "Smart Camper IoT Telemetry",
        description:
          "Real-time industrial IoT dashboard monitoring campervan sensors and allowing remote equipment control.",
      },
      voice: {
        category: "AI Assistant · Voice",
        title: "AI Voice Terminal (Peter)",
        description:
          "Web-based interface for a custom Python AI assistant, featuring real-time speech processing and autonomous function calling.",
      },
      traineros: {
        category: "B2B SaaS · Phase 1",
        title: "TrainerOS",
        description:
          "Premium coaching platform for trainers and athletes. Phase 1: typed data architecture and a dual-role authorization portal.",
      },
      terminal: {
        category: "CLI · Interactive resume",
        title: "Interactive Profile (CLI)",
        description:
          "A command-line interface bringing my resume to life. Type commands to explore my tech stack, experience, and download the classic PDF.",
      },
    },
  },
  contact: {
    eyebrow: "// 04 — Contact & Project Starter",
    titleStart: "Let's build",
    titleAccent: "something solid",
    titleEnd: ".",
    intro: "Tell me what you need in three quick steps — or just grab my email.",
    remote: {
      badge: "Remote ready",
      location: "Poland · CET",
      titleStart: "Based in Poland.",
      titleAccent: "Working globally.",
      text: "Fully equipped for remote B2B collaboration across time zones — async by default, with clear updates, shared boards and calls when they matter. English and German business communication.",
      emailPrompt: "Prefer email?",
      copy: "Copy Email",
      copied: "Copied!",
    },
    form: {
      eyebrow: "Project starter",
      title: "Configure your project",
      progressLabel: "Progress",
      steps: ["Service", "Timeline", "Details"],
      serviceQuestion: "How can I help you?",
      timelineQuestion: "What's the timeline?",
      services: {
        web: { label: "Web Application", hint: "Next.js, dashboards, portals" },
        automation: {
          label: "B2B Automation / ERP",
          hint: "Workflows, custom ERP, integrations",
        },
        ai: { label: "AI Integration", hint: "LLMs, assistants, data pipelines" },
        other: { label: "Other", hint: "Networks, consulting, something new" },
      },
      timelines: {
        asap: { label: "ASAP", hint: "Kick off within days" },
        months: { label: "1-3 Months", hint: "Planned project window" },
        flexible: { label: "Flexible", hint: "No hard deadline" },
      },
      detailsTitle: "Final details",
      edit: "edit",
      change: "Change",
      name: "Name",
      email: "Email",
      details: "Project details",
      namePlaceholder: "Jane Doe",
      emailPlaceholder: "jane@company.com",
      detailsPlaceholder:
        "What are you building, who is it for, and what does success look like?",
      error:
        "Something went wrong sending your request. Please try again or email me directly.",
      send: "Send Request",
      sending: "Sending...",
      back: "Back",
      successTitle: (name: string) =>
        `Request received${name ? `, ${name}` : ""}!`,
      successBefore: "Thanks for the details on your ",
      successAfter:
        " project. I'll review it and get back to you within one business day.",
      restart: "Start another request",
    },
  },
};

export type Dictionary = typeof en;
export type ServiceId = keyof Dictionary["contact"]["form"]["services"];
export type TimelineId = keyof Dictionary["contact"]["form"]["timelines"];
export type ProjectId = keyof Dictionary["projects"]["items"];

const pl: Dictionary = {
  meta: {
    languageName: "Polski",
    switcherLabel: "Język",
  },
  common: {
    backToTop: "Na górę",
  },
  quickAccess: {
    label: "Szybki dostęp",
    resumeTitle: "CV i interaktywny terminal",
    resumeSubtitle: "Pobierz moje CV w PDF albo przeglądaj je w terminalu.",
    businessTitle: "VictoriaCamp-IT",
    businessSubtitle: "Moja firma zajmująca się zabudową kamperów.",
    newTab: "otwiera się w nowej karcie",
  },
  hero: {
    availability: "Dostępny dla projektów B2B",
    subtitle: "Inżynier oprogramowania i partner technologiczny B2B",
    description:
      "Łączę solidną architekturę oprogramowania z realną logiką biznesową. Tworzę skalowalne aplikacje webowe, dedykowane systemy ERP i integracje AI.",
    ctaWork: "Zobacz moje projekty",
    ctaAbout: "O mnie",
    ctaContact: "Porozmawiajmy o biznesie",
    badgeDatabase: "Bazy danych",
  },
  resume: {
    eyebrow: "// 02 — CV i doświadczenie",
    titleStart: "Inżynieria spotyka",
    titleAccent: "biznes",
    titleEnd: ".",
    cards: {
      about: "O mnie",
      experience: "Doświadczenie",
      education: "Wykształcenie i certyfikaty",
      stack: "Technologie i narzędzia",
      softSkills: "Umiejętności miękkie i języki",
      hobbies: "Po godzinach",
    },
    about:
      "Full-stack developer i przedsiębiorca technologiczny. Specjalizuję się w dostarczaniu niezawodnych aplikacji webowych i rozwiązań B2B. Biorę pełną odpowiedzialność za realizację projektów od początku do końca, łącząc inżynierię sieciową, nowoczesne programowanie i zmysł biznesowy.",
    job: {
      role: "Właściciel / Project Manager",
      period: "Własna firma",
      description:
        "Zarządzanie pełnym cyklem działalności firmy. Odpowiadam za pozyskiwanie klientów B2B, marketing, wyceny i koordynację podwykonawców. Bogate doświadczenie w logistyce, planowaniu budżetu i rozwiązywaniu realnych problemów biznesowych, w tym w relacjach z klientami zagranicznymi.",
      tags: [
        "Sprzedaż B2B",
        "Marketing",
        "Wyceny",
        "Podwykonawcy",
        "Logistyka",
        "Budżetowanie",
        "Klienci zagraniczni",
      ],
    },
    education: [
      {
        title: "Przemysłowe sieci komputerowe",
        detail: "Informatyka · Uniwersytet Zielonogórski",
        badge: "Obecnie",
      },
      {
        title: "Dyplom technika informatyka",
        detail: "Zawodowe kwalifikacje technika w dziedzinie IT",
        badge: "Dyplom",
      },
      {
        title: "Egzaminy zawodowe: EE.08 i EE.09",
        detail:
          "EE.08 — Montaż i eksploatacja systemów komputerowych, urządzeń peryferyjnych i sieci. EE.09 — Programowanie, tworzenie i administrowanie stronami internetowymi i bazami danych.",
        badge: "Zdane",
      },
      {
        title: "Certyfikat Cisco",
        detail: "Potwierdzona wiedza z zakresu infrastruktury sieciowej.",
        badge: "Cisco",
      },
    ],
    stack: {
      core: {
        title: "Główne",
        items: ["React", "Next.js", "Python", "Bazy danych"],
      },
      infrastructure: {
        title: "Infrastruktura",
        items: [
          "Przemysłowe sieci komputerowe",
          "Lokalna infrastruktura sieciowa",
          "Administracja serwerami",
        ],
      },
      workflow: {
        title: "Organizacja pracy",
        items: ["Git", "GitHub", "Jira"],
      },
    },
    languages: [
      { name: "Polski", level: "Ojczysty" },
      { name: "Angielski", level: "Biegły" },
      { name: "Niemiecki", level: "Biznesowy (pisemny)" },
    ],
    teamworkLabel: "Praca zespołowa",
    teamwork: [
      "Koordynacja podwykonawców",
      "Kierowanie grupowymi projektami na studiach",
    ],
    hobbies: ["Trening siłowy", "Gra na gitarze", "Piłka nożna", "Gry komputerowe"],
  },
  projects: {
    eyebrow: "// 03 — Projekty i realizacje",
    titleStart: "Zbudowane, by",
    titleAccent: "działać",
    titleEnd: ".",
    intro:
      "Więcej niż standardowe strony www. Kolekcja interaktywnych demonstracji podkreślających moją wszechstronność w telemetrii sieciowej, logice backendowej i modelowaniu AI.",
    featured: "Wyróżnione",
    launch: "Uruchom aplikację",
    comingSoon: "Demo na żywo już wkrótce",
    items: {
      camper: {
        category: "Przemysłowe IoT · Demo na żywo",
        title: "Smart Camper IoT Telemetry",
        description:
          "Przemysłowy dashboard IoT działający w czasie rzeczywistym, monitorujący czujniki kampera i umożliwiający zdalne sterowanie urządzeniami.",
      },
      voice: {
        category: "Asystent AI · Głos",
        title: "AI Voice Terminal (Peter)",
        description:
          "Webowy interfejs dla autorskiego asystenta AI w Pythonie, z przetwarzaniem mowy w czasie rzeczywistym i autonomicznym wywoływaniem funkcji.",
      },
      traineros: {
        category: "SaaS B2B · Etap 1",
        title: "TrainerOS",
        description:
          "Platforma coachingowa premium dla trenerów i podopiecznych. Etap 1: typowana architektura danych i portal logowania dla dwóch ról.",
      },
      terminal: {
        category: "CLI · Interaktywne CV",
        title: "Interactive Profile (CLI)",
        description:
          "Interfejs wiersza poleceń, który ożywia moje CV. Wpisuj komendy, aby poznać mój stack technologiczny i doświadczenie oraz pobrać klasyczne CV w PDF.",
      },
    },
  },
  contact: {
    eyebrow: "// 04 — Kontakt i start projektu",
    titleStart: "Zbudujmy",
    titleAccent: "coś solidnego",
    titleEnd: ".",
    intro:
      "Opisz, czego potrzebujesz, w trzech szybkich krokach — albo po prostu skopiuj mój e-mail.",
    remote: {
      badge: "Gotowy na pracę zdalną",
      location: "Polska · CET",
      titleStart: "Baza w Polsce.",
      titleAccent: "Praca na całym świecie.",
      text: "W pełni przygotowany do zdalnej współpracy B2B w różnych strefach czasowych — domyślnie asynchronicznie, z jasnymi aktualizacjami, wspólnymi tablicami i rozmowami wtedy, gdy są potrzebne. Komunikacja biznesowa po angielsku i niemiecku.",
      emailPrompt: "Wolisz e-mail?",
      copy: "Kopiuj e-mail",
      copied: "Skopiowano!",
    },
    form: {
      eyebrow: "Start projektu",
      title: "Skonfiguruj swój projekt",
      progressLabel: "Postęp",
      steps: ["Usługa", "Termin", "Szczegóły"],
      serviceQuestion: "W czym mogę pomóc?",
      timelineQuestion: "Jaki jest termin?",
      services: {
        web: { label: "Aplikacja webowa", hint: "Next.js, panele, portale" },
        automation: {
          label: "Automatyzacja B2B / ERP",
          hint: "Procesy, dedykowany ERP, integracje",
        },
        ai: { label: "Integracja AI", hint: "Modele LLM, asystenci, przetwarzanie danych" },
        other: { label: "Inne", hint: "Sieci, doradztwo, coś nowego" },
      },
      timelines: {
        asap: { label: "Jak najszybciej", hint: "Start w ciągu kilku dni" },
        months: { label: "1-3 miesiące", hint: "Zaplanowane okno projektu" },
        flexible: { label: "Elastycznie", hint: "Bez sztywnego terminu" },
      },
      detailsTitle: "Ostatnie szczegóły",
      edit: "zmień",
      change: "Zmień",
      name: "Imię i nazwisko",
      email: "E-mail",
      details: "Szczegóły projektu",
      namePlaceholder: "Jan Kowalski",
      emailPlaceholder: "jan@firma.pl",
      detailsPlaceholder: "Co budujesz, dla kogo i jak wygląda sukces?",
      error:
        "Coś poszło nie tak podczas wysyłania. Spróbuj ponownie lub napisz do mnie bezpośrednio.",
      send: "Wyślij zapytanie",
      sending: "Wysyłanie...",
      back: "Wstecz",
      successTitle: (name: string) =>
        `Zapytanie otrzymane${name ? `, ${name}` : ""}!`,
      successBefore: "Dziękuję za szczegóły projektu „",
      successAfter: "”. Przejrzę je i odezwę się w ciągu jednego dnia roboczego.",
      restart: "Wyślij kolejne zapytanie",
    },
  },
};

const de: Dictionary = {
  meta: {
    languageName: "Deutsch",
    switcherLabel: "Sprache",
  },
  common: {
    backToTop: "Nach oben",
  },
  quickAccess: {
    label: "Schnellzugriff",
    resumeTitle: "Lebenslauf & interaktive CLI",
    resumeSubtitle: "PDF-Lebenslauf abrufen oder im Terminal erkunden.",
    businessTitle: "VictoriaCamp-IT",
    businessSubtitle: "Mein Unternehmen für Campervan-Ausbauten.",
    newTab: "öffnet in einem neuen Tab",
  },
  hero: {
    availability: "Verfügbar für B2B-Projekte",
    subtitle: "Software Engineer & B2B-Technologiepartner",
    description:
      "Ich verbinde robuste Softwarearchitektur mit realer Geschäftslogik. Ich entwickle skalierbare Webanwendungen, individuelle ERP-Systeme und KI-Integrationen.",
    ctaWork: "Meine Arbeit ansehen",
    ctaAbout: "Über mich",
    ctaContact: "Geschäftlich sprechen",
    badgeDatabase: "Datenbanken",
  },
  resume: {
    eyebrow: "// 02 — Lebenslauf & Erfahrung",
    titleStart: "Technik trifft",
    titleAccent: "Business",
    titleEnd: ".",
    cards: {
      about: "Über mich",
      experience: "Berufserfahrung",
      education: "Ausbildung & Zertifikate",
      stack: "Tech-Stack & Tools",
      softSkills: "Soft Skills & Sprachen",
      hobbies: "Nach Feierabend",
    },
    about:
      "Full-Stack-Entwickler & Tech-Unternehmer. Spezialisiert auf zuverlässige Webanwendungen und B2B-Lösungen. Ich übernehme die volle Verantwortung für die Umsetzung von Projekten von Anfang bis Ende und verbinde Netzwerktechnik, moderne Softwareentwicklung und unternehmerisches Denken.",
    job: {
      role: "Inhaber / Projektmanager",
      period: "Eigenes Unternehmen",
      description:
        "Steuerung des gesamten Geschäftszyklus. Verantwortlich für B2B-Kundenakquise, Marketing, Angebotserstellung und die Koordination von Subunternehmern. Umfangreiche Erfahrung in Logistik, Budgetplanung und der Lösung realer Geschäftsprobleme, einschließlich der Betreuung ausländischer Kunden.",
      tags: [
        "B2B-Vertrieb",
        "Marketing",
        "Angebotserstellung",
        "Subunternehmer",
        "Logistik",
        "Budgetplanung",
        "Internationale Kunden",
      ],
    },
    education: [
      {
        title: "Industrielle Computernetzwerke",
        detail: "Informatik · Universität Zielona Góra",
        badge: "Aktuell",
      },
      {
        title: "Abschluss als IT-Techniker",
        detail: "Berufliche Technikerqualifikation in der IT",
        badge: "Diplom",
      },
      {
        title: "Staatliche Prüfungen: EE.08 & EE.09",
        detail:
          "EE.08 — Montage und Betrieb von Computersystemen und Netzwerken. EE.09 — Programmierung, Webentwicklung und Datenbanken.",
        badge: "Bestanden",
      },
      {
        title: "Cisco-Zertifizierung",
        detail: "Nachgewiesene Kenntnisse in Netzwerkinfrastruktur.",
        badge: "Cisco",
      },
    ],
    stack: {
      core: {
        title: "Kern",
        items: ["React", "Next.js", "Python", "Datenbanken"],
      },
      infrastructure: {
        title: "Infrastruktur",
        items: [
          "Industrielle Computernetzwerke",
          "Lokale Netzwerkinfrastruktur",
          "Serveradministration",
        ],
      },
      workflow: {
        title: "Workflow",
        items: ["Git", "GitHub", "Jira"],
      },
    },
    languages: [
      { name: "Polnisch", level: "Muttersprache" },
      { name: "Englisch", level: "Fließend" },
      { name: "Deutsch", level: "Geschäftlich (schriftlich)" },
    ],
    teamworkLabel: "Teamarbeit",
    teamwork: [
      "Koordination von Subunternehmern",
      "Leitung von Gruppenprojekten an der Universität",
    ],
    hobbies: ["Krafttraining", "Gitarre spielen", "Fußball", "PC-Gaming"],
  },
  projects: {
    eyebrow: "// 03 — Projekte & Showcase",
    titleStart: "Gebaut für den",
    titleAccent: "Einsatz",
    titleEnd: ".",
    intro:
      "Mehr als Standard-Webentwicklung. Eine Sammlung interaktiver Demos, die meine Vielseitigkeit in den Bereichen Netzwerktelemetrie, Backend-Logik und KI-Modellierung unterstreichen.",
    featured: "Highlight",
    launch: "App starten",
    comingSoon: "Live-Demo folgt in Kürze",
    items: {
      camper: {
        category: "Industrielles IoT · Live-Demo",
        title: "Smart Camper IoT Telemetry",
        description:
          "Industrielles Echtzeit-IoT-Dashboard, das die Sensoren eines Campervans überwacht und die Ausstattung aus der Ferne steuert.",
      },
      voice: {
        category: "KI-Assistent · Sprache",
        title: "AI Voice Terminal (Peter)",
        description:
          "Weboberfläche für einen individuellen Python-KI-Assistenten mit Sprachverarbeitung in Echtzeit und autonomem Function Calling.",
      },
      traineros: {
        category: "B2B-SaaS · Phase 1",
        title: "TrainerOS",
        description:
          "Premium-Coaching-Plattform für Trainer und Athleten. Phase 1: typisierte Datenarchitektur und ein Login-Portal für zwei Rollen.",
      },
      terminal: {
        category: "CLI · Interaktiver Lebenslauf",
        title: "Interactive Profile (CLI)",
        description:
          "Eine Kommandozeile, die meinen Lebenslauf zum Leben erweckt. Gib Befehle ein, um meinen Tech-Stack und meine Erfahrung zu erkunden und das klassische PDF herunterzuladen.",
      },
    },
  },
  contact: {
    eyebrow: "// 04 — Kontakt & Projektstart",
    titleStart: "Lassen Sie uns",
    titleAccent: "etwas Solides",
    titleEnd: " bauen.",
    intro:
      "Beschreiben Sie Ihr Vorhaben in drei kurzen Schritten — oder kopieren Sie einfach meine E-Mail-Adresse.",
    remote: {
      badge: "Remote-bereit",
      location: "Polen · MEZ",
      titleStart: "Standort Polen.",
      titleAccent: "Weltweit tätig.",
      text: "Voll ausgestattet für die Remote-Zusammenarbeit im B2B-Bereich über Zeitzonen hinweg — standardmäßig asynchron, mit klaren Updates, gemeinsamen Boards und Calls, wenn es darauf ankommt. Geschäftskommunikation auf Englisch und Deutsch.",
      emailPrompt: "Lieber per E-Mail?",
      copy: "E-Mail kopieren",
      copied: "Kopiert!",
    },
    form: {
      eyebrow: "Projektstart",
      title: "Projekt konfigurieren",
      progressLabel: "Fortschritt",
      steps: ["Leistung", "Zeitrahmen", "Details"],
      serviceQuestion: "Wie kann ich helfen?",
      timelineQuestion: "Wie ist der Zeitrahmen?",
      services: {
        web: { label: "Webanwendung", hint: "Next.js, Dashboards, Portale" },
        automation: {
          label: "B2B-Automatisierung / ERP",
          hint: "Workflows, individuelles ERP, Integrationen",
        },
        ai: { label: "KI-Integration", hint: "LLMs, Assistenten, Datenpipelines" },
        other: { label: "Sonstiges", hint: "Netzwerke, Beratung, etwas Neues" },
      },
      timelines: {
        asap: { label: "So bald wie möglich", hint: "Start innerhalb weniger Tage" },
        months: { label: "1-3 Monate", hint: "Geplantes Projektfenster" },
        flexible: { label: "Flexibel", hint: "Keine feste Deadline" },
      },
      detailsTitle: "Letzte Details",
      edit: "ändern",
      change: "Ändern",
      name: "Name",
      email: "E-Mail",
      details: "Projektdetails",
      namePlaceholder: "Max Mustermann",
      emailPlaceholder: "max@firma.de",
      detailsPlaceholder:
        "Was bauen Sie, für wen, und wie sieht Erfolg aus?",
      error:
        "Beim Senden ist etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie mir direkt.",
      send: "Anfrage senden",
      sending: "Wird gesendet...",
      back: "Zurück",
      successTitle: (name: string) =>
        `Anfrage erhalten${name ? `, ${name}` : ""}!`,
      successBefore: "Danke für die Details zu Ihrem Projekt „",
      successAfter: "“. Ich prüfe sie und melde mich innerhalb eines Werktags.",
      restart: "Neue Anfrage starten",
    },
  },
};

export const translations: Record<Language, Dictionary> = { en, pl, de };
