// trend.js — tracks binding count changes over time to detect anomalies

'use strict';

const DEFAULT_WINDOW = 10;

function createTrend(options = {}) {
  const windowSize = options.windowSize || DEFAULT_WINDOW;
  const samples = [];

  return { samples, windowSize };
}

function recordSample(trend, count, ts = Date.now()) {
  trend.samples.push({ count, ts });
  if (trend.samples.length > trend.windowSize) {
    trend.samples.shift();
  }
}

function getAverage(trend) {
  if (trend.samples.length === 0) return 0;
  const sum = trend.samples.reduce((acc, s) => acc + s.count, 0);
  return sum / trend.samples.length;
}

function getSlope(trend) {
  const n = trend.samples.length;
  if (n < 2) return 0;

  const first = trend.samples[0];
  const last = trend.samples[n - 1];
  const dt = last.ts - first.ts;
  if (dt === 0) return 0;

  return (last.count - first.count) / (dt / 1000);
}

function isAnomaly(trend, threshold = 2.0) {
  const n = trend.samples.length;
  if (n < 3) return false;

  const avg = getAverage(trend);
  const latest = trend.samples[n - 1].count;

  if (avg === 0) return latest > 0;
  return Math.abs(latest - avg) / avg > threshold;
}

function getTrendSummary(trend) {
  return {
    sampleCount: trend.samples.length,
    average: getAverage(trend),
    slope: getSlope(trend),
    latest: trend.samples.length > 0 ? trend.samples[trend.samples.length - 1].count : null,
    anomaly: isAnomaly(trend)
  };
}

module.exports = { createTrend, recordSample, getAverage, getSlope, isAnomaly, getTrendSummary };
