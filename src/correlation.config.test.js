const { validateCorrelationConfig, resolveCorrelationConfig } = require('./correlation.config');

describe('validateCorrelationConfig', () => {
  test('returns no errors for empty config', () => {
    expect(validateCorrelationConfig({})).toEqual([]);
  });

  test('rejects non-boolean enabled', () => {
    const errs = validateCorrelationConfig({ enabled: 'yes' });
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0]).toMatch(/enabled/);
  });

  test('rejects non-positive maxGroupAge', () => {
    const errs = validateCorrelationConfig({ maxGroupAge: -1 });
    expect(errs.length).toBeGreaterThan(0);
  });

  test('rejects non-integer maxGroupSize', () => {
    const errs = validateCorrelationConfig({ maxGroupSize: 1.5 });
    expect(errs.length).toBeGreaterThan(0);
  });

  test('accepts valid full config', () => {
    const errs = validateCorrelationConfig({ enabled: true, maxGroupAge: 60000, maxGroupSize: 50 });
    expect(errs).toEqual([]);
  });
});

describe('resolveCorrelationConfig', () => {
  test('fills in defaults', () => {
    const cfg = resolveCorrelationConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.maxGroupAge).toBe(3600000);
    expect(cfg.maxGroupSize).toBe(100);
  });

  test('overrides defaults with provided values', () => {
    const cfg = resolveCorrelationConfig({ maxGroupSize: 20 });
    expect(cfg.maxGroupSize).toBe(20);
    expect(cfg.maxGroupAge).toBe(3600000);
  });

  test('throws on invalid config', () => {
    expect(() => resolveCorrelationConfig({ enabled: 42 })).toThrow(/Invalid correlation config/);
  });
});
