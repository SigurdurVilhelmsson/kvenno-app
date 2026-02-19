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
 * This array contains email addresses of all teachers who should have
 * access to teacher features (grading interface, CSV export, etc.)
 *
 * To add a new teacher:
 * 1. Add their @kvenno.is email to this array
 * 2. Commit and redeploy the app
 * 3. Test that they can access teacher features
 *
 * Example:
 * const TEACHER_EMAILS = [
 *   'jon.jonsson@kvenno.is',
 *   'gudrun.gudmundsdottir@kvenno.is',
 * ];
 */
export const TEACHER_EMAILS: string[] = [
  // Add teacher emails here
  // Example: 'teacher@kvenno.is',
];

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
