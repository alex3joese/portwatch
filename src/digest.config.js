// digest.config.js — config validation and resolution for digest module

const DEFAULT_INTERVAL_MS = 60000; // 1 minute
const DEFAULT_LOG_PATH = '/var/log/portwatch/digest.log';

function validateDigestConfig(cfg) {
  if (cfg === null || typeof cfg !== 'object') {
    throw new Error('digest config must be an object');
  }
  if (cfg.intervalMs !== undefined) {
    if (typeof cfg.intervalMs !== 'number' || cfg.intervalMs < 1000) {
      throw new Error('digest.intervalMs must be a number >= 1000');
    }
  }
  if (cfg.logPath !== undefined) {
    if (typeof cfg.logPath !== 'string' || cfg.logPath.trim() === '') {
      throw new Error('digest.logPath must be a non-empty string');
    }
  }
  if (cfg.enabled !== undefined && typeof cfg.enabled !== 'boolean') {
    throw new Error('digest.enabled must be a boolean');
  }
}

function resolveDigestConfig(cfg = {}) {
  validateDigestConfig(cfg);
  return {
    enabled: cfg.enabled !== undefined ? cfg.enabled : true,
    intervalMs: cfg.intervalMs !== undefined ? cfg.intervalMs : DEFAULT_INTERVAL_MS,
    logPath: cfg.logPath !== undefined ? cfg.logPath : DEFAULT_LOG_PATH,
  };
}

module.exports = { validateDigestConfig, resolveDigestConfig };
