/**
 * User Role Hook
 *
 * This hook provides the current user's role (teacher or student)
 * based on their authenticated email address.
 *
 * Usage:
 * ```tsx
 * const { role, email, loading } = useUserRole();
 *
 * if (loading) return <div>Hleð...</div>;
 * if (role === 'teacher') return <TeacherView />;
 * return <StudentView />;
 * ```
 */

import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { getUserRole } from '../utils/roles';

export interface UserRole {
  role: 'teacher' | 'student';
  email: string;
  loading: boolean;
}

/**
 * Hook to get the current user's role
 *
 * @returns UserRole object with role, email, and loading state
 */
export const useUserRole = (): UserRole => {
  const { accounts } = useMsal();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Account info is available immediately after MSAL initialization
    setLoading(false);
  }, [accounts]);

  const account = accounts[0] || null;
  const role = getUserRole(account);
  const email = account?.username || '';

  return {
    role,
    email,
    loading,
  };
};
