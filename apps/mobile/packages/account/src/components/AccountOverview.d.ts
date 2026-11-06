import React from 'react';
import { TextStyle, ViewStyle } from 'react-native';
export interface AccountOverviewProps {
    /** Custom styles for the container */
    containerStyle?: ViewStyle;
    /** Custom styles for section headers */
    sectionHeaderStyle?: TextStyle;
    /** Custom styles for field labels */
    labelStyle?: TextStyle;
    /** Custom styles for field values */
    valueStyle?: TextStyle;
    /** Custom styles for action buttons */
    buttonStyle?: ViewStyle;
    /** Custom styles for button text */
    buttonTextStyle?: TextStyle;
    /** Show edit profile button (default: true) */
    showEditProfile?: boolean;
    /** Show change password button (default: true) */
    showChangePassword?: boolean;
    /** Show logout button (default: true) */
    showLogout?: boolean;
    /** Custom text for change password button (default: "Change Password") */
    changePasswordButtonText?: string;
    /** Callback when edit profile is pressed */
    onEditProfile?: () => void;
    /** Callback when change password is pressed */
    onChangePassword?: () => void;
    /** Callback when logout is pressed */
    onLogout?: () => void;
}
/**
 * AccountOverview - Display and manage user account information
 *
 * This component displays the current user's profile information
 * and provides actions for account management.
 *
 * @example
 * ```tsx
 * import { AccountOverview } from '@spezivibe/account';
 *
 * function ProfileScreen() {
 *   return (
 *     <AccountOverview
 *       onEditProfile={() => navigation.navigate('EditProfile')}
 *       onChangePassword={() => navigation.navigate('ChangePassword')}
 *     />
 *   );
 * }
 * ```
 */
export declare function AccountOverview({ containerStyle, sectionHeaderStyle, labelStyle, valueStyle, buttonStyle, buttonTextStyle, showEditProfile, showChangePassword, showLogout, changePasswordButtonText, onEditProfile, onChangePassword, onLogout, }: AccountOverviewProps): React.JSX.Element;
//# sourceMappingURL=AccountOverview.d.ts.map