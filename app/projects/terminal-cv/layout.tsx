import type { Metadata } from "next";
import type { ReactNode } from "react";

// The terminal page is a Client Component, which can't export metadata,
// so the route's title and description live here.
export const metadata: Metadata = {
  title: "dominik@portfolio:~$ · Interactive Profile (CLI)",
  description:
    "Dominik Rodziewicz's resume as a command-line interface: type help, whoami, skills or download_cv.",
};

export default function TerminalCvLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
