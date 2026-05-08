const { parseProcessInfo, lookupProcess, enrichWithProcessInfo } = require('./process');
const { validateProcessConfig, resolveProcessConfig, DEFAULTS } = require('./process.config');

describe('parseProcessInfo', () => {
  it('parses ss output into port->process map', () => {
    const raw = `Netid State Recv-Q Send-Q Local Address:Port
TCP   LISTEN 0      128    0.0.0.0:3000   0.0.0.0:* users:(("node",pid=1234,fd=22))`;
    const result = parseProcessInfo(raw);
    expect(result[3000]).toEqual({ port: 3000, name: 'node', pid: 1234 });
  });

  it('returns empty object for no matches', () => {
    const raw = 'Netid State Recv-Q Send-Q Local Address:Port\n';
    expect(parseProcessInfo(raw)).toEqual({});
  });

  it('handles multiple ports', () => {
    const raw = `Netid State Recv-Q Send-Q Local Address:Port
TCP   LISTEN 0 128 0.0.0.0:8080 0.0.0.0:* users:(("nginx",pid=42,fd=6))
TCP   LISTEN 0 128 0.0.0.0:5432 0.0.0.0:* users:(("postgres",pid=99,fd=5))`;
    const result = parseProcessInfo(raw);
    expect(result[8080].name).toBe('nginx');
    expect(result[5432].name).toBe('postgres');
  });
});

describe('enrichWithProcessInfo', () => {
  it('adds null pid/processName when lookup fails', () => {
    const bindings = [{ port: 65535, address: '0.0.0.0', protocol: 'tcp' }];
    const enriched = enrichWithProcessInfo(bindings);
    expect(enriched[0]).toMatchObject({ port: 65535, pid: null, processName: null });
  });

  it('preserves original binding fields', () => {
    const bindings = [{ port: 65535, address: '127.0.0.1', protocol: 'tcp' }];
    const enriched = enrichWithProcessInfo(bindings);
    expect(enriched[0].address).toBe('127.0.0.1');
    expect(enriched[0].protocol).toBe('tcp');
  });
});

describe('validateProcessConfig', () => {
  it('accepts valid config', () => {
    expect(validateProcessConfig({ enabled: true, includePid: false })).toBe(true);
  });

  it('throws on non-object', () => {
    expect(() => validateProcessConfig(null)).toThrow();
  });

  it('throws on invalid enabled type', () => {
    expect(() => validateProcessConfig({ enabled: 'yes' })).toThrow();
  });
});

describe('resolveProcessConfig', () => {
  it('returns defaults for empty input', () => {
    expect(resolveProcessConfig()).toEqual(DEFAULTS);
  });

  it('merges partial config with defaults', () => {
    const result = resolveProcessConfig({ enabled: false });
    expect(result.enabled).toBe(false);
    expect(result.includePid).toBe(DEFAULTS.includePid);
  });
});
