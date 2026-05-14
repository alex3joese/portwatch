const fs = require('fs');
const os = require('os');
const path = require('path');
const { toJSON, toCSV, toTSV, exportBindings, writeExport } = require('./export');

const sampleBindings = [
  { port: 80,   proto: 'tcp', address: '0.0.0.0', pid: 1234, process: 'nginx',  severity: 'low',  timestamp: '2024-01-01T00:00:00Z' },
  { port: 4444, proto: 'tcp', address: '0.0.0.0', pid: 9999, process: 'nc',     severity: 'high', timestamp: '2024-01-01T00:01:00Z' },
];

test('toJSON returns pretty JSON by default', () => {
  const out = toJSON(sampleBindings);
  const parsed = JSON.parse(out);
  expect(parsed).toHaveLength(2);
  expect(parsed[0].port).toBe(80);
  expect(out).toContain('\n');
});

test('toJSON returns compact JSON when pretty=false', () => {
  const out = toJSON(sampleBindings, { pretty: false });
  expect(out).not.toContain('\n');
  expect(JSON.parse(out)).toHaveLength(2);
});

test('toCSV returns header row and data rows', () => {
  const out = toCSV(sampleBindings);
  const lines = out.split('\n');
  expect(lines[0]).toBe('port,proto,address,pid,process,severity,timestamp');
  expect(lines).toHaveLength(3);
  expect(lines[1]).toContain('80');
  expect(lines[2]).toContain('4444');
});

test('toCSV returns empty string for empty array', () => {
  expect(toCSV([])).toBe('');
});

test('toTSV returns tab-separated header and rows', () => {
  const out = toTSV(sampleBindings);
  const lines = out.split('\n');
  expect(lines[0]).toContain('\t');
  expect(lines[0].split('\t')[0]).toBe('port');
  expect(lines[1].split('\t')[1]).toBe('tcp');
});

test('toTSV returns empty string for empty array', () => {
  expect(toTSV([])).toBe('');
});

test('exportBindings dispatches to correct formatter', () => {
  expect(() => exportBindings(sampleBindings, 'xml')).toThrow('Unsupported export format');
  expect(JSON.parse(exportBindings(sampleBindings, 'json'))).toHaveLength(2);
  expect(exportBindings(sampleBindings, 'csv').split('\n')[0]).toContain('port');
  expect(exportBindings(sampleBindings, 'tsv').split('\n')[0]).toContain('\t');
});

test('writeExport writes file and returns path', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portwatch-export-'));
  const outFile = path.join(tmpDir, 'out.csv');
  const result = writeExport(sampleBindings, outFile, 'csv');
  expect(result).toBe(outFile);
  const content = fs.readFileSync(outFile, 'utf8');
  expect(content).toContain('port');
  expect(content).toContain('4444');
  fs.rmSync(tmpDir, { recursive: true });
});
