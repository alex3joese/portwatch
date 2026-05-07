const fs = require('fs');
const os = require('os');
const path = require('path');
const { logNotification, notify } = require('./notifier');

function tmpFile() {
  return path.join(os.tmpdir(), `portwatch-notifier-test-${Date.now()}.log`);
}

describe('logNotification', () => {
  test('appends a JSON line to the log file', () => {
    const logPath = tmpFile();
    const entry = { port: 8080, pid: 1234, process: 'node', type: 'unexpected' };
    logNotification(logPath, entry);
    const contents = fs.readFileSync(logPath, 'utf8').trim();
    const parsed = JSON.parse(contents);
    expect(parsed.port).toBe(8080);
    expect(parsed.pid).toBe(1234);
    expect(parsed.process).toBe('node');
    expect(parsed.ts).toBeDefined();
    fs.unlinkSync(logPath);
  });

  test('appends multiple entries', () => {
    const logPath = tmpFile();
    logNotification(logPath, { port: 3000 });
    logNotification(logPath, { port: 4000 });
    const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]).port).toBe(3000);
    expect(JSON.parse(lines[1]).port).toBe(4000);
    fs.unlinkSync(logPath);
  });
});

describe('notify', () => {
  test('logs to file when log channel is configured', () => {
    const logPath = tmpFile();
    const config = { channels: ['log'], logPath };
    const alert = { port: 9090, pid: 555, process: 'python', type: 'new' };
    notify(config, alert);
    const contents = fs.readFileSync(logPath, 'utf8').trim();
    const parsed = JSON.parse(contents);
    expect(parsed.port).toBe(9090);
    fs.unlinkSync(logPath);
  });

  test('does not throw when no channels configured', () => {
    const config = { channels: [] };
    const alert = { port: 1234, pid: 99, process: 'bash', type: 'new' };
    expect(() => notify(config, alert)).not.toThrow();
  });

  test('does not write log when log channel missing', () => {
    const logPath = tmpFile();
    const config = { channels: ['desktop'] };
    const alert = { port: 7070, pid: 11, process: 'ruby', type: 'new' };
    // desktop will fail silently in test env, just ensure no log written
    notify(config, alert);
    expect(fs.existsSync(logPath)).toBe(false);
  });
});
