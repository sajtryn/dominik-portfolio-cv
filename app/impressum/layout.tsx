import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component (it follows the language switcher), which
// can't export metadata, so the route's title lives here.
export const metadata: Metadata = {
  title: "Impressum · DomRod-IT",
  description: "Legal notice: VictoriaCamp-IT Dominik Rodziewicz, Gubin, Poland.",
};

export default function ImpressumLayout({ children }: { children: ReactNode }) {
  return children;
}
