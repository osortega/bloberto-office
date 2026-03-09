import { useMemo, useState, useRef, useEffect, memo, useId } from 'react'
import './Office.css'
import { getTeamVibeKey } from './utils/vibe.js'
import { ROLE_COLORS, DEFAULT_ROSTER, DEFAULT_BLOBERTO, DESKS, VIBE_WHITEBOARD, STATUS_LABELS, STATUS_EMOJIS } from './utils/constants.js'
import { VIBE_QUOTES, VIBE_TRANSITION_QUOTES } from './utils/quotes.js'


const DESK_SCREEN_SVG = {
  carlos: (
    <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="18" fill="#05050f" />
      <rect x="2" y="3" width="28" height="2" rx="1" fill="#3b82f6" opacity="0.9" />
      <rect x="2" y="8" width="20" height="2" rx="1" fill="#3b82f6" opacity="0.7" />
      <rect x="2" y="13" width="24" height="2" rx="1" fill="#3b82f6" opacity="0.8" />
    </svg>
  ),
  maya: (
    <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="18" fill="#05050f" />
      <rect x="1" y="1" width="36" height="16" rx="1" fill="none" stroke="#a855f7" strokeWidth="0.8" />
      <rect x="3" y="3" width="32" height="5" rx="0.5" fill="none" stroke="#c084fc" strokeWidth="0.7" />
      <rect x="3" y="10" width="14" height="5" rx="0.5" fill="none" stroke="#a855f7" strokeWidth="0.7" />
      <rect x="19" y="10" width="16" height="5" rx="0.5" fill="none" stroke="#a855f7" strokeWidth="0.7" />
    </svg>
  ),
  dave: (
    <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="18" fill="#05050f" />
      <rect x="2" y="2" width="34" height="14" rx="1" fill="#0d1117" />
      <rect x="3" y="4" width="22" height="2" rx="0.5" fill="#f97316" opacity="0.85" />
      <rect x="3" y="8" width="17" height="2" rx="0.5" fill="#f97316" opacity="0.65" />
      <rect x="3" y="12" width="4" height="2.5" rx="0.3" fill="#f97316">
        <animate attributeName="opacity" values="1;0;1" dur="0.9s" repeatCount="indefinite" calcMode="discrete" />
      </rect>
    </svg>
  ),
  sofia: (
    <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="18" fill="#05050f" />
      <rect x="4"  y="10" width="5" height="6" rx="0.5" fill="#22c55e" opacity="0.9" />
      <rect x="11" y="6"  width="5" height="10" rx="0.5" fill="#22c55e" opacity="0.85" />
      <rect x="18" y="8"  width="5" height="8"  rx="0.5" fill="#22c55e" opacity="0.8" />
      <rect x="25" y="3"  width="5" height="13" rx="0.5" fill="#22c55e" opacity="0.9" />
    </svg>
  ),
  luna: (
    <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="18" fill="#05050f" />
      <rect x="1"  y="3" width="7" height="12" rx="1" fill="#8b5cf6" />
      <rect x="9"  y="3" width="7" height="12" rx="1" fill="#c084fc" />
      <rect x="17" y="3" width="7" height="12" rx="1" fill="#a78bfa" />
      <rect x="25" y="3" width="7" height="12" rx="1" fill="#7c3aed" />
      <path d="M35,3.5 L35.7,5.3 L37.4,5.4 L36.2,6.5 L36.5,8.3 L35,7.4 L33.5,8.3 L33.8,6.5 L32.6,5.4 L34.3,5.3 Z" fill="#fbbf24" />
    </svg>
  ),
  carlos_error: (
    <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="18" fill="#1a0000" />
      <rect x="2" y="3" width="28" height="2" rx="1" fill="#ef4444" opacity="0.9"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.6s" repeatCount="indefinite" /></rect>
      <rect x="2" y="8" width="20" height="2" rx="1" fill="#ef4444" opacity="0.7"><animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.8s" repeatCount="indefinite" /></rect>
      <text x="3" y="17" fontSize="4.5" fill="#ef4444" fontFamily="monospace">PANIC</text>
    </svg>
  ),
  maya_error: (
    <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="18" fill="#1a0000" />
      <rect x="1" y="1" width="36" height="16" rx="1" fill="none" stroke="#ef4444" strokeWidth="0.8"><animate attributeName="stroke-opacity" values="1;0.3;1" dur="0.7s" repeatCount="indefinite" /></rect>
      <text x="7" y="11" fontSize="5" fill="#ef4444" fontFamily="monospace">PANIC</text>
    </svg>
  ),
  dave_error: (
    <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="18" fill="#1a0000" />
      <polyline points="2,9 6,9 8,4 10,14 12,9 16,9 18,5 20,13 22,9 36,9" fill="none" stroke="#ef4444" strokeWidth="1.2"><animate attributeName="stroke-opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" /></polyline>
      <text x="3" y="17" fontSize="4.5" fill="#ef4444" fontFamily="monospace">PANIC</text>
    </svg>
  ),
  sofia_error: (
    <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="18" fill="#1a0000" />
      <rect x="4"  y="14" width="5" height="2" rx="0.5" fill="#ef4444" opacity="0.9"><animate attributeName="height" values="2;8;2" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" values="14;8;14" dur="0.6s" repeatCount="indefinite" /></rect>
      <rect x="11" y="14" width="5" height="2" rx="0.5" fill="#ef4444" opacity="0.8"><animate attributeName="height" values="2;10;2" dur="0.8s" repeatCount="indefinite" /><animate attributeName="y" values="14;6;14" dur="0.8s" repeatCount="indefinite" /></rect>
      <rect x="18" y="14" width="5" height="2" rx="0.5" fill="#ef4444" opacity="0.85"><animate attributeName="height" values="2;6;2" dur="0.5s" repeatCount="indefinite" /><animate attributeName="y" values="14;10;14" dur="0.5s" repeatCount="indefinite" /></rect>
      <rect x="25" y="14" width="5" height="2" rx="0.5" fill="#ef4444" opacity="0.9"><animate attributeName="height" values="2;12;2" dur="0.7s" repeatCount="indefinite" /><animate attributeName="y" values="14;4;14" dur="0.7s" repeatCount="indefinite" /></rect>
      <text x="3" y="17" fontSize="3.5" fill="#ef4444" fontFamily="monospace">PANIC</text>
    </svg>
  ),
  luna_error: (
    <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="38" height="18" fill="#1a0000" />
      <rect x="1"  y="3" width="7" height="12" rx="1" fill="#ef4444"><animate attributeName="opacity" values="0.9;0.2;0.9" dur="0.5s" repeatCount="indefinite" /></rect>
      <rect x="9"  y="3" width="7" height="12" rx="1" fill="#dc2626"><animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.7s" repeatCount="indefinite" /></rect>
      <rect x="17" y="3" width="7" height="12" rx="1" fill="#ef4444"><animate attributeName="opacity" values="0.85;0.2;0.85" dur="0.6s" repeatCount="indefinite" /></rect>
      <rect x="25" y="3" width="7" height="12" rx="1" fill="#dc2626"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.4s" repeatCount="indefinite" /></rect>
      <text x="3" y="17" fontSize="4.5" fill="#ef4444" fontFamily="monospace">PANIC</text>
    </svg>
  ),
}

const BLOBERTO_TITLES = {
  crushing:      'CVO',
  'on-fire':     'CFO',
  'slow-day':    'CDO',
  'in-flow':     'CPO',
  'after-hours': 'CISO',
}

