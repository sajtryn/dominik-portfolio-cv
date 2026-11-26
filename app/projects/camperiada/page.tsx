import type { Metadata } from "next";
import { DemoShell } from "@/app/components/camperiada/demo-shell";

export const metadata: Metadata = {
  title: "Camperiada · Interactive Demo · Dominik Rodziewicz",
  description:
    "Interactive 2D campervan configurator for the VW T5 with a live price, weight and installation time calculator.",
};

// Frontend-only demo of Camperiada: static catalogue, no login, no server calls.
// All styling is Tailwind utilities on this tree, so nothing leaks into the
// portfolio's global CSS.
export default function CamperiadaDemoPage() {
  return <DemoShell />;
}
