/**
 * Logging utility that respects __DEV__ flag
 * Prevents sensitive logs in production
 */
/**
 * Log levels
 */
export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}
/**
 * Logger class for account service
 * Only logs in development mode
 */
declare class Logger {
    private prefix;
    constructor(prefix: string);
    /**
     * Log debug message (development only)
     */
    debug(...args: any[]): void;
    /**
     * Log info message (development only)
     */
    info(...args: any[]): void;
    /**
     * Log warning (always logged)
     */
    warn(...args: any[]): void;
    /**
     * Log error (always logged)
     * Note: Error details are sanitized for production
     */
    error(message: string, error?: unknown): void;
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
export declare function createLogger(serviceName: string): Logger;
export {};
//# sourceMappingURL=logger.d.ts.map