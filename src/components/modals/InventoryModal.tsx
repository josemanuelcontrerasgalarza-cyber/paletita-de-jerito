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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-[#111827] border border-purple-500/20 rounded-2xl p-7 w-[440px] max-w-[95vw]"
          >
            <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-purple-500 to-blue-500" />
            <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/5 text-[#94A3B8] hover:text-white text-sm flex items-center justify-center">✕</button>
            <div className="text-lg font-black mb-1">📦 Agregar Inventario</div>
            <div className="text-xs text-[#94A3B8] mb-5">Registra una compra de stock</div>
            <Field label="Producto">
              <select value={productId} onChange={e => setProductId(e.target.value)} className={inp}>
                {products.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3 mb-3 mt-3">
              <Field label="Cantidad (unidades)">
                <input type="number" value={qty} onChange={e => setQty(e.target.value)} min="1" className={inp} />
              </Field>
              <Field label="Costo total (COP)">
                <input type="number" value={totalCost} onChange={e => setTotalCost(e.target.value)} placeholder="8000" className={inp} />
              </Field>
            </div>
            <Field label="Proveedor (opcional)">
              <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Nombre del proveedor" className={`${inp} mt-3 mb-4`} />
            </Field>
            <div className="bg-blue-500/5 border border-[rgba(59,130,246,0.15)] rounded-xl p-3 mb-5">
              <div className="flex justify-between text-xs py-1"><span className="text-[#94A3B8]">Costo por unidad</span><span className="font-semibold">{q > 0 && tc > 0 ? fmtCOP(costPerUnit) : '—'}</span></div>
              <div className="flex justify-between text-xs py-1 border-t border-white/5 mt-1 pt-2 font-bold text-sm"><span className="text-[#94A3B8]">Inversión total</span><span>{tc > 0 ? fmtCOP(tc) : '—'}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
                📦 Agregar
              </button>
              <button onClick={onClose} className="px-4 rounded-xl border border-white/10 bg-white/4 text-[#94A3B8] text-sm font-semibold hover:text-white transition-all">Cancelar</button>
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
      <label className="block text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  )
}

const inp = 'w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-all placeholder:text-white/20'
