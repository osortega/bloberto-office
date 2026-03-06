import './Office.css'

const DESK_POSITIONS = [
  { id: 'desk1', x: 150, y: 80 },
  { id: 'desk2', x: 350, y: 80 },
  { id: 'desk3', x: 150, y: 250 },
  { id: 'desk4', x: 350, y: 250 },
  { id: 'desk5', x: 550, y: 80 },
  { id: 'desk6', x: 550, y: 250 },
]

const MANAGER_DESK = { x: 350, y: 400 }

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

function getRoleEmoji(role) {
  return ROLE_EMOJIS[role] ?? '🤖'
}

function Character({ emoji, name, className, style }) {
  return (
    <div className={`character ${className}`} style={style}>
      <span className="emoji">{emoji}</span>
      <span className="name-label">{name}</span>
    </div>
  )
}

export default function Office({ workers = [], roster = [] }) {
  const workingWorkers = workers.filter((w) => w.status === 'working')
  const idleWorkers = workers.filter((w) => w.status === 'idle')

  // Assign working workers to desks
  const occupiedDeskIds = new Set()
  const workingAssignments = workingWorkers.map((worker, i) => {
    const desk = DESK_POSITIONS[i] ?? DESK_POSITIONS[i % DESK_POSITIONS.length]
    occupiedDeskIds.add(desk.id)
    return { worker, desk }
  })

  // Idle workers float around randomly (fixed offsets per index so they don't jump)
  const IDLE_SPOTS = [
    { x: 240, y: 170 },
    { x: 460, y: 170 },
    { x: 120, y: 340 },
    { x: 460, y: 340 },
    { x: 300, y: 330 },
    { x: 600, y: 330 },
  ]
  const idleAssignments = idleWorkers.map((worker, i) => ({
    worker,
    pos: IDLE_SPOTS[i % IDLE_SPOTS.length],
  }))

  // Ghost roster members sit at remaining desks
  const activeIds = new Set(workers.map((w) => w.id))
  const ghostRoster = roster.filter((r) => !activeIds.has(r.id))
  const remainingDesks = DESK_POSITIONS.filter((d) => !occupiedDeskIds.has(d.id))
  const ghostAssignments = ghostRoster.map((r, i) => ({
    worker: r,
    desk: remainingDesks[i % (remainingDesks.length || 1)] ?? DESK_POSITIONS[0],
  }))

  return (
    <div className="office-container">
      {/* Door */}
      <div className="door">
        <span className="door-label">EXIT</span>
      </div>

      {/* Regular desks */}
      {DESK_POSITIONS.map((d) => (
        <div
          key={d.id}
          className="desk"
          style={{ left: d.x, top: d.y }}
        >
          <div className="monitor" />
        </div>
      ))}

      {/* Manager desk */}
      <div
        className="manager-desk"
        style={{ left: MANAGER_DESK.x, top: MANAGER_DESK.y }}
      >
        <div className="monitor" />
      </div>

      {/* Coffee area */}
      <div className="coffee-area">
        ☕
        <span>coffee</span>
      </div>

      {/* Bloberto — always at manager desk */}
      <Character
        emoji="🫠"
        name="Bloberto"
        className="manager"
        style={{
          left: MANAGER_DESK.x + 30,
          top: MANAGER_DESK.y - 50,
        }}
      />

      {/* Working workers at desks */}
      {workingAssignments.map(({ worker, desk }) => (
        <Character
          key={worker.id}
          emoji={getRoleEmoji(worker.role)}
          name={worker.name}
          className="working"
          style={{ left: desk.x + 20, top: desk.y - 50 }}
        />
      ))}

      {/* Idle workers floating */}
      {idleAssignments.map(({ worker, pos }) => (
        <Character
          key={worker.id}
          emoji={getRoleEmoji(worker.role)}
          name={worker.name}
          className="idle"
          style={{ left: pos.x, top: pos.y }}
        />
      ))}

      {/* Ghost roster members */}
      {ghostAssignments.map(({ worker, desk }) => (
        <Character
          key={worker.id}
          emoji={getRoleEmoji(worker.role)}
          name={worker.name}
          className="ghost"
          style={{ left: desk.x + 20, top: desk.y - 50 }}
        />
      ))}
    </div>
  )
}
