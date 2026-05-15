const { resolveRoute, annotateWithRoutes, filterByRoute, listRoutes } = require('./routing');

const sample = [
  { port: 80, addr: '0.0.0.0' },
  { port: 443, addr: '0.0.0.0' },
  { port: 9000, addr: '127.0.0.1' },
  { port: 3306, addr: '127.0.0.1' },
];

describe('resolveRoute', () => {
  test('returns builtin route name for known port', () => {
    expect(resolveRoute(80)).toBe('http');
    expect(resolveRoute(443)).toBe('https');
    expect(resolveRoute(22)).toBe('ssh');
  });

  test('returns null for unknown port', () => {
    expect(resolveRoute(9999)).toBeNull();
  });

  test('custom routes override builtins', () => {
    expect(resolveRoute(80, { routes: { 80: 'my-app' } })).toBe('my-app');
  });

  test('custom routes extend builtins', () => {
    expect(resolveRoute(9000, { routes: { 9000: 'php-fpm' } })).toBe('php-fpm');
  });
});

describe('annotateWithRoutes', () => {
  test('adds route field to known ports', () => {
    const result = annotateWithRoutes(sample);
    expect(result[0].route).toBe('http');
    expect(result[1].route).toBe('https');
    expect(result[3].route).toBe('mysql');
  });

  test('does not add route field to unknown ports', () => {
    const result = annotateWithRoutes(sample);
    expect(result[2].route).toBeUndefined();
  });

  test('does not mutate original bindings', () => {
    const original = [{ port: 80, addr: '0.0.0.0' }];
    annotateWithRoutes(original);
    expect(original[0].route).toBeUndefined();
  });
});

describe('filterByRoute', () => {
  test('filters bindings by route name', () => {
    const annotated = annotateWithRoutes(sample);
    const result = filterByRoute(annotated, 'http');
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(80);
  });

  test('returns all bindings when no route given', () => {
    expect(filterByRoute(sample)).toEqual(sample);
  });
});

describe('listRoutes', () => {
  test('returns unique route entries', () => {
    const annotated = annotateWithRoutes(sample);
    const routes = listRoutes(annotated);
    expect(routes.map(r => r.route)).toContain('http');
    expect(routes.map(r => r.route)).toContain('https');
    expect(routes.map(r => r.route)).toContain('mysql');
    expect(routes.length).toBe(3);
  });
});
