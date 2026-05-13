// suppression.js — suppress repeated alerts for known/expected bindings

'use strict';

const fs = require('fs');

function loadSuppressions(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Suppressions must be an array');
    return parsed;
  } catch (err) {
    throw new Error(`Failed to load suppressions from ${filePath}: ${err.message}`);
  }
}

function matchesSuppression(binding, rule) {
  if (rule.port !== undefined && rule.port !== binding.port) return false;
  if (rule.proto !== undefined && rule.proto !== binding.proto) return false;
  if (rule.address !== undefined && rule.address !== binding.address) return false;
  if (rule.process !== undefined && rule.process !== binding.process) return false;
  return true;
}

function isSuppressed(binding, suppressions) {
  if (!Array.isArray(suppressions)) return false;
  return suppressions.some(rule => matchesSuppression(binding, rule));
}

function applySuppression(bindings, suppressions) {
  return bindings.filter(b => !isSuppressed(b, suppressions));
}

module.exports = { loadSuppressions, matchesSuppression, isSuppressed, applySuppression };
