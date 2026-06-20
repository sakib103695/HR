import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/AdminLayout'
import KanbanBoard from '../../components/KanbanBoard'

const PAGE_SIZES = [10, 25, 50, 100]

const STAGES = [
  { key: '', label: 'All stages' },
  { key: 'applied', label: 'Applied' },
  { key: 'screened', label: 'Screened' },
  { key: 'round_invited', label: 'Round invited' },
  { key: 'round_submitted', label: 'Round submitted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
]

const NEXT_LABEL = {
  applied: 'Screen →',
  screened: 'Invite to round →',
  round_invited: 'Mark submitted →',
  round_submitted: 'To interview →',
  interview: 'To offer →',
  offer: 'Mark hired →',
}

function scoreColor(s) {
  if (s >= 70) return { background: '#dcfce7', color: '#166534' }
  if (s >= 50) return { background: '#fef9c3', color: '#854d0e' }
  if (s >= 40) return { background: '#ffedd5', color: '#9a3412' }
  return { background: '#fee2e2', color: '#991b1b' }
}

export default function Admin() {
  const [authed, setAuthed] = useState(null)
  const [emailInput, setEmailInput] = useState('')
  const [pw, setPw] = useState('')
  const [loginErr, setLoginErr] = useState('')

  const [job, setJob] = useState('')
  const [stage, setStage] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('score')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [jobOptions, setJobOptions] = useState([{ slug: '', title: 'All roles' }])
  const [view, setView] = useState('table') // 'table' | 'board'
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetch('/api/admin/me').then((r) => r.json()).then((d) => setAuthed(d.authed))
  }, [])

  useEffect(() => {
    if (!authed) return
    fetch('/api/admin/jobs')
      .then((r) => (r.ok ? r.json() : { jobs: [] }))
      .then((d) => setJobOptions([{ slug: '', title: 'All roles' }, ...(d.jobs || []).map((j) => ({ slug: j.slug, title: j.title }))]))
  }, [authed])

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (job) params.set('job', job)
    if (q) params.set('q', q)
    if (sort) params.set('sort', sort)
    if (view === 'board') {
      // Board groups by stage itself, so fetch across all stages.
      params.set('pageSize', '500')
    } else {
      if (stage) params.set('stage', stage)
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
    }
    const res = await fetch('/api/admin/applications?' + params.toString())
    if (res.status === 401) {
      setAuthed(false)
      setLoading(false)
      return
    }
    const data = await res.json()
    setRows(data.applications || [])
    setTotal(data.total || 0)
    setTotalPages(data.totalPages || 1)
    setLoading(false)
  }, [job, stage, q, sort, view, page, pageSize])

  useEffect(() => {
    if (authed) load()
  }, [authed, job, stage, sort, view, page, pageSize, load])

  // Reset to page 1 when filters/view change.
  useEffect(() => { setPage(1) }, [job, stage, q, sort, view, pageSize])

  async function login(e) {
    e.preventDefault()
    setLoginErr('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, password: pw }),
    })
    if (res.ok) setAuthed(true)
    else setLoginErr('Incorrect email or password')
  }

  async function act(id, action) {
    if (action === 'reject' && !confirm('Reject this candidate?')) return
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      setDetail(null)
      load()
    } else {
      const d = await res.json()
      alert(d.error || 'Action failed')
    }
  }

  async function moveTo(id, toStage) {
    // Optimistic: update the card's stage locally, then persist.
    setRows((prev) => prev.map((r) => (r._id === id ? { ...r, stage: toStage } : r)))
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', toStage }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      alert(d.error || 'Move failed')
      load()
    }
  }

  function exportXlsx() {
    const params = new URLSearchParams()
    if (job) params.set('job', job)
    if (stage) params.set('stage', stage)
    window.location.href = '/api/admin/export?' + params.toString()
  }

  // ---- Login screen ----
  if (authed === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Head><title>Admin — Instaquirk</title></Head>
        <form onSubmit={login} className="card" style={{ width: 360 }}>
          <div className="brand" style={{ marginBottom: 6 }}>Insta<span style={{ color: 'var(--brand)' }}>quirk</span> Admin</div>
          <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>Sign in to manage applicants.</p>
          {loginErr ? <div className="alert alert-error">{loginErr}</div> : null}
          <div className="field">
            <label>Email</label>
            <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} autoFocus placeholder="you@email.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          </div>
          <button className="btn" style={{ width: '100%' }}>Sign in</button>
        </form>
      </div>
    )
  }
  if (authed === null) {
    return <div style={{ padding: 40 }} className="muted">Loading…</div>
  }

  // ---- Dashboard ----
  return (
    <AdminLayout active="applicants" title="Applicants" subtitle="Review, score, and move candidates through the pipeline." onSignOut={() => setAuthed(false)}>
        <div className="toolbar" style={{ marginTop: 0 }}>
          <div className="viewtoggle">
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
            <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>Board</button>
          </div>
          <select value={job} onChange={(e) => setJob(e.target.value)} style={{ width: 200 }}>
            {jobOptions.map((j) => <option key={j.slug} value={j.slug}>{j.title}</option>)}
          </select>
          {view === 'table' ? (
            <select value={stage} onChange={(e) => setStage(e.target.value)} style={{ width: 160 }}>
              {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          ) : null}
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 150 }}>
            <option value="score">Sort: Score</option>
            <option value="recent">Sort: Most recent</option>
          </select>
          <form onSubmit={(e) => { e.preventDefault(); load() }} style={{ flex: 1, minWidth: 160 }}>
            <input type="text" placeholder="Search name, email, CV text…" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
          <button className="btn btn-sm" onClick={exportXlsx}>⬇ Export XLSX</button>
        </div>

        <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
          {loading ? 'Loading…' : `${total} applicant${total === 1 ? '' : 's'}${view === 'board' && total > 500 ? ' (showing first 500 on board)' : ''}`}
        </div>

        {view === 'board' ? (
          <KanbanBoard
            applications={rows}
            onMove={moveTo}
            onAdvance={(id) => act(id, 'advance')}
            onReject={(id) => act(id, 'reject')}
            onOpen={(a) => setDetail(a)}
          />
        ) : (
        <>
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Score</th><th>Depth</th><th>Folio</th><th>Exp</th>
                <th>Salary</th><th>Stage</th><th>CV</th><th style={{ minWidth: 240 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const d = (n) => (a.scoreBreakdown || []).find((x) => x.dimension === n)?.points ?? '–'
                return (
                  <tr key={a._id}>
                    <td className="muted">{a.rank}</td>
                    <td>
                      <button onClick={() => setDetail(a)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--brand)', fontWeight: 600, fontSize: 14 }}>
                        {a.fullName}
                      </button>
                      <div className="muted" style={{ fontSize: 12 }}>{a.email}</div>
                    </td>
                    <td><span className="score-pill" style={scoreColor(a.autoScore)}>{a.autoScore}</span></td>
                    <td className="muted">{d('technical_depth')}</td>
                    <td className="muted">{d('portfolio')}</td>
                    <td className="muted">{d('experience')}</td>
                    <td className="muted">{a.expectedSalaryRaw || a.expectedSalaryAmount || '–'}</td>
                    <td><span className="badge badge-grey">{a.stage}</span></td>
                    <td>{a.cvFileId ? <a href={`/api/files/${a.cvFileId}`} target="_blank" rel="noreferrer">view</a> : <span className="muted">–</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {NEXT_LABEL[a.stage] ? (
                          <button className="btn btn-sm" onClick={() => act(a._id, 'advance')}>{NEXT_LABEL[a.stage]}</button>
                        ) : null}
                        {!['rejected', 'hired', 'withdrawn'].includes(a.stage) ? (
                          <button className="btn btn-sm btn-danger" onClick={() => act(a._id, 'reject')}>Reject</button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && !loading ? (
                <tr><td colSpan={10} className="center muted" style={{ padding: 30 }}>No applicants match these filters.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <div className="muted" style={{ fontSize: 13 }}>
            {total === 0
              ? 'No results'
              : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
            &nbsp;·&nbsp;
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{ width: 'auto', display: 'inline-block', padding: '4px 8px', fontSize: 13 }}
            >
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
          <div className="pages">
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(1)}>« First</button>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Prev</button>
            <span className="muted" style={{ fontSize: 13, padding: '0 6px' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next ›</button>
            <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>Last »</button>
          </div>
        </div>
        </>
        )}

      {detail ? <DetailDrawer a={detail} onClose={() => setDetail(null)} onAct={act} /> : null}
    </AdminLayout>
  )
}

function DetailDrawer({ a, onClose, onAct }) {
  const ev = a.scoreBreakdown || []
  const get = (n) => ev.find((x) => x.dimension === n)
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 'min(560px, 92vw)', background: '#fff', overflowY: 'auto', padding: 24, boxShadow: '-8px 0 30px rgba(0,0,0,.1)' }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ float: 'right' }}>✕ Close</button>
        <div className="muted" style={{ fontSize: 13 }}>{a.jobTitle}</div>
        <h2 style={{ margin: '4px 0' }}>{a.fullName}</h2>
        <div className="badges" style={{ marginBottom: 14 }}>
          <span className="score-pill" style={scoreColor(a.autoScore)}>{a.autoScore}/100</span>
          <span className="badge badge-grey">{a.stage}</span>
        </div>

        <table className="table" style={{ marginBottom: 16 }}>
          <tbody>
            <tr><th>Email</th><td>{a.email}</td></tr>
            <tr><th>Phone</th><td>{a.phone || '–'}</td></tr>
            <tr><th>Experience</th><td>{a.yearsExperience} yrs</td></tr>
            <tr><th>Expected salary</th><td>{a.expectedSalaryRaw || a.expectedSalaryAmount || '–'}</td></tr>
            <tr><th>Current</th><td>{a.currentPosition || '–'} {a.currentOrg ? `· ${a.currentOrg}` : ''}</td></tr>
            <tr><th>Applied</th><td>{a.createdAt ? new Date(a.createdAt).toLocaleString() : '–'}</td></tr>
          </tbody>
        </table>

        {a.portfolioUrls && a.portfolioUrls.length ? (
          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 14 }}>Portfolio</strong>
            <ul style={{ margin: '6px 0', paddingLeft: 18 }}>
              {a.portfolioUrls.map((u, i) => <li key={i}><a href={u.startsWith('http') ? u : `https://${u}`} target="_blank" rel="noreferrer">{u}</a></li>)}
            </ul>
          </div>
        ) : null}

        {a.roleAnswer ? (
          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 14 }}>Role answer</strong>
            <p className="muted" style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{a.roleAnswer}</p>
          </div>
        ) : null}

        <strong style={{ fontSize: 14 }}>Why this score</strong>
        <div className="card" style={{ marginTop: 8, background: '#f8fafc' }}>
          {['technical_depth', 'portfolio', 'experience'].map((dim) => {
            const g = get(dim)
            if (!g) return null
            return (
              <div key={dim} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                  <span>{dim.replace('_', ' ')}</span><span>{g.points} / {g.max}</span>
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {dim === 'technical_depth' && (g.evidence.heavy?.length ? `Strong: ${g.evidence.heavy.join(', ')}` : 'No strong technical signals found.')}
                  {dim === 'portfolio' && `${g.evidence.uniqueUrls} links · signals: ${(g.evidence.signals || []).join(', ') || 'none'}`}
                  {dim === 'experience' && `${g.evidence.years} years`}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {a.cvFileId ? <a className="btn btn-ghost btn-sm" href={`/api/files/${a.cvFileId}`} target="_blank" rel="noreferrer">View CV</a> : null}
          {NEXT_LABEL[a.stage] ? <button className="btn btn-sm" onClick={() => onAct(a._id, 'advance')}>{NEXT_LABEL[a.stage]}</button> : null}
          {!['rejected', 'hired', 'withdrawn'].includes(a.stage) ? <button className="btn btn-sm btn-danger" onClick={() => onAct(a._id, 'reject')}>Reject</button> : null}
        </div>
      </div>
    </div>
  )
}
