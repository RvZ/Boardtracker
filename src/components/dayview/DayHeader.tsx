import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { SkiDay } from '../../types';
import { formatDateFull, formatNumber, formatDecimal } from '../../utils/formatters';

interface DayHeaderProps {
  day: SkiDay;
}

interface StatBadgeProps {
  label: string;
  value: string;
  colorClass: string;
}

function StatBadge({ label, value, colorClass }: StatBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl border border-white/5 bg-white/5">
      <span className={`text-lg font-bold ${colorClass}`}>{value}</span>
      <span className="text-xs text-snow-400">{label}</span>
    </div>
  );
}

export default function DayHeader({ day }: DayHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top row: back button + date + resort */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={20} className="text-snow-300" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-snow-100">
            {day.resort}
          </h1>
          <p className="text-sm text-snow-400">
            {formatDateFull(day.date)}
          </p>
        </div>
      </div>

      {/* Stat badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge
          label="Vertical"
          value={`${formatNumber(day.totalVerticalMeters)}m`}
          colorClass="text-pine-400"
        />
        <StatBadge
          label="Distance"
          value={`${formatDecimal(day.totalDistanceKm)}km`}
          colorClass="text-ice-400"
        />
        <StatBadge
          label="Lifts"
          value={formatNumber(day.numberOfLifts)}
          colorClass="text-powder-400"
        />
        <StatBadge
          label="Top Speed"
          value={day.topSpeed !== null ? `${formatDecimal(day.topSpeed)}km/h` : '--'}
          colorClass="text-fire-400"
        />
      </div>
    </motion.div>
  );
}
