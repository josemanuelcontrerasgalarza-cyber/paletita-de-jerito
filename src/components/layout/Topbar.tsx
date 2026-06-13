'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SaleModal } from '@/components/modals/SaleModal'

const TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Dashboard', sub: 'Resumen general del negocio' },
  '/pos': { title: 'Punto de Venta', sub: 'Cobra rápido y fácil' },
  '/products': { title: 'Mis Productos', sub: 'Gestiona tu catálogo' },
  '/inventory': { title: 'Inventario', sub: 'Control de stock' },
  '/sales': { title: 'Ventas', sub: 'Historial de transacciones' },
  '/partners': { title: 'Socios', sub: 'Gestión de inversores' },
  '/reinvest': { title: 'Reinversión', sub: 'Proyecta tu crecimiento' },
}

export function Topbar() {
  const pathname = usePathname()
  const [saleOpen, setSaleOpen] = useState(false)
  const meta = TITLES[pathname] ?? { title: 'PopProfit', sub: '' }

  return (
    <>
      <div className="sticky top-0 z-10 px-7 py-4 border-b border-[rgba(59,130,246,0.15)] flex items-center justify-between bg-[rgba(5,8,22,0.85)] backdrop-blur-md">
        <div>
          <div className="text-lg font-bold">{meta.title}</div>
          <div className="text-xs text-[#94A3B8] mt-0.5">{meta.sub}</div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/12 border border-green-500/25 text-[#22C55E]">
            🟢 Activo
          </div>
          <button
            onClick={() => setSaleOpen(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 hover:-translate-y-0.5 transition-all"
          >
            + Venta
          </button>
        </div>
      </div>
      <SaleModal open={saleOpen} onClose={() => setSaleOpen(false)} />
    </>
  )
}
