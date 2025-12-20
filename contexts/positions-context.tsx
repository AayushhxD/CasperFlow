"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

export interface Position {
  id: string
  assetId: string
  asset: string
  side: "long" | "short"
  entry: number
  size: number
  leverage: number
  margin: number // CSPR amount used as margin
  openTime: Date
  txHash: string
}

interface PositionsContextType {
  positions: Position[]
  addPosition: (position: Omit<Position, "id" | "openTime">) => void
  closePosition: (id: string) => Position | null
  totalMargin: number
  totalPnl: number
  updatePnl: (pnl: number) => void
}

export const PositionsContext = createContext<PositionsContextType | undefined>(undefined)

export function PositionsProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<Position[]>([])
  const [totalPnl, setTotalPnl] = useState(0)
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({})

  // Load positions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("casperPositions")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPositions(parsed.map((p: Position) => ({
          ...p,
          openTime: new Date(p.openTime)
        })))
      } catch (e) {
        console.error("Error loading positions:", e)
      }
    }
  }, [])

  // Real-time price updates via WebSocket
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/solusdt@ticker/avaxusdt@ticker')
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.s && data.c) {
          const symbol = data.s.replace('USDT', '')
          const price = parseFloat(data.c)
          
          setCurrentPrices(prev => ({
            ...prev,
            [symbol]: price
          }))
        }
      } catch (error) {
        console.error('WebSocket error:', error)
      }
    }
    
    // Fallback price simulation
    const interval = setInterval(() => {
      setCurrentPrices(prev => ({
        CSPR: (prev.CSPR || 0.052) * (1 + (Math.random() - 0.5) * 0.015),
        BTC: (prev.BTC || 43500) * (1 + (Math.random() - 0.5) * 0.005),
        ETH: (prev.ETH || 2400) * (1 + (Math.random() - 0.5) * 0.008),
        SOL: (prev.SOL || 105) * (1 + (Math.random() - 0.5) * 0.01),
        AVAX: (prev.AVAX || 38) * (1 + (Math.random() - 0.5) * 0.01)
      }))
    }, 2000)
    
    return () => {
      ws.close()
      clearInterval(interval)
    }
  }, [])

  // Save positions to localStorage
  useEffect(() => {
    if (positions.length > 0) {
      localStorage.setItem("casperPositions", JSON.stringify(positions))
    } else {
      localStorage.removeItem("casperPositions")
    }
  }, [positions])

  const addPosition = useCallback((position: Omit<Position, "id" | "openTime">) => {
    const newPosition: Position = {
      ...position,
      id: Date.now().toString(),
      openTime: new Date(),
    }
    setPositions(prev => [newPosition, ...prev])
  }, [])

  const closePosition = useCallback((id: string): Position | null => {
    const position = positions.find(p => p.id === id)
    if (position) {
      setPositions(prev => prev.filter(p => p.id !== id))
      return position
    }
    return null
  }, [positions])

  const updatePnl = useCallback((pnl: number) => {
    setTotalPnl(pnl)
  }, [])

  // Calculate real-time P&L based on current prices
  useEffect(() => {
    if (positions.length === 0) {
      setTotalPnl(0)
      return
    }

    let calculatedPnl = 0
    positions.forEach(pos => {
      const baseAsset = pos.asset.split('/')[0]
      const currentPrice = currentPrices[baseAsset] || pos.entry
      
      const pnl = pos.side === 'long'
        ? (currentPrice - pos.entry) * pos.size
        : (pos.entry - currentPrice) * pos.size
      
      calculatedPnl += pnl
    })

    setTotalPnl(calculatedPnl)
  }, [positions, currentPrices])

  const totalMargin = positions.reduce((acc, p) => acc + p.margin, 0)

  return (
    <PositionsContext.Provider value={{
      positions,
      addPosition,
      closePosition,
      totalMargin,
      totalPnl,
      updatePnl,
    }}>
      {children}
    </PositionsContext.Provider>
  )
}

export function usePositions() {
  const context = useContext(PositionsContext)
  if (context === undefined) {
    throw new Error("usePositions must be used within a PositionsProvider")
  }
  return context
}
