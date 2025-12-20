"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { 
  TrendingUp, Users, Star, Copy, Zap, Trophy, Shield, Lock, ArrowUpRight, 
  Sparkles, Crown, ChevronDown, X, Wallet, DollarSign, Percent, Target,
  CheckCircle, Loader2, PieChart, BarChart3, Info, ExternalLink, Plus, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"

interface Vault {
  id: number
  name: string
  trader: string
  avatar: string
  roi: number
  risk: "Low" | "Medium" | "High" | "Very High"
  followers: number
  aum: number
  description: string
  badge: string
  winRate: number
  minDeposit: number
  performanceFee: number
  managementFee: number
  strategy: string
  assets: string[]
}

const initialVaults: Vault[] = [
  {
    id: 1,
    name: "Alpha Momentum",
    trader: "CryptoWhale.cspr",
    avatar: "🐋",
    roi: 247.8,
    risk: "High",
    followers: 1847,
    aum: 2847000,
    description: "High-frequency momentum trading across major pairs with trend-following algorithms",
    badge: "🔥 Hot",
    winRate: 73,
    minDeposit: 500,
    performanceFee: 20,
    managementFee: 2,
    strategy: "Momentum",
    assets: ["BTC", "ETH", "SOL"]
  },
  {
    id: 2,
    name: "Steady Yield",
    trader: "YieldFarmer.cspr",
    avatar: "🌾",
    roi: 84.2,
    risk: "Low",
    followers: 3241,
    aum: 8472000,
    description: "Conservative delta-neutral strategies with consistent returns through yield farming",
    badge: "⭐ Top Rated",
    winRate: 89,
    minDeposit: 100,
    performanceFee: 15,
    managementFee: 1,
    strategy: "Yield Farming",
    assets: ["USDC", "USDT", "DAI"]
  },
  {
    id: 3,
    name: "DeFi Degen",
    trader: "DegenKing.cspr",
    avatar: "👑",
    roi: 412.5,
    risk: "Very High",
    followers: 892,
    aum: 1247000,
    description: "Aggressive leverage plays on trending narratives with high risk/reward ratio",
    badge: "🚀 Trending",
    winRate: 61,
    minDeposit: 1000,
    performanceFee: 25,
    managementFee: 2.5,
    strategy: "Leverage Trading",
    assets: ["MEME", "AI", "RWA"]
  },
  {
    id: 4,
    name: "Smart Beta",
    trader: "AlgoTrader.cspr",
    avatar: "🤖",
    roi: 127.4,
    risk: "Medium",
    followers: 2156,
    aum: 5847000,
    description: "Algorithmic trading with ML-powered signal generation and portfolio optimization",
    badge: "🧠 AI Powered",
    winRate: 78,
    minDeposit: 250,
    performanceFee: 18,
    managementFee: 1.5,
    strategy: "Algorithmic",
    assets: ["BTC", "ETH", "CSPR"]
  },
]

