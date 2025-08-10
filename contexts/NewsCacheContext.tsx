import React, { createContext, useContext, useMemo, useRef } from "react";

export type NewsTab = "news" | "favorite";

export interface NewsCacheEntry {
  items: any[];
  updatedAt: number;
}

interface NewsCacheContextValue {
  getCache: (tab: NewsTab, subjectKey: string) => NewsCacheEntry | undefined;
  setCache: (tab: NewsTab, subjectKey: string, items: any[]) => void;
}

const NewsCacheContext = createContext<NewsCacheContextValue | undefined>(undefined);

function buildNewsKey(tab: NewsTab, subjectKey: string): string {
  return `${tab}|${subjectKey || "all"}`;
}

export const NewsCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cacheRef = useRef<Record<string, NewsCacheEntry>>({});

  const value: NewsCacheContextValue = useMemo(() => ({
    getCache: (tab, subjectKey) => {
      const key = buildNewsKey(tab, subjectKey);
      return cacheRef.current[key];
    },
    setCache: (tab, subjectKey, items) => {
      const key = buildNewsKey(tab, subjectKey);
      cacheRef.current[key] = { items, updatedAt: Date.now() };
    },
  }), []);

  return (
    <NewsCacheContext.Provider value={value}>{children}</NewsCacheContext.Provider>
  );
};

export function useNewsCache() {
  const ctx = useContext(NewsCacheContext);
  if (!ctx) throw new Error("useNewsCache must be used within NewsCacheProvider");
  return ctx;
} 