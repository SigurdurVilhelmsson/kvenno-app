/**
 * Authentication Callback Component
 *
 * This component handles the redirect from Azure AD after authentication.
 * It processes the authentication response and redirects the user back to
 * their original page (saved before login).
 *
 * Features:
 * - Handles MSAL redirect response
 * - Restores user to original URL after login
 * - Shows loading state during processing
 * - Error handling for failed authentication
 *
 * Route: /auth/callback
 */

import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { getRedirectUrl } from '../utils/authHelpers';

export const AuthCallback = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('🔐 Processing authentication callback...');

        // Handle the redirect response from Azure AD
        const response = await instance.handleRedirectPromise();

        if (response) {
          console.log('✅ Authentication successful!', response.account?.username);

          // Get the original URL the user was trying to access
          const basePath = import.meta.env.VITE_BASE_PATH || '/lab-reports';
          const redirectUrl = getRedirectUrl(basePath);

          // Extract just the path from the full URL
          const urlObj = new URL(redirectUrl);
          const pathToNavigate = urlObj.pathname + urlObj.search + urlObj.hash;

          console.log('🔐 Redirecting to:', pathToNavigate);

          // Navigate back to the original page
          // Use replace to avoid adding to history
          navigate(pathToNavigate, { replace: true });
        } else {
          console.log('⚠️ No authentication response found');
          // If no response, just redirect to home
          const basePath = import.meta.env.VITE_BASE_PATH || '/lab-reports';
          navigate(basePath, { replace: true });
        }
      } catch (err) {
        console.error('❌ Authentication error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Villa kom upp við innskráningu'
        );
      }
    };

    handleRedirect();
  }, [instance, navigate]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Innskráningarvilla
            </h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => {
                const basePath = import.meta.env.VITE_BASE_PATH || '/lab-reports';
                window.location.href = basePath;
              }}
              className="px-6 py-2 bg-kvenno-orange text-white rounded-lg hover:bg-orange-600 transition"
            >
              Til baka
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-kvenno-orange border-t-transparent mb-4"></div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Vinn úr innskráningu...
          </h2>
          <p className="text-slate-600">
            Vinsamlegast bíðið...
          </p>
        </div>
      </div>
    </div>
  );
};
