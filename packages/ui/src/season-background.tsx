'use client'

import React, { useEffect, useRef } from 'react'
import { useSeason } from './season-provider'

export function SeasonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { season } = useSeason()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; size: number; speed: number; opacity: number; swing: number; swingOffset: number }[] = []
    const COUNT = 30

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 6 + 3,
        speed: Math.random() * 0.6 + 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        swing: Math.random() * 2 - 1,
        swingOffset: Math.random() * Math.PI * 2,
      })
    }

    let frame = 0
    let animId: number

    const CONFIGS: Record<string, { color: string; shape: 'circle' | 'leaf' | 'flake' }> = {
      ilkbahar: { color: '#5BA87A', shape: 'leaf' },
      yaz:      { color: '#F5B831', shape: 'circle' },
      sonbahar: { color: '#D4622A', shape: 'leaf' },
      kis:      { color: '#A8C8E8', shape: 'flake' },
    }

    const cfg = CONFIGS[season] ?? CONFIGS.ilkbahar

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      frame++

      for (const p of particles) {
        ctx!.save()
        ctx!.globalAlpha = p.opacity
        ctx!.fillStyle = cfg.color

        const swingX = Math.sin(frame * 0.02 + p.swingOffset) * p.swing * 20

        if (cfg.shape === 'leaf') {
          ctx!.translate(p.x + swingX, p.y)
          ctx!.rotate(frame * 0.01 + p.swingOffset)
          ctx!.beginPath()
          ctx!.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2)
          ctx!.fill()
        } else if (cfg.shape === 'flake') {
          ctx!.translate(p.x + swingX, p.y)
          ctx!.beginPath()
          ctx!.arc(0, 0, p.size * 0.5, 0, Math.PI * 2)
          ctx!.fill()
        } else {
          ctx!.beginPath()
          ctx!.arc(p.x + swingX, p.y, p.size * 0.5, 0, Math.PI * 2)
          ctx!.fill()
        }

        ctx!.restore()

        if (season === 'kis' || season === 'sonbahar') {
          p.y += p.speed
          if (p.y > canvas!.height) { p.y = -10; p.x = Math.random() * canvas!.width }
        } else {
          p.y -= p.speed
          if (p.y < -10) { p.y = canvas!.height + 10; p.x = Math.random() * canvas!.width }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [season])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.35,
      }}
      aria-hidden="true"
    />
  )
}
