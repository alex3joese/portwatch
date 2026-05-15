// routing.js — maps bindings to named routes/services for human-readable output

const { resolveRoutingConfig } = require('./routing.config');

const BUILTIN_ROUTES = {
  22: 'ssh',
  25: 'smtp',
  53: 'dns',
  80: 'http',
  443: 'https',
  3306: 'mysql',
  5432: 'postgres',
  6379: 'redis',
  8080: 'http-alt',
  27017: 'mongodb',
};

function resolveRoute(port, config = {}) {
  const cfg = resolveRoutingConfig(config);
  const custom = cfg.routes || {};
  const merged = Object.assign({}, BUILTIN_ROUTES, custom);
  return merged[port] || null;
}

function annotateWithRoutes(bindings, config = {}) {
  return bindings.map(b => {
    const route = resolveRoute(b.port, config);
    return route ? Object.assign({}, b, { route }) : b;
  });
}

function filterByRoute(bindings, routeName) {
  if (!routeName) return bindings;
  return bindings.filter(b => b.route === routeName);
}

function listRoutes(bindings) {
  const seen = new Set();
  const result = [];
  for (const b of bindings) {
    if (b.route && !seen.has(b.route)) {
      seen.add(b.route);
      result.push({ port: b.port, route: b.route });
    }
  }
  return result;
}

module.exports = { resolveRoute, annotateWithRoutes, filterByRoute, listRoutes };
