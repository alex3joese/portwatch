'use strict';

const {
  resetMetrics,
  increment,
  setGauge,
  getCounter,
  getGauge,
  getSnapshot,
  getSummary,
} = require('./metrics');

beforeEach(() => {
  resetMetrics();
});

describe('increment', () => {
  test('starts counters at 0 and increments', () => {
    expect(getCounter('scans')).toBe(0);
    increment('scans');
    expect(getCounter('scans')).toBe(1);
    increment('scans', 4);
    expect(getCounter('scans')).toBe(5);
  });

  test('tracks multiple counters independently', () => {
    increment('scans');
    increment('alerts', 3);
    expect(getCounter('scans')).toBe(1);
    expect(getCounter('alerts')).toBe(3);
  });

  test('throws on invalid name', () => {
    expect(() => increment('')).toThrow();
    expect(() => increment(42)).toThrow();
  });
});

describe('setGauge / getGauge', () => {
  test('sets and retrieves a gauge value', () => {
    setGauge('openPorts', 12);
    expect(getGauge('openPorts')).toBe(12);
  });

  test('returns null for unknown gauge', () => {
    expect(getGauge('missing')).toBeNull();
  });

  test('throws on non-number value', () => {
    expect(() => setGauge('x', 'oops')).toThrow();
  });
});

describe('getSnapshot', () => {
  test('returns counters, gauges, and uptimeMs', () => {
    increment('scans', 2);
    setGauge('openPorts', 7);
    const snap = getSnapshot();
    expect(snap.counters.scans).toBe(2);
    expect(snap.gauges.openPorts).toBe(7);
    expect(typeof snap.uptimeMs).toBe('number');
    expect(snap.uptimeMs).toBeGreaterThanOrEqual(0);
  });

  test('snapshot is a copy — mutations do not affect internal state', () => {
    increment('scans');
    const snap = getSnapshot();
    snap.counters.scans = 999;
    expect(getCounter('scans')).toBe(1);
  });
});

describe('getSummary', () => {
  test('returns a formatted string with all metrics', () => {
    increment('alerts', 2);
    setGauge('openPorts', 5);
    const summary = getSummary();
    expect(summary).toMatch(/counter\/alerts: 2/);
    expect(summary).toMatch(/gauge\/openPorts: 5/);
    expect(summary).toMatch(/uptime:/);
  });
});
