const { parseTags, resolveTags, annotateWithTags, filterByTags, stripTags } = require('./tags');

const rules = [
  { match: { port: 80, proto: 'tcp' }, tags: ['web', 'http'] },
  { match: { port: 443 }, tags: ['web', 'https'] },
  { match: { address: '127.0.0.1' }, tags: ['loopback'] }
];

describe('parseTags', () => {
  test('splits comma-separated tags', () => {
    expect(parseTags('web,internal,http')).toEqual(['web', 'internal', 'http']);
  });
  test('trims whitespace', () => {
    expect(parseTags(' web , http ')).toEqual(['web', 'http']);
  });
  test('returns empty array for empty input', () => {
    expect(parseTags('')).toEqual([]);
    expect(parseTags(null)).toEqual([]);
  });
});

describe('resolveTags', () => {
  test('matches by port and proto', () => {
    const tags = resolveTags({ port: 80, proto: 'tcp', address: '0.0.0.0' }, rules);
    expect(tags).toContain('web');
    expect(tags).toContain('http');
  });
  test('does not match wrong proto', () => {
    const tags = resolveTags({ port: 80, proto: 'udp', address: '0.0.0.0' }, rules);
    expect(tags).not.toContain('http');
  });
  test('matches loopback by address', () => {
    const tags = resolveTags({ port: 9999, proto: 'tcp', address: '127.0.0.1' }, rules);
    expect(tags).toContain('loopback');
  });
  test('returns empty when no rules match', () => {
    expect(resolveTags({ port: 9999, proto: 'tcp', address: '0.0.0.0' }, rules)).toEqual([]);
  });
});

describe('annotateWithTags', () => {
  test('adds tags field to each binding', () => {
    const bindings = [{ port: 80, proto: 'tcp', address: '0.0.0.0' }];
    const result = annotateWithTags(bindings, rules);
    expect(result[0].tags).toContain('web');
  });
  test('does not mutate original', () => {
    const b = { port: 80, proto: 'tcp', address: '0.0.0.0' };
    annotateWithTags([b], rules);
    expect(b.tags).toBeUndefined();
  });
});

describe('filterByTags', () => {
  const bindings = [
    { port: 80, tags: ['web', 'http'] },
    { port: 443, tags: ['web', 'https'] },
    { port: 22, tags: ['ssh'] }
  ];
  test('filters by single tag', () => {
    expect(filterByTags(bindings, ['web'])).toHaveLength(2);
  });
  test('filters by multiple tags (AND)', () => {
    expect(filterByTags(bindings, ['web', 'https'])).toHaveLength(1);
  });
  test('returns all when no tags given', () => {
    expect(filterByTags(bindings, [])).toHaveLength(3);
  });
});

describe('stripTags', () => {
  test('removes tags field', () => {
    const b = [{ port: 80, tags: ['web'] }];
    expect(stripTags(b)[0].tags).toBeUndefined();
  });
});
