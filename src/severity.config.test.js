const { validateSeverityConfig, resolveSeverityConfig } = require('./severity.config');
const { DEFAULT_RULES } = require('./severity');

describe('validateSeverityConfig', () => {
  test('accepts empty config', () => {
    expect(() => validateSeverityConfig({})).not.toThrow();
  });

  test('accepts valid minLevel', () => {
    expect(() => validateSeverityConfig({ minLevel: 'warn' })).not.toThrow();
  });

  test('rejects invalid minLevel', () => {
    expect(() => validateSeverityConfig({ minLevel: 'high' })).toThrow('minLevel');
  });

  test('accepts valid rules array', () => {
    const rules = [{ portRange: [1, 1024], level: 'critical' }];
    expect(() => validateSeverityConfig({ rules })).not.toThrow();
  });

  test('rejects rules that is not an array', () => {
    expect(() => validateSeverityConfig({ rules: 'bad' })).toThrow('array');
  });

  test('rejects rule with bad portRange', () => {
    const rules = [{ portRange: [500], level: 'warn' }];
    expect(() => validateSeverityConfig({ rules })).toThrow('portRange');
  });

  test('rejects rule with inverted portRange', () => {
    const rules = [{ portRange: [9000, 80], level: 'warn' }];
    expect(() => validateSeverityConfig({ rules })).toThrow('portRange');
  });

  test('rejects rule with unknown level', () => {
    const rules = [{ portRange: [1, 100], level: 'extreme' }];
    expect(() => validateSeverityConfig({ rules })).toThrow('level');
  });
});

describe('resolveSeverityConfig', () => {
  test('returns defaults when called with empty object', () => {
    const cfg = resolveSeverityConfig({});
    expect(cfg.minLevel).toBe('info');
    expect(cfg.rules).toEqual(DEFAULT_RULES);
  });

  test('preserves provided minLevel', () => {
    const cfg = resolveSeverityConfig({ minLevel: 'critical' });
    expect(cfg.minLevel).toBe('critical');
  });

  test('preserves provided rules', () => {
    const rules = [{ portRange: [1, 65535], level: 'warn' }];
    const cfg = resolveSeverityConfig({ rules });
    expect(cfg.rules).toEqual(rules);
  });
});
