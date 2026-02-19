// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Track resetProgress calls
const mockResetProgress = vi.fn();
const mockUpdateProgress = vi.fn();

// Default progress state — tests can override via mockProgressRef
const DEFAULT_PROGRESS = {
  level1Completed: false,
  level1Score: 0,
  level2Completed: false,
  level2Score: 0,
  level3BestMoves: {} as Record<string, number>,
  totalGamesPlayed: 0,
};

let mockProgressRef = { ...DEFAULT_PROGRESS };

vi.mock('@shared/hooks/useGameI18n', () => ({
  useGameI18n: () => ({
    t: (key: string) => key,
    language: 'is' as const,
    setLanguage: vi.fn(),
    availableLanguages: ['is', 'en', 'pl'] as const,
  }),
  createGameTranslations: (t: unknown) => t,
}));

vi.mock('@shared/hooks/useGameProgress', () => ({
  useGameProgress: () => ({
    progress: mockProgressRef,
    updateProgress: mockUpdateProgress,
    resetProgress: mockResetProgress,
  }),
}));

vi.mock('@shared/hooks/useAchievements', () => ({
  useAchievements: () => ({
    achievements: { unlockedIds: [], currentStreak: 0, bestStreak: 0, totalPoints: 0, daysPlayed: [] },
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
    clearNotifications: vi.fn(),
    getProgress: vi.fn(),
    resetAll: vi.fn(),
  }),
}));

// Mock shared components to simple stubs
vi.mock('@shared/components', () => ({
  LanguageSwitcher: (props: { language: string }) => (
    <div data-testid="language-switcher">Lang: {props.language}</div>
  ),
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AchievementNotificationsContainer: () => <div data-testid="achievement-notifications" />,
}));

vi.mock('@shared/components/AchievementNotificationPopup', () => ({
  AchievementNotificationsContainer: () => <div data-testid="achievement-notifications" />,
}));

vi.mock('@shared/components/AchievementsPanel', () => ({
  AchievementsPanel: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="achievements-panel">
      <button onClick={onClose}>close-panel</button>
    </div>
  ),
  AchievementsButton: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="achievements-button" onClick={onClick}>
      Achievements
    </button>
  ),
}));

// Mock level components so we don't render full sub-games
vi.mock('../components/Level1', () => ({
  Level1: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="level1-screen">
      <button onClick={onBack}>back-from-level1</button>
    </div>
  ),
}));

vi.mock('../components/Level2', () => ({
  Level2: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="level2-screen">
      <button onClick={onBack}>back-from-level2</button>
    </div>
  ),
}));

vi.mock('../components/Level3', () => ({
  Level3: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="level3-screen">
      <button onClick={onBack}>back-from-level3</button>
    </div>
  ),
}));

vi.mock('../components/NameBuilder', () => ({
  NameBuilder: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="namebuilder-screen">
      <button onClick={onBack}>back-from-namebuilder</button>
    </div>
  ),
}));

vi.mock('../i18n', () => ({
  gameTranslations: { is: {}, en: {}, pl: {} },
}));

