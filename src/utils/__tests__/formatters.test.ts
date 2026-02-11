import { describe, it, expect } from 'vitest';
import { formatNumber, formatDecimal, formatDate, formatDateFull, formatSpeed, minutesToTime } from '../formatters';

describe('formatNumber', () => {
  it('formats integers with commas', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(103590)).toBe('103,590');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatDecimal', () => {
  it('formats with one decimal by default', () => {
    expect(formatDecimal(42.36)).toBe('42.4');
  });

  it('formats with specified decimals', () => {
    expect(formatDecimal(42.369, 2)).toBe('42.37');
  });
});

describe('formatDate', () => {
  it('formats date as short month + day', () => {
    const result = formatDate('2025-12-07');
    expect(result).toContain('Dec');
    expect(result).toContain('7');
  });
});

describe('formatDateFull', () => {
  it('formats full date with weekday', () => {
    const result = formatDateFull('2025-12-07');
    expect(result).toContain('December');
    expect(result).toContain('2025');
  });
});

describe('formatSpeed', () => {
  it('formats speed with km/h', () => {
    expect(formatSpeed(85.3)).toBe('85.3 km/h');
  });

  it('returns -- for null', () => {
    expect(formatSpeed(null)).toBe('--');
  });
});

describe('minutesToTime', () => {
  it('converts minutes to HH:MM', () => {
    expect(minutesToTime(510)).toBe('08:30');
    expect(minutesToTime(960)).toBe('16:00');
    expect(minutesToTime(0)).toBe('00:00');
  });
});
