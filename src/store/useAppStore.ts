import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Season, SkiDay } from '../types';
import { DEMO_SEASON } from '../data/demoData';

interface AppStore {
  seasons: Season[];
  activeSeasonId: string | null;
  activeDayId: string | null;
  isDemo: boolean;

  loadDemo: () => void;
  importSeason: (season: Season) => void;
  clearData: () => void;
  setActiveSeason: (id: string) => void;
  setActiveDay: (id: string | null) => void;

  getActiveSeason: () => Season | null;
  getActiveDay: () => SkiDay | null;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      seasons: [DEMO_SEASON],
      activeSeasonId: DEMO_SEASON.id,
      activeDayId: null,
      isDemo: true,

      loadDemo: () => {
        set({
          seasons: [DEMO_SEASON],
          activeSeasonId: DEMO_SEASON.id,
          activeDayId: null,
          isDemo: true,
        });
      },

      importSeason: (season: Season) => {
        set((state) => ({
          seasons: [...state.seasons.filter(s => s.id !== season.id), season],
          activeSeasonId: season.id,
          activeDayId: null,
          isDemo: false,
        }));
      },

      clearData: () => {
        set({
          seasons: [],
          activeSeasonId: null,
          activeDayId: null,
          isDemo: false,
        });
      },

      setActiveSeason: (id: string) => {
        set({ activeSeasonId: id, activeDayId: null });
      },

      setActiveDay: (id: string | null) => {
        set({ activeDayId: id });
      },

      getActiveSeason: () => {
        const { seasons, activeSeasonId } = get();
        return seasons.find(s => s.id === activeSeasonId) ?? null;
      },

      getActiveDay: () => {
        const { seasons, activeSeasonId, activeDayId } = get();
        if (!activeSeasonId || !activeDayId) return null;
        const season = seasons.find(s => s.id === activeSeasonId);
        return season?.days.find(d => d.id === activeDayId) ?? null;
      },
    }),
    {
      name: 'boardtracker-storage',
      partialize: (state) => ({
        seasons: state.seasons,
        activeSeasonId: state.activeSeasonId,
        isDemo: state.isDemo,
      }),
    }
  )
);
