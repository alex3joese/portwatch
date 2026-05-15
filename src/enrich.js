// enrich.js — annotates bindings with metadata from multiple sources
'use strict';

const { enrichWithProcessInfo } = require('./process');
const { annotateWithLabels } = require('./labels');
const { annotateWithAnomalies } = require('./anomaly');
const { annotateWithRoutes } = require('./routing');
const { annotateBindings: annotateSeverity } = require('./severity');

/**
 * Run a single binding through all enrichment steps.
 * Each step receives the binding and may add new fields.
 */
function enrichBinding(binding, opts = {}) {
  const { labels = {}, severityRules = [], routingConfig = {}, anomalyState = null } = opts;

  let b = { ...binding };

  // Process info (pid, name, user)
  b = enrichWithProcessInfo(b);

  // Human-readable labels
  b = annotateWithLabels([b], labels)[0];

  // Severity annotation
  b = annotateSeverity([b], severityRules)[0];

  // Routing metadata
  if (routingConfig.routes) {
    b = annotateWithRoutes([b], routingConfig)[0];
  }

  // Anomaly flags (requires trend state)
  if (anomalyState) {
    b = annotateWithAnomalies([b], anomalyState)[0];
  }

  b._enrichedAt = Date.now();
  return b;
}

/**
 * Enrich an array of bindings in one pass.
 */
function enrichBindings(bindings, opts = {}) {
  return bindings.map(b => enrichBinding(b, opts));
}

/**
 * Strip enrichment metadata (useful before saving baseline).
 */
function stripEnrichment(binding) {
  const clean = { ...binding };
  delete clean._enrichedAt;
  delete clean.label;
  delete clean.severity;
  delete clean.route;
  delete clean.anomalies;
  delete clean.process;
  return clean;
}

module.exports = { enrichBinding, enrichBindings, stripEnrichment };
