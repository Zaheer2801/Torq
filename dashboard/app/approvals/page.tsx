'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PremiumMatchCard, { Match } from '@/components/PremiumMatchCard'
import { ShieldCheck, Loader2 } from 'lucide-react'

export default function ApprovalsPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPendingMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          requests (
            dealer_id
          )
        `)
        .eq('status', 'pending_review')
        .order('ai_match_score', { ascending: false })

      if (error) throw error
      setMatches((data as Match[]) || [])
    } catch (err) {
      console.error('Failed to fetch matches', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingMatches()
  }, [])

  const handleApprove = async (matchId: number) => {
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: matchId, action: 'approve' })
      })
      if (!res.ok) throw new Error('Failed to approve')
      // Optimistic update
      setMatches(matches.filter(m => m.id !== matchId))
    } catch (error) {
      console.error(error)
    }
  }

  const handleReject = async (matchId: number) => {
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: matchId, action: 'reject' })
      })
      if (!res.ok) throw new Error('Failed to reject')
      // Optimistic update
      setMatches(matches.filter(m => m.id !== matchId))
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-12">
      <div className="mb-10 border-b border-slate-800 pb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-yellow-500" />
            Approvals <span className="gold-gradient">Gate</span>
          </h1>
          <p className="mt-3 text-lg text-slate-400">
            Review AI-ranked matches from Auto.dev. Approve to dispatch FTC-compliant communications.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <span className="text-3xl font-bold text-white">{matches.length}</span>
          <span className="text-sm font-medium uppercase tracking-wider text-slate-500">Pending Review</span>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-3xl py-20 text-center">
          <ShieldCheck className="h-16 w-16 text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-300">All caught up</h3>
          <p className="mt-2 text-slate-500 max-w-sm">
            No vehicle matches pending review. Deploy the AI agent to source more inventory.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {matches.map(match => (
            <PremiumMatchCard
              key={match.id}
              match={match}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
