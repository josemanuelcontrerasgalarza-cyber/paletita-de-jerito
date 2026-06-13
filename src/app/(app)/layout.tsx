'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Toaster } from '@/components/shared/Toast'
import { showToast } from '@/components/shared/Toast'

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
  const [resetConfirm, setResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    if (isDemo) { setReady(true); return }
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login') } else { setReady(true) }
    })
  }, [router])

  useEffect(() => { setMoreOpen(false) }, [pathname])

  async function handleReset() {
    setResetting(true)
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    if (isDemo) {
      showToast('Datos demo reiniciados', 'error')
      setResetting(false)
      setResetConfirm(false)
      setMoreOpen(false)
      router.refresh()
      return
    }
    try {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { showToast('No autenticado', 'error'); setResetting(false); return }
      await sb.from('sales').delete().eq('user_id', user.id)
      await sb.from('inventory').delete().eq('user_id', user.id)
      await sb.from('products').delete().eq('user_id', user.id)
      await sb.from('partners').delete().eq('user_id', user.id)
      showToast('Todos los datos han sido eliminados')
      setResetConfirm(false)
      setMoreOpen(false)
      router.push('/dashboard')
    } catch {
      showToast('Error al resetear', 'error')
    }
    setResetting(false)
  }

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

      {/* Modal de confirmación reset */}
      <AnimatePresence>
        {resetConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card p-6 w-full max-w-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,77,79,0.8), transparent)' }} />
              <div className="text-3xl mb-3 text-center">⚠️</div>
              <div className="text-base font-bold text-center mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>¿Eliminar todos los datos?</div>
              <div className="text-sm text-center mb-5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontWeight: 300 }}>
                Se borrarán <strong style={{ color: '#FF4D4F' }}>todas las ventas, productos, inventario y socios</strong>. Esta acción no se puede deshacer.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setResetConfirm(false)}
                  className="btn-glass flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="flex-1 py-3 rounded-full text-sm font-bold transition-all disabled:opacity-50"
                  style={{ background: 'rgba(255,77,79,0.15)', border: '1px solid rgba(255,77,79,0.3)', color: '#FF4D4F', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: resetting ? 'none' : '0 0 16px rgba(255,77,79,0.2)' }}
                >
                  {resetting ? 'Eliminando...' : '🗑 Sí, eliminar todo'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

              {/* Reset button */}
              <button
                onClick={() => { setResetConfirm(true); setMoreOpen(false) }}
                className="w-full flex items-center gap-4 px-5 py-4 transition-all"
                style={{ color: '#FF4D4F' }}
              >
                <span className="text-2xl">🗑</span>
                <span className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Resetear datos</span>
              </button>
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
