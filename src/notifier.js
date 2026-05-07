const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Sends a desktop notification using available system tools.
 * Falls back gracefully if no notifier is found.
 */
function sendDesktopNotification(title, message) {
  const platforms = {
    linux: 'notify-send',
    darwin: 'osascript',
  };

  try {
    if (process.platform === 'darwin') {
      execSync(`osascript -e 'display notification "${message}" with title "${title}"'`);
    } else if (process.platform === 'linux') {
      execSync(`notify-send "${title}" "${message}"`);
    } else {
      console.warn('[notifier] Desktop notifications not supported on this platform.');
    }
  } catch (err) {
    console.warn('[notifier] Could not send desktop notification:', err.message);
  }
}

/**
 * Writes a notification entry to a notification log file.
 */
function logNotification(logPath, entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n';
  fs.appendFileSync(logPath, line, 'utf8');
}

/**
 * Dispatches a notification via configured channels.
 * @param {object} config - notifier config section
 * @param {object} alert - alert payload { port, pid, process, type }
 */
function notify(config, alert) {
  const channels = config.channels || [];

  if (channels.includes('desktop')) {
    const title = 'portwatch alert';
    const message = `Unexpected binding on port ${alert.port} by ${alert.process} (pid ${alert.pid})`;
    sendDesktopNotification(title, message);
  }

  if (channels.includes('log') && config.logPath) {
    logNotification(config.logPath, alert);
  }

  if (!channels.length) {
    console.log('[notifier] No channels configured. Alert:', alert);
  }
}

module.exports = { sendDesktopNotification, logNotification, notify };
