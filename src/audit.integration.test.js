const fs = require('fs');
const os = require('os');
const path = require('path');
const { createAuditEntry, appendAuditLog, queryAuditLog } = require('./audit');
const { resolveAuditConfig } = require('./audit.config');

function tmpFile() {
  return path.join(os.tmpdir(), `audit-int-${Date.now()}.log`);
}

describe('audit integration', () => {
  let logPath;
  let config;

  beforeEach(() => {
    logPath = tmpFile();
    config = resolveAuditConfig({ logPath, maxEntries: 100 });
  });

  afterEach(() => {
    if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
  });

  it('logs a full lifecycle: new binding -> alert -> removed', () => {
    const binding = { port: 4000, pid: 555, process: 'python', severity: 'medium' };

    appendAuditLog(createAuditEntry('new_binding', binding), config.logPath);
    appendAuditLog(createAuditEntry('alert_sent', binding, { channel: 'log' }), config.logPath);
    appendAuditLog(createAuditEntry('removed_binding', binding), config.logPath);

    const all = queryAuditLog(config.logPath);
    expect(all).toHaveLength(3);
    expect(all.map(e => e.event)).toEqual(['new_binding', 'alert_sent', 'removed_binding']);
  });

  it('only returns events matching the configured events list', () => {
    const binding = { port: 8888 };
    appendAuditLog(createAuditEntry('new_binding', binding), config.logPath);
    appendAuditLog(createAuditEntry('suppressed', binding), config.logPath);

    const filtered = queryAuditLog(config.logPath, { event: 'suppressed' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].port).toBe(8888);
  });

  it('since filter excludes old entries', async () => {
    const binding = { port: 9999 };
    appendAuditLog(createAuditEntry('new_binding', binding), config.logPath);
    await new Promise(r => setTimeout(r, 10));
    const cutoff = new Date().toISOString();
    await new Promise(r => setTimeout(r, 10));
    appendAuditLog(createAuditEntry('alert_sent', binding), config.logPath);

    const recent = queryAuditLog(config.logPath, { since: cutoff });
    expect(recent).toHaveLength(1);
    expect(recent[0].event).toBe('alert_sent');
  });
});
