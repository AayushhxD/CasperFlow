"use client"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { TradingChart } from "@/components/trading/trading-chart"
import { AssetSelector } from "@/components/trading/asset-selector"
import { LeverageSlider } from "@/components/trading/leverage-slider"
import { PositionPanel } from "@/components/trading/position-panel"
import { OrderPanel } from "@/components/trading/order-panel"
import { YieldIndicator } from "@/components/trading/yield-indicator"
import { OrderBook } from "@/components/trading/order-book"
import { TradesFeed } from "@/components/trading/trades-feed"
import { PortfolioChart } from "@/components/trading/portfolio-chart"
import AccountAbstraction from "@/components/account-abstraction"
import { MarketProvider } from "@/lib/market-context"
import { PositionsProvider } from "@/contexts/positions-context"
import { TrendingUp, Wallet, Activity, RefreshCw, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { useWallet } from "@/contexts/wallet-context"

function TradingContent() {
  const { balance } = useWallet()
  const [totalPnl, setTotalPnl] = useState(127.84)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const [showAccountAbstraction, setShowAccountAbstraction] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLastUpdate(new Date().toLocaleTimeString('en-US', { hour12: false }))
    
    const interval = setInterval(() => {
      setTotalPnl(prev => prev + (Math.random() - 0.48) * 2)
      setLastUpdate(new Date().toLocaleTimeString('en-US', { hour12: false }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
      <AnimatedBackground />
      <Navigation />

      <div className="relative z-10 pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Trading Terminal</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  Real-time data • Trade across chains • Earn yield on collateral
                  <span className="flex items-center gap-1 text-green-500 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </span>
                </p>
              </div>
            </div>
            
            {/* Quick Stats Bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-pink-100">
                <Wallet className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-semibold text-foreground">
                  {balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} CSPR
                </span>
                <span className="text-xs text-gray-400">
                  ≈ ${(balance * 0.025).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                totalPnl >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
              }`}>
                <Activity className={`w-4 h-4 ${totalPnl >= 0 ? "text-green-500" : "text-red-500"}`} />
                <span className={`text-sm font-semibold ${totalPnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                </span>
              </div>
              <YieldIndicator />
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl text-xs text-gray-500">
                <RefreshCw className="w-3 h-3" />
                {mounted ? lastUpdate : "--:--:--"}
              </div>
            </div>
          </div>

          {/* Account Abstraction Panel */}
          {showAccountAbstraction && (
            <div className="mb-4">
              <AccountAbstraction />
            </div>
          )}

          {/* Main Trading Grid - Professional Layout */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Sidebar - Order Book */}
            <div className="col-span-12 lg:col-span-2 xl:col-span-2">
              <div className="h-[600px]">
                <OrderBook />
              </div>
            </div>

            {/* Center - Chart */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-7 space-y-4">
              {/* Asset Selector */}
              <AssetSelector />
              
              {/* Chart */}
              <TradingChart />
            </div>

            {/* Right Sidebar - Order Panel & Trades */}
            <div className="col-span-12 lg:col-span-3 xl:col-span-3 space-y-4">
              <OrderPanel />
              <PortfolioChart />
              <div className="h-[200px]">
                <TradesFeed />
              </div>
            </div>
          </div>

          {/* Bottom Section - Positions & Leverage */}
          <div className="grid grid-cols-12 gap-4 mt-4">
            <div className="col-span-12 lg:col-span-9">
              <PositionPanel />
            </div>
            <div className="col-span-12 lg:col-span-3">
              <LeverageSlider />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function TradePage() {
  return (
    <MarketProvider>
      <PositionsProvider>
        <TradingContent />
      </PositionsProvider>
    </MarketProvider>
  )
}
