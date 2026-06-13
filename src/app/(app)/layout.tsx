'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Toaster } from '@/components/shared/Toast'

const BOTTOM_NAV = [
  { href: '/dashboard', icon: '⚡', label: 'Inicio' },
  { href: '/pos', icon: '💳', label: 'Vender' },
  { href: '/products', icon: '🏷', label: 'Productos' },
  { href: '/inventory', icon: '📦', label: 'Stock' },
  { href: '/sales', icon: '📊', label: 'Ventas' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    if (isDemo) { setReady(true); return }
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login') } else { setReady(true) }
    })
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#131318' }}>
        <div className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
      </div>
    )
  }

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
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all"
              style={{ color: active ? '#FF6B35' : 'var(--text-muted)' }}
            >
              <span className="text-xl leading-none" style={{ filter: active ? 'drop-shadow(0 0 8px rgba(255,107,53,0.6))' : 'none' }}>{item.icon}</span>
              <span className="text-[9px] font-semibold tracking-wide" style={{ fontFamily: 'Inter', fontWeight: active ? 600 : 400 }}>{item.label}</span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: '#FF6B35', boxShadow: '0 0 8px rgba(255,107,53,0.8)' }} />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
