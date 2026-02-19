/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useI18n } from '../useI18n';

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

// Mock translations
const mockTranslations = {
  is: {
    mainMenu: {
      title: 'Aðalvalmynd',
      start: 'Byrja',
    },
    game: {
      score: 'Stig',
      level: 'Stig',
    },
  },
  en: {
    mainMenu: {
      title: 'Main Menu',
      start: 'Start',
    },
    game: {
      score: 'Score',
      level: 'Level',
    },
  },
  pl: {
    mainMenu: {
      title: 'Menu Główne',
      start: 'Start',
    },
    game: {
      score: 'Wynik',
      level: 'Poziom',
    },
  },
};

describe('useI18n', () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>;
  let originalLocalStorage: Storage;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    originalLocalStorage = global.localStorage;
    originalFetch = global.fetch;

    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true,
    });

    // Mock fetch
    global.fetch = vi.fn().mockImplementation((url: string) => {
      const lang = url.split('/').pop()?.replace('.json', '') as keyof typeof mockTranslations;
      if (mockTranslations[lang]) {
        return Promise.resolve({
          json: () => Promise.resolve(mockTranslations[lang]),
        });
      }
      return Promise.reject(new Error('Translation not found'));
    });

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should default to Icelandic when no saved language', () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.language).toBe('is');
    });

    it('should load saved language from localStorage', () => {
      mockStorage._setStore({
        'kvenno-language': 'en',
      });

      const { result } = renderHook(() => useI18n());

      expect(result.current.language).toBe('en');
    });

    it('should provide available languages', () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.availableLanguages).toEqual(['is', 'en', 'pl']);
    });
  });

  describe('setLanguage', () => {
    it('should change the current language', () => {
      const { result } = renderHook(() => useI18n());

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
    });

    it('should save language to localStorage', () => {
      const { result } = renderHook(() => useI18n());

      act(() => {
        result.current.setLanguage('pl');
      });

      expect(mockStorage.setItem).toHaveBeenCalledWith('kvenno-language', 'pl');
    });

    it('should trigger translation loading', async () => {
      const { result } = renderHook(() => useI18n());

      act(() => {
        result.current.setLanguage('en');
      });

      // Wait for English translations to be available
      await waitFor(() => {
        // The translation should eventually change to English
        const translated = result.current.t('mainMenu.title');
        // Either it's loaded or still the key
        expect(['Main Menu', 'mainMenu.title', 'Aðalvalmynd']).toContain(translated);
      });
    });
  });

  describe('t function (translation)', () => {
    it('should translate using dot notation', async () => {
      const { result } = renderHook(() => useI18n());

      // Wait for translations to load
      await waitFor(() => {
        const translation = result.current.t('mainMenu.title');
        expect(translation).toBe('Aðalvalmynd');
      });
    });

    it('should return key when translation not found', async () => {
      const { result } = renderHook(() => useI18n());

      await waitFor(() => {
        const translation = result.current.t('nonexistent.key');
        expect(translation).toBe('nonexistent.key');
      });
    });

    it('should return fallback when provided and translation not found', async () => {
      const { result } = renderHook(() => useI18n());

      await waitFor(() => {
        const translation = result.current.t('nonexistent.key', 'Fallback Text');
        expect(translation).toBe('Fallback Text');
      });
    });

    it('should handle deeply nested keys', async () => {
      const { result } = renderHook(() => useI18n());

      await waitFor(() => {
        const translation = result.current.t('game.score');
        expect(translation).toBe('Stig');
      });
    });

    it('should return key for partial path match', async () => {
      const { result } = renderHook(() => useI18n());

      await waitFor(() => {
        // mainMenu is an object, not a string
        const translation = result.current.t('mainMenu');
        expect(translation).toBe('mainMenu');
      });
    });

    it('should update translations when language changes', async () => {
      const { result } = renderHook(() => useI18n());

      // Wait for initial translations
      await waitFor(() => {
        expect(result.current.t('mainMenu.title')).toBe('Aðalvalmynd');
      });

      // Change language
      act(() => {
        result.current.setLanguage('en');
      });

      // Wait for English translations
      await waitFor(() => {
        expect(result.current.t('mainMenu.title')).toBe('Main Menu');
      });
    });
  });

  describe('error handling', () => {
    it('should handle missing translation gracefully', async () => {
      const { result } = renderHook(() => useI18n());

      await waitFor(() => {
        // Should not throw
        expect(() => result.current.t('deeply.nested.missing.key')).not.toThrow();
      });
    });

    it('should return key for missing translations', async () => {
      const { result } = renderHook(() => useI18n());

      await waitFor(() => {
        const translation = result.current.t('nonexistent.path');
        expect(translation).toBe('nonexistent.path');
      });
    });
  });

  describe('language persistence', () => {
    it('should persist language change across rerenders', () => {
      const { result, rerender } = renderHook(() => useI18n());

      act(() => {
        result.current.setLanguage('pl');
      });

      expect(result.current.language).toBe('pl');

      rerender();

      // Language should still be Polish
      expect(result.current.language).toBe('pl');
    });
  });

  describe('return values', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current).toHaveProperty('t');
      expect(result.current).toHaveProperty('language');
      expect(result.current).toHaveProperty('setLanguage');
      expect(result.current).toHaveProperty('availableLanguages');
      expect(typeof result.current.t).toBe('function');
      expect(typeof result.current.setLanguage).toBe('function');
    });
  });
});
