const fs = require('fs');
const path = require('path');

/**
 * Generates a summary report of port activity over a time window.
 * @param {Array} alertHistory - Array of alert objects with timestamp, port, pid, process fields
 * @param {Object} options - Report options
 * @returns {Object} report object
 */
function generateReport(alertHistory, options = {}) {
  const { since = null, format = 'text' } = options;

  const filtered = since
    ? alertHistory.filter((a) => new Date(a.timestamp) >= new Date(since))
    : alertHistory;

  const portCounts = {};
  const processCounts = {};

  for (const alert of filtered) {
    portCounts[alert.port] = (portCounts[alert.port] || 0) + 1;
    if (alert.process) {
      processCounts[alert.process] = (processCounts[alert.process] || 0) + 1;
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalAlerts: filtered.length,
    uniquePorts: Object.keys(portCounts).length,
    topPorts: Object.entries(portCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([port, count]) => ({ port: Number(port), count })),
    topProcesses: Object.entries(processCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([process, count]) => ({ process, count })),
  };

  return report;
}

/**
 * Formats a report object as a human-readable text string.
 * @param {Object} report
 * @returns {string}
 */
function formatReport(report) {
  const lines = [
    `portwatch report — generated ${report.generatedAt}`,
    `total alerts: ${report.totalAlerts}`,
    `unique ports seen: ${report.uniquePorts}`,
    '',
    'top ports:',
    ...report.topPorts.map((e) => `  :${e.port}  (${e.count} alert${e.count !== 1 ? 's' : ''})`),
    '',
    'top processes:',
    ...report.topProcesses.map((e) => `  ${e.process}  (${e.count} alert${e.count !== 1 ? 's' : ''})`),
  ];
  return lines.join('\n');
}

/**
 * Writes a formatted report to a file.
 * @param {string} filePath
 * @param {Object} report
 */
function writeReport(filePath, report) {
  const content = formatReport(report);
  fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = { generateReport, formatReport, writeReport };
