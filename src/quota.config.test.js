'use strict';

const { validateQuotaConfig, resolveQuotaConfig } = require('./quota.config');

describe('validateQuotaConfig', () => {
  test('accepts valid config', () => {
    expect(() => validateQuotaConfig({ maxBindings: 10, groupBy: 'process' })).not.toThrow();
  });

  test('rejects non-positive maxBindings', () => {
    expect(() => validateQuotaConfig({ maxBindings: 0 })).toThrow('positive number');
    expect(() => validateQuotaConfig({ maxBindings: -1 })).toThrow('positive number');
  });

  test('rejects invalid groupBy', () => {
    expect(() => validateQuotaConfig({ groupBy: 'host' })).toThrow('groupBy');
  });

  test('allows partial config', () => {
    expect(() => validateQuotaConfig({ maxBindings: 3 })).not.toThrow();
    expect(() => validateQuotaConfig({ groupBy: 'user' })).not.toThrow();
  });
});

describe('resolveQuotaConfig', () => {
  test('applies defaults', () => {
    const cfg = resolveQuotaConfig({});
    expect(cfg.maxBindings).toBe(5);
    expect(cfg.groupBy).toBe('port');
  });

  test('respects provided values', () => {
    const cfg = resolveQuotaConfig({ maxBindings: 20, groupBy: 'user' });
    expect(cfg.maxBindings).toBe(20);
    expect(cfg.groupBy).toBe('user');
  });
});
