/**
 * Tests for src/utils/dateUtils.ts
 */
import moment from 'moment';
import { formatDateTime, fromNow, formatDisplayDate, formatChatTimestamp } from '../../src/utils/dateUtils';

describe('dateUtils', () => {
    const originalConsoleWarn = console.warn;

    beforeEach(() => {
        console.warn = jest.fn();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
    });
    describe('formatDateTime', () => {
        it('formats a date string to YYYY-MM-DD HH:mm', () => {
            const result = formatDateTime('2026-03-09T10:30:00Z');
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
        });

        it('formats a Date object', () => {
            const date = new Date('2026-01-15T08:00:00Z');
            const result = formatDateTime(date);
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
        });
    });

    describe('fromNow', () => {
        it('returns a relative time string like "a few seconds ago"', () => {
            const result = fromNow(new Date());
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('formatDisplayDate', () => {
        it('returns empty string for null', () => {
            expect(formatDisplayDate(null)).toBe('');
        });

        it('returns empty string for undefined', () => {
            expect(formatDisplayDate(undefined)).toBe('');
        });

        it('returns empty string for empty string', () => {
            expect(formatDisplayDate('')).toBe('');
        });

        it('formats ISO 8601 date', () => {
            const result = formatDisplayDate('2026-03-09');
            expect(result).toBe('9 Mar 2026');
        });

        it('formats D MMM YYYY date', () => {
            const result = formatDisplayDate('9 Mar 2026');
            expect(result).toBe('9 Mar 2026');
        });

        it('formats DD MMM YYYY date', () => {
            const result = formatDisplayDate('09 Mar 2026');
            expect(result).toBe('9 Mar 2026');
        });

        it('formats YYYY/MM/DD date', () => {
            const result = formatDisplayDate('2026/03/09');
            expect(result).toBe('9 Mar 2026');
        });

        it('formats DD/MM/YYYY date', () => {
            const result = formatDisplayDate('09/03/2026');
            expect(result).toBe('9 Mar 2026');
        });

        it('formats a Date object', () => {
            const result = formatDisplayDate(new Date('2026-03-09T00:00:00Z'));
            expect(result).toContain('2026');
        });

        it('formats a timestamp number', () => {
            const result = formatDisplayDate(1741478400000); // 2025-03-09
            expect(typeof result).toBe('string');
        });

        it('returns string representation of invalid date-like input', () => {
            const result = formatDisplayDate('not-a-real-date');
            // Moment will try to parse it; if invalid, returns the string itself
            expect(typeof result).toBe('string');
        });
    });

    describe('formatChatTimestamp', () => {
        it('returns empty string for null', () => {
            expect(formatChatTimestamp(null)).toBe('');
        });

        it('returns empty string for undefined', () => {
            expect(formatChatTimestamp(undefined)).toBe('');
        });

        it('returns empty string for invalid date', () => {
            expect(formatChatTimestamp('not-a-date')).toBe('');
        });

        it('returns "Just Now" for very recent timestamps (< 1 minute)', () => {
            const now = new Date().toISOString();
            expect(formatChatTimestamp(now)).toBe('Just Now');
        });

        it('returns "Today HH:mm" for today timestamps (> 1 min ago)', () => {
            const todayEarlier = moment().subtract(30, 'minutes').toISOString();
            const result = formatChatTimestamp(todayEarlier);
            expect(result).toMatch(/^Today \d{2}:\d{2}/);
        });

        it('returns "Yesterday HH:mm" for yesterday timestamps', () => {
            const yesterday = moment().subtract(1, 'days').subtract(30, 'minutes').toISOString();
            const result = formatChatTimestamp(yesterday);
            expect(result).toMatch(/^Yesterday \d{2}:\d{2}/);
        });

        it('returns "D MMM YYYY" for older timestamps', () => {
            const old = '2025-01-01T10:00:00Z';
            const result = formatChatTimestamp(old);
            expect(result).toMatch(/^\d{1,2} \w{3} \d{4}$/);
        });

        it('handles Date objects', () => {
            const date = new Date();
            expect(formatChatTimestamp(date)).toBe('Just Now');
        });
    });
});
