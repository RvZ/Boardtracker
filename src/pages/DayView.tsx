import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { getDayAltitudeProfile } from '../utils/calculations';
import GlassCard from '../components/shared/GlassCard';
import DayHeader from '../components/dayview/DayHeader';
import RunList from '../components/dayview/RunList';
import AltitudeProfile from '../components/charts/AltitudeProfile';
import SpeedGauge from '../components/charts/SpeedGauge';

export default function DayView() {
  const { dayId } = useParams<{ dayId: string }>();
  const getActiveSeason = useAppStore((s) => s.getActiveSeason);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const season = getActiveSeason();
  const day = season?.days.find((d) => d.id === dayId) ?? null;

  if (!day) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl text-snow-300">Day not found</p>
        <Link
          to="/"
          className="text-ice-400 hover:text-ice-300 underline transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const altitudeData = getDayAltitudeProfile(day);
  const topSpeed = day.topSpeed ?? 0;

  return (
    <motion.div
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Header */}
      <DayHeader day={day} />

      {/* Altitude profile */}
      <div className="mt-6">
        <GlassCard>
          <h2 className="text-lg font-semibold text-snow-200 mb-4">
            Altitude Profile
          </h2>
          <AltitudeProfile data={altitudeData} />
        </GlassCard>
      </div>

      {/* Two-column: RunList + SpeedGauge */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="h-full">
            <h2 className="text-lg font-semibold text-snow-200 mb-4">
              Runs & Lifts
            </h2>
            <RunList
              runs={day.runs}
              selectedRunId={selectedRunId}
              onSelectRun={setSelectedRunId}
            />
          </GlassCard>
        </div>

        <div className="lg:col-span-1">
          <GlassCard className="h-full flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold text-snow-200 mb-6">
              Top Speed
            </h2>
            <SpeedGauge speed={topSpeed} />
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
