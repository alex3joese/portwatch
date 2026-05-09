// Config loader and validator for severity rules

const { LEVELS } = require('./severity');

/**
 * Validate a single severity rule object.
 */
function validateSeverityRule(rule, idx) {
  if (!Array.isArray(rule.portRange) || rule.portRange.length !== 2) {
    throw new Error(`severity.rules[${idx}]: portRange must be a 2-element array`);
  }
  const [min, max] = rule.portRange;
  if (typeof min !== 'number' || typeof max !== 'number' || min < 1 || max > 65535 || min > max) {
    throw new Error(`severity.rules[${idx}]: invalid portRange [${min}, ${max}]`);
  }
  if (!LEVELS.includes(rule.level)) {
    throw new Error(`severity.rules[${idx}]: level must be one of ${LEVELS.join(', ')}`);
  }
}

/**
 * Validate the full severity config block.
 */
function validateSeverityConfig(cfg = {}) {
  if (cfg.minLevel !== undefined && !LEVELS.includes(cfg.minLevel)) {
    throw new Error(`severity.minLevel must be one of ${LEVELS.join(', ')}`);
  }
  if (cfg.rules !== undefined) {
    if (!Array.isArray(cfg.rules)) throw new Error('severity.rules must be an array');
    cfg.rules.forEach((r, i) => validateSeverityRule(r, i));
  }
}

/**
 * Merge user config with defaults.
 */
function resolveSeverityConfig(cfg = {}) {
  validateSeverityConfig(cfg);
  const { DEFAULT_RULES } = require('./severity');
  return {
    minLevel: cfg.minLevel || 'info',
    rules: cfg.rules || DEFAULT_RULES
  };
}

module.exports = { validateSeverityRule, validateSeverityConfig, resolveSeverityConfig };
