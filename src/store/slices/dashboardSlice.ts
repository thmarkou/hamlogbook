import { create } from 'zustand';
import { SQLiteQSORepository } from '@/core/data/local';

const qsoRepository = new SQLiteQSORepository();

/** Dashboard headline stats; optional sync keeps them aligned with SQLite after logs. */
interface DashboardStatsState {
  totalQsos: number;
  uniqueCallsigns: number;
  setStats: (patch: Partial<Pick<DashboardStatsState, 'totalQsos' | 'uniqueCallsigns'>>) => void;
  syncFromDatabase: () => Promise<void>;
}

export const useDashboardStatsStore = create<DashboardStatsState>((set) => ({
  totalQsos: 0,
  uniqueCallsigns: 0,
  setStats: (patch) => set((state) => ({ ...state, ...patch })),
  syncFromDatabase: async () => {
    try {
      const all = await qsoRepository.findAll();
      const uniqueCallsigns = new Set(
        all.map((q) => q.callsign.toString().toUpperCase())
      ).size;
      set({ totalQsos: all.length, uniqueCallsigns });
      console.log('[HamLogbook] Dashboard stats synced from SQLite');
    } catch (err) {
      console.error('[HamLogbook] Dashboard syncFromDatabase failed:', err);
      // Keep last known stats if DB is unavailable (e.g. web without SQLite).
    }
  },
}));
