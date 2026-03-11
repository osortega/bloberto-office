/**
 * Safely write to localStorage. Swallows QuotaExceededError and
 * SecurityError (iOS private browsing, enterprise policies) so callers
 * never need their own try/catch for non-critical persistence.
 */
export function safeSave(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // quota exceeded or storage unavailable — non-fatal
  }
}

/**
 * Safely read from localStorage. Returns null on SecurityError (iOS
 * private browsing) or any other storage access failure.
 */
export function safeRead(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
