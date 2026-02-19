/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAccessibility } from '../useAccessibility';

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

describe('useAccessibility', () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true,
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reset document classes
    document.documentElement.className = '';
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return default settings when no saved settings exist', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings).toEqual({
        highContrast: false,
        textSize: 'medium',
        reducedMotion: false,
        keyboardShortcutsEnabled: true,
      });
    });

    it('should load saved settings from localStorage', () => {
      mockStorage._setStore({
        'kvenno-accessibility': JSON.stringify({
          highContrast: true,
          textSize: 'large',
          reducedMotion: true,
          keyboardShortcutsEnabled: false,
        }),
      });

      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.highContrast).toBe(true);
      expect(result.current.settings.textSize).toBe('large');
      expect(result.current.settings.reducedMotion).toBe(true);
      expect(result.current.settings.keyboardShortcutsEnabled).toBe(false);
    });

    it('should merge saved settings with defaults', () => {
      mockStorage._setStore({
        'kvenno-accessibility': JSON.stringify({
          highContrast: true,
        }),
      });

      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.highContrast).toBe(true);
      expect(result.current.settings.textSize).toBe('medium'); // Default
      expect(result.current.settings.reducedMotion).toBe(false); // Default
    });

    it('should use defaults when saved settings are invalid JSON', () => {
      mockStorage._setStore({
        'kvenno-accessibility': 'not-valid-json{',
      });

      const { result } = renderHook(() => useAccessibility());

      expect(result.current.settings.highContrast).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateSettings', () => {
    it('should update multiple settings at once', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.updateSettings({
          highContrast: true,
          reducedMotion: true,
        });
      });

      expect(result.current.settings.highContrast).toBe(true);
      expect(result.current.settings.reducedMotion).toBe(true);
    });

    it('should preserve unchanged settings', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.updateSettings({ highContrast: true });
      });

      expect(result.current.settings.highContrast).toBe(true);
      expect(result.current.settings.textSize).toBe('medium');
      expect(result.current.settings.keyboardShortcutsEnabled).toBe(true);
    });
  });

  describe('toggleHighContrast', () => {
    it('should toggle high contrast from false to true', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleHighContrast();
      });

      expect(result.current.settings.highContrast).toBe(true);
    });

    it('should toggle high contrast from true to false', () => {
      mockStorage._setStore({
        'kvenno-accessibility': JSON.stringify({ highContrast: true }),
      });
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleHighContrast();
      });

      expect(result.current.settings.highContrast).toBe(false);
    });
  });

  describe('setTextSize', () => {
    it('should set text size to small', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.setTextSize('small');
      });

      expect(result.current.settings.textSize).toBe('small');
    });

    it('should set text size to large', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.setTextSize('large');
      });

      expect(result.current.settings.textSize).toBe('large');
    });
  });

  describe('toggleReducedMotion', () => {
    it('should toggle reduced motion from false to true', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleReducedMotion();
      });

      expect(result.current.settings.reducedMotion).toBe(true);
    });

    it('should toggle reduced motion from true to false', () => {
      mockStorage._setStore({
        'kvenno-accessibility': JSON.stringify({ reducedMotion: true }),
      });
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleReducedMotion();
      });

      expect(result.current.settings.reducedMotion).toBe(false);
    });
  });

  describe('toggleKeyboardShortcuts', () => {
    it('should toggle keyboard shortcuts from true to false', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleKeyboardShortcuts();
      });

      expect(result.current.settings.keyboardShortcutsEnabled).toBe(false);
    });

    it('should toggle keyboard shortcuts from false to true', () => {
      mockStorage._setStore({
        'kvenno-accessibility': JSON.stringify({ keyboardShortcutsEnabled: false }),
      });
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleKeyboardShortcuts();
      });

      expect(result.current.settings.keyboardShortcutsEnabled).toBe(true);
    });
  });

  describe('resetSettings', () => {
    it('should reset all settings to defaults', () => {
      mockStorage._setStore({
        'kvenno-accessibility': JSON.stringify({
          highContrast: true,
          textSize: 'large',
          reducedMotion: true,
          keyboardShortcutsEnabled: false,
        }),
      });
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings).toEqual({
        highContrast: false,
        textSize: 'medium',
        reducedMotion: false,
        keyboardShortcutsEnabled: true,
      });
    });
  });

  describe('DOM class application', () => {
    it('should add high-contrast class when enabled', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleHighContrast();
      });

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });

    it('should remove high-contrast class when disabled', () => {
      mockStorage._setStore({
        'kvenno-accessibility': JSON.stringify({ highContrast: true }),
      });
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleHighContrast();
      });

      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    });

    it('should add text size class', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.setTextSize('large');
      });

      expect(document.documentElement.classList.contains('text-large')).toBe(true);
      expect(document.documentElement.classList.contains('text-medium')).toBe(false);
    });

    it('should add reduced-motion class when enabled', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleReducedMotion();
      });

      expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
    });

    it('should remove reduced-motion class when disabled', () => {
      mockStorage._setStore({
        'kvenno-accessibility': JSON.stringify({ reducedMotion: true }),
      });
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleReducedMotion();
      });

      expect(document.documentElement.classList.contains('reduced-motion')).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('should save settings to localStorage when changed', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleHighContrast();
      });

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'kvenno-accessibility',
        expect.stringContaining('"highContrast":true')
      );
    });

    it('should save all settings when any setting changes', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.setTextSize('large');
      });

      // Get the last call to setItem (after the change)
      const calls = mockStorage.setItem.mock.calls;
      const lastCall = calls[calls.length - 1];
      const savedValue = lastCall[1];
      const parsed = JSON.parse(savedValue);

      expect(parsed).toHaveProperty('highContrast');
      expect(parsed).toHaveProperty('textSize', 'large');
      expect(parsed).toHaveProperty('reducedMotion');
      expect(parsed).toHaveProperty('keyboardShortcutsEnabled');
    });
  });

  describe('integration', () => {
    it('should maintain state across multiple updates', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.toggleHighContrast();
        result.current.setTextSize('large');
        result.current.toggleReducedMotion();
      });

      expect(result.current.settings.highContrast).toBe(true);
      expect(result.current.settings.textSize).toBe('large');
      expect(result.current.settings.reducedMotion).toBe(true);
    });
  });
});
