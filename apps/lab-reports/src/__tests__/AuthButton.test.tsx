// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  LogIn: (props: Record<string, unknown>) => <div data-testid="login-icon" {...props} />,
  LogOut: (props: Record<string, unknown>) => <div data-testid="logout-icon" {...props} />,
  User: (props: Record<string, unknown>) => <div data-testid="user-icon" {...props} />,
}));

// Mock authConfig
vi.mock('../config/authConfig', () => ({
  loginRequest: { scopes: ['User.Read'] },
}));

const mockLoginRedirect = vi.fn().mockResolvedValue(undefined);
const mockLogoutRedirect = vi.fn().mockResolvedValue(undefined);
const mockInstance = {
  loginRedirect: mockLoginRedirect,
  logoutRedirect: mockLogoutRedirect,
};

let mockIsAuthenticated = false;
let mockAccounts: Array<{ name?: string; username?: string }> = [];

vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: mockInstance,
    accounts: mockAccounts,
  }),
  useIsAuthenticated: () => mockIsAuthenticated,
}));

// Import after mocks are set up
import { AuthButton } from '../components/AuthButton';

describe('AuthButton component', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockAccounts = [];
    mockLoginRedirect.mockClear();
    mockLogoutRedirect.mockClear();
  });

  it('shows login button with "Skra inn" when unauthenticated', () => {
    render(<AuthButton />);
    expect(screen.getByText('Skrá inn')).toBeDefined();
    expect(screen.getByTestId('login-icon')).toBeDefined();
  });

  it('calls loginRedirect when login button is clicked', () => {
    render(<AuthButton />);
    fireEvent.click(screen.getByText('Skrá inn'));
    expect(mockLoginRedirect).toHaveBeenCalledWith({ scopes: ['User.Read'] });
  });

  it('shows user name and logout button when authenticated', () => {
    mockIsAuthenticated = true;
    mockAccounts = [{ name: 'Anna Sigurdsdottir', username: 'anna@kvenno.is' }];

    render(<AuthButton />);
    expect(screen.getByText('Anna Sigurdsdottir')).toBeDefined();
    expect(screen.getByText('Skrá út')).toBeDefined();
    expect(screen.getByTestId('user-icon')).toBeDefined();
    expect(screen.getByTestId('logout-icon')).toBeDefined();
  });

  it('falls back to username when name is not available', () => {
    mockIsAuthenticated = true;
    mockAccounts = [{ username: 'anna@kvenno.is' }];

    render(<AuthButton />);
    expect(screen.getByText('anna@kvenno.is')).toBeDefined();
  });

  it('falls back to "Notandi" when neither name nor username is available', () => {
    mockIsAuthenticated = true;
    mockAccounts = [{}];

    render(<AuthButton />);
    expect(screen.getByText('Notandi')).toBeDefined();
  });

  it('calls logoutRedirect when logout button is clicked', () => {
    mockIsAuthenticated = true;
    mockAccounts = [{ name: 'Anna', username: 'anna@kvenno.is' }];

    render(<AuthButton />);
    fireEvent.click(screen.getByText('Skrá út'));
    expect(mockLogoutRedirect).toHaveBeenCalledTimes(1);
  });
});
