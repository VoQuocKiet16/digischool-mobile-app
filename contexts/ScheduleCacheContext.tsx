import React, { createContext, useContext, useMemo, useRef } from "react";

export interface ScheduleCacheEntry {
  schedule: any[][];
  lessonIds: string[][];
  dateRange?: { start: string; end: string } | null;
  updatedAt: number;
}

interface ScheduleCacheContextValue {
  getCache: (key: string) => ScheduleCacheEntry | undefined;
  setCache: (key: string, entry: Omit<ScheduleCacheEntry, "updatedAt">) => void;
}

const ScheduleCacheContext = createContext<ScheduleCacheContextValue | undefined>(undefined);

export function buildScheduleKey(params: {
  role: "student" | "teacher";
  userKey: string; // className for student or teacherId for teacher
  academicYear: string;
  weekNumber: number;
}): string {
  const { role, userKey, academicYear, weekNumber } = params;
  return `${role}|${userKey}|${academicYear}|${weekNumber}`;
}

export const ScheduleCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cacheRef = useRef<Record<string, ScheduleCacheEntry>>({});

  const value = useMemo<ScheduleCacheContextValue>(() => ({
    getCache: (key) => {
      return cacheRef.current[key];
    },
    setCache: (key, entry) => {
      cacheRef.current[key] = { ...entry, updatedAt: Date.now() };
    },
  }), []);

  return (
    <ScheduleCacheContext.Provider value={value}>
      {children}
    </ScheduleCacheContext.Provider>
  );
};

export function useScheduleCache() {
  const ctx = useContext(ScheduleCacheContext);
  if (!ctx) throw new Error("useScheduleCache must be used within ScheduleCacheProvider");
  return ctx;
} 