'use client'

import { useState } from 'react'
import { Car, Search, AlertCircle, DollarSign, Calendar, Zap } from 'lucide-react'

export default function IntakePage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const data = {
      dealer_id: 'DLR-PILOT-01',
      make: formData.get('make'),
      model: formData.get('model'),
      year_min: parseInt(formData.get('year_min') as string),
      year_max: parseInt(formData.get('year_max') as string),
      max_price: parseInt(formData.get('max_price') as string),
    }

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSuccess(true)
      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit request'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-12 mt-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
          Initiate <span className="gold-gradient">AI Sourcing</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Deploy our autonomous agent to scour live inventory across Auto.dev and validate through NHTSA. Review top AI-ranked matches in your Approvals Gate.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="make" className="block text-sm font-semibold text-slate-300">
                Make
              </label>
              <div className="mt-2 relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  name="make"
                  id="make"
                  required
                  placeholder="e.g., Acura"
                  className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 pl-11 text-white shadow-sm ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6 placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-semibold text-slate-300">
                Model
              </label>
              <div className="mt-2 relative">
                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  name="model"
                  id="model"
                  required
                  placeholder="e.g., RDX"
                  className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 pl-11 text-white shadow-sm ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6 placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300">
                Year Range
              </label>
              <div className="mt-2 flex items-center gap-3">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="number"
                    name="year_min"
                    placeholder="Min (e.g., 2010)"
                    required
                    className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 pl-11 text-white shadow-sm ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6 placeholder:text-slate-600 transition-all"
                  />
                </div>
                <span className="text-slate-500">-</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    name="year_max"
                    placeholder="Max (e.g., 2020)"
                    required
                    className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6 placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="max_price" className="block text-sm font-semibold text-slate-300">
                Maximum Price
              </label>
              <div className="mt-2 relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="number"
                  name="max_price"
                  id="max_price"
                  required
                  placeholder="e.g., 8000"
                  className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 pl-11 text-white shadow-sm ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6 placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-950/50 border border-red-900 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-950/50 border border-emerald-900 p-4 flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5">
                <Search className="h-3 w-3 text-emerald-950" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-400">AI Agent Deployed!</p>
                <p className="text-sm text-emerald-200/70 mt-1">Sourcing real inventory now. Check your Approvals Gate for matched vehicles.</p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 rounded-xl gold-gradient-bg py-4 text-sm font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              ) : (
                <>
                  <Search className="h-5 w-5 text-slate-950 group-hover:scale-110 transition-transform" />
                  Deploy Agent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
