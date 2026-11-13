"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Activity,
  ArrowLeft,
  AudioLines,
  Binary,
  Brain,
  ChevronRight,
  CircleCheck,
  Code,
  Cpu,
  History,
  LoaderCircle,
  Mic,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ================================ Scenarios ============================== */
// Each loop plays one of these. They're the only "data" on the page — swap
// in real transcripts / tool calls from Peter's Python backend later.

type Scenario = {
  transcript: string;
  stt: { engine: string; confidence: number };
  decision: {
    intent: string;
    confidence: number;
    action: "call_function";
    function: string;
    args: Record<string, string | number>;
  };
  result: Record<string, string | number | boolean>;
  reply: string;
  latencyMs: number;
};

const SCENARIOS: Scenario[] = [
  {
    transcript: "Check the camper van battery levels.",
    stt: { engine: "whisper-large-v3", confidence: 0.97 },
    decision: {
      intent: "CHECK_TELEMETRY",
      confidence: 0.98,
      action: "call_function",
      function: "get_battery_status",
      args: { vehicle: "V-123" },
    },
    result: { voltage: 13.21, soc_pct: 87, status: "charging" },
    reply:
      "Battery is at 87% and charging — 13.2 volts, with solar covering the current load.",
    latencyMs: 412,
  },
  {
    transcript: "Turn on the heater, it's getting cold in the van.",
    stt: { engine: "whisper-large-v3", confidence: 0.95 },
    decision: {
      intent: "DEVICE_CONTROL",
      confidence: 0.96,
      action: "call_function",
      function: "set_device_state",
      args: { vehicle: "V-123", device: "autoterm_heater", state: "on", setpoint_c: 21.5 },
    },
    result: { ack: true, rtt_ms: 289, heater: "running" },
    reply: "Heater is on and targeting 21.5°C. I'll tell you when the cabin is warm.",
    latencyMs: 538,
  },
  {
    transcript: "Prepare a quote for the Hoffmann GmbH van conversion.",
    stt: { engine: "whisper-large-v3", confidence: 0.94 },
    decision: {
      intent: "GENERATE_DOCUMENT",
      confidence: 0.93,
      action: "call_function",
      function: "create_pdf_quote",
      args: { client: "Hoffmann GmbH", template: "b2b_conversion_de", currency: "EUR" },
    },
    result: { file: "Q-2026-114.pdf", total_eur: 18450, pages: 3 },
    reply:
      "Quote Q-2026-114 is ready: €18,450 across 3 pages. Shall I email it to Hoffmann?",
    latencyMs: 1260,
  },
  {
    transcript: "What's the MQTT latency on gateway seven?",
    stt: { engine: "whisper-large-v3", confidence: 0.96 },
    decision: {
      intent: "CHECK_NETWORK",
      confidence: 0.97,
      action: "call_function",
      function: "get_network_metrics",
      args: { gateway: "vc-07", window: "5m" },
    },
    result: { latency_p50_ms: 24, latency_p95_ms: 41, packet_loss: 0 },
    reply: "Gateway seven is healthy: 24 ms median, 41 ms at p95, and no packet loss.",
    latencyMs: 367,
  },
];

/* ================================ Timeline =============================== */
// One 12s loop. Everything on screen is derived from the elapsed time `t`.

const CYCLE_MS = 12000;
const TICK_MS = 50;
const LISTEN_TYPE_START = 400;
const LISTEN_END = 2800;
const THINK_END = 5200;
const JSON_START = 5400;
const JSON_LINE_MS = 170;
const RESULT_AT = 8300;
const SPEAK_START = 8700;
const SPEAK_END = 11000;

type Phase = "idle" | "listening" | "thinking" | "calling" | "speaking";

const phaseAt = (t: number, running: boolean): Phase => {
  if (!running) return "idle";
  if (t < LISTEN_END) return "listening";
  if (t < THINK_END) return "thinking";
  if (t < SPEAK_START) return "calling";
  if (t < SPEAK_END) return "speaking";
  return "idle";
};

const progress = (t: number, start: number, end: number) =>
  Math.min(1, Math.max(0, (t - start) / (end - start)));

