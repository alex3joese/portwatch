// tags.config.js — validate and resolve tags configuration

const DEFAULT_CONFIG = {
  enabled: true,
  rules: []
};

function validateTagRule(rule, idx) {
  if (typeof rule !== 'object' || rule === null) {
    throw new Error(`tags rule[${idx}] must be an object`);
  }
  if (!Array.isArray(rule.tags) || rule.tags.length === 0) {
    throw new Error(`tags rule[${idx}] must have a non-empty tags array`);
  }
  for (const tag of rule.tags) {
    if (typeof tag !== 'string' || !tag.trim()) {
      throw new Error(`tags rule[${idx}] tag must be a non-empty string`);
    }
  }
  const match = rule.match || {};
  if (match.port !== undefined && typeof match.port !== 'number') {
    throw new Error(`tags rule[${idx}].match.port must be a number`);
  }
  if (match.proto !== undefined && !['tcp', 'udp'].includes(match.proto)) {
    throw new Error(`tags rule[${idx}].match.proto must be 'tcp' or 'udp'`);
  }
}

function validateTagsConfig(config) {
  if (typeof config !== 'object' || config === null) {
    throw new Error('tags config must be an object');
  }
  if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
    throw new Error('tags config.enabled must be a boolean');
  }
  if (config.rules !== undefined) {
    if (!Array.isArray(config.rules)) throw new Error('tags config.rules must be an array');
    config.rules.forEach(validateTagRule);
  }
}

function resolveTagsConfig(partial = {}) {
  validateTagsConfig(partial);
  return { ...DEFAULT_CONFIG, ...partial };
}

module.exports = { validateTagRule, validateTagsConfig, resolveTagsConfig };
