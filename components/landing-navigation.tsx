"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Zap, Loader2, ArrowRight, Sparkles, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { useRouter } from "next/navigation"

export function LandingNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showError, setShowError] = useState(false)
  const { connect, isConnecting, isConnected, error, isCasperWalletInstalled } = useWallet()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // If already connected, redirect to app
  useEffect(() => {
    if (isConnected) {
      router.push("/trade")
    }
  }, [isConnected, router])

  // Show error toast
  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleConnect = async () => {
    await connect()
  }

  const landingLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Stats", href: "#stats" },
    { name: "Docs", href: "#" },
  ]

  return (
    <>
      {/* Error Toast */}
      {showError && error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">{error}</span>
            <button onClick={() => setShowError(false)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground tracking-tight">CasperFlow</span>
                <span className="text-[10px] text-pink-500 font-semibold -mt-0.5 tracking-wider">DEFI PROTOCOL</span>
              </div>
            </Link>

            {/* Desktop Nav Items - Landing specific */}
            <div className="hidden md:flex items-center gap-6">
              {landingLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {!isCasperWalletInstalled ? (
                <a
                  href="https://www.casperwallet.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-rose-600 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Install Casper Wallet
                </a>
              ) : (
                <>
                  <Button 
                    onClick={handleConnect}
                    disabled={isConnecting}
                    variant="ghost" 
                    className="text-muted-foreground hover:text-foreground hover:bg-pink-50 rounded-xl px-4 font-medium"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 mr-2 rounded-md bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                          <span className="text-[10px]">💎</span>
                        </div>
                        Connect CSPR Wallet
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl px-6 font-semibold shadow-lg shadow-pink-500/25"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Launch App
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </>
              )}
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
              <div className="grid gap-2">
                {landingLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="px-4 py-3 rounded-xl font-medium text-foreground hover:bg-pink-50 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                {!isCasperWalletInstalled ? (
                  <a
                    href="https://www.casperwallet.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Install Casper Wallet
                  </a>
                ) : (
                  <>
                    <Button 
                      onClick={handleConnect}
                      disabled={isConnecting}
                      variant="outline" 
                      className="w-full rounded-xl border-pink-200"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 mr-2 rounded-md bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                            <span className="text-[10px]">💎</span>
                          </div>
                          Connect CSPR Wallet
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg shadow-pink-500/25"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Launching...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Launch App
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
