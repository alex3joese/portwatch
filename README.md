# portwatch

Lightweight daemon that monitors local port usage and alerts on unexpected bindings.

---

## Installation

```bash
npm install -g portwatch
```

## Usage

Start the daemon with a configuration file defining your expected port bindings:

```bash
portwatch start --config portwatch.config.json
```

**Example `portwatch.config.json`:**

```json
{
  "allowedPorts": [3000, 8080, 5432],
  "alertOnUnexpected": true,
  "interval": 5000
}
```

portwatch will poll active port bindings at the specified interval and log (or notify) whenever a process binds to a port not in your allowed list.

```bash
# Run in the foreground with verbose output
portwatch start --verbose

# Stop the background daemon
portwatch stop

# View current port snapshot
portwatch status
```

## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `allowedPorts` | `number[]` | `[]` | Ports considered safe to bind |
| `alertOnUnexpected` | `boolean` | `true` | Emit alerts for unknown bindings |
| `interval` | `number` | `5000` | Poll interval in milliseconds |

## Requirements

- Node.js >= 16
- macOS or Linux

## License

MIT © portwatch contributors