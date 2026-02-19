/**
 * MSAL Instance
 *
 * This file creates and exports the MSAL PublicClientApplication instance.
 * This instance is used throughout the app for authentication operations.
 *
 * IMPORTANT: This instance is created once and shared across the entire app.
 * Do not create multiple instances - always import from this file.
 */

import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/authConfig';
import { getRedirectUrl } from './authHelpers';

/**
 * Initialize MSAL instance
 *
 * This instance handles:
 * - User login/logout
 * - Token acquisition and refresh
 * - Account management
 * - Redirect handling
 */
export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Initialize MSAL
 *
 * This function must be called before using the instance.
 * It handles redirect promises and initializes the library.
 *
 * If we're on the callback route (/auth/callback), it processes
 * the authentication response and redirects to the saved return URL.
 */
export const initializeMsal = async () => {
  try {
    await msalInstance.initialize();

    // Handle redirect promise (if returning from Azure AD)
    const response = await msalInstance.handleRedirectPromise();

    // If we're on the callback route and have a response, redirect back
    if (window.location.pathname === '/auth/callback' && response) {
      console.log('✅ Authentication successful, redirecting...');

      // Get the return URL (where the user was before login)
      const basePath = import.meta.env.VITE_BASE_PATH || '/lab-reports';
      const redirectUrl = getRedirectUrl(basePath);

      // Redirect to the saved URL
      window.location.href = redirectUrl;
    }
  } catch (error) {
    console.error('MSAL initialization error:', error);
  }
};
