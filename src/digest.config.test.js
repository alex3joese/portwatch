const { validateDigestConfig, resolveDigestConfig } = require('./digest.config');

test('resolveDigestConfig returns defaults when given empty object', () => {
  const cfg = resolveDigestConfig({});
  expect(cfg.enabled).toBe(true);
  expect(cfg.intervalMs).toBe(60000);
  expect(typeof cfg.logPath).toBe('string');
  expect(cfg.logPath.length).toBeGreaterThan(0);
});

test('resolveDigestConfig respects provided values', () => {
  const cfg = resolveDigestConfig({ enabled: false, intervalMs: 5000, logPath: '/tmp/d.log' });
  expect(cfg.enabled).toBe(false);
  expect(cfg.intervalMs).toBe(5000);
  expect(cfg.logPath).toBe('/tmp/d.log');
});

test('resolveDigestConfig with no args uses defaults', () => {
  const cfg = resolveDigestConfig();
  expect(cfg.enabled).toBe(true);
});

test('validateDigestConfig throws on non-object', () => {
  expect(() => validateDigestConfig(null)).toThrow('must be an object');
  expect(() => validateDigestConfig('bad')).toThrow('must be an object');
});

test('validateDigestConfig throws on bad intervalMs', () => {
  expect(() => validateDigestConfig({ intervalMs: 500 })).toThrow('intervalMs');
  expect(() => validateDigestConfig({ intervalMs: 'fast' })).toThrow('intervalMs');
});

test('validateDigestConfig throws on bad logPath', () => {
  expect(() => validateDigestConfig({ logPath: '' })).toThrow('logPath');
  expect(() => validateDigestConfig({ logPath: 42 })).toThrow('logPath');
});

test('validateDigestConfig throws on bad enabled', () => {
  expect(() => validateDigestConfig({ enabled: 'yes' })).toThrow('enabled');
});

test('validateDigestConfig passes on valid full config', () => {
  expect(() => validateDigestConfig({ enabled: true, intervalMs: 30000, logPath: '/var/log/d.log' })).not.toThrow();
});
