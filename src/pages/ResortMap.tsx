import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mountain } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { calculateSeasonStats } from '../utils/calculations';
import { formatNumber } from '../utils/formatters';
import { getResortColor } from '../utils/colors';
import GlassCard from '../components/shared/GlassCard';
import type { Resort } from '../types';

// SVG viewBox covers roughly the Austrian/Central Alps region
// Longitude ~9.5 to ~16.5, Latitude ~46.3 to ~47.8
const VIEW = {
  minLng: 9.5,
  maxLng: 16.5,
  minLat: 46.3,
  maxLat: 47.8,
  width: 700,
  height: 300,
};

function projectLng(lng: number): number {
  return ((lng - VIEW.minLng) / (VIEW.maxLng - VIEW.minLng)) * VIEW.width;
}

function projectLat(lat: number): number {
  // Invert Y because SVG y increases downward
  return VIEW.height - ((lat - VIEW.minLat) / (VIEW.maxLat - VIEW.minLat)) * VIEW.height;
}

// Stylized Alpine ridge outline (simplified polyline)
const ALPINE_RIDGE = [
  [9.5, 47.0],
  [10.0, 47.3],
  [10.5, 47.15],
  [11.0, 47.35],
  [11.4, 47.1],
  [11.8, 47.25],
  [12.2, 47.35],
  [12.6, 47.15],
  [13.0, 47.3],
  [13.4, 47.1],
  [13.8, 47.2],
  [14.2, 47.05],
  [14.6, 47.15],
  [15.0, 47.0],
  [15.5, 47.1],
  [16.0, 46.9],
  [16.5, 46.8],
] as const;

const ridgePoints = ALPINE_RIDGE.map(([lng, lat]) => `${projectLng(lng)},${projectLat(lat)}`).join(' ');

// Secondary lower ridgeline
const LOWER_RIDGE = [
  [9.5, 46.7],
  [10.2, 46.8],
  [10.8, 46.65],
  [11.5, 46.75],
  [12.0, 46.6],
  [12.7, 46.7],
  [13.3, 46.55],
  [14.0, 46.65],
  [14.8, 46.5],
  [15.5, 46.6],
  [16.5, 46.5],
] as const;

const lowerRidgePoints = LOWER_RIDGE.map(([lng, lat]) => `${projectLng(lng)},${projectLat(lat)}`).join(' ');

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

interface TooltipState {
  resort: Resort;
  x: number;
  y: number;
}

