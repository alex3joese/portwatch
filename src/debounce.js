// debounce.js — coalesces rapid bursts of port events into a single callback

'use strict';

/**
 * Creates a debounce buffer that collects items and flushes after
 * a quiet period (no new items for `waitMs`).
 *
 * @param {function} onFlush - called with accumulated items array
 * @param {number} waitMs - quiet-period before flush (default 500ms)
 * @returns {object} debounce handle
 */
function createDebounce(onFlush, waitMs = 500) {
  if (typeof onFlush !== 'function') throw new Error('onFlush must be a function');
  if (typeof waitMs !== 'number' || waitMs < 0) throw new Error('waitMs must be a non-negative number');

  let timer = null;
  let pending = [];

  function push(item) {
    pending.push(item);
    _reschedule();
  }

  function flush() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (pending.length === 0) return;
    const items = pending.slice();
    pending = [];
    onFlush(items);
  }

  function cancel() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    pending = [];
  }

  function size() {
    return pending.length;
  }

  function _reschedule() {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, waitMs);
  }

  return { push, flush, cancel, size };
}

module.exports = { createDebounce };
