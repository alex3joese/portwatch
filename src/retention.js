// retention.js — prune old audit/history/snapshot entries based on configured max age

const fs = require('fs');

function isExpired(entry, maxAgeMs, now = Date.now()) {
  if (!entry || !entry.timestamp) return false;
  const ts = typeof entry.timestamp === 'number' ? entry.timestamp : new Date(entry.timestamp).getTime();
  return now - ts > maxAgeMs;
}

function pruneEntries(entries, maxAgeMs, now = Date.now()) {
  if (!Array.isArray(entries)) return [];
  return entries.filter(e => !isExpired(e, maxAgeMs, now));
}

function applyRetention(entries, config, now = Date.now()) {
  const { maxAgeMs, maxCount } = config;
  let result = entries;

  if (typeof maxAgeMs === 'number' && maxAgeMs > 0) {
    result = pruneEntries(result, maxAgeMs, now);
  }

  if (typeof maxCount === 'number' && maxCount > 0 && result.length > maxCount) {
    // keep the most recent maxCount entries
    result = result.slice(result.length - maxCount);
  }

  return result;
}

function pruneFile(filePath, config, now = Date.now()) {
  if (!fs.existsSync(filePath)) return { pruned: 0, remaining: 0 };
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) return { pruned: 0, remaining: 0 };

  const entries = raw.split('\n').map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);

  const kept = applyRetention(entries, config, now);
  const pruned = entries.length - kept.length;

  fs.writeFileSync(filePath, kept.map(e => JSON.stringify(e)).join('\n') + (kept.length ? '\n' : ''), 'utf8');
  return { pruned, remaining: kept.length };
}

module.exports = { isExpired, pruneEntries, applyRetention, pruneFile };
