import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'applicants') {
    return (
      <svg {...common}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  if (name === 'jobs') {
    return (
      <svg {...common}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    )
  }
  return null
}

const NAV = [
  { key: 'applicants', label: 'Applicants', href: '/admin' },
  { key: 'jobs', label: 'Jobs', href: '/admin/jobs' },
]

export default function AdminLayout({ active, title, subtitle, actions, onSignOut, children }) {
  const [open, setOpen] = useState(false)

  function signOut() {
    fetch('/api/admin/logout', { method: 'POST' }).then(() => {
      if (onSignOut) onSignOut()
      else window.location.href = '/admin'
    })
  }

  return (
    <div className="admin-shell">
      <Head><title>{title ? `${title} — Instaquirk Admin` : 'Instaquirk Admin'}</title></Head>

      {open ? <div className="sidebar-scrim" onClick={() => setOpen(false)} /> : null}

      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="side-brand" style={{ paddingBottom: 6 }}>
          <img src="/brand/wordmark-white.png" alt="Instaquirk" style={{ height: 24, width: 'auto' }} />
        </div>
        <div className="side-section">Hiring</div>
        <nav className="side-nav">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`side-link ${active === item.key ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon name={item.key} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <div className="who">Signed in as admin</div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="sidebar-toggle" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
            <div>
              <h1 className="tb-title">{title}</h1>
              {subtitle ? <div className="tb-sub">{subtitle}</div> : null}
            </div>
          </div>
          {actions ? <div className="tb-actions">{actions}</div> : null}
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}
