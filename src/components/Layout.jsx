export default function Layout({ children, titulo }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f4fd 0%, #cce7f8 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
      }}>
        <div style={{
          background: '#1565c0',
          borderRadius: '12px 12px 0 0',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '26px' }}>📋</span>
          <div>
            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, letterSpacing: '0.3px' }}>
              Atividades
            </h1>
            {titulo && (
              <p style={{ color: '#90caf9', fontSize: '13px', marginTop: '2px' }}>{titulo}</p>
            )}
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '0 0 12px 12px',
          padding: '32px 28px',
          boxShadow: '0 4px 20px rgba(21,101,192,0.12)',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
