const fs = require('fs');
const path = require('path');

/**
 * Format an alert message for an unexpected port binding
 * @param {Object} binding - port binding info
 * @returns {string}
 */
function formatAlert(binding) {
  const { port, process: proc, address } = binding;
  const ts = new Date().toISOString();
  return `[${ts}] ALERT: Unexpected binding on ${address}:${port} by process "${proc}"`;
}

/**
 * Write an alert to the log file
 * @param {string} message
 * @param {string} logPath
 */
function writeAlertToLog(message, logPath) {
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.appendFileSync(logPath, message + '\n', 'utf8');
}

/**
 * Send alert to stdout and optionally to a log file
 * @param {Object} binding - unexpected port binding
 * @param {Object} config - alerter config
 */
function sendAlert(binding, config = {}) {
  const message = formatAlert(binding);
  console.warn(message);

  if (config.logPath) {
    writeAlertToLog(message, config.logPath);
  }

  return message;
}

/**
 * Compare current bindings against allowed list and fire alerts
 * @param {Object[]} currentBindings
 * @param {number[]} allowedPorts
 * @param {Object} config
 * @returns {Object[]} unexpected bindings
 */
function checkBindings(currentBindings, allowedPorts, config = {}) {
  const unexpected = currentBindings.filter(
    (b) => !allowedPorts.includes(b.port)
  );

  for (const binding of unexpected) {
    sendAlert(binding, config);
  }

  return unexpected;
}

module.exports = { formatAlert, writeAlertToLog, sendAlert, checkBindings };
