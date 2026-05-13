const fs = require('fs');
const os = require('os');
const path = require('path');
const { createAuditEntry, appendAuditLog, readAuditLog, queryAuditLog, clearAuditLog } = require('./audit');

function tmpFile() {
  return path.join(os.tmpdir(), `audit-test-${Date.now()}-${Math.random().toString(36).slice(2)}.log`);
}

describe('createAuditEntry', () => {
  it('creates entry with required fields', () => {
    const entry = createAuditEntry('new_binding', { port: 8080, pid: 123, process: 'node', severity: 'high' });
    expect(entry.event).toBe('new_binding');
    expect(entry.port).toBe(8080);
    expect(entry.pid).toBe(123);
    expect(entry.severity).toBe('high');
    expect(entry.timestamp).toBeDefined();
  });

  it('merges extra fields', () => {
    const entry = createAuditEntry('alert_sent', { port: 9000 }, { channel: 'desktop' });
    expect(entry.channel).toBe('desktop');
  });
});

describe('appendAuditLog / readAuditLog', () => {
  it('appends and reads entries', () => {
    const f = tmpFile();
    const e1 = createAuditEntry('new_binding', { port: 3000 });
    const e2 = createAuditEntry('removed_binding', { port: 3000 });
    appendAuditLog(e1, f);
    appendAuditLog(e2, f);
    const entries = readAuditLog(f);
    expect(entries).toHaveLength(2);
    expect(entries[0].event).toBe('new_binding');
    expect(entries[1].event).toBe('removed_binding');
    fs.unlinkSync(f);
  });

  it('returns empty array for missing file', () => {
    expect(readAuditLog('/tmp/no-such-audit-file.log')).toEqual([]);
  });
});

describe('queryAuditLog', () => {
  let f;
  beforeEach(() => {
    f = tmpFile();
    appendAuditLog(createAuditEntry('new_binding', { port: 80, severity: 'high' }), f);
    appendAuditLog(createAuditEntry('alert_sent', { port: 80 }), f);
    appendAuditLog(createAuditEntry('new_binding', { port: 443 }), f);
  });
  afterEach(() => fs.existsSync(f) && fs.unlinkSync(f));

  it('filters by event', () => {
    const r = queryAuditLog(f, { event: 'new_binding' });
    expect(r).toHaveLength(2);
  });

  it('filters by port', () => {
    const r = queryAuditLog(f, { port: 80 });
    expect(r).toHaveLength(2);
  });

  it('respects limit', () => {
    const r = queryAuditLog(f, { limit: 2 });
    expect(r).toHaveLength(2);
  });
});

describe('clearAuditLog', () => {
  it('empties the log file', () => {
    const f = tmpFile();
    appendAuditLog(createAuditEntry('new_binding', { port: 1234 }), f);
    clearAuditLog(f);
    expect(readAuditLog(f)).toEqual([]);
    fs.unlinkSync(f);
  });
});
