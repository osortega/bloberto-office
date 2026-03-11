export const ROLE_EMOJIS = {
  'Frontend Engineer': '🎨',
  'Backend Engineer': '⚙️',
  'DevOps Engineer': '🚀',
  'Designer': '✏️',
  'Manager': '🫠',
  'QA Engineer': '🔍',
  'Data Engineer': '📊',
  'Security Engineer': '🔒',
  'Creative Director': '🌙',
  'Other': '🤖',
}

export const ROLE_COLORS = {
  'Frontend Engineer': '#a78bfa',
  'Backend Engineer': '#38bdf8',
  'DevOps Engineer': '#fb923c',
  'Manager': '#c084fc',
  'QA Engineer': '#f43f5e',
  'Designer': '#34d399',
  'Data Engineer': '#facc15',
  'Security Engineer': '#94a3b8',
  'Creative Director': '#7c3aed',
  'Other': '#6b7280',
}

export const STATUS_LABELS = {
  working: 'Working',
  idle: 'Idle',
  done: 'Done',
  error: 'Error',
}

export const STATUS_EMOJIS = {
  working: '⚡',
  idle: '😴',
  done: '✅',
  error: '💀',
}

export const DEFAULT_ROSTER = [
  { id: 'carlos', name: 'Carlos', role: 'Backend Engineer' },
  { id: 'maya', name: 'Maya', role: 'Frontend Engineer' },
  { id: 'dave', name: 'Dave', role: 'DevOps Engineer' },
  { id: 'sofia', name: 'Sofia', role: 'QA Engineer' },
  { id: 'luna', name: 'Luna', role: 'Creative Director', emoji: '🌙' },
]

export const DEFAULT_BLOBERTO = {
  id: 'bloberto', name: 'Bloberto', role: 'Manager', status: 'working',
}

export const DESKS = [
  { id: 0, left: 7,  top: 28 },
  { id: 1, left: 32, top: 28 },
  { id: 2, left: 57, top: 28 },
  { id: 3, left: 7,  top: 50 },
  { id: 4, left: 32, top: 50 },
  { id: 5, left: 57, top: 50 },
]

export const TASK_TAG_DEFS = [
  { key: 'Bug',     emoji: '🔴' },
  { key: 'Ship',    emoji: '🚀' },
  { key: 'Design',  emoji: '🎨' },
  { key: 'QA',      emoji: '🔍' },
  { key: 'Refactor',emoji: '🔧' },
  { key: 'Plan',    emoji: '📋' },
]

export const VIBE_WHITEBOARD = {
  'crushing':    '🏆 SHIP IT',
  'on-fire':     '🚨 HELP',
  'in-flow':     '⚡ FLOW',
  'slow-day':    '🐢 BACKLOG',
  'after-hours': '🌙 ZZZ',
}
