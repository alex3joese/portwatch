const { validateRoutingConfig, resolveRoutingConfig } = require('./routing.config');

describe('validateRoutingConfig', () => {
  test('accepts empty config', () => {
    expect(validateRoutingConfig({})).toBe(true);
  });

  test('accepts valid routes map', () => {
    expect(validateRoutingConfig({ routes: { 8080: 'dev-server', 9000: 'app' } })).toBe(true);
  });

  test('throws if config is not an object', () => {
    expect(() => validateRoutingConfig('bad')).toThrow('routing config must be an object');
    expect(() => validateRoutingConfig(null)).toThrow();
  });

  test('throws if routes is an array', () => {
    expect(() => validateRoutingConfig({ routes: [] })).toThrow('plain object');
  });

  test('throws on invalid port key', () => {
    expect(() => validateRoutingConfig({ routes: { 99999: 'x' } })).toThrow('valid port number');
    expect(() => validateRoutingConfig({ routes: { abc: 'x' } })).toThrow('valid port number');
  });

  test('throws on empty route name', () => {
    expect(() => validateRoutingConfig({ routes: { 80: '' } })).toThrow('non-empty string');
  });

  test('throws if annotate is not boolean', () => {
    expect(() => validateRoutingConfig({ annotate: 'yes' })).toThrow('boolean');
  });
});

describe('resolveRoutingConfig', () => {
  test('returns defaults when called with empty config', () => {
    const cfg = resolveRoutingConfig({});
    expect(cfg.routes).toEqual({});
    expect(cfg.annotate).toBe(true);
  });

  test('merges custom routes with defaults', () => {
    const cfg = resolveRoutingConfig({ routes: { 9000: 'app' } });
    expect(cfg.routes[9000]).toBe('app');
  });

  test('overrides annotate flag', () => {
    const cfg = resolveRoutingConfig({ annotate: false });
    expect(cfg.annotate).toBe(false);
  });

  test('uses empty config when nothing passed', () => {
    const cfg = resolveRoutingConfig();
    expect(cfg).toHaveProperty('routes');
    expect(cfg).toHaveProperty('annotate');
  });
});
