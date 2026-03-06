import { useMemo } from 'react'
import './Office.css'

const ROLE_COLORS = {
  'Frontend Engineer': '#a78bfa',
  'Backend Engineer': '#38bdf8',
  'DevOps Engineer': '#fb923c',
  'Manager': '#c084fc',
  'QA Engineer': '#f43f5e',
  'Designer': '#34d399',
  'Data Engineer': '#facc15',
  'Security Engineer': '#94a3b8',
  'Other': '#6b7280',
}

const DEFAULT_ROSTER = [
  { id: 'carlos', name: 'Carlos', role: 'Backend Engineer' },
  { id: 'maya', name: 'Maya', role: 'Frontend Engineer' },
  { id: 'dave', name: 'Dave', role: 'DevOps Engineer' },
  { id: 'sofia', name: 'Sofia', role: 'QA Engineer' },
]

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

function CharacterAvatar({ workerId, role, name, size = 40 }) {
  const roleColor = ROLE_COLORS[role] ?? '#6b7280'
  const ariaLabel = name ? `${name}, ${role}` : role

  if (workerId === 'bloberto') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={ariaLabel}>
        {/* Crown */}
        <polygon points="13,15 15,9 18,12 20,8 22,12 25,9 27,15" fill="#fbbf24" />
        {/* Blob body */}
        <ellipse cx="20" cy="28" rx="12" ry="10" fill="#7c3aed" />
        {/* Head */}
        <circle cx="20" cy="16" r="9" fill="#8b5cf6" />
        {/* Shine */}
        <ellipse cx="16" cy="12" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.25)" />
        {/* Eyes */}
        <circle cx="17" cy="16" r="1.5" fill="#2e1065" />
        <circle cx="23" cy="16" r="1.5" fill="#2e1065" />
        {/* Melty smile */}
        <path d="M 15 20 Q 17 23 20 21 Q 23 19 25 22" stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (workerId === 'carlos') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={ariaLabel}>
        {/* Dark hair top */}
        <ellipse cx="20" cy="9" rx="9" ry="5" fill="#1c1917" />
        {/* Head */}
        <circle cx="20" cy="14" r="8" fill="#d4a373" />
        {/* Hair sides */}
        <rect x="11" y="9" width="4" height="7" rx="2" fill="#1c1917" />
        <rect x="25" y="9" width="4" height="7" rx="2" fill="#1c1917" />
        {/* Glasses */}
        <rect x="12" y="12" width="6" height="4" rx="2" fill="none" stroke="#374151" strokeWidth="1.3" />
        <rect x="22" y="12" width="6" height="4" rx="2" fill="none" stroke="#374151" strokeWidth="1.3" />
        <line x1="18" y1="14" x2="22" y2="14" stroke="#374151" strokeWidth="1.3" />
        {/* Mouth */}
        <path d="M 17 19 Q 20 21 23 19" stroke="#92400e" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Teal shirt body */}
        <rect x="13" y="22" width="14" height="14" rx="4" fill="#0d9488" />
        {/* Arms */}
        <rect x="8" y="23" width="6" height="8" rx="3" fill="#0d9488" />
        <rect x="26" y="23" width="6" height="8" rx="3" fill="#0d9488" />
      </svg>
    )
  }

  if (workerId === 'maya') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={ariaLabel}>
        {/* Long hair strands — left pink, right purple */}
        <path d="M 12 14 Q 9 24 10 36" stroke="#ec4899" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 28 14 Q 31 24 30 36" stroke="#a855f7" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Hair on head */}
        <ellipse cx="20" cy="8" rx="9" ry="5" fill="#ec4899" />
        {/* Head */}
        <circle cx="20" cy="14" r="8" fill="#fcd5b5" />
        {/* Eyes */}
        <circle cx="17" cy="13" r="1.5" fill="#1e1b4b" />
        <circle cx="23" cy="13" r="1.5" fill="#1e1b4b" />
        {/* Smile */}
        <path d="M 17 17 Q 20 20 23 17" stroke="#c2410c" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Green top */}
        <rect x="13" y="22" width="14" height="14" rx="4" fill="#16a34a" />
        {/* Arms */}
        <rect x="8" y="23" width="6" height="8" rx="3" fill="#16a34a" />
        <rect x="26" y="23" width="6" height="8" rx="3" fill="#16a34a" />
      </svg>
    )
  }

  if (workerId === 'dave') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={ariaLabel}>
        {/* Headphone band */}
        <path d="M 12 14 Q 20 5 28 14" stroke="#374151" strokeWidth="3" fill="none" />
        {/* Headphone cups */}
        <rect x="9" y="13" width="5" height="6" rx="2" fill="#374151" />
        <rect x="26" y="13" width="5" height="6" rx="2" fill="#374151" />
        {/* Head */}
        <circle cx="20" cy="14" r="8" fill="#c68642" />
        {/* Short dark hair */}
        <ellipse cx="20" cy="7" rx="8" ry="4" fill="#292524" />
        {/* Eyes */}
        <circle cx="17" cy="13" r="1.5" fill="#1c1917" />
        <circle cx="23" cy="13" r="1.5" fill="#1c1917" />
        {/* Beard */}
        <ellipse cx="20" cy="20" rx="5" ry="2.5" fill="#57534e" />
        {/* Orange hoodie body */}
        <rect x="13" y="22" width="14" height="14" rx="4" fill="#ea580c" />
        {/* Hoodie pocket */}
        <rect x="16" y="29" width="8" height="5" rx="2" fill="#c2410c" />
        {/* Arms */}
        <rect x="8" y="23" width="6" height="8" rx="3" fill="#ea580c" />
        <rect x="26" y="23" width="6" height="8" rx="3" fill="#ea580c" />
      </svg>
    )
  }

  if (workerId === 'sofia') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={ariaLabel}>
        {/* Hair bun */}
        <circle cx="20" cy="5" r="4.5" fill="#7c2d12" />
        {/* Hair connector */}
        <rect x="17" y="7" width="6" height="5" fill="#7c2d12" />
        {/* Head */}
        <circle cx="20" cy="14" r="8" fill="#fcd5b5" />
        {/* Eyes */}
        <circle cx="17" cy="13" r="1.5" fill="#1e1b4b" />
        <circle cx="23" cy="13" r="1.5" fill="#1e1b4b" />
        {/* Smile */}
        <path d="M 17 17 Q 20 20 23 17" stroke="#9f1239" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Maroon top body */}
        <rect x="13" y="22" width="14" height="14" rx="4" fill="#9f1239" />
        {/* Arms */}
        <rect x="8" y="23" width="6" height="8" rx="3" fill="#9f1239" />
        <rect x="26" y="23" width="6" height="8" rx="3" fill="#9f1239" />
        {/* Magnifying glass */}
        <circle cx="7" cy="35" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
        <line x1="9.5" y1="37.5" x2="12" y2="39.5" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  // Generic fallback — color based on role
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={ariaLabel}>
      {/* Head */}
      <circle cx="20" cy="14" r="8" fill="#9ca3af" />
      {/* Hair */}
      <ellipse cx="20" cy="8" rx="8" ry="4" fill="#6b7280" />
      {/* Eyes */}
      <circle cx="17" cy="13" r="1.5" fill="#374151" />
      <circle cx="23" cy="13" r="1.5" fill="#374151" />
      {/* Mouth */}
      <path d="M 17 17 Q 20 19 23 17" stroke="#374151" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Body */}
      <rect x="13" y="22" width="14" height="14" rx="4" fill={roleColor} />
      {/* Arms */}
      <rect x="8" y="23" width="6" height="8" rx="3" fill={roleColor} />
      <rect x="26" y="23" width="6" height="8" rx="3" fill={roleColor} />
    </svg>
  )
}

