// metrics.js — collects and exposes runtime stats for portwatch

'use strict';

let _counters = {};
let _gauges = {};
let _startTime = Date.now();

function resetMetrics() {
  _counters = {};
  _gauges = {};
  _startTime = Date.now();
}

function increment(name, amount = 1) {
  if (typeof name !== 'string' || !name) throw new Error('metric name must be a non-empty string');
  _counters[name] = (_counters[name] || 0) + amount;
}

function setGauge(name, value) {
  if (typeof name !== 'string' || !name) throw new Error('metric name must be a non-empty string');
  if (typeof value !== 'number') throw new Error('gauge value must be a number');
  _gauges[name] = value;
}

function getCounter(name) {
  return _counters[name] || 0;
}

function getGauge(name) {
  return _gauges[name] !== undefined ? _gauges[name] : null;
}

function getSnapshot() {
  return {
    uptimeMs: Date.now() - _startTime,
    counters: { ..._counters },
    gauges: { ..._gauges },
  };
}

function getSummary() {
  const snap = getSnapshot();
  const lines = [`uptime: ${snap.uptimeMs}ms`];
  for (const [k, v] of Object.entries(snap.counters)) {
    lines.push(`counter/${k}: ${v}`);
  }
  for (const [k, v] of Object.entries(snap.gauges)) {
    lines.push(`gauge/${k}: ${v}`);
  }
  return lines.join('\n');
}

module.exports = {
  resetMetrics,
  increment,
  setGauge,
  getCounter,
  getGauge,
  getSnapshot,
  getSummary,
};
