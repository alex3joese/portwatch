const { scanPorts } = require('./scanner');
const { checkBindings } = require('./alerter');

let _intervalHandle = null;

/**
 * Start watching ports on an interval
 * @param {Object} config - loaded portwatch config
 * @param {Function} [onTick] - optional callback called with unexpected bindings each tick
 * @returns {Function} stop function
 */
function startWatcher(config, onTick) {
  if (_intervalHandle) {
    throw new Error('Watcher is already running. Call stopWatcher() first.');
  }

  const interval = (config.intervalSeconds || 30) * 1000;
  const allowedPorts = config.allowedPorts || [];
  const alertConfig = { logPath: config.logPath };

  console.log(
    `[portwatch] Starting watcher — interval: ${config.intervalSeconds || 30}s, allowed ports: ${allowedPorts.join(', ') || 'none'}`
  );

  async function tick() {
    try {
      const bindings = await scanPorts();
      const unexpected = checkBindings(bindings, allowedPorts, alertConfig);
      if (typeof onTick === 'function') {
        onTick(unexpected, bindings);
      }
    } catch (err) {
      console.error('[portwatch] Scan error:', err.message);
    }
  }

  // run immediately then on interval
  tick();
  _intervalHandle = setInterval(tick, interval);

  return stopWatcher;
}

/**
 * Stop the running watcher
 */
function stopWatcher() {
  if (_intervalHandle) {
    clearInterval(_intervalHandle);
    _intervalHandle = null;
    console.log('[portwatch] Watcher stopped.');
  }
}

function isRunning() {
  return _intervalHandle !== null;
}

module.exports = { startWatcher, stopWatcher, isRunning };
