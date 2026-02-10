export interface AltitudePoint {
  time: number;
  altitude: number;
}

export interface Run {
  id: string;
  liftName: string;
  startTime: string;
  endTime: string;
  topAltitude: number;
  bottomAltitude: number;
  verticalDrop: number;
  distanceKm: number;
  maxSpeedKmh: number | null;
  altitudeProfile: AltitudePoint[];
  isLift: boolean;
}

export interface SkiDay {
  id: string;
  date: string;
  resort: string;
  resortId: string;
  country: string;
  totalVerticalMeters: number;
  totalDistanceKm: number;
  numberOfLifts: number;
  topSpeed: number | null;
  firstLift: string;
  lastLift: string;
  runs: Run[];
}

export interface Season {
  id: string;
  name: string;
  days: SkiDay[];
}

export interface Resort {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  daysVisited: number;
  totalVertical: number;
}

export interface SeasonStats {
  totalVerticalMeters: number;
  totalDistanceKm: number;
  totalDays: number;
  totalLifts: number;
  topSpeed: number;
  avgVerticalPerDay: number;
  avgDistancePerDay: number;
  resortsVisited: number;
  bestDay: SkiDay | null;
  resorts: Resort[];
}
