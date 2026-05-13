// pipeline.js — Wires together scan → filter → deduplicate → annotate → alert
'use strict';

const { scanPorts } = require('./scanner');
const { applyFilters } = require('./filter');
const { createDedup } = require('./dedup');
const { annotateBindings } = require('./severity');
const { applySuppression } = require('./suppression');
const { checkBindings } = require('./alerter');
const { appendHistory } = require('./history');
const { record: recordAggregator } = require('./aggregator');

function createPipeline(config = {}) {
  const {
    filterConfig = {},
    dedupConfig = {},
    severityConfig = {},
    suppressionRules = [],
    alertConfig = {},
    historyFile = null,
    aggregator = null,
  } = config;

  const dedup = createDedup(dedupConfig);

  async function run() {
    // 1. Scan current port bindings
    const rawBindings = await scanPorts();

    // 2. Apply filter rules (allowlist / blocklist)
    const filtered = applyFilters(rawBindings, filterConfig);

    // 3. Deduplicate against recently seen bindings
    const novel = filtered.filter((b) => !dedup.isDuplicate(b));
    novel.forEach((b) => dedup.markSeen(b));

    if (novel.length === 0) return { bindings: [], alerts: [] };

    // 4. Annotate with severity levels
    const annotated = annotateBindings(novel, severityConfig);

    // 5. Apply suppression rules
    const active = annotated.filter((b) => !applySuppression(b, suppressionRules));

    // 6. Persist to history if configured
    if (historyFile) {
      await appendHistory(historyFile, active);
    }

    // 7. Record in aggregator if provided
    if (aggregator) {
      active.forEach((b) => recordAggregator(aggregator, b));
    }

    // 8. Send alerts
    const alerts = await checkBindings(active, alertConfig);

    return { bindings: active, alerts };
  }

  function reset() {
    dedup.clear();
  }

  return { run, reset };
}

module.exports = { createPipeline };
