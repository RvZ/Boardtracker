import type { Season, SkiDay, Run, AltitudePoint } from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function generateAltitudeProfile(
  startAlt: number,
  topAlt: number,
  startMinute: number,
  durationMinutes: number,
  isLift: boolean
): AltitudePoint[] {
  const points: AltitudePoint[] = [];
  const steps = Math.max(4, Math.floor(durationMinutes * 2));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const time = startMinute + t * durationMinutes;
    let altitude: number;
    if (isLift) {
      altitude = startAlt + (topAlt - startAlt) * t;
    } else {
      // Descent with slight curve
      const eased = 1 - Math.pow(1 - t, 1.5);
      altitude = topAlt - (topAlt - startAlt) * eased;
    }
    points.push({ time: Math.round(time * 10) / 10, altitude: Math.round(altitude) });
  }
  return points;
}

function generateRuns(
  numLifts: number,
  baseAltitude: number,
  peakAltitude: number,
  startHour: number,
): Run[] {
  const runs: Run[] = [];
  let currentMinute = startHour * 60;
  let currentAlt = baseAltitude;

  const liftNames = [
    'Gondelbahn', 'Sessellift A', 'Schlepplift', 'Sessellift B',
    'Gondelbahn II', 'Expressllift', 'Panoramabahn', 'Gipfellift',
    'Verbindungslift', 'Familylift', 'Zirbenlift', 'Gletscherbahn',
  ];

  for (let i = 0; i < numLifts; i++) {
    // Vary the top altitude for each run
    const variation = (Math.random() - 0.3) * (peakAltitude - baseAltitude) * 0.3;
    const thisTop = Math.min(peakAltitude, Math.max(baseAltitude + 200, peakAltitude + variation));
    const verticalDrop = thisTop - currentAlt;

    // Lift up
    const liftDuration = 3 + Math.random() * 8;
    const liftProfile = generateAltitudeProfile(currentAlt, thisTop, currentMinute, liftDuration, true);
    const liftName = liftNames[i % liftNames.length];

    const liftStartH = Math.floor(currentMinute / 60);
    const liftStartM = Math.floor(currentMinute % 60);
    const liftEndMinute = currentMinute + liftDuration;
    const liftEndH = Math.floor(liftEndMinute / 60);
    const liftEndM = Math.floor(liftEndMinute % 60);

    runs.push({
      id: generateId(),
      liftName,
      startTime: `${liftStartH.toString().padStart(2, '0')}:${liftStartM.toString().padStart(2, '0')}`,
      endTime: `${liftEndH.toString().padStart(2, '0')}:${liftEndM.toString().padStart(2, '0')}`,
      topAltitude: thisTop,
      bottomAltitude: currentAlt,
      verticalDrop,
      distanceKm: (verticalDrop / 1000) * (1.5 + Math.random()),
      maxSpeedKmh: null,
      altitudeProfile: liftProfile,
      isLift: true,
    });

    currentMinute = liftEndMinute;

    // Run down
    const runBottom = baseAltitude + Math.random() * (thisTop - baseAltitude) * 0.2;
    const runDuration = 2 + Math.random() * 6;
    const runProfile = generateAltitudeProfile(runBottom, thisTop, currentMinute, runDuration, false);
    const runVertical = thisTop - runBottom;
    const runDistance = (runVertical / 1000) * (2 + Math.random() * 2);
    const runSpeed = 30 + Math.random() * 60;

    const runStartH = Math.floor(currentMinute / 60);
    const runStartM = Math.floor(currentMinute % 60);
    const runEndMinute = currentMinute + runDuration;
    const runEndH = Math.floor(runEndMinute / 60);
    const runEndM = Math.floor(runEndMinute % 60);

    runs.push({
      id: generateId(),
      liftName: `Run from ${liftName}`,
      startTime: `${runStartH.toString().padStart(2, '0')}:${runStartM.toString().padStart(2, '0')}`,
      endTime: `${runEndH.toString().padStart(2, '0')}:${runEndM.toString().padStart(2, '0')}`,
      topAltitude: thisTop,
      bottomAltitude: runBottom,
      verticalDrop: runVertical,
      distanceKm: Math.round(runDistance * 100) / 100,
      maxSpeedKmh: Math.round(runSpeed * 10) / 10,
      altitudeProfile: runProfile,
      isLift: false,
    });

    currentMinute = runEndMinute + 1 + Math.random() * 5; // short break between runs
    currentAlt = runBottom;
  }

  return runs;
}

