import React from 'react';
import { ViewStyle, TextStyle, TextInputProps } from 'react-native';
export interface RegisterFormProps {
    /** Callback when registration is successful */
    onSuccess?: () => void;
    /** Callback when an error occurs */
    onError?: (error: Error) => void;
    /** Custom styles for the container */
    containerStyle?: ViewStyle;
    /** Custom styles for input fields */
    inputStyle?: TextStyle;
    /** Custom styles for the button */
    buttonStyle?: ViewStyle;
    /** Custom styles for button text */
    buttonTextStyle?: TextStyle;
    /** Custom styles for error text */
    errorStyle?: TextStyle;
    /** Button text (default: "Register") */
    buttonText?: string;
    /** Minimum password length (default: 6) */
    minPasswordLength?: number;
    /** Show link to sign in (default: true) */
    showSignInLink?: boolean;
    /** Callback when sign in link is pressed */
    onSignInPress?: () => void;
    /** Additional props for email input */
    emailInputProps?: Partial<TextInputProps>;
    /** Additional props for password input */
    passwordInputProps?: Partial<TextInputProps>;
    /** Additional props for confirm password input */
    confirmPasswordInputProps?: Partial<TextInputProps>;
}
/**
 * RegisterForm - A customizable registration form component
 *
 * This component provides a ready-to-use registration form with email/password inputs
 * and password confirmation. It integrates with the AccountProvider to handle account creation.
 *
 * The component includes built-in validation:
 * - All fields are required
 * - Password and confirm password must match
 * - Password must meet minimum length requirement (default: 6 characters)
 *
 * The component is highly customizable through style props, or you can build
 * your own form using the useAccount hook directly.
 *
 * @example
 * ```tsx
 * import { RegisterForm } from '@spezivibe/account';
 *
 * function RegisterScreen() {
 *   return (
 *     <RegisterForm
 *       onSuccess={() => navigation.navigate('Home')}
 *       onError={(error) => alert(error.message)}
 *       buttonStyle={{ backgroundColor: '#007AFF' }}
 *       minPasswordLength={8}
 *     />
 *   );
 * }
 * ```
 */
export declare function RegisterForm({ onSuccess, onError, containerStyle, inputStyle, buttonStyle, buttonTextStyle, errorStyle, buttonText, minPasswordLength, showSignInLink, onSignInPress, emailInputProps, passwordInputProps, confirmPasswordInputProps, }: RegisterFormProps): React.JSX.Element;
//# sourceMappingURL=RegisterForm.d.ts.map