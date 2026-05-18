// window.js — sliding time window for tracking binding events over a rolling interval

'use strict';

function createWindow(options = {}) {
  const duration = options.duration || 60000; // ms
  const entries = [];

  return { push, getAll, count, oldest, newest, trim, clear, _entries: entries };

  function trim() {
    const cutoff = Date.now() - duration;
    while (entries.length > 0 && entries[0].ts < cutoff) {
      entries.shift();
    }
  }

  function push(item, ts = Date.now()) {
    trim();
    entries.push({ item, ts });
  }

  function getAll() {
    trim();
    return entries.map(e => e.item);
  }

  function count() {
    trim();
    return entries.length;
  }

  function oldest() {
    trim();
    return entries.length > 0 ? entries[0].ts : null;
  }

  function newest() {
    trim();
    return entries.length > 0 ? entries[entries.length - 1].ts : null;
  }

  function clear() {
    entries.length = 0;
  }
}

function windowRate(win) {
  const n = win.count();
  if (n < 2) return 0;
  const span = win.newest() - win.oldest();
  if (span === 0) return 0;
  return (n / span) * 1000; // events per second
}

module.exports = { createWindow, windowRate };
