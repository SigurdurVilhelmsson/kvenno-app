/**
 * Check if extraction debugging is enabled
 */
export const isExtractionDebugEnabled = (): boolean => {
  try {
    return localStorage.getItem('debug-extraction') === 'true';
  } catch {
    return false;
  }
};

/**
 * Enable/disable extraction debugging
 */
export const setExtractionDebug = (enabled: boolean): void => {
  try {
    if (enabled) {
      localStorage.setItem('debug-extraction', 'true');
      console.log('[Debug] Extraction debugging enabled');
    } else {
      localStorage.removeItem('debug-extraction');
      console.log('[Debug] Extraction debugging disabled');
    }
  } catch (error) {
    console.error('[Debug] Could not set debug mode:', error);
  }
};
