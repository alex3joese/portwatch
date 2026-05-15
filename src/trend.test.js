// trend.test.js

'use strict';

const {
  createTrend, recordSample, getAverage, getSlope, isAnomaly, getTrendSummary
} = require('./trend');
const { validateTrendConfig, resolveTrendConfig } = require('./trend.config');

describe('createTrend', () => {
  it('creates trend with default window size', () => {
    const t = createTrend();
    expect(t.windowSize).toBe(10);
    expect(t.samples).toEqual([]);
  });

  it('respects custom windowSize', () => {
    const t = createTrend({ windowSize: 5 });
    expect(t.windowSize).toBe(5);
  });
});

describe('recordSample', () => {
  it('appends samples', () => {
    const t = createTrend({ windowSize: 3 });
    recordSample(t, 10, 1000);
    recordSample(t, 12, 2000);
    expect(t.samples.length).toBe(2);
  });

  it('evicts oldest sample when window is full', () => {
    const t = createTrend({ windowSize: 3 });
    recordSample(t, 1, 1000);
    recordSample(t, 2, 2000);
    recordSample(t, 3, 3000);
    recordSample(t, 4, 4000);
    expect(t.samples.length).toBe(3);
    expect(t.samples[0].count).toBe(2);
  });

  it('stores the timestamp alongside the count', () => {
    const t = createTrend({ windowSize: 5 });
    recordSample(t, 7, 1234);
    expect(t.samples[0].timestamp).toBe(1234);
    expect(t.samples[0].count).toBe(7);
  });
});

describe('getAverage', () => {
  it('returns 0 for empty trend', () => {
    expect(getAverage(createTrend())).toBe(0);
  });

  it('computes average correctly', () => {
    const t = createTrend();
    recordSample(t, 10, 1000);
    recordSample(t, 20, 2000);
    expect(getAverage(t)).toBe(15);
  });
});

describe('getSlope', () => {
  it('returns 0 with fewer than 2 samples', () => {
    const t = createTrend();
    recordSample(t, 5, 1000);
    expect(getSlope(t)).toBe(0);
  });

  it('computes slope in units per second', () => {
    const t = createTrend();
    recordSample(t, 0, 0);
    recordSample(t, 10, 5000);
    expect(getSlope(t)).toBeCloseTo(2);
  });
});

describe('isAnomaly', () => {
  it('returns false with fewer than 3 samples', () => {
    const t = createTrend();
    recordSample(t, 5, 1000);
    recordSample(t, 6, 2000);
    expect(isAnomaly(t)).toBe(false);
  });

  it('detects spike as anomaly', () => {
    const t = createTrend();
    for (let i = 0; i < 8; i++) recordSample(t, 5, i * 1000);
    recordSample(t, 50, 9000);
    expect(isAnomaly(t, 1.0)).toBe(true);
  });

  it('does not flag stable counts', () => {
    const t = createTrend();
    for (let i = 0; i < 9; i++) recordSample(t, 5, i * 1000);
    expect(isAnomaly(t)).toBe(false);
  });
});

describe('getTrendSummary', () => {
  it('returns null latest for empty trend', () => {
    expect(getTrendSummary(createTrend()).latest).toBeNull();
  });

  it('returns summary object with all fields', () => {
    const t = createTrend();
    recordSample(t, 4, 0);
    recordSample(t, 6, 1000);
    recordSample(t, 5, 2000);
    const s = getTrendSummary(t);
    expect(s).toHaveProperty('sampleCount', 3);
    expect(s).toHaveProperty('average');
    expect(s).toHaveProperty('slope');
    expect(s).toHaveProperty('anomaly');
    expect(s.latest).toBe(5);
  });

  it('sampleCount matches number of recorded samples', () => {
    const t = createTrend({ windowSize: 10 });
    for (let i = 0; i < 6; i++) recordSample(t, i, i * 1000);
    expect(getTrendSummary(t).sampleCount).toBe(6);
  });
});

describe('resolveTrendConfig', () => {
  it('applies de
