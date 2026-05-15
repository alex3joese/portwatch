// correlation.config.js — config validation and resolution for correlation module

const DEFAULTS = {
  enabled: true,
  maxGroupAge: 3600000,   // 1 hour in ms
  maxGroupSize: 100
};

function validateCorrelationConfig(config) {
  const errors = [];

  if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
    errors.push('correlation.enabled must be a boolean');
  }

  if (config.maxGroupAge !== undefined) {
    if (typeof config.maxGroupAge !== 'number' || config.maxGroupAge <= 0) {
      errors.push('correlation.maxGroupAge must be a positive number (ms)');
    }
  }

  if (config.maxGroupSize !== undefined) {
    if (!Number.isInteger(config.maxGroupSize) || config.maxGroupSize < 1) {
      errors.push('correlation.maxGroupSize must be a positive integer');
    }
  }

  return errors;
}

function resolveCorrelationConfig(partial = {}) {
  const errors = validateCorrelationConfig(partial);
  if (errors.length > 0) {
    throw new Error(`Invalid correlation config: ${errors.join('; ')}`);
  }
  return { ...DEFAULTS, ...partial };
}

module.exports = { validateCorrelationConfig, resolveCorrelationConfig };
