import type { SkiDay, Season, SeasonStats, Resort } from '../types';
import { RESORT_DATA } from '../data/resorts';

export function calculateSeasonStats(season: Season): SeasonStats {
  const days = season.days;
  const totalVerticalMeters = days.reduce((sum, d) => sum + d.totalVerticalMeters, 0);
  const totalDistanceKm = days.reduce((sum, d) => sum + d.totalDistanceKm, 0);
  const totalLifts = days.reduce((sum, d) => sum + d.numberOfLifts, 0);
  const topSpeed = Math.max(...days.map(d => d.topSpeed ?? 0));

  const resortMap = new Map<string, { days: number; vertical: number }>();
  for (const day of days) {
    const existing = resortMap.get(day.resortId) ?? { days: 0, vertical: 0 };
    resortMap.set(day.resortId, {
      days: existing.days + 1,
      vertical: existing.vertical + day.totalVerticalMeters,
    });
  }

  const resorts: Resort[] = Array.from(resortMap.entries()).map(([id, data]) => {
    const info = RESORT_DATA[id] ?? { name: id, lat: 47.3, lng: 12.0, country: 'Austria' };
    return {
      id,
      name: info.name,
      country: info.country,
      lat: info.lat,
      lng: info.lng,
      daysVisited: data.days,
      totalVertical: data.vertical,
    };
  });

  const bestDay = days.length > 0
    ? days.reduce((best, d) => d.totalVerticalMeters > best.totalVerticalMeters ? d : best)
    : null;

  return {
    totalVerticalMeters,
    totalDistanceKm,
    totalDays: days.length,
    totalLifts,
    topSpeed,
    avgVerticalPerDay: days.length > 0 ? totalVerticalMeters / days.length : 0,
    avgDistancePerDay: days.length > 0 ? totalDistanceKm / days.length : 0,
    resortsVisited: resortMap.size,
    bestDay,
    resorts,
  };
}

export function getCumulativeData(days: SkiDay[]): { date: string; vertical: number; distance: number }[] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let cumVert = 0;
  let cumDist = 0;
  return sorted.map(d => {
    cumVert += d.totalVerticalMeters;
    cumDist += d.totalDistanceKm;
    return { date: d.date, vertical: cumVert, distance: cumDist };
  });
}

export function getDayAltitudeProfile(day: SkiDay): { time: number; altitude: number }[] {
  const points: { time: number; altitude: number }[] = [];
  for (const run of day.runs) {
    for (const p of run.altitudeProfile) {
      points.push(p);
    }
  }
  return points.sort((a, b) => a.time - b.time);
}
