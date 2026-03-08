import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import './App.css'
import Office from './Office.jsx'
import { getTeamVibe } from './utils/vibe.js'
import { ROLE_EMOJIS, STATUS_LABELS, STATUS_EMOJIS, ROLE_COLORS } from './utils/constants.js'

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

/** Bumps every 60s so relative timestamps stay fresh */
function useTimeTick(intervalMs = 60_000) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
}

function ActivityLogEntry({ entry, roster }) {
  const workerData = roster?.find(r => r.name === entry.worker)
  const workerEmoji = workerData?.emoji ?? (entry.worker ? '🤖' : null)
  return (
    <div className={`activity-entry activity-entry--${entry.type}`}>
      {workerEmoji && <span className="activity-worker-emoji">{workerEmoji}</span>}
      <span className="activity-icon">{ACTIVITY_ICONS[entry.type] ?? '🔧'}</span>
      <div className="activity-body">
        {entry.worker && <span className="activity-worker">{entry.worker}</span>}
        <span className="activity-message">{entry.message}</span>
      </div>
      <span className="activity-time" title={formatFullDateTime(entry.timestamp)}>{getRelativeTime(entry.timestamp)}</span>
    </div>
  )
}

function getTimeGroup(timestamp) {
  const now = Date.now()
  const ts = new Date(timestamp).getTime()
  const diffMs = now - ts
  const nowDate = new Date(now)
  const entryDate = new Date(ts)
  if (diffMs < 5 * 60 * 1000) return 'Just now'
  if (
    entryDate.getFullYear() === nowDate.getFullYear() &&
    entryDate.getMonth() === nowDate.getMonth() &&
    entryDate.getDate() === nowDate.getDate()
  ) return 'Earlier today'
  const yesterday = new Date(nowDate)
  yesterday.setDate(nowDate.getDate() - 1)
  if (
    entryDate.getFullYear() === yesterday.getFullYear() &&
    entryDate.getMonth() === yesterday.getMonth() &&
    entryDate.getDate() === yesterday.getDate()
  ) return 'Yesterday'
  return 'Older'
}

const TIME_GROUP_ORDER = ['Just now', 'Earlier today', 'Yesterday', 'Older']

