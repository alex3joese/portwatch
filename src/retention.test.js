const fs = require('fs');
const os = require('os');
const path = require('path');
const { isExpired, pruneEntries, applyRetention, pruneFile } = require('./retention');
const { validateRetentionConfig, resolveRetentionConfig } = require('./retention.config');

const NOW = 1_700_000_000_000;
const ONE_DAY = 24 * 60 * 60 * 1000;

function tmpFile() {
  return path.join(os.tmpdir(), `retention-test-${Date.now()}-${Math.random().toString(36).slice(2)}.jsonl`);
}

describe('isExpired', () => {
  test('returns true when entry is older than maxAgeMs', () => {
    expect(isExpired({ timestamp: NOW - ONE_DAY - 1 }, ONE_DAY, NOW)).toBe(true);
  });
  test('returns false when entry is within maxAgeMs', () => {
    expect(isExpired({ timestamp: NOW - ONE_DAY + 1000 }, ONE_DAY, NOW)).toBe(false);
  });
  test('handles ISO string timestamps', () => {
    const ts = new Date(NOW - ONE_DAY - 1).toISOString();
    expect(isExpired({ timestamp: ts }, ONE_DAY, NOW)).toBe(true);
  });
  test('returns false for entry with no timestamp', () => {
    expect(isExpired({}, ONE_DAY, NOW)).toBe(false);
  });
});

describe('pruneEntries', () => {
  test('removes expired entries', () => {
    const entries = [
      { timestamp: NOW - ONE_DAY - 1 },
      { timestamp: NOW - 100 },
    ];
    expect(pruneEntries(entries, ONE_DAY, NOW)).toHaveLength(1);
  });
  test('returns empty array for non-array input', () => {
    expect(pruneEntries(null, ONE_DAY, NOW)).toEqual([]);
  });
});

describe('applyRetention', () => {
  test('applies both maxAgeMs and maxCount', () => {
    const entries = Array.from({ length: 10 }, (_, i) => ({ timestamp: NOW - i * 1000 }));
    const result = applyRetention(entries, { maxAgeMs: ONE_DAY, maxCount: 3 }, NOW);
    expect(result).toHaveLength(3);
  });
  test('keeps most recent entries when trimming by maxCount', () => {
    const entries = [{ timestamp: NOW - 3000 }, { timestamp: NOW - 2000 }, { timestamp: NOW - 1000 }];
    const result = applyRetention(entries, { maxCount: 2 }, NOW);
    expect(result[0].timestamp).toBe(NOW - 2000);
  });
});

describe('pruneFile', () => {
  test('prunes expired lines from file', () => {
    const file = tmpFile();
    const lines = [
      JSON.stringify({ timestamp: NOW - ONE_DAY - 1, port: 80 }),
      JSON.stringify({ timestamp: NOW - 100, port: 443 }),
    ];
    fs.writeFileSync(file, lines.join('\n') + '\n');
    const result = pruneFile(file, { maxAgeMs: ONE_DAY }, NOW);
    expect(result.pruned).toBe(1);
    expect(result.remaining).toBe(1);
    const kept = fs.readFileSync(file, 'utf8').trim().split('\n').map(JSON.parse);
    expect(kept[0].port).toBe(443);
    fs.unlinkSync(file);
  });
  test('returns zeros for missing file', () => {
    expect(pruneFile('/tmp/no-such-file-xyz.jsonl', { maxAgeMs: ONE_DAY }, NOW)).toEqual({ pruned: 0, remaining: 0 });
  });
});

describe('resolveRetentionConfig', () => {
  test('uses defaults when called with empty object', () => {
    const cfg = resolveRetentionConfig({});
    expect(cfg.maxAgeMs).toBe(7 * 24 * 60 * 60 * 1000);
    expect(cfg.maxCount).toBe(10000);
  });
  test('converts maxAgeDays to maxAgeMs', () => {
    const cfg = resolveRetentionConfig({ maxAgeDays: 3 });
    expect(cfg.maxAgeMs).toBe(3 * 24 * 60 * 60 * 1000);
  });
  test('throws on invalid maxCount', () => {
    expect(() => validateRetentionConfig({ maxCount: -1 })).toThrow();
  });
  test('throws on non-object config', () => {
    expect(() => validateRetentionConfig('bad')).toThrow();
  });
});
