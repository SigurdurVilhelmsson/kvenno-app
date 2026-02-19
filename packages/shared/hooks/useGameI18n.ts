import { useState, useCallback, useMemo } from 'react';

export type Language = 'is' | 'en' | 'pl';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface GameTranslations {
  is: TranslationDictionary;
  en: TranslationDictionary;
  pl: TranslationDictionary;
}

const STORAGE_KEY = 'kvenno-language';
const DEFAULT_LANGUAGE: Language = 'is';

/**
 * Shared UI translations (common across all games)
 * These are imported directly for single-file builds
 */
const sharedTranslations: GameTranslations = {
  is: {
    common: {
      start: 'Byrja',
      continue: 'Halda áfram',
      next: 'Næsta',
      previous: 'Fyrri',
      submit: 'Staðfesta',
      cancel: 'Hætta við',
      close: 'Loka',
      reset: 'Endurstilla',
      save: 'Vista',
      back: 'Til baka',
      hint: 'Vísbending',
      skip: 'Sleppa',
      retry: 'Reyna aftur',
      correct: 'Rétt!',
      incorrect: 'Rangt',
      excellent: 'Frábært!',
      good: 'Gott!',
      tryAgain: 'Reyndu aftur',
      level: 'Stig',
      score: 'Stig',
      time: 'Tími',
      locked: 'Læst',
      completed: 'Lokið',
    },
    language: {
      select: 'Tungumál',
      is: 'Íslenska',
      en: 'English',
      pl: 'Polski',
    },
    levels: {
      level1: { name: 'Stig 1', description: 'Byrjendur' },
      level2: { name: 'Stig 2', description: 'Millistig' },
      level3: { name: 'Stig 3', description: 'Framhaldsstig' },
    },
    feedback: {
      success: 'Vel gert!',
      error: 'Villa kom upp',
      warning: 'Athugaðu betur',
      progressSaved: 'Framvinda vistuð',
      levelCompleted: 'Þú hefur lokið þessu stigi!',
      gameCompleted: 'Til hamingju! Þú hefur lokið leiknum!',
    },
    ui: {
      resetProgress: 'Endurstilla framvindu',
      resetConfirm: 'Ertu viss um að þú viljir endurstilla framvinduna?',
      learningPath: 'Námsferillinn',
      achievements: 'Árangur',
      settings: 'Stillingar',
    },
  },
  en: {
    common: {
      start: 'Start',
      continue: 'Continue',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      reset: 'Reset',
      save: 'Save',
      back: 'Back',
      hint: 'Hint',
      skip: 'Skip',
      retry: 'Retry',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      excellent: 'Excellent!',
      good: 'Good!',
      tryAgain: 'Try again',
      level: 'Level',
      score: 'Score',
      time: 'Time',
      locked: 'Locked',
      completed: 'Completed',
    },
    language: {
      select: 'Language',
      is: 'Íslenska',
      en: 'English',
      pl: 'Polski',
    },
    levels: {
      level1: { name: 'Level 1', description: 'Beginner' },
      level2: { name: 'Level 2', description: 'Intermediate' },
      level3: { name: 'Level 3', description: 'Advanced' },
    },
    feedback: {
      success: 'Well done!',
      error: 'An error occurred',
      warning: 'Please review',
      progressSaved: 'Progress saved',
      levelCompleted: 'You have completed this level!',
      gameCompleted: 'Congratulations! You have completed the game!',
    },
    ui: {
      resetProgress: 'Reset Progress',
      resetConfirm: 'Are you sure you want to reset all progress?',
      learningPath: 'Learning Path',
      achievements: 'Achievements',
      settings: 'Settings',
    },
  },
  pl: {
    common: {
      start: 'Rozpocznij',
      continue: 'Kontynuuj',
      next: 'Następny',
      previous: 'Poprzedni',
      submit: 'Zatwierdź',
      cancel: 'Anuluj',
      close: 'Zamknij',
      reset: 'Resetuj',
      save: 'Zapisz',
      back: 'Wstecz',
      hint: 'Wskazówka',
      skip: 'Pomiń',
      retry: 'Spróbuj ponownie',
      correct: 'Prawidłowo!',
      incorrect: 'Nieprawidłowo',
      excellent: 'Doskonale!',
      good: 'Dobrze!',
      tryAgain: 'Spróbuj ponownie',
      level: 'Poziom',
      score: 'Wynik',
      time: 'Czas',
      locked: 'Zablokowany',
      completed: 'Ukończony',
    },
    language: {
      select: 'Język',
      is: 'Íslenska',
      en: 'English',
      pl: 'Polski',
    },
    levels: {
      level1: { name: 'Poziom 1', description: 'Początkujący' },
      level2: { name: 'Poziom 2', description: 'Średniozaawansowany' },
      level3: { name: 'Poziom 3', description: 'Zaawansowany' },
    },
    feedback: {
      success: 'Dobrze wykonane!',
      error: 'Wystąpił błąd',
      warning: 'Proszę przejrzeć',
      progressSaved: 'Postęp zapisany',
      levelCompleted: 'Ukończyłeś ten poziom!',
      gameCompleted: 'Gratulacje! Ukończyłeś grę!',
    },
    ui: {
      resetProgress: 'Resetuj postęp',
      resetConfirm: 'Czy na pewno chcesz zresetować cały postęp?',
      learningPath: 'Ścieżka nauki',
      achievements: 'Osiągnięcia',
      settings: 'Ustawienia',
    },
  },
};

