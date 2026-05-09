// aggregator.js — groups and counts alert events over a rolling window

'use strict';

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_GROUPS = 200;

function createAggregator({ windowMs = DEFAULT_WINDOW_MS, maxGroups = DEFAULT_MAX_GROUPS } = {}) {
  const groups = new Map();

  function _key(binding) {
    return `${binding.proto}:${binding.port}:${binding.address}`;
  }

  function _evictExpired() {
    const cutoff = Date.now() - windowMs;
    for (const [k, v] of groups) {
      if (v.lastSeen < cutoff) groups.delete(k);
    }
  }

  function record(binding) {
    _evictExpired();
    if (groups.size >= maxGroups && !groups.has(_key(binding))) {
      return null;
    }
    const key = _key(binding);
    const now = Date.now();
    if (!groups.has(key)) {
      groups.set(key, { binding, count: 0, firstSeen: now, lastSeen: now });
    }
    const entry = groups.get(key);
    entry.count += 1;
    entry.lastSeen = now;
    return entry;
  }

  function getAll() {
    _evictExpired();
    return Array.from(groups.values());
  }

  function reset() {
    groups.clear();
  }

  function size() {
    return groups.size;
  }

  return { record, getAll, reset, size };
}

function summarize(aggregator) {
  return aggregator.getAll().map(({ binding, count, firstSeen, lastSeen }) => ({
    proto: binding.proto,
    port: binding.port,
    address: binding.address,
    count,
    firstSeen: new Date(firstSeen).toISOString(),
    lastSeen: new Date(lastSeen).toISOString(),
  }));
}

module.exports = { createAggregator, summarize };
