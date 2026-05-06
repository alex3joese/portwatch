const fs = require('fs');
const os = require('os');
const path = require('path');
const { formatAlert, writeAlertToLog, sendAlert, checkBindings } = require('./alerter');

describe('formatAlert', () => {
  it('includes port, process and address in message', () => {
    const msg = formatAlert({ port: 8080, process: 'node', address: '0.0.0.0' });
    expect(msg).toContain('8080');
    expect(msg).toContain('node');
    expect(msg).toContain('0.0.0.0');
    expect(msg).toContain('ALERT');
  });

  it('includes an ISO timestamp', () => {
    const msg = formatAlert({ port: 3000, process: 'python', address: '127.0.0.1' });
    expect(msg).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});

describe('writeAlertToLog', () => {
  it('creates the log file and appends the message', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portwatch-'));
    const logPath = path.join(tmpDir, 'logs', 'alerts.log');
    writeAlertToLog('test alert line', logPath);
    const content = fs.readFileSync(logPath, 'utf8');
    expect(content).toContain('test alert line');
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('sendAlert', () => {
  it('returns the formatted message', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const msg = sendAlert({ port: 22, process: 'sshd', address: '0.0.0.0' });
    expect(typeof msg).toBe('string');
    expect(msg).toContain('22');
    spy.mockRestore();
  });
});

describe('checkBindings', () => {
  const bindings = [
    { port: 80, process: 'nginx', address: '0.0.0.0' },
    { port: 4444, process: 'nc', address: '0.0.0.0' },
    { port: 443, process: 'nginx', address: '0.0.0.0' },
  ];

  it('returns only bindings not in allowed list', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const unexpected = checkBindings(bindings, [80, 443]);
    expect(unexpected).toHaveLength(1);
    expect(unexpected[0].port).toBe(4444);
    spy.mockRestore();
  });

  it('returns empty array when all ports are allowed', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const unexpected = checkBindings(bindings, [80, 443, 4444]);
    expect(unexpected).toHaveLength(0);
    spy.mockRestore();
  });
});
