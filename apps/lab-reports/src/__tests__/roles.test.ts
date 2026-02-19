import type { AccountInfo } from '@azure/msal-browser';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for roles.ts
 *
 * TEACHER_EMAILS is now derived from import.meta.env.VITE_TEACHER_EMAILS at
 * module load time. We use vi.stubEnv() + dynamic import to control the value
 * seen by each test group.
 */

describe('roles - isTeacher', () => {
  let isTeacher: (email: string) => boolean;
  let TEACHER_EMAILS: string[];

  beforeEach(async () => {
    vi.stubEnv('VITE_TEACHER_EMAILS', 'anna.sigurdsdottir@kvenno.is,jon.jonsson@kvenno.is');
    vi.resetModules();
    const mod = await import('../utils/roles');
    isTeacher = mod.isTeacher;
    TEACHER_EMAILS = mod.TEACHER_EMAILS;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('populates TEACHER_EMAILS from env var', () => {
    expect(TEACHER_EMAILS).toEqual([
      'anna.sigurdsdottir@kvenno.is',
      'jon.jonsson@kvenno.is',
    ]);
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
});

describe('roles - isTeacher with empty env var', () => {
  let isTeacher: (email: string) => boolean;
  let TEACHER_EMAILS: string[];

  beforeEach(async () => {
    vi.stubEnv('VITE_TEACHER_EMAILS', '');
    vi.resetModules();
    const mod = await import('../utils/roles');
    isTeacher = mod.isTeacher;
    TEACHER_EMAILS = mod.TEACHER_EMAILS;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns empty array when env var is empty', () => {
    expect(TEACHER_EMAILS).toEqual([]);
  });

  it('returns false when TEACHER_EMAILS is empty', () => {
    expect(isTeacher('anna.sigurdsdottir@kvenno.is')).toBe(false);
  });
});

describe('roles - getUserRole', () => {
  let getUserRole: (account: AccountInfo | null) => 'teacher' | 'student';

  beforeEach(async () => {
    vi.stubEnv('VITE_TEACHER_EMAILS', 'kennari@kvenno.is');
    vi.resetModules();
    const mod = await import('../utils/roles');
    getUserRole = mod.getUserRole;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
