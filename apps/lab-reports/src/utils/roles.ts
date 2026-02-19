/**
 * Role Management
 *
 * This file manages user roles (teacher vs student) for the LabReports app.
 *
 * IMPORTANT: This is CLIENT-SIDE ONLY role checking for UI purposes.
 * For production, consider moving to server-side validation.
 * See KVENNO-STRUCTURE.md Section 2 for security considerations.
 */

import { AccountInfo } from '@azure/msal-browser';

/**
 * Teacher Email List
 *
 * Populated from the VITE_TEACHER_EMAILS environment variable at build time.
 * Set a comma-separated list of teacher email addresses in your .env file:
 *
 *   VITE_TEACHER_EMAILS=jon.jonsson@kvenno.is,gudrun.gudmundsdottir@kvenno.is
 *
 * See .env.example for reference.
 */
export const TEACHER_EMAILS: string[] = (import.meta.env.VITE_TEACHER_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim())
  .filter(Boolean);

/**
 * Check if an email belongs to a teacher
 *
 * @param email - User's email address
 * @returns true if user is a teacher, false otherwise
 */
export const isTeacher = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  return TEACHER_EMAILS.some(
    (teacherEmail) => teacherEmail.toLowerCase() === normalizedEmail
  );
};

/**
 * Get user role from account info
 *
 * @param account - MSAL account info
 * @returns 'teacher' or 'student'
 */
export const getUserRole = (account: AccountInfo | null): 'teacher' | 'student' => {
  if (!account || !account.username) {
    return 'student';
  }

  return isTeacher(account.username) ? 'teacher' : 'student';
};
