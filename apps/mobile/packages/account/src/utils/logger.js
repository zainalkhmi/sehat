/**
 * Logging utility that respects __DEV__ flag
 * Prevents sensitive logs in production
 */
/**
 * Check if running in development mode
 * In React Native, __DEV__ is a global boolean
 */
const isDevelopment = () => {
    return typeof __DEV__ !== 'undefined' && __DEV__;
};
/**
 * Log levels
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (LogLevel = {}));
/**
 * Logger class for account service
 * Only logs in development mode
 */
class Logger {
    constructor(prefix) {
        this.prefix = prefix;
    }
    /**
     * Log debug message (development only)
     */
    debug(...args) {
        if (isDevelopment()) {
            console.log(`[${this.prefix}] [DEBUG]`, ...args);
        }
    }
    /**
     * Log info message (development only)
     */
    info(...args) {
        if (isDevelopment()) {
            console.log(`[${this.prefix}] [INFO]`, ...args);
        }
    }
    /**
     * Log warning (always logged)
     */
    warn(...args) {
        console.warn(`[${this.prefix}] [WARN]`, ...args);
    }
    /**
     * Log error (always logged)
     * Note: Error details are sanitized for production
     */
    error(message, error) {
        if (isDevelopment()) {
            console.error(`[${this.prefix}] [ERROR]`, message, error);
        }
        else {
            // In production, only log the message without details
            console.error(`[${this.prefix}] [ERROR]`, message);
        }
    }
}
/**
 * Create a logger instance for a service
 *
 * @param serviceName - Name of the service (e.g., 'FirebaseAccountService')
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * const logger = createLogger('MyService');
 * logger.info('Service initialized'); // Only logs in dev
 * logger.error('Operation failed', error); // Logs in prod (sanitized)
 * ```
 */
export function createLogger(serviceName) {
    return new Logger(serviceName);
}
