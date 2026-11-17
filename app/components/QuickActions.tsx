"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Caravan,
  ExternalLink,
  FileText,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const BUSINESS_URL = "https://victoriacamp-it.com";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const cardBase =
  "group relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/50 p-5 backdrop-blur-md transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 focus-visible:outline-none sm:p-6";

function CardBody({
  icons,
  title,
  subtitle,
  trailing: Trailing,
  tone,
}: {
  icons: LucideIcon[];
  title: string;
  subtitle: string;
  trailing: LucideIcon;
  tone: "green" | "blue";
}) {
  const [Main, Secondary] = icons;
  return (
    <>
      <span
        className={cn(
          "relative grid size-14 shrink-0 place-items-center rounded-xl border bg-black/50 transition-colors duration-300",
          tone === "green"
            ? "border-green-400/25 text-green-400 group-hover:border-green-400/60"
            : "border-sky-300/25 text-sky-300 group-hover:border-sky-300/60",
        )}
      >
        <Main className="size-6" strokeWidth={1.75} aria-hidden />
        {Secondary && (
          <span
            className={cn(
              "absolute -bottom-1.5 -right-1.5 grid size-6 place-items-center rounded-md border bg-neutral-950",
              tone === "green" ? "border-green-400/40 text-green-300" : "border-sky-300/40 text-sky-200",
            )}
          >
            <Secondary className="size-3.5" strokeWidth={2} aria-hidden />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">
          {title}
        </span>
        <span className="mt-0.5 block text-sm text-slate-400">{subtitle}</span>
      </span>
      <Trailing
        className={cn(
          "size-5 shrink-0 text-slate-500 transition-[color,transform] duration-300",
          tone === "green"
            ? "group-hover:translate-x-1 group-hover:text-green-300"
            : "group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-200",
        )}
        aria-hidden
      />
    </>
  );
}

/**
 * Quick access for recruiters and clients, right under the hero:
 * the CV / terminal page and the VictoriaCamp-IT business site.
 */
export default function QuickActions() {
  const { t } = useLanguage();
  const q = t.quickAccess;
  const reduced = useReducedMotion() ?? false;

  return (
    <section aria-labelledby="quick-access" className="relative px-4 pb-4 pt-2 sm:px-6">
      <motion.div
        variants={container}
        initial={reduced ? "show" : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="mx-auto max-w-6xl"
      >
        <motion.p
          id="quick-access"
          variants={item}
          className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500"
        >
          {`// ${q.label}`}
        </motion.p>

        <div className="flex flex-col gap-4 sm:flex-row">
          {/* HR / resume — internal route */}
          <motion.div variants={item} className="flex flex-1">
            <Link
              href="/projects/terminal-cv"
              className={cn(
                cardBase,
                "hover:border-green-400/50 hover:shadow-[0_0_0_1px_rgba(74,222,128,0.35),0_0_32px_-6px_rgba(74,222,128,0.55)]",
                "focus-visible:border-green-400/60 focus-visible:shadow-[0_0_0_2px_rgba(74,222,128,0.6)]",
              )}
            >
              <CardBody
                icons={[FileText, Terminal]}
                title={q.resumeTitle}
                subtitle={q.resumeSubtitle}
                trailing={ArrowRight}
                tone="green"
              />
            </Link>
          </motion.div>

          {/* Business — external site */}
          <motion.div variants={item} className="flex flex-1">
            <a
              href={BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                cardBase,
                "hover:border-sky-300/50 hover:shadow-[0_0_0_1px_rgba(125,211,252,0.35),0_0_32px_-6px_rgba(125,211,252,0.5)]",
                "focus-visible:border-sky-300/60 focus-visible:shadow-[0_0_0_2px_rgba(125,211,252,0.6)]",
              )}
            >
              <CardBody
                icons={[Caravan]}
                title={q.businessTitle}
                subtitle={q.businessSubtitle}
                trailing={ExternalLink}
                tone="blue"
              />
              <span className="sr-only">({q.newTab})</span>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
