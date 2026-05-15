// replay.js — replay historical port binding events through the pipeline
'use strict';

const { loadHistory } = require('./history');
const { createPipeline } = require('./pipeline');

/**
 * Filter history entries by time range.
 * @param {Array} entries
 * @param {Object} opts - { from: Date, to: Date }
 */
function filterByRange(entries, { from, to } = {}) {
  return entries.filter(entry => {
    const ts = new Date(entry.timestamp);
    if (from && ts < from) return false;
    if (to && ts > to) return false;
    return true;
  });
}

/**
 * Replay a slice of history through a fresh pipeline instance.
 * Returns the list of alerts produced during replay.
 *
 * @param {string} historyFile
 * @param {Object} opts
 * @param {Date}   [opts.from]
 * @param {Date}   [opts.to]
 * @param {Object} [opts.pipelineConfig]
 * @returns {Promise<Array>}
 */
async function replayHistory(historyFile, opts = {}) {
  const { from, to, pipelineConfig = {} } = opts;

  const allEntries = await loadHistory(historyFile);
  const entries = filterByRange(allEntries, { from, to });

  if (entries.length === 0) {
    return { replayed: 0, alerts: [] };
  }

  const pipeline = createPipeline(pipelineConfig);
  const alerts = [];

  for (const entry of entries) {
    const result = await pipeline.process(entry.bindings || [], {
      timestamp: entry.timestamp,
      replayMode: true,
    });
    if (result && result.alerts && result.alerts.length > 0) {
      alerts.push(...result.alerts.map(a => ({ ...a, replayedAt: new Date().toISOString(), originalTimestamp: entry.timestamp })));
    }
  }

  return { replayed: entries.length, alerts };
}

/**
 * Summarise a replay result into a human-readable string.
 */
function formatReplaySummary({ replayed, alerts }) {
  const alertCount = alerts.length;
  return `Replayed ${replayed} snapshot(s). ${alertCount} alert(s) generated.`;
}

module.exports = { filterByRange, replayHistory, formatReplaySummary };
