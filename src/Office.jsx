import { useMemo, useState, useRef, useEffect } from 'react'
import './Office.css'
import { getTeamVibeKey } from './utils/vibe.js'
import { ROLE_COLORS } from './utils/constants.js'

const MANAGER_QUOTES = [
  'Per my last commit…',
  'Can we circle back on that PR?',
  'It is not a bug, it is a feature roadmap item.',
  'Have you tried shipping it on Friday?',
  'My calendar says we are aligned.',
  'Let us take this offline.',
  'I will ping you async.',
  'This could have been a commit message.',
]

const VIBE_QUOTES = {
  'crushing': [
    'I knew all along this team was special.',
    'Velocity like this doesn\'t just happen — it happens because I scheduled stand-up at 9am.',
    'Per my roadmap from Q3, we\'re exactly on track.',
    'Ship it. Ship all of it. I\'ll write the retro later.',
    'This is what alignment looks like, people.',
  ],
  'on-fire': [
    'Have you tried rebooting the engineers?',
    'This is fine. This is all fine.',
    'Ship it. What\'s the worst that could happen? (Please don\'t answer that.)',
    'I\'m going to need a status update on the status update.',
    'Let\'s circle back on the fire.',
  ],
  'in-flow': [
    'Per my last commit…',
    'Can we circle back on that PR?',
    'My calendar says we are aligned.',
    'This could have been a commit message.',
    'Steady as she goes. I planned this.',
  ],
  'slow-day': [
    'Per my last email, is anyone actively watching the metrics?',
    'Circles. We need to circle back. Bring the circles.',
    'I sense untapped velocity. Let me schedule a sync.',
    'Has anyone checked the backlog? I feel like no one checks the backlog.',
  ],
  'after-hours': [
    'Why are you still here? Go home. I mean... I am always here, but you shouldn\'t be.',
    'The deploy can wait. Can it though?',
    'Night shift gets the best commit messages.',
    'Just me and the servers. As it should be.',
  ],
}

