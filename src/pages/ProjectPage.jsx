import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'

function formatDate(value) {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match) {
    const [, year, month, day] = match
    return `${day}/${month}/${year}`
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('pt-BR')
}

export default function ProjectPage() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .getPublicProject(slug)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return <div className="project-site-shell"><p>Carregando projeto...</p></div>
  }

  if (error) {
    return (
      <div className="project-site-shell project-site-error">
        <h2>Não foi possível abrir este projeto</h2>
        <p>{error}</p>
        <Link to="/" className="primary-button">Voltar para a Memora</Link>
      </div>
    )
  }

  const { project, memories, owner } = data
  const initials = (owner?.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="project-site-shell">
      <div className="project-site-cover" />
      <div className="project-site-body">
        <div className="project-site-header">
          <div className="avatar-circle large">{initials}</div>
          <div>
            <h1>{project.name}</h1>
            <p>{project.description || 'Uma coleção de memórias especiais.'}</p>
            {project.sinceDate && <span className="since-badge">Juntos desde {formatDate(project.sinceDate)}</span>}
          </div>
        </div>

        <h2 className="feed-title">Publicações</h2>

        {memories.length === 0 ? (
          <p className="empty-state">Este projeto ainda não possui memórias publicadas.</p>
        ) : (
          <div className="project-feed public-feed">
            {memories.map((memory) => (
              <article key={memory.id} className="feed-card">
                <div className="feed-photo" style={memory.mediaUrl ? { backgroundImage: `url(${memory.mediaUrl})` } : undefined} />
                <div className="feed-copy">
                  <h4>{memory.title}</h4>
                  <p>{memory.description}</p>
                  <p>📅 {formatDate(memory.date)} · 📍 {memory.location || 'sem local'}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="project-site-footer">
          <span>Criado com ❤️ em <Link to="/">Memora</Link></span>
        </footer>
      </div>
    </div>
  )
}
