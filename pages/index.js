import Link from 'next/link'
import Layout from '../components/Layout'
import Reveal from '../components/Reveal'
import RoleIcon from '../components/RoleIcon'
import { jobs, publicJobQuery } from '../lib/db'

const STEPS = [
  { n: 1, title: 'Apply in 3 minutes', desc: 'A short form and your CV. Be specific — we read every word.' },
  { n: 2, title: 'Play the Challenge', desc: 'If it’s a fit, you get a ~60–90 min story-driven round where you do a slice of the real job.' },
  { n: 3, title: 'Meet the team', desc: 'Do well and you skip straight to a final conversation. No endless interviews.' },
]

export default function Home({ roles }) {
  return (
    <Layout title="Instaquirk — Careers">
      {/* ---------- HERO ---------- */}
      <section className="hero-modern">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="container-wide">
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: 40, alignItems: 'center' }} className="hero-cols">
            <div>
              <span className="hero-badge"><span className="dot" /> We’re hiring across 5 teams</span>
              <h1 className="display hero-h1">
                Build things people<br />
                <span className="gradient-text">actually love using.</span>
              </h1>
              <p className="hero-sub">
                Instaquirk is a small, fast team that ships, measures, and iterates. We hire for
                craft and judgment — not buzzwords. So you get to <strong>show your skills</strong>,
                not just list them.
              </p>
              <div className="hero-actions">
                <Link href="/careers" className="btn-grad">Explore open roles →</Link>
                <a href="#how" className="btn-outline-modern">How hiring works</a>
              </div>
            </div>
            <div className="hero-art" style={{ textAlign: 'center' }}>
              <img src="/brand/icon.png" alt="" className="hero-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <div className="marquee" style={{ padding: '8px 0 4px' }}>
        <div className="marquee-track">
          {['WordPress Developer', 'UI/UX Designer', 'Social Media Manager', 'Performance Marketer', 'SEO Specialist', 'Remote-first', 'Craft over buzzwords'].concat(
            ['WordPress Developer', 'UI/UX Designer', 'Social Media Manager', 'Performance Marketer', 'SEO Specialist', 'Remote-first', 'Craft over buzzwords']
          ).map((t, i) => (
            <span key={i}>{t} •</span>
          ))}
        </div>
      </div>

      {/* ---------- OPEN ROLES ---------- */}
      <section className="container-wide" style={{ padding: '64px 20px 8px' }}>
        <Reveal>
          <span className="eyebrow">Open positions</span>
          <h2 className="section-h">Find your seat on the team</h2>
          <p className="muted" style={{ maxWidth: 560, marginTop: 0 }}>Every role runs through the same fair, story-driven process.</p>
        </Reveal>

        {roles.length === 0 ? (
          <p className="muted mt2">No open roles right now — check back soon.</p>
        ) : (
          <div className="job-grid" style={{ marginTop: 28 }}>
            {roles.map((r, i) => (
              <Reveal key={r.slug} delay={i * 80} scale>
                <Link href={`/careers/${r.slug}`} className="card-modern role-card">
                  <div style={{ position: 'relative', zIndex: 1, display: 'contents' }}>
                    <div className="role-icon"><RoleIcon role={r.roleKey} /></div>
                    <h3>{r.title}</h3>
                    <p className="muted" style={{ margin: 0, fontSize: 14, flex: 1 }}>{r.hook}</p>
                    <div className="badges">
                      <span className="badge">{r.employmentType}</span>
                      <span className="badge badge-grey">{r.locationMode}</span>
                    </div>
                    <span className="role-arrow">View role <span>→</span></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="container-wide" style={{ padding: '72px 20px 8px' }}>
        <Reveal>
          <span className="eyebrow">The process</span>
          <h2 className="section-h">No endless interviews</h2>
          <p className="muted" style={{ maxWidth: 580, marginTop: 0 }}>
            We respect your time. Three steps, and you always know where you stand.
          </p>
        </Reveal>
        <div className="steps" style={{ marginTop: 28 }}>
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="step">
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- WHY DIFFERENT ---------- */}
      <section className="container-wide" style={{ padding: '72px 20px 8px' }}>
        <Reveal scale>
          <div className="card-modern" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }} className="why-cols">
              <div style={{ padding: 40, position: 'relative', zIndex: 1 }}>
                <span className="eyebrow">The Instaquirk Challenge</span>
                <h2 className="section-h" style={{ fontSize: 28 }}>A round that’s actually a bit fun</h2>
                <p className="muted">
                  Instead of a dry test, you step into a short story where you do real work for the
                  role — fix a bug, redesign a screen, plan a campaign. It’s engaging, it’s fair, and
                  it lets your skills speak for themselves.
                </p>
                <ul style={{ paddingLeft: 18, color: 'var(--muted)', margin: '14px 0' }}>
                  <li>Do a real slice of the job, not trivia</li>
                  <li>Resume any time — your progress is saved</li>
                  <li>Strong work goes straight to a final chat</li>
                </ul>
                <Link href="/careers" className="btn-grad" style={{ marginTop: 8 }}>Start your application →</Link>
              </div>
              <div style={{ background: 'var(--grad)', backgroundSize: '200% 200%', animation: 'gradientShift 10s ease infinite', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
                <div className="orb" style={{ width: 200, height: 200, background: '#fff', opacity: .12, filter: 'blur(40px)' }} />
                <img src="/brand/icon.png" alt="" style={{ width: 150, position: 'relative', zIndex: 1, animation: 'floaty 6s ease-in-out infinite', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.25))' }} />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- CTA BAND ---------- */}
      <section className="container-wide" style={{ padding: '72px 20px 20px' }}>
        <Reveal>
          <div className="cta-band">
            <div className="orb" style={{ width: 280, height: 280, background: '#fff', top: -100, right: -60 }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
              <h2 className="display" style={{ fontSize: 'clamp(26px,4vw,40px)', margin: '0 0 12px' }}>Ready to show what you can do?</h2>
              <p style={{ opacity: .9, fontSize: 18, margin: '0 0 26px' }}>Pick a role and apply in a few minutes. We’ll take it from there.</p>
              <Link href="/careers" className="btn-outline-modern" style={{ background: '#fff' }}>Browse open roles →</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </Layout>
  )
}

export async function getServerSideProps() {
  const col = await jobs()
  const docs = await col.find(publicJobQuery(), { projection: { descriptionMd: 0 } }).sort({ createdAt: 1 }).toArray()
  const roles = docs.map((j) => ({
    slug: j.slug, title: j.title, roleKey: j.roleKey || 'default', hook: j.hook || '',
    employmentType: j.employmentType || 'Full-time', locationMode: j.locationMode || 'Remote',
  }))
  return { props: { roles } }
}
