"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  type Variants,
} from "framer-motion";
import {
  ArrowLeft,
  BrainCircuit,
  CalendarRange,
  Check,
  CircleCheck,
  Cog,
  Copy,
  Globe,
  Hourglass,
  LoaderCircle,
  MapPin,
  MessageCircleQuestion,
  RotateCcw,
  Send,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import BackToTop from "./BackToTop";
import {
  submitProjectRequest,
  type ProjectRequest,
} from "@/lib/submitProjectRequest";
import { useLanguage } from "@/context/LanguageContext";
import {
  translations,
  type ServiceId,
  type TimelineId,
} from "@/translations";

/* ---------------------------------- Data ---------------------------------- */

// Address shown in the "Prefer email?" card and copied by the Copy Email button.
const CONTACT_EMAIL = "dominikit32123@gmail.com";

// Labels and hints live in /translations.ts under contact.form.services / timelines.
const SERVICE_ICONS: Record<ServiceId, LucideIcon> = {
  web: Globe,
  automation: Cog,
  ai: BrainCircuit,
  other: MessageCircleQuestion,
};
const SERVICE_IDS = Object.keys(SERVICE_ICONS) as ServiceId[];

const TIMELINE_ICONS: Record<TimelineId, LucideIcon> = {
  asap: Zap,
  months: CalendarRange,
  flexible: Hourglass,
};
const TIMELINE_IDS = Object.keys(TIMELINE_ICONS) as TimelineId[];

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40, filter: "blur(4px)" }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: EASE },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -40,
    filter: "blur(4px)",
    transition: { duration: 0.25, ease: "easeIn" },
  }),
};

/* ------------------------------ Shared pieces ----------------------------- */

const glassCard =
  "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]";

function TopEdgeGlow() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
    />
  );
}

