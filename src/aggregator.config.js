'use strict';

const DEFAULT_CONFIG = {
  windowMs: 60_000,
  maxGroups: 200,
};

const MIN_WINDOW_MS = 1_000;
const MAX_WINDOW_MS = 24 * 60 * 60 * 1_000; // 24 h
const MIN_MAX_GROUPS = 1;
const MAX_MAX_GROUPS = 10_000;

function validateAggregatorConfig(cfg) {
  const errors = [];

  if (cfg.windowMs !== undefined) {
    if (typeof cfg.windowMs !== 'number' || !Number.isFinite(cfg.windowMs)) {
      errors.push('aggregator.windowMs must be a finite number');
    } else if (cfg.windowMs < MIN_WINDOW_MS || cfg.windowMs > MAX_WINDOW_MS) {
      errors.push(`aggregator.windowMs must be between ${MIN_WINDOW_MS} and ${MAX_WINDOW_MS}`);
    }
  }

  if (cfg.maxGroups !== undefined) {
    if (!Number.isInteger(cfg.maxGroups)) {
      errors.push('aggregator.maxGroups must be an integer');
    } else if (cfg.maxGroups < MIN_MAX_GROUPS || cfg.maxGroups > MAX_MAX_GROUPS) {
      errors.push(`aggregator.maxGroups must be between ${MIN_MAX_GROUPS} and ${MAX_MAX_GROUPS}`);
    }
  }

  return errors;
}

function resolveAggregatorConfig(cfg = {}) {
  const errors = validateAggregatorConfig(cfg);
  if (errors.length) throw new Error(errors.join('; '));
  return { ...DEFAULT_CONFIG, ...cfg };
}

module.exports = { validateAggregatorConfig, resolveAggregatorConfig };
