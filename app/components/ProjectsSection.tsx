"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, Bot, Caravan, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import type { ProjectId } from "@/translations";
import BackToTop from "./BackToTop";

/* ---------------------------------- Data ---------------------------------- */
// Text lives in /translations.ts under `projects.items.<id>`.

type ProjectMeta = {
  id: ProjectId;
  icon: LucideIcon;
  stack: string[];
  /**
   * Live demo link. A path like "/projects/x" opens in the same tab; a full
   * URL opens in a new one. "#" (or null) is a placeholder: the button shows
   * as "coming soon" and isn't clickable.
   */
  href: string | null;
  /** Accent used for the mockup glow and spotlight. */
  accent: { rgb: string; text: string; from: string };
};

const PROJECTS: ProjectMeta[] = [
  {
    id: "camper",
    icon: Caravan,
    stack: ["Next.js", "TypeScript", "Tailwind"],
    href: "/projects/smart-camper",
    accent: { rgb: "34,211,238", text: "text-cyan-300", from: "from-cyan-500/25" },
  },
  {
    id: "voice",
    icon: Bot,
    stack: ["Python", "OpenAI API", "React"],
    href: "/projects/ai-terminal",
    accent: { rgb: "168,85,247", text: "text-purple-300", from: "from-purple-500/25" },
  },
];

/* ------------------------------- Animations ------------------------------- */

/** Maximum card rotation in degrees at the card's edges. */
const MAX_TILT = 12;
const TILT_SPRING = { stiffness: 180, damping: 18, mass: 0.6 };

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const headerStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// Cards wait for the header, then pop in one by one with a soft spring.
const cardsStagger: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.25, staggerChildren: 0.18 } },
};

const cardPop: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 140, damping: 16, mass: 0.9 },
  },
};

/* ------------------------------- Components ------------------------------- */

