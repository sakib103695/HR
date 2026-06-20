import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/AdminLayout'

const ROLE_OPTIONS = [
  { key: 'wordpress', label: 'WordPress Developer' },
  { key: 'uiux', label: 'UI/UX Designer' },
  { key: 'smm', label: 'Social Media Manager' },
  { key: 'marketer', label: 'Performance Marketer' },
  { key: 'seo', label: 'SEO Specialist' },
]

const LIFECYCLE_BADGE = {
  Live: 'badge-green',
  Scheduled: 'badge-amber',
  Draft: 'badge-grey',
  Paused: 'badge-amber',
  Closed: 'badge-red',
  'Deadline passed': 'badge-red',
}

function lifecycleOf(job) {
  const now = Date.now()
  if (job.status === 'draft') return 'Draft'
  if (job.status === 'paused') return 'Paused'
  if (job.status === 'closed') return 'Closed'
  if (job.publishAt && new Date(job.publishAt).getTime() > now) return 'Scheduled'
  if (job.closeAt && new Date(job.closeAt).getTime() < now) return 'Deadline passed'
  return 'Live'
}

function toLocalInput(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

function fmt(d) {
  if (!d) return '—'
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

const EMPTY = {
  title: '', roleKey: 'wordpress', hook: '', employmentType: 'Full-time',
  locationMode: 'Remote', salaryRange: '', status: 'draft', publishAt: '', closeAt: '',
  roleAnswerLabel: '', descriptionMd: '',
}

export default function AdminJobs() {
  const [authed, setAuthed] = useState(null)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null) // null | {form fields, _id?}
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/admin/me').then((r) => r.json()).then((d) => setAuthed(d.authed))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/jobs')
    if (res.status === 401) { setAuthed(false); setLoading(false); return }
    const data = await res.json()
    setList(data.jobs || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (authed) load() }, [authed, load])

  function openNew() { setErr(''); setEditing({ ...EMPTY }) }
  function openEdit(job) {
    setErr('')
    setEditing({
      _id: job._id,
      title: job.title || '', roleKey: job.roleKey || 'wordpress', hook: job.hook || '',
      employmentType: job.employmentType || 'Full-time', locationMode: job.locationMode || 'Remote',
      salaryRange: job.salaryRange || '', status: job.status || 'draft',
      publishAt: toLocalInput(job.publishAt), closeAt: toLocalInput(job.closeAt),
      roleAnswerLabel: job.roleAnswerLabel || '', descriptionMd: job.descriptionMd || '',
      slug: job.slug,
    })
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true); setErr('')
    const isEdit = !!editing._id
    const url = isEdit ? `/api/admin/jobs/${editing._id}` : '/api/admin/jobs'
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(data.error || 'Save failed'); return }
    setEditing(null)
    load()
  }

  async function quickStatus(job, status) {
    await fetch(`/api/admin/jobs/${job._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function del(job) {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return
    let res = await fetch(`/api/admin/jobs/${job._id}`, { method: 'DELETE' })
    if (res.status === 409) {
      const d = await res.json()
      if (!confirm(`${d.error}\n\nDelete anyway? (applicants stay in the database)`)) return
      res = await fetch(`/api/admin/jobs/${job._id}?force=1`, { method: 'DELETE' })
    }
    if (res.ok) load()
    else alert('Delete failed')
  }

  if (authed === false) {
    return (
      <div style={{ padding: 40 }}>
        <p>Please <Link href="/admin">sign in</Link> to manage jobs.</p>
      </div>
    )
  }
  if (authed === null) return <div style={{ padding: 40 }} className="muted">Loading…</div>

  return (
    <AdminLayout
      active="jobs"
      title="Jobs"
      subtitle="Create roles and control when each one publishes and closes."
      actions={<button className="btn" onClick={openNew}>+ New job</button>}
      onSignOut={() => setAuthed(false)}
    >
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th><th>Role / rubric</th><th>State</th><th>Applicants</th>
                <th>Publishes</th><th>Closes</th><th style={{ minWidth: 230 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((job) => {
                const lc = lifecycleOf(job)
                return (
                  <tr key={job._id}>
                    <td>
                      <strong>{job.title}</strong>
                      <div className="muted" style={{ fontSize: 12 }}>/{job.slug}</div>
                    </td>
                    <td className="muted">{ROLE_OPTIONS.find((r) => r.key === job.roleKey)?.label || job.roleKey}</td>
                    <td><span className={`badge ${LIFECYCLE_BADGE[lc] || 'badge-grey'}`}>{lc}</span></td>
                    <td>{job.applicantCount}</td>
                    <td className="muted" style={{ fontSize: 13 }}>{fmt(job.publishAt)}</td>
                    <td className="muted" style={{ fontSize: 13 }}>{fmt(job.closeAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {job.status !== 'open' ? (
                          <button className="btn btn-sm" onClick={() => quickStatus(job, 'open')}>Publish</button>
                        ) : (
                          <button className="btn btn-sm btn-ghost" onClick={() => quickStatus(job, 'paused')}>Pause</button>
                        )}
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(job)}>Edit</button>
                        {lc === 'Live' ? (
                          <a className="btn btn-sm btn-ghost" href={`/careers/${job.slug}`} target="_blank" rel="noreferrer">View</a>
                        ) : null}
                        {job.status !== 'closed' ? (
                          <button className="btn btn-sm btn-ghost" onClick={() => quickStatus(job, 'closed')}>Close</button>
                        ) : null}
                        <button className="btn btn-sm btn-danger" onClick={() => del(job)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {list.length === 0 && !loading ? (
                <tr><td colSpan={7} className="center muted" style={{ padding: 30 }}>No jobs yet — create your first one.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

      {editing ? (
        <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.4)', zIndex: 50 }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save}
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 'min(640px, 96vw)', background: '#fff', overflowY: 'auto', padding: 24, boxShadow: '-8px 0 30px rgba(0,0,0,.1)' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)} style={{ float: 'right' }}>✕ Close</button>
            <h2 style={{ marginTop: 0 }}>{editing._id ? 'Edit job' : 'New job'}</h2>
            {err ? <div className="alert alert-error">{err}</div> : null}

            <div className="field">
              <label>Title *</label>
              <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
            </div>
            <div className="row2">
              <div className="field">
                <label>Role type / rubric * <span className="hint">(selects scoring & round)</span></label>
                <select value={editing.roleKey} onChange={(e) => setEditing({ ...editing, roleKey: e.target.value })}>
                  {ROLE_OPTIONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>State</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="draft">Draft (hidden)</option>
                  <option value="open">Open (live, respecting dates)</option>
                  <option value="paused">Paused (hidden)</option>
                  <option value="closed">Closed (hidden)</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>One-line hook</label>
              <input type="text" value={editing.hook} onChange={(e) => setEditing({ ...editing, hook: e.target.value })} placeholder="Build things people love." />
            </div>
            <div className="row2">
              <div className="field">
                <label>Employment type</label>
                <input type="text" value={editing.employmentType} onChange={(e) => setEditing({ ...editing, employmentType: e.target.value })} />
              </div>
              <div className="field">
                <label>Location</label>
                <select value={editing.locationMode} onChange={(e) => setEditing({ ...editing, locationMode: e.target.value })}>
                  <option>Remote</option><option>Hybrid</option><option>Onsite</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Salary range</label>
              <input type="text" value={editing.salaryRange} onChange={(e) => setEditing({ ...editing, salaryRange: e.target.value })} placeholder="Competitive (negotiable)" />
            </div>
            <div className="row2">
              <div className="field">
                <label>Publish at <span className="hint">(when it goes live; blank = immediately when Open)</span></label>
                <input type="datetime-local" value={editing.publishAt} onChange={(e) => setEditing({ ...editing, publishAt: e.target.value })} />
              </div>
              <div className="field">
                <label>Close at <span className="hint">(application deadline; blank = no deadline)</span></label>
                <input type="datetime-local" value={editing.closeAt} onChange={(e) => setEditing({ ...editing, closeAt: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Application question <span className="hint">(role-specific prompt on the apply form)</span></label>
              <input type="text" value={editing.roleAnswerLabel} onChange={(e) => setEditing({ ...editing, roleAnswerLabel: e.target.value })} placeholder="Tell us why you’re a great fit." />
            </div>
            <div className="field">
              <label>Description <span className="hint">(Markdown: ## headings, **bold**, - lists)</span></label>
              <textarea rows={10} value={editing.descriptionMd} onChange={(e) => setEditing({ ...editing, descriptionMd: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving…' : editing._id ? 'Save changes' : 'Create job'}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminLayout>
  )
}
