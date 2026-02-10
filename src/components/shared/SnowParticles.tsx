import { useMemo } from 'react';

interface Particle {
  id: number;
  left: string;
  size: number;
  duration: string;
  delay: string;
  animation: string;
}

export default function SnowParticles() {
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const size = Math.random() * 3 + 2; // 2-5px
      const animationDuration = Math.random() * 12 + 8; // 8-20s
      const animationDelay = Math.random() * 15; // 0-15s
      const animationName = i % 2 === 0 ? 'snowfall' : 'snowfall-reverse';

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        size,
        duration: `${animationDuration}s`,
        delay: `${animationDelay}s`,
        animation: animationName,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white/30"
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationName: particle.animation,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  );
}
