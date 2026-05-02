import React, { useState } from 'react'
import { CheckCircle2, XCircle, Clock, Car, Award, ShieldAlert, Users, MapPin, Activity } from 'lucide-react'

export interface Match {
  id: number
  vin: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  owners: number
  damage: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recalls: any[]
  location: string
  ai_match_score: number
  image_url: string
  photos: string[]
  status: string
  requests: { dealer_id: string }
}

interface PremiumMatchCardProps {
  match: Match
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export default function PremiumMatchCard({ match, onApprove, onReject }: PremiumMatchCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const isBestMatch = match.ai_match_score >= 90
  const photos = match.photos && match.photos.length > 0 ? match.photos : [match.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600']

  return (
    <div className="glass-panel relative flex flex-col md:flex-row overflow-hidden rounded-3xl transition-all hover:border-slate-700">
      {isBestMatch && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1.5 border border-yellow-500/50 backdrop-blur-md shadow-lg shadow-yellow-500/10">
          <Award className="h-4 w-4 text-yellow-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-500">Best Match</span>
        </div>
      )}

      {/* Photo Carousel Area */}
      <div className="relative md:w-2/5 h-64 md:h-auto shrink-0 group">
        <img
          src={photos[photoIndex]}
          alt={`${match.year} ${match.make} ${match.model}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        
        {/* Match Score Meter */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-950/80 border-2 border-slate-800 backdrop-blur-sm">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="26" cy="26" r="24" className="stroke-slate-800" strokeWidth="4" fill="none" />
              <circle cx="26" cy="26" r="24" className="stroke-yellow-500 transition-all duration-1000" strokeWidth="4" fill="none" strokeDasharray="150" strokeDashoffset={150 - (150 * match.ai_match_score) / 100} />
            </svg>
            <span className="text-sm font-bold text-white">{match.ai_match_score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Score</span>
            <span className="text-lg font-bold text-white leading-tight">Match</span>
          </div>
        </div>

        {/* VIN Badge */}
        <div className="absolute bottom-4 right-4 rounded-lg bg-slate-950/80 px-3 py-1.5 border border-slate-800 backdrop-blur-sm">
          <span className="font-mono text-xs text-slate-300">{match.vin}</span>
        </div>

        {/* Carousel Controls */}
        {photos.length > 1 && (
          <div className="absolute inset-y-0 left-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setPhotoIndex(p => p === 0 ? photos.length - 1 : p - 1)} className="m-2 rounded-full bg-slate-950/50 p-2 text-white hover:bg-yellow-500 hover:text-slate-950 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
          </div>
        )}
        {photos.length > 1 && (
          <div className="absolute inset-y-0 right-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setPhotoIndex(p => p === photos.length - 1 ? 0 : p + 1)} className="m-2 rounded-full bg-slate-950/50 p-2 text-white hover:bg-yellow-500 hover:text-slate-950 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="flex flex-col flex-1 p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {match.year} {match.make} {match.model}
            </h3>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Car className="h-4 w-4" />
                {match.mileage.toLocaleString()} miles
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {match.location || 'Unknown'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              ${match.price.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-emerald-400">Great Value</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Condition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${match.damage === 'clean' || match.damage === 'none' ? 'bg-emerald-500' : match.damage === 'minor' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="font-medium text-slate-200 capitalize">{match.damage || 'Clean'}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Owners</span>
            </div>
            <span className="font-medium text-slate-200">{match.owners}</span>
          </div>
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recalls</span>
            </div>
            <span className={`font-medium ${match.recalls && match.recalls.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {match.recalls ? match.recalls.length : 0} Found
            </span>
          </div>
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
            </div>
            <span className="font-medium text-blue-400 capitalize">{match.status.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-end gap-4 border-t border-slate-800 pt-6">
          <button
            onClick={() => onReject(match.id)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all border border-slate-700"
          >
            <XCircle className="h-5 w-5" />
            Reject
          </button>
          <button
            onClick={() => onApprove(match.id)}
            className="flex items-center gap-2 rounded-xl gold-gradient-bg px-8 py-3 text-sm font-bold shadow-lg shadow-yellow-500/20 transition-all hover:scale-105"
          >
            <CheckCircle2 className="h-5 w-5 text-slate-950" />
            Approve & Send
          </button>
        </div>
      </div>
    </div>
  )
}