const VIBE_WEATHER_LABELS = {
  'crushing': '☀️ Clear skies — team at full strength',
  'on-fire': '⛈️ Storm conditions — all hands',
  'in-flow': '⛅ Partly cloudy — steady progress',
  'slow-day': '🌧️ Drizzle — easy does it',
  'after-hours': '🌙 Night sky — the stars are watching',
}
const VIBE_WEATHER_ICONS = {
  'on-fire':    '⛈️',
  'crushing':   '☀️',
  'in-flow':    '⛅',
  'slow-day':   '🌧️',
  'after-hours':'🌙',
}

const LONE_SURVIVOR_LABELS = {
  'crushing':     '🎯 solo run',
  'on-fire':      '🧯 one-person fireteam',
  'in-flow':      '⚡ flow state: achieved',
  'slow-day':     '🤷 who turned off the others?',
  'after-hours':  '🌙 last one standing',
}

const LONE_SURVIVOR_WORKER_OVERRIDES = {
  carlos: { 'on-fire': '🧯 backend won\'t fall today', 'crushing': '📊 no bottlenecks when you ARE the stack' },
  sofia:  { 'on-fire': '🔍 holding quality with both hands', 'crushing': '✅ bugs have nowhere to hide' },
  dave:   { 'on-fire': '🎧 incident music: selected', 'slow-day': '🎵 coding into the void' },
  maya:   { 'crushing': '💜 shipping pixels at terminal velocity' },
  luna:   { 'after-hours': '🌙 reviews don\'t stop at midnight' },
}

const DOOR_LABELS = {
  'crushing':    '🚀 All hands in',
  'on-fire':     '🧯 Brace yourself',
  'in-flow':     '⚡ Focus zone',
  'slow-day':    '☁️ Come on in',
  'after-hours': '🔒 Locked up',
}

const WORKER_AWAY_DESK_LABELS = {
  carlos: '↪ in the logs',
  maya:   '↪ sketching',
  dave:   '↪ headphones on',
  sofia:  '↪ testing',
  luna:   '↪ reviewing',
}

const VACANT_ADS = {
  'crushing':     { title: 'Staff Wizard',          req: 'Must maintain velocity without asking what velocity means' },
  'on-fire':      { title: 'URGENT: Firefighter',   req: 'Start Monday. Like, this Monday.' },
  'slow-day':     { title: 'Chaos Wrangler',         req: 'Previous experience with vibe collapse preferred' },
  'in-flow':      { title: 'Flow Keeper',            req: 'Do not disrupt the rhythm. That is the job.' },
  'after-hours':  { title: 'Night Watch',            req: 'The servers need company.' },
}

const PING_REACTIONS = {
  luna: 'Creative review in progress...',
  carlos: 'Check the logs. It is ALWAYS in the logs.',
  maya: 'Check the PRs — purple and correct as always.',
  dave: 'He hears you through the headphones.',
  sofia: 'Found 3 more bugs already.',
}


const CharacterAvatar = memo(function CharacterAvatar({ workerId, role, name, size = 40, emoji, vibeKey }) {
  const roleColor = ROLE_COLORS[role] ?? '#6b7280'
  const ariaLabel = name ? `${name}, ${role}` : role
  const gradId = useId()

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
})

