/**
 * Integration test: filter config resolution feeding into applyFilters
 */
const { resolveFilterConfig } = require('./filter.config');
const { applyFilters } = require('./filter');

const sampleBindings = [
  { port: 22,   address: '0.0.0.0',   process: 'sshd'   },
  { port: 80,   address: '0.0.0.0',   process: 'nginx'  },
  { port: 3000, address: '127.0.0.1', process: 'node'   },
  { port: 6667, address: '0.0.0.0',   process: 'ircd'   },
  { port: 3306, address: '127.0.0.1', process: 'mysqld' }
];

test('whitelist only known services', () => {
  const config = resolveFilterConfig({
    whitelist: [
      { processes: ['sshd', 'nginx', 'node', 'mysqld'] }
    ]
  });
  const { allowed, blocked } = applyFilters(sampleBindings, config);
  expect(allowed).toHaveLength(4);
  expect(blocked).toHaveLength(1);
  expect(blocked[0].process).toBe('ircd');
});

test('blacklist suspicious port range', () => {
  const config = resolveFilterConfig({
    blacklist: [{ ports: ['6660-6669'] }]
  });
  const { blocked } = applyFilters(sampleBindings, config);
  expect(blocked).toHaveLength(1);
  expect(blocked[0].port).toBe(6667);
});

test('combined whitelist and blacklist', () => {
  const config = resolveFilterConfig({
    whitelist: [{ ports: ['1-1024', '3000-9000'] }],
    blacklist: [{ ports: ['6660-6669'] }]
  });
  const { allowed, blocked } = applyFilters(sampleBindings, config);
  // ircd is blacklisted; mysqld on 3306 is whitelisted; all others pass
  expect(blocked.find(b => b.port === 6667)).toBeTruthy();
  expect(allowed.find(b => b.port === 3306)).toBeTruthy();
  expect(allowed.find(b => b.port === 3000)).toBeTruthy();
});

test('empty config allows all bindings through', () => {
  const config = resolveFilterConfig({});
  const { allowed, blocked } = applyFilters(sampleBindings, config);
  expect(allowed).toHaveLength(sampleBindings.length);
  expect(blocked).toHaveLength(0);
});
