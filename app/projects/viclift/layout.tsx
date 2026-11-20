import type { Metadata } from "next";
import type { ReactNode } from "react";

// The portal page is a Client Component, which can't export metadata,
// so the route's title and description live here.
export const metadata: Metadata = {
  title: "VicLift // Authorization · Dominik Rodziewicz",
  description:
    "VicLift: B2B SaaS for personal trainers and athletes (beta). Interactive concept of the coach and athlete dashboards.",
};

export default function VicLiftLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