const DEFAULT_ROSTER = [
  { id: 'carlos', name: 'Carlos', role: 'Backend Engineer' },
  { id: 'maya', name: 'Maya', role: 'Frontend Engineer' },
  { id: 'dave', name: 'Dave', role: 'DevOps Engineer' },
  { id: 'sofia', name: 'Sofia', role: 'QA Engineer' },
  { id: 'luna', name: 'Luna', role: 'Creative Director', emoji: '🌙' },
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

const VIBE_WHITEBOARD = {
  'crushing':    '🏆 SHIP IT',
  'on-fire':     '🚨 HELP',
  'in-flow':     '⚡ FLOW',
  'slow-day':    'TODO: ???',
  'after-hours': '🌙 ZZZ',
}


function CharacterAvatar({ workerId, role, name, size = 40, emoji, vibeKey }) {
  const roleColor = ROLE_COLORS[role] ?? '#6b7280'
  const ariaLabel = name ? `${name}, ${role}` : role

  if (workerId === 'bloberto') {
    const v = vibeKey || 'in-flow'

    const blobFace = () => {
      if (v === 'crushing') return (
        <>
          {/* Wide eyes */}
          <circle cx="17" cy="16" r="2" fill="#2e1065" />
          <circle cx="23" cy="16" r="2" fill="#2e1065" />
          {/* Big grin */}
          <path d="M 14 19 Q 20 26 26 19" stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Star sparkles */}
          <text x="9" y="11" fontSize="5" fill="#fbbf24" aria-hidden="true">✦</text>
          <text x="26" y="9" fontSize="4" fill="#fbbf24" aria-hidden="true">✦</text>
        </>
      )
      if (v === 'on-fire') return (
        <>
          {/* Eyes */}
          <circle cx="17" cy="16" r="1.5" fill="#2e1065" />
          <circle cx="23" cy="16" r="1.5" fill="#2e1065" />
          {/* Worried brow arcs */}
          <line x1="15" y1="12" x2="18.5" y2="13.5" stroke="#2e1065" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="21.5" y1="13.5" x2="25" y2="12" stroke="#2e1065" strokeWidth="1.2" strokeLinecap="round" />
          {/* Flat mouth */}
          <line x1="16" y1="21" x2="24" y2="21" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" />
          {/* Sweat droplet */}
          <path d="M 29 13 L 27.2 17 Q 26.5 19.5 28.5 19.5 Q 30.5 19.5 29.8 17 Z" fill="#93c5fd" />
        </>
      )
      if (v === 'slow-day') return (
        <>
          {/* Eyes */}
          <circle cx="17" cy="16" r="1.5" fill="#2e1065" />
          <circle cx="23" cy="16" r="1.5" fill="#2e1065" />
          {/* Heavy droopy eyelids */}
          <path d="M 15.5 16 Q 17 14.5 18.5 16 Z" fill="#8b5cf6" />
          <path d="M 21.5 16 Q 23 14.5 24.5 16 Z" fill="#8b5cf6" />
          {/* Drooped frown */}
          <path d="M 16 20 Q 20 23 24 20" stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )
      if (v === 'after-hours') return (
        <>
          {/* Sleeping dash eyes */}
          <line x1="15" y1="16" x2="19" y2="16" stroke="#2e1065" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="21" y1="16" x2="25" y2="16" stroke="#2e1065" strokeWidth="1.8" strokeLinecap="round" />
          {/* Melty smile */}
          <path d="M 15 20 Q 17 23 20 21 Q 23 19 25 22" stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* ZZZ above head */}
          <text x="24" y="8" fontSize="5" fill="#c4b5fd" opacity="0.85" aria-hidden="true">zzz</text>
        </>
      )
      // in-flow — default face
      return (
        <>
          <circle cx="17" cy="16" r="1.5" fill="#2e1065" />
          <circle cx="23" cy="16" r="1.5" fill="#2e1065" />
          <path d="M 15 20 Q 17 23 20 21 Q 23 19 25 22" stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )
    }

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
        {blobFace()}
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

  if (workerId === 'luna') {
    const gradId = `luna-hair-${workerId}`
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={ariaLabel}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c0c0e0" />
            <stop offset="100%" stopColor="#8888cc" />
          </linearGradient>
        </defs>
        {/* Wavy hair strands — left and right */}
        <path d="M 12 14 Q 8 20 10 26 Q 8 32 11 38" stroke={`url(#${gradId})`} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M 28 14 Q 32 20 30 26 Q 32 32 29 38" stroke={`url(#${gradId})`} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        {/* Hair on head */}
        <ellipse cx="20" cy="8" rx="9" ry="5" fill={`url(#${gradId})`} />
        {/* Head */}
        <circle cx="20" cy="14" r="8" fill="#f5cba7" />
        {/* Eyes */}
        <circle cx="17" cy="13" r="1.5" fill="#2d1b69" />
        <circle cx="23" cy="13" r="1.5" fill="#2d1b69" />
        {/* Gentle smile */}
        <path d="M 17 17 Q 20 20 23 17" stroke="#b45309" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Crescent moon accessory near head (top-right) */}
        <circle cx="31" cy="7" r="4" fill="#fde68a" />
        <circle cx="33" cy="6" r="3.2" fill="#1e1b4b" />
        {/* Dark purple/indigo top body */}
        <rect x="13" y="22" width="14" height="14" rx="4" fill="#4a3a8a" />
        {/* Arms */}
        <rect x="8" y="23" width="6" height="8" rx="3" fill="#4a3a8a" />
        <rect x="26" y="23" width="6" height="8" rx="3" fill="#4a3a8a" />
        {/* Star sparkles */}
        <circle cx="6" cy="18" r="1.2" fill="#e2d9f3" opacity="0.9" />
        <circle cx="5" cy="26" r="0.9" fill="#c4b5fd" opacity="0.85" />
        <circle cx="34" cy="20" r="1" fill="#e2d9f3" opacity="0.9" />
      </svg>
    )
  }

  // Generic fallback — emoji if available, else color-based blob
  if (emoji) {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={ariaLabel}>
        <text x="20" y="28" textAnchor="middle" fontSize="24" dominantBaseline="auto">{emoji}</text>
      </svg>
    )
  }

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

