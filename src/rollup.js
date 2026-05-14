// rollup.js — periodic summary rollup of aggregated binding events
'use strict';

const { getAll, clearExpired } = require('./aggregator');
const { appendHistory } = require('./history');
const { formatReport } = require('./reporter');
const { resolveRollupConfig } = require('./rollup.config');

function createRollup(cfg = {}) {
  const config = resolveRollupConfig(cfg);
  let lastRollupAt = null;
  let rollupCount = 0;

  return { config, getLastRollupAt, getRollupCount, performRollup, summarize };

  function getLastRollupAt() {
    return lastRollupAt;
  }

  function getRollupCount() {
    return rollupCount;
  }

  function summarize(entries) {
    const byPort = {};
    for (const entry of entries) {
      const key = `${entry.proto}:${entry.port}`;
      if (!byPort[key]) {
        byPort[key] = { proto: entry.proto, port: entry.port, count: 0, pids: new Set() };
      }
      byPort[key].count += entry.count || 1;
      if (entry.pid) byPort[key].pids.add(entry.pid);
    }
    return Object.values(byPort).map(r => ({
      proto: r.proto,
      port: r.port,
      count: r.count,
      pids: Array.from(r.pids),
    }));
  }

  async function performRollup(aggregator) {
    const entries = getAll(aggregator);
    if (!entries || entries.length === 0) {
      return null;
    }

    clearExpired(aggregator);

    const summary = summarize(entries);
    const timestamp = new Date().toISOString();
    const rollupRecord = { timestamp, summary, totalEvents: entries.length };

    if (config.persistToHistory) {
      await appendHistory(config.historyPath, rollupRecord);
    }

    lastRollupAt = timestamp;
    rollupCount += 1;

    return rollupRecord;
  }
}

module.exports = { createRollup };
