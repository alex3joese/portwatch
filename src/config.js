/**
 * config.js — load and validate portwatch configuration
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  /** Ports always expected to be bound — no alert fired for these */
  allowedPorts: [],
  /** How often to poll in milliseconds */
  pollIntervalMs: 5000,
  /** Where to write alerts (stdout if null) */
  logFile: null,
};

/**
 * Load config from a JSON file, merging with defaults.
 * @param {string} [configPath]
 * @returns {object}
 */
function loadConfig(configPath) {
  const filePath = configPath
    ? path.resolve(configPath)
    : path.resolve(process.cwd(), 'portwatch.config.json');

  let userConfig = {};

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      userConfig = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Failed to parse config at ${filePath}: ${err.message}`);
    }
  }

  const merged = { ...DEFAULT_CONFIG, ...userConfig };

  validateConfig(merged);

  return merged;
}

/**
 * Validate a merged config object, throwing descriptive errors on bad values.
 * @param {object} config
 */
function validateConfig(config) {
  if (!Array.isArray(config.allowedPorts)) {
    throw new Error('allowedPorts must be an array');
  }
  if (config.allowedPorts.some((p) => typeof p !== 'number' || p < 1 || p > 65535)) {
    throw new Error('allowedPorts must only contain valid port numbers (1–65535)');
  }
  if (typeof config.pollIntervalMs !== 'number' || config.pollIntervalMs < 500) {
    throw new Error('pollIntervalMs must be a number >= 500');
  }
  if (config.logFile !== null && typeof config.logFile !== 'string') {
    throw new Error('logFile must be a string path or null');
  }
}

module.exports = { loadConfig, validateConfig, DEFAULT_CONFIG };