/** Wraps children in a spring that drifts toward the cursor. */
function Magnetic({
  children,
  strength = 0.15,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useSpring(0, { stiffness: 250, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 250, damping: 18, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------- Left column ------------------------------ */

const BLIPS = [
  { top: "22%", left: "64%", delay: 0.4 },
  { top: "68%", left: "74%", delay: 1.6 },
  { top: "34%", left: "24%", delay: 2.4 },
  { top: "76%", left: "32%", delay: 3.1 },
];

function Radar({ reduced }: { reduced: boolean }) {
  return (
    <div
      aria-hidden
      className="relative mx-auto aspect-square w-full max-w-[280px]"
    >
      {/* Rings */}
      {[100, 72, 44].map((size) => (
        <span
          key={size}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/15"
          style={{ width: `${size}%`, height: `${size}%` }}
        />
      ))}
      {/* Crosshair */}
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent" />

      {/* Rotating sweep */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(34,211,238,0.35), rgba(34,211,238,0.08) 50deg, transparent 90deg)",
          maskImage: "radial-gradient(circle, black 0%, black 70%, transparent 71%)",
          WebkitMaskImage:
            "radial-gradient(circle, black 0%, black 70%, transparent 71%)",
        }}
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
      />

      {/* Outgoing pings */}
      {!reduced &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 size-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/50"
            initial={{ scale: 0.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{
              duration: 3,
              ease: "easeOut",
              repeat: Infinity,
              delay: i,
            }}
          />
        ))}

      {/* Remote "clients" lighting up */}
      {BLIPS.map((b) => (
        <motion.span
          key={`${b.top}-${b.left}`}
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-300 shadow-[0_0_12px_3px_rgba(168,85,247,0.7)]"
          style={{ top: b.top, left: b.left }}
          initial={{ opacity: reduced ? 0.8 : 0 }}
          animate={reduced ? undefined : { opacity: [0, 1, 0.2, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: b.delay,
            times: [0, 0.1, 0.6, 1],
          }}
        />
      ))}

      {/* Home base */}
      <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-300/50 bg-[#05060a] shadow-[0_0_30px_-4px_rgba(34,211,238,0.7)]">
        <span className="font-mono text-xs font-semibold tracking-wider text-cyan-200">
          PL
        </span>
      </span>
    </div>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts / older browsers.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

function RemoteCard({ reduced }: { reduced: boolean }) {
  const { t } = useLanguage();
  const rc = t.contact.remote;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    if (!(await copyText(CONTACT_EMAIL))) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  };

  return (
    <motion.div
      variants={fadeUp}
      className={cn(glassCard, "flex h-full flex-col p-6 sm:p-8")}
    >
      <TopEdgeGlow />
      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          {rc.badge}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
          <MapPin className="size-3.5 text-cyan-300" aria-hidden />
          {rc.location}
        </span>
      </div>

      <Radar reduced={reduced} />

      <div className="mt-8">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-100">
          {rc.titleStart}{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
            {rc.titleAccent}
          </span>
        </h3>
        <p className="mt-3 leading-relaxed text-slate-400">
          {rc.text}
        </p>
      </div>

      <div className="mt-auto pt-8">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
          {rc.emailPrompt}
        </p>
        <Magnetic strength={0.2} className="w-full">
          <button
            type="button"
            onClick={handleCopy}
            aria-live="polite"
            className={cn(
              "group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
              copied
                ? "border-emerald-400/50 bg-emerald-400/[0.08] shadow-[0_0_24px_-6px_rgba(52,211,153,0.6)]"
                : "border-white/10 bg-black/30 hover:border-cyan-400/40 hover:bg-cyan-400/[0.05]",
            )}
          >
            <span className="truncate font-mono text-sm text-slate-200">
              {CONTACT_EMAIL}
            </span>
            <span className="relative flex h-6 min-w-24 shrink-0 items-center justify-end overflow-hidden whitespace-nowrap">
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="copied"
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300"
                  >
                    <Check className="size-4" aria-hidden />
                    {rc.copied}
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 group-hover:text-cyan-200"
                  >
                    <Copy className="size-4" aria-hidden />
                    {rc.copy}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        </Magnetic>
      </div>
    </motion.div>
  );
}

/* ------------------------------ Right column ------------------------------ */

function OptionTile({
  icon: Icon,
  label,
  hint,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Magnetic className="h-full">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "group relative flex h-full w-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          selected
            ? "border-cyan-400/60 bg-cyan-400/[0.08] shadow-[0_0_28px_-6px_rgba(34,211,238,0.55)]"
            : "border-white/[0.08] bg-black/20 hover:border-cyan-400/30 hover:bg-white/[0.04] hover:shadow-[0_0_24px_-10px_rgba(34,211,238,0.5)]",
        )}
      >
        <span
          className={cn(
            "grid size-10 place-items-center rounded-lg border transition-colors duration-300",
            selected
              ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-200"
              : "border-white/10 bg-white/[0.03] text-slate-300 group-hover:text-cyan-200",
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <span>
          <span className="block font-semibold text-slate-100">
            {label}
          </span>
          <span className="mt-0.5 block text-xs text-slate-400">
            {hint}
          </span>
        </span>
        {selected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-cyan-400 text-[#05060a]"
          >
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
          </motion.span>
        )}
      </button>
    </Magnetic>
  );
}

function StepHeader({
  step,
  steps,
  label: groupLabel,
}: {
  step: number;
  steps: string[];
  label: string;
}) {
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label={groupLabel}>
      {steps.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={i} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[11px] transition-all duration-500",
                done && "border-cyan-400/60 bg-cyan-400 text-[#05060a]",
                active &&
                  "border-cyan-300 text-cyan-200 shadow-[0_0_14px_-2px_rgba(34,211,238,0.8)]",
                !done && !active && "border-white/15 text-slate-500",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden font-mono text-[10px] uppercase tracking-[0.2em] sm:inline",
                active ? "text-slate-200" : "text-slate-500",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="relative h-px flex-1 overflow-hidden bg-white/10">
                <motion.span
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-purple-500"
                  initial={false}
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors duration-300 focus:border-cyan-400/60 focus:bg-cyan-400/[0.03] focus:outline-none focus:shadow-[0_0_20px_-8px_rgba(34,211,238,0.7)]";

type Status = "idle" | "sending" | "success" | "error";

function ProjectConfigurator() {
  const { t } = useLanguage();
  const f = t.contact.form;
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [service, setService] = useState<ServiceId | null>(null);
  const [timeline, setTimeline] = useState<TimelineId | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  // Select a tile, let the glow register for a beat, then move on.
  const pick = <T,>(setter: (v: T) => void, value: T, next: number) => {
    setter(value);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => goTo(next), 320);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!service || !timeline || status === "sending") return;
    // Always send English labels so incoming requests read the same
    // whichever language the visitor used.
    const en = translations.en.contact.form;
    const payload: ProjectRequest = {
      service: en.services[service].label,
      timeline: en.timelines[timeline].label,
      name: name.trim(),
      email: email.trim(),
      details: details.trim(),
    };
    setStatus("sending");
    try {
      await submitProjectRequest(payload);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setService(null);
    setTimeline(null);
    setName("");
    setEmail("");
    setDetails("");
    setStatus("idle");
    setDirection(-1);
    setStep(0);
  };

  return (
    <motion.div
      variants={fadeUp}
      className={cn(glassCard, "flex h-full flex-col p-6 sm:p-8")}
    >
      <TopEdgeGlow />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-purple-600/15 blur-3xl"
      />

      <div className="relative mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
          {f.eyebrow}
        </p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">
          {f.title}
        </h3>
      </div>

      <div className="relative flex-1">
        <AnimatePresence mode="wait" initial={false}>
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex h-full flex-col items-center justify-center py-10 text-center"
              role="status"
            >
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                className="grid size-16 place-items-center rounded-full border border-emerald-400/50 bg-emerald-400/10 text-emerald-300 shadow-[0_0_40px_-6px_rgba(52,211,153,0.7)]"
              >
                <CircleCheck className="size-8" strokeWidth={1.75} />
              </motion.span>
              <h4 className="mt-6 text-xl font-semibold text-slate-100">
                {f.successTitle(name.trim().split(" ")[0] ?? "")}
              </h4>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                {f.successBefore}
                <span className="text-cyan-200">
                  {service ? f.services[service].label : ""}
                </span>
                {f.successAfter}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-8 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-cyan-200"
              >
                <RotateCcw className="size-4" aria-hidden />
                {f.restart}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.25 } }}
            >
              <StepHeader step={step} steps={f.steps} label={f.progressLabel} />

              <AnimatePresence mode="wait" custom={direction} initial={false}>
                {step === 0 && (
                  <motion.div
                    key="step-service"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <h4 className="mb-4 text-lg font-medium text-slate-200">
                      {f.serviceQuestion}
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {SERVICE_IDS.map((id) => (
                        <OptionTile
                          key={id}
                          icon={SERVICE_ICONS[id]}
                          label={f.services[id].label}
                          hint={f.services[id].hint}
                          selected={service === id}
                          onSelect={() => pick(setService, id, 1)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step-timeline"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <h4 className="mb-4 text-lg font-medium text-slate-200">
                      {f.timelineQuestion}
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {TIMELINE_IDS.map((id) => (
                        <OptionTile
                          key={id}
                          icon={TIMELINE_ICONS[id]}
                          label={f.timelines[id].label}
                          hint={f.timelines[id].hint}
                          selected={timeline === id}
                          onSelect={() => pick(setTimeline, id, 2)}
                        />
                      ))}
                    </div>
                    <BackButton label={f.back} onClick={() => goTo(0)} />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.form
                    key="step-details"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    onSubmit={onSubmit}
                    className="space-y-4"
                  >
                    <h4 className="text-lg font-medium text-slate-200">
                      {f.detailsTitle}
                    </h4>

                    {/* Summary */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          label: service ? f.services[service].label : "",
                          edit: 0,
                          icon: service ? SERVICE_ICONS[service] : undefined,
                        },
                        {
                          label: timeline ? f.timelines[timeline].label : "",
                          edit: 1,
                          icon: timeline ? TIMELINE_ICONS[timeline] : undefined,
                        },
                      ].map(({ label, edit, icon: Icon }) => (
                        <button
                          key={edit}
                          type="button"
                          onClick={() => goTo(edit)}
                          title={f.change}
                          className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-medium text-cyan-100 transition-colors hover:border-cyan-300/60"
                        >
                          {Icon && <Icon className="size-3.5" aria-hidden />}
                          {label}
                          <span className="text-cyan-300/60">· {f.edit}</span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-400">
                          {f.name}
                        </span>
                        <input
                          required
                          name="name"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={f.namePlaceholder}
                          className={inputClass}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-400">
                          {f.email}
                        </span>
                        <input
                          required
                          type="email"
                          name="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={f.emailPlaceholder}
                          className={inputClass}
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-400">
                        {f.details}
                      </span>
                      <textarea
                        required
                        name="details"
                        rows={4}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder={f.detailsPlaceholder}
                        className={cn(inputClass, "resize-none")}
                      />
                    </label>

                    {status === "error" && (
                      <p role="alert" className="text-sm text-rose-300">
                        {f.error}
                      </p>
                    )}

                    <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <BackButton label={f.back} onClick={() => goTo(1)} inline />
                      <Magnetic strength={0.25}>
                        <button
                          type="submit"
                          disabled={status === "sending"}
                          className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] disabled:cursor-wait sm:w-auto"
                        >
                          <span
                            aria-hidden
                            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-40 blur-lg transition-opacity duration-300 group-hover:opacity-80 group-disabled:opacity-30"
                          />
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600"
                          />
                          <span className="relative flex items-center gap-2">
                            {status === "sending" ? (
                              <>
                                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                                {f.sending}
                              </>
                            ) : (
                              <>
                                {f.send}
                                <Send className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                              </>
                            )}
                          </span>
                        </button>
                      </Magnetic>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function BackButton({
  label,
  onClick,
  inline = false,
}: {
  label: string;
  onClick: () => void;
  inline?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:text-cyan-200",
        !inline && "mt-5",
      )}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {label}
    </button>
  );
}

/* --------------------------------- Section -------------------------------- */

export default function ContactSection() {
  const reduced = useReducedMotion() ?? false;
  const { t } = useLanguage();
  const c = t.contact;
  const initial = reduced ? "show" : "hidden";

  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden px-4 py-24 sm:px-6 sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-600/15 blur-3xl"
      />

      <div className="mx-auto max-w-6xl">
        <motion.header
          variants={stagger}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-14 flex flex-col items-start gap-4 sm:mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300/80"
          >
            {c.eyebrow}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold tracking-tight text-slate-100 sm:text-5xl"
          >
            {c.titleStart}{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-purple-500 bg-clip-text text-transparent">
              {c.titleAccent}
            </span>
            {c.titleEnd}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="max-w-2xl text-slate-400"
          >
            {c.intro}
          </motion.p>
        </motion.header>

        <motion.div
          variants={stagger}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6"
        >
          <div className="lg:col-span-5">
            <RemoteCard reduced={reduced} />
          </div>
          <div className="lg:col-span-7">
            <ProjectConfigurator />
          </div>
        </motion.div>

        <BackToTop />
      </div>
    </section>
  );
}
