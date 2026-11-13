import type { Metadata } from "next";
import type { ReactNode } from "react";

// The dashboard page is a Client Component, which can't export metadata,
// so the route's title and description live here.
export const metadata: Metadata = {
  title: "Smart Camper IoT Telemetry · Dominik Rodziewicz",
  description:
    "Live telemetry dashboard for a VictoriaCamp-IT campervan: solar yield, battery, water tanks, climate and MQTT system logs.",
};

export default function SmartCamperLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
