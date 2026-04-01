import moment from 'moment';

export const formatDateTime = (date: Date | string) =>
  moment(date).format('YYYY-MM-DD HH:mm');

export const fromNow = (date: Date | string) => moment(date).fromNow();

const APP_DISPLAY_DATE_FORMAT = 'D MMM YYYY';

const SUPPORTED_INPUT_FORMATS = [
  moment.ISO_8601,
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'D MMM YYYY',
  'DD MMM YYYY',
  'D MMM, YYYY',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
] as const;

export const formatDisplayDate = (
  date: Date | string | number | null | undefined,
): string => {
  if (date === null || date === undefined) {
    return '';
  }

  const normalizedDate = typeof date === 'string' ? date.trim() : date;
  if (normalizedDate === '') {
    return '';
  }

  const strictParsedDate = moment(
    normalizedDate,
    SUPPORTED_INPUT_FORMATS as unknown as moment.MomentFormatSpecification,
    true,
  );

  if (strictParsedDate.isValid()) {
    return strictParsedDate.format(APP_DISPLAY_DATE_FORMAT);
  }

  const parsedDate = moment(normalizedDate);
  if (parsedDate.isValid()) {
    return parsedDate.format(APP_DISPLAY_DATE_FORMAT);
  }

  return String(date);
};

/**
 * Formats a date for chat timestamps as seen in the UI:
 * - < 1 minute: "Just Now"
 * - Today: "Today 09:00 AM"
 * - Yesterday: "Yesterday 09:00 PM"
 * - Older: "D MMM YYYY"
 */
export const formatChatTimestamp = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  const m = moment(date);
  if (!m.isValid()) return '';

  const now = moment();
  const diffInMinutes = now.diff(m, 'minutes');

  if (diffInMinutes < 1) {
    return 'Just Now';
  }

  if (m.isSame(now, 'day')) {
    return m.format('[Today] hh:mm A');
  }

  if (m.isSame(now.subtract(1, 'days'), 'day')) {
    // Note: subtract(1, 'days') mutates 'now' if not careful, but moment() above is fresh
    return m.format('[Yesterday] hh:mm A');
  }

  return m.format('D MMM YYYY');
};

