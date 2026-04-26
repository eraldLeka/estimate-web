import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import sq from './locales/sq.json'

const LANG_STORAGE_KEY = 'preventive_app_lang'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sq: { translation: sq },
    },
    supportedLngs: ['sq', 'en'],
    nonExplicitSupportedLngs: true,
    fallbackLng: 'sq',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

if (typeof document !== 'undefined') {
  const current = i18n.resolvedLanguage || i18n.language || 'sq'
  document.documentElement.lang = current

  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANG_STORAGE_KEY, lng)
    }
  })
}

export { LANG_STORAGE_KEY }
export default i18n
