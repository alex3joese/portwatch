'use strict';

const {
  getLabel,
  annotateWithLabels,
  filterByLabel,
  DEFAULT_LABELS,
} = require('./labels');
const { validateLabelsConfig, resolveLabelsConfig } = require('./labels.config');

describe('getLabel', () => {
  test('returns known default label', () => {
    expect(getLabel(22)).toBe('ssh');
    expect(getLabel(443)).toBe('https');
  });

  test('returns null for unknown port', () => {
    expect(getLabel(9999)).toBeNull();
  });

  test('custom label overrides default', () => {
    expect(getLabel(80, { 80: 'nginx' })).toBe('nginx');
  });

  test('custom label for unknown port', () => {
    expect(getLabel(12345, { 12345: 'myapp' })).toBe('myapp');
  });
});

describe('annotateWithLabels', () => {
  test('adds label field to each binding', () => {
    const bindings = [{ port: 22, addr: '0.0.0.0' }, { port: 9999, addr: '127.0.0.1' }];
    const result = annotateWithLabels(bindings);
    expect(result[0]).toMatchObject({ port: 22, label: 'ssh' });
    expect(result[1]).toMatchObject({ port: 9999, label: null });
  });

  test('preserves existing fields', () => {
    const bindings = [{ port: 3306, addr: '0.0.0.0', pid: 42 }];
    const [r] = annotateWithLabels(bindings);
    expect(r.pid).toBe(42);
    expect(r.label).toBe('mysql');
  });
});

describe('filterByLabel', () => {
  const annotated = [
    { port: 22, label: 'ssh' },
    { port: 80, label: 'http' },
    { port: 9999, label: null },
  ];

  test('filters to matching label', () => {
    expect(filterByLabel(annotated, 'ssh')).toHaveLength(1);
  });

  test('returns all when label is empty', () => {
    expect(filterByLabel(annotated, '')).toHaveLength(3);
  });
});

describe('validateLabelsConfig', () => {
  test('accepts undefined', () => {
    expect(validateLabelsConfig(undefined).valid).toBe(true);
  });

  test('accepts valid mapping', () => {
    expect(validateLabelsConfig({ 8080: 'proxy' }).valid).toBe(true);
  });

  test('rejects array', () => {
    expect(validateLabelsConfig([]).valid).toBe(false);
  });

  test('rejects invalid port key', () => {
    const { valid, errors } = validateLabelsConfig({ 99999: 'x' });
    expect(valid).toBe(false);
    expect(errors[0]).toMatch(/invalid port key/);
  });

  test('rejects empty label string', () => {
    const { valid, errors } = validateLabelsConfig({ 80: '  ' });
    expect(valid).toBe(false);
    expect(errors[0]).toMatch(/non-empty string/);
  });
});

describe('resolveLabelsConfig', () => {
  test('returns empty object for null', () => {
    expect(resolveLabelsConfig(null)).toEqual({});
  });

  test('normalises string keys to numbers', () => {
    const result = resolveLabelsConfig({ '8080': 'proxy' });
    expect(result[8080]).toBe('proxy');
  });

  test('throws on invalid config', () => {
    expect(() => resolveLabelsConfig({ 0: 'bad-port' })).toThrow('Invalid labels config');
  });
});
