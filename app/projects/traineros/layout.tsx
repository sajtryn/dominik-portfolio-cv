import type { Metadata } from "next";
import type { ReactNode } from "react";

// The portal page is a Client Component, which can't export metadata,
// so the route's title and description live here.
export const metadata: Metadata = {
  title: "TrainerOS // Authorization · Dominik Rodziewicz",
  description:
    "TrainerOS — a premium B2B coaching platform. Phase 1: data architecture and dual-role login portal for coaches and athletes.",
};

export default function TrainerOsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
