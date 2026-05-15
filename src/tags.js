// tags.js — assign and manage freeform tags on port bindings

const DEFAULT_TAGS = [];

/**
 * Parse a raw tag string like "web,internal" into an array.
 */
function parseTags(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw.split(',').map(t => t.trim()).filter(Boolean);
}

/**
 * Return tags assigned to a binding based on tag rules.
 * Each rule: { match: { port?, proto?, address? }, tags: string[] }
 */
function resolveTags(binding, rules = []) {
  const assigned = new Set();
  for (const rule of rules) {
    if (_matchesTagRule(binding, rule.match)) {
      for (const tag of (rule.tags || [])) assigned.add(tag);
    }
  }
  return Array.from(assigned);
}

function _matchesTagRule(binding, match = {}) {
  if (match.port !== undefined && binding.port !== match.port) return false;
  if (match.proto !== undefined && binding.proto !== match.proto) return false;
  if (match.address !== undefined && binding.address !== match.address) return false;
  return true;
}

/**
 * Annotate an array of bindings with a `tags` field.
 */
function annotateWithTags(bindings, rules = []) {
  return bindings.map(b => ({
    ...b,
    tags: resolveTags(b, rules)
  }));
}

/**
 * Filter bindings that include ALL of the specified tags.
 */
function filterByTags(bindings, tags = []) {
  if (!tags.length) return bindings;
  return bindings.filter(b => {
    const bTags = b.tags || [];
    return tags.every(t => bTags.includes(t));
  });
}

/**
 * Strip tag annotations from bindings.
 */
function stripTags(bindings) {
  return bindings.map(({ tags: _t, ...rest }) => rest);
}

module.exports = { parseTags, resolveTags, annotateWithTags, filterByTags, stripTags };
