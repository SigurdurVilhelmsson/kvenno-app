import { useState, useEffect, useCallback } from 'react';

type Language = 'is' | 'en' | 'pl';

interface TranslationDictionary {
  [key: string]: any;
}

const translations: Record<Language, TranslationDictionary> = {
  is: {} as TranslationDictionary,
  en: {} as TranslationDictionary,
  pl: {} as TranslationDictionary,
};

// Load translations dynamically
const loadTranslations = async (lang: Language): Promise<TranslationDictionary> => {
  if (Object.keys(translations[lang]).length > 0) {
    return translations[lang];
  }

  try {
    const response = await fetch(`/shared/i18n/${lang}.json`);
    const data = await response.json();
    translations[lang] = data;
    return data;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
    return translations.is; // Fallback to Icelandic
  }
};

/**
 * Hook for internationalization support
 *
 * @example
 * const { t, language, setLanguage } = useI18n();
 * const title = t('mainMenu.title');
 */
export const useI18n = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kvenno-language');
    return (saved as Language) || 'is';
  });

  const [currentTranslations, setCurrentTranslations] = useState<TranslationDictionary>({});

  useEffect(() => {
    loadTranslations(language).then(setCurrentTranslations);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kvenno-language', lang);
  }, []);

  /**
   * Translate a key using dot notation
   * @param key - Translation key (e.g., 'mainMenu.title')
   * @param fallback - Fallback text if translation not found
   */
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split('.');
      let value: any = currentTranslations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return fallback || key;
        }
      }

      return typeof value === 'string' ? value : fallback || key;
    },
    [currentTranslations]
  );

  return {
    t,
    language,
    setLanguage,
    availableLanguages: ['is', 'en', 'pl'] as Language[],
  };
};

export type { Language };
