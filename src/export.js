/**
 * export.js — Export port scan data to various formats (JSON, CSV, TSV)
 */

const fs = require('fs');
const path = require('path');

function toJSON(bindings, options = {}) {
  const { pretty = true } = options;
  return pretty
    ? JSON.stringify(bindings, null, 2)
    : JSON.stringify(bindings);
}

function toCSV(bindings) {
  if (!bindings || bindings.length === 0) return '';
  const headers = ['port', 'proto', 'address', 'pid', 'process', 'severity', 'timestamp'];
  const rows = bindings.map(b => [
    b.port ?? '',
    b.proto ?? '',
    b.address ?? '',
    b.pid ?? '',
    b.process ?? '',
    b.severity ?? '',
    b.timestamp ?? ''
  ].map(v => JSON.stringify(String(v))).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function toTSV(bindings) {
  if (!bindings || bindings.length === 0) return '';
  const headers = ['port', 'proto', 'address', 'pid', 'process', 'severity', 'timestamp'];
  const rows = bindings.map(b => [
    b.port ?? '',
    b.proto ?? '',
    b.address ?? '',
    b.pid ?? '',
    b.process ?? '',
    b.severity ?? '',
    b.timestamp ?? ''
  ].join('\t'));
  return [headers.join('\t'), ...rows].join('\n');
}

function exportBindings(bindings, format = 'json', options = {}) {
  switch (format.toLowerCase()) {
    case 'json': return toJSON(bindings, options);
    case 'csv':  return toCSV(bindings);
    case 'tsv':  return toTSV(bindings);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function writeExport(bindings, filePath, format, options = {}) {
  const content = exportBindings(bindings, format, options);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

module.exports = { toJSON, toCSV, toTSV, exportBindings, writeExport };
