// rules.config.js — validate and resolve rules configuration block

const path = require('path');

const DEFAULTS = {
  rulesFile: path.join(process.cwd(), 'portwatch.rules.json'),
  enabled: true,
  defaultAction: 'alert',
};

/**
 * Validate a rules config object.
 * @param {object} config
 */
function validateRulesConfig(config) {
  if (typeof config !== 'object' || config === null) {
    throw new Error('rules config must be an object');
  }
  if (config.rulesFile !== undefined && typeof config.rulesFile !== 'string') {
    throw new Error('rules.rulesFile must be a string path');
  }
  if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
    throw new Error('rules.enabled must be a boolean');
  }
  if (
    config.defaultAction !== undefined &&
    !['allow', 'deny', 'alert'].includes(config.defaultAction)
  ) {
    throw new Error(`rules.defaultAction must be allow, deny, or alert; got: ${config.defaultAction}`);
  }
}

/**
 * Merge user config with defaults.
 * @param {object} [userConfig={}]
 * @returns {object}
 */
function resolveRulesConfig(userConfig = {}) {
  validateRulesConfig(userConfig);
  return {
    rulesFile: userConfig.rulesFile ?? DEFAULTS.rulesFile,
    enabled: userConfig.enabled ?? DEFAULTS.enabled,
    defaultAction: userConfig.defaultAction ?? DEFAULTS.defaultAction,
  };
}

module.exports = { validateRulesConfig, resolveRulesConfig, DEFAULTS };
