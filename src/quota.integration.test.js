'use strict';

const { createQuota } = require('./quota');
const { resolveQuotaConfig } = require('./quota.config');
const { applyFilters } = require('./filter');

describe('quota integration', () => {
  const bindings = [
    { port: 8080, process: 'node', user: 'dev' },
    { port: 8080, process: 'node', user: 'dev' },
    { port: 8081, process: 'python', user: 'dev' },
    { port: 9000, process: 'nginx', user: 'root' }
  ];

  test('end-to-end: detects over-quota ports', () => {
    const quota = createQuota({ maxBindings: 1, groupBy: 'port' });
    const { violations } = quota.applyQuota(bindings);
    const violatingPorts = violations.map(v => v.key);
    expect(violatingPorts).toContain('8080');
    expect(violatingPorts).not.toContain('8081');
    expect(violatingPorts).not.toContain('9000');
  });

  test('end-to-end: process grouping catches multi-port abuse', () => {
    const quota = createQuota({ maxBindings: 1, groupBy: 'process' });
    const { violations } = quota.applyQuota(bindings);
    const keys = violations.map(v => v.key);
    expect(keys).toContain('node');
    expect(keys).not.toContain('nginx');
  });

  test('config defaults integrate cleanly', () => {
    const cfg = resolveQuotaConfig({});
    const quota = createQuota(cfg);
    const { violations } = quota.applyQuota(bindings);
    // default maxBindings=5, none should violate
    expect(violations).toHaveLength(0);
  });
});
