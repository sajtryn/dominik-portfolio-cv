"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES, translations } from "@/translations";
import { cn } from "@/lib/utils";

/** Fixed glass pill in the top-right corner: EN / PL / DE. */
export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6"
    >
      <div
        role="group"
        aria-label={t.meta.switcherLabel}
        className="flex items-center gap-1 rounded-full border border-white/10 bg-[#05060a]/60 p-1 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
      >
        <Languages
          aria-hidden
          className="ml-2 mr-1 size-3.5 text-slate-500"
          strokeWidth={1.75}
        />
        {LANGUAGES.map((code) => {
          const active = code === language;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLanguage(code)}
              aria-pressed={active}
              lang={code}
              title={translations[code].meta.languageName}
              className={cn(
                "relative rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
                active ? "text-cyan-100" : "text-slate-400 hover:text-slate-100",
              )}
            >
              {active && (
                <motion.span
                  layoutId="language-switcher-pill"
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-cyan-400/40 bg-cyan-400/[0.12] shadow-[0_0_18px_-4px_rgba(34,211,238,0.7)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">{code}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
