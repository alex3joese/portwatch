const {
  createScheduler,
  startScheduler,
  stopScheduler,
  getTickCount,
  isSchedulerRunning,
} = require('./scheduler');

beforeEach(() => {
  stopScheduler();
});

afterEach(() => {
  stopScheduler();
});

describe('createScheduler', () => {
  test('throws if interval is too small', () => {
    expect(() => createScheduler(100, () => {})).toThrow('Interval must be between');
  });

  test('throws if interval is too large', () => {
    expect(() => createScheduler(999999, () => {})).toThrow('Interval must be between');
  });

  test('throws if onTick is not a function', () => {
    expect(() => createScheduler(5000, 'not-a-fn')).toThrow('onTick must be a function');
  });

  test('initializes without error for valid inputs', () => {
    expect(() => createScheduler(2000, () => {})).not.toThrow();
  });
});

describe('startScheduler / stopScheduler', () => {
  test('throws if called before createScheduler', () => {
    expect(() => startScheduler()).toThrow('Scheduler not initialized');
  });

  test('isSchedulerRunning returns false before start', () => {
    expect(isSchedulerRunning()).toBe(false);
  });

  test('isSchedulerRunning returns true after start', () => {
    createScheduler(1000, () => {});
    startScheduler();
    expect(isSchedulerRunning()).toBe(true);
  });

  test('isSchedulerRunning returns false after stop', () => {
    createScheduler(1000, () => {});
    startScheduler();
    stopScheduler();
    expect(isSchedulerRunning()).toBe(false);
  });

  test('calling startScheduler twice does not double schedule', () => {
    createScheduler(1000, () => {});
    startScheduler();
    startScheduler();
    expect(isSchedulerRunning()).toBe(true);
    stopScheduler();
  });
});

describe('getTickCount', () => {
  test('tick count increments on each interval', done => {
    createScheduler(50, () => {
      if (getTickCount() >= 2) {
        stopScheduler();
        expect(getTickCount()).toBeGreaterThanOrEqual(2);
        done();
      }
    });
    startScheduler();
  });
});
