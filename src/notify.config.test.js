const { DEFAULT_NOTIFY_CONFIG, validateNotifyConfig, resolveNotifyConfig } = require('./notify.config');

describe('validateNotifyConfig', () => {
  test('returns invalid when config is null', () => {
    const result = validateNotifyConfig(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('notifier config is missing');
  });

  test('returns invalid when channels is not an array', () => {
    const result = validateNotifyConfig({ channels: 'log', logPath: '/tmp/x.log' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/channels must be an array/);
  });

  test('returns invalid for unknown channel', () => {
    const result = validateNotifyConfig({ channels: ['slack'], logPath: '/tmp/x.log' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/unknown channel/);
  });

  test('requires logPath when log channel is set', () => {
    const result = validateNotifyConfig({ channels: ['log'] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('notifier.logPath is required when log channel is enabled');
  });

  test('validates throttle fields', () => {
    const result = validateNotifyConfig({
      channels: ['log'],
      logPath: '/tmp/x.log',
      throttle: { windowSeconds: -1, maxPerWindow: 0 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  test('passes with valid config', () => {
    const result = validateNotifyConfig({
      channels: ['log', 'desktop'],
      logPath: '/tmp/portwatch.log',
      throttle: { windowSeconds: 30, maxPerWindow: 3 },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('resolveNotifyConfig', () => {
  test('returns defaults when no user config provided', () => {
    const cfg = resolveNotifyConfig();
    expect(cfg.channels).toEqual(DEFAULT_NOTIFY_CONFIG.channels);
    expect(cfg.throttle.windowSeconds).toBe(60);
  });

  test('merges user config over defaults', () => {
    const cfg = resolveNotifyConfig({ channels: ['desktop'], logPath: '/custom/path.log' });
    expect(cfg.channels).toEqual(['desktop']);
    expect(cfg.logPath).toBe('/custom/path.log');
    expect(cfg.throttle.windowSeconds).toBe(60);
  });

  test('deep merges throttle config', () => {
    const cfg = resolveNotifyConfig({ throttle: { maxPerWindow: 10 } });
    expect(cfg.throttle.maxPerWindow).toBe(10);
    expect(cfg.throttle.windowSeconds).toBe(60);
  });
});
