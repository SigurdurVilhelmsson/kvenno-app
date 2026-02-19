import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { saveReturnUrl, getReturnUrl, clearReturnUrl, getRedirectUrl } from '../utils/authHelpers';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();

describe('authHelpers - saveReturnUrl', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    vi.stubGlobal('sessionStorage', mockSessionStorage);
    vi.stubGlobal('window', {
      location: { href: 'https://kvenno.app/efnafraedi/2-ar/lab-reports/' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves the current window.location.href to sessionStorage', () => {
    saveReturnUrl();
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'kvenno_auth_return_url',
      'https://kvenno.app/efnafraedi/2-ar/lab-reports/'
    );
  });

  it('handles sessionStorage errors gracefully', () => {
    mockSessionStorage.setItem.mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });
    // Should not throw
    expect(() => saveReturnUrl()).not.toThrow();
  });
});

describe('authHelpers - getReturnUrl', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    vi.stubGlobal('sessionStorage', mockSessionStorage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the stored URL from sessionStorage', () => {
    mockSessionStorage.setItem('kvenno_auth_return_url', 'https://kvenno.app/some-page');
    const result = getReturnUrl();
    expect(result).toBe('https://kvenno.app/some-page');
  });

  it('returns null when no URL is stored', () => {
    const result = getReturnUrl();
    expect(result).toBeNull();
  });

  it('handles sessionStorage errors gracefully and returns null', () => {
    mockSessionStorage.getItem.mockImplementationOnce(() => {
      throw new Error('SecurityError');
    });
    expect(getReturnUrl()).toBeNull();
  });
});

describe('authHelpers - clearReturnUrl', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    vi.stubGlobal('sessionStorage', mockSessionStorage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('removes the return URL from sessionStorage', () => {
    mockSessionStorage.setItem('kvenno_auth_return_url', 'https://kvenno.app/page');
    clearReturnUrl();
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('kvenno_auth_return_url');
  });

  it('handles sessionStorage errors gracefully', () => {
    mockSessionStorage.removeItem.mockImplementationOnce(() => {
      throw new Error('SecurityError');
    });
    expect(() => clearReturnUrl()).not.toThrow();
  });
});

describe('authHelpers - getRedirectUrl', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    vi.stubGlobal('sessionStorage', mockSessionStorage);
    vi.stubGlobal('window', {
      location: { origin: 'https://kvenno.app', href: 'https://kvenno.app/' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns saved return URL and clears it from storage', () => {
    mockSessionStorage.setItem('kvenno_auth_return_url', 'https://kvenno.app/efnafraedi/3-ar/lab-reports/');
    const result = getRedirectUrl('/lab-reports');
    expect(result).toBe('https://kvenno.app/efnafraedi/3-ar/lab-reports/');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('kvenno_auth_return_url');
  });

  it('falls back to origin + basePath when no return URL is saved', () => {
    const result = getRedirectUrl('/lab-reports');
    expect(result).toBe('https://kvenno.app/lab-reports');
  });

  it('falls back to origin + "/" when no basePath is provided and no return URL', () => {
    const result = getRedirectUrl();
    expect(result).toBe('https://kvenno.app/');
  });
});
