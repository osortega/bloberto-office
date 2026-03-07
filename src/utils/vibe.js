/**
 * Returns the team vibe as an object with display label and CSS key.
 * @param {Array} workers
 * @returns {{ label: string, key: string }}
 */
export function getTeamVibe(workers) {
  if (workers.length === 0) return { label: '🌙 After Hours', key: 'after-hours' }
  const hasErrors = workers.some(w => w.status === 'error')
  if (hasErrors) return { label: '🚨 On Fire', key: 'on-fire' }
  const working = workers.filter(w => w.status === 'working').length
  const pct = working / workers.length
  if (pct > 0.7) return { label: '🔥 Crushing It', key: 'crushing' }
  if (pct >= 0.4) return { label: '⚡ In Flow', key: 'in-flow' }
  return { label: '😴 Slow Day', key: 'slow-day' }
}

/**
 * Returns just the string key for the team vibe (e.g. 'crushing', 'on-fire').
 * @param {Array} workers
 * @returns {string}
 */
export function getTeamVibeKey(workers) {
  return getTeamVibe(workers).key
}
