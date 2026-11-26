"use client";

import { ChevronDown, Clock, Info, Scale, Wallet, X } from "lucide-react";
import { useId, useState } from "react";
import {
  DMC_WARNING_PERCENT,
  VW_T5,
  type BuildSummary as Summary,
  type DmcStatusLevel,
} from "@/lib/camperiada/calculator";
import { CATEGORY_ORDER, type CatalogComponent } from "@/lib/camperiada/configurator";
import type { DemoText } from "@/lib/camperiada/i18n";
import { CATEGORY_STYLE } from "./category-style";
import { useDemoLocale } from "./use-demo-locale";

type Props = {
  summary: Summary;
  selected: CatalogComponent[];
  onRemove: (id: string) => void;
};

const DMC_UI: Record<DmcStatusLevel, { bar: string; text: string; chip: string }> = {
  OK: {
    bar: "bg-emerald-500",
    text: "text-emerald-300",
    chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  WARNING: {
    bar: "bg-amber-400",
    text: "text-amber-300",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
  OVERLOAD: {
    bar: "bg-red-500",
    text: "text-red-300",
    chip: "border-red-500/40 bg-red-500/10 text-red-300",
  },
};

function dmcMessage(t: DemoText, summary: Summary, formatNumber: (value: number) => string): string {
  const { status, remainingPayloadKg } = summary.dmcStatus;
  const payload = formatNumber(Math.max(remainingPayloadKg, 0));
  if (status === "OK") return t.summary.ok(payload);
  if (status === "WARNING") return t.summary.warning(VW_T5.recommendedConversionKg, payload);
  return remainingPayloadKg < 0
    ? t.summary.exceeded(formatNumber(-remainingPayloadKg))
    : t.summary.overBudget(VW_T5.recommendedConversionKg);
}

const tile = "flex min-w-0 flex-col gap-1.5 p-4 sm:p-5";
const tileLabel = "flex items-center gap-1.5 text-xs font-medium tracking-wide text-zinc-400 uppercase";

export function BuildSummary({ summary, selected, onRemove }: Props) {
  const { t, formatNumber, formatPln, componentName } = useDemoLocale();
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const tooltipId = useId();
  const dmc = summary.dmcStatus;
  const ui = DMC_UI[dmc.status];
  const barWidth = Math.min(dmc.conversionLoadPercent, 100);

  const sorted = [...selected].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );

  return (
    <section
      aria-label={t.summary.label}
      className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/85 shadow-[0_20px_60px_-25px_rgb(0_0_0/0.9)] backdrop-blur-md"
    >
      <div className="grid divide-zinc-800 max-md:divide-y md:grid-cols-[1fr_1.5fr_1fr] md:divide-x">
        {/* Cost */}
        <div className={tile}>
          <p className={tileLabel}>
            <Wallet className="size-3.5" aria-hidden />
            {t.summary.totalCost}
          </p>
          <p
            aria-live="polite"
            className="text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-[1.7rem]"
          >
            {formatPln(summary.totalPriceGrosze)}
          </p>
          <p className="text-xs text-zinc-500">
            {summary.itemCount === 0
              ? t.summary.noItems
              : `${t.summary.items(summary.itemCount)} · ${t.summary.listPrices}`}
          </p>
        </div>

        {/* Weight & DMC */}
        <div className={tile}>
          <div className="flex items-center justify-between gap-2">
            <p className={tileLabel}>
              <Scale className="size-3.5" aria-hidden />
              {t.summary.weightTitle}
            </p>
            <span className="group relative">
              <button
                type="button"
                aria-describedby={tooltipId}
                className="grid size-6 place-items-center rounded-full text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                <Info className="size-3.5" aria-hidden />
                <span className="sr-only">{t.summary.howTitle}</span>
              </button>
              <span
                id={tooltipId}
                role="tooltip"
                className="pointer-events-none absolute right-0 bottom-full z-20 mb-2 w-72 rounded-lg border border-zinc-700 bg-zinc-950/95 p-3 text-xs leading-relaxed text-zinc-300 opacity-0 shadow-xl backdrop-blur transition group-focus-within:opacity-100 group-hover:opacity-100"
              >
                {t.summary.how(
                  formatNumber(VW_T5.curbWeightKg),
                  formatNumber(VW_T5.maxGrossWeightKg),
                  VW_T5.recommendedConversionKg,
                  DMC_WARNING_PERCENT,
                )}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-[1.7rem]">
              +{formatNumber(summary.totalWeightKg)} kg
            </p>
            <p className="text-sm text-zinc-400 tabular-nums">
              {formatNumber(dmc.totalVehicleWeightKg)} / {formatNumber(VW_T5.maxGrossWeightKg)} kg {t.summary.gvwShort}
            </p>
          </div>

          <div
            role="meter"
            aria-label={t.summary.meterLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(barWidth)}
            aria-valuetext={`${t.summary.ofBudget(formatNumber(dmc.conversionLoadPercent), VW_T5.recommendedConversionKg)} — ${t.summary.status[dmc.status]}`}
            className="relative mt-1 h-2 overflow-hidden rounded-full bg-zinc-800"
          >
            <div
              className={`h-full rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none ${ui.bar}`}
              style={{ width: `${barWidth}%` }}
            />
            {/* warning threshold marker */}
            <span
              aria-hidden
              className="absolute inset-y-0 w-px bg-zinc-500/70"
              style={{ left: `${DMC_WARNING_PERCENT}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className={`rounded-full border px-2 py-0.5 font-medium ${ui.chip}`}>{t.summary.status[dmc.status]}</span>
            <span className="text-zinc-400 tabular-nums">
              {t.summary.ofBudget(formatNumber(dmc.conversionLoadPercent), VW_T5.recommendedConversionKg)}
            </span>
          </div>
          <p className={`text-xs ${ui.text}`} aria-live="polite">
            {dmcMessage(t, summary, formatNumber)}
          </p>
        </div>

        {/* Installation time */}
        <div className={tile}>
          <p className={tileLabel}>
            <Clock className="size-3.5" aria-hidden />
            {t.summary.installTitle}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-[1.7rem]">
            {formatNumber(summary.totalInstallHours)} h
          </p>
          <p className="text-xs text-zinc-500">
            {summary.estimatedDays === 0
              ? t.summary.noWork
              : t.summary.days(summary.estimatedDays)}
          </p>
        </div>
      </div>

      {/* Itemised drawer */}
      <div className="border-t border-zinc-800">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={drawerId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.03] sm:px-5"
        >
          <span className="inline-flex items-center gap-2">
            {t.summary.selected}
            <span className="grid min-w-6 place-items-center rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-300 tabular-nums">
              {summary.itemCount}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            {open ? t.summary.collapse : t.summary.expand}
            <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} aria-hidden />
          </span>
        </button>

        <div
          id={drawerId}
          hidden={!open}
          className="max-h-80 overflow-y-auto border-t border-zinc-800/70 [scrollbar-color:var(--color-zinc-700)_transparent]"
        >
          {sorted.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-zinc-500">
              {t.summary.emptyList}
            </p>
          ) : (
            <ul className="divide-y divide-zinc-800/70">
              {sorted.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                  <span aria-hidden className={`size-2 shrink-0 rounded-full ${CATEGORY_STYLE[c.category].dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-100" title={componentName(c)}>
                      {componentName(c)}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      <code className="font-mono">{c.code}</code> · {t.categories[c.category]}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs tabular-nums">
                    <p className="font-medium text-zinc-100">{formatPln(c.price)}</p>
                    <p className="text-zinc-500">{formatNumber(c.weightKg)} kg</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(c.id)}
                    aria-label={t.summary.removeNamed(componentName(c))}
                    title={t.summary.remove}
                    className="grid size-7 shrink-0 place-items-center rounded-md text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-emerald-500"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
