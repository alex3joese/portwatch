// Severity levels for port binding alerts

const LEVELS = ['info', 'warn', 'critical'];

const DEFAULT_RULES = [
  { portRange: [1, 1023], level: 'critical' },
  { portRange: [1024, 49151], level: 'warn' },
  { portRange: [49152, 65535], level: 'info' }
];

/**
 * Determine severity level for a given port number.
 * @param {number} port
 * @param {Array} rules - ordered list of {portRange, level} objects
 * @returns {string} severity level
 */
function getSeverity(port, rules = DEFAULT_RULES) {
  if (typeof port !== 'number' || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${port}`);
  }
  for (const rule of rules) {
    const [min, max] = rule.portRange;
    if (port >= min && port <= max) {
      return rule.level;
    }
  }
  return 'info';
}

/**
 * Annotate an array of binding objects with a severity field.
 * @param {Array<{port: number}>} bindings
 * @param {Array} rules
 * @returns {Array}
 */
function annotateBindings(bindings, rules = DEFAULT_RULES) {
  return bindings.map(b => ({
    ...b,
    severity: getSeverity(b.port, rules)
  }));
}

/**
 * Filter bindings at or above a minimum severity level.
 * @param {Array} bindings - already annotated with severity
 * @param {string} minLevel
 * @returns {Array}
 */
function filterBySeverity(bindings, minLevel = 'info') {
  const minIdx = LEVELS.indexOf(minLevel);
  if (minIdx === -1) throw new Error(`Unknown severity level: ${minLevel}`);
  return bindings.filter(b => LEVELS.indexOf(b.severity) >= minIdx);
}

module.exports = { LEVELS, DEFAULT_RULES, getSeverity, annotateBindings, filterBySeverity };
