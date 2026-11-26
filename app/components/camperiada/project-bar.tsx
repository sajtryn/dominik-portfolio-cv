"use client";

import { Check, CloudOff, CopyPlus, FolderOpen, Save, Trash2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { pluralPl } from "@/lib/camperiada/calculator";
import {
  deleteBuild,
  getSavedBuilds,
  getServerSavedBuilds,
  saveBuild,
  subscribeSavedBuilds,
  type SavedBuild,
} from "@/lib/camperiada/saved-builds";
import { DarkDialog, dialogButton } from "./dark-dialog";

export type LoadedProject = { id: string; name: string };

type Props = {
  project: LoadedProject | null;
  selectedIds: string[];
  /** True when the selection differs from the last saved version. */
  dirty: boolean;
  onSaved: (project: LoadedProject, componentIds: string[]) => void;
  onOpen: (build: SavedBuild) => void;
  /** The open project was deleted from the list. */
  onDeleted: () => void;
};

type ModalMode = "create" | "saveAs" | "list" | null;

const TOAST_MS = 2600;
const STORAGE_ERROR = "Przeglądarka nie pozwala zapisać projektu (pamięć lokalna jest niedostępna).";

export function ProjectBar({ project, selectedIds, dirty, onSaved, onOpen, onDeleted }: Props) {
  const builds = useSyncExternalStore(subscribeSavedBuilds, getSavedBuilds, getServerSavedBuilds);
  const [modal, setModal] = useState<ModalMode>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  function openModal(mode: ModalMode) {
    setError(null);
    setModal(mode);
  }

  function closeModal() {
    setError(null);
    setModal(null);
  }

  /** Writes the current selection under `id`; false when storage refused. */
  function store(id: string, name: string, message: string): boolean {
    const componentIds = [...selectedIds];
    if (!saveBuild({ id, name, componentIds, updatedAt: Date.now() })) {
      setError(STORAGE_ERROR);
      return false;
    }
    onSaved({ id, name }, componentIds);
    setError(null);
    setToast(message);
    return true;
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          >
            <FolderOpen className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
              {project ? "Projekt" : "Nowy projekt"}
            </p>
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate font-semibold text-white" title={project?.name}>
                {project ? project.name : "Niezapisana konfiguracja"}
              </p>
              {project && dirty ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                  <span aria-hidden className="size-1.5 rounded-full bg-amber-400" />
                  Niezapisane zmiany
                </span>
              ) : null}
              {toast ? (
                <span
                  role="status"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300"
                >
                  <Check className="size-3" aria-hidden />
                  {toast}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => openModal("list")} className={dialogButton.secondary}>
            <FolderOpen className="size-4" aria-hidden />
            Moje projekty
            {builds.length > 0 ? <span className="tabular-nums">({builds.length})</span> : null}
          </button>
          {project ? (
            <>
              <button type="button" onClick={() => openModal("saveAs")} className={dialogButton.secondary}>
                <CopyPlus className="size-4" aria-hidden />
                Zapisz jako nowy
              </button>
              <button
                type="button"
                onClick={() => store(project.id, project.name, "Zapisano zmiany")}
                disabled={!dirty}
                className={dialogButton.primary}
              >
                {dirty ? <Save className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />}
                {dirty ? "Zapisz zmiany" : "Zapisano"}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => openModal("create")} className={dialogButton.primary}>
              <Save className="size-4" aria-hidden />
              Zapisz projekt
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 flex items-start gap-1.5 px-1 text-xs text-zinc-500">
        <CloudOff className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Tryb demo — zapis w chmurze jest wyłączony. Projekty zostają tylko w tej przeglądarce.
      </p>

      {error && !modal ? (
        <p role="alert" className="mt-2 px-1 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <DarkDialog
        open={modal === "create" || modal === "saveAs"}
        onClose={closeModal}
        title={modal === "saveAs" ? "Zapisz jako nowy projekt" : "Zapisz projekt"}
        description="Projekt zostanie zapisany lokalnie w tej przeglądarce — znajdziesz go w „Moje projekty”."
      >
        {/* key: reset the uncontrolled input every time the dialog opens */}
        <SaveForm
          key={`${modal}-${project?.id}`}
          defaultName={modal === "saveAs" && project ? `${project.name} (kopia)` : ""}
          error={error}
          onCancel={closeModal}
          onSubmit={(name) => {
            if (!name) {
              setError("Podaj nazwę projektu.");
              return;
            }
            const message = modal === "saveAs" ? "Zapisano jako nowy projekt" : "Projekt zapisany";
            if (store(crypto.randomUUID(), name, message)) setModal(null);
          }}
        />
      </DarkDialog>

      <DarkDialog
        open={modal === "list"}
        onClose={closeModal}
        title="Moje projekty"
        description="Tryb demo — projekty są przechowywane tylko w tej przeglądarce."
      >
        {builds.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">Nie masz jeszcze zapisanych projektów.</p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {builds.map((b) => (
              <li key={b.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpen(b);
                    closeModal();
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-800 px-3 py-2 text-left transition hover:border-emerald-500/60 hover:bg-emerald-500/[0.07]"
                >
                  <span className="block truncate text-sm font-medium text-zinc-100">{b.name}</span>
                  <span className="block text-xs text-zinc-500">
                    {b.componentIds.length}{" "}
                    {pluralPl(b.componentIds.length, "element", "elementy", "elementów")} ·{" "}
                    {new Date(b.updatedAt).toLocaleDateString("pl-PL")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteBuild(b.id) && b.id === project?.id) onDeleted();
                  }}
                  aria-label={`Usuń projekt: ${b.name}`}
                  title="Usuń projekt"
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </DarkDialog>
    </div>
  );
}

function SaveForm({
  defaultName,
  error,
  onCancel,
  onSubmit,
}: {
  defaultName: string;
  error: string | null;
  onCancel: () => void;
  onSubmit: (name: string) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(String(new FormData(event.currentTarget).get("name") ?? "").trim());
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="project-name" className="text-sm font-medium text-zinc-200">
          Nazwa projektu
        </label>
        <input
          id="project-name"
          name="name"
          defaultValue={defaultName}
          placeholder="np. Mój VW T5 na wakacje"
          autoComplete="off"
          data-autofocus
          maxLength={80}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "project-name-error" : undefined}
          className={`h-11 rounded-lg border bg-zinc-950 px-3 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:ring-2 ${
            error
              ? "border-red-500 focus:ring-red-500/30"
              : "border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/25"
          }`}
        />
        {error ? (
          <p id="project-name-error" role="alert" className="text-sm text-red-400">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={dialogButton.secondary}>
          Anuluj
        </button>
        <button type="submit" className={dialogButton.primary}>
          <Save className="size-4" aria-hidden />
          Zapisz
        </button>
      </div>
    </form>
  );
}
