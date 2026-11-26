"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { useDemoLocale } from "./use-demo-locale";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Blocks closing (Esc / backdrop / ×) while a request is in flight. */
  busy?: boolean;
};

/**
 * Dark studio-style modal built on the native <dialog> element, which gives
 * focus trapping, Esc handling and the top layer for free.
 */
export function DarkDialog({ open, onClose, title, description, children, busy = false }: Props) {
  const { t } = useDemoLocale();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() focuses the first focusable element (the × button);
      // move focus to the element marked with data-autofocus instead.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
    // Next.js hides routes with <Activity> instead of unmounting them: release
    // the modal so it cannot keep the next page inert.
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        // A click on the ::backdrop targets the <dialog> element itself.
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-0 text-zinc-100 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop:bg-zinc-950/70 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-6">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label={t.projects.close}
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-emerald-500 disabled:opacity-40"
        >
          <X className="size-4" aria-hidden />
        </button>
        <h2 id={titleId} className="pr-8 text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
        {description ? (
          <div id={descId} className="mt-1.5 text-sm text-zinc-400">
            {description}
          </div>
        ) : null}
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}

export const dialogButton = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-[0_0_24px_-6px_rgb(16_185_129/0.7)] transition hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60",
} as const;
