import { Mountain, MapPin, Calendar, Gauge } from 'lucide-react';

import { CHART_COLORS } from '../../utils/colors';
import type { SeasonStats } from '../../types';
import StatCard from './StatCard';

interface StatGridProps {
  stats: SeasonStats;
}

export default function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Mountain}
        value={stats.totalVerticalMeters}
        label="Total Vertical"
        suffix="m"
        color={CHART_COLORS.pine}
        delay={0}
      />
      <StatCard
        icon={MapPin}
        value={stats.totalDistanceKm}
        label="Total Distance"
        suffix="km"
        decimals={1}
        color={CHART_COLORS.ice}
        delay={0.1}
      />
      <StatCard
        icon={Calendar}
        value={stats.totalDays}
        label="Ski Days"
        color={CHART_COLORS.powder}
        delay={0.2}
      />
      <StatCard
        icon={Gauge}
        value={stats.topSpeed}
        label="Top Speed"
        suffix="km/h"
        decimals={1}
        color={CHART_COLORS.fire}
        delay={0.3}
      />
    </div>
  );
}
