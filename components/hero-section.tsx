"use client"

import { ArrowRight, Zap, Shield, Globe, TrendingUp, Loader2, Sparkles, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const { connect, isConnecting, isConnected, isCasperWalletInstalled } = useWallet()
  const router = useRouter()

  const handleLaunchApp = async () => {
    if (isConnected) {
      router.push("/trade")
    } else {
      await connect()
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/30 to-purple-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-gradient-to-br from-rose-400/25 to-pink-500/20 rounded-full blur-[80px]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-pink-600">Live on Casper Network</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-6 leading-[1.1] tracking-tight">
              Trade.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600">
                Stake.
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                Earn Forever.
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              The first DeFi protocol on Casper where your collateral <span className="text-pink-500 font-semibold">never stops earning</span>. 
              Trade across chains while staking rewards compound automatically.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {!isCasperWalletInstalled ? (
                <a
                  href="https://www.casperwallet.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl px-8 py-6 text-lg font-bold shadow-2xl shadow-pink-500/25 overflow-hidden transition-all"
                >
                  <Download className="w-5 h-5" />
                  Install Casper Wallet
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <Button
                  onClick={handleLaunchApp}
                  disabled={isConnecting}
                  size="lg"
                  className="group relative bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl px-8 py-6 text-lg font-bold shadow-2xl shadow-pink-500/25 overflow-hidden disabled:opacity-70"
                >
                  {isConnecting ? (
                    <span className="relative z-10 flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting to Casper Wallet...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                        <span className="text-sm">💎</span>
                      </div>
                      Connect & Launch
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              )}
              
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-8 py-6 text-lg font-semibold border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50/50 text-foreground"
              >
                View Docs
              </Button>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { value: "$847M+", label: "Volume" },
                { value: "8.2%", label: "APY" },
                { value: "28K+", label: "Traders" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Feature cards */}
          <div className="relative">
            {/* Main card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-pink-500/10 border border-pink-100">
              {/* Live trading preview */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">lsCSPR/USDT</div>
                    <div className="text-green-500 text-sm font-semibold">+12.47%</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">$2,847</div>
                  <div className="text-xs text-muted-foreground">24h Volume: $4.2M</div>
                </div>
              </div>

              {/* Mini chart placeholder */}
              <div className="h-32 bg-gradient-to-t from-pink-100/50 to-transparent rounded-xl mb-6 flex items-end justify-around px-2">
                {[40, 55, 45, 70, 60, 80, 75, 90, 85, 95].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-4 bg-gradient-to-t from-pink-500 to-pink-300 rounded-t-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              {/* Yield indicator */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Earning while trading</span>
                </div>
                <span className="text-green-600 font-bold">+8.2% APY</span>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-pink-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-semibold">Secured by Casper</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-pink-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-semibold">5+ Chains</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
