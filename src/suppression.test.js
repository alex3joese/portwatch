// suppression.test.js

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadSuppressions, matchesSuppression, isSuppressed, applySuppression } = require('./suppression');
const { validateSuppressionConfig, resolveSuppressionConfig } = require('./suppression.config');

function tmpFile(content) {
  const p = path.join(os.tmpdir(), `suppression-test-${Date.now()}.json`);
  fs.writeFileSync(p, JSON.stringify(content));
  return p;
}

describe('loadSuppressions', () => {
  it('returns empty array when filePath is null', () => {
    expect(loadSuppressions(null)).toEqual([]);
  });

  it('loads rules from a valid JSON file', () => {
    const rules = [{ port: 8080, proto: 'tcp' }];
    const p = tmpFile(rules);
    expect(loadSuppressions(p)).toEqual(rules);
    fs.unlinkSync(p);
  });

  it('throws if file content is not an array', () => {
    const p = tmpFile({ port: 80 });
    expect(() => loadSuppressions(p)).toThrow('Suppressions must be an array');
    fs.unlinkSync(p);
  });
});

describe('matchesSuppression', () => {
  const binding = { port: 3000, proto: 'tcp', address: '0.0.0.0', process: 'node' };

  it('matches when all rule fields match', () => {
    expect(matchesSuppression(binding, { port: 3000, proto: 'tcp' })).toBe(true);
  });

  it('does not match when port differs', () => {
    expect(matchesSuppression(binding, { port: 9999 })).toBe(false);
  });

  it('matches empty rule (wildcard)', () => {
    expect(matchesSuppression(binding, {})).toBe(true);
  });
});

describe('isSuppressed', () => {
  it('returns false for empty suppressions', () => {
    expect(isSuppressed({ port: 80 }, [])).toBe(false);
  });

  it('returns true when a rule matches', () => {
    expect(isSuppressed({ port: 80, proto: 'tcp' }, [{ port: 80 }])).toBe(true);
  });
});

describe('applySuppression', () => {
  it('filters out suppressed bindings', () => {
    const bindings = [{ port: 80 }, { port: 443 }, { port: 3000 }];
    const result = applySuppression(bindings, [{ port: 80 }, { port: 443 }]);
    expect(result).toEqual([{ port: 3000 }]);
  });

  it('returns all bindings when no rules match', () => {
    const bindings = [{ port: 8080 }];
    expect(applySuppression(bindings, [{ port: 9999 }])).toEqual(bindings);
  });
});

describe('resolveSuppressionConfig', () => {
  it('applies defaults', () => {
    const cfg = resolveSuppressionConfig({});
    expect(cfg.enabled).toBe(true);
    expect(cfg.filePath).toBeNull();
  });

  it('throws on invalid enabled type', () => {
    expect(() => validateSuppressionConfig({ enabled: 'yes' })).toThrow('must be a boolean');
  });

  it('throws on unknown rule key', () => {
    expect(() => validateSuppressionConfig({ rules: [{ bogus: true }] })).toThrow('Unknown suppression rule key');
  });
});
