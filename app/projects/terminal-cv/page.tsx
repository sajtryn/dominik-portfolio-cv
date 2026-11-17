"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";

/* ================================ Config ================================= */

const PROMPT_USER = "dominik@portfolio";
const PROMPT = `${PROMPT_USER}:~$`;
const CV_PATH = "/cv.pdf";
const CV_FILENAME = "Dominik-Rodziewicz-CV.pdf";

const BOOT_LINES = [
  "Booting DominikOS v1.0...",
  "Loading kernel...",
  "Mounting file system...",
  "System ready. Type 'help' to start.",
];
const BOOT_STEP_MS = 280;

/* ================================ Types ================================== */

type Lang = "en" | "pl" | "de";
const LANGS: Lang[] = ["en", "pl", "de"];
const isLang = (s: string): s is Lang => (LANGS as string[]).includes(s);

interface HistoryEntry {
  id: number;
  command: string;
  output: ReactNode;
}

type CommandName = "help" | "whoami" | "skills" | "lang" | "clear" | "download_cv";
const COMMAND_NAMES: CommandName[] = ["help", "whoami", "skills", "lang", "clear", "download_cv"];
const isCommand = (s: string): s is CommandName => (COMMAND_NAMES as string[]).includes(s);

/* ============================== Translations ============================= */
// Everything the terminal prints, per language. Boot lines stay English —
// that's the "firmware".

type Strings = {
  languageName: string;
  descriptions: Record<CommandName, string>;
  available: string;
  tip: string;
  whoami: {
    bio: [string, string];
    fields: { label: string; value: string }[];
  };
  skills: {
    groups: { dir: string; items: string[] }[];
    summary: (skills: number, dirs: number) => string;
  };
  langChanged: string;
  usage: string;
  current: string;
  unsupported: (v: string) => string;
  notFound: string;
  typeHelp: [string, string];
  downloading: string;
  downloadFallback: string;
};

