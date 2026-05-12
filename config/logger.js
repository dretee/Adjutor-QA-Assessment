// config/logger.js
// ─────────────────────────────────────────────────────────
// Structured logging for better observability and debugging.
// Uses winston for production-grade logging with multiple
// transports (console, file).
// ─────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const { LOG_LEVELS } = require('./constants');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logger implementation (compatible with winston interface)
// If winston is installed later, this can be swapped out
class Logger {
  constructor(label = 'Adjutor-QA') {
    this.label = label;
    this.logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}-test.log`);
  }

  /**
   * Write log entry to console and file
   * @private
   */
  _writeLog(level, message, metadata = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      label: this.label,
      message,
      ...(metadata && { metadata }),
    };

    // Console output with color coding
    const colorCode = this._getColorCode(level);
    const resetCode = '\x1b[0m';
    console.log(
      `${colorCode}[${timestamp}] [${level.toUpperCase()}] ${this.label}: ${message}${resetCode}`
    );

    // File output (JSON format for structured logging)
    try {
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (err) {
      console.error('Failed to write to log file:', err.message);
    }
  }

  /**
   * Get ANSI color code for log level
   * @private
   */
  _getColorCode(level) {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
    };
    return colors[level] || '\x1b[0m';
  }

  /**
   * Log debug level message
   */
  debug(message, metadata = null) {
    this._writeLog(LOG_LEVELS.DEBUG, message, metadata);
  }

  /**
   * Log info level message
   */
  info(message, metadata = null) {
    this._writeLog(LOG_LEVELS.INFO, message, metadata);
  }

  /**
   * Log warning level message
   */
  warn(message, metadata = null) {
    this._writeLog(LOG_LEVELS.WARN, message, metadata);
  }

  /**
   * Log error level message
   */
  error(message, metadata = null) {
    this._writeLog(LOG_LEVELS.ERROR, message, metadata);
  }

  /**
   * Get log file path
   */
  getLogFile() {
    return this.logFile;
  }

  /**
   * Clear old log files (older than specified days)
   */
  static clearOldLogs(olderThanDays = 7) {
    try {
      const files = fs.readdirSync(logsDir);
      const now = Date.now();
      const maxAge = olderThanDays * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log file: ${file}`);
        }
      });
    } catch (err) {
      console.error('Error clearing old logs:', err.message);
    }
  }
}

module.exports = Logger;
