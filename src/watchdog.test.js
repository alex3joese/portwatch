const { createWatchdog, getMissedTicks } = require('./watchdog');
const { validateWatchdogConfig, resolveWatchdogConfig } = require('./watchdog.config');

jest.mock('./watcher', () => ({ isRunning: jest.fn(() => true) }));
jest.mock('./audit', () => ({
  createAuditEntry: jest.fn((src, event, data) => ({ src, event, data, ts: Date.now() })),
  appendAuditLog: jest.fn(),
}));

const { isRunning } = require('./watcher');

describe('watchdog', () => {
  afterEach(() => jest.clearAllMocks());

  test('createWatchdog returns control object', () => {
    const wd = createWatchdog({ tickIntervalMs: 1000, maxMissedTicks: 2 });
    expect(wd).toHaveProperty('start');
    expect(wd).toHaveProperty('stop');
    expect(wd).toHaveProperty('ping');
    expect(wd).toHaveProperty('getMissedTicks');
  });

  test('pingWatchdog resets missed ticks', () => {
    const wd = createWatchdog({ tickIntervalMs: 1000 });
    wd.ping();
    expect(wd.getMissedTicks()).toBe(0);
  });

  test('getMissedTicks starts at 0', () => {
    createWatchdog({ tickIntervalMs: 1000 });
    expect(getMissedTicks()).toBe(0);
  });

  test('start and stop do not throw', () => {
    const wd = createWatchdog({ tickIntervalMs: 5000 });
    expect(() => wd.start()).not.toThrow();
    expect(() => wd.stop()).not.toThrow();
  });

  test('calling stop before start is safe', () => {
    const wd = createWatchdog({ tickIntervalMs: 5000 });
    expect(() => wd.stop()).not.toThrow();
  });
});

describe('validateWatchdogConfig', () => {
  test('returns no errors for empty config', () => {
    expect(validateWatchdogConfig({})).toEqual([]);
  });

  test('rejects low tickIntervalMs', () => {
    const errs = validateWatchdogConfig({ tickIntervalMs: 100 });
    expect(errs.length).toBeGreaterThan(0);
  });

  test('rejects non-integer maxMissedTicks', () => {
    const errs = validateWatchdogConfig({ maxMissedTicks: 1.5 });
    expect(errs.length).toBeGreaterThan(0);
  });

  test('rejects non-function onStall', () => {
    const errs = validateWatchdogConfig({ onStall: 'alert' });
    expect(errs.length).toBeGreaterThan(0);
  });
});

describe('resolveWatchdogConfig', () => {
  test('fills in defaults', () => {
    const cfg = resolveWatchdogConfig({});
    expect(cfg.tickIntervalMs).toBe(5000);
    expect(cfg.maxMissedTicks).toBe(3);
    expect(cfg.auditLog).toBeNull();
    expect(cfg.onStall).toBeNull();
  });

  test('throws on invalid config', () => {
    expect(() => resolveWatchdogConfig({ tickIntervalMs: 10 })).toThrow();
  });

  test('preserves valid overrides', () => {
    const cfg = resolveWatchdogConfig({ tickIntervalMs: 2000, maxMissedTicks: 5 });
    expect(cfg.tickIntervalMs).toBe(2000);
    expect(cfg.maxMissedTicks).toBe(5);
  });
});
