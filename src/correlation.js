// correlation.js — groups related bindings/alerts into correlated events

const { v4: uuidv4 } = require('crypto');

function _generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function createCorrelation() {
  const groups = new Map();

  function _key(binding) {
    return `${binding.proto}:${binding.port}`;
  }

  function correlate(bindings) {
    const now = Date.now();
    const results = [];

    for (const binding of bindings) {
      const key = _key(binding);
      if (!groups.has(key)) {
        groups.set(key, {
          id: _generateId(),
          firstSeen: now,
          count: 0,
          bindings: []
        });
      }
      const group = groups.get(key);
      group.count += 1;
      group.lastSeen = now;
      group.bindings.push({ ...binding, correlatedAt: now });
      results.push({ ...binding, correlationId: group.id, count: group.count });
    }

    return results;
  }

  function getGroup(correlationId) {
    for (const group of groups.values()) {
      if (group.id === correlationId) return group;
    }
    return null;
  }

  function getAllGroups() {
    return Array.from(groups.values());
  }

  function reset() {
    groups.clear();
  }

  return { correlate, getGroup, getAllGroups, reset };
}

module.exports = { createCorrelation };
