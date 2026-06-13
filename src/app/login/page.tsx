'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthCanvas } from '@/components/shared/AuthCanvas'
import { createClient } from '@/lib/supabase'
import { showToast } from '@/components/shared/Toast'
import { Toaster } from '@/components/shared/Toast'

const FLOATING = [
  { emoji: '🍭', top: '15%', left: '10%', delay: '0s', size: '32px' },
  { emoji: '💰', top: '68%', left: '7%', delay: '-2s', size: '24px' },
  { emoji: '🍓', top: '22%', right: '9%', delay: '-1s', size: '30px' },
  { emoji: '📦', top: '72%', right: '11%', delay: '-3s', size: '22px' },
  { emoji: '📈', top: '45%', left: '4%', delay: '-4s', size: '20px' },
  { emoji: '🥭', top: '10%', right: '20%', delay: '-1.5s', size: '20px' },
]

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  const [regBiz, setRegBiz] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')

  async function handleLogin() {
    if (!loginEmail || !loginPass) { showToast('Completa todos los campos', 'error'); return }
    setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({ email: loginEmail, password: loginPass })
    setLoading(false)
    if (error) { showToast(error.message, 'error'); return }
    router.push('/dashboard')
  }

  async function handleGoogle() {
    const sb = createClient()
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : '/auth/callback'
    await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  }

  async function handleRegister() {
    if (!regBiz || !regName || !regEmail || !regPass) { showToast('Completa todos los campos', 'error'); return }
    if (regPass.length < 6) { showToast('Contraseña mínimo 6 caracteres', 'error'); return }
    setLoading(true)
    const sb = createClient()
    const { data, error } = await sb.auth.signUp({ email: regEmail, password: regPass })
    if (error) { showToast(error.message, 'error'); setLoading(false); return }
    if (data.user) {
      await sb.from('profiles').insert({ id: data.user.id, name: regName, biz_name: regBiz })
    }
    setLoading(false)
    router.push('/dashboard')
  }

  function handleDemo() {
    localStorage.setItem('pp_demo', 'true')
    localStorage.setItem('pp_demo_biz', 'Paletita de Jerito')
    localStorage.setItem('pp_demo_name', 'Demo User')
    router.push('/dashboard')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e0e13 0%, #1a0a2e 50%, #0e0e13 100%)' }}>
      <AuthCanvas />
      <Toaster />

      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.1), transparent 70%)', top: '-100px', left: '-100px' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)', bottom: '-50px', right: '-50px' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,226,158,0.06), transparent 70%)', top: '40%', right: '20%' }} />
      </div>

      {FLOATING.map((f, i) => (
        <div
          key={i}
          className="absolute pointer-events-none animate-float"
          style={{
            top: f.top, left: f.left, right: (f as any).right,
            fontSize: f.size, animationDelay: f.delay,
            filter: 'drop-shadow(0 4px 16px rgba(255,107,53,0.5))',
          }}
        >
          {f.emoji}
        </div>
      ))}

      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-3 pulse-glow">🍭</div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: 'linear-gradient(135deg,#FF6B35,#FFDB3C,#00E29E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Paletita de Jerito
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Inter', fontWeight: 300 }}>
            Tu negocio, sin límites
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass specular rounded-3xl p-8 w-[400px] max-w-[95vw] relative overflow-hidden"
        >
          {/* Specular top edge */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,107,53,0.6), rgba(0,226,158,0.4), transparent)' }} />

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: tab === t ? 'rgba(255,107,53,0.15)' : 'transparent',
                  color: tab === t ? '#FF6B35' : 'var(--text-muted)',
                  border: tab === t ? '1px solid rgba(255,107,53,0.25)' : '1px solid transparent',
                  boxShadow: tab === t ? '0 0 12px rgba(255,107,53,0.15)' : 'none',
                }}
              >
                {t === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <Field label="Correo electrónico">
                  <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" placeholder="tu@correo.com" className="input-glass" />
                </Field>
                <Field label="Contraseña">
                  <input value={loginPass} onChange={e => setLoginPass(e.target.value)} type="password" placeholder="••••••••" className="input-glass" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </Field>
                <button onClick={handleLogin} disabled={loading} className="btn-primary w-full mt-2 mb-4">
                  {loading ? 'Entrando...' : 'Entrar →'}
                </button>
                <div className="relative text-center text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  <span className="relative z-10 px-3" style={{ background: 'transparent' }}>o continúa con</span>
                  <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <button onClick={handleGoogle} className="btn-glass w-full flex items-center justify-center gap-2 mb-3">
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Continuar con Google
                </button>
                <button onClick={handleDemo} className="w-full py-2.5 text-xs font-semibold transition-all rounded-full" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  ⚡ Modo demo
                </button>
              </motion.div>
            ) : (
              <motion.div key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nombre del negocio">
                    <input value={regBiz} onChange={e => setRegBiz(e.target.value)} placeholder="Paletita de Jerito" className="input-glass" />
                  </Field>
                  <Field label="Tu nombre">
                    <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Jerónimo" className="input-glass" />
                  </Field>
                </div>
                <Field label="Correo electrónico">
                  <input value={regEmail} onChange={e => setRegEmail(e.target.value)} type="email" placeholder="tu@correo.com" className="input-glass" />
                </Field>
                <Field label="Contraseña">
                  <input value={regPass} onChange={e => setRegPass(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" className="input-glass" />
                </Field>
                <button onClick={handleRegister} disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{label}</label>
      {children}
    </div>
  )
}