function Character({ worker, left, top, variant, wanderIdx = 0, delay = 0, tooltip, managerVibe, vibeKey }) {
  const firstName = worker.name.split(' ')[0]
  const avatarSize = worker.id === 'bloberto' ? 44 : 36
  const isManager = worker.id === 'bloberto'
  const roleColor = !isManager ? (ROLE_COLORS[worker.role] ?? '#6b7280') : null

  const [bubble, setBubble] = useState({ quote: null, show: false })
  const timerRef = useRef(null)      // hover auto-hide timeout
  const ambientRef = useRef(null)    // ambient broadcast interval
  const isHoveringRef = useRef(false) // prevents ambient overlap with hover

  // Cleanup both timer and interval on unmount
  useEffect(() => () => {
    if (timerRef.current)  clearTimeout(timerRef.current)
    if (ambientRef.current) clearInterval(ambientRef.current)
  }, [])

  // Ambient broadcast loop — fires every 45s, resets on vibe change
  useEffect(() => {
    if (variant !== 'manager') return

    const id = setInterval(() => {
      if (isHoveringRef.current) return  // hover takes priority
      const quotes = (managerVibe && VIBE_QUOTES[managerVibe]) || MANAGER_QUOTES
      const quote = quotes[Math.floor(Math.random() * quotes.length)]
      setBubble({ quote, show: true })
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setBubble(b => ({ ...b, show: false })), 4000)
    }, 45000)

    ambientRef.current = id
    return () => {
      clearInterval(id)
      ambientRef.current = null
    }
  }, [variant, managerVibe])

  const handleMouseEnter = () => {
    if (variant !== 'manager') return
    isHoveringRef.current = true
    const quotes = (managerVibe && VIBE_QUOTES[managerVibe]) || MANAGER_QUOTES
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    if (timerRef.current) clearTimeout(timerRef.current)
    setBubble({ quote, show: true })
    timerRef.current = setTimeout(() => setBubble(b => ({ ...b, show: false })), 3500)
  }

  const handleMouseLeave = () => {
    if (variant !== 'manager') return
    isHoveringRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    setBubble(b => ({ ...b, show: false }))
  }

  const isError = worker.status === 'error'

  const style = {}
  if (left !== undefined) style.left = `${left}%`
  if (top  !== undefined) style.top  = `${top}%`
  if (roleColor) style['--role-color'] = roleColor

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
    <div className={classes.join(' ')} style={style} {...extraProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {variant === 'manager' && bubble.quote && (
        <div className={`speech-bubble${bubble.show ? ' speech-bubble--visible' : ''}`}>
          {bubble.quote}
        </div>
      )}
      <div className={`char__avatar${isError ? ' char__avatar--error' : ''}`}>
        <CharacterAvatar workerId={worker.id} role={worker.role} name={worker.name} size={avatarSize} emoji={worker.emoji} vibeKey={vibeKey} />
        {isError && (
          <div className="char__error-badge" role="img" aria-label="Error">!</div>
        )}
      </div>
      <div className="char__name">{firstName}</div>
      {variant === 'working' && (
        <div className="typing-dots">
          <span /><span /><span />
        </div>
      )}
    </div>
  )
}

function WindowElement() {
  const getHour = () => {
    const pstStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      hour12: false,
    }).format(new Date())
    return parseInt(pstStr, 10)
  }
  const [hour, setHour] = useState(getHour)

  useEffect(() => {
    const id = setInterval(() => setHour(getHour()), 60000)
    return () => clearInterval(id)
  }, [])

  const getGradient = (h) => {
    if (h >= 5 && h <= 8)  return 'linear-gradient(to bottom, #f97316, #f472b6)'
    if (h >= 9 && h <= 16) return 'linear-gradient(to bottom, #bae6fd, #f0f9ff)'
    if (h >= 17 && h <= 19) return 'linear-gradient(to bottom, #f59e0b, #f87171)'
    if (h >= 20 && h <= 23) return 'linear-gradient(to bottom, #4c1d95, #312e81)'
    return 'linear-gradient(to bottom, #050510, #1e1b4b)'  // midnight 0-4
  }

  const isMidnight = hour >= 0 && hour <= 4
  const isDaytime = hour >= 9 && hour <= 16
  const isGoldenHour = hour >= 17 && hour <= 19
  const timeLabel = hour < 5 ? 'midnight' : hour <= 8 ? 'sunrise' : hour <= 16 ? 'daylight' : hour <= 19 ? 'golden hour' : 'dusk'

  return (
    <div className="office-window" role="img" aria-label={`Office window showing ${timeLabel} sky`}>
      <div className="office-window__sky" style={{ background: getGradient(hour) }}>
        {isMidnight && (
          <>
            <span className="office-window__star" style={{ left: '18%', top: '20%' }} aria-hidden="true" />
            <span className="office-window__star" style={{ left: '58%', top: '12%' }} aria-hidden="true" />
            <span className="office-window__star" style={{ left: '38%', top: '55%' }} aria-hidden="true" />
            <span className="office-window__star" style={{ left: '78%', top: '38%' }} aria-hidden="true" />
          </>
        )}
        {isDaytime && (
          <>
            <div className="window-cloud" style={{ width: '14px', top: '28%', animationDuration: '11s' }} aria-hidden="true" />
            <div className="window-cloud" style={{ width: '9px', top: '55%', animationDuration: '16s', animationDelay: '-5s' }} aria-hidden="true" />
          </>
        )}
        {isGoldenHour && (
          <div className="window-cloud" style={{ width: '12px', top: '40%', animationDuration: '14s', background: 'rgba(251,191,36,0.4)' }} aria-hidden="true" />
        )}
      </div>
    </div>
  )
}

