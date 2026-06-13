'use client'
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface Props {
  icon: string
  label: string
  value: string
  color?: string
  delay?: number
}

export function StatCard({ icon, label, value, color = '#3B82F6', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl p-5 border border-[rgba(59,130,246,0.15)] bg-[#1F2937] hover:-translate-y-1 transition-transform duration-200"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(59,130,246,0.4)] to-transparent" />
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-[10px] uppercase tracking-widest font-semibold text-[#94A3B8] mb-1">{label}</div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
    </motion.div>
  )
}
