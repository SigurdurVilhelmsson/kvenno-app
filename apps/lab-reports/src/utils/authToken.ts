/**
 * The signed-in user's Microsoft ID token, for the backend's Claude endpoints.
 *
 * The server checks it on `/api/analyze`, `/api/analyze-2ar` and `/api/process-document`
 * (`server/src/lib/auth.ts`). Until 2026-10-24 those endpoints took anyone who sent the site's
 * Origin header, so the Claude key behind them was an open proxy (`docs/REVIEW-QUEUE.md` D4).
 *
 * MSAL is imported lazily, so a module that imports this one does not construct the MSAL
 * instance until a request is actually sent.
 */

/** Refresh a token this close to expiry rather than send one the server may already refuse. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

export const NOT_SIGNED_IN = 'Innskráning fannst ekki. Endurhlaðið síðuna og skráið ykkur inn.';
export const SESSION_EXPIRED = 'Innskráningin er útrunnin. Skráið ykkur inn aftur.';

/** `{ Authorization: 'Bearer …' }` for the current user. */
export async function authHeaders(): Promise<Record<string, string>> {
  // The front end's own development bypass (AuthGuard): there is no sign-in to send. The server
  // then needs AUTH_DISABLED=true, which it ignores in production.
  if (import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true') return {};

  const [{ msalInstance }, { loginRequest }, { InteractionRequiredAuthError }, { saveReturnUrl }] =
    await Promise.all([
      import('./msalInstance'),
      import('../config/authConfig'),
      import('@azure/msal-browser'),
      import('./authHelpers'),
    ]);

  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) throw new Error(NOT_SIGNED_IN);

  try {
    let result = await msalInstance.acquireTokenSilent({ scopes: loginRequest.scopes, account });
    const exp = Number((result.idTokenClaims as { exp?: number } | undefined)?.exp) || 0;
    if (!result.idToken || exp * 1000 - Date.now() < REFRESH_MARGIN_MS) {
      result = await msalInstance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account,
        forceRefresh: true,
      });
    }
    return { Authorization: `Bearer ${result.idToken}` };
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // The session can no longer be renewed silently: sign in again and come back here.
      saveReturnUrl();
      await msalInstance.loginRedirect(loginRequest);
    }
    throw new Error(SESSION_EXPIRED, { cause: error });
  }
}
