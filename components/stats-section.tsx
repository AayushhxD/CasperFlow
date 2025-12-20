"use client"

import { useEffect, useState, useRef } from "react"
import { DollarSign, Users, TrendingUp, Percent, ArrowUpRight } from "lucide-react"

const stats = [
  {
    label: "Total Volume",
    targetValue: 847,
    suffix: "M+",
    prefix: "$",
    icon: DollarSign,
    change: "+24.5%",
    color: "from-pink-500 to-rose-500",
  },
  {
    label: "Active Traders",
    targetValue: 28473,
    suffix: "",
    prefix: "",
    icon: Users,
    change: "+12.3%",
    color: "from-purple-500 to-pink-500",
  },
  {
    label: "Yield Distributed",
    targetValue: 12.8,
    suffix: "M",
    prefix: "$",
    icon: TrendingUp,
    change: "+18.7%",
    color: "from-rose-500 to-orange-400",
  },
  {
    label: "Average APY",
    targetValue: 8.2,
    suffix: "%",
    prefix: "",
    icon: Percent,
    change: "Stable",
    color: "from-green-500 to-emerald-500",
  },
]

function useCountUp(target: number, isVisible: boolean, duration: number = 1500) {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)
  
  useEffect(() => {
    if (!isVisible || hasAnimated.current) return
    
    hasAnimated.current = true
    const startTime = Date.now()
    const isDecimal = target % 1 !== 0
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = target * easeOut
      
      setCount(isDecimal ? Math.round(current * 10) / 10 : Math.round(current))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }
    
    requestAnimationFrame(animate)
  }, [target, isVisible, duration])
  
  return count
}

function StatCard({ stat, isVisible }: { stat: typeof stats[0], isVisible: boolean }) {
  const count = useCountUp(stat.targetValue, isVisible)
  const Icon = stat.icon
  
  const formattedValue = stat.targetValue % 1 !== 0 
    ? count.toFixed(1) 
    : count.toLocaleString()

  return (
    <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 hover:border-pink-200 transition-colors hover:shadow-xl hover:shadow-pink-500/5">
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            {stat.change}
          </span>
        </div>
        
        <div className="text-3xl md:text-4xl font-black text-foreground mb-1 tracking-tight">
          {stat.prefix}{formattedValue}{stat.suffix}
        </div>
        <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
      </div>
    </div>
  )
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <section ref={sectionRef} className="relative py-24 px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50/50 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-pink-100 text-pink-600 text-sm font-semibold mb-4">
            Platform Statistics
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            Numbers Don't Lie
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time metrics from our growing DeFi ecosystem
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}
