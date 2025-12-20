"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, TrendingDown, Info, CheckCircle, AlertCircle } from "lucide-react"
import { useMarket } from "@/lib/market-context"
import { formatPrice } from "@/lib/market-data"
import { useWallet } from "@/contexts/wallet-context"
import { usePositions } from "@/contexts/positions-context"

export function OrderPanel() {
  const { selectedAsset } = useMarket()
  const { balance, deductBalance, addTransaction } = useWallet()
  const { addPosition } = usePositions()
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [side, setSide] = useState<"long" | "short">("long")
  const [amount, setAmount] = useState("")
  const [limitPrice, setLimitPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const leverage = 5

  const currentPrice = selectedAsset?.price || 0
  const amountNum = parseFloat(amount) || 0
  // Convert CSPR to USD equivalent (approx $0.025 per CSPR)
  const csprPrice = 0.025
  const csprAmount = amountNum / csprPrice
  const estimatedFee = amount ? (amountNum * 0.0003).toFixed(2) : "0.00"
  const estimatedSize = amount && currentPrice ? (amountNum / currentPrice * leverage).toFixed(4) : "0.0000"

  const handleSubmit = async () => {
    if (!amount || !selectedAsset) return
    
    setError(null)
    
    // Check if user has enough balance (convert USD to CSPR)
    const totalCost = csprAmount + (parseFloat(estimatedFee) / csprPrice)
    
    if (totalCost > balance) {
      setError(`Insufficient balance. You need ${totalCost.toFixed(2)} CSPR but have ${balance.toFixed(2)} CSPR`)
      return
    }
    
    setIsSubmitting(true)
    
    // Deduct balance
    const success = deductBalance(totalCost)
    if (!success) {
      setError("Transaction failed: Insufficient balance")
      setIsSubmitting(false)
      return
    }
    
    // Record transaction
    const tx = await addTransaction({
      type: "trade",
      amount: totalCost,
      token: "CSPR",
      status: "pending",
      description: `${side.toUpperCase()} ${selectedAsset.symbol} @ $${formatPrice(currentPrice)} with ${leverage}x leverage`,
      details: {
        leverage,
        side,
      }
    })
    
    // Add position
    addPosition({
      assetId: selectedAsset.id,
      asset: selectedAsset.symbol,
      side,
      entry: currentPrice,
      size: parseFloat(estimatedSize),
      leverage,
      margin: totalCost,
      txHash: tx.hash,
    })
    
    setIsSubmitting(false)
    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setAmount("")
    }, 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">Place Order</h3>
          <div className="flex items-center gap-2">
            {selectedAsset && (
              <span className="text-xs font-medium text-gray-500">
                {selectedAsset.symbol}/USDT
              </span>
            )}
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Long/Short Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setSide("long")}
            className={`py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              side === "long"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                : "text-gray-500 hover:text-green-600"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Long
          </button>
          <button
            onClick={() => setSide("short")}
            className={`py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              side === "short"
                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25"
                : "text-gray-500 hover:text-red-600"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Short
          </button>
        </div>

        {/* Current Price Display */}
        {selectedAsset && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-500">Current Price</span>
            <span className="font-bold text-foreground">${formatPrice(currentPrice)}</span>
          </div>
        )}

        {/* Order Type */}
        <div className="flex gap-2 p-1 bg-gray-50 rounded-lg">
          {(["market", "limit"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                orderType === type 
                  ? "bg-white text-foreground shadow-sm" 
                  : "text-gray-500 hover:text-foreground"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-600">Amount (USD)</label>
            <span className="text-xs text-gray-400">
              Balance: <span className="font-semibold text-pink-500">{balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} CSPR</span>
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError(null)
              }}
              placeholder="0.00"
              className="w-full px-4 py-3.5 pr-16 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-lg font-semibold"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 bg-white px-2 py-1 rounded-md">
              USD
            </span>
          </div>
          {amountNum > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              ≈ {csprAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} CSPR
            </p>
          )}
        </div>

        {/* Limit Price */}
        {orderType === "limit" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-600">Limit Price</label>
              <button 
                onClick={() => setLimitPrice(currentPrice.toString())}
                className="text-xs text-pink-500 font-medium hover:underline"
              >
                Use Current
              </button>
            </div>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={formatPrice(currentPrice)}
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-lg font-semibold"
            />
          </div>
        )}

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => {
                // Calculate USD value based on CSPR balance
                const maxUsd = balance * csprPrice
                setAmount((maxUsd * (pct / 100)).toFixed(2))
                setError(null)
              }}
              className="py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-pink-50 hover:text-pink-600 transition-colors border border-gray-100"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Order Summary */}
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Est. Size</span>
            <span className="font-semibold text-foreground">{estimatedSize} {selectedAsset?.symbol || 'ETH'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Leverage</span>
            <span className="font-semibold text-foreground">{leverage}x</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Trading Fee</span>
            <span className="font-semibold text-foreground">${estimatedFee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Cost</span>
            <span className="font-semibold text-pink-500">{csprAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} CSPR</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              Collateral Yield
              <Info className="w-3 h-3" />
            </span>
            <span className="font-semibold text-green-500">+8.2% APY</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!amount || isSubmitting || !selectedAsset || amountNum <= 0}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            isSuccess
              ? "bg-green-500"
              : side === "long"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/25"
              : "bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg hover:shadow-red-500/25"
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSuccess ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Order Placed!
            </span>
          ) : (
            `Open ${side === "long" ? "Long" : "Short"} Position`
          )}
        </Button>
      </div>
    </div>
  )
}
