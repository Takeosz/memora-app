import { useEffect, useRef } from 'react'
import './CursorGlow.css'

export default function CursorGlow() {
  const glowRef = useRef(null)

  useEffect(() => {
    const isCoarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isCoarsePointer) {
      if (glowRef.current) {
        glowRef.current.style.display = 'none'
      }
      return undefined
    }

    const glow = glowRef.current
    const baseOpacity = prefersReducedMotion ? 0.38 : 1

    const updateGlow = (event) => {
      if (!glow || !event) return

      const x = event.clientX
      const y = event.clientY

      glow.style.opacity = String(baseOpacity)
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`
      document.documentElement.style.setProperty('--cursor-x', `${x}px`)
      document.documentElement.style.setProperty('--cursor-y', `${y}px`)
      document.documentElement.style.setProperty('--cursor-glow-opacity', String(baseOpacity))
    }

    const handlePointerMove = (event) => updateGlow(event)

    const handlePointerLeave = () => {
      if (!glow) return
      glow.style.opacity = '0'
      document.documentElement.style.setProperty('--cursor-glow-opacity', '0')
    }

    const handlePointerEnter = (event) => updateGlow(event)

    document.documentElement.style.setProperty('--cursor-glow-opacity', String(baseOpacity))
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerenter', handlePointerEnter)
    window.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerenter', handlePointerEnter)
      window.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
}
