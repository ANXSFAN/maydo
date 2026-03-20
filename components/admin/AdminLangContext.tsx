"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAdminT, type AdminLocale, type AdminKey } from "@/lib/admin-i18n";

type ContextType = {
  locale: AdminLocale;
  setLocale: (l: AdminLocale) => void;
  t: (key: AdminKey, params?: Record<string, string | number>) => string;
};

const AdminLangContext = createContext<ContextType>({
  locale: "es",
  setLocale: () => {},
  t: (k) => k,
});

export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>("es");

  useEffect(() => {
    const saved = localStorage.getItem("admin-lang") as AdminLocale | null;
    if (saved === "es" || saved === "zh") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: AdminLocale) => {
    setLocaleState(l);
    localStorage.setItem("admin-lang", l);
  }, []);

  const t = useCallback(
    (key: AdminKey, params?: Record<string, string | number>) => getAdminT(locale)(key, params),
    [locale]
  );

  return (
    <AdminLangContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang() {
  return useContext(AdminLangContext);
}
