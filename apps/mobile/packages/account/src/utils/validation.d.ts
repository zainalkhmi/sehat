/**
 * Validation utilities for account forms
 * Provides consistent validation logic across all components
 */
export interface ValidationResult {
    valid: boolean;
    message?: string;
}
/**
 * Validate email address format
 *
 * @param email - Email address to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateEmail('test@example.com');
 * if (!result.valid) {
 *   showError(result.message);
 * }
 * ```
 */
export declare function validateEmail(email: string): ValidationResult;
/**
 * Validate password meets minimum requirements
 *
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 8)
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validatePassword('MyPass123');
 * if (!result.valid) {
 *   showError(result.message);
 * }
 * ```
 */
export declare function validatePassword(password: string, minLength?: number): ValidationResult;
/**
 * Validate password strength (uppercase, lowercase, number)
 *
 * @param password - Password to validate
 * @returns Validation result with specific error message
 *
 * @example
 * ```typescript
 * const result = validatePasswordStrength('weakpass');
 * if (!result.valid) {
 *   showError(result.message); // "Password must contain an uppercase letter"
 * }
 * ```
 */
export declare function validatePasswordStrength(password: string): ValidationResult;
/**
 * Validate that two passwords match
 *
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation result with error message if they don't match
 *
 * @example
 * ```typescript
 * const result = validatePasswordMatch('pass123', 'pass456');
 * if (!result.valid) {
 *   showError(result.message); // "Passwords do not match"
 * }
 * ```
 */
export declare function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult;
/**
 * Sanitize text input by trimming whitespace and removing dangerous characters
 *
 * @param input - Text to sanitize
 * @returns Sanitized text
 *
 * @example
 * ```typescript
 * const clean = sanitizeInput('  test@example.com  ');
 * // Returns: "test@example.com"
 * ```
 */
export declare function sanitizeInput(input: string): string;
/**
 * Normalize email address (trim and lowercase)
 *
 * @param email - Email to normalize
 * @returns Normalized email
 *
 * @example
 * ```typescript
 * const normalized = normalizeEmail('  Test@Example.COM  ');
 * // Returns: "test@example.com"
 * ```
 */
export declare function normalizeEmail(email: string): string;
//# sourceMappingURL=validation.d.ts.map