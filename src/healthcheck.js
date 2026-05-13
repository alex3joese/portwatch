// healthcheck.js — reports overall daemon health based on subsystem status

const { isRunning } = require('./watcher');
const { isSchedulerRunning } = require('./scheduler');
const { getMissedTicks } = require('./watchdog');
const { getCounter, getGauge } = require('./metrics');

const STATUS_OK = 'ok';
const STATUS_DEGRADED = 'degraded';
const STATUS_DOWN = 'down';

function checkWatcher() {
  return isRunning() ? STATUS_OK : STATUS_DOWN;
}

function checkScheduler() {
  return isSchedulerRunning() ? STATUS_OK : STATUS_DOWN;
}

function checkWatchdog(maxMissed = 3) {
  const missed = getMissedTicks();
  if (missed === 0) return STATUS_OK;
  if (missed <= maxMissed) return STATUS_DEGRADED;
  return STATUS_DOWN;
}

function checkMetrics() {
  const errors = getCounter('errors') || 0;
  const scanRate = getGauge('scan_rate') || 0;
  if (errors > 100) return STATUS_DEGRADED;
  if (scanRate === 0) return STATUS_DEGRADED;
  return STATUS_OK;
}

function getOverallStatus(checks) {
  const values = Object.values(checks);
  if (values.includes(STATUS_DOWN)) return STATUS_DOWN;
  if (values.includes(STATUS_DEGRADED)) return STATUS_DEGRADED;
  return STATUS_OK;
}

function runHealthCheck(options = {}) {
  const checks = {
    watcher: checkWatcher(),
    scheduler: checkScheduler(),
    watchdog: checkWatchdog(options.maxMissedTicks),
    metrics: checkMetrics(),
  };

  const status = getOverallStatus(checks);
  const timestamp = new Date().toISOString();

  return { status, checks, timestamp };
}

module.exports = {
  STATUS_OK,
  STATUS_DEGRADED,
  STATUS_DOWN,
  checkWatcher,
  checkScheduler,
  checkWatchdog,
  checkMetrics,
  getOverallStatus,
  runHealthCheck,
};
