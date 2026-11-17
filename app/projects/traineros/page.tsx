"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  Check,
  BedDouble,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Clock,
  Dumbbell,
  Flame,
  HeartPulse,
  History,
  LoaderCircle,
  Lock,
  LogOut,
  Moon,
  NotebookPen,
  Pencil,
  Quote,
  RotateCcw,
  Save,
  Scale,
  Search,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Trophy,
  User as UserIcon,
  Users,
  type LucideIcon,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Role = "trainer" | "client";

interface User {
  id: string;
  role: Role;
  name: string;
  avatar: string;
}

interface ClientStats {
  /** Body weight in kilograms. */
  weight: number;
}

type Readiness = "god-mode" | "solid" | "drained";

interface SessionReport {
  day: string;
  title: string;
  readiness: Readiness;
  note?: string;
}

interface Exercise {
  name: string;
  sets: number;
  targetReps: number;
  /** Working weight in kilograms (0 for bodyweight). */
  targetWeight: number;
}

interface WorkoutPlan {
  id: string;
  /** References `User.id` of a user with role "client". */
  clientId: User["id"];
  title: string;
  day: string;
  exercises: Exercise[];
}

interface LiftRecord {
  lift: string;
  /** Estimated one-rep max now and at the start of the block, in kg. */
  current1RM: number;
  previous1RM: number;
}

interface ClientRecord {
  user: User;
  stats: ClientStats;
  goal: string;
  microcycle: WorkoutPlan[];
  performance: LiftRecord[];
  sessionsDone: number;
  sessionsPlanned: number;
  /** Weekly weigh-ins, oldest first, in kg. */
  bodyweightTrend: number[];
  lastCheckIn: string;
  /** Most recent first. */
  recentSessions: SessionReport[];
  status: "on-track" | "attention";
}

const READINESS: {
  id: Readiness;
  emoji: string;
  label: string;
  hint: string;
  active: string;
}[] = [
  {
    id: "god-mode",
    emoji: "⚡",
    label: "God Mode",
    hint: "Bar moved fast",
    active:
      "border-lime-400 bg-lime-400/15 text-lime-200 shadow-[0_0_0_1px_#a3e635,0_0_24px_-4px_#a3e635]",
  },
  {
    id: "solid",
    emoji: "🟢",
    label: "Solid",
    hint: "Normal session",
    active:
      "border-emerald-400 bg-emerald-400/10 text-emerald-200 shadow-[0_0_0_1px_#34d399,0_0_20px_-6px_#34d399]",
  },
  {
    id: "drained",
    emoji: "🔴",
    label: "Drained/Heavy",
    hint: "Everything felt heavy",
    active:
      "border-red-500 bg-red-500/15 text-red-200 shadow-[0_0_0_1px_#ef4444,0_0_24px_-4px_#ef4444]",
  },
];

const COACH: User = {
  id: "u-coach-01",
  role: "trainer",
  name: "Dominik R.",
  avatar: "/avatars/coach.png",
};

const ex = (name: string, sets: number, targetReps: number, targetWeight: number): Exercise => ({
  name,
  sets,
  targetReps,
  targetWeight,
});

const CLIENTS: ClientRecord[] = [
  {
    user: { id: "u-ath-dawid", role: "client", name: "Dawid K.", avatar: "/avatars/dawid.png" },
    stats: { weight: 85 },
    goal: "Strength block · Bench 130 kg",
    microcycle: [
      {
        id: "wp-dawid-1",
        clientId: "u-ath-dawid",
        title: "Heavy Push",
        day: "Mon",
        exercises: [
          ex("Barbell Bench Press", 4, 6, 100),
          ex("Incline DB Press", 3, 10, 32),
          ex("Weighted Dip", 3, 8, 20),
        ],
      },
      {
        id: "wp-dawid-2",
        clientId: "u-ath-dawid",
        title: "Heavy Pull",
        day: "Wed",
        exercises: [
          ex("Deadlift", 3, 5, 180),
          ex("Barbell Row", 4, 8, 90),
          ex("Weighted Pull-up", 4, 6, 20),
        ],
      },
      {
        id: "wp-dawid-3",
        clientId: "u-ath-dawid",
        title: "Legs",
        day: "Fri",
        exercises: [
          ex("Back Squat", 5, 5, 145),
          ex("Romanian Deadlift", 3, 8, 130),
          ex("Bulgarian Split Squat", 3, 10, 30),
        ],
      },
    ],
    performance: [
      { lift: "Bench Press", current1RM: 120, previous1RM: 115 },
      { lift: "Back Squat", current1RM: 170, previous1RM: 160 },
      { lift: "Deadlift", current1RM: 210, previous1RM: 200 },
      { lift: "Overhead Press", current1RM: 72.5, previous1RM: 70 },
    ],
    sessionsDone: 11,
    sessionsPlanned: 12,
    bodyweightTrend: [83.2, 83.6, 84.0, 84.1, 84.5, 84.7, 84.9, 85.0],
    lastCheckIn: "Today · 07:42",
    recentSessions: [
      { day: "Fri", title: "Legs", readiness: "god-mode" },
      { day: "Wed", title: "Heavy Pull", readiness: "solid", note: "Grip slipping on the last deadlift set — chalk next time." },
      { day: "Mon", title: "Heavy Push", readiness: "god-mode", note: "Bench flew up. Ready for 102.5." },
    ],
    status: "on-track",
  },
  {
    user: { id: "u-ath-kasia", role: "client", name: "Kasia W.", avatar: "/avatars/kasia.png" },
    stats: { weight: 62.4 },
    goal: "Recomp · lower-body focus",
    microcycle: [
      {
        id: "wp-kasia-1",
        clientId: "u-ath-kasia",
        title: "Lower Strength",
        day: "Tue",
        exercises: [ex("Back Squat", 4, 6, 70), ex("Hip Thrust", 4, 10, 100), ex("Romanian Deadlift", 3, 8, 65)],
      },
      {
        id: "wp-kasia-2",
        clientId: "u-ath-kasia",
        title: "Upper Volume",
        day: "Thu",
        exercises: [ex("Overhead Press", 4, 8, 35), ex("Chin-up", 4, 6, 0), ex("Bench Press", 3, 10, 40)],
      },
    ],
    performance: [
      { lift: "Back Squat", current1RM: 85, previous1RM: 80 },
      { lift: "Hip Thrust", current1RM: 140, previous1RM: 125 },
      { lift: "Overhead Press", current1RM: 42.5, previous1RM: 42.5 },
    ],
    sessionsDone: 7,
    sessionsPlanned: 8,
    bodyweightTrend: [63.5, 63.3, 63.1, 62.9, 62.8, 62.6, 62.5, 62.4],
    lastCheckIn: "Yesterday · 19:10",
    recentSessions: [
      { day: "Thu", title: "Upper Volume", readiness: "solid" },
      { day: "Tue", title: "Lower Strength", readiness: "god-mode", note: "Hip thrust PR felt easy!" },
    ],
    status: "on-track",
  },
  {
    user: { id: "u-ath-marek", role: "client", name: "Marek L.", avatar: "/avatars/marek.png" },
    stats: { weight: 88.1 },
    goal: "Hypertrophy · return from injury",
    microcycle: [
      {
        id: "wp-marek-1",
        clientId: "u-ath-marek",
        title: "Full Body A",
        day: "Mon",
        exercises: [ex("Trap-Bar Deadlift", 3, 6, 140), ex("Incline Bench Press", 4, 8, 70), ex("Chest-Supported Row", 4, 10, 30)],
      },
      {
        id: "wp-marek-2",
        clientId: "u-ath-marek",
        title: "Full Body B",
        day: "Thu",
        exercises: [ex("Front Squat", 4, 6, 90), ex("Overhead Press", 3, 8, 50), ex("Weighted Pull-up", 3, 6, 10)],
      },
    ],
    performance: [
      { lift: "Trap-Bar Deadlift", current1RM: 185, previous1RM: 190 },
      { lift: "Incline Bench Press", current1RM: 92.5, previous1RM: 90 },
      { lift: "Front Squat", current1RM: 115, previous1RM: 115 },
    ],
    sessionsDone: 5,
    sessionsPlanned: 8,
    bodyweightTrend: [89.4, 89.0, 88.8, 88.6, 88.5, 88.3, 88.2, 88.1],
    lastCheckIn: "4 days ago",
    recentSessions: [
      { day: "Thu", title: "Full Body B", readiness: "drained", note: "Slept 5h. Lower back stiff from the start." },
      { day: "Mon", title: "Full Body A", readiness: "drained", note: "Skipped the last exercise — knee niggle again." },
    ],
    status: "attention",
  },
  {
    user: { id: "u-ath-julia", role: "client", name: "Julia S.", avatar: "/avatars/julia.png" },
    stats: { weight: 57.8 },
    goal: "Hybrid · 10K + strength",
    microcycle: [
      {
        id: "wp-julia-1",
        clientId: "u-ath-julia",
        title: "Strength",
        day: "Tue",
        exercises: [ex("Back Squat", 4, 5, 65), ex("Bench Press", 4, 6, 42.5), ex("Barbell Row", 3, 8, 40)],
      },
      {
        id: "wp-julia-2",
        clientId: "u-ath-julia",
        title: "Power",
        day: "Sat",
        exercises: [ex("Power Clean", 5, 3, 45), ex("Box Jump", 4, 5, 0), ex("Deadlift", 3, 4, 95)],
      },
    ],
    performance: [
      { lift: "Back Squat", current1RM: 80, previous1RM: 75 },
      { lift: "Deadlift", current1RM: 115, previous1RM: 110 },
      { lift: "Power Clean", current1RM: 55, previous1RM: 52.5 },
    ],
    sessionsDone: 12,
    sessionsPlanned: 12,
    bodyweightTrend: [57.6, 57.7, 57.9, 57.8, 57.7, 57.8, 57.9, 57.8],
    lastCheckIn: "Today · 06:15",
    recentSessions: [
      { day: "Sat", title: "Power", readiness: "god-mode" },
      { day: "Tue", title: "Strength", readiness: "solid" },
    ],
    status: "on-track",
  },
  {
    user: { id: "u-ath-tomasz", role: "client", name: "Tomasz B.", avatar: "/avatars/tomasz.png" },
    stats: { weight: 101.5 },
    goal: "Powerlifting · meet prep (6 wks)",
    microcycle: [
      {
        id: "wp-tomasz-1",
        clientId: "u-ath-tomasz",
        title: "Squat Day",
        day: "Mon",
        exercises: [ex("Competition Squat", 5, 3, 210), ex("Pause Squat", 3, 4, 170), ex("Leg Press", 3, 10, 260)],
      },
      {
        id: "wp-tomasz-2",
        clientId: "u-ath-tomasz",
        title: "Bench Day",
        day: "Wed",
        exercises: [ex("Competition Bench", 6, 3, 150), ex("Larsen Press", 3, 5, 125), ex("Weighted Dip", 3, 8, 40)],
      },
      {
        id: "wp-tomasz-3",
        clientId: "u-ath-tomasz",
        title: "Pull Day",
        day: "Fri",
        exercises: [ex("Deadlift", 5, 2, 250), ex("Deficit Deadlift", 3, 4, 210), ex("Barbell Row", 4, 8, 120)],
      },
    ],
    performance: [
      { lift: "Squat", current1RM: 245, previous1RM: 235 },
      { lift: "Bench Press", current1RM: 172.5, previous1RM: 170 },
      { lift: "Deadlift", current1RM: 290, previous1RM: 280 },
    ],
    sessionsDone: 9,
    sessionsPlanned: 11,
    bodyweightTrend: [100.2, 100.6, 100.9, 101.0, 101.2, 101.4, 101.3, 101.5],
    lastCheckIn: "Today · 09:30",
    recentSessions: [
      { day: "Fri", title: "Pull Day", readiness: "solid", note: "Deficit pulls brutal but moving well." },
      { day: "Wed", title: "Bench Day", readiness: "god-mode" },
      { day: "Mon", title: "Squat Day", readiness: "drained", note: "Heavy legs after Sunday's run." },
    ],
    status: "on-track",
  },
];

