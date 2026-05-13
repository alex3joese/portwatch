const {
  STATUS_OK,
  STATUS_DEGRADED,
  STATUS_DOWN,
  checkWatchdog,
  getOverallStatus,
  runHealthCheck,
} = require('./healthcheck');

const metrics = require('./metrics');
const watcher = require('./watcher');
const scheduler = require('./scheduler');
const watchdog = require('./watchdog');

beforeEach(() => {
  metrics.resetMetrics();
  jest.restoreAllMocks();
});

describe('checkWatchdog', () => {
  test('returns ok when no missed ticks', () => {
    jest.spyOn(watchdog, 'getMissedTicks').mockReturnValue(0);
    expect(checkWatchdog()).toBe(STATUS_OK);
  });

  test('returns degraded when missed ticks within threshold', () => {
    jest.spyOn(watchdog, 'getMissedTicks').mockReturnValue(2);
    expect(checkWatchdog(3)).toBe(STATUS_DEGRADED);
  });

  test('returns down when missed ticks exceed threshold', () => {
    jest.spyOn(watchdog, 'getMissedTicks').mockReturnValue(5);
    expect(checkWatchdog(3)).toBe(STATUS_DOWN);
  });
});

describe('getOverallStatus', () => {
  test('ok when all checks pass', () => {
    expect(getOverallStatus({ a: STATUS_OK, b: STATUS_OK })).toBe(STATUS_OK);
  });

  test('degraded when any check is degraded', () => {
    expect(getOverallStatus({ a: STATUS_OK, b: STATUS_DEGRADED })).toBe(STATUS_DEGRADED);
  });

  test('down takes priority over degraded', () => {
    expect(getOverallStatus({ a: STATUS_DEGRADED, b: STATUS_DOWN })).toBe(STATUS_DOWN);
  });
});

describe('runHealthCheck', () => {
  test('returns object with status, checks, and timestamp', () => {
    jest.spyOn(watcher, 'isRunning').mockReturnValue(true);
    jest.spyOn(scheduler, 'isSchedulerRunning').mockReturnValue(true);
    jest.spyOn(watchdog, 'getMissedTicks').mockReturnValue(0);
    metrics.setGauge('scan_rate', 5);

    const result = runHealthCheck();
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('checks');
    expect(result).toHaveProperty('timestamp');
    expect(result.checks).toHaveProperty('watcher');
    expect(result.checks).toHaveProperty('scheduler');
    expect(result.checks).toHaveProperty('watchdog');
    expect(result.checks).toHaveProperty('metrics');
  });

  test('status is down when watcher is not running', () => {
    jest.spyOn(watcher, 'isRunning').mockReturnValue(false);
    jest.spyOn(scheduler, 'isSchedulerRunning').mockReturnValue(true);
    jest.spyOn(watchdog, 'getMissedTicks').mockReturnValue(0);
    metrics.setGauge('scan_rate', 1);

    const result = runHealthCheck();
    expect(result.status).toBe(STATUS_DOWN);
  });
});
