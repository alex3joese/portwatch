'use strict';

const { parseSsOutput } = require('./scanner');

const SAMPLE_SS_OUTPUT = `
Netid  State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process
tcp    LISTEN  0       128     0.0.0.0:22         0.0.0.0:*          users:(("sshd",pid=812,fd=3))
tcp    LISTEN  0       511     127.0.0.1:3000     0.0.0.0:*          users:(("node",pid=4201,fd=22))
tcp    LISTEN  0       128     :::80              :::*               users:(("nginx",pid=990,fd=6))
`.trim();

describe('parseSsOutput', () => {
  let records;

  beforeAll(() => {
    records = parseSsOutput(SAMPLE_SS_OUTPUT);
  });

  test('returns correct number of records', () => {
    expect(records).toHaveLength(3);
  });

  test('parses port correctly', () => {
    expect(records[0].port).toBe(22);
    expect(records[1].port).toBe(3000);
    expect(records[2].port).toBe(80);
  });

  test('parses pid correctly', () => {
    expect(records[0].pid).toBe(812);
    expect(records[1].pid).toBe(4201);
    expect(records[2].pid).toBe(990);
  });

  test('parses process name correctly', () => {
    expect(records[0].process).toBe('sshd');
    expect(records[1].process).toBe('node');
    expect(records[2].process).toBe('nginx');
  });

  test('parses address correctly', () => {
    expect(records[0].address).toBe('0.0.0.0');
    expect(records[1].address).toBe('127.0.0.1');
  });

  test('returns empty array for empty input', () => {
    expect(parseSsOutput('')).toEqual([]);
  });

  test('skips malformed lines gracefully', () => {
    const bad = 'Netid State\ntcp LISTEN 0';
    expect(() => parseSsOutput(bad)).not.toThrow();
  });
});
