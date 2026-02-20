// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';

expect.extend(toHaveNoViolations);

// ---------------------------------------------------------------------------
// Mock MSAL (Azure AD authentication)
// ---------------------------------------------------------------------------
vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: { loginRedirect: vi.fn(), logoutRedirect: vi.fn() },
    accounts: [],
  }),
  useIsAuthenticated: () => false,
  MsalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Mock shared components barrel to avoid pulling in heavy dependency chains (react-three/fiber)
// ---------------------------------------------------------------------------
vi.mock('@kvenno/shared/components', () => ({
  Breadcrumbs: ({ items }: { items: { label: string; href?: string }[] }) => (
    <nav aria-label="Breadcrumbs" data-testid="breadcrumbs">
      {items.map((item, i) => (
        <span key={i}>{item.label}</span>
      ))}
    </nav>
  ),
  Header: ({ authSlot }: { authSlot?: React.ReactNode; onInfoClick?: () => void }) => (
    <header data-testid="header">
      <span>Námsvefur Kvennó</span>
      {authSlot}
    </header>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>{children}</div>
  ),
  Card: ({ children, className, ...props }: Record<string, unknown>) => (
    <div data-testid="card" className={className as string} {...props}>{children as React.ReactNode}</div>
  ),
}));

// Mock lazy-loaded components (SessionHistory, TeacherResults, StudentFeedback)
vi.mock('../components/SessionHistory', () => ({
  SessionHistory: () => <div data-testid="session-history">Session History</div>,
}));
vi.mock('../components/StudentFeedback', () => ({
  StudentFeedback: () => <div data-testid="student-feedback">Student Feedback</div>,
}));
vi.mock('../components/TeacherResults', () => ({
  TeacherResults: () => <div data-testid="teacher-results">Teacher Results</div>,
}));

// Mock storage utilities (avoid localStorage in tests)
vi.mock('../utils/storage', () => ({
  loadSavedSessions: vi.fn().mockResolvedValue([]),
  saveSession: vi.fn(),
  loadSession: vi.fn(),
  deleteSession: vi.fn(),
  generateSessionId: vi.fn(() => 'test-id'),
}));

// Mock file processing
vi.mock('../utils/fileProcessing', () => ({
  extractTextFromFile: vi.fn(),
  getFileTypeDescription: vi.fn(() => 'Word (.docx)'),
}));

// Mock API
vi.mock('../utils/api', () => ({
  processFile: vi.fn(),
}));

// Mock export
vi.mock('../utils/export', () => ({
  exportResultsToCSV: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Import App after all mocks
// ---------------------------------------------------------------------------
import { App } from '../App';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Lab reports app - accessibility', () => {
  it('main layout has no axe violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('file upload area has an accessible label', () => {
    render(<App />);

    // The file input is associated with a <label> via htmlFor="file-upload"
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    // The label should be present
    const label = document.querySelector('label[for="file-upload"]');
    expect(label).not.toBeNull();
    expect(label!.textContent!.trim().length).toBeGreaterThan(0);
  });

  it('experiment selector is accessible with a label', () => {
    render(<App />);

    // The select for experiment choosing should be labelled
    const select = screen.getByRole('combobox');
    expect(select).toBeDefined();

    // The select's associated label says "Veldu tilraun:"
    expect(screen.getByText(/Veldu tilraun/)).toBeDefined();
  });

  it('auth button has accessible name', () => {
    render(<App />);

    // When not authenticated, the AuthButton shows "Skrá inn" button
    const authButton = screen.getByText('Skrá inn');
    expect(authButton).toBeDefined();
    expect(authButton.closest('button')).not.toBeNull();
  });

  it('has proper heading hierarchy', () => {
    const { container } = render(<App />);

    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);

    // The main title should be h1
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1!.textContent).toContain('Tilraunarskýrslur');
  });

  it('view toggle buttons are proper button elements with text', () => {
    render(<App />);

    // "Ný greining" and "Saga" view toggle buttons
    const nyGreiningBtn = screen.getByText('Ný greining');
    expect(nyGreiningBtn.closest('button')).not.toBeNull();

    const sagaBtn = screen.getByText(/Saga/);
    expect(sagaBtn.closest('button')).not.toBeNull();
  });
});
