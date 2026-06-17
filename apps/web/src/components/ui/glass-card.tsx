import React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  noPadding?: boolean
}

export function GlassCard({ children, className, noPadding = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative bg-white/95 backdrop-blur-3xl border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:border-slate-200/60",
        !noPadding && "p-6 md:p-8",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
