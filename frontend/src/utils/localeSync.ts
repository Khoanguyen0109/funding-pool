import {
  DATETIME_LOCALE_STORAGE_KEY,
  DEFAULT_DATETIME_LOCALE,
  normalizeDatetimeLocale,
} from '@/constants/datetimeLocale';

let activeLocale = DEFAULT_DATETIME_LOCALE;

export function getActiveLocale(): string {
  return activeLocale;
}

export function setActiveLocale(locale: string): void {
  activeLocale = normalizeDatetimeLocale(locale);
}

/**
 * Stored preference, or product default `vi-VN` (not the browser language).
 */
export function readStoredDatetimeLocale(): string {
  try {
    const raw = localStorage.getItem(DATETIME_LOCALE_STORAGE_KEY);
    if (raw) return normalizeDatetimeLocale(raw);
  } catch {
    /* private mode / SSR */
  }
  return DEFAULT_DATETIME_LOCALE;
}
