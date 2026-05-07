const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadBaseline, saveBaseline, diffBindings } = require('./baseline');

function tmpFile() {
  return path.join(os.tmpdir(), `portwatch-baseline-${Date.now()}.json`);
}

describe('loadBaseline', () => {
  test('returns empty object when file does not exist', () => {
    const result = loadBaseline('/nonexistent/path/baseline.json');
    expect(result).toEqual({});
  });

  test('throws when no path provided', () => {
    expect(() => loadBaseline()).toThrow('baselinePath is required');
  });

  test('parses existing baseline file', () => {
    const file = tmpFile();
    const data = { 8080: { pid: 1234, process: 'node', proto: 'tcp' } };
    fs.writeFileSync(file, JSON.stringify(data), 'utf8');
    expect(loadBaseline(file)).toEqual(data);
    fs.unlinkSync(file);
  });

  test('throws on malformed JSON', () => {
    const file = tmpFile();
    fs.writeFileSync(file, 'not json', 'utf8');
    expect(() => loadBaseline(file)).toThrow('Failed to parse baseline file');
    fs.unlinkSync(file);
  });
});

describe('saveBaseline', () => {
  test('writes bindings to file', () => {
    const file = tmpFile();
    const bindings = { 3000: { pid: 999, process: 'python', proto: 'tcp' } };
    saveBaseline(file, bindings);
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(saved).toEqual(bindings);
    fs.unlinkSync(file);
  });

  test('throws when no path provided', () => {
    expect(() => saveBaseline()).toThrow('baselinePath is required');
  });
});

describe('diffBindings', () => {
  test('detects added ports', () => {
    const baseline = {};
    const current = { 4000: { pid: 42, process: 'nginx', proto: 'tcp' } };
    const { added, removed } = diffBindings(baseline, current);
    expect(added).toHaveLength(1);
    expect(added[0].port).toBe('4000');
    expect(removed).toHaveLength(0);
  });

  test('detects removed ports', () => {
    const baseline = { 5000: { pid: 7, process: 'ruby', proto: 'tcp' } };
    const current = {};
    const { added, removed } = diffBindings(baseline, current);
    expect(removed).toHaveLength(1);
    expect(removed[0].port).toBe('5000');
    expect(added).toHaveLength(0);
  });

  test('returns empty diff when bindings match', () => {
    const bindings = { 80: { pid: 1, process: 'apache', proto: 'tcp' } };
    const { added, removed } = diffBindings(bindings, bindings);
    expect(added).toHaveLength(0);
    expect(removed).toHaveLength(0);
  });
});
