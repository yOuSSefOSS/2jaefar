/**
 * i18n setup — requires: npm install i18next react-i18next i18next-browser-languagedetector
 * Until installed, a no-op stub is exported so the app builds without errors.
 */
let i18n: any;

try {
  const i18next = require('i18next');
  const { initReactI18next } = require('react-i18next');
  const LanguageDetector = require('i18next-browser-languagedetector');

  i18n = i18next.default;

  if (!i18n.isInitialized) {
    i18n
      .use(LanguageDetector.default)
      .use(initReactI18next)
      .init({
        resources: {
          en: {
            common: require('./locales/en/common.json'),
            academy: require('./locales/en/academy.json'),
            lab: require('./locales/en/lab.json'),
          },
        },
        fallbackLng: 'en',
        defaultNS: 'common',
        interpolation: { escapeValue: false },
      });
  }
} catch {
  // i18next not installed yet — stub
  i18n = { language: 'en', changeLanguage: () => Promise.resolve(), isInitialized: false };
}

export default i18n;
