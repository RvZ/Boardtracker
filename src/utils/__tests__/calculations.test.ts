import { describe, it, expect } from 'vitest';
import { calculateSeasonStats, getCumulativeData, getDayAltitudeProfile } from '../calculations';
import { DEMO_SEASON } from '../../data/demoData';
import type { Season } from '../../types';

describe('calculateSeasonStats', () => {
  it('calculates totals for demo season', () => {
    const stats = calculateSeasonStats(DEMO_SEASON);

    expect(stats.totalDays).toBe(15);
    expect(stats.totalVerticalMeters).toBeGreaterThan(0);
    expect(stats.totalDistanceKm).toBeGreaterThan(0);
    expect(stats.totalLifts).toBeGreaterThan(0);
    expect(stats.topSpeed).toBeGreaterThan(0);
    expect(stats.resortsVisited).toBe(6);
  });

  it('calculates averages correctly', () => {
    const stats = calculateSeasonStats(DEMO_SEASON);

    expect(stats.avgVerticalPerDay).toBeCloseTo(stats.totalVerticalMeters / 15, 0);
    expect(stats.avgDistancePerDay).toBeCloseTo(stats.totalDistanceKm / 15, 0);
  });

  it('finds the best day', () => {
    const stats = calculateSeasonStats(DEMO_SEASON);

    expect(stats.bestDay).not.toBeNull();
    expect(stats.bestDay!.totalVerticalMeters).toBe(
      Math.max(...DEMO_SEASON.days.map(d => d.totalVerticalMeters))
    );
  });

  it('identifies all resorts with correct data', () => {
    const stats = calculateSeasonStats(DEMO_SEASON);

    expect(stats.resorts.length).toBe(6);
    for (const resort of stats.resorts) {
      expect(resort.name).toBeTruthy();
      expect(resort.daysVisited).toBeGreaterThan(0);
      expect(resort.totalVertical).toBeGreaterThan(0);
      expect(resort.lat).toBeGreaterThan(0);
      expect(resort.lng).toBeGreaterThan(0);
    }
  });

  it('handles empty season', () => {
    const empty: Season = { id: 'empty', name: 'Empty', days: [] };
    const stats = calculateSeasonStats(empty);

    expect(stats.totalDays).toBe(0);
    expect(stats.totalVerticalMeters).toBe(0);
    expect(stats.bestDay).toBeNull();
    expect(stats.resortsVisited).toBe(0);
  });
});

describe('getCumulativeData', () => {
  it('returns cumulative values sorted by date', () => {
    const data = getCumulativeData(DEMO_SEASON.days);

    expect(data.length).toBe(15);
    // Should be monotonically increasing
    for (let i = 1; i < data.length; i++) {
      expect(data[i].vertical).toBeGreaterThan(data[i - 1].vertical);
      expect(data[i].distance).toBeGreaterThan(data[i - 1].distance);
    }
  });

  it('first entry matches first day', () => {
    const data = getCumulativeData(DEMO_SEASON.days);
    const sortedDays = [...DEMO_SEASON.days].sort((a, b) => a.date.localeCompare(b.date));

    expect(data[0].vertical).toBe(sortedDays[0].totalVerticalMeters);
    expect(data[0].distance).toBe(sortedDays[0].totalDistanceKm);
  });
});

describe('getDayAltitudeProfile', () => {
  it('returns sorted altitude points for a day', () => {
    const day = DEMO_SEASON.days[0];
    const profile = getDayAltitudeProfile(day);

    expect(profile.length).toBeGreaterThan(0);
    // Should be sorted by time
    for (let i = 1; i < profile.length; i++) {
      expect(profile[i].time).toBeGreaterThanOrEqual(profile[i - 1].time);
    }
  });

  it('altitude values are realistic', () => {
    const day = DEMO_SEASON.days[0]; // Stubaier Gletscher
    const profile = getDayAltitudeProfile(day);

    for (const point of profile) {
      expect(point.altitude).toBeGreaterThan(500);
      expect(point.altitude).toBeLessThan(4000);
    }
  });
});
