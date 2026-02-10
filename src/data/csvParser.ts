import type { Season, SkiDay, Run, AltitudePoint } from '../types';

const COLUMN_MATCHERS: Record<string, RegExp[]> = {
  date: [/date/i, /datum/i, /tag/i, /day/i],
  resort: [/resort/i, /skigebiet/i, /ski\s*area/i, /ort/i, /region/i],
  verticalMeters: [/vertical/i, /h[oö]henmeter/i, /altitude/i, /\bhm\b/i, /height/i],
  distanceKm: [/distance/i, /\bkm\b/i, /kilometer/i, /strecke/i],
  liftRides: [/lift/i, /rides/i, /fahrten/i, /bergfahrten/i],
  topSpeed: [/speed/i, /geschwindigkeit/i, /tempo/i, /v.*max/i],
  firstLift: [/first/i, /erste/i, /start/i],
  lastLift: [/last/i, /letzte/i, /end/i],
  skiPass: [/pass/i, /ticket/i, /karte/i, /keycard/i],
};

function detectDelimiter(text: string): string {
  const firstLine = text.split('\n')[0] ?? '';
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  if (tabs >= semicolons && tabs >= commas) return '\t';
  if (semicolons >= commas) return ';';
  return ',';
}

function matchColumn(header: string): string | null {
  for (const [field, patterns] of Object.entries(COLUMN_MATCHERS)) {
    for (const pattern of patterns) {
      if (pattern.test(header.trim())) return field;
    }
  }
  return null;
}

function parseNumber(val: string): number {
  return parseFloat(val.replace(/[^\d.-]/g, '').replace(',', '.')) || 0;
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

    runs.push({
      id: `lift-${i}`,
      liftName: `Lift ${i + 1}`,
      startTime: `${Math.floor((minute - liftDur) / 60)}:${Math.floor((minute - liftDur) % 60).toString().padStart(2, '0')}`,
      endTime: `${Math.floor(minute / 60)}:${Math.floor(minute % 60).toString().padStart(2, '0')}`,
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
      startTime: `${Math.floor(minute / 60)}:${Math.floor(minute % 60).toString().padStart(2, '0')}`,
      endTime: `${Math.floor((minute + runDur) / 60)}:${Math.floor((minute + runDur) % 60).toString().padStart(2, '0')}`,
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

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function parseSkilineCSV(csvText: string): Season {
  const delimiter = detectDelimiter(csvText);
  const lines = csvText.trim().split('\n').filter(l => l.trim());

  if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');

  const headers = lines[0].split(delimiter);
  const columnMap: Record<string, number> = {};

  headers.forEach((h, i) => {
    const field = matchColumn(h);
    if (field) columnMap[field] = i;
  });

  if (!columnMap.date && !columnMap.resort) {
    throw new Error('Could not detect date or resort columns. Make sure your CSV has headers like "Date", "Resort", "Vertical Meters", etc.');
  }

  const days: SkiDay[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter);
    const date = cols[columnMap.date ?? 0]?.trim() ?? '';
    const resort = cols[columnMap.resort ?? 1]?.trim() ?? '';
    const vertical = parseNumber(cols[columnMap.verticalMeters ?? 2] ?? '0');
    const distance = parseNumber(cols[columnMap.distanceKm ?? 3] ?? '0');
    const lifts = Math.round(parseNumber(cols[columnMap.liftRides ?? 4] ?? '0'));
    const speed = columnMap.topSpeed !== undefined ? parseNumber(cols[columnMap.topSpeed] ?? '0') : null;
    const firstLift = cols[columnMap.firstLift ?? -1]?.trim() ?? '08:30';
    const lastLift = cols[columnMap.lastLift ?? -1]?.trim() ?? '16:00';

    if (!date || vertical === 0) continue;

    const resortId = slugify(resort || 'unknown');
    const runs = generateSyntheticRuns(vertical, lifts || 10);

    days.push({
      id: `${date}-${resortId}`,
      date,
      resort: resort || 'Unknown Resort',
      resortId,
      country: 'Austria',
      totalVerticalMeters: vertical,
      totalDistanceKm: distance,
      numberOfLifts: lifts || runs.filter(r => r.isLift).length,
      topSpeed: speed,
      firstLift,
      lastLift,
      runs,
    });
  }

  days.sort((a, b) => a.date.localeCompare(b.date));

  const years = days.map(d => new Date(d.date).getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const seasonName = minYear === maxYear ? `${minYear}` : `${minYear}/${maxYear}`;

  return {
    id: `imported-${seasonName}`,
    name: seasonName,
    days,
  };
}
