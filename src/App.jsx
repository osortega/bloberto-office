import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Office from './Office.jsx'

const GITHUB_API_URL =
  'https://raw.githubusercontent.com/osortega/bloberto-office/main/data/workers.json'
const ACTIVITY_API_URL =
  'https://raw.githubusercontent.com/osortega/bloberto-office/main/data/activity.json'
const POLL_INTERVAL_MS = 10_000

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

function ActivityLog({ entries }) {
  const displayed = [...entries].reverse().slice(0, 20)
  return (
    <div className="activity-log">
      {displayed.length === 0 ? (
        <div className="activity-empty">No activity yet…</div>
      ) : (
        displayed.map((entry, i) => <ActivityLogEntry key={i} entry={entry} />)
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

export default function App() {
  const [allWorkers, setAllWorkers] = useState([])
  const [roster, setRoster] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [isLive, setIsLive] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('bloberto-theme') || 'dark')
  const [tab, setTab] = useState('office')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bloberto-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const syncFromGitHub = useCallback(async () => {
    try {
      const [data, activity] = await Promise.all([
        fetchWorkersFromGitHub(),
        fetchActivityFromGitHub(),
      ])
      const workers = data.workers ?? []
      setAllWorkers(workers)
      setRoster(data.roster ?? [])
      setActivityLog(Array.isArray(activity) ? activity : [])
      setIsLive(true)
      setLastSynced(new Date())
    } catch {
      setIsLive(false)
    }
  }, [])

  useEffect(() => {
    syncFromGitHub()
    const timer = setInterval(syncFromGitHub, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
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
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="main">
        <div className="tab-toggle">
          <button
            className={tab === 'office' ? 'active' : ''}
            onClick={() => setTab('office')}
          >
            🏢 Office
          </button>
          <button
            className={tab === 'dashboard' ? 'active' : ''}
            onClick={() => setTab('dashboard')}
          >
            📊 Dashboard
          </button>
        </div>

        {tab === 'office' ? (
          <Office workers={activeWorkers} roster={roster} />
        ) : (
          <>
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

            <div className="workers-grid">
              {activeWorkers.length === 0 ? (
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
            <ActivityLog entries={activityLog} />
          </>
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
