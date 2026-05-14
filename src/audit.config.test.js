const { validateAuditConfig, resolveAuditConfig, DEFAULTS } = require('./audit.config');

describe('validateAuditConfig', () => {
  it('returns no errors for valid config', () => {
    const errors = validateAuditConfig(DEFAULTS);
    expect(errors).toHaveLength(0);
  });

  it('errors on non-boolean enabled', () => {
    const errors = validateAuditConfig({ ...DEFAULTS, enabled: 'yes' });
    expect(errors.some(e => e.includes('enabled'))).toBe(true);
  });

  it('errors on empty logPath', () => {
    const errors = validateAuditConfig({ ...DEFAULTS, logPath: '' });
    expect(errors.some(e => e.includes('logPath'))).toBe(true);
  });

  it('errors on invalid maxEntries', () => {
    const errors = validateAuditConfig({ ...DEFAULTS, maxEntries: -1 });
    expect(errors.some(e => e.includes('maxEntries'))).toBe(true);
  });

  it('errors on non-integer maxEntries', () => {
    const errors = validateAuditConfig({ ...DEFAULTS, maxEntries: 3.7 });
    expect(errors.some(e => e.includes('maxEntries'))).toBe(true);
  });

  it('errors on non-array events', () => {
    const errors = validateAuditConfig({ ...DEFAULTS, events: 'all' });
    expect(errors.some(e => e.includes('events'))).toBe(true);
  });

  it('can accumulate multiple errors at once', () => {
    const errors = validateAuditConfig({ ...DEFAULTS, enabled: 'yes', maxEntries: -5 });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('resolveAuditConfig', () => {
  it('returns defaults when called with no args', () => {
    const cfg = resolveAuditConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.maxEntries).toBe(10000);
    expect(Array.isArray(cfg.events)).toBe(true);
  });

  it('merges user config over defaults', () => {
    const cfg = resolveAuditConfig({ maxEntries: 500 });
    expect(cfg.maxEntries).toBe(500);
    expect(cfg.enabled).toBe(true);
  });

  it('throws on invalid config', () => {
    expect(() => resolveAuditConfig({ enabled: 42 })).toThrow('Invalid audit config');
  });
});
