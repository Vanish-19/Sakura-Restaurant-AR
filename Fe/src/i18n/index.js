import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import jpn from './locales/jpn.json'
import vi from './locales/vi.json'

const resources = {
  en: { translation: en },
  vi: { translation: vi },
  jpn: { translation: jpn },
}

function normalizeDetectedLanguage(language) {
  const normalized = String(language || '').toLowerCase()

  if (normalized.startsWith('vi')) return 'vi'
  if (normalized.startsWith('ja') || normalized.startsWith('jp') || normalized.startsWith('jpn')) return 'jpn'
  if (normalized.startsWith('en')) return 'en'

  return 'vi'
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en', 'jpn'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'sakura_language',
      convertDetectedLanguage: normalizeDetectedLanguage,
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