export default function ResortMap() {
  const season = useAppStore((s) => s.getActiveSeason());
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const stats = useMemo(() => {
    if (!season) return null;
    return calculateSeasonStats(season);
  }, [season]);

  const resorts = stats?.resorts ?? [];

  // Calculate radius scale based on total vertical
  const maxVertical = Math.max(...resorts.map((r) => r.totalVertical), 1);

  function getRadius(resort: Resort): number {
    const minR = 6;
    const maxR = 22;
    return minR + (resort.totalVertical / maxVertical) * (maxR - minR);
  }

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
        <h1 className="font-display text-4xl text-snow-50 tracking-wide">Resort Map</h1>
        <p className="text-snow-200/60 mt-1">{resorts.length} resorts across the Alps</p>
      </motion.div>

      {/* SVG Map */}
      <motion.div variants={itemVariants}>
        <GlassCard className="relative overflow-hidden">
          <h2 className="font-display text-2xl text-snow-50 tracking-wide mb-4 flex items-center gap-2">
            <Mountain className="w-5 h-5 text-ice-400" />
            Alpine Overview
          </h2>

          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
              className="w-full h-auto min-h-[250px]"
              style={{ maxHeight: 400 }}
            >
              <defs>
                {/* Pulsing animation */}
                <radialGradient id="dotGlow">
                  <stop offset="0%" stopColor="rgba(56,189,248,0.3)" />
                  <stop offset="100%" stopColor="rgba(56,189,248,0)" />
                </radialGradient>
              </defs>

              {/* Background */}
              <rect width={VIEW.width} height={VIEW.height} fill="transparent" />

              {/* Grid lines */}
              {[10, 11, 12, 13, 14, 15, 16].map((lng) => (
                <line
                  key={`grid-lng-${lng}`}
                  x1={projectLng(lng)}
                  y1={0}
                  x2={projectLng(lng)}
                  y2={VIEW.height}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={1}
                />
              ))}
              {[46.5, 47.0, 47.5].map((lat) => (
                <line
                  key={`grid-lat-${lat}`}
                  x1={0}
                  y1={projectLat(lat)}
                  x2={VIEW.width}
                  y2={projectLat(lat)}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={1}
                />
              ))}

              {/* Mountain ridges */}
              <polyline
                points={ridgePoints}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={2}
                strokeLinejoin="round"
              />
              <polyline
                points={lowerRidgePoints}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeDasharray="6 4"
              />

              {/* Resort dots */}
              {resorts.map((resort, i) => {
                const cx = projectLng(resort.lng);
                const cy = projectLat(resort.lat);
                const r = getRadius(resort);
                const color = getResortColor(i);

                return (
                  <g
                    key={resort.id}
                    onMouseEnter={(e) => {
                      const svgEl = e.currentTarget.closest('svg');
                      if (!svgEl) return;
                      const rect = svgEl.getBoundingClientRect();
                      const scaleX = rect.width / VIEW.width;
                      const scaleY = rect.height / VIEW.height;
                      setTooltip({
                        resort,
                        x: cx * scaleX + rect.left,
                        y: cy * scaleY + rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    className="cursor-pointer"
                  >
                    {/* Outer pulse */}
                    <circle cx={cx} cy={cy} r={r + 4} fill={color} opacity={0.15}>
                      <animate
                        attributeName="r"
                        values={`${r + 2};${r + 10};${r + 2}`}
                        dur="3s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.2;0.05;0.2"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Main dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={color}
                      opacity={0.8}
                      stroke={color}
                      strokeWidth={1.5}
                      strokeOpacity={0.4}
                    />
                    {/* Inner highlight */}
                    <circle cx={cx} cy={cy - r * 0.25} r={r * 0.3} fill="rgba(255,255,255,0.3)" />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip overlay */}
            {tooltip && (
              <div
                className="fixed z-50 pointer-events-none px-3 py-2 rounded-xl bg-peak-700/95 border border-white/10 backdrop-blur-sm shadow-xl"
                style={{
                  left: tooltip.x,
                  top: tooltip.y - 70,
                  transform: 'translateX(-50%)',
                }}
              >
                <p className="text-snow-50 text-sm font-medium">{tooltip.resort.name}</p>
                <p className="text-snow-200/60 text-xs">
                  {tooltip.resort.daysVisited} day{tooltip.resort.daysVisited !== 1 ? 's' : ''} — {formatNumber(tooltip.resort.totalVertical)} m vert
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Resort list */}
      <motion.div variants={itemVariants}>
        <GlassCard>
          <h2 className="font-display text-2xl text-snow-50 tracking-wide mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-powder-400" />
            All Resorts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resorts
              .sort((a, b) => b.totalVertical - a.totalVertical)
              .map((resort, i) => (
                <div
                  key={resort.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <span
                    className="mt-1 w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getResortColor(i) }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-snow-100 font-medium text-sm truncate">{resort.name}</p>
                    <p className="text-snow-200/50 text-xs">{resort.country}</p>
                    <div className="flex gap-4 mt-1.5 text-xs text-snow-200/60">
                      <span>{resort.daysVisited} day{resort.daysVisited !== 1 ? 's' : ''}</span>
                      <span>{formatNumber(resort.totalVertical)} m</span>
                    </div>
                    {/* Mini bar */}
                    <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(resort.totalVertical / maxVertical) * 100}%`,
                          backgroundColor: getResortColor(i),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