function Mockup({ project }: { project: ProjectMeta }) {
  const Icon = project.icon;
  return (
    <div
      aria-hidden
      className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-br from-slate-900 via-[#070912] to-black"
    >
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
        }}
      />
      {/* Accent wash */}
      <div
        className={cn(
          "absolute -bottom-1/2 left-1/2 h-full w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-t to-transparent blur-3xl transition-opacity duration-500 group-hover:opacity-100",
          project.accent.from,
          "opacity-60",
        )}
      />

      {/* Faux window chrome */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 border-b border-white/[0.06] bg-black/30 px-3 py-2">
        <span className="size-2 rounded-full bg-rose-400/60" />
        <span className="size-2 rounded-full bg-amber-300/60" />
        <span className="size-2 rounded-full bg-emerald-400/60" />
        <span className="ml-3 h-1.5 w-24 rounded-full bg-white/10" />
      </div>

      {/* Faux UI skeleton */}
      <div className="absolute bottom-4 left-4 hidden w-1/3 space-y-2 sm:block">
        <span className="block h-1.5 w-full rounded-full bg-white/[0.07]" />
        <span className="block h-1.5 w-2/3 rounded-full bg-white/[0.07]" />
        <span className="block h-1.5 w-5/6 rounded-full bg-white/[0.07]" />
      </div>
      <div className="absolute bottom-4 right-4 hidden items-end gap-1 sm:flex">
        {[40, 65, 50, 80, 60].map((h, i) => (
          <span
            key={i}
            className="w-1.5 rounded-sm bg-white/[0.08]"
            style={{ height: `${h * 0.4}px` }}
          />
        ))}
      </div>

      {/* Centered icon */}
      <div className="absolute inset-0 grid place-items-center">
        <span
          className={cn(
            "grid size-16 place-items-center rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md transition-transform duration-500 group-hover:scale-110",
            project.accent.text,
          )}
          style={{ boxShadow: `0 0 50px -8px rgba(${project.accent.rgb},0.7)` }}
        >
          <Icon className="size-8" strokeWidth={1.5} />
        </span>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  reduced,
}: {
  project: ProjectMeta;
  index: number;
  reduced: boolean;
}) {
  const { t } = useLanguage();
  const p = t.projects;
  const copy = p.items[project.id];

  // Cursor position inside the card in pixels — drives the glare, the
  // accent spotlight and the border glow.
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgba(${project.accent.rgb},0.12), transparent 60%)`;
  const glare = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 40%, transparent 70%)`;
  const borderGlow = useMotionTemplate`radial-gradient(320px circle at ${mx}px ${my}px, rgba(${project.accent.rgb},0.85), transparent 55%)`;

  // Cursor position normalised to -0.5…0.5 from the card's centre, mapped to
  // rotation and smoothed with a spring so the card settles back softly.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(py, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]),
    TILT_SPRING,
  );
  const rotateY = useSpring(
    useTransform(px, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]),
    TILT_SPRING,
  );

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mx.set(x);
    my.set(y);
    if (!reduced) {
      px.set(x / rect.width - 0.5);
      py.set(y / rect.height - 0.5);
    }
  };
  const onLeave = () => {
    mx.set(-400);
    my.set(-400);
    px.set(0);
    py.set(0);
  };

  return (
    // The wrapper handles the entrance pop; the card inside handles the tilt
    // (transformPerspective gives the rotation real depth).
    <motion.div variants={cardPop} className="h-full">
      <motion.article
        whileHover={reduced ? undefined : { y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformPerspective: 1100 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-shadow duration-500 will-change-transform hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] sm:p-5"
      >
        {/* Border glow that follows the cursor (masked to a 1px ring) */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl p-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: borderGlow,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        {/* Inner accent spotlight */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />

        <div className="relative">
          <Mockup project={project} />
        </div>

        <div className="relative flex flex-1 flex-col px-1 pb-1 pt-6 sm:px-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
              {copy.category}
            </span>
            {index === 0 && (
              <span className="ml-auto rounded-full border border-purple-400/30 bg-purple-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-purple-200">
                {p.featured}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
            {copy.title}
          </h3>
          <p className="mt-3 leading-relaxed text-slate-400">{copy.description}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1 font-mono text-[11px] text-slate-300 transition-colors duration-300 group-hover:border-white/15"
              >
                {tech}
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            {project.href && project.href !== "#" ? (
              <Link
                href={project.href}
                {...(project.href.startsWith("/")
                  ? {}
                  : { target: "_blank", rel: "noopener noreferrer" })}
                className="group/launch inline-flex items-center gap-2 rounded-lg px-3 py-2 -ml-3 text-sm font-semibold text-slate-200 transition-colors duration-300 hover:bg-white/[0.05] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                {p.launch}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover/launch:-translate-y-0.5 group-hover/launch:translate-x-0.5"
                />
              </Link>
            ) : (
              // No demo URL yet: same look, but not clickable.
              <span
                aria-disabled="true"
                title={p.comingSoon}
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 -ml-3 text-sm font-semibold text-slate-400"
              >
                {p.launch}
                <ArrowUpRight aria-hidden className="size-4" />
                <span className="sr-only">({p.comingSoon})</span>
              </span>
            )}
          </div>
        </div>

        {/* Glare: a soft white reflection on top of everything, following the cursor */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glare }}
        />
      </motion.article>
    </motion.div>
  );
}

/* --------------------------------- Section -------------------------------- */

export default function ProjectsSection() {
  const reduced = useReducedMotion() ?? false;
  const initial = reduced ? "show" : "hidden";
  const { t } = useLanguage();
  const p = t.projects;

  return (
    <section
      id="projects"
      className="relative isolate overflow-hidden px-4 py-24 sm:px-6 sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/4 -z-10 h-[420px] w-[520px] rounded-full bg-cyan-500/[0.07] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[420px] w-[520px] rounded-full bg-purple-600/10 blur-3xl"
      />

      <div className="mx-auto max-w-6xl">
        <motion.header
          variants={headerStagger}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-14 flex flex-col items-start gap-4 sm:mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300/80"
          >
            {p.eyebrow}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold tracking-tight text-slate-100 sm:text-5xl"
          >
            {p.titleStart}{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-purple-500 bg-clip-text text-transparent">
              {p.titleAccent}
            </span>
            {p.titleEnd}
          </motion.h2>
          <motion.p variants={fadeUp} className="max-w-2xl text-slate-400">
            {p.intro}
          </motion.p>
        </motion.header>

        <motion.div
          variants={cardsStagger}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              reduced={reduced}
            />
          ))}
        </motion.div>

        <BackToTop />
      </div>
    </section>
  );
}
