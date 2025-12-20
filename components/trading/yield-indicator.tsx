"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp } from "lucide-react"

export function YieldIndicator() {
  const [yieldEarned, setYieldEarned] = useState(127.84)

  useEffect(() => {
    const interval = setInterval(() => {
      setYieldEarned((prev) => prev + 0.0023)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg shadow-pink-500/25">
      <Sparkles className="w-4 h-4 text-white" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-pink-100">Earning</span>
        <span className="text-sm font-bold text-white">${yieldEarned.toFixed(2)}</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-green-300 bg-white/20 px-2 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3" />
          8.2%
        </span>
      </div>
    </div>
  )
}