function createSkiDay(
  date: string,
  resort: string,
  resortId: string,
  totalVertical: number,
  totalDistance: number,
  numLifts: number,
  topSpeed: number,
  baseAlt: number,
  peakAlt: number,
): SkiDay {
  const runs = generateRuns(numLifts, baseAlt, peakAlt, 8 + Math.random() * 1);
  const liftRuns = runs.filter(r => !r.isLift);
  const firstTime = runs[0]?.startTime ?? '08:30';
  const lastTime = runs[runs.length - 1]?.endTime ?? '16:00';

  // Set the top speed on the fastest run
  if (liftRuns.length > 0) {
    const fastestRun = liftRuns.reduce((max, r) =>
      (r.maxSpeedKmh ?? 0) > (max.maxSpeedKmh ?? 0) ? r : max
    );
    fastestRun.maxSpeedKmh = topSpeed;
  }

  return {
    id: `${date}-${resortId}`,
    date,
    resort,
    resortId,
    country: 'Austria',
    totalVerticalMeters: totalVertical,
    totalDistanceKm: totalDistance,
    numberOfLifts: numLifts,
    topSpeed,
    firstLift: firstTime,
    lastLift: lastTime,
    runs,
  };
}

export const DEMO_SEASON: Season = {
  id: 'season-2025-2026',
  name: '2025/2026',
  days: [
    createSkiDay('2025-12-07', 'Stubaier Gletscher', 'stubaier-gletscher', 4820, 28.5, 14, 68.2, 1750, 3210),
    createSkiDay('2025-12-08', 'Stubaier Gletscher', 'stubaier-gletscher', 5210, 31.2, 16, 72.4, 1750, 3210),
    createSkiDay('2025-12-20', 'SkiWelt Wilder Kaiser', 'skiwelt-wilder-kaiser', 6340, 38.1, 18, 55.8, 800, 1829),
    createSkiDay('2025-12-21', 'SkiWelt Wilder Kaiser', 'skiwelt-wilder-kaiser', 7120, 42.3, 21, 61.3, 800, 1829),
    createSkiDay('2025-12-27', 'Sölden', 'soelden', 8450, 45.7, 22, 82.1, 1350, 3340),
    createSkiDay('2025-12-28', 'Sölden', 'soelden', 7890, 41.9, 20, 78.6, 1350, 3340),
    createSkiDay('2025-12-29', 'Sölden', 'soelden', 9120, 48.2, 24, 85.3, 1350, 3340),
    createSkiDay('2025-12-30', 'Sölden', 'soelden', 6780, 35.8, 17, 74.9, 1350, 3340),
    createSkiDay('2025-12-31', 'Sölden', 'soelden', 8210, 43.5, 21, 80.2, 1350, 3340),
    createSkiDay('2026-01-11', 'Saalbach Hinterglemm', 'saalbach', 5670, 33.4, 16, 63.7, 1003, 2096),
    createSkiDay('2026-01-12', 'Saalbach Hinterglemm', 'saalbach', 6890, 39.8, 19, 67.5, 1003, 2096),
    createSkiDay('2026-01-25', 'Ski Amadé', 'ski-amade', 7340, 41.2, 20, 71.8, 860, 2188),
    createSkiDay('2026-01-26', 'Ski Amadé', 'ski-amade', 5980, 34.6, 15, 58.9, 860, 2188),
    createSkiDay('2026-02-08', 'Obertauern', 'obertauern', 6540, 37.9, 18, 69.4, 1630, 2313),
    createSkiDay('2026-02-09', 'Obertauern', 'obertauern', 7230, 40.1, 19, 73.1, 1630, 2313),
  ],
};
