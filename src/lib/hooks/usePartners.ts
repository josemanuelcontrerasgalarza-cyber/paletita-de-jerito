'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Partner } from '@/lib/types'

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  const isDemo = typeof window !== 'undefined' && localStorage.getItem('pp_demo') === 'true'

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    if (isDemo) {
      setPartners([])
      setLoading(false)
      return
    }
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('partners').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setPartners(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => { fetchPartners() }, [fetchPartners])

  return { partners, loading, refetch: fetchPartners, setPartners }
}
