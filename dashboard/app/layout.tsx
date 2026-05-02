import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { CarFront, ShieldCheck, LayoutDashboard } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TORQai | Dealer Sourcing Dashboard',
  description: 'AI-powered vehicle sourcing platform for independent auto dealers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className={`${inter.className} flex h-full flex-col`}>
        {/* Global Header */}
        <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-slate-950 shadow-lg shadow-yellow-500/20">
              <CarFront className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              TORQ<span className="gold-gradient">ai</span>
            </span>
          </div>
          
          <nav className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-yellow-500 transition-colors">
              <LayoutDashboard className="h-4 w-4 transition-transform group-hover:scale-110" /> Intake
            </Link>
            <Link href="/approvals" className="group flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-yellow-500 transition-colors">
              <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-110" /> Approvals Gate
            </Link>
            <div className="ml-2 flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
              <span className="text-xs font-bold text-yellow-500">DLR</span>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
