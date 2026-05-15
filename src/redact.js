// redact.js — strips or masks sensitive fields from bindings before logging/export

const DEFAULT_SENSITIVE_FIELDS = ['password', 'secret', 'token', 'key', 'auth'];

/**
 * Check if a field name looks sensitive
 * @param {string} field
 * @param {string[]} sensitiveFields
 * @returns {boolean}
 */
function isSensitiveField(field, sensitiveFields = DEFAULT_SENSITIVE_FIELDS) {
  const lower = field.toLowerCase();
  return sensitiveFields.some(s => lower.includes(s));
}

/**
 * Redact a single object by masking sensitive fields
 * @param {object} obj
 * @param {object} options
 * @returns {object}
 */
function redactObject(obj, options = {}) {
  const { sensitiveFields = DEFAULT_SENSITIVE_FIELDS, mask = '[REDACTED]' } = options;
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveField(key, sensitiveFields)) {
      result[key] = mask;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = redactObject(value, options);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Redact an array of binding objects
 * @param {object[]} bindings
 * @param {object} options
 * @returns {object[]}
 */
function redactBindings(bindings, options = {}) {
  if (!Array.isArray(bindings)) return [];
  return bindings.map(b => redactObject(b, options));
}

/**
 * Redact a log line string by replacing key=value patterns for sensitive keys
 * @param {string} line
 * @param {object} options
 * @returns {string}
 */
function redactLogLine(line, options = {}) {
  const { sensitiveFields = DEFAULT_SENSITIVE_FIELDS, mask = '[REDACTED]' } = options;
  let result = line;
  for (const field of sensitiveFields) {
    const re = new RegExp(`(${field}\\s*=\\s*)([^\\s,}]+)`, 'gi');
    result = result.replace(re, `$1${mask}`);
  }
  return result;
}

module.exports = { isSensitiveField, redactObject, redactBindings, redactLogLine };
