import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, CableCar } from 'lucide-react';

import { useAppStore } from '../store/useAppStore';
import { calculateSeasonStats } from '../utils/calculations';
import { formatNumber, formatDecimal } from '../utils/formatters';
import { CHART_COLORS } from '../utils/colors';
import GlassCard from '../components/shared/GlassCard';
import StatGrid from '../components/dashboard/StatGrid';
import VerticalChart from '../components/dashboard/VerticalChart';
import SeasonTimeline from '../components/dashboard/SeasonTimeline';

export default function Dashboard() {
  const navigate = useNavigate();
  const season = useAppStore((state) => state.getActiveSeason());
  const isDemo = useAppStore((state) => state.isDemo);

  if (!season) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <GlassCard>
          <div className="flex flex-col items-center gap-4 p-12 text-center">
            <TrendingUp className="h-12 w-12 text-snow-200/30" />
            <h2 className="text-xl font-semibold text-white">No Season Data</h2>
            <p className="max-w-sm text-sm text-snow-200/60">
              Import your ski data to see your season dashboard with stats,
              charts, and a timeline of every day on the mountain.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  const stats = calculateSeasonStats(season);

  const handleDayClick = (id: string) => {
    useAppStore.getState().setActiveDay(id);
    navigate(`/day/${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white">
          Season {season.name}
        </h1>
        {isDemo && (
          <span className="inline-flex items-center gap-1 rounded-full bg-fire/20 px-2.5 py-0.5 text-xs font-semibold text-fire">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fire" />
            LIVE
          </span>
        )}
      </div>

      {/* Stat Grid */}
      <StatGrid stats={stats} />

      {/* Vertical Chart */}
      <GlassCard>
        <div className="flex flex-col gap-3 p-4">
          <h2 className="text-sm font-medium text-snow-200/60">
            Vertical Per Day
          </h2>
          <VerticalChart days={season.days} />
        </div>
      </GlassCard>

      {/* Season Timeline */}
      <GlassCard>
        <div className="flex flex-col gap-3 p-4">
          <h2 className="text-sm font-medium text-snow-200/60">
            Season Timeline
          </h2>
          <SeasonTimeline days={season.days} onDayClick={handleDayClick} />
        </div>
      </GlassCard>

      {/* Bottom Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 p-4">
              <MapPin className="h-5 w-5" style={{ color: CHART_COLORS.peak }} />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  {stats.resortsVisited}
                </span>
                <span className="text-sm text-snow-200/60">
                  Resorts Visited
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 p-4">
              <TrendingUp className="h-5 w-5" style={{ color: CHART_COLORS.pine }} />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  {formatDecimal(stats.avgVerticalPerDay)}
                  <span className="ml-1 text-sm font-normal text-snow-200/60">m</span>
                </span>
                <span className="text-sm text-snow-200/60">
                  Avg Vertical / Day
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 p-4">
              <CableCar className="h-5 w-5" style={{ color: CHART_COLORS.snow }} />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  {formatNumber(stats.totalLifts)}
                </span>
                <span className="text-sm text-snow-200/60">
                  Total Lifts
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
