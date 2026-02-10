import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { Resort } from '../../types';
import { getResortColor } from '../../utils/colors';
import { formatNumber } from '../../utils/formatters';

interface ResortPieChartProps {
  resorts: Resort[];
}

const RADIAN = Math.PI / 180;

function renderLabel({ cx, cy, midAngle, outerRadius, name, percent }: any) {
  if (percent < 0.05) return null;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="rgba(255,255,255,0.7)"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
    >
      {name}
    </text>
  );
}

export default function ResortPieChart({ resorts }: ResortPieChartProps) {
  const data = resorts.map((r) => ({
    name: r.name,
    value: r.daysVisited,
    vertical: r.totalVertical,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={45}
          dataKey="value"
          nameKey="name"
          label={renderLabel as any}
          labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
          strokeWidth={1}
          stroke="rgba(0,0,0,0.3)"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={getResortColor(index)} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a2235',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#dce4f5',
            fontSize: 13,
          }}
          formatter={(value: any, _name: any, props: any) => [
            `${value} day${value !== 1 ? 's' : ''} — ${formatNumber(props.payload.vertical)} m vertical`,
            props.payload.name,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
