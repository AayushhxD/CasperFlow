"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, X, Clock, AlertCircle, Loader2 } from "lucide-react"
import { useMarket } from "@/lib/market-context"
import { formatPrice } from "@/lib/market-data"
import { usePositions } from "@/contexts/positions-context"
import { useWallet } from "@/contexts/wallet-context"

export function PositionPanel() {
  const { assets } = useMarket()
  const { positions, closePosition, updatePnl } = usePositions()
  const { addBalance, addTransaction } = useWallet()
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})
  const [closingId, setClosingId] = useState<string | null>(null)

  // Real-time price updates from WebSocket
  useEffect(() => {
    // Initialize with market data
    const priceMap: Record<string, number> = {}
    assets.forEach(asset => {
      priceMap[asset.id] = asset.price
    })
    setLivePrices(priceMap)

    // Connect to Binance WebSocket for real-time prices
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/solusdt@ticker/avaxusdt@ticker')
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.s && data.c) {
          const symbol = data.s.replace('USDT', '').toLowerCase()
          const price = parseFloat(data.c)
          
          // Map Binance symbols to our asset IDs
          const symbolMap: Record<string, string> = {
            'btc': 'bitcoin',
            'eth': 'ethereum',
            'sol': 'solana',
            'avax': 'avalanche-2'
          }
          
          const assetId = symbolMap[symbol]
          if (assetId) {
            setLivePrices(prev => ({
              ...prev,
              [assetId]: price
            }))
          }
        }
      } catch (error) {
        console.error('WebSocket price update error:', error)
      }
    }
    
    // Fallback price simulation for CSPR and error handling
    const interval = setInterval(() => {
      setLivePrices(prev => ({
        ...prev,
        'casper-network': (prev['casper-network'] || 0.052) * (1 + (Math.random() - 0.5) * 0.015)
      }))
    }, 2000)
    
    return () => {
      ws.close()
      clearInterval(interval)
    }
  }, [assets])

  const calculatePnL = (position: typeof positions[0]): { pnl: number; pnlPercent: number; pnlCspr: number } => {
    const currentPrice = livePrices[position.assetId] || position.entry
    const priceDiff = currentPrice - position.entry
    const multiplier = position.side === "long" ? 1 : -1
    const pnl = priceDiff * position.size * multiplier
    const pnlPercent = ((priceDiff / position.entry) * 100 * multiplier)
    // Convert USD PnL to CSPR (at $0.025 per CSPR)
    const pnlCspr = pnl / 0.025
    return { pnl, pnlPercent, pnlCspr }
  }

  const totalPnl = positions.reduce((acc, pos) => acc + calculatePnL(pos).pnl, 0)

  // Update total PnL in context
  useEffect(() => {
    updatePnl(totalPnl)
  }, [totalPnl, updatePnl])

  const handleClosePosition = async (id: string) => {
    const position = positions.find(p => p.id === id)
    if (!position) return

    setClosingId(id)
    
    // Calculate final PnL
    const { pnl, pnlCspr } = calculatePnL(position)
    
    // Return margin + PnL to wallet
    const returnAmount = position.margin + pnlCspr
    
    // Record close transaction
    await addTransaction({
      type: "trade",
      amount: Math.abs(returnAmount),
      token: "CSPR",
      status: "pending",
      description: `Closed ${position.side.toUpperCase()} ${position.asset} position - ${pnl >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(pnl).toFixed(2)}`,
      details: {
        leverage: position.leverage,
        side: position.side,
      }
    })
    
    // Add funds back to wallet (margin + profit or margin - loss)
    if (returnAmount > 0) {
      addBalance(returnAmount)
    }
    
    // Remove position
    closePosition(id)
    setClosingId(null)
  }

  const formatOpenTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const totalMargin = positions.reduce((acc, p) => acc + p.margin, 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-foreground">Open Positions</h3>
          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
            {positions.length}
          </span>
          <span className="flex items-center gap-1 text-green-500 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>
        
        <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
          totalPnl >= 0 
            ? "bg-green-50 text-green-600" 
            : "bg-red-50 text-red-600"
        }`}>
          {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
        </div>
      </div>

      {/* Positions */}
      <div className="divide-y divide-gray-50">
        {positions.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No open positions</p>
            <p className="text-gray-300 text-sm">Your trades will appear here</p>
          </div>
        ) : (
          positions.map((position) => {
            const { pnl, pnlPercent } = calculatePnL(position)
            const isProfit = pnl >= 0
            const currentPrice = livePrices[position.assetId] || position.entry
            const isClosing = closingId === position.id

            return (
              <div key={position.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      position.side === "long" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-red-100 text-red-600"
                    }`}>
                      {position.side === "long" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{position.asset}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          position.side === "long" 
                            ? "bg-green-100 text-green-600" 
                            : "bg-red-100 text-red-600"
                        }`}>
                          {position.leverage}x {position.side.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Entry: ${formatPrice(position.entry)}</span>
                        <span>→</span>
                        <span className={isProfit ? "text-green-500" : "text-red-500"}>
                          ${formatPrice(currentPrice)}
                        </span>
                        <span>•</span>
                        <span>Size: {position.size.toFixed(4)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatOpenTime(position.openTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* PnL */}
                    <div className="text-right">
                      <div className={`font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
                        {isProfit ? "+" : ""}${pnl.toFixed(2)}
                      </div>
                      <div className={`text-xs font-medium ${isProfit ? "text-green-500" : "text-red-500"}`}>
                        {isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => handleClosePosition(position.id)}
                      disabled={isClosing}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {isClosing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      {positions.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Total Margin: {totalMargin.toLocaleString(undefined, { maximumFractionDigits: 2 })} CSPR
          </span>
          <span className="flex items-center gap-1 text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            All positions earning yield
          </span>
        </div>
      )}
    </div>
  )
}
