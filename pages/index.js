import { useEffect, useState } from 'react'

export default function Home() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then(setData)
  }, [])

  return (
    <main style={{padding: '2rem', fontFamily: 'Inter, sans-serif'}}>
      <h1>HR - Next.js Fullstack Starter</h1>
      <p>This app contains a simple API route and a frontend that consumes it.</p>

      <section style={{marginTop: '1.5rem'}}>
        <h2>API Response</h2>
        {data ? (
          <pre style={{background: '#f6f8fa', padding: '1rem'}}>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>Loading...</p>
        )}
      </section>
    </main>
  )
}
