import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Layout({ children, title = 'Careers at Instaquirk' }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Join Instaquirk — we hire for craft, not buzzwords. A fair, story-driven hiring process." />
      </Head>

      <nav className={`nav-modern ${scrolled ? 'scrolled' : ''}`}>
        <div className="container-wide">
          <div className="nav-inner">
            <Link href="/" aria-label="Instaquirk home">
              <img src="/brand/wordmark-purple.png" alt="Instaquirk" className="nav-logo" />
            </Link>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <Link href="/careers" className="nav-link-anim">Open roles</Link>
              <Link href="/careers" className="nav-cta">Apply now</Link>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="footer-modern">
        <div className="container-wide">
          <img src="/brand/wordmark-white.png" alt="Instaquirk" className="ft-logo" />
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', maxWidth: 460 }}>
              We hire for craft and judgment — not buzzwords. We respect your time and tell you
              where you stand at every step.
            </p>
            <Link href="/careers" className="nav-cta">See open roles →</Link>
          </div>
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid #1e1633', fontSize: 13, color: '#64748b' }}>
            © {new Date().getFullYear()} Instaquirk. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
