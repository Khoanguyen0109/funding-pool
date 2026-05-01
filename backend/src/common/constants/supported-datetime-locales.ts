/** BCP 47 tags accepted for user date/time & number formatting preference. */
export const SUPPORTED_DATETIME_LOCALES = [
  'vi-VN',
  'en-US',
  'en-GB',
  'ja-JP',
  'ko-KR',
  'zh-CN',
  'fr-FR',
  'de-DE',
] as const;

export type SupportedDatetimeLocale = (typeof SUPPORTED_DATETIME_LOCALES)[number];
