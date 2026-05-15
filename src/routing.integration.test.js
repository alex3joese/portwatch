// routing integration: annotate → filter → list pipeline
const { annotateWithRoutes, filterByRoute, listRoutes } = require('./routing');

const bindings = [
  { port: 22, addr: '0.0.0.0', pid: 1001 },
  { port: 80, addr: '0.0.0.0', pid: 1002 },
  { port: 443, addr: '0.0.0.0', pid: 1003 },
  { port: 5432, addr: '127.0.0.1', pid: 1004 },
  { port: 7777, addr: '127.0.0.1', pid: 1005 },
  { port: 8080, addr: '0.0.0.0', pid: 1006 },
];

test('full pipeline: annotate then filter by known route', () => {
  const annotated = annotateWithRoutes(bindings, { routes: { 7777: 'custom-svc' } });
  const webPorts = filterByRoute(annotated, 'http');
  expect(webPorts).toHaveLength(1);
  expect(webPorts[0].port).toBe(80);

  const custom = filterByRoute(annotated, 'custom-svc');
  expect(custom).toHaveLength(1);
  expect(custom[0].port).toBe(7777);
});

test('full pipeline: listRoutes returns all annotated routes', () => {
  const annotated = annotateWithRoutes(bindings, { routes: { 7777: 'custom-svc' } });
  const routes = listRoutes(annotated);
  const names = routes.map(r => r.route);
  expect(names).toContain('ssh');
  expect(names).toContain('http');
  expect(names).toContain('https');
  expect(names).toContain('postgres');
  expect(names).toContain('http-alt');
  expect(names).toContain('custom-svc');
  expect(routes.length).toBe(6);
});

test('unannotated port survives pipeline unchanged', () => {
  const annotated = annotateWithRoutes([{ port: 19999, addr: '127.0.0.1' }]);
  expect(annotated[0].route).toBeUndefined();
  const filtered = filterByRoute(annotated, 'anything');
  expect(filtered).toHaveLength(0);
});
