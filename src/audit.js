const fs = require('fs');
const path = require('path');

/**
 * Audit log entry structure:
 * { timestamp, event, port, pid, process, severity, details }
 */

function createAuditEntry(event, binding, extra = {}) {
  return {
    timestamp: new Date().toISOString(),
    event,
    port: binding.port,
    pid: binding.pid || null,
    process: binding.process || null,
    severity: binding.severity || 'info',
    ...extra
  };
}

function appendAuditLog(entry, logPath) {
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(logPath, line, 'utf8');
}

function readAuditLog(logPath) {
  if (!fs.existsSync(logPath)) return [];
  const raw = fs.readFileSync(logPath, 'utf8').trim();
  if (!raw) return [];
  return raw.split('\n').map(line => JSON.parse(line));
}

function queryAuditLog(logPath, { event, port, since, limit } = {}) {
  let entries = readAuditLog(logPath);

  if (event) entries = entries.filter(e => e.event === event);
  if (port !== undefined) entries = entries.filter(e => e.port === port);
  if (since) {
    const sinceMs = new Date(since).getTime();
    entries = entries.filter(e => new Date(e.timestamp).getTime() >= sinceMs);
  }
  if (limit && limit > 0) entries = entries.slice(-limit);

  return entries;
}

function clearAuditLog(logPath) {
  fs.writeFileSync(logPath, '', 'utf8');
}

module.exports = { createAuditEntry, appendAuditLog, readAuditLog, queryAuditLog, clearAuditLog };
