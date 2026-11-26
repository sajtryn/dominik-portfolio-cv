"use client";

import { Grid3x3, Layers, RotateCcw } from "lucide-react";
import { useState, type CSSProperties } from "react";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  VIEWS,
  VIEW_BY_TYPE,
  type CatalogComponent,
  type ViewType,
} from "@/lib/camperiada/configurator";
import { CanvasRulers } from "./canvas-rulers";
import { CATEGORY_STYLE } from "./category-style";
import { useDemoLocale } from "./use-demo-locale";

type Props = {
  catalog: CatalogComponent[];
  selectedIds: string[];
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onReset: () => void;
};

// CAD grid: minor lines every 20 SVG units, major every 100 (matches the 800 × 400 viewBox).
const gridStyle: CSSProperties = {
  backgroundImage: [
    "linear-gradient(to right, rgb(148 163 184 / 0.11) 1px, transparent 1px)",
    "linear-gradient(to bottom, rgb(148 163 184 / 0.11) 1px, transparent 1px)",
    "linear-gradient(to right, rgb(148 163 184 / 0.05) 1px, transparent 1px)",
    "linear-gradient(to bottom, rgb(148 163 184 / 0.05) 1px, transparent 1px)",
  ].join(","),
  backgroundSize: "12.5% 25%, 12.5% 25%, 2.5% 5%, 2.5% 5%",
};

const layerImg =
  "pointer-events-none absolute inset-0 h-full w-full object-contain select-none transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none";

export function ConfiguratorStage({ catalog, selectedIds, activeView, onViewChange, onReset }: Props) {
  const { t, componentName, layerUrl } = useDemoLocale();
  const [showGrid, setShowGrid] = useState(true);
  const view = VIEW_BY_TYPE[activeView];
  const selected = new Set(selectedIds);
  const countIn = (v: ViewType) => catalog.filter((c) => c.viewType === v && selected.has(c.id)).length;
  const activeCount = countIn(activeView);

  return (
    <section aria-label={t.stage.preview} className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label={t.stage.viewTabs}
          className="grid w-full grid-cols-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-1 shadow-lg shadow-black/30 backdrop-blur sm:inline-flex sm:w-auto"
        >
          {VIEWS.map((v) => {
            const isActive = v.type === activeView;
            const count = countIn(v.type);
            return (
              <button
                key={v.type}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="configurator-canvas"
                aria-label={t.views[v.type].label}
                onClick={() => onViewChange(v.type)}
                className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium whitespace-nowrap transition sm:px-4 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-[0_0_20px_-4px_rgb(16_185_129/0.7)]"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                <span className="sm:hidden">{t.views[v.type].short}</span>
                <span className="hidden sm:inline">{t.views[v.type].label}</span>
                {count > 0 ? (
                  <span
                    className={`grid min-w-5 place-items-center rounded-full px-1.5 text-xs tabular-nums ${
                      isActive ? "bg-white/20" : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={selectedIds.length === 0}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="size-4" aria-hidden />
          {t.stage.reset}
        </button>
      </div>

      <div
        id="configurator-canvas"
        role="tabpanel"
        aria-label={t.views[activeView].label}
        className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.04)]"
        style={showGrid ? gridStyle : undefined}
      >
        {/* vignette for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(0_0_0/0.45))]"
        />

        {/* base blueprints — cross-fade between views */}
        {VIEWS.map((v) => (
          // eslint-disable-next-line @next/next/no-img-element -- static SVG blueprint layers
          <img
            key={v.type}
            src={layerUrl(v.baseUrl)}
            alt={v.type === activeView ? t.stage.outline(t.views[v.type].label) : ""}
            aria-hidden={v.type !== activeView}
            draggable={false}
            className={`${layerImg} z-[1] ${v.type === activeView ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {/* component layers — always mounted so toggling animates */}
        {catalog.map((c) => {
          const visible = c.viewType === activeView && selected.has(c.id);
          return (
            // eslint-disable-next-line @next/next/no-img-element -- stacked SVG overlays
            <img
              key={c.id}
              src={layerUrl(c.imageLayerUrl)}
              alt={visible ? componentName(c) : ""}
              aria-hidden={!visible}
              draggable={false}
              loading="lazy"
              className={`${layerImg} ${visible ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"}`}
              style={{ zIndex: CATEGORY_META[c.category].zIndex }}
            />
          );
        })}

        <CanvasRulers view={view} />

        {/* HUD: title */}
        <div className="pointer-events-none absolute top-[7%] left-[3.5%] z-[70] max-w-[70%] rounded-lg max-sm:hidden border border-white/10 bg-zinc-950/55 px-2.5 py-1.5 shadow-lg shadow-black/40 backdrop-blur-md sm:px-3">
          <p className="truncate text-[11px] font-semibold tracking-wide text-zinc-100 sm:text-xs">
            VW T5 <span className="text-emerald-400">•</span> {t.stage.drawing}
          </p>
          <p className="hidden truncate text-[11px] text-zinc-400 sm:block">
            {t.views[activeView].label}
            {t.views[activeView].hint ? ` · ${t.views[activeView].hint}` : ""}
          </p>
        </div>

        {/* HUD: controls */}
        <div className="absolute right-[2.5%] bottom-[4%] z-[70] flex origin-bottom-right items-center gap-1 rounded-lg border border-white/10 bg-zinc-950/55 p-1 shadow-lg shadow-black/40 backdrop-blur-md max-sm:scale-[0.8]">
          <button
            type="button"
            onClick={() => setShowGrid((v) => !v)}
            aria-pressed={showGrid}
            title={showGrid ? t.stage.hideGrid : t.stage.showGrid}
            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition ${
              showGrid ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <Grid3x3 className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">{t.stage.grid}</span>
          </button>
          <span className="h-4 w-px bg-white/10" aria-hidden />
          <p aria-live="polite" className="inline-flex items-center gap-1.5 px-2 text-xs text-zinc-300">
            <Layers className="size-3.5 text-emerald-400" aria-hidden />
            <span className="tabular-nums">
              <strong className="font-semibold text-white">{activeCount}</strong>
              <span className="text-zinc-500"> / {selectedIds.length}</span>
            </span>
            <span className="hidden text-zinc-400 sm:inline">{t.stage.modulesInView}</span>
          </p>
        </div>

        {selectedIds.length === 0 ? (
          <p className="absolute inset-x-0 top-1/2 z-[65] mx-auto w-fit -translate-y-1/2 rounded-full border border-white/10 bg-zinc-950/70 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur max-sm:hidden">
            {t.stage.empty}
          </p>
        ) : null}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-500" aria-label={t.stage.legend}>
        {CATEGORY_ORDER.map((key) => (
          <li key={key} className="inline-flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${CATEGORY_STYLE[key].dot}`} aria-hidden />
            {t.categories[key]}
          </li>
        ))}
      </ul>
    </section>
  );
}
