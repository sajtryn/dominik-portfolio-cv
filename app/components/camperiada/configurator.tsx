"use client";

import { useState, type ReactNode } from "react";
import { CATALOG } from "@/lib/camperiada/catalog";
import { BuildSummary } from "./build-summary";
import { ComponentCatalog } from "./component-catalog";
import { ConfiguratorStage } from "./configurator-stage";
import { ProjectBar, type LoadedProject } from "./project-bar";
import { useConfigurator } from "./use-configurator";

const KNOWN_IDS = new Set(CATALOG.map((c) => c.id));

function sameSelection(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
}

export function Configurator({ header }: { header: ReactNode }) {
  const state = useConfigurator(CATALOG);
  const [project, setProject] = useState<LoadedProject | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const dirty = !sameSelection(state.selectedIds, savedIds);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,30%)]">
      <div className="min-w-0 px-4 py-8 sm:px-8">
        {header}
        <ProjectBar
          project={project}
          selectedIds={state.selectedIds}
          dirty={dirty}
          onSaved={(saved, ids) => {
            setProject(saved);
            setSavedIds(ids);
          }}
          onOpen={(build) => {
            // localStorage is user-editable: ignore ids the catalogue does not know.
            const ids = build.componentIds.filter((id) => KNOWN_IDS.has(id));
            setProject({ id: build.id, name: build.name });
            setSavedIds(ids);
            state.setSelectedIds(ids);
          }}
          onDeleted={() => {
            setProject(null);
            setSavedIds([]);
          }}
        />
        <ConfiguratorStage
          catalog={CATALOG}
          selectedIds={state.selectedIds}
          activeView={state.activeView}
          onViewChange={state.setActiveView}
          onReset={state.reset}
        />
        <div className="mt-5">
          <BuildSummary
            summary={state.summary}
            selected={state.selectedComponents}
            onRemove={state.remove}
          />
        </div>
      </div>
      <ComponentCatalog
        catalog={CATALOG}
        selectedIds={state.selectedIds}
        activeView={state.activeView}
        onToggle={state.toggle}
      />
    </div>
  );
}
