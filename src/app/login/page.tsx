'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthCanvas } from '@/components/shared/AuthCanvas'
import { createClient } from '@/lib/supabase'
import { showToast } from '@/components/shared/Toast'
import { Toaster } from '@/components/shared/Toast'

const FLOATING = [
  { emoji: '🍭', top: '18%', left: '12%', delay: '0s', size: '28px' },
  { emoji: '💰', top: '65%', left: '8%', delay: '-2s', size: '22px' },
  { emoji: '🍓', top: '25%', right: '10%', delay: '-1s', size: '28px' },
  { emoji: '📦', top: '70%', right: '12%', delay: '-3s', size: '20px' },
  { emoji: '📈', top: '45%', left: '5%', delay: '-4s', size: '18px' },
  { emoji: '🥭', top: '12%', right: '22%', delay: '-1.5s', size: '18px' },
]

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)

  // login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  // register fields
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
    localStorage.setItem('pp_demo_biz', 'PopProfit Demo')
    localStorage.setItem('pp_demo_name', 'Demo User')
    router.push('/dashboard')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AuthCanvas />
      <Toaster />

      {FLOATING.map((f, i) => (
        <div
          key={i}
          className="absolute pointer-events-none animate-float"
          style={{
            top: f.top, left: f.left, right: (f as any).right,
            fontSize: f.size, animationDelay: f.delay,
            filter: 'drop-shadow(0 4px 12px rgba(59,130,246,0.4))',
          }}
        >
          {f.emoji}
        </div>
      ))}

      <div className="relative z-10 flex flex-col items-center">
        <div
          className="text-4xl font-black mb-1"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          PopProfit
        </div>
        <div className="text-xs text-[#94A3B8] tracking-[3px] uppercase mb-8">Tu negocio, sin límites</div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative glass rounded-3xl p-8 w-[380px] max-w-[95vw] overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-blue-500" />
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.1),transparent 70%)' }} />

          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6 gap-1">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all
                  ${tab === t ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white border border-purple-500/30' : 'text-[#94A3B8] hover:text-white'}`}
              >
                {t === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <div>
              <Field label="Correo">
                <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" placeholder="tu@correo.com" className={inp} />
              </Field>
              <Field label="Contraseña">
                <input value={loginPass} onChange={e => setLoginPass(e.target.value)} type="password" placeholder="••••••••" className={inp} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </Field>
              <button onClick={handleLogin} disabled={loading} className={btn}>
                {loading ? 'Entrando...' : 'Entrar →'}
              </button>
              <div className="relative text-center text-[#94A3B8] text-xs my-4">
                <span className="relative z-10 px-2 bg-transparent">o</span>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
              </div>
              <button onClick={handleGoogle} className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continuar con Google
              </button>
              <button onClick={handleDemo} className="w-full py-3 rounded-xl border border-white/10 bg-white/3 text-[#94A3B8] text-sm font-semibold hover:bg-white/6 hover:text-white transition-all">
                ⚡ Entrar con cuenta demo
              </button>
            </div>
          ) : (
            <div>
              <Field label="Nombre del negocio">
                <input value={regBiz} onChange={e => setRegBiz(e.target.value)} placeholder="Ej: Paletas Don Lucho" className={inp} />
              </Field>
              <Field label="Tu nombre">
                <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Tu nombre" className={inp} />
              </Field>
              <Field label="Correo">
                <input value={regEmail} onChange={e => setRegEmail(e.target.value)} type="email" placeholder="tu@correo.com" className={inp} />
              </Field>
              <Field label="Contraseña">
                <input value={regPass} onChange={e => setRegPass(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" className={inp} />
              </Field>
              <button onClick={handleRegister} disabled={loading} className={btn}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  )
}

const inp = 'w-full bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all placeholder:text-white/20'
const btn = 'w-full py-3 mt-1 rounded-xl border-none bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold cursor-pointer hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50'
