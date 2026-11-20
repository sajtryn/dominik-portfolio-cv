"use client";

import Link from "next/link";
import { Mail, Scale } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { COMPANY } from "@/lib/company";

// lucide-react ships no brand icons, so the GitHub mark is inlined.
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

const linkClass =
  "inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-slate-400 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300";

export default function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-white/[0.08] bg-[#05060a]/80 px-4 py-8 backdrop-blur-md sm:px-6">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-xs sm:flex-row">
        <p className="text-slate-500">
          © 2026 {COMPANY.owner} <span className="text-slate-700">|</span> {COMPANY.brand}
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a href={COMPANY.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
            <GitHubMark className="size-3.5" />
            {t.footer.github}
          </a>
          <span aria-hidden className="text-slate-700">/</span>
          <a href={`mailto:${COMPANY.email}`} className={linkClass}>
            <Mail className="size-3.5" aria-hidden />
            {t.footer.email}
          </a>
          <span aria-hidden className="text-slate-700">/</span>
          <Link href="/impressum" className={linkClass}>
            <Scale className="size-3.5" aria-hidden />
            {t.footer.impressum}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
