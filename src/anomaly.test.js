'use strict';

const {
  createAnomaly,
  isSpike,
  isNewPort,
  detectAnomalies,
  annotateWithAnomalies,
} = require('./anomaly');
const { createTrend, recordSample } = require('./trend');

function makeTrend(samples) {
  let t = createTrend({ windowSize: samples.length });
  for (const s of samples) t = recordSample(t, s);
  return t;
}

describe('createAnomaly', () => {
  it('uses defaults', () => {
    const a = createAnomaly();
    expect(a.spikeThreshold).toBe(3.0);
    expect(a.newPortWindowMs).toBe(60_000);
  });

  it('accepts custom config', () => {
    const a = createAnomaly({ spikeThreshold: 5, newPortWindowMs: 30_000 });
    expect(a.spikeThreshold).toBe(5);
  });
});

describe('isSpike', () => {
  it('returns false when slope/avg is below threshold', () => {
    const t = makeTrend([10, 11, 10, 11]);
    const a = createAnomaly({ spikeThreshold: 3 });
    expect(isSpike(t, a)).toBe(false);
  });

  it('returns false when avg is zero', () => {
    const t = makeTrend([0, 0, 0]);
    const a = createAnomaly();
    expect(isSpike(t, a)).toBe(false);
  });
});

describe('isNewPort', () => {
  it('returns true when port has no old history entries', () => {
    const a = createAnomaly({ newPortWindowMs: 60_000 });
    const history = [{ port: 8080, timestamp: new Date().toISOString() }];
    expect(isNewPort(9999, history, a)).toBe(true);
  });

  it('returns false when port has old history entries', () => {
    const a = createAnomaly({ newPortWindowMs: 60_000 });
    const old = new Date(Date.now() - 120_000).toISOString();
    const history = [{ port: 8080, timestamp: old }];
    expect(isNewPort(8080, history, a)).toBe(false);
  });
});

describe('detectAnomalies', () => {
  it('returns empty when nothing is anomalous', () => {
    const t = makeTrend([10, 10, 10]);
    const a = createAnomaly();
    const bindings = [{ proto: 'tcp', port: 80 }];
    const old = new Date(Date.now() - 200_000).toISOString();
    const history = [{ port: 80, timestamp: old }];
    expect(detectAnomalies(bindings, t, history, a)).toEqual([]);
  });

  it('flags new port', () => {
    const t = makeTrend([10, 10, 10]);
    const a = createAnomaly();
    const bindings = [{ proto: 'tcp', port: 54321 }];
    const result = detectAnomalies(bindings, t, [], a);
    expect(result).toHaveLength(1);
    expect(result[0].reasons).toContain('new_port');
  });
});

describe('annotateWithAnomalies', () => {
  it('annotates bindings with anomaly flag', () => {
    const t = makeTrend([10, 10, 10]);
    const a = createAnomaly();
    const bindings = [{ proto: 'tcp', port: 54321 }, { proto: 'tcp', port: 80 }];
    const old = new Date(Date.now() - 200_000).toISOString();
    const history = [{ port: 80, timestamp: old }];
    const result = annotateWithAnomalies(bindings, t, history, a);
    expect(result.find((b) => b.port === 54321).anomaly).toBe(true);
    expect(result.find((b) => b.port === 80).anomaly).toBe(false);
  });
});
