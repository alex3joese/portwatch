'use strict';

const { enrichBinding, enrichBindings, stripEnrichment } = require('./enrich');
const { validateEnrichConfig, resolveEnrichConfig } = require('./enrich.config');

// Minimal binding fixture
const makeBinding = (overrides = {}) => ({
  port: 8080,
  proto: 'tcp',
  addr: '0.0.0.0',
  pid: 1234,
  ...overrides,
});

describe('enrichBinding', () => {
  it('returns a new object without mutating the original', () => {
    const b = makeBinding();
    const result = enrichBinding(b, {});
    expect(result).not.toBe(b);
    expect(b._enrichedAt).toBeUndefined();
  });

  it('stamps _enrichedAt timestamp', () => {
    const before = Date.now();
    const result = enrichBinding(makeBinding(), {});
    expect(result._enrichedAt).toBeGreaterThanOrEqual(before);
  });

  it('applies label when labels config provided', () => {
    const labels = { rules: [{ port: 8080, label: 'http-alt' }] };
    const result = enrichBinding(makeBinding(), { labels });
    expect(result.label).toBe('http-alt');
  });
});

describe('enrichBindings', () => {
  it('enriches every binding in the array', () => {
    const bindings = [makeBinding({ port: 80 }), makeBinding({ port: 443 })];
    const results = enrichBindings(bindings, {});
    expect(results).toHaveLength(2);
    results.forEach(r => expect(r._enrichedAt).toBeDefined());
  });

  it('returns empty array for empty input', () => {
    expect(enrichBindings([], {})).toEqual([]);
  });
});

describe('stripEnrichment', () => {
  it('removes enrichment fields', () => {
    const enriched = {
      port: 8080,
      proto: 'tcp',
      _enrichedAt: 123456,
      label: 'http-alt',
      severity: 'low',
      route: 'internal',
      anomalies: [],
      process: { name: 'node' },
    };
    const clean = stripEnrichment(enriched);
    expect(clean.port).toBe(8080);
    expect(clean._enrichedAt).toBeUndefined();
    expect(clean.label).toBeUndefined();
    expect(clean.severity).toBeUndefined();
    expect(clean.route).toBeUndefined();
    expect(clean.anomalies).toBeUndefined();
    expect(clean.process).toBeUndefined();
  });
});

describe('validateEnrichConfig', () => {
  it('accepts a valid config', () => {
    expect(validateEnrichConfig({ enabled: true, includeProcess: false })).toBe(true);
  });

  it('throws on non-object input', () => {
    expect(() => validateEnrichConfig('bad')).toThrow();
  });

  it('throws when a boolean field has wrong type', () => {
    expect(() => validateEnrichConfig({ includeLabels: 'yes' })).toThrow(/boolean/);
  });
});

describe('resolveEnrichConfig', () => {
  it('fills in defaults', () => {
    const cfg = resolveEnrichConfig({});
    expect(cfg.enabled).toBe(true);
    expect(cfg.includeProcess).toBe(true);
    expect(cfg.includeAnomalies).toBe(false);
  });

  it('overrides defaults with provided values', () => {
    const cfg = resolveEnrichConfig({ includeAnomalies: true });
    expect(cfg.includeAnomalies).toBe(true);
  });
});
