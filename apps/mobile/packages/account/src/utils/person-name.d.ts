import { PersonName } from '../types';
/**
 * Person name formatting styles
 */
export declare enum PersonNameStyle {
    /** Full name with all components (e.g., "Dr. Leland Stanford Jr.") */
    Long = "long",
    /** Medium format with prefix, given, family, suffix (e.g., "Dr. Leland Stanford Jr.") */
    Medium = "medium",
    /** Short format with given and family name only (e.g., "Leland Stanford") */
    Short = "short",
    /** Abbreviated format (e.g., "L. Stanford") */
    Abbreviated = "abbreviated"
}
/**
 * Format a PersonName into a display string
 *
 * @param name - The PersonName object to format
 * @param style - The formatting style to use (default: Short)
 * @returns Formatted name string
 *
 * @example
 * ```ts
 * const name: PersonName = {
 *   givenName: 'Leland',
 *   familyName: 'Stanford',
 *   namePrefix: 'Dr.',
 *   nameSuffix: 'Jr.'
 * };
 *
 * formatPersonName(name, PersonNameStyle.Long)
 * // Returns: "Dr. Leland Stanford Jr."
 *
 * formatPersonName(name, PersonNameStyle.Short)
 * // Returns: "Leland Stanford"
 * ```
 */
export declare function formatPersonName(name: PersonName | undefined | null, style?: PersonNameStyle): string;
/**
 * Parse a simple name string into PersonName components
 *
 * This is a basic parser that splits on spaces and assumes:
 * - First word is given name
 * - Last word is family name
 * - Middle words are middle names
 *
 * For more complex names, create PersonName objects directly.
 *
 * @param nameString - The name string to parse
 * @returns PersonName object
 *
 * @example
 * ```ts
 * parsePersonName('Leland Stanford')
 * // Returns: { givenName: 'Leland', familyName: 'Stanford' }
 *
 * parsePersonName('John Paul Stanford')
 * // Returns: { givenName: 'John', middleName: 'Paul', familyName: 'Stanford' }
 * ```
 */
export declare function parsePersonName(nameString: string | undefined | null): PersonName | undefined;
/**
 * Normalize a name input - accepts either PersonName or string
 *
 * @param name - PersonName object or string
 * @returns PersonName object
 */
export declare function normalizePersonName(name: PersonName | string | undefined | null): PersonName | undefined;
/**
 * Check if a PersonName has any components
 *
 * @param name - The PersonName to check
 * @returns true if at least one name component exists
 */
export declare function isPersonNameEmpty(name: PersonName | undefined | null): boolean;
/**
 * Get initials from a PersonName
 *
 * @param name - The PersonName object
 * @returns Initials (e.g., "LS" for Leland Stanford)
 */
export declare function getPersonNameInitials(name: PersonName | undefined | null): string;
//# sourceMappingURL=person-name.d.ts.map