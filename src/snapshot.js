const { scanPorts } = require('./scanner');
const { loadBaseline, saveBaseline, diffBindings } = require('./baseline');

/**
 * Capture a fresh snapshot of current port bindings.
 * Returns a map of port => { pid, process, proto }.
 */
async function captureSnapshot() {
  const ports = await scanPorts();
  const bindings = {};
  for (const entry of ports) {
    bindings[entry.port] = {
      pid: entry.pid,
      process: entry.process,
      proto: entry.proto,
    };
  }
  return bindings;
}

/**
 * Compare the current system state against the saved baseline.
 * @param {string} baselinePath
 * @returns {{ added: Array, removed: Array, current: Object }}
 */
async function compareWithBaseline(baselinePath) {
  const [baseline, current] = await Promise.all([
    Promise.resolve(loadBaseline(baselinePath)),
    captureSnapshot(),
  ]);
  const { added, removed } = diffBindings(baseline, current);
  return { added, removed, current };
}

/**
 * Update the baseline file with the current system snapshot.
 * @param {string} baselinePath
 * @returns {Object} the bindings that were saved
 */
async function updateBaseline(baselinePath) {
  const current = await captureSnapshot();
  saveBaseline(baselinePath, current);
  return current;
}

module.exports = { captureSnapshot, compareWithBaseline, updateBaseline };
