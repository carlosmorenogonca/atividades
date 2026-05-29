export default function Botao({ children, onClick, type = 'button', variante = 'primario', disabled = false, larguraTotal = false }) {
  const estilos = {
    primario: {
      background: disabled ? '#90caf9' : '#1565c0',
      color: '#fff',
      border: 'none',
    },
    secundario: {
      background: '#fff',
      color: '#1565c0',
      border: '2px solid #1565c0',
    },
    perigo: {
      background: disabled ? '#ef9a9a' : '#c62828',
      color: '#fff',
      border: 'none',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...estilos[variante],
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 600,
        width: larguraTotal ? '100%' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  )
}
