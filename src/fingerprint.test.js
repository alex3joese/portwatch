'use strict';

const { hashBinding, annotateWithFingerprints, indexByFingerprint, diffByFingerprint } = require('./fingerprint');

const b1 = { proto: 'tcp', addr: '0.0.0.0', port: 8080, pid: 1234 };
const b2 = { proto: 'tcp', addr: '0.0.0.0', port: 9090, pid: 5678 };
const b3 = { proto: 'udp', addr: '127.0.0.1', port: 53 };

describe('hashBinding', () => {
  test('returns a 12-char hex string', () => {
    const h = hashBinding(b1);
    expect(typeof h).toBe('string');
    expect(h).toHaveLength(12);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  test('same inputs produce same hash', () => {
    expect(hashBinding(b1)).toBe(hashBinding({ ...b1 }));
  });

  test('different port produces different hash', () => {
    expect(hashBinding(b1)).not.toBe(hashBinding(b2));
  });

  test('works without pid field', () => {
    const h = hashBinding(b3);
    expect(h).toHaveLength(12);
  });

  test('proto is case-insensitive', () => {
    expect(hashBinding({ proto: 'TCP', addr: '0.0.0.0', port: 80 }))
      .toBe(hashBinding({ proto: 'tcp', addr: '0.0.0.0', port: 80 }));
  });
});

describe('annotateWithFingerprints', () => {
  test('adds fingerprint to each binding', () => {
    const result = annotateWithFingerprints([b1, b2]);
    expect(result[0]).toHaveProperty('fingerprint');
    expect(result[1]).toHaveProperty('fingerprint');
    expect(result[0].fingerprint).not.toBe(result[1].fingerprint);
  });

  test('does not mutate originals', () => {
    const orig = { ...b1 };
    annotateWithFingerprints([orig]);
    expect(orig).not.toHaveProperty('fingerprint');
  });

  test('throws on non-array', () => {
    expect(() => annotateWithFingerprints(null)).toThrow(TypeError);
  });
});

describe('indexByFingerprint', () => {
  test('returns a Map keyed by fingerprint', () => {
    const annotated = annotateWithFingerprints([b1, b2]);
    const map = indexByFingerprint(annotated);
    expect(map.size).toBe(2);
  });

  test('works with unannotated bindings', () => {
    const map = indexByFingerprint([b1, b3]);
    expect(map.size).toBe(2);
  });
});

describe('diffByFingerprint', () => {
  test('detects added bindings', () => {
    const { added } = diffByFingerprint([b1], [b1, b2]);
    expect(added).toHaveLength(1);
    expect(added[0].port).toBe(9090);
  });

  test('detects removed bindings', () => {
    const { removed } = diffByFingerprint([b1, b2], [b1]);
    expect(removed).toHaveLength(1);
    expect(removed[0].port).toBe(9090);
  });

  test('detects unchanged bindings', () => {
    const { unchanged } = diffByFingerprint([b1, b2], [b1, b2]);
    expect(unchanged).toHaveLength(2);
  });

  test('empty previous means all added', () => {
    const { added, removed } = diffByFingerprint([], [b1, b2, b3]);
    expect(added).toHaveLength(3);
    expect(removed).toHaveLength(0);
  });
});
