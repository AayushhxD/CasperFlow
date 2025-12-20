"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Zap, LogOut, ChevronDown, Copy, ExternalLink, Check, Globe, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { TransactionHistory } from "@/components/transaction-history"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showWalletMenu, setShowWalletMenu] = useState(false)
  const [showTxHistory, setShowTxHistory] = useState(false)
  const [copied, setCopied] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isConnected, address, publicKey, balance, disconnect, transactions } = useWallet()

  const getExplorerUrl = () => {
    return `https://cspr.live/account/${publicKey}`
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Redirect to home if not connected (except on landing page)
  useEffect(() => {
    if (!isConnected && pathname !== "/") {
      router.push("/")
    }
  }, [isConnected, pathname, router])

  const navItems = [
    { name: "Trade", href: "/trade" },
    { name: "Stake", href: "/stake" },
    { name: "Vaults", href: "/vaults" },
    { name: "Intents", href: "/intents" },
    { name: "Analytics", href: "/analytics" },
  ]

  const handleDisconnect = () => {
    disconnect()
    setShowWalletMenu(false)
    router.push("/")
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // If not connected, don't render app navigation
  if (!isConnected) {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
      <div
        className={`max-w-7xl mx-auto transition-all duration-300 rounded-2xl ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-xl border border-pink-100 shadow-lg shadow-pink-500/5" 
            : "bg-white/70 backdrop-blur-md border border-pink-50"
        }`}
      >
        <div className="px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/trade" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight">CasperFlow</span>
              <span className="text-[10px] text-pink-500 font-semibold -mt-0.5 tracking-wider">DEFI PROTOCOL</span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100/50 rounded-xl p-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/80"
                      }`}
                    >
                      {item.name}
                    </div>
                  </Link>
                )
              })}
            </div>
            
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-green-600 tracking-wide">LIVE</span>
            </div>
          </div>

          {/* Desktop Wallet Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Network Badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
              <span className="text-lg">💎</span>
              <span className="text-sm font-medium text-pink-600">Casper Network</span>
            </div>

            {/* Balance Display with live animation */}
            <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                   style={{ animation: 'shimmer 3s infinite' }} />
              <span className="text-sm font-bold text-green-600 relative z-10">
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CSPR
              </span>
            </div>

            {/* Wallet Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-pink-300 transition-all shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <span className="text-white text-xs">💎</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {address ? formatAddress(address) : "Connected"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showWalletMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showWalletMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                        <span className="text-white text-lg">💎</span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Casper Wallet</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-medium text-foreground">
                            {address ? formatAddress(address) : ""}
                          </span>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyAddress}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/80 hover:bg-white text-gray-600 text-xs font-medium transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <a
                        href={getExplorerUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/80 hover:bg-white text-gray-600 text-xs font-medium transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        CSPR.live
                      </a>
                    </div>
                  </div>
                  
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Balance</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Casper Network
                      </span>
                    </div>
                    <div className="text-2xl font-black text-foreground">
                      {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CSPR
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      ≈ ${(balance * 0.025).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowTxHistory(true)
                        setShowWalletMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <History className="w-4 h-4" />
                      <span className="font-medium">Transaction History</span>
                      {transactions.length > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-pink-100 text-pink-600 text-xs font-semibold rounded-full">
                          {transactions.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 border-t border-pink-100">
            {/* Mobile Balance */}
            <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <span className="text-white">💎</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Casper Wallet</div>
                  <div className="text-sm font-mono font-medium text-foreground">
                    {address ? formatAddress(address) : "Connected"}
                  </div>
                </div>
              </div>
              <div className="text-xl font-black text-foreground">
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CSPR
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                <span className="text-lg">💎</span>
                Casper Network
              </div>
            </div>

            <div className="grid gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                        : "text-foreground hover:bg-pink-50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleDisconnect}
                variant="outline" 
                className="w-full rounded-xl border-red-200 text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect Wallet
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showWalletMenu && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setShowWalletMenu(false)}
        />
      )}

      {/* Transaction History Modal */}
      <TransactionHistory 
        isOpen={showTxHistory} 
        onClose={() => setShowTxHistory(false)} 
      />
    </nav>
  )
}
