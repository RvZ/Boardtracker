import type { Season, SkiDay, Run, AltitudePoint } from '../types';

/**
 * Skiline Fetcher
 *
 * Skiline doesn't have a public API, but their web app (app.skiline.cc)
 * makes internal API calls when you enter a ski pass number.
 *
 * Known endpoint patterns (discovered from their web app):
 * - Ticket lookup: POST to get season data by keycard number
 * - Season overview: returns days with vertical, distance, lifts
 * - Day detail: returns altitude profile for a specific day
 *
 * Since these are undocumented, we try multiple patterns and
 * fall back gracefully.
 */

const SKILINE_BASE = 'https://app.skiline.cc';

// Known API patterns from Skiline's SPA
const API_PATTERNS = [
  '/api/v1/ticket',
  '/api/v1/season',
  '/api/ticket/lookup',
  '/en/api/ticket',
] as const;

export interface SkilineFetchResult {
  success: boolean;
  season?: Season;
  error?: string;
  rawData?: unknown;
}

interface SkilineDay {
  date?: string;
  resort?: string;
  resortName?: string;
  ski_area?: string;
  vertical_meters?: number;
  verticalMeters?: number;
  hm?: number;
  distance?: number;
  distance_km?: number;
  km?: number;
  lifts?: number;
  lift_rides?: number;
  bergfahrten?: number;
  top_speed?: number;
  topSpeed?: number;
  max_speed?: number;
  first_lift?: string;
  last_lift?: string;
}

function normalizeDay(raw: SkilineDay, index: number): SkiDay | null {
  const date = raw.date;
  if (!date) return null;

  const resort = raw.resort || raw.resortName || raw.ski_area || 'Unknown';
  const vertical = raw.vertical_meters || raw.verticalMeters || raw.hm || 0;
  const distance = raw.distance || raw.distance_km || raw.km || 0;
  const lifts = raw.lifts || raw.lift_rides || raw.bergfahrten || 0;
  const speed = raw.top_speed || raw.topSpeed || raw.max_speed || null;

  if (vertical === 0) return null;

  const resortId = resort.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const runs = generateSyntheticRuns(vertical, lifts || 10);

  return {
    id: `${date}-${resortId}`,
    date,
    resort,
    resortId,
    country: 'Austria',
    totalVerticalMeters: vertical,
    totalDistanceKm: distance,
    numberOfLifts: lifts || runs.filter(r => r.isLift).length,
    topSpeed: speed,
    firstLift: raw.first_lift || '08:30',
    lastLift: raw.last_lift || '16:00',
    runs,
  };
}

function generateSyntheticRuns(vertical: number, lifts: number): Run[] {
  const runs: Run[] = [];
  const baseAlt = 1200;
  const dropPerRun = lifts > 0 ? vertical / lifts : 500;
  let minute = 8 * 60 + 30;

  for (let i = 0; i < lifts; i++) {
    const topAlt = baseAlt + dropPerRun + Math.random() * 200;
    const liftDur = 5 + Math.random() * 5;
    const runDur = 3 + Math.random() * 4;

    const liftProfile: AltitudePoint[] = [];
    const runProfile: AltitudePoint[] = [];

    for (let s = 0; s <= 6; s++) {
      const t = s / 6;
      liftProfile.push({ time: minute + t * liftDur, altitude: Math.round(baseAlt + (topAlt - baseAlt) * t) });
    }
    minute += liftDur;
    for (let s = 0; s <= 8; s++) {
      const t = s / 8;
      runProfile.push({ time: minute + t * runDur, altitude: Math.round(topAlt - (topAlt - baseAlt) * t) });
    }

    const fmt = (m: number) => `${Math.floor(m / 60)}:${Math.floor(m % 60).toString().padStart(2, '0')}`;

    runs.push({
      id: `lift-${i}`,
      liftName: `Lift ${i + 1}`,
      startTime: fmt(minute - liftDur),
      endTime: fmt(minute),
      topAltitude: topAlt,
      bottomAltitude: baseAlt,
      verticalDrop: topAlt - baseAlt,
      distanceKm: (topAlt - baseAlt) / 500,
      maxSpeedKmh: null,
      altitudeProfile: liftProfile,
      isLift: true,
    });

    runs.push({
      id: `run-${i}`,
      liftName: `Run ${i + 1}`,
      startTime: fmt(minute),
      endTime: fmt(minute + runDur),
      topAltitude: topAlt,
      bottomAltitude: baseAlt,
      verticalDrop: topAlt - baseAlt,
      distanceKm: (topAlt - baseAlt) / 300,
      maxSpeedKmh: 40 + Math.random() * 40,
      altitudeProfile: runProfile,
      isLift: false,
    });

    minute += runDur + 2;
  }
  return runs;
}

