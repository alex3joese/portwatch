// Integration: tags config -> annotate -> filter pipeline
const { resolveTagsConfig } = require('./tags.config');
const { annotateWithTags, filterByTags } = require('./tags');

const rawConfig = {
  enabled: true,
  rules: [
    { match: { port: 22, proto: 'tcp' }, tags: ['ssh', 'admin'] },
    { match: { port: 80, proto: 'tcp' }, tags: ['web'] },
    { match: { port: 443, proto: 'tcp' }, tags: ['web', 'tls'] },
    { match: { address: '127.0.0.1' }, tags: ['internal'] }
  ]
};

const bindings = [
  { port: 22, proto: 'tcp', address: '0.0.0.0' },
  { port: 80, proto: 'tcp', address: '0.0.0.0' },
  { port: 443, proto: 'tcp', address: '0.0.0.0' },
  { port: 8080, proto: 'tcp', address: '127.0.0.1' },
  { port: 9000, proto: 'udp', address: '0.0.0.0' }
];

test('full pipeline: resolve config, annotate, filter by tag', () => {
  const cfg = resolveTagsConfig(rawConfig);
  const annotated = annotateWithTags(bindings, cfg.rules);

  const webPorts = filterByTags(annotated, ['web']);
  expect(webPorts.map(b => b.port)).toEqual([80, 443]);

  const tlsWeb = filterByTags(annotated, ['web', 'tls']);
  expect(tlsWeb).toHaveLength(1);
  expect(tlsWeb[0].port).toBe(443);

  const internal = filterByTags(annotated, ['internal']);
  expect(internal).toHaveLength(1);
  expect(internal[0].port).toBe(8080);

  const untagged = annotated.find(b => b.port === 9000);
  expect(untagged.tags).toEqual([]);
});

test('disabled config still resolves without error', () => {
  const cfg = resolveTagsConfig({ enabled: false, rules: [] });
  expect(cfg.enabled).toBe(false);
  const annotated = annotateWithTags(bindings, cfg.rules);
  annotated.forEach(b => expect(b.tags).toEqual([]));
});
