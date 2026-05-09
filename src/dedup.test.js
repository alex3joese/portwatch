'use strict';

const { createDedup, DEFAULT_TTL_MS } = require('./dedup');

const binding1 = { proto: 'tcp', address: '0.0.0.0', port: 8080 };
const binding2 = { proto: 'tcp', address: '127.0.0.1', port: 3000 };
const binding3 = { proto: 'udp', address: '0.0.0.0', port: 53 };

describe('createDedup', () => {
  test('exports DEFAULT_TTL_MS as a positive number', () => {
    expect(typeof DEFAULT_TTL_MS).toBe('number');
    expect(DEFAULT_TTL_MS).toBeGreaterThan(0);
  });

  test('isDuplicate returns false for unseen binding', () => {
    const dedup = createDedup();
    expect(dedup.isDuplicate(binding1)).toBe(false);
  });

  test('isDuplicate returns true after markSeen', () => {
    const dedup = createDedup();
    dedup.markSeen(binding1);
    expect(dedup.isDuplicate(binding1)).toBe(true);
  });

  test('different bindings are tracked independently', () => {
    const dedup = createDedup();
    dedup.markSeen(binding1);
    expect(dedup.isDuplicate(binding2)).toBe(false);
    expect(dedup.isDuplicate(binding3)).toBe(false);
  });

  test('size reflects number of active entries', () => {
    const dedup = createDedup();
    expect(dedup.size()).toBe(0);
    dedup.markSeen(binding1);
    dedup.markSeen(binding2);
    expect(dedup.size()).toBe(2);
  });

  test('clear removes all entries', () => {
    const dedup = createDedup();
    dedup.markSeen(binding1);
    dedup.markSeen(binding2);
    dedup.clear();
    expect(dedup.size()).toBe(0);
    expect(dedup.isDuplicate(binding1)).toBe(false);
  });

  test('entries expire after TTL', () => {
    jest.useFakeTimers();
    const dedup = createDedup({ ttl: 500 });
    dedup.markSeen(binding1);
    expect(dedup.isDuplicate(binding1)).toBe(true);
    jest.advanceTimersByTime(600);
    expect(dedup.isDuplicate(binding1)).toBe(false);
    expect(dedup.size()).toBe(0);
    jest.useRealTimers();
  });

  test('proto is part of the dedup key', () => {
    const dedup = createDedup();
    const tcpBinding = { proto: 'tcp', address: '0.0.0.0', port: 53 };
    const udpBinding = { proto: 'udp', address: '0.0.0.0', port: 53 };
    dedup.markSeen(tcpBinding);
    expect(dedup.isDuplicate(udpBinding)).toBe(false);
  });
});
