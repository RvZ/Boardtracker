import { describe, it, expect } from 'vitest';
import { DEMO_SEASON } from '../demoData';

describe('DEMO_SEASON', () => {
  it('has correct season metadata', () => {
    expect(DEMO_SEASON.id).toBe('season-2025-2026');
    expect(DEMO_SEASON.name).toBe('2025/2026');
  });

  it('has 15 ski days', () => {
    expect(DEMO_SEASON.days).toHaveLength(15);
  });

  it('all days have required fields', () => {
    for (const day of DEMO_SEASON.days) {
      expect(day.id).toBeTruthy();
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day.resort).toBeTruthy();
      expect(day.resortId).toBeTruthy();
      expect(day.country).toBe('Austria');
      expect(day.totalVerticalMeters).toBeGreaterThan(0);
      expect(day.totalDistanceKm).toBeGreaterThan(0);
      expect(day.numberOfLifts).toBeGreaterThan(0);
      expect(day.topSpeed).toBeGreaterThan(0);
      expect(day.firstLift).toBeTruthy();
      expect(day.lastLift).toBeTruthy();
    }
  });

  it('all days have runs with altitude profiles', () => {
    for (const day of DEMO_SEASON.days) {
      expect(day.runs.length).toBeGreaterThan(0);
      for (const run of day.runs) {
        expect(run.id).toBeTruthy();
        expect(run.altitudeProfile.length).toBeGreaterThan(0);
        expect(run.verticalDrop).toBeGreaterThan(0);
      }
    }
  });

  it('covers 6 distinct resorts', () => {
    const resorts = new Set(DEMO_SEASON.days.map(d => d.resortId));
    expect(resorts.size).toBe(6);
  });

  it('days are in chronological order within the data', () => {
    const dates = DEMO_SEASON.days.map(d => d.date);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it('each day has at least one run with a top speed', () => {
    for (const day of DEMO_SEASON.days) {
      const runsWithSpeed = day.runs.filter(r => r.maxSpeedKmh !== null && !r.isLift);
      expect(runsWithSpeed.length).toBeGreaterThan(0);
    }
  });
});
