const DEFAULT_HISTORY_CONFIG = {
  enabled: true,
  filePath: './portwatch-history.json',
  maxEntries: 500
};

function validateHistoryConfig(config) {
  const errors = [];
  if (typeof config.enabled !== 'undefined' && typeof config.enabled !== 'boolean') {
    errors.push('history.enabled must be a boolean');
  }
  if (typeof config.filePath !== 'undefined') {
    if (typeof config.filePath !== 'string' || config.filePath.trim() === '') {
      errors.push('history.filePath must be a non-empty string');
    }
  }
  if (typeof config.maxEntries !== 'undefined') {
    if (!Number.isInteger(config.maxEntries) || config.maxEntries < 1) {
      errors.push('history.maxEntries must be a positive integer');
    }
    if (config.maxEntries > 10000) {
      errors.push('history.maxEntries must not exceed 10000');
    }
  }
  return errors;
}

function resolveHistoryConfig(userConfig = {}) {
  const errors = validateHistoryConfig(userConfig);
  if (errors.length > 0) {
    throw new Error(`Invalid history config: ${errors.join('; ')}`);
  }
  return {
    ...DEFAULT_HISTORY_CONFIG,
    ...userConfig
  };
}

module.exports = { validateHistoryConfig, resolveHistoryConfig, DEFAULT_HISTORY_CONFIG };
