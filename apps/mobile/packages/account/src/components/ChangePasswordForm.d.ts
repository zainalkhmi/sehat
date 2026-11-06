import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
export interface ChangePasswordFormProps {
    /** Callback when password change is successful */
    onSuccess?: () => void;
    /** Callback when an error occurs */
    onError?: (error: Error) => void;
    /** Custom styles for the container */
    containerStyle?: ViewStyle;
    /** Custom styles for input fields */
    inputStyle?: TextStyle;
    /** Custom styles for labels */
    labelStyle?: TextStyle;
    /** Custom styles for the button */
    buttonStyle?: ViewStyle;
    /** Custom styles for button text */
    buttonTextStyle?: TextStyle;
    /** Custom styles for error text */
    errorStyle?: TextStyle;
    /** Button text (default: "Change Password") */
    buttonText?: string;
    /** Show password requirements (default: true) */
    showRequirements?: boolean;
    /** Custom password validation function */
    validatePassword?: (password: string) => {
        valid: boolean;
        message?: string;
    };
}
/**
 * ChangePasswordForm - A customizable password change form component
 *
 * This component provides a ready-to-use form for changing user passwords.
 * It integrates with the AccountProvider to handle password updates.
 *
 * @example
 * ```tsx
 * import { ChangePasswordForm } from '@spezivibe/account';
 *
 * function ChangePasswordScreen() {
 *   return (
 *     <ChangePasswordForm
 *       onSuccess={() => {
 *         alert('Password changed successfully');
 *         navigation.goBack();
 *       }}
 *       onError={(error) => alert(error.message)}
 *       buttonStyle={{ backgroundColor: '#007AFF' }}
 *     />
 *   );
 * }
 * ```
 */
export declare function ChangePasswordForm({ onSuccess, onError, containerStyle, inputStyle, labelStyle, buttonStyle, buttonTextStyle, errorStyle, buttonText, showRequirements, validatePassword: customValidatePassword, }: ChangePasswordFormProps): React.JSX.Element;
//# sourceMappingURL=ChangePasswordForm.d.ts.map