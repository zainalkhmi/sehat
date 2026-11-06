import React from 'react';
import { AccountContextValue, AccountProviderProps } from '../types';
/**
 * AccountProvider - Provides account management context to the app
 *
 * This provider manages authentication state and provides login/register/logout
 * functionality to child components. It wraps an AccountService implementation
 * and exposes a clean React API via the useAccount hook.
 *
 * This provider is storage-agnostic - it delegates all authentication
 * logic to the injected AccountService.
 *
 * @example
 * ```tsx
 * import { AccountProvider, InMemoryAccountService } from '@spezivibe/account';
 * // Or for Firebase: import { FirebaseAccountService } from '@spezivibe/firebase';
 *
 * const accountService = new InMemoryAccountService();
 *
 * function App() {
 *   return (
 *     <AccountProvider
 *       accountService={accountService}
 *       onLogin={(user) => console.log('User logged in:', user)}
 *     >
 *       <YourApp />
 *     </AccountProvider>
 *   );
 * }
 * ```
 */
export declare function AccountProvider({ accountService, configuration, children, onLogin, onLogout, onAccountEvent, }: AccountProviderProps): React.JSX.Element;
/**
 * Hook to access account context
 *
 * Must be used within an AccountProvider. Provides access to authentication
 * state and methods for login, register, and logout.
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { login, isLoading, error } = useAccount();
 *
 *   const handleLogin = async () => {
 *     try {
 *       await login('user@example.com', 'password');
 *       // Navigate to main app
 *     } catch (err) {
 *       // Error is available in the error state
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       <Button onPress={handleLogin} disabled={isLoading}>
 *         {isLoading ? 'Logging in...' : 'Login'}
 *       </Button>
 *       {error && <Text>{error}</Text>}
 *     </View>
 *   );
 * }
 * ```
 */
export declare function useAccount(): AccountContextValue;
//# sourceMappingURL=AccountProvider.d.ts.map