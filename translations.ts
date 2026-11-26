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
    resumeSubtitle: "Explore my CV via terminal.",
    businessTitle: "VictoriaCamp-IT",
    businessSubtitle: "My commercial campervan conversion business.",
    newTab: "opens in a new tab",
  },
  footer: {
    impressum: "Impressum / Legal",
    github: "GitHub",
    email: "Email",
  },
  impressum: {
    kicker: "// Impressum",
    title: "Legal notice",
    intro: "Information about the operator of this website.",
    company: "Company",
    owner: "Owner",
    legalForm: "Legal form",
    legalFormValue: "Sole proprietorship (Jednoosobowa Działalność Gospodarcza)",
    address: "Address",
    country: "Poland",
    nip: "NIP (VAT ID)",
    contact: "Contact",
    email: "Email",
    phone: "Phone",
    back: "Back to portfolio",
  },
  hero: {
    availability: "Available for B2B projects",
    subtitle: "Software Engineer & B2B Tech Partner",
    description:
      "I combine solid software architecture with real business logic. I build web apps, mobile apps, and much more!",
    ctaWork: "Explore My Work",
    ctaAbout: "About Me",
    ctaContact: "Let's Talk Business",
    badgeDatabase: "Database",
  },
  resume: {
    eyebrow: "// 04 — Resume & Experience",
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
      camperiada: {
        category: "2D configurator · Live demo",
        title: "Camperiada",
        description:
          "Campervan conversion configurator for the VW T5: place modules on layered 2D technical views and watch price, weight (against the vehicle's gross weight limit) and installation time recalculate instantly. No login needed; the demo UI is in Polish.",
        launch: "Live Demo",
      },
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
      viclift: {
        category: "B2B SaaS · Beta / In Testing",
        title: "VicLift",
        description:
          "Commercial B2B SaaS platform for personal trainers and athletes, on web and mobile (Next.js, React Native / Expo, Supabase). Live workout timers, readiness, fatigue and sleep telemetry, body metrics, workout packages and real-time coach notifications.",
      },
      terminal: {
        category: "CLI · Interactive resume",
        title: "Interactive Profile (CLI)",
        description:
          "A command-line interface bringing my resume to life. Type commands to explore my tech stack and experience.",
      },
    },
  },
  contact: {
    eyebrow: "// 02 — Contact & Project Starter",
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
        consultation: { label: "Consultation", hint: "Advice before you decide" },
        website: { label: "Website", hint: "Company sites, landing pages" },
        mobile: { label: "Mobile App", hint: "For iOS and Android" },
        meeting: { label: "Business Meeting", hint: "Let's talk cooperation" },
        other: { label: "Other", hint: "Something else" },
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
      successBefore: "Thanks for your request about “",
      successAfter:
        "”. I'll review it and get back to you within one business day.",
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
    resumeSubtitle: "Przeglądaj moje CV w terminalu.",
    businessTitle: "VictoriaCamp-IT",
    businessSubtitle: "Moja firma zajmująca się zabudową kamperów.",
    newTab: "otwiera się w nowej karcie",
  },
  footer: {
    impressum: "Impressum / Dane firmy",
    github: "GitHub",
    email: "E-mail",
  },
  impressum: {
    kicker: "// Impressum",
    title: "Dane firmy",
    intro: "Informacje o właścicielu tej strony.",
    company: "Firma",
    owner: "Właściciel",
    legalForm: "Forma prawna",
    legalFormValue: "Jednoosobowa działalność gospodarcza",
    address: "Adres",
    country: "Polska",
    nip: "NIP",
    contact: "Kontakt",
    email: "E-mail",
    phone: "Telefon",
    back: "Powrót do portfolio",
  },
  hero: {
    availability: "Dostępny dla projektów B2B",
    subtitle: "Inżynier oprogramowania i partner technologiczny B2B",
    description:
      "Łączę solidną architekturę oprogramowania z realną logiką biznesową. Tworzę aplikacje webowe, mobilne i o wiele więcej!",
    ctaWork: "Zobacz moje projekty",
    ctaAbout: "O mnie",
    ctaContact: "Porozmawiajmy o biznesie",
    badgeDatabase: "Bazy danych",
  },
  resume: {
    eyebrow: "// 04 — CV i doświadczenie",
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
      camperiada: {
        category: "Konfigurator 2D · Demo na żywo",
        title: "Camperiada",
        description:
          "Konfigurator zabudowy kampera VW T5: dobieraj moduły na warstwowych rzutach 2D, a cena, masa (względem DMC) i czas montażu przeliczają się na bieżąco. Bez logowania.",
        launch: "Uruchom Demo",
      },
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
      viclift: {
        category: "SaaS B2B · Beta / w testach",
        title: "VicLift",
        description:
          "Komercyjna platforma SaaS B2B dla trenerów personalnych i ich podopiecznych, na web i mobile (Next.js, React Native / Expo, Supabase). Timery treningowe na żywo, telemetria gotowości, zmęczenia i snu, pomiary ciała, pakiety treningowe oraz powiadomienia dla trenera w czasie rzeczywistym.",
      },
      terminal: {
        category: "CLI · Interaktywne CV",
        title: "Interactive Profile (CLI)",
        description:
          "Interfejs wiersza poleceń, który ożywia moje CV. Wpisuj komendy, aby poznać mój stack technologiczny i doświadczenie.",
      },
    },
  },
  contact: {
    eyebrow: "// 02 — Kontakt i start projektu",
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
        consultation: { label: "Konsultacja", hint: "Porada, zanim zdecydujesz" },
        website: { label: "Strona internetowa", hint: "Strony firmowe, landing page" },
        mobile: { label: "Aplikacja mobilna", hint: "Na iOS i Androida" },
        meeting: { label: "Spotkanie biznesowe", hint: "Porozmawiajmy o współpracy" },
        other: { label: "Inne", hint: "Coś innego" },
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
      successBefore: "Dziękuję za zapytanie w temacie „",
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
    resumeSubtitle: "Meinen Lebenslauf im Terminal erkunden.",
    businessTitle: "VictoriaCamp-IT",
    businessSubtitle: "Mein Unternehmen für Campervan-Ausbauten.",
    newTab: "öffnet in einem neuen Tab",
  },
  footer: {
    impressum: "Impressum",
    github: "GitHub",
    email: "E-Mail",
  },
  impressum: {
    kicker: "// Angaben gemäß § 5 DDG",
    title: "Impressum",
    intro: "Angaben zum Betreiber dieser Website.",
    company: "Unternehmen",
    owner: "Inhaber",
    legalForm: "Rechtsform",
    legalFormValue: "Einzelunternehmen (Jednoosobowa Działalność Gospodarcza)",
    address: "Anschrift",
    country: "Polen",
    nip: "NIP (Steuernummer)",
    contact: "Kontakt",
    email: "E-Mail",
    phone: "Telefon",
    back: "Zurück zum Portfolio",
  },
  hero: {
    availability: "Verfügbar für B2B-Projekte",
    subtitle: "Software Engineer & B2B-Technologiepartner",
    description:
      "Ich verbinde solide Softwarearchitektur mit realer Geschäftslogik. Ich entwickle Web-Apps, mobile Apps und vieles mehr!",
    ctaWork: "Meine Arbeit ansehen",
    ctaAbout: "Über mich",
    ctaContact: "Geschäftlich sprechen",
    badgeDatabase: "Datenbanken",
  },
  resume: {
    eyebrow: "// 04 — Lebenslauf & Erfahrung",
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
      camperiada: {
        category: "2D-Konfigurator · Live-Demo",
        title: "Camperiada",
        description:
          "Ausbau-Konfigurator für den VW-T5-Campervan: Module auf mehrschichtigen 2D-Ansichten platzieren, während Preis, Gewicht (mit zulässigem Gesamtgewicht) und Montagezeit sofort neu berechnet werden. Ohne Login; die Demo-Oberfläche ist auf Polnisch.",
        launch: "Demo starten",
      },
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
      viclift: {
        category: "B2B-SaaS · Beta / im Test",
        title: "VicLift",
        description:
          "Kommerzielle B2B-SaaS-Plattform für Personal Trainer und Athleten, für Web und Mobile (Next.js, React Native / Expo, Supabase). Live-Workout-Timer, Telemetrie zu Bereitschaft, Ermüdung und Schlaf, Körpermesswerte, Trainingspakete und Echtzeit-Benachrichtigungen für Coaches.",
      },
      terminal: {
        category: "CLI · Interaktiver Lebenslauf",
        title: "Interactive Profile (CLI)",
        description:
          "Eine Kommandozeile, die meinen Lebenslauf zum Leben erweckt. Gib Befehle ein, um meinen Tech-Stack und meine Erfahrung zu erkunden.",
      },
    },
  },
  contact: {
    eyebrow: "// 02 — Kontakt & Projektstart",
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
        consultation: { label: "Beratung", hint: "Rat vor der Entscheidung" },
        website: { label: "Website", hint: "Firmenseiten, Landingpages" },
        mobile: { label: "Mobile App", hint: "Für iOS und Android" },
        meeting: { label: "Geschäftstermin", hint: "Über Zusammenarbeit sprechen" },
        other: { label: "Sonstiges", hint: "Etwas anderes" },
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
      successBefore: "Danke für Ihre Anfrage zum Thema „",
      successAfter: "“. Ich prüfe sie und melde mich innerhalb eines Werktags.",
      restart: "Neue Anfrage starten",
    },
  },
};

export const translations: Record<Language, Dictionary> = { en, pl, de };
