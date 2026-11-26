// Pure configurator domain logic (no React, no server imports) so it can be
// reused by the UI now and by the calculator / save features later.
export type ComponentCategory = "WALL" | "FURNITURE" | "ELECTRICAL" | "ROOF" | "WINDOW";
/** Which 2D projection of the van a component layer is drawn on. */
export type ViewType = "TOP" | "LEFT" | "RIGHT";

export type CatalogComponent = {
  id: string;
  code: string;
  category: ComponentCategory;
  name: string;
  /** Price in grosze. */
  price: number;
  weightKg: number;
  installTimeHours: number;
  powerWatts: number | null;
  imageLayerUrl: string;
  viewType: ViewType;
  /** Mutually exclusive group, e.g. "SLEEPING" (one bed layout at a time). */
  exclusiveGroup: string | null;
  /** Travelling seats in the layout, including the cab. */
  seats: number | null;
};

/** A ruler span in SVG units of the shared 800 × 400 viewBox. */
export type RulerSpan = {
  from: number;
  to: number;
  mm: number;
  label: "length" | "width" | "height";
  reverse?: boolean;
};

export type ViewDef = {
  type: ViewType;
  baseUrl: string;
  /** Millimetre rulers drawn along the top (x) and left (y) edges of the canvas. */
  rulers: { x: RulerSpan; y: RulerSpan };
};

// Cargo area of the VW T5 (L1): 2570 mm long, 1690 mm wide, ~1360 mm high
// inside — see scripts/generate-layers.mjs for the SVG geometry.
export const VIEWS: ViewDef[] = [
  {
    type: "TOP",
    baseUrl: "/camperiada/layers/base-top.svg",
    rulers: {
      x: { from: 72, to: 452, mm: 2570, label: "length" },
      y: { from: 80, to: 320, mm: 1690, label: "width" },
    },
  },
  {
    type: "LEFT",
    baseUrl: "/camperiada/layers/base-left.svg",
    rulers: {
      x: { from: 72, to: 452, mm: 2570, label: "length" },
      y: { from: 124, to: 318, mm: 1360, label: "height" },
    },
  },
  {
    type: "RIGHT",
    baseUrl: "/camperiada/layers/base-right.svg",
    rulers: {
      x: { from: 348, to: 728, mm: 2570, label: "length", reverse: true },
      y: { from: 124, to: 318, mm: 1360, label: "height" },
    },
  },
];

export const VIEW_BY_TYPE = Object.fromEntries(VIEWS.map((v) => [v.type, v])) as Record<
  ViewType,
  (typeof VIEWS)[number]
>;

type CategoryMeta = {
  /** Stacking order of layers on the canvas (higher = on top). */
  zIndex: number;
  /** Only one component of this category can be selected at a time. */
  singleSelect: boolean;
};

export const CATEGORY_META: Record<ComponentCategory, CategoryMeta> = {
  WALL: { zIndex: 10, singleSelect: true },
  FURNITURE: { zIndex: 20, singleSelect: false },
  ELECTRICAL: { zIndex: 30, singleSelect: false },
  WINDOW: { zIndex: 40, singleSelect: false },
  ROOF: { zIndex: 50, singleSelect: true },
};

/** Sidebar order. */
export const CATEGORY_ORDER: ComponentCategory[] = [
  "WALL",
  "FURNITURE",
  "ELECTRICAL",
  "WINDOW",
  "ROOF",
];

/** True when `a` and `b` cannot both be selected. */
export function conflicts(a: CatalogComponent, b: CatalogComponent): boolean {
  if (a.id === b.id) return false;
  if (a.category === b.category && CATEGORY_META[a.category].singleSelect) return true;
  return a.exclusiveGroup !== null && a.exclusiveGroup === b.exclusiveGroup;
}

/**
 * Returns the new selection after clicking a component: deselects it if it was
 * selected; otherwise selects it and drops anything it conflicts with (same
 * single-select category, or same exclusive group such as bed layouts).
 */
export function toggleSelection(
  selectedIds: readonly string[],
  component: CatalogComponent,
  catalog: readonly CatalogComponent[],
): string[] {
  if (selectedIds.includes(component.id)) {
    return selectedIds.filter((id) => id !== component.id);
  }
  const conflicting = new Set(catalog.filter((c) => conflicts(component, c)).map((c) => c.id));
  return [...selectedIds.filter((id) => !conflicting.has(id)), component.id];
}

/** Selected components drawn on the given view, bottom layer first. */
export function layersForView(
  selected: readonly CatalogComponent[],
  view: ViewType,
): CatalogComponent[] {
  return selected
    .filter((c) => c.viewType === view)
    .sort((a, b) => CATEGORY_META[a.category].zIndex - CATEGORY_META[b.category].zIndex);
}