function Character({ worker, left, top, variant, wanderIdx = 0, delay = 0, tooltip }) {
  const firstName = worker.name.split(' ')[0]
  const avatarSize = worker.id === 'bloberto' ? 44 : 36

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

  const extraProps = tooltip ? { 'data-tooltip': tooltip } : {}

  return (
    <div className={classes.join(' ')} style={style} {...extraProps}>
      <div className="char__avatar">
        <CharacterAvatar workerId={worker.id} role={worker.role} name={worker.name} size={avatarSize} />
      </div>
      <div className="char__name">{firstName}</div>
    </div>
  )
}

export default function Office({ workers = [], roster = [] }) {
  const effectiveRoster = roster.length > 0 ? roster : DEFAULT_ROSTER

  const bloberto = useMemo(
    () => [...workers, ...effectiveRoster].find(w => w.id === 'bloberto') ?? DEFAULT_BLOBERTO,
    [workers, effectiveRoster],
  )

  const nonMgr        = workers.filter(w => w.id !== 'bloberto')
  const workingWorkers = nonMgr.filter(w => w.status === 'working')
  const idleWorkers    = nonMgr.filter(w => w.status !== 'working')

  // Roster members not currently active → ghost at empty desk
  const activeIds   = useMemo(() => new Set(workers.map(w => w.id)), [workers])
  const ghostRoster = effectiveRoster.filter(w => w.id !== 'bloberto' && !activeIds.has(w.id))

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
      <div
        className="office-floor"
        role="img"
        aria-label="Virtual office visualization showing team members at desks"
      >

        <div className="office-sign">🏢 Bloberto&apos;s HQ</div>

        {/* Manager desk — top center */}
        <div className="mgr-desk">
          <div className="mgr-desk__monitor" />
          <div className="mgr-desk__nameplate">Manager</div>
          <span className="sr-only">Manager desk</span>
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
          <span className="sr-only">Coffee corner</span>
        </div>

        {/* Door — bottom center */}
        <div className="office-door">
          <span className="office-door__icon">🚪</span>
          <span className="office-door__label">Entrance</span>
          <span className="sr-only">Exit and entrance</span>
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
              tooltip={occ.ghost ? occ.worker.role : occ.worker.task}
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
