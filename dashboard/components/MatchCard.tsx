import React from 'react'
import { CheckCircle2, XCircle, Clock, Car } from 'lucide-react'

interface MatchCardProps {
  id: number
  make: string
  model: string
  year: number
  price: number
  mileage: number
  imageUrl: string
  status: 'pending_review' | 'approved' | 'rejected'
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export function MatchCard({
  id,
  make,
  model,
  year,
  price,
  mileage,
  imageUrl,
  status,
  onApprove,
  onReject
}: MatchCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-1 shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      {/* Decorative gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="relative z-10 flex flex-col sm:flex-row gap-6 rounded-xl bg-white p-5 dark:bg-zinc-950 h-full">
        {/* Image Section */}
        <div className="relative h-48 w-full sm:w-64 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <img 
            src={imageUrl} 
            alt={`${year} ${make} ${model}`} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {status === 'pending_review' && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm shadow-sm">
              <Clock className="h-3 w-3" /> Review Required
            </div>
          )}
          {status === 'approved' && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm shadow-sm">
              <CheckCircle2 className="h-3 w-3" /> Approved
            </div>
          )}
          {status === 'rejected' && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm shadow-sm">
              <XCircle className="h-3 w-3" /> Rejected
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {year} {make} {model}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Ref: #{id.toString().padStart(5, '0')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  ${price.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <div className="rounded-md bg-zinc-100 p-2 dark:bg-zinc-800">
                  <Car className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Condition</p>
                  <p className="font-medium">Excellent</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <div className="rounded-md bg-zinc-100 p-2 dark:bg-zinc-800">
                  <Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Mileage</p>
                  <p className="font-medium">{mileage.toLocaleString()} mi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {status === 'pending_review' && (
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => onReject(id)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-rose-400 dark:focus:ring-offset-zinc-950"
              >
                <XCircle className="h-4 w-4" /> Reject Match
              </button>
              <button 
                onClick={() => onApprove(id)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve & Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