const PHASE_STYLE: Record<
  Phase,
  { label: string; color: string; rgb: string; pulse: number; icon: LucideIcon }
> = {
  idle: { label: "Awaiting wake word", color: "text-slate-300", rgb: "148,163,184", pulse: 3.2, icon: Activity },
  listening: { label: "Listening", color: "text-cyan-300", rgb: "34,211,238", pulse: 1.1, icon: Mic },
  thinking: { label: "Tokenizing & reasoning", color: "text-purple-300", rgb: "168,85,247", pulse: 0.8, icon: Brain },
  calling: { label: "Executing function", color: "text-amber-300", rgb: "251,191,36", pulse: 0.9, icon: Code },
  speaking: { label: "Speaking", color: "text-emerald-300", rgb: "52,211,153", pulse: 1.0, icon: Volume2 },
};

/* ============================== Tokenization ============================= */

/** Toy BPE-ish split: words, punctuation, long words cut into 4-char pieces. */
function tokenize(text: string) {
  const parts = text.match(/[A-Za-z0-9']+|[^\sA-Za-z0-9']/g) ?? [];
  const out: string[] = [];
  for (const p of parts) {
    if (p.length > 6) for (let i = 0; i < p.length; i += 4) out.push(p.slice(i, i + 4));
    else out.push(p);
  }
  return out;
}

/** Stable FNV-1a hash → fake token id (same on server and client). */
function tokenId(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) % 100000;
}

const hex = (n: number) => "0x" + (n % 65536).toString(16).toUpperCase().padStart(4, "0");

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
const seeded = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/* ============================ JSON highlighting ========================== */

function JsonLine({ line, tone = "default" }: { line: string; tone?: "default" | "result" }) {
  const parts: ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push(<span key={k++} className="text-slate-500">{line.slice(last, m.index)}</span>);
    if (m[1] && m[2]) {
      parts.push(<span key={k++} className="text-sky-300">{m[1]}</span>);
      parts.push(<span key={k++} className="text-slate-500">{m[2]}</span>);
    } else if (m[1]) {
      parts.push(
        <span key={k++} className={tone === "result" ? "text-emerald-300" : "text-amber-200"}>
          {m[1]}
        </span>,
      );
    } else if (m[3]) {
      parts.push(<span key={k++} className="text-purple-300">{m[3]}</span>);
    } else if (m[4]) {
      parts.push(<span key={k++} className="text-pink-300">{m[4]}</span>);
    }
    last = re.lastIndex;
  }
  if (last < line.length) parts.push(<span key={k++} className="text-slate-500">{line.slice(last)}</span>);
  return <>{parts}</>;
}

/* =============================== Animations ============================== */

const EASE = [0.22, 1, 0.36, 1] as const;

const gridStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const panelIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

/* ============================== Boot sequence ============================ */

const BOOT_LINES = [
  "INITIALIZING PETER OS v3.2...",
  "LOADING NLP MODELS [whisper-large-v3 · gpt-4o-custom]...",
  "CONNECTING TO PYTHON KERNEL @ 127.0.0.1:8765...",
  "ALL SYSTEMS NOMINAL.",
];
const BOOT_MS = 2600;
const BOOT_CHAR_MS = 13;
const BOOT_LINE_PAUSE = 6; // characters' worth of pause between lines
/** Character offset at which each boot line starts typing. */
const BOOT_OFFSETS = BOOT_LINES.map((_, i) =>
  BOOT_LINES.slice(0, i).reduce((sum, l) => sum + l.length + BOOT_LINE_PAUSE, 0),
);

