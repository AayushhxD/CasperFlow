"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useMarketData, MarketData } from "@/lib/market-data"

const MarketContext = createContext<MarketData | null>(null)

export function MarketProvider({ children }: { children: ReactNode }) {
  const marketData = useMarketData()

  return (
    <MarketContext.Provider value={marketData}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket(): MarketData {
  const context = useContext(MarketContext)
  if (!context) {
    throw new Error("useMarket must be used within a MarketProvider")
  }
  return context
}
