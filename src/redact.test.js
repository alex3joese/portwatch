const {
  isSensitiveField,
  redactObject,
  redactBindings,
  redactLogLine,
} = require('./redact');
const { validateRedactConfig, resolveRedactConfig } = require('./redact.config');

describe('isSensitiveField', () => {
  test('detects known sensitive field names', () => {
    expect(isSensitiveField('password')).toBe(true);
    expect(isSensitiveField('authToken')).toBe(true);
    expect(isSensitiveField('apiKey')).toBe(true);
    expect(isSensitiveField('secretValue')).toBe(true);
  });

  test('ignores non-sensitive field names', () => {
    expect(isSensitiveField('port')).toBe(false);
    expect(isSensitiveField('host')).toBe(false);
    expect(isSensitiveField('pid')).toBe(false);
  });

  test('supports custom sensitive fields', () => {
    expect(isSensitiveField('ssn', ['ssn'])).toBe(true);
    expect(isSensitiveField('port', ['ssn'])).toBe(false);
  });
});

describe('redactObject', () => {
  test('masks sensitive keys', () => {
    const obj = { port: 8080, password: 'hunter2', host: 'localhost' };
    const result = redactObject(obj);
    expect(result.password).toBe('[REDACTED]');
    expect(result.port).toBe(8080);
    expect(result.host).toBe('localhost');
  });

  test('handles nested objects', () => {
    const obj = { meta: { token: 'abc123', label: 'web' } };
    const result = redactObject(obj);
    expect(result.meta.token).toBe('[REDACTED]');
    expect(result.meta.label).toBe('web');
  });

  test('supports custom mask', () => {
    const obj = { secret: 'shh' };
    const result = redactObject(obj, { mask: '***' });
    expect(result.secret).toBe('***');
  });

  test('returns non-objects unchanged', () => {
    expect(redactObject(null)).toBeNull();
    expect(redactObject('string')).toBe('string');
  });
});

describe('redactBindings', () => {
  test('redacts an array of bindings', () => {
    const bindings = [
      { port: 3000, token: 'tok1' },
      { port: 4000, token: 'tok2' },
    ];
    const result = redactBindings(bindings);
    expect(result[0].token).toBe('[REDACTED]');
    expect(result[1].token).toBe('[REDACTED]');
    expect(result[0].port).toBe(3000);
  });

  test('returns empty array for non-array input', () => {
    expect(redactBindings(null)).toEqual([]);
  });
});

describe('redactLogLine', () => {
  test('masks key=value patterns for sensitive fields', () => {
    const line = 'binding detected: port=8080 token=abc123 host=localhost';
    const result = redactLogLine(line);
    expect(result).toContain('token=[REDACTED]');
    expect(result).toContain('port=8080');
  });

  test('supports custom mask in log lines', () => {
    const line = 'auth=mypassword';
    const result = redactLogLine(line, { mask: 'XXX' });
    expect(result).toContain('auth=XXX');
  });
});

describe('validateRedactConfig', () => {
  test('accepts valid config', () => {
    const { valid } = validateRedactConfig({ enabled: true, mask: '***', sensitiveFields: ['token'] });
    expect(valid).toBe(true);
  });

  test('rejects invalid enabled type', () => {
    const { valid, errors } = validateRedactConfig({ enabled: 'yes' });
    expect(valid).toBe(false);
    expect(errors[0]).toMatch(/boolean/);
  });

  test('rejects non-array sensitiveFields', () => {
    const { valid } = validateRedactConfig({ sensitiveFields: 'token' });
    expect(valid).toBe(false);
  });
});

describe('resolveRedactConfig', () => {
  test('fills in defaults', () => {
    const cfg = resolveRedactConfig({});
    expect(cfg.enabled).toBe(true);
    expect(cfg.mask).toBe('[REDACTED]');
    expect(Array.isArray(cfg.sensitiveFields)).toBe(true);
  });

  test('respects user overrides', () => {
    const cfg = resolveRedactConfig({ mask: '---', enabled: false });
    expect(cfg.mask).toBe('---');
    expect(cfg.enabled).toBe(false);
  });

  test('throws on invalid config', () => {
    expect(() => resolveRedactConfig({ enabled: 42 })).toThrow(/Invalid redact config/);
  });
});
