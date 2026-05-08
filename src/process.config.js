/**
 * Config schema and helpers for process-enrichment feature.
 */

const DEFAULTS = {
  enabled: true,
  fallbackOnError: true,
  includePid: true,
  includeProcessName: true,
};

function validateProcessConfig(config) {
  if (typeof config !== 'object' || config === null) {
    throw new Error('process config must be an object');
  }
  if ('enabled' in config && typeof config.enabled !== 'boolean') {
    throw new Error('process.enabled must be a boolean');
  }
  if ('fallbackOnError' in config && typeof config.fallbackOnError !== 'boolean') {
    throw new Error('process.fallbackOnError must be a boolean');
  }
  if ('includePid' in config && typeof config.includePid !== 'boolean') {
    throw new Error('process.includePid must be a boolean');
  }
  if ('includeProcessName' in config && typeof config.includeProcessName !== 'boolean') {
    throw new Error('process.includeProcessName must be a boolean');
  }
  return true;
}

function resolveProcessConfig(partial = {}) {
  validateProcessConfig(partial);
  return { ...DEFAULTS, ...partial };
}

module.exports = { validateProcessConfig, resolveProcessConfig, DEFAULTS };
