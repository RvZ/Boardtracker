import { describe, it, expect } from 'vitest';
import { parseSkilineCSV } from '../csvParser';

describe('parseSkilineCSV', () => {
  it('parses a simple English CSV', () => {
    const csv = `Date,Resort,Vertical Meters,Distance (km),Lift Rides,Top Speed
2025-12-07,Stubaier Gletscher,4820,28.5,14,68.2
2025-12-08,Stubaier Gletscher,5210,31.2,16,72.4`;

    const season = parseSkilineCSV(csv);

    expect(season.days).toHaveLength(2);
    expect(season.days[0].resort).toBe('Stubaier Gletscher');
    expect(season.days[0].totalVerticalMeters).toBe(4820);
    expect(season.days[0].totalDistanceKm).toBe(28.5);
    expect(season.days[0].numberOfLifts).toBe(14);
    expect(season.days[0].topSpeed).toBe(68.2);
  });

  it('parses semicolon-delimited CSV (European format)', () => {
    const csv = `Datum;Skigebiet;Höhenmeter;Kilometer;Bergfahrten;Geschwindigkeit
2025-12-20;SkiWelt;6340;38.1;18;55.8`;

    const season = parseSkilineCSV(csv);

    expect(season.days).toHaveLength(1);
    expect(season.days[0].resort).toBe('SkiWelt');
    expect(season.days[0].totalVerticalMeters).toBe(6340);
  });

  it('generates synthetic runs for imported days', () => {
    const csv = `Date,Resort,Vertical Meters,Distance (km),Lift Rides
2025-12-07,TestResort,5000,30,15`;

    const season = parseSkilineCSV(csv);
    const day = season.days[0];

    expect(day.runs.length).toBeGreaterThan(0);
    const lifts = day.runs.filter(r => r.isLift);
    const descents = day.runs.filter(r => !r.isLift);
    expect(lifts.length).toBe(15);
    expect(descents.length).toBe(15);
  });

  it('skips rows with zero vertical', () => {
    const csv = `Date,Resort,Vertical Meters
2025-12-07,Good Resort,5000
2025-12-08,Bad Resort,0`;

    const season = parseSkilineCSV(csv);
    expect(season.days).toHaveLength(1);
  });

  it('throws on insufficient data', () => {
    expect(() => parseSkilineCSV('')).toThrow();
    expect(() => parseSkilineCSV('just a header')).toThrow();
  });

  it('generates a season name from dates', () => {
    const csv = `Date,Resort,Vertical Meters
2025-12-07,Resort A,5000
2026-01-15,Resort B,6000`;

    const season = parseSkilineCSV(csv);
    expect(season.name).toBe('2025/2026');
  });

  it('handles tab-delimited files', () => {
    const csv = `Date\tResort\tVertical Meters\tDistance\tLifts
2025-12-07\tTest\t4000\t25\t12`;

    const season = parseSkilineCSV(csv);
    expect(season.days).toHaveLength(1);
    expect(season.days[0].totalVerticalMeters).toBe(4000);
  });
});
