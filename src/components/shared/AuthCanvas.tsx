'use client'
import { useEffect, useRef } from 'react'

export function AuthCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.2,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      o: Math.random() * 0.6 + 0.1,
    }))

    const canvas = c as HTMLCanvasElement
    let raf: number
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.7)
      g.addColorStop(0, 'rgba(17,7,40,1)')
      g.addColorStop(1, 'rgba(5,8,22,1)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = 'rgba(139,92,246,0.06)'
      ctx.lineWidth = 1
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y)
          if (d < 120) {
            ctx.globalAlpha = (1 - d / 120) * 0.3
            ctx.beginPath()
            ctx.moveTo(stars[i].x, stars[i].y)
            ctx.lineTo(stars[j].x, stars[j].y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      stars.forEach(s => {
        s.x += s.dx; s.y += s.dy
        if (s.x < 0) s.x = canvas.width
        if (s.x > canvas.width) s.x = 0
        if (s.y < 0) s.y = canvas.height
        if (s.y > canvas.height) s.y = 0
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180,160,255,${s.o})`
        ctx.fill()
      })

      const orbs = [
        [canvas.width * 0.3, canvas.height * 0.4, 'rgba(59,130,246,0.07)'],
        [canvas.width * 0.7, canvas.height * 0.6, 'rgba(139,92,246,0.08)'],
      ] as [number, number, string][]
      orbs.forEach(([x, y, col]) => {
        const gr = ctx.createRadialGradient(x, y, 0, x, y, 220)
        gr.addColorStop(0, col)
        gr.addColorStop(1, 'transparent')
        ctx.fillStyle = gr
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />
}
