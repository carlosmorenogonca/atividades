import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import Layout from '../components/Layout.jsx'
import Botao from '../components/Botao.jsx'

export default function TelaIdentificacao({ onIdentificado }) {
  const [registro, setRegistro] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!registro.trim()) return

    setErro('')
    setCarregando(true)

    const { data, error } = await supabase
      .from('funcionario')
      .select('cd_fun, nm_fun, master')
      .eq('cd_fun', registro.trim())
      .single()

    setCarregando(false)

    if (error || !data) {
      setErro('Funcionário não encontrado, procure a segurança do trabalho.')
      return
    }

    onIdentificado(data)
  }

  return (
    <Layout titulo="Identificação">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1a3a5c', marginBottom: '8px' }}>
            Número do Registro
          </label>
          <input
            type="text"
            value={registro}
            onChange={e => { setRegistro(e.target.value); setErro('') }}
            placeholder="Digite seu registro..."
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid ' + (erro ? '#c62828' : '#90caf9'),
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              color: '#1a3a5c',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { if (!erro) e.target.style.borderColor = '#1565c0' }}
            onBlur={e => { if (!erro) e.target.style.borderColor = '#90caf9' }}
          />
        </div>

        {erro && (
          <div style={{
            background: '#ffebee',
            border: '1px solid #ef9a9a',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#c62828',
            fontSize: '14px',
          }}>
            {erro}
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          <Botao type="submit" disabled={carregando || !registro.trim()} larguraTotal>
            {carregando ? 'Verificando...' : 'Entrar'}
          </Botao>
        </div>
      </form>
    </Layout>
  )
}
