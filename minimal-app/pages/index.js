export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <h1>RuneHealth App</h1>
      <p>This subdomain hosts the RuneHealth application.</p>
      <p>The hostname is: {typeof window !== 'undefined' ? window.location.hostname : 'server-side'}</p>
      <p>
        <a href="https://rune.health" style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          background: '#0070f3', 
          color: 'white', 
          borderRadius: '5px', 
          textDecoration: 'none' 
        }}>
          Go to Main Website
        </a>
      </p>
    </div>
  )
} 