const path = require('path');

const DEFAULTS = {
  enabled: true,
  logPath: path.join(process.cwd(), 'audit.log'),
  maxEntries: 10000,
  events: ['new_binding', 'removed_binding', 'suppressed', 'alert_sent']
};

function validateAuditConfig(config) {
  const errors = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('audit.enabled must be a boolean');
  }
  if (typeof config.logPath !== 'string' || !config.logPath) {
    errors.push('audit.logPath must be a non-empty string');
  }
  if (typeof config.maxEntries !== 'number' || config.maxEntries < 1) {
    errors.push('audit.maxEntries must be a positive number');
  }
  if (!Array.isArray(config.events)) {
    errors.push('audit.events must be an array');
  }

  return errors;
}

function resolveAuditConfig(userConfig = {}) {
  const merged = { ...DEFAULTS, ...userConfig };
  const errors = validateAuditConfig(merged);
  if (errors.length > 0) {
    throw new Error('Invalid audit config:\n' + errors.join('\n'));
  }
  return merged;
}

module.exports = { validateAuditConfig, resolveAuditConfig, DEFAULTS };
