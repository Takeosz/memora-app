import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function HomePage() {
  const navigate = useNavigate()
  const { user, login, register } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState('login')
  const [recoveryStep, setRecoveryStep] = useState('email')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const openModal = (nextMode) => {
    setMode(nextMode)
    setRecoveryStep(nextMode === 'recovery' ? 'email' : 'email')
    setError('')
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setError('')
    setSubmitting(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (mode === 'recovery' && recoveryStep === 'email') {
      if (!form.email.trim()) {
        setError('Informe o e-mail da sua conta.')
        return
      }

      setRecoveryStep('password')
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
        closeModal()
        navigate('/dashboard')
        return
      }

      if (mode === 'register') {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        })
        closeModal()
        navigate('/dashboard')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/recover`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'Não foi possível recuperar sua conta.')
      }

      setMode('login')
      setRecoveryStep('email')
      setForm({ name: '', email: '', password: '', confirmPassword: '' })
      setError('Senha atualizada com sucesso. Você pode entrar com sua nova senha.')
    } catch (submitError) {
      setError(submitError.message || 'Não foi possível continuar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <span className="landing-mark">M</span>
          <span>Memora</span>
        </div>

        <nav className="landing-nav" aria-label="Menu principal">
          <button type="button" className="nav-button nav-login" onClick={() => openModal('login')} aria-label="Fazer login">
            Fazer login
          </button>
          <button type="button" className="nav-button nav-register" onClick={() => openModal('register')} aria-label="Criar conta">
            Criar conta
          </button>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-copy-block">
            <h1>Uma experiência premium para guardar memórias, projetos e momentos importantes.</h1>
            <p className="landing-copy">
              O Memora transforma registros pessoais em um espaço elegante e simples de revisitar.
              Sua área do cliente centraliza histórias, ideias e objetivos em um só lugar.
            </p>

            <div className="landing-actions">
              <button type="button" className="landing-primary" onClick={() => (user ? navigate('/dashboard') : openModal('login'))}>
                {user ? 'Abrir dashboard' : 'Fazer login'}
              </button>
              <button type="button" className="landing-secondary" onClick={() => openModal('register')}>
                Criar conta
              </button>
            </div>

            <ul className="landing-stats" aria-label="Principais diferenciais do Memora">
              <li>
                <strong>3x</strong>
                <span>mais organizado</span>
              </li>
              <li>
                <strong>1 lugar</strong>
                <span>para tudo</span>
              </li>
              <li>
                <strong>100%</strong>
                <span>personalizado</span>
              </li>
            </ul>
          </div>

          <div className="landing-panel" aria-label="Preview do dashboard do Memora">
            <div className="panel-header">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>

            <div className="panel-body">
              <div className="panel-card large">
                <span className="panel-label">Memórias recentes</span>
                <h3>Viagem para a praia</h3>
                <p>“Aquela tarde com o pôr do sol e os amigos foi o melhor momento do mês.”</p>
              </div>

              <div className="panel-grid">
                <div className="panel-card small">
                  <span className="panel-label">Projetos</span>
                  <strong>12</strong>
                </div>
                <div className="panel-card small accent">
                  <span className="panel-label">Foco</span>
                  <strong>Atual</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features" aria-label="Recursos do Memora">
          <article className="feature-card">
            <span className="feature-icon">✦</span>
            <h3>Organização emocional</h3>
            <p>Estruture suas lembranças com contexto, emoção e história.</p>
          </article>

          <article className="feature-card">
            <span className="feature-icon">◎</span>
            <h3>Projetos em foco</h3>
            <p>Centralize ideias, objetivos e registros em um único fluxo claro.</p>
          </article>

          <article className="feature-card">
            <span className="feature-icon">▣</span>
            <h3>Experiência inspiradora</h3>
            <p>Um ambiente visual limpo que valoriza cada detalhe importante.</p>
          </article>
        </section>
      </main>

      {modalOpen && (
        <div className="auth-modal-overlay" onClick={closeModal}>
          <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
            <div className="auth-modal-header">
              <div>
                <p className="auth-label">Área do cliente</p>
                <h2>
                  {mode === 'login' && 'Fazer login'}
                  {mode === 'register' && 'Criar conta'}
                  {mode === 'recovery' && 'Recuperar conta'}
                </h2>
              </div>
              <button type="button" className="auth-close" onClick={(event) => {
                event.stopPropagation()
                closeModal()
              }} aria-label="Fechar">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'register' && (
                <label>
                  <span>Nome</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Seu nome"
                    required
                  />
                </label>
              )}

              {mode === 'recovery' && recoveryStep === 'email' && (
                <label>
                  <span>E-mail da conta</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="seu@email.com"
                    required
                  />
                </label>
              )}

              {mode !== 'recovery' && (
                <>
                  <label>
                    <span>E-mail</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="seu@email.com"
                      required
                    />
                  </label>

                  <label>
                    <span>Senha</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      placeholder="Sua senha"
                      required
                    />
                  </label>
                </>
              )}

              {mode === 'register' && (
                <label>
                  <span>Confirmar senha</span>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    placeholder="Digite novamente"
                    required
                  />
                </label>
              )}

              {mode === 'recovery' && recoveryStep === 'password' && (
                <>
                  <label>
                    <span>Nova senha</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      placeholder="Digite a nova senha"
                      required
                    />
                  </label>

                  <label>
                    <span>Confirmar nova senha</span>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      placeholder="Repita a nova senha"
                      required
                    />
                  </label>
                </>
              )}

              {error && <p className={error.includes('sucesso') ? 'auth-message auth-success' : 'auth-message auth-error'}>{error}</p>}

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting
                  ? 'Carregando...'
                  : mode === 'login'
                    ? 'Entrar'
                    : mode === 'register'
                      ? 'Criar conta'
                      : mode === 'recovery' && recoveryStep === 'email'
                        ? 'Continuar'
                        : 'Atualizar senha'}
              </button>
            </form>

            {mode !== 'recovery' && (
              <p className="auth-switch">
                {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
                <button type="button" onClick={(event) => {
                  event.stopPropagation()
                  setMode(mode === 'login' ? 'register' : 'login')
                }}>
                  {mode === 'login' ? 'Cadastre-se' : 'Fazer login'}
                </button>
              </p>
            )}

            {mode === 'login' && (
              <button type="button" className="auth-recovery" onClick={(event) => {
                event.stopPropagation()
                setMode('recovery')
                setRecoveryStep('email')
                setError('')
                setForm({ name: '', email: '', password: '', confirmPassword: '' })
              }}>
                Recuperar conta
              </button>
            )}

            {mode === 'recovery' && (
              <button type="button" className="auth-recovery" onClick={(event) => {
                event.stopPropagation()
                setMode('login')
                setRecoveryStep('email')
                setError('')
                setForm({ name: '', email: '', password: '', confirmPassword: '' })
              }}>
                Voltar para login
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
