import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
export interface EditProfileFormProps {
    /** Callback when profile update is successful */
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
    /** Button text (default: "Save Changes") */
    buttonText?: string;
    /** Show first name field (default: true) */
    showFirstName?: boolean;
    /** Show last name field (default: true) */
    showLastName?: boolean;
    /** Show date of birth field (default: true) */
    showDateOfBirth?: boolean;
    /** Show sex field (default: true) */
    showSex?: boolean;
    /** Render custom picker button */
    renderPickerButton?: (props: {
        label: string;
        value: string;
        onPress: () => void;
        isOpen: boolean;
    }) => React.ReactNode;
    /** Render custom dropdown */
    renderDropdown?: (props: {
        options: {
            label: string;
            value: string;
        }[];
        selectedValue: string;
        onSelect: (value: string) => void;
    }) => React.ReactNode;
}
/**
 * EditProfileForm - A customizable profile editing form component
 *
 * This component provides a ready-to-use form for editing user profile
 * information. It integrates with the AccountProvider to handle profile updates.
 *
 * @example
 * ```tsx
 * import { EditProfileForm } from '@spezivibe/account';
 *
 * function EditProfileScreen() {
 *   return (
 *     <EditProfileForm
 *       onSuccess={() => navigation.goBack()}
 *       onError={(error) => alert(error.message)}
 *       buttonStyle={{ backgroundColor: '#007AFF' }}
 *     />
 *   );
 * }
 * ```
 */
export declare function EditProfileForm({ onSuccess, onError, containerStyle, inputStyle, labelStyle, buttonStyle, buttonTextStyle, buttonText, showFirstName, showLastName, showDateOfBirth, showSex, renderPickerButton, renderDropdown, }: EditProfileFormProps): React.JSX.Element;
//# sourceMappingURL=EditProfileForm.d.ts.map