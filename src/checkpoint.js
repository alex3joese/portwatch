// checkpoint.js — persist and restore daemon state across restarts

const fs = require('fs');
const path = require('path');

const DEFAULT_PATH = path.join(process.cwd(), '.portwatch-checkpoint.json');

function createCheckpoint(bindings, meta = {}) {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    pid: process.pid,
    meta,
    bindings,
  };
}

function saveCheckpoint(bindings, meta = {}, filePath = DEFAULT_PATH) {
  const checkpoint = createCheckpoint(bindings, meta);
  const json = JSON.stringify(checkpoint, null, 2);
  fs.writeFileSync(filePath, json, 'utf8');
  return checkpoint;
}

function loadCheckpoint(filePath = DEFAULT_PATH) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || !Array.isArray(data.bindings)) {
      return null;
    }
    return data;
  } catch (_) {
    return null;
  }
}

function clearCheckpoint(filePath = DEFAULT_PATH) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

function checkpointAge(checkpoint) {
  if (!checkpoint || !checkpoint.savedAt) return Infinity;
  return Date.now() - new Date(checkpoint.savedAt).getTime();
}

function isCheckpointStale(checkpoint, maxAgeMs = 60 * 60 * 1000) {
  return checkpointAge(checkpoint) > maxAgeMs;
}

module.exports = {
  createCheckpoint,
  saveCheckpoint,
  loadCheckpoint,
  clearCheckpoint,
  checkpointAge,
  isCheckpointStale,
};
