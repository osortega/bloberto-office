import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import './App.css'
import Office from './Office.jsx'
import { getTeamVibe } from './utils/vibe.js'
import { ROLE_EMOJIS, STATUS_LABELS, STATUS_EMOJIS } from './utils/constants.js'

const GITHUB_API_URL =
  'https://raw.githubusercontent.com/osortega/bloberto-office/main/data/workers.json'
const ACTIVITY_API_URL =
  'https://raw.githubusercontent.com/osortega/bloberto-office/main/data/activity.json'
const POLL_INTERVAL_ACTIVE = 30_000
const POLL_INTERVAL_HIDDEN = 60_000

async function fetchWorkersFromGitHub() {
  const res = await fetch(GITHUB_API_URL + '?t=' + Date.now())
  if (!res.ok) throw new Error(`Fetch error ${res.status}`)
  return res.json()
}

async function fetchActivityFromGitHub() {
  const res = await fetch(ACTIVITY_API_URL + '?t=' + Date.now())
  if (!res.ok) throw new Error(`Fetch error ${res.status}`)
  return res.json()
}

function getRelativeTime(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatFullDateTime(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const ACTIVITY_ICONS = {
  hire: '🟢',
  complete: '✅',
  error: '❌',
  system: '⚙️',
}

function ActivityLogEntry({ entry }) {
  return (
    <div className={`activity-entry activity-entry--${entry.type}`}>
      <span className="activity-icon">{ACTIVITY_ICONS[entry.type] ?? '🔧'}</span>
      <div className="activity-body">
        {entry.worker && <span className="activity-worker">{entry.worker}</span>}
        <span className="activity-message">{entry.message}</span>
      </div>
      <span className="activity-time" title={formatFullDateTime(entry.timestamp)}>{getRelativeTime(entry.timestamp)}</span>
    </div>
  )
}

function ActivityLog({ entries, error }) {
  const displayed = [...entries].reverse().slice(0, 20)
  return (
    <div className="activity-log">
      {error ? (
        <div className="activity-error">⚠️ Could not load activity log. Check your connection and try again.</div>
      ) : displayed.length === 0 ? (
        <div className="activity-empty">No activity yet…</div>
      ) : (
        displayed.map((entry, i) => <ActivityLogEntry key={entry.timestamp + entry.worker + i} entry={entry} />)
      )}
    </div>
  )
}

function getRoleEmoji(role) {
  return ROLE_EMOJIS[role] ?? '🤖'
}

/** @type {Array<{ pattern: RegExp, label: string, emoji: string, className: string }>} */
const TASK_TAG_DEFS = [
  { pattern: /fix|bug|hotfix|broken|error/i,                        label: 'Bug',    emoji: '🔴', className: 'task-tag--bug' },
  { pattern: /deploy|ship|release|publish|ci|cd|pipeline/i,         label: 'Ship',   emoji: '🟠', className: 'task-tag--ship' },
  { pattern: /design|ui|ux|css|layout|frontend|component/i,         label: 'Design', emoji: '🟣', className: 'task-tag--design' },
  { pattern: /test|qa|spec|review|coverage|lint/i,                   label: 'QA',     emoji: '🔵', className: 'task-tag--qa' },
  { pattern: /data|migration|schema|db|database|query/i,            label: 'Data',   emoji: '🟤', className: 'task-tag--data' },
  { pattern: /docs|readme|changelog|write/i,                         label: 'Docs',   emoji: '🟢', className: 'task-tag--docs' },
]

/**
 * Parses a task string and returns all matching intent tag objects.
 * @param {string} taskString - The worker's current task description.
 * @returns {Array<{ label: string, emoji: string, className: string }>}
 */
function getTaskTags(taskString) {
  if (!taskString || typeof taskString !== 'string') return []
  return TASK_TAG_DEFS.filter(({ pattern }) => pattern.test(taskString))
    .map(({ label, emoji, className }) => ({ label, emoji, className }))
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status}`}>
      <span className="dot" />
      {STATUS_EMOJIS[status]} {STATUS_LABELS[status]}
    </span>
  )
}

function ProgressBar({ progress }) {
  return (
    <div className="progress-wrapper">
      <div className="progress-header">
        <span className="progress-label">Progress</span>
        <span className="progress-pct">{progress}%</span>
      </div>
      <div
        className="progress-bar-bg"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${progress}%`}
      >
        <div
          className={`progress-bar-fill${progress >= 100 ? ' progress-bar-fill--overflow' : ''}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}

function formatDuration(updatedAt) {
  if (!updatedAt) return null
  const diffMs = Date.now() - new Date(updatedAt).getTime()
  const mins = Math.floor(diffMs / 60_000)
  const hours = Math.floor(mins / 60)
  if (mins < 1) return 'Working for <1m'
  if (hours < 1) return `Working for ${mins}m`
  const rem = mins % 60
  return rem > 0 ? `Working for ${hours}h ${rem}m` : `Working for ${hours}h`
}

function WorkerCard({ worker, index = 0, isNew = false, isFading = false, activityEntries = [] }) {
  const [isFlipped, setIsFlipped] = useState(false)

  const classes = ['worker-card', worker.status]
  if (isNew) classes.push('worker-card--new')
  if (isFading) classes.push('worker-card--fading')
  if (isFlipped) classes.push('worker-card--flipped')

  const workerHistory = activityEntries
    .filter(e => e.worker === worker.name)
    .slice(-3)
    .reverse()

  return (
    <div className={classes.join(' ')} style={{ '--i': index }} tabIndex={0}>
      <div className="worker-card__inner">
        <div className="worker-card__front">
          <div className="worker-header">
            <div className="worker-avatar">{getRoleEmoji(worker.role)}</div>
            <div className="worker-info" style={{ flex: 1, paddingLeft: '0.75rem' }}>
              <div className="worker-name">{worker.name}</div>
              <div className="worker-role">{worker.role}</div>
            </div>
            <StatusBadge status={worker.status} />
            <button
              className="worker-card__info-btn"
              onClick={(e) => { e.stopPropagation(); setIsFlipped(true) }}
              aria-label={`Show activity history for ${worker.name}`}
              title="Show activity history"
            >ℹ️</button>
          </div>

          <div className="worker-task">
            <strong>📋 Current Task</strong>
            {worker.task}
            {(() => {
              const tags = getTaskTags(worker.task)
              return tags.length > 0 ? (
                <div className="task-tags">
                  {tags.map(({ label, emoji, className }) => (
                    <span key={label} className={`task-tag ${className}`}>
                      {emoji} {label}
                    </span>
                  ))}
                </div>
              ) : null
            })()}
          </div>

          {worker.status === 'working' && worker.updated_at && (
            <div className="worker-duration">⏱️ {formatDuration(worker.updated_at)}</div>
          )}

          <ProgressBar progress={worker.progress} />
        </div>

        <div className="worker-card__back">
          <button
            className="worker-card__back-close"
            onClick={() => setIsFlipped(false)}
            aria-label="Close activity history"
          >✕ Close</button>
          <div className="worker-card__back-title">{worker.name}</div>
          {workerHistory.length === 0 ? (
            <div className="worker-card__back-empty">No activity on record.</div>
          ) : (
            workerHistory.map((e, i) => (
              <div key={i} className="worker-card__back-entry">
                <span style={{ marginRight: '0.35rem' }}>{ACTIVITY_ICONS[e.type] ?? '🔧'}</span>
                {e.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


function StatsBar({ workers, vibe, lastSynced, isLive }) {
  const total = workers.length
  const active = workers.filter((w) => w.status === 'working').length
  const idle = workers.filter((w) => w.status === 'idle').length

  const syncLabel = lastSynced
    ? lastSynced.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'never'

  return (
    <div className="stats-bar" data-vibe={vibe.key}>
      <div className="stat-card total">
        <span className="stat-label">👥 On the Clock</span>
        <span className="stat-value">{total}</span>
      </div>
      <div className="stat-card active">
        <span className="stat-label">⚡ Active</span>
        <span className="stat-value">{active}</span>
      </div>
      <div className="stat-card idle">
        <span className="stat-label">😴 Idle</span>
        <span className="stat-value">{idle}</span>
      </div>
      <div className="stat-card sync-status">
        <span className="stat-label">
          <span className={`live-dot ${isLive ? 'live' : 'offline'}`} />
          {isLive ? 'Live' : 'Offline'}
        </span>
        <span className="stat-value sync-time">{syncLabel}</span>
      </div>
      <div className={`stat-card vibe vibe--${vibe.key}`}>
        <span className="stat-label">✨ Team Vibe</span>
        <span className="stat-value vibe-value">{vibe.label}</span>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <span className="empty-emoji">🌙</span>
      <h3>Everyone&apos;s off the clock.</h3>
      <p>The office is quiet... for now 🌙</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="worker-card">
          <div className="worker-card__inner">
            <div className="worker-card__front">
              <div className="worker-header">
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
                <div style={{ flex: 1, paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ width: '55%', height: 14 }} />
                  <div className="skeleton" style={{ width: '38%', height: 11 }} />
                </div>
                <div className="skeleton" style={{ width: 72, height: 22, borderRadius: 20 }} />
              </div>
              <div className="skeleton" style={{ width: '100%', height: 46 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ width: '100%', height: 8, borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

const TABS = ['office', 'dashboard']

const IDLE_TIMEOUT = 10 * 60_000

export default function App() {
  const [allWorkers, setAllWorkers] = useState([])
  const [roster, setRoster] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [activityError, setActivityError] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [fetchWarn, setFetchWarn] = useState(null)
  const [activityFilter, setActivityFilter] = useState('all')
  const [isLive, setIsLive] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('bloberto-theme') || 'dark')
  const [vibeStreak, setVibeStreak] = useState(1)
  const [tab, setTab] = useState(() => {
    const h = window.location.hash.slice(1)
    return h === 'dashboard' || h === 'office' ? h : 'office'
  })

  const lastActivity = useRef(Date.now())
  const previousVibeKeyRef = useRef(null)
  const [confettiActive, setConfettiActive] = useState(false)

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === '1') { setTab('office'); window.location.replace('#office') }
      else if (e.key === '2') { setTab('dashboard'); window.location.replace('#dashboard') }
      else if (e.key === 'Escape') document.activeElement?.blur()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ── Hash-based tab sync (browser back/forward) ──
  useEffect(() => {
    const handleHashChange = () => {
      const h = window.location.hash.slice(1)
      if (h === 'dashboard' || h === 'office') setTab(h)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // ── Worker cinematic entry / exit state ──
  // fadingMap: { [id]: worker } — workers playing their 400ms fade-out
  // newIds:    Set<id>          — workers currently flashing the 1.5s green pulse
  const seenIdsRef          = useRef(new Set())
  const prevActiveWorkersRef = useRef([])
  const fadingTimersRef      = useRef({})   // { [id]: timeoutId }
  const newClearTimersRef    = useRef({})   // { [id]: timeoutId }
  const [fadingMap, setFadingMap] = useState({})
  const [newIds,    setNewIds]    = useState(new Set())

  useEffect(() => {
    const touch = () => { lastActivity.current = Date.now() }
    window.addEventListener('mousemove', touch)
    window.addEventListener('keydown', touch)
    window.addEventListener('touchstart', touch)
    return () => {
      window.removeEventListener('mousemove', touch)
      window.removeEventListener('keydown', touch)
      window.removeEventListener('touchstart', touch)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bloberto-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const handleTabKeyDown = (e) => {
    const currentIdx = TABS.indexOf(tab)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setTab(TABS[(currentIdx + 1) % TABS.length])
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setTab(TABS[(currentIdx - 1 + TABS.length) % TABS.length])
    }
  }

  const syncFromGitHub = useCallback(async () => {
    setIsSyncing(true)
    const [workersResult, activityResult] = await Promise.allSettled([
      fetchWorkersFromGitHub(),
      fetchActivityFromGitHub(),
    ])

    if (workersResult.status === 'fulfilled') {
      const data = workersResult.value
      setAllWorkers(data.workers ?? [])
      setRoster(data.roster ?? [])
      setIsLive(true)
    } else {
      setIsLive(false)
    }

    if (activityResult.status === 'fulfilled') {
      const activity = activityResult.value
      setActivityLog(Array.isArray(activity) ? activity : [])
      setActivityError(null)
    } else {
      setActivityError('Could not load activity log. Check your connection and try again.')
    }

    const workersFailed = workersResult.status === 'rejected'
    const activityFailed = activityResult.status === 'rejected'
    if (workersFailed && activityFailed) {
      setFetchError('Having trouble connecting to HQ. Data may be stale.')
      setFetchWarn(null)
    } else if (workersFailed || activityFailed) {
      setFetchWarn('Some data may be stale.')
      setFetchError(null)
    } else {
      setFetchError(null)
      setFetchWarn(null)
    }

    setLastSynced(new Date())
    setIsLoading(false)
    setIsSyncing(false)
  }, [])

  useEffect(() => {
    syncFromGitHub()
    const getInterval = () =>
      document.visibilityState === 'hidden' ? POLL_INTERVAL_HIDDEN : POLL_INTERVAL_ACTIVE

    const pollTick = () => {
      if (Date.now() - lastActivity.current > IDLE_TIMEOUT) return
      syncFromGitHub()
    }

    let timer = setInterval(pollTick, getInterval())

    const handleVisibilityChange = () => {
      clearInterval(timer)
      timer = setInterval(pollTick, getInterval())
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [syncFromGitHub])

  const activeWorkers = allWorkers.filter(
    (w) => w.status === 'working' || w.status === 'idle' || w.status === 'error'
  )

  const teamVibe = useMemo(() => getTeamVibe(activeWorkers), [activeWorkers])

  // ── Diff activeWorkers vs previous snapshot ──
  useEffect(() => {
    const currentIds = new Set(activeWorkers.map(w => w.id))
    const prev = prevActiveWorkersRef.current
    const prevIds = new Set(prev.map(w => w.id))

    // Workers that just appeared — detect first-ever arrivals for the 'new' flash
    const appeared = activeWorkers.filter(w => !prevIds.has(w.id))
    const firstTime = appeared.filter(w => !seenIdsRef.current.has(w.id))
    if (firstTime.length > 0) {
      setNewIds(ids => new Set([...ids, ...firstTime.map(w => w.id)]))
      for (const w of firstTime) {
        if (newClearTimersRef.current[w.id]) clearTimeout(newClearTimersRef.current[w.id])
        newClearTimersRef.current[w.id] = setTimeout(() => {
          setNewIds(ids => { const next = new Set(ids); next.delete(w.id); return next })
          delete newClearTimersRef.current[w.id]
        }, 1500)
      }
    }
    for (const w of activeWorkers) seenIdsRef.current.add(w.id)

    // Workers that just disappeared — start 400ms fade-out
    const disappeared = prev.filter(w => !currentIds.has(w.id))
    if (disappeared.length > 0) {
      setFadingMap(m => {
        const next = { ...m }
        for (const w of disappeared) {
          if (next[w.id]) continue // already fading
          next[w.id] = w
        }
        return next
      })
      for (const w of disappeared) {
        if (fadingTimersRef.current[w.id]) continue
        fadingTimersRef.current[w.id] = setTimeout(() => {
          setFadingMap(m => { const next = { ...m }; delete next[w.id]; return next })
          delete fadingTimersRef.current[w.id]
        }, 400)
      }
    }

    // Workers that came back while still fading — cancel their removal
    const cameBack = activeWorkers.filter(w => fadingTimersRef.current[w.id])
    for (const w of cameBack) {
      clearTimeout(fadingTimersRef.current[w.id])
      delete fadingTimersRef.current[w.id]
      setFadingMap(m => { const next = { ...m }; delete next[w.id]; return next })
    }

    prevActiveWorkersRef.current = activeWorkers
  }, [activeWorkers])

  // ── Vibe Streak Counter + Confetti Burst ──
  useEffect(() => {
    const storedKey = sessionStorage.getItem('bloberto-vibe-key')
    const storedStreak = parseInt(sessionStorage.getItem('bloberto-vibe-streak') || '1', 10)
    const newStreak = storedKey === teamVibe.key ? storedStreak + 1 : 1
    sessionStorage.setItem('bloberto-vibe-key', teamVibe.key)
    sessionStorage.setItem('bloberto-vibe-streak', String(newStreak))
    setVibeStreak(newStreak)

    // Confetti burst when vibe rank increases
    const vibeRanking = { 'after-hours': 0, 'slow-day': 1, 'on-fire': 2, 'in-flow': 3, 'crushing': 4 }
    const prevKey = previousVibeKeyRef.current
    if (prevKey !== null && vibeRanking[teamVibe.key] > (vibeRanking[prevKey] ?? -1)) {
      setConfettiActive(true)
      setTimeout(() => setConfettiActive(false), 2500)
    }
    previousVibeKeyRef.current = teamVibe.key
  }, [teamVibe.key])

  // ── Favicon vibe indicator (Luna #7) ──
  useEffect(() => {
    const vibeColors = {
      crushing: '#22c55e', 'on-fire': '#ef4444', 'in-flow': '#3b82f6',
      'slow-day': '#9ca3af', 'after-hours': '#8b5cf6',
    }
    const c = document.createElement('canvas')
    c.width = 32; c.height = 32
    const ctx = c.getContext('2d')
    ctx.beginPath()
    ctx.arc(16, 16, 14, 0, Math.PI * 2)
    ctx.fillStyle = vibeColors[teamVibe.key] || '#3b82f6'
    ctx.fill()
    const link = document.querySelector('link[rel="icon"]') || document.createElement('link')
    link.rel = 'icon'
    link.href = c.toDataURL()
    if (!link.parentNode) document.head.appendChild(link)
  }, [teamVibe])

  // ── Document title updates (Luna #7) ──
  useEffect(() => {
    const workingCount = activeWorkers.filter(w => w.status === 'working').length
    const total = activeWorkers.length
    const hasError = activeWorkers.some(w => w.status === 'error')
    const prefix = hasError ? '⚠️ ' : ''
    if (workingCount === 0 && total === 0) {
      document.title = "😴 Bloberto's Office — All quiet"
    } else {
      document.title = `${prefix}(${workingCount}/${total}) Bloberto's Office — ${teamVibe.label}`
    }
  }, [activeWorkers, teamVibe])

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? '☕ Good morning'
      : currentHour < 18
      ? '🌤️ Good afternoon'
      : '🌙 Good evening'

  return (
    <div className="app">
      {confettiActive && (
        <div className="confetti-layer" aria-hidden="true">
          {Array.from({ length: 30 }, (_, i) => (
            <span key={i} className="confetti-piece" style={{ '--i': i }} />
          ))}
        </div>
      )}
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="header">
        <div className="header-title">
          <h1>🫠 Bloberto&apos;s Office</h1>
          <p>live monitor &middot; read-only view</p>
        </div>
        <div className="header-right">
          <div className="header-badge">
            {greeting}, <span>boss</span> &nbsp;&middot;&nbsp;{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <span className="vibe-pill" data-vibe={teamVibe.key}>
            {teamVibe.label}
          </span>
          {vibeStreak >= 3 && <span style={{fontSize:'0.72rem',fontWeight:700,color:'var(--accent)',marginLeft:'0.35rem'}}>x{vibeStreak}</span>}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main id="main-content" className="main">
        {fetchError && (
          <div className="fetch-error-banner" role="alert">
            <span>⚠️ {fetchError}</span>
            <button className="btn btn-sm btn-ghost" onClick={syncFromGitHub}>↺ Retry</button>
          </div>
        )}
        {fetchWarn && !fetchError && (
          <div className="fetch-warn-banner" role="status">
            <span>⚠️ {fetchWarn}</span>
            <button className="btn btn-sm btn-ghost" onClick={syncFromGitHub}>↺ Retry</button>
          </div>
        )}
        <div className="tab-toggle" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'office'}
            aria-controls="tabpanel-office"
            tabIndex={tab === 'office' ? 0 : -1}
            className={tab === 'office' ? 'active' : ''}
            onClick={() => { setTab('office'); window.location.hash = 'office' }}
            onKeyDown={handleTabKeyDown}
          >
            🏢 Office
          </button>
          <button
            role="tab"
            aria-selected={tab === 'dashboard'}
            aria-controls="tabpanel-dashboard"
            tabIndex={tab === 'dashboard' ? 0 : -1}
            className={tab === 'dashboard' ? 'active' : ''}
            onClick={() => { setTab('dashboard'); window.location.hash = 'dashboard' }}
            onKeyDown={handleTabKeyDown}
          >
            📊 Dashboard
          </button>
        </div>

        {tab === 'office' ? (
          <div role="tabpanel" id="tabpanel-office">
            <Office workers={activeWorkers} roster={roster} isSyncing={isSyncing} />
          </div>
        ) : (
          <div role="tabpanel" id="tabpanel-dashboard">
            <StatsBar workers={activeWorkers} vibe={teamVibe} lastSynced={lastSynced} isLive={isLive} />

            <div className="section-header">
              <div className="section-title">🏢 Active Workers ({activeWorkers.length})</div>
              {activeWorkers.length > 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {activeWorkers.filter((w) => w.status === 'working').length > 0
                    ? `🔥 ${activeWorkers.filter((w) => w.status === 'working').length} grinding hard`
                    : '😴 Everyone is on standby'}
                </span>
              )}
            </div>

            <div className="workers-grid" aria-live="polite">
              {isLoading ? (
                <LoadingSkeleton />
              ) : activeWorkers.length === 0 && Object.keys(fadingMap).length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {activeWorkers.map((w, i) => (
                    <WorkerCard
                      key={w.id}
                      worker={w}
                      index={i}
                      isNew={newIds.has(w.id)}
                      activityEntries={activityLog}
                    />
                  ))}
                  {Object.values(fadingMap).map((w) => (
                    <WorkerCard
                      key={w.id}
                      worker={w}
                      index={activeWorkers.length}
                      isFading
                      activityEntries={activityLog}
                    />
                  ))}
                </>
              )}
            </div>

            <div className="section-header" style={{ marginTop: '2.5rem' }}>
              <div className="section-title">📋 Activity Log</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Last {Math.min(activityLog.length, 20)} events
              </span>
            </div>
            <div className="activity-filter-bar" role="group" aria-label="Filter activity log">
              {[
                { key: 'all', label: 'All' },
                { key: 'hires', label: '🟢 Hires' },
                { key: 'completions', label: '✅ Completions' },
                { key: 'errors', label: '❌ Errors' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={activityFilter === key ? 'active' : ''}
                  onClick={() => setActivityFilter(key)}
                  aria-pressed={activityFilter === key}
                >
                  {label}
                </button>
              ))}
            </div>
            <ActivityLog
              entries={activityLog.filter(e => {
                if (activityFilter === 'hires') return e.type === 'hire'
                if (activityFilter === 'completions') return e.type === 'complete'
                if (activityFilter === 'errors') return e.type === 'error'
                return true
              })}
              error={activityError}
            />
          </div>
        )}
      </main>

      <footer className="footer">
        Built with 💜 and mild existential dread by <span>🫠 Bloberto</span>
        &nbsp;&middot;&nbsp; &ldquo;If it compiles, ship it.&rdquo; &nbsp;&middot;&nbsp;
        <span>v1.0.0-chaos</span>
      </footer>
    </div>
  )
}
