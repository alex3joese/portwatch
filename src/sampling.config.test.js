// sampling.config.test.js

'use strict';

const { validateSamplingConfig, resolveSamplingConfig } = require('./sampling.config');

describe('validateSamplingConfig', () => {
  test('accepts valid rate config', () => {
    expect(validateSamplingConfig({ mode: 'rate', rate: 0.5 })).toBe(true);
  });

  test('accepts valid interval config', () => {
    expect(validateSamplingConfig({ mode: 'interval', every: 3 })).toBe(true);
  });

  test('rejects non-object', () => {
    expect(() => validateSamplingConfig(null)).toThrow('must be an object');
  });

  test('rejects unknown mode', () => {
    expect(() => validateSamplingConfig({ mode: 'random' })).toThrow('mode');
  });

  test('rejects rate out of range', () => {
    expect(() => validateSamplingConfig({ rate: 1.5 })).toThrow('rate');
    expect(() => validateSamplingConfig({ rate: -0.1 })).toThrow('rate');
  });

  test('rejects non-integer every', () => {
    expect(() => validateSamplingConfig({ every: 1.5 })).toThrow('every');
    expect(() => validateSamplingConfig({ every: 0 })).toThrow('every');
  });
});

describe('resolveSamplingConfig', () => {
  test('fills defaults', () => {
    const cfg = resolveSamplingConfig({});
    expect(cfg.mode).toBe('rate');
    expect(cfg.rate).toBe(1.0);
    expect(cfg.every).toBe(1);
  });

  test('preserves provided values', () => {
    const cfg = resolveSamplingConfig({ mode: 'interval', every: 5 });
    expect(cfg.mode).toBe('interval');
    expect(cfg.every).toBe(5);
  });

  test('throws on invalid config', () => {
    expect(() => resolveSamplingConfig({ rate: 2 })).toThrow();
  });
});
