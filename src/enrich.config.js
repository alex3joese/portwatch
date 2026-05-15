// enrich.config.js — validation and resolution for enrichment pipeline config
'use strict';

const DEFAULTS = {
  enabled: true,
  includeProcess: true,
  includeLabels: true,
  includeSeverity: true,
  includeRouting: false,
  includeAnomalies: false,
};

function validateEnrichConfig(cfg) {
  if (cfg === null || typeof cfg !== 'object') {
    throw new Error('enrich config must be an object');
  }

  const boolFields = [
    'enabled',
    'includeProcess',
    'includeLabels',
    'includeSeverity',
    'includeRouting',
    'includeAnomalies',
  ];

  for (const field of boolFields) {
    if (field in cfg && typeof cfg[field] !== 'boolean') {
      throw new Error(`enrich config: '${field}' must be a boolean`);
    }
  }

  return true;
}

function resolveEnrichConfig(cfg = {}) {
  validateEnrichConfig(cfg);
  return { ...DEFAULTS, ...cfg };
}

module.exports = { validateEnrichConfig, resolveEnrichConfig };
