"use client";

import { useCallback, useMemo, useState } from "react";
import { calculateBuildSummary } from "@/lib/camperiada/calculator";
import {
  layersForView,
  toggleSelection,
  type CatalogComponent,
  type ViewType,
} from "@/lib/camperiada/configurator";

/**
 * Configurator state: the active view and the selected component IDs.
 * `selectedIds` is the single source of truth — the cost calculator and
 * save/load features plug in here. `initialIds` pre-selects a saved project.
 */
export function useConfigurator(
  catalog: readonly CatalogComponent[],
  initialIds: readonly string[] = [],
) {
  const [activeView, setActiveView] = useState<ViewType>("TOP");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [...initialIds]);

  const byId = useMemo(() => new Map(catalog.map((c) => [c.id, c])), [catalog]);

  const selectedComponents = useMemo(
    () => selectedIds.map((id) => byId.get(id)).filter((c): c is CatalogComponent => !!c),
    [selectedIds, byId],
  );

  const activeLayers = useMemo(
    () => layersForView(selectedComponents, activeView),
    [selectedComponents, activeView],
  );

  const toggle = useCallback(
    (component: CatalogComponent) =>
      setSelectedIds((ids) => toggleSelection(ids, component, catalog)),
    [catalog],
  );

  const remove = useCallback(
    (id: string) => setSelectedIds((ids) => ids.filter((x) => x !== id)),
    [],
  );

  const reset = useCallback(() => setSelectedIds([]), []);

  const summary = useMemo(() => calculateBuildSummary(selectedComponents), [selectedComponents]);

  return {
    activeView,
    setActiveView,
    selectedIds,
    setSelectedIds,
    selectedComponents,
    activeLayers,
    summary,
    toggle,
    remove,
    reset,
  };
}
