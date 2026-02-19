import { GradingSession } from '@/types';

// Storage key prefix
const SESSION_PREFIX = 'grading_session:';

/**
 * Check if storage is available
 */
const isStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    // Test if we can actually use localStorage
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * List all saved sessions
 */
export const loadSavedSessions = async (): Promise<GradingSession[]> => {
  if (!isStorageAvailable()) {
    console.warn('Storage not available');
    return [];
  }

  try {
    const sessions: GradingSession[] = [];

    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // Only process keys with our prefix
      if (key && key.startsWith(SESSION_PREFIX)) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            sessions.push(JSON.parse(value));
          }
        } catch {
          console.warn('Failed to load session:', key);
        }
      }
    }

    // Sort by timestamp, newest first
    return sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
};

/**
 * Save a session
 */
export const saveSession = async (session: GradingSession): Promise<void> => {
  if (!isStorageAvailable()) {
    throw new Error('Geymsla ekki í boði - athugaðu vafrastillingar');
  }

  try {
    localStorage.setItem(`${SESSION_PREFIX}${session.id}`, JSON.stringify(session));
  } catch (error: unknown) {
    console.error('Error saving session:', error);

    // Check for quota exceeded error
    if (error instanceof DOMException) {
      if (
        error.name === 'QuotaExceededError' ||
        error.code === 22 || // Old browsers
        error.code === 1014 // Firefox
      ) {
        throw new Error('Minni fullt - reyndu að eyða gömlum greiningum til að losa pláss');
      }
    }

    // Re-throw with more context
    const message = error instanceof Error ? error.message : 'Óþekkt villa';
    throw new Error(`Villa við að vista: ${message}`);
  }
};

/**
 * Load a specific session
 */
export const loadSession = async (sessionId: string): Promise<GradingSession | null> => {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const value = localStorage.getItem(`${SESSION_PREFIX}${sessionId}`);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('Error loading session:', error);
    return null;
  }
};

/**
 * Delete a session
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  if (!isStorageAvailable()) {
    throw new Error('Storage not available');
  }

  try {
    localStorage.removeItem(`${SESSION_PREFIX}${sessionId}`);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
