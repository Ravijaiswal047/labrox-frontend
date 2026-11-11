import React, { createContext, useContext, useState, useEffect } from "react";
import i18next from "i18next";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import {
  useLanguageFetcher,
  fetchLanguageList,
} from "../utils/hooks/useLanguageFetcher";

// Create the Language Context
const LanguageContext = createContext();

// Custom hook to use the Language Context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const { fetchLanguage } = useLanguageFetcher();

  // Full language list, sourced entirely from LanguageMaster/GetLanguages - no static list
  const [languageList, setLanguageList] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState(null);

  // Fetch the language list and initialize the active language on mount
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const list = await fetchLanguageList();
        setLanguageList(list);

        if (list.length === 0) return;

        const savedLang = useLocalStorage("language", "get");
        const userData = useLocalStorage("userData", "get");
        const empLang = (userData?.EmpLanguage || "").trim().toLowerCase();

        // 1. Find English in the list (system default)
        const englishLang =
          list.find((l) => l.label?.toLowerCase() === "english") ||
          list.find((l) => l.key === "lang-2" || l.id === 2) ||
          list[0];

        // 2. Find Hindi in the list
        const hindiLang = list.find((l) => l.label?.toLowerCase() === "hindi");

        // Helper to find any language by key, id, code, or label
        const findInList = (val) => {
          if (!val) return null;
          const s = String(val).trim().toLowerCase();
          return list.find(
            (l) =>
              l.key?.toLowerCase() === s ||
              String(l.id) === s ||
              l.label?.toLowerCase() === s ||
              (s === "en" && l.label?.toLowerCase() === "english") ||
              (s === "hi" && l.label?.toLowerCase() === "hindi")
          );
        };

        // Determine user's desired language
        let selectedLang = englishLang;

        // Check if user explicitly chose Hindi (either in profile or explicitly saved)
        const isExplicitHindi =
          empLang === "hindi" ||
          savedLang === "hi" ||
          (savedLang === hindiLang?.key && empLang === "hindi");

        if (isExplicitHindi && hindiLang) {
          selectedLang = hindiLang;
        } else if (savedLang && savedLang !== "en" && savedLang !== hindiLang?.key) {
          const matched = findInList(savedLang);
          if (matched) selectedLang = matched;
        } else if (empLang && empLang !== "hindi") {
          const matched = findInList(empLang);
          if (matched) selectedLang = matched;
        }

        // Set the active language and fix localStorage if it was corrupted to lang-1
        setCurrentLanguage(selectedLang);
        // Store the resolved key so the next load matches on the first try.
        useLocalStorage("language", "set", selectedLang.key);

        // Fetch translations for the selected language
        await fetchLanguage({
          key: selectedLang.key,
          label: selectedLang.label,
        });

        // Ensure i18next is synced with the selected language key
        if (i18next.language !== selectedLang.key) {
          await i18next.changeLanguage(selectedLang.key);
        }
      } catch (error) {
        console.error("Error initializing language:", error);
      }
    };

    initLanguage();
  }, [fetchLanguage]);

  // Function to update language
  const updateLanguage = (languageKey) => {
    const selectedLang = languageList.find((l) => l.key === languageKey);
    if (selectedLang) {
      setCurrentLanguage(selectedLang);
      useLocalStorage("language", "set", languageKey);
    }
  };

  const value = {
    languageList,
    currentLanguage,
    languageCode: currentLanguage?.key,
    languageLabel: currentLanguage?.label,
    updateLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
