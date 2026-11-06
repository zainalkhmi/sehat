/**
 * Account field keys
 * Provides type-safe references to user account fields
 */
export var AccountKey;
(function (AccountKey) {
    // Core identifiers
    AccountKey["UserId"] = "email";
    AccountKey["AccountId"] = "uid";
    // Profile fields
    AccountKey["Name"] = "name";
    AccountKey["DateOfBirth"] = "dateOfBirth";
    AccountKey["Sex"] = "sex";
    AccountKey["PhoneNumber"] = "phoneNumber";
    AccountKey["Biography"] = "biography";
    AccountKey["ProfileImageUrl"] = "profileImageUrl";
    // Timestamps
    AccountKey["CreatedAt"] = "createdAt";
    AccountKey["UpdatedAt"] = "updatedAt";
})(AccountKey || (AccountKey = {}));
/**
 * Sex options
 */
export var Sex;
(function (Sex) {
    Sex["Male"] = "male";
    Sex["Female"] = "female";
    Sex["Other"] = "other";
    Sex["PreferNotToState"] = "prefer-not-to-state";
})(Sex || (Sex = {}));
