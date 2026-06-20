import { useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { jobs, isJobLive } from '../../lib/db'

export default function Apply({ job }) {
  const [status, setStatus] = useState('idle') // idle | submitting | done | error
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  if (!job) {
    return (
      <Layout title="Role not found">
        <section className="hero-modern">
          <div className="hero-bg" />
          <div className="container center">
            <h1 className="display hero-h1">Role not found</h1>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link href="/careers" className="btn-grad">See open roles →</Link>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    const fd = new FormData(e.target)
    fd.set('jobSlug', job.slug)
    try {
      const res = await fetch('/api/applications', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setResult(data)
      setStatus('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <Layout title="Application received">
        <section className="hero-modern">
          <div className="hero-bg" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="container center" style={{ position: 'relative', zIndex: 1 }}>
            <div className="success-check">✓</div>
            <h1 className="display hero-h1" style={{ fontSize: 'clamp(30px,5vw,46px)', marginTop: 22 }}>
              You’re in. <span className="gradient-text">Nicely done.</span>
            </h1>
            <p className="hero-sub" style={{ margin: '0 auto' }}>
              Your application for <strong>{job.title}</strong> is submitted. We review every one and
              will email you about next steps. Bookmark your private status link below.
            </p>
            <div className="card-modern" style={{ maxWidth: 460, margin: '26px auto 0', textAlign: 'left' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="muted" style={{ fontSize: 13 }}>Your private status link</div>
                <Link href={`/status/${result.statusToken}`} className="btn-grad" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
                  Track my application →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout title={`Apply — ${job.title}`}>
      <section className="hero-modern" style={{ padding: '70px 0 30px' }}>
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="container">
          <Link href={`/careers/${job.slug}`} className="nav-link-anim" style={{ fontSize: 14 }}>← Back to role</Link>
          <h1 className="display hero-h1" style={{ fontSize: 'clamp(28px,4.5vw,44px)', marginTop: 14 }}>
            Apply: <span className="gradient-text">{job.title}</span>
          </h1>
          <p className="hero-sub">Takes about 3 minutes. Be specific — we read every word.</p>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 40 }}>
        {error ? <div className="alert alert-error">{error}</div> : null}
          <form className="card-modern field-anim fade-up" style={{ padding: 30 }} onSubmit={onSubmit}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="row2">
                <div className="field">
                  <label>Full name *</label>
                  <input type="text" name="fullName" required />
                </div>
                <div className="field">
                  <label>Email *</label>
                  <input type="email" name="email" required />
                </div>
              </div>
              <div className="row2">
                <div className="field">
                  <label>Contact number</label>
                  <input type="tel" name="phone" placeholder="+880…" />
                </div>
                <div className="field">
                  <label>Years of experience</label>
                  <input type="text" name="yearsExperience" placeholder="e.g. 3 or 2.5" />
                </div>
              </div>
              <div className="row2">
                <div className="field">
                  <label>Current organization</label>
                  <input type="text" name="currentOrg" placeholder="Company / Freelance / Student" />
                </div>
                <div className="field">
                  <label>Current position</label>
                  <input type="text" name="currentPosition" />
                </div>
              </div>
              <div className="field">
                <label>Expected salary <span className="hint">(monthly, your range is fine)</span></label>
                <input type="text" name="expectedSalary" placeholder="e.g. 35000 or 30-40k" />
              </div>
              <div className="field">
                <label>Portfolio / links <span className="hint">(separate multiple with spaces or commas)</span></label>
                <textarea name="portfolio" placeholder="https://… , https://github.com/…" />
              </div>
              <div className="field">
                <label>{job.roleAnswerLabel}</label>
                <textarea name="roleAnswer" rows={4} />
              </div>
              <div className="field">
                <label>Upload your CV * <span className="hint">(PDF, DOCX, PNG or JPG — max 12MB)</span></label>
                <input type="file" name="cv" accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" required />
              </div>
              <input type="hidden" name="source" value="direct" />

              <button className="btn-grad" type="submit" disabled={status === 'submitting'} style={{ marginTop: 6 }}>
                {status === 'submitting' ? 'Submitting…' : 'Submit application →'}
              </button>
            </div>
          </form>
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  const col = await jobs()
  const job = await col.findOne({ slug: params.slug })
  if (!job || !isJobLive(job)) return { props: { job: null } }
  return {
    props: {
      job: {
        slug: job.slug,
        title: job.title,
        roleAnswerLabel: job.roleAnswerLabel || 'Tell us why you’re a great fit for this role.',
      },
    },
  }
}
