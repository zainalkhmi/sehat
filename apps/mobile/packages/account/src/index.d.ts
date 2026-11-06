/**
 * @spezivibe/account
 *
 * Account management module for React Native applications.
 * This module is storage-agnostic and provides a clean interface
 * for authentication and account management.
 *
 * @example
 * ```tsx
 * import {
 *   AccountProvider,
 *   useAccount,
 *   InMemoryAccountService,
 *   SignInForm,
 * } from '@spezivibe/account';
 *
 * const accountService = new InMemoryAccountService();
 *
 * function App() {
 *   return (
 *     <AccountProvider accountService={accountService}>
 *       <YourApp />
 *     </AccountProvider>
 *   );
 * }
 *
 * function LoginScreen() {
 *   return <SignInForm onSuccess={() => navigate('Home')} />;
 * }
 * ```
 */
export * from './types';
export { AccountProvider, useAccount } from './providers/AccountProvider';
export { InMemoryAccountService } from './services/in-memory-account-service';
export type { InMemoryAccountServiceOptions } from './services/in-memory-account-service';
export { SignInForm, RegisterForm, PasswordResetForm, AccountOverview, EditProfileForm, ChangePasswordForm } from './components';
export type { SignInFormProps, RegisterFormProps, PasswordResetFormProps, AccountOverviewProps, EditProfileFormProps, ChangePasswordFormProps } from './components';
export { AccountError, AccountErrorCode, getErrorMessage, isAccountError, validateEmail, validatePassword, validatePasswordStrength, validatePasswordMatch, sanitizeInput, normalizeEmail, type ValidationResult, createLogger, LogLevel, } from './utils';
export { formatPersonName, parsePersonName, normalizePersonName, isPersonNameEmpty, getPersonNameInitials, PersonNameStyle, } from './utils/person-name';
//# sourceMappingURL=index.d.ts.map