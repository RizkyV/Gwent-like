import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/translation.json';
import da from '../locales/da/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      da: { translation: da },
      // Add other languages here
    },
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'da'],
    interpolation: { escapeValue: false }
  });

export default i18n;