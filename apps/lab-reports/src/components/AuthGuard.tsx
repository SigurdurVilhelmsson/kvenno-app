// IMPORTS MUST BE FIRST
import { ReactNode, useEffect } from 'react';

import { InteractionStatus } from '@azure/msal-browser';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';

import { loginRequest } from '../config/authConfig';
import { saveReturnUrl } from '../utils/authHelpers';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Authentication Guard Component
 *
 * This component wraps protected content and ensures users are authenticated
 * before they can access it.
 *
 * Features:
 * - Automatic redirect to Azure AD login if not authenticated
 * - Saves current URL before redirect (restored after login)
 * - Loading state while checking authentication
 * - Error handling in Icelandic
 * - Graceful fallback for auth failures
 *
 * Usage:
 * ```tsx
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 * ```
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  // Auth bypass only works in dev mode with explicit env var
  const BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true';

  // Hooks must be called before any conditional returns
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    // Skip login trigger if auth is bypassed
    if (BYPASS_AUTH) return;

    // Only trigger login if:
    // 1. User is not authenticated
    // 2. No authentication operation is in progress
    // 3. MSAL is fully initialized
    if (!isAuthenticated && inProgress === InteractionStatus.None) {
      // Save the current URL BEFORE redirecting to login
      // This allows us to return the user to their original page
      saveReturnUrl();

      // Use redirect for login (better UX than popup)
      instance.loginRedirect(loginRequest).catch((error) => {
        console.error('Innskráningarvilla:', error);
      });
    }
  }, [isAuthenticated, inProgress, instance, BYPASS_AUTH]);

  // Bypass auth if flag is set (for testing only)
  if (BYPASS_AUTH) {
    console.warn('⚠️ AUTHENTICATION BYPASSED — VITE_BYPASS_AUTH=true in development mode');
    return <>{children}</>;
  }

  // Show loading state while checking authentication or during login
  if (inProgress !== InteractionStatus.None || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 flex items-center justify-center">
        <div className="bg-surface-raised rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-kvenno-orange border-t-transparent mb-4"></div>
            <h2 className="text-xl font-bold font-heading text-warm-900 mb-2">
              {isAuthenticated ? 'Hleð...' : 'Skráir inn...'}
            </h2>
            <p className="text-warm-600">
              {isAuthenticated
                ? 'Vinsamlegast bíðið...'
                : 'Þú verður vísað á innskráningarsíðu...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};
