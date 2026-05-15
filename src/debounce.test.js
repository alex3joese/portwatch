'use strict';

const { createDebounce } = require('./debounce');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('createDebounce', () => {
  test('throws if onFlush is not a function', () => {
    expect(() => createDebounce(null)).toThrow('onFlush must be a function');
  });

  test('throws if waitMs is negative', () => {
    expect(() => createDebounce(() => {}, -1)).toThrow('waitMs must be a non-negative number');
  });

  test('flushes accumulated items after quiet period', async () => {
    const received = [];
    const db = createDebounce(items => received.push(...items), 50);
    db.push({ port: 8080 });
    db.push({ port: 8081 });
    expect(db.size()).toBe(2);
    await sleep(100);
    expect(received).toEqual([{ port: 8080 }, { port: 8081 }]);
    expect(db.size()).toBe(0);
  });

  test('resets timer on each push', async () => {
    const received = [];
    const db = createDebounce(items => received.push(...items), 60);
    db.push({ port: 9000 });
    await sleep(40);
    db.push({ port: 9001 }); // resets timer
    await sleep(40);
    // timer not yet fired
    expect(received).toHaveLength(0);
    await sleep(40);
    expect(received).toEqual([{ port: 9000 }, { port: 9001 }]);
  });

  test('flush() forces immediate emit', async () => {
    const received = [];
    const db = createDebounce(items => received.push(...items), 500);
    db.push({ port: 3000 });
    db.flush();
    expect(received).toEqual([{ port: 3000 }]);
    expect(db.size()).toBe(0);
  });

  test('flush() is a no-op when nothing pending', () => {
    const cb = jest.fn();
    const db = createDebounce(cb, 100);
    db.flush();
    expect(cb).not.toHaveBeenCalled();
  });

  test('cancel() discards pending items without calling onFlush', async () => {
    const cb = jest.fn();
    const db = createDebounce(cb, 50);
    db.push({ port: 1234 });
    db.cancel();
    await sleep(100);
    expect(cb).not.toHaveBeenCalled();
    expect(db.size()).toBe(0);
  });

  test('size() reflects current pending count', () => {
    const db = createDebounce(() => {}, 1000);
    expect(db.size()).toBe(0);
    db.push({ port: 80 });
    db.push({ port: 443 });
    expect(db.size()).toBe(2);
    db.cancel();
    expect(db.size()).toBe(0);
  });
});
