import AnimatedCounter from '../shared/AnimatedCounter';

interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
}

export default function SpeedGauge({ speed, maxSpeed = 120 }: SpeedGaugeProps) {
  const ratio = Math.min(speed / maxSpeed, 1);

  // Arc parameters: semicircle from 180deg to 0deg (left to right)
  const cx = 100;
  const cy = 100;
  const r = 80;
  const strokeWidth = 12;

  // Start angle (left) = PI, End angle (right) = 0
  const startAngle = Math.PI;
  const endAngle = 0;
  const sweepAngle = startAngle - endAngle;

  // Background arc endpoints
  const bgX1 = cx + r * Math.cos(startAngle);
  const bgY1 = cy - r * Math.sin(startAngle);
  const bgX2 = cx + r * Math.cos(endAngle);
  const bgY2 = cy - r * Math.sin(endAngle);

  // Foreground arc: fills from left proportionally
  const fgEndAngle = startAngle - sweepAngle * ratio;
  const fgX2 = cx + r * Math.cos(fgEndAngle);
  const fgY2 = cy - r * Math.sin(fgEndAngle);
  const largeArc = ratio > 0.5 ? 1 : 0;

  const bgPath = `M ${bgX1} ${bgY1} A ${r} ${r} 0 1 1 ${bgX2} ${bgY2}`;
  const fgPath = `M ${bgX1} ${bgY1} A ${r} ${r} 0 ${largeArc} 1 ${fgX2} ${fgY2}`;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[280px]">
        <defs>
          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="#1a2235"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Foreground arc */}
        {ratio > 0 && (
          <path
            d={fgPath}
            fill="none"
            stroke="url(#speedGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
      </svg>

      <div className="flex flex-col items-center -mt-16">
        <AnimatedCounter value={speed} decimals={1} />
        <span className="text-sm text-snow-400 mt-1 tracking-wider">km/h</span>
      </div>
    </div>
  );
}
