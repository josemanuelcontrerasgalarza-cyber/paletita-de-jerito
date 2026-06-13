'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { fmtCOP, marginPct, profitPerUnit } from '@/lib/calculations'
import { showToast } from '@/components/shared/Toast'

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
  demoAdd?: (p: { name: string; emoji: string; price: number; cost: number }) => void
}

export function ProductModal({ open, onClose, onSaved, demoAdd }: Props) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🍭')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [loading, setLoading] = useState(false)

  const p = parseFloat(price) || 0
  const c = parseFloat(cost) || 0
  const profit = profitPerUnit(p, c)
  const margin = marginPct(p, c)

  async function handleSave() {
    if (!name || !price) { showToast('Completa nombre y precio', 'error'); return }
    setLoading(true)
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    if (isDemo && demoAdd) {
      demoAdd({ name, emoji: emoji || '🏷', price: p, cost: c })
    } else {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { showToast('No autenticado', 'error'); setLoading(false); return }
      const { error } = await sb.from('products').insert({ user_id: user.id, name, emoji: emoji || '🏷', price: p, cost: c })
      if (error) { showToast(error.message, 'error'); setLoading(false); return }
    }
    showToast(`Producto "${name}" agregado`)
    setName(''); setEmoji('🍭'); setPrice(''); setCost('')
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
            <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/5 text-[#94A3B8] hover:text-white text-sm flex items-center justify-center transition-all">✕</button>
            <div className="text-lg font-black mb-1">🆕 Agregar Producto</div>
            <div className="text-xs text-[#94A3B8] mb-5">Define un nuevo producto para vender</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Nombre">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Paleta de Limón" className={inp} />
              </Field>
              <Field label="Emoji">
                <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🍭" maxLength={2} className={inp} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Precio de venta (COP)">
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="2500" className={inp} />
              </Field>
              <Field label="Costo por unidad (COP)">
                <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="800" className={inp} />
              </Field>
            </div>
            <div className="bg-blue-500/5 border border-[rgba(59,130,246,0.15)] rounded-xl p-3 mb-5">
              <div className="flex justify-between text-xs py-1"><span className="text-[#94A3B8]">Ganancia por unidad</span><span className="text-[#22C55E] font-semibold">{p > 0 ? fmtCOP(profit) : '—'}</span></div>
              <div className="flex justify-between text-xs py-1"><span className="text-[#94A3B8]">Margen</span><span className="text-[#3B82F6] font-semibold">{p > 0 ? margin.toFixed(1) + '%' : '—'}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
                ✅ Guardar Producto
              </button>
              <button onClick={onClose} className="px-4 rounded-xl border border-white/10 bg-white/4 text-[#94A3B8] text-sm font-semibold hover:text-white transition-all">
                Cancelar
              </button>
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
