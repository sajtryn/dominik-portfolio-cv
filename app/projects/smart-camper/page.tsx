"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BatteryCharging,
  BatteryFull,
  BatteryWarning,
  BrainCircuit,
  Cpu,
  Droplet,
  Droplets,
  Fan,
  Flame,
  Gauge,
  Lightbulb,
  MapPin,
  Pause,
  Play,
  Plug,
  Power,
  Radio,
  Refrigerator,
  Signal,
  Snowflake,
  Sun,
  Terminal,
  Thermometer,
  Timer,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HISTORY_LENGTH = 28;
const MAX_LOG_LINES = 100;

/** House battery: 200Ah LiFePO₄ at 12.8V nominal. */
const CAPACITY_WH = 2560;
/** Simulation time-lapse for the battery: 1 real second = 1 simulated minute. */
const SIM_SPEED = 60;
const V_MIN = 12.2;
const V_MAX = 13.8;

const BASE_LOAD_MIN = 32;
const BASE_LOAD_MAX = 52;

const SETPOINT_C = 21.5;
const DRAW_SCALE_W = 240;

type DeviceId = "lights" | "pump" | "heater";

const DEVICES: {
  id: DeviceId;
  name: string;
  detail: string;
  watts: number;
  icon: LucideIcon;
  topic: string;
  tone: { track: string; glow: string; bar: string; text: string };
}[] = [
  {
    id: "lights",
    name: "Cabin Lights",
    detail: "LED strips · 12V",
    watts: 15,
    icon: Lightbulb,
    topic: "relay/lights",
    tone: {
      track: "from-amber-300 to-yellow-400",
      glow: "shadow-[0_0_22px_-4px_rgba(251,191,36,0.75)]",
      bar: "bg-amber-300",
      text: "text-amber-300",
    },
  },
  {
    id: "pump",
    name: "Water Pump",
    detail: "Diaphragm pump · 12V",
    watts: 45,
    icon: Waves,
    topic: "relay/pump",
    tone: {
      track: "from-sky-400 to-cyan-400",
      glow: "shadow-[0_0_22px_-4px_rgba(34,211,238,0.75)]",
      bar: "bg-cyan-400",
      text: "text-cyan-300",
    },
  },
  {
    id: "heater",
    name: "Autoterm Heater",
    detail: "Air 2D · fan + glow plug",
    watts: 120,
    icon: Flame,
    topic: "can/heater",
    tone: {
      track: "from-orange-400 to-rose-500",
      glow: "shadow-[0_0_22px_-4px_rgba(249,115,22,0.75)]",
      bar: "bg-orange-400",
      text: "text-orange-300",
    },
  },
];

const DEVICE_WATTS = Object.fromEntries(DEVICES.map((d) => [d.id, d.watts])) as Record<
  DeviceId,
  number
>;

type Devices = Record<DeviceId, boolean>;
const INITIAL_DEVICES: Devices = { lights: false, pump: false, heater: false };

type Telemetry = {
  solarW: number;
  /** State of charge, 0–100. Integrated from net power every second. */
  socPct: number;
  freshPct: number;
  greyPct: number;
  tempC: number;
  extC: number;
  humidityPct: number;
  latencyMs: number;
  baseLoadW: number;
};

// Deterministic first frame (a chilly morning in the van) so server and
// client render the same markup; randomness only starts inside effects.
const INITIAL: Telemetry = {
  solarW: 214,
  socPct: 76,
  freshPct: 78,
  greyPct: 31,
  tempC: 16.8,
  extC: 8.2,
  humidityPct: 58,
  latencyMs: 24,
  baseLoadW: 41,
};

const INITIAL_HISTORY = [
  168, 175, 182, 190, 186, 197, 205, 199, 211, 220, 214, 226, 232, 228, 219,
  224, 236, 241, 233, 226, 230, 222, 215, 209, 218, 212, 206, 214,
];

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const drift = (v: number, step: number, min: number, max: number) =>
  clamp(v + rand(-step, step), min, max);

/** LiFePO₄ resting voltage vs. state of charge (flat in the middle). */
const OCV_CURVE: [soc: number, volts: number][] = [
  [0, 12.2],
  [10, 12.8],
  [20, 13.0],
  [50, 13.15],
  [80, 13.3],
  [95, 13.4],
  [100, 13.5],
];
const PACK_RESISTANCE = 0.012; // ohms — voltage sag / rise under current

function restingVoltage(soc: number) {
  for (let i = 1; i < OCV_CURVE.length; i++) {
    const [s1, v1] = OCV_CURVE[i];
    if (soc <= s1) {
      const [s0, v0] = OCV_CURVE[i - 1];
      return v0 + ((soc - s0) / (s1 - s0)) * (v1 - v0);
    }
  }
  return OCV_CURVE[OCV_CURVE.length - 1][1];
}

/** Terminal voltage: resting voltage ± I·R for the current net flow. */
function batteryVoltage(soc: number, netW: number) {
  const amps = netW / 12.8;
  return clamp(restingVoltage(soc) + amps * PACK_RESISTANCE, V_MIN, V_MAX);
}

