// sampling.config.js — validate and resolve sampling configuration

'use strict';

const VALID_MODES = ['rate', 'interval'];

function validateSamplingConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('sampling config must be an object');
  }
  if (config.mode !== undefined && !VALID_MODES.includes(config.mode)) {
    throw new Error(`sampling.mode must be one of: ${VALID_MODES.join(', ')}`);
  }
  if (config.rate !== undefined) {
    const r = config.rate;
    if (typeof r !== 'number' || r < 0 || r > 1) {
      throw new Error('sampling.rate must be a number between 0 and 1');
    }
  }
  if (config.every !== undefined) {
    const e = config.every;
    if (!Number.isInteger(e) || e < 1) {
      throw new Error('sampling.every must be a positive integer');
    }
  }
  return true;
}

function resolveSamplingConfig(config = {}) {
  validateSamplingConfig(config);
  return {
    mode: config.mode ?? 'rate',
    rate: config.rate ?? 1.0,
    every: config.every ?? 1,
  };
}

module.exports = { validateSamplingConfig, resolveSamplingConfig };
