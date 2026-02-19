/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { useGameI18n, createGameTranslations } from '../useGameI18n';
import type { GameTranslations } from '../useGameI18n';

// Mock localStorage
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    _getStore: () => store,
    _setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
};

// Mock game-specific translations
const mockGameTranslations: GameTranslations = {
  is: {
    game: {
      title: 'Leikur',
      instructions: 'Leiðbeiningar hér',
    },
    custom: {
      greeting: 'Halló',
    },
  },
  en: {
    game: {
      title: 'Game',
      instructions: 'Instructions here',
    },
    custom: {
      greeting: 'Hello',
    },
  },
  pl: {
    game: {
      title: 'Gra',
      instructions: 'Instrukcje tutaj',
    },
    custom: {
      greeting: 'Cześć',
    },
  },
};

describe('useGameI18n', () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should default to Icelandic when no saved language', () => {
      const { result } = renderHook(() => useGameI18n());

      expect(result.current.language).toBe('is');
    });

    it('should load saved language from localStorage', () => {
      mockStorage._setStore({ 'kvenno-language': 'en' });

      const { result } = renderHook(() => useGameI18n());

      expect(result.current.language).toBe('en');
    });

    it('should ignore invalid saved language and fall back to Icelandic', () => {
      mockStorage._setStore({ 'kvenno-language': 'de' });

      const { result } = renderHook(() => useGameI18n());

      expect(result.current.language).toBe('is');
    });

    it('should provide available languages', () => {
      const { result } = renderHook(() => useGameI18n());

      expect(result.current.availableLanguages).toEqual(['is', 'en', 'pl']);
    });
  });

  describe('t function (translation)', () => {
    it('should return correct shared translation for a known key', () => {
      const { result } = renderHook(() => useGameI18n());

      expect(result.current.t('common.start')).toBe('Byrja');
      expect(result.current.t('common.close')).toBe('Loka');
      expect(result.current.t('feedback.success')).toBe('Vel gert!');
    });

    it('should return the key string when translation is missing', () => {
      const { result } = renderHook(() => useGameI18n());

      expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
    });

    it('should return explicit fallback when translation is missing', () => {
      const { result } = renderHook(() => useGameI18n());

      expect(result.current.t('nonexistent.key', 'Fallback')).toBe('Fallback');
    });

    it('should handle nested keys using dot notation', () => {
      const { result } = renderHook(() => useGameI18n());

      expect(result.current.t('levels.level1.name')).toBe('Stig 1');
      expect(result.current.t('levels.level2.description')).toBe('Millistig');
    });

    it('should return key for partial path pointing to an object', () => {
      const { result } = renderHook(() => useGameI18n());

      // 'common' is an object, not a string
      expect(result.current.t('common')).toBe('common');
    });

    it('should handle empty key gracefully', () => {
      const { result } = renderHook(() => useGameI18n());

      expect(result.current.t('')).toBe('');
    });
  });

  describe('game-specific translations', () => {
    it('should merge game translations with shared translations', () => {
      const { result } = renderHook(() =>
        useGameI18n({ gameTranslations: mockGameTranslations })
      );

      // Game-specific key
      expect(result.current.t('game.title')).toBe('Leikur');
      // Shared key still works
      expect(result.current.t('common.start')).toBe('Byrja');
    });

    it('should let game translations override shared translations', () => {
      const overridingTranslations: GameTranslations = {
        is: { common: { start: 'Byrja leik' } },
        en: { common: { start: 'Start game' } },
        pl: { common: { start: 'Rozpocznij grę' } },
      };

      const { result } = renderHook(() =>
        useGameI18n({ gameTranslations: overridingTranslations })
      );

      expect(result.current.t('common.start')).toBe('Byrja leik');
      // Other shared keys should remain intact
      expect(result.current.t('common.close')).toBe('Loka');
    });

    it('should fall back to Icelandic game translation when key missing in current language', () => {
      const partialTranslations: GameTranslations = {
        is: { game: { title: 'Leikur' } },
        en: {},
        pl: {},
      };

      const { result } = renderHook(() =>
        useGameI18n({ gameTranslations: partialTranslations })
      );

      // Switch to English
      act(() => {
        result.current.setLanguage('en');
      });

      // 'game.title' doesn't exist in English game translations,
      // should fall back to Icelandic game translation
      expect(result.current.t('game.title')).toBe('Leikur');
    });
  });

  describe('setLanguage', () => {
    it('should change the current language', () => {
      const { result } = renderHook(() => useGameI18n());

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
    });

    it('should save language to localStorage', () => {
      const { result } = renderHook(() => useGameI18n());

      act(() => {
        result.current.setLanguage('pl');
      });

      expect(mockStorage.setItem).toHaveBeenCalledWith('kvenno-language', 'pl');
    });

    it('should update translations when language changes', () => {
      const { result } = renderHook(() =>
        useGameI18n({ gameTranslations: mockGameTranslations })
      );

      expect(result.current.t('game.title')).toBe('Leikur');

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.t('game.title')).toBe('Game');
      expect(result.current.t('common.start')).toBe('Start');
    });

    it('should update shared translations when switching to Polish', () => {
      const { result } = renderHook(() => useGameI18n());

      act(() => {
        result.current.setLanguage('pl');
      });

      expect(result.current.t('common.start')).toBe('Rozpocznij');
      expect(result.current.t('feedback.success')).toBe('Dobrze wykonane!');
    });
  });

  describe('localStorage unavailable', () => {
    it('should not throw when localStorage.getItem throws', () => {
      mockStorage.getItem = vi.fn(() => {
        throw new Error('localStorage disabled');
      });

      const { result } = renderHook(() => useGameI18n());

      expect(result.current.language).toBe('is');
    });

    it('should not throw when localStorage.setItem throws', () => {
      mockStorage.setItem = vi.fn(() => {
        throw new Error('localStorage disabled');
      });

      const { result } = renderHook(() => useGameI18n());

      expect(() => {
        act(() => {
          result.current.setLanguage('en');
        });
      }).not.toThrow();

      // Language should still change in state
      expect(result.current.language).toBe('en');
    });
  });

  describe('return values', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useGameI18n());

      expect(result.current).toHaveProperty('t');
      expect(result.current).toHaveProperty('language');
      expect(result.current).toHaveProperty('setLanguage');
      expect(result.current).toHaveProperty('availableLanguages');
      expect(typeof result.current.t).toBe('function');
      expect(typeof result.current.setLanguage).toBe('function');
      expect(Array.isArray(result.current.availableLanguages)).toBe(true);
    });
  });

  describe('createGameTranslations helper', () => {
    it('should return the same translations object', () => {
      const translations = createGameTranslations(mockGameTranslations);

      expect(translations).toBe(mockGameTranslations);
    });
  });
});
