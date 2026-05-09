const {
  validateSchedulerConfig,
  resolveSchedulerConfig,
  DEFAULT_SCHEDULER_CONFIG,
} = require('./scheduler.config');

describe('validateSchedulerConfig', () => {
  test('returns no errors for empty config', () => {
    expect(validateSchedulerConfig({})).toEqual([]);
  });

  test('returns error for non-number intervalMs', () => {
    const errors = validateSchedulerConfig({ intervalMs: 'fast' });
    expect(errors).toContain('intervalMs must be a number');
  });

  test('returns error for intervalMs below minimum', () => {
    const errors = validateSchedulerConfig({ intervalMs: 500 });
    expect(errors.length).toBeGreaterThan(0);
  });

  test('returns error for intervalMs above maximum', () => {
    const errors = validateSchedulerConfig({ intervalMs: 120000 });
    expect(errors.length).toBeGreaterThan(0);
  });

  test('returns error for invalid maxMissedTicks', () => {
    const errors = validateSchedulerConfig({ maxMissedTicks: 0 });
    expect(errors).toContain('maxMissedTicks must be a positive number');
  });

  test('returns error for non-boolean logTicks', () => {
    const errors = validateSchedulerConfig({ logTicks: 'yes' });
    expect(errors).toContain('logTicks must be a boolean');
  });

  test('returns no errors for valid full config', () => {
    const errors = validateSchedulerConfig({ intervalMs: 3000, maxMissedTicks: 5, logTicks: true });
    expect(errors).toEqual([]);
  });
});

describe('resolveSchedulerConfig', () => {
  test('returns defaults when no config provided', () => {
    const config = resolveSchedulerConfig();
    expect(config).toEqual(DEFAULT_SCHEDULER_CONFIG);
  });

  test('merges partial config over defaults', () => {
    const config = resolveSchedulerConfig({ intervalMs: 10000 });
    expect(config.intervalMs).toBe(10000);
    expect(config.logTicks).toBe(DEFAULT_SCHEDULER_CONFIG.logTicks);
  });

  test('throws on invalid config', () => {
    expect(() => resolveSchedulerConfig({ intervalMs: 100 })).toThrow('Invalid scheduler config');
  });
});
