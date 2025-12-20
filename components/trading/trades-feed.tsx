"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useMarket } from "@/lib/market-context"
import { 
  BinanceWebSocket, 
  getBinanceSymbol, 
  fetchRecentTrades,
  TradeData 
} from "@/lib/websocket-service"

interface DisplayTrade {
  id: number
  price: number
  quantity: number
  time: string
  isBuy: boolean
  isNew?: boolean
}

export function TradesFeed() {
  const { selectedAsset } = useMarket()
  const [trades, setTrades] = useState<DisplayTrade[]>([])
  const wsRef = useRef<BinanceWebSocket | null>(null)
  const tradesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedAsset) return

    const symbol = getBinanceSymbol(selectedAsset.id)

    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    }

    // Fetch initial trades
    const loadTrades = async () => {
      const data = await fetchRecentTrades(symbol, 30)
      if (data.length > 0) {
        const formattedTrades: DisplayTrade[] = data.reverse().map(t => ({
          id: t.id,
          price: t.price,
          quantity: t.quantity,
          time: formatTime(t.time),
          isBuy: !t.isBuyerMaker, // If buyer is maker, it's a sell order
        }))
        setTrades(formattedTrades)
      }
    }

    loadTrades()

    // Setup WebSocket for real-time trades
    const ws = new BinanceWebSocket(symbol, ['trade'])
    ws.connect()

    ws.on('trade', (data: TradeData) => {
      const newTrade: DisplayTrade = {
        id: data.id,
        price: data.price,
        quantity: data.quantity,
        time: formatTime(data.time),
        isBuy: !data.isBuyerMaker,
        isNew: true,
      }

      setTrades(prev => {
        const updated = [newTrade, ...prev.slice(0, 29)]
        // Remove isNew flag after animation
        setTimeout(() => {
          setTrades(current => 
            current.map(t => t.id === newTrade.id ? { ...t, isNew: false } : t)
          )
        }, 500)
        return updated
      })
    })

    wsRef.current = ws

    return () => {
      ws.disconnect()
    }
  }, [selectedAsset])

  if (!selectedAsset) return null

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }

  const formatQty = (qty: number) => {
    if (qty >= 100) return qty.toLocaleString(undefined, { maximumFractionDigits: 2 })
    if (qty >= 1) return qty.toFixed(4)
    return qty.toFixed(6)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Recent Trades</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-4 py-2 border-b border-gray-50 flex items-center text-xs text-gray-400 font-medium">
        <span className="flex-1">Price (USDT)</span>
        <span className="flex-1 text-right">Amount</span>
        <span className="w-20 text-right">Time</span>
      </div>

      {/* Trades List */}
      <div 
        ref={tradesContainerRef}
        className="flex-1 overflow-auto"
      >
        {trades.map((trade, i) => (
          <div 
            key={`${trade.id}-${i}`}
            className={`px-4 py-1.5 flex items-center text-xs hover:bg-gray-50/50 cursor-pointer transition-all ${
              trade.isNew ? 'bg-gray-100/50' : ''
            }`}
          >
            <span className={`flex-1 font-medium tabular-nums flex items-center gap-1 ${
              trade.isBuy ? 'text-green-500' : 'text-red-500'
            }`}>
              {trade.isBuy ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {formatPrice(trade.price)}
            </span>
            <span className="flex-1 text-right text-gray-600 tabular-nums">
              {formatQty(trade.quantity)}
            </span>
            <span className="w-20 text-right text-gray-400 tabular-nums">
              {trade.time}
            </span>
          </div>
        ))}
        
        {trades.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8 text-gray-400 text-sm">
            Loading trades...
          </div>
        )}
      </div>
    </div>
  )
}