/** Real-world time until full/empty at the current net flow. */
function timeEstimate(soc: number, netW: number) {
  if (Math.abs(netW) < 1) return null;
  const wh = netW > 0 ? ((100 - soc) / 100) * CAPACITY_WH : (soc / 100) * CAPACITY_WH;
  const hours = wh / Math.abs(netW);
  if (hours > 99) return "> 99h";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

type FuzzySet = "COLD" | "COOL" | "COMFORT" | "WARM";
type FuzzyOutput = {
  errorK: number;
  set: FuzzySet;
  mu: Record<FuzzySet, number>;
  burner: number;
  fan: number;
};

const tri = (x: number, a: number, b: number, c: number) =>
  Math.max(0, Math.min((x - a) / (b - a), (c - x) / (c - b)));

/**
 * Mamdani-style controller, simplified: fuzzify the temperature error into
 * four sets, fire one rule per set (scaled by how cold it is outside), and
 * defuzzify burner / fan output with a weighted average.
 */
function fuzzyClimate(intC: number, extC: number, setpoint = SETPOINT_C): FuzzyOutput {
  const e = setpoint - intC; // positive = cabin too cold
  const mu: Record<FuzzySet, number> = {
    COLD: clamp((e - 1.5) / 2.5, 0, 1),
    COOL: tri(e, 0.3, 2, 4),
    COMFORT: tri(e, -1, 0, 1),
    WARM: clamp((-e - 0.5) / 1.5, 0, 1),
  };
  const outside = clamp((15 - extC) / 15, 0, 1); // 1 = freezing outside
  const rules: Record<FuzzySet, { burner: number; fan: number }> = {
    COLD: { burner: 80 + 20 * outside, fan: 60 + 15 * outside },
    COOL: { burner: 40 + 20 * outside, fan: 45 },
    COMFORT: { burner: 12 * outside, fan: 25 },
    WARM: { burner: 0, fan: 0 },
  };
  let w = 0;
  let burner = 0;
  let fan = 0;
  for (const k of Object.keys(mu) as FuzzySet[]) {
    w += mu[k];
    burner += mu[k] * rules[k].burner;
    fan += mu[k] * rules[k].fan;
  }
  const set = (Object.keys(mu) as FuzzySet[]).reduce((a, b) => (mu[b] > mu[a] ? b : a));
  return {
    errorK: e,
    set,
    mu,
    burner: w ? Math.round(burner / w) : 0,
    fan: w ? Math.round(fan / w) : 0,
  };
}

/** Heater electrical draw: 120W at full burner, fan + glow plug scale with it. */
const autoHeaterWatts = (f: FuzzyOutput | null) =>
  f && f.burner >= 8 ? Math.round(20 + f.burner) : 0;

const heaterWatts = (devices: Devices, auto: boolean, fuzzy: FuzzyOutput | null) =>
  auto ? autoHeaterWatts(fuzzy) : devices.heater ? DEVICE_WATTS.heater : 0;

const powerDraw = (
  baseLoadW: number,
  devices: Devices,
  auto: boolean,
  fuzzy: FuzzyOutput | null,
) =>
  baseLoadW +
  (devices.lights ? DEVICE_WATTS.lights : 0) +
  (devices.pump ? DEVICE_WATTS.pump : 0) +
  heaterWatts(devices, auto, fuzzy);

/**
 * Runs `callback` repeatedly with a random delay between `minMs` and `maxMs`
 * (a recursive setTimeout, so every gap is different). Always calls the
 * latest callback, so it can read fresh state without restarting the timer.
 */
function useJitterInterval(
  callback: () => void,
  minMs: number,
  maxMs: number,
  enabled = true,
) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    let id: ReturnType<typeof setTimeout>;
    const schedule = () => {
      id = setTimeout(() => {
        saved.current();
        schedule();
      }, rand(minMs, maxMs));
    };
    schedule();
    return () => clearTimeout(id);
  }, [minMs, maxMs, enabled]);
}

type LogTag =
  | "SYS"
  | "MQTT"
  | "BMS"
  | "SOLAR"
  | "NET"
  | "WATER"
  | "HVAC"
  | "CMD"
  | "FUZZY_AI";
type LogLine = { id: number; time: string; tag: LogTag; text: string };

const TAG_STYLE: Record<LogTag, string> = {
  SYS: "text-slate-300",
  MQTT: "text-cyan-300",
  BMS: "text-emerald-300",
  SOLAR: "text-amber-300",
  NET: "text-sky-300",
  WATER: "text-blue-300",
  HVAC: "text-purple-300",
  CMD: "text-pink-300",
  FUZZY_AI: "text-fuchsia-300",
};

const ROW_HIGHLIGHT: Partial<Record<LogTag, string>> = {
  CMD: "bg-pink-400/[0.07]",
  FUZZY_AI: "bg-fuchsia-500/[0.08]",
};

type Snapshot = { data: Telemetry; drawW: number };

const AMBIENT_LOGS: ((s: Snapshot) => [LogTag, string])[] = [
  ({ data }) => ["MQTT", `PINGRESP from broker.vc-it.local · ${data.latencyMs}ms`],
  ({ data }) => [
    "MQTT",
    `PUBLISH camper/vc-07/telemetry qos=1 (${(180 + data.latencyMs * 3).toFixed(0)}B)`,
  ],
  ({ data, drawW }) => {
    const net = data.solarW - drawW;
    return [
      "BMS",
      `Pack ${batteryVoltage(data.socPct, net).toFixed(2)}V · SoC ${data.socPct.toFixed(1)}% · net ${net >= 0 ? "+" : ""}${net}W`,
    ];
  },
  ({ drawW }) => ["SYS", `DC bus load ${drawW}W · shunt calibrated`],
  () => ["NET", "LTE uplink stable · RSRP -87dBm · band 20"],
  () => ["SYS", "Modbus RTU poll cycle complete · 6/6 slaves responding"],
  () => ["NET", "Watchdog heartbeat OK · edge gateway uptime 14d 06h"],
  () => ["MQTT", "Retained config synced · firmware v2.4.1"],
];

const BOOT_LOGS: [LogTag, string][] = [
  ["SYS", "Edge gateway online · Raspberry Pi CM4 · Linux 6.6"],
  ["NET", "LTE modem attached · APN iot.vc-it"],
  ["MQTT", "CONNACK from broker.vc-it.local:8883 (TLS 1.3)"],
  ["MQTT", "SUBSCRIBE camper/vc-07/# qos=1"],
  ["BMS", `Shunt online · ${CAPACITY_WH}Wh pack · time-lapse ×${SIM_SPEED}`],
  ["SYS", "Telemetry stream started · async sensor topics"],
];

