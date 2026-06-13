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
  const meta = TITLES[pathname] ?? { title: 'Paletita de Jerito', sub: '' }

  return (
    <>
      <div
        className="sticky top-0 z-10 px-7 py-4 flex items-center justify-between"
        style={{
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          background: 'rgba(14,14,19,0.7)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div>
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>{meta.title}</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontWeight: 300 }}>{meta.sub}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(0,226,158,0.08)', border: '1px solid rgba(0,226,158,0.2)', color: '#00E29E', fontFamily: 'Inter' }}>
            ● Activo
          </div>
          <button
            onClick={() => setSaleOpen(true)}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            + Venta
          </button>
        </div>
      </div>
      <SaleModal open={saleOpen} onClose={() => setSaleOpen(false)} />
    </>
  )
}
