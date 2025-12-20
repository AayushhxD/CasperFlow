"use client"

import { useEffect, useRef, useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { useMarket } from "@/lib/market-context"
import { formatPrice } from "@/lib/market-data"
import { TrendingUp, TrendingDown, PieChart, Wallet, DollarSign } from "lucide-react"

interface Holding {
  symbol: string
  name: string
  amount: number
  value: number
  allocation: number
  change24h: number
  icon: string
  color: string
}

// Simulated holdings data - in production this would come from wallet/chain
const MOCK_HOLDINGS: Omit<Holding, 'value' | 'allocation'>[] = [
  { symbol: 'lsCSPR', name: 'Liquid Staked CSPR', amount: 25000, change24h: 5.2, icon: '💎', color: '#ec4899' },
  { symbol: 'ETH', name: 'Ethereum', amount: 2.5, change24h: 2.1, icon: '⟠', color: '#6366f1' },
  { symbol: 'BTC', name: 'Bitcoin', amount: 0.15, change24h: -0.8, icon: '₿', color: '#f59e0b' },
  { symbol: 'SOL', name: 'Solana', amount: 45, change24h: 4.5, icon: '◎', color: '#14b8a6' },
]

export function PortfolioChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isConnected, balance } = useWallet()
  const { assets } = useMarket()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate holdings values from live prices
  useEffect(() => {
    if (!assets.length) return

    const priceMap: Record<string, number> = {}
    assets.forEach(a => {
      priceMap[a.symbol] = a.price
    })

    // Default prices for assets not in market data
    const defaultPrices: Record<string, number> = {
      'lsCSPR': 0.0312,
      'ETH': 3450,
      'BTC': 104500,
      'SOL': 220,
    }

    const calculatedHoldings = MOCK_HOLDINGS.map(h => {
      const price = priceMap[h.symbol] || defaultPrices[h.symbol] || 0
      const value = h.amount * price
      return { ...h, value, allocation: 0 }
    })

    const total = calculatedHoldings.reduce((sum, h) => sum + h.value, 0)
    
    // Calculate allocation percentages
    const withAllocation = calculatedHoldings.map(h => ({
      ...h,
      allocation: (h.value / total) * 100
    }))

    setHoldings(withAllocation)
    setTotalValue(total)
  }, [assets])

  // Draw donut chart
  useEffect(() => {
    if (!canvasRef.current || !holdings.length || !mounted) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 120
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const radius = 45
    const innerRadius = 30

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw segments
    let startAngle = -Math.PI / 2
    holdings.forEach((holding) => {
      const sliceAngle = (holding.allocation / 100) * 2 * Math.PI
      
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = holding.color
      ctx.fill()
      
      startAngle += sliceAngle
    })

    // Draw inner circle for donut effect
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.fill()

    // Draw center icon
    ctx.font = '20px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('💰', centerX, centerY)

  }, [holdings, mounted])

  if (!mounted) return null

  if (!isConnected) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">Portfolio</h3>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">
          Connect wallet to view holdings
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <PieChart className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">Your Holdings</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="font-bold text-gray-800">${formatPrice(totalValue)}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        {/* Donut Chart */}
        <div className="flex-shrink-0">
          <canvas ref={canvasRef} className="w-[120px] h-[120px]" />
        </div>

        {/* Holdings List */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {holdings.map((holding) => (
            <div key={holding.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: holding.color }}
                />
                <span className="text-xs font-medium text-gray-700 truncate">
                  {holding.symbol}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-500">
                  {holding.allocation.toFixed(1)}%
                </span>
                <span className={`text-xs font-medium ${
                  holding.change24h >= 0 ? 'text-green-600' : 'text-red-500'
                }`}>
                  {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings Details */}
      <div className="space-y-2 border-t border-gray-100 pt-3">
        {holdings.map((holding) => (
          <div 
            key={holding.symbol}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{holding.icon}</span>
              <div>
                <p className="text-xs font-medium text-gray-800">{holding.amount.toLocaleString()} {holding.symbol}</p>
                <p className="text-[10px] text-gray-500">{holding.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-800">${formatPrice(holding.value)}</p>
              <div className={`flex items-center justify-end gap-0.5 ${
                holding.change24h >= 0 ? 'text-green-600' : 'text-red-500'
              }`}>
                {holding.change24h >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="text-[10px] font-medium">
                  {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
