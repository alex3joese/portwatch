const { createCorrelation } = require('./correlation');

describe('createCorrelation', () => {
  let corr;

  beforeEach(() => {
    corr = createCorrelation();
  });

  test('assigns correlationId to each binding', () => {
    const result = corr.correlate([{ proto: 'tcp', port: 8080, addr: '0.0.0.0' }]);
    expect(result[0]).toHaveProperty('correlationId');
    expect(typeof result[0].correlationId).toBe('string');
  });

  test('same proto+port gets same correlationId', () => {
    const r1 = corr.correlate([{ proto: 'tcp', port: 9000, addr: '127.0.0.1' }]);
    const r2 = corr.correlate([{ proto: 'tcp', port: 9000, addr: '127.0.0.1' }]);
    expect(r1[0].correlationId).toBe(r2[0].correlationId);
  });

  test('different ports get different correlationIds', () => {
    const result = corr.correlate([
      { proto: 'tcp', port: 8080 },
      { proto: 'tcp', port: 9090 }
    ]);
    expect(result[0].correlationId).not.toBe(result[1].correlationId);
  });

  test('count increments on repeated sightings', () => {
    corr.correlate([{ proto: 'tcp', port: 3000 }]);
    const result = corr.correlate([{ proto: 'tcp', port: 3000 }]);
    expect(result[0].count).toBe(2);
  });

  test('getGroup returns correct group by id', () => {
    const result = corr.correlate([{ proto: 'udp', port: 5353 }]);
    const group = corr.getGroup(result[0].correlationId);
    expect(group).not.toBeNull();
    expect(group.count).toBe(1);
  });

  test('getGroup returns null for unknown id', () => {
    expect(corr.getGroup('nonexistent')).toBeNull();
  });

  test('getAllGroups returns all tracked groups', () => {
    corr.correlate([{ proto: 'tcp', port: 80 }, { proto: 'tcp', port: 443 }]);
    expect(corr.getAllGroups().length).toBe(2);
  });

  test('reset clears all groups', () => {
    corr.correlate([{ proto: 'tcp', port: 8080 }]);
    corr.reset();
    expect(corr.getAllGroups().length).toBe(0);
  });
});
