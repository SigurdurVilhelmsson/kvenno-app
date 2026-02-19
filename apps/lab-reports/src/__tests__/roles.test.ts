import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AccountInfo } from '@azure/msal-browser';

// We need to dynamically modify TEACHER_EMAILS for testing, so we import
// the module and manipulate the exported array.
import { TEACHER_EMAILS, isTeacher, getUserRole } from '../utils/roles';

describe('roles - isTeacher', () => {
  const originalEmails: string[] = [];

  beforeEach(() => {
    // Save original state and populate with test data
    originalEmails.length = 0;
    originalEmails.push(...TEACHER_EMAILS);
    TEACHER_EMAILS.length = 0;
    TEACHER_EMAILS.push('anna.sigurdsdottir@kvenno.is', 'jon.jonsson@kvenno.is');
  });

  afterEach(() => {
    // Restore original state
    TEACHER_EMAILS.length = 0;
    TEACHER_EMAILS.push(...originalEmails);
  });

  it('returns true for an email in the TEACHER_EMAILS list', () => {
    expect(isTeacher('anna.sigurdsdottir@kvenno.is')).toBe(true);
  });

  it('returns true for a teacher email with different casing', () => {
    expect(isTeacher('Anna.Sigurdsdottir@Kvenno.Is')).toBe(true);
  });

  it('returns true for an email with leading/trailing whitespace', () => {
    expect(isTeacher('  jon.jonsson@kvenno.is  ')).toBe(true);
  });

  it('returns false for a non-teacher email', () => {
    expect(isTeacher('student@kvenno.is')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isTeacher('')).toBe(false);
  });

  it('returns false when TEACHER_EMAILS is empty', () => {
    TEACHER_EMAILS.length = 0;
    expect(isTeacher('anna.sigurdsdottir@kvenno.is')).toBe(false);
  });
});

describe('roles - getUserRole', () => {
  const originalEmails: string[] = [];

  beforeEach(() => {
    originalEmails.length = 0;
    originalEmails.push(...TEACHER_EMAILS);
    TEACHER_EMAILS.length = 0;
    TEACHER_EMAILS.push('kennari@kvenno.is');
  });

  afterEach(() => {
    TEACHER_EMAILS.length = 0;
    TEACHER_EMAILS.push(...originalEmails);
  });

  it('returns "teacher" when account email is in TEACHER_EMAILS', () => {
    const account = { username: 'kennari@kvenno.is' } as AccountInfo;
    expect(getUserRole(account)).toBe('teacher');
  });

  it('returns "student" when account email is not in TEACHER_EMAILS', () => {
    const account = { username: 'nemandi@kvenno.is' } as AccountInfo;
    expect(getUserRole(account)).toBe('student');
  });

  it('returns "student" when account is null', () => {
    expect(getUserRole(null)).toBe('student');
  });

  it('returns "student" when account.username is empty', () => {
    const account = { username: '' } as AccountInfo;
    expect(getUserRole(account)).toBe('student');
  });

  it('returns "student" when account.username is undefined', () => {
    const account = {} as AccountInfo;
    expect(getUserRole(account)).toBe('student');
  });
});
