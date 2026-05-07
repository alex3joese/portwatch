// rules.js — load, validate, and match port alert rules

const fs = require('fs');

/**
 * Load rules from a JSON file.
 * @param {string} filePath
 * @returns {object[]}
 */
function loadRules(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse rules file: ${e.message}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Rules file must contain a JSON array');
  }
  return parsed.map(validateRule);
}

/**
 * Validate a single rule object.
 * @param {object} rule
 * @returns {object}
 */
function validateRule(rule) {
  if (typeof rule !== 'object' || rule === null) {
    throw new Error('Each rule must be an object');
  }
  if (!rule.action || !['allow', 'deny', 'alert'].includes(rule.action)) {
    throw new Error(`Rule has invalid action: ${rule.action}`);
  }
  if (rule.port !== undefined && (typeof rule.port !== 'number' || rule.port < 1 || rule.port > 65535)) {
    throw new Error(`Rule has invalid port: ${rule.port}`);
  }
  if (rule.protocol !== undefined && !['tcp', 'udp'].includes(rule.protocol)) {
    throw new Error(`Rule has invalid protocol: ${rule.protocol}`);
  }
  return {
    action: rule.action,
    port: rule.port ?? null,
    protocol: rule.protocol ?? null,
    label: rule.label ?? null,
  };
}

/**
 * Check if a binding matches a rule.
 * @param {{ port: number, protocol: string }} binding
 * @param {object} rule
 * @returns {boolean}
 */
function matchesRule(binding, rule) {
  if (rule.port !== null && rule.port !== binding.port) return false;
  if (rule.protocol !== null && rule.protocol !== binding.protocol) return false;
  return true;
}

/**
 * Find the first matching rule for a binding.
 * @param {{ port: number, protocol: string }} binding
 * @param {object[]} rules
 * @returns {object|null}
 */
function findMatchingRule(binding, rules) {
  return rules.find(rule => matchesRule(binding, rule)) ?? null;
}

module.exports = { loadRules, validateRule, matchesRule, findMatchingRule };
