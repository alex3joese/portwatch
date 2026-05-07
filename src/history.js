const fs = require('fs');
const path = require('path');

const DEFAULT_MAX_ENTRIES = 500;

function loadHistory(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('History file must contain a JSON array');
    }
    return parsed;
  } catch (err) {
    throw new Error(`Failed to load history from ${filePath}: ${err.message}`);
  }
}

function appendHistory(filePath, entry, maxEntries = DEFAULT_MAX_ENTRIES) {
  if (!entry || typeof entry !== 'object') {
    throw new Error('History entry must be an object');
  }
  const record = {
    timestamp: entry.timestamp || new Date().toISOString(),
    ...entry
  };
  let history = [];
  if (fs.existsSync(filePath)) {
    history = loadHistory(filePath);
  }
  history.push(record);
  if (history.length > maxEntries) {
    history = history.slice(history.length - maxEntries);
  }
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2), 'utf8');
  return record;
}

function queryHistory(filePath, { since, port, limit } = {}) {
  const history = loadHistory(filePath);
  let results = history;
  if (since) {
    const sinceDate = new Date(since);
    results = results.filter(e => new Date(e.timestamp) >= sinceDate);
  }
  if (port !== undefined) {
    results = results.filter(e => e.port === port);
  }
  if (limit && limit > 0) {
    results = results.slice(-limit);
  }
  return results;
}

module.exports = { loadHistory, appendHistory, queryHistory };
