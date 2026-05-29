import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import Botao from '../components/Botao.jsx'

function formatarData(dtStr) {
  if (!dtStr) return ''
  const [ano, mes, dia] = dtStr.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarHora(hrStr) {
  if (!hrStr) return ''
  return hrStr.substring(0, 5)
}

export default function TelaConsulta({ funcionario, onVoltar }) {
  const [registros, setRegistros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [selecionados, setSelecionados] = useState([])
  const [atualizando, setAtualizando] = useState(false)
  const [sucesso, setSucesso] = useState('')

  // Filtros
  const [filtroRegistro, setFiltroRegistro] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [filtroHorario, setFiltroHorario] = useState('')

  useEffect(() => {
    carregarRegistros()
  }, [])

  async function carregarRegistros() {
    setCarregando(true)
    setSelecionados([])
    const { data } = await supabase
      .from('tarefa_fun')
      .select(`
        cd_fun,
        horario,
        funcionario:cd_fun ( nm_fun ),
        tarefa:cd_tarefa ( cd_tarefa, nm_tarefa, dt_tarefa )
      `)
      .order('cd_fun')

    setRegistros(data || [])
    setCarregando(false)
  }

  function toggleSelecionado(key) {
    setSelecionados(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  function getKey(r) {
    return `${r.cd_fun}__${r.tarefa?.cd_tarefa}`
  }

  const registrosFiltrados = registros.filter(r => {
    const reg = filtroRegistro.trim().toLowerCase()
    const dt = filtroData
    const hr = filtroHorario.trim()

    if (reg && !r.cd_fun.toLowerCase().includes(reg)) return false
    if (dt && r.tarefa?.dt_tarefa !== dt) return false
    if (hr && !formatarHora(r.horario).startsWith(hr)) return false
    return true
  })

  async function handleAtualizar() {
    if (selecionados.length === 0) return
    setAtualizando(true)

    for (const key of selecionados) {
      const [cdFun, cdTarefa] = key.split('__')
      const registro = registros.find(r => r.cd_fun === cdFun && r.tarefa?.cd_tarefa === cdTarefa)
      if (!registro) continue

      // Remove da tarefa_fun
      await supabase
        .from('tarefa_fun')
        .delete()
        .eq('cd_fun', cdFun)
        .eq('cd_tarefa', cdTarefa)

      // Decrementa qt_vaga
      const { data: horaData } = await supabase
        .from('hora_tarefa')
        .select('qt_vaga')
        .eq('cd_tarefa', cdTarefa)
        .eq('hr_tarefa', registro.horario)
        .single()

      if (horaData && horaData.qt_vaga > 0) {
        await supabase
          .from('hora_tarefa')
          .update({ qt_vaga: horaData.qt_vaga - 1 })
          .eq('cd_tarefa', cdTarefa)
          .eq('hr_tarefa', registro.horario)
      }
    }

    setSucesso(`${selecionados.length} registro(s) removido(s) com sucesso.`)
    setAtualizando(false)
    carregarRegistros()
    setTimeout(() => setSucesso(''), 4000)
  }

  const inputStyle = {
    padding: '8px 12px',
    border: '2px solid #90caf9',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#1a3a5c',
    outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f4fd 0%, #cce7f8 100%)',
      padding: '24px 16px',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Cabeçalho */}
        <div style={{
          background: '#1565c0',
          borderRadius: '12px 12px 0 0',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '26px' }}>📋</span>
            <div>
              <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>Atividades</h1>
              <p style={{ color: '#90caf9', fontSize: '13px' }}>Consulta de agendamentos</p>
            </div>
          </div>
          <button
            onClick={onVoltar}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '6px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}
          >
            ← Voltar
          </button>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '0 0 12px 12px',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(21,101,192,0.12)',
        }}>

          {sucesso && (
            <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#2e7d32', fontWeight: 600 }}>
              ✓ {sucesso}
            </div>
          )}

          {/* Filtros */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5b8db8', marginBottom: '4px' }}>Registro</label>
              <input
                style={{ ...inputStyle, width: '130px' }}
                placeholder="Ex: 1001"
                value={filtroRegistro}
                onChange={e => setFiltroRegistro(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5b8db8', marginBottom: '4px' }}>Data</label>
              <input
                type="date"
                style={{ ...inputStyle }}
                value={filtroData}
                onChange={e => setFiltroData(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5b8db8', marginBottom: '4px' }}>Horário</label>
              <input
                style={{ ...inputStyle, width: '100px' }}
                placeholder="Ex: 08:00"
                value={filtroHorario}
                onChange={e => setFiltroHorario(e.target.value)}
              />
            </div>
            <button
              onClick={() => { setFiltroRegistro(''); setFiltroData(''); setFiltroHorario('') }}
              style={{ background: 'none', border: 'none', color: '#5b8db8', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', paddingBottom: '8px' }}
            >
              Limpar filtros
            </button>
          </div>

          {/* Tabela */}
          {carregando ? (
            <p style={{ color: '#5b8db8', textAlign: 'center', padding: '40px 0' }}>Carregando registros...</p>
          ) : registrosFiltrados.length === 0 ? (
            <p style={{ color: '#5b8db8', textAlign: 'center', padding: '40px 0' }}>Nenhum registro encontrado.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#e3f2fd' }}>
                    {['Registro', 'Nome', 'Atividade', 'Data', 'Horário', 'Remover'].map(col => (
                      <th key={col} style={{ padding: '12px 14px', textAlign: 'left', color: '#1565c0', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '2px solid #90caf9' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map((r, i) => {
                    const key = getKey(r)
                    const marcado = selecionados.includes(key)
                    return (
                      <tr
                        key={key}
                        style={{ background: marcado ? '#ffebee' : (i % 2 === 0 ? '#fff' : '#f5f9ff'), transition: 'background 0.1s' }}
                      >
                        <td style={{ padding: '11px 14px', color: '#1a3a5c', borderBottom: '1px solid #e3f2fd' }}>{r.cd_fun}</td>
                        <td style={{ padding: '11px 14px', color: '#1a3a5c', borderBottom: '1px solid #e3f2fd' }}>{r.funcionario?.nm_fun}</td>
                        <td style={{ padding: '11px 14px', color: '#1a3a5c', borderBottom: '1px solid #e3f2fd' }}>{r.tarefa?.nm_tarefa}</td>
                        <td style={{ padding: '11px 14px', color: '#1a3a5c', borderBottom: '1px solid #e3f2fd', whiteSpace: 'nowrap' }}>{formatarData(r.tarefa?.dt_tarefa)}</td>
                        <td style={{ padding: '11px 14px', color: '#1a3a5c', borderBottom: '1px solid #e3f2fd' }}>{formatarHora(r.horario)}</td>
                        <td style={{ padding: '11px 14px', textAlign: 'center', borderBottom: '1px solid #e3f2fd' }}>
                          <input
                            type="checkbox"
                            checked={marcado}
                            onChange={() => toggleSelecionado(key)}
                            style={{ width: '18px', height: '18px', accentColor: '#c62828', cursor: 'pointer' }}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Rodapé */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#5b8db8' }}>
              {registrosFiltrados.length} registro(s) exibido(s)
              {selecionados.length > 0 && ` · ${selecionados.length} selecionado(s) para remover`}
            </span>
            <Botao
              variante="perigo"
              onClick={handleAtualizar}
              disabled={selecionados.length === 0 || atualizando}
            >
              {atualizando ? 'Atualizando...' : 'Atualizar'}
            </Botao>
          </div>

        </div>
      </div>
    </div>
  )
}
