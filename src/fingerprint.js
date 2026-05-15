// fingerprint.js — generate stable identity hashes for port bindings

const crypto = require('crypto');

/**
 * Produce a short stable hash for a single binding.
 * Fields: proto, addr, port, pid (optional)
 */
function hashBinding(binding) {
  const parts = [
    (binding.proto || 'tcp').toLowerCase(),
    binding.addr || '0.0.0.0',
    String(binding.port),
  ];
  if (binding.pid != null) parts.push(String(binding.pid));
  const raw = parts.join('|');
  return crypto.createHash('sha1').update(raw).digest('hex').slice(0, 12);
}

/**
 * Annotate each binding with a `fingerprint` field.
 */
function annotateWithFingerprints(bindings) {
  if (!Array.isArray(bindings)) throw new TypeError('bindings must be an array');
  return bindings.map(b => ({ ...b, fingerprint: hashBinding(b) }));
}

/**
 * Group bindings by fingerprint.
 * Returns a Map<fingerprint, binding>.
 */
function indexByFingerprint(bindings) {
  const map = new Map();
  for (const b of bindings) {
    const fp = b.fingerprint || hashBinding(b);
    map.set(fp, b);
  }
  return map;
}

/**
 * Compare two sets of bindings by fingerprint.
 * Returns { added: [], removed: [], unchanged: [] }
 */
function diffByFingerprint(previous, current) {
  const prevMap = indexByFingerprint(previous);
  const currMap = indexByFingerprint(current);

  const added = [];
  const removed = [];
  const unchanged = [];

  for (const [fp, binding] of currMap) {
    if (prevMap.has(fp)) unchanged.push(binding);
    else added.push(binding);
  }

  for (const [fp, binding] of prevMap) {
    if (!currMap.has(fp)) removed.push(binding);
  }

  return { added, removed, unchanged };
}

module.exports = { hashBinding, annotateWithFingerprints, indexByFingerprint, diffByFingerprint };
