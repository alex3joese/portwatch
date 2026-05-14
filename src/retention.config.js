// retention.config.js — validate and resolve retention configuration

const DEFAULTS = {
  maxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxCount: 10000,
};

function validateRetentionConfig(cfg) {
  if (cfg === null || typeof cfg !== 'object') {
    throw new Error('retention config must be an object');
  }

  if ('maxAgeMs' in cfg) {
    if (typeof cfg.maxAgeMs !== 'number' || cfg.maxAgeMs <= 0) {
      throw new Error('retention.maxAgeMs must be a positive number');
    }
  }

  if ('maxAgeDays' in cfg) {
    if (typeof cfg.maxAgeDays !== 'number' || cfg.maxAgeDays <= 0) {
      throw new Error('retention.maxAgeDays must be a positive number');
    }
  }

  if ('maxCount' in cfg) {
    if (!Number.isInteger(cfg.maxCount) || cfg.maxCount <= 0) {
      throw new Error('retention.maxCount must be a positive integer');
    }
  }
}

function resolveRetentionConfig(cfg = {}) {
  validateRetentionConfig(cfg);

  const maxAgeMs = cfg.maxAgeMs != null
    ? cfg.maxAgeMs
    : cfg.maxAgeDays != null
      ? cfg.maxAgeDays * 24 * 60 * 60 * 1000
      : DEFAULTS.maxAgeMs;

  const maxCount = cfg.maxCount != null ? cfg.maxCount : DEFAULTS.maxCount;

  return { maxAgeMs, maxCount };
}

module.exports = { validateRetentionConfig, resolveRetentionConfig };
