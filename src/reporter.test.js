const fs = require('fs');
const os = require('os');
const path = require('path');
const { generateReport, formatReport, writeReport } = require('./reporter');

const sampleHistory = [
  { timestamp: '2024-01-10T10:00:00.000Z', port: 8080, pid: 1234, process: 'node' },
  { timestamp: '2024-01-10T11:00:00.000Z', port: 8080, pid: 1234, process: 'node' },
  { timestamp: '2024-01-10T12:00:00.000Z', port: 3000, pid: 5678, process: 'python' },
  { timestamp: '2024-01-10T13:00:00.000Z', port: 443,  pid: 9999, process: 'nginx' },
  { timestamp: '2024-01-11T09:00:00.000Z', port: 8080, pid: 1234, process: 'node' },
];

describe('generateReport', () => {
  test('counts total alerts correctly', () => {
    const report = generateReport(sampleHistory);
    expect(report.totalAlerts).toBe(5);
  });

  test('counts unique ports', () => {
    const report = generateReport(sampleHistory);
    expect(report.uniquePorts).toBe(3);
  });

  test('topPorts sorted by frequency', () => {
    const report = generateReport(sampleHistory);
    expect(report.topPorts[0].port).toBe(8080);
    expect(report.topPorts[0].count).toBe(3);
  });

  test('filters by since date', () => {
    const report = generateReport(sampleHistory, { since: '2024-01-11T00:00:00.000Z' });
    expect(report.totalAlerts).toBe(1);
  });

  test('returns empty report for empty history', () => {
    const report = generateReport([]);
    expect(report.totalAlerts).toBe(0);
    expect(report.uniquePorts).toBe(0);
    expect(report.topPorts).toHaveLength(0);
  });

  test('includes generatedAt timestamp', () => {
    const report = generateReport(sampleHistory);
    expect(report.generatedAt).toBeDefined();
    expect(() => new Date(report.generatedAt)).not.toThrow();
  });
});

describe('formatReport', () => {
  test('includes header line', () => {
    const report = generateReport(sampleHistory);
    const text = formatReport(report);
    expect(text).toMatch(/portwatch report/);
  });

  test('includes total alerts line', () => {
    const report = generateReport(sampleHistory);
    const text = formatReport(report);
    expect(text).toMatch(/total alerts: 5/);
  });

  test('lists top ports', () => {
    const report = generateReport(sampleHistory);
    const text = formatReport(report);
    expect(text).toMatch(/:8080/);
  });
});

describe('writeReport', () => {
  test('writes report file to disk', () => {
    const tmpFile = path.join(os.tmpdir(), `portwatch-report-${Date.now()}.txt`);
    const report = generateReport(sampleHistory);
    writeReport(tmpFile, report);
    const content = fs.readFileSync(tmpFile, 'utf8');
    expect(content).toMatch(/portwatch report/);
    fs.unlinkSync(tmpFile);
  });
});
