import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authHeaders, NOT_SIGNED_IN, SESSION_EXPIRED } from '../utils/authToken';

// vi.mock and vi.hoisted run before the imports above, whatever their place in the file.
const msal = vi.hoisted(() => ({
  getActiveAccount: vi.fn(),
  getAllAccounts: vi.fn(),
  acquireTokenSilent: vi.fn(),
  loginRedirect: vi.fn(),
}));
const saveReturnUrl = vi.hoisted(() => vi.fn());

vi.mock('../utils/msalInstance', () => ({ msalInstance: msal }));
vi.mock('../config/authConfig', () => ({ loginRequest: { scopes: ['User.Read'] } }));
vi.mock('../utils/authHelpers', () => ({ saveReturnUrl }));
vi.mock('@azure/msal-browser', () => ({
  InteractionRequiredAuthError: class InteractionRequiredAuthError extends Error {
    constructor(errorCode?: string) {
      super(errorCode);
    }
  },
}));

const account = { homeAccountId: 'a' };
const inSeconds = (s: number) => Math.floor(Date.now() / 1000) + s;

beforeEach(() => {
  vi.resetAllMocks();
  msal.getActiveAccount.mockReturnValue(account);
  msal.getAllAccounts.mockReturnValue([account]);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('authHeaders', () => {
  it('sends the ID token as a bearer token', async () => {
    msal.acquireTokenSilent.mockResolvedValue({
      idToken: 'token-1',
      idTokenClaims: { exp: inSeconds(3600) },
    });
    await expect(authHeaders()).resolves.toEqual({ Authorization: 'Bearer token-1' });
    expect(msal.acquireTokenSilent).toHaveBeenCalledTimes(1);
    expect(msal.acquireTokenSilent).toHaveBeenCalledWith({ scopes: ['User.Read'], account });
  });

  it('refreshes a token about to expire rather than send it', async () => {
    msal.acquireTokenSilent
      .mockResolvedValueOnce({ idToken: 'old', idTokenClaims: { exp: inSeconds(60) } })
      .mockResolvedValueOnce({ idToken: 'new', idTokenClaims: { exp: inSeconds(3600) } });
    await expect(authHeaders()).resolves.toEqual({ Authorization: 'Bearer new' });
    expect(msal.acquireTokenSilent).toHaveBeenLastCalledWith(
      expect.objectContaining({ forceRefresh: true })
    );
  });

  it('falls back to the first account when none is active', async () => {
    msal.getActiveAccount.mockReturnValue(null);
    msal.acquireTokenSilent.mockResolvedValue({
      idToken: 't',
      idTokenClaims: { exp: inSeconds(3600) },
    });
    await authHeaders();
    expect(msal.acquireTokenSilent).toHaveBeenCalledWith(expect.objectContaining({ account }));
  });

  it('refuses when nobody is signed in', async () => {
    msal.getActiveAccount.mockReturnValue(null);
    msal.getAllAccounts.mockReturnValue([]);
    await expect(authHeaders()).rejects.toThrow(NOT_SIGNED_IN);
    expect(msal.acquireTokenSilent).not.toHaveBeenCalled();
  });

  it('signs in again when the session cannot be renewed silently', async () => {
    msal.acquireTokenSilent.mockRejectedValue(
      new InteractionRequiredAuthError('interaction_required', 'expired')
    );
    await expect(authHeaders()).rejects.toThrow(SESSION_EXPIRED);
    expect(saveReturnUrl).toHaveBeenCalled();
    expect(msal.loginRedirect).toHaveBeenCalledWith({ scopes: ['User.Read'] });
  });

  it('does not redirect on any other failure', async () => {
    msal.acquireTokenSilent.mockRejectedValue(new Error('network'));
    await expect(authHeaders()).rejects.toThrow(SESSION_EXPIRED);
    expect(msal.loginRedirect).not.toHaveBeenCalled();
  });

  it('sends nothing under the development bypass', async () => {
    vi.stubEnv('VITE_BYPASS_AUTH', 'true');
    await expect(authHeaders()).resolves.toEqual({});
    expect(msal.acquireTokenSilent).not.toHaveBeenCalled();
  });
});
