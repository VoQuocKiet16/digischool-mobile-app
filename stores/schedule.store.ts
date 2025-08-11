import { create, type GetState, type SetState } from 'zustand';

export interface ScheduleCacheEntry {
  schedule: any[][];
  lessonIds: string[][];
  dateRange?: { start: string; end: string } | null;
  availableYears?: string[];
  availableWeeks?: number[];
  updatedAt: number;
}

export interface ScheduleStoreState {
  cache: Record<string, ScheduleCacheEntry>;
  getCache: (key: string) => ScheduleCacheEntry | undefined;
  setCache: (key: string, entry: Omit<ScheduleCacheEntry, 'updatedAt'>) => void;
  clearCache: (key?: string) => void; // Thêm function clear cache
}

export function buildScheduleKey(params: {
  role: 'student' | 'teacher';
  userKey: string;
  academicYear: string;
  weekNumber: number;
}): string {
  const { role, userKey, academicYear, weekNumber } = params;
  return `${role}|${userKey}|${academicYear}|${weekNumber}`;
}

export const useScheduleStore = create<ScheduleStoreState>((set: SetState<ScheduleStoreState>, get: GetState<ScheduleStoreState>) => ({
  cache: {},
  getCache: (key: string) => get().cache[key],
  setCache: (key: string, entry: Omit<ScheduleCacheEntry, 'updatedAt'>) => {
    set((state: ScheduleStoreState) => ({
      cache: {
        ...state.cache,
        [key]: { ...entry, updatedAt: Date.now() },
      },
    }));
  },
  clearCache: (key?: string) => {
    if (key) {
      // Xóa cache cho key cụ thể
      set((state: ScheduleStoreState) => {
        const newCache = { ...state.cache };
        delete newCache[key];
        return { cache: newCache };
      });
    } else {
      // Xóa toàn bộ cache
      set({ cache: {} });
    }
  },
})); 