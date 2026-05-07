/**
 * throttle.js
 * Rate-limits alert/notification dispatch to avoid flooding.
 */

const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_MAX_ALERTS = 5;

class Throttle {
  constructor(windowMs = DEFAULT_WINDOW_MS, maxAlerts = DEFAULT_MAX_ALERTS) {
    this.windowMs = windowMs;
    this.maxAlerts = maxAlerts;
    /** @type {Map<string, number[]>} key -> list of timestamps */
    this.history = new Map();
  }

  /**
   * Returns true if the event identified by `key` is allowed through.
   * @param {string} key
   * @returns {boolean}
   */
  allow(key) {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    const timestamps = (this.history.get(key) || []).filter(t => t > cutoff);

    if (timestamps.length >= this.maxAlerts) {
      this.history.set(key, timestamps);
      return false;
    }

    timestamps.push(now);
    this.history.set(key, timestamps);
    return true;
  }

  /**
   * Returns how many events for `key` have fired in the current window.
   * @param {string} key
   * @returns {number}
   */
  count(key) {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    return (this.history.get(key) || []).filter(t => t > cutoff).length;
  }

  /**
   * Clears history for a specific key or all keys.
   * @param {string} [key]
   */
  reset(key) {
    if (key !== undefined) {
      this.history.delete(key);
    } else {
      this.history.clear();
    }
  }
}

function createThrottle(windowMs, maxAlerts) {
  return new Throttle(windowMs, maxAlerts);
}

module.exports = { Throttle, createThrottle };
