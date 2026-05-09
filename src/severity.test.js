const { getSeverity, annotateBindings, filterBySeverity, DEFAULT_RULES, LEVELS } = require('./severity');

describe('getSeverity', () => {
  test('port 80 is critical (well-known)', () => {
    expect(getSeverity(80)).toBe('critical');
  });

  test('port 8080 is warn (registered)', () => {
    expect(getSeverity(8080)).toBe('warn');
  });

  test('port 55000 is info (ephemeral)', () => {
    expect(getSeverity(55000)).toBe('info');
  });

  test('throws on port 0', () => {
    expect(() => getSeverity(0)).toThrow('Invalid port');
  });

  test('throws on port 70000', () => {
    expect(() => getSeverity(70000)).toThrow('Invalid port');
  });

  test('custom rules override defaults', () => {
    const rules = [{ portRange: [1, 65535], level: 'critical' }];
    expect(getSeverity(9999, rules)).toBe('critical');
  });
});

describe('annotateBindings', () => {
  test('adds severity field to each binding', () => {
    const bindings = [{ port: 22, proto: 'tcp' }, { port: 3000, proto: 'tcp' }];
    const result = annotateBindings(bindings);
    expect(result[0]).toMatchObject({ port: 22, severity: 'critical' });
    expect(result[1]).toMatchObject({ port: 3000, severity: 'warn' });
  });

  test('does not mutate original bindings', () => {
    const bindings = [{ port: 80 }];
    annotateBindings(bindings);
    expect(bindings[0].severity).toBeUndefined();
  });
});

describe('filterBySeverity', () => {
  const bindings = [
    { port: 80, severity: 'critical' },
    { port: 3000, severity: 'warn' },
    { port: 55000, severity: 'info' }
  ];

  test('minLevel info returns all', () => {
    expect(filterBySeverity(bindings, 'info')).toHaveLength(3);
  });

  test('minLevel warn returns critical and warn', () => {
    const result = filterBySeverity(bindings, 'warn');
    expect(result).toHaveLength(2);
    expect(result.map(b => b.severity)).not.toContain('info');
  });

  test('minLevel critical returns only critical', () => {
    const result = filterBySeverity(bindings, 'critical');
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(80);
  });

  test('throws on unknown level', () => {
    expect(() => filterBySeverity(bindings, 'ultra')).toThrow('Unknown severity level');
  });
});
