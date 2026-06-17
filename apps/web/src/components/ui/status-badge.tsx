import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, Clock, XCircle, ShieldAlert, Zap } from 'lucide-react'

type BadgeType = 'status' | 'risk' | 'phase'
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'

interface StatusBadgeProps {
  type?: BadgeType
  value: string
  className?: string
  pulse?: boolean
}

export function StatusBadge({ type = 'status', value, className, pulse = false }: StatusBadgeProps) {
  const getVariant = (): { variant: BadgeVariant, label: string } => {
    const v = value.toLowerCase()
    
    if (type === 'risk') {
      if (v === 'low' || v === 'green') return { variant: 'success', label: 'Low Risk' }
      if (v === 'medium' || v === 'amber') return { variant: 'warning', label: 'Medium Risk' }
      if (v === 'high' || v === 'red') return { variant: 'danger', label: 'High Risk' }
    }

    if (type === 'status') {
      if (v === 'open' || v === 'active') return { variant: 'accent', label: value }
      if (v === 'closed' || v === 'completed') return { variant: 'success', label: value }
      if (v === 'pending' || v === 'waiting') return { variant: 'warning', label: value }
    }

    // Default for phase or unknown
    return { variant: 'neutral', label: value }
  }

  const { variant, label } = getVariant()

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
    info: 'bg-blue-50 text-blue-700 border-blue-200/60',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200/60',
  }

  const Icon = () => {
    if (variant === 'success') return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
    if (variant === 'warning') return <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
    if (variant === 'danger') return <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
    if (variant === 'accent') return <Zap className="w-3.5 h-3.5 mr-1.5" />
    return <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border shadow-sm",
        variantStyles[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-2">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", variant === 'danger' ? 'bg-rose-400' : 'bg-amber-400')}></span>
          <span className={cn("relative inline-flex rounded-full h-2 w-2", variant === 'danger' ? 'bg-rose-500' : 'bg-amber-500')}></span>
        </span>
      )}
      {!pulse && <Icon />}
      {label}
    </span>
  )
}
