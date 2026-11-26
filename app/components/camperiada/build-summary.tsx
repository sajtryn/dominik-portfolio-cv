"use client";

import { ChevronDown, Clock, Info, Scale, Wallet, X } from "lucide-react";
import { useId, useState } from "react";
import {
  DMC_WARNING_PERCENT,
  VW_T5,
  formatPln,
  pluralPl,
  type BuildSummary as Summary,
  type DmcStatusLevel,
} from "@/lib/camperiada/calculator";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  formatNumber,
  type CatalogComponent,
} from "@/lib/camperiada/configurator";
import { CATEGORY_STYLE } from "./category-style";

type Props = {
  summary: Summary;
  selected: CatalogComponent[];
  onRemove: (id: string) => void;
};

const DMC_UI: Record<DmcStatusLevel, { label: string; bar: string; text: string; chip: string }> = {
  OK: {
    label: "W normie",
    bar: "bg-emerald-500",
    text: "text-emerald-300",
    chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  WARNING: {
    label: "Blisko limitu",
    bar: "bg-amber-400",
    text: "text-amber-300",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  },
  OVERLOAD: {
    label: "Przeciążenie",
    bar: "bg-red-500",
    text: "text-red-300",
    chip: "border-red-500/40 bg-red-500/10 text-red-300",
  },
};

function dmcMessage(summary: Summary): string {
  const { status, remainingPayloadKg } = summary.dmcStatus;
  const payload = `${formatNumber(Math.max(remainingPayloadKg, 0))} kg`;
  if (status === "OK") return `Zostaje ${payload} ładowności na pasażerów i bagaż.`;
  if (status === "WARNING") return `Zabudowa zbliża się do zalecanych ${VW_T5.recommendedConversionKg} kg — zostaje ${payload} ładowności.`;
  return remainingPayloadKg < 0
    ? `Przekroczona DMC o ${formatNumber(-remainingPayloadKg)} kg — pojazd nie może legalnie jechać.`
    : `Przekroczony zalecany budżet ${VW_T5.recommendedConversionKg} kg — za mało zapasu na pasażerów i bagaż.`;
}

const tile = "flex min-w-0 flex-col gap-1.5 p-4 sm:p-5";
const tileLabel = "flex items-center gap-1.5 text-xs font-medium tracking-wide text-zinc-400 uppercase";

export function BuildSummary({ summary, selected, onRemove }: Props) {
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
      aria-label="Podsumowanie zabudowy"
      className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/85 shadow-[0_20px_60px_-25px_rgb(0_0_0/0.9)] backdrop-blur-md"
    >
      <div className="grid divide-zinc-800 max-md:divide-y md:grid-cols-[1fr_1.5fr_1fr] md:divide-x">
        {/* Cost */}
        <div className={tile}>
          <p className={tileLabel}>
            <Wallet className="size-3.5" aria-hidden />
            Koszt całkowity
          </p>
          <p
            aria-live="polite"
            className="text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-[1.7rem]"
          >
            {formatPln(summary.totalPriceGrosze)}
          </p>
          <p className="text-xs text-zinc-500">
            {summary.itemCount === 0
              ? "Brak wybranych elementów"
              : `${summary.itemCount} ${pluralPl(summary.itemCount, "element", "elementy", "elementów")} · ceny katalogowe`}
          </p>
        </div>

        {/* Weight & DMC */}
        <div className={tile}>
          <div className="flex items-center justify-between gap-2">
            <p className={tileLabel}>
              <Scale className="size-3.5" aria-hidden />
              Masa zabudowy &amp; DMC (VW T5)
            </p>
            <span className="group relative">
              <button
                type="button"
                aria-describedby={tooltipId}
                className="grid size-6 place-items-center rounded-full text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                <Info className="size-3.5" aria-hidden />
                <span className="sr-only">Jak liczymy DMC?</span>
              </button>
              <span
                id={tooltipId}
                role="tooltip"
                className="pointer-events-none absolute right-0 bottom-full z-20 mb-2 w-72 rounded-lg border border-zinc-700 bg-zinc-950/95 p-3 text-xs leading-relaxed text-zinc-300 opacity-0 shadow-xl backdrop-blur transition group-focus-within:opacity-100 group-hover:opacity-100"
              >
                Szacunek: masa własna VW T5 {formatNumber(VW_T5.curbWeightKg)} kg + masa zabudowy. DMC wynosi{" "}
                {formatNumber(VW_T5.maxGrossWeightKg)} kg. Zalecany budżet zabudowy to{" "}
                {VW_T5.recommendedConversionKg} kg — zostawia zapas na pasażerów, wodę i bagaż. Powyżej{" "}
                {DMC_WARNING_PERCENT}% budżetu pokazujemy ostrzeżenie.
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-[1.7rem]">
              +{formatNumber(summary.totalWeightKg)} kg
            </p>
            <p className="text-sm text-zinc-400 tabular-nums">
              {formatNumber(dmc.totalVehicleWeightKg)} / {formatNumber(VW_T5.maxGrossWeightKg)} kg DMC
            </p>
          </div>

          <div
            role="meter"
            aria-label="Wykorzystanie zalecanego budżetu masy zabudowy"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(barWidth)}
            aria-valuetext={`${formatNumber(dmc.conversionLoadPercent)}% z ${VW_T5.recommendedConversionKg} kg — ${ui.label}`}
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
            <span className={`rounded-full border px-2 py-0.5 font-medium ${ui.chip}`}>{ui.label}</span>
            <span className="text-zinc-400 tabular-nums">
              {formatNumber(dmc.conversionLoadPercent)}% z {VW_T5.recommendedConversionKg} kg
            </span>
          </div>
          <p className={`text-xs ${ui.text}`} aria-live="polite">
            {dmcMessage(summary)}
          </p>
        </div>

        {/* Installation time */}
        <div className={tile}>
          <p className={tileLabel}>
            <Clock className="size-3.5" aria-hidden />
            Szacowany czas montażu
          </p>
          <p className="text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-[1.7rem]">
            {formatNumber(summary.totalInstallHours)} h
          </p>
          <p className="text-xs text-zinc-500">
            {summary.estimatedDays === 0
              ? "Brak prac montażowych"
              : `~${summary.estimatedDays} ${pluralPl(summary.estimatedDays, "dzień roboczy", "dni robocze", "dni roboczych")} (8 h/dzień)`}
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
            Wybrane elementy
            <span className="grid min-w-6 place-items-center rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-300 tabular-nums">
              {summary.itemCount}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            {open ? "Zwiń" : "Pokaż zestawienie"}
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
              Nie wybrano jeszcze żadnych elementów. Kliknij kartę w katalogu, aby ją dodać.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-800/70">
              {sorted.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                  <span aria-hidden className={`size-2 shrink-0 rounded-full ${CATEGORY_STYLE[c.category].dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-100" title={c.name}>
                      {c.name}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      <code className="font-mono">{c.code}</code> · {CATEGORY_META[c.category].label}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs tabular-nums">
                    <p className="font-medium text-zinc-100">{formatPln(c.price)}</p>
                    <p className="text-zinc-500">{formatNumber(c.weightKg)} kg</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(c.id)}
                    aria-label={`Usuń: ${c.name}`}
                    title="Usuń z zabudowy"
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
