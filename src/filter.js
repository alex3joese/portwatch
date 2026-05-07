/**
 * filter.js — Filter port bindings based on rules (whitelist/blacklist, port ranges, process names)
 */

/**
 * Check if a port number falls within a given range string like "1024-65535"
 * @param {number} port
 * @param {string} range
 * @returns {boolean}
 */
function portInRange(port, range) {
  if (typeof range === 'number') return port === range;
  const [lo, hi] = range.split('-').map(Number);
  if (isNaN(hi)) return port === lo;
  return port >= lo && port <= hi;
}

/**
 * Check if a binding matches a filter rule
 * @param {object} binding - { port, address, process }
 * @param {object} rule - { ports, addresses, processes }
 * @returns {boolean}
 */
function matchesRule(binding, rule) {
  if (rule.ports && rule.ports.length > 0) {
    const portMatch = rule.ports.some(r => portInRange(binding.port, r));
    if (!portMatch) return false;
  }
  if (rule.addresses && rule.addresses.length > 0) {
    if (!rule.addresses.includes(binding.address)) return false;
  }
  if (rule.processes && rule.processes.length > 0) {
    if (!rule.processes.includes(binding.process)) return false;
  }
  return true;
}

/**
 * Apply filter config to a list of bindings
 * @param {object[]} bindings
 * @param {object} filterConfig - { whitelist: rule[], blacklist: rule[] }
 * @returns {{ allowed: object[], blocked: object[] }}
 */
function applyFilters(bindings, filterConfig) {
  const { whitelist = [], blacklist = [] } = filterConfig;
  const allowed = [];
  const blocked = [];

  for (const binding of bindings) {
    const isBlacklisted = blacklist.some(rule => matchesRule(binding, rule));
    if (isBlacklisted) {
      blocked.push({ ...binding, reason: 'blacklist' });
      continue;
    }
    if (whitelist.length > 0) {
      const isWhitelisted = whitelist.some(rule => matchesRule(binding, rule));
      if (!isWhitelisted) {
        blocked.push({ ...binding, reason: 'not-whitelisted' });
        continue;
      }
    }
    allowed.push(binding);
  }

  return { allowed, blocked };
}

module.exports = { portInRange, matchesRule, applyFilters };
