// replay.config.js — validate and resolve replay configuration
'use strict';

const DEFAULT_REPLAY_CONFIG = {
  historyFile: './portwatch-history.json',
  from: null,
  to: null,
  pipelineConfig: {},
};

/**
 * Validate a replay config object.
 * Throws if any field is invalid.
 */
function validateReplayConfig(cfg) {
  if (typeof cfg !== 'object' || cfg === null) {
    throw new Error('replayConfig must be an object');
  }
  if (cfg.historyFile !== undefined && typeof cfg.historyFile !== 'string') {
    throw new Error('replayConfig.historyFile must be a string');
  }
  if (cfg.from !== undefined && cfg.from !== null) {
    const d = new Date(cfg.from);
    if (isNaN(d.getTime())) throw new Error('replayConfig.from must be a valid date');
  }
  if (cfg.to !== undefined && cfg.to !== null) {
    const d = new Date(cfg.to);
    if (isNaN(d.getTime())) throw new Error('replayConfig.to must be a valid date');
  }
  if (cfg.pipelineConfig !== undefined && (typeof cfg.pipelineConfig !== 'object' || cfg.pipelineConfig === null)) {
    throw new Error('replayConfig.pipelineConfig must be an object');
  }
}

/**
 * Merge user-supplied config with defaults.
 */
function resolveReplayConfig(cfg = {}) {
  validateReplayConfig(cfg);
  return {
    ...DEFAULT_REPLAY_CONFIG,
    ...cfg,
    from: cfg.from ? new Date(cfg.from) : null,
    to: cfg.to ? new Date(cfg.to) : null,
  };
}

module.exports = { validateReplayConfig, resolveReplayConfig };
