const { execSync } = require('child_process');

/**
 * Parse output of `ss -tlnp` or `lsof -i` to extract process info per port
 * Returns map of port -> { pid, name, user }
 */
function parseProcessInfo(raw) {
  const result = {};
  const lines = raw.trim().split('\n').slice(1);
  for (const line of lines) {
    const match = line.match(/:([\d]+)\s+.*users:\(\("([^"]+)",pid=(\d+)/);
    if (match) {
      const port = parseInt(match[1], 10);
      result[port] = {
        port,
        name: match[2],
        pid: parseInt(match[3], 10),
      };
    }
  }
  return result;
}

/**
 * Lookup process owning a given port using ss.
 * Returns { port, pid, name } or null.
 */
function lookupProcess(port) {
  try {
    const raw = execSync(`ss -tlnp sport = :${port}`, { encoding: 'utf8' });
    const info = parseProcessInfo(raw);
    return info[port] || null;
  } catch {
    return null;
  }
}

/**
 * Enrich an array of port bindings with process info.
 * Each binding: { port, address, protocol }
 * Returns bindings with added { pid, processName } fields.
 */
function enrichWithProcessInfo(bindings) {
  return bindings.map((binding) => {
    const info = lookupProcess(binding.port);
    return {
      ...binding,
      pid: info ? info.pid : null,
      processName: info ? info.name : null,
    };
  });
}

module.exports = { parseProcessInfo, lookupProcess, enrichWithProcessInfo };
