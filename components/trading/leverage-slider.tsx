"use client"

import { useState } from "react"
import { AlertTriangle, Zap } from "lucide-react"
import { useMarket } from "@/lib/market-context"
import { formatPrice } from "@/lib/market-data"

export function LeverageSlider() {
  const { selectedAsset } = useMarket()
  const [leverage, setLeverage] = useState(5)
  const maxLeverage = 20
  
  const currentPrice = selectedAsset?.price || 0
  const liquidationPrice = currentPrice > 0 ? (currentPrice * (1 - 1/leverage)).toFixed(2) : "0.00"
  const riskLevel = leverage <= 5 ? "Low" : leverage <= 10 ? "Medium" : leverage <= 15 ? "High" : "Very High"
  const riskColor = leverage <= 5 ? "text-green-600 bg-green-50" : leverage <= 10 ? "text-yellow-600 bg-yellow-50" : leverage <= 15 ? "text-orange-600 bg-orange-50" : "text-red-600 bg-red-50"

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-pink-500" />
          <h3 className="font-bold text-foreground">Leverage</h3>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${riskColor}`}>
          {riskLevel} Risk
        </span>
      </div>

      <div className="p-5 space-y-6">
        {/* Large Display */}
        <div className="text-center py-4">
          <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
            {leverage}x
          </span>
        </div>

        {/* Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span className="text-green-500">1x</span>
            <span className="text-yellow-500">10x</span>
            <span className="text-red-500">{maxLeverage}x</span>
          </div>

          <div className="relative">
            <div className="h-2 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full" />
            <input
              type="range"
              min="1"
              max={maxLeverage}
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-pink-500 rounded-full shadow-lg pointer-events-none"
              style={{ left: `calc(${((leverage - 1) / (maxLeverage - 1)) * 100}% - 10px)` }}
            />
          </div>
        </div>

        {/* Quick Select */}
        <div className="grid grid-cols-4 gap-2">
          {[2, 5, 10, 20].map((lev) => (
            <button
              key={lev}
              onClick={() => setLeverage(lev)}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                leverage === lev
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {lev}x
            </button>
          ))}
        </div>

        {/* Risk Info */}
        {leverage > 10 && (
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-orange-700">High Leverage Warning</p>
              <p className="text-orange-600">Liquidation at ${liquidationPrice}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="text-xs text-gray-400 mb-1">Liquidation Price</div>
            <div className="font-bold text-foreground">${liquidationPrice}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="text-xs text-gray-400 mb-1">Max Position</div>
            <div className="font-bold text-foreground">${(10000 * leverage).toLocaleString()}</div>
          </div>
        </div>

        {/* Current Asset */}
        {selectedAsset && (
          <div className="p-3 bg-pink-50 rounded-xl border border-pink-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-pink-600">Trading {selectedAsset.symbol}</span>
              <span className="text-xs font-bold text-pink-700">${formatPrice(currentPrice)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
