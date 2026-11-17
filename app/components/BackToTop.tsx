"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export default function BackToTop({ className }: { className?: string }) {
  const { t } = useLanguage();
  const scrollToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    // Drop any #section hash so a refresh starts at the top too.
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mt-14 flex justify-center sm:mt-16", className)}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 backdrop-blur-md",
          "font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 transition-all duration-300",
          "hover:border-cyan-400/40 hover:bg-cyan-400/[0.06] hover:text-cyan-200 hover:shadow-[0_0_24px_-6px_rgba(34,211,238,0.6)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        )}
      >
        <ArrowUp
          aria-hidden
          className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
        />
        {t.common.backToTop}
      </button>
    </motion.div>
  );
}
