import { useState } from 'react'
import TelaIdentificacao from './pages/TelaIdentificacao.jsx'
import TelaAgendamento from './pages/TelaAgendamento.jsx'
import TelaConsulta from './pages/TelaConsulta.jsx'

export default function App() {
  const [tela, setTela] = useState('identificacao')
  const [funcionario, setFuncionario] = useState(null)

  function handleIdentificado(func) {
    setFuncionario(func)
    setTela('agendamento')
  }

  function handleLogout() {
    setFuncionario(null)
    setTela('identificacao')
  }

  return (
    <div>
      {tela === 'identificacao' && (
        <TelaIdentificacao onIdentificado={handleIdentificado} />
      )}
      {tela === 'agendamento' && (
        <TelaAgendamento
          funcionario={funcionario}
          onConsulta={() => setTela('consulta')}
          onLogout={handleLogout}
        />
      )}
      {tela === 'consulta' && (
        <TelaConsulta
          funcionario={funcionario}
          onVoltar={() => setTela('agendamento')}
        />
      )}
    </div>
  )
}
