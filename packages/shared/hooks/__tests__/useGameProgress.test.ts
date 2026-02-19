/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useGameProgress } from '../useGameProgress';

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
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() {
      return Object.keys(store).length;
    },
    _getStore: () => store,
    _setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
};

interface TestProgress {
  level1Completed: boolean;
  level1Score: number;
  level2Completed: boolean;
  level2Score: number;
  totalGamesPlayed: number;
}

const DEFAULT_PROGRESS: TestProgress = {
  level1Completed: false,
  level1Score: 0,
  level2Completed: false,
  level2Score: 0,
  totalGamesPlayed: 0,
};

describe('useGameProgress', () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });
  });

  it('returns default progress when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useGameProgress('test-game', DEFAULT_PROGRESS)
    );

    expect(result.current.progress).toEqual(DEFAULT_PROGRESS);
  });

  it('loads saved progress from localStorage', () => {
    const savedProgress: TestProgress = {
      level1Completed: true,
      level1Score: 100,
      level2Completed: false,
      level2Score: 0,
      totalGamesPlayed: 3,
    };
    mockStorage._setStore({
      'test-game': JSON.stringify(savedProgress),
    });

    const { result } = renderHook(() =>
      useGameProgress('test-game', DEFAULT_PROGRESS)
    );

    expect(result.current.progress).toEqual(savedProgress);
  });

  it('handles corrupt JSON in localStorage gracefully', () => {
    mockStorage._setStore({
      'test-game': 'not-valid-json{{{',
    });

    const { result } = renderHook(() =>
      useGameProgress('test-game', DEFAULT_PROGRESS)
    );

    expect(result.current.progress).toEqual(DEFAULT_PROGRESS);
  });

  it('saves progress to localStorage on update', () => {
    const { result } = renderHook(() =>
      useGameProgress('test-game', DEFAULT_PROGRESS)
    );

    act(() => {
      result.current.updateProgress({
        level1Completed: true,
        level1Score: 85,
      });
    });

    expect(result.current.progress.level1Completed).toBe(true);
    expect(result.current.progress.level1Score).toBe(85);
    // useEffect fires and saves to localStorage
    const saved = JSON.parse(mockStorage.getItem('test-game')!);
    expect(saved.level1Completed).toBe(true);
    expect(saved.level1Score).toBe(85);
  });

  it('merges partial updates without overwriting other fields', () => {
    const { result } = renderHook(() =>
      useGameProgress('test-game', DEFAULT_PROGRESS)
    );

    act(() => {
      result.current.updateProgress({ level1Score: 50 });
    });
    act(() => {
      result.current.updateProgress({ level2Score: 75 });
    });

    expect(result.current.progress.level1Score).toBe(50);
    expect(result.current.progress.level2Score).toBe(75);
    expect(result.current.progress.level1Completed).toBe(false);
  });

  it('resets progress to default values', () => {
    const savedProgress: TestProgress = {
      level1Completed: true,
      level1Score: 100,
      level2Completed: true,
      level2Score: 80,
      totalGamesPlayed: 5,
    };
    mockStorage._setStore({
      'test-game': JSON.stringify(savedProgress),
    });

    const { result } = renderHook(() =>
      useGameProgress('test-game', DEFAULT_PROGRESS)
    );

    expect(result.current.progress.level1Completed).toBe(true);

    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.progress).toEqual(DEFAULT_PROGRESS);
    const saved = JSON.parse(mockStorage.getItem('test-game')!);
    expect(saved).toEqual(DEFAULT_PROGRESS);
  });

  it('uses the correct storage key for different games', () => {
    renderHook(() => useGameProgress('game-a', DEFAULT_PROGRESS));
    renderHook(() => useGameProgress('game-b', DEFAULT_PROGRESS));

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'game-a',
      expect.any(String)
    );
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'game-b',
      expect.any(String)
    );
  });

  it('persists progress across re-renders', () => {
    const { result, rerender } = renderHook(() =>
      useGameProgress('test-game', DEFAULT_PROGRESS)
    );

    act(() => {
      result.current.updateProgress({ totalGamesPlayed: 10 });
    });

    rerender();

    expect(result.current.progress.totalGamesPlayed).toBe(10);
  });
});
