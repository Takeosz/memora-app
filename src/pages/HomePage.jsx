import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

const processSteps = [
  { id: '01', title: 'Guarde', text: 'Adicione fotos, vídeos, textos, datas e momentos.', accent: 'rose' },
  { id: '02', title: 'Organize', text: 'Transforme tudo em histórias, álbuns, viagens e projetos.', accent: 'gold' },
  { id: '03', title: 'Reviva', text: 'Acesse suas memórias e compartilhe seus momentos.', accent: 'violet' },
]

const memoryTypes = [
  '📸 Fotos', '🎥 Vídeos', '📝 Textos', '📍 Lugares', '📅 Datas', '❤️ Pessoas', '🎵 Músicas', '💬 Frases', '🎉 Eventos', '✈️ Viagens', '🎁 Momentos especiais',
]

const demoTimeline = [
  {
    date: '12/05/2024',
    title: 'Nosso primeiro encontro',
    description: 'Naquela noite, tudo parecia quieto até o momento em que o mundo ganhou uma nova cor.',
    location: 'Lisboa, Portugal',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
  },
  {
    date: '20/07/2024',
    title: 'Primeira viagem juntos',
    description: 'A estrada, o vento e o silêncio que virou companhia. Foi ali que a história começou a ganhar forma.',
    location: 'Algarve, Portugal',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    date: '24/10/2026',
    title: 'Um dia que nunca vamos esquecer',
    description: 'Não foi só uma data. Foi o momento em que tudo o que já crescia em nós se tornou visível.',
    location: 'Rio de Janeiro, Brasil',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
  },
]

const stats = [
  { label: 'Memórias', value: '12.4K' },
  { label: 'Projetos', value: '86' },
  { label: 'Fotos', value: '4.8K' },
  { label: 'Vídeos', value: '1.2K' },
]

const editorialGallery = [
  {
    title: 'Primeira manhã no litoral',
    date: '20/07/2024',
    location: 'Algarve',
    description: 'A luz do mar parecia estar esperando por nós.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    size: 'full',
    variant: 'parallax',
  },
  {
    title: 'Noite de conversa',
    date: '12/05/2024',
    location: 'Lisboa',
    description: 'O silêncio virou o melhor lugar para se entender.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    size: 'half',
    variant: 'scale',
  },
  {
    title: 'Pé na estrada',
    date: '04/09/2024',
    location: 'Porto',
    description: 'Cada curva levava a uma história que ainda não tinha nome.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    size: 'half',
    variant: 'clip',
  },
  {
    title: 'Noite de aniversário',
    date: '24/10/2026',
    location: 'Rio',
    description: 'A celebração mais bonita foi a de simplesmente estarmos ali.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    size: 'compact',
    variant: 'side',
  },
  {
    title: 'A despedida mais bonita',
    date: '08/02/2025',
    location: 'Amsterdã',
    description: 'Mesmo quando o tempo mudava, o sentimento permanecia.',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
    size: 'compact',
    variant: 'scale',
  },
]

const travelChapters = [
  { city: 'São Paulo', date: '24 — 27 OUT 2026', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Rio de Janeiro', date: '08 — 12 NOV 2026', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Lisboa', date: '18 — 23 JAN 2027', image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80' },
]

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '' }

