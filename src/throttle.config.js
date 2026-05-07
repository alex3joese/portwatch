/**
 * throttle.config.js
 * Loads and validates throttle settings from the portwatch config.
 */

const DEFAULT_THROTTLE = {
  windowMs: 60_000,
  maxAlerts: 5,
};

/**
 * Validates a raw throttle config object.
 * @param {object} raw
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateThrottleConfig(raw) {
  const errors = [];

  if (raw.windowMs !== undefined) {
    if (typeof raw.windowMs !== 'number' || raw.windowMs <= 0) {
      errors.push('throttle.windowMs must be a positive number (milliseconds)');
    }
  }

  if (raw.maxAlerts !== undefined) {
    if (!Number.isInteger(raw.maxAlerts) || raw.maxAlerts < 1) {
      errors.push('throttle.maxAlerts must be a positive integer');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Merges user-supplied throttle config with defaults.
 * @param {object} [userConfig={}]
 * @returns {{ windowMs: number, maxAlerts: number }}
 */
function resolveThrottleConfig(userConfig = {}) {
  const { valid, errors } = validateThrottleConfig(userConfig);
  if (!valid) {
    throw new Error(`Invalid throttle config:\n  ${errors.join('\n  ')}`);
  }

  return {
    windowMs: userConfig.windowMs ?? DEFAULT_THROTTLE.windowMs,
    maxAlerts: userConfig.maxAlerts ?? DEFAULT_THROTTLE.maxAlerts,
  };
}

module.exports = { validateThrottleConfig, resolveThrottleConfig, DEFAULT_THROTTLE };
