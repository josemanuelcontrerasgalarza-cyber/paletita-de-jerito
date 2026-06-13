'use client'
import { motion } from 'framer-motion'

interface Props {
  icon: string
  label: string
  value: string
  color?: string
  delay?: number
}

export function StatCard({ icon, label, value, color = '#FF6B35', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card specular p-5 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${color}20, transparent 70%)` }} />
      {/* Floating icon */}
      <div className="text-2xl mb-3 relative z-10" style={{ filter: `drop-shadow(0 4px 12px ${color}60)` }}>{icon}</div>
      <div className="text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{label}</div>
      <div className="text-2xl font-bold mono" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    </motion.div>
  )
}
