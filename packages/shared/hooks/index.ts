/**
 * Central export for all shared hooks
 */

export * from './useI18n';
export {
  useGameI18n,
  createGameTranslations,
  type GameTranslations,
  type TranslationDictionary,
  type UseGameI18nOptions,
  type UseGameI18nReturn,
} from './useGameI18n';
export * from './useProgress';
export * from './useAccessibility';
export * from './useAchievements';
