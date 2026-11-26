import { AppWindow, BrickWall, Sofa, Tent, Zap, type LucideIcon } from "lucide-react";
import type { ComponentCategory } from "@/lib/camperiada/configurator";

// Category accents — match the materials used in public/layers/*.svg
// (birch/felt walls, wooden furniture, amber electrics, cyan glass, slate roof).
export const CATEGORY_STYLE: Record<
  ComponentCategory,
  { icon: LucideIcon; dot: string; text: string; bar: string }
> = {
  WALL: { icon: BrickWall, dot: "bg-stone-300", text: "text-stone-300", bar: "bg-stone-300/70" },
  FURNITURE: { icon: Sofa, dot: "bg-amber-600", text: "text-amber-500", bar: "bg-amber-600/80" },
  ELECTRICAL: { icon: Zap, dot: "bg-amber-400", text: "text-amber-300", bar: "bg-amber-400/80" },
  WINDOW: { icon: AppWindow, dot: "bg-cyan-400", text: "text-cyan-300", bar: "bg-cyan-400/80" },
  ROOF: { icon: Tent, dot: "bg-slate-300", text: "text-slate-300", bar: "bg-slate-300/70" },
};
