const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadRules, validateRule, matchesRule, findMatchingRule } = require('./rules');
const { validateRulesConfig, resolveRulesConfig, DEFAULTS } = require('./rules.config');

function tmpRulesFile(rules) {
  const p = path.join(os.tmpdir(), `rules-test-${Date.now()}.json`);
  fs.writeFileSync(p, JSON.stringify(rules));
  return p;
}

describe('validateRule', () => {
  it('accepts a valid allow rule', () => {
    expect(() => validateRule({ action: 'allow', port: 80, protocol: 'tcp' })).not.toThrow();
  });
  it('throws on missing/invalid action', () => {
    expect(() => validateRule({ action: 'block' })).toThrow(/invalid action/);
  });
  it('throws on invalid port', () => {
    expect(() => validateRule({ action: 'deny', port: 99999 })).toThrow(/invalid port/);
  });
  it('throws on invalid protocol', () => {
    expect(() => validateRule({ action: 'alert', protocol: 'icmp' })).toThrow(/invalid protocol/);
  });
  it('fills in null defaults', () => {
    const r = validateRule({ action: 'alert' });
    expect(r.port).toBeNull();
    expect(r.protocol).toBeNull();
    expect(r.label).toBeNull();
  });
});

describe('loadRules', () => {
  it('returns empty array for non-existent file', () => {
    expect(loadRules('/no/such/file.json')).toEqual([]);
  });
  it('loads and validates rules from file', () => {
    const p = tmpRulesFile([{ action: 'allow', port: 443, protocol: 'tcp' }]);
    const rules = loadRules(p);
    expect(rules).toHaveLength(1);
    expect(rules[0].port).toBe(443);
    fs.unlinkSync(p);
  });
  it('throws on invalid JSON', () => {
    const p = path.join(os.tmpdir(), `rules-bad-${Date.now()}.json`);
    fs.writeFileSync(p, 'not json');
    expect(() => loadRules(p)).toThrow(/Failed to parse/);
    fs.unlinkSync(p);
  });
  it('throws if file is not an array', () => {
    const p = tmpRulesFile({ action: 'allow' });
    expect(() => loadRules(p)).toThrow(/must contain a JSON array/);
    fs.unlinkSync(p);
  });
});

describe('matchesRule / findMatchingRule', () => {
  const rules = [
    { action: 'allow', port: 80, protocol: 'tcp', label: null },
    { action: 'deny', port: null, protocol: 'udp', label: null },
    { action: 'alert', port: null, protocol: null, label: null },
  ];

  it('matches exact port and protocol', () => {
    expect(matchesRule({ port: 80, protocol: 'tcp' }, rules[0])).toBe(true);
    expect(matchesRule({ port: 81, protocol: 'tcp' }, rules[0])).toBe(false);
  });
  it('matches wildcard port', () => {
    expect(matchesRule({ port: 5353, protocol: 'udp' }, rules[1])).toBe(true);
  });
  it('findMatchingRule returns first match', () => {
    const m = findMatchingRule({ port: 80, protocol: 'tcp' }, rules);
    expect(m.action).toBe('allow');
  });
  it('findMatchingRule falls through to catch-all', () => {
    const m = findMatchingRule({ port: 9999, protocol: 'tcp' }, rules);
    expect(m.action).toBe('alert');
  });
  it('returns null when no rule matches', () => {
    expect(findMatchingRule({ port: 22, protocol: 'tcp' }, [])).toBeNull();
  });
});

describe('resolveRulesConfig', () => {
  it('returns defaults for empty config', () => {
    const cfg = resolveRulesConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.defaultAction).toBe('alert');
    expect(cfg.rulesFile).toBe(DEFAULTS.rulesFile);
  });
  it('merges user values', () => {
    const cfg = resolveRulesConfig({ enabled: false, defaultAction: 'deny' });
    expect(cfg.enabled).toBe(false);
    expect(cfg.defaultAction).toBe('deny');
  });
  it('throws on bad defaultAction', () => {
    expect(() => validateRulesConfig({ defaultAction: 'ignore' })).toThrow(/defaultAction/);
  });
});
