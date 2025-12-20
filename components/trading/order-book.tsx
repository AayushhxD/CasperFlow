"use client"

import { useEffect, useState, useRef } from "react"
import { useMarket } from "@/lib/market-context"
import { 
  BinanceWebSocket, 
  getBinanceSymbol, 
  fetchOrderBook,
  OrderBookData 
} from "@/lib/websocket-service"

interface OrderBookEntry {
  price: number
  quantity: number
  total: number
  percentage: number
}

export function OrderBook() {
  const { selectedAsset } = useMarket()
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[], asks: OrderBookEntry[] }>({ bids: [], asks: [] })
  const [spread, setSpread] = useState<{ value: number, percentage: number }>({ value: 0, percentage: 0 })
  const wsRef = useRef<BinanceWebSocket | null>(null)

  useEffect(() => {
    if (!selectedAsset) return

    const symbol = getBinanceSymbol(selectedAsset.id)

    // Fetch initial order book
    const loadOrderBook = async () => {
      const data = await fetchOrderBook(symbol, 15)
      if (data) {
        processOrderBook(data)
      }
    }

    const processOrderBook = (data: OrderBookData) => {
      const processSide = (entries: [string, string][], isBid: boolean): OrderBookEntry[] => {
        let runningTotal = 0
        const processed = entries.slice(0, 12).map(([price, qty]) => {
          const priceNum = parseFloat(price)
          const qtyNum = parseFloat(qty)
          runningTotal += qtyNum
          return {
            price: priceNum,
            quantity: qtyNum,
            total: runningTotal,
            percentage: 0,
          }
        })

        // Calculate max total for percentage
        const maxTotal = processed[processed.length - 1]?.total || 1
        return processed.map(entry => ({
          ...entry,
          percentage: (entry.total / maxTotal) * 100,
        }))
      }

      const bids = processSide(data.bids, true)
      const asks = processSide(data.asks, false).reverse() // Reverse asks for display

      // Calculate spread
      if (asks.length > 0 && bids.length > 0) {
        const lowestAsk = asks[asks.length - 1].price
        const highestBid = bids[0].price
        const spreadValue = lowestAsk - highestBid
        const spreadPct = (spreadValue / lowestAsk) * 100
        setSpread({ value: spreadValue, percentage: spreadPct })
      }

      setOrderBook({ bids, asks })
    }

    loadOrderBook()

    // Setup WebSocket for real-time updates
    const ws = new BinanceWebSocket(symbol, ['depth20@100ms'])
    ws.connect()

    ws.on('depth', (data: OrderBookData) => {
      processOrderBook(data)
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
    if (qty >= 1000) return qty.toLocaleString(undefined, { maximumFractionDigits: 2 })
    if (qty >= 1) return qty.toFixed(4)
    return qty.toFixed(6)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Order Book</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <button className="w-5 h-4 bg-gradient-to-r from-red-400 to-green-400 rounded-sm opacity-100" />
            <button className="w-5 h-4 bg-green-400 rounded-sm opacity-40" />
            <button className="w-5 h-4 bg-red-400 rounded-sm opacity-40" />
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-4 py-2 border-b border-gray-50 flex items-center text-xs text-gray-400 font-medium">
        <span className="flex-1">Price (USDT)</span>
        <span className="flex-1 text-right">Amount</span>
        <span className="flex-1 text-right">Total</span>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          {orderBook.asks.map((ask, i) => (
            <div 
              key={`ask-${i}`} 
              className="relative px-4 py-1 flex items-center text-xs hover:bg-red-50/50 cursor-pointer group"
            >
              <div 
                className="absolute inset-y-0 right-0 bg-red-100/50 transition-all"
                style={{ width: `${ask.percentage}%` }}
              />
              <span className="flex-1 font-medium text-red-500 relative z-10 tabular-nums">
                {formatPrice(ask.price)}
              </span>
              <span className="flex-1 text-right text-gray-600 relative z-10 tabular-nums">
                {formatQty(ask.quantity)}
              </span>
              <span className="flex-1 text-right text-gray-400 relative z-10 tabular-nums">
                {formatQty(ask.total)}
              </span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="px-4 py-2 border-y border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground tabular-nums">
            ${formatPrice(orderBook.bids[0]?.price || 0)}
          </span>
          <div className="text-xs text-gray-400">
            Spread: <span className="text-foreground font-medium">${spread.value.toFixed(2)}</span>
            <span className="ml-1">({spread.percentage.toFixed(3)}%)</span>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-auto">
          {orderBook.bids.map((bid, i) => (
            <div 
              key={`bid-${i}`} 
              className="relative px-4 py-1 flex items-center text-xs hover:bg-green-50/50 cursor-pointer group"
            >
              <div 
                className="absolute inset-y-0 right-0 bg-green-100/50 transition-all"
                style={{ width: `${bid.percentage}%` }}
              />
              <span className="flex-1 font-medium text-green-500 relative z-10 tabular-nums">
                {formatPrice(bid.price)}
              </span>
              <span className="flex-1 text-right text-gray-600 relative z-10 tabular-nums">
                {formatQty(bid.quantity)}
              </span>
              <span className="flex-1 text-right text-gray-400 relative z-10 tabular-nums">
                {formatQty(bid.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
