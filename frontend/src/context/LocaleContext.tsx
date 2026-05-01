import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  DATETIME_LOCALE_STORAGE_KEY,
  normalizeDatetimeLocale,
} from '@/constants/datetimeLocale';
import { readStoredDatetimeLocale, setActiveLocale } from '@/utils/localeSync';
import { usePatchMeMutation } from '@/store/api/authApi';

type LocaleContextValue = {
  locale: string;
  setLocale: (next: string) => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const [locale, setLocaleState] = useState(() => {
    const initial = readStoredDatetimeLocale();
    setActiveLocale(initial);
    return initial;
  });
  const [patchMe] = usePatchMeMutation();

  useEffect(() => {
    const next = user?.locale ? normalizeDatetimeLocale(user.locale) : readStoredDatetimeLocale();
    setLocaleState(next);
    setActiveLocale(next);
  }, [user?.id, user?.locale]);

  useEffect(() => {
    setActiveLocale(locale);
    try {
      localStorage.setItem(DATETIME_LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const setLocale = useCallback(
    async (nextRaw: string) => {
      const next = normalizeDatetimeLocale(nextRaw);
      setLocaleState(next);
      setActiveLocale(next);
      try {
        localStorage.setItem(DATETIME_LOCALE_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      if (token) {
        try {
          await patchMe({ locale: next }).unwrap();
        } catch {
          /* keep local preference */
        }
      }
    },
    [token, patchMe],
  );

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
