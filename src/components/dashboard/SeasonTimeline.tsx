import { motion } from 'framer-motion';

import type { SkiDay } from '../../types';
import { getResortColor } from '../../utils/colors';
import { formatDate, formatNumber } from '../../utils/formatters';

interface SeasonTimelineProps {
  days: SkiDay[];
  onDayClick: (id: string) => void;
}

export default function SeasonTimeline({ days, onDayClick }: SeasonTimelineProps) {
  return (
    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin">
      {days.map((day, index) => {
        const resortColor = getResortColor(index);

        return (
          <motion.button
            key={day.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onDayClick(day.id)}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-4 py-3 transition-colors hover:border-white/15 hover:bg-white/10 shrink-0 min-w-[100px] cursor-pointer"
          >
            <span className="text-xs text-snow-200/50 whitespace-nowrap">
              {formatDate(day.date)}
            </span>

            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: resortColor }}
            />

            <span className="text-sm font-semibold text-white">
              {formatNumber(day.totalVerticalMeters)}m
            </span>

            <span
              className="text-[10px] font-medium whitespace-nowrap"
              style={{ color: resortColor }}
            >
              {day.resort}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
