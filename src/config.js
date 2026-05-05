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

  // Validate
  if (!Array.isArray(merged.allowedPorts)) {
    throw new Error('allowedPorts must be an array');
  }
  if (typeof merged.pollIntervalMs !== 'number' || merged.pollIntervalMs < 500) {
    throw new Error('pollIntervalMs must be a number >= 500');
  }

  return merged;
}

module.exports = { loadConfig, DEFAULT_CONFIG };
