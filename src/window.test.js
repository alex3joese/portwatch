'use strict';

const { createWindow, windowRate } = require('./window');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

describe('createWindow', () => {
  test('starts empty', () => {
    const w = createWindow({ duration: 1000 });
    expect(w.count()).toBe(0);
    expect(w.getAll()).toEqual([]);
  });

  test('push and retrieve items', () => {
    const w = createWindow({ duration: 5000 });
    w.push({ port: 80 });
    w.push({ port: 443 });
    expect(w.count()).toBe(2);
    const all = w.getAll();
    expect(all).toContainEqual({ port: 80 });
    expect(all).toContainEqual({ port: 443 });
  });

  test('evicts entries older than duration', () => {
    const w = createWindow({ duration: 50 });
    const now = Date.now();
    w.push({ port: 1234 }, now - 100);
    w.push({ port: 5678 }, now);
    expect(w.count()).toBe(1);
    expect(w.getAll()).toEqual([{ port: 5678 }]);
  });

  test('oldest and newest return correct timestamps', () => {
    const w = createWindow({ duration: 5000 });
    const t1 = Date.now() - 200;
    const t2 = Date.now() - 100;
    w.push({ port: 1 }, t1);
    w.push({ port: 2 }, t2);
    expect(w.oldest()).toBe(t1);
    expect(w.newest()).toBe(t2);
  });

  test('oldest and newest return null when empty', () => {
    const w = createWindow({ duration: 1000 });
    expect(w.oldest()).toBeNull();
    expect(w.newest()).toBeNull();
  });

  test('clear empties the window', () => {
    const w = createWindow({ duration: 5000 });
    w.push({ port: 9000 });
    w.clear();
    expect(w.count()).toBe(0);
  });
});

describe('windowRate', () => {
  test('returns 0 for empty window', () => {
    const w = createWindow({ duration: 5000 });
    expect(windowRate(w)).toBe(0);
  });

  test('returns 0 for single entry', () => {
    const w = createWindow({ duration: 5000 });
    w.push({ port: 80 });
    expect(windowRate(w)).toBe(0);
  });

  test('calculates events per second', () => {
    const w = createWindow({ duration: 5000 });
    const base = Date.now() - 1000;
    w.push({ port: 1 }, base);
    w.push({ port: 2 }, base + 500);
    w.push({ port: 3 }, base + 1000);
    const rate = windowRate(w);
    expect(rate).toBeCloseTo(2, 0); // ~2 events/sec over 1s span
  });
});
