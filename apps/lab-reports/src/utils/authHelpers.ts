/**
 * Authentication Helper Functions
 *
 * Utilities to manage return URLs during Azure AD authentication flow.
 * This allows users to be redirected back to their original page after login.
 */

const RETURN_URL_KEY = 'kvenno_auth_return_url';

/**
 * Save the current URL before redirecting to login
 * This should be called BEFORE triggering loginRedirect()
 */
export const saveReturnUrl = (): void => {
  try {
    const currentUrl = window.location.href;
    sessionStorage.setItem(RETURN_URL_KEY, currentUrl);
    console.log('🔐 Saved return URL:', currentUrl);
  } catch (error) {
    console.error('Failed to save return URL:', error);
    // Gracefully handle storage unavailability (e.g., private browsing)
  }
};

/**
 * Get the saved return URL after authentication
 * Returns the saved URL or null if not found
 */
export const getReturnUrl = (): string | null => {
  try {
    const returnUrl = sessionStorage.getItem(RETURN_URL_KEY);
    return returnUrl;
  } catch (error) {
    console.error('Failed to get return URL:', error);
    return null;
  }
};

/**
 * Clear the saved return URL after successful redirect
 * Should be called after navigating to the return URL
 */
export const clearReturnUrl = (): void => {
  try {
    sessionStorage.removeItem(RETURN_URL_KEY);
    console.log('🔐 Cleared return URL');
  } catch (error) {
    console.error('Failed to clear return URL:', error);
  }
};

/**
 * Get the appropriate redirect URL after authentication
 * Falls back to the app's base path if no return URL is saved
 */
export const getRedirectUrl = (basePath: string = '/'): string => {
  const returnUrl = getReturnUrl();

  if (returnUrl) {
    clearReturnUrl();
    return returnUrl;
  }

  // Fallback to base path
  return window.location.origin + basePath;
};
