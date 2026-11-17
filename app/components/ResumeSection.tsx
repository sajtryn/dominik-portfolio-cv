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
import BackToTop from "./BackToTop";
import { useLanguage } from "@/context/LanguageContext";
import type { Dictionary } from "@/translations";

const COMPANY = "VictoriaCamp-IT";

const EDUCATION_META: { icon: LucideIcon; current?: boolean }[] = [
  { icon: GraduationCap, current: true },
  { icon: ScrollText },
  { icon: BadgeCheck },
  { icon: Award },
];

const STACK_META: {
  key: keyof Dictionary["resume"]["stack"];
  icon: LucideIcon;
  accent: string;
  itemIcons: LucideIcon[];
}[] = [
  {
    key: "core",
    icon: Code2,
    accent: "before:from-cyan-400/15",
    itemIcons: [Atom, Triangle, Terminal, Database],
  },
  {
    key: "infrastructure",
    icon: Network,
    accent: "before:from-sky-400/15",
    itemIcons: [Network, Cable, Server],
  },
  {
    key: "workflow",
    icon: Workflow,
    accent: "before:from-purple-400/15",
    itemIcons: [GitBranch, Code2, SquareKanban],
  },
];

const LANGUAGE_LEVELS = [100, 90, 60];

const TEAMWORK_ICONS = [Handshake, Users];

const HOBBY_ICONS = [Dumbbell, Guitar, Goal, Gamepad2];

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
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
      />
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

export default function ResumeSection() {
  const reduced = useReducedMotion() ?? false;
  const initial = reduced ? "show" : "hidden";
  const { t } = useLanguage();
  const r = t.resume;

  return (
    <section
      id="about"
      className="relative isolate overflow-hidden px-4 py-24 sm:px-6 sm:py-32"
    >
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
            {r.eyebrow}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold tracking-tight text-slate-100 sm:text-5xl"
          >
            {r.titleStart}{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-purple-500 bg-clip-text text-transparent">
              {r.titleAccent}
            </span>
            {r.titleEnd}
          </motion.h2>
        </motion.header>

        <motion.div
          variants={stagger}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6"
        >
          <GlassCard className="lg:col-span-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
              <div className="md:w-56 md:shrink-0">
                <CardHeading icon={User} label="01" title={r.cards.about} />
              </div>
              <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                {r.about}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="lg:col-span-7">
            <CardHeading icon={Briefcase} label="02" title={r.cards.experience} />
            <ol className="relative space-y-8 border-l border-white/10 pl-6">
              {[r.job].map((job) => (
                <li key={COMPANY} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[31px] top-1 grid size-4 place-items-center rounded-full border border-cyan-400/60 bg-[#05060a]"
                  >
                    <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.6)]" />
                  </span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
                      <Building2 className="size-4 text-cyan-300" aria-hidden />
                      {COMPANY}
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

          <GlassCard className="lg:col-span-5">
            <CardHeading
              icon={GraduationCap}
              label="03"
              title={r.cards.education}
            />
            <ol className="relative space-y-6 border-l border-white/10 pl-6">
              {r.education.map((text, i) => {
                const { icon: Icon, current } = EDUCATION_META[i];
                const edu = { ...text, current };
                return (
                  <li key={i} className="relative">
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

          <GlassCard className="lg:col-span-12">
            <CardHeading icon={Code2} label="04" title={r.cards.stack} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {STACK_META.map((meta) => {
                const GroupIcon = meta.icon;
                const group = { ...r.stack[meta.key], accent: meta.accent };
                return (
                  <div
                    key={meta.key}
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
                      {group.items.map((label, i) => {
                        const ItemIcon = meta.itemIcons[i] ?? Code2;
                        return (
                          <li
                            key={i}
                            className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm text-slate-200 transition-colors duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]"
                          >
                            <ItemIcon
                              className="size-4 shrink-0 text-slate-400"
                              strokeWidth={1.75}
                              aria-hidden
                            />
                            {label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="lg:col-span-6">
            <CardHeading
              icon={Languages}
              label="05"
              title={r.cards.softSkills}
            />
            <div className="space-y-5">
              {r.languages.map((text, i) => {
                const lang = { ...text, value: LANGUAGE_LEVELS[i] ?? 50 };
                return (
                <div key={i}>
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
                );
              })}
            </div>

            <div className="mt-8 border-t border-white/[0.06] pt-6">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                {r.teamworkLabel}
              </p>
              <ul className="space-y-2.5">
                {r.teamwork.map((label, i) => {
                  const Icon = TEAMWORK_ICONS[i] ?? Users;
                  return (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <Icon className="size-4 text-purple-300" aria-hidden />
                    {label}
                  </li>
                  );
                })}
              </ul>
            </div>
          </GlassCard>

          <GlassCard className="lg:col-span-6">
            <CardHeading icon={Gamepad2} label="06" title={r.cards.hobbies} />
            <div className="grid grid-cols-2 gap-3">
              {r.hobbies.map((label, i) => {
                const Icon = HOBBY_ICONS[i] ?? Gamepad2;
                return (
                <motion.div
                  key={i}
                  whileHover={reduced ? undefined : { y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group/hobby flex flex-col items-center justify-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-6 text-center transition-colors duration-300 hover:border-purple-400/30 hover:bg-purple-400/[0.05]"
                >
                  <span className="grid size-12 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition-all duration-300 group-hover/hobby:border-purple-400/40 group-hover/hobby:text-purple-300 group-hover/hobby:shadow-[0_0_24px_-4px_rgba(168,85,247,0.6)]">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm text-slate-300">{label}</span>
                </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        <BackToTop />
      </div>
    </section>
  );
}