const COMPOUND_LIFTS =
  /squat|deadlift|bench|press|row|pull-up|chin-up|clean|dip|thrust/i;

type RoleCard = {
  role: Role;
  index: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentIcon: LucideIcon;
  features: { icon: LucideIcon; text: string }[];
  /**
   * Accent styles: volt green for coach, crimson for athlete. All literal
   * class strings so Tailwind can see them (no runtime-built class names).
   */
  tone: {
    text: string;
    glow: string;
    neon: string;
    iconNeon: string;
    titleNeon: string;
    chip: string;
    gradient: string;
    tube: string;
  };
};

const ROLE_CARDS: RoleCard[] = [
  {
    role: "trainer",
    index: "01",
    label: "Trainer Command Center",
    title: "Log in as Coach",
    description: "Manage clients, design microcycles, analyze telemetry.",
    icon: ClipboardList,
    accentIcon: Timer,
    features: [
      { icon: Users, text: "Client roster & check-ins" },
      { icon: Timer, text: "Microcycles, sets & rest timers" },
      { icon: Activity, text: "Training load & progress telemetry" },
    ],
    tone: {
      text: "text-lime-400",
      glow: "shadow-[0_0_15px_#a3e635]",
      neon: [
        "hover:border-lime-400 focus-visible:border-lime-400",
        "hover:shadow-[0_0_0_1px_#a3e635,0_0_18px_#a3e635,0_0_48px_rgba(163,230,53,0.65),0_0_110px_rgba(163,230,53,0.35),inset_0_0_36px_rgba(163,230,53,0.22)]",
        "focus-visible:shadow-[0_0_0_1px_#a3e635,0_0_18px_#a3e635,0_0_48px_rgba(163,230,53,0.65),0_0_110px_rgba(163,230,53,0.35),inset_0_0_36px_rgba(163,230,53,0.22)]",
      ].join(" "),
      iconNeon:
        "group-hover:[filter:drop-shadow(0_0_6px_#a3e635)_drop-shadow(0_0_22px_#a3e635)]",
      titleNeon:
        "group-hover:[text-shadow:0_0_6px_rgba(163,230,53,0.9),0_0_22px_rgba(163,230,53,0.7),0_0_48px_rgba(163,230,53,0.45)]",
      chip: "border-lime-400/40 bg-lime-400/10 text-lime-300",
      gradient: "from-lime-400/30",
      tube: "bg-lime-400 shadow-[0_0_12px_#a3e635,0_0_28px_#a3e635]",
    },
  },
  {
    role: "client",
    index: "02",
    label: "Athlete Tracker",
    title: "Log in as Athlete",
    description: "Track workouts, rate your readiness, log your 1RM.",
    icon: Dumbbell,
    accentIcon: Flame,
    features: [
      { icon: Dumbbell, text: "Today's session — sets, reps, load" },
      { icon: HeartPulse, text: "Readiness & notes for your coach" },
      { icon: Trophy, text: "1RM & personal records" },
    ],
    tone: {
      text: "text-red-500",
      glow: "shadow-[0_0_15px_#ef4444]",
      neon: [
        "hover:border-red-500 focus-visible:border-red-500",
        "hover:shadow-[0_0_0_1px_#ef4444,0_0_18px_#ef4444,0_0_48px_rgba(239,68,68,0.65),0_0_110px_rgba(239,68,68,0.35),inset_0_0_36px_rgba(239,68,68,0.22)]",
        "focus-visible:shadow-[0_0_0_1px_#ef4444,0_0_18px_#ef4444,0_0_48px_rgba(239,68,68,0.65),0_0_110px_rgba(239,68,68,0.35),inset_0_0_36px_rgba(239,68,68,0.22)]",
      ].join(" "),
      iconNeon:
        "group-hover:[filter:drop-shadow(0_0_6px_#ef4444)_drop-shadow(0_0_22px_#ef4444)]",
      titleNeon:
        "group-hover:[text-shadow:0_0_6px_rgba(239,68,68,0.9),0_0_22px_rgba(239,68,68,0.7),0_0_48px_rgba(239,68,68,0.45)]",
      chip: "border-red-500/40 bg-red-500/10 text-red-300",
      gradient: "from-red-500/30",
      tube: "bg-red-500 shadow-[0_0_12px_#ef4444,0_0_28px_#ef4444]",
    },
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const portalStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const cardIn: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.94, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 110, damping: 16 },
  },
};

