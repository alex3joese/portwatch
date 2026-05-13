// watchdog.js — detects if the watcher process has stalled or crashed

const { isRunning } = require('./watcher');
const { appendAuditLog, createAuditEntry } = require('./audit');

let _timer = null;
let _missedTicks = 0;
let _lastTickTime = null;
let _config = {};

function createWatchdog(config = {}) {
  _config = {
    tickIntervalMs: config.tickIntervalMs || 5000,
    maxMissedTicks: config.maxMissedTicks || 3,
    auditLog: config.auditLog || null,
    onStall: config.onStall || null,
  };
  _missedTicks = 0;
  _lastTickTime = null;
  return { start: startWatchdog, stop: stopWatchdog, ping: pingWatchdog, getMissedTicks };
}

function pingWatchdog() {
  _lastTickTime = Date.now();
  _missedTicks = 0;
}

function getMissedTicks() {
  return _missedTicks;
}

function startWatchdog() {
  if (_timer) return;
  _lastTickTime = Date.now();
  _timer = setInterval(_check, _config.tickIntervalMs);
}

function stopWatchdog() {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
  }
}

function _check() {
  const now = Date.now();
  const elapsed = now - (_lastTickTime || now);
  const threshold = _config.tickIntervalMs * 1.5;

  if (!isRunning() || elapsed > threshold) {
    _missedTicks += 1;
    const entry = createAuditEntry('watchdog', 'stall_detected', {
      missedTicks: _missedTicks,
      lastTickTime: _lastTickTime,
      elapsedMs: elapsed,
    });
    if (_config.auditLog) {
      appendAuditLog(_config.auditLog, entry);
    }
    if (_missedTicks >= _config.maxMissedTicks && typeof _config.onStall === 'function') {
      _config.onStall({ missedTicks: _missedTicks, lastTickTime: _lastTickTime });
    }
  } else {
    _missedTicks = 0;
  }
}

module.exports = { createWatchdog, pingWatchdog, getMissedTicks, startWatchdog, stopWatchdog };
