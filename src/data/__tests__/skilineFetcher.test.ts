import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSkilineData } from '../skilineFetcher';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('fetchSkilineData', () => {
  it('returns error for empty keycard', async () => {
    const result = await fetchSkilineData('');
    expect(result.success).toBe(false);
    expect(result.error).toContain('ski pass number');
  });

  it('returns error with CSV instructions when all endpoints fail', async () => {
    // Mock fetch to always reject (network error / CORS block)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const result = await fetchSkilineData('01-1158-4-381384');
    expect(result.success).toBe(false);
    expect(result.error).toContain('app.skiline.cc');
    expect(result.error).toContain('01-1158-4-381384');
  });

  it('parses valid JSON response with days array', async () => {
    const mockData = {
      days: [
        { date: '2025-12-07', resort: 'Stubaier Gletscher', vertical_meters: 4820, distance: 28.5, lifts: 14, top_speed: 68.2 },
        { date: '2025-12-08', resort: 'Stubaier Gletscher', vertical_meters: 5210, distance: 31.2, lifts: 16, top_speed: 72.4 },
      ],
    };

    // All fetches succeed with valid data
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
      text: () => Promise.resolve(JSON.stringify(mockData)),
    }));

    const result = await fetchSkilineData('01-1158-4-381384');
    expect(result.success).toBe(true);
    expect(result.season).toBeDefined();
    expect(result.season!.days).toHaveLength(2);
    expect(result.season!.days[0].resort).toBe('Stubaier Gletscher');
    expect(result.season!.days[0].totalVerticalMeters).toBe(4820);
    expect(result.season!.days[0].totalDistanceKm).toBe(28.5);
  });

  it('parses response with data array format', async () => {
    const mockData = {
      data: [
        { date: '2026-01-15', resortName: 'Saalbach', verticalMeters: 6000, km: 35, lift_rides: 18 },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
        text: () => Promise.resolve(JSON.stringify(mockData)),
      });
    }));

    const result = await fetchSkilineData('test-keycard');
    expect(result.success).toBe(true);
    expect(result.season!.days).toHaveLength(1);
    expect(result.season!.days[0].resort).toBe('Saalbach');
  });

  it('skips days with zero vertical', async () => {
    const mockData = {
      days: [
        { date: '2025-12-07', resort: 'Good', vertical_meters: 5000 },
        { date: '2025-12-08', resort: 'Empty', vertical_meters: 0 },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
      text: () => Promise.resolve(JSON.stringify(mockData)),
    }));

    const result = await fetchSkilineData('test');
    expect(result.success).toBe(true);
    expect(result.season!.days).toHaveLength(1);
  });

  it('generates synthetic runs for fetched data', async () => {
    const mockData = {
      days: [
        { date: '2025-12-07', resort: 'Test', vertical_meters: 5000, lifts: 12 },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
      text: () => Promise.resolve(JSON.stringify(mockData)),
    }));

    const result = await fetchSkilineData('test');
    expect(result.success).toBe(true);

    const day = result.season!.days[0];
    expect(day.runs.length).toBeGreaterThan(0);
    const lifts = day.runs.filter(r => r.isLift);
    expect(lifts.length).toBe(12);
  });

  it('generates correct season name from dates', async () => {
    const mockData = {
      days: [
        { date: '2025-12-07', resort: 'A', vertical_meters: 5000 },
        { date: '2026-01-15', resort: 'B', vertical_meters: 6000 },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
      text: () => Promise.resolve(JSON.stringify(mockData)),
    }));

    const result = await fetchSkilineData('test');
    expect(result.season!.name).toBe('2025/2026');
  });
});
