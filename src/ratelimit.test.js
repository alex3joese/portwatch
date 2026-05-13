// ratelimit.test.js

'use strict';

const { createRateLimit } = require('./ratelimit');
const { validateRateLimitConfig, resolveRateLimitConfig } = require('./ratelimit.config');

describe('createRateLimit', () => {
  test('allows events up to maxEvents within window', () => {
    const rl = createRateLimit({ windowMs: 5000, maxEvents: 3 });
    expect(rl.tryConsume('port:8080')).toBe(true);
    expect(rl.tryConsume('port:8080')).toBe(true);
    expect(rl.tryConsume('port:8080')).toBe(true);
    expect(rl.tryConsume('port:8080')).toBe(false);
  });

  test('isAllowed returns false when limit reached', () => {
    const rl = createRateLimit({ windowMs: 5000, maxEvents: 2 });
    rl.record('k');
    rl.record('k');
    expect(rl.isAllowed('k')).toBe(false);
  });

  test('getCount returns correct event count', () => {
    const rl = createRateLimit({ windowMs: 5000, maxEvents: 10 });
    rl.record('x');
    rl.record('x');
    expect(rl.getCount('x')).toBe(2);
  });

  test('different keys are tracked independently', () => {
    const rl = createRateLimit({ windowMs: 5000, maxEvents: 1 });
    expect(rl.tryConsume('a')).toBe(true);
    expect(rl.tryConsume('b')).toBe(true);
    expect(rl.tryConsume('a')).toBe(false);
  });

  test('reset clears a specific key', () => {
    const rl = createRateLimit({ windowMs: 5000, maxEvents: 1 });
    rl.record('y');
    rl.reset('y');
    expect(rl.isAllowed('y')).toBe(true);
  });

  test('reset with no args clears all keys', () => {
    const rl = createRateLimit({ windowMs: 5000, maxEvents: 1 });
    rl.record('a');
    rl.record('b');
    rl.reset();
    expect(rl._buckets.size).toBe(0);
  });
});

describe('validateRateLimitConfig', () => {
  test('throws on non-object', () => {
    expect(() => validateRateLimitConfig('bad')).toThrow();
  });

  test('throws on non-positive windowMs', () => {
    expect(() => validateRateLimitConfig({ windowMs: -1 })).toThrow();
  });

  test('throws on non-integer maxEvents', () => {
    expect(() => validateRateLimitConfig({ maxEvents: 1.5 })).toThrow();
  });

  test('throws on zero maxEvents', () => {
    expect(() => validateRateLimitConfig({ maxEvents: 0 })).toThrow();
  });
});

describe('resolveRateLimitConfig', () => {
  test('returns defaults when called with empty object', () => {
    const cfg = resolveRateLimitConfig({});
    expect(cfg.windowMs).toBe(60000);
    expect(cfg.maxEvents).toBe(5);
  });

  test('merges provided values over defaults', () => {
    const cfg = resolveRateLimitConfig({ maxEvents: 10 });
    expect(cfg.maxEvents).toBe(10);
    expect(cfg.windowMs).toBe(60000);
  });
});
