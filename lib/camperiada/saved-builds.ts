// "Saved projects" of the demo: kept in this browser's localStorage only.
// Exposed as an external store so the server render and hydration both see an
// empty list, with no effect needed to load it.

export type SavedBuild = {
  id: string;
  name: string;
  componentIds: string[];
  /** Epoch milliseconds. */
  updatedAt: number;
};

const STORAGE_KEY = "camperiada-demo-builds";

const EMPTY: SavedBuild[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedBuilds: SavedBuild[] = EMPTY;

function isSavedBuild(value: unknown): value is SavedBuild {
  const b = value as Partial<SavedBuild> | null;
  return (
    typeof b?.id === "string" &&
    typeof b.name === "string" &&
    typeof b.updatedAt === "number" &&
    Array.isArray(b.componentIds) &&
    b.componentIds.every((id) => typeof id === "string")
  );
}

function parse(raw: string | null): SavedBuild[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isSavedBuild) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Same array instance until the stored text changes (required by React). */
export function getSavedBuilds(): SavedBuild[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY; // storage blocked
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedBuilds = parse(raw);
  }
  return cachedBuilds;
}

export function getServerSavedBuilds(): SavedBuild[] {
  return EMPTY;
}

export function subscribeSavedBuilds(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener); // changes from other tabs
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** False when the browser refuses to store (private mode, quota). */
function write(builds: SavedBuild[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
  } catch {
    return false;
  }
  listeners.forEach((listener) => listener());
  return true;
}

/** Creates the build, or replaces the one with the same id. Newest first. */
export function saveBuild(build: SavedBuild): boolean {
  return write([build, ...getSavedBuilds().filter((b) => b.id !== build.id)]);
}

export function deleteBuild(id: string): boolean {
  return write(getSavedBuilds().filter((b) => b.id !== id));
}
