"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";

type RTLContextValue = {
  isRTL: boolean;
  dir: "ltr" | "rtl";
};

const RTLContext = createContext<RTLContextValue | undefined>(undefined);

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const rtlLanguages = ["ar", "he", "fa", "ur"]; // Arabic, Hebrew, Persian, Urdu
    const shouldBeRTL = rtlLanguages.includes(locale);
    setIsRTL(shouldBeRTL);
    
    // Update document direction
    document.documentElement.dir = shouldBeRTL ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  const value = {
    isRTL,
    dir: isRTL ? "rtl" : "ltr" as const,
  };

  return <RTLContext.Provider value={value}>{children}</RTLContext.Provider>;
}

export function useRTL() {
  const ctx = useContext(RTLContext);
  if (!ctx) throw new Error("useRTL must be used within RTLProvider");
  return ctx;
}