function formatIdleDuration(updatedAt) {
  if (!updatedAt) return null
  const diffMs = Date.now() - new Date(updatedAt).getTime()
  const mins = Math.floor(diffMs / 60_000)
  const hours = Math.floor(mins / 60)
  if (mins < 1) return '<1m'
  if (hours < 1) return `${mins}m`
  const rem = mins % 60
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`
}

const AWAY_MESSAGES = ['☕ Coffee run', '🧠 Deep think', '📞 On a call', '🚶 Taking a lap', '🥪 Lunch', '🎧 Headphones in']
const WORKER_AWAY_MESSAGES = {
  carlos: ['☕ In the logs', '🧪 Tracing a bug', '📖 Reading docs', '🔌 Debugging'],
  maya: ['🎨 Sketching', '🖌️ Wireframing', '💜 Mood-boarding', '✏️ Reviewing comps'],
  dave: ['🎧 Headphones in', '⚙️ Pipeline watch', '📦 Infra thinking', '🚀 Deploy planning'],
  sofia: ['🔍 Exploring', '🧪 Test design', '📋 Case writing', '🔎 Bug hunting'],
  luna: ['🌙 Daydreaming', '✨ Spec drafting', '💡 Ideas percolating', '📐 Visual thinking'],
}

function AwaySign({ workerId, idleMinutes }) {
  const seed = workerId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const messages = WORKER_AWAY_MESSAGES[workerId] || AWAY_MESSAGES
  const idx = (seed + Math.floor(idleMinutes / 10)) % messages.length
  const message = messages[idx]
  const [line1, line2] = message.split(' ').reduce(
    ([a, b], word) => (a.length === 0 ? [word, b] : [a, b ? `${b} ${word}` : word]),
    ['', ''],
  )

  return (
    <div className="desk-away-sign" data-tier={idleMinutes >= 60 ? 'long' : idleMinutes >= 30 ? 'mid' : 'short'} aria-label={`Away: ${message}`} role="img" title={message}>
      <svg
        className="desk-away-sign__note"
        width="12" height="14"
        viewBox="0 0 44 52"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="42" height="50" rx="2" fill="var(--away-note-bg, #fef08a)" stroke="var(--away-note-border, #ca8a04)" strokeWidth="0.8" />
        {/* Fold corner */}
        <path d="M 33 1 L 43 11 L 33 11 Z" fill="var(--away-note-fold, #fde047)" />
        <path d="M 33 1 L 43 11 L 33 11 Z" fill="none" stroke="var(--away-note-border, #ca8a04)" strokeWidth="0.8" />
        {/* Ruled lines */}
        <line x1="6" y1="22" x2="38" y2="22" stroke="var(--away-note-line, #fbbf24)" strokeWidth="0.6" opacity="0.6" />
        <line x1="6" y1="32" x2="38" y2="32" stroke="var(--away-note-line, #fbbf24)" strokeWidth="0.6" opacity="0.6" />
        <line x1="6" y1="42" x2="38" y2="42" stroke="var(--away-note-line, #fbbf24)" strokeWidth="0.6" opacity="0.6" />
        {/* Message text */}
        <text x="22" y="15" textAnchor="middle" fontSize="9" fill="#92400e" fontFamily="sans-serif" fontWeight="700">{line1}</text>
        <text x="22" y="27" textAnchor="middle" fontSize="8" fill="#92400e" fontFamily="sans-serif">{line2}</text>
      </svg>
    </div>
  )
}

const WORKER_IDLE_BUBBLES = {
  carlos: ['☕', '📊', '🔍'],
  maya: ['💜', '✏️', '🎨'],
  dave: ['🎧', '📦', '⚡'],
  sofia: ['🔍', '📋', '🧪'],
  luna: ['🌙', '✨', '💭'],
}
const DEFAULT_IDLE_BUBBLES = ['☕', '💬', '🪟', '🧘']
const ERROR_BUBBLE_MESSAGES = ['💀', '⚠️ help?', 'it was fine locally', '🧨', 'send help', 'undefined is not a function']

const Character = memo(function Character({ worker, left, top, variant, wanderIdx = 0, delay = 0, tooltip, managerVibe, vibeKey, isSyncing = false, activityEntries = [], onClick, isPinged = false, pingReaction = null }) {
  const firstName = worker.name.split(' ')[0]
  const avatarSize = worker.id === 'bloberto' ? 44 : 36
  const isManager = worker.id === 'bloberto'
  const roleColor = !isManager ? (ROLE_COLORS[worker.role] ?? '#6b7280') : null

  const [bubble, setBubble] = useState({ quote: null, show: false })
  const [ghostBubble, setGhostBubble] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pinnedCard, setPinnedCard] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [idleBubble, setIdleBubble] = useState(false)
  const [errorBubble, setErrorBubble] = useState(null)
  const timerRef = useRef(null)      // hover auto-hide timeout
  const ambientRef = useRef(null)    // ambient broadcast interval
  const isHoveringRef = useRef(false) // prevents ambient overlap with hover
  const prevVibeRef = useRef(null)
  const prevProgressRef = useRef(worker.progress)
  const idleInnerTimeoutRef = useRef(null)   // inner setTimeout inside idle interval
  const errorInnerTimeoutRef = useRef(null)  // inner setTimeout inside error interval

  // Cleanup both timer and interval on unmount
  useEffect(() => () => {
    if (timerRef.current)  clearTimeout(timerRef.current)
    if (ambientRef.current) clearInterval(ambientRef.current)
    if (idleInnerTimeoutRef.current) clearTimeout(idleInnerTimeoutRef.current)
    if (errorInnerTimeoutRef.current) clearTimeout(errorInnerTimeoutRef.current)
  }, [])

  // Ping reaction — show Bloberto's worker-specific one-liner
  useEffect(() => {
    if (pingReaction) {
      setBubble({ quote: pingReaction, show: true })
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setBubble(b => ({ ...b, show: false })), 3000)
    }
  }, [pingReaction])

  // Idle micro-bubbles — ambient thought emojis for wandering characters
  useEffect(() => {
    if (variant !== 'idle') return
    const showDelay = 8000 + wanderIdx * 3000
    const interval = setInterval(() => {
      setIdleBubble(true)
      idleInnerTimeoutRef.current = setTimeout(() => setIdleBubble(false), 2200)
    }, showDelay + 2200)
    const initialTimeout = setTimeout(() => {
      setIdleBubble(true)
      idleInnerTimeoutRef.current = setTimeout(() => setIdleBubble(false), 2200)
    }, showDelay)
    return () => { clearInterval(interval); clearTimeout(initialTimeout); clearTimeout(idleInnerTimeoutRef.current) }
  }, [variant, wanderIdx])

  // Error micro-bubbles — distress messages for workers in error state
  useEffect(() => {
    const isErr = variant === 'error' || worker.status === 'error'
    if (!isErr) return
    const pick = () => {
      const msgs = WORKER_ERROR_BUBBLES[worker.id] || ERROR_BUBBLE_MESSAGES
      return msgs[Math.floor(Math.random() * msgs.length)]
    }
    const interval = setInterval(() => {
      setErrorBubble(pick())
      errorInnerTimeoutRef.current = setTimeout(() => setErrorBubble(null), 2200)
    }, 12000)
    const initialTimeout = setTimeout(() => {
      setErrorBubble(pick())
      errorInnerTimeoutRef.current = setTimeout(() => setErrorBubble(null), 2200)
    }, 2000 + wanderIdx * 1500)
    return () => { clearInterval(interval); clearTimeout(initialTimeout); clearTimeout(errorInnerTimeoutRef.current) }
  }, [variant, worker.status, worker.id, wanderIdx])

  // Progress ring 100% burst
  useEffect(() => {
    const prev = prevProgressRef.current
    prevProgressRef.current = worker.progress
    if (worker.progress === 100 && prev < 100) {
      setJustCompleted(true)
      const t = setTimeout(() => setJustCompleted(false), 1400)
      return () => clearTimeout(t)
    }
  }, [worker.progress])

  // Ambient broadcast loop — fires every 45s, resets on vibe change
  useEffect(() => {
    if (variant !== 'manager') return

    if (prevVibeRef.current !== null && prevVibeRef.current !== managerVibe) {
      const transitionQuote = VIBE_TRANSITION_QUOTES[prevVibeRef.current + ':' + managerVibe]
      if (transitionQuote) {
        setBubble({ quote: transitionQuote, show: true })
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setBubble(b => ({ ...b, show: false })), 4000)
      }
    }
    prevVibeRef.current = managerVibe

    const mountQuoteId = setTimeout(() => {
      if (!isHoveringRef.current) {
        const qs = VIBE_QUOTES[managerVibe] || VIBE_QUOTES['in-flow'];
        setBubble({ quote: qs[Math.floor(Math.random() * qs.length)], show: true });
        timerRef.current = setTimeout(() => setBubble(b => ({ ...b, show: false })), 4000);
      }
    }, 3000);

    const id = setInterval(() => {
      if (isHoveringRef.current) return  // hover takes priority
      const quotes = VIBE_QUOTES[managerVibe] || VIBE_QUOTES['in-flow']
      const quote = quotes[Math.floor(Math.random() * quotes.length)]
      setBubble({ quote, show: true })
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setBubble(b => ({ ...b, show: false })), 4000)
    }, 45000)

    ambientRef.current = id
    return () => {
      clearTimeout(mountQuoteId)
      clearInterval(id)
      ambientRef.current = null
    }
  }, [variant, managerVibe])

  useEffect(() => {
    if (!pinnedCard) return
    const handler = (e) => {
      if (!e.target.closest('.char')) setPinnedCard(false)
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [pinnedCard])

  const handleMouseEnter = () => {
    if (variant === 'ghost') { setGhostBubble(true); return }
    if (variant === 'working' || variant === 'idle') { setHovered(true) }
    if (variant !== 'manager') return
    isHoveringRef.current = true
    const quotes = VIBE_QUOTES[managerVibe] || VIBE_QUOTES['in-flow']
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    if (timerRef.current) clearTimeout(timerRef.current)
    setBubble({ quote, show: true })
    timerRef.current = setTimeout(() => setBubble(b => ({ ...b, show: false })), 3500)
  }

  const handleMouseLeave = () => {
    if (variant === 'ghost') { setGhostBubble(false); return }
    if (variant === 'working' || variant === 'idle') { setHovered(false) }
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
  if (variant === 'working' && worker.updated_at && Date.now() - new Date(worker.updated_at).getTime() > 45 * 60 * 1000) {
    classes.push('char--deep-work')
  }
  if (isError) classes.push('char--glitch')
  if (isPinged) classes.push('char--pinged')

  const tooltipText = tooltip && onClick ? `${tooltip} · click to inspect` : tooltip
  const extraProps = (tooltipText && variant !== 'ghost') ? { 'data-tooltip': tooltipText } : {}

  const handleClick = onClick ? (e) => {
    if (window.matchMedia('(hover: none)').matches) {
      e.stopPropagation()
      setPinnedCard(p => !p)
    } else {
      onClick(worker)
    }
  } : undefined

  return (
    <div className={classes.join(' ')} style={{ ...style, ...(handleClick ? { cursor: 'pointer' } : {}) }} {...extraProps}
      data-complete={justCompleted || undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e) } } : undefined}
      role={handleClick ? 'button' : undefined}
      tabIndex={handleClick ? 0 : -1}
    >
      {variant === 'manager' && isSyncing && (
        <div className="bloberto-typing">
          <span /><span /><span />
        </div>
      )}
      {variant === 'manager' && bubble.quote && (
        <div className={`speech-bubble${bubble.show ? ' speech-bubble--visible' : ''}`}>
          {bubble.quote}
        </div>
      )}
      {variant !== 'manager' && variant !== 'ghost' && pingReaction && (
        <div className={`speech-bubble speech-bubble--visible`}>
          {pingReaction}
        </div>
      )}
      {variant === 'ghost' && ghostBubble && (() => {
        const lastEvent = activityEntries.filter(e => e.worker === worker.name).at(-1)
        const relTime = lastEvent ? (() => {
          const diff = Date.now() - new Date(lastEvent.timestamp).getTime()
          const mins = Math.floor(diff / 60_000)
          const hours = Math.floor(diff / 3_600_000)
          const days = Math.floor(diff / 86_400_000)
          if (mins < 1) return 'just now'
          if (mins < 60) return `${mins}m ago`
          if (hours < 24) return `${hours}h ago`
          return `${days}d ago`
        })() : null
        return (
          <div className='ghost-ooo-bubble'>📵 OOO<br/><span className='ghost-ooo-role'>{worker.role}</span>{relTime && <span className='ghost-last-seen'>Last seen: {relTime}</span>}</div>
        )
      })()}
      <div className={`char__avatar${isError ? ' char__avatar--error' : ''}`}>
        <CharacterAvatar workerId={worker.id} role={worker.role} name={worker.name} size={avatarSize} emoji={worker.emoji} vibeKey={vibeKey} />
        {variant === 'working' && typeof worker.progress === 'number' && (
          <svg className={`progress-ring${worker.progress >= 100 ? ' progress-ring--complete' : ''}`} width={avatarSize + 6} height={avatarSize + 6} viewBox={`0 0 ${avatarSize + 6} ${avatarSize + 6}`} aria-label={`${worker.progress}% complete`}>
            <circle className="progress-ring__track" cx={(avatarSize + 6) / 2} cy={(avatarSize + 6) / 2} r={(avatarSize) / 2} />
            <circle className="progress-ring__fill" cx={(avatarSize + 6) / 2} cy={(avatarSize + 6) / 2} r={(avatarSize) / 2}
              style={{
                stroke: worker.progress >= 100 ? '#22c55e' : (roleColor || ROLE_COLORS[worker.role] || '#a78bfa'),
                strokeDasharray: Math.PI * avatarSize,
                strokeDashoffset: Math.PI * avatarSize * (1 - Math.min(worker.progress, 100) / 100),
              }}
            />
          </svg>
        )}
        {isError && (
          <div className="char__error-badge" role="img" aria-label="Error">!</div>
        )}
        {variant === 'idle' && worker.updated_at && (
          <div className="idle-duration">{formatIdleDuration(worker.updated_at)}</div>
        )}
      </div>
      <div className="char__name">{firstName}</div>
      {variant === 'idle' && idleBubble && (
        <div className="idle-micro-bubble">{(WORKER_IDLE_BUBBLES[worker.id] || DEFAULT_IDLE_BUBBLES)[Math.floor(Date.now() / 12000) % (WORKER_IDLE_BUBBLES[worker.id] || DEFAULT_IDLE_BUBBLES).length]}</div>
      )}
      {errorBubble && (
        <div className="idle-micro-bubble" data-type="error">{errorBubble}</div>
      )}
      {variant === 'working' && (
        <div className="typing-dots">
          <span /><span /><span />
        </div>
      )}
      {(hovered || pinnedCard) && (variant === 'working' || variant === 'idle') && (
        <div className="char-hover-card">
          <strong>{worker.name}</strong>
          <span className="hover-role">{worker.role}</span>
          {worker.task && (
            <div className="hover-task">
              {worker.task.length > 40 ? worker.task.slice(0, 40) + '…' : worker.task}
            </div>
          )}
          <div>{STATUS_EMOJIS[worker.status]} {STATUS_LABELS[worker.status]}</div>
          {variant === 'working' && worker.startedAt && (
            <div className="hover-time">on task for {formatIdleDuration(worker.startedAt)}</div>
          )}
          {variant === 'idle' && worker.updated_at && (
            <div className="hover-time">idle for {formatIdleDuration(worker.updated_at)}</div>
          )}
        </div>
      )}
    </div>
  )
})

function WindowElement({ vibe }) {
  const getHour = () => new Date().getHours()
  const [hour, setHour] = useState(getHour)

  useEffect(() => {
    const id = setInterval(() => {
      const h = getHour()
      setHour(prev => prev === h ? prev : h)
    }, 60000)
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
      <span className="office-window__time-caption">{timeLabel}</span>
      <div className="office-window__sky" style={{ background: getGradient(hour) }} data-vibe={vibe} data-daytime={isDaytime || undefined}>
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

// Chair positions around the table (angle in degrees, radius from center)
const CHAIR_ANGLES = [0, 60, 120, 180, 240, 300]

function ConferenceTable({ vibeKey, meetingWorkers = [], standupWorkers = [], lastHuddle }) {
  const vibe = vibeKey || 'in-flow'

  // How many chairs are visible per vibe
  const visibleCount = vibe === 'crushing' ? 6 : vibe === 'in-flow' ? 4 : 1

  // Chair fill color per vibe
  const chairColor =
    vibe === 'crushing' ? '#a78bfa' :
    vibe === 'in-flow'  ? '#2dd4bf' :
    vibe === 'on-fire'  ? '#fb923c' :
    vibe === 'after-hours' ? '#6366f1' :
    '#9ca3af'

  const tableFill   = vibe === 'after-hours' ? '#1e1b4b' : '#1e293b'
  const tableStroke = vibe === 'crushing' ? '#a78bfa' : vibe === 'on-fire' ? '#ef4444' : vibe === 'in-flow' ? '#2dd4bf' : '#475569'
  const tableOpacity = vibe === 'after-hours' ? 0.55 : 1

  // on-fire: red glow filter
  const glowFilter = vibe === 'on-fire' ? 'url(#conf-fire-glow)' : undefined

  const cx = 52, cy = 52, tableR = 28, chairR = 6, orbitR = 38

  return (
    <div className="conference-table" data-meeting={(meetingWorkers.length >= 2 || standupWorkers.length > 0) || undefined} aria-label="Conference table" role="img" style={{ position: 'relative' }}>
      <svg width="104" height="104" viewBox="0 0 104 104" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ opacity: tableOpacity }}>
        <defs>
          <filter id="conf-fire-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Chairs */}
        {CHAIR_ANGLES.map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = cx + orbitR * Math.sin(rad)
          const y = cy - orbitR * Math.cos(rad)
          const isVisible = i < visibleCount
          // after-hours: single chair rotated 45°
          const rotate = vibe === 'after-hours' && i === 0 ? `rotate(45 ${x} ${y})` : undefined

          return isVisible ? (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={chairR}
              fill={chairColor}
              opacity={vibe === 'after-hours' ? 0.7 : 0.9}
              transform={rotate}
            />
          ) : null
        })}

        {/* Table surface */}
        <circle
          cx={cx} cy={cy} r={tableR}
          fill={tableFill}
          stroke={tableStroke}
          strokeWidth="2.5"
          filter={glowFilter}
        />

        {/* slow-day: coffee cup on table */}
        {vibe === 'slow-day' && (
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" role="img" aria-label="coffee">☕</text>
        )}
      </svg>

      {meetingWorkers.length === 0 && (
        <div key={vibe} className="conf-ambient-label">
          {vibe === 'crushing' ? 'everyone is at their desk' :
           vibe === 'on-fire' ? 'no meetings. fix it.' :
           vibe === 'in-flow' ? 'reserve the table' :
           vibe === 'slow-day' ? 'open office hours' :
           'locked up'}
        </div>
      )}

      {meetingWorkers.length === 0 && (() => {
        const h = lastHuddle?.current
        if (!h || !h.names.length || h.endedAt === null) return null
        const elapsed = Date.now() - h.endedAt
        if (elapsed > 30 * 60 * 1000) return null
        const mins = Math.floor(elapsed / 60000)
        const timeStr = mins < 1 ? 'just now' : `${mins}m ago`
        return (
          <div style={{ opacity: 0.5, fontSize: '0.38rem', textAlign: 'center', marginTop: '2px' }}>
            Last: {h.names.join(', ')} · {timeStr}
          </div>
        )
      })()}

      {meetingWorkers.length >= 2 && standupWorkers.length === 0 && (
        <>
          <div className="conf-meeting-badge">Huddle</div>
          {meetingWorkers.map((w, i) => {
            const angle = CHAIR_ANGLES[i];
            const rad = (angle * Math.PI) / 180;
            const cx = 52, orbitR = 38;
            const x = cx + orbitR * Math.sin(rad);
            const y = cx - orbitR * Math.cos(rad);
            return (
              <div key={w.id} className="char--seated" style={{ left: x + 'px', top: y + 'px' }}>
                <CharacterAvatar workerId={w.id} role={w.role} name={w.name} size={16} emoji={w.emoji} />
              </div>
            );
          })}
        </>
      )}

      {standupWorkers.length > 0 && (
        <>
          <div className="conf-meeting-badge">STANDUP</div>
          {standupWorkers.map((w, i) => {
            const angle = CHAIR_ANGLES[i];
            const rad = (angle * Math.PI) / 180;
            const cx = 52, orbitR = 38;
            const x = cx + orbitR * Math.sin(rad);
            const y = cx - orbitR * Math.cos(rad);
            return (
              <div key={w.id} className="char--seated" style={{ left: x + 'px', top: y + 'px' }}>
                <CharacterAvatar workerId={w.id} role={w.role} name={w.name} size={16} emoji={w.emoji} />
              </div>
            );
          })}
        </>
      )}
    </div>
  )
}

const VIBE_SHOCKWAVE_COLORS = {
  crushing: '#a78bfa',
  'on-fire': '#ef4444',
  'in-flow': '#2dd4bf',
  'slow-day': '#9ca3af',
  'after-hours': '#6366f1',
}

function VibeShockwave({ vibeKey }) {
  const prevVibeRef = useRef(vibeKey)
  const [shockwave, setShockwave] = useState(null)

  useEffect(() => {
    if (prevVibeRef.current !== vibeKey) {
      const color = VIBE_SHOCKWAVE_COLORS[vibeKey] || '#a78bfa'
      setShockwave({ color, key: Date.now() })
      const timer = setTimeout(() => setShockwave(null), 900)
      prevVibeRef.current = vibeKey
      return () => clearTimeout(timer)
    }
  }, [vibeKey])

  if (!shockwave) return null

  return (
    <div
      key={shockwave.key}
      className="vibe-shockwave"
      style={{ borderColor: shockwave.color }}
      aria-hidden="true"
    />
  )
}

function WallClock({ vibeKey }) {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const h = time.getHours()
  const m = time.getMinutes()
  const hourDeg = (h % 12) * 30 + m * 0.5
  const minuteDeg = m * 6

  const isAfterHours = vibeKey === 'after-hours'
  const faceFill = isAfterHours ? '#1e1b4b' : 'var(--surface2, #1e1b4b)'
  const minuteColor = isAfterHours ? '#6366f1' : 'var(--accent, #a855f7)'
  const isCrushing = vibeKey === 'crushing'
  const isSlowDay = vibeKey === 'slow-day'

  const displayH = h % 12 || 12
  const displayM = String(m).padStart(2, '0')

  const CLOCK_COMMENTS = {
    'crushing': 'Peak hours. Nobody watches the clock except the clock.',
    'on-fire': 'Time has no meaning during an incident.',
    'slow-day': 'You have checked this three times in the last hour.',
    'in-flow': 'Do not look. It breaks the flow.',
    'after-hours': 'Still here? So am I. I am a clock. That is fine for me.',
  }

  return (
    <svg
      className="office-wall-clock"
      width="22" height="22" viewBox="0 0 22 22"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Wall clock showing ${displayH}:${displayM}`}
      role="img"
      style={{ position: 'absolute', left: '22%', top: '2.5%', zIndex: 1, pointerEvents: 'auto' }}
    >
      <title>{`${displayH}:${displayM} ${h >= 12 ? 'PM' : 'AM'} — ${CLOCK_COMMENTS[vibeKey] || CLOCK_COMMENTS['in-flow']}`}</title>
      {/* Clock face */}
      <circle cx="11" cy="11" r="9" fill={faceFill} stroke="var(--border)" strokeWidth="1" />

      {/* Hour hand */}
      <g style={{ transformOrigin: '11px 11px', transform: `rotate(${hourDeg}deg)` }}>
        <line x1="11" y1="11" x2="11" y2={11 - 4.5}
          stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Minute hand — slow-day gets a sluggish transition; crushing gets frantic tick */}
      <g style={{
        transformOrigin: '11px 11px',
        transform: `rotate(${minuteDeg}deg)`,
        transition: isSlowDay ? 'transform 2s ease' : 'none',
      }}>
        <g className={isCrushing ? 'clock-minute-hand--frantic' : ''}>
          <line x1="11" y1="11" x2="11" y2={11 - 6.5}
            stroke={minuteColor} strokeWidth="1" strokeLinecap="round" />
        </g>
      </g>

      {/* Center dot */}
      <circle cx="11" cy="11" r="1.2" fill="var(--text)" />
    </svg>
  )
}

