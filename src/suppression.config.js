// suppression.config.js — validate and resolve suppression config

'use strict';

const DEFAULTS = {
  enabled: true,
  filePath: null,
};

function validateSuppressionConfig(cfg) {
  if (typeof cfg !== 'object' || cfg === null) {
    throw new Error('Suppression config must be an object');
  }
  if (cfg.enabled !== undefined && typeof cfg.enabled !== 'boolean') {
    throw new Error('suppression.enabled must be a boolean');
  }
  if (cfg.filePath !== undefined && cfg.filePath !== null && typeof cfg.filePath !== 'string') {
    throw new Error('suppression.filePath must be a string or null');
  }
  if (cfg.rules !== undefined && !Array.isArray(cfg.rules)) {
    throw new Error('suppression.rules must be an array');
  }
  if (Array.isArray(cfg.rules)) {
    cfg.rules.forEach((rule, i) => {
      const validKeys = ['port', 'proto', 'address', 'process'];
      Object.keys(rule).forEach(k => {
        if (!validKeys.includes(k)) throw new Error(`Unknown suppression rule key "${k}" at index ${i}`);
      });
      if (rule.port !== undefined && typeof rule.port !== 'number') {
        throw new Error(`suppression.rules[${i}].port must be a number`);
      }
    });
  }
}

function resolveSuppressionConfig(cfg = {}) {
  validateSuppressionConfig(cfg);
  return Object.assign({}, DEFAULTS, cfg);
}

module.exports = { validateSuppressionConfig, resolveSuppressionConfig };
