// ratelimit.config.js — validate and resolve rate limit configuration

'use strict';

const DEFAULTS = {
  windowMs: 60000,
  maxEvents: 5,
};

function validateRateLimitConfig(config) {
  if (config === null || typeof config !== 'object') {
    throw new Error('rateLimit config must be an object');
  }

  if (config.windowMs !== undefined) {
    if (typeof config.windowMs !== 'number' || config.windowMs <= 0) {
      throw new Error('rateLimit.windowMs must be a positive number');
    }
  }

  if (config.maxEvents !== undefined) {
    if (
      typeof config.maxEvents !== 'number' ||
      !Number.isInteger(config.maxEvents) ||
      config.maxEvents < 1
    ) {
      throw new Error('rateLimit.maxEvents must be a positive integer');
    }
  }
}

function resolveRateLimitConfig(config = {}) {
  validateRateLimitConfig(config);
  return Object.assign({}, DEFAULTS, config);
}

module.exports = { validateRateLimitConfig, resolveRateLimitConfig };
