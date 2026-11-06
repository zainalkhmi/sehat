import React from 'react';
import { ViewStyle, TextStyle, TextInputProps } from 'react-native';
export interface SignInFormProps {
    /** Callback when sign in is successful */
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
    /** Button text (default: "Sign In") */
    buttonText?: string;
    /** Show link to register (default: true) */
    showRegisterLink?: boolean;
    /** Callback when register link is pressed */
    onRegisterPress?: () => void;
    /** Additional props for email input */
    emailInputProps?: Partial<TextInputProps>;
    /** Additional props for password input */
    passwordInputProps?: Partial<TextInputProps>;
}
/**
 * SignInForm - A customizable sign-in form component
 *
 * This component provides a ready-to-use sign-in form with email/password inputs.
 * It integrates with the AccountProvider to handle authentication.
 *
 * The component is highly customizable through style props, or you can build
 * your own form using the useAccount hook directly.
 *
 * @example
 * ```tsx
 * import { SignInForm } from '@spezivibe/account';
 *
 * function LoginScreen() {
 *   return (
 *     <SignInForm
 *       onSuccess={() => navigation.navigate('Home')}
 *       onError={(error) => alert(error.message)}
 *       buttonStyle={{ backgroundColor: '#007AFF' }}
 *     />
 *   );
 * }
 * ```
 */
export declare function SignInForm({ onSuccess, onError, containerStyle, inputStyle, buttonStyle, buttonTextStyle, errorStyle, buttonText, showRegisterLink, onRegisterPress, emailInputProps, passwordInputProps, }: SignInFormProps): React.JSX.Element;
//# sourceMappingURL=SignInForm.d.ts.map