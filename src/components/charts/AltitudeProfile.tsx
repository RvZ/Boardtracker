import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { minutesToTime } from '../../utils/formatters';

interface AltitudeProfileProps {
  data: { time: number; altitude: number }[];
  height?: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { time: number; altitude: number } }[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;

  return (
    <div className="rounded-lg bg-[#111827]/90 border border-white/10 backdrop-blur-sm px-3 py-2 shadow-lg">
      <p className="text-sm text-ice-300 font-medium">
        {minutesToTime(point.time)}
      </p>
      <p className="text-sm text-snow-200">
        {Math.round(point.altitude)} m
      </p>
    </div>
  );
}

export default function AltitudeProfile({ data, height = 350 }: AltitudeProfileProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="altGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
        <XAxis
          dataKey="time"
          tickFormatter={minutesToTime}
          tick={{ fill: '#8ba3d4', fontSize: 12 }}
          stroke="#1a2235"
        />
        <YAxis
          unit="m"
          tick={{ fill: '#8ba3d4', fontSize: 12 }}
          stroke="#1a2235"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="altitude"
          stroke="#38bdf8"
          fill="url(#altGradient)"
          strokeWidth={2}
          animationDuration={2000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
