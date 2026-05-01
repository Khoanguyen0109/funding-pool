import { getActiveLocale } from '@/utils/localeSync';

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
];

const symbolMap = new Map(CURRENCIES.map((c) => [c.code, c.symbol]));

export function getCurrencySymbol(code: string): string {
  return symbolMap.get(code) ?? code;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function cacheKey(currency: string, locale: string): string {
  return `${locale}\0${currency}`;
}

function getFormatter(currency: string): Intl.NumberFormat {
  const locale = getActiveLocale();
  const key = cacheKey(currency, locale);
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    );
  }
  return formatterCache.get(key)!;
}

export function formatMoney(amount: number, currency = 'VND'): string {
  return getFormatter(currency).format(amount);
}

/**
 * Format a raw input string into a display string with thousand separators.
 * Accepts digits, one decimal point, and up to `decimals` fractional digits.
 * Returns { display, raw } where `raw` is the sanitised numeric string.
 */
export function formatCurrencyInput(
  value: string,
  decimals = 2,
): { display: string; raw: string } {
  let sanitised = value.replace(/[^\d.]/g, '');

  const dotIdx = sanitised.indexOf('.');
  if (dotIdx !== -1) {
    const intPart = sanitised.slice(0, dotIdx);
    const fracPart = sanitised.slice(dotIdx + 1).replace(/\./g, '').slice(0, decimals);
    sanitised = `${intPart}.${fracPart}`;
  }

  if (sanitised === '' || sanitised === '.') return { display: '', raw: '' };

  const [integer, fraction] = sanitised.split('.');
  const withCommas = (integer ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const display = fraction !== undefined ? `${withCommas}.${fraction}` : withCommas;
  return { display, raw: sanitised };
}
