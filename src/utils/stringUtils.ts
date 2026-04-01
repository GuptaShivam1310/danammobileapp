/**
 * Converts a country code (e.g., 'US', 'IN') to its flag emoji.
 * @param countryCode The 2-letter country code.
 * @returns The flag emoji string.
 */
export const getFlagEmoji = (countryCode: string): string => {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};
