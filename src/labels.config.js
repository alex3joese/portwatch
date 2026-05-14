// labels.config.js — validate and resolve label configuration
'use strict';

/**
 * Validate user-supplied labels config section.
 * @param {unknown} cfg
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateLabelsConfig(cfg) {
  const errors = [];
  if (cfg === undefined || cfg === null) {
    return { valid: true, errors };
  }
  if (typeof cfg !== 'object' || Array.isArray(cfg)) {
    errors.push('labels config must be a plain object mapping port numbers to label strings');
    return { valid: false, errors };
  }
  for (const [key, val] of Object.entries(cfg)) {
    const port = Number(key);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push(`invalid port key "${key}": must be an integer between 1 and 65535`);
    }
    if (typeof val !== 'string' || val.trim() === '') {
      errors.push(`label for port ${key} must be a non-empty string`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Resolve and normalise labels config, merging with defaults.
 * @param {unknown} cfg
 * @returns {Record<number,string>}
 */
function resolveLabelsConfig(cfg) {
  const { valid, errors } = validateLabelsConfig(cfg);
  if (!valid) {
    throw new Error(`Invalid labels config: ${errors.join('; ')}`);
  }
  if (!cfg) return {};
  // Normalise keys to numbers
  return Object.fromEntries(
    Object.entries(cfg).map(([k, v]) => [Number(k), v.trim()])
  );
}

module.exports = { validateLabelsConfig, resolveLabelsConfig };
