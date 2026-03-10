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
