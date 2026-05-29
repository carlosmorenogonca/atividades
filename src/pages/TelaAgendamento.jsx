import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import Layout from '../components/Layout.jsx'
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

export default function TelaAgendamento({ funcionario, onConsulta, onLogout }) {
  const [tarefas, setTarefas] = useState([])
  const [tarefaSelecionada, setTarefaSelecionada] = useState('')
  const [horarios, setHorarios] = useState([])
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [carregandoTarefas, setCarregandoTarefas] = useState(true)
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarTarefas() {
      const { data } = await supabase
        .from('tarefa')
        .select('cd_tarefa, nm_tarefa, dt_tarefa')
        .order('dt_tarefa')
      setTarefas(data || [])
      setCarregandoTarefas(false)
    }
    carregarTarefas()
  }, [])

  async function handleTarefaChange(cdTarefa) {
    setTarefaSelecionada(cdTarefa)
    setHorarioSelecionado('')
    setErro('')
    setSucesso(false)

    if (!cdTarefa) {
      setHorarios([])
      return
    }

    setCarregandoHorarios(true)

    const tarefa = tarefas.find(t => t.cd_tarefa === cdTarefa)

    // Verifica se funcionário já tem tarefa neste dia
    const { data: jaAgendado } = await supabase
      .from('tarefa_fun')
      .select('cd_tarefa, tarefa:cd_tarefa(dt_tarefa)')
      .eq('cd_fun', funcionario.cd_fun)

    const datasDasTarefas = (jaAgendado || []).map(r => r.tarefa?.dt_tarefa)
    const jaTemnoDia = datasDasTarefas.includes(tarefa.dt_tarefa)

    if (jaTemnoDia) {
      setHorarios([])
      setErro('Você já possui uma atividade agendada neste dia.')
      setCarregandoHorarios(false)
      return
    }

    // Busca horários com vagas disponíveis
    const { data: horariosData } = await supabase
      .from('hora_tarefa')
      .select('hr_tarefa, qt_disponivel, qt_vaga')
      .eq('cd_tarefa', cdTarefa)
      .order('hr_tarefa')

    const comVagas = (horariosData || []).filter(h => h.qt_vaga < h.qt_disponivel)
    setHorarios(comVagas)
    setCarregandoHorarios(false)
  }

  async function handleConfirmar() {
    if (!tarefaSelecionada || !horarioSelecionado) return
    setConfirmando(true)
    setErro('')

    // Insere na tarefa_fun
    const { error: errInsert } = await supabase
      .from('tarefa_fun')
      .insert({ cd_fun: funcionario.cd_fun, cd_tarefa: tarefaSelecionada, horario: horarioSelecionado })

    if (errInsert) {
      setErro('Erro ao confirmar. Tente novamente.')
      setConfirmando(false)
      return
    }

    // Incrementa qt_vaga
    const horario = horarios.find(h => h.hr_tarefa === horarioSelecionado)
    await supabase
      .from('hora_tarefa')
      .update({ qt_vaga: horario.qt_vaga + 1 })
      .eq('cd_tarefa', tarefaSelecionada)
      .eq('hr_tarefa', horarioSelecionado)

    setSucesso(true)
    setConfirmando(false)
    setTarefaSelecionada('')
    setHorarioSelecionado('')
    setHorarios([])
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #90caf9',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#1a3a5c',
    background: '#fff',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a3a5c',
    marginBottom: '8px',
  }

  return (
    <Layout titulo="Agendamento de Atividade">
      {/* Saudação */}
      <div style={{
        background: '#e3f2fd',
        border: '1px solid #90caf9',
        borderRadius: '8px',
        padding: '14px 18px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div>
          <span style={{ fontSize: '13px', color: '#5b8db8' }}>Bem-vindo(a)</span>
          <p style={{ fontWeight: 700, fontSize: '17px', color: '#1565c0' }}>{funcionario.nm_fun}</p>
          <span style={{ fontSize: '12px', color: '#5b8db8' }}>Registro: {funcionario.cd_fun}</span>
        </div>
        <button
          onClick={onLogout}
          style={{ background: 'none', border: 'none', color: '#5b8db8', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>

      {sucesso && (
        <div style={{
          background: '#e8f5e9',
          border: '1px solid #a5d6a7',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '24px',
          color: '#2e7d32',
          fontWeight: 600,
          fontSize: '15px',
        }}>
          ✓ Convocação confirmada com sucesso!
        </div>
      )}

      {/* Seleção de Tarefa */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Selecione a Atividade</label>
        <select
          value={tarefaSelecionada}
          onChange={e => handleTarefaChange(e.target.value)}
          style={inputStyle}
          disabled={carregandoTarefas}
        >
          <option value="">{carregandoTarefas ? 'Carregando...' : '-- Selecione uma atividade --'}</option>
          {tarefas.map(t => (
            <option key={t.cd_tarefa} value={t.cd_tarefa}>
              {t.nm_tarefa} — {formatarData(t.dt_tarefa)}
            </option>
          ))}
        </select>
      </div>

      {/* Horários */}
      {tarefaSelecionada && !erro && (
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Selecione o Horário</label>

          {carregandoHorarios ? (
            <p style={{ color: '#5b8db8', fontSize: '14px' }}>Carregando horários...</p>
          ) : horarios.length === 0 ? (
            <div style={{
              background: '#fff8e1',
              border: '1px solid #ffe082',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#f57f17',
              fontSize: '14px',
            }}>
              Não há horários disponíveis para esta atividade.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {horarios.map(h => (
                <label
                  key={h.hr_tarefa}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    border: '2px solid ' + (horarioSelecionado === h.hr_tarefa ? '#1565c0' : '#90caf9'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: horarioSelecionado === h.hr_tarefa ? '#e3f2fd' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="horario"
                    value={h.hr_tarefa}
                    checked={horarioSelecionado === h.hr_tarefa}
                    onChange={() => setHorarioSelecionado(h.hr_tarefa)}
                    style={{ accentColor: '#1565c0', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '16px', color: '#1565c0' }}>
                    {formatarHora(h.hr_tarefa)}
                  </span>
                  <span style={{ fontSize: '13px', color: '#5b8db8', marginLeft: 'auto' }}>
                    {h.qt_disponivel - h.qt_vaga} vaga(s) restante(s)
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div style={{
          background: '#ffebee',
          border: '1px solid #ef9a9a',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          color: '#c62828',
          fontSize: '14px',
        }}>
          {erro}
        </div>
      )}

      {/* Botões */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
        <Botao
          onClick={handleConfirmar}
          disabled={!horarioSelecionado || confirmando}
          larguraTotal
        >
          {confirmando ? 'Confirmando...' : 'Confirmar convocação'}
        </Botao>

        {funcionario.master === 'S' && (
          <Botao variante="secundario" onClick={onConsulta} larguraTotal>
            Consulta
          </Botao>
        )}
      </div>
    </Layout>
  )
}
