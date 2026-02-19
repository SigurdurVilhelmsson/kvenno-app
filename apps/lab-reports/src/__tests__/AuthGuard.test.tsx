// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock authConfig
vi.mock('../config/authConfig', () => ({
  loginRequest: { scopes: ['User.Read'] },
}));

// Mock authHelpers
vi.mock('../utils/authHelpers', () => ({
  saveReturnUrl: vi.fn(),
}));

const mockLoginRedirect = vi.fn().mockResolvedValue(undefined);

let mockInProgress = 'none'; // InteractionStatus.None = 'none'
let mockIsAuthenticated = false;

vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: { loginRedirect: mockLoginRedirect },
    inProgress: mockInProgress,
  }),
  useIsAuthenticated: () => mockIsAuthenticated,
}));

vi.mock('@azure/msal-browser', () => ({
  InteractionStatus: {
    None: 'none',
    Login: 'login',
    Logout: 'logout',
    HandleRedirect: 'handleRedirect',
  },
}));

// Import after mocks
import { AuthGuard } from '../components/AuthGuard';
import { saveReturnUrl } from '../utils/authHelpers';

describe('AuthGuard component', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockInProgress = 'none';
    mockLoginRedirect.mockClear();
    vi.mocked(saveReturnUrl).mockClear();
  });

  it('renders children when user is authenticated and no interaction in progress', () => {
    mockIsAuthenticated = true;
    mockInProgress = 'none';

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Protected content')).toBeDefined();
  });

  it('shows loading state and triggers login when not authenticated', () => {
    mockIsAuthenticated = false;
    mockInProgress = 'none';

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    // Should show the login-in-progress message
    expect(screen.getByText('Skráir inn...')).toBeDefined();
    expect(screen.getByText('Þú verður vísað á innskráningarsíðu...')).toBeDefined();
    // Should NOT show children
    expect(screen.queryByText('Protected content')).toBeNull();
    // Should have called saveReturnUrl and loginRedirect
    expect(saveReturnUrl).toHaveBeenCalled();
    expect(mockLoginRedirect).toHaveBeenCalled();
  });

  it('shows loading state while authentication is in progress', () => {
    mockIsAuthenticated = true;
    mockInProgress = 'login'; // InteractionStatus.Login

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    // When authenticated but interaction in progress, shows loading
    expect(screen.getByText('Hleð...')).toBeDefined();
    expect(screen.getByText('Vinsamlegast bíðið...')).toBeDefined();
    expect(screen.queryByText('Protected content')).toBeNull();
  });

  it('shows redirect message during handleRedirect interaction', () => {
    mockIsAuthenticated = false;
    mockInProgress = 'handleRedirect';

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    // When not authenticated and handling redirect
    expect(screen.getByText('Skráir inn...')).toBeDefined();
    expect(screen.queryByText('Protected content')).toBeNull();
  });

  it('does not trigger loginRedirect when interaction is already in progress', () => {
    mockIsAuthenticated = false;
    mockInProgress = 'login';

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    // Should not trigger login when already in progress
    expect(mockLoginRedirect).not.toHaveBeenCalled();
  });
});
