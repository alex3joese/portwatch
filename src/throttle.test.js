const { Throttle, createThrottle } = require('./throttle');

describe('Throttle', () => {
  let throttle;

  beforeEach(() => {
    // 1-second window, max 3 alerts
    throttle = new Throttle(1000, 3);
  });

  test('allows events up to the limit', () => {
    expect(throttle.allow('port:8080')).toBe(true);
    expect(throttle.allow('port:8080')).toBe(true);
    expect(throttle.allow('port:8080')).toBe(true);
  });

  test('blocks events that exceed the limit', () => {
    throttle.allow('port:8080');
    throttle.allow('port:8080');
    throttle.allow('port:8080');
    expect(throttle.allow('port:8080')).toBe(false);
  });

  test('tracks different keys independently', () => {
    throttle.allow('port:8080');
    throttle.allow('port:8080');
    throttle.allow('port:8080');
    // different key should still be allowed
    expect(throttle.allow('port:9090')).toBe(true);
  });

  test('count returns correct number within window', () => {
    throttle.allow('port:8080');
    throttle.allow('port:8080');
    expect(throttle.count('port:8080')).toBe(2);
  });

  test('count returns 0 for unknown key', () => {
    expect(throttle.count('port:1234')).toBe(0);
  });

  test('reset clears history for a specific key', () => {
    throttle.allow('port:8080');
    throttle.allow('port:8080');
    throttle.allow('port:8080');
    throttle.reset('port:8080');
    expect(throttle.allow('port:8080')).toBe(true);
  });

  test('reset with no args clears all keys', () => {
    throttle.allow('port:8080');
    throttle.allow('port:8080');
    throttle.allow('port:8080');
    throttle.allow('port:9090');
    throttle.reset();
    expect(throttle.count('port:8080')).toBe(0);
    expect(throttle.count('port:9090')).toBe(0);
  });

  test('createThrottle factory returns a Throttle instance', () => {
    const t = createThrottle(5000, 10);
    expect(t).toBeInstanceOf(Throttle);
    expect(t.windowMs).toBe(5000);
    expect(t.maxAlerts).toBe(10);
  });

  test('expired timestamps are not counted', async () => {
    const shortThrottle = new Throttle(50, 3); // 50ms window
    shortThrottle.allow('port:8080');
    shortThrottle.allow('port:8080');
    shortThrottle.allow('port:8080');
    await new Promise(r => setTimeout(r, 60));
    expect(shortThrottle.allow('port:8080')).toBe(true);
  });
});
