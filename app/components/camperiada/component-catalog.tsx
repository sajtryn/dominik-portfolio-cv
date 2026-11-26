"use client";

import { BedDouble, Check, Clock, Eye, Flame, Layers, LayoutGrid, Users, Weight } from "lucide-react";
import { useState } from "react";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  type CatalogComponent,
  type ComponentCategory,
  type ViewType,
} from "@/lib/camperiada/configurator";
import type { DemoText } from "@/lib/camperiada/i18n";
import { CATEGORY_STYLE } from "./category-style";
import { useDemoLocale } from "./use-demo-locale";

type Props = {
  catalog: CatalogComponent[];
  selectedIds: string[];
  activeView: ViewType;
  onToggle: (component: CatalogComponent) => void;
};

type Filter = "ALL" | ComponentCategory;

const GROUP_ICON: Record<string, typeof BedDouble> = { SLEEPING: BedDouble, HEATING: Flame };

function selectionHint(t: DemoText, category: ComponentCategory, items: CatalogComponent[]) {
  if (CATEGORY_META[category].singleSelect) return t.catalog.single;
  const groups = [...new Set(items.map((c) => c.exclusiveGroup).filter((g): g is string => !!g))];
  return [t.catalog.multiple, ...groups.map((g) => t.groups[g]?.hint ?? g)].join(" · ");
}

