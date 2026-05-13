'use strict';

const { createPipeline } = require('./pipeline');
const scanner = require('./scanner');
const alerter = require('./alerter');
const history = require('./history');

jest.mock('./scanner');
jest.mock('./alerter');
jest.mock('./history');

const MOCK_BINDINGS = [
  { port: 8080, proto: 'tcp', addr: '0.0.0.0', pid: 1234, process: 'node' },
  { port: 3000, proto: 'tcp', addr: '127.0.0.1', pid: 5678, process: 'python' },
];

beforeEach(() => {
  jest.clearAllMocks();
  scanner.scanPorts.mockResolvedValue(MOCK_BINDINGS);
  alerter.checkBindings.mockResolvedValue([{ port: 8080, sent: true }]);
  history.appendHistory.mockResolvedValue(undefined);
});

test('run returns bindings and alerts', async () => {
  const pipeline = createPipeline();
  const { bindings, alerts } = await pipeline.run();
  expect(bindings.length).toBeGreaterThan(0);
  expect(alerts).toEqual([{ port: 8080, sent: true }]);
});

test('dedup suppresses repeated bindings on second run', async () => {
  const pipeline = createPipeline();
  await pipeline.run();
  const { bindings } = await pipeline.run();
  expect(bindings).toHaveLength(0);
  expect(alerter.checkBindings).toHaveBeenCalledTimes(1);
});

test('reset clears dedup state so bindings are novel again', async () => {
  const pipeline = createPipeline();
  await pipeline.run();
  pipeline.reset();
  const { bindings } = await pipeline.run();
  expect(bindings.length).toBeGreaterThan(0);
});

test('history is written when historyFile is provided', async () => {
  const pipeline = createPipeline({ historyFile: '/tmp/test-history.json' });
  await pipeline.run();
  expect(history.appendHistory).toHaveBeenCalledWith(
    '/tmp/test-history.json',
    expect.any(Array)
  );
});

test('history is skipped when historyFile is not set', async () => {
  const pipeline = createPipeline();
  await pipeline.run();
  expect(history.appendHistory).not.toHaveBeenCalled();
});

test('empty scan produces no alerts', async () => {
  scanner.scanPorts.mockResolvedValue([]);
  const pipeline = createPipeline();
  const { bindings, alerts } = await pipeline.run();
  expect(bindings).toHaveLength(0);
  expect(alerts).toHaveLength(0);
  expect(alerter.checkBindings).not.toHaveBeenCalled();
});
