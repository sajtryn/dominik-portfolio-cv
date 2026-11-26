"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { LANGUAGES, translations } from "@/translations";
import { Configurator } from "./configurator";
import { useDemoLocale } from "./use-demo-locale";

function LanguageButtons() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div role="group" aria-label={t.meta.switcherLabel} className="flex gap-0.5 rounded-full border border-zinc-800 p-0.5">
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          title={translations[code].meta.languageName}
          aria-pressed={code === language}
          onClick={() => setLanguage(code)}
          className={cn(
            "rounded-full px-2 py-1 font-mono text-[11px] font-semibold uppercase transition",
            code === language ? "bg-emerald-500/15 text-emerald-200" : "text-zinc-400 hover:text-zinc-100",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

function Header() {
  const { t } = useDemoLocale();
  return (
    <header className="mb-6">
      <p className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">{t.header.eyebrow}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t.header.title}</h1>
      <p className="mt-1 text-zinc-400">{t.header.intro}</p>
    </header>
  );
}

export function DemoShell() {
  const { language } = useLanguage();
  const { t } = useDemoLocale();

  return (
    <div
      lang={language}
      className="flex flex-1 flex-col bg-zinc-950 font-sans text-zinc-100 scheme-dark"
    >
      <div className="sticky top-0 z-[80] flex h-14 items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur-md sm:px-8">
        <Link
          href="/"
          className="inline-flex min-w-0 items-center gap-2 rounded-md text-sm font-medium text-zinc-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{t.backLink}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium tracking-wider text-emerald-300 uppercase max-sm:hidden">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" />
            {t.badge}
          </span>
          <LanguageButtons />
        </div>
      </div>

      <main className="relative isolate flex-1">
        {/* Studio lighting: soft emerald / slate spotlights behind the stage. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-12%] left-[8%] h-[38rem] w-[60rem] max-w-full rounded-full bg-emerald-500/[0.09] blur-[120px]" />
          <div className="absolute top-[20%] left-[30%] h-[30rem] w-[40rem] max-w-full rounded-full bg-slate-400/[0.07] blur-[110px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_30%,transparent_40%,rgb(9_9_11/0.85))]" />
        </div>
        <Configurator header={<Header />} />
      </main>
    </div>
  );
}
