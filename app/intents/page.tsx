"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { 
  ArrowRight, Sparkles, Zap, DollarSign, Target, Loader2, CheckCircle, 
  Workflow, Globe, Shield, Rocket, ChevronRight, TrendingUp, Clock,
  ArrowDownUp, Layers, Activity, RefreshCw, X, Info, ExternalLink,
  ChevronDown, BarChart3, Percent, Coins, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"

interface Chain {
  name: string
  icon: string
  color: string
  gasPrice: number
  latency: number
}

interface Intent {
  id: number
  title: string
  description: string
  icon: React.ElementType
  gradient: string
  popular: boolean
  category: string
  estimatedSavings: number
}

interface ExecutionRoute {
  chain: string
  action: string
  amount: string
  status: 'pending' | 'executing' | 'completed'
}

const chains: Chain[] = [
  { name: "Casper", icon: "💎", color: "#FF0080", gasPrice: 0.001, latency: 12 },
  { name: "Ethereum", icon: "⟠", color: "#627EEA", gasPrice: 15.4, latency: 15 },
  { name: "Arbitrum", icon: "🔷", color: "#28A0F0", gasPrice: 0.12, latency: 2 },
  { name: "Optimism", icon: "🔴", color: "#FF0420", gasPrice: 0.08, latency: 2 },
  { name: "Polygon", icon: "🟣", color: "#8247E5", gasPrice: 45, latency: 3 },
  { name: "Base", icon: "🔵", color: "#0052FF", gasPrice: 0.05, latency: 2 },
]

const intents: Intent[] = [
  {
    id: 1,
    title: "Get Exposure to ETH",
    description: "Long ETH with optimal execution across chains. AI finds best entry.",
    icon: TrendingUp,
    gradient: "from-blue-500 to-cyan-500",
    popular: true,
    category: "Trading",
    estimatedSavings: 34,
  },
  {
    id: 2,
    title: "Maximum Leverage",
    description: "Highest leverage available for your collateral with liquidation protection.",
    icon: Zap,
    gradient: "from-orange-500 to-red-500",
    popular: false,
    category: "Leverage",
    estimatedSavings: 28,
  },
  {
    id: 3,
    title: "Lowest Fees Route",
    description: "Route for minimal trading and gas costs across all supported chains.",
    icon: DollarSign,
    gradient: "from-green-500 to-emerald-500",
    popular: true,
    category: "Optimization",
    estimatedSavings: 45,
  },
  {
    id: 4,
    title: "Best Yield Strategy",
    description: "Maximize staking & LP rewards while maintaining your position.",
    icon: Sparkles,
    gradient: "from-pink-500 to-purple-500",
    popular: true,
    category: "Yield",
    estimatedSavings: 52,
  },
  {
    id: 5,
    title: "Cross-Chain Arbitrage",
    description: "Exploit price differences across chains automatically.",
    icon: ArrowDownUp,
    gradient: "from-indigo-500 to-violet-500",
    popular: false,
    category: "Arbitrage",
    estimatedSavings: 38,
  },
  {
    id: 6,
    title: "Dollar-Cost Average",
    description: "Automated DCA into your favorite assets across time.",
    icon: Layers,
    gradient: "from-teal-500 to-cyan-500",
    popular: false,
    category: "Strategy",
    estimatedSavings: 22,
  },
]

interface RecentExecution {
  id: string;
  intent: string;
  status: string;
  savings: string;
  time: string;
  chains: number;
  timestamp: number;
}

