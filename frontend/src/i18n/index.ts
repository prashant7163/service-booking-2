import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { de } from './de';
import { en, type TranslationKey } from './en';

export type Language = 'en' | 'de';
const storageKey = 'service-booking-2-language';
const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, de };

function browserLanguage(): Language {
  const saved = localStorage.getItem(storageKey);
  if (saved === 'en' || saved === 'de') return saved;
  const preferred = navigator.languages.find((language) => ['en', 'de'].includes(language.toLowerCase().split('-')[0] ?? ''));
  return preferred?.toLowerCase().startsWith('de') ? 'de' : 'en';
}

interface I18nValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const fallback: I18nValue = { language: 'en', setLanguage: () => undefined, t: (key) => en[key] };
const I18nContext = createContext<I18nValue>(fallback);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(browserLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage(next) {
        localStorage.setItem(storageKey, next);
        setLanguageState(next);
      },
      t: (key) => dictionaries[language][key],
    }),
    [language],
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
