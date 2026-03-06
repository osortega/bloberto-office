import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Office from './Office.jsx'

const GITHUB_API_URL =
  'https://raw.githubusercontent.com/osortega/bloberto-office/main/data/workers.json'
const ACTIVITY_API_URL =
  'https://raw.githubusercontent.com/osortega/bloberto-office/main/data/activity.json'
const POLL_INTERVAL_ACTIVE = 30_000
const POLL_INTERVAL_HIDDEN = 60_000

const ROLE_EMOJIS = {
  'Frontend Engineer': '🎨',
  'Backend Engineer': '⚙️',
  'DevOps Engineer': '🚀',
  'Designer': '✏️',
  'Manager': '🫠',
  'QA Engineer': '🔍',
  'Data Engineer': '📊',
  'Security Engineer': '🔒',
  'Other': '🤖',
}

const STATUS_LABELS = {
  working: 'Working',
  idle: 'Idle',
  done: 'Done',
  error: 'Error',
}

const STATUS_EMOJIS = {
  working: '⚡',
  idle: '😴',
  done: '✅',
  error: '💀',
}

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
      <span className="activity-time">{getRelativeTime(entry.timestamp)}</span>
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
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
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

function WorkerCard({ worker }) {
  return (
    <div className={`worker-card ${worker.status}`}>
      <div className="worker-header">
        <div className="worker-avatar">{getRoleEmoji(worker.role)}</div>
        <div className="worker-info" style={{ flex: 1, paddingLeft: '0.75rem' }}>
          <div className="worker-name">{worker.name}</div>
          <div className="worker-role">{worker.role}</div>
        </div>
        <StatusBadge status={worker.status} />
      </div>

      <div className="worker-task">
        <strong>📋 Current Task</strong>
        {worker.task}
      </div>

      {worker.status === 'working' && worker.updated_at && (
        <div className="worker-duration">⏱️ {formatDuration(worker.updated_at)}</div>
      )}

      <ProgressBar progress={worker.progress} />
    </div>
  )
}

function StatsBar({ workers, lastSynced, isLive }) {
  const total = workers.length
  const active = workers.filter((w) => w.status === 'working').length
  const idle = workers.filter((w) => w.status === 'idle').length

  const syncLabel = lastSynced
    ? lastSynced.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'never'

  return (
    <div className="stats-bar">
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
      ))}
    </>
  )
}

const TABS = ['office', 'dashboard']

export default function App() {
  const [allWorkers, setAllWorkers] = useState([])
  const [roster, setRoster] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [activityError, setActivityError] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [activityFilter, setActivityFilter] = useState('all')
  const [isLive, setIsLive] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('bloberto-theme') || 'dark')
  const [tab, setTab] = useState('office')

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
    const [workersResult, activityResult] = await Promise.allSettled([
      fetchWorkersFromGitHub(),
      fetchActivityFromGitHub(),
    ])

    if (workersResult.status === 'fulfilled') {
      const data = workersResult.value
      setAllWorkers(data.workers ?? [])
      setRoster(data.roster ?? [])
      setIsLive(true)
      setFetchError(null)
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

    if (workersResult.status === 'rejected' && activityResult.status === 'rejected') {
      setFetchError('Having trouble connecting to HQ. Data may be stale.')
    }

    setLastSynced(new Date())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    syncFromGitHub()
    const getInterval = () =>
      document.visibilityState === 'hidden' ? POLL_INTERVAL_HIDDEN : POLL_INTERVAL_ACTIVE

    let timer = setInterval(syncFromGitHub, getInterval())

    const handleVisibilityChange = () => {
      clearInterval(timer)
      timer = setInterval(syncFromGitHub, getInterval())
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [syncFromGitHub])

  const activeWorkers = allWorkers.filter(
    (w) => w.status === 'working' || w.status === 'idle'
  )

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? '☕ Good morning'
      : currentHour < 18
      ? '🌤️ Good afternoon'
      : '🌙 Good evening'

  return (
    <div className="app">
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
        <div className="tab-toggle" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'office'}
            tabIndex={tab === 'office' ? 0 : -1}
            className={tab === 'office' ? 'active' : ''}
            onClick={() => setTab('office')}
            onKeyDown={handleTabKeyDown}
          >
            🏢 Office
          </button>
          <button
            role="tab"
            aria-selected={tab === 'dashboard'}
            tabIndex={tab === 'dashboard' ? 0 : -1}
            className={tab === 'dashboard' ? 'active' : ''}
            onClick={() => setTab('dashboard')}
            onKeyDown={handleTabKeyDown}
          >
            📊 Dashboard
          </button>
        </div>

        {tab === 'office' ? (
          <div role="tabpanel">
            <Office workers={activeWorkers} roster={roster} />
          </div>
        ) : (
          <div role="tabpanel">
            <StatsBar workers={activeWorkers} lastSynced={lastSynced} isLive={isLive} />

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
              ) : activeWorkers.length === 0 ? (
                <EmptyState />
              ) : (
                activeWorkers.map((w) => (
                  <WorkerCard key={w.id} worker={w} />
                ))
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