function BootScreen({ onSkip }: { onSkip: () => void }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setElapsed(performance.now() - start), 30);
    return () => clearInterval(id);
  }, []);

  const chars = Math.floor(elapsed / BOOT_CHAR_MS);
  const typed = BOOT_LINES.map((line, i) => {
    const shown = line.slice(0, Math.max(0, chars - BOOT_OFFSETS[i]));
    return { shown, done: shown.length === line.length };
  });

  return (
    <motion.div
      key="boot"
      role="status"
      aria-label="Booting Peter OS"
      onClick={onSkip}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black px-6"
      initial={{ opacity: 1 }}
      exit={{
        opacity: [1, 1, 1, 0],
        scale: [1, 1.01, 1.04, 1.3],
        x: [0, -10, 7, 0],
        skewX: [0, 8, -5, 0],
        filter: [
          "blur(0px) hue-rotate(0deg) saturate(1)",
          "blur(1px) hue-rotate(90deg) saturate(3)",
          "blur(2px) hue-rotate(-70deg) saturate(3)",
          "blur(16px) hue-rotate(0deg) saturate(1)",
        ],
        transition: { duration: 0.8, times: [0, 0.12, 0.3, 1], ease: "easeIn" },
        pointerEvents: "none",
      }}
    >
      {/* Scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div className="w-full max-w-2xl font-mono text-[13px] leading-7 sm:text-sm">
        {typed.map(({ shown, done }, i) =>
          shown ? (
            <p key={i} className="flex justify-between gap-4">
              <span className={i === BOOT_LINES.length - 1 ? "text-emerald-300" : "text-cyan-300"}>
                <span className="text-slate-600">&gt; </span>
                {shown}
                {!done && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-cyan-300" />}
              </span>
              {done && i < BOOT_LINES.length - 1 && <span className="text-emerald-400">[ OK ]</span>}
            </p>
          ) : null,
        )}
        <div className="mt-6 h-px w-full overflow-hidden bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
            style={{ width: `${Math.min(100, (elapsed / BOOT_MS) * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-600">
          click to skip
        </p>
      </div>
    </motion.div>
  );
}

/* ============================ Building blocks ============================ */

function Panel({
  children,
  className,
  glow = "cyan",
}: {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "purple";
}) {
  return (
    <motion.section
      variants={panelIn}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-white/[0.025] p-5 backdrop-blur-xl sm:p-6",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
        glow === "cyan" ? "border-cyan-400/15" : "border-purple-400/15",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
          glow === "cyan" ? "via-cyan-400/60" : "via-purple-400/60",
        )}
      />
      {children}
    </motion.section>
  );
}

function PanelHeader({
  icon: Icon,
  step,
  title,
  active,
  meta,
}: {
  icon: LucideIcon;
  step: string;
  title: string;
  active: boolean;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "grid size-8 place-items-center rounded-lg border transition-all duration-500",
            active
              ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-200 shadow-[0_0_18px_-4px_rgba(34,211,238,0.8)]"
              : "border-white/10 bg-black/40 text-slate-400",
          )}
        >
          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-500">{step}</p>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-200">{title}</h2>
        </div>
      </div>
      {meta}
    </header>
  );
}

/** Small animated bar waveform; flat when inactive. */
function Waveform({
  active,
  bars = 28,
  color = "bg-cyan-300",
  className,
}: {
  active: boolean;
  bars?: number;
  color?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div className={cn("flex h-10 items-center gap-[3px]", className)} aria-hidden>
      {Array.from({ length: bars }, (_, i) => {
        const peak = 0.25 + seeded(i) * 0.75;
        return (
          <motion.span
            key={i}
            className={cn("w-[3px] rounded-full", color)}
            initial={false}
            animate={
              active && !reduced
                ? { height: ["15%", `${peak * 100}%`, `${peak * 40}%`, `${peak * 85}%`, "15%"], opacity: 1 }
                : { height: "12%", opacity: 0.35 }
            }
            transition={
              active && !reduced
                ? { duration: 0.9 + seeded(i + 50) * 0.6, repeat: Infinity, ease: "easeInOut", delay: seeded(i + 99) * 0.4 }
                : { duration: 0.4 }
            }
          />
        );
      })}
    </div>
  );
}

