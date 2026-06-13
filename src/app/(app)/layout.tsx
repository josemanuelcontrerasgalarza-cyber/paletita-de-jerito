'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Toaster } from '@/components/shared/Toast'

const BOTTOM_NAV = [
  { href: '/dashboard', icon: '⚡', label: 'Inicio' },
  { href: '/pos', icon: '💳', label: 'Vender' },
  { href: '/inventory', icon: '📦', label: 'Stock' },
  { href: '/sales', icon: '📊', label: 'Ventas' },
]

const MORE_NAV = [
  { href: '/products', icon: '🏷', label: 'Productos' },
  { href: '/partners', icon: '👥', label: 'Socios' },
  { href: '/reinvest', icon: '🚀', label: 'Reinversión' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    if (isDemo) { setReady(true); return }
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login') } else { setReady(true) }
    })
  }, [router])

  useEffect(() => { setMoreOpen(false) }, [pathname])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#131318' }}>
        <div className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
      </div>
    )
  }

  const moreActive = MORE_NAV.some(i => pathname === i.href)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#131318' }}>
      <Toaster />

      {/* Sidebar — solo desktop */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />
        <main className="flex-1 p-4 md:p-7 pb-24 md:pb-7">
          {children}
        </main>
      </div>

      {/* More drawer */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMoreOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-20 left-4 right-4 z-50 md:hidden rounded-2xl overflow-hidden"
              style={{
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                background: 'rgba(19,19,24,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {MORE_NAV.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 px-5 py-4 transition-all"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: pathname === item.href ? '#FF6B35' : 'var(--text)',
                    background: pathname === item.href ? 'rgba(255,107,53,0.06)' : 'transparent',
                  }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.label}</span>
                  {pathname === item.href && <span className="ml-auto w-2 h-2 rounded-full" style={{ background: '#FF6B35' }} />}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom nav — solo móvil */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
        style={{
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          background: 'rgba(14,14,19,0.92)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {BOTTOM_NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative transition-all"
              style={{ color: active ? '#FF6B35' : 'var(--text-muted)' }}
            >
              <span className="text-xl leading-none" style={{ filter: active ? 'drop-shadow(0 0 8px rgba(255,107,53,0.6))' : 'none' }}>{item.icon}</span>
              <span className="text-[9px] font-semibold tracking-wide" style={{ fontFamily: 'Inter', fontWeight: active ? 600 : 400 }}>{item.label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: '#FF6B35', boxShadow: '0 0 8px rgba(255,107,53,0.8)' }} />}
            </Link>
          )
        })}

        {/* Botón Más */}
        <button
          onClick={() => setMoreOpen(v => !v)}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative transition-all"
          style={{ color: moreActive || moreOpen ? '#FF6B35' : 'var(--text-muted)' }}
        >
          <span className="text-xl leading-none" style={{ filter: moreActive || moreOpen ? 'drop-shadow(0 0 8px rgba(255,107,53,0.6))' : 'none' }}>
            {moreOpen ? '✕' : '☰'}
          </span>
          <span className="text-[9px] font-semibold tracking-wide" style={{ fontFamily: 'Inter' }}>Más</span>
          {(moreActive || moreOpen) && <span className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: '#FF6B35', boxShadow: '0 0 8px rgba(255,107,53,0.8)' }} />}
        </button>
      </nav>
    </div>
  )
}
