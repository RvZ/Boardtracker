import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatDate, formatNumber, formatDecimal } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/colors';

interface CumulativeDataPoint {
  date: string;
  vertical: number;
  distance: number;
}

interface CumulativeChartProps {
  data: CumulativeDataPoint[];
}

export default function CumulativeChart({ data }: CumulativeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="rgba(255,255,255,0.4)"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <YAxis
          yAxisId="vertical"
          orientation="left"
          stroke="rgba(255,255,255,0.4)"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickFormatter={(v: number) => `${formatNumber(v)} m`}
        />
        <YAxis
          yAxisId="distance"
          orientation="right"
          stroke="rgba(255,255,255,0.4)"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickFormatter={(v: number) => `${formatDecimal(v)} km`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a2235',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#dce4f5',
            fontSize: 13,
          }}
          labelFormatter={(label: any) => formatDate(String(label))}
          formatter={(value: any, name: any) => {
            if (name === 'Vertical') return [`${formatNumber(Math.round(value))} m`, name];
            return [`${formatDecimal(value)} km`, name];
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ paddingTop: 12, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}
        />
        <Line
          yAxisId="vertical"
          type="monotone"
          dataKey="vertical"
          name="Vertical"
          stroke={CHART_COLORS.ice}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: CHART_COLORS.ice, stroke: '#fff', strokeWidth: 2 }}
        />
        <Line
          yAxisId="distance"
          type="monotone"
          dataKey="distance"
          name="Distance"
          stroke={CHART_COLORS.powder}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: CHART_COLORS.powder, stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
