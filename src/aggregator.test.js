'use strict';

const { createAggregator, summarize } = require('./aggregator');
const { validateAggregatorConfig, resolveAggregatorConfig } = require('./aggregator.config');

const b1 = { proto: 'tcp', port: 8080, address: '0.0.0.0' };
const b2 = { proto: 'udp', port: 53, address: '127.0.0.1' };

describe('createAggregator', () => {
  test('records a new binding and returns entry with count 1', () => {
    const agg = createAggregator();
    const entry = agg.record(b1);
    expect(entry.count).toBe(1);
    expect(entry.binding).toEqual(b1);
  });

  test('increments count on repeated record', () => {
    const agg = createAggregator();
    agg.record(b1);
    const entry = agg.record(b1);
    expect(entry.count).toBe(2);
  });

  test('tracks distinct bindings separately', () => {
    const agg = createAggregator();
    agg.record(b1);
    agg.record(b2);
    expect(agg.size()).toBe(2);
  });

  test('evicts entries older than windowMs', () => {
    const agg = createAggregator({ windowMs: 50 });
    agg.record(b1);
    return new Promise((resolve) => setTimeout(() => {
      agg.record(b2); // triggers eviction
      expect(agg.getAll().find(e => e.binding.port === 8080)).toBeUndefined();
      resolve();
    }, 100));
  });

  test('respects maxGroups cap and returns null', () => {
    const agg = createAggregator({ maxGroups: 1 });
    agg.record(b1);
    const result = agg.record(b2);
    expect(result).toBeNull();
    expect(agg.size()).toBe(1);
  });

  test('reset clears all entries', () => {
    const agg = createAggregator();
    agg.record(b1);
    agg.reset();
    expect(agg.size()).toBe(0);
  });
});

describe('summarize', () => {
  test('returns formatted summary array', () => {
    const agg = createAggregator();
    agg.record(b1);
    agg.record(b1);
    const summary = summarize(agg);
    expect(summary).toHaveLength(1);
    expect(summary[0].count).toBe(2);
    expect(summary[0].port).toBe(8080);
    expect(typeof summary[0].firstSeen).toBe('string');
  });
});

describe('validateAggregatorConfig', () => {
  test('accepts empty config', () => {
    expect(validateAggregatorConfig({})).toHaveLength(0);
  });

  test('rejects non-numeric windowMs', () => {
    expect(validateAggregatorConfig({ windowMs: 'fast' }).length).toBeGreaterThan(0);
  });

  test('rejects out-of-range maxGroups', () => {
    expect(validateAggregatorConfig({ maxGroups: 0 }).length).toBeGreaterThan(0);
  });
});

describe('resolveAggregatorConfig', () => {
  test('merges defaults with provided values', () => {
    const cfg = resolveAggregatorConfig({ windowMs: 5000 });
    expect(cfg.windowMs).toBe(5000);
    expect(cfg.maxGroups).toBe(200);
  });

  test('throws on invalid config', () => {
    expect(() => resolveAggregatorConfig({ maxGroups: -1 })).toThrow();
  });
});