const riskColors = {
  Low: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", dot: "bg-green-500" },
  Medium: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", dot: "bg-amber-500" },
  High: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", dot: "bg-orange-500" },
  "Very High": { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", dot: "bg-red-500" },
}

const strategies = ["Momentum", "Yield Farming", "Leverage Trading", "Algorithmic", "Arbitrage", "Market Making"]
const riskLevels = ["Low", "Medium", "High", "Very High"]

export default function VaultsPage() {
  const { balance, deductBalance, addTransaction } = useWallet()
  const [vaults, setVaults] = useState<Vault[]>(initialVaults)
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStatus, setTxStatus] = useState<"idle" | "success">("idle")
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [sortBy, setSortBy] = useState<"roi" | "aum" | "followers">("roi")
  
  // Create vault form state
  const [newVault, setNewVault] = useState({
    name: "",
    description: "",
    strategy: "Momentum",
    risk: "Medium" as const,
    minDeposit: 100,
    performanceFee: 15,
    managementFee: 1,
    initialDeposit: 1000,
  })

  // Live follower, AUM, and ROI simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setVaults(prev => prev.map(v => {
        // Simulate follower growth
        const newFollowers = v.followers + (Math.random() > 0.7 ? 1 : 0)
        // Simulate AUM changes
        const aumChange = (Math.random() > 0.5 ? Math.floor(Math.random() * 10000) : -Math.floor(Math.random() * 5000))
        const newAum = Math.max(v.aum + aumChange, v.aum * 0.95)
        // Simulate ROI fluctuation based on risk
        const roiVolatility = v.risk === 'Very High' ? 0.5 : v.risk === 'High' ? 0.3 : v.risk === 'Medium' ? 0.15 : 0.05
        const roiChange = (Math.random() - 0.48) * roiVolatility
        const newRoi = Math.max(0, v.roi + roiChange)
        // Simulate win rate changes
        const winRateChange = (Math.random() - 0.5) * 0.5
        const newWinRate = Math.min(100, Math.max(0, v.winRate + winRateChange))
        
        return {
          ...v,
          followers: newFollowers,
          aum: newAum,
          roi: newRoi,
          winRate: newWinRate
        }
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Filter and sort vaults
  const filteredVaults = vaults
    .filter(v => {
      if (filter === "all") return true
      if (filter === "low") return v.risk === "Low"
      if (filter === "medium") return v.risk === "Medium"
      if (filter === "high") return v.risk === "High" || v.risk === "Very High"
      return true
    })
    .sort((a, b) => {
      if (sortBy === "roi") return b.roi - a.roi
      if (sortBy === "aum") return b.aum - a.aum
      if (sortBy === "followers") return b.followers - a.followers
      return 0
    })

  const totalAUM = vaults.reduce((acc, v) => acc + v.aum, 0)
  const totalFollowers = vaults.reduce((acc, v) => acc + v.followers, 0)
  const avgROI = vaults.reduce((acc, v) => acc + v.roi, 0) / vaults.length

  const handleDeposit = async () => {
    if (!selectedVault || !depositAmount) return
    
    setError(null)
    const depositNum = parseFloat(depositAmount)
    // Convert USD to CSPR (at $0.025 per CSPR)
    const csprAmount = depositNum / 0.025
    
    if (csprAmount > balance) {
      setError(`Insufficient balance. You need ${csprAmount.toFixed(2)} CSPR but have ${balance.toFixed(2)} CSPR`)
      return
    }
    
    setIsProcessing(true)
    
    // Deduct balance
    const success = deductBalance(csprAmount)
    if (!success) {
      setError("Transaction failed: Insufficient balance")
      setIsProcessing(false)
      return
    }
    
    // Record transaction
    await addTransaction({
      type: "vault_deposit",
      amount: csprAmount,
      token: "CSPR",
      status: "pending",
      description: `Deposited $${depositNum.toLocaleString()} to ${selectedVault.name} vault`,
      details: {
        vaultName: selectedVault.name,
      }
    })
    
    setVaults(prev => prev.map(v => 
      v.id === selectedVault.id 
        ? { ...v, aum: v.aum + depositNum, followers: v.followers + 1 }
        : v
    ))
    
    setIsProcessing(false)
    setTxStatus("success")
    
    setTimeout(() => {
      setTxStatus("idle")
      setShowDepositModal(false)
      setDepositAmount("")
      setSelectedVault(null)
    }, 2000)
  }

  const handleCreateVault = async () => {
    if (!newVault.name || !newVault.description) return
    
    setError(null)
    // Convert USD to CSPR
    const csprAmount = newVault.initialDeposit / 0.025
    
    if (csprAmount > balance) {
      setError(`Insufficient balance. You need ${csprAmount.toFixed(2)} CSPR but have ${balance.toFixed(2)} CSPR`)
      return
    }
    
    setIsProcessing(true)
    
    // Deduct balance
    const success = deductBalance(csprAmount)
    if (!success) {
      setError("Transaction failed: Insufficient balance")
      setIsProcessing(false)
      return
    }
    
    // Record transaction
    await addTransaction({
      type: "vault_deposit",
      amount: csprAmount,
      token: "CSPR",
      status: "pending",
      description: `Created new vault "${newVault.name}" with $${newVault.initialDeposit} initial deposit`,
      details: {
        vaultName: newVault.name,
      }
    })
    
    const createdVault: Vault = {
      id: Date.now(),
      name: newVault.name,
      trader: "You.cspr",
      avatar: "✨",
      roi: 0,
      risk: newVault.risk,
      followers: 0,
      aum: newVault.initialDeposit,
      description: newVault.description,
      badge: "🆕 New",
      winRate: 0,
      minDeposit: newVault.minDeposit,
      performanceFee: newVault.performanceFee,
      managementFee: newVault.managementFee,
      strategy: newVault.strategy,
      assets: ["CSPR"]
    }
    
    setVaults(prev => [createdVault, ...prev])
    setIsProcessing(false)
    setTxStatus("success")
    
    setTimeout(() => {
      setTxStatus("idle")
      setShowCreateModal(false)
      setNewVault({
        name: "",
        description: "",
        strategy: "Momentum",
        risk: "Medium",
        minDeposit: 100,
        performanceFee: 15,
        managementFee: 1,
        initialDeposit: 1000,
      })
    }, 2000)
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
      <AnimatedBackground />
      <Navigation />

      <div className="relative z-10 pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full text-pink-600 font-semibold text-sm mb-4">
              <Trophy className="w-4 h-4" />
              Copy Top Traders & Earn Together
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
              Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Trading</span> Vaults
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Deposit into top-performing vaults, copy expert strategies, and receive NFT shares
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Shield className="w-4 h-4" />
                Total Value Locked
              </div>
              <div className="text-3xl font-black text-foreground">${(totalAUM / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-green-500 mt-1">↑ 12.3% this week</div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Users className="w-4 h-4" />
                Total Followers
              </div>
              <div className="text-3xl font-black text-foreground">{totalFollowers.toLocaleString()}</div>
              <div className="text-xs text-green-500 mt-1">↑ 847 this month</div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                Average ROI
              </div>
              <div className="text-3xl font-black text-green-500">+{avgROI.toFixed(1)}%</div>
              <div className="text-xs text-gray-400 mt-1">Yearly return</div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <PieChart className="w-4 h-4" />
                Active Vaults
              </div>
              <div className="text-3xl font-black text-foreground">{vaults.length}</div>
              <div className="text-xs text-green-500 mt-1">+2 new this week</div>
            </div>
          </div>

          {/* Filter & Sort Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Risk Level:</span>
              {[
                { key: "all", label: "All" },
                { key: "low", label: "Low" },
                { key: "medium", label: "Medium" },
                { key: "high", label: "High" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as typeof filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === f.key
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-pink-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 focus:outline-none focus:border-pink-300"
              >
                <option value="roi">Highest ROI</option>
                <option value="aum">Highest AUM</option>
                <option value="followers">Most Followers</option>
              </select>
            </div>
          </div>

          {/* Vault Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {filteredVaults.map((vault) => (
              <div
                key={vault.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                {/* Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/30">
                      {vault.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        {vault.name}
                        {vault.roi > 200 && <Crown className="w-4 h-4 text-amber-500" />}
                      </h3>
                      <p className="text-gray-400 text-sm">{vault.trader}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-semibold">
                    {vault.badge}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{vault.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${riskColors[vault.risk].bg} ${riskColors[vault.risk].text} ${riskColors[vault.risk].border}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${riskColors[vault.risk].dot} mr-1.5`} />
                    {vault.risk} Risk
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                    {vault.strategy}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-pink-50 text-pink-600 border border-pink-200">
                    {vault.winRate}% Win Rate
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                    <div className="flex items-center justify-center gap-1 text-green-600 font-bold text-lg">
                      <TrendingUp className="w-4 h-4" />
                      +{vault.roi}%
                    </div>
                    <div className="text-xs text-center text-gray-500 mt-1">ROI (1Y)</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3 border border-pink-100">
                    <div className="flex items-center justify-center gap-1 text-foreground font-bold text-lg">
                      <Users className="w-4 h-4 text-pink-500" />
                      {vault.followers.toLocaleString()}
                    </div>
                    <div className="text-xs text-center text-gray-500 mt-1">Followers</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                    <div className="font-bold text-lg text-foreground text-center">
                      ${(vault.aum / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-xs text-center text-gray-500 mt-1">AUM</div>
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Performance</span>
                    <span>{Math.min(vault.roi / 5, 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(vault.roi / 5, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Fee Info */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Min: ${vault.minDeposit}
                  </span>
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Perf: {vault.performanceFee}%
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Mgmt: {vault.managementFee}%
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setSelectedVault(vault)
                      setShowDepositModal(true)
                    }}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/25"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Trade
                  </Button>
                  <Button variant="outline" className="rounded-xl border-2 border-pink-200 hover:bg-pink-50">
                    <Star className="w-4 h-4 text-pink-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Create Vault CTA */}
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-10 text-center text-white shadow-2xl shadow-pink-500/30 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                <Zap className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-3xl font-black mb-3">Become a Vault Manager</h3>
              <p className="text-white/80 mb-8 max-w-md mx-auto text-lg">
                Create your own trading vault, attract followers, and earn performance fees on profits.
              </p>
              
              <div className="flex items-center justify-center gap-8 mb-8">
                {[
                  { label: "Up to 25% fees", icon: Sparkles },
                  { label: "Full control", icon: Lock },
                  { label: "NFT ownership", icon: Shield },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-white/90">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="bg-white text-pink-600 hover:bg-white/90 rounded-2xl px-10 py-6 text-lg font-bold shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your Vault
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && selectedVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDepositModal(false)} />
          
          <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <button
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-3xl shadow-lg">
                {selectedVault.avatar}
              </div>
              <h3 className="text-2xl font-bold text-foreground">{selectedVault.name}</h3>
              <p className="text-gray-400">{selectedVault.trader}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Expected ROI</span>
                  <div className="font-bold text-green-500">+{selectedVault.roi}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Win Rate</span>
                  <div className="font-bold text-foreground">{selectedVault.winRate}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Performance Fee</span>
                  <div className="font-bold text-foreground">{selectedVault.performanceFee}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Min Deposit</span>
                  <div className="font-bold text-foreground">${selectedVault.minDeposit}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-600">Deposit Amount (USD)</label>
                <span className="text-xs text-gray-400">
                  Balance: <span className="font-semibold text-pink-500">{balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} CSPR</span>
                  <span className="text-gray-300 ml-1">(≈ ${(balance * 0.025).toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => {
                    setDepositAmount(e.target.value)
                    setError(null)
                  }}
                  placeholder={`Min $${selectedVault.minDeposit}`}
                  className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none text-xl font-bold"
                />
                <button
                  onClick={() => setDepositAmount((balance * 0.025).toFixed(0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-pink-100 text-pink-600 text-xs font-bold hover:bg-pink-200"
                >
                  MAX
                </button>
              </div>
              {depositAmount && parseFloat(depositAmount) > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Cost: {(parseFloat(depositAmount) / 0.025).toLocaleString(undefined, { maximumFractionDigits: 0 })} CSPR
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="bg-pink-50 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
              <p className="text-sm text-pink-700">
                You'll receive an NFT representing your share of the vault. This NFT can be traded or redeemed.
              </p>
            </div>

            <Button
              onClick={handleDeposit}
              disabled={isProcessing || !depositAmount || parseFloat(depositAmount) < selectedVault.minDeposit || (parseFloat(depositAmount) / 0.025) > balance}
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
                  Deposited Successfully!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Deposit & Get NFT Share
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Create Vault Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Create Your Vault</h3>
              <p className="text-gray-400">Set up your trading vault and start earning</p>
            </div>

            <div className="space-y-5">
              {/* Vault Name */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Vault Name *</label>
                <input
                  type="text"
                  value={newVault.name}
                  onChange={(e) => setNewVault(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Alpha Trading Fund"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Description *</label>
                <textarea
                  value={newVault.description}
                  onChange={(e) => setNewVault(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your trading strategy..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none resize-none"
                />
              </div>

              {/* Strategy & Risk */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Strategy</label>
                  <select
                    value={newVault.strategy}
                    onChange={(e) => setNewVault(prev => ({ ...prev, strategy: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 outline-none font-medium"
                  >
                    {strategies.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Risk Level</label>
                  <select
                    value={newVault.risk}
                    onChange={(e) => setNewVault(prev => ({ ...prev, risk: e.target.value as Vault["risk"] }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 outline-none font-medium"
                  >
                    {riskLevels.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fees */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Performance Fee (%)</label>
                  <input
                    type="number"
                    value={newVault.performanceFee}
                    onChange={(e) => setNewVault(prev => ({ ...prev, performanceFee: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    max="25"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Management Fee (%)</label>
                  <input
                    type="number"
                    value={newVault.managementFee}
                    onChange={(e) => setNewVault(prev => ({ ...prev, managementFee: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    max="5"
                    step="0.5"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Min Deposit & Initial */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Min Deposit ($)</label>
                  <input
                    type="number"
                    value={newVault.minDeposit}
                    onChange={(e) => setNewVault(prev => ({ ...prev, minDeposit: parseFloat(e.target.value) || 0 }))}
                    min="10"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Your Initial Deposit ($)</label>
                  <input
                    type="number"
                    value={newVault.initialDeposit}
                    onChange={(e) => setNewVault(prev => ({ ...prev, initialDeposit: parseFloat(e.target.value) || 0 }))}
                    min="100"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Creating a vault costs a one-time fee of <span className="font-bold">500 CSPR</span>. You'll receive an NFT representing vault ownership.
                </p>
              </div>

              <Button
                onClick={handleCreateVault}
                disabled={isProcessing || !newVault.name || !newVault.description}
                className="w-full py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg shadow-pink-500/25 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Vault...
                  </span>
                ) : txStatus === "success" ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Vault Created!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Create Vault
                    <ArrowUpRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
