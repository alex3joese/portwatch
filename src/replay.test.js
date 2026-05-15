'use strict';

const { filterByRange, formatReplaySummary, replayHistory } = require('./replay');
const { validateReplayConfig, resolveReplayConfig } = require('./replay.config');

const ENTRIES = [
  { timestamp: '2024-01-01T10:00:00.000Z', bindings: [{ port: 80, proto: 'tcp', pid: 1 }] },
  { timestamp: '2024-01-02T10:00:00.000Z', bindings: [{ port: 443, proto: 'tcp', pid: 2 }] },
  { timestamp: '2024-01-03T10:00:00.000Z', bindings: [{ port: 8080, proto: 'tcp', pid: 3 }] },
];

describe('filterByRange', () => {
  test('returns all entries when no range given', () => {
    expect(filterByRange(ENTRIES, {})).toHaveLength(3);
  });

  test('filters by from date', () => {
    const result = filterByRange(ENTRIES, { from: new Date('2024-01-02T00:00:00.000Z') });
    expect(result).toHaveLength(2);
    expect(result[0].bindings[0].port).toBe(443);
  });

  test('filters by to date', () => {
    const result = filterByRange(ENTRIES, { to: new Date('2024-01-02T23:59:59.000Z') });
    expect(result).toHaveLength(2);
  });

  test('filters by both from and to', () => {
    const result = filterByRange(ENTRIES, {
      from: new Date('2024-01-02T00:00:00.000Z'),
      to: new Date('2024-01-02T23:59:59.000Z'),
    });
    expect(result).toHaveLength(1);
    expect(result[0].bindings[0].port).toBe(443);
  });

  test('returns empty array when nothing matches', () => {
    const result = filterByRange(ENTRIES, { from: new Date('2025-01-01T00:00:00.000Z') });
    expect(result).toHaveLength(0);
  });
});

describe('formatReplaySummary', () => {
  test('formats zero alerts', () => {
    expect(formatReplaySummary({ replayed: 5, alerts: [] })).toBe('Replayed 5 snapshot(s). 0 alert(s) generated.');
  });

  test('formats multiple alerts', () => {
    expect(formatReplaySummary({ replayed: 3, alerts: [1, 2] })).toBe('Replayed 3 snapshot(s). 2 alert(s) generated.');
  });
});

describe('validateReplayConfig', () => {
  test('accepts empty object', () => {
    expect(() => validateReplayConfig({})).not.toThrow();
  });

  test('throws on non-object', () => {
    expect(() => validateReplayConfig(null)).toThrow('replayConfig must be an object');
  });

  test('throws on invalid from date', () => {
    expect(() => validateReplayConfig({ from: 'not-a-date' })).toThrow('valid date');
  });

  test('throws on invalid historyFile type', () => {
    expect(() => validateReplayConfig({ historyFile: 123 })).toThrow('string');
  });
});

describe('resolveReplayConfig', () => {
  test('applies defaults', () => {
    const cfg = resolveReplayConfig();
    expect(cfg.historyFile).toBe('./portwatch-history.json');
    expect(cfg.from).toBeNull();
    expect(cfg.to).toBeNull();
  });

  test('converts date strings to Date objects', () => {
    const cfg = resolveReplayConfig({ from: '2024-06-01T00:00:00.000Z' });
    expect(cfg.from).toBeInstanceOf(Date);
  });

  test('overrides historyFile', () => {
    const cfg = resolveReplayConfig({ historyFile: '/tmp/custom.json' });
    expect(cfg.historyFile).toBe('/tmp/custom.json');
  });
});
