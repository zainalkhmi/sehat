import { AccountService, LoginCredentials, RegisterCredentials, User, UserProfileUpdate } from '../types';
/**
 * Configuration options for InMemoryAccountService
 */
export interface InMemoryAccountServiceOptions {
    /**
     * Initial user to pre-populate
     * If not provided, uses a default local user
     */
    initialUser?: User;
    /**
     * Start unauthenticated (for testing onboarding flows)
     * Default: false (starts authenticated)
     */
    startUnauthenticated?: boolean;
    /**
     * Simulated network delay in milliseconds
     * Default: 100ms (0ms in test environment)
     */
    simulatedDelayMs?: number;
}
/**
 * In-memory implementation of AccountService for development/testing
 *
 * By default, starts authenticated with a local user for seamless development.
 * Set startUnauthenticated: true to test onboarding/auth flows.
 */
export declare class InMemoryAccountService implements AccountService {
    private options;
    private mockUser;
    private isLoggedIn;
    private authStateListeners;
    private logger;
    private delayMs;
    constructor(options?: InMemoryAccountServiceOptions);
    initialize(): Promise<void>;
    isAuthenticated(): Promise<boolean>;
    getCurrentUser(): Promise<User | null>;
    login(credentials: LoginCredentials): Promise<void>;
    register(credentials: RegisterCredentials): Promise<void>;
    logout(): Promise<void>;
    resetPassword(email: string): Promise<void>;
    updateProfile(updates: UserProfileUpdate): Promise<void>;
    updateEmail(newEmail: string, password: string): Promise<void>;
    updatePassword(currentPassword: string, newPassword: string): Promise<void>;
    deleteAccount(password: string): Promise<void>;
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
    /**
     * Cleanup resources and reset state
     */
    cleanup(): void;
    private notifyListeners;
    private simulateDelay;
}
//# sourceMappingURL=in-memory-account-service.d.ts.map