/**
 * Try to fetch ski data from Skiline using a keycard number.
 * Attempts multiple API patterns since endpoints are undocumented.
 * Uses a CORS proxy if direct fetch fails.
 */
export async function fetchSkilineData(keycard: string): Promise<SkilineFetchResult> {
  const cleanKeycard = keycard.trim();

  if (!cleanKeycard) {
    return { success: false, error: 'Please enter your ski pass number.' };
  }

  // Try direct fetch to known patterns
  for (const pattern of API_PATTERNS) {
    try {
      const result = await tryEndpoint(`${SKILINE_BASE}${pattern}`, cleanKeycard);
      if (result.success) return result;
    } catch {
      // Continue to next pattern
    }
  }

  // Try the ticket widget endpoint (known to exist)
  try {
    const result = await tryWidgetEndpoint(cleanKeycard);
    if (result.success) return result;
  } catch {
    // Continue
  }

  // Try via CORS proxy as last resort
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`${SKILINE_BASE}/api/v1/ticket/${cleanKeycard}`)}`,
    `https://corsproxy.io/?${encodeURIComponent(`${SKILINE_BASE}/api/v1/ticket/${cleanKeycard}`)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const result = await tryProxyFetch(proxyUrl, cleanKeycard);
      if (result.success) return result;
    } catch {
      // Continue
    }
  }

  return {
    success: false,
    error: `Could not connect to Skiline automatically. This is expected — Skiline doesn't have a public API.\n\nTo get your data:\n1. Go to app.skiline.cc\n2. Enter your ski pass number: ${cleanKeycard}\n3. Download the CSV from the season overview\n4. Import it on the Import page`,
  };
}

async function tryEndpoint(url: string, keycard: string): Promise<SkilineFetchResult> {
  // Try GET with keycard in path
  const getResponse = await fetch(`${url}/${keycard}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000),
  });

  if (getResponse.ok) {
    const data = await getResponse.json();
    return parseResponse(data);
  }

  // Try POST with keycard in body
  const postResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ ticket: keycard, keycard, ticketNumber: keycard }),
    signal: AbortSignal.timeout(8000),
  });

  if (postResponse.ok) {
    const data = await postResponse.json();
    return parseResponse(data);
  }

  return { success: false, error: `Endpoint ${url} returned ${getResponse.status}` };
}

async function tryWidgetEndpoint(keycard: string): Promise<SkilineFetchResult> {
  const url = `https://api.skiline.cc/widgets/data.php?ticket=${keycard}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000),
  });

  if (response.ok) {
    const data = await response.json();
    return parseResponse(data);
  }

  return { success: false };
}

async function tryProxyFetch(proxyUrl: string, _keycard: string): Promise<SkilineFetchResult> {
  const response = await fetch(proxyUrl, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000),
  });

  if (response.ok) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return parseResponse(data);
    } catch {
      return { success: false, error: 'Response was not valid JSON' };
    }
  }

  return { success: false };
}

function parseResponse(data: unknown): SkilineFetchResult {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Empty response', rawData: data };
  }

  const obj = data as Record<string, unknown>;

  // Try to find an array of days in common response shapes
  let daysArray: SkilineDay[] | null = null;

  if (Array.isArray(obj.days)) daysArray = obj.days;
  else if (Array.isArray(obj.data)) daysArray = obj.data;
  else if (Array.isArray(obj.skiDays)) daysArray = obj.skiDays;
  else if (Array.isArray(obj.results)) daysArray = obj.results;
  else if (obj.season && typeof obj.season === 'object') {
    const season = obj.season as Record<string, unknown>;
    if (Array.isArray(season.days)) daysArray = season.days;
  }
  // If the response itself is an array
  else if (Array.isArray(data)) daysArray = data;

  if (!daysArray || daysArray.length === 0) {
    return { success: false, error: 'No ski days found in response', rawData: data };
  }

  const days = daysArray
    .map((raw, i) => normalizeDay(raw, i))
    .filter((d): d is SkiDay => d !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (days.length === 0) {
    return { success: false, error: 'Could not parse any valid ski days', rawData: data };
  }

  const years = days.map(d => new Date(d.date).getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const seasonName = minYear === maxYear ? `${minYear}` : `${minYear}/${maxYear}`;

  return {
    success: true,
    season: {
      id: `skiline-${seasonName}`,
      name: seasonName,
      days,
    },
    rawData: data,
  };
}
