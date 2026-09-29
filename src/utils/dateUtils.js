import dayjs from 'dayjs';

export const API_DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'DD MMM YYYY';
export const DISPLAY_DATETIME_FORMAT = 'DD MMM YYYY, HH:mm';

export function toApiDate(dayjsValue) {
  if (!dayjsValue) return null;
  return dayjs(dayjsValue).format(API_DATE_FORMAT);
}

export function formatDate(value) {
  if (!value) return '—';
  const d = dayjs(value);
  return d.isValid() ? d.format(DISPLAY_DATE_FORMAT) : '—';
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = dayjs(value);
  return d.isValid() ? d.format(DISPLAY_DATETIME_FORMAT) : '—';
}

// Default dashboard window: current month to date.
export function defaultDateRange() {
  return {
    from: dayjs().startOf('month'),
    to: dayjs(),
  };
}
