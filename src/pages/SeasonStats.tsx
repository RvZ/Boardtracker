import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, CableCar, MapPin } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { calculateSeasonStats, getCumulativeData } from '../utils/calculations';
import { formatNumber, formatDecimal, formatDate } from '../utils/formatters';
import { getResortColor } from '../utils/colors';
import GlassCard from '../components/shared/GlassCard';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import CumulativeChart from '../components/charts/CumulativeChart';
import ResortPieChart from '../components/charts/ResortPieChart';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function SeasonStats() {
  const season = useAppStore((s) => s.getActiveSeason());

  const stats = useMemo(() => {
    if (!season) return null;
    return calculateSeasonStats(season);
  }, [season]);

  const cumulativeData = useMemo(() => {
    if (!season) return [];
    return getCumulativeData(season.days);
  }, [season]);

  if (!season || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-snow-200/60 text-lg">No season data available.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-4xl text-snow-50 tracking-wide">Season Statistics</h1>
        <p className="text-snow-200/60 mt-1">{season.name} — {stats.totalDays} days on the mountain</p>
      </motion.div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Best Day */}
        <motion.div variants={itemVariants}>
          <GlassCard className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-fire-400" />
              <span className="text-snow-200/70 text-sm font-medium uppercase tracking-wider">Best Day</span>
            </div>
            {stats.bestDay ? (
              <>
                <AnimatedCounter value={stats.bestDay.totalVerticalMeters} suffix=" m" />
                <p className="text-snow-200/50 text-sm mt-2">
                  {formatDate(stats.bestDay.date)} — {stats.bestDay.resort}
                </p>
              </>
            ) : (
              <p className="text-snow-200/50">--</p>
            )}
          </GlassCard>
        </motion.div>

        {/* Avg Vertical/Day */}
        <motion.div variants={itemVariants}>
          <GlassCard className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-ice-400" />
              <span className="text-snow-200/70 text-sm font-medium uppercase tracking-wider">Avg Vertical/Day</span>
            </div>
            <AnimatedCounter value={Math.round(stats.avgVerticalPerDay)} suffix=" m" />
            <p className="text-snow-200/50 text-sm mt-2">
              {formatNumber(Math.round(stats.totalVerticalMeters))} m total
            </p>
          </GlassCard>
        </motion.div>

        {/* Total Lifts */}
        <motion.div variants={itemVariants}>
          <GlassCard className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CableCar className="w-5 h-5 text-pine-400" />
              <span className="text-snow-200/70 text-sm font-medium uppercase tracking-wider">Total Lifts</span>
            </div>
            <AnimatedCounter value={stats.totalLifts} />
            <p className="text-snow-200/50 text-sm mt-2">
              {formatDecimal(stats.totalLifts / stats.totalDays)} per day avg
            </p>
          </GlassCard>
        </motion.div>

        {/* Resorts Visited */}
        <motion.div variants={itemVariants}>
          <GlassCard className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-powder-400" />
              <span className="text-snow-200/70 text-sm font-medium uppercase tracking-wider">Resorts Visited</span>
            </div>
            <AnimatedCounter value={stats.resortsVisited} />
            <p className="text-snow-200/50 text-sm mt-2">
              {stats.resorts.length > 0 ? stats.resorts[0].name : '--'} most visited
            </p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Cumulative Chart */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <h2 className="font-display text-2xl text-snow-50 tracking-wide mb-4">Cumulative Progress</h2>
          <CumulativeChart data={cumulativeData} />
        </GlassCard>
      </motion.div>

      {/* Two-column: Pie Chart + Days by Resort */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <GlassCard>
            <h2 className="font-display text-2xl text-snow-50 tracking-wide mb-4">Resort Distribution</h2>
            <ResortPieChart resorts={stats.resorts} />
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard>
            <h2 className="font-display text-2xl text-snow-50 tracking-wide mb-4">Days by Resort</h2>
            <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {stats.resorts
                .sort((a, b) => b.daysVisited - a.daysVisited)
                .map((resort, i) => (
                  <li
                    key={resort.id}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getResortColor(i) }}
                      />
                      <div>
                        <p className="text-snow-100 text-sm font-medium">{resort.name}</p>
                        <p className="text-snow-200/50 text-xs">{resort.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-snow-100 text-sm font-medium">
                        {resort.daysVisited} day{resort.daysVisited !== 1 ? 's' : ''}
                      </p>
                      <p className="text-snow-200/50 text-xs">{formatNumber(resort.totalVertical)} m</p>
                    </div>
                  </li>
                ))}
            </ul>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
