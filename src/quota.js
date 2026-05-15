// quota.js — per-port or per-process binding quota enforcement
'use strict';

const { resolveQuotaConfig } = require('./quota.config');

function createQuota(config = {}) {
  const cfg = resolveQuotaConfig(config);
  const counts = new Map();

  function _key(binding) {
    if (cfg.groupBy === 'process') return binding.process || 'unknown';
    if (cfg.groupBy === 'user') return binding.user || 'unknown';
    return String(binding.port);
  }

  function reset() {
    counts.clear();
  }

  function record(bindings) {
    for (const b of bindings) {
      const k = _key(b);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
  }

  function isOverQuota(binding) {
    const k = _key(binding);
    return (counts.get(k) || 0) > cfg.maxBindings;
  }

  function getViolations(bindings) {
    return bindings.filter(b => isOverQuota(b)).map(b => ({
      binding: b,
      key: _key(b),
      count: counts.get(_key(b)) || 0,
      limit: cfg.maxBindings
    }));
  }

  function applyQuota(bindings) {
    record(bindings);
    return {
      bindings,
      violations: getViolations(bindings)
    };
  }

  return { reset, record, isOverQuota, getViolations, applyQuota, _key };
}

module.exports = { createQuota };
