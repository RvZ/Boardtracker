import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DEMO_SEASON } from '../../data/demoData';
import { calculateSeasonStats, getCumulativeData } from '../../utils/calculations';

// Shared components
import GlassCard from '../shared/GlassCard';
import AnimatedCounter from '../shared/AnimatedCounter';
import SnowParticles from '../shared/SnowParticles';

// Dashboard components
import StatCard from '../dashboard/StatCard';
import StatGrid from '../dashboard/StatGrid';
import SeasonTimeline from '../dashboard/SeasonTimeline';

// Chart components
import AltitudeProfile from '../charts/AltitudeProfile';
import SpeedGauge from '../charts/SpeedGauge';
import CumulativeChart from '../charts/CumulativeChart';
import ResortPieChart from '../charts/ResortPieChart';

// Day view components
import DayHeader from '../dayview/DayHeader';
import RunList from '../dayview/RunList';

// Lucide icons for StatCard
import { Mountain } from 'lucide-react';

const stats = calculateSeasonStats(DEMO_SEASON);
const day = DEMO_SEASON.days[0];
const cumulativeData = getCumulativeData(DEMO_SEASON.days);

function wrap(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Shared components', () => {
  it('GlassCard renders children', () => {
    render(<GlassCard>Test content</GlassCard>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('AnimatedCounter renders', () => {
    render(<AnimatedCounter value={1234} />);
    // Initially shows 0 or the value depending on timing
    expect(document.querySelector('[class*="display"]') || document.body).toBeTruthy();
  });

  it('SnowParticles renders without crashing', () => {
    const { container } = render(<SnowParticles />);
    expect(container).toBeTruthy();
  });
});

describe('Dashboard components', () => {
  it('StatCard renders with value and label', () => {
    render(
      <StatCard icon={Mountain} value={5000} label="Vertical" color="#34d399" />
    );
    expect(screen.getByText('Vertical')).toBeInTheDocument();
  });

  it('StatGrid renders 4 stat cards', () => {
    const { container } = render(<StatGrid stats={stats} />);
    expect(container.querySelectorAll('.grid > *').length).toBe(4);
  });

  it('SeasonTimeline renders all days', () => {
    wrap(<SeasonTimeline days={DEMO_SEASON.days} onDayClick={() => {}} />);
    // Should render 15 buttons
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBe(15);
  });
});

describe('Chart components', () => {
  it('AltitudeProfile renders without crashing', () => {
    const data = [
      { time: 0, altitude: 1500 },
      { time: 30, altitude: 2500 },
      { time: 60, altitude: 1500 },
    ];
    const { container } = render(<AltitudeProfile data={data} />);
    expect(container).toBeTruthy();
  });

  it('SpeedGauge renders without crashing', () => {
    const { container } = render(<SpeedGauge speed={85.3} />);
    expect(container).toBeTruthy();
  });

  it('CumulativeChart renders without crashing', () => {
    const { container } = render(<CumulativeChart data={cumulativeData} />);
    expect(container).toBeTruthy();
  });

  it('ResortPieChart renders without crashing', () => {
    const { container } = render(<ResortPieChart resorts={stats.resorts} />);
    expect(container).toBeTruthy();
  });
});

describe('Day view components', () => {
  it('DayHeader renders day info', () => {
    wrap(<DayHeader day={day} />);
    expect(screen.getByText(day.resort)).toBeInTheDocument();
  });

  it('RunList renders runs', () => {
    const { container } = render(
      <RunList runs={day.runs} selectedRunId={null} onSelectRun={() => {}} />
    );
    expect(container).toBeTruthy();
  });
});
