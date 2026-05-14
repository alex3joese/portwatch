const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  createDigest, recordNew, recordRemoved, recordAlert,
  recordSuppressed, formatDigest, writeDigest,
} = require('./digest');

const tmpFile = () => path.join(os.tmpdir(), `digest-test-${Date.now()}.log`);

const fakeBinding = (port = 8080) => ({ proto: 'tcp', address: '0.0.0.0', port, process: 'node' });

test('createDigest returns fresh digest object', () => {
  const d = createDigest();
  expect(d.newBindings).toEqual([]);
  expect(d.removedBindings).toEqual([]);
  expect(d.alertCount).toBe(0);
  expect(d.suppressedCount).toBe(0);
  expect(typeof d.startedAt).toBe('number');
});

test('recordNew appends to newBindings', () => {
  const d = createDigest();
  recordNew(d, fakeBinding(3000));
  expect(d.newBindings).toHaveLength(1);
  expect(d.newBindings[0].port).toBe(3000);
  expect(typeof d.newBindings[0].seenAt).toBe('number');
});

test('recordRemoved appends to removedBindings', () => {
  const d = createDigest();
  recordRemoved(d, fakeBinding(4000));
  expect(d.removedBindings).toHaveLength(1);
  expect(d.removedBindings[0].port).toBe(4000);
});

test('recordAlert increments alertCount', () => {
  const d = createDigest();
  recordAlert(d);
  recordAlert(d);
  expect(d.alertCount).toBe(2);
});

test('recordSuppressed increments suppressedCount', () => {
  const d = createDigest();
  recordSuppressed(d);
  expect(d.suppressedCount).toBe(1);
});

test('formatDigest includes summary stats', () => {
  const d = createDigest();
  recordNew(d, fakeBinding(8080));
  recordAlert(d);
  const out = formatDigest(d);
  expect(out).toContain('new bindings:');
  expect(out).toContain('alerts fired:       1');
  expect(out).toContain('0.0.0.0:8080');
});

test('formatDigest shows removed bindings', () => {
  const d = createDigest();
  recordRemoved(d, fakeBinding(9000));
  const out = formatDigest(d);
  expect(out).toContain('- tcp 0.0.0.0:9000');
});

test('writeDigest appends formatted text to file', () => {
  const f = tmpFile();
  try {
    const d = createDigest();
    recordNew(d, fakeBinding(1234));
    writeDigest(d, f);
    const content = fs.readFileSync(f, 'utf8');
    expect(content).toContain('portwatch digest');
    expect(content).toContain('1234');
  } finally {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
});
