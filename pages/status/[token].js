import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'

const STEPS = [
  { key: 'applied', label: 'Applied' },
  { key: 'screened', label: 'Under review' },
  { key: 'round_invited', label: 'Challenge invited' },
  { key: 'round_submitted', label: 'Challenge review' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
]

export default function Status() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [fill, setFill] = useState(0)

  useEffect(() => {
    const token = window.location.pathname.split('/').pop()
    fetch(`/api/status/${token}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => (ok ? setData(j) : setError(j.error || 'Not found')))
      .catch((e) => setError(e.message))
  }, [])

  const terminalReject = data && (data.stage === 'rejected' || data.stage === 'withdrawn')
  const currentIdx = data ? STEPS.findIndex((s) => s.key === data.stage) : -1

  // Animate the progress line filling up after data loads.
  useEffect(() => {
    if (currentIdx < 0 || terminalReject) return
    const pct = STEPS.length > 1 ? (currentIdx / (STEPS.length - 1)) * 100 : 0
    const t = setTimeout(() => setFill(pct), 250)
    return () => clearTimeout(t)
  }, [currentIdx, terminalReject])

  return (
    <Layout title="Application status — Instaquirk">
      <section className="hero-modern" style={{ padding: '70px 0 30px' }}>
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="container">
          <h1 className="display hero-h1" style={{ fontSize: 'clamp(28px,4.5vw,44px)' }}>
            Your <span className="gradient-text">application</span>
          </h1>
          {data ? <p className="hero-sub">{data.jobTitle}</p> : null}
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 40 }}>
        {error ? <div className="alert alert-error">{error}</div> : null}

        {data ? (
          <div className="card-modern" style={{ padding: 30 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>{data.fullName}</h2>
              <div style={{ marginBottom: 22 }}>
                <span className={`badge ${terminalReject ? 'badge-red' : 'badge-green'}`}>{data.stageLabel}</span>
              </div>

              {!terminalReject ? (
                <div className="stepper">
                  <div className="line" />
                  <div className="line-fill" style={{ height: `calc(${fill}% - 0px)` }} />
                  {STEPS.map((s, i) => {
                    const done = i < currentIdx
                    const active = i === currentIdx
                    return (
                      <div key={s.key} className={`node ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                        <div className="dot">{done ? '✓' : i + 1}</div>
                        <span style={{ fontWeight: active ? 700 : 500, color: active || done ? 'var(--fg)' : 'var(--muted)' }}>
                          {s.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="muted">
                  Thank you for applying. We’re not moving forward this time — but we genuinely
                  appreciate the effort you put in, and we’d welcome a future application.
                </p>
              )}
            </div>
          </div>
        ) : !error ? (
          <p className="muted">Loading…</p>
        ) : null}

        <div className="center mt2">
          <Link href="/careers" className="nav-link-anim">See other open roles →</Link>
        </div>
      </div>
    </Layout>
  )
}
