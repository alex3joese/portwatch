'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadConfig, DEFAULT_CONFIG } = require('./config');

function writeTempConfig(obj) {
  const tmpFile = path.join(os.tmpdir(), `portwatch-test-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(obj), 'utf8');
  return tmpFile;
}

describe('loadConfig', () => {
  test('returns defaults when no file exists', () => {
    const cfg = loadConfig('/nonexistent/path/portwatch.config.json');
    expect(cfg).toEqual(DEFAULT_CONFIG);
  });

  test('merges user config over defaults', () => {
    const tmp = writeTempConfig({ allowedPorts: [22, 80], pollIntervalMs: 10000 });
    const cfg = loadConfig(tmp);
    expect(cfg.allowedPorts).toEqual([22, 80]);
    expect(cfg.pollIntervalMs).toBe(10000);
    expect(cfg.logFile).toBeNull();
    fs.unlinkSync(tmp);
  });

  test('throws on invalid JSON', () => {
    const tmp = path.join(os.tmpdir(), `portwatch-bad-${Date.now()}.json`);
    fs.writeFileSync(tmp, '{ bad json }', 'utf8');
    expect(() => loadConfig(tmp)).toThrow('Failed to parse config');
    fs.unlinkSync(tmp);
  });

  test('throws when allowedPorts is not an array', () => {
    const tmp = writeTempConfig({ allowedPorts: 'nope' });
    expect(() => loadConfig(tmp)).toThrow('allowedPorts must be an array');
    fs.unlinkSync(tmp);
  });

  test('throws when pollIntervalMs is too small', () => {
    const tmp = writeTempConfig({ pollIntervalMs: 100 });
    expect(() => loadConfig(tmp)).toThrow('pollIntervalMs must be a number >= 500');
    fs.unlinkSync(tmp);
  });
});