const tabs = [
  { key: 'memora', label: 'Memora' },
  { key: 'como-funciona', label: 'Como funciona' },
  { key: 'diferencial', label: 'Diferencial' },
  { key: 'projetos', label: 'Projetos' },
  { key: 'seguranca', label: 'Segurança' },
]

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('register')
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState('📸 Fotos')
  const [activeTab, setActiveTab] = useState('memora')
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const heroRef = useRef(null)
  const heroMediaRef = useRef(null)
  const parallaxRef = useRef(null)
  const galleryRef = useRef(null)
  const statsRef = useRef(null)
  const narrativeTimelineRef = useRef(null)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const hero = heroRef.current
    const media = heroMediaRef.current
    if (!hero || !media) return

    let frame = 0

    const updateHeroMotion = () => {
      const rect = hero.getBoundingClientRect()
      const offset = Math.max(rect.top * -0.12, -80)
      const scale = 1.08 - Math.max(0, window.scrollY * 0.00012)
      media.style.transform = `translate3d(0, ${offset}px, 0) scale(${scale})`
      frame = 0
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateHeroMotion)
    }

    updateHeroMotion()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const section = parallaxRef.current
    if (!section) return

    const layers = section.querySelectorAll('[data-parallax-speed]')
    if (!layers.length) return

    let frame = 0

    const updateParallax = () => {
      const rect = section.getBoundingClientRect()
      const progress = Math.min(Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0), 1)

      layers.forEach((layer) => {
        const speed = Number(layer.dataset.parallaxSpeed || 0)
        const offset = (progress - 0.5) * 120 * speed
        layer.style.setProperty('--parallax-offset', `${offset}px`)
        layer.style.setProperty('--parallax-scale', '1')
      })

      frame = 0
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateParallax)
    }

    updateParallax()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const timeline = narrativeTimelineRef.current
    if (!timeline) return

    const scenes = timeline.querySelectorAll('.timeline-scene')
    const progressLine = timeline.querySelector('.timeline-progress')
    if (!scenes.length || !progressLine) return

    let frame = 0

    const updateTimeline = () => {
      const rect = timeline.getBoundingClientRect()
      const progress = Math.min(Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0), 1)
      progressLine.style.height = `${Math.min(progress * 100, 100)}%`

      scenes.forEach((scene) => {
        const sceneRect = scene.getBoundingClientRect()
        const active = sceneRect.top < window.innerHeight * 0.68 && sceneRect.bottom > 120
        scene.classList.toggle('active', active)
        scene.classList.toggle('is-visible', sceneRect.top < window.innerHeight * 0.92 && sceneRect.bottom > 80)
      })

      frame = 0
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateTimeline)
    }

    updateTimeline()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const gallery = galleryRef.current
    if (!gallery) return

    const items = gallery.querySelectorAll('[data-parallax-speed]')
    if (!items.length) return

    let frame = 0

    const updateGallery = () => {
      items.forEach((item) => {
        const rect = item.getBoundingClientRect()
        const speed = Number(item.dataset.parallaxSpeed || 0)
        const offset = ((window.innerHeight - rect.top) / (window.innerHeight + rect.height) - 0.5) * 80 * speed
        item.style.transform = `translate3d(0, ${offset}px, 0)`
      })

      frame = 0
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateGallery)
    }

    updateGallery()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const statsPanel = statsRef.current
    if (!statsPanel) return

    const counters = statsPanel.querySelectorAll('[data-target]')
    if (!counters.length) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        counters.forEach((counter) => {
          const target = Number(counter.dataset.target || 0)
          const duration = 1800
          const easing = (t) => 1 - Math.pow(1 - t, 3)
          const start = performance.now()

          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = easing(progress)
            const value = Math.round(target * eased)
            counter.textContent = value

            if (progress < 1) {
              requestAnimationFrame(tick)
            } else {
              counter.textContent = target
            }
          }

          requestAnimationFrame(tick)
          counter.classList.add('is-animated')
        })

        observer.unobserve(entry.target)
      })
    }, { threshold: 0.35 })

    observer.observe(statsPanel)

    return () => observer.disconnect()
  }, [])

  const updateField = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const openAuth = (mode) => {
    setAuthMode(mode)
    setPasswordRecovery(false)
    setError('')
    setIsAuthModalOpen(false)
    setActiveTab('auth')
  }

  const closeAuth = () => {
    setIsAuthModalOpen(false)
    setPasswordRecovery(false)
    setForm(EMPTY_FORM)
    setError('')
  }

  const handlePasswordRecovery = (event) => {
    event.preventDefault()
    setError('Senha alterada com sucesso.')
    setPasswordRecovery(false)
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (authMode === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await register(form)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <header className="topbar public-topbar">
        <div className="brand-wrap">
          <div className="brand-mark">M</div>
          <span>Memora</span>
        </div>

        <nav className="public-nav" aria-label="Navegação principal">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tab-link ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <button type="button" className="ghost-button" onClick={() => openAuth('login')}>
            Entrar
          </button>
          <button type="button" className="primary-button" onClick={() => openAuth('register')}>
            Criar minha conta
          </button>
        </div>
      </header>

      <main className="site-shell">
        {activeTab === 'memora' && (
          <>
            <section className="hero-section cinematic-hero story-chapter" ref={heroRef} data-reveal="up">
              <div className="cinematic-hero-media" ref={heroMediaRef} aria-hidden="true" />
              <div className="cinematic-hero-overlay" aria-hidden="true" />

              <div className="hero-copy cinematic-copy">
                <span className="chapter-kicker">01 — Nossa história</span>
                <span className="eyebrow cinematic-eyebrow">Guardar momentos hoje para poder reviver histórias amanhã.</span>
                <h1>Uma história está prestes a começar.</h1>
                <p>
                  Guarde fotos, vídeos, histórias e momentos especiais em experiências digitais interativas criadas para guardar o que realmente importa.
                </p>
                <div className="hero-actions">
                  <button type="button" className="primary-button large" onClick={() => openAuth('register')}>
                    Criar minha conta
                  </button>
                  <button type="button" className="secondary-button large" onClick={() => setActiveTab('projetos')}>
                    Ver demonstração
                  </button>
                </div>
                <ul className="mini-stats">
                  <li><strong>12k+</strong><span>memórias salvas</span></li>
                  <li><strong>3.8k</strong><span>projetos ativos</span></li>
                  <li><strong>99.9%</strong><span>privacidade</span></li>
                </ul>
              </div>

              <div className="scroll-indicator" aria-label="Rolar para continuar">
                <span>Scroll</span>
                <div className="scroll-line">
                  <div className="scroll-dot" />
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'projetos' && (
          <section className="tab-modern-surface" id="projetos" data-reveal="up">
            <div className="tab-intro">
              <span className="eyebrow dark">Projetos</span>
              <h2>Memórias organizadas como capítulos da sua vida.</h2>
            </div>

            <div className="modern-showcase layout-two-column">
              <div className="showcase-visual image-portrait" aria-hidden="true" />
              <div className="showcase-copy">
                <p>
                  Cada projeto no Memora funciona como um capítulo vivo: uma viagem, um relacionamento, uma família, uma temporada ou uma conquista. Em vez de empilhar arquivos, você organiza a emoção e o contexto do que viveu.
                </p>
                <ul className="modern-list">
                  <li>Projetos por tema, evento, pessoa ou momento.</li>
                  <li>Datas, locais, sentimentos e descrições em um único lugar.</li>
                  <li>Compartilhamento inteligente com controle de visibilidade.</li>
                </ul>
              </div>
            </div>

            <div className="modern-metrics">
              <div className="metric-box">
                <strong>+180</strong>
                <span>momentos organizados</span>
              </div>
              <div className="metric-box">
                <strong>12</strong>
                <span>projetos em destaque</span>
              </div>
              <div className="metric-box">
                <strong>24/7</strong>
                <span>acesso em qualquer lugar</span>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'como-funciona' && (
          <section className="tab-modern-surface" id="como-funciona" data-reveal="up">
            <div className="tab-intro">
              <span className="eyebrow dark">Como funciona</span>
              <h2>Guardar lembranças sem complicar a vida.</h2>
            </div>

            <div className="modern-stepper">
              <article className="step-card">
                <span className="step-number">01</span>
                <div>
                  <h3>Capture</h3>
                  <p>Você adiciona fotos, vídeos, textos e momentos em segundos, sem perder o contexto do que viveu.</p>
                </div>
              </article>

              <article className="step-card">
                <span className="step-number">02</span>
                <div>
                  <h3>Organize</h3>
                  <p>Os itens são agrupados em projetos, datas, locais e temas para transformar o caos em uma história clara.</p>
                </div>
              </article>

              <article className="step-card">
                <span className="step-number">03</span>
                <div>
                  <h3>Reviva</h3>
                  <p>Volte ao passado com uma experiência visual, emocional e sensível, como se estivesse reabrindo um capítulo importante.</p>
                </div>
              </article>
            </div>
          </section>
        )}

        {activeTab === 'diferencial' && (
          <section className="tab-modern-surface" id="diferencial" data-reveal="up">
            <div className="tab-intro">
              <span className="eyebrow dark">Diferencial</span>
              <h2>Não é só guardar arquivos. É preservar a sensação.</h2>
            </div>

            <div className="modern-panel-grid">
              <article className="info-panel highlighted">
                <span className="panel-tag">Design emocional</span>
                <h3>Uma experiência feita para memorizar com carinho.</h3>
                <p>O Memora combina organização e estética para transformar cada lembrança em um momento bonito de revisitar.</p>
              </article>

              <article className="info-panel">
                <span className="panel-tag">Narrativa</span>
                <h3>Histórias em ordem</h3>
                <p>Você não guarda apenas arquivos; organiza vínculos, tempo, lugar e sentimento em uma narrativa coesa.</p>
              </article>

              <article className="info-panel">
                <span className="panel-tag">Contexto</span>
                <h3>Mais significado, menos caos</h3>
                <p>Cada foto pode ter uma mensagem, uma data, um lugar e uma memória que explica por que ela importa.</p>
              </article>

              <article className="info-panel">
                <span className="panel-tag">Experiência</span>
                <h3>Visual premium</h3>
                <p>Uma interface moderna e sofisticada que faz sentir que cada lembrança merece um espaço especial.</p>
              </article>
            </div>
          </section>
        )}

        {activeTab === 'seguranca' && (
          <section className="tab-modern-surface" id="seguranca" data-reveal="up">
            <div className="tab-intro">
              <span className="eyebrow dark">Segurança</span>
              <h2>Privacidade que respeita o que é íntimo.</h2>
            </div>

            <div className="security-modern-card">
              <div className="security-copy">
                <p>
                  O Memora foi pensado para proteger aquilo que tem valor emocional. Seus projetos podem ser privados, compartilhados por link ou públicos, com controle total sobre quem acessa cada lembrança.
                </p>
                <ul className="modern-list">
                  <li>Autenticação segura e sessão protegida.</li>
                  <li>Controle por projeto, vínculo e visibilidade.</li>
                  <li>Ambiente pensado para preservar o espaço íntimo do usuário.</li>
                </ul>
              </div>

              <div className="security-badges">
                <div className="badge-box">
                  <strong>SSL</strong>
                  <span>Conexão segura</span>
                </div>
                <div className="badge-box">
                  <strong>100%</strong>
                  <span>controle do usuário</span>
                </div>
                <div className="badge-box">
                  <strong>Privado</strong>
                  <span>por padrão</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'auth' && (
          <section className="auth-tab-section" data-reveal="up">
            <div className="auth-tab-shell">
              <div className="auth-tab-header">
                <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
                  Entrar
                </button>
                <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>
                  Criar conta
                </button>
              </div>

              {passwordRecovery ? (
                <form onSubmit={handlePasswordRecovery} className="auth-form auth-tab-form recovery-form">
                  <div className="recovery-header">
                    <span className="eyebrow dark">Redefinir senha</span>
                    <h3>Informe seu e-mail e escolha uma nova senha.</h3>
                  </div>

                  <label>
                    E-MAIL
                    <input type="email" value={form.email} onChange={updateField('email')} placeholder="Digite seu e-mail" required />
                  </label>

                  <label>
                    NOVA SENHA
                    <input type="password" value={form.password} onChange={updateField('password')} placeholder="Digite a nova senha" required minLength={8} />
                  </label>

                  <label>
                    CONFIRMAR NOVA SENHA
                    <input type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} placeholder="Digite novamente a senha" required minLength={8} />
                  </label>

                  <button type="submit" className="primary-button full-width reset-button">
                    ALTERAR SENHA
                  </button>

                  <button type="button" className="text-button subtle-link recovery-back" onClick={() => setPasswordRecovery(false)}>
                    <span className="link-question">Voltar para o login</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAuthSubmit} className="auth-form auth-tab-form">
                  {authMode === 'register' && (
                    <label>
                      Nome
                      <input type="text" value={form.name} onChange={updateField('name')} required minLength={2} />
                    </label>
                  )}

                  <label>
                    E-mail
                    <input type="email" value={form.email} onChange={updateField('email')} required />
                  </label>

                  <label>
                    Senha
                    <input type="password" value={form.password} onChange={updateField('password')} required minLength={8} />
                  </label>

                  {authMode === 'login' && (
                    <button type="button" className="text-button subtle-link" onClick={() => {
                      setPasswordRecovery(true)
                      setError('')
                    }}>
                      <span className="link-question">Esqueceu sua senha?</span>
                      <span className="link-action">RECUPERAR SENHA</span>
                    </button>
                  )}

                  {authMode === 'register' && (
                    <label>
                      Confirmação de senha
                      <input type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} required minLength={8} />
                    </label>
                  )}

                  {error && <p className="form-error">{error}</p>}

                  <button type="submit" className="primary-button full-width" disabled={submitting}>
                    {submitting ? 'Aguarde...' : authMode === 'login' ? 'Entrar' : 'Criar conta'}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

        {activeTab === 'memora' && (
          <>
            <section className="memora-intro-header story-chapter" data-reveal="up">
              <span className="chapter-kicker chapter-kicker-dark">02 — Memórias</span>
              <span className="eyebrow dark">A experiência completa</span>
              <h2>Uma maneira de guardar lembranças, dar sentido ao presente e preparar o futuro.</h2>

              <div className="story-preview-panel" aria-label="Preview visual do Memora">
                <div className="story-preview-visual">
                  <div className="story-preview-card story-preview-card--main">
                    <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80" alt="Casal em viagem" />
                  </div>
                  <div className="story-preview-card story-preview-card--float">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80" alt="Detalhe da memória" />
                  </div>
                  <div className="story-preview-note">
                    <span>07/03</span>
                    <strong>Paris</strong>
                  </div>
                </div>

                <div className="story-preview-content">
                  <div className="story-preview-badge">Diário vivo</div>
                  <h3>Histórias guardadas em movimento.</h3>
                  <p>Fotos, vídeos e notas ganham um lugar único para que cada lembrança continue viva, com contexto, emoção e significado.</p>
                  <ul>
                    <li>Álbum sentimental</li>
                    <li>Momentos em ordem</li>
                    <li>Memórias revisitáveis</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="editorial-storytelling" data-reveal="up" aria-label="História editorial do Memora">
              <div className="editorial-lines">
                <span className="editorial-line editorial-line-1">Algumas viagens terminam.</span>
                <span className="editorial-line editorial-line-2">Outras se transformam em memórias.</span>
              </div>
            </section>

            <section className="photo-parallax-story story-chapter" ref={parallaxRef} data-reveal="up" aria-label="Galeria de memórias com parallax">
              <div className="chapter-headline">
                <span className="chapter-kicker chapter-kicker-dark">03 — Nossas viagens</span>
              </div>
              <div className="parallax-scene">
                <div className="parallax-layer parallax-background reveal-fade" data-parallax-speed="-0.2" />
                <div className="parallax-layer parallax-card parallax-main reveal-clip" data-parallax-speed="-0.5" />
                <div className="parallax-layer parallax-card parallax-secondary reveal-fade" data-parallax-speed="0.5" />
                <div className="parallax-layer parallax-card parallax-detail reveal-fade" data-parallax-speed="0.9" />
                <div className="parallax-layer parallax-card parallax-side reveal-fade" data-parallax-speed="1.1" />
              </div>
            </section>

            <section className="travel-chapters story-chapter" data-reveal="up" aria-label="Capítulos de viagens do Memora">
              <div className="section-heading travel-heading">
                <span className="chapter-kicker chapter-kicker-dark">03 — Nossas viagens</span>
                <span className="eyebrow dark">Próximas viagens</span>
                <h2>Capítulos da nossa história em movimento.</h2>
              </div>

              <div className="travel-card-grid">
                {travelChapters.map((chapter, index) => (
                  <article key={`${chapter.city}-${index}`} className="travel-card" data-reveal="up">
                    <div className="travel-image" style={{ backgroundImage: `url('${chapter.image}')` }} aria-hidden="true" />
                    <div className="travel-overlay" aria-hidden="true" />
                    <div className="travel-content">
                      <span className="travel-label">Viagem</span>
                      <h3>{chapter.city}</h3>
                      <p>{chapter.date}</p>
                      <div className="travel-open-indicator">
                        <span>abrir capítulo</span>
                        <span className="travel-arrow">↗</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="feature-showcase" data-reveal="up">
              <div className="section-heading">
                <span className="eyebrow dark">Por que Memora</span>
                <h2>Uma plataforma pensada para guardar o que importa de verdade.</h2>
              </div>

              <div className="feature-grid">
                <article className="feature-card">
                  <div className="feature-icon">📦</div>
                  <h3>Organização inteligente</h3>
                  <p>Centralize fotos, vídeos, textos, datas, pessoas e histórias em um só lugar com estrutura clara e visual envolvente.</p>
                </article>

                <article className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <h3>Privacidade e controle</h3>
                  <p>Defina projetos públicos, privados ou compartilhados por link e mantenha cada lembrança sob controle total.</p>
                </article>

                <article className="feature-card">
                  <div className="feature-icon">✨</div>
                  <h3>Histórias com contexto</h3>
                  <p>Transforme eventos isolados em narrativas emocionais com memória, identidade, localização e contexto do momento.</p>
                </article>

                <article className="feature-card">
                  <div className="feature-icon">🚀</div>
                  <h3>Experiência premium</h3>
                  <p>Uma interface moderna, elegante e digital, pensada para fazer cada lembrança parecer um capítulo especial da sua vida.</p>
                </article>
              </div>
            </section>

            <section className="story-showcase" data-reveal="up">
              <div className="story-copy">
                <span className="eyebrow dark">Memórias com significado</span>
                <h2>Seu passado não precisa ficar espalhado por apps, folders ou mensagens.</h2>
                <p>
                  O Memora coloca suas lembranças em um ambiente seguro, bonito e fácil de revisitar. A ideia é simples: transformar momentos em história, e história em algo que vale a pena viver e compartilhar.
                </p>
                <ul className="story-points">
                  <li>Crie projetos pessoais, de casal, familiares e profissionais.</li>
                  <li>Relembre momentos com contexto, emoção e ordem visual.</li>
                  <li>Compartilhe histórias com quem você ama sem perder a essência do momento.</li>
                </ul>
              </div>

              <div className="story-panel">
                <div className="story-panel-box">
                  <span className="panel-label">Fluxo de uso</span>
                  <h3>Salvar • Organizar • Reviver</h3>
                  <div className="mini-flow">
                    <span>1. Adicionar</span>
                    <span>2. Categorizar</span>
                    <span>3. Compartilhar</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="memora-bridge-section" data-reveal="up">
              <div className="bridge-copy">
                <span className="eyebrow dark">Lembranças que sobrevivem ao tempo.</span>
                <h2>Seu passado merece viver com mais sentido.</h2>
              </div>

              <p>Transforme fotos, vídeos, relatos e momentos espontâneos em experiências digitais que guardam emoção, contexto e beleza para sempre.</p>
            </section>

            <section className="feature-showcase" data-reveal="up">
              <div className="section-heading">
                <span className="eyebrow dark">Tudo em um só lugar</span>
                <h2>Mais do que uma galeria, uma memória viva.</h2>
              </div>

              <div className="benefit-grid">
                <div className="benefit-card">
                  <strong>📸</strong>
                  <h3>Fotos e vídeos</h3>
                  <p>Armazene conteúdos visuais em álbuns e projetos com organização por tema e date.</p>
                </div>
                <div className="benefit-card">
                  <strong>📝</strong>
                  <h3>Textos e relatos</h3>
                  <p>Registre lembranças em forma de narrativas, frases, descrições e sentimentos.</p>
                </div>
                <div className="benefit-card">
                  <strong>💬</strong>
                  <h3>Compartilhamento</h3>
                  <p>Compartilhe momentos especiais sem perder o cuidado, o contexto e a emoção do que foi vivido.</p>
                </div>
                <div className="benefit-card">
                  <strong>📍</strong>
                  <h3>Experiências digitais</h3>
                  <p>Crie experiências interativas para transformar o passado em uma narrativa visual memorável.</p>
                </div>
              </div>
            </section>

            <section className="memora-bridge-section memora-bridge-section-alt" data-reveal="up">
              <div className="bridge-copy">
                <span className="eyebrow dark">A rotina de guardar, entender e revisitar.</span>
                <h2>Memórias ganham ordem quando encontram um lugar certo.</h2>
              </div>

              <p>Organize o que viveu, marque o que importa e transforme lembranças dispersas em uma história contínua, clara e emocional.</p>
            </section>

            <section className="feature-showcase showcase-flow-layout" data-reveal="up">
              <div className="section-heading">
                <span className="eyebrow dark">Como o Memora funciona</span>
                <h2>Você guarda momentos, organiza significado e revive a história como ela realmente aconteceu.</h2>
              </div>

              <div className="benefit-grid">
                <div className="benefit-card">
                  <strong>🗂️</strong>
                  <h3>Arquive por contexto</h3>
                  <p>Organize lembranças por pessoas, eventos, viagens, datas, sentimentos e projetos específicos.</p>
                </div>
                <div className="benefit-card">
                  <strong>📌</strong>
                  <h3>Marque o que importa</h3>
                  <p>Destacar datas especiais, momentos-chave e histórias que você quer revisitar no futuro.</p>
                </div>
                <div className="benefit-card">
                  <strong>🧠</strong>
                  <h3>Entenda a história</h3>
                  <p>Veja cada memória no lugar certo, com contexto, emoção e narrativa por trás do momento.</p>
                </div>
                <div className="benefit-card">
                  <strong>💾</strong>
                  <h3>Preserve para sempre</h3>
                  <p>Crie uma forma segura e elegante de guardar lembranças que continuam fazendo sentido ao longo do tempo.</p>
                </div>
              </div>
            </section>

            <section className="memora-bridge-section memora-bridge-section-alt-two" data-reveal="up">
              <div className="bridge-copy">
                <span className="eyebrow dark">O que muda na prática.</span>
                <h2>Não é apenas guardar lembranças. É dar a elas um lugar com sentido.</h2>
              </div>

              <p>Quando a memória tem contexto, a pessoa lembra com mais clareza, sente com mais intensidade e revive com mais profundidade.</p>
            </section>

            <section className="feature-showcase showcase-difference-layout" data-reveal="up">
              <div className="section-heading">
                <span className="eyebrow dark">Por que Memora é diferente</span>
                <h2>Ele não guarda só arquivos. Ele guarda o significado por trás de cada lembrança.</h2>
              </div>

              <div className="benefit-grid">
                <div className="benefit-card">
                  <strong>📖</strong>
                  <h3>História em vez de pasta</h3>
                  <p>Seu conteúdo deixa de ser só um conjunto de itens e passa a formar uma linha do tempo emocional com sentido.</p>
                </div>
                <div className="benefit-card">
                  <strong>📅</strong>
                  <h3>Memórias organizadas no tempo</h3>
                  <p>Você revisita momentos por data, acontecimento, pessoa, lugar ou tema sem perder o contexto do que viveu.</p>
                </div>
                <div className="benefit-card">
                  <strong>🔐</strong>
                  <h3>Privacidade com controle</h3>
                  <p>Seu espaço pode ser íntimo, compartilhado por convite ou público, conforme a sua vontade e o seu nível de exposição.</p>
                </div>
                <div className="benefit-card">
                  <strong>🎯</strong>
                  <h3>Experiência feita para emoções</h3>
                  <p>O design foi pensado para tornar a revisão da memória algo mais bonito, mais leve e mais significativo.</p>
                </div>
              </div>
            </section>

            <section className="story-showcase story-chapter" data-reveal="up">
              <div className="story-copy">
                <span className="chapter-kicker chapter-kicker-dark">05 — Nossa timeline</span>
                <span className="eyebrow dark">O valor do produto</span>
                <h2>O Memora ajuda você a preservar o que importa sem perder a sensação do momento.</h2>
                <p>
                  À medida que a vida acontece, lembranças se espalham por fotos, textos, vídeos, mensagens e conversas. O Memora reúne tudo em um único lugar, dando estrutura, contexto e beleza a sua rotina emocional.
                </p>
                <ul className="story-points">
                  <li>Transforma momentos isolados em uma narrativa com começo, meio e sentido.</li>
                  <li>Reduz a fricção de guardar lembranças e aumenta a vontade de revisitar o passado.</li>
                  <li>Cria um espaço íntimo para celebrar vivências, reconhecer conexões e guardar histórias valiosas.</li>
                </ul>
              </div>

              <div className="story-panel">
                <div className="story-panel-box">
                  <span className="panel-label">O que você ganha</span>
                  <h3>Mais clareza, mais emoção, mais presença.</h3>
                  <div className="mini-flow">
                    <span>Você lembra com mais profundidade</span>
                    <span>Você organiza com mais facilidade</span>
                    <span>Você revive com mais carinho</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="stats-section story-chapter" ref={statsRef}>
              <div className="chapter-headline chapter-headline-tight">
                <span className="chapter-kicker chapter-kicker-dark">04 — Momentos</span>
              </div>
              <div className="stats-panel">
                {stats.map((stat) => (
                  <div key={stat.label} className="stat-box">
                    <strong data-target={Number(String(stat.value).replace(/[^\d]/g, '')) || 0}>{0}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="memora-bridge-section memora-bridge-section-alt-three" data-reveal="up">
              <div className="bridge-copy">
                <span className="eyebrow dark">Memórias que acompanham pessoas e relações.</span>
                <h2>O Memora foi pensado para quem quer guardar histórias que continuam vivendo.</h2>
              </div>

              <p>Seja em uma rotina íntima, em uma família, em uma viagem ou em um projeto criativo, o Memora transforma lembranças em um espaço com significado.</p>
            </section>

            <section className="feature-showcase" data-reveal="up">
              <div className="section-heading">
                <span className="eyebrow dark">Para quem é</span>
                <h2>Um espaço para pessoas, casais, famílias e histórias que querem durar.</h2>
              </div>

              <div className="benefit-grid">
                <div className="benefit-card">
                  <strong>💑</strong>
                  <h3>Casais</h3>
                  <p>Guarde datas, viagens, mensagens, fotos e os momentos que fazem a relação crescer.</p>
                </div>
                <div className="benefit-card">
                  <strong>👨‍👩‍👧‍👦</strong>
                  <h3>Famílias</h3>
                  <p>Organize lembranças de reuniões, aniversários, festas e histórias que merecem ser revisadas.</p>
                </div>
                <div className="benefit-card">
                  <strong>✈️</strong>
                  <h3>Viajantes</h3>
                  <p>Transforme roteiros, fotos, lugares e experiências em uma narrativa viva da sua jornada.</p>
                </div>
                <div className="benefit-card">
                  <strong>🎨</strong>
                  <h3>Criadores</h3>
                  <p>Centralize ideias, projetos e marcos pessoais em um espaço com identidade visual e contexto.</p>
                </div>
              </div>
            </section>

            <section className="story-showcase" data-reveal="up">
              <div className="story-copy">
                <span className="eyebrow dark">O que você guarda</span>
                <h2>Mais do que arquivos: memórias com tempo, emoção e significado.</h2>
                <p>
                  No Memora, você pode registrar o que viveu em diferentes formatos e lembrar com clareza por quê aquilo importou. O objetivo é transformar lembranças espontâneas em uma história contínua, bonita e fácil de revisitar.
                </p>
                <ul className="story-points">
                  <li>Momentos pequenos que viram parte da sua identidade.</li>
                  <li>Projetos visuais com foto, data, localização e contexto emocional.</li>
                  <li>Histórias compartilhadas com quem você ama, sem perder a essência do momento.</li>
                </ul>
              </div>

              <div className="story-panel">
                <div className="story-panel-box">
                  <span className="panel-label">Memora em resumo</span>
                  <h3>Guardar • Entender • Reviver</h3>
                  <div className="mini-flow">
                    <span>Memórias organizadas por tema</span>
                    <span>Histórias com contexto emocional</span>
                    <span>Experiência premium e segura</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="memory-lounge-section" data-reveal="up">
              <div className="memory-lounge-copy">
                <span className="eyebrow dark">Onde a vida fica registrada</span>
                <h2>Uma casa para as lembranças que mais importam.</h2>
                <p>
                  Tudo o que você viveu pode ser guardado em um espaço bonito, íntimo e sensível. O Memora organiza a memória como uma narrativa: com presença, emoção e beleza.
                </p>
              </div>

              <div className="memory-lounge-visual" aria-label="Mural de memórias do Memora">
                <div className="memory-card memory-card-main">
                  <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80" alt="Memória principal" />
                </div>
                <div className="memory-card memory-card-side">
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80" alt="Memória lateral" />
                </div>
                <div className="memory-card memory-card-top">
                  <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80" alt="Memória em destaque" />
                </div>
              </div>
            </section>

            <section className="cta-section story-chapter">
              <span className="chapter-kicker">06 — O que ainda vamos viver</span>
              <h2>“A vida acontece uma vez. As memórias podem durar para sempre.”</h2>
              <button type="button" className="primary-button large" onClick={() => openAuth('register')}>
                Comece a guardar sua história
              </button>
            </section>
          </>
        )}
      </main>

      {/* MODAL DE AUTENTICAÇÃO */}
      {isAuthModalOpen && activeTab !== 'auth' && (
        <div className="modal-overlay" onClick={closeAuth}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={closeAuth}>✕</button>
            
            <div className="auth-switch">
              <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
                Entrar
              </button>
              <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>
                Criar conta
              </button>
            </div>

            {passwordRecovery ? (
              <form onSubmit={handlePasswordRecovery} className="auth-form recovery-form">
                <div className="recovery-header">
                  <span className="eyebrow dark">Redefinir senha</span>
                  <h3>Informe seu e-mail e escolha uma nova senha.</h3>
                </div>

                <label>
                  E-MAIL
                  <input type="email" value={form.email} onChange={updateField('email')} placeholder="Digite seu e-mail" required />
                </label>

                <label>
                  NOVA SENHA
                  <input type="password" value={form.password} onChange={updateField('password')} placeholder="Digite a nova senha" required minLength={8} />
                </label>

                <label>
                  CONFIRMAR NOVA SENHA
                  <input type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} placeholder="Digite novamente a senha" required minLength={8} />
                </label>

                <button type="submit" className="primary-button full-width reset-button">
                  ALTERAR SENHA
                </button>

                <button type="button" className="text-button subtle-link recovery-back" onClick={() => setPasswordRecovery(false)}>
                  <span className="link-question">Voltar para o login</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} className="auth-form">
                {authMode === 'register' && (
                  <label>
                    Nome
                    <input type="text" value={form.name} onChange={updateField('name')} required minLength={2} />
                  </label>
                )}

                <label>
                  E-mail
                  <input type="email" value={form.email} onChange={updateField('email')} required />
                </label>

                <label>
                  Senha
                  <input type="password" value={form.password} onChange={updateField('password')} required minLength={8} />
                </label>

                {authMode === 'login' && (
                  <button type="button" className="text-button subtle-link" onClick={() => {
                    setPasswordRecovery(true)
                    setError('')
                  }}>
                    <span className="link-question">Esqueceu sua senha?</span>
                    <span className="link-action">RECUPERAR SENHA</span>
                  </button>
                )}

                {authMode === 'register' && (
                  <label>
                    Confirmação de senha
                    <input type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} required minLength={8} />
                  </label>
                )}

                {error && <p className="form-error">{error}</p>}

                <button type="submit" className="primary-button full-width" disabled={submitting}>
                  {submitting ? 'Aguarde...' : authMode === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}