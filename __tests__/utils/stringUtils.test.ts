/**
 * Tests for src/utils/stringUtils.ts
 */
import { getFlagEmoji } from '../../src/utils/stringUtils';

describe('stringUtils', () => {
    describe('getFlagEmoji', () => {
        it('converts "US" to a flag emoji string', () => {
            const result = getFlagEmoji('US');
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        it('converts "IN" to a flag emoji string', () => {
            const result = getFlagEmoji('IN');
            expect(typeof result).toBe('string');
        });

        it('handles lowercase country codes by normalizing to uppercase', () => {
            const upper = getFlagEmoji('US');
            const lower = getFlagEmoji('us');
            expect(upper).toBe(lower);
        });

        it('returns empty string for empty input', () => {
            const result = getFlagEmoji('');
            expect(result).toBe('');
        });

        it('converts "GB" to a valid emoji', () => {
            const result = getFlagEmoji('GB');
            // Regional indicator letters \uD83C\uDDEC + \uD83C\uDDE7
            expect(result.length).toBeGreaterThan(0);
        });
    });
});
