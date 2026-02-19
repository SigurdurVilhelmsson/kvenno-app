/**
 * Authentication Button Component
 *
 * This component displays a login/logout button with the current user's name.
 * It follows the Kvenno design system (#f36b22, 8px radius, 2px border).
 *
 * Features:
 * - Shows "Skrá inn" when logged out
 * - Shows user name + "Skrá út" when logged in
 * - Handles login/logout with MSAL
 * - Icelandic language throughout
 * - Kvenno design system styling
 *
 * Usage:
 * ```tsx
 * <Header>
 *   <AuthButton />
 * </Header>
 * ```
 */

import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { LogIn, LogOut, User } from 'lucide-react';
import { loginRequest } from '../config/authConfig';

export const AuthButton = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((error) => {
      console.error('Innskráningarvilla:', error);
    });
  };

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin + window.location.pathname,
    }).catch((error) => {
      console.error('Útskráningarvilla:', error);
    });
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleLogin}
        className="flex items-center gap-2 px-4 py-2 border-2 border-kvenno-orange text-kvenno-orange rounded-lg hover:bg-kvenno-orange hover:text-white transition font-medium"
      >
        <LogIn size={18} />
        Skrá inn
      </button>
    );
  }

  const account = accounts[0];
  const userName = account?.name || account?.username || 'Notandi';

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-slate-700">
        <User size={18} />
        <span className="text-sm font-medium">{userName}</span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:border-kvenno-orange hover:text-kvenno-orange transition font-medium"
      >
        <LogOut size={18} />
        Skrá út
      </button>
    </div>
  );
};
