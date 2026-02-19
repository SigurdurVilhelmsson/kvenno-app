// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// ---------------------------------------------------------------------------
// Mock heavy / side-effect-heavy shared dependencies
// ---------------------------------------------------------------------------

vi.mock('@shared/hooks', () => ({
  useProgress: () => ({
    progress: {
      currentLevel: 1,
      problemsCompleted: 0,
      lastPlayedDate: new Date().toISOString(),
      totalTimeSpent: 0,
      levelProgress: {
        level1: {
          questionsAnswered: 2,
          questionsCorrect: 1,
          explanationsProvided: 0,
          explanationScores: [],
          mastered: false,
        },
        level2: {
          problemsCompleted: 0,
          predictionsMade: 0,
          predictionsCorrect: 0,
          finalAnswersCorrect: 0,
          mastered: false,
        },
        level3: {
          problemsCompleted: 0,
          compositeScores: [],
          achievements: [],
          mastered: false,
          hintsUsed: 0,
        },
      },
    },
    updateProgress: vi.fn(),
    resetProgress: vi.fn(),
    incrementProblems: vi.fn(),
    setLevel: vi.fn(),
  }),
  useAccessibility: () => ({
    settings: { highContrast: false, textSize: 'medium', reducedMotion: false, keyboardShortcutsEnabled: true },
    toggleHighContrast: vi.fn(),
    setTextSize: vi.fn(),
    toggleReducedMotion: vi.fn(),
    toggleKeyboardShortcuts: vi.fn(),
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
  }),
  useGameI18n: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    language: 'is' as const,
    setLanguage: vi.fn(),
  }),
}));

vi.mock('@shared/hooks/useAchievements', () => ({
  useAchievements: () => ({
    achievements: { unlockedIds: [], stats: { correctAnswers: 0, incorrectAnswers: 0, currentStreak: 0, bestStreak: 0, gamesPlayed: 0, totalPoints: 0, levelsCompleted: [] }, lastUpdated: '' },
    allAchievements: [],
    unlockedAchievements: [],
    lockedAchievements: [],
    currentStreak: 0,
    bestStreak: 0,
    totalPoints: 0,
    unlockedPercentage: 0,
    notifications: [],
    trackCorrectAnswer: vi.fn(),
    trackIncorrectAnswer: vi.fn(),
    trackLevelComplete: vi.fn(),
    trackGameComplete: vi.fn(),
    dismissNotification: vi.fn(),
    resetAll: vi.fn(),
  }),
}));

vi.mock('@shared/components', () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher">IS</div>,
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@shared/components/AchievementNotificationPopup', () => ({
  AchievementNotificationsContainer: () => null,
}));

vi.mock('@shared/components/AchievementsPanel', () => ({
  AchievementsButton: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} aria-label="Achievements">0</button>
  ),
  AchievementsPanel: () => null,
}));

// Stub out level sub-components — they are not the subject of this test
vi.mock('../components/Level1Conceptual', () => ({
  Level1Conceptual: () => <div data-testid="level1">Level 1</div>,
}));
vi.mock('../components/Level2', () => ({
  Level2: () => <div data-testid="level2">Level 2</div>,
}));
vi.mock('../components/Level3', () => ({
  Level3: () => <div data-testid="level3">Level 3</div>,
}));

// ---------------------------------------------------------------------------
// Import App after all mocks are registered
// ---------------------------------------------------------------------------
import App from '../App';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Dimensional Analysis game menu - accessibility', () => {
  it('renders the menu without axe violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('level buttons have accessible names', () => {
    render(<App />);

    // Each level button contains a heading with the level name
    const buttons = screen.getAllByRole('button');

    // Level buttons: Level 1 (Hugtök), Level 2 (Beiting), Level 3 (Útreikningar), Stats
    // Plus the Achievements button and possibly others
    const levelButtons = buttons.filter(
      (btn) =>
        btn.textContent?.includes('Hugtök') ||
        btn.textContent?.includes('Beiting') ||
        btn.textContent?.includes('Útreikningar'),
    );

    expect(levelButtons.length).toBe(3);

    // Each level button should have meaningful text content (accessible name)
    for (const btn of levelButtons) {
      expect(btn.textContent!.trim().length).toBeGreaterThan(0);
    }
  });

  it('has logical focus order with interactive elements', () => {
    const { container } = render(<App />);

    // Gather all focusable elements in DOM order
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    expect(focusable.length).toBeGreaterThan(0);

    // Verify no element has a positive tabindex (which would break natural order)
    for (const el of focusable) {
      const tabIdx = el.getAttribute('tabindex');
      if (tabIdx !== null) {
        expect(Number(tabIdx)).toBeLessThanOrEqual(0);
      }
    }
  });

  it('interactive elements use proper HTML elements (button/a/input)', () => {
    const { container } = render(<App />);

    // All clickable items should be <button>, <a>, or <input> — not <div> with onClick
    const clickableDivs = container.querySelectorAll('div[onclick], span[onclick]');
    expect(clickableDivs.length).toBe(0);

    // Level selection buttons should actually be <button> elements
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('has a skip-to-content link', () => {
    render(<App />);

    // The App renders a skip link targeting #main-content
    const skipLink = screen.getByText('Fara beint í efni');
    expect(skipLink).toBeDefined();
    expect(skipLink.tagName).toBe('A');
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });
});
