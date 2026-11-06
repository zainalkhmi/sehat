import React from 'react';
import { ViewStyle, TextStyle, TextInputProps } from 'react-native';
export interface PasswordResetFormProps {
    /** Callback when password reset email is sent successfully */
    onSuccess?: () => void;
    /** Callback when an error occurs */
    onError?: (error: Error) => void;
    /** Custom styles for the container */
    containerStyle?: ViewStyle;
    /** Custom styles for input field */
    inputStyle?: TextStyle;
    /** Custom styles for the button */
    buttonStyle?: ViewStyle;
    /** Custom styles for button text */
    buttonTextStyle?: TextStyle;
    /** Custom styles for error text */
    errorStyle?: TextStyle;
    /** Custom styles for success message */
    successStyle?: TextStyle;
    /** Button text (default: "Send Reset Email") */
    buttonText?: string;
    /** Success message (default: "Password reset email sent! Check your inbox.") */
    successMessage?: string;
    /** Show back to login link (default: true) */
    showBackToLogin?: boolean;
    /** Callback when back to login is pressed */
    onBackToLogin?: () => void;
    /** Additional props for email input */
    emailInputProps?: Partial<TextInputProps>;
}
/**
 * PasswordResetForm - A password reset form component
 *
 * Provides a ready-to-use form for requesting password reset emails.
 *
 * @example
 * ```tsx
 * import { PasswordResetForm } from '@spezivibe/account';
 *
 * function ResetPasswordScreen() {
 *   return (
 *     <PasswordResetForm
 *       onSuccess={() => navigation.navigate('Login')}
 *       onError={(error) => alert(error.message)}
 *     />
 *   );
 * }
 * ```
 */
export declare function PasswordResetForm({ onSuccess, onError, containerStyle, inputStyle, buttonStyle, buttonTextStyle, errorStyle, successStyle, buttonText, successMessage, showBackToLogin, onBackToLogin, emailInputProps, }: PasswordResetFormProps): React.JSX.Element;
//# sourceMappingURL=PasswordResetForm.d.ts.map