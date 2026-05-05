/**
 * scanner.js — reads active port bindings from the OS
 */

'use strict';

const { execFile } = require('child_process');
const os = require('os');

/**
 * Parse `ss -tlnp` output into structured records.
 * @param {string} raw
 * @returns {Array<{port: number, address: string, pid: number|null, process: string|null}>}
 */
function parseSsOutput(raw) {
  const lines = raw.trim().split('\n').slice(1); // drop header
  const results = [];

  for (const line of lines) {
    const cols = line.trim().split(/\s+/);
    if (cols.length < 5) continue;

    const localAddr = cols[3];
    const lastColon = localAddr.lastIndexOf(':');
    const port = parseInt(localAddr.slice(lastColon + 1), 10);
    const address = localAddr.slice(0, lastColon);

    // users:("sshd",pid=1234,fd=3))
    const usersCol = cols[6] || '';
    const pidMatch = usersCol.match(/pid=(\d+)/);
    const procMatch = usersCol.match(/\("([^"]+)"/);

    results.push({
      port,
      address,
      pid: pidMatch ? parseInt(pidMatch[1], 10) : null,
      process: procMatch ? procMatch[1] : null,
    });
  }

  return results;
}

/**
 * Scan currently bound TCP ports.
 * @returns {Promise<Array>}
 */
function scanPorts() {
  return new Promise((resolve, reject) => {
    if (os.platform() === 'win32') {
      return reject(new Error('Windows is not supported yet'));
    }

    execFile('ss', ['-tlnp'], (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`ss failed: ${stderr || err.message}`));
      }
      resolve(parseSsOutput(stdout));
    });
  });
}

module.exports = { scanPorts, parseSsOutput };
