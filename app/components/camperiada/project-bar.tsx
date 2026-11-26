"use client";

import { Check, CloudOff, CopyPlus, FolderOpen, Save, Trash2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  deleteBuild,
  getSavedBuilds,
  getServerSavedBuilds,
  saveBuild,
  subscribeSavedBuilds,
  type SavedBuild,
} from "@/lib/camperiada/saved-builds";
import { DarkDialog, dialogButton } from "./dark-dialog";
import { useDemoLocale } from "./use-demo-locale";

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
/** Messages are kept as keys so they follow a language switch. */
type ErrorKey = "storageError" | "nameRequired";
type ToastKey = "toastChanges" | "toastAsNew" | "toastSaved";

export function ProjectBar({ project, selectedIds, dirty, onSaved, onOpen, onDeleted }: Props) {
  const { t, formatDate } = useDemoLocale();
  const builds = useSyncExternalStore(subscribeSavedBuilds, getSavedBuilds, getServerSavedBuilds);
  const [modal, setModal] = useState<ModalMode>(null);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [toast, setToast] = useState<ToastKey | null>(null);

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
  function store(id: string, name: string, message: ToastKey): boolean {
    const componentIds = [...selectedIds];
    if (!saveBuild({ id, name, componentIds, updatedAt: Date.now() })) {
      setError("storageError");
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
              {project ? t.projects.project : t.projects.newProject}
            </p>
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate font-semibold text-white" title={project?.name}>
                {project ? project.name : t.projects.unsaved}
              </p>
              {project && dirty ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                  <span aria-hidden className="size-1.5 rounded-full bg-amber-400" />
                  {t.projects.unsavedChanges}
                </span>
              ) : null}
              {toast ? (
                <span
                  role="status"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300"
                >
                  <Check className="size-3" aria-hidden />
                  {t.projects[toast]}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => openModal("list")} className={dialogButton.secondary}>
            <FolderOpen className="size-4" aria-hidden />
            {t.projects.mine}
            {builds.length > 0 ? <span className="tabular-nums">({builds.length})</span> : null}
          </button>
          {project ? (
            <>
              <button type="button" onClick={() => openModal("saveAs")} className={dialogButton.secondary}>
                <CopyPlus className="size-4" aria-hidden />
                {t.projects.saveAs}
              </button>
              <button
                type="button"
                onClick={() => store(project.id, project.name, "toastChanges")}
                disabled={!dirty}
                className={dialogButton.primary}
              >
                {dirty ? <Save className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />}
                {dirty ? t.projects.saveChanges : t.projects.saved}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => openModal("create")} className={dialogButton.primary}>
              <Save className="size-4" aria-hidden />
              {t.projects.saveProject}
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 flex items-start gap-1.5 px-1 text-xs text-zinc-500">
        <CloudOff className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t.projects.demoNotice}
      </p>

      {error && !modal ? (
        <p role="alert" className="mt-2 px-1 text-sm text-red-400">
          {t.projects[error]}
        </p>
      ) : null}

      <DarkDialog
        open={modal === "create" || modal === "saveAs"}
        onClose={closeModal}
        title={modal === "saveAs" ? t.projects.saveAsTitle : t.projects.saveProject}
        description={t.projects.saveDescription}
      >
        {/* key: reset the uncontrolled input every time the dialog opens */}
        <SaveForm
          key={`${modal}-${project?.id}`}
          defaultName={modal === "saveAs" && project ? `${project.name} ${t.projects.copySuffix}` : ""}
          error={error ? t.projects[error] : null}
          onCancel={closeModal}
          onSubmit={(name) => {
            if (!name) {
              setError("nameRequired");
              return;
            }
            const message = modal === "saveAs" ? "toastAsNew" : "toastSaved";
            if (store(crypto.randomUUID(), name, message)) setModal(null);
          }}
        />
      </DarkDialog>

      <DarkDialog
        open={modal === "list"}
        onClose={closeModal}
        title={t.projects.mine}
        description={t.projects.listDescription}
      >
        {builds.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">{t.projects.listEmpty}</p>
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
                    {t.summary.items(b.componentIds.length)} · {formatDate(b.updatedAt)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteBuild(b.id) && b.id === project?.id) onDeleted();
                  }}
                  aria-label={t.projects.deleteNamed(b.name)}
                  title={t.projects.delete}
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
  const { t } = useDemoLocale();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(String(new FormData(event.currentTarget).get("name") ?? "").trim());
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="project-name" className="text-sm font-medium text-zinc-200">
          {t.projects.nameLabel}
        </label>
        <input
          id="project-name"
          name="name"
          defaultValue={defaultName}
          placeholder={t.projects.namePlaceholder}
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
          {t.projects.cancel}
        </button>
        <button type="submit" className={dialogButton.primary}>
          <Save className="size-4" aria-hidden />
          {t.projects.save}
        </button>
      </div>
    </form>
  );
}
