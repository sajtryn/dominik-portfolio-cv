import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Configurator } from "@/app/components/camperiada/configurator";

export const metadata: Metadata = {
  title: "Camperiada · Interactive Demo · Dominik Rodziewicz",
  description:
    "Interactive 2D campervan configurator for the VW T5 with a live price, weight and installation time calculator.",
};

function Header() {
  return (
    <header className="mb-6">
      <p className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
        Camperiada · VW T5 · krótki rozstaw osi
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Konfigurator zabudowy
      </h1>
      <p className="mt-1 text-zinc-400">
        Przełączaj rzuty i dobieraj moduły — każdy wybór pojawia się jako warstwa na planie.
      </p>
    </header>
  );
}

// Frontend-only demo of Camperiada: static catalogue, no login, no server calls.
// All styling is Tailwind utilities on this tree, so nothing leaks into the
// portfolio's global CSS.
export default function CamperiadaDemoPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-950 font-sans text-zinc-100 scheme-dark">
      <div className="sticky top-0 z-[80] flex h-14 items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur-md sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-zinc-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to domrod.eu
        </Link>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium tracking-wider text-emerald-300 uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" />
          Interactive Demo
        </span>
      </div>

      <main lang="pl" className="relative isolate flex-1">
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