export default function IntentsPage() {
  const { balance, deductBalance, addBalance, addTransaction, transactions } = useWallet()
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionStep, setExecutionStep] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error">("idle")
  const [totalSaved, setTotalSaved] = useState(0)
  const [amount, setAmount] = useState("1000")
  const [slippage, setSlippage] = useState("0.5")
  const [selectedChains, setSelectedChains] = useState<string[]>(["Casper", "Ethereum", "Arbitrum"])
  const [error, setError] = useState<string | null>(null)
  
  // Real-time gas prices simulation
  const [liveGasPrices, setLiveGasPrices] = useState<Record<string, number>>({})
  const [estimatedGas, setEstimatedGas] = useState(2.47)
  const [estimatedTime, setEstimatedTime] = useState(45)
  const [estimatedSlippage, setEstimatedSlippage] = useState(0.12)
  const [liveStats, setLiveStats] = useState({
    executedToday: 1847,
    totalSavings: 124750,
    avgSavings: 32,
  })

  // Real-time recent executions from wallet transactions
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([
    { id: '1', intent: "Get Exposure to ETH", status: "completed", savings: "$12.40", time: "2m ago", chains: 3, timestamp: Date.now() - 120000 },
    { id: '2', intent: "Lowest Fees Route", status: "completed", savings: "$8.75", time: "5m ago", chains: 2, timestamp: Date.now() - 300000 },
    { id: '3', intent: "Best Yield Strategy", status: "completed", savings: "$24.30", time: "12m ago", chains: 4, timestamp: Date.now() - 720000 },
  ]);

  // Execution route
  const [executionRoute, setExecutionRoute] = useState<ExecutionRoute[]>([])

  // Update recent executions from wallet transactions in real-time
  useEffect(() => {
    const updateRecentExecutions = () => {
      const intentTransactions = transactions
        .filter(tx => tx.type === 'intent' && tx.status === 'completed')
        .slice(0, 5)
        .map(tx => {
          const timestamp = new Date(tx.timestamp).getTime();
          const now = Date.now();
          const diffMinutes = Math.floor((now - timestamp) / 60000);
          const timeAgo = diffMinutes < 1 ? 'Just now' : 
                         diffMinutes === 1 ? '1m ago' :
                         diffMinutes < 60 ? `${diffMinutes}m ago` :
                         `${Math.floor(diffMinutes / 60)}h ago`;
          
          const chains = Math.floor(Math.random() * 3) + 2; // 2-4 chains
          const savings = (tx.amount * 0.025 * 0.15).toFixed(2);
          
          return {
            id: tx.id,
            intent: tx.details?.intentName || 'Intent Execution',
            status: 'completed',
            savings: `$${savings}`,
            time: timeAgo,
            chains,
            timestamp
          };
        });
      
      // If we have intent transactions, update the list
      if (intentTransactions.length > 0) {
        setRecentExecutions(intentTransactions);
      }
    };
    
    updateRecentExecutions();
    const interval = setInterval(updateRecentExecutions, 2000);
    return () => clearInterval(interval);
  }, [transactions]);

  // Initialize and update gas prices with real-time feel
  useEffect(() => {
    const updateGasPrices = () => {
      const prices: Record<string, number> = {}
      chains.forEach(chain => {
        const fluctuation = (Math.random() - 0.5) * 0.2
        prices[chain.name] = chain.gasPrice * (1 + fluctuation)
      })
      setLiveGasPrices(prices)
      
      // Update estimated gas
      setEstimatedGas(prev => {
        const change = (Math.random() - 0.5) * 0.1
        return Math.max(1, prev + change)
      })
      
      // Update live stats
      setLiveStats(prev => ({
        executedToday: prev.executedToday + (Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0),
        totalSavings: prev.totalSavings + (Math.random() > 0.5 ? Math.floor(Math.random() * 50) : 0),
        avgSavings: prev.avgSavings + (Math.random() - 0.5) * 0.5,
      }))
      
      // Update estimated time based on network conditions
      setEstimatedTime(prev => {
        const change = Math.floor((Math.random() - 0.5) * 10)
        return Math.max(15, Math.min(120, prev + change))
      })
    }
    
    updateGasPrices()
    const interval = setInterval(updateGasPrices, 3000)
    return () => clearInterval(interval)
  }, [])

  // Generate execution route when intent is selected
  useEffect(() => {
    if (selectedIntent && selectedChains.length > 0) {
      const amountNum = parseFloat(amount) || 1000
      const chainsToUse = selectedChains.slice(0, Math.min(3, selectedChains.length))
      const route: ExecutionRoute[] = chainsToUse.map((chain, i) => ({
        chain,
        action: i === 0 ? "Bridge Assets" : i === 1 ? "Swap Tokens" : "Execute Trade",
        amount: `$${(amountNum / chainsToUse.length).toFixed(2)}`,
        status: 'pending'
      }))
      setExecutionRoute(route)
      
      // Calculate estimates based on intent and chains
      const baseTime = chainsToUse.reduce((acc, chainName) => {
        const chain = chains.find(c => c.name === chainName)
        return acc + (chain?.latency || 10)
      }, 0)
      setEstimatedTime(baseTime)
      setEstimatedSlippage(parseFloat(slippage) * 0.24)
      
      // Calculate estimated gas based on selected chains
      const totalGas = chainsToUse.reduce((acc, chainName) => {
        return acc + (liveGasPrices[chainName] || 1)
      }, 0)
      setEstimatedGas(totalGas)
    }
  }, [selectedIntent, selectedChains, amount, slippage, liveGasPrices])

  const handleExecute = async () => {
    if (!selectedIntent || executionRoute.length === 0) return
    
    setError(null)
    const amountNum = parseFloat(amount) || 0
    if (amountNum <= 0) {
      setError("Please enter a valid amount")
      return
    }
    
    // Convert USD to CSPR and add gas cost
    const csprAmount = (amountNum / 0.025) + (estimatedGas / 0.025)
    
    if (csprAmount > balance) {
      setError(`Insufficient balance. You need ${csprAmount.toFixed(0)} CSPR but have ${balance.toFixed(0)} CSPR`)
      return
    }
    
    setIsExecuting(true)
    setTxStatus("idle")
    
    // Deduct balance
    const success = deductBalance(csprAmount)
    if (!success) {
      setError("Transaction failed: Insufficient balance")
      setIsExecuting(false)
      return
    }
    
    // Record transaction
    await addTransaction({
      type: "intent",
      amount: csprAmount,
      token: "CSPR",
      status: "pending",
      description: `${selectedIntent.title} - Executed across ${executionRoute.length} chains`,
      details: {
        intentName: selectedIntent.title,
      }
    })
    
    // Execute through each step
    for (let i = 0; i < executionRoute.length; i++) {
      setExecutionStep(i)
      setExecutionRoute(prev => prev.map((r, idx) => ({
        ...r,
        status: idx === i ? 'executing' : idx < i ? 'completed' : 'pending'
      })))
      await new Promise(r => setTimeout(r, 1500))
    }
    
    // Mark all as completed
    setExecutionRoute(prev => prev.map(r => ({ ...r, status: 'completed' })))
    setExecutionStep(executionRoute.length)
    
    // Calculate savings
    const savedAmount = amountNum * (selectedIntent.estimatedSavings / 100) * 0.1
    setTotalSaved(prev => prev + savedAmount)
    
    await new Promise(r => setTimeout(r, 500))
    setIsExecuting(false)
    setTxStatus("success")
    
    // Reset after showing success
    setTimeout(() => {
      setTxStatus("idle")
      // Reset execution route to pending for next execution
      setExecutionRoute(prev => prev.map(r => ({ ...r, status: 'pending' })))
      setExecutionStep(0)
    }, 3000)
  }

  const toggleChain = (chainName: string) => {
    if (isExecuting) return // Don't allow changes while executing
    setSelectedChains(prev => {
      const newChains = prev.includes(chainName)
        ? prev.filter(c => c !== chainName)
        : [...prev, chainName]
      // Ensure at least one chain is selected
      return newChains.length > 0 ? newChains : prev
    })
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
              <Workflow className="w-4 h-4" />
              AI-Powered Intent Engine
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
              Cross-Chain <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Trade</span> Intents
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Express what you want, not how to get it. Our AI finds the optimal path.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Activity className="w-4 h-4" />
                Executed Today
              </div>
              <div className="text-3xl font-black text-foreground tabular-nums">{liveStats.executedToday.toLocaleString()}</div>
              <div className="text-xs text-green-500 mt-1">↑ 12% vs yesterday</div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <DollarSign className="w-4 h-4" />
                Total Savings
              </div>
              <div className="text-3xl font-black text-green-500 tabular-nums">${(liveStats.totalSavings / 1000).toFixed(1)}K</div>
              <div className="text-xs text-gray-400 mt-1">In gas & fees saved</div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Percent className="w-4 h-4" />
                Avg. Savings
              </div>
              <div className="text-3xl font-black text-foreground tabular-nums">{liveStats.avgSavings.toFixed(1)}%</div>
              <div className="text-xs text-green-500 mt-1">vs direct execution</div>
            </div>
          </div>

          {/* Supported Chains */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-lg shadow-gray-200/50 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Select Chains for Routing</span>
              <span className="text-xs text-gray-400">{selectedChains.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {chains.map((chain) => (
                <button
                  key={chain.name}
                  onClick={() => toggleChain(chain.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    selectedChains.includes(chain.name)
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <span className="text-lg">{chain.icon}</span>
                  <span>{chain.name}</span>
                  <span className={`text-xs ${selectedChains.includes(chain.name) ? "text-white/70" : "text-green-500"}`}>
                    ${liveGasPrices[chain.name]?.toFixed(2) || chain.gasPrice}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Intent Cards */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-pink-500" />
                Select Your Intent
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {intents.map((intent) => (
                  <button
                    key={intent.id}
                    onClick={() => setSelectedIntent(intent)}
                    className={`text-left bg-white rounded-2xl p-5 border-2 transition-all hover:shadow-xl hover:-translate-y-0.5 ${
                      selectedIntent?.id === intent.id
                        ? "border-pink-500 shadow-xl shadow-pink-500/20 bg-gradient-to-br from-pink-50 to-white"
                        : "border-gray-100 hover:border-pink-200"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${intent.gradient} flex items-center justify-center shadow-lg`}>
                        <intent.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {intent.popular && (
                          <span className="px-2 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-semibold">
                            ⭐ Popular
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                          {intent.category}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-1">{intent.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{intent.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg">
                        ~{intent.estimatedSavings}% savings
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedIntent?.id === intent.id
                          ? "bg-pink-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {selectedIntent?.id === intent.id ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Execution Panel */}
            <div className="space-y-4">
              {selectedIntent ? (
                <>
                  {/* Configuration Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-5">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-pink-500" />
                      Configure Intent
                    </h3>
                    
                    {/* Amount Input */}
                    <div className="mb-4">
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
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none text-lg font-bold"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          {[100, 500, 1000].map(v => (
                            <button
                              key={v}
                              onClick={() => {
                                setAmount(v.toString())
                                setError(null)
                              }}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                                amount === v.toString()
                                  ? "bg-pink-500 text-white"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              ${v}
                            </button>
                          ))}
                        </div>
                      </div>
                      {parseFloat(amount) > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Cost: {(parseFloat(amount) / 0.025).toLocaleString(undefined, { maximumFractionDigits: 0 })} CSPR + {(estimatedGas / 0.025).toFixed(0)} gas
                        </p>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    {/* Slippage */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Slippage Tolerance</label>
                      <div className="flex gap-2">
                        {["0.1", "0.5", "1.0", "2.0"].map(s => (
                          <button
                            key={s}
                            onClick={() => setSlippage(s)}
                            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                              slippage === s
                                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {s}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Toggle */}
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                      Advanced Settings
                    </button>

                    {showAdvanced && (
                      <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Max Gas Price</span>
                          <span className="font-medium">Auto</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Deadline</span>
                          <span className="font-medium">30 minutes</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">MEV Protection</span>
                          <span className="font-medium text-green-500">Enabled</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Execution Route */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-5">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-pink-500" />
                      Execution Route
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                      {executionRoute.map((step, i) => {
                        const chain = chains.find(c => c.name === step.chain)
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                              step.status === 'completed' 
                                ? 'bg-green-100' 
                                : step.status === 'executing' 
                                  ? 'bg-pink-100 animate-pulse' 
                                  : 'bg-gray-100'
                            }`}>
                              {step.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : step.status === 'executing' ? (
                                <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
                              ) : (
                                chain?.icon
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-foreground">{step.action}</div>
                              <div className="text-xs text-gray-400">{step.chain} • {step.amount}</div>
                            </div>
                            {i < executionRoute.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Estimates */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-foreground">${estimatedGas.toFixed(2)}</div>
                        <div className="text-xs text-gray-400">Gas</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-foreground">~{estimatedTime}s</div>
                        <div className="text-xs text-gray-400">Time</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-foreground">{estimatedSlippage.toFixed(2)}%</div>
                        <div className="text-xs text-gray-400">Slippage</div>
                      </div>
                    </div>

                    {/* Success Message */}
                    {txStatus === "success" && selectedIntent && (
                      <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-semibold text-green-700">Intent Executed Successfully!</div>
                          <div className="text-sm text-green-600">
                            Saved ${((parseFloat(amount) || 0) * selectedIntent.estimatedSavings / 100 * 0.1).toFixed(2)} in fees
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Execute Button */}
                    <Button
                      onClick={handleExecute}
                      disabled={isExecuting || selectedChains.length < 1 || !parseFloat(amount)}
                      className="w-full py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25 disabled:opacity-50"
                    >
                      {isExecuting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Executing... {executionStep + 1}/{executionRoute.length}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Rocket className="w-5 h-5" />
                          Execute Intent
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-100 flex items-center justify-center">
                    <Target className="w-8 h-8 text-pink-500" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Select an Intent</h3>
                  <p className="text-gray-500 text-sm">
                    Choose what you want to achieve and we'll find the best path across chains.
                  </p>
                </div>
              )}

              {/* Recent Executions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pink-500" />
                    Recent Executions
                  </h3>
                  <span className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                  </span>
                </div>
                
                <div className="space-y-3">
                  {recentExecutions.map((exec, i) => (
                    <div 
                      key={exec.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-[1.01] animate-in fade-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-foreground">{exec.intent}</div>
                          <div className="text-xs text-gray-400">{exec.chains} chains • {exec.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500 text-sm">{exec.savings}</div>
                        <div className="text-xs text-gray-400">saved</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">How Intent-Based Trading Works</h4>
                <p className="text-gray-600 text-sm">
                  Instead of manually executing trades across multiple chains, simply express your goal. 
                  Our AI engine analyzes all possible routes, optimizes for gas costs, slippage, and speed, 
                  then executes the best path automatically. Save up to 50% on fees with smart order routing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