function KnurlBackground() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 9px)",
            "repeating-linear-gradient(-45deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 9px)",
          ].join(","),
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.07) 0.8px, transparent 1.3px)",
          backgroundSize: "9px 9px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 45%, rgba(10,10,10,0.35) 20%, rgba(0,0,0,0.92) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 -z-10 h-[520px] w-[520px] rounded-full bg-lime-400/[0.08] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 -z-10 h-[520px] w-[520px] rounded-full bg-red-600/[0.09] blur-3xl"
      />
    </>
  );
}

function LoginPortal({ onSelect }: { onSelect: (role: Role) => void }) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      key="portal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)", transition: { duration: 0.45, ease: "easeIn" } }}
      className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8"
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/10 bg-black/50 px-3.5 py-2 text-sm font-semibold text-neutral-300 backdrop-blur-md transition-colors hover:border-lime-400/60 hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Back to Portfolio
        </Link>
        <span className="hidden items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 sm:inline-flex">
          <HeartPulse className="size-3.5 text-red-500" aria-hidden />
          Gym floor open · Phase 1
        </span>
      </div>

      <motion.div
        variants={portalStagger}
        initial="hidden"
        animate="show"
        className="flex flex-1 flex-col justify-center py-10 sm:py-12"
      >
        <motion.p
          variants={rise}
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-lime-400/90 sm:text-xs sm:tracking-[0.4em]"
        >
          {"// Select performance tier"}
        </motion.p>

        {/* Fluid size so the longest word always fits; words wrap as units. */}
        <motion.h1
          variants={rise}
          className="mt-4 flex min-w-0 flex-wrap items-baseline gap-x-[0.3em] text-[clamp(2rem,9vw,6.5rem)] font-black uppercase leading-[0.92] tracking-tighter text-white [overflow-wrap:anywhere]"
        >
          <span>TrainerOS</span>
          <span className="text-neutral-700">{"//"}</span>
          <span className="bg-gradient-to-r from-lime-300 via-lime-400 to-lime-500 bg-clip-text text-transparent">
            Authorization
          </span>
        </motion.h1>
        <motion.p variants={rise} className="mt-5 max-w-xl text-base text-neutral-400 sm:mt-6 sm:text-lg">
          Coach the program or run it. Pick your side of the platform.
        </motion.p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 md:grid-cols-2 lg:gap-7">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            const AccentIcon = card.accentIcon;
            return (
              <motion.button
                key={card.role}
                type="button"
                variants={cardIn}
                whileHover={reduced ? undefined : { scale: 1.03, y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                onClick={() => onSelect(card.role)}
                aria-label={`${card.title}: ${card.description}`}
                className={cn(
                  "group relative flex min-h-[380px] min-w-0 flex-col overflow-hidden rounded-[2rem] border-[3px] border-white/[0.14] bg-black/50 p-6 text-left backdrop-blur-md sm:p-9",
                  "shadow-[inset_0_2px_0_0_rgba(255,255,255,0.06),0_24px_48px_-24px_rgba(0,0,0,0.9)]",
                  "transition-[border-color,box-shadow] duration-200 focus-visible:outline-none",
                  card.tone.neon,
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-10 top-0 h-[3px] rounded-full opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100",
                    card.tone.tube,
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-gradient-to-br to-transparent opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
                    card.tone.gradient,
                  )}
                />
                <Icon
                  aria-hidden
                  strokeWidth={1.25}
                  className="pointer-events-none absolute -bottom-10 -right-10 size-64 -rotate-12 text-white/[0.035] transition-colors duration-300 group-hover:text-white/[0.07]"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "grid size-24 shrink-0 place-items-center rounded-3xl border-[3px] border-white/10 bg-neutral-950 transition-colors duration-200 sm:size-28",
                      "group-hover:border-current",
                      card.tone.text,
                    )}
                  >
                    <Icon
                      className={cn("size-12 transition-[filter] duration-200 sm:size-14", card.tone.iconNeon)}
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  </span>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]",
                        card.tone.chip,
                      )}
                    >
                      <AccentIcon className="size-3" aria-hidden />
                      <span className="hidden sm:inline">{card.label}</span>
                      <span className="sm:hidden">{card.label.split(" ")[0]}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-600">{card.index}</span>
                  </div>
                </div>

                <div className="relative mt-auto pt-10">
                  <h2
                    className={cn(
                      "text-3xl font-black uppercase leading-none tracking-tight text-white transition-[text-shadow] duration-200 sm:text-4xl",
                      card.tone.titleNeon,
                    )}
                  >
                    {card.title}
                  </h2>
                  <p className="mt-3 max-w-sm text-neutral-400">{card.description}</p>

                  <ul className="mt-6 space-y-2.5">
                    {card.features.map(({ icon: FIcon, text }) => (
                      <li key={text} className="flex items-center gap-3 text-sm font-medium text-neutral-300">
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg border-2 border-white/10 bg-black/60">
                          <FIcon className={cn("size-3.5", card.tone.text)} strokeWidth={2.5} aria-hidden />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>

                  <span
                    className={cn(
                      "mt-8 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.25em]",
                      card.tone.text,
                    )}
                  >
                    Enter
                    <ChevronRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-1.5"
                      strokeWidth={3}
                      aria-hidden
                    />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <p className="font-mono text-[11px] text-neutral-600">
        Demo environment · no credentials required · role is selected locally.
      </p>
    </motion.div>
  );
}

const pct = (value: number, target: number) =>
  target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;

const formatKg = (kg: number) => (Number.isInteger(kg) ? `${kg}` : kg.toFixed(1));

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function GlassPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-md sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

function PanelTitle({
  icon: Icon,
  title,
  meta,
}: {
  icon: LucideIcon;
  title: string;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-300">
        <span className="grid size-8 place-items-center rounded-lg border border-white/10 bg-neutral-950 text-lime-400">
          <Icon className="size-4" strokeWidth={2.25} aria-hidden />
        </span>
        {title}
      </h3>
      {meta}
    </header>
  );
}

function Ring({ value, size = 112 }: { value: number; size?: number }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#a3e635"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value / 100) }}
        transition={{ type: "spring", stiffness: 60, damping: 18 }}
        style={{ filter: "drop-shadow(0 0 6px #a3e635)" }}
      />
    </svg>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 160;
  const h = 40;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / span) * (h - 6) - 3}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={points} fill="none" stroke="#a3e635" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function RosterCard({
  client,
  selected,
  onSelect,
}: {
  client: ClientRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const compliance = pct(client.sessionsDone, client.sessionsPlanned);
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border-2 px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400",
          selected
            ? "border-lime-400 bg-lime-400/10 shadow-[0_0_0_1px_#a3e635,0_0_22px_-4px_#a3e635]"
            : "border-white/10 bg-black/40 hover:border-white/25 hover:bg-white/[0.03]",
        )}
      >
        {selected && (
          <motion.span
            layoutId="roster-indicator"
            aria-hidden
            className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-lime-400 shadow-[0_0_12px_#a3e635]"
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
          />
        )}
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl border-2 font-black tracking-tight",
            selected ? "border-lime-400/60 bg-neutral-950 text-lime-300" : "border-white/10 bg-neutral-900 text-neutral-300",
          )}
          aria-hidden
        >
          {initials(client.user.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-bold text-white">{client.user.name}</span>
            {client.status === "attention" && (
              <TriangleAlert className="size-3.5 shrink-0 text-red-500" aria-label="Needs attention" />
            )}
          </span>
          <span className="mt-0.5 block truncate text-xs text-neutral-400">{client.goal}</span>
        </span>
        <span className="text-right">
          <span
            className={cn(
              "block font-mono text-sm font-bold",
              compliance >= 85 ? "text-lime-400" : compliance >= 70 ? "text-amber-300" : "text-red-400",
            )}
          >
            {compliance}%
          </span>
          <span className="block font-mono text-[9px] uppercase tracking-wider text-neutral-500">comp.</span>
        </span>
      </button>
    </li>
  );
}

