// ratelimit.js — per-key rate limiting for alert/notification bursts

'use strict';

function createRateLimit(config = {}) {
  const { windowMs = 60000, maxEvents = 5 } = config;
  const buckets = new Map();

  function _evict(key, now) {
    const events = buckets.get(key) || [];
    const fresh = events.filter(ts => now - ts < windowMs);
    if (fresh.length === 0) {
      buckets.delete(key);
    } else {
      buckets.set(key, fresh);
    }
    return fresh;
  }

  function isAllowed(key) {
    const now = Date.now();
    const events = _evict(key, now);
    return events.length < maxEvents;
  }

  function record(key) {
    const now = Date.now();
    const events = _evict(key, now);
    events.push(now);
    buckets.set(key, events);
  }

  function tryConsume(key) {
    if (!isAllowed(key)) return false;
    record(key);
    return true;
  }

  function getCount(key) {
    const now = Date.now();
    return _evict(key, now).length;
  }

  function reset(key) {
    if (key !== undefined) {
      buckets.delete(key);
    } else {
      buckets.clear();
    }
  }

  return { isAllowed, record, tryConsume, getCount, reset, _buckets: buckets };
}

module.exports = { createRateLimit };
