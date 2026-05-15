'use strict';

const { validateAnomalyConfig, resolveAnomalyConfig } = require('./anomaly.config');

describe('validateAnomalyConfig', () => {
  it('accepts valid config', () => {
    expect(validateAnomalyConfig({ enabled: true, spikeThreshold: 2.5, newPortWindowMs: 30000 })).toBe(true);
  });

  it('accepts empty object', () => {
    expect(validateAnomalyConfig({})).toBe(true);
  });

  it('throws on non-object', () => {
    expect(() => validateAnomalyConfig(null)).toThrow('must be an object');
    expect(() => validateAnomalyConfig('bad')).toThrow('must be an object');
  });

  it('throws on invalid enabled', () => {
    expect(() => validateAnomalyConfig({ enabled: 'yes' })).toThrow('must be a boolean');
  });

  it('throws on non-positive spikeThreshold', () => {
    expect(() => validateAnomalyConfig({ spikeThreshold: 0 })).toThrow('positive number');
    expect(() => validateAnomalyConfig({ spikeThreshold: -1 })).toThrow('positive number');
  });

  it('throws on newPortWindowMs below 1000', () => {
    expect(() => validateAnomalyConfig({ newPortWindowMs: 500 })).toThrow('>= 1000');
  });

  it('throws on non-integer newPortWindowMs', () => {
    expect(() => validateAnomalyConfig({ newPortWindowMs: 5000.5 })).toThrow('>= 1000');
  });
});

describe('resolveAnomalyConfig', () => {
  it('returns defaults when called with no args', () => {
    const cfg = resolveAnomalyConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.spikeThreshold).toBe(3.0);
    expect(cfg.newPortWindowMs).toBe(60000);
  });

  it('merges partial config over defaults', () => {
    const cfg = resolveAnomalyConfig({ spikeThreshold: 5 });
    expect(cfg.spikeThreshold).toBe(5);
    expect(cfg.newPortWindowMs).toBe(60000);
  });

  it('throws on invalid partial config', () => {
    expect(() => resolveAnomalyConfig({ enabled: 42 })).toThrow();
  });
});
