// labels.js — attach human-readable labels/tags to port bindings
'use strict';

const DEFAULT_LABELS = {
  22: 'ssh',
  25: 'smtp',
  53: 'dns',
  80: 'http',
  443: 'https',
  3000: 'dev-server',
  3306: 'mysql',
  5432: 'postgres',
  6379: 'redis',
  8080: 'http-alt',
  8443: 'https-alt',
  27017: 'mongodb',
};

/**
 * Look up a label for a given port number.
 * Custom labels take precedence over defaults.
 * @param {number} port
 * @param {Record<number,string>} customLabels
 * @returns {string|null}
 */
function getLabel(port, customLabels = {}) {
  const merged = Object.assign({}, DEFAULT_LABELS, customLabels);
  return merged[port] || null;
}

/**
 * Annotate an array of binding objects with a `label` field.
 * @param {Array<{port:number}>} bindings
 * @param {Record<number,string>} customLabels
 * @returns {Array<{port:number, label:string|null}>}
 */
function annotateWithLabels(bindings, customLabels = {}) {
  return bindings.map((b) => ({
    ...b,
    label: getLabel(b.port, customLabels),
  }));
}

/**
 * Filter bindings to only those matching a given label.
 * @param {Array<{label:string|null}>} annotated
 * @param {string} label
 * @returns {Array}
 */
function filterByLabel(annotated, label) {
  if (!label) return annotated;
  return annotated.filter((b) => b.label === label);
}

module.exports = { getLabel, annotateWithLabels, filterByLabel, DEFAULT_LABELS };
