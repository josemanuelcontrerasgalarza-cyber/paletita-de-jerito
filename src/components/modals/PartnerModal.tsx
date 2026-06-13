'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { fmtCOP, ownershipPct } from '@/lib/calculations'
import { showToast } from '@/components/shared/Toast'
import { Partner } from '@/lib/types'

const COLORS = ['#3B82F6','#8B5CF6','#22C55E','#F59E0B','#EF4444','#EC4899']

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-[#111827] border border-purple-500/20 rounded-2xl p-7 w-[440px] max-w-[95vw]"
          >
            <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-purple-500 to-blue-500" />
            <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/5 text-[#94A3B8] hover:text-white text-sm flex items-center justify-center">✕</button>
            <div className="text-lg font-black mb-1">👥 Agregar Socio</div>
            <div className="text-xs text-[#94A3B8] mb-5">Registra un nuevo socio inversor</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Nombre"><input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className={inp} /></Field>
              <Field label="Emoji"><input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="😊" maxLength={2} className={inp} /></Field>
            </div>
            <Field label="Inversión (COP)">
              <input type="number" value={investment} onChange={e => setInvestment(e.target.value)} placeholder="50000" className={`${inp} mb-3`} />
            </Field>
            <Field label="Notas">
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional" className={`${inp} mb-4`} />
            </Field>
            <div className="bg-blue-500/5 border border-[rgba(59,130,246,0.15)] rounded-xl p-3 mb-5">
              <div className="flex justify-between text-xs py-1"><span className="text-[#94A3B8]">Total invertido (con nuevo socio)</span><span>{fmtCOP(totalInv)}</span></div>
              <div className="flex justify-between text-xs py-1"><span className="text-[#94A3B8]">% participación</span><span className="text-[#3B82F6] font-semibold">{pct.toFixed(1)}%</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
                👥 Agregar
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
