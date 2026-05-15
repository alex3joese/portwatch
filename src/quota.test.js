'use strict';

const { createQuota } = require('./quota');

const makeBinding = (port, process = 'node', user = 'alice') => ({ port, process, user });

describe('createQuota', () => {
  test('no violations when under limit', () => {
    const q = createQuota({ maxBindings: 3, groupBy: 'port' });
    const bindings = [makeBinding(8080), makeBinding(8081)];
    const { violations } = q.applyQuota(bindings);
    expect(violations).toHaveLength(0);
  });

  test('detects violation when over limit', () => {
    const q = createQuota({ maxBindings: 1, groupBy: 'port' });
    q.record([makeBinding(8080)]);
    const bindings = [makeBinding(8080)];
    const { violations } = q.applyQuota(bindings);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].key).toBe('8080');
  });

  test('groupBy process groups correctly', () => {
    const q = createQuota({ maxBindings: 1, groupBy: 'process' });
    q.record([makeBinding(8080, 'nginx')]);
    expect(q.isOverQuota(makeBinding(9090, 'nginx'))).toBe(true);
    expect(q.isOverQuota(makeBinding(9090, 'sshd'))).toBe(false);
  });

  test('groupBy user groups correctly', () => {
    const q = createQuota({ maxBindings: 2, groupBy: 'user' });
    q.record([makeBinding(80, 'a', 'root'), makeBinding(443, 'b', 'root')]);
    expect(q.isOverQuota(makeBinding(8080, 'c', 'root'))).toBe(true);
    expect(q.isOverQuota(makeBinding(8080, 'c', 'guest'))).toBe(false);
  });

  test('reset clears all counts', () => {
    const q = createQuota({ maxBindings: 1, groupBy: 'port' });
    q.record([makeBinding(8080), makeBinding(8080)]);
    q.reset();
    expect(q.isOverQuota(makeBinding(8080))).toBe(false);
  });

  test('getViolations returns count and limit', () => {
    const q = createQuota({ maxBindings: 1, groupBy: 'port' });
    q.record([makeBinding(3000), makeBinding(3000)]);
    const violations = q.getViolations([makeBinding(3000)]);
    expect(violations[0].count).toBe(2);
    expect(violations[0].limit).toBe(1);
  });
});
