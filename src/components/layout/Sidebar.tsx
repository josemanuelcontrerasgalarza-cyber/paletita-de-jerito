'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSales } from '@/lib/hooks/useSales'
import { fmtCOP } from '@/lib/calculations'
import { createClient } from '@/lib/supabase'

const NAV = [
  { href: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { href: '/pos', icon: '💳', label: 'Punto de Venta' },
  { href: '/products', icon: '🏷', label: 'Productos' },
  { href: '/inventory', icon: '📦', label: 'Inventario' },
  { href: '/sales', icon: '📊', label: 'Ventas' },
  { href: '/partners', icon: '👥', label: 'Socios' },
  { href: '/reinvest', icon: '🚀', label: 'Reinversión' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sales } = useSales()
  const isDemo = typeof window !== 'undefined' && localStorage.getItem('pp_demo') === 'true'
  const bizName = typeof window !== 'undefined' ? (localStorage.getItem('pp_demo_biz') || 'Mi Negocio') : 'Mi Negocio'

  const todayStr = new Date().toDateString()
  const todaySales = sales.filter(s => new Date(s.created_at).toDateString() === todayStr)
  const todayProfit = todaySales.reduce((a, s) => a + s.profit, 0)
  const todaySold = todaySales.reduce((a, s) => a + s.qty, 0)

  async function handleLogout() {
    if (isDemo) {
      localStorage.removeItem('pp_demo')
      localStorage.removeItem('pp_demo_biz')
      localStorage.removeItem('pp_demo_name')
    } else {
      const sb = createClient()
      await sb.auth.signOut()
    }
    router.push('/login')
  }

  return (
    <div
      className="w-[230px] flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        background: 'rgba(14,14,19,0.85)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="text-2xl pulse-glow">🍭</div>
          <div>
            <div className="text-base font-bold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: 'linear-gradient(135deg,#FF6B35,#FFDB3C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Paletita
            </div>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>de Jerito</div>
          </div>
        </div>
        <div className="text-[10px] mt-2 truncate" style={{ color: 'var(--text-muted)' }}>{bizName}</div>
        {isDemo && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block" style={{ background: 'rgba(255,219,60,0.1)', color: '#FFDB3C', border: '1px solid rgba(255,219,60,0.2)' }}>DEMO</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto px-3">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all"
              style={{
                fontFamily: 'Inter',
                fontWeight: active ? 600 : 400,
                background: active ? 'rgba(255,107,53,0.1)' : 'transparent',
                color: active ? '#FF6B35' : 'var(--text-muted)',
                border: active ? '1px solid rgba(255,107,53,0.2)' : '1px solid transparent',
                boxShadow: active ? '0 0 12px rgba(255,107,53,0.1)' : 'none',
              }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Today stats */}
      <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="rounded-2xl p-4 mt-4 mb-3 relative overflow-hidden" style={{ background: 'rgba(0,226,158,0.06)', border: '1px solid rgba(0,226,158,0.12)' }}>
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,226,158,0.15), transparent 70%)' }} />
          <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>Ganancia hoy</div>
          <div className="text-xl font-bold mono" style={{ color: '#00E29E' }}>{fmtCOP(todayProfit)}</div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{todaySold} unidades vendidas</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(255,77,79,0.06)', border: '1px solid rgba(255,77,79,0.15)', color: '#FF4D4F', fontFamily: 'Inter' }}
        >
          ↩ Cerrar sesión
        </button>
      </div>
    </div>
  )
}
