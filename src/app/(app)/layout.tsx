'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Toaster } from '@/components/shared/Toast'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    if (isDemo) { setReady(true); return }
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login') } else { setReady(true) }
    })
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816]">
        <div className="text-[#94A3B8] text-sm animate-pulse">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden">
      <Toaster />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />
        <main className="flex-1 p-7">
          {children}
        </main>
      </div>
    </div>
  )
}
