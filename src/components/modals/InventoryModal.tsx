'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { fmtCOP } from '@/lib/calculations'
import { showToast } from '@/components/shared/Toast'

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
  products: Product[]
  demoAdd?: (item: { product_id: string; qty: number; cost_per_unit: number; supplier: string | null }) => void
}

export function InventoryModal({ open, onClose, onSaved, products, demoAdd }: Props) {
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState('10')
  const [totalCost, setTotalCost] = useState('')
  const [supplier, setSupplier] = useState('')
  const [loading, setLoading] = useState(false)

  const q = parseInt(qty) || 0
  const tc = parseFloat(totalCost) || 0
  const costPerUnit = q > 0 ? tc / q : 0

  async function handleSave() {
    if (!productId && products.length > 0) { showToast('Selecciona un producto', 'error'); return }
    if (!q || !tc) { showToast('Ingresa cantidad y costo', 'error'); return }
    setLoading(true)
    const pid = productId || products[0]?.id
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    if (isDemo && demoAdd) {
      demoAdd({ product_id: pid, qty: q, cost_per_unit: costPerUnit, supplier: supplier || null })
    } else {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { showToast('No autenticado', 'error'); setLoading(false); return }
      const existing = await sb.from('inventory').select('id,qty').eq('user_id', user.id).eq('product_id', pid).single()
      if (existing.data) {
        await sb.from('inventory').update({ qty: existing.data.qty + q, cost_per_unit: costPerUnit, supplier: supplier || null }).eq('id', existing.data.id)
      } else {
        await sb.from('inventory').insert({ user_id: user.id, product_id: pid, qty: q, cost_per_unit: costPerUnit, supplier: supplier || null })
      }
    }
    showToast(`Inventario actualizado +${q} unidades`)
    setQty('10'); setTotalCost(''); setSupplier('')
    setLoading(false)
    onSaved?.()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass specular w-full sm:w-[440px] max-w-[95vw] rounded-t-3xl sm:rounded-3xl p-7 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,219,60,0.6), rgba(255,107,53,0.4), transparent)' }} />
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>✕</button>

            <div className="text-lg font-bold mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📦 Agregar Inventario</div>
            <div className="text-xs mb-5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontWeight: 300 }}>Registra una compra de stock</div>

            <Field label="Producto">
              <select value={productId} onChange={e => setProductId(e.target.value)} className="input-glass">
                {products.map(p => <option key={p.id} value={p.id} style={{ background: '#131318' }}>{p.emoji} {p.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3 mt-3 mb-3">
              <Field label="Cantidad (unidades)">
                <input type="number" value={qty} onChange={e => setQty(e.target.value)} min="1" className="input-glass" />
              </Field>
              <Field label="Costo total (COP)">
                <input type="number" value={totalCost} onChange={e => setTotalCost(e.target.value)} placeholder="8000" className="input-glass" />
              </Field>
            </div>
            <Field label="Proveedor (opcional)">
              <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Nombre del proveedor" className="input-glass mb-4" />
            </Field>

            <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(255,219,60,0.05)', border: '1px solid rgba(255,219,60,0.12)' }}>
              <div className="flex justify-between text-xs py-1"><span style={{ color: 'var(--text-muted)' }}>Costo por unidad</span><span className="mono font-semibold">{q > 0 && tc > 0 ? fmtCOP(costPerUnit) : '—'}</span></div>
              <div className="flex justify-between text-xs py-1.5 mt-1 border-t font-semibold" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#FFDB3C' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Inversión total</span>
                <span className="mono">{tc > 0 ? fmtCOP(tc) : '—'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Guardando...' : '📦 Agregar'}
              </button>
              <button onClick={onClose} className="btn-glass px-5">Cancelar</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{label}</label>
      {children}
    </div>
  )
}