/** The centrepiece: concentric rings + orb that pulse to the current phase. */
function Core({ phase }: { phase: Phase }) {
  const reduced = useReducedMotion();
  const style = PHASE_STYLE[phase];
  const PhaseIcon = style.icon;
  const rgb = style.rgb;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      {/* Expanding pulse rings */}
      {!reduced &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={`${phase}-${i}`}
            aria-hidden
            className="absolute inset-[18%] rounded-full border"
            style={{ borderColor: `rgba(${rgb},0.45)` }}
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.75, opacity: 0 }}
            transition={{
              duration: style.pulse * 2.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: (i * style.pulse * 2.4) / 3,
            }}
          />
        ))}

      {/* Rotating dashed rings */}
      <motion.svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-0"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        <circle cx="100" cy="100" r="96" fill="none" stroke={`rgba(${rgb},0.25)`} strokeWidth="0.6" strokeDasharray="2 6" />
        <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(168,85,247,0.25)" strokeWidth="0.8" strokeDasharray="30 12 4 12" />
      </motion.svg>
      <motion.svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-0"
        animate={reduced ? undefined : { rotate: -360 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
      >
        <circle cx="100" cy="100" r="72" fill="none" stroke={`rgba(${rgb},0.4)`} strokeWidth="1.2" strokeDasharray="60 160" strokeLinecap="round" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(34,211,238,0.12)" strokeWidth="0.6" />
      </motion.svg>

      {/* Breathing orb */}
      <motion.div
        aria-hidden
        className="absolute inset-[30%] rounded-full"
        animate={
          reduced
            ? { boxShadow: `0 0 60px 6px rgba(${rgb},0.45)` }
            : {
                scale: [1, 1.07, 1],
                boxShadow: [
                  `0 0 40px 4px rgba(${rgb},0.35), inset 0 0 30px rgba(${rgb},0.4)`,
                  `0 0 80px 14px rgba(${rgb},0.55), inset 0 0 40px rgba(${rgb},0.6)`,
                  `0 0 40px 4px rgba(${rgb},0.35), inset 0 0 30px rgba(${rgb},0.4)`,
                ],
              }
        }
        transition={{ duration: style.pulse * 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), rgba(${rgb},0.55) 35%, rgba(88,28,135,0.6) 70%, rgba(5,6,10,0.9) 100%)`,
          transition: "background 0.8s ease",
        }}
      />

      {/* Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <PhaseIcon className={cn("size-7 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]", style.color)} aria-hidden />
        <span className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-white">
          Peter
        </span>
      </div>
    </div>
  );
}

/* ================================== Page ================================= */

type HistoryEntry = {
  id: number;
  time: string;
  intent: string;
  fn: string;
  confidence: number;
  latencyMs: number;
};

export default function AiTerminalPage() {
  const reduced = useReducedMotion() ?? false;
  const [booted, setBooted] = useState(false);
  const [run, setRun] = useState({ idx: 0, t: 0, loops: 0 });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const idxRef = useRef(0);
  const historyId = useRef(0);

  // Boot screen: dismiss after ~2.6s, or immediately on click / key press.
  useEffect(() => {
    if (booted) return;
    const skip = () => setBooted(true);
    const id = setTimeout(skip, BOOT_MS);
    window.addEventListener("keydown", skip);
    return () => {
      clearTimeout(id);
      window.removeEventListener("keydown", skip);
    };
  }, [booted]);

  // The 12-second interaction loop. A single clock drives every panel.
  useEffect(() => {
    if (!booted) return;
    let start = performance.now();
    const id = setInterval(() => {
      const t = performance.now() - start;
      if (t < CYCLE_MS) {
        setRun((r) => ({ ...r, t }));
        return;
      }
      // Loop finished: log it, then move to the next scenario.
      const done = SCENARIOS[idxRef.current];
      historyId.current += 1;
      const entry: HistoryEntry = {
        id: historyId.current,
        time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        intent: done.decision.intent,
        fn: done.decision.function,
        confidence: done.decision.confidence,
        latencyMs: done.latencyMs,
      };
      setHistory((h) => [entry, ...h].slice(0, 5));
      idxRef.current = (idxRef.current + 1) % SCENARIOS.length;
      start = performance.now();
      setRun((r) => ({ idx: idxRef.current, t: 0, loops: r.loops + 1 }));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [booted]);

  /* ---------------------------- Derived state ----------------------------- */

  const { t, idx } = run;
  const scenario = SCENARIOS[idx];
  const phase = phaseAt(t, booted);
  const phaseStyle = PHASE_STYLE[phase];

  const transcriptChars = Math.round(
    progress(t, LISTEN_TYPE_START, LISTEN_END - 200) * scenario.transcript.length,
  );
  const tokens = tokenize(scenario.transcript);
  const litTokens = Math.floor(progress(t, LISTEN_END, THINK_END - 200) * tokens.length);
  const decisionLines = JSON.stringify(scenario.decision, null, 2).split("\n");
  const shownLines = Math.max(
    0,
    Math.min(decisionLines.length, Math.floor((t - JSON_START) / JSON_LINE_MS) + 1),
  );
  const decisionDone = shownLines === decisionLines.length;
  const executing = decisionDone && t < RESULT_AT;
  const resultLines = JSON.stringify(scenario.result, null, 2).split("\n");
  const showResult = t >= RESULT_AT;
  const replyChars = Math.round(progress(t, SPEAK_START, SPEAK_END - 300) * scenario.reply.length);
  const embeddingLit = Math.floor(progress(t, LISTEN_END + 300, THINK_END) * 64);
  const confidenceShown = phase === "calling" || phase === "speaking" || (phase === "idle" && t > SPEAK_END);

  const pipeline: { key: Phase; label: string }[] = [
    { key: "listening", label: "STT" },
    { key: "thinking", label: "NLP" },
    { key: "calling", label: "Tool call" },
    { key: "speaking", label: "TTS" },
  ];
  const phaseOrder: Phase[] = ["listening", "thinking", "calling", "speaking"];
  const phaseIndex = phaseOrder.indexOf(phase);

  return (
    <>
      <AnimatePresence>{!booted && <BootScreen onSkip={() => setBooted(true)} />}</AnimatePresence>

      <main className="relative isolate min-h-svh flex-1 overflow-hidden bg-[#04050a] font-sans text-slate-100">
        {/* Background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(168,85,247,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,85,247,0.07) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 100%)",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-purple-600/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[420px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={booted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: EASE, delay: booted ? 0.15 : 0 }}
          className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8"
        >
          {/* ------------------------------ Header ----------------------------- */}
          <header className="mb-8 flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-slate-300 backdrop-blur transition-colors hover:border-purple-400/40 hover:text-purple-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
                Back to Portfolio
              </Link>

              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-3 py-1.5 text-emerald-200">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                  </span>
                  Online
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-400/[0.06] px-3 py-1.5 text-purple-200">
                  <Cpu className="size-3.5" aria-hidden />
                  Model: gpt-4o-custom
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-purple-300/80">
                  {"// Case study · Voice AI agent"}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                    AI Voice Terminal
                  </span>{" "}
                  <span className="text-slate-400">(Peter)</span>
                </h1>
              </div>

              {/* Pipeline stepper */}
              <ol className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider" aria-label="Pipeline">
                {pipeline.map((s, i) => {
                  const active = s.key === phase;
                  const done = phaseIndex > i || (phase === "idle" && t > SPEAK_END);
                  return (
                    <li key={s.key} className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded-md border px-2.5 py-1.5 transition-all duration-300",
                          active && "border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_16px_-4px_rgba(34,211,238,0.9)]",
                          done && !active && "border-purple-400/30 bg-purple-400/10 text-purple-200",
                          !active && !done && "border-white/10 text-slate-500",
                        )}
                        aria-current={active ? "step" : undefined}
                      >
                        {s.label}
                      </span>
                      {i < pipeline.length - 1 && <ChevronRight className="size-3 text-slate-600" aria-hidden />}
                    </li>
                  );
                })}
              </ol>
            </div>
          </header>

          {/* ------------------------------- Grid ------------------------------ */}
          <motion.div
            variants={gridStagger}
            initial="hidden"
            animate={booted ? "show" : "hidden"}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5"
          >
            {/* Panel 1 — Input stream */}
            <Panel className="flex flex-col lg:col-span-4">
              <PanelHeader
                icon={Mic}
                step="01 · Speech-to-text"
                title="Input stream"
                active={phase === "listening"}
                meta={
                  <span className="font-mono text-[10px] text-slate-500">
                    {scenario.stt.engine} · 16kHz
                  </span>
                }
              />
              <Waveform active={phase === "listening"} />
              <div className="mt-4 flex-1 space-y-4 rounded-xl border border-white/[0.06] bg-black/40 p-4 font-mono text-[13px] leading-relaxed">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">User</p>
                  <motion.p layout className="min-h-[2.75rem] text-slate-100">
                    {booted ? scenario.transcript.slice(0, transcriptChars) : ""}
                    {phase === "listening" && (
                      <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-cyan-300" />
                    )}
                    {!booted || (t < LISTEN_TYPE_START && phase === "listening") ? (
                      <span className="text-slate-600">listening…</span>
                    ) : null}
                  </motion.p>
                  {transcriptChars === scenario.transcript.length && (
                    <p className="mt-1 text-[10px] text-slate-500">
                      STT confidence {scenario.stt.confidence.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="border-t border-white/[0.06] pt-4">
                  <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-emerald-300/70">
                    Peter
                    {phase === "speaking" && <Waveform active bars={10} color="bg-emerald-300" className="h-3" />}
                  </div>
                  <p className="min-h-[2.75rem] text-slate-300">
                    {replyChars > 0 ? (
                      scenario.reply.slice(0, replyChars)
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                    {phase === "speaking" && (
                      <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-emerald-300" />
                    )}
                  </p>
                </div>
              </div>
            </Panel>

            {/* The Core */}
            <Panel glow="purple" className="flex flex-col items-center justify-center md:col-span-2 md:row-start-1 lg:col-span-4 lg:col-start-5">
              <Core phase={phase} />
              <div className="mt-4 text-center">
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("font-mono text-xs uppercase tracking-[0.3em]", phaseStyle.color)}
                  aria-live="polite"
                >
                  {phaseStyle.label}
                </motion.p>
                <p className="mt-2 font-mono text-[10px] text-slate-500">
                  loop {run.loops + 1} · {(t / 1000).toFixed(1)}s / {CYCLE_MS / 1000}s
                </p>
              </div>
            </Panel>

            {/* Panel 3 — Intent & function calling */}
            <Panel className="flex flex-col lg:col-span-4">
              <PanelHeader
                icon={Code}
                step="03 · Reasoning"
                title="Intent & function calling"
                active={phase === "calling"}
                meta={<span className="font-mono text-[10px] text-slate-500">tool_choice=auto</span>}
              />
              <div className="flex-1 overflow-hidden rounded-xl border border-white/[0.06] bg-black/50 p-4 font-mono text-[12px] leading-relaxed">
                {shownLines === 0 ? (
                  <p className="text-slate-600">
                    {phase === "thinking" ? "› resolving intent…" : "› waiting for input"}
                  </p>
                ) : (
                  <>
                    {decisionLines.slice(0, shownLines).map((line, i) => (
                      <motion.pre
                        layout
                        key={`${idx}-d-${i}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                        className="whitespace-pre-wrap break-all"
                      >
                        <JsonLine line={line} />
                      </motion.pre>
                    ))}

                    {decisionDone && (
                      <motion.p
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 flex items-center gap-2 text-amber-300"
                      >
                        {executing ? (
                          <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
                        ) : (
                          <CircleCheck className="size-3.5 text-emerald-300" aria-hidden />
                        )}
                        <span className={executing ? "" : "text-emerald-300"}>
                          {executing ? "executing" : "returned"} {scenario.decision.function}()
                          {!executing && <span className="text-slate-500"> · {scenario.latencyMs}ms</span>}
                        </span>
                      </motion.p>
                    )}

                    {showResult && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-2.5"
                      >
                        {resultLines.map((line, i) => (
                          <pre key={i} className="whitespace-pre-wrap break-all">
                            <JsonLine line={line} tone="result" />
                          </pre>
                        ))}
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Confidence meter */}
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  <span>Intent confidence</span>
                  <span className="text-slate-300">
                    {confidenceShown ? `${(scenario.decision.confidence * 100).toFixed(0)}%` : "—"}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                    initial={false}
                    animate={{ width: confidenceShown ? `${scenario.decision.confidence * 100}%` : "0%" }}
                    transition={{ type: "spring", stiffness: 80, damping: 18 }}
                  />
                </div>
              </div>
            </Panel>

            {/* Panel 2 — NLP & tokenization */}
            <Panel glow="purple" className="md:col-span-2 lg:col-span-8">
              <PanelHeader
                icon={Brain}
                step="02 · NLP"
                title="Tokenization & embedding"
                active={phase === "thinking"}
                meta={
                  <span className="font-mono text-[10px] text-slate-500">
                    {litTokens}/{tokens.length} tokens · dim 3072
                  </span>
                }
              />
              <motion.ul layout className="flex flex-wrap gap-1.5">
                {tokens.map((tok, i) => {
                  const lit = i < litTokens;
                  const current = i === litTokens - 1 && phase === "thinking";
                  const id = tokenId(tok + i);
                  return (
                    <motion.li
                      layout
                      key={`${idx}-${i}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: current ? 1.08 : 1 }}
                      transition={{ duration: 0.25 }}
                      className={cn(
                        "flex flex-col items-center rounded-md border px-2 py-1 font-mono transition-colors duration-300",
                        lit
                          ? current
                            ? "border-cyan-300 bg-cyan-400/20 shadow-[0_0_16px_-2px_rgba(34,211,238,0.9)]"
                            : "border-purple-400/40 bg-purple-400/10"
                          : "border-white/[0.07] bg-black/30",
                      )}
                    >
                      <span className={cn("text-[12px]", lit ? "text-slate-100" : "text-slate-500")}>
                        {tok === " " ? "␣" : tok}
                      </span>
                      <span className={cn("text-[9px]", lit ? "text-cyan-300/80" : "text-slate-600")}>
                        {hex(id)}
                      </span>
                    </motion.li>
                  );
                })}
              </motion.ul>

              {/* Embedding vector visual */}
              <div className="mt-5">
                <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  <Binary className="size-3" aria-hidden />
                  Embedding vector (first 64 of 3072 dims)
                </p>
                <div className="grid grid-cols-[repeat(32,minmax(0,1fr))] gap-[3px]">
                  {Array.from({ length: 64 }, (_, i) => {
                    const v = seeded(i + idx * 64);
                    const on = i < embeddingLit;
                    return (
                      <span
                        key={i}
                        className="aspect-square rounded-[2px] transition-colors duration-300"
                        style={{
                          backgroundColor: on
                            ? v > 0.5
                              ? `rgba(34,211,238,${0.25 + v * 0.7})`
                              : `rgba(168,85,247,${0.25 + (1 - v) * 0.7})`
                            : "rgba(255,255,255,0.04)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </Panel>

            {/* Session history */}
            <Panel className="md:col-span-2 lg:col-span-4">
              <PanelHeader
                icon={History}
                step="Session"
                title="Recent calls"
                active={false}
                meta={<AudioLines className="size-4 text-slate-600" aria-hidden />}
              />
              {history.length === 0 ? (
                <p className="font-mono text-[12px] text-slate-600">
                  First interaction in progress…
                </p>
              ) : (
                <ul className="space-y-2">
                  {history.map((h) => (
                    <motion.li
                      layout
                      key={h.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2 font-mono text-[11px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-purple-200">{h.intent}</span>
                        <span className="text-slate-600">{h.time}</span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2 text-slate-400">
                        <span className="truncate">{h.fn}()</span>
                        <span className="shrink-0 text-slate-500">
                          {(h.confidence * 100).toFixed(0)}% · {h.latencyMs}ms
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </Panel>
          </motion.div>

          <p className="mt-8 text-center font-mono text-[11px] text-slate-600">
            {reduced ? "Reduced motion · " : ""}Simulated session for demonstration · the real
            agent runs as a Python service with Whisper STT and OpenAI function calling.
          </p>
        </motion.div>
      </main>
    </>
  );
}
