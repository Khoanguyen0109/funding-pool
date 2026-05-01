import { getActiveLocale } from '@/utils/localeSync';

const noon = (isoDate: string) => new Date(`${isoDate}T12:00:00`);

export function formatLocaleDate(
  input: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString(getActiveLocale(), options);
}

/** `month` field from dashboard API: `YYYY-MM`. */
export function formatDashboardMonth(isoMonth: string): string {
  return noon(`${isoMonth}-01`).toLocaleDateString(getActiveLocale(), { month: 'short', year: 'numeric' });
}

export function formatTransactionGroupDaily(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString(getActiveLocale(), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTransactionGroupMonthly(monthKey: string): string {
  return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString(getActiveLocale(), {
    month: 'long',
    year: 'numeric',
  });
}

export function formatPoolSummaryMonth(isoMonthKey: string): string {
  return noon(`${isoMonthKey}-01`).toLocaleDateString(getActiveLocale(), {
    month: 'short',
    year: '2-digit',
  });
}

export function formatPoolSummaryDayPoint(isoInstant: string): string {
  return new Date(isoInstant).toLocaleDateString(getActiveLocale(), { month: 'short', day: 'numeric' });
}
