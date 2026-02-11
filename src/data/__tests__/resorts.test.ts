import { describe, it, expect } from 'vitest';
import { RESORT_DATA } from '../resorts';
import { DEMO_SEASON } from '../demoData';

describe('RESORT_DATA', () => {
  it('has entries for all demo season resorts', () => {
    const demoResortIds = new Set(DEMO_SEASON.days.map(d => d.resortId));
    for (const id of demoResortIds) {
      expect(RESORT_DATA[id]).toBeDefined();
      expect(RESORT_DATA[id].name).toBeTruthy();
      expect(RESORT_DATA[id].lat).toBeGreaterThan(40);
      expect(RESORT_DATA[id].lat).toBeLessThan(50);
      expect(RESORT_DATA[id].lng).toBeGreaterThan(5);
      expect(RESORT_DATA[id].lng).toBeLessThan(20);
    }
  });

  it('all resorts have valid coordinates', () => {
    for (const [, resort] of Object.entries(RESORT_DATA)) {
      expect(resort.name).toBeTruthy();
      expect(resort.country).toBeTruthy();
      expect(typeof resort.lat).toBe('number');
      expect(typeof resort.lng).toBe('number');
    }
  });
});
