const { isRunning, startWatcher, stopWatcher } = require('./watcher');

const DEFAULT_INTERVAL_MS = 5000;
const MIN_INTERVAL_MS = 1000;
const MAX_INTERVAL_MS = 60000;

let schedulerTimer = null;
let currentInterval = DEFAULT_INTERVAL_MS;
let tickCallback = null;
let tickCount = 0;

function createScheduler(intervalMs, onTick) {
  if (typeof intervalMs !== 'number' || intervalMs < MIN_INTERVAL_MS || intervalMs > MAX_INTERVAL_MS) {
    throw new Error(`Interval must be between ${MIN_INTERVAL_MS} and ${MAX_INTERVAL_MS} ms`);
  }
  if (typeof onTick !== 'function') {
    throw new Error('onTick must be a function');
  }
  currentInterval = intervalMs;
  tickCallback = onTick;
  tickCount = 0;
}

function startScheduler() {
  if (schedulerTimer !== null) return;
  if (!tickCallback) throw new Error('Scheduler not initialized — call createScheduler first');
  schedulerTimer = setInterval(async () => {
    tickCount++;
    try {
      await tickCallback(tickCount);
    } catch (err) {
      console.error(`[scheduler] tick ${tickCount} error:`, err.message);
    }
  }, currentInterval);
}

function stopScheduler() {
  if (schedulerTimer === null) return;
  clearInterval(schedulerTimer);
  schedulerTimer = null;
}

function getTickCount() {
  return tickCount;
}

function isSchedulerRunning() {
  return schedulerTimer !== null;
}

module.exports = { createScheduler, startScheduler, stopScheduler, getTickCount, isSchedulerRunning };
