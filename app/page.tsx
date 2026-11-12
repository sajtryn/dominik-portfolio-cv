"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Cloud,
  Database,
  Sparkles,
  Terminal,
  Triangle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ResumeSection from "./components/ResumeSection";
import ProjectsSection from "./components/ProjectsSection";
import ContactSection from "./components/ContactSection";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

/* ---------------------------------- Data ---------------------------------- */

type TechBadge = {
  label: string;
  icon: LucideIcon;
  position: string;
  glow: string;
  iconColor: string;
  float: { y: number[]; x: number[]; rotate: number[] };
  duration: number;
  delay: number;
};

const TECH_BADGES: TechBadge[] = [
  {
    label: "Python",
    icon: Terminal,
    position: "left-[6%] top-[16%] xl:left-[10%] xl:top-[20%]",
    glow: "shadow-[0_0_40px_-6px_rgba(250,204,21,0.45)]",
    iconColor: "text-yellow-300",
    float: { y: [0, -18, 0], x: [0, 6, 0], rotate: [-6, -2, -6] },
    duration: 7,
    delay: 0.9,
  },
  {
    label: "Next.js",
    icon: Triangle,
    position: "right-[6%] top-[13%] xl:right-[11%] xl:top-[17%]",
    glow: "shadow-[0_0_40px_-6px_rgba(255,255,255,0.35)]",
    iconColor: "text-white",
    float: { y: [0, 16, 0], x: [0, -8, 0], rotate: [5, 1, 5] },
    duration: 8,
    delay: 1.05,
  },
  {
    label: "AWS",
    icon: Cloud,
    position: "left-[6%] bottom-[8%] xl:left-[12%] xl:bottom-[12%]",
    glow: "shadow-[0_0_40px_-6px_rgba(251,146,60,0.45)]",
    iconColor: "text-orange-300",
    float: { y: [0, 14, 0], x: [0, 10, 0], rotate: [4, 8, 4] },
    duration: 9,
    delay: 1.2,
  },
  {
    label: "Database",
    icon: Database,
    position: "right-[6%] bottom-[7%] xl:right-[11%] xl:bottom-[13%]",
    glow: "shadow-[0_0_40px_-6px_rgba(34,211,238,0.45)]",
    iconColor: "text-cyan-300",
    float: { y: [0, -14, 0], x: [0, -6, 0], rotate: [-4, -9, -4] },
    duration: 7.5,
    delay: 1.35,
  },
];

/* ------------------------------- Animations ------------------------------- */

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ------------------------------- Components ------------------------------- */

function BlueprintGrid({ reduced }: { reduced: boolean }) {
  return (
    <>
      {/* Major + minor grid lines, drifting diagonally */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: [
            "linear-gradient(to right, rgba(34,211,238,0.10) 1px, transparent 1px)",
            "linear-gradient(to bottom, rgba(34,211,238,0.10) 1px, transparent 1px)",
            "linear-gradient(to right, rgba(148,163,184,0.05) 1px, transparent 1px)",
            "linear-gradient(to bottom, rgba(148,163,184,0.05) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "96px 96px, 96px 96px, 24px 24px, 24px 24px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 45%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 45%, black 40%, transparent 100%)",
        }}
        animate={
          reduced
            ? undefined
            : {
                backgroundPosition: [
                  "0px 0px, 0px 0px, 0px 0px, 0px 0px",
                  "96px 96px, 96px 96px, 96px 96px, 96px 96px",
                ],
              }
        }
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
      />
      {/* Horizontal scan line */}
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
          initial={{ top: "0%" }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 9, ease: "linear", repeat: Infinity }}
        />
      )}
    </>
  );
}

function FloatingBadge({
  badge,
  label,
  reduced,
}: {
  badge: TechBadge;
  label: string;
  reduced: boolean;
}) {
  const Icon = badge.icon;
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute z-10 hidden lg:block", badge.position)}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: badge.delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={reduced ? undefined : badge.float}
        transition={{
          duration: badge.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md",
          badge.glow,
        )}
      >
        <span className="grid size-9 place-items-center rounded-xl border border-white/10 bg-black/40">
          <Icon className={cn("size-[18px]", badge.iconColor)} strokeWidth={1.75} />
        </span>
        <span className="font-mono text-xs tracking-wider text-slate-300">
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}

function MagneticButton({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.35);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.35);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      className="group relative inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
    >
      {/* Glow halo */}
      <span
        aria-hidden
        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-50 blur-lg transition-opacity duration-300 group-hover:opacity-90"
      />
      {/* Face */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600"
      />
      {/* Sheen */}
      <span
        aria-hidden
        className="absolute inset-0 overflow-hidden rounded-xl"
      >
        <span className="absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/25 transition-[left] duration-700 ease-out group-hover:left-[150%]" />
      </span>
      <span className="relative flex items-center gap-2">
        {children}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </motion.a>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function Home() {
  const reduced = useReducedMotion() ?? false;
  const { t } = useLanguage();

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 25 });

  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${smoothX}px ${smoothY}px, rgba(34,211,238,0.12), rgba(168,85,247,0.08) 35%, transparent 70%)`;

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <main className="flex flex-1 flex-col bg-[#05060a] font-sans text-slate-100">
      <LanguageSwitcher />

      <section
        onMouseMove={handleMouseMove}
        className="relative isolate flex min-h-svh items-center justify-center overflow-hidden px-4 py-24 sm:px-6"
      >
        {/* Ambient color washes */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-purple-600/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 left-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-purple-700/10 blur-3xl"
        />

        <BlueprintGrid reduced={reduced} />

        {/* Mouse-tracking spotlight */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: spotlight }}
        />

        {TECH_BADGES.map((badge) => (
          <FloatingBadge
            key={badge.label}
            badge={badge}
            label={badge.label === "Database" ? t.hero.badgeDatabase : badge.label}
            reduced={reduced}
          />
        ))}

        {/* Center content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-20 mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.div
            variants={item}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-200/90 backdrop-blur"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            {t.hero.availability}
          </motion.div>

          <motion.h1
            variants={item}
            className="bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-500 bg-clip-text pb-2 text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Dominik Rodziewicz
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.18em] text-slate-300 sm:text-base"
          >
            <Sparkles className="size-4 text-purple-400" aria-hidden />
            {t.hero.subtitle}
          </motion.p>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            {t.hero.description}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
          >
            <MagneticButton href="#projects">{t.hero.ctaWork}</MagneticButton>
            <a
              href="#about"
              className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-slate-300 transition-colors duration-300 hover:bg-white/[0.04] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              {t.hero.ctaAbout}
              <ChevronDown
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
              />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur transition-colors duration-300 hover:border-cyan-400/50 hover:bg-cyan-400/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              {t.hero.ctaContact}
            </a>
          </motion.div>
        </motion.div>

        {/* Bottom fade into page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-[#05060a]"
        />
      </section>

      <ResumeSection />
      <ProjectsSection />
      <ContactSection />
    </main>
  );
}
