'use strict';

const DEFAULT_ROLLUP_CONFIG = {
  persistToHistory: true,
  historyPath: '/var/log/portwatch/rollup-history.json',
  intervalMs: 60000,
};

function validateRollupConfig(cfg) {
  if (cfg.intervalMs !== undefined) {
    if (typeof cfg.intervalMs !== 'number' || cfg.intervalMs < 1000) {
      throw new Error('rollup.intervalMs must be a number >= 1000');
    }
  }
  if (cfg.persistToHistory !== undefined && typeof cfg.persistToHistory !== 'boolean') {
    throw new Error('rollup.persistToHistory must be a boolean');
  }
  if (cfg.historyPath !== undefined && typeof cfg.historyPath !== 'string') {
    throw new Error('rollup.historyPath must be a string');
  }
}

function resolveRollupConfig(cfg = {}) {
  validateRollupConfig(cfg);
  return Object.assign({}, DEFAULT_ROLLUP_CONFIG, cfg);
}

module.exports = { validateRollupConfig, resolveRollupConfig };