// Import App AFTER all mocks are in place
import App from '../App';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Set mock progress and re-render */
function setMockProgress(overrides: Partial<typeof DEFAULT_PROGRESS>) {
  mockProgressRef = { ...DEFAULT_PROGRESS, ...overrides };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Nafnakerfid App', () => {
  beforeEach(() => {
    setMockProgress({});
    mockResetProgress.mockClear();
    mockUpdateProgress.mockClear();
  });

  // 1. Renders main menu with all level buttons
  it('renders main menu with all level buttons', () => {
    render(<App />);

    // Level 1, 2, 3 names and titles should be rendered (as translation keys)
    expect(screen.getByText('levels.level1.name')).toBeDefined();
    expect(screen.getByText('levels.level1.title')).toBeDefined();
    expect(screen.getByText('levels.level2.name')).toBeDefined();
    expect(screen.getByText('levels.level2.title')).toBeDefined();
    expect(screen.getByText('levels.level3.name')).toBeDefined();
    expect(screen.getByText('levels.level3.title')).toBeDefined();
    // Bonus / NameBuilder button
    expect(screen.getByText('bonus.title')).toBeDefined();
  });

  // 2. Shows level 1 as enabled by default
  it('shows level 1 as enabled (clickable) by default', () => {
    render(<App />);

    // Level 1 button should NOT have the disabled/opacity class
    const level1Button = screen.getByText('levels.level1.title').closest('button');
    expect(level1Button).toBeDefined();
    // Level 1 button has border-blue-200 class when enabled
    expect(level1Button!.className).toContain('border-blue-200');
    expect(level1Button!.className).not.toContain('opacity-60');
  });

  // 3. Shows levels 2-3 as locked until previous level completed
  it('shows level 2 as locked when level 1 is not completed', () => {
    setMockProgress({ level1Completed: false });
    render(<App />);

    const level2Button = screen.getByText('levels.level2.title').closest('button');
    expect(level2Button).toBeDefined();
    expect(level2Button!.className).toContain('opacity-60');
    // The "complete level 1 first" hint should be shown
    expect(screen.getByText('(menu.completeLevel1First)')).toBeDefined();
  });

  it('shows level 3 as locked when level 2 is not completed', () => {
    setMockProgress({ level1Completed: true, level2Completed: false });
    render(<App />);

    const level3Button = screen.getByText('levels.level3.title').closest('button');
    expect(level3Button).toBeDefined();
    expect(level3Button!.className).toContain('opacity-60');
    expect(screen.getByText('(menu.completeLevel2First)')).toBeDefined();
  });

  it('shows level 2 as unlocked when level 1 is completed', () => {
    setMockProgress({ level1Completed: true });
    render(<App />);

    const level2Button = screen.getByText('levels.level2.title').closest('button');
    expect(level2Button).toBeDefined();
    expect(level2Button!.className).toContain('border-yellow-200');
    expect(level2Button!.className).not.toContain('opacity-60');
  });

  it('shows level 3 as unlocked when level 2 is completed', () => {
    setMockProgress({ level1Completed: true, level2Completed: true });
    render(<App />);

    const level3Button = screen.getByText('levels.level3.title').closest('button');
    expect(level3Button).toBeDefined();
    expect(level3Button!.className).toContain('border-red-200');
    expect(level3Button!.className).not.toContain('opacity-60');
  });

  // 4. LanguageSwitcher is present
  it('renders the LanguageSwitcher component', () => {
    render(<App />);

    expect(screen.getByTestId('language-switcher')).toBeDefined();
  });

  // 5. Progress section loads and shows data from progress state
  it('displays progress summary when games have been played', () => {
    setMockProgress({
      level1Completed: true,
      level1Score: 8,
      level2Completed: false,
      level2Score: 0,
      totalGamesPlayed: 3,
    });
    render(<App />);

    // Progress heading
    expect(screen.getByText('menu.progress')).toBeDefined();
    // Levels completed: 1/2 (only level1 completed)
    expect(screen.getByText('1/2')).toBeDefined();
    // Total points: 8 + 0 = 8
    expect(screen.getByText('8')).toBeDefined();
    // Games played: 3
    expect(screen.getByText('3')).toBeDefined();
  });

  it('does not display progress summary when no games have been played', () => {
    setMockProgress({ totalGamesPlayed: 0 });
    render(<App />);

    // The progress section heading should not appear
    expect(screen.queryByText('menu.progress')).toBeNull();
  });

  // 6. Reset progress calls resetProgress
  it('calls resetProgress when reset button is clicked', () => {
    setMockProgress({ totalGamesPlayed: 1 });
    render(<App />);

    const resetButton = screen.getByText('menu.reset');
    fireEvent.click(resetButton);

    expect(mockResetProgress).toHaveBeenCalledTimes(1);
  });

  // 7. Navigates to level screens on button click
  it('navigates to Level 1 screen when level 1 button is clicked', () => {
    render(<App />);

    const level1Button = screen.getByText('levels.level1.title').closest('button')!;
    fireEvent.click(level1Button);

    expect(screen.getByTestId('level1-screen')).toBeDefined();
  });

  it('navigates to Level 2 screen when level 2 button is clicked', () => {
    render(<App />);

    const level2Button = screen.getByText('levels.level2.title').closest('button')!;
    fireEvent.click(level2Button);

    expect(screen.getByTestId('level2-screen')).toBeDefined();
  });

  it('navigates to Level 3 screen when level 3 button is clicked', () => {
    render(<App />);

    const level3Button = screen.getByText('levels.level3.title').closest('button')!;
    fireEvent.click(level3Button);

    expect(screen.getByTestId('level3-screen')).toBeDefined();
  });

  it('navigates to NameBuilder screen when bonus button is clicked', () => {
    render(<App />);

    const bonusButton = screen.getByText('bonus.title').closest('button')!;
    fireEvent.click(bonusButton);

    expect(screen.getByTestId('namebuilder-screen')).toBeDefined();
  });

  it('navigates back to menu from level screen', () => {
    render(<App />);

    // Go to level 1
    const level1Button = screen.getByText('levels.level1.title').closest('button')!;
    fireEvent.click(level1Button);
    expect(screen.getByTestId('level1-screen')).toBeDefined();

    // Click back
    fireEvent.click(screen.getByText('back-from-level1'));

    // Should be back on menu
    expect(screen.getByText('game.title')).toBeDefined();
  });

  // 8. Achievements button is present
  it('renders the achievements button', () => {
    render(<App />);

    expect(screen.getByTestId('achievements-button')).toBeDefined();
  });

  it('opens achievements panel when achievements button is clicked', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('achievements-button'));

    expect(screen.getByTestId('achievements-panel')).toBeDefined();
  });

  it('closes achievements panel when close is clicked', () => {
    render(<App />);

    // Open panel
    fireEvent.click(screen.getByTestId('achievements-button'));
    expect(screen.getByTestId('achievements-panel')).toBeDefined();

    // Close panel
    fireEvent.click(screen.getByText('close-panel'));
    expect(screen.queryByTestId('achievements-panel')).toBeNull();
  });

  // Additional: completed state indicators
  it('shows completion score for level 1 when completed', () => {
    setMockProgress({ level1Completed: true, level1Score: 9 });
    render(<App />);

    expect(screen.getByText('9/10')).toBeDefined();
    expect(screen.getByText('menu.completed')).toBeDefined();
  });

  it('shows completion score for level 2 when completed', () => {
    setMockProgress({ level1Completed: true, level2Completed: true, level2Score: 11 });
    render(<App />);

    expect(screen.getByText('11/12')).toBeDefined();
  });

  it('shows best moves for level 3 when games played', () => {
    setMockProgress({
      level1Completed: true,
      level2Completed: true,
      level3BestMoves: { 'easy-4': 12, 'medium-6': 20 },
    });
    render(<App />);

    // Best moves should be min of 12 and 20 = 12, displayed alongside "menu.moves"
    // The t() mock returns the key, and App renders "{t('menu.best')}:" so the text is "menu.best:"
    expect(screen.getByText('menu.best:')).toBeDefined();
    // The moves line: "12 menu.moves"
    const movesEl = screen.getByText(/menu\.moves/);
    expect(movesEl).toBeDefined();
    expect(movesEl.textContent).toContain('12');
  });

  it('renders the back-to-games link', () => {
    render(<App />);

    // The link text includes an &larr; entity before the translation key
    const backLink = screen.getByText(/menu\.backToGames/).closest('a');
    expect(backLink).toBeDefined();
    expect(backLink!.getAttribute('href')).toBe('/games/1-ar/');
  });
});
