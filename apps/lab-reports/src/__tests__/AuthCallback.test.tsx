// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock authHelpers
vi.mock('../utils/authHelpers', () => ({
  getRedirectUrl: vi.fn(),
}));

const mockHandleRedirectPromise = vi.fn();

vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: { handleRedirectPromise: mockHandleRedirectPromise },
  }),
}));

// Import after mocks
import { AuthCallback } from '../components/AuthCallback';
import { getRedirectUrl } from '../utils/authHelpers';

describe('AuthCallback component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockHandleRedirectPromise.mockReset();
    vi.mocked(getRedirectUrl).mockReset();
  });

  it('shows loading state while processing authentication', () => {
    // Never resolve to keep loading state
    mockHandleRedirectPromise.mockReturnValue(new Promise(() => {}));

    render(<AuthCallback />);

    expect(screen.getByText('Vinn úr innskráningu...')).toBeDefined();
    expect(screen.getByText('Vinsamlegast bíðið...')).toBeDefined();
  });

  it('navigates to saved return URL after successful authentication', async () => {
    const authResponse = { account: { username: 'user@kvenno.is' } };
    mockHandleRedirectPromise.mockResolvedValue(authResponse);
    vi.mocked(getRedirectUrl).mockReturnValue('https://kvenno.app/efnafraedi/2-ar/lab-reports/');

    render(<AuthCallback />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/efnafraedi/2-ar/lab-reports/',
        { replace: true }
      );
    });
  });

  it('navigates to base path when handleRedirectPromise returns null', async () => {
    mockHandleRedirectPromise.mockResolvedValue(null);

    render(<AuthCallback />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/lab-reports',
        { replace: true }
      );
    });
  });

  it('shows error state when authentication fails', async () => {
    mockHandleRedirectPromise.mockRejectedValue(new Error('AADSTS50011: The reply URL specified in the request does not match'));

    render(<AuthCallback />);

    await waitFor(() => {
      expect(screen.getByText('Innskráningarvilla')).toBeDefined();
    });
    expect(screen.getByText('AADSTS50011: The reply URL specified in the request does not match')).toBeDefined();
    expect(screen.getByText('Til baka')).toBeDefined();
  });

  it('shows generic Icelandic error for non-Error objects', async () => {
    mockHandleRedirectPromise.mockRejectedValue('unknown error');

    render(<AuthCallback />);

    await waitFor(() => {
      expect(screen.getByText('Innskráningarvilla')).toBeDefined();
    });
    expect(screen.getByText('Villa kom upp við innskráningu')).toBeDefined();
  });
});
