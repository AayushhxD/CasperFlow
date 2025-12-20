"use client"

import { ArrowRight, Coins, Wallet, Globe, Gift, Check } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Stake CSPR",
    description: "Deposit CSPR and receive liquid-staked lsCSPR tokens instantly. Start earning from day one.",
    icon: Coins,
    color: "from-pink-500 to-rose-500",
    highlight: "Instant lsCSPR",
  },
  {
    step: "02",
    title: "Use as Collateral",
    description: "Your lsCSPR serves as collateral for leveraged trading positions up to 10x.",
    icon: Wallet,
    color: "from-purple-500 to-pink-500",
    highlight: "Up to 10x Leverage",
  },
  {
    step: "03",
    title: "Trade Cross-Chain",
    description: "Execute trades across Ethereum, Arbitrum, Polygon, and more with best execution.",
    icon: Globe,
    color: "from-rose-500 to-orange-400",
    highlight: "5+ Chains",
  },
  {
    step: "04",
    title: "Double Rewards",
    description: "Collect trading profits while your staking rewards continue accumulating 24/7.",
    icon: Gift,
    color: "from-green-500 to-emerald-500",
    highlight: "8.2% + Trading Profits",
  },
]

export function HowItWorksSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-pink-100 text-pink-600 text-sm font-semibold mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            Start in <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">4 Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From staking to earning double rewards in under 2 minutes
          </p>
        </div>

        {/* Steps - Alternating layout */}
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className={`flex items-center gap-6 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}
            >
              {/* Step card */}
              <div className="flex-1 group">
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-pink-100 hover:border-pink-200 transition-all hover:shadow-xl hover:shadow-pink-500/5">
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shrink-0`}>
                      <step.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full">
                          STEP {step.step}
                        </span>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {step.highlight}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center line with number */}
              <div className="hidden md:flex flex-col items-center shrink-0 w-16">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg text-white font-bold text-lg`}>
                  {step.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-16 bg-gradient-to-b from-pink-300 to-pink-100 mt-2" />
                )}
              </div>

              {/* Spacer for alternating */}
              <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl shadow-pink-500/25">
            <span className="font-bold text-lg">Ready to start earning?</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>
  )
}
