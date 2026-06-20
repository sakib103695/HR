import Link from 'next/link'
import Layout from '../../components/Layout'
import RoleIcon from '../../components/RoleIcon'
import { jobs, publicJobQuery } from '../../lib/db'

export default function Careers({ list }) {
  return (
    <Layout title="Open roles — Instaquirk">
      <section className="hero-modern" style={{ padding: '80px 0 40px' }}>
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="container-wide">
          <span className="hero-badge"><span className="dot" /> {list.length} open role{list.length === 1 ? '' : 's'}</span>
          <h1 className="display hero-h1" style={{ fontSize: 'clamp(34px,5vw,56px)' }}>
            Open <span className="gradient-text">roles</span>
          </h1>
          <p className="hero-sub">Find your fit. Every role runs through the same fair, story-driven process.</p>
        </div>
      </section>

      <section className="container-wide" style={{ paddingBottom: 40, marginTop: -10 }}>
        {list.length === 0 ? (
          <p className="muted">No open roles right now — check back soon.</p>
        ) : (
          <div className="job-grid">
            {list.map((j, i) => (
              <Link key={j.slug} href={`/careers/${j.slug}`} className="card-modern role-card fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'contents' }}>
                  <div className="role-icon"><RoleIcon role={j.roleKey} /></div>
                  <h3>{j.title}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: 14, flex: 1 }}>{j.hook}</p>
                  <div className="badges">
                    <span className="badge">{j.employmentType}</span>
                    <span className="badge badge-grey">{j.locationMode}</span>
                  </div>
                  <span className="role-arrow">View role <span>→</span></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}

export async function getServerSideProps() {
  const col = await jobs()
  const docs = await col.find(publicJobQuery(), { projection: { descriptionMd: 0 } }).sort({ createdAt: 1 }).toArray()
  const list = docs.map((j) => ({
    slug: j.slug, title: j.title, roleKey: j.roleKey || 'default', hook: j.hook || '',
    employmentType: j.employmentType || 'Full-time', locationMode: j.locationMode || 'Remote',
  }))
  return { props: { list } }
}
