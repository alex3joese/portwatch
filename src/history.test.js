const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadHistory, appendHistory, queryHistory } = require('./history');
const { validateHistoryConfig, resolveHistoryConfig } = require('./history.config');

function tmpFile() {
  return path.join(os.tmpdir(), `portwatch-history-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
}

describe('loadHistory', () => {
  test('returns empty array when file does not exist', () => {
    expect(loadHistory('/nonexistent/path/history.json')).toEqual([]);
  });

  test('throws on malformed JSON', () => {
    const f = tmpFile();
    fs.writeFileSync(f, 'not json');
    expect(() => loadHistory(f)).toThrow('Failed to load history');
    fs.unlinkSync(f);
  });

  test('throws if file is not an array', () => {
    const f = tmpFile();
    fs.writeFileSync(f, JSON.stringify({ foo: 'bar' }));
    expect(() => loadHistory(f)).toThrow('must contain a JSON array');
    fs.unlinkSync(f);
  });
});

describe('appendHistory', () => {
  test('creates file and appends entry', () => {
    const f = tmpFile();
    const entry = { port: 8080, pid: 1234, event: 'new_binding' };
    const record = appendHistory(f, entry);
    expect(record.port).toBe(8080);
    expect(record.timestamp).toBeDefined();
    const history = loadHistory(f);
    expect(history).toHaveLength(1);
    fs.unlinkSync(f);
  });

  test('trims history to maxEntries', () => {
    const f = tmpFile();
    for (let i = 0; i < 5; i++) {
      appendHistory(f, { port: i }, 3);
    }
    const history = loadHistory(f);
    expect(history).toHaveLength(3);
    expect(history[0].port).toBe(2);
    fs.unlinkSync(f);
  });

  test('throws on invalid entry', () => {
    expect(() => appendHistory(tmpFile(), null)).toThrow('must be an object');
  });
});

describe('queryHistory', () => {
  test('filters by port', () => {
    const f = tmpFile();
    appendHistory(f, { port: 80 });
    appendHistory(f, { port: 443 });
    appendHistory(f, { port: 80 });
    const results = queryHistory(f, { port: 80 });
    expect(results).toHaveLength(2);
    fs.unlinkSync(f);
  });

  test('limits results', () => {
    const f = tmpFile();
    for (let i = 0; i < 10; i++) appendHistory(f, { port: i });
    expect(queryHistory(f, { limit: 3 })).toHaveLength(3);
    fs.unlinkSync(f);
  });
});

describe('validateHistoryConfig', () => {
  test('returns no errors for valid config', () => {
    expect(validateHistoryConfig({ enabled: true, maxEntries: 100 })).toEqual([]);
  });

  test('errors on bad maxEntries', () => {
    expect(validateHistoryConfig({ maxEntries: -1 })).toContain('history.maxEntries must be a positive integer');
    expect(validateHistoryConfig({ maxEntries: 99999 })).toContain('history.maxEntries must not exceed 10000');
  });
});

describe('resolveHistoryConfig', () => {
  test('merges with defaults', () => {
    const cfg = resolveHistoryConfig({ maxEntries: 200 });
    expect(cfg.maxEntries).toBe(200);
    expect(cfg.filePath).toBeDefined();
    expect(cfg.enabled).toBe(true);
  });

  test('throws on invalid config', () => {
    expect(() => resolveHistoryConfig({ enabled: 'yes' })).toThrow('Invalid history config');
  });
});
