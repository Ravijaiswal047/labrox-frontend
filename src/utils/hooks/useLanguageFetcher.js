import { useCallback, useRef } from "react";
import i18next from "i18next";
import { axiosInstance } from "../axiosInstance";

/* Deterministic i18n key derived from the backend record id - no hardcoded
   language list, so any language added in LanguageMaster works automatically. */
export const buildLanguageKey = (id) => `lang-${id}`;

export const fetchLanguageList = async () => {
  const res = await axiosInstance.get("LanguageMaster/GetLanguages");

  if (res?.data?.success && Array.isArray(res?.data?.message)) {
    return res.data.message.map((item) => ({
      id: item.Id,
      key: buildLanguageKey(item.Id),
      label: item.LanguageName,
      icon: item.FlagBase64,
    }));
  }

  return [];
};

export const useLanguageFetcher = () => {
  const loadedLanguages = useRef(new Set());

  const fetchLanguage = useCallback(async ({ key, label }) => {
    if (!key || !label) return;

    try {
      const res = await axiosInstance.get(
        "LanguageMaster/GetLanguageKeywordNameByLanguageName",
        {
          params: {
            LanguageName: label,
          },
        }
      );

      if (Array.isArray(res?.data?.message) && res.data.message.length > 0) {
        const translation = {};

        res.data.message.forEach((item) => {
          if (item.DISPLAYNAME && item.DISPLAYNAME.trim() !== "") {
            translation[item.FIELDNAME] = item.DISPLAYNAME;
          } else if (!translation[item.FIELDNAME]) {
            translation[item.FIELDNAME] = item.FIELDNAME;
          }
        });

        if (i18next.hasResourceBundle(key, "translation")) {
          i18next.removeResourceBundle(key, "translation");
        }

        i18next.addResourceBundle(key, "translation", translation, true, false);
        loadedLanguages.current.add(key);
      } else {
        console.warn(`No translations received for ${label}`, res?.data?.message);
      }
    } catch (error) {
      console.error(`Error fetching language ${label}:`, error);
    }
  }, []);

  return { fetchLanguage };
};
