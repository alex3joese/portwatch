const { portInRange, matchesRule, applyFilters } = require('./filter');

describe('portInRange', () => {
  test('exact number match', () => {
    expect(portInRange(80, 80)).toBe(true);
    expect(portInRange(81, 80)).toBe(false);
  });

  test('range string match', () => {
    expect(portInRange(8080, '8000-9000')).toBe(true);
    expect(portInRange(443, '8000-9000')).toBe(false);
  });

  test('single port as string', () => {
    expect(portInRange(22, '22')).toBe(true);
    expect(portInRange(23, '22')).toBe(false);
  });
});

describe('matchesRule', () => {
  const binding = { port: 8080, address: '0.0.0.0', process: 'node' };

  test('empty rule matches anything', () => {
    expect(matchesRule(binding, {})).toBe(true);
  });

  test('port rule matches', () => {
    expect(matchesRule(binding, { ports: ['8000-9000'] })).toBe(true);
    expect(matchesRule(binding, { ports: [22, 443] })).toBe(false);
  });

  test('address rule matches', () => {
    expect(matchesRule(binding, { addresses: ['0.0.0.0'] })).toBe(true);
    expect(matchesRule(binding, { addresses: ['127.0.0.1'] })).toBe(false);
  });

  test('process rule matches', () => {
    expect(matchesRule(binding, { processes: ['node'] })).toBe(true);
    expect(matchesRule(binding, { processes: ['nginx'] })).toBe(false);
  });

  test('combined rules must all match', () => {
    expect(matchesRule(binding, { ports: [8080], processes: ['node'] })).toBe(true);
    expect(matchesRule(binding, { ports: [8080], processes: ['nginx'] })).toBe(false);
  });
});

describe('applyFilters', () => {
  const bindings = [
    { port: 22, address: '0.0.0.0', process: 'sshd' },
    { port: 8080, address: '0.0.0.0', process: 'node' },
    { port: 3306, address: '127.0.0.1', process: 'mysqld' }
  ];

  test('no rules allows everything', () => {
    const { allowed, blocked } = applyFilters(bindings, {});
    expect(allowed).toHaveLength(3);
    expect(blocked).toHaveLength(0);
  });

  test('blacklist blocks matching bindings', () => {
    const { allowed, blocked } = applyFilters(bindings, {
      blacklist: [{ ports: [3306] }]
    });
    expect(allowed).toHaveLength(2);
    expect(blocked).toHaveLength(1);
    expect(blocked[0].reason).toBe('blacklist');
  });

  test('whitelist blocks non-matching bindings', () => {
    const { allowed, blocked } = applyFilters(bindings, {
      whitelist: [{ processes: ['sshd', 'node'] }]
    });
    expect(allowed).toHaveLength(2);
    expect(blocked[0].reason).toBe('not-whitelisted');
  });

  test('blacklist takes priority over whitelist', () => {
    const { blocked } = applyFilters(bindings, {
      whitelist: [{ ports: [22] }],
      blacklist: [{ ports: [22] }]
    });
    expect(blocked.find(b => b.port === 22).reason).toBe('blacklist');
  });
});
