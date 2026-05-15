const DEFAULT_SCHEDULER_CONFIG = {
  intervalMs: 5000,
  maxMissedTicks: 3,
  logTicks: false,
};

const MIN_INTERVAL_MS = 1000;
const MAX_INTERVAL_MS = 60000;

function validateSchedulerConfig(config) {
  const errors = [];

  if (config.intervalMs !== undefined) {
    if (typeof config.intervalMs !== 'number') {
      errors.push('intervalMs must be a number');
    } else if (config.intervalMs < MIN_INTERVAL_MS || config.intervalMs > MAX_INTERVAL_MS) {
      errors.push(`intervalMs must be between ${MIN_INTERVAL_MS} and ${MAX_INTERVAL_MS}`);
    }
  }

  if (config.maxMissedTicks !== undefined) {
    if (typeof config.maxMissedTicks !== 'number' || !Number.isInteger(config.maxMissedTicks) || config.maxMissedTicks < 1) {
      errors.push('maxMissedTicks must be a positive integer');
    }
  }

  if (config.logTicks !== undefined && typeof config.logTicks !== 'boolean') {
    errors.push('logTicks must be a boolean');
  }

  return errors;
}

function resolveSchedulerConfig(partial = {}) {
  const errors = validateSchedulerConfig(partial);
  if (errors.length > 0) {
    throw new Error(`Invalid scheduler config: ${errors.join(', ')}`);
  }
  return Object.assign({}, DEFAULT_SCHEDULER_CONFIG, partial);
}

module.exports = { validateSchedulerConfig, resolveSchedulerConfig, DEFAULT_SCHEDULER_CONFIG };
