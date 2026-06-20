import Link from 'next/link'
import Layout from '../../components/Layout'
import RoleIcon from '../../components/RoleIcon'
import { jobs, isJobLive } from '../../lib/db'
import { renderMarkdown } from '../../lib/md'

export default function JobDetail({ job }) {
  if (!job) {
    return (
      <Layout title="Role not found">
        <section className="hero-modern">
          <div className="hero-bg" />
          <div className="container-wide center">
            <h1 className="display hero-h1">Role not found</h1>
            <p className="hero-sub" style={{ margin: '0 auto' }}>This role may have been filled.</p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link href="/careers" className="btn-grad">See open roles →</Link>
            </div>
          </div>
        </section>
      </Layout>
    )
  }
  return (
    <Layout title={`${job.title} — Instaquirk`}>
      <section className="hero-modern" style={{ padding: '72px 0 36px' }}>
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="container">
          <Link href="/careers" className="nav-link-anim" style={{ fontSize: 14 }}>← All roles</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
            <div className="role-icon" style={{ width: 60, height: 60 }}><RoleIcon role={job.roleKey} size={30} /></div>
            <h1 className="display hero-h1" style={{ fontSize: 'clamp(30px,5vw,48px)', margin: 0 }}>{job.title}</h1>
          </div>
          <p className="hero-sub" style={{ marginTop: 14 }}>{job.hook}</p>
          <div className="badges mt">
            <span className="badge">{job.employmentType}</span>
            <span className="badge badge-grey">{job.locationMode}</span>
            {job.salaryRange ? <span className="badge badge-grey">{job.salaryRange}</span> : null}
          </div>
          <div className="hero-actions">
            <Link href={`/apply/${job.slug}`} className="btn-grad">Apply for this role →</Link>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 30 }}>
          <div className="card-modern markdown fade-up" style={{ padding: 32 }}>
            <div style={{ position: 'relative', zIndex: 1 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(job.descriptionMd) }} />
          </div>

          <div className="card-modern fade-up" style={{ marginTop: 18, padding: 28, background: 'var(--grad-soft)' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span className="eyebrow">How hiring works</span>
              <p style={{ margin: '6px 0 0', color: 'var(--fg)' }}>
                No endless interviews. You apply, and if it’s a fit we invite you to the{' '}
                <strong>Instaquirk Challenge</strong> — a short, story-driven round (~60–90 min) where
                you do a slice of the real job. Do well and you go straight to a final conversation.
              </p>
            </div>
          </div>

        <div className="center mt2">
          <Link href={`/apply/${job.slug}`} className="btn-grad">Apply for this role →</Link>
        </div>
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
        slug: job.slug, title: job.title, roleKey: job.roleKey || 'default', hook: job.hook || '',
        employmentType: job.employmentType || 'Full-time', locationMode: job.locationMode || 'Remote',
        salaryRange: job.salaryRange || '', descriptionMd: job.descriptionMd || '',
      },
    },
  }
}