/**
 * Deep merge two translation dictionaries
 * Game-specific translations override shared translations
 */
function deepMerge(
  base: TranslationDictionary,
  override: TranslationDictionary
): TranslationDictionary {
  const result: TranslationDictionary = { ...base };

  for (const key of Object.keys(override)) {
    if (
      typeof override[key] === 'object' &&
      override[key] !== null &&
      typeof base[key] === 'object' &&
      base[key] !== null
    ) {
      result[key] = deepMerge(
        base[key] as TranslationDictionary,
        override[key] as TranslationDictionary
      );
    } else {
      result[key] = override[key];
    }
  }

  return result;
}

/**
 * Get value from nested object using dot notation
 */
function getNestedValue(obj: TranslationDictionary, path: string): string | undefined {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as TranslationDictionary)[key];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
}

export interface UseGameI18nOptions {
  /** Game-specific translations to merge with shared translations */
  gameTranslations?: GameTranslations;
}

export interface UseGameI18nReturn {
  /** Translate a key using dot notation */
  t: (key: string, fallback?: string) => string;
  /** Current language */
  language: Language;
  /** Set the current language */
  setLanguage: (lang: Language) => void;
  /** Available languages */
  availableLanguages: readonly Language[];
}

/**
 * Hook for internationalization with game-specific translations
 *
 * @example
 * // In game component
 * import { useGameI18n } from '@shared/hooks/useGameI18n';
 * import { gameTranslations } from '../i18n';
 *
 * function MyGame() {
 *   const { t, language, setLanguage } = useGameI18n({ gameTranslations });
 *
 *   return (
 *     <div>
 *       <h1>{t('game.title')}</h1>
 *       <p>{t('common.start')}</p>
 *     </div>
 *   );
 * }
 */
export function useGameI18n(options: UseGameI18nOptions = {}): UseGameI18nReturn {
  const { gameTranslations } = options;

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['is', 'en', 'pl'].includes(saved)) {
        return saved as Language;
      }
    } catch {
      // localStorage not available
    }
    return DEFAULT_LANGUAGE;
  });

  // Merge shared and game-specific translations
  const mergedTranslations = useMemo(() => {
    const shared = sharedTranslations[language];
    if (!gameTranslations) {
      return shared;
    }
    const game = gameTranslations[language] || gameTranslations.is;
    return deepMerge(shared, game);
  }, [language, gameTranslations]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage not available
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const value = getNestedValue(mergedTranslations, key);
      if (value !== undefined) {
        return value;
      }

      // If not found in current language, try Icelandic as fallback
      if (language !== 'is' && gameTranslations) {
        const isTranslations = deepMerge(sharedTranslations.is, gameTranslations.is);
        const isValue = getNestedValue(isTranslations, key);
        if (isValue !== undefined) {
          return isValue;
        }
      }

      return fallback || key;
    },
    [mergedTranslations, language, gameTranslations]
  );

  return {
    t,
    language,
    setLanguage,
    availableLanguages: ['is', 'en', 'pl'] as const,
  };
}

/**
 * Helper to create game translations object
 * Ensures type safety for translation keys
 */
export function createGameTranslations(translations: GameTranslations): GameTranslations {
  return translations;
}

export default useGameI18n;
