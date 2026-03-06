import { useState, useEffect, useCallback } from 'react'
import './App.css'

const GITHUB_API_URL =
  'https://api.github.com/repos/osortega/bloberto-office/contents/data/workers.json'
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
  const res = await fetch(GITHUB_API_URL, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const meta = await res.json()
  const json = JSON.parse(atob(meta.content.replace(/\n/g, '')))
  return json
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
  const [isLive, setIsLive] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)

  const syncFromGitHub = useCallback(async () => {
    try {
      const data = await fetchWorkersFromGitHub()
      const workers = data.workers ?? []
      setAllWorkers(workers)
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
        <div className="header-badge">
          {greeting}, <span>boss</span> &nbsp;&middot;&nbsp;{' '}
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </header>

      <main className="main">
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
      </main>

      <footer className="footer">
        Built with 💜 and mild existential dread by <span>🫠 Bloberto</span>
        &nbsp;&middot;&nbsp; &ldquo;If it compiles, ship it.&rdquo; &nbsp;&middot;&nbsp;
        <span>v1.0.0-chaos</span>
      </footer>
    </div>
  )
}