const T: Record<Lang, Strings> = {
  en: {
    languageName: "English",
    descriptions: {
      help: "list available commands",
      whoami: "who is behind this terminal",
      skills: "tech stack, structured",
      lang: "switch language: lang <en|pl|de>",
      clear: "clear the screen",
      download_cv: "download the classic PDF resume",
    },
    available: "Available commands:",
    tip: "Tip: ↑/↓ recall previous commands · Tab completes · Ctrl+L clears.",
    whoami: {
      bio: [
        "Computer Science student at Uniwersytet Zielonogórski.",
        "Owner of VictoriaCamp-IT. Bridging physical hardware with web architecture.",
      ],
      fields: [
        { label: "role", value: "Full-stack developer & B2B tech partner" },
        { label: "location", value: "Poland · remote-ready" },
        { label: "languages", value: "Polish (native) · English (fluent) · German (business written)" },
        {
          label: "hobbies",
          value:
            "Heavy strength training, competitive PC gaming (CS2), classical guitar (Music school graduate), and watching football.",
        },
      ],
    },
    skills: {
      groups: [
        { dir: "frontend", items: ["Next.js", "TypeScript", "React", "Tailwind CSS"] },
        { dir: "backend", items: ["Python", "Docker"] },
        { dir: "network", items: ["Cisco", "Industrial networks", "Server administration"] },
        { dir: "ai", items: ["Fuzzy Logic", "OpenAI function calling"] },
        { dir: "workflow", items: ["Git", "GitHub", "Jira"] },
      ],
      summary: (s, d) => `${s} skills in ${d} directories`,
    },
    langChanged: "System language changed to English.",
    usage: "Usage: lang <en|pl|de>",
    current: "current",
    unsupported: (v) => `Unsupported language: ${v}`,
    notFound: "command not found:",
    typeHelp: ["type", "to see what's available."],
    downloading: "Downloading cv.pdf...",
    downloadFallback: "click here if it didn't start",
  },
  pl: {
    languageName: "polski",
    descriptions: {
      help: "lista dostępnych komend",
      whoami: "kto stoi za tym terminalem",
      skills: "stack technologiczny w strukturze",
      lang: "zmiana języka: lang <en|pl|de>",
      clear: "wyczyść ekran",
      download_cv: "pobierz klasyczne CV w PDF",
    },
    available: "Dostępne komendy:",
    tip: "Wskazówka: ↑/↓ przywraca poprzednie komendy · Tab uzupełnia · Ctrl+L czyści.",
    whoami: {
      bio: [
        "Student informatyki na Uniwersytecie Zielonogórskim.",
        "Właściciel VictoriaCamp-IT. Łączę fizyczny sprzęt z architekturą webową.",
      ],
      fields: [
        { label: "rola", value: "Full-stack developer i partner technologiczny B2B" },
        { label: "miejsce", value: "Polska · gotowy do pracy zdalnej" },
        { label: "języki", value: "polski (ojczysty) · angielski (biegły) · niemiecki (biznesowy, pisemny)" },
        {
          label: "hobby",
          value:
            "Ciężki trening siłowy, rywalizacyjne granie na PC (CS2), gitara klasyczna (absolwent szkoły muzycznej) i oglądanie piłki nożnej.",
        },
      ],
    },
    skills: {
      groups: [
        { dir: "frontend", items: ["Next.js", "TypeScript", "React", "Tailwind CSS"] },
        { dir: "backend", items: ["Python", "Docker"] },
        { dir: "sieci", items: ["Cisco", "Sieci przemysłowe", "Administracja serwerami"] },
        { dir: "ai", items: ["Logika rozmyta (Fuzzy Logic)", "OpenAI function calling"] },
        { dir: "warsztat", items: ["Git", "GitHub", "Jira"] },
      ],
      summary: (s, d) => `${s} umiejętności w ${d} katalogach`,
    },
    langChanged: "Język systemu zmieniony na polski.",
    usage: "Użycie: lang <en|pl|de>",
    current: "obecnie",
    unsupported: (v) => `Nieobsługiwany język: ${v}`,
    notFound: "nie znaleziono komendy:",
    typeHelp: ["wpisz", "aby zobaczyć dostępne komendy."],
    downloading: "Pobieranie cv.pdf...",
    downloadFallback: "kliknij tutaj, jeśli pobieranie się nie rozpoczęło",
  },
  de: {
    languageName: "Deutsch",
    descriptions: {
      help: "verfügbare Befehle anzeigen",
      whoami: "wer hinter diesem Terminal steckt",
      skills: "Tech-Stack, strukturiert",
      lang: "Sprache wechseln: lang <en|pl|de>",
      clear: "Bildschirm leeren",
      download_cv: "klassischen Lebenslauf als PDF herunterladen",
    },
    available: "Verfügbare Befehle:",
    tip: "Tipp: ↑/↓ ruft frühere Befehle auf · Tab vervollständigt · Strg+L leert.",
    whoami: {
      bio: [
        "Informatikstudent an der Universität Zielona Góra.",
        "Inhaber von VictoriaCamp-IT. Ich verbinde physische Hardware mit Web-Architektur.",
      ],
      fields: [
        { label: "Rolle", value: "Full-Stack-Entwickler & B2B-Technologiepartner" },
        { label: "Standort", value: "Polen · remote-bereit" },
        { label: "Sprachen", value: "Polnisch (Muttersprache) · Englisch (fließend) · Deutsch (geschäftlich, schriftlich)" },
        {
          label: "Hobbys",
          value:
            "Intensives Krafttraining, kompetitives PC-Gaming (CS2), klassische Gitarre (Absolvent einer Musikschule) und Fußball schauen.",
        },
      ],
    },
    skills: {
      groups: [
        { dir: "frontend", items: ["Next.js", "TypeScript", "React", "Tailwind CSS"] },
        { dir: "backend", items: ["Python", "Docker"] },
        { dir: "netzwerk", items: ["Cisco", "Industrielle Netzwerke", "Serveradministration"] },
        { dir: "ki", items: ["Fuzzy-Logik", "OpenAI Function Calling"] },
        { dir: "workflow", items: ["Git", "GitHub", "Jira"] },
      ],
      summary: (s, d) => `${s} Skills in ${d} Verzeichnissen`,
    },
    langChanged: "Systemsprache auf Deutsch umgestellt.",
    usage: "Verwendung: lang <en|pl|de>",
    current: "aktuell",
    unsupported: (v) => `Nicht unterstützte Sprache: ${v}`,
    notFound: "Befehl nicht gefunden:",
    typeHelp: ["gib", "ein, um die verfügbaren Befehle zu sehen."],
    downloading: "cv.pdf wird heruntergeladen...",
    downloadFallback: "hier klicken, falls der Download nicht startet",
  },
};

