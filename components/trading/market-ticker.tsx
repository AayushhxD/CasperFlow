"use client"

import { useEffect, useState, useRef } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useMarket } from "@/lib/market-context"
import { fetch24hrTicker, getBinanceSymbol, TickerData } from "@/lib/websocket-service"

interface MarketTickerData {
  id: string
  symbol: string
  icon: string
  price: number
  change: number
}

export function MarketTicker() {
  const { assets, selectedAsset, setSelectedAsset } = useMarket()
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map())
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAllTickers = async () => {
      const newTickers = new Map<string, TickerData>()
      
      for (const asset of assets) {
        const symbol = getBinanceSymbol(asset.id)
        const ticker = await fetch24hrTicker(symbol)
        if (ticker) {
          newTickers.set(asset.id, ticker)
        }
      }
      
      setTickers(newTickers)
    }

    if (assets.length > 0) {
      fetchAllTickers()
      
      // Refresh every 5 seconds
      const interval = setInterval(fetchAllTickers, 5000)
      return () => clearInterval(interval)
    }
  }, [assets])

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div 
        ref={scrollRef}
        className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide"
      >
        {assets.map((asset) => {
          const ticker = tickers.get(asset.id)
          const price = ticker?.price ?? asset.price
          const change = ticker?.priceChangePercent ?? asset.change24h
          const isSelected = selectedAsset?.id === asset.id

          return (
            <button
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-pink-50 border border-pink-200"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <span className="text-lg">{asset.icon}</span>
              <div className="text-left">
                <div className="text-xs font-semibold text-foreground">{asset.symbol}</div>
                <div className="flex items-center gap-1">
                  <span className="text-xs tabular-nums font-medium">
                    ${formatPrice(price)}
                  </span>
                  <span className={`text-[10px] flex items-center font-medium ${
                    change >= 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {change >= 0 ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5" />
                    )}
                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
