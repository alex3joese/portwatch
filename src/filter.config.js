/**
 * filter.config.js — Validate and resolve filter configuration
 */

const DEFAULT_FILTER_CONFIG = {
  whitelist: [],
  blacklist: []
};

/**
 * Validate a single filter rule object
 * @param {object} rule
 * @param {string} context - for error messages
 */
function validateRule(rule, context) {
  if (typeof rule !== 'object' || rule === null) {
    throw new Error(`${context}: rule must be an object`);
  }
  if (rule.ports !== undefined) {
    if (!Array.isArray(rule.ports)) throw new Error(`${context}: ports must be an array`);
    for (const p of rule.ports) {
      if (typeof p !== 'number' && !/^\d+(-\d+)?$/.test(String(p))) {
        throw new Error(`${context}: invalid port entry "${p}"`);
      }
    }
  }
  if (rule.addresses !== undefined && !Array.isArray(rule.addresses)) {
    throw new Error(`${context}: addresses must be an array`);
  }
  if (rule.processes !== undefined && !Array.isArray(rule.processes)) {
    throw new Error(`${context}: processes must be an array`);
  }
}

/**
 * Validate the full filter config block
 * @param {object} config
 */
function validateFilterConfig(config) {
  if (typeof config !== 'object' || config === null) {
    throw new Error('filterConfig must be an object');
  }
  if (config.whitelist !== undefined) {
    if (!Array.isArray(config.whitelist)) throw new Error('whitelist must be an array');
    config.whitelist.forEach((r, i) => validateRule(r, `whitelist[${i}]`));
  }
  if (config.blacklist !== undefined) {
    if (!Array.isArray(config.blacklist)) throw new Error('blacklist must be an array');
    config.blacklist.forEach((r, i) => validateRule(r, `blacklist[${i}]`));
  }
}

/**
 * Merge provided config with defaults
 * @param {object} config
 * @returns {object}
 */
function resolveFilterConfig(config = {}) {
  validateFilterConfig(config);
  return {
    whitelist: config.whitelist ?? DEFAULT_FILTER_CONFIG.whitelist,
    blacklist: config.blacklist ?? DEFAULT_FILTER_CONFIG.blacklist
  };
}

module.exports = { validateFilterConfig, resolveFilterConfig, validateRule };
