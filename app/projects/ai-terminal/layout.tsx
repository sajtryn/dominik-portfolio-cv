import type { Metadata } from "next";
import type { ReactNode } from "react";

// The terminal page is a Client Component, which can't export metadata,
// so the route's title and description live here.
export const metadata: Metadata = {
  title: "AI Voice Terminal (Peter) · Dominik Rodziewicz",
  description:
    "Live view into Peter, a custom Python voice assistant: speech-to-text, tokenization, intent detection and autonomous function calling.",
};

export default function AiTerminalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
