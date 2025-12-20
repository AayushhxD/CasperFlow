"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { 
  Wallet, ArrowRight, TrendingUp, Shield, Loader2, CheckCircle, 
  Coins, Clock, Gift, Sparkles, ArrowDownUp, Percent, 
  ChevronDown, ExternalLink, Info, Zap, Lock, Unlock, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"

interface StakeCurrency {
  symbol: string
  name: string
  icon: string
  apy: number
  tvl: string
  price: number
  lsSymbol: string
  exchangeRate: number
}

interface StakePosition {
  id: number
  currency: string
  amount: number
  lsAmount: number
  stakedAt: Date
  rewards: number
  status: 'active' | 'unstaking'
  unlockDate?: Date
}

const stakeCurrencies: StakeCurrency[] = [
  { symbol: "CSPR", name: "Casper", icon: "💎", apy: 8.24, tvl: "$84.7M", price: 0.025, lsSymbol: "lsCSPR", exchangeRate: 0.98 },
  { symbol: "ETH", name: "Ethereum", icon: "⟠", apy: 4.5, tvl: "$2.1B", price: 3450, lsSymbol: "stETH", exchangeRate: 0.995 },
  { symbol: "SOL", name: "Solana", icon: "◎", apy: 7.2, tvl: "$890M", price: 220, lsSymbol: "mSOL", exchangeRate: 0.97 },
  { symbol: "AVAX", name: "Avalanche", icon: "🔺", apy: 6.8, tvl: "$320M", price: 52, lsSymbol: "sAVAX", exchangeRate: 0.96 },
  { symbol: "ATOM", name: "Cosmos", icon: "⚛️", apy: 9.5, tvl: "$450M", price: 12.5, lsSymbol: "stATOM", exchangeRate: 0.98 },
]

// Helper to get currency balance
const getCurrencyBalanceForCurrency = (currency: StakeCurrency, walletBalance: number) => {
  if (currency.symbol === "CSPR") {
    return walletBalance
  }
  const csprUsdValue = walletBalance * 0.025
  return csprUsdValue / currency.price
}

