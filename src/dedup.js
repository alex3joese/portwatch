/**
 * dedup.js — Deduplication of alerts to avoid repeated notifications
 * for the same port binding within a time window.
 */

'use strict';

const DEFAULT_TTL_MS = 60 * 1000; // 1 minute

/**
 * Creates a deduplicator instance with an internal seen-key store.
 * @param {object} options
 * @param {number} [options.ttl] - Time-to-live in ms for each seen entry
 * @returns {object}
 */
function createDedup(options = {}) {
  const ttl = options.ttl ?? DEFAULT_TTL_MS;
  const seen = new Map();

  return { isDuplicate, markSeen, clear, size };

  function _key(binding) {
    return `${binding.proto}:${binding.address}:${binding.port}`;
  }

  function _evict() {
    const now = Date.now();
    for (const [key, expiresAt] of seen.entries()) {
      if (now >= expiresAt) {
        seen.delete(key);
      }
    }
  }

  /**
   * Returns true if this binding was recently seen.
   * @param {object} binding
   * @returns {boolean}
   */
  function isDuplicate(binding) {
    _evict();
    const key = _key(binding);
    return seen.has(key);
  }

  /**
   * Marks a binding as seen for the configured TTL.
   * @param {object} binding
   */
  function markSeen(binding) {
    const key = _key(binding);
    seen.set(key, Date.now() + ttl);
  }

  /**
   * Clears all tracked entries.
   */
  function clear() {
    seen.clear();
  }

  /**
   * Returns the number of currently tracked (non-evicted) entries.
   * @returns {number}
   */
  function size() {
    _evict();
    return seen.size;
  }
}

module.exports = { createDedup, DEFAULT_TTL_MS };
