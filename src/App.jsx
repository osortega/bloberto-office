import { useState, useEffect, useCallback } from 'react'
import './App.css'

const STORAGE_KEY = 'bloberto-workers'
const GITHUB_API_URL =
  'https://api.github.com/repos/osortega/bloberto-office/contents/data/workers.json'
const POLL_INTERVAL_MS = 15_000

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

const DEFAULT_WORKERS = [
  {
    id: 'frontend-engineer',
    name: 'Frontend Engineer',
    role: 'Frontend Engineer',
    status: 'working',
    task: 'Building the office dashboard',
    progress: 75,
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    role: 'DevOps Engineer',
    status: 'idle',
    task: 'Waiting to deploy',
    progress: 0,
  },
  {
    id: 'bloberto',
    name: 'Bloberto',
    role: 'Manager',
    status: 'working',
    task: 'Supervising the team and looking cool',
    progress: 100,
  },
]

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

function WorkerCard({ worker, onFire, onStatusChange }) {
  const isFromHQ = !!worker.hired_at

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

      {isFromHQ && (
        <div className="hq-badge">🛰️ synced from HQ</div>
      )}

      <div className="worker-task">
        <strong>📋 Current Task</strong>
        {worker.task}
      </div>

      <ProgressBar progress={worker.progress} status={worker.status} />

      <div className="worker-footer">
        <select
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            padding: '0.35rem 0.65rem',
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
          value={worker.status}
          onChange={(e) => onStatusChange(worker.id, e.target.value)}
        >
          <option value="working">⚡ Working</option>
          <option value="idle">😴 Idle</option>
          <option value="done">✅ Done</option>
          <option value="error">💀 Error</option>
        </select>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onFire(worker.id)}
        >
          🔥 Fire
        </button>
      </div>
    </div>
  )
}

function HireForm({ onHire }) {
  const [form, setForm] = useState({
    name: '',
    role: 'Frontend Engineer',
    task: '',
    progress: 0,
    status: 'working',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.task.trim()) return
    onHire({
      id: Date.now().toString(),
      name: form.name.trim(),
      role: form.role,
      task: form.task.trim(),
      progress: Math.min(100, Math.max(0, Number(form.progress))),
      status: form.status,
    })
    setForm({ name: '', role: 'Frontend Engineer', task: '', progress: 0, status: 'working' })
  }

  return (
    <div className="hire-form-wrapper">
      <div className="hire-form-title">
        🧑‍💼 Hire a New Worker{' '}
        <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>
          — growth is the vibe ✨
        </span>
      </div>
      <form className="hire-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="e.g. Glitchy McBug"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={form.role} onChange={(e) => set('role', e.target.value)}>
            {Object.keys(ROLE_EMOJIS).map((r) => (
              <option key={r} value={r}>{getRoleEmoji(r)} {r}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Current Task</label>
          <input
            type="text"
            placeholder="e.g. Debugging existence"
            value={form.task}
            onChange={(e) => set('task', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Progress %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.progress}
            onChange={(e) => set('progress', e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
          ➕ Hire
        </button>
      </form>
    </div>
  )
}

function StatsBar({ workers, lastSynced, isLive }) {
  const total = workers.length
  const active = workers.filter((w) => w.status === 'working').length
  const done = workers.filter((w) => w.status === 'done').length
  const idle = workers.filter((w) => w.status === 'idle').length

  const syncLabel = lastSynced
    ? lastSynced.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'never'

  return (
    <div className="stats-bar">
      <div className="stat-card total">
        <span className="stat-label">👥 Total Workers</span>
        <span className="stat-value">{total}</span>
      </div>
      <div className="stat-card active">
        <span className="stat-label">⚡ Active</span>
        <span className="stat-value">{active}</span>
      </div>
      <div className="stat-card done">
        <span className="stat-label">✅ Done</span>
        <span className="stat-value">{done}</span>
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
      <span className="empty-emoji">🌵</span>
      <h3>The office is tragically empty</h3>
      <p>
        No workers, no chaos. Just Bloberto alone, staring at the ceiling tiles.
        Hire someone before he starts rearranging the virtual furniture. 🪑
      </p>
    </div>
  )
}

export default function App() {
  const [workers, setWorkers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return DEFAULT_WORKERS
  })
  const [isLive, setIsLive] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  // Track IDs that came from GitHub so local hire/fire still works
  const [hqWorkerIds, setHqWorkerIds] = useState(new Set())

  const syncFromGitHub = useCallback(async () => {
    try {
      const data = await fetchWorkersFromGitHub()
      const hqWorkers = data.workers ?? []
      const hqIds = new Set(hqWorkers.map((w) => w.id))
      setHqWorkerIds(hqIds)
      setWorkers((prev) => {
        // Keep locally-hired workers (not from HQ), merge with HQ data
        const localOnly = prev.filter((w) => !hqIds.has(w.id))
        return [...hqWorkers, ...localOnly]
      })
      setIsLive(true)
      setLastSynced(new Date())
    } catch {
      setIsLive(false)
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    syncFromGitHub()
    const timer = setInterval(syncFromGitHub, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [syncFromGitHub])

  // Persist local changes to localStorage as fallback
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workers))
  }, [workers])

  const hire = (worker) => setWorkers((w) => [...w, worker])

  const fire = (id) => {
    if (!window.confirm('Are you sure? They had dreams, you know. 😢')) return
    setWorkers((w) => w.filter((x) => x.id !== id))
  }

  const changeStatus = (id, status) =>
    setWorkers((w) => w.map((x) => (x.id === id ? { ...x, status } : x)))

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
          <p>welcome to the team &middot; try not to break anything</p>
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
        <StatsBar workers={workers} lastSynced={lastSynced} isLive={isLive} />
        <HireForm onHire={hire} />

        <div className="section-header">
          <div className="section-title">🏢 The Team ({workers.length})</div>
          {workers.length > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {workers.filter((w) => w.status === 'working').length > 0
                ? `🔥 ${workers.filter((w) => w.status === 'working').length} grinding hard`
                : '😴 Everyone is slacking'}
            </span>
          )}
        </div>

        <div className="workers-grid">
          {workers.length === 0 ? (
            <EmptyState />
          ) : (
            workers.map((w) => (
              <WorkerCard
                key={w.id}
                worker={w}
                onFire={fire}
                onStatusChange={changeStatus}
              />
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
