const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('./scanner');
const { scanPorts } = require('./scanner');
const { captureSnapshot, compareWithBaseline, updateBaseline } = require('./snapshot');

const MOCK_PORTS = [
  { port: '8080', pid: 100, process: 'node', proto: 'tcp' },
  { port: '5432', pid: 200, process: 'postgres', proto: 'tcp' },
];

beforeEach(() => {
  scanPorts.mockResolvedValue(MOCK_PORTS);
});

afterEach(() => {
  jest.clearAllMocks();
});

function tmpFile() {
  return path.join(os.tmpdir(), `portwatch-snap-${Date.now()}.json`);
}

describe('captureSnapshot', () => {
  test('returns a map of port => binding info', async () => {
    const snap = await captureSnapshot();
    expect(snap['8080']).toEqual({ pid: 100, process: 'node', proto: 'tcp' });
    expect(snap['5432']).toEqual({ pid: 200, process: 'postgres', proto: 'tcp' });
  });

  test('calls scanPorts once', async () => {
    await captureSnapshot();
    expect(scanPorts).toHaveBeenCalledTimes(1);
  });
});

describe('compareWithBaseline', () => {
  test('reports added ports when baseline is empty', async () => {
    const file = tmpFile();
    // no baseline file — loadBaseline returns {}
    const { added, removed } = await compareWithBaseline(file);
    expect(added).toHaveLength(2);
    expect(removed).toHaveLength(0);
  });

  test('reports removed ports when current is empty', async () => {
    scanPorts.mockResolvedValue([]);
    const file = tmpFile();
    const existing = { 9000: { pid: 1, process: 'old', proto: 'tcp' } };
    fs.writeFileSync(file, JSON.stringify(existing), 'utf8');
    const { added, removed } = await compareWithBaseline(file);
    expect(removed).toHaveLength(1);
    expect(added).toHaveLength(0);
    fs.unlinkSync(file);
  });

  test('returns current snapshot in result', async () => {
    const file = tmpFile();
    const { current } = await compareWithBaseline(file);
    expect(current['8080']).toBeDefined();
  });
});

describe('updateBaseline', () => {
  test('writes current snapshot to file', async () => {
    const file = tmpFile();
    const saved = await updateBaseline(file);
    expect(saved['8080']).toEqual({ pid: 100, process: 'node', proto: 'tcp' });
    const onDisk = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(onDisk).toEqual(saved);
    fs.unlinkSync(file);
  });
});
