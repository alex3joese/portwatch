// integration: correlation working with pipeline-style binding flow
const { createCorrelation } = require('./correlation');
const { resolveCorrelationConfig } = require('./correlation.config');

describe('correlation integration', () => {
  test('full flow: config -> correlate -> inspect groups', () => {
    const cfg = resolveCorrelationConfig({ maxGroupSize: 10 });
    expect(cfg.enabled).toBe(true);

    const corr = createCorrelation();

    const wave1 = [
      { proto: 'tcp', port: 8080, addr: '0.0.0.0', pid: 1001 },
      { proto: 'tcp', port: 443,  addr: '0.0.0.0', pid: 1002 }
    ];
    const wave2 = [
      { proto: 'tcp', port: 8080, addr: '0.0.0.0', pid: 1001 },
      { proto: 'udp', port: 5353, addr: '0.0.0.0', pid: 1003 }
    ];

    const r1 = corr.correlate(wave1);
    const r2 = corr.correlate(wave2);

    // 8080 should share correlationId across waves
    const id8080_w1 = r1.find(b => b.port === 8080).correlationId;
    const id8080_w2 = r2.find(b => b.port === 8080).correlationId;
    expect(id8080_w1).toBe(id8080_w2);

    // three distinct groups: 8080, 443, 5353
    const groups = corr.getAllGroups();
    expect(groups.length).toBe(3);

    // 8080 group should have count 2
    const group8080 = corr.getGroup(id8080_w1);
    expect(group8080.count).toBe(2);
  });

  test('reset between scans produces fresh ids', () => {
    const corr = createCorrelation();
    const r1 = corr.correlate([{ proto: 'tcp', port: 9999 }]);
    corr.reset();
    const r2 = corr.correlate([{ proto: 'tcp', port: 9999 }]);
    // after reset, new group = new id
    expect(r1[0].correlationId).not.toBe(r2[0].correlationId);
  });
});
