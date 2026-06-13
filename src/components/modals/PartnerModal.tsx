'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { fmtCOP, ownershipPct } from '@/lib/calculations'
import { showToast } from '@/components/shared/Toast'
import { Partner } from '@/lib/types'

const COLORS = ['#FF6B35','#FFDB3C','#00E29E','#8B5CF6','#FF4D4F','#38BDF8']

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
  existingPartners: Partner[]
  demoAdd?: (p: { name: string; emoji: string; color: string; investment: number; notes: string | null }) => void
}

export function PartnerModal({ open, onClose, onSaved, existingPartners, demoAdd }: Props) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('😊')
  const [investment, setInvestment] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const inv = parseFloat(investment) || 0
  const totalInv = existingPartners.reduce((a, p) => a + p.investment, 0) + inv
  const pct = ownershipPct(inv, totalInv)

  async function handleSave() {
    if (!name) { showToast('Ingresa un nombre', 'error'); return }
    setLoading(true)
    const color = COLORS[existingPartners.length % COLORS.length]
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    if (isDemo && demoAdd) {
      demoAdd({ name, emoji: emoji || '😊', color, investment: inv, notes: notes || null })
    } else {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { showToast('No autenticado', 'error'); setLoading(false); return }
      const { error } = await sb.from('partners').insert({ user_id: user.id, name, emoji: emoji || '😊', color, investment: inv, notes: notes || null })
      if (error) { showToast(error.message, 'error'); setLoading(false); return }
    }
    showToast(`Socio ${name} agregado`)
    setName(''); setEmoji('😊'); setInvestment(''); setNotes('')
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
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(255,107,53,0.4), transparent)' }} />
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>✕</button>

            <div className="text-lg font-bold mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>👥 Agregar Socio</div>
            <div className="text-xs mb-5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontWeight: 300 }}>Registra un nuevo socio inversor</div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Nombre"><input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className="input-glass" /></Field>
              <Field label="Emoji"><input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="😊" maxLength={2} className="input-glass" /></Field>
            </div>
            <Field label="Inversión (COP)">
              <input type="number" value={investment} onChange={e => setInvestment(e.target.value)} placeholder="50000" className="input-glass mb-3" />
            </Field>
            <Field label="Notas">
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional" className="input-glass mb-4" />
            </Field>

            <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div className="flex justify-between text-xs py-1"><span style={{ color: 'var(--text-muted)' }}>Total invertido (con nuevo socio)</span><span className="mono">{fmtCOP(totalInv)}</span></div>
              <div className="flex justify-between text-xs py-1"><span style={{ color: 'var(--text-muted)' }}>% participación</span><span className="mono font-semibold" style={{ color: '#8B5CF6' }}>{pct.toFixed(1)}%</span></div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Guardando...' : '👥 Agregar'}
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
