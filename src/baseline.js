const fs = require('fs');
const path = require('path');

/**
 * Load the saved baseline snapshot of known port bindings.
 * Returns an empty object if no baseline exists yet.
 */
function loadBaseline(baselinePath) {
  if (!baselinePath) {
    throw new Error('baselinePath is required');
  }
  if (!fs.existsSync(baselinePath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(baselinePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse baseline file at ${baselinePath}: ${err.message}`);
  }
}

/**
 * Save the current port bindings as the new baseline.
 * @param {string} baselinePath - file path to write to
 * @param {Object} bindings - map of port => { pid, process, proto }
 */
function saveBaseline(baselinePath, bindings) {
  if (!baselinePath) {
    throw new Error('baselinePath is required');
  }
  const dir = path.dirname(baselinePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(baselinePath, JSON.stringify(bindings, null, 2), 'utf8');
}

/**
 * Compare current bindings against the baseline.
 * Returns { added, removed } arrays of port entries.
 */
function diffBindings(baseline, current) {
  const added = [];
  const removed = [];

  for (const port of Object.keys(current)) {
    if (!baseline[port]) {
      added.push({ port, ...current[port] });
    }
  }

  for (const port of Object.keys(baseline)) {
    if (!current[port]) {
      removed.push({ port, ...baseline[port] });
    }
  }

  return { added, removed };
}

module.exports = { loadBaseline, saveBaseline, diffBindings };
