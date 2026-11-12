"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Atom,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  Cable,
  Code2,
  Database,
  Dumbbell,
  Gamepad2,
  GitBranch,
  GraduationCap,
  Guitar,
  Globe,
  Goal,
  Handshake,
  Languages,
  Network,
  ScrollText,
  Server,
  SquareKanban,
  Terminal,
  Triangle,
  User,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------- Data ---------------------------------- */

const ABOUT =
  "Full-stack Developer & Tech Entrepreneur. Specializing in delivering reliable web applications and B2B solutions. I take full responsibility for end-to-end project execution, combining network engineering, modern development, and business acumen.";

const EXPERIENCE = [
  {
    company: "VictoriaCamp-IT",
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
];

type EducationItem = {
  title: string;
  detail: string;
  badge: string;
  icon: LucideIcon;
  current?: boolean;
};

const EDUCATION: EducationItem[] = [
  {
    title: "Industrial Computer Networks",
    detail: "Computer Science · University of Zielona Góra",
    badge: "Currently",
    icon: GraduationCap,
    current: true,
  },
  {
    title: "IT Technician Diploma",
    detail: "Professional technician qualification in IT",
    badge: "Diploma",
    icon: ScrollText,
  },
  {
    title: "State Exams: EE.08 & EE.09",
    detail:
      "EE.08 — Assembly and operation of computer systems and networks. EE.09 — Programming, web development, and databases.",
    badge: "Certified",
    icon: BadgeCheck,
  },
  {
    title: "Cisco Certification",
    detail: "Proven knowledge in network infrastructure.",
    badge: "Cisco",
    icon: Award,
  },
];

type StackGroup = {
  title: string;
  icon: LucideIcon;
  accent: string;
  items: { label: string; icon: LucideIcon }[];
};

const STACK: StackGroup[] = [
  {
    title: "Core",
    icon: Code2,
    accent: "before:from-cyan-400/15",
    items: [
      { label: "React", icon: Atom },
      { label: "Next.js", icon: Triangle },
      { label: "Python", icon: Terminal },
      { label: "Databases", icon: Database },
    ],
  },
  {
    title: "Infrastructure",
    icon: Network,
    accent: "before:from-sky-400/15",
    items: [
      { label: "Industrial computer networks", icon: Network },
      { label: "Local network infrastructure", icon: Cable },
      { label: "Server administration", icon: Server },
    ],
  },
  {
    title: "Workflow",
    icon: Workflow,
    accent: "before:from-purple-400/15",
    items: [
      { label: "Git", icon: GitBranch },
      { label: "GitHub", icon: Code2 },
      { label: "Jira", icon: SquareKanban },
    ],
  },
];

const LANGUAGES = [
  { name: "English", level: "Fluent", value: 90 },
  { name: "German", level: "Business written", value: 60 },
];

const TEAMWORK = [
  { label: "Coordinating subcontractors", icon: Handshake },
  { label: "Leading university group projects", icon: Users },
];

const HOBBIES: { label: string; icon: LucideIcon }[] = [
  { label: "Strength training", icon: Dumbbell },
  { label: "Playing guitar", icon: Guitar },
  { label: "Football", icon: Goal },
  { label: "PC gaming", icon: Gamepad2 },
];

/* ------------------------------- Animations ------------------------------- */

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const VIEWPORT = { once: true, amount: 0.2 } as const;

/* ---------------------------- Building blocks ----------------------------- */

function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-colors duration-500 hover:border-cyan-400/25",
        className,
      )}
    >
      {/* Glowing top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
      />
      {/* Hover glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-cyan-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function CardHeading({
  icon: Icon,
  label,
  title,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
          {label}
        </p>
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      </div>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-slate-300">
      {children}
    </span>
  );
}

/* --------------------------------- Section -------------------------------- */

export default function ResumeSection() {
  const reduced = useReducedMotion() ?? false;
  const initial = reduced ? "show" : "hidden";

  return (
    <section
      id="resume"
      className="relative isolate overflow-hidden px-4 py-24 sm:px-6 sm:py-32"
    >
      {/* Ambient glow + faint grid continuing the hero's blueprint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 -z-10 h-[420px] w-[420px] rounded-full bg-purple-600/10 blur-3xl"
      />

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.header
          variants={stagger}
          initial={initial}
          whileInView="show"
          viewport={VIEWPORT}
          className="mb-14 flex flex-col items-start gap-4 sm:mb-20"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300/80"
          >
            {"// 02 — Resume & Experience"}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold tracking-tight text-slate-100 sm:text-5xl"
          >
            Engineering meets{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-purple-500 bg-clip-text text-transparent">
              business
            </span>
            .
          </motion.h2>
        </motion.header>

        <motion.div
          variants={stagger}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6"
        >
          {/* 1. About */}
          <GlassCard className="lg:col-span-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
              <div className="md:w-56 md:shrink-0">
                <CardHeading icon={User} label="01" title="About Me" />
              </div>
              <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                {ABOUT}
              </p>
            </div>
          </GlassCard>

          {/* 2. Experience */}
          <GlassCard className="lg:col-span-7">
            <CardHeading icon={Briefcase} label="02" title="Experience" />
            <ol className="relative space-y-8 border-l border-white/10 pl-6">
              {EXPERIENCE.map((job) => (
                <li key={job.company} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[31px] top-1 grid size-4 place-items-center rounded-full border border-cyan-400/60 bg-[#05060a]"
                  >
                    <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.6)]" />
                  </span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
                      <Building2 className="size-4 text-cyan-300" aria-hidden />
                      {job.company}
                    </h4>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-purple-300/80">
                      {job.period}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-cyan-200/80">
                    {job.role}
                  </p>
                  <p className="mt-4 leading-relaxed text-slate-400">
                    {job.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </GlassCard>

          {/* 3. Education */}
          <GlassCard className="lg:col-span-5">
            <CardHeading
              icon={GraduationCap}
              label="03"
              title="Education & Certifications"
            />
            <ol className="relative space-y-6 border-l border-white/10 pl-6">
              {EDUCATION.map((edu) => {
                const Icon = edu.icon;
                return (
                  <li key={edu.title} className="relative">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[31px] top-0.5 grid size-4 place-items-center rounded-full border bg-[#05060a]",
                        edu.current ? "border-emerald-400/70" : "border-white/25",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          edu.current
                            ? "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]"
                            : "bg-slate-400",
                        )}
                      />
                    </span>
                    <div className="flex items-start gap-3">
                      <Icon
                        className="mt-0.5 size-4 shrink-0 text-purple-300"
                        aria-hidden
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-slate-100">
                            {edu.title}
                          </h4>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                              edu.current
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-white/5 text-slate-400",
                            )}
                          >
                            {edu.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-400">
                          {edu.detail}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </GlassCard>

          {/* 4. Tech stack */}
          <GlassCard className="lg:col-span-12">
            <CardHeading icon={Code2} label="04" title="Tech Stack & Tools" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {STACK.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div
                    key={group.title}
                    className={cn(
                      "relative overflow-hidden rounded-xl border border-white/[0.07] bg-black/20 p-5",
                      "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-gradient-to-b before:to-transparent",
                      group.accent,
                    )}
                  >
                    <div className="relative mb-4 flex items-center gap-2">
                      <GroupIcon className="size-4 text-cyan-300" aria-hidden />
                      <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
                        {group.title}
                      </h4>
                    </div>
                    <ul className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1">
                      {group.items.map((it) => {
                        const ItemIcon = it.icon;
                        return (
                          <li
                            key={it.label}
                            className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm text-slate-200 transition-colors duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]"
                          >
                            <ItemIcon
                              className="size-4 shrink-0 text-slate-400"
                              strokeWidth={1.75}
                              aria-hidden
                            />
                            {it.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* 5. Soft skills & languages */}
          <GlassCard className="lg:col-span-6">
            <CardHeading
              icon={Languages}
              label="05"
              title="Soft Skills & Languages"
            />
            <div className="space-y-5">
              {LANGUAGES.map((lang) => (
                <div key={lang.name}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-100">
                      <Globe className="size-4 text-cyan-300" aria-hidden />
                      {lang.name}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {lang.level}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                      initial={{ width: reduced ? `${lang.value}%` : 0 }}
                      whileInView={{ width: `${lang.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-white/[0.06] pt-6">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                Teamwork
              </p>
              <ul className="space-y-2.5">
                {TEAMWORK.map(({ label, icon: Icon }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <Icon className="size-4 text-purple-300" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          {/* 6. After hours */}
          <GlassCard className="lg:col-span-6">
            <CardHeading icon={Gamepad2} label="06" title="After Hours" />
            <div className="grid grid-cols-2 gap-3">
              {HOBBIES.map(({ label, icon: Icon }) => (
                <motion.div
                  key={label}
                  whileHover={reduced ? undefined : { y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group/hobby flex flex-col items-center justify-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-6 text-center transition-colors duration-300 hover:border-purple-400/30 hover:bg-purple-400/[0.05]"
                >
                  <span className="grid size-12 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition-all duration-300 group-hover/hobby:border-purple-400/40 group-hover/hobby:text-purple-300 group-hover/hobby:shadow-[0_0_24px_-4px_rgba(168,85,247,0.6)]">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm text-slate-300">{label}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
