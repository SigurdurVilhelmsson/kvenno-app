import { useState, useEffect, useCallback } from 'react';

import { AccessibilitySettings } from '@shared/types';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  textSize: 'medium',
  reducedMotion: false,
  keyboardShortcutsEnabled: true,
};

/**
 * Hook for managing accessibility settings with localStorage persistence
 *
 * @example
 * const { settings, updateSettings, toggleHighContrast } = useAccessibility();
 */
export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('kvenno-accessibility');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load accessibility settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Text size
    root.classList.remove('text-small', 'text-medium', 'text-large');
    root.classList.add(`text-${settings.textSize}`);

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Save to localStorage
    try {
      localStorage.setItem('kvenno-accessibility', JSON.stringify(settings));
    } catch {
      // localStorage may be unavailable — ignore silently
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const setTextSize = useCallback((size: AccessibilitySettings['textSize']) => {
    setSettings((prev) => ({ ...prev, textSize: size }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setSettings((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const toggleKeyboardShortcuts = useCallback(() => {
    setSettings((prev) => ({ ...prev, keyboardShortcutsEnabled: !prev.keyboardShortcutsEnabled }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    toggleHighContrast,
    setTextSize,
    toggleReducedMotion,
    toggleKeyboardShortcuts,
    resetSettings,
  };
};
