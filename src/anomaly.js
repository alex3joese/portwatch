// anomaly.js — detects anomalous port binding patterns using trend + history data

'use strict';

const { getSlope, getAverage } = require('./trend');
const { queryHistory } = require('./history');

const DEFAULT_SPIKE_THRESHOLD = 3.0;
const DEFAULT_NEW_PORT_WINDOW_MS = 60_000;

function createAnomaly(config = {}) {
  const spikeThreshold = config.spikeThreshold ?? DEFAULT_SPIKE_THRESHOLD;
  const newPortWindowMs = config.newPortWindowMs ?? DEFAULT_NEW_PORT_WINDOW_MS;

  return { spikeThreshold, newPortWindowMs };
}

function isSpike(trend, anomaly) {
  const avg = getAverage(trend);
  const slope = getSlope(trend);
  if (avg === 0) return false;
  return slope / avg > anomaly.spikeThreshold;
}

function isNewPort(port, historyEntries, anomaly) {
  const cutoff = Date.now() - anomaly.newPortWindowMs;
  const seen = historyEntries.some(
    (e) => e.port === port && new Date(e.timestamp).getTime() < cutoff
  );
  return !seen;
}

function detectAnomalies(bindings, trend, historyEntries, anomaly) {
  const results = [];

  for (const binding of bindings) {
    const reasons = [];

    if (isSpike(trend, anomaly)) {
      reasons.push('spike');
    }

    if (isNewPort(binding.port, historyEntries, anomaly)) {
      reasons.push('new_port');
    }

    if (reasons.length > 0) {
      results.push({ binding, reasons });
    }
  }

  return results;
}

function annotateWithAnomalies(bindings, trend, historyEntries, anomaly) {
  const flagged = new Map(
    detectAnomalies(bindings, trend, historyEntries, anomaly).map((r) => [
      `${r.binding.proto}:${r.binding.port}`,
      r.reasons,
    ])
  );

  return bindings.map((b) => {
    const key = `${b.proto}:${b.port}`;
    return flagged.has(key)
      ? { ...b, anomaly: true, anomalyReasons: flagged.get(key) }
      : { ...b, anomaly: false, anomalyReasons: [] };
  });
}

module.exports = { createAnomaly, isSpike, isNewPort, detectAnomalies, annotateWithAnomalies };