function ActivityLog({ entries, error, roster }) {
  const displayed = [...entries].reverse().slice(0, 20)

  const groups = TIME_GROUP_ORDER.map(label => ({
    label,
    items: displayed.filter(e => getTimeGroup(e.timestamp) === label),
  })).filter(g => g.items.length > 0)

  return (
    <div className="activity-log">
      {error ? (
        <div className="activity-error">⚠️ Could not load activity log. Check your connection and try again.</div>
      ) : displayed.length === 0 ? (
        <div className="activity-empty">No activity yet…</div>
      ) : (
        groups.map(({ label, items }) => (
          <div key={label}>
            <div className="activity-time-separator"><span>{label}</span></div>
            {items.map((entry, i) => <ActivityLogEntry key={entry.timestamp + entry.worker + i} entry={entry} roster={roster} />)}
          </div>
        ))
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

function ProgressBar({ progress, updatedAt, startedAt }) {
  const milestonesRef = useRef(new Set())
  const prevProgressRef = useRef(progress)
  const [flashClass, setFlashClass] = useState('')

  useEffect(() => {
    if (progress < prevProgressRef.current) {
      milestonesRef.current = new Set()
    }
    prevProgressRef.current = progress
    const MILESTONES = [25, 50, 75, 100]
    for (const m of MILESTONES) {
      if (progress >= m && !milestonesRef.current.has(m)) {
        milestonesRef.current.add(m)
        setFlashClass(`progress-milestone-${m}`)
        const t = setTimeout(() => setFlashClass(''), 600)
        return () => clearTimeout(t)
      }
    }
  }, [progress])

  const workingMs = startedAt ? Date.now() - new Date(startedAt).getTime() : null
  const workingMins = workingMs != null && workingMs > 0 ? workingMs / 60000 : 0
  const eta = (progress > 5 && progress < 100 && workingMins > 1) ? Math.round((workingMins / progress) * (100 - progress)) : null

  return (
    <div className="progress-wrapper">
      <div className="progress-header">
        <span className="progress-label">Progress</span>
        <span className="progress-pct">{progress}%</span>
        {eta !== null && eta < 120 && <span className="progress-eta">~{eta}m left</span>}
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
          className={`progress-bar-fill${progress >= 100 ? ' progress-bar-fill--overflow' : ''} ${flashClass}`}
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

const WorkerCard = React.memo(function WorkerCard({ worker, index = 0, isNew = false, isFading = false, activityEntries = [], isFocused = false, selectedTag = null, onTagClick = null, isDimmed = false }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef(null)

  const classes = ['worker-card', worker.status]
  if (isNew) classes.push('worker-card--new')
  if (isFading) classes.push('worker-card--fading')
  if (isFlipped) classes.push('worker-card--flipped')
  if (isFocused) classes.push('worker-card--focused')
  if (isDimmed) classes.push('worker-card--dimmed')

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isFocused])

  const workerHistory = activityEntries
    .filter(e => e.worker === worker.name)
    .slice(-3)
    .reverse()

  return (
    <div ref={cardRef} className={classes.join(' ')} style={{ '--i': index }} tabIndex={0} role="article" aria-label={`${worker.name}, ${worker.role}, ${STATUS_LABELS[worker.status]}`} data-worker-name={worker.name}>
      <div className="worker-card__inner">
        <div className="worker-card__front" aria-hidden={isFlipped || undefined} tabIndex={isFlipped ? -1 : undefined}>
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
              tabIndex={isFlipped ? -1 : 0}
            >ℹ️</button>
          </div>

          <div className="worker-task">
            <strong>📋 Current Task</strong>
            {worker.task}
            {(() => {
              const tags = getTaskTags(worker.task)
              return tags.length > 0 ? (
                <div className="task-tags">
                  {tags.map(({ label, emoji, className }) => {
                    const isActive = selectedTag === label
                    return (
                      <span
                        key={label}
                        className={`task-tag ${className}${isActive ? ' task-tag--active' : ''}`}
                        style={{ cursor: onTagClick ? 'pointer' : undefined }}
                        onClick={onTagClick ? (e) => { e.stopPropagation(); onTagClick(label) } : undefined}
                        onKeyDown={onTagClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onTagClick(label) } } : undefined}
                        title={isActive ? `Clear filter: ${label}` : `Filter by: ${label}`}
                        tabIndex={onTagClick ? 0 : undefined}
                        role={onTagClick ? 'button' : undefined}
                      >
                        {emoji} {label}{isActive ? ' ×' : ''}
                      </span>
                    )
                  })}
                </div>
              ) : null
            })()}
          </div>

          {worker.status === 'working' && worker.updated_at && (() => {
            const durationMs = Date.now() - new Date(worker.updated_at).getTime()
            const tier = durationMs < 30 * 60_000 ? 'normal' : durationMs < 2 * 3_600_000 ? 'warn' : 'stuck'
            return <div className="worker-duration" data-tier={tier}>{tier === 'stuck' ? '⚠️ ' : ''}⏱️ {formatDuration(worker.updated_at)}</div>
          })()}

          <ProgressBar progress={worker.progress} updatedAt={worker.updated_at} startedAt={worker.startedAt} />
        </div>

        <div className="worker-card__back" aria-hidden={!isFlipped || undefined} tabIndex={!isFlipped ? -1 : undefined}>
          <button
            className="worker-card__back-close"
            onClick={() => setIsFlipped(false)}
            aria-label="Close activity history"
            tabIndex={isFlipped ? 0 : -1}
          >✕ Close</button>
          <div className="worker-card__back-title">{worker.name}</div>
          {workerHistory.length === 0 ? (
            <div className="worker-card__back-empty">No activity on record.</div>
          ) : (
            workerHistory.map((e) => (
              <div key={e.timestamp + e.type + (e.worker || '')} className="worker-card__back-entry">
                <span style={{ marginRight: '0.35rem' }}>{ACTIVITY_ICONS[e.type] ?? '🔧'}</span>
                {e.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
})


const VIBE_COLORS = {
  'crushing':    '#a78bfa',
  'in-flow':     '#2dd4bf',
  'on-fire':     '#ef4444',
  'slow-day':    '#9ca3af',
  'after-hours': '#6366f1',
}
const VIBE_RANK = { 'after-hours': 0, 'slow-day': 1, 'on-fire': 2, 'in-flow': 3, 'crushing': 4 }
const VIBE_HISTORY_KEY = 'bloberto-vibe-history'
const VIBE_HISTORY_MAX = 12

function VibeSparkline({ history }) {
  if (!history.length) return null
  const n = history.length
  const pts = history.map((entry, i) => {
    const x = n === 1 ? 32 : 3 + i * (58 / (n - 1))
    const rank = VIBE_RANK[entry.key] ?? 2
    const y = 12 - rank * 2.5
    return { x, y, entry }
  })
  const polyPoints = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  return (
    <svg width="64" height="14" viewBox="0 0 64 14" className="vibe-sparkline" aria-label="Vibe history">
      {n > 1 && <polyline points={polyPoints} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinejoin="round" />}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill={VIBE_COLORS[p.entry.key] ?? '#9ca3af'}>
          <title>{new Date(p.entry.ts).toLocaleTimeString()}: {p.entry.key}</title>
        </circle>
      ))}
    </svg>
  )
}

function DeltaBadge({ delta }) {
  if (delta === 0) return null
  return (
    <span className={`stat-delta stat-delta--${delta > 0 ? 'up' : 'down'}`}>
      {delta > 0 ? '↑' : '↓'}{Math.abs(delta)}
    </span>
  )
}

function StatsBar({ workers, vibe, lastSynced, isLive, vibeHistory }) {
  const total = workers.length
  const active = workers.filter((w) => w.status === 'working').length
  const idle = workers.filter((w) => w.status === 'idle').length
  const errorCount = workers.filter((w) => w.status === 'error').length

  const stuckWorkers = useMemo(
    () => workers.filter((w) => w.status === 'working' && (Date.now() - new Date(w.updated_at).getTime()) > 7_200_000),
    [workers]
  )

  const prevCountsRef = useRef({})
  const activeDelta = active - (prevCountsRef.current.active ?? active)
  const idleDelta = idle - (prevCountsRef.current.idle ?? idle)

  useEffect(() => {
    prevCountsRef.current = { active, idle, error: errorCount }
  }, [active, idle, errorCount])

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
        <DeltaBadge delta={activeDelta} />
      </div>
      <div className="stat-card idle">
        <span className="stat-label">😴 Idle</span>
        <span className="stat-value">{idle}</span>
        <DeltaBadge delta={idleDelta} />
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
        <VibeSparkline history={vibeHistory} />
      </div>
      {errorCount > 0 && <div className='stat-card stat-card--error'><div className='stat-label'>❌ Errors</div><div className='stat-value'>{errorCount}</div></div>}
      {stuckWorkers.length > 0 && (
        <div
          className="stat-card stat-card--stuck"
          onClick={() => {
            const name = stuckWorkers[0].name
            document.querySelector(`[data-worker-name="${name}"]`)?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <span className="stat-label">⚠️ Stuck</span>
          <span className="stat-value">
            {stuckWorkers.length === 1
              ? `${stuckWorkers[0].emoji} ${stuckWorkers[0].name} · ${formatDuration(stuckWorkers[0].updated_at || stuckWorkers[0].startedAt)}`
              : `${stuckWorkers.length} workers`}
          </span>
        </div>
      )}
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

const FOOTER_TAGLINES = {
  crushing: 'productivity charts are going vertical. don\'t look down.',
  'on-fire': 'if it deploys, that\'s someone else\'s problem.',
  'in-flow': 'if it compiles, ship it.',
  'slow-day': 'maybe it works? nobody knows.',
  'after-hours': 'the servers are watching. go home.',
}

const SHORTCUT_KEYS = new Set(['1', '2', 'r', 'R', 'Escape'])

function ShortcutToast() {
  const [phase, setPhase] = useState(() =>
    localStorage.getItem('bloberto-shortcuts-shown') ? 'hidden' : 'pending'
  )
  const timerRef = useRef(null)

  const dismiss = useCallback((gotIt = false) => {
    localStorage.setItem('bloberto-shortcuts-shown', '1')
    clearTimeout(timerRef.current)
    if (gotIt) {
      setPhase('gotit')
      timerRef.current = setTimeout(() => {
        setPhase('fading-out')
        timerRef.current = setTimeout(() => setPhase('hidden'), 400)
      }, 500)
    } else {
      setPhase('fading-out')
      timerRef.current = setTimeout(() => setPhase('hidden'), 300)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'pending') return
    const showTimer = setTimeout(() => setPhase('visible'), 1500)
    return () => clearTimeout(showTimer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'visible') return
    const autoTimer = setTimeout(() => dismiss(false), 7000)
    return () => clearTimeout(autoTimer)
  }, [phase, dismiss])

  useEffect(() => {
    if (phase !== 'visible') return
    const handleKey = (e) => {
      if (SHORTCUT_KEYS.has(e.key)) dismiss(true)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [phase, dismiss])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  if (phase === 'hidden') return null

  return (
    <div
      className={`shortcut-toast shortcut-toast--${phase}`}
      aria-live="polite"
      aria-label="Keyboard shortcuts hint"
    >
      {phase === 'gotit' ? 'Got it ✓' : '⌨️ Shortcuts: 1 Office · 2 Dashboard · R Refresh · Esc Clear'}
    </div>
  )
}

export default function App() {
  useTimeTick(60_000) // keep relative timestamps fresh
  const [allWorkers, setAllWorkers] = useState([])
  const [roster, setRoster] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [activityError, setActivityError] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [fetchWarn, setFetchWarn] = useState(null)
  const [activityFilter, setActivityFilter] = useState('all')
  const [workerFilter, setWorkerFilter] = useState(null)
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
  const [workerConfetti, setWorkerConfetti] = useState(null) // { name, color }
  const [completionToast, setCompletionToast] = useState(null) // { name, color }
  const workerConfettiTimerRef = useRef(null)
  const completionToastTimerRef = useRef(null)
  const [vibeHistory, setVibeHistory] = useState([])
  const [pollingPaused, setPollingPaused] = useState(false)
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
  const [doorEvent, setDoorEvent] = useState(null)
  const doorEventTimerRef    = useRef(null)
  const [focusedWorker, setFocusedWorker] = useState(null)
  const focusedWorkerTimerRef = useRef(null)
  const [selectedTag, setSelectedTag] = useState(null)

  const handleTagClick = useCallback((tag) => {
    setSelectedTag(prev => prev === tag ? null : tag)
  }, [])

  useEffect(() => {
    const touch = () => {
      lastActivity.current = Date.now()
      setPollingPaused(false)
    }
    window.addEventListener('mousemove', touch)
    window.addEventListener('keydown', touch)
    window.addEventListener('touchstart', touch)
    return () => {
      window.removeEventListener('mousemove', touch)
      window.removeEventListener('keydown', touch)
      window.removeEventListener('touchstart', touch)
    }
  }, [])

  // Track whether polling is paused due to inactivity
  useEffect(() => {
    const check = () => {
      setPollingPaused(Date.now() - lastActivity.current > IDLE_TIMEOUT)
    }
    check()
    const interval = setInterval(check, 15_000)
    return () => clearInterval(interval)
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

  const handleWorkerClick = useCallback((worker) => {
    setTab('dashboard')
    window.location.hash = 'dashboard'
    setFocusedWorker(worker.id)
    if (focusedWorkerTimerRef.current) clearTimeout(focusedWorkerTimerRef.current)
    focusedWorkerTimerRef.current = setTimeout(() => {
      setFocusedWorker(null)
      focusedWorkerTimerRef.current = null
    }, 3000)
  }, [])

  const syncFromGitHub = useCallback(async () => {
    setIsSyncing(true)
    const [workersResult, activityResult] = await Promise.allSettled([
      fetchWorkersFromGitHub(),
      fetchActivityFromGitHub(),
    ])

    if (workersResult.status === 'fulfilled') {
      const data = workersResult.value
      // Support both flat array and {workers:[], roster:[]} formats
      if (Array.isArray(data)) {
        setAllWorkers(data)
        setRoster([])
      } else {
        setAllWorkers(data.workers ?? [])
        setRoster(data.roster ?? [])
      }
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

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable || e.isComposing) return
      if (e.key === '1') { setTab('office'); window.location.hash = 'office' }
      else if (e.key === '2') { setTab('dashboard'); window.location.hash = 'dashboard' }
      else if (e.key === 'Escape') document.activeElement?.blur()
      else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !isSyncing) syncFromGitHub()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSyncing, syncFromGitHub])

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

  const activeWorkers = useMemo(
    () => allWorkers.filter(
      (w) => w.status === 'working' || w.status === 'idle' || w.status === 'error'
    ),
    [allWorkers]
  )

  const activityLogLenRef = useRef(0)
  const stableActivityLog = useMemo(() => activityLog, [activityLog])
  useEffect(() => { activityLogLenRef.current = activityLog.length }, [activityLog.length])

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
      if (doorEventTimerRef.current) clearTimeout(doorEventTimerRef.current)
      setDoorEvent('arrive')
      doorEventTimerRef.current = setTimeout(() => { setDoorEvent(null); doorEventTimerRef.current = null }, 1500)
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
      if (doorEventTimerRef.current) clearTimeout(doorEventTimerRef.current)
      setDoorEvent('depart')
      doorEventTimerRef.current = setTimeout(() => { setDoorEvent(null); doorEventTimerRef.current = null }, 2000)
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

    // Workers that just transitioned working → idle (task shipped!)
    const prevMap = new Map(prev.map(w => [w.id, w]))
    const justShipped = activeWorkers.filter(w => prevMap.get(w.id)?.status === 'working' && w.status === 'idle')
    if (justShipped.length > 0 && prev.length > 0) {
      const worker = justShipped[0]
      const color = ROLE_COLORS[worker.role] || ROLE_COLORS['Other']
      setWorkerConfetti({ name: worker.name, color })
      setCompletionToast({ name: worker.name, color })
      if (workerConfettiTimerRef.current) clearTimeout(workerConfettiTimerRef.current)
      workerConfettiTimerRef.current = setTimeout(() => setWorkerConfetti(null), 2500)
      if (completionToastTimerRef.current) clearTimeout(completionToastTimerRef.current)
      completionToastTimerRef.current = setTimeout(() => setCompletionToast(null), 3000)
    }

    prevActiveWorkersRef.current = activeWorkers
  }, [activeWorkers])

  // ── Vibe Streak Counter + Confetti Burst ──
  useEffect(() => {
    const storedKey = localStorage.getItem('bloberto-vibe-key')
    const storedStreak = parseInt(localStorage.getItem('bloberto-vibe-streak') || '0', 10)
    // Only increment if the vibe key is the same AND this isn't the initial mount
    const isInitialMount = previousVibeKeyRef.current === null
    const newStreak = storedKey === teamVibe.key ? storedStreak + (isInitialMount ? 0 : 1) : 1
    localStorage.setItem('bloberto-vibe-key', teamVibe.key)
    localStorage.setItem('bloberto-vibe-streak', String(newStreak))
    setVibeStreak(newStreak)

    // Confetti burst when vibe rank increases
    const vibeRanking = { 'after-hours': 0, 'slow-day': 1, 'on-fire': 2, 'in-flow': 3, 'crushing': 4 }
    const prevKey = previousVibeKeyRef.current
    if (prevKey !== null && vibeRanking[teamVibe.key] > (vibeRanking[prevKey] ?? -1)) {
      setConfettiActive(true)
      setTimeout(() => setConfettiActive(false), 2500)
    }
    previousVibeKeyRef.current = teamVibe.key

    try {
      const raw = localStorage.getItem(VIBE_HISTORY_KEY)
      const history = raw ? JSON.parse(raw) : []
      history.push({ key: teamVibe.key, ts: Date.now() })
      if (history.length > VIBE_HISTORY_MAX) history.splice(0, history.length - VIBE_HISTORY_MAX)
      localStorage.setItem(VIBE_HISTORY_KEY, JSON.stringify(history))
      setVibeHistory(history)
    } catch { /* ignore */ }
  }, [teamVibe.key])

  // ── Favicon: red=error, green=working, grey=idle ──
  useEffect(() => {
    const hasError = activeWorkers.some(w => w.status === 'error') || !!fetchError
    const isWorking = activeWorkers.some(w => w.status === 'working')
    const color = hasError ? '#ef4444' : isWorking ? '#22c55e' : '#9ca3af'
    const c = document.createElement('canvas')
    c.width = 32; c.height = 32
    const ctx = c.getContext('2d')
    ctx.beginPath()
    ctx.arc(16, 16, 14, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    const link = document.querySelector('link[rel="icon"]') || document.createElement('link')
    link.rel = 'icon'
    link.href = c.toDataURL()
    if (!link.parentNode) document.head.appendChild(link)
  }, [activeWorkers, fetchError])

  // ── Tab title: cycles every 8s showing worker status ──
  useEffect(() => {
    const workingCount = activeWorkers.filter(w => w.status === 'working').length
    const idleCount = activeWorkers.filter(w => w.status === 'idle').length
    const errCount = activeWorkers.filter(w => w.status === 'error').length
    const total = activeWorkers.length

    const frames = total === 0
      ? ["😴 Bloberto's Office — All quiet"]
      : [
          `(${workingCount}/${total}) Bloberto's Office — ${teamVibe.label}`,
          `🟢 ${workingCount} working · ❌ ${errCount} errors · 😴 ${idleCount} idle`,
          `${teamVibe.label} — Bloberto's Office`,
        ]

    let idx = 0
    document.title = frames[idx]
    const timer = setInterval(() => {
      idx = (idx + 1) % frames.length
      document.title = frames[idx]
    }, 8_000)
    return () => clearInterval(timer)
  }, [activeWorkers, teamVibe])

  const errorCount = activeWorkers.filter(w => w.status === 'error').length

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? '☕ Good morning'
      : currentHour < 18
      ? '🌤️ Good afternoon'
      : '🌙 Good evening'

  const HONORIFICS = { crushing: 'LEGEND 🔥', 'on-fire': 'captain 🚨', 'in-flow': 'boss', 'slow-day': 'chief... you still there? 😐', 'after-hours': 'night owl 🌙' }

  return (
    <div className="app">
      <div className="ambient-particles" data-vibe={teamVibe.key} aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="ambient-particle" style={{ '--i': i }} />
        ))}
      </div>
      {confettiActive && (
        <div className="confetti-layer" aria-hidden="true">
          {Array.from({ length: 30 }, (_, i) => (
            <span key={i} className="confetti-piece" style={{ '--i': i }} />
          ))}
        </div>
      )}
      {workerConfetti && (
        <div className="confetti-layer" aria-hidden="true">
          {Array.from({ length: 30 }, (_, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{ '--i': i, ...(i < 18 ? { background: workerConfetti.color } : {}) }}
            />
          ))}
        </div>
      )}
      {completionToast && (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface2)',
            border: `2px solid ${completionToast.color}`,
            borderRadius: '12px',
            padding: '0.6rem 1.2rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text)',
            boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${completionToast.color}55`,
            zIndex: 9999,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          🎉 {completionToast.name} shipped it!
        </div>
      )}
      <ShortcutToast />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="header">
        <div className="header-title">
          <h1>🫠 Bloberto&apos;s Office</h1>
          <p>live monitor &middot; read-only view</p>
        </div>
        <div className="header-right">
          <div className="header-badge">
            {greeting}, <span>{HONORIFICS[teamVibe.key] ?? 'boss'}</span> &nbsp;&middot;&nbsp;{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <span className="vibe-streak-wrap" data-streak-tier={vibeStreak >= 10 ? 'legendary' : vibeStreak >= 5 ? 'hot' : vibeStreak >= 3 ? 'steady' : ''}>
            <span className="vibe-pill" data-vibe={teamVibe.key}>
              {teamVibe.label}
            </span>
            {vibeStreak >= 3 && <span className="streak-icon" key={vibeStreak} aria-label={`Vibe streak: ${vibeStreak}`}>{vibeStreak >= 10 ? '🏆' : vibeStreak >= 5 ? '🔥' : '👑'} x{vibeStreak}</span>}
          </span>
          <button className='sync-now-btn' onClick={() => syncFromGitHub()} disabled={isSyncing} aria-label='Sync now' title='Refresh data (R)'>↺</button>
          {pollingPaused && (
            <span
              className="polling-paused-pill"
              title="Auto-refresh paused due to inactivity"
              aria-live="polite"
            >
              ⏸ Paused · move mouse to refresh
            </span>
          )}
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
        <div className="tab-toggle" role="tablist" aria-label="View selector">
          <button
            role="tab"
            id="tab-office"
            aria-selected={tab === 'office'}
            aria-controls="tabpanel-office"
            title="Office view (press 1)"
            tabIndex={tab === 'office' ? 0 : -1}
            className={tab === 'office' ? 'active' : ''}
            onClick={() => { setTab('office'); window.location.hash = 'office' }}
            onKeyDown={handleTabKeyDown}
          >
            🏢 Office
          </button>
          <button
            role="tab"
            id="tab-dashboard"
            aria-selected={tab === 'dashboard'}
            aria-controls="tabpanel-dashboard"
            title="Dashboard view (press 2)"
            tabIndex={tab === 'dashboard' ? 0 : -1}
            className={tab === 'dashboard' ? 'active' : ''}
            onClick={() => { setTab('dashboard'); window.location.hash = 'dashboard' }}
            onKeyDown={handleTabKeyDown}
          >
            📊 Dashboard
            {errorCount > 0 && <span className='tab-error-badge'>{errorCount}</span>}
          </button>
        </div>

        {tab === 'office' ? (
          <div role="tabpanel" id="tabpanel-office" aria-labelledby="tab-office">
            <Office workers={activeWorkers} roster={roster} isSyncing={isSyncing} activityEntries={stableActivityLog} onWorkerClick={handleWorkerClick} doorEvent={doorEvent} vibeStreak={vibeStreak} />
          </div>
        ) : (
          <div role="tabpanel" id="tabpanel-dashboard" aria-labelledby="tab-dashboard">
            <StatsBar workers={activeWorkers} vibe={teamVibe} lastSynced={lastSynced} isLive={isLive} vibeHistory={vibeHistory} />

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

            {!isLoading && activeWorkers.length === 1 && Object.keys(fadingMap).length === 0 ? (
              <div className="workers-grid--solo">
                <div className="workers-grid workers-grid--solo-card">
                  <WorkerCard
                    key={activeWorkers[0].id}
                    worker={activeWorkers[0]}
                    index={0}
                    isNew={newIds.has(activeWorkers[0].id)}
                    activityEntries={stableActivityLog}
                    isFocused={focusedWorker === activeWorkers[0].id}
                    selectedTag={selectedTag}
                    onTagClick={handleTagClick}
                    isDimmed={selectedTag !== null && !getTaskTags(activeWorkers[0].task).some(t => t.label === selectedTag)}
                  />
                </div>
                <p className="solo-spotlight-msg">🌟 Running solo today. Carrying the whole team on one pair of hands.</p>
              </div>
            ) : (
              <div className="workers-grid">
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
                        activityEntries={stableActivityLog}
                        isFocused={focusedWorker === w.id}
                        selectedTag={selectedTag}
                        onTagClick={handleTagClick}
                        isDimmed={selectedTag !== null && !getTaskTags(w.task).some(t => t.label === selectedTag)}
                      />
                    ))}
                    {Object.values(fadingMap).map((w) => (
                      <WorkerCard
                        key={w.id}
                        worker={w}
                        index={activeWorkers.length}
                        isFading
                        activityEntries={stableActivityLog}
                        selectedTag={selectedTag}
                        onTagClick={handleTagClick}
                        isDimmed={selectedTag !== null && !getTaskTags(w.task).some(t => t.label === selectedTag)}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

            <div className="section-header" style={{ marginTop: '2.5rem' }}>
              <div className="section-title">📋 Activity Log</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Last {Math.min(activityLog.length, 20)} events
              </span>
            </div>
            <div className="activity-filter-bar" role="radiogroup" aria-label="Filter activity log by type">
              {[
                { key: 'all', label: 'All' },
                { key: 'hires', label: '🟢 Hires' },
                { key: 'completions', label: '✅ Completions' },
                { key: 'errors', label: '❌ Errors' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  role="radio"
                  className={activityFilter === key ? 'active' : ''}
                  onClick={() => setActivityFilter(key)}
                  aria-checked={activityFilter === key}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="activity-filter-bar" role="radiogroup" aria-label="Filter activity log by worker">
              <button
                role="radio"
                className={workerFilter === null ? 'active' : ''}
                onClick={() => setWorkerFilter(null)}
                aria-checked={workerFilter === null}
              >
                All Workers
              </button>
              {roster.map(member => (
                <button
                  key={member.name}
                  role="radio"
                  className={workerFilter === member.name ? 'active' : ''}
                  onClick={() => setWorkerFilter(workerFilter === member.name ? null : member.name)}
                  aria-checked={workerFilter === member.name}
                >
                  {member.emoji ?? '🤖'} {member.name}
                </button>
              ))}
            </div>
            <ActivityLog
              entries={activityLog.filter(e => {
                if (activityFilter === 'hires') return e.type === 'hire'
                if (activityFilter === 'completions') return e.type === 'complete'
                if (activityFilter === 'errors') return e.type === 'error'
                return true
              }).filter(e => {
                if (workerFilter !== null) return e.worker === workerFilter
                return true
              })}
              error={activityError}
              roster={roster}
            />
          </div>
        )}
      </main>

      <footer className="footer">
        Built with 💜 and mild existential dread by <span>🫠 Bloberto</span>
        &nbsp;&middot;&nbsp; <span key={teamVibe.key} className="footer-tagline">&ldquo;{FOOTER_TAGLINES[teamVibe.key] ?? 'if it compiles, ship it.'}&rdquo;</span> &nbsp;&middot;&nbsp;
        <span>v1.0.0-chaos</span>
      </footer>
    </div>
  )
}