const READINESS_TONE: Record<Readiness, string> = {
  "god-mode": "border-lime-400/50 bg-lime-400/15 text-lime-200",
  solid: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  drained: "border-red-500/50 bg-red-500/15 text-red-200",
};

const readinessOf = (id: Readiness) => READINESS.find((r) => r.id === id)!;

function SessionTelemetry({ client }: { client: ClientRecord }) {
  const sessions = client.recentSessions;
  const counts = READINESS.map((r) => ({
    ...r,
    count: sessions.filter((s) => s.readiness === r.id).length,
  }));
  const drained = counts.find((c) => c.id === "drained")?.count ?? 0;
  const flagged = drained >= 2;

  return (
    <GlassPanel>
      <PanelTitle
        icon={HeartPulse}
        title="Session telemetry"
        meta={
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            last {sessions.length} sessions
          </span>
        }
      />

      <div className="grid grid-cols-3 gap-2">
        {counts.map((c) => (
          <div
            key={c.id}
            className={cn(
              "rounded-xl border-2 px-2 py-2.5 text-center",
              c.count > 0 ? READINESS_TONE[c.id] : "border-white/10 bg-neutral-950/60 text-neutral-500",
            )}
          >
            <p className="text-lg leading-none" aria-hidden>
              {c.emoji}
            </p>
            <p className="mt-1 text-2xl font-black">{c.count}</p>
            <p className="truncate font-mono text-[9px] font-bold uppercase tracking-wider opacity-80">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {flagged && (
        <p className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          {drained} of the last {sessions.length} sessions felt drained — consider a deload or a check-in call.
        </p>
      )}

      <ul className="mt-4 space-y-2.5">
        {sessions.map((s) => {
          const r = readinessOf(s.readiness);
          return (
            <li
              key={`${s.day}-${s.title}`}
              className="rounded-xl border border-white/[0.07] bg-neutral-950/60 px-3.5 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-bold text-white">
                  <span className="mr-2 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    {s.day}
                  </span>
                  {s.title}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                    READINESS_TONE[s.readiness],
                  )}
                >
                  {r.emoji} {r.label}
                </span>
              </div>
              {s.note && (
                <p className="mt-2 border-l-2 border-white/15 pl-3 text-sm italic text-neutral-300">
                  “{s.note}”
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}

function PerformanceTrends({ client }: { client: ClientRecord }) {
  const compliance = pct(client.sessionsDone, client.sessionsPlanned);
  const bwFirst = client.bodyweightTrend[0];
  const bwLast = client.bodyweightTrend[client.bodyweightTrend.length - 1];
  const bwDelta = bwLast - bwFirst;
  return (
    <GlassPanel>
      <PanelTitle
        icon={Activity}
        title="Performance trends"
        meta={<span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">4-week block</span>}
      />
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <Ring key={client.user.id} value={compliance} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-black", compliance >= 85 ? "text-lime-400" : compliance >= 70 ? "text-amber-300" : "text-red-400")}>
              {compliance}%
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">compliance</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-sm">
          <p className="flex items-center gap-2 text-neutral-300">
            <CircleCheck className="size-4 text-lime-400" aria-hidden />
            <span className="font-bold text-white">{client.sessionsDone}</span>/{client.sessionsPlanned} sessions
          </p>
          <p className="flex items-center gap-2 text-neutral-300">
            <Clock className="size-4 text-neutral-500" aria-hidden />
            Check-in: <span className="truncate text-white">{client.lastCheckIn}</span>
          </p>
          <div>
            <p className="flex items-center gap-2 text-neutral-300">
              <Scale className="size-4 text-neutral-500" aria-hidden />
              Bodyweight {formatKg(bwLast)} kg
              <span className={cn("font-mono text-xs", bwDelta >= 0 ? "text-lime-400" : "text-sky-300")}>
                ({bwDelta >= 0 ? "+" : ""}
                {bwDelta.toFixed(1)})
              </span>
            </p>
            <Sparkline values={client.bodyweightTrend} />
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
          <Trophy className="size-3.5" aria-hidden />
          Estimated 1RM
        </p>
        <ul className="space-y-2">
          {client.performance.map((l) => {
            const diff = l.current1RM - l.previous1RM;
            const Trend = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Target;
            return (
              <li key={l.lift} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-neutral-950/60 px-3 py-2">
                <span className="truncate text-sm font-semibold text-neutral-200">{l.lift}</span>
                <span className="flex shrink-0 items-center gap-3 font-mono text-sm">
                  <span className="font-bold text-white">{formatKg(l.current1RM)} kg</span>
                  <span
                    className={cn(
                      "inline-flex min-w-[4.5rem] items-center justify-end gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold",
                      diff > 0 ? "bg-lime-400/20 text-lime-300" : diff < 0 ? "bg-red-500/15 text-red-300" : "bg-white/5 text-neutral-400",
                    )}
                  >
                    <Trend className="size-3" aria-hidden />
                    {diff > 0 ? "+" : ""}
                    {formatKg(diff)} kg
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </GlassPanel>
  );
}

function MicrocyclePlanner({ client }: { client: ClientRecord }) {
  const [openId, setOpenId] = useState(client.microcycle[0]?.id);
  const [notice, setNotice] = useState(false);
  const session = client.microcycle.find((p) => p.id === openId) ?? client.microcycle[0];

  return (
    <GlassPanel className="lg:col-span-2">
      <PanelTitle
        icon={CalendarDays}
        title="Microcycle planner"
        meta={
          <button
            type="button"
            onClick={() => setNotice((n) => !n)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-white/15 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-200 transition-colors hover:border-lime-400 hover:bg-lime-400/10 hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit Protocol
          </button>
        }
      />

      {notice && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-sm text-lime-200"
          role="status"
        >
          The protocol editor ships in a later phase — loads and sets are read-only in this demo.
        </motion.p>
      )}

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Sessions this week">
        {client.microcycle.map((p, i) => {
          const active = p.id === session.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setOpenId(p.id)}
              className={cn(
                "flex shrink-0 flex-col rounded-xl border-2 px-4 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400",
                active
                  ? "border-lime-400 bg-lime-400/10 shadow-[0_0_18px_-6px_#a3e635]"
                  : "border-white/10 bg-neutral-950/60 hover:border-white/25",
              )}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                {p.day}
                {i === 0 && <span className="ml-2 text-lime-400">· next</span>}
              </span>
              <span className={cn("font-black uppercase tracking-tight", active ? "text-white" : "text-neutral-300")}>
                {p.title}
              </span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              <tr>
                <th className="px-4 py-2.5 font-bold">Exercise</th>
                <th className="px-4 py-2.5 text-right font-bold">Sets × Reps</th>
                <th className="px-4 py-2.5 text-right font-bold">Load</th>
              </tr>
            </thead>
            <tbody>
              {session.exercises.map((e) => {
                const compound = COMPOUND_LIFTS.test(e.name);
                return (
                  <tr key={e.name} className="border-t border-white/[0.06]">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-semibold text-white">
                        <Dumbbell className={cn("size-4 shrink-0", compound ? "text-lime-400" : "text-neutral-600")} aria-hidden />
                        {e.name}
                        {compound && (
                          <span className="hidden rounded border border-lime-400/30 bg-lime-400/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-lime-300 sm:inline">
                            compound
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-200">
                      {e.sets} × {e.targetReps}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      {e.targetWeight > 0 ? `${formatKg(e.targetWeight)} kg` : "BW"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          Volume ·{" "}
          {session.exercises
            .reduce((v, e) => v + e.sets * e.targetReps * e.targetWeight, 0)
            .toLocaleString("en-GB")}{" "}
          kg · {session.exercises.reduce((n, e) => n + e.sets, 0)} working sets
        </p>
      </motion.div>
    </GlassPanel>
  );
}

function TrainerDashboard({ onDisconnect }: { onDisconnect: () => void }) {
  const [clients] = useState<ClientRecord[]>(CLIENTS);
  const [selectedId, setSelectedId] = useState(CLIENTS[0].user.id);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? clients.filter((c) => c.user.name.toLowerCase().includes(q) || c.goal.toLowerCase().includes(q))
      : clients;
  }, [clients, query]);

  const selected = clients.find((c) => c.user.id === selectedId) ?? clients[0];
  const avgCompliance = Math.round(
    clients.reduce((sum, c) => sum + pct(c.sessionsDone, c.sessionsPlanned), 0) / clients.length,
  );
  const flagged = clients.filter((c) => c.status === "attention").length;

  return (
    <motion.div
      key="trainer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.5, ease: EASE }}
      className="min-h-svh"
    >
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-lime-400/60 bg-neutral-950 text-lime-400 shadow-[0_0_14px_-2px_#a3e635]">
              <ClipboardList className="size-5" strokeWidth={2.25} aria-hidden />
            </span>
            <p className="truncate text-sm font-black uppercase tracking-tight text-white sm:text-lg">
              TrainerOS <span className="text-neutral-600">{"//"}</span>{" "}
              <span className="text-lime-400">Command Center</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-2 text-sm text-neutral-400 md:flex">
              <UserIcon className="size-4" aria-hidden />
              {COACH.name}
            </span>
            <button
              type="button"
              onClick={onDisconnect}
              className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/15 px-3 py-1.5 text-sm font-bold text-neutral-200 transition-colors hover:border-red-500 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
              Disconnect
              <LogOut className="hidden size-4 sm:block" aria-hidden />
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: "Active athletes", value: String(clients.length), tone: "text-white" },
            { icon: Target, label: "Avg compliance", value: `${avgCompliance}%`, tone: "text-lime-400" },
            { icon: TriangleAlert, label: "Need attention", value: String(flagged), tone: flagged ? "text-red-400" : "text-lime-400" },
          ].map(({ icon: Icon, label, value, tone }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-black/50 px-3 py-3 backdrop-blur-md sm:px-4">
              <p className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500 sm:text-[10px]">
                <Icon className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
              </p>
              <p className={cn("mt-1 text-2xl font-black sm:text-3xl", tone)}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <GlassPanel className="flex flex-col lg:sticky lg:top-24 lg:max-h-[calc(100svh-8rem)] lg:self-start">
            <PanelTitle
              icon={Users}
              title="Client roster"
              meta={<span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{visible.length} shown</span>}
            />
            <label className="relative mb-4 block">
              <span className="sr-only">Search clients</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search athletes or goals…"
                className="w-full rounded-xl border-2 border-white/10 bg-neutral-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 focus:border-lime-400 focus:outline-none"
              />
            </label>
            <ul className="-mr-2 max-h-80 space-y-2 overflow-y-auto pr-2 lg:max-h-none lg:flex-1">
              {visible.map((c) => (
                <RosterCard
                  key={c.user.id}
                  client={c}
                  selected={c.user.id === selected.user.id}
                  onSelect={() => setSelectedId(c.user.id)}
                />
              ))}
              {visible.length === 0 && (
                <li className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-neutral-500">
                  No athletes match “{query}”.
                </li>
              )}
            </ul>
          </GlassPanel>

          <motion.div
            key={selected.user.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="min-w-0 space-y-6"
          >
            <GlassPanel>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl border-2 border-lime-400 bg-neutral-950 text-2xl font-black text-lime-300 shadow-[0_0_20px_-4px_#a3e635]">
                    {initials(selected.user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500">
                      Athlete telemetry
                    </p>
                    <h2 className="truncate text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                      {selected.user.name}
                    </h2>
                    <p className="truncate text-sm text-neutral-400">{selected.goal}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 self-start rounded-full border-2 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider sm:self-center",
                    selected.status === "on-track"
                      ? "border-lime-400/50 bg-lime-400/20 text-lime-300"
                      : "border-red-500/50 bg-red-500/15 text-red-300",
                  )}
                >
                  {selected.status === "on-track" ? (
                    <CircleCheck className="size-3.5" aria-hidden />
                  ) : (
                    <TriangleAlert className="size-3.5" aria-hidden />
                  )}
                  {selected.status === "on-track" ? "On track" : "Needs attention"}
                </span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Scale, label: "Bodyweight", value: `${formatKg(selected.stats.weight)} kg` },
                  { icon: Target, label: "Compliance", value: `${pct(selected.sessionsDone, selected.sessionsPlanned)}%` },
                  {
                    icon: Activity,
                    label: "Last feel",
                    value: (() => {
                      const last = selected.recentSessions[0];
                      return last ? `${readinessOf(last.readiness).emoji} ${readinessOf(last.readiness).label}` : "—";
                    })(),
                  },
                  { icon: HeartPulse, label: "Sessions / wk", value: String(selected.microcycle.length) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-white/[0.07] bg-neutral-950/70 px-3 py-2.5">
                    <dt className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                      <Icon className="size-3" aria-hidden />
                      {label}
                    </dt>
                    <dd className="mt-1 text-lg font-black text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </GlassPanel>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SessionTelemetry client={selected} />
              <PerformanceTrends client={selected} />
              <MicrocyclePlanner key={selected.user.id} client={selected} />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/** One set as the athlete fills it in. Inputs stay strings until logged. */
interface SetEntry {
  targetReps: number;
  actualReps: string;
  weight: string;
  done: boolean;
}

interface ExerciseEntry {
  name: string;
  targetWeight: number;
  sets: SetEntry[];
}

interface SessionLog {
  athleteId: User["id"];
  planId: WorkoutPlan["id"];
  loggedAt: string;
  readiness: Readiness | null;
  notes: string;
  exercises: {
    name: string;
    sets: { targetReps: number; actualReps: number; weight: number; done: boolean }[];
  }[];
}

const toEntries = (plan: WorkoutPlan): ExerciseEntry[] =>
  plan.exercises.map((e) => ({
    name: e.name,
    targetWeight: e.targetWeight,
    sets: Array.from({ length: e.sets }, () => ({
      targetReps: e.targetReps,
      actualReps: "",
      weight: "",
      done: false,
    })),
  }));

// Mock save: replace with a real request and throw on failure.
async function logSession(log: SessionLog): Promise<void> {
  void log;
  await new Promise((resolve) => setTimeout(resolve, 1400));
}

function SetRow({
  index,
  set,
  targetWeight,
  onChange,
}: {
  index: number;
  set: SetEntry;
  targetWeight: number;
  onChange: (patch: Partial<SetEntry>) => void;
}) {
  const toggle = () => {
    // Ticking a set with blank fields assumes it went exactly as prescribed.
    if (!set.done) {
      onChange({
        done: true,
        actualReps: set.actualReps || String(set.targetReps),
        weight: set.weight || (targetWeight > 0 ? String(targetWeight) : "0"),
      });
    } else {
      onChange({ done: false });
    }
  };

  const input =
    "h-12 w-full min-w-0 rounded-xl border-2 bg-neutral-950 px-2 text-center font-mono text-lg font-bold text-white placeholder:text-neutral-600 focus:outline-none transition-colors";

  return (
    <li
      className={cn(
        "grid grid-cols-[2rem_3.25rem_minmax(0,1fr)_minmax(0,1fr)_3rem] items-center gap-2 rounded-xl px-1 py-1.5 transition-colors duration-200 sm:grid-cols-[2.5rem_4rem_minmax(0,1fr)_minmax(0,1fr)_3.5rem] sm:gap-3",
        set.done && "bg-lime-400/[0.06]",
      )}
    >
      <span className={cn("text-center font-mono text-sm font-black", set.done ? "text-lime-400" : "text-neutral-500")}>
        {index + 1}
      </span>
      <span className="text-center font-mono text-base font-bold text-neutral-300">{set.targetReps}</span>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={`Set ${index + 1} actual reps`}
        placeholder={String(set.targetReps)}
        value={set.actualReps}
        onChange={(e) => onChange({ actualReps: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })}
        className={cn(input, set.done ? "border-lime-400/40" : "border-white/10 focus:border-lime-400")}
      />
      <input
        inputMode="decimal"
        aria-label={`Set ${index + 1} weight in kg`}
        placeholder={targetWeight > 0 ? formatKg(targetWeight) : "BW"}
        value={set.weight}
        onChange={(e) => onChange({ weight: e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".").slice(0, 6) })}
        className={cn(input, set.done ? "border-lime-400/40" : "border-white/10 focus:border-lime-400")}
      />
      <button
        type="button"
        role="checkbox"
        aria-checked={set.done}
        aria-label={`Mark set ${index + 1} complete`}
        onClick={toggle}
        className={cn(
          "grid h-12 w-full place-items-center rounded-xl border-2 transition-[background-color,border-color,box-shadow] duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
          set.done
            ? "border-lime-400 bg-lime-400 text-neutral-950 shadow-[0_0_18px_#a3e635]"
            : "border-white/15 bg-neutral-950 text-neutral-600 hover:border-lime-400/60 hover:text-lime-400",
        )}
      >
        <motion.span
          key={String(set.done)}
          initial={set.done ? { scale: 0.4, rotate: -20 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
        >
          <Check className="size-6" strokeWidth={set.done ? 3.5 : 2.5} aria-hidden />
        </motion.span>
      </button>
    </li>
  );
}

interface HistoricalSession {
  daysAgo: number;
  title: string;
  readiness: Readiness;
  durationMin: number;
  note: string;
  exercises: { name: string; sets: { weight: number; reps: number }[] }[];
}

const sets = (n: number, weight: number, reps: number) =>
  Array.from({ length: n }, () => ({ weight, reps }));

const ATHLETE_HISTORY: HistoricalSession[] = [
  {
    daysAgo: 2,
    title: "Heavy Pull",
    readiness: "solid",
    durationMin: 68,
    note: "Grip slipping on the last deadlift set — chalk next time.",
    exercises: [
      { name: "Deadlift", sets: [...sets(2, 180, 5), { weight: 180, reps: 4 }] },
      { name: "Barbell Row", sets: [...sets(3, 90, 8), { weight: 90, reps: 7 }] },
      { name: "Weighted Pull-up", sets: [...sets(2, 20, 6), ...sets(2, 20, 5)] },
    ],
  },
  {
    daysAgo: 4,
    title: "Legs",
    readiness: "god-mode",
    durationMin: 74,
    note: "Squats felt fast — 145 moved like 130. Knees 100%.",
    exercises: [
      { name: "Back Squat", sets: sets(5, 145, 5) },
      { name: "Romanian Deadlift", sets: sets(3, 130, 8) },
      { name: "Bulgarian Split Squat", sets: sets(3, 30, 10) },
    ],
  },
  {
    daysAgo: 6,
    title: "Heavy Push",
    readiness: "god-mode",
    durationMin: 61,
    note: "Bench flew up. Ready for 102.5.",
    exercises: [
      { name: "Barbell Bench Press", sets: [...sets(3, 100, 6), { weight: 100, reps: 7 }] },
      { name: "Incline DB Press", sets: sets(3, 32, 10) },
      { name: "Weighted Dip", sets: sets(3, 20, 8) },
    ],
  },
];

/** Local-date key, e.g. "2026-11-14" (not UTC, so "today" matches the user's clock). */
const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function buildLastDays(): Date[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
}

const longDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

function CalendarRibbon({
  days,
  selected,
  todayKey,
  logged,
  onSelect,
}: {
  days: Date[];
  selected: string;
  todayKey: string;
  logged: Set<string>;
  onSelect: (key: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  // Start scrolled to the end so "today" is in view on narrow screens.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const selectedDate = days.find((d) => toKey(d) === selected);

  return (
    <section aria-label="Training calendar">
      <div className="mb-3 flex items-end justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-400">
          <CalendarDays className="size-4 text-lime-400" aria-hidden />
          Last 7 days
        </p>
        <p className="truncate font-mono text-[11px] text-neutral-500">
          {selectedDate ? longDate(selectedDate) : ""}
        </p>
      </div>

      <div
        ref={scroller}
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {days.map((d) => {
          const key = toKey(d);
          const isSelected = key === selected;
          const isToday = key === todayKey;
          const hasLog = logged.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={isSelected}
              aria-label={`${longDate(d)}${isToday ? ", today" : ""}${hasLog ? ", workout logged" : ""}`}
              className={cn(
                "relative flex min-w-[3.6rem] flex-1 snap-end flex-col items-center gap-1 rounded-2xl border-2 px-2 pb-2.5 pt-2 transition-[border-color,background-color,box-shadow] duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                isSelected
                  ? "border-lime-400 bg-lime-400/15 shadow-[0_0_0_1px_#a3e635,0_0_26px_-4px_#a3e635]"
                  : isToday
                    ? "border-white/25 bg-black/50 hover:border-lime-400/60"
                    : "border-white/10 bg-black/50 hover:border-white/30",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] font-bold uppercase tracking-wider",
                  isToday ? "text-lime-400" : isSelected ? "text-lime-200" : "text-neutral-500",
                )}
              >
                {isToday ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short" })}
              </span>
              <span className={cn("text-2xl font-black leading-none", isSelected ? "text-white" : "text-neutral-300")}>
                {d.getDate()}
              </span>
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full",
                  hasLog ? "bg-lime-400 shadow-[0_0_8px_#a3e635]" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function HistoryView({ session, date }: { session: HistoricalSession; date: Date }) {
  const feel = READINESS.find((r) => r.id === session.readiness)!;
  const allSets = session.exercises.flatMap((e) => e.sets);
  const reps = allSets.reduce((n, s) => n + s.reps, 0);
  const volume = allSets.reduce((v, s) => v + s.reps * s.weight, 0);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border-2 border-white/10 bg-black/50 p-5 backdrop-blur-md sm:p-7">
        <History
          aria-hidden
          strokeWidth={1.25}
          className="pointer-events-none absolute -bottom-8 -right-8 size-40 text-white/[0.035]"
        />
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500">
          <Lock className="size-3.5" aria-hidden />
          Logged session · read-only
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl">
          {session.title}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">{longDate(date)}</p>
        <span
          className={cn(
            "mt-4 inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm font-black uppercase tracking-tight",
            feel.active,
          )}
        >
          <span aria-hidden>{feel.emoji}</span>
          {feel.label}
        </span>
        <dl className="mt-5 grid grid-cols-4 gap-2">
          {[
            { label: "Sets", value: String(allSets.length) },
            { label: "Reps", value: String(reps) },
            { label: "Volume", value: `${(volume / 1000).toFixed(1)}t` },
            { label: "Time", value: `${session.durationMin}′` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-neutral-950/70 px-2.5 py-2">
              <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500">{s.label}</dt>
              <dd className="text-lg font-black text-lime-400">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {session.exercises.map((e) => (
        <section key={e.name} className="rounded-2xl border-2 border-white/10 bg-black/40 p-4 backdrop-blur-md sm:p-5">
          <h2 className="text-lg font-black uppercase tracking-tight text-white sm:text-xl">{e.name}</h2>
          <ul className="mt-3 space-y-1.5">
            {e.sets.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-neutral-950/60 px-3 py-2"
              >
                <span className="font-mono text-xs font-bold text-neutral-500">Set {i + 1}</span>
                <span className="font-mono text-base font-bold text-white">
                  {s.weight > 0 ? `${formatKg(s.weight)} kg` : "BW"} × {s.reps}
                </span>
                <CircleCheck className="size-4 text-lime-400" aria-label="Completed" />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md sm:p-5">
        <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
          <Quote className="size-3.5" aria-hidden />
          Note to coach
        </p>
        <p className="mt-2 text-base italic leading-relaxed text-neutral-400">“{session.note}”</p>
      </section>
    </div>
  );
}

function RestDayView({ date }: { date: Date }) {
  return (
    <section className="flex flex-col items-center rounded-3xl border-2 border-dashed border-white/10 bg-black/40 px-6 py-16 text-center backdrop-blur-md">
      <span className="grid size-20 place-items-center rounded-full border-2 border-white/10 bg-neutral-950 text-neutral-500">
        <BedDouble className="size-9" strokeWidth={1.75} aria-hidden />
      </span>
      <h1 className="mt-6 text-4xl font-black uppercase tracking-tighter text-white">Rest Day.</h1>
      <p className="mt-2 font-mono text-sm text-neutral-500">No telemetry logged.</p>
      <p className="mt-6 flex items-center gap-2 text-xs text-neutral-600">
        <Moon className="size-3.5" aria-hidden />
        {longDate(date)} · recovery is part of the program
      </p>
    </section>
  );
}

function AthleteDashboard({ onDisconnect }: { onDisconnect: () => void }) {
  // Phase 3 demo: the athlete is Dawid, running Day 1 of his microcycle.
  const athlete = CLIENTS[0];
  const plan = athlete.microcycle[0];

  const [exercises, setExercises] = useState<ExerciseEntry[]>(() => toEntries(plan));
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [savedLog, setSavedLog] = useState<SessionLog | null>(null);

  // Calendar. `selectedDate` is "today" or a past date key ("2026-11-12").
  // The real date is only read in the browser: Next.js forbids `new Date()`
  // during prerender, so the ribbon shows placeholders for the first frame.
  const [days, setDays] = useState<Date[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("today");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the current date is browser-only
    setDays(buildLastDays());
  }, []);

  const todayKey = days ? toKey(days[days.length - 1]) : "today";
  const isToday = selectedDate === "today" || selectedDate === todayKey;

  const historyByKey = useMemo(
    () =>
      new Map(
        days ? ATHLETE_HISTORY.map((h) => [toKey(days[days.length - 1 - h.daysAgo]), h] as const) : [],
      ),
    [days],
  );
  const loggedKeys = useMemo(() => {
    const keys = new Set(historyByKey.keys());
    if (status === "saved") keys.add(todayKey);
    return keys;
  }, [historyByKey, status, todayKey]);
  const selectedDay = days?.find((d) => toKey(d) === selectedDate) ?? days?.[days.length - 1];
  const selectedHistory = isToday ? undefined : historyByKey.get(selectedDate);

  const allSets = exercises.flatMap((e) => e.sets);
  const doneSets = allSets.filter((s) => s.done).length;
  const progress = allSets.length ? Math.round((doneSets / allSets.length) * 100) : 0;

  const updateSet = (ei: number, si: number, patch: Partial<SetEntry>) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== ei ? ex : { ...ex, sets: ex.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) },
      ),
    );

  const submit = async () => {
    if (doneSets === 0 || status === "saving") return;
    const log: SessionLog = {
      athleteId: athlete.user.id,
      planId: plan.id,
      loggedAt: new Date().toISOString(),
      readiness,
      notes: notes.trim(),
      exercises: exercises.map((e) => ({
        name: e.name,
        sets: e.sets.map((s) => ({
          targetReps: s.targetReps,
          actualReps: Number(s.actualReps) || 0,
          weight: Number(s.weight) || 0,
          done: s.done,
        })),
      })),
    };
    setStatus("saving");
    await logSession(log);
    setSavedLog(log);
    setStatus("saved");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setExercises(toEntries(plan));
    setReadiness(null);
    setNotes("");
    setSavedLog(null);
    setStatus("idle");
  };

  return (
    <motion.div
      key="athlete"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.5, ease: EASE }}
      className="min-h-svh"
    >
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-red-500/60 bg-neutral-950 text-red-500 shadow-[0_0_14px_-2px_#ef4444]">
              <Dumbbell className="size-5" strokeWidth={2.25} aria-hidden />
            </span>
            <p className="truncate text-sm font-black uppercase tracking-tight text-white sm:text-lg">
              TrainerOS <span className="text-neutral-600">{"//"}</span>{" "}
              <span className="text-red-500">Athlete</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onDisconnect}
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-white/15 px-3 py-1.5 text-sm font-bold text-neutral-200 transition-colors hover:border-red-500 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            Disconnect
          </button>
        </div>
        <div className="h-1 bg-white/5" aria-hidden>
          <motion.div
            className="h-full bg-lime-400 shadow-[0_0_10px_#a3e635]"
            initial={false}
            animate={{ width: `${!isToday ? 0 : status === "saved" ? 100 : progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          />
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {days ? (
          <CalendarRibbon
            days={days}
            selected={isToday ? todayKey : selectedDate}
            todayKey={todayKey}
            logged={loggedKeys}
            onSelect={(key) => setSelectedDate(key === todayKey ? "today" : key)}
          />
        ) : (
          <div aria-hidden className="flex gap-2 pb-2 pt-[1.875rem]">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="h-[4.75rem] min-w-[3.6rem] flex-1 rounded-2xl border-2 border-white/10 bg-black/50" />
            ))}
          </div>
        )}

        <div className="relative mt-6">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={isToday ? "today" : selectedDate}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.32, ease: EASE }}
              className="w-full"
            >
        {!isToday && selectedDay ? (
          selectedHistory ? (
            <HistoryView session={selectedHistory} date={selectedDay} />
          ) : (
            <RestDayView date={selectedDay} />
          )
        ) : status === "saved" && savedLog ? (
          <SessionSummary log={savedLog} title={plan.title} onReset={reset} />
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl border-[3px] border-red-500/70 bg-black/50 p-5 shadow-[0_0_0_1px_rgba(239,68,68,0.4),0_0_40px_-12px_#ef4444] backdrop-blur-md sm:p-7">
              <Dumbbell
                aria-hidden
                strokeWidth={1.25}
                className="pointer-events-none absolute -bottom-8 -right-8 size-44 -rotate-12 text-white/[0.04]"
              />
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-red-400">
                <Flame className="size-3.5" aria-hidden />
                Today&apos;s protocol
              </p>
              <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl">
                Day 1: <span className="text-red-500">{plan.title}</span>
              </h1>
              <p className="mt-3 text-sm text-neutral-400">
                Programmed by {COACH.name} · {athlete.user.name}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: "Exercises", value: String(exercises.length) },
                  { label: "Sets done", value: `${doneSets}/${allSets.length}` },
                  { label: "Progress", value: `${progress}%` },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/10 bg-neutral-950/70 px-3 py-2">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500">{s.label}</p>
                    <p className={cn("text-xl font-black", s.label !== "Exercises" && doneSets > 0 ? "text-lime-400" : "text-white")}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-6 space-y-5">
              {exercises.map((exercise, ei) => {
                const complete = exercise.sets.every((s) => s.done);
                const done = exercise.sets.filter((s) => s.done).length;
                return (
                  <section
                    key={exercise.name}
                    className={cn(
                      "rounded-2xl border-2 bg-black/50 p-4 backdrop-blur-md transition-[border-color,box-shadow] duration-300 sm:p-5",
                      complete
                        ? "border-lime-400 shadow-[0_0_0_1px_#a3e635,0_0_28px_-8px_#a3e635]"
                        : "border-white/10",
                    )}
                  >
                    <header className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                          Exercise {ei + 1}
                        </p>
                        <h2 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
                          {exercise.name}
                        </h2>
                        <p className="mt-0.5 font-mono text-xs text-neutral-400">
                          {exercise.sets.length} × {exercise.sets[0]?.targetReps} ·{" "}
                          {exercise.targetWeight > 0 ? `${formatKg(exercise.targetWeight)} kg` : "bodyweight"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border-2 px-2.5 py-1 font-mono text-[11px] font-black",
                          complete ? "border-lime-400 bg-lime-400 text-neutral-950" : "border-white/15 text-neutral-400",
                        )}
                      >
                        {done}/{exercise.sets.length}
                      </span>
                    </header>

                    <div className="grid grid-cols-[2rem_3.25rem_minmax(0,1fr)_minmax(0,1fr)_3rem] gap-2 px-1 pb-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-500 sm:grid-cols-[2.5rem_4rem_minmax(0,1fr)_minmax(0,1fr)_3.5rem] sm:gap-3 sm:text-[10px]">
                      <span className="text-center">Set</span>
                      <span className="text-center">Target</span>
                      <span className="text-center">Reps</span>
                      <span className="text-center">kg</span>
                      <span className="text-center">Done</span>
                    </div>
                    <ul className="space-y-1">
                      {exercise.sets.map((set, si) => (
                        <SetRow
                          key={si}
                          index={si}
                          set={set}
                          targetWeight={exercise.targetWeight}
                          onChange={(patch) => updateSet(ei, si, patch)}
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>

            <section className="mt-6 rounded-2xl border-2 border-white/10 bg-black/50 p-4 backdrop-blur-md sm:p-5">
              <h2 className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-300">
                <Activity className="size-4 text-lime-400" aria-hidden />
                Session Telemetry &amp; Notes
              </h2>

              <p className="mt-4 text-sm font-bold text-white">How did today feel?</p>
              <div role="radiogroup" aria-label="Session readiness" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {READINESS.map((r) => {
                  const active = readiness === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setReadiness(active ? null : r.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-full border-2 px-4 py-3 text-left transition-[border-color,background-color,box-shadow,color] duration-200 sm:flex-col sm:gap-1 sm:rounded-2xl sm:py-3.5 sm:text-center",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400",
                        active ? r.active : "border-white/10 bg-neutral-950 text-neutral-300 hover:border-white/30",
                      )}
                    >
                      <span className="text-xl leading-none" aria-hidden>
                        {r.emoji}
                      </span>
                      <span>
                        <span className="block text-sm font-black uppercase tracking-tight">{r.label}</span>
                        <span className="block text-[11px] text-neutral-500">{r.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="mt-5 block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                  <NotebookPen className="size-4 text-neutral-500" aria-hidden />
                  Note for your coach
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  maxLength={600}
                  placeholder="Any niggles? Lack of sleep? Felt overtrained? Leave a note for your coach..."
                  className="w-full resize-none rounded-xl border-2 border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-lime-400 focus:outline-none"
                />
                <span className="mt-1 block text-right font-mono text-[10px] text-neutral-600">{notes.length}/600</span>
              </label>
            </section>

            <motion.button
              type="button"
              onClick={submit}
              disabled={doneSets === 0 || status === "saving"}
              whileTap={doneSets > 0 ? { scale: 0.98 } : undefined}
              className={cn(
                "mt-6 flex h-20 w-full items-center justify-center gap-3 rounded-2xl text-2xl font-black uppercase tracking-tight transition-[background-color,box-shadow,color] duration-200 sm:text-3xl",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50",
                doneSets === 0
                  ? "cursor-not-allowed border-2 border-white/10 bg-neutral-900 text-neutral-600"
                  : "bg-lime-400 text-neutral-950 shadow-[0_0_30px_-4px_#a3e635] hover:shadow-[0_0_50px_0_#a3e635] disabled:cursor-wait",
              )}
            >
              {status === "saving" ? (
                <>
                  <LoaderCircle className="size-7 animate-spin" aria-hidden />
                  Syncing…
                </>
              ) : (
                <>
                  <Save className="size-7" strokeWidth={2.5} aria-hidden />
                  Log Session
                </>
              )}
            </motion.button>
            <p className="mt-3 text-center font-mono text-[11px] text-neutral-500">
              {doneSets === 0
                ? "Tick at least one set to log the session."
                : `${doneSets} of ${allSets.length} sets will be sent to your coach, ${COACH.name}`}
            </p>
          </>
        )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function SessionSummary({
  log,
  title,
  onReset,
}: {
  log: SessionLog;
  title: string;
  onReset: () => void;
}) {
  const sets = log.exercises.flatMap((e) => e.sets.filter((s) => s.done));
  const volume = sets.reduce((v, s) => v + s.actualReps * s.weight, 0);
  const reps = sets.reduce((n, s) => n + s.actualReps, 0);
  const feeling = READINESS.find((r) => r.id === log.readiness);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="rounded-3xl border-[3px] border-lime-400 bg-black/60 p-6 text-center shadow-[0_0_0_1px_#a3e635,0_0_60px_-12px_#a3e635] backdrop-blur-md sm:p-8"
      role="status"
    >
      <motion.span
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
        className="mx-auto grid size-20 place-items-center rounded-full bg-lime-400 text-neutral-950 shadow-[0_0_30px_#a3e635]"
      >
        <CircleCheck className="size-11" strokeWidth={2.5} aria-hidden />
      </motion.span>
      <h1 className="mt-6 text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">Session logged</h1>
      <p className="mt-2 text-neutral-400">
        {title} is synced to {COACH.name}&apos;s Command Center.
      </p>

      <dl className="mt-7 grid grid-cols-3 gap-2 text-left">
        {[
          { label: "Sets", value: String(sets.length) },
          { label: "Reps", value: String(reps) },
          { label: "Volume", value: `${volume.toLocaleString("en-GB")} kg` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-neutral-950/70 px-3 py-2.5">
            <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500">{s.label}</dt>
            <dd className="text-lg font-black text-lime-400 sm:text-xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 space-y-2 text-left text-sm">
        <p className="rounded-xl border border-white/10 bg-neutral-950/70 px-4 py-3 text-neutral-300">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Readiness · </span>
          {feeling ? `${feeling.emoji} ${feeling.label}` : "not reported"}
        </p>
        {log.notes && (
          <p className="whitespace-pre-wrap rounded-xl border border-white/10 bg-neutral-950/70 px-4 py-3 text-neutral-300">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Note · </span>
            {log.notes}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-7 inline-flex items-center gap-2 rounded-xl border-2 border-white/15 px-4 py-2.5 text-sm font-bold text-neutral-200 transition-colors hover:border-lime-400 hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
      >
        <RotateCcw className="size-4" aria-hidden />
        Start a new session
      </button>
    </motion.section>
  );
}

export default function TrainerOsPage() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const disconnect = () => setActiveRole(null);

  return (
    // overflow-x-clip (not overflow-hidden) so the dashboard's sticky nav
    // still sticks to the viewport.
    <main className="relative isolate min-h-svh flex-1 overflow-x-clip bg-neutral-950 font-sans text-neutral-100">
      <KnurlBackground />
      <AnimatePresence mode="wait">
        {activeRole === null ? (
          <LoginPortal key="portal" onSelect={setActiveRole} />
        ) : activeRole === "trainer" ? (
          <TrainerDashboard key="trainer" onDisconnect={disconnect} />
        ) : (
          <AthleteDashboard key="athlete" onDisconnect={disconnect} />
        )}
      </AnimatePresence>
    </main>
  );
}
