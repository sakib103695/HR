import { useEffect, useRef, useState } from 'react'

// Wraps children and fades/slides them in when scrolled into view.
export default function Reveal({ children, delay = 0, scale = false, as = 'div', className = '', style = {}, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const base = scale ? 'reveal-scale' : 'reveal'
  const Tag = as
  return (
    <Tag
      ref={ref}
      className={`${base} ${shown ? 'in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
