'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'error'

interface ToastItem {
  id: string
  msg: string
  type: ToastType
}

let addToast: (msg: string, type?: ToastType) => void = () => {}

export function showToast(msg: string, type: ToastType = 'success') {
  addToast(msg, type)
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    addToast = (msg, type = 'success') => {
      const id = Math.random().toString(36).slice(2)
      setToasts(t => [...t, { id, msg, type }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
    }
  }, [])

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-lg border
              ${t.type === 'success'
                ? 'bg-[#111827] border-green-500/40'
                : 'bg-[#111827] border-red-500/40'
              }`}
          >
            {t.type === 'success' ? '✅ ' : '⚠️ '}{t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
