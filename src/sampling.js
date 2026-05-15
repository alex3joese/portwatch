// sampling.js — probabilistic and interval-based sampling of port bindings

'use strict';

function createSampler(config = {}) {
  const rate = config.rate ?? 1.0; // 0.0–1.0
  const every = config.every ?? 1;  // keep every Nth binding
  let _counter = 0;

  return { rate, every, _counter: () => _counter, _reset: () => { _counter = 0; } };
}

function shouldSampleRandom(sampler) {
  return Math.random() < sampler.rate;
}

function shouldSampleInterval(sampler) {
  sampler._n = (sampler._n ?? 0) + 1;
  return sampler._n % sampler.every === 0;
}

function applyRateSampling(bindings, rate) {
  if (rate >= 1.0) return bindings;
  if (rate <= 0.0) return [];
  return bindings.filter(() => Math.random() < rate);
}

function applyIntervalSampling(bindings, every) {
  if (every <= 1) return bindings;
  return bindings.filter((_, i) => (i + 1) % every === 0);
}

function applySampling(bindings, config = {}) {
  const { mode = 'rate', rate = 1.0, every = 1 } = config;
  if (mode === 'interval') return applyIntervalSampling(bindings, every);
  return applyRateSampling(bindings, rate);
}

module.exports = {
  createSampler,
  shouldSampleRandom,
  shouldSampleInterval,
  applyRateSampling,
  applyIntervalSampling,
  applySampling,
};
