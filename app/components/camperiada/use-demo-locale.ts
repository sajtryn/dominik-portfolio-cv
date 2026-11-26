"use client";

import { useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { demoLocale } from "@/lib/camperiada/i18n";

export function useDemoLocale() {
  const { language } = useLanguage();
  return useMemo(() => demoLocale(language), [language]);
}
