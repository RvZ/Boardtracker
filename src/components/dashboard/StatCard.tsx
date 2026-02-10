import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

import GlassCard from '../shared/GlassCard';
import AnimatedCounter from '../shared/AnimatedCounter';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
  color: string;
  delay?: number;
}

export default function StatCard({
  icon: Icon,
  value,
  label,
  suffix,
  decimals = 0,
  color,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <GlassCard>
        <div className="flex flex-col gap-2 p-4">
          <Icon className="h-5 w-5" style={{ color }} />
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              <AnimatedCounter value={value} decimals={decimals} />
            </span>
            {suffix && (
              <span className="text-sm font-medium text-snow-200/60">
                {suffix}
              </span>
            )}
          </div>
          <span className="text-sm text-snow-200/60">{label}</span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
