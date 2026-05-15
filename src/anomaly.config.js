// anomaly.config.js — validation and resolution for anomaly detection config

'use strict';

const DEFAULT_CONFIG = {
  enabled: true,
  spikeThreshold: 3.0,
  newPortWindowMs: 60000,
};

function validateAnomalyConfig(config) {
  if (typeof config !== 'object' || config === null) {
    throw new Error('anomaly config must be an object');
  }

  if ('enabled' in config && typeof config.enabled !== 'boolean') {
    throw new Error('anomaly.enabled must be a boolean');
  }

  if ('spikeThreshold' in config) {
    if (typeof config.spikeThreshold !== 'number' || config.spikeThreshold <= 0) {
      throw new Error('anomaly.spikeThreshold must be a positive number');
    }
  }

  if ('newPortWindowMs' in config) {
    if (
      typeof config.newPortWindowMs !== 'number' ||
      !Number.isInteger(config.newPortWindowMs) ||
      config.newPortWindowMs < 1000
    ) {
      throw new Error('anomaly.newPortWindowMs must be an integer >= 1000');
    }
  }

  return true;
}

function resolveAnomalyConfig(partial = {}) {
  validateAnomalyConfig(partial);
  return { ...DEFAULT_CONFIG, ...partial };
}

module.exports = { validateAnomalyConfig, resolveAnomalyConfig };
