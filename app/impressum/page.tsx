"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { COMPANY, phoneHref } from "@/lib/company";
import LanguageSwitcher from "../components/LanguageSwitcher";
import SiteFooter from "../components/SiteFooter";

function Row({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-t border-white/[0.06] py-4 first:border-t-0 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        <Icon className="size-3.5 text-cyan-300/80" aria-hidden />
        {label}
      </dt>
      <dd className="text-slate-100">{children}</dd>
    </div>
  );
}

const valueLink =
  "text-cyan-200 underline-offset-4 transition-colors hover:text-cyan-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300";

export default function ImpressumPage() {
  const { t, language } = useLanguage();
  const i = t.impressum;

  return (
    <main className="relative isolate flex min-h-svh flex-1 flex-col bg-[#05060a] font-sans text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 20%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 20%, black 20%, transparent 100%)",
        }}
      />
      <LanguageSwitcher />

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-20 sm:px-6 sm:pt-24">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-lg text-sm text-slate-400 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          {i.back}
        </Link>

        <p className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-cyan-300/80">{i.kicker}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">{i.title}</h1>
        <p className="mt-3 text-slate-400">{i.intro}</p>

        <section className="relative mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:px-8">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
          />
          <dl>
            <Row icon={Building2} label={i.company}>
              {COMPANY.name}
            </Row>
            <Row icon={User} label={i.owner}>
              {COMPANY.owner}
            </Row>
            <Row icon={BriefcaseBusiness} label={i.legalForm}>
              {i.legalFormValue}
            </Row>
            <Row icon={MapPin} label={i.address}>
              <address className="not-italic">
                {COMPANY.street}
                <br />
                {COMPANY.postalCity}
                <br />
                {i.country}
              </address>
            </Row>
            <Row icon={Hash} label={i.nip}>
              <span className="font-mono">{COMPANY.nip}</span>
            </Row>
          </dl>
        </section>

        <h2 className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">{i.contact}</h2>
        <section className="mt-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-2 backdrop-blur-xl sm:px-8">
          <dl>
            <Row icon={Mail} label={i.email}>
              <a href={`mailto:${COMPANY.email}`} className={valueLink}>
                {COMPANY.email}
              </a>
            </Row>
            <Row icon={Phone} label={i.phone}>
              <a href={phoneHref} className={valueLink} lang={language}>
                {COMPANY.phone}
              </a>
            </Row>
          </dl>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