/** Dot leaders that line labels up: "role ........", "hobbies .....". */
const LEADER_WIDTH = 13;
const leader = (label: string) => `${label} `.padEnd(LEADER_WIDTH, ".");

/* ============================ Output blocks ============================== */

const Dim = ({ children }: { children: ReactNode }) => (
  <span className="text-green-800">{children}</span>
);
const Hi = ({ children }: { children: ReactNode }) => (
  <span className="text-lime-300">{children}</span>
);

function HelpOutput({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <div className="space-y-1">
      <p>{t.available}</p>
      <ul className="mt-1 space-y-0.5">
        {COMMAND_NAMES.map((name) => (
          <li key={name} className="grid grid-cols-[9rem_1fr] gap-2 sm:grid-cols-[11rem_1fr]">
            <Hi>{name}</Hi>
            <span className="text-green-500/80">{t.descriptions[name]}</span>
          </li>
        ))}
      </ul>
      <p className="pt-1">
        <Dim>{t.tip}</Dim>
      </p>
    </div>
  );
}

function WhoamiOutput({ lang }: { lang: Lang }) {
  const { bio, fields } = T[lang].whoami;
  return (
    <div className="space-y-2">
      <pre className="whitespace-pre text-[11px] leading-tight text-lime-300 sm:text-xs" aria-hidden>
{`  ____                  _       _ _
 |  _ \\  ___  _ __ ___ (_)_ __ (_) | __
 | | | |/ _ \\| '_ \` _ \\| | '_ \\| | |/ /
 | |_| | (_) | | | | | | | | | | |   <
 |____/ \\___/|_| |_| |_|_|_| |_|_|_|\\_\\`}
      </pre>
      <p>
        <Hi>Dominik Rodziewicz.</Hi> {bio[0]}
      </p>
      <p>{bio[1]}</p>
      {/* Hanging indent: wrapped values line up under the first value column */}
      <dl className="space-y-0.5">
        {fields.map((f) => (
          <div key={f.label} className="grid grid-cols-[13ch_1fr] gap-x-[1ch]">
            <dt className="text-green-800">{leader(f.label)}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SkillsOutput({ lang }: { lang: Lang }) {
  const { groups, summary } = T[lang].skills;
  return (
    <div>
      <p>
        <Hi>~/skills</Hi>
      </p>
      <ul>
        {groups.map(({ dir, items }, i) => (
          <li key={dir} className="flex gap-2">
            <Dim>{i === groups.length - 1 ? "└──" : "├──"}</Dim>
            <span className="w-20 shrink-0 text-lime-300 sm:w-24">{dir}/</span>
            <span className="text-green-500/90">{items.join(" · ")}</span>
          </li>
        ))}
      </ul>
      <p className="pt-1">
        <Dim>{summary(groups.reduce((n, g) => n + g.items.length, 0), groups.length)}</Dim>
      </p>
    </div>
  );
}

function DownloadOutput({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <div>
      <p>{t.downloading}</p>
      <p>
        <Dim>[████████████████████] 100% · </Dim>
        <a
          href={CV_PATH}
          download={CV_FILENAME}
          className="text-lime-300 underline underline-offset-2 hover:text-lime-200"
        >
          {t.downloadFallback}
        </a>
      </p>
    </div>
  );
}

function LangUsage({ lang, error }: { lang: Lang; error?: string }) {
  const t = T[lang];
  return (
    <div>
      {error && <p className="text-red-400">{error}</p>}
      <p>{t.usage}</p>
      <p>
        <Dim>
          {t.current}: {lang} ({t.languageName})
        </Dim>
      </p>
    </div>
  );
}

/** Starts a file download with a temporary `<a download>` element. */
function triggerDownload() {
  const a = document.createElement("a");
  a.href = CV_PATH;
  a.download = CV_FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ================================= Page ================================== */

export default function TerminalCvPage() {
  const [bootLines, setBootLines] = useState(0);
  const booted = bootLines >= BOOT_LINES.length;
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  // Commands typed so far, newest last — for ↑/↓ recall.
  const [recall, setRecall] = useState<string[]>([]);
  const [recallIndex, setRecallIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  // Mirrors `lang` so `execute` always sees the latest value, even when two
  // commands run back to back before a re-render.
  const langRef = useRef<Lang>("en");

  // Rapid boot sequence, one line at a time.
  useEffect(() => {
    const ids = BOOT_LINES.map((_, i) =>
      setTimeout(() => setBootLines(i + 1), BOOT_STEP_MS * (i + 1)),
    );
    return () => ids.forEach(clearTimeout);
  }, []);

  // Focus the prompt as soon as it appears.
  useEffect(() => {
    if (booted) inputRef.current?.focus({ preventScroll: true });
  }, [booted]);

  // Keep the newest output in view: jump to the page's absolute bottom.
  // "instant" on purpose — "auto" would inherit the site-wide CSS smooth
  // scrolling, and a terminal should snap. The page's bottom padding keeps
  // the prompt clear of the fixed chip bar.
  useEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
  }, [history, bootLines]);

  /** Runs a command exactly as if it had been typed and Enter pressed. */
  const execute = useCallback((raw: string) => {
    const command = raw.trim();
    setInput("");
    setRecallIndex(null);
    if (command) setRecall((r) => [...r, command]);

    const [first = "", ...args] = command.split(/\s+/);
    const name = first.toLowerCase();
    const current = langRef.current;

    if (name === "clear") {
      setHistory([]);
      return;
    }

    let output: ReactNode = null;
    if (!command) {
      output = null; // empty Enter just prints a new prompt line
    } else if (!isCommand(name)) {
      const t = T[current];
      output = (
        <p>
          <span className="text-red-400">{t.notFound}</span> {command}
          <span className="text-green-800">
            {" "}— {t.typeHelp[0]}{" "}
          </span>
          <Hi>help</Hi>
          <span className="text-green-800"> {t.typeHelp[1]}</span>
        </p>
      );
    } else if (name === "lang") {
      const value = args[0]?.toLowerCase();
      if (!value) {
        output = <LangUsage lang={current} />;
      } else if (!isLang(value)) {
        output = <LangUsage lang={current} error={T[current].unsupported(args[0])} />;
      } else {
        langRef.current = value;
        setLang(value);
        // Confirm in the newly selected language.
        output = <p className="text-lime-300">{T[value].langChanged}</p>;
      }
    } else if (name === "help") {
      output = <HelpOutput lang={current} />;
    } else if (name === "whoami") {
      output = <WhoamiOutput lang={current} />;
    } else if (name === "skills") {
      output = <SkillsOutput lang={current} />;
    } else if (name === "download_cv") {
      triggerDownload();
      output = <DownloadOutput lang={current} />;
    }

    nextId.current += 1;
    setHistory((h) => [...h, { id: nextId.current, command, output }]);
  }, []);

  /** The [ lang ] chip cycles en → pl → de → en. */
  const cycleLang = () => {
    const next = LANGS[(LANGS.indexOf(langRef.current) + 1) % LANGS.length];
    execute(`lang ${next}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      execute(input);
    } else if (e.key === "ArrowUp") {
      if (!recall.length) return;
      e.preventDefault();
      const i = recallIndex === null ? recall.length - 1 : Math.max(0, recallIndex - 1);
      setRecallIndex(i);
      setInput(recall[i]);
    } else if (e.key === "ArrowDown") {
      if (recallIndex === null) return;
      e.preventDefault();
      const i = recallIndex + 1;
      if (i >= recall.length) {
        setRecallIndex(null);
        setInput("");
      } else {
        setRecallIndex(i);
        setInput(recall[i]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const typed = input.trim().toLowerCase();
      if (typed.startsWith("lang ")) {
        const partial = typed.slice(5);
        const match = LANGS.filter((l) => l.startsWith(partial));
        if (match.length === 1) setInput(`lang ${match[0]}`);
        return;
      }
      const matches = COMMAND_NAMES.filter((c) => c.startsWith(typed));
      if (matches.length === 1) setInput(matches[0] === "lang" ? "lang " : matches[0]);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  // Clicking anywhere on the terminal focuses the prompt — unless the user
  // is selecting text to copy.
  const focusPrompt = () => {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  /** Chip click: [ lang ] cycles languages, the rest run their command. */
  const runChip = (name: CommandName) => {
    if (name === "lang") cycleLang();
    else execute(name);
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <main
      onClick={focusPrompt}
      lang={lang}
      className="min-h-screen flex-1 cursor-text bg-black px-4 pb-32 pt-4 font-mono text-[13px] leading-relaxed text-green-500 selection:bg-green-500/30 selection:text-lime-200 sm:px-8 sm:pt-6 sm:text-sm"
    >
      {/* Minimal nav: reads like a shell path, so the illusion holds */}
      <nav className="mb-6 flex items-center justify-between gap-4 text-xs">
        <Link
          href="/"
          onClick={(e) => e.stopPropagation()}
          className="text-green-700 transition-colors hover:text-lime-300 focus-visible:text-lime-300 focus-visible:outline-none"
        >
          &lt;- Back to Portfolio
        </Link>
        <span className="text-green-900">
          LANG={lang === "en" ? "en_US" : lang === "pl" ? "pl_PL" : "de_DE"}.UTF-8
        </span>
      </nav>

      <div className="mx-auto max-w-4xl">
        {/* Boot sequence */}
        <div aria-live="polite">
          {BOOT_LINES.slice(0, bootLines).map((line, i) => (
            <p key={line} className={i === BOOT_LINES.length - 1 ? "text-lime-300" : undefined}>
              {i < BOOT_LINES.length - 1 && <span className="text-green-800">[ OK ] </span>}
              {line}
            </p>
          ))}
          {!booted && <span className="inline-block h-4 w-2 animate-pulse bg-green-500 align-middle" />}
        </div>

        {booted && (
          <>
            {/* History */}
            <div className="mt-4 space-y-3" role="log" aria-live="polite" aria-label="Terminal output">
              {history.map((entry) => (
                <div key={entry.id}>
                  <p className="break-all">
                    <span className="text-lime-400">{PROMPT_USER}</span>
                    <span className="text-green-700">:~$</span>{" "}
                    <span className="text-green-300">{entry.command}</span>
                  </p>
                  {entry.output && <div className="mt-1 text-green-500">{entry.output}</div>}
                </div>
              ))}
            </div>

            {/* Active prompt */}
            <label className="mt-3 flex items-center gap-2">
              <span className="shrink-0">
                <span className="text-lime-400">{PROMPT_USER}</span>
                <span className="text-green-700">:~$</span>
              </span>
              <span className="sr-only">Terminal command</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setRecallIndex(null);
                }}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                aria-label={`Command input, ${PROMPT}`}
                className="min-w-0 flex-1 bg-transparent text-base text-green-300 caret-lime-400 outline-none sm:text-sm"
              />
            </label>
          </>
        )}
      </div>

      {/* HR helper chips: one click runs a command, no typing needed */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-x-0 bottom-0 z-10 border-t border-green-500/15 bg-black/70 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-4xl items-center gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden">
          <span className="shrink-0 text-[11px] text-green-800">quick:</span>
          {COMMAND_NAMES.map((label) => (
            <button
              key={label}
              type="button"
              disabled={!booted}
              onClick={() => runChip(label)}
              title={label === "lang" ? `lang → ${LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]}` : undefined}
              className="shrink-0 rounded-md border border-green-500/25 bg-green-500/[0.04] px-2.5 py-1 text-xs text-green-400 transition-colors hover:border-lime-400/60 hover:bg-lime-400/10 hover:text-lime-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lime-400 disabled:opacity-40"
            >
              [ {label}
              {label === "lang" && <span className="text-green-700">:{lang}</span>} ]
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
