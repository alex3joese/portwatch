// quota.config.js — configuration schema for quota module
'use strict';

const VALID_GROUP_BY = ['port', 'process', 'user'];

function validateQuotaConfig(config) {
  if (config.maxBindings !== undefined) {
    if (typeof config.maxBindings !== 'number' || config.maxBindings < 1) {
      throw new Error('quota.maxBindings must be a positive number');
    }
  }
  if (config.groupBy !== undefined) {
    if (!VALID_GROUP_BY.includes(config.groupBy)) {
      throw new Error(`quota.groupBy must be one of: ${VALID_GROUP_BY.join(', ')}`);
    }
  }
  return true;
}

function resolveQuotaConfig(config = {}) {
  validateQuotaConfig(config);
  return {
    maxBindings: config.maxBindings !== undefined ? config.maxBindings : 5,
    groupBy: config.groupBy || 'port'
  };
}

module.exports = { validateQuotaConfig, resolveQuotaConfig };
