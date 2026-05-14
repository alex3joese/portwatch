// digest.js — periodic summary digest of port activity

const fs = require('fs');
const path = require('path');

function createDigest() {
  return {
    startedAt: Date.now(),
    newBindings: [],
    removedBindings: [],
    alertCount: 0,
    suppressedCount: 0,
  };
}

function recordNew(digest, binding) {
  digest.newBindings.push({ ...binding, seenAt: Date.now() });
}

function recordRemoved(digest, binding) {
  digest.removedBindings.push({ ...binding, removedAt: Date.now() });
}

function recordAlert(digest) {
  digest.alertCount += 1;
}

function recordSuppressed(digest) {
  digest.suppressedCount += 1;
}

function formatDigest(digest) {
  const elapsed = Math.round((Date.now() - digest.startedAt) / 1000);
  const lines = [
    `=== portwatch digest (${elapsed}s window) ===`,
    `  new bindings:       ${digest.newBindings.length}`,
    `  removed bindings:   ${digest.removedBindings.length}`,
    `  alerts fired:       ${digest.alertCount}`,
    `  suppressed:         ${digest.suppressedCount}`,
  ];
  if (digest.newBindings.length > 0) {
    lines.push('  new:');
    for (const b of digest.newBindings) {
      lines.push(`    + ${b.proto} ${b.address}:${b.port} (${b.process || 'unknown'})`);
    }
  }
  if (digest.removedBindings.length > 0) {
    lines.push('  removed:');
    for (const b of digest.removedBindings) {
      lines.push(`    - ${b.proto} ${b.address}:${b.port} (${b.process || 'unknown'})`);
    }
  }
  lines.push('==========================================');
  return lines.join('\n');
}

function writeDigest(digest, filePath) {
  const text = formatDigest(digest) + '\n';
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, text, 'utf8');
}

module.exports = { createDigest, recordNew, recordRemoved, recordAlert, recordSuppressed, formatDigest, writeDigest };
