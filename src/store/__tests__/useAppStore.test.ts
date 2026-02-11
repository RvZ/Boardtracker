import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../useAppStore';
import { DEMO_SEASON } from '../../data/demoData';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAppStore.getState().loadDemo();
  });

  it('initializes with demo data', () => {
    const state = useAppStore.getState();
    expect(state.seasons).toHaveLength(1);
    expect(state.activeSeasonId).toBe(DEMO_SEASON.id);
    expect(state.isDemo).toBe(true);
  });

  it('getActiveSeason returns the demo season', () => {
    const season = useAppStore.getState().getActiveSeason();
    expect(season).not.toBeNull();
    expect(season!.id).toBe(DEMO_SEASON.id);
    expect(season!.days).toHaveLength(15);
  });

  it('setActiveDay and getActiveDay work', () => {
    const dayId = DEMO_SEASON.days[0].id;
    useAppStore.getState().setActiveDay(dayId);

    const day = useAppStore.getState().getActiveDay();
    expect(day).not.toBeNull();
    expect(day!.id).toBe(dayId);
  });

  it('getActiveDay returns null when no day selected', () => {
    const day = useAppStore.getState().getActiveDay();
    expect(day).toBeNull();
  });

  it('clearData removes everything', () => {
    useAppStore.getState().clearData();

    const state = useAppStore.getState();
    expect(state.seasons).toHaveLength(0);
    expect(state.activeSeasonId).toBeNull();
    expect(state.isDemo).toBe(false);
    expect(state.getActiveSeason()).toBeNull();
  });

  it('importSeason adds a new season', () => {
    const newSeason = {
      id: 'imported-2024',
      name: '2024',
      days: [],
    };

    useAppStore.getState().importSeason(newSeason);

    const state = useAppStore.getState();
    expect(state.seasons).toHaveLength(2);
    expect(state.activeSeasonId).toBe('imported-2024');
    expect(state.isDemo).toBe(false);
  });

  it('importSeason replaces existing season with same id', () => {
    const replacement = {
      id: DEMO_SEASON.id,
      name: 'Replaced',
      days: [],
    };

    useAppStore.getState().importSeason(replacement);

    const state = useAppStore.getState();
    expect(state.seasons).toHaveLength(1);
    expect(state.getActiveSeason()!.name).toBe('Replaced');
  });

  it('loadDemo resets to demo state', () => {
    useAppStore.getState().clearData();
    useAppStore.getState().loadDemo();

    const state = useAppStore.getState();
    expect(state.seasons).toHaveLength(1);
    expect(state.isDemo).toBe(true);
    expect(state.activeSeasonId).toBe(DEMO_SEASON.id);
  });
});
