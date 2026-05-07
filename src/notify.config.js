/**
 * Default notifier configuration.
 * Merged with user-supplied config at runtime.
 */
const DEFAULT_NOTIFY_CONFIG = {
  channels: ['log'],
  logPath: '/var/log/portwatch/notifications.log',
  desktop: {
    enabled: false,
  },
  throttle: {
    enabled: true,
    windowSeconds: 60,
    maxPerWindow: 5,
  },
};

/**
 * Validates the notifier section of a config object.
 * @param {object} cfg
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateNotifyConfig(cfg) {
  const errors = [];

  if (!cfg) {
    return { valid: false, errors: ['notifier config is missing'] };
  }

  if (!Array.isArray(cfg.channels)) {
    errors.push('notifier.channels must be an array');
  } else {
    const allowed = ['log', 'desktop'];
    cfg.channels.forEach((ch) => {
      if (!allowed.includes(ch)) {
        errors.push(`unknown channel: ${ch}`);
      }
    });
  }

  if (cfg.channels && cfg.channels.includes('log') && !cfg.logPath) {
    errors.push('notifier.logPath is required when log channel is enabled');
  }

  if (cfg.throttle) {
    if (typeof cfg.throttle.windowSeconds !== 'number' || cfg.throttle.windowSeconds <= 0) {
      errors.push('notifier.throttle.windowSeconds must be a positive number');
    }
    if (typeof cfg.throttle.maxPerWindow !== 'number' || cfg.throttle.maxPerWindow <= 0) {
      errors.push('notifier.throttle.maxPerWindow must be a positive number');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Merges user config with defaults.
 */
function resolveNotifyConfig(userCfg = {}) {
  return Object.assign({}, DEFAULT_NOTIFY_CONFIG, userCfg, {
    throttle: Object.assign({}, DEFAULT_NOTIFY_CONFIG.throttle, userCfg.throttle || {}),
    desktop: Object.assign({}, DEFAULT_NOTIFY_CONFIG.desktop, userCfg.desktop || {}),
  });
}

module.exports = { DEFAULT_NOTIFY_CONFIG, validateNotifyConfig, resolveNotifyConfig };