export default function StakePage() {
  const { balance, deductBalance, addBalance, addTransaction } = useWallet()
  const [amount, setAmount] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState<StakeCurrency>(stakeCurrencies[0])
  const [showCurrencySelector, setShowCurrencySelector] = useState(false)
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake")
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [liveAPY, setLiveAPY] = useState(selectedCurrency.apy)
  const [totalRewards, setTotalRewards] = useState(847.32)
  const [pendingRewards, setPendingRewards] = useState(12.47)
  const [positions, setPositions] = useState<StakePosition[]>([
    { id: 1, currency: "CSPR", amount: 15000, lsAmount: 14700, stakedAt: new Date('2024-08-15'), rewards: 523.45, status: 'active' },
    { id: 2, currency: "ETH", amount: 2.5, lsAmount: 2.48, stakedAt: new Date('2024-10-20'), rewards: 0.12, status: 'active' },
    { id: 3, currency: "SOL", amount: 50, lsAmount: 48.5, stakedAt: new Date('2024-11-10'), rewards: 1.8, status: 'active' },
  ])
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  // Get balance for selected currency (convert from CSPR if needed)
  const getCurrencyBalance = () => {
    if (selectedCurrency.symbol === "CSPR") {
      return balance
    }
    // Convert CSPR balance to equivalent value in other currencies
    const csprUsdValue = balance * 0.025
    return csprUsdValue / selectedCurrency.price
  }

  // Update APY when currency changes
  useEffect(() => {
    setLiveAPY(selectedCurrency.apy)
  }, [selectedCurrency])

  // Live APY fluctuation and reward accrual
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAPY(prev => {
        const change = (Math.random() - 0.5) * 0.02
        return Math.max(prev - 1, Math.min(prev + 1, prev + change))
      })
      setPendingRewards(prev => prev + 0.001)
      
      // Update position rewards in real-time
      setPositions(prev => prev.map(pos => {
        if (pos.status === 'active') {
          const currency = stakeCurrencies.find(c => c.symbol === pos.currency) || stakeCurrencies[0]
          const dailyRate = currency.apy / 100 / 365
          const secondsElapsed = 3 // Our interval
          const secondsRate = dailyRate / 86400 * secondsElapsed
          const newReward = pos.rewards + (pos.amount * secondsRate)
          return { ...pos, rewards: newReward }
        }
        return pos
      }))
      
      // Update total rewards
      setTotalRewards(prev => prev + 0.0015)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Calculate estimated values
  const amountNum = parseFloat(amount) || 0
  const lsReceived = amountNum * selectedCurrency.exchangeRate
  const dailyYield = amountNum * (liveAPY / 100 / 365)
  const monthlyYield = dailyYield * 30
  const yearlyYield = amountNum * (liveAPY / 100)
  const usdValue = amountNum * selectedCurrency.price
  const currencyBalance = getCurrencyBalance()

  // Convert amount to CSPR for deduction
  const getCsprAmount = () => {
    if (selectedCurrency.symbol === "CSPR") {
      return amountNum
    }
    // Convert other currency amounts to CSPR equivalent
    const usdValue = amountNum * selectedCurrency.price
    return usdValue / 0.025
  }

  // Get total staked for selected currency
  const totalStakedForCurrency = positions
    .filter(p => p.currency === selectedCurrency.symbol && p.status === 'active')
    .reduce((acc, p) => acc + p.amount, 0)

  const handleStake = async () => {
    if (!amount || amountNum <= 0) return
    
    setError(null)
    const csprAmount = getCsprAmount()
    
    if (csprAmount > balance) {
      setError(`Insufficient balance. You need ${csprAmount.toFixed(2)} CSPR but have ${balance.toFixed(2)} CSPR`)
      return
    }
    
    setIsProcessing(true)
    setTxStatus("idle")
    
    // Deduct balance
    const success = deductBalance(csprAmount)
    if (!success) {
      setError("Transaction failed: Insufficient balance")
      setIsProcessing(false)
      return
    }
    
    // Record transaction
    await addTransaction({
      type: "stake",
      amount: csprAmount,
      token: "CSPR",
      status: "pending",
      description: `Staked ${amountNum.toLocaleString()} ${selectedCurrency.symbol} at ${liveAPY.toFixed(2)}% APY`,
      details: {
        apy: liveAPY,
      }
    })
    
    const newPosition: StakePosition = {
      id: Date.now(),
      currency: selectedCurrency.symbol,
      amount: amountNum,
      lsAmount: lsReceived,
      stakedAt: new Date(),
      rewards: 0,
      status: 'active'
    }
    
    setPositions(prev => [...prev, newPosition])
    setAmount("")
    setIsProcessing(false)
    setTxStatus("success")
    
    setTimeout(() => setTxStatus("idle"), 3000)
  }

  const handleUnstake = async () => {
    if (selectedPosition === null) return
    
    setIsProcessing(true)
    
    const position = positions.find(p => p.id === selectedPosition)
    if (position) {
      // Return balance to wallet (convert back to CSPR)
      const currency = getCurrencyBySymbol(position.currency)
      const csprAmount = position.currency === "CSPR" 
        ? position.amount 
        : (position.amount * currency.price) / 0.025
      
      // Record unstake transaction
      await addTransaction({
        type: "unstake",
        amount: csprAmount,
        token: "CSPR",
        status: "pending",
        description: `Unstaked ${position.amount.toLocaleString()} ${position.currency}`,
      })
      
      // Add balance back after 7-day unlock period (simulated instantly for demo)
      addBalance(csprAmount)
    }
    
    setPositions(prev => prev.map(p => 
      p.id === selectedPosition 
        ? { ...p, status: 'unstaking' as const, unlockDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        : p
    ))
    
    setIsProcessing(false)
    setTxStatus("success")
    setSelectedPosition(null)
    
    setTimeout(() => setTxStatus("idle"), 3000)
  }

  const handleClaimRewards = async () => {
    setIsProcessing(true)
    
    // Record claim transaction
    const rewardCspr = pendingRewards / 0.025
    await addTransaction({
      type: "claim",
      amount: rewardCspr,
      token: "CSPR",
      status: "pending",
      description: `Claimed ${pendingRewards.toFixed(2)} USD in staking rewards`,
    })
    
    // Add rewards to balance
    addBalance(rewardCspr)
    
    setTotalRewards(prev => prev + pendingRewards)
    setPendingRewards(0)
    setIsProcessing(false)
    setTxStatus("success")
    
    setTimeout(() => setTxStatus("idle"), 3000)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDaysStaked = (date: Date) => {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getCurrencyBySymbol = (symbol: string) => {
    return stakeCurrencies.find(c => c.symbol === symbol) || stakeCurrencies[0]
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
      <AnimatedBackground />
      <Navigation />

      <div className="relative z-10 pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full text-pink-600 font-semibold text-sm mb-4">
              <Zap className="w-4 h-4" />
              Earn up to {liveAPY.toFixed(2)}% APY on {selectedCurrency.symbol}
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
              Multi-Chain <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Staking</span> Vault
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Stake multiple assets, receive liquid tokens, and unlock DeFi possibilities
            </p>
          </div>

          {/* Currency Selector Pills */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {stakeCurrencies.map((currency) => (
              <button
                key={currency.symbol}
                onClick={() => setSelectedCurrency(currency)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                  selectedCurrency.symbol === currency.symbol
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                }`}
              >
                <span className="text-lg">{currency.icon}</span>
                <span>{currency.symbol}</span>
                <span className={`text-xs ${selectedCurrency.symbol === currency.symbol ? "text-white/80" : "text-green-500"}`}>
                  {currency.apy}%
                </span>
              </button>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Percent className="w-4 h-4" />
                {selectedCurrency.symbol} APY
              </div>
              <div className="text-3xl font-black text-green-500">{liveAPY.toFixed(2)}%</div>
              <div className="text-xs text-green-500 mt-1">↑ 0.12% from yesterday</div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Shield className="w-4 h-4" />
                TVL ({selectedCurrency.symbol})
              </div>
              <div className="text-3xl font-black text-foreground">{selectedCurrency.tvl}</div>
              <div className="text-xs text-green-500 mt-1">↑ 2.3% this week</div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Coins className="w-4 h-4" />
                Your Staked
              </div>
              <div className="text-3xl font-black text-foreground">
                {totalStakedForCurrency.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">{selectedCurrency.symbol}</div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                Total Rewards
              </div>
              <div className="text-3xl font-black text-green-500">+${totalRewards.toFixed(2)}</div>
              <div className="text-xs text-green-500 mt-1">↑ ${pendingRewards.toFixed(2)} pending</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Main Staking Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("stake")}
                  className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "stake"
                      ? "text-pink-600 border-b-2 border-pink-500 bg-pink-50/50"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Stake
                </button>
                <button
                  onClick={() => setActiveTab("unstake")}
                  className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "unstake"
                      ? "text-pink-600 border-b-2 border-pink-500 bg-pink-50/50"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  Unstake
                </button>
              </div>

              <div className="p-6">
                {activeTab === "stake" ? (
                  <div className="space-y-5">
                    {/* Currency Dropdown */}
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Select Asset</label>
                      <div className="relative">
                        <button
                          onClick={() => setShowCurrencySelector(!showCurrencySelector)}
                          className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-pink-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl">
                              {selectedCurrency.icon}
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-foreground">{selectedCurrency.symbol}</div>
                              <div className="text-xs text-gray-400">{selectedCurrency.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-500">{selectedCurrency.apy}% APY</div>
                              <div className="text-xs text-gray-400">TVL: {selectedCurrency.tvl}</div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCurrencySelector ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        
                        {showCurrencySelector && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl z-20 overflow-hidden">
                            {stakeCurrencies.map((currency) => (
                              <button
                                key={currency.symbol}
                                onClick={() => {
                                  setSelectedCurrency(currency)
                                  setShowCurrencySelector(false)
                                  setAmount("")
                                }}
                                className={`w-full flex items-center justify-between p-4 hover:bg-pink-50 transition-all ${
                                  selectedCurrency.symbol === currency.symbol ? "bg-pink-50" : ""
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                                    {currency.icon}
                                  </div>
                                  <div className="text-left">
                                    <div className="font-bold text-foreground">{currency.symbol}</div>
                                    <div className="text-xs text-gray-400">{currency.name}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-green-500">{currency.apy}% APY</div>
                                  <div className="text-xs text-gray-400">Balance: {getCurrencyBalanceForCurrency(currency, balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-600">Amount to Stake</label>
                        <span className="text-xs text-gray-400">
                          Balance: <span className="font-semibold text-pink-500">{currencyBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {selectedCurrency.symbol}</span>
                          {selectedCurrency.symbol !== "CSPR" && (
                            <span className="text-gray-300 ml-1">({balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} CSPR)</span>
                          )}
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
                          className="w-full px-4 py-4 pr-32 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-xl font-bold"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-500">{selectedCurrency.symbol}</span>
                          <button
                            onClick={() => setAmount(currencyBalance.toFixed(2))}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                      {amountNum > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                          {selectedCurrency.symbol !== "CSPR" && (
                            <span className="ml-2">• Cost: {getCsprAmount().toFixed(2)} CSPR</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => {
                            setAmount((currencyBalance * pct / 100).toFixed(2))
                            setError(null)
                          }}
                          className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            amount === (currencyBalance * pct / 100).toFixed(2)
                              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
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

                    {/* Conversion Display */}
                    <div className="flex items-center justify-center gap-4 py-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{amountNum.toLocaleString() || '0'}</div>
                        <div className="text-sm text-gray-400">{selectedCurrency.symbol}</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <ArrowDownUp className="w-5 h-5 text-pink-500" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600">{lsReceived.toLocaleString() || '0'}</div>
                        <div className="text-sm text-gray-400">{selectedCurrency.lsSymbol}</div>
                      </div>
                    </div>

                    {/* Yield Estimates */}
                    <div className="bg-gradient-to-br from-gray-50 to-pink-50/50 rounded-xl p-4 space-y-3 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Exchange Rate</span>
                        <span className="font-semibold text-foreground">1 {selectedCurrency.symbol} = {selectedCurrency.exchangeRate} {selectedCurrency.lsSymbol}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Est. Daily Yield</span>
                        <span className="font-bold text-green-500">+{dailyYield.toFixed(6)} {selectedCurrency.symbol}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Est. Monthly Yield</span>
                        <span className="font-bold text-green-500">+{monthlyYield.toFixed(4)} {selectedCurrency.symbol}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-gray-500 text-sm">Est. Yearly Yield</span>
                        <span className="font-bold text-green-500 text-lg">+{yearlyYield.toFixed(2)} {selectedCurrency.symbol}</span>
                      </div>
                    </div>

                    {/* Stake Button */}
                    <Button
                      onClick={handleStake}
                      disabled={isProcessing || !amount || amountNum <= 0 || getCsprAmount() > balance}
                      className="w-full py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </span>
                      ) : txStatus === "success" ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Staked Successfully!
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Stake {selectedCurrency.symbol}
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </div>
                ) : (
                  /* Unstake Tab */
                  <div className="space-y-5">
                    <div className="text-sm text-gray-500 mb-4 flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-amber-700">Unstaking takes 7 days. Your tokens will be available after the unbonding period.</span>
                    </div>

                    {/* Position Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-3 block">Select Position to Unstake</label>
                      <div className="space-y-3">
                        {positions.filter(p => p.status === 'active').length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            No active staking positions
                          </div>
                        ) : (
                          positions.filter(p => p.status === 'active').map((position) => {
                            const currency = getCurrencyBySymbol(position.currency)
                            return (
                              <button
                                key={position.id}
                                onClick={() => setSelectedPosition(position.id)}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                  selectedPosition === position.id
                                    ? "border-pink-500 bg-pink-50"
                                    : "border-gray-100 hover:border-gray-200 bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                                      {currency.icon}
                                    </div>
                                    <div>
                                      <div className="font-bold text-foreground">{position.amount.toLocaleString()} {position.currency}</div>
                                      <div className="text-sm text-gray-400">
                                        Staked {formatDate(position.stakedAt)} • {getDaysStaked(position.stakedAt)} days
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-green-500">+{position.rewards.toFixed(4)}</div>
                                    <div className="text-xs text-gray-400">rewards earned</div>
                                  </div>
                                </div>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>

                    {/* Unstaking Positions */}
                    {positions.some(p => p.status === 'unstaking') && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-3 block">Unstaking in Progress</label>
                        <div className="space-y-2">
                          {positions.filter(p => p.status === 'unstaking').map((position) => {
                            const currency = getCurrencyBySymbol(position.currency)
                            return (
                              <div key={position.id} className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-lg">
                                      {currency.icon}
                                    </div>
                                    <div>
                                      <div className="font-bold text-foreground">{position.amount.toLocaleString()} {position.currency}</div>
                                      <div className="text-sm text-amber-600">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        Available {position.unlockDate ? formatDate(position.unlockDate) : 'soon'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="px-3 py-1 rounded-full bg-amber-200 text-amber-700 text-xs font-semibold">
                                    Unbonding
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Unstake Button */}
                    <Button
                      onClick={handleUnstake}
                      disabled={isProcessing || selectedPosition === null}
                      className="w-full py-4 rounded-xl text-lg font-bold bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Unlock className="w-5 h-5" />
                          Begin Unstaking
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Rewards Card */}
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-pink-500/25">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-white/80 text-sm">Pending Rewards</div>
                    <div className="text-2xl font-black">${pendingRewards.toFixed(4)}</div>
                  </div>
                </div>
                
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (pendingRewards / 50) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-white/70 mb-4">Accumulating in real-time</div>

                <Button
                  onClick={handleClaimRewards}
                  disabled={isProcessing || pendingRewards < 0.01}
                  className="w-full py-3 rounded-xl font-bold bg-white text-pink-600 hover:bg-white/90 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Claim Rewards
                    </span>
                  )}
                </Button>
              </div>

              {/* All Positions Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-5">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-pink-500" />
                  Your Positions
                </h3>
                
                <div className="space-y-3">
                  {stakeCurrencies.map((currency) => {
                    const stakedAmount = positions
                      .filter(p => p.currency === currency.symbol && p.status === 'active')
                      .reduce((acc, p) => acc + p.amount, 0)
                    
                    if (stakedAmount === 0) return null
                    
                    return (
                      <div key={currency.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{currency.icon}</span>
                          <span className="font-semibold text-foreground">{currency.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">{stakedAmount.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">≈ ${(stakedAmount * currency.price).toLocaleString()}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">All-time Rewards</span>
                    <span className="font-bold text-green-500">+${totalRewards.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h4 className="font-semibold text-foreground mb-3 text-sm">Why Liquid Staking?</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    Earn staking rewards while keeping liquidity
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    Use liquid tokens as collateral for trading
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    Stake multiple assets from one place
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    Compound rewards automatically
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="mt-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-4"
            >
              <Clock className="w-4 h-4" />
              Transaction History
              <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>
            
            {showHistory && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Asset</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Tx</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {positions.map((pos) => {
                      const currency = getCurrencyBySymbol(pos.currency)
                      return (
                        <tr key={pos.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                                {currency.icon}
                              </div>
                              <span className="font-medium">{pos.currency}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold">{pos.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-500">{formatDate(pos.stakedAt)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              pos.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {pos.status === 'active' ? 'Active' : 'Unstaking'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button className="text-pink-500 hover:text-pink-600">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
