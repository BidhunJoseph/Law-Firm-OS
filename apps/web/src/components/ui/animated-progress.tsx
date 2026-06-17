"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  indicatorClassName?: string
}

export function AnimatedProgress({ value, max = 100, className, indicatorClassName }: AnimatedProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn("h-2.5 w-full bg-slate-100 rounded-full overflow-hidden", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 relative",
          indicatorClassName
        )}
      >
        <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }} />
      </motion.div>
    </div>
  )
}