const FULL_IDLE_MESSAGES = {
  crushing: 'Everyone earned their break',
  'on-fire': 'Ceasefire',
  'in-flow': 'The office breathes',
  'slow-day': 'Somewhere...',
  'after-hours': 'Nobody home',
}

const WORKER_ERROR_BUBBLES = {
  carlos: ['SIGKILL', 'db is lying to me', 'logs on fire', '500'],
  maya: ['every border is wrong', 'the prototype lied', 'my components are crying'],
  dave: ['git blame moment', 'npm ci again?', 'the build is sentient'],
  sofia: ['the spec never said this', 'REGRESSION', '5 new bugs found', 'who merged this'],
  luna: ['the deck is burning', 'every color is wrong', 'the brief changed again']
}

export default function Office({ workers = [], roster = [], isSyncing = false, activityEntries = [], onWorkerClick, vibeStreak = 0, doorEvent = null }) {
  const effectiveRoster = roster.length > 0 ? roster : DEFAULT_ROSTER
  const vibe = getTeamVibeKey(workers)
  const vibeHistoryRef = useRef([vibe])
  useEffect(() => {
    vibeHistoryRef.current = [...vibeHistoryRef.current.slice(-2), vibe]
  }, [vibe])

  const bloberto = useMemo(
    () => [...workers, ...effectiveRoster].find(w => w.id === 'bloberto') ?? DEFAULT_BLOBERTO,
    [workers, effectiveRoster],
  )

  const plantStageNames = ['seedling', 'sprout', 'small-plant', 'leafy', 'blooming']
  const plantStage = vibeStreak <= 1 ? 'seedling'
    : vibeStreak <= 3 ? 'sprout'
    : vibeStreak <= 5 ? 'small-plant'
    : vibeStreak <= 8 ? 'leafy'
    : 'blooming'
  const plantStageEmoji = { seedling: '🌱', sprout: '🌱', 'small-plant': '🌿', leafy: '🌿', blooming: '🌸' }
  const plantStageLabel = plantStage.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')

  // Ficus milestone burst
  const prevPlantStageRef = useRef(plantStage)
  const [plantMilestone, setPlantMilestone] = useState(false)
  const [plantToast, setPlantToast] = useState(false)
  useEffect(() => {
    if (prevPlantStageRef.current !== plantStage && plantStage !== 'seedling') {
      setPlantMilestone(true)
      setPlantToast(true)
      const t1 = setTimeout(() => setPlantMilestone(false), 1800)
      const t2 = setTimeout(() => setPlantToast(false), 3000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    prevPlantStageRef.current = plantStage
  }, [plantStage])

  const nonMgr        = workers.filter(w => w.id !== 'bloberto')
  const workingWorkers = nonMgr.filter(w => w.status === 'working')
  const workingIds     = new Set(workingWorkers.map(w => w.id))
  const idleWorkers    = nonMgr.filter(w => w.status === 'idle' && !workingIds.has(w.id))
  const meetingWorkers = idleWorkers.length >= 2 ? idleWorkers.slice(0, Math.min(idleWorkers.length, 3)) : []
  const standupActive  = workingWorkers.length >= 3 && (vibe === 'crushing' || vibe === 'in-flow')
  const standupWorkers = standupActive ? workingWorkers.slice(0, 4) : []
  const hasAnyError    = nonMgr.some(w => w.status === 'error')
  const isFullSync     = nonMgr.length > 0 && idleWorkers.length === 0 && workingWorkers.length === nonMgr.length
  const isFullIdle     = nonMgr.length > 0 && workingWorkers.length === 0 && idleWorkers.length === nonMgr.length
  const isLoneSurvivor = workingWorkers.length === 1 && idleWorkers.length === 0

  const avgProgress = Math.round(
    workingWorkers.reduce((s, w) => s + (w.progress || 0), 0) / Math.max(workingWorkers.length, 1)
  )

  const [showDone, setShowDone] = useState(false)
  const [pingedId, setPingedId] = useState(null)
  const [pingReaction, setPingReaction] = useState(null)
  const [vibeCaption, setVibeCaption] = useState(null)
  const isFirstVibe = useRef(true)
  const pingTimerRef = useRef(null)
  const pingReactionTimerRef = useRef(null)
  const prevVibeForNameplate = useRef(vibe)
  const nameplateRef = useRef(null)
  const lastHuddle = useRef({ names: [], endedAt: null })

  const handleCharClick = (worker) => {
    if (pingTimerRef.current) clearTimeout(pingTimerRef.current)
    setPingedId(worker.id)
    pingTimerRef.current = setTimeout(() => setPingedId(null), 700)
    const reaction = PING_REACTIONS[worker.id]
    if (reaction) {
      setPingReaction(reaction)
      clearTimeout(pingReactionTimerRef.current)
      pingReactionTimerRef.current = setTimeout(() => setPingReaction(null), 3000)
    }
    if (onWorkerClick) onWorkerClick(worker)
  }

  useEffect(() => {
    if (meetingWorkers.length >= 2) {
      lastHuddle.current = { names: meetingWorkers.map(w => w.name), endedAt: null }
    } else if (meetingWorkers.length === 0 && lastHuddle.current.names.length > 0 && lastHuddle.current.endedAt === null) {
      lastHuddle.current = { ...lastHuddle.current, endedAt: Date.now() }
    }
  }, [meetingWorkers])
  const prevAvgProgress = useRef(avgProgress)
  useEffect(() => {
    if (avgProgress === 100 && prevAvgProgress.current !== 100) {
      setShowDone(true)
      const t = setTimeout(() => setShowDone(false), 3000)
      return () => clearTimeout(t)
    }
    prevAvgProgress.current = avgProgress
  }, [avgProgress])

  useEffect(() => {
    if (prevVibeForNameplate.current !== vibe) {
      prevVibeForNameplate.current = vibe
      if (nameplateRef.current) {
        nameplateRef.current.classList.add('nameplate-pop')
        const t = setTimeout(() => nameplateRef.current?.classList.remove('nameplate-pop'), 600)
        return () => clearTimeout(t)
      }
    }
  }, [vibe])

  useEffect(() => {
    if (isFirstVibe.current) { isFirstVibe.current = false; return; }
    const CAPTIONS = {
      crushing: '\u{1F680} Team locked in',
      'on-fire': '\u{1F525} All hands',
      'in-flow': '\u26A1 In the zone',
      'slow-day': '\u2601\uFE0F Easy does it',
      'after-hours': '\u{1F319} Burning the midnight oil'
    };
    setVibeCaption(CAPTIONS[vibe] || null);
    const t = setTimeout(() => setVibeCaption(null), 2800);
    return () => { clearTimeout(t); };
  }, [vibe])

  // Roster members not currently active → ghost at empty desk
  const activeIds   = useMemo(() => new Set(workers.map(w => w.id || w.name?.toLowerCase().replace(/\s+/g, '-'))), [workers])
  const ghostRoster = effectiveRoster.filter(w => w.id !== 'bloberto' && !activeIds.has(w.id))

  // Assign working workers first, then idle workers, then ghosts, to desk slots
  const deskOccupants = useMemo(() => {
    const map = {}
    let i = 0
    for (const w of workingWorkers) {
      if (i < DESKS.length) map[DESKS[i++].id] = { worker: w, ghost: false, idle: false }
    }
    for (const w of idleWorkers) {
      if (i < DESKS.length) map[DESKS[i++].id] = { worker: w, ghost: false, idle: true }
    }
    for (const w of ghostRoster) {
      if (i < DESKS.length) map[DESKS[i++].id] = { worker: w, ghost: true, idle: false }
    }
    return map
  }, [workingWorkers, idleWorkers, ghostRoster])

  return (
    <div className="office-wrap">
      <span className="sr-only" aria-live="polite" aria-atomic="true">{pingReaction ?? ''}</span>
      {plantToast && (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface2)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '0.6rem 1.2rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 12px #22c55e55',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          🌱 The office ficus leveled up!
        </div>
      )}
      <div
        className="office-floor" data-vibe={vibe} data-has-error={hasAnyError || undefined} data-full-sync={isFullSync || undefined}
        role="region"
        aria-label="Virtual office visualization showing team members at desks"
      >

        <VibeShockwave vibeKey={vibe} />
        <div className="office-sign">🏢 Bloberto&apos;s HQ</div>
        {isFullSync && <div className="full-sync-banner" aria-label="Full team sync" aria-live="polite">⚡ Full sync</div>}
        {isFullIdle && <div className="full-idle-banner" aria-label="Full team idle" aria-live="polite">😌 {FULL_IDLE_MESSAGES[vibe] ?? 'The office breathes'}</div>}

        {/* Wall clock — top wall, between sign and manager area */}
        <WallClock vibeKey={vibe} />

        {/* Whiteboard — left wall, vibe-reactive */}
        <div
          key={vibe}
          className={`office-whiteboard${vibe === 'on-fire' ? ' office-whiteboard--urgent' : ''}${showDone ? ' office-whiteboard--done' : ''}`}
          aria-label={`Whiteboard: ${showDone ? 'DONE!' : (VIBE_WHITEBOARD[vibe] ?? VIBE_WHITEBOARD['in-flow'])}${workingWorkers.length > 0 ? ` ${avgProgress}%` : ''}`}
          role="img"
        >
          <span className={showDone ? 'wb-vibe-text wb-vibe-text--done' : 'wb-vibe-text'}>
            {showDone ? '✅ DONE!' : (VIBE_WHITEBOARD[vibe] ?? VIBE_WHITEBOARD['in-flow'])}
          </span>
          <div
            className="wb-progress-track"
            style={{ opacity: workingWorkers.length > 0 ? 1 : 0 }}
          >
            <div
              className={`wb-progress-fill${avgProgress === 100 ? ' wb-progress-fill--complete' : ''}`}
              style={{ width: avgProgress + '%' }}
            />
          </div>
          {workingWorkers.length > 0 && (
            <>
              <span className="wb-progress-pct">{avgProgress}%</span>
              <span className="wb-progress-label">avg task progress</span>
            </>
          )}
          <span className="wb-task-count" style={{ fontSize: '0.4rem', color: 'inherit', opacity: 0.7, whiteSpace: 'nowrap' }}>
            {workingWorkers.length} active · {nonMgr.length} total
          </span>
          <div className="wb-history-dots" aria-hidden="true">
            {vibeHistoryRef.current.slice(0, -1).map((v, i) => (
              <span key={i} className="wb-history-dot" data-vibe={v} />
            ))}
          </div>
          <pre className="wb-doodle" aria-hidden="true">
            {vibe === 'crushing' ? '╰(*°▽°*)╯' : vibe === 'on-fire' ? '(╯°□°)╯︵ ┻━┻' : vibe === 'in-flow' ? '(⌐■_■)' : vibe === 'slow-day' ? '(._. )' : '(∪.∪ )...zzz'}
          </pre>
        </div>
        <div className="mgr-desk" data-vibe={vibe}>
          <div className="mgr-desk__monitor" data-vibe={vibe} />
          <div key={vibe} ref={nameplateRef} className="mgr-desk__nameplate mgr-desk__nameplate--vibe">
            {BLOBERTO_TITLES[vibe] ?? 'CVO'}
          </div>
          {vibe === 'on-fire' && (
            <div className="mgr-desk__coffee" aria-hidden="true">☕</div>
          )}
          {vibe === 'crushing' && (
            <div className="mgr-desk__trophy" aria-hidden="true">🏆</div>
          )}
          {vibe === 'after-hours' && <div className="mgr-desk__candle" aria-hidden="true">🕯️</div>}
          <span className="sr-only">Manager desk</span>
        </div>

        {/* Regular desks */}
        {DESKS.map(desk => {
          const occ = deskOccupants[desk.id]
          const hasError = occ && !occ.ghost && occ.worker.status === 'error'
          const isWorking = occ && !occ.ghost && occ.worker.status === 'working'
          const isIdle = occ && occ.idle
          const idleMinutes = isIdle && occ.worker.updated_at
            ? Math.floor((Date.now() - new Date(occ.worker.updated_at).getTime()) / 60000)
            : 0
          const showAwaySign = isIdle && idleMinutes >= 10
          const isGhostDesk = isWorking && occ.worker.updated_at &&
            (Date.now() - new Date(occ.worker.updated_at).getTime()) > 900000
          const ghostDeskTitle = isGhostDesk ? (() => {
            const diff = Date.now() - new Date(occ.worker.updated_at).getTime()
            const mins = Math.floor(diff / 60000)
            const hours = Math.floor(diff / 3600000)
            return `Last seen: ${mins < 60 ? `${mins}m ago` : `${hours}h ago`}`
          })() : undefined
          let ghostDeskTier
          if (isGhostDesk) {
            const diffMs = Date.now() - new Date(occ.worker.updated_at).getTime()
            const ghostMins = Math.floor(diffMs / 60000)
            ghostDeskTier = ghostMins < 60 ? 'fresh' : ghostMins < 180 ? 'stale' : 'abandoned'
          }
          return (
            <div
              key={desk.id}
              className={`desk${!occ ? ' desk--vacant' : ''}${hasError ? ' desk--error' : ''}${isWorking ? ' desk--active' : ''}${isGhostDesk ? ' desk--ghost' : ''}${isIdle ? ' desk--idle' : ''}`}
              title={ghostDeskTitle}
              data-ghost-tier={isGhostDesk ? ghostDeskTier : undefined}
              style={{
                left: `${desk.left}%`,
                top: `${desk.top}%`,
                ...(isWorking ? { '--role-color': ROLE_COLORS[occ.worker.role] } : {}),
              }}
            >
              {/* Desk lamp — glows when occupied by a working character */}
              <svg className={`desk-lamp${isWorking ? ' desk-lamp--working' : isIdle ? ' desk-lamp--idle' : hasError ? ' desk-lamp--error' : ''}`} width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
                <ellipse cx="5" cy="4" rx="4.5" ry="2.5" fill={isWorking && occ ? (ROLE_COLORS[occ.worker.role] ?? '#fbbf24') : '#fbbf24'} />
                <line x1="5" y1="6.5" x2="5" y2="12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="5" cy="13" rx="3.5" ry="1.5" fill="#9ca3af" />
              </svg>
              {isWorking && (
                <div className='desk-keystrokes' aria-hidden='true'>
                  <span style={{animationDelay: '0s'}}>tap</span>
                  <span style={{animationDelay: '1.2s'}}>clack</span>
                  <span style={{animationDelay: '2.4s'}}>click</span>
                </div>
              )}
              {!occ ? (
                <>
                  <div className="desk__monitor desk__monitor--vacant" />
                  <div className="desk__nameplate desk__nameplate--vacant">📋 Vacant</div>
                  <div className="vacant-job-card" aria-hidden="true">
                    <strong>{(VACANT_ADS[vibe] ?? VACANT_ADS['in-flow']).title}</strong>
                    <p className="vacant-job-req">{(VACANT_ADS[vibe] ?? VACANT_ADS['in-flow']).req}</p>
                    <span className="vacant-job-cta">👀 Apply (just kidding)</span>
                  </div>
                </>
              ) : (
                <div className="desk-character">
                  <div className="desk__monitor" title={isWorking && occ.worker.task ? `${occ.worker.task}${typeof occ.worker.progress === 'number' ? ` — ${occ.worker.progress}%` : ''}` : undefined} />
                  {occ.ghost && (
                    <div className="desk-monitor-screen">
                      <div className="desk-monitor-screen--sleep" />
                    </div>
                  )}
                  {(isWorking || hasError) && (
                    <div className="desk-monitor-screen">
                      {DESK_SCREEN_SVG[hasError ? (occ.worker.id + '_error') : occ.worker.id] || DESK_SCREEN_SVG[occ.worker.id] || (
                        <svg width="100%" height="100%" viewBox="0 0 38 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <rect width="38" height="18" fill="#05050f" />
                          <rect x="2" y="3" width="28" height="2" rx="1" fill={ROLE_COLORS[occ.worker.role] ?? '#6b7280'} opacity="0.9" />
                          <rect x="2" y="8" width="20" height="2" rx="1" fill={ROLE_COLORS[occ.worker.role] ?? '#6b7280'} opacity="0.7" />
                          <rect x="2" y="13" width="24" height="2" rx="1" fill={ROLE_COLORS[occ.worker.role] ?? '#6b7280'} opacity="0.8" />
                        </svg>
                      )}
                    </div>
                  )}
                  {!occ.ghost && !occ.idle && (
                    <div
                      className={`desk__nameplate${isWorking ? ' desk__nameplate--active' : ''}${hasError ? ' desk__nameplate--error' : ''}`}
                    >
                      {occ.worker.name.split(' ')[0]}
                    </div>
                  )}
                  {occ.idle && (
                    <div className="desk__nameplate desk__nameplate--away">{WORKER_AWAY_DESK_LABELS[occ.worker.id] ?? '↪ away'}</div>
                  )}
                  {showAwaySign && (
                    <AwaySign workerId={occ.worker.id} idleMinutes={idleMinutes} />
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Conference table — lower center */}
        <ConferenceTable vibeKey={vibe} meetingWorkers={meetingWorkers} standupWorkers={standupWorkers} lastHuddle={lastHuddle} />

        {vibeCaption && <div className="vibe-caption" aria-live="polite">{vibeCaption}</div>}

        {/* Office aisle marker between desk rows */}
        <div className="office-aisle" aria-hidden="true">
          <span className="aisle-arrow">▸</span>
          <span className="aisle-arrow">◂</span>
        </div>

        {/* Coffee corner — top right */}
        <div className={`coffee-corner${idleWorkers.length >= 2 ? ' coffee-corner--chatting' : ''}${idleWorkers.length === 1 ? ' coffee-corner--solo' : ''}`} data-vibe={vibe}>
          {idleWorkers.length === 1 && (
            <div className="coffee-corner__solo-badge">
              <CharacterAvatar workerId={idleWorkers[0].id} role={idleWorkers[0].role} name={idleWorkers[0].name} size={14} emoji={idleWorkers[0].emoji} />
              <span className="coffee-corner__solo-label">☕ {idleWorkers[0].name.split(' ')[0]} refueling</span>
            </div>
          )}
          <div className="coffee-corner__chat-badge" aria-hidden="true">
            <svg className="coffee-corner__bubbles" width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="2" width="18" height="11" rx="4" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1"/>
              <polygon points="4,13 4,17 8,13" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1" strokeLinejoin="round"/>
              <rect x="9" y="0" width="18" height="11" rx="4" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1"/>
              <polygon points="23,11 23,15 19,11" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
            <span className="coffee-corner__chat-label">☕ {idleWorkers.length >= 2 ? idleWorkers.slice(0, 2).map(w => w.name.split(' ')[0]).join(' & ') : 'chatting'}</span>
          </div>
          <div className="coffee-corner__body">
            <div className="coffee-steam" aria-hidden="true">
              <span /><span /><span />
            </div>
            <span className="coffee-corner__emoji">☕</span>
          </div>
          <span className="coffee-corner__label">Coffee</span>
          <span className="sr-only">Coffee corner{idleWorkers.length >= 2 ? ' — people chatting' : ''}</span>
        </div>

        {/* Door — bottom center */}
        <div className={`office-door${doorEvent ? ` office-door--${doorEvent}` : ''}`} data-vibe={vibe}>
          {doorEvent === 'arrive' && <span className="office-door__notify-dot" aria-hidden="true" />}
          <span className="office-door__icon">{vibe === 'after-hours' ? '🔒' : doorEvent === 'arrive' ? '🚪✨' : '🚪'}</span>
          <span className="office-door__label">{DOOR_LABELS[vibe] ?? 'Entrance'}</span>
          <span className="sr-only">Exit and entrance</span>
        </div>

        {/* Bloberto — always at manager desk, always visible */}
        <Character worker={bloberto} left={46} top={4} variant="manager" managerVibe={vibe} vibeKey={vibe} isSyncing={isSyncing} pingReaction={null} />

        {/* Active workers at desks (working) or as ghosts (roster-only) — skip idle, they wander */}
        {DESKS.map((desk, i) => {
          const occ = deskOccupants[desk.id]
          if (!occ || occ.idle) return null
          return (
            <div key={occ.worker.id} style={{ position: 'absolute', left: `${desk.left + 7}%`, top: `${desk.top - 4}%` }}>
              <Character
                worker={occ.worker}
                variant={occ.ghost ? 'ghost' : 'working'}
                delay={i * 0.12}
                tooltip={occ.ghost ? occ.worker.role : occ.worker.task}
                activityEntries={occ.ghost ? activityEntries : []}
                onClick={!occ.ghost && onWorkerClick ? handleCharClick : undefined}
                isPinged={pingedId === occ.worker.id}
                pingReaction={pingedId === occ.worker.id && pingReaction ? pingReaction : null}
              />
              {isLoneSurvivor && !occ.ghost && (
                <div className='lone-survivor-label' style={{ fontSize: '0.45rem', opacity: 0.6, position: 'absolute', bottom: '-0.6rem', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.7)' }}>{LONE_SURVIVOR_WORKER_OVERRIDES[occ.worker.id]?.[vibe] ?? LONE_SURVIVOR_LABELS[vibe] ?? '🎯 solo run'}</div>
              )}
            </div>
          )
        })}

        {/* Idle workers wandering the lower floor */}
        {idleWorkers.map((w, i) => {
          const wIdx = (i % 4) + 1
          const WORKER_WANDER_TOOLTIPS = {
            carlos: ['☕ Checking server metrics', '📊 Reviewing the logs', '🔌 Debugging in his head'],
            maya: ['💜 Studying the color palette', '✏️ Sketching on a napkin', '🎨 Rearranging the mood board'],
            dave: ['🎧 Lost in a podcast', '⚙️ Thinking about pipelines', '🚀 Planning the next deploy'],
            sofia: ['🔍 Mentally writing test cases', '📋 Reviewing edge cases', '🧪 Pondering coverage gaps'],
            luna: ['🌙 Dreaming up the next feature', '✨ Staring at nothing productively', '📐 Mentally redesigning everything'],
          }
          const workerTooltips = WORKER_WANDER_TOOLTIPS[w.id]
          const tooltip = workerTooltips ? workerTooltips[i % workerTooltips.length] : {
            1: '☕ Heading to the coffee corner',
            2: '💬 Lingering by the whiteboard',
            3: '🪟 Staring out the window',
            4: '🧘 Taking a mindful moment',
          }[wIdx]
          return (
            <Character
              key={w.id}
              worker={w}
              variant="idle"
              wanderIdx={wIdx}
              delay={i * 0.2}
              tooltip={tooltip}
              onClick={onWorkerClick ? handleCharClick : undefined}
              isPinged={pingedId === w.id}
              pingReaction={pingedId === w.id && pingReaction ? pingReaction : null}
            />
          )
        })}

        {/* Office window — time-aware sky view */}
        <WindowElement vibe={vibe} />

        {/* Fern the office ficus — grows with vibeStreak */}
        <div
          className={`office-plant office-plant--ficus office-plant--${plantStage}`}
          data-milestone={plantMilestone || undefined}
          style={{ left: '87%', top: '72%' }}
          title={`Streak: ${vibeStreak} · ${plantStageLabel} ${plantStageEmoji[plantStage]}`}
          aria-hidden="true"
        >
          <div className="ficus-pot" />
          <div className="ficus-stem" />
          <div className="ficus-foliage" />
        </div>

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
        <div
          className={`vibe-weather vibe-weather--${vibe}`}
          aria-label={VIBE_WEATHER_LABELS[vibe] || vibe}
        >
          <span className="vibe-weather__icon" aria-hidden="true">{VIBE_WEATHER_ICONS[vibe]}</span>
          <span className="vibe-weather__label">{VIBE_WEATHER_LABELS[vibe]}</span>
        </div>
        <div className="office-plant office-plant--cactus" style={{ left: '92%', top: '30%' }}>
          <svg width="18" height="28" viewBox="0 0 18 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M 5 20 L 3 28 L 15 28 L 13 20 Z" fill="#c2410c" />
            <rect x="7" y="8" width="4" height="14" rx="2" fill="#22c55e" />
            <rect x="2" y="12" width="6" height="3" rx="1.5" fill="#16a34a" />
            <rect x="10" y="10" width="6" height="3" rx="1.5" fill="#16a34a" />
            <circle cx="9" cy="6" r="2" fill="#fbbf24" />
            <circle cx="9" cy="6" r="0.8" fill="#f59e0b" />
          </svg>
        </div>

        <div className="ambient-particles" aria-hidden="true">
          {[...Array(7)].map((_, i) => (
            <span key={i} className="ambient-particle" style={{
              '--i': i,
              left: `${10 + i * 12}%`,
              top: `${20 + (i * 17) % 60}%`,
              animationDelay: `${i * 3}s`
            }} />
          ))}
        </div>

      </div>
    </div>
  )
}
