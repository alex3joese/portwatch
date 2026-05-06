jest.mock('./scanner');
jest.mock('./alerter');

const { scanPorts } = require('./scanner');
const { checkBindings } = require('./alerter');
const { startWatcher, stopWatcher, isRunning } = require('./watcher');

const fakeBindings = [
  { port: 3000, process: 'node', address: '127.0.0.1' },
];

beforeEach(() => {
  jest.useFakeTimers();
  scanPorts.mockResolvedValue(fakeBindings);
  checkBindings.mockReturnValue([]);
  // ensure clean state
  if (isRunning()) stopWatcher();
});

afterEach(() => {
  if (isRunning()) stopWatcher();
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe('startWatcher', () => {
  it('calls scanPorts immediately on start', async () => {
    startWatcher({ intervalSeconds: 10, allowedPorts: [3000] });
    await Promise.resolve(); // flush microtasks
    expect(scanPorts).toHaveBeenCalledTimes(1);
  });

  it('calls scanPorts again after the interval', async () => {
    startWatcher({ intervalSeconds: 10, allowedPorts: [] });
    await Promise.resolve();
    jest.advanceTimersByTime(10000);
    await Promise.resolve();
    expect(scanPorts).toHaveBeenCalledTimes(2);
  });

  it('throws if called while already running', () => {
    startWatcher({ intervalSeconds: 5, allowedPorts: [] });
    expect(() => startWatcher({ intervalSeconds: 5, allowedPorts: [] })).toThrow(
      'already running'
    );
  });

  it('invokes onTick callback with unexpected bindings', async () => {
    const unexpected = [{ port: 9999, process: 'evil', address: '0.0.0.0' }];
    checkBindings.mockReturnValue(unexpected);
    const onTick = jest.fn();
    startWatcher({ intervalSeconds: 10, allowedPorts: [] }, onTick);
    await Promise.resolve();
    expect(onTick).toHaveBeenCalledWith(unexpected, fakeBindings);
  });
});

describe('stopWatcher', () => {
  it('sets isRunning to false', () => {
    startWatcher({ intervalSeconds: 60, allowedPorts: [] });
    expect(isRunning()).toBe(true);
    stopWatcher();
    expect(isRunning()).toBe(false);
  });
});