export default function Office({ workers = [], roster = [] }) {
  const effectiveRoster = roster.length > 0 ? roster : DEFAULT_ROSTER
  const vibe = getTeamVibeKey(workers)

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

        {/* Whiteboard — left wall, vibe-reactive */}
        <div
          className={`office-whiteboard${vibe === 'on-fire' ? ' office-whiteboard--urgent' : ''}`}
          aria-label={`Whiteboard: ${VIBE_WHITEBOARD[vibe] ?? VIBE_WHITEBOARD['in-flow']}`}
          role="img"
        >
          {VIBE_WHITEBOARD[vibe] ?? VIBE_WHITEBOARD['in-flow']}
        </div>
        <div className="mgr-desk">
          <div className="mgr-desk__monitor" data-vibe={vibe} />
          <div className="mgr-desk__nameplate">Manager</div>
          <span className="sr-only">Manager desk</span>
        </div>

        {/* Regular desks */}
        {DESKS.map(desk => {
          const occ = deskOccupants[desk.id]
          const hasError = occ && !occ.ghost && occ.worker.status === 'error'
          const isWorking = occ && !occ.ghost && occ.worker.status === 'working'
          return (
            <div
              key={desk.id}
              className={`desk${hasError ? ' desk--error' : ''}${isWorking ? ' desk--active' : ''}`}
              style={{
                left: `${desk.left}%`,
                top: `${desk.top}%`,
                ...(isWorking ? { '--role-color': ROLE_COLORS[occ.worker.role] } : {}),
              }}
            >
              <div className="desk__monitor" />
            </div>
          )
        })}

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
        <Character worker={bloberto} left={46} top={4} variant="manager" managerVibe={vibe} vibeKey={vibe} />

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

        {/* Office window — time-aware sky view */}
        <WindowElement />

        {/* Decorative plants */}
        <div className="office-plant" style={{ left: '85%', top: '55%' }}>
          <svg width="20" height="28" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M 6 18 L 4 28 L 16 28 L 14 18 Z" fill="#c2410c" />
            <ellipse cx="10" cy="14" rx="4" ry="6" fill="#22c55e" />
            <ellipse cx="5" cy="16" rx="3" ry="5" fill="#16a34a" transform="rotate(-20 5 16)" />
            <ellipse cx="15" cy="16" rx="3" ry="5" fill="#16a34a" transform="rotate(20 15 16)" />
          </svg>
        </div>
        <div className="office-plant" style={{ left: '3%', top: '75%' }}>
          <svg width="20" height="28" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M 6 18 L 4 28 L 16 28 L 14 18 Z" fill="#92400e" />
            <ellipse cx="10" cy="13" rx="5" ry="4" fill="#4ade80" />
            <line x1="10" y1="9" x2="10" y2="18" stroke="#166534" strokeWidth="1.5" />
            <line x1="7" y1="11" x2="7" y2="18" stroke="#166534" strokeWidth="1" />
            <line x1="13" y1="11" x2="13" y2="18" stroke="#166534" strokeWidth="1" />
          </svg>
        </div>
        <div className="office-plant office-plant--cactus" style={{ left: '92%', top: '30%' }}>
          <svg width="18" height="28" viewBox="0 0 18 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M 5 20 L 3 28 L 15 28 L 13 20 Z" fill="#c2410c" />
            <rect x="7" y="8" width="4" height="14" rx="2" fill="#22c55e" />
            <rect x="2" y="12" width="6" height="3" rx="1.5" fill="#16a34a" />
            <rect x="10" y="10" width="6" height="3" rx="1.5" fill="#16a34a" />
          </svg>
        </div>

      </div>
    </div>
  )
}
