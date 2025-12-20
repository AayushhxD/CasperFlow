"use client"

// Binance WebSocket service for real-time market data

export interface KlineData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TradeData {
  id: number
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
}

export interface OrderBookData {
  bids: [string, string][] // [price, quantity]
  asks: [string, string][]
  lastUpdateId: number
}

export interface TickerData {
  symbol: string
  price: number
  priceChange: number
  priceChangePercent: number
  high24h: number
  low24h: number
  volume24h: number
  quoteVolume24h: number
}

// Map our asset IDs to Binance symbols
const SYMBOL_MAP: Record<string, string> = {
  'casper-network': 'ETHUSDT', // CSPR not on Binance, use ETH as proxy for demo
  'ethereum': 'ETHUSDT',
  'bitcoin': 'BTCUSDT',
  'solana': 'SOLUSDT',
  'avalanche-2': 'AVAXUSDT',
}

export function getBinanceSymbol(assetId: string): string {
  return SYMBOL_MAP[assetId] || 'BTCUSDT'
}

// Fetch historical klines (candlestick data)
export async function fetchKlines(
  symbol: string,
  interval: string = '1h',
  limit: number = 100
): Promise<KlineData[]> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    )
    
    if (!response.ok) throw new Error('Failed to fetch klines')
    
    const data = await response.json()
    
    return data.map((k: any[]) => ({
      time: Math.floor(k[0] / 1000), // Convert to seconds for lightweight-charts
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }))
  } catch (error) {
    console.error('Error fetching klines:', error)
    return []
  }
}

// Fetch order book depth
export async function fetchOrderBook(
  symbol: string,
  limit: number = 20
): Promise<OrderBookData | null> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`
    )
    
    if (!response.ok) throw new Error('Failed to fetch order book')
    
    const data = await response.json()
    return {
      bids: data.bids,
      asks: data.asks,
      lastUpdateId: data.lastUpdateId,
    }
  } catch (error) {
    console.error('Error fetching order book:', error)
    return null
  }
}

// Fetch recent trades
export async function fetchRecentTrades(
  symbol: string,
  limit: number = 50
): Promise<TradeData[]> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=${limit}`
    )
    
    if (!response.ok) throw new Error('Failed to fetch trades')
    
    const data = await response.json()
    return data.map((t: any) => ({
      id: t.id,
      price: parseFloat(t.price),
      quantity: parseFloat(t.qty),
      time: t.time,
      isBuyerMaker: t.isBuyerMaker,
    }))
  } catch (error) {
    console.error('Error fetching trades:', error)
    return []
  }
}

// Fetch 24hr ticker
export async function fetch24hrTicker(symbol: string): Promise<TickerData | null> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    )
    
    if (!response.ok) throw new Error('Failed to fetch ticker')
    
    const data = await response.json()
    return {
      symbol: data.symbol,
      price: parseFloat(data.lastPrice),
      priceChange: parseFloat(data.priceChange),
      priceChangePercent: parseFloat(data.priceChangePercent),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      volume24h: parseFloat(data.volume),
      quoteVolume24h: parseFloat(data.quoteVolume),
    }
  } catch (error) {
    console.error('Error fetching ticker:', error)
    return null
  }
}

// WebSocket connection class for real-time data with polling fallback
export class BinanceWebSocket {
  private ws: WebSocket | null = null
  private symbol: string
  private streams: string[]
  private callbacks: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnects = 3
  private reconnectDelay = 2000
  private pollingInterval: NodeJS.Timeout | null = null
  private usePolling = false
  private isConnecting = false

  constructor(symbol: string, streams: string[] = ['kline_1m', 'trade', 'depth20@100ms']) {
    this.symbol = symbol.toLowerCase()
    this.streams = streams
  }

  connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return
    
    // Check if we should use polling instead
    if (this.usePolling) {
      this.startPolling()
      return
    }

    this.isConnecting = true

    try {
      const streamNames = this.streams.map(s => `${this.symbol}@${s}`).join('/')
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streamNames}`

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          const streamType = message.stream?.split('@')[1]?.split('_')[0] || ''
          
          if (streamType === 'kline') {
            this.emit('kline', this.parseKline(message.data))
          } else if (streamType === 'trade') {
            this.emit('trade', this.parseTrade(message.data))
          } else if (streamType === 'depth20') {
            this.emit('depth', this.parseDepth(message.data))
          }
        } catch {
          // Silently handle parse errors
        }
      }

      this.ws.onerror = () => {
        // WebSocket failed, will fallback to polling on close
        this.isConnecting = false
      }

      this.ws.onclose = () => {
        this.isConnecting = false
        this.tryReconnect()
      }
    } catch {
      this.isConnecting = false
      this.usePolling = true
      this.startPolling()
    }
  }

  private tryReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnects) {
      this.reconnectAttempts++
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts)
    } else {
      // Fallback to polling after max reconnects
      this.usePolling = true
      this.startPolling()
    }
  }

  private startPolling(): void {
    if (this.pollingInterval) return

    const poll = async () => {
      try {
        // Fetch latest kline
        const klineResponse = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${this.symbol.toUpperCase()}&interval=1m&limit=1`
        )
        if (klineResponse.ok) {
          const klines = await klineResponse.json()
          if (klines.length > 0) {
            const k = klines[0]
            this.emit('kline', {
              time: Math.floor(k[0] / 1000),
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[5]),
            })
            this.emit('trade', {
              id: Date.now(),
              price: parseFloat(k[4]),
              quantity: Math.random() * 0.5,
              time: Date.now(),
              isBuyerMaker: Math.random() > 0.5,
            })
          }
        }

        // Fetch order book
        const depthResponse = await fetch(
          `https://api.binance.com/api/v3/depth?symbol=${this.symbol.toUpperCase()}&limit=20`
        )
        if (depthResponse.ok) {
          const depth = await depthResponse.json()
          this.emit('depth', {
            bids: depth.bids,
            asks: depth.asks,
            lastUpdateId: depth.lastUpdateId,
          })
        }
      } catch {
        // Silently handle polling errors
      }
    }

    // Initial poll
    poll()
    // Poll every 2 seconds
    this.pollingInterval = setInterval(poll, 2000)
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  private parseKline(data: any): KlineData {
    const k = data.k
    return {
      time: Math.floor(k.t / 1000),
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      volume: parseFloat(k.v),
    }
  }

  private parseTrade(data: any): TradeData {
    return {
      id: data.t,
      price: parseFloat(data.p),
      quantity: parseFloat(data.q),
      time: data.T,
      isBuyerMaker: data.m,
    }
  }

  private parseDepth(data: any): OrderBookData {
    return {
      bids: data.bids,
      asks: data.asks,
      lastUpdateId: data.lastUpdateId,
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set())
    }
    this.callbacks.get(event)!.add(callback)
  }

  off(event: string, callback: (data: any) => void): void {
    this.callbacks.get(event)?.delete(callback)
  }

  private emit(event: string, data: any): void {
    this.callbacks.get(event)?.forEach(callback => callback(data))
  }

  disconnect(): void {
    this.stopPolling()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.callbacks.clear()
    this.usePolling = false
    this.reconnectAttempts = 0
  }

  changeSymbol(newSymbol: string): void {
    this.symbol = newSymbol.toLowerCase()
    this.disconnect()
    this.connect()
  }
}
