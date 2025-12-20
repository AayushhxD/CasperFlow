"use client"

import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { useMarket } from "@/lib/market-context"
import { formatPrice, formatVolume } from "@/lib/market-data"

export function AssetSelector() {
  const { assets, isLoading, selectedAsset, setSelectedAsset } = useMarket()

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading market data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {assets.map((asset) => {
          const isSelected = selectedAsset?.id === asset.id
          return (
            <button
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all min-w-fit ${
                isSelected
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20"
                  : "bg-gray-50 hover:bg-gray-100 text-foreground"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                isSelected ? "bg-white/20" : "bg-white"
              }`}>
                {asset.icon}
              </div>
              
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm">{asset.symbol}</span>
                  <span className={`text-xs ${isSelected ? "text-white/70" : "text-gray-400"}`}>/USDT</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isSelected ? "text-white/90" : "text-gray-600"}`}>
                    ${formatPrice(asset.price)}
                  </span>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                    asset.change24h >= 0 
                      ? isSelected ? "text-green-200" : "text-green-500"
                      : isSelected ? "text-red-200" : "text-red-500"
                  }`}>
                    {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Mini sparkline indicator */}
              {asset.sparkline && asset.sparkline.length > 0 && (
                <div className={`w-12 h-6 ${isSelected ? "opacity-50" : "opacity-30"}`}>
                  <svg viewBox="0 0 48 24" className="w-full h-full">
                    <polyline
                      fill="none"
                      stroke={asset.change24h >= 0 ? "#22c55e" : "#ef4444"}
                      strokeWidth="1.5"
                      points={asset.sparkline.slice(-12).map((price, i, arr) => {
                        const min = Math.min(...arr)
                        const max = Math.max(...arr)
                        const range = max - min || 1
                        const x = (i / (arr.length - 1)) * 48
                        const y = 24 - ((price - min) / range) * 24
                        return `${x},${y}`
                      }).join(' ')}
                    />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
