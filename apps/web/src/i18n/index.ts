import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import vi from './locales/vi.json';
import en from './locales/en.json';

const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;
const DEFAULT_LANGUAGE = 'vi';

const stored =
  typeof window !== 'undefined' ? localStorage.getItem('travelmind_lang') : null;

const initialLanguage =
  stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)
    ? stored
    : DEFAULT_LANGUAGE;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    lng: initialLanguage,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'travelmind_lang',
    },
  });

document.documentElement.lang = i18n.language || DEFAULT_LANGUAGE;

i18n.on('languageChanged', (lang) => {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem('travelmind_lang', lang);
  } catch {
    /* ignore quota errors */
  }
});

export const SUPPORTED_LANGS = SUPPORTED_LANGUAGES;

export default i18n;