export function ComponentCatalog({ catalog, selectedIds, activeView, onToggle }: Props) {
  const { t } = useDemoLocale();
  const [filter, setFilter] = useState<Filter>("ALL");
  const selected = new Set(selectedIds);

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: catalog.filter((c) => c.category === category),
  })).filter((g) => g.items.length > 0);
  const visibleGroups = filter === "ALL" ? groups : groups.filter((g) => g.category === filter);

  const pills: { key: Filter; label: string; icon: typeof LayoutGrid; count: number }[] = [
    { key: "ALL", label: t.catalog.all, icon: LayoutGrid, count: selectedIds.length },
    ...groups.map((g) => ({
      key: g.category,
      label: t.categories[g.category],
      icon: CATEGORY_STYLE[g.category].icon,
      count: g.items.filter((c) => selected.has(c.id)).length,
    })),
  ];

  return (
    <aside
      aria-label={t.catalog.title}
      className="flex min-w-0 flex-col border-zinc-800 bg-zinc-900/70 backdrop-blur-md max-lg:border-t lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:border-l"
    >
      <div className="flex items-end justify-between gap-3 px-5 pt-6 pb-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white">{t.catalog.title}</h2>
          <p className="text-sm text-zinc-400">{t.catalog.subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-zinc-700/80 bg-zinc-950/50 px-2.5 py-1 text-xs text-zinc-300 tabular-nums">
          {selectedIds.length} {t.catalog.selectedShort}
        </span>
      </div>

      {/* Category filter pills (stay pinned while the list scrolls). */}
      <div
        role="toolbar"
        aria-label={t.catalog.filter}
        className="z-10 flex flex-wrap gap-1.5 border-b border-zinc-800 bg-zinc-900/80 px-5 pb-3 backdrop-blur-md"
      >
        {pills.map(({ key, label, icon: Icon, count }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(key)}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition ${
                active
                  ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-200"
                  : "border-zinc-700/80 bg-zinc-950/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
              {count > 0 ? (
                <span className={`tabular-nums ${active ? "text-emerald-300" : "text-zinc-500"}`}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-zinc-400">{t.catalog.none}</p>
      ) : (
        <div className="flex flex-col gap-6 px-4 py-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto [scrollbar-color:var(--color-zinc-700)_transparent]">
          {visibleGroups.map(({ category, items }) => {
            const Icon = CATEGORY_STYLE[category].icon;
            return (
              <section key={category} aria-labelledby={`cat-${category}`}>
                <div className="mb-2.5 flex items-center gap-2 px-1">
                  <Icon className={`size-4 ${CATEGORY_STYLE[category].text}`} aria-hidden />
                  <h3 id={`cat-${category}`} className="text-sm font-semibold text-zinc-100">
                    {t.categories[category]}
                  </h3>
                  <span className="text-xs text-zinc-500">· {selectionHint(t, category, items)}</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {items.map((c) => (
                    <li key={c.id}>
                      <ComponentCard
                        component={c}
                        isSelected={selected.has(c.id)}
                        activeView={activeView}
                        onToggle={onToggle}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </aside>
  );
}

function Badge({ children, tone = "zinc" }: { children: React.ReactNode; tone?: "zinc" | "emerald" | "amber" }) {
  const tones = {
    zinc: "border-zinc-700/80 text-zinc-400",
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/35 bg-amber-500/10 text-amber-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 ${tones[tone]}`}>
      {children}
    </span>
  );
}

function GroupBadge({ group }: { group: string }) {
  const { t } = useDemoLocale();
  const Icon = GROUP_ICON[group] ?? Layers;
  return (
    <Badge>
      <Icon className="size-3" aria-hidden />
      {t.groups[group]?.label ?? group}
    </Badge>
  );
}

function ComponentCard({
  component: c,
  isSelected,
  activeView,
  onToggle,
}: {
  component: CatalogComponent;
  isSelected: boolean;
  activeView: ViewType;
  onToggle: (component: CatalogComponent) => void;
}) {
  const { t, formatNumber, formatPrice, componentName } = useDemoLocale();
  const inActiveView = c.viewType === activeView;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onToggle(c)}
      className={`group/card relative w-full overflow-hidden rounded-xl border p-3.5 pl-4 text-left transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
        isSelected
          ? "border-emerald-500/70 bg-emerald-500/[0.07] shadow-[inset_0_0_0_1px_rgb(16_185_129/0.25),inset_0_0_32px_rgb(16_185_129/0.12)]"
          : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/80"
      }`}
    >
      <span aria-hidden className={`absolute inset-y-3 left-0 w-[3px] rounded-r ${CATEGORY_STYLE[c.category].bar}`} />
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug font-medium text-zinc-100">{componentName(c)}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <code className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10.5px] tracking-tight text-zinc-400">
              {c.code}
            </code>
            <Badge tone={inActiveView ? "emerald" : "zinc"}>
              <Eye className="size-3" aria-hidden />
              <span className="sr-only">{t.catalog.view}: </span>
              {t.views[c.viewType].short}
            </Badge>
            {c.seats ? (
              <Badge tone="amber">
                <Users className="size-3" aria-hidden />
                {t.catalog.seats(c.seats)}
              </Badge>
            ) : null}
            {c.exclusiveGroup ? <GroupBadge group={c.exclusiveGroup} /> : null}
          </div>
        </div>
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-full border transition ${
            isSelected
              ? "border-emerald-400 bg-emerald-500 text-zinc-950 shadow-[0_0_14px_rgb(16_185_129/0.6)]"
              : "border-zinc-700 text-transparent group-hover/card:border-zinc-500"
          }`}
          aria-hidden
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      </div>
      <dl className="mt-3 flex items-center gap-4 border-t border-white/5 pt-2.5 text-xs text-zinc-400">
        <div className="mr-auto">
          <dt className="sr-only">{t.catalog.price}</dt>
          <dd className="text-sm font-semibold text-white tabular-nums">
            {c.price === 0 ? t.catalog.included : formatPrice(c.price)}
          </dd>
        </div>
        <div className="inline-flex items-center gap-1">
          <dt className="sr-only">{t.catalog.weight}</dt>
          <Weight className="size-3.5 text-zinc-500" aria-hidden />
          <dd className="tabular-nums">{formatNumber(c.weightKg)} kg</dd>
        </div>
        <div className="inline-flex items-center gap-1">
          <dt className="sr-only">{t.catalog.installTime}</dt>
          <Clock className="size-3.5 text-zinc-500" aria-hidden />
          <dd className="tabular-nums">{formatNumber(c.installTimeHours)} h</dd>
        </div>
      </dl>
    </button>
  );
}
