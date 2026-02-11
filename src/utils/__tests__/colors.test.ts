import { describe, it, expect } from 'vitest';
import { CHART_COLORS, RESORT_COLORS, getResortColor } from '../colors';

describe('CHART_COLORS', () => {
  it('has all expected color keys', () => {
    expect(CHART_COLORS.ice).toBe('#38bdf8');
    expect(CHART_COLORS.powder).toBe('#a78bfa');
    expect(CHART_COLORS.fire).toBe('#f97316');
    expect(CHART_COLORS.pine).toBe('#34d399');
  });
});

describe('getResortColor', () => {
  it('returns colors for valid indices', () => {
    expect(getResortColor(0)).toBe(RESORT_COLORS[0]);
    expect(getResortColor(1)).toBe(RESORT_COLORS[1]);
  });

  it('wraps around for large indices', () => {
    expect(getResortColor(RESORT_COLORS.length)).toBe(RESORT_COLORS[0]);
    expect(getResortColor(RESORT_COLORS.length + 1)).toBe(RESORT_COLORS[1]);
  });
});
