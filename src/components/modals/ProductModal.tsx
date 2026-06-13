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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass specular w-full sm:w-[440px] max-w-[95vw] rounded-t-3xl sm:rounded-3xl p-7 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,107,53,0.6), rgba(0,226,158,0.4), transparent)' }} />
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>✕</button>

            <div className="text-lg font-bold mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🆕 Nuevo Producto</div>
            <div className="text-xs mb-5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontWeight: 300 }}>Define un producto para tu catálogo</div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Nombre">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Paleta de Limón" className="input-glass" />
              </Field>
              <Field label="Emoji">
                <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🍭" maxLength={2} className="input-glass" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Precio de venta (COP)">
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="2500" className="input-glass" />
              </Field>
              <Field label="Costo por unidad (COP)">
                <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="800" className="input-glass" />
              </Field>
            </div>

            <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.12)' }}>
              <div className="flex justify-between text-xs py-1"><span style={{ color: 'var(--text-muted)' }}>Ganancia por unidad</span><span className="mono font-semibold" style={{ color: '#00E29E' }}>{p > 0 ? fmtCOP(profit) : '—'}</span></div>
              <div className="flex justify-between text-xs py-1"><span style={{ color: 'var(--text-muted)' }}>Margen</span><span className="mono font-semibold" style={{ color: '#FF6B35' }}>{p > 0 ? margin.toFixed(1) + '%' : '—'}</span></div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Guardando...' : '✅ Guardar'}
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
