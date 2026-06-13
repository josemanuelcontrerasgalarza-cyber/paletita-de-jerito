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
  const bizName = typeof window !== 'undefined' ? (localStorage.getItem('pp_demo_biz') || 'BUSINESS OS') : 'BUSINESS OS'

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
    <div className="w-[220px] flex-shrink-0 flex flex-col h-screen sticky top-0 border-r border-[rgba(59,130,246,0.15)] bg-[rgba(13,17,23,0.97)]">
      <div className="px-5 py-5 border-b border-[rgba(59,130,246,0.15)]">
        <div
          className="text-xl font-black"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          PopProfit
        </div>
        <div className="text-[10px] text-[#94A3B8] mt-0.5 tracking-widest uppercase">{bizName}</div>
        {isDemo && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 mt-1 inline-block">DEMO</span>
        )}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium border-l-[3px] transition-all
                ${active
                  ? 'border-[#3B82F6] bg-[rgba(59,130,246,0.12)] text-[#3B82F6]'
                  : 'border-transparent text-[#94A3B8] hover:bg-[rgba(59,130,246,0.07)] hover:text-white'
                }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[rgba(59,130,246,0.15)]">
        <div className="bg-[rgba(34,197,94,0.07)] border border-[rgba(34,197,94,0.15)] rounded-xl p-3 mb-3">
          <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest">Ganancia hoy</div>
          <div className="text-xl font-black text-[#22C55E] mt-0.5">{fmtCOP(todayProfit)}</div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Vendidas: {todaySold} uds</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 rounded-lg border border-red-500/20 bg-red-500/5 text-[#EF4444] text-xs font-semibold hover:bg-red-500/10 transition-all"
        >
          ↩ Cerrar sesión
        </button>
      </div>
    </div>
  )
}
