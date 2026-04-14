// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockResetProgress = vi.fn();
const mockUpdateProgress = vi.fn();

const DEFAULT_PROGRESS = {
  level1Completed: false,
  level1Score: 0,
  level2Completed: false,
  level2Score: 0,
  level3Completed: false,
  level3Score: 0,
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

vi.mock('@shared/components', () => ({
  Header: ({
    backHref,
    gameTitle,
    authSlot,
  }: {
    variant?: string;
    backHref?: string;
    backLabel?: string;
    gameTitle?: string;
    authSlot?: React.ReactNode;
  }) => (
    <header data-testid="game-header">
      <a href={backHref} data-testid="back-link">
        Til baka
      </a>
      <h1>{gameTitle}</h1>
      <div>{authSlot}</div>
    </header>
  ),
  LanguageSwitcher: (props: { language: string }) => (
    <div data-testid="language-switcher">Lang: {props.language}</div>
  ),
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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

vi.mock('../i18n', () => ({
  gameTranslations: { is: {}, en: {}, pl: {} },
}));

import App from '../App';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

  it('renders main menu with all level buttons', () => {
    render(<App />);

    expect(screen.getByText('levels.level1.name')).toBeDefined();
    expect(screen.getByText('levels.level1.title')).toBeDefined();
    expect(screen.getByText('levels.level2.name')).toBeDefined();
    expect(screen.getByText('levels.level2.title')).toBeDefined();
    expect(screen.getByText('levels.level3.name')).toBeDefined();
    expect(screen.getByText('levels.level3.title')).toBeDefined();
  });

  it('all levels are freely accessible (no locks)', () => {
    setMockProgress({ level1Completed: false, level2Completed: false });
    render(<App />);

    const level2Button = screen.getByText('levels.level2.title').closest('button');
    expect(level2Button).toBeDefined();
    expect(level2Button!.className).not.toContain('opacity-60');
    expect(level2Button!.className).not.toContain('cursor-not-allowed');

    const level3Button = screen.getByText('levels.level3.title').closest('button');
    expect(level3Button).toBeDefined();
    expect(level3Button!.className).not.toContain('opacity-60');
    expect(level3Button!.className).not.toContain('cursor-not-allowed');
  });

  it('renders the LanguageSwitcher component', () => {
    render(<App />);
    expect(screen.getByTestId('language-switcher')).toBeDefined();
  });

  it('displays progress summary when games have been played', () => {
    setMockProgress({
      level1Completed: true,
      level1Score: 8,
      level2Completed: false,
      level2Score: 0,
      totalGamesPlayed: 3,
    });
    render(<App />);

    expect(screen.getByText('menu.progress')).toBeDefined();
    expect(screen.getByText('1/3')).toBeDefined();
    expect(screen.getByText('8')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });

  it('does not display progress summary when no games have been played', () => {
    setMockProgress({ totalGamesPlayed: 0 });
    render(<App />);
    expect(screen.queryByText('menu.progress')).toBeNull();
  });

  it('calls resetProgress when reset button is clicked', () => {
    setMockProgress({ totalGamesPlayed: 1 });
    render(<App />);

    const resetButton = screen.getByText('menu.reset');
    fireEvent.click(resetButton);
    expect(mockResetProgress).toHaveBeenCalledTimes(1);
  });

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

  it('navigates back to menu from level screen', () => {
    render(<App />);

    const level1Button = screen.getByText('levels.level1.title').closest('button')!;
    fireEvent.click(level1Button);
    expect(screen.getByTestId('level1-screen')).toBeDefined();

    fireEvent.click(screen.getByText('back-from-level1'));
    expect(screen.getByText('game.title')).toBeDefined();
  });

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

  it('shows score for level 3 when completed', () => {
    setMockProgress({
      level1Completed: true,
      level2Completed: true,
      level3Completed: true,
      level3Score: 75,
    });
    render(<App />);

    expect(screen.getByText('75')).toBeDefined();
  });

  it('renders the game header with back link to year hub', () => {
    render(<App />);
    const header = screen.getByTestId('game-header');
    expect(header).toBeDefined();
    const backLink = screen.getByTestId('back-link');
    expect(backLink).toBeDefined();
    expect(backLink.getAttribute('href')).toBe('/efnafraedi/1-ar/');
  });
});
