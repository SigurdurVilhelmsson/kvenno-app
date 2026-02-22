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
 * It initializes the library. Redirect handling is done
 * exclusively in the AuthCallback component to avoid
 * consuming the redirect promise twice.
 */
export const initializeMsal = async () => {
  try {
    await msalInstance.initialize();
  } catch (error) {
    console.error('MSAL initialization error:', error);
  }
};
