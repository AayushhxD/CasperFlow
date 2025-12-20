"use client"

import { Layers, Repeat, Shield, TrendingUp, Zap, Globe, Lock, Coins } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Trade with Yield",
    description: "Your collateral earns staking rewards even while being used for leveraged trading positions.",
    color: "from-pink-500 to-rose-500",
    stats: "8.2% APY",
    size: "large",
  },
  {
    icon: Repeat,
    title: "Cross-Chain",
    description: "Execute trades across multiple chains seamlessly.",
    color: "from-purple-500 to-pink-500",
    stats: "5+ Chains",
    size: "small",
  },
  {
    icon: Shield,
    title: "Secure",
    description: "Enterprise-grade security on Casper blockchain.",
    color: "from-green-500 to-emerald-500",
    stats: "100%",
    size: "small",
  },
  {
    icon: Layers,
    title: "Liquid Staking Integration",
    description: "Convert CSPR to lsCSPR and unlock liquidity while maintaining full staking rewards.",
    color: "from-rose-500 to-orange-400",
    stats: "$84M+ TVL",
    size: "large",
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-pink-100 text-pink-600 text-sm font-semibold mb-4">
            Why CasperFlow?
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">DeFi Traders</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The most capital-efficient way to trade crypto while earning passive yield
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Large Card - Trade with Yield */}
          <div className="col-span-2 row-span-2 group relative bg-gradient-to-br from-white to-pink-50/50 rounded-3xl p-8 border border-pink-100 hover:border-pink-200 transition-all hover:shadow-2xl hover:shadow-pink-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-xl shadow-pink-500/30 mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              
              <div className="mb-4">
                <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                  8.2%
                </span>
                <span className="text-lg text-muted-foreground ml-2">APY</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Trade with Yield
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Your collateral earns staking rewards even while being used for leveraged trading positions. Never let your capital sit idle.
              </p>
              
              {/* Visual element */}
              <div className="mt-8 flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 flex-1 bg-gradient-to-t from-pink-500/20 to-pink-500/5 rounded-lg" style={{ height: `${40 + i * 15}px` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Small Card - Cross-Chain */}
          <div className="col-span-1 group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 hover:border-purple-200 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-black text-foreground mb-1">5+</div>
            <div className="text-sm font-semibold text-foreground mb-1">Chains</div>
            <p className="text-xs text-muted-foreground">Cross-chain execution</p>
          </div>

          {/* Small Card - Security */}
          <div className="col-span-1 group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 hover:border-green-200 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-black text-foreground mb-1">100%</div>
            <div className="text-sm font-semibold text-foreground mb-1">Secure</div>
            <p className="text-xs text-muted-foreground">Enterprise-grade</p>
          </div>

          {/* Small Card - Speed */}
          <div className="col-span-1 group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 hover:border-yellow-200 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-black text-foreground mb-1">&lt;1s</div>
            <div className="text-sm font-semibold text-foreground mb-1">Finality</div>
            <p className="text-xs text-muted-foreground">Instant settlement</p>
          </div>

          {/* Small Card - TVL */}
          <div className="col-span-1 group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 hover:border-rose-200 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg mb-4">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-black text-foreground mb-1">$84M+</div>
            <div className="text-sm font-semibold text-foreground mb-1">TVL</div>
            <p className="text-xs text-muted-foreground">Total value locked</p>
          </div>
        </div>

        {/* Bottom highlight card */}
        <div className="mt-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-1">Ready to start earning?</h3>
              <p className="text-pink-100">Join thousands of traders already earning yield on their positions</p>
            </div>
            <button className="px-8 py-3 bg-white text-pink-500 font-bold rounded-xl hover:bg-pink-50 transition-colors whitespace-nowrap">
              Launch App →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
