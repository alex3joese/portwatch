const { validateFilterConfig, resolveFilterConfig, validateRule } = require('./filter.config');

describe('validateRule', () => {
  test('accepts valid rule with ports', () => {
    expect(() => validateRule({ ports: [80, '1024-2048'] }, 'test')).not.toThrow();
  });

  test('accepts rule with addresses and processes', () => {
    expect(() => validateRule({ addresses: ['127.0.0.1'], processes: ['node'] }, 'test')).not.toThrow();
  });

  test('throws if rule is not an object', () => {
    expect(() => validateRule('invalid', 'test')).toThrow('rule must be an object');
  });

  test('throws if ports is not an array', () => {
    expect(() => validateRule({ ports: 80 }, 'test')).toThrow('ports must be an array');
  });

  test('throws on invalid port entry', () => {
    expect(() => validateRule({ ports: ['not-a-port'] }, 'test')).toThrow('invalid port entry');
  });
});

describe('validateFilterConfig', () => {
  test('accepts empty config', () => {
    expect(() => validateFilterConfig({})).not.toThrow();
  });

  test('accepts valid whitelist and blacklist', () => {
    expect(() => validateFilterConfig({
      whitelist: [{ ports: [22] }],
      blacklist: [{ processes: ['malware'] }]
    })).not.toThrow();
  });

  test('throws if config is not an object', () => {
    expect(() => validateFilterConfig(null)).toThrow('filterConfig must be an object');
  });

  test('throws if whitelist is not an array', () => {
    expect(() => validateFilterConfig({ whitelist: 'bad' })).toThrow('whitelist must be an array');
  });
});

describe('resolveFilterConfig', () => {
  test('returns defaults for empty input', () => {
    const cfg = resolveFilterConfig();
    expect(cfg.whitelist).toEqual([]);
    expect(cfg.blacklist).toEqual([]);
  });

  test('merges provided values', () => {
    const cfg = resolveFilterConfig({ blacklist: [{ ports: [6667] }] });
    expect(cfg.blacklist).toHaveLength(1);
    expect(cfg.whitelist).toEqual([]);
  });

  test('throws on invalid config', () => {
    expect(() => resolveFilterConfig({ whitelist: 'oops' })).toThrow();
  });
});
