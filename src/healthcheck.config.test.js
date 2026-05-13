const { validateHealthCheckConfig, resolveHealthCheckConfig } = require('./healthcheck.config');

describe('validateHealthCheckConfig', () => {
  test('accepts empty object', () => {
    expect(() => validateHealthCheckConfig({})).not.toThrow();
  });

  test('throws on non-object input', () => {
    expect(() => validateHealthCheckConfig(null)).toThrow('must be an object');
    expect(() => validateHealthCheckConfig('bad')).toThrow('must be an object');
  });

  test('throws on invalid intervalMs', () => {
    expect(() => validateHealthCheckConfig({ intervalMs: 500 })).toThrow('>= 1000');
    expect(() => validateHealthCheckConfig({ intervalMs: 'fast' })).toThrow('>= 1000');
  });

  test('throws on invalid maxMissedTicks', () => {
    expect(() => validateHealthCheckConfig({ maxMissedTicks: 0 })).toThrow('positive number');
    expect(() => validateHealthCheckConfig({ maxMissedTicks: -1 })).toThrow('positive number');
  });

  test('throws on invalid logPath', () => {
    expect(() => validateHealthCheckConfig({ logPath: 123 })).toThrow('string');
  });

  test('throws on invalid enabled', () => {
    expect(() => validateHealthCheckConfig({ enabled: 'yes' })).toThrow('boolean');
  });
});

describe('resolveHealthCheckConfig', () => {
  test('returns defaults when called with no args', () => {
    const cfg = resolveHealthCheckConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.intervalMs).toBe(30000);
    expect(cfg.maxMissedTicks).toBe(3);
    expect(typeof cfg.logPath).toBe('string');
  });

  test('merges overrides with defaults', () => {
    const cfg = resolveHealthCheckConfig({ intervalMs: 5000, maxMissedTicks: 5 });
    expect(cfg.intervalMs).toBe(5000);
    expect(cfg.maxMissedTicks).toBe(5);
    expect(cfg.enabled).toBe(true);
  });

  test('does not mutate input', () => {
    const input = { intervalMs: 10000 };
    resolveHealthCheckConfig(input);
    expect(Object.keys(input).length).toBe(1);
  });
});
