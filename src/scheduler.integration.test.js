const { resolveSchedulerConfig } = require('./scheduler.config');
const {
  createScheduler,
  startScheduler,
  stopScheduler,
  getTickCount,
  isSchedulerRunning,
} = require('./scheduler');

afterEach(() => {
  stopScheduler();
});

describe('scheduler integration', () => {
  test('runs configured number of ticks and stops cleanly', done => {
    const config = resolveSchedulerConfig({ intervalMs: 50, maxMissedTicks: 3 });
    const results = [];

    createScheduler(config.intervalMs, async tick => {
      results.push(tick);
      if (tick >= 3) {
        stopScheduler();
        expect(results).toEqual([1, 2, 3]);
        expect(isSchedulerRunning()).toBe(false);
        done();
      }
    });

    startScheduler();
  });

  test('handles async tick errors without crashing', done => {
    const config = resolveSchedulerConfig({ intervalMs: 50 });
    let errorTick = false;

    createScheduler(config.intervalMs, async tick => {
      if (tick === 1) {
        errorTick = true;
        throw new Error('simulated tick failure');
      }
      if (tick === 2) {
        stopScheduler();
        expect(errorTick).toBe(true);
        expect(getTickCount()).toBeGreaterThanOrEqual(2);
        done();
      }
    });

    startScheduler();
  });

  test('tick count matches elapsed ticks after stop', done => {
    const config = resolveSchedulerConfig({ intervalMs: 50 });

    createScheduler(config.intervalMs, async tick => {
      if (tick >= 4) {
        stopScheduler();
        expect(getTickCount()).toBeGreaterThanOrEqual(4);
        done();
      }
    });

    startScheduler();
  });
});
