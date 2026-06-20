import { useState } from 'react'

const COLUMNS = [
  { key: 'applied', label: 'Applied' },
  { key: 'screened', label: 'Screened' },
  { key: 'round_invited', label: 'Round invited' },
  { key: 'round_submitted', label: 'Round submitted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
]

const FORWARD = {
  applied: 'screened', screened: 'round_invited', round_invited: 'round_submitted',
  round_submitted: 'interview', interview: 'offer', offer: 'hired',
}

function scoreColor(s) {
  if (s >= 70) return { background: '#dcfce7', color: '#166534' }
  if (s >= 50) return { background: '#fef9c3', color: '#854d0e' }
  if (s >= 40) return { background: '#ffedd5', color: '#9a3412' }
  return { background: '#fee2e2', color: '#991b1b' }
}

export default function KanbanBoard({ applications, onMove, onAdvance, onReject, onOpen }) {
  const [dragId, setDragId] = useState(null)
  const [overCol, setOverCol] = useState(null)

  const grouped = {}
  for (const c of COLUMNS) grouped[c.key] = []
  for (const a of applications) {
    if (grouped[a.stage]) grouped[a.stage].push(a)
    else grouped[a.stage] = [a] // withdrawn or unknown -> own bucket (not shown)
  }

  function onDrop(e, colKey) {
    e.preventDefault()
    setOverCol(null)
    const id = e.dataTransfer.getData('text/plain') || dragId
    setDragId(null)
    if (!id) return
    const app = applications.find((a) => a._id === id)
    if (app && app.stage !== colKey) onMove(id, colKey)
  }

  return (
    <div className="kanban">
      {COLUMNS.map((col) => {
        const cards = grouped[col.key] || []
        return (
          <div
            key={col.key}
            className={`kanban-col ${overCol === col.key ? 'drop-target' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col.key) }}
            onDragLeave={(e) => { if (e.currentTarget === e.target) setOverCol(null) }}
            onDrop={(e) => onDrop(e, col.key)}
          >
            <div className="kanban-col-head">
              <span>{col.label}</span>
              <span className="n">{cards.length}</span>
            </div>
            <div className="kanban-body">
              {cards.map((a) => (
                <div
                  key={a._id}
                  className={`kanban-card ${dragId === a._id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData('text/plain', a._id); e.dataTransfer.effectAllowed = 'move'; setDragId(a._id) }}
                  onDragEnd={() => { setDragId(null); setOverCol(null) }}
                >
                  <div className="kc-top">
                    <span className="kc-name" onClick={() => onOpen(a)}>{a.fullName}</span>
                    <span className="score-pill" style={{ ...scoreColor(a.autoScore), fontSize: 12, minWidth: 34, padding: '1px 6px' }}>{a.autoScore}</span>
                  </div>
                  <div className="kc-meta">{a.jobTitle}</div>
                  <div className="kc-meta">{a.expectedSalaryRaw || a.expectedSalaryAmount || '—'} · {a.yearsExperience}y</div>
                  <div className="kc-actions">
                    {FORWARD[a.stage] ? (
                      <button className="btn btn-sm" onClick={() => onAdvance(a._id)} title={`Move to ${FORWARD[a.stage]}`}>→</button>
                    ) : null}
                    {!['rejected', 'hired', 'withdrawn'].includes(a.stage) ? (
                      <button className="btn btn-sm btn-danger" onClick={() => onReject(a._id)}>Reject</button>
                    ) : null}
                  </div>
                </div>
              ))}
              {cards.length === 0 ? <div className="kanban-empty">Drop here</div> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
