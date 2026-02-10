import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Run } from '../../types';
import { formatTime } from '../../utils/formatters';

interface RunListProps {
  runs: Run[];
  selectedRunId: string | null;
  onSelectRun: (id: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export default function RunList({ runs, selectedRunId, onSelectRun }: RunListProps) {
  return (
    <motion.div
      className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {runs.map((run) => {
        const isSelected = run.id === selectedRunId;
        const isLift = run.isLift;

        return (
          <motion.div
            key={run.id}
            variants={item}
            onClick={() => onSelectRun(run.id)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
              transition-all duration-200
              ${isSelected
                ? 'border-2 border-ice-400 bg-ice-400/10'
                : 'border border-white/5 bg-white/5 hover:bg-white/10'
              }
              ${isLift ? 'opacity-60' : 'opacity-100'}
            `}
          >
            {/* Direction icon */}
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-lg shrink-0
                ${isLift ? 'bg-powder-500/20 text-powder-400' : 'bg-pine-500/20 text-pine-400'}
              `}
            >
              {isLift ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
            </div>

            {/* Run info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isLift ? 'text-snow-400' : 'text-snow-100'}`}>
                {run.liftName}
              </p>
              <p className="text-xs text-snow-500">
                {formatTime(run.startTime)} – {formatTime(run.endTime)}
              </p>
            </div>

            {/* Vertical drop */}
            <div className="text-right shrink-0">
              <p className={`text-sm font-semibold ${isLift ? 'text-snow-400' : 'text-snow-100'}`}>
                {run.verticalDrop}m
              </p>
            </div>

            {/* Speed badge (descent only) */}
            {!isLift && run.maxSpeedKmh !== null && (
              <div className="shrink-0 bg-fire-500/20 text-fire-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                {run.maxSpeedKmh.toFixed(1)} km/h
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
