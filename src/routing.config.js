// routing.config.js — validation and resolution for routing configuration

const DEFAULT_CONFIG = {
  routes: {},
  annotate: true,
};

function validateRoutingConfig(config) {
  if (config === null || typeof config !== 'object') {
    throw new Error('routing config must be an object');
  }
  if (config.routes !== undefined) {
    if (typeof config.routes !== 'object' || Array.isArray(config.routes)) {
      throw new Error('routing.routes must be a plain object mapping port numbers to route names');
    }
    for (const [port, name] of Object.entries(config.routes)) {
      const p = Number(port);
      if (!Number.isInteger(p) || p < 1 || p > 65535) {
        throw new Error(`routing.routes key "${port}" is not a valid port number`);
      }
      if (typeof name !== 'string' || name.trim() === '') {
        throw new Error(`routing.routes[${port}] must be a non-empty string`);
      }
    }
  }
  if (config.annotate !== undefined && typeof config.annotate !== 'boolean') {
    throw new Error('routing.annotate must be a boolean');
  }
  return true;
}

function resolveRoutingConfig(config = {}) {
  validateRoutingConfig(config);
  return Object.assign({}, DEFAULT_CONFIG, config, {
    routes: Object.assign({}, DEFAULT_CONFIG.routes, config.routes || {}),
  });
}

module.exports = { validateRoutingConfig, resolveRoutingConfig };
