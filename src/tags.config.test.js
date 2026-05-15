const { validateTagRule, validateTagsConfig, resolveTagsConfig } = require('./tags.config');

describe('validateTagRule', () => {
  test('accepts valid rule', () => {
    expect(() => validateTagRule({ match: { port: 80, proto: 'tcp' }, tags: ['web'] }, 0)).not.toThrow();
  });
  test('throws if tags missing', () => {
    expect(() => validateTagRule({ match: { port: 80 } }, 0)).toThrow(/tags/);
  });
  test('throws if tags empty', () => {
    expect(() => validateTagRule({ match: {}, tags: [] }, 0)).toThrow(/tags/);
  });
  test('throws if tag not a string', () => {
    expect(() => validateTagRule({ match: {}, tags: [123] }, 0)).toThrow(/string/);
  });
  test('throws if port not a number', () => {
    expect(() => validateTagRule({ match: { port: 'http' }, tags: ['web'] }, 0)).toThrow(/port/);
  });
  test('throws if proto invalid', () => {
    expect(() => validateTagRule({ match: { proto: 'icmp' }, tags: ['x'] }, 0)).toThrow(/proto/);
  });
});

describe('validateTagsConfig', () => {
  test('accepts empty config', () => {
    expect(() => validateTagsConfig({})).not.toThrow();
  });
  test('throws if enabled not boolean', () => {
    expect(() => validateTagsConfig({ enabled: 'yes' })).toThrow(/boolean/);
  });
  test('throws if rules not array', () => {
    expect(() => validateTagsConfig({ rules: 'bad' })).toThrow(/array/);
  });
  test('validates each rule', () => {
    expect(() => validateTagsConfig({ rules: [{ match: {}, tags: [] }] })).toThrow();
  });
});

describe('resolveTagsConfig', () => {
  test('returns defaults when empty', () => {
    const cfg = resolveTagsConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.rules).toEqual([]);
  });
  test('merges partial config', () => {
    const cfg = resolveTagsConfig({ enabled: false });
    expect(cfg.enabled).toBe(false);
    expect(cfg.rules).toEqual([]);
  });
  test('throws on invalid input', () => {
    expect(() => resolveTagsConfig({ enabled: 'bad' })).toThrow();
  });
});
