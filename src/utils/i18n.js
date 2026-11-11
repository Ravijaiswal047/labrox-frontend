// import i18n from "i18next";
// import { initReactI18next } from "react-i18next";

// import translationEN from "../locales/en/translation.json";
// import translationHI from "../locales/hi/translation.json";
// import translationAR from "../locales/ar/translation.json";
// import translationFA from "../locales/fa/translation.json";
// import translationRU from "../locales/ru/translation.json";
// import translationSW from "../locales/sw/translation.json";
// import translationDE from "../locales/de/translation.json";
// import translationES from "../locales/es/translation.json";
// import translationTA from "../locales/ta/translation.json";
// import translationTE from "../locales/te/translation.json";
// import translationPA from "../locales/pa/translation.json";
// import translationBL from "../locales/bl/translation.json";
// import translationBang from "../locales/bang/translation.json";
// import translationIndo from "../locales/indo/translation.json";
// import { useLocalStorage } from "./hooks/useLocalStorage";
// import Block from "quill/blots/block";

// // the translations
// const resources = {
//   en: {
//     translation: translationEN,
//   },

//   hi: {
//     translation: translationHI,
//   },
//   ar: {
//     translation: translationAR,
//   },

//   fa: {
//     translation: translationFA,
//   },
//   ru: {
//     translation: translationRU,
//   },

//   sw: {
//     translation: translationSW,
//   },
//   de: {
//     translation: translationDE,
//   },
//   es: {
//     translation: translationES,
//   },
//   ta: {
//     translation: translationTA,
//   },
//   te: {
//     translation: translationTE,
//   },
//   pa: {
//     translation: translationPA,
//   },
//   bl: {
//     translation: translationBL,
//   },
//   bang: {
//     translation: translationBang,
//   },
//   indo: {
//     translation: translationIndo,
//   },
// };
// const language = useLocalStorage("language", "get");
// i18n
//   .use(initReactI18next) // passes i18n down to react-i18next
//   .init({
//     resources,
//     lng: language,
//     fallbackLng: "en",
//     debug: false,
//     interpolation: {
//       escapeValue: false, // react already safes from xss
//     },

//     react: {
//       wait: true,
//     },
//   });

// export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useLocalStorage } from "./hooks/useLocalStorage";

// Remove all these local JSON imports - we don't need them anymore
// import translationEN from "../locales/en/translation.json";
// import translationHI from "../locales/hi/translation.json";
// ... etc

// Start with empty resources - translations will be loaded from API
const resources = {};

// Maps the two-letter EmpLanguageCode stored at login onto the LanguageName the
// backend uses. LanguageProvider needs it to turn a legacy stored code into one
// of the "lang-<Id>" keys the language list is built from.
export const languageNameMap = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  pa: "Punjabi",
  bl: "Bundeli",
  ru: "Russian",
  ar: "Arabic",
  fa: "Farsi",
  sw: "Swahili",
  de: "German",
  es: "Spanish",
  bang: "Bangla",
  indo: "Indonesia",
};

// Read through useLocalStorage. Everything under this key is AES encrypted, so
// the previous localStorage.getItem("language") handed i18next the ciphertext as
// its language code. Nothing ever matched it, which is why the real language was
// only ever decided later, by whichever loader happened to finish first.
let language = "en"; // default fallback
try {
  const storedLanguage = useLocalStorage("language", "get");
  if (storedLanguage) {
    language = storedLanguage;
  }
} catch (error) {
  console.warn("Could not read language from localStorage:", error);
}

i18n.use(initReactI18next).init({
  resources, // Empty - will be populated by API calls
  lng: language,
  fallbackLng: "en",
  debug: false,

  interpolation: {
    escapeValue: false, // react already safes from xss
  },

  react: {
    useSuspense: false, // Important: set to false to avoid suspense issues
  },

  // Return the key if translation is missing (helps with debugging)
  returnEmptyString: false,
  returnNull: false,

  // Don't save missing keys
  saveMissing: false,

  // Load translations synchronously from API
  partialBundledLanguages: true,
});

export default i18n;
