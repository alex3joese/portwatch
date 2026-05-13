// healthcheck.config.js — validate and resolve healthcheck configuration

const DEFAULT_CONFIG = {
  enabled: true,
  intervalMs: 30000,
  maxMissedTicks: 3,
  logPath: '/var/log/portwatch/health.log',
};

function validateHealthCheckConfig(cfg) {
  if (typeof cfg !== 'object' || cfg === null) {
    throw new Error('healthcheck config must be an object');
  }
  if (cfg.intervalMs !== undefined) {
    if (typeof cfg.intervalMs !== 'number' || cfg.intervalMs < 1000) {
      throw new Error('healthcheck.intervalMs must be a number >= 1000');
    }
  }
  if (cfg.maxMissedTicks !== undefined) {
    if (typeof cfg.maxMissedTicks !== 'number' || cfg.maxMissedTicks < 1) {
      throw new Error('healthcheck.maxMissedTicks must be a positive number');
    }
  }
  if (cfg.logPath !== undefined && typeof cfg.logPath !== 'string') {
    throw new Error('healthcheck.logPath must be a string');
  }
  if (cfg.enabled !== undefined && typeof cfg.enabled !== 'boolean') {
    throw new Error('healthcheck.enabled must be a boolean');
  }
}

function resolveHealthCheckConfig(cfg = {}) {
  validateHealthCheckConfig(cfg);
  return Object.assign({}, DEFAULT_CONFIG, cfg);
}

module.exports = { validateHealthCheckConfig, resolveHealthCheckConfig };
