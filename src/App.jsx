import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import HomePage from './pages/HomePage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import CursorGlow from './components/CursorGlow.jsx'
import './App.css'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen">Carregando...</div>
  if (!user) return <Navigate to="/" replace />
  return children
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen">Carregando...</div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  const location = useLocation()
  const [transitionState, setTransitionState] = useState('ready')
  const progressBarRef = useRef(null)

  useEffect(() => {
    const updateScrollProgress = () => {
      if (!progressBarRef.current) return

      const scrollTop = window.scrollY
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0

      progressBarRef.current.style.width = `${Math.min(Math.max(progress, 0), 100)}%`
    }

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollProgress()
          ticking = false
        })
        ticking = true
      }
    }

    updateScrollProgress()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    setTransitionState('exiting')

    const enterTimer = window.setTimeout(() => {
      setTransitionState('entering')
    }, 140)

    const readyTimer = window.setTimeout(() => {
      setTransitionState('ready')
    }, 760)

    return () => {
      window.clearTimeout(enterTimer)
      window.clearTimeout(readyTimer)
    }
  }, [location.pathname])

  useEffect(() => {
    const revealItems = document.querySelectorAll('[data-reveal]')

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.14 })

    revealItems.forEach((item) => revealObserver.observe(item))

    const handleRipple = (event) => {
      const button = event.target.closest('button, .primary-button, .secondary-button, .ghost-button')
      if (!button) return

      const ripple = document.createElement('span')
      ripple.className = 'ripple'
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      ripple.style.width = `${size}px`
      ripple.style.height = `${size}px`
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`

      button.appendChild(ripple)
      window.setTimeout(() => ripple.remove(), 550)
    }

    document.addEventListener('click', handleRipple)

    return () => {
      revealObserver.disconnect()
      document.removeEventListener('click', handleRipple)
    }
  }, [])

  return (
    <div className="memora-app">
      <div className="scroll-progress-track" aria-hidden="true">
        <div ref={progressBarRef} className="scroll-progress-bar" />
      </div>
      <CursorGlow />
      <div key={location.pathname} className={`app-shell-content page-shell ${transitionState}`}>
        <Routes location={location}>
          <Route path="/" element={<RedirectIfAuthed><HomePage /></RedirectIfAuthed>} />
          <Route
            path="/dashboard"
            element={(
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            )}
          />
          <Route path="/p/:slug" element={<ProjectPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
