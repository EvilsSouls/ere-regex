/**
 * @description Inserts one string into another string at the specified index.
 * @param string The string to insert the substring into.
 * @param substring The string to insert into the "parent" string.
 * @param index The position in the string to insert substring into.
 */
export function insertString(string: string, substring: string, index: number): string {
    return(`${string.slice(0, index)}${substring}${string.slice(index)}`);
}