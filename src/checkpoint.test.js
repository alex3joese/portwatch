const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  createCheckpoint,
  saveCheckpoint,
  loadCheckpoint,
  clearCheckpoint,
  checkpointAge,
  isCheckpointStale,
} = require('./checkpoint');

function tmpFile() {
  return path.join(os.tmpdir(), `checkpoint-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
}

const SAMPLE_BINDINGS = [
  { port: 8080, proto: 'tcp', addr: '0.0.0.0', pid: 1234, process: 'node' },
  { port: 443,  proto: 'tcp', addr: '0.0.0.0', pid: 5678, process: 'nginx' },
];

describe('createCheckpoint', () => {
  it('includes version, savedAt, pid, bindings', () => {
    const cp = createCheckpoint(SAMPLE_BINDINGS);
    expect(cp.version).toBe(1);
    expect(cp.bindings).toEqual(SAMPLE_BINDINGS);
    expect(typeof cp.savedAt).toBe('string');
    expect(cp.pid).toBe(process.pid);
  });

  it('attaches meta when provided', () => {
    const cp = createCheckpoint([], { runId: 'abc' });
    expect(cp.meta.runId).toBe('abc');
  });
});

describe('saveCheckpoint / loadCheckpoint', () => {
  let file;
  beforeEach(() => { file = tmpFile(); });
  afterEach(() => { if (fs.existsSync(file)) fs.unlinkSync(file); });

  it('round-trips bindings correctly', () => {
    saveCheckpoint(SAMPLE_BINDINGS, {}, file);
    const loaded = loadCheckpoint(file);
    expect(loaded).not.toBeNull();
    expect(loaded.bindings).toEqual(SAMPLE_BINDINGS);
  });

  it('returns null when file does not exist', () => {
    expect(loadCheckpoint('/tmp/__no_such_checkpoint__.json')).toBeNull();
  });

  it('returns null for corrupt JSON', () => {
    fs.writeFileSync(file, 'not-json', 'utf8');
    expect(loadCheckpoint(file)).toBeNull();
  });

  it('returns null when bindings field is missing', () => {
    fs.writeFileSync(file, JSON.stringify({ version: 1, savedAt: new Date().toISOString() }), 'utf8');
    expect(loadCheckpoint(file)).toBeNull();
  });
});

describe('clearCheckpoint', () => {
  it('removes the file and returns true', () => {
    const file = tmpFile();
    saveCheckpoint([], {}, file);
    expect(clearCheckpoint(file)).toBe(true);
    expect(fs.existsSync(file)).toBe(false);
  });

  it('returns false when file never existed', () => {
    expect(clearCheckpoint('/tmp/__ghost_checkpoint__.json')).toBe(false);
  });
});

describe('checkpointAge / isCheckpointStale', () => {
  it('age is close to zero for a freshly created checkpoint', () => {
    const cp = createCheckpoint([]);
    expect(checkpointAge(cp)).toBeLessThan(500);
  });

  it('not stale when young', () => {
    const cp = createCheckpoint([]);
    expect(isCheckpointStale(cp, 60000)).toBe(false);
  });

  it('stale when savedAt is old', () => {
    const cp = { version: 1, savedAt: new Date(Date.now() - 7200000).toISOString(), bindings: [] };
    expect(isCheckpointStale(cp, 3600000)).toBe(true);
  });

  it('returns Infinity age for null checkpoint', () => {
    expect(checkpointAge(null)).toBe(Infinity);
  });
});
