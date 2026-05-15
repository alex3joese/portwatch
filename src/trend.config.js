// trend.config.js — config validation and resolution for trend module

'use strict';

const DEFAULTS = {
  windowSize: 10,
  anomalyThreshold: 2.0,
  enabled: true
};

function validateTrendConfig(cfg) {
  if (cfg.windowSize !== undefined) {
    if (typeof cfg.windowSize !== 'number' || cfg.windowSize < 2) {
      throw new Error('trend.windowSize must be a number >= 2');
    }
  }
  if (cfg.anomalyThreshold !== undefined) {
    if (typeof cfg.anomalyThreshold !== 'number' || cfg.anomalyThreshold <= 0) {
      throw new Error('trend.anomalyThreshold must be a positive number');
    }
  }
  if (cfg.enabled !== undefined && typeof cfg.enabled !== 'boolean') {
    throw new Error('trend.enabled must be a boolean');
  }
}

function resolveTrendConfig(cfg = {}) {
  validateTrendConfig(cfg);
  return Object.assign({}, DEFAULTS, cfg);
}

module.exports = { validateTrendConfig, resolveTrendConfig };
