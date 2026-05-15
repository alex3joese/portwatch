// redact.config.js — config validation and resolution for the redact module

const DEFAULT_CONFIG = {
  enabled: true,
  mask: '[REDACTED]',
  sensitiveFields: ['password', 'secret', 'token', 'key', 'auth'],
};

/**
 * Validate a redact config object
 * @param {object} cfg
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateRedactConfig(cfg) {
  const errors = [];
  if (typeof cfg !== 'object' || cfg === null) {
    return { valid: false, errors: ['redact config must be an object'] };
  }
  if ('enabled' in cfg && typeof cfg.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }
  if ('mask' in cfg && typeof cfg.mask !== 'string') {
    errors.push('mask must be a string');
  }
  if ('sensitiveFields' in cfg) {
    if (!Array.isArray(cfg.sensitiveFields)) {
      errors.push('sensitiveFields must be an array');
    } else if (!cfg.sensitiveFields.every(f => typeof f === 'string')) {
      errors.push('each sensitiveField must be a string');
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Merge user config with defaults
 * @param {object} cfg
 * @returns {object}
 */
function resolveRedactConfig(cfg = {}) {
  const { valid, errors } = validateRedactConfig(cfg);
  if (!valid) throw new Error(`Invalid redact config: ${errors.join(', ')}`);
  return {
    enabled: cfg.enabled !== undefined ? cfg.enabled : DEFAULT_CONFIG.enabled,
    mask: cfg.mask !== undefined ? cfg.mask : DEFAULT_CONFIG.mask,
    sensitiveFields: cfg.sensitiveFields !== undefined
      ? cfg.sensitiveFields
      : DEFAULT_CONFIG.sensitiveFields,
  };
}

module.exports = { validateRedactConfig, resolveRedactConfig };
