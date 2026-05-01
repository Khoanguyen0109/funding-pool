export const DATETIME_LOCALE_STORAGE_KEY = 'manage_datetime_locale';

export const DATETIME_LOCALE_OPTIONS = [
  { value: 'vi-VN', label: 'Tiếng Việt (Việt Nam)' },
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'ja-JP', label: '日本語 (日本)' },
  { value: 'ko-KR', label: '한국어 (대한민국)' },
  { value: 'zh-CN', label: '中文 (中国)' },
  { value: 'fr-FR', label: 'Français (France)' },
  { value: 'de-DE', label: 'Deutsch (Deutschland)' },
] as const;

export type DatetimeLocaleTag = (typeof DATETIME_LOCALE_OPTIONS)[number]['value'];

export const DATETIME_LOCALE_VALUES: DatetimeLocaleTag[] = DATETIME_LOCALE_OPTIONS.map((o) => o.value);

export const DEFAULT_DATETIME_LOCALE: DatetimeLocaleTag = 'vi-VN';

export function normalizeDatetimeLocale(tag: string | null | undefined): DatetimeLocaleTag {
  if (!tag) return DEFAULT_DATETIME_LOCALE;
  const t = tag.trim();
  const canonical = DATETIME_LOCALE_VALUES.find((v) => v.toLowerCase() === t.toLowerCase());
  if (canonical) return canonical;
  return DEFAULT_DATETIME_LOCALE;
}
