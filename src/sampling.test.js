// sampling.test.js

'use strict';

const {
  applyRateSampling,
  applyIntervalSampling,
  applySampling,
  createSampler,
} = require('./sampling');

const bindings = [
  { port: 80 }, { port: 443 }, { port: 8080 },
  { port: 3000 }, { port: 5432 }, { port: 6379 },
];

describe('applyRateSampling', () => {
  test('rate=1.0 returns all', () => {
    expect(applyRateSampling(bindings, 1.0)).toHaveLength(bindings.length);
  });

  test('rate=0.0 returns none', () => {
    expect(applyRateSampling(bindings, 0.0)).toHaveLength(0);
  });

  test('rate=0.5 returns roughly half (probabilistic)', () => {
    const results = [];
    for (let i = 0; i < 100; i++) {
      results.push(applyRateSampling(bindings, 0.5).length);
    }
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    expect(avg).toBeGreaterThan(1);
    expect(avg).toBeLessThan(bindings.length);
  });
});

describe('applyIntervalSampling', () => {
  test('every=1 returns all', () => {
    expect(applyIntervalSampling(bindings, 1)).toHaveLength(bindings.length);
  });

  test('every=2 returns every other', () => {
    const result = applyIntervalSampling(bindings, 2);
    expect(result).toHaveLength(3);
    expect(result[0].port).toBe(443);
  });

  test('every=3 returns every third', () => {
    const result = applyIntervalSampling(bindings, 3);
    expect(result).toHaveLength(2);
  });
});

describe('applySampling', () => {
  test('defaults to rate mode, rate=1.0', () => {
    expect(applySampling(bindings, {})).toHaveLength(bindings.length);
  });

  test('interval mode', () => {
    expect(applySampling(bindings, { mode: 'interval', every: 2 })).toHaveLength(3);
  });
});

describe('createSampler', () => {
  test('stores config', () => {
    const s = createSampler({ rate: 0.5, every: 2 });
    expect(s.rate).toBe(0.5);
    expect(s.every).toBe(2);
  });

  test('defaults', () => {
    const s = createSampler();
    expect(s.rate).toBe(1.0);
    expect(s.every).toBe(1);
  });
});