const timestamp = () =>
  new Date().toLocaleTimeString("en-GB", { hour12: false });

const EASE = [0.22, 1, 0.36, 1] as const;

const gridStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const panelIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

const VALUE_SPRING = { type: "spring", stiffness: 90, damping: 20 } as const;
const SWITCH_SPRING = { type: "spring", stiffness: 700, damping: 32 } as const;

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      variants={panelIn}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:p-6",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
      />
      {children}
    </motion.section>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  meta,
  iconClass = "text-cyan-300",
}: {
  icon: LucideIcon;
  title: string;
  meta?: ReactNode;
  iconClass?: string;
}) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "grid size-8 place-items-center rounded-lg border border-white/10 bg-black/40",
            iconClass,
          )}
        >
          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-300">
          {title}
        </h2>
      </div>
      {meta}
    </header>
  );
}

function MetaLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
      {children}
    </span>
  );
}

/**
 * Number that slides in from below whenever its displayed value changes.
 * Enter-only on purpose: the old value is swapped out instantly, so values
 * can never pile up while a background tab has animations paused.
 */
function LiveNumber({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const text = value.toFixed(decimals);
  return (
    <span className={cn("relative inline-flex overflow-hidden tabular-nums", className)}>
      <motion.span
        key={text}
        initial={{ y: "55%", opacity: 0.2 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        {text}
      </motion.span>
    </span>
  );
}

function SpringNumber({
  value,
  decimals = 0,
  signed = false,
  className,
}: {
  value: number;
  decimals?: number;
  signed?: boolean;
  className?: string;
}) {
  const mv = useSpring(value, { stiffness: 70, damping: 18, mass: 0.8 });
  useEffect(() => {
    mv.set(value);
  }, [mv, value]);
  const text = useTransform(mv, (v) => {
    const s = v.toFixed(decimals);
    return signed && v >= 0 ? `+${s}` : s;
  });
  return (
    <motion.span
      className={cn("tabular-nums", className)}
      data-value={value.toFixed(decimals)}
    >
      {text}
    </motion.span>
  );
}

function Dial({
  value,
  min,
  max,
  from,
  to,
  size = 168,
  children,
}: {
  value: number;
  min: number;
  max: number;
  from: string;
  to: string;
  size?: number;
  children: ReactNode;
}) {
  const id = useId();
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75; // 270° gauge, gap at the bottom
  const pct = clamp((value - min) / (max - min), 0, 1);
  const tickR = r - stroke - 4;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[135deg]"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${c}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={tickR}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={4}
          strokeDasharray={`1 ${(2 * Math.PI * tickR * 0.75) / 24 - 1}`}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id}-g)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${c}`}
          initial={false}
          animate={{ strokeDashoffset: arc * (1 - pct) }}
          transition={VALUE_SPRING}
          style={{ filter: `drop-shadow(0 0 6px ${to})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

function Tank({
  label,
  value,
  icon: Icon,
  tone,
  trend,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "fresh" | "grey";
  trend: string;
}) {
  const fill =
    tone === "fresh"
      ? "from-cyan-400/90 via-sky-500/80 to-blue-600/80"
      : "from-slate-400/80 via-slate-500/70 to-zinc-600/70";
  const glow =
    tone === "fresh"
      ? "shadow-[0_0_30px_-6px_rgba(34,211,238,0.6)]"
      : "shadow-[0_0_24px_-8px_rgba(148,163,184,0.5)]";
  const warn = tone === "fresh" ? value < 20 : value > 80;

  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <div className="relative h-44 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/40 sm:h-52 sm:w-20">
        {[25, 50, 75].map((m) => (
          <span
            key={m}
            className="absolute inset-x-0 z-10 border-t border-dashed border-white/10"
            style={{ bottom: `${m}%` }}
          />
        ))}
        <motion.div
          className={cn("absolute inset-x-0 bottom-0 bg-gradient-to-t", fill, glow)}
          initial={false}
          animate={{ height: `${value}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 18 }}
        >
          <span className="absolute inset-x-0 top-0 h-1 bg-white/40 blur-[1px]" />
        </motion.div>
      </div>
      <div className="text-center">
        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Icon className="size-3.5" aria-hidden />
          {label}
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-xl font-semibold",
            warn ? "text-amber-300" : "text-slate-100",
          )}
        >
          <LiveNumber value={value} />%
        </p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {trend}
        </p>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/25 px-3.5 py-3">
      <span className="flex items-center gap-2 text-xs text-slate-400">
        <Icon className="size-3.5 text-slate-500" aria-hidden />
        {label}
      </span>
      <span className="font-mono text-sm text-slate-100">{children}</span>
    </div>
  );
}

function Toggle({
  checked,
  pending = false,
  disabled = false,
  onChange,
  label,
  track,
  glow,
}: {
  checked: boolean;
  pending?: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
  track: string;
  glow: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={pending}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative flex h-8 w-14 shrink-0 items-center rounded-full border p-1 transition-colors duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        "disabled:cursor-not-allowed disabled:opacity-70",
        checked
          ? cn("justify-end border-transparent bg-gradient-to-r", track, glow)
          : "justify-start border-white/10 bg-white/[0.06]",
      )}
    >
      <motion.span
        layout
        transition={SWITCH_SPRING}
        className="relative grid size-6 place-items-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
      >
        {pending && (
          <span className="size-2.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        )}
      </motion.span>
    </button>
  );
}

function Meter({
  label,
  value,
  icon: Icon,
  bar,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  bar: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Icon className="size-3" aria-hidden />
          {label}
        </span>
        <span className="text-slate-200">
          <SpringNumber value={value} />%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={cn("h-full rounded-full", bar)}
          initial={false}
          animate={{ width: `${value}%` }}
          transition={VALUE_SPRING}
        />
      </div>
    </div>
  );
}

export default function SmartCamperDashboard() {
  const reduced = useReducedMotion() ?? false;
  const [data, setData] = useState<Telemetry>(INITIAL);
  const [history, setHistory] = useState<number[]>(INITIAL_HISTORY);
  const [devices, setDevices] = useState<Devices>(INITIAL_DEVICES);
  const [pending, setPending] = useState<Devices>(INITIAL_DEVICES);
  const [auto, setAuto] = useState(false);
  const [fuzzy, setFuzzy] = useState<FuzzyOutput | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [paused, setPaused] = useState(false);
  const [clock, setClock] = useState<string | null>(null);
  const [packets, setPackets] = useState(0);

  // Latest values for timer callbacks. Each is written together with its
  // state (in the same handler), so callbacks never read stale values.
  const dataRef = useRef<Telemetry>(INITIAL);
  const devicesRef = useRef<Devices>(INITIAL_DEVICES);
  const autoRef = useRef(false);
  const fuzzyRef = useRef<FuzzyOutput | null>(null);

  const logId = useRef(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const live = !paused;

  const currentDraw = () =>
    powerDraw(
      dataRef.current.baseLoadW,
      devicesRef.current,
      autoRef.current,
      fuzzyRef.current,
    );

  const pushLog = useCallback((tag: LogTag, text: string) => {
    logId.current += 1;
    const line = { id: logId.current, time: timestamp(), tag, text };
    setLogs((prev) => [...prev.slice(-(MAX_LOG_LINES - 1)), line]);
  }, []);

  /** Apply a partial sensor reading and count it as one received packet. */
  const ingest = useCallback((patch: Partial<Telemetry>) => {
    dataRef.current = { ...dataRef.current, ...patch };
    setData(dataRef.current);
    setPackets((n) => n + 1);
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  useEffect(() => {
    const ids = BOOT_LOGS.map(([tag, text], i) =>
      setTimeout(() => pushLog(tag, text), 250 + i * 300),
    );
    return () => ids.forEach(clearTimeout);
  }, [pushLog]);

  useEffect(() => {
    const update = () => setClock(timestamp());
    const first = setTimeout(update, 0);
    const id = setInterval(update, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach(clearTimeout);
  }, []);

  useJitterInterval(
    () => {
      const solarW = Math.round(drift(dataRef.current.solarW, 35, 120, 280));
      ingest({ solarW });
      setHistory((h) => [...h.slice(1 - HISTORY_LENGTH), solarW]);
      if (Math.random() < 0.5) {
        pushLog("SOLAR", `MPPT tracking · ${solarW}W @ ${(solarW / 13.1).toFixed(1)}A`);
      }
    },
    3000,
    7000,
    live,
  );

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const d = dataRef.current;
      const net = d.solarW - currentDraw();
      const deltaPct = ((net * SIM_SPEED) / 3600 / CAPACITY_WH) * 100;
      const socPct = clamp(d.socPct + deltaPct, 0, 100);
      if (d.socPct >= 20 && socPct < 20) {
        pushLog("BMS", "Low SoC warning · below 20% · consider shedding loads");
      }
      if (d.socPct < 100 && socPct >= 100) {
        pushLog("BMS", "Absorption complete · pack full · switching to float");
      }
      ingest({ socPct });
    }, 1000);
    return () => clearInterval(id);
  }, [live, ingest, pushLog]);

  useJitterInterval(
    () =>
      ingest({
        baseLoadW: Math.round(
          drift(dataRef.current.baseLoadW, 6, BASE_LOAD_MIN, BASE_LOAD_MAX),
        ),
      }),
    5000,
    9000,
    live,
  );

  // Climate: very stable, every 15–20s. Heat input from the heater (full in
  // manual mode, burner % in auto mode) fights heat loss to the outside.
  useJitterInterval(
    () => {
      const d = dataRef.current;
      const heat = autoRef.current
        ? (fuzzyRef.current?.burner ?? 0) / 100
        : devicesRef.current.heater
          ? 1
          : 0;
      const loss = (d.tempC - d.extC) * 0.025;
      const tempC = clamp(d.tempC + heat * rand(0.55, 0.85) - loss + rand(-0.05, 0.05), 4, 28);
      const humidityPct =
        heat > 0.2
          ? clamp(d.humidityPct - heat * rand(0.6, 1.4), 35, 70)
          : drift(d.humidityPct, 0.8, 42, 66);
      const extC = drift(d.extC, 0.3, 5, 11);
      ingest({ tempC, humidityPct, extC });
      pushLog(
        "HVAC",
        `Cabin ${tempC.toFixed(1)}°C / RH ${humidityPct.toFixed(0)}% · outside ${extC.toFixed(1)}°C`,
      );
    },
    15000,
    20000,
    live,
  );

  // Water: slow, every 10s. ~1% fresh water used per reading; running the
  // pump draws (and drains) noticeably faster.
  useJitterInterval(
    () => {
      const d = dataRef.current;
      const pumping = devicesRef.current.pump;
      let freshPct = d.freshPct - (pumping ? rand(2.5, 3.5) : 1);
      let greyPct = d.greyPct + (pumping ? rand(2, 3) : 0.8);
      if (freshPct < 5) {
        freshPct = 100;
        pushLog("WATER", "Fresh tank refilled · level reset to 100%");
      }
      if (greyPct > 95) {
        greyPct = 2;
        pushLog("WATER", "Grey tank emptied at service point");
      }
      ingest({ freshPct, greyPct });
    },
    10000,
    10000,
    live,
  );

  useJitterInterval(
    () => ingest({ latencyMs: Math.round(drift(dataRef.current.latencyMs, 6, 11, 48)) }),
    2000,
    4000,
    live,
  );

  useJitterInterval(
    () => {
      const make = AMBIENT_LOGS[Math.floor(Math.random() * AMBIENT_LOGS.length)];
      const [tag, text] = make({ data: dataRef.current, drawW: currentDraw() });
      pushLog(tag, text);
    },
    3000,
    6000,
    live,
  );

  const runFuzzy = useCallback(() => {
    const d = dataRef.current;
    // The heater samples its own intake sensor between the slow cabin
    // reports, so each evaluation sees a slightly different reading.
    const intC = d.tempC + rand(-0.15, 0.15);
    const out = fuzzyClimate(intC, d.extC);
    const prevHeaterOn = autoHeaterWatts(fuzzyRef.current) > 0;
    fuzzyRef.current = out;
    setFuzzy(out);

    pushLog(
      "FUZZY_AI",
      `Ext: ${d.extC.toFixed(1)}°C, Int: ${intC.toFixed(1)}°C -> Set: ${out.set}. Output: Fan ${out.fan}%, Burner ${out.burner}%`,
    );
    const fired = (Object.keys(out.mu) as FuzzySet[])
      .filter((k) => out.mu[k] > 0.01)
      .map((k) => `${k}(${out.mu[k].toFixed(2)})`)
      .join(" ∨ ");
    pushLog(
      "FUZZY_AI",
      `e=${out.errorK >= 0 ? "+" : ""}${out.errorK.toFixed(2)}K · μ: ${fired || "∅"} · weighted-centroid → burner ${out.burner}% · heater ${autoHeaterWatts(out)}W`,
    );

    const heaterOn = autoHeaterWatts(out) > 0;
    if (heaterOn !== prevHeaterOn) {
      pushLog(
        "MQTT",
        `PUBLISH ${DEVICES[2].topic}/set ${heaterOn ? `burner=${out.burner}` : "burner=0 (standby)"} qos=1`,
      );
    }
  }, [pushLog]);

  useJitterInterval(runFuzzy, 4000, 6000, live && auto);

  const toggleAuto = () => {
    const next = !autoRef.current;
    autoRef.current = next;
    setAuto(next);
    pushLog("CMD", `Smart Auto-Climate state changed to ${next ? "ON" : "OFF"}`);

    if (next) {
      pushLog(
        "FUZZY_AI",
        `Controller engaged · setpoint ${SETPOINT_C}°C · taking over ${DEVICES[2].topic}`,
      );
      // Manual heater state is ignored while the controller is in charge.
      devicesRef.current = { ...devicesRef.current, heater: false };
      setDevices(devicesRef.current);
      later(runFuzzy, 700);
    } else {
      fuzzyRef.current = null;
      setFuzzy(null);
      devicesRef.current = { ...devicesRef.current, heater: false };
      setDevices(devicesRef.current);
      pushLog("FUZZY_AI", "Controller released · heater returned to manual (OFF)");
    }
  };

  const toggleDevice = (id: DeviceId) => {
    if (id === "heater" && autoRef.current) return; // managed by Auto-Climate
    const device = DEVICES.find((d) => d.id === id)!;
    const next = !devicesRef.current[id];
    devicesRef.current = { ...devicesRef.current, [id]: next };
    setDevices(devicesRef.current);
    setPending((p) => ({ ...p, [id]: true }));
    pushLog("CMD", `${device.name} state changed to ${next ? "ON" : "OFF"}`);

    const rtt = Math.round(rand(180, 650));
    later(() => {
      setPending((p) => ({ ...p, [id]: false }));
      pushLog("MQTT", `ACK ${device.topic}=${next ? 1 : 0} · ${rtt}ms · load now ${currentDraw()}W`);
    }, rtt);
  };

  useEffect(() => {
    const el = terminalRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
    }
  }, [logs, reduced]);

  const drawW = powerDraw(data.baseLoadW, devices, auto, fuzzy);
  const netW = data.solarW - drawW;
  const batteryV = batteryVoltage(data.socPct, netW);
  const heaterW = heaterWatts(devices, auto, fuzzy);
  const heaterOn = heaterW > 0;
  const full = data.socPct >= 99.95 && netW >= 0;
  const estimate = full ? null : timeEstimate(data.socPct, netW);

  const status = full
    ? {
        label: "Full · Float",
        icon: BatteryFull,
        cls: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
        fill: "from-cyan-500 to-sky-400",
      }
    : netW >= 0
      ? {
          label: "Charging",
          icon: BatteryCharging,
          cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 shadow-[0_0_18px_-6px_rgba(52,211,153,0.8)]",
          fill: "from-emerald-500 to-lime-300",
        }
      : data.socPct < 20
        ? {
            label: "Discharging",
            icon: BatteryWarning,
            cls: "border-rose-400/40 bg-rose-500/10 text-rose-200 shadow-[0_0_18px_-6px_rgba(244,63,94,0.8)]",
            fill: "from-rose-600 to-orange-400",
          }
        : {
            label: "Discharging",
            icon: BatteryWarning,
            cls: "border-orange-400/40 bg-orange-500/10 text-orange-200 shadow-[0_0_18px_-6px_rgba(249,115,22,0.8)]",
            fill: "from-orange-500 to-amber-300",
          };
  const StatusIcon = status.icon;

  const historyMax = 300;

  return (
    <main className="relative isolate min-h-svh flex-1 overflow-hidden bg-[#05060a] font-sans text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 -z-10 h-[480px] w-[640px] rounded-full bg-cyan-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[420px] w-[560px] rounded-full bg-purple-600/10 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-8 flex flex-col gap-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-slate-300 backdrop-blur transition-colors hover:border-cyan-400/40 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <ArrowLeft
                className="size-4 transition-transform group-hover:-translate-x-0.5"
                aria-hidden
              />
              Back to Portfolio
            </Link>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em]",
                  paused
                    ? "border-amber-400/30 bg-amber-400/[0.06] text-amber-200"
                    : "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-200",
                )}
                role="status"
              >
                <span className="relative flex size-2">
                  {!paused && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex size-2 rounded-full",
                      paused ? "bg-amber-400" : "bg-emerald-400",
                    )}
                  />
                </span>
                {paused ? "Stream paused" : "Live Connection"}
              </span>
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Resume live stream" : "Pause live stream"}
                className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">
                {"// Case study · Edge IoT"}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-500 bg-clip-text text-transparent">
                  VictoriaCamp-IT
                </span>
                <span className="text-slate-500">:</span> IoT Telemetry
              </h1>
            </div>
            <dl className="grid grid-cols-3 gap-2 font-mono text-[11px] sm:gap-3">
              {[
                { k: "Unit", v: "VC-07 Sprinter" },
                { k: "Local time", v: clock ?? "--:--:--" },
                { k: "Packets", v: packets.toLocaleString("en-GB") },
              ].map(({ k, v }) => (
                <div
                  key={k}
                  className="rounded-lg border border-white/[0.07] bg-black/30 px-3 py-2"
                >
                  <dt className="uppercase tracking-wider text-slate-500">{k}</dt>
                  <dd className="mt-0.5 tabular-nums text-slate-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.header>

        <motion.div
          variants={gridStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5"
        >
          <Panel className="lg:col-span-4">
            <PanelHeader
              icon={Sun}
              title="Solar yield"
              iconClass="text-amber-300"
              meta={<MetaLabel>MPPT · every 3–7s</MetaLabel>}
            />
            <Dial value={data.solarW} min={0} max={300} from="#fbbf24" to="#f97316">
              <Sun className="mb-1 size-4 text-amber-300/80" aria-hidden />
              <p className="font-mono text-3xl font-semibold text-slate-50">
                <LiveNumber value={data.solarW} />
                <span className="ml-0.5 text-base text-slate-400">W</span>
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                of 300W peak
              </p>
            </Dial>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Stat icon={Zap} label="Current">
                {(data.solarW / 13.1).toFixed(1)} A
              </Stat>
              <Stat icon={Activity} label="Today">
                1.42 kWh
              </Stat>
            </div>
          </Panel>

          <Panel className="lg:col-span-4">
            <PanelHeader
              icon={StatusIcon}
              title="House battery"
              iconClass={netW >= 0 ? "text-emerald-300" : "text-orange-300"}
              meta={
                <motion.span
                  key={status.label + (data.socPct < 20 ? "-low" : "")}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider",
                    status.cls,
                  )}
                  role="status"
                >
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-current" />
                  </span>
                  {status.label}
                </motion.span>
              }
            />
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-5xl font-semibold tracking-tight text-slate-50">
                  <SpringNumber value={batteryV} decimals={2} />
                  <span className="ml-1 text-xl text-slate-400">V</span>
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  LiFePO₄ · 200Ah · {V_MIN}–{V_MAX}V
                </p>
              </div>
              <p
                className={cn(
                  "font-mono text-3xl font-semibold",
                  netW >= 0 ? "text-emerald-300" : data.socPct < 20 ? "text-rose-300" : "text-orange-300",
                )}
              >
                <SpringNumber value={data.socPct} decimals={1} />
                <span className="text-lg">%</span>
              </p>
            </div>

            <div className="mt-6 flex items-center gap-1.5">
              <div className="relative h-14 flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1.5">
                <div className="relative h-full overflow-hidden rounded-lg">
                  <motion.div
                    className={cn("absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r", status.fill)}
                    initial={false}
                    animate={{ width: `${data.socPct}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 20 }}
                    style={{ boxShadow: "0 0 18px -2px currentColor" }}
                  >
                    {netW > 0 && !full && !reduced && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "300%" }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </motion.div>
                  {Array.from({ length: 9 }, (_, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className="absolute inset-y-0 w-[3px] bg-[#05060a]/80"
                      style={{ left: `${(i + 1) * 10}%` }}
                    />
                  ))}
                </div>
              </div>
              <span className="h-6 w-1.5 rounded-r-md bg-white/15" aria-hidden />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Stat icon={Gauge} label="Net flow">
                <span className={netW >= 0 ? "text-emerald-300" : "text-orange-300"}>
                  <SpringNumber value={netW} signed /> W
                </span>
              </Stat>
              <Stat icon={Plug} label="Draw">
                <SpringNumber value={drawW} /> W
              </Stat>
            </div>
            <p className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-slate-500">
              <span className="flex items-center gap-1.5">
                <Timer className="size-3" aria-hidden />
                {full
                  ? "Pack full"
                  : estimate
                    ? `≈ ${estimate} to ${netW >= 0 ? "full" : "empty"}`
                    : "Balanced"}
              </span>
              <span>time-lapse ×{SIM_SPEED}</span>
            </p>
          </Panel>

          <Panel className="md:col-span-2 lg:col-span-4">
            <PanelHeader
              icon={Thermometer}
              title="Internal climate"
              iconClass="text-purple-300"
              meta={<MetaLabel>every 15–20s</MetaLabel>}
            />
            <div className="grid grid-cols-2 gap-4">
              <Dial value={data.tempC} min={0} max={30} from="#22d3ee" to="#a855f7" size={140}>
                <Thermometer className="mb-1 size-4 text-purple-300/80" aria-hidden />
                <p className="font-mono text-2xl font-semibold text-slate-50">
                  <LiveNumber value={data.tempC} decimals={1} />
                  <span className="text-sm text-slate-400">°C</span>
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Cabin
                </p>
              </Dial>
              <Dial value={data.humidityPct} min={0} max={100} from="#38bdf8" to="#22d3ee" size={140}>
                <Droplet className="mb-1 size-4 text-sky-300/80" aria-hidden />
                <p className="font-mono text-2xl font-semibold text-slate-50">
                  <LiveNumber value={data.humidityPct} />
                  <span className="text-sm text-slate-400">%</span>
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Humidity
                </p>
              </Dial>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Stat icon={Wind} label="Heater">
                <span className={heaterOn ? "text-orange-300" : "text-slate-400"}>
                  {auto
                    ? `Auto · ${fuzzy?.burner ?? 0}%`
                    : heaterOn
                      ? "Heating"
                      : "Standby"}
                </span>
              </Stat>
              <Stat icon={Snowflake} label="Outside">
                <LiveNumber value={data.extC} decimals={1} /> °C
              </Stat>
            </div>
          </Panel>

          <Panel className="lg:col-span-4">
            <PanelHeader
              icon={Power}
              title="Remote control"
              iconClass="text-pink-300"
              meta={<MetaLabel>MQTT · qos 1</MetaLabel>}
            />

            <div className="mb-4 rounded-xl border border-white/[0.07] bg-black/30 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Current power draw
                  </p>
                  <p className="mt-1 font-mono text-4xl font-semibold text-slate-50">
                    <SpringNumber value={drawW} />
                    <span className="ml-1 text-lg text-slate-400">W</span>
                  </p>
                </div>
                <p className="text-right font-mono text-xs text-slate-500">
                  ≈ {(drawW / 12.8).toFixed(1)} A
                  <br />
                  <span className={netW >= 0 ? "text-emerald-400/80" : "text-orange-400/90"}>
                    solar {netW >= 0 ? "covers" : "short by"} {Math.abs(netW)}W
                  </span>
                </p>
              </div>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.span
                  className="h-full bg-slate-400/70"
                  initial={false}
                  animate={{ width: `${(data.baseLoadW / DRAW_SCALE_W) * 100}%` }}
                  transition={VALUE_SPRING}
                  title={`Base load ${data.baseLoadW}W`}
                />
                {DEVICES.map((d) => {
                  const w = d.id === "heater" ? heaterW : devices[d.id] ? d.watts : 0;
                  return (
                    <motion.span
                      key={d.id}
                      className={cn("h-full", d.tone.bar)}
                      initial={false}
                      animate={{ width: `${(w / DRAW_SCALE_W) * 100}%` }}
                      transition={VALUE_SPRING}
                      title={`${d.name} ${w}W`}
                    />
                  );
                })}
              </div>
              <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                <Refrigerator className="size-3" aria-hidden />
                base load (fridge, router, gateway) {data.baseLoadW}W
              </p>
            </div>

            <div
              className={cn(
                "relative mb-3 overflow-hidden rounded-xl border p-3.5 transition-colors duration-500",
                auto
                  ? "border-fuchsia-400/40 bg-fuchsia-500/[0.07] shadow-[0_0_30px_-12px_rgba(217,70,239,0.8)]"
                  : "border-white/[0.08] bg-black/25",
              )}
            >
              {auto && !reduced && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-fuchsia-400/10 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "250%" }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                />
              )}
              <div className="relative flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg border transition-colors duration-300",
                    auto
                      ? "border-fuchsia-300/40 bg-black/40 text-fuchsia-300"
                      : "border-white/10 bg-black/30 text-slate-500",
                  )}
                >
                  <BrainCircuit className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    Smart Auto-Climate
                  </p>
                  <p className="truncate font-mono text-[10px] text-slate-500">
                    Fuzzy logic · target {SETPOINT_C}°C · drives heater
                  </p>
                </div>
                <Toggle
                  checked={auto}
                  onChange={toggleAuto}
                  label="Smart Auto-Climate"
                  track="from-fuchsia-500 to-violet-500"
                  glow="shadow-[0_0_22px_-4px_rgba(217,70,239,0.8)]"
                />
              </div>

              {auto && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="relative overflow-hidden"
                >
                  <div className="mt-3 space-y-2.5 border-t border-fuchsia-400/15 pt-3">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                      <span className="text-slate-500">Fuzzy set</span>
                      <span className="rounded bg-fuchsia-500/15 px-1.5 py-0.5 text-fuchsia-200">
                        {fuzzy ? `${fuzzy.set} · μ ${fuzzy.mu[fuzzy.set].toFixed(2)}` : "evaluating…"}
                      </span>
                    </div>
                    <Meter label="Burner" value={fuzzy?.burner ?? 0} icon={Flame} bar="bg-gradient-to-r from-orange-500 to-rose-400" />
                    <Meter label="Fan" value={fuzzy?.fan ?? 0} icon={Fan} bar="bg-gradient-to-r from-sky-500 to-cyan-300" />
                  </div>
                </motion.div>
              )}
            </div>

            <ul className="space-y-2">
              {DEVICES.map((d) => {
                const Icon = d.icon;
                const managed = d.id === "heater" && auto;
                const on = d.id === "heater" ? heaterOn : devices[d.id];
                const watts = d.id === "heater" && auto ? heaterW : d.watts;
                return (
                  <li
                    key={d.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors duration-300",
                      on ? "border-white/15 bg-white/[0.04]" : "border-white/[0.06] bg-black/25",
                    )}
                    title={managed ? "Managed by Smart Auto-Climate" : undefined}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-lg border transition-colors duration-300",
                        on
                          ? cn("border-white/15 bg-black/40", d.tone.text)
                          : "border-white/10 bg-black/30 text-slate-500",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{d.name}</p>
                      <p className="truncate font-mono text-[10px] text-slate-500">
                        {managed ? "managed by Auto-Climate" : d.detail} · {on || !managed ? `+${watts}W` : "0W"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "w-9 text-right font-mono text-[10px] font-semibold uppercase",
                        managed ? "text-fuchsia-300" : on ? d.tone.text : "text-slate-600",
                      )}
                    >
                      {managed ? "Auto" : on ? "On" : "Off"}
                    </span>
                    <Toggle
                      checked={on}
                      pending={pending[d.id]}
                      disabled={managed}
                      onChange={() => toggleDevice(d.id)}
                      label={d.name}
                      track={d.tone.track}
                      glow={d.tone.glow}
                    />
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel className="md:col-span-2 lg:col-span-8">
            <PanelHeader
              icon={Activity}
              title={`Solar output · last ${HISTORY_LENGTH} readings`}
              iconClass="text-amber-300"
              meta={<MetaLabel>max 300W</MetaLabel>}
            />
            <div className="relative h-48 sm:h-64">
              {[100, 200, 300].map((w) => (
                <div
                  key={w}
                  className="absolute inset-x-0 flex items-center gap-2"
                  style={{ bottom: `${(w / historyMax) * 100}%` }}
                >
                  <span className="w-9 shrink-0 text-right font-mono text-[10px] text-slate-600">
                    {w}W
                  </span>
                  <span className="h-px flex-1 border-t border-dashed border-white/[0.07]" />
                </div>
              ))}
              <motion.div
                aria-hidden
                className="absolute left-11 right-0 z-10 border-t border-dashed border-orange-400/70"
                initial={false}
                animate={{ bottom: `${clamp(drawW / historyMax, 0, 1) * 100}%` }}
                transition={VALUE_SPRING}
              >
                <span className="absolute -top-4 right-0 font-mono text-[10px] text-orange-300/90">
                  draw {drawW}W
                </span>
              </motion.div>
              <div className="absolute inset-y-0 left-11 right-0 flex items-end gap-[3px] sm:gap-1">
                {history.map((w, i) => {
                  const latest = i === history.length - 1;
                  return (
                    <motion.div
                      key={i}
                      className={cn(
                        "flex-1 rounded-t-[3px] bg-gradient-to-t",
                        latest
                          ? "from-amber-500 to-yellow-300 shadow-[0_0_16px_-2px_rgba(251,191,36,0.8)]"
                          : "from-amber-500/30 to-amber-300/60",
                      )}
                      initial={false}
                      animate={{ height: `${(w / historyMax) * 100}%` }}
                      transition={VALUE_SPRING}
                    />
                  );
                })}
              </div>
            </div>
          </Panel>

          <Panel className="lg:col-span-4">
            <PanelHeader
              icon={Droplets}
              title="Water tanks"
              iconClass="text-sky-300"
              meta={<MetaLabel>every 10s</MetaLabel>}
            />
            <div className="flex items-end justify-around gap-4">
              <Tank
                label="Fresh · 100L"
                value={data.freshPct}
                icon={Droplets}
                tone="fresh"
                trend={devices.pump ? "▼▼ pump running" : "▼ draining"}
              />
              <Tank
                label="Grey · 80L"
                value={data.greyPct}
                icon={Droplet}
                tone="grey"
                trend={devices.pump ? "▲▲ filling fast" : "▲ filling"}
              />
            </div>
          </Panel>

          <Panel className="flex flex-col !p-0 md:col-span-2 lg:col-span-8 lg:row-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] bg-black/40 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-rose-400/70" />
                <span className="size-2.5 rounded-full bg-amber-300/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                  <Terminal className="size-3.5" aria-hidden />
                  gateway@vc-07: ~/telemetry
                </span>
              </div>
              <span className="hidden font-mono text-[10px] uppercase tracking-wider text-slate-500 sm:inline">
                {auto ? (
                  <span className="text-fuchsia-300">fuzzy_ai.py running</span>
                ) : (
                  "tail -f mqtt.log"
                )}
              </span>
            </div>
            <div
              ref={terminalRef}
              role="log"
              aria-live="polite"
              aria-label="System log"
              className="h-80 overflow-y-auto bg-[#030407]/80 px-4 py-3 font-mono text-[12px] leading-relaxed lg:h-auto lg:min-h-0 lg:flex-1"
            >
              {logs.map((line) => (
                <motion.p
                  key={line.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "whitespace-pre-wrap break-words",
                    ROW_HIGHLIGHT[line.tag] && cn("-mx-2 rounded px-2", ROW_HIGHLIGHT[line.tag]),
                  )}
                >
                  <span className="text-slate-600">{line.time} </span>
                  <span className="text-slate-500">&gt; </span>
                  <span className={TAG_STYLE[line.tag]}>[{line.tag}]</span>{" "}
                  <span className={ROW_HIGHLIGHT[line.tag] ? "text-slate-100" : "text-slate-300"}>
                    {line.text}
                  </span>
                </motion.p>
              ))}
              <p className="mt-1 text-slate-500">
                &gt;{" "}
                <span className="inline-block h-3.5 w-2 translate-y-0.5 animate-pulse bg-cyan-300/80" />
              </p>
            </div>
          </Panel>

          <Panel className="lg:col-span-4">
            <PanelHeader icon={Cpu} title="Edge gateway" />
            <div className="space-y-2">
              <Stat icon={Radio} label="MQTT latency">
                <span className={data.latencyMs > 40 ? "text-amber-300" : "text-emerald-300"}>
                  <LiveNumber value={data.latencyMs} /> ms
                </span>
              </Stat>
              <Stat icon={Signal} label="LTE signal">
                -87 dBm
              </Stat>
              <Stat icon={Cpu} label="Protocol">
                MQTT 5 · TLS
              </Stat>
              <Stat icon={MapPin} label="Location">
                Zielona Góra, PL
              </Stat>
            </div>
          </Panel>
        </motion.div>

        <p className="mt-8 text-center font-mono text-[11px] text-slate-600">
          Simulated feed for demonstration · battery runs at ×{SIM_SPEED} time-lapse ·
          production build streams over MQTT/WebSocket from an on-board edge gateway.
        </p>
      </div>
    </main>
  );
}
