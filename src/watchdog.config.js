// watchdog.config.js — validates and resolves watchdog configuration

const DEFAULT_TICK_INTERVAL_MS = 5000;
const DEFAULT_MAX_MISSED_TICKS = 3;

function validateWatchdogConfig(cfg) {
  const errors = [];

  if (cfg.tickIntervalMs !== undefined) {
    if (typeof cfg.tickIntervalMs !== 'number' || cfg.tickIntervalMs < 500) {
      errors.push('tickIntervalMs must be a number >= 500');
    }
  }

  if (cfg.maxMissedTicks !== undefined) {
    if (!Number.isInteger(cfg.maxMissedTicks) || cfg.maxMissedTicks < 1) {
      errors.push('maxMissedTicks must be a positive integer');
    }
  }

  if (cfg.auditLog !== undefined && typeof cfg.auditLog !== 'string') {
    errors.push('auditLog must be a string path');
  }

  if (cfg.onStall !== undefined && typeof cfg.onStall !== 'function') {
    errors.push('onStall must be a function');
  }

  return errors;
}

function resolveWatchdogConfig(cfg = {}) {
  const errors = validateWatchdogConfig(cfg);
  if (errors.length > 0) {
    throw new Error('Invalid watchdog config: ' + errors.join('; '));
  }
  return {
    tickIntervalMs: cfg.tickIntervalMs ?? DEFAULT_TICK_INTERVAL_MS,
    maxMissedTicks: cfg.maxMissedTicks ?? DEFAULT_MAX_MISSED_TICKS,
    auditLog: cfg.auditLog || null,
    onStall: cfg.onStall || null,
  };
}

module.exports = { validateWatchdogConfig, resolveWatchdogConfig };
