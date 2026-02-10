import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import type { SkiDay } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { getResortColor } from '../../utils/colors';
import { formatDate, formatNumber } from '../../utils/formatters';

interface VerticalChartProps {
  days: SkiDay[];
}

interface ChartPayload {
  id: string;
  date: string;
  vertical: number;
  resort: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPayload; value: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a2235] px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-sm text-snow-200/60">
        {formatNumber(data.value)}m vertical
      </p>
      <p className="text-xs text-snow-200/40">{data.payload.resort}</p>
    </div>
  );
}

export default function VerticalChart({ days }: VerticalChartProps) {
  const navigate = useNavigate();

  const chartData = days.map((day) => ({
    id: day.id,
    date: formatDate(day.date, 'short'),
    vertical: day.verticalMeters,
    resort: day.resort,
  }));

  const handleBarClick = useCallback(
    (data: ChartPayload) => {
      useAppStore.getState().setActiveDay(data.id);
      navigate(`/day/${data.id}`);
    },
    [navigate],
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        onClick={(state) => {
          if (state?.activePayload?.[0]?.payload) {
            handleBarClick(state.activePayload[0].payload as ChartPayload);
          }
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#8ba3d4', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#8ba3d4', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => formatNumber(v)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="vertical" radius={[4, 4, 0, 0]} cursor="pointer">
          {chartData.map((entry) => (
            <Cell key={entry.id} fill={getResortColor(entry.resort)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
