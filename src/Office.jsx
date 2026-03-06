import { useMemo } from 'react'
import './Office.css'

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

// Desk slot positions — (left%, top%) relative to office floor
const DESKS = [
  { id: 0, left: 7,  top: 28 },
  { id: 1, left: 32, top: 28 },
  { id: 2, left: 57, top: 28 },
  { id: 3, left: 7,  top: 50 },
  { id: 4, left: 32, top: 50 },
  { id: 5, left: 57, top: 50 },
]

const DEFAULT_BLOBERTO = {
  id: 'bloberto', name: 'Bloberto', role: 'Manager', status: 'working',
}

function getEmoji(worker) {
  if (worker.id === 'bloberto') return '🫠'
  return ROLE_EMOJIS[worker.role] ?? '🤖'
}

function Character({ worker, left, top, variant, wanderIdx = 0, delay = 0 }) {
  const emoji = getEmoji(worker)
  const firstName = worker.name.split(' ')[0]

  const style = {}
  if (left !== undefined) style.left = `${left}%`
  if (top  !== undefined) style.top  = `${top}%`

  // Stagger animation delays for multi-animation variants
  if (delay > 0) {
    if (variant === 'working') {
      // enter-office delay, then bob starts after enter finishes (+ 0.6s)
      style.animationDelay = `${delay}s, ${(delay + 0.6).toFixed(2)}s`
    } else if (variant === 'idle') {
      // fade-in-char delay, wander starts after fade finishes (+ 0.5s)
      style.animationDelay = `${delay}s, ${(delay + 0.5).toFixed(2)}s`
    } else {
      style.animationDelay = `${delay}s`
    }
  }

  const classes = ['char', `char--${variant}`]
  if (variant === 'idle' && wanderIdx) classes.push(`char--wander-${wanderIdx}`)

  return (
    <div className={classes.join(' ')} style={style}>
      <div className="char__avatar">{emoji}</div>
      <div className="char__name">{firstName}</div>
    </div>
  )
}

export default function Office({ workers = [], roster = [] }) {
  const bloberto = useMemo(
    () => [...workers, ...roster].find(w => w.id === 'bloberto') ?? DEFAULT_BLOBERTO,
    [workers, roster],
  )

  const nonMgr        = workers.filter(w => w.id !== 'bloberto')
  const workingWorkers = nonMgr.filter(w => w.status === 'working')
  const idleWorkers    = nonMgr.filter(w => w.status !== 'working')

  // Roster members not currently active → ghost at empty desk
  const activeIds   = useMemo(() => new Set(workers.map(w => w.id)), [workers])
  const ghostRoster = roster.filter(w => w.id !== 'bloberto' && !activeIds.has(w.id))

  // Assign working workers first, then ghosts, to desk slots
  const deskOccupants = useMemo(() => {
    const map = {}
    let i = 0
    for (const w of workingWorkers) {
      if (i < DESKS.length) map[DESKS[i++].id] = { worker: w, ghost: false }
    }
    for (const w of ghostRoster) {
      if (i < DESKS.length) map[DESKS[i++].id] = { worker: w, ghost: true }
    }
    return map
  }, [workingWorkers, ghostRoster])

  return (
    <div className="office-wrap">
      <div className="office-floor">

        <div className="office-sign">🏢 Bloberto&apos;s HQ</div>

        {/* Manager desk — top center */}
        <div className="mgr-desk">
          <div className="mgr-desk__monitor" />
          <div className="mgr-desk__nameplate">Manager</div>
        </div>

        {/* Regular desks */}
        {DESKS.map(desk => (
          <div
            key={desk.id}
            className="desk"
            style={{ left: `${desk.left}%`, top: `${desk.top}%` }}
          >
            <div className="desk__monitor" />
          </div>
        ))}

        {/* Coffee corner — top right */}
        <div className="coffee-corner">
          <div className="coffee-corner__body">
            <span className="coffee-corner__emoji">☕</span>
          </div>
          <span className="coffee-corner__label">Coffee</span>
        </div>

        {/* Door — bottom center */}
        <div className="office-door">
          <span className="office-door__icon">🚪</span>
          <span className="office-door__label">Entrance</span>
        </div>

        {/* Bloberto — always at manager desk, always visible */}
        <Character worker={bloberto} left={46} top={4} variant="manager" />

        {/* Active workers at desks (working) or as ghosts (roster-only) */}
        {DESKS.map((desk, i) => {
          const occ = deskOccupants[desk.id]
          if (!occ) return null
          return (
            <Character
              key={occ.worker.id}
              worker={occ.worker}
              left={desk.left + 7}
              top={desk.top - 4}
              variant={occ.ghost ? 'ghost' : 'working'}
              delay={i * 0.12}
            />
          )
        })}

        {/* Idle workers wandering the lower floor */}
        {idleWorkers.map((w, i) => (
          <Character
            key={w.id}
            worker={w}
            variant="idle"
            wanderIdx={(i % 4) + 1}
            delay={i * 0.2}
          />
        ))}

      </div>
    </div>
  )
}
