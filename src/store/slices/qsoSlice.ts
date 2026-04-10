import { create } from 'zustand';
import type { QSO } from '@core/domain/entities';
import { SQLiteQSORepository } from '@/core/data/local';

const qsoRepository = new SQLiteQSORepository();

interface QSOState {
  qsos: QSO[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadQSosFromDatabase: () => Promise<void>;
  addQSO: (qso: QSO) => void;
  updateQSO: (id: string, updates: Partial<QSO>) => void;
  deleteQSO: (id: string) => void;
  getQSO: (id: string) => QSO | undefined;
  getQSOsByCallsign: (callsign: string) => QSO[];
  checkDuplicate: (callsign: string, band: string, mode: string, timestamp: Date) => QSO | null;
  clearError: () => void;
}

export const useQSStore = create<QSOState>((set, get) => ({
  qsos: [],
  isLoading: false,
  error: null,

  loadQSosFromDatabase: async () => {
    set({ isLoading: true, error: null });
    try {
      const all = await qsoRepository.findAll();
      all.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      set({ qsos: all, isLoading: false });
      console.log('[HamLogbook] Zustand store updated from SQLite:', all.length, 'QSO(s)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load QSOs';
      console.error('[HamLogbook] loadQSosFromDatabase failed:', err);
      set({ error: message, isLoading: false });
    }
  },

  addQSO: (qso) => {
    set((state) => ({
      qsos: [...state.qsos, qso],
      error: null,
    }));
  },

  updateQSO: (id, updates) => {
    set((state) => ({
      qsos: state.qsos.map((qso) =>
        qso.id === id
          ? {
              ...qso,
              ...updates,
              metadata: {
                ...qso.metadata,
                updatedAt: new Date(),
                version: qso.metadata.version + 1,
              },
            }
          : qso
      ),
    }));
  },

  deleteQSO: (id) => {
    set((state) => ({
      qsos: state.qsos.filter((qso) => qso.id !== id),
    }));
  },

  getQSO: (id) => {
    return get().qsos.find((qso) => qso.id === id);
  },

  getQSOsByCallsign: (callsign) => {
    return get().qsos.filter(
      (qso) => qso.callsign.toString().toUpperCase() === callsign.toUpperCase()
    );
  },

  checkDuplicate: (callsign, band, mode, timestamp) => {
    const callsignUpper = callsign.toUpperCase();
    const timeWindow = 5 * 60 * 1000; // 5 minutes in milliseconds

    return (
      get().qsos.find((qso) => {
        const timeDiff = Math.abs(timestamp.getTime() - qso.timestamp.getTime());
        return (
          qso.callsign.toString().toUpperCase() === callsignUpper &&
          qso.band === band &&
          qso.mode === mode &&
          timeDiff < timeWindow
        );
      }) || null
    );
  },

  clearError: () => {
    set({ error: null });
  },
}));

