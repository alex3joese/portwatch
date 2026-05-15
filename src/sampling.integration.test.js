// sampling.integration.test.js — sampling + config working together

'use strict';

const { applySampling } = require('./sampling');
const { resolveSamplingConfig } = require('./sampling.config');

function makeBindings(n) {
  return Array.from({ length: n }, (_, i) => ({ port: 1024 + i, proto: 'tcp' }));
}

describe('sampling integration', () => {
  test('rate=1.0 passes all bindings through', () => {
    const cfg = resolveSamplingConfig({ mode: 'rate', rate: 1.0 });
    const bindings = makeBindings(20);
    expect(applySampling(bindings, cfg)).toHaveLength(20);
  });

  test('rate=0.0 drops all bindings', () => {
    const cfg = resolveSamplingConfig({ mode: 'rate', rate: 0.0 });
    const bindings = makeBindings(20);
    expect(applySampling(bindings, cfg)).toHaveLength(0);
  });

  test('interval every=4 keeps every 4th', () => {
    const cfg = resolveSamplingConfig({ mode: 'interval', every: 4 });
    const bindings = makeBindings(20);
    const result = applySampling(bindings, cfg);
    expect(result).toHaveLength(5);
    result.forEach((b, i) => {
      expect(b.port).toBe(1024 + (i + 1) * 4 - 1);
    });
  });

  test('invalid config throws before sampling', () => {
    expect(() => resolveSamplingConfig({ mode: 'interval', every: 0 })).toThrow();
  });

  test('default config is a no-op', () => {
    const cfg = resolveSamplingConfig({});
    const bindings = makeBindings(10);
    expect(applySampling(bindings, cfg)).toHaveLength(10);
  });
});
