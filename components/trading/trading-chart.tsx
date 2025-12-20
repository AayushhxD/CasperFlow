"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { TrendingUp, TrendingDown, Maximize2, BarChart3, LineChart, CandlestickChart, Target, DollarSign } from "lucide-react"
import { useMarket } from "@/lib/market-context"
import { formatVolume } from "@/lib/market-data"
import { usePositions } from "@/contexts/positions-context"
import { 
  BinanceWebSocket, 
  getBinanceSymbol, 
  fetchKlines, 
  fetch24hrTicker,
  KlineData,
  TickerData 
} from "@/lib/websocket-service"

const TIMEFRAMES = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
]

const CHART_TYPES = [
  { icon: CandlestickChart, value: "candles", label: "Candlestick" },
  { icon: LineChart, value: "line", label: "Line" },
  { icon: BarChart3, value: "bars", label: "Bars" },
]

export function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candleSeriesRef = useRef<any>(null)
  const lineSeriesRef = useRef<any>(null)
  const barSeriesRef = useRef<any>(null)
  const volumeSeriesRef = useRef<any>(null)
  const currentSeriesRef = useRef<any>(null) // Track current active series
  const priceLinesRef = useRef<any[]>([])
  const wsRef = useRef<BinanceWebSocket | null>(null)
  
  const { selectedAsset, isLoading } = useMarket()
  const { positions } = usePositions()
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
  const [chartType, setChartType] = useState("candles")
  const [ticker, setTicker] = useState<TickerData | null>(null)
  const [livePrice, setLivePrice] = useState<number>(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chartReady, setChartReady] = useState(false)
  const [chartError, setChartError] = useState<string | null>(null)
  const [showPositions, setShowPositions] = useState(true)
  const [seriesSwitching, setSeriesSwitching] = useState(false)

  // Initialize chart - dynamically import to avoid SSR issues
  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return

    let isMounted = true
    let resizeObserver: ResizeObserver | null = null

    const initChart = async () => {
      try {
        // v5 API: Import the module
        const lc = await import('lightweight-charts')
        
        // Debug: log available exports
        console.log('Lightweight-charts exports:', Object.keys(lc))
        
        if (!isMounted || !chartContainerRef.current) return

        const { createChart, CandlestickSeries, HistogramSeries, ColorType, CrosshairMode } = lc
        
        // Validate exports exist
        if (!CandlestickSeries || !HistogramSeries) {
          console.error('Series exports not found:', { CandlestickSeries, HistogramSeries })
          throw new Error('Series types not available')
        }

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight || 400,
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#64748b',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          grid: {
            vertLines: { color: 'rgba(0, 0, 0, 0.04)' },
            horzLines: { color: 'rgba(0, 0, 0, 0.04)' },
          },
          crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: {
              color: '#ec4899',
              width: 1,
              style: 2,
              labelBackgroundColor: '#ec4899',
            },
            horzLine: {
              color: '#ec4899',
              width: 1,
              style: 2,
              labelBackgroundColor: '#ec4899',
            },
          },
          rightPriceScale: {
            borderColor: 'rgba(0, 0, 0, 0.1)',
            scaleMargins: { top: 0.1, bottom: 0.2 },
          },
          timeScale: {
            borderColor: 'rgba(0, 0, 0, 0.1)',
            timeVisible: true,
            secondsVisible: false,
          },
          handleScale: {
            axisPressedMouseMove: true,
          },
          handleScroll: {
            vertTouchDrag: true,
          },
        })

        // Add candlestick series (v5 API)
        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderUpColor: '#22c55e',
          borderDownColor: '#ef4444',
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        })

        // Add volume series (v5 API)
        const volumeSeries = chart.addSeries(HistogramSeries, {
          color: '#ec4899',
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume',
        })

        chart.priceScale('volume').applyOptions({
          scaleMargins: { top: 0.85, bottom: 0 },
        })

        chartRef.current = chart
        candleSeriesRef.current = candleSeries
        currentSeriesRef.current = candleSeries // Initialize current series
        volumeSeriesRef.current = volumeSeries
        setChartReady(true)

        // Responsive resize using ResizeObserver
        resizeObserver = new ResizeObserver((entries) => {
          if (chartContainerRef.current && chartRef.current) {
            const { width, height } = entries[0].contentRect
            if (width > 0 && height > 0) {
              chartRef.current.applyOptions({ width, height })
            }
          }
        })

        if (chartContainerRef.current) {
          resizeObserver.observe(chartContainerRef.current)
        }

        // Also handle window resize
        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            const width = chartContainerRef.current.clientWidth
            const height = chartContainerRef.current.clientHeight
            if (width > 0 && height > 0) {
              chartRef.current.applyOptions({ width, height })
            }
          }
        }

        window.addEventListener('resize', handleResize)
        // Initial resize after a short delay
        setTimeout(handleResize, 100)

        return () => {
          window.removeEventListener('resize', handleResize)
          if (resizeObserver) resizeObserver.disconnect()
        }
      } catch (error) {
        console.error('Failed to initialize chart:', error)
        const errMsg = error instanceof Error ? error.message : 'Unknown error'
        setChartError(`Chart error: ${errMsg}`)
      }
    }

    initChart()

    return () => {
      isMounted = false
      if (resizeObserver) resizeObserver.disconnect()
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        candleSeriesRef.current = null
        volumeSeriesRef.current = null
        setChartReady(false)
      }
    }
  }, [])

  // Switch chart type when user selects different type
  useEffect(() => {
    if (!chartReady || !chartRef.current) return

    const switchChartType = async () => {
      setSeriesSwitching(true)
      try {
        const lc = await import('lightweight-charts')
        const { CandlestickSeries, LineSeries, HistogramSeries } = lc

        // Remove existing series (but keep volume)
        if (currentSeriesRef.current && currentSeriesRef.current !== candleSeriesRef.current) {
          chartRef.current.removeSeries(currentSeriesRef.current)
        }

        // Create new series based on chart type (or keep existing candle series)
        if (chartType === 'candles') {
          // Use existing candle series from initialization if available
          if (!candleSeriesRef.current) {
            const candleSeries = chartRef.current.addSeries(CandlestickSeries, {
              upColor: '#22c55e',
              downColor: '#ef4444',
              borderUpColor: '#22c55e',
              borderDownColor: '#ef4444',
              wickUpColor: '#22c55e',
              wickDownColor: '#ef4444',
            })
            candleSeriesRef.current = candleSeries
          }
          currentSeriesRef.current = candleSeriesRef.current
        } else if (chartType === 'line') {
          // Remove candle series if it's showing
          if (candleSeriesRef.current && currentSeriesRef.current === candleSeriesRef.current) {
            chartRef.current.removeSeries(candleSeriesRef.current)
            candleSeriesRef.current = null
          }
          const lineSeries = chartRef.current.addSeries(LineSeries, {
            color: '#ec4899',
            lineWidth: 2,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
          })
          lineSeriesRef.current = lineSeries
          currentSeriesRef.current = lineSeries
        } else if (chartType === 'bars') {
          // Remove candle series if it's showing
          if (candleSeriesRef.current && currentSeriesRef.current === candleSeriesRef.current) {
            chartRef.current.removeSeries(candleSeriesRef.current)
            candleSeriesRef.current = null
          }
          const barSeries = chartRef.current.addSeries(HistogramSeries, {
            color: '#6366f1',
            priceFormat: { type: 'price' },
          })
          barSeriesRef.current = barSeries
          currentSeriesRef.current = barSeries
        }

        // Move volume series to back
        if (volumeSeriesRef.current) {
          chartRef.current.removeSeries(volumeSeriesRef.current)
          const volumeSeries = chartRef.current.addSeries(HistogramSeries, {
            color: '#ec4899',
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
          })
          volumeSeriesRef.current = volumeSeries
          chartRef.current.priceScale('volume').applyOptions({
            scaleMargins: { top: 0.85, bottom: 0 },
          })
        }
      } catch (error) {
        console.error('Error switching chart type:', error)
      } finally {
        // Small delay to ensure series is ready
        setTimeout(() => setSeriesSwitching(false), 50)
      }
    }

    switchChartType()
  }, [chartType, chartReady])

  // Load data when asset or timeframe changes
  useEffect(() => {
    if (!selectedAsset || !chartReady || seriesSwitching) return
    
    const currentSeries = currentSeriesRef.current || candleSeriesRef.current
    if (!currentSeries || !volumeSeriesRef.current) return

    const symbol = getBinanceSymbol(selectedAsset.id)
    
    // Fetch historical data
    const loadData = async () => {
      try {
        const klines = await fetchKlines(symbol, selectedTimeframe, 200)
        const tickerData = await fetch24hrTicker(symbol)
        
        // Re-check current series after async operations
        const currentSeries = currentSeriesRef.current || candleSeriesRef.current
        if (klines.length > 0 && currentSeries && volumeSeriesRef.current) {
          // Format data based on chart type
          if (chartType === 'candles') {
            const candleData = klines.map(k => ({
              time: k.time as any,
              open: k.open,
              high: k.high,
              low: k.low,
              close: k.close,
            }))
            currentSeries.setData(candleData)
          } else if (chartType === 'line') {
            const lineData = klines.map(k => ({
              time: k.time as any,
              value: k.close,
            }))
            currentSeries.setData(lineData)
          } else if (chartType === 'bars') {
            const barData = klines.map(k => ({
              time: k.time as any,
              value: k.close,
              color: k.close >= k.open ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
            }))
            currentSeries.setData(barData)
          }

          // Format volume data with colors
          const volumeData = klines.map(k => ({
            time: k.time as any,
            value: k.volume,
            color: k.close >= k.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          }))
          volumeSeriesRef.current.setData(volumeData)
          
          // Set initial live price
          const lastKline = klines[klines.length - 1]
          setLivePrice(lastKline.close)
          
          // Fit content
          chartRef.current?.timeScale().fitContent()
        }

        if (tickerData) {
          setTicker(tickerData)
          setLivePrice(tickerData.price)
        }
      } catch (error) {
        console.error('Error loading chart data:', error)
      }
    }

    loadData()

    // Setup WebSocket for real-time updates
    const ws = new BinanceWebSocket(symbol, [`kline_${selectedTimeframe}`, 'trade'])
    ws.connect()

    ws.on('kline', (data: KlineData) => {
      const currentSeries = currentSeriesRef.current || candleSeriesRef.current
      if (currentSeries && volumeSeriesRef.current) {
        // Update based on chart type
        if (chartType === 'candles') {
          currentSeries.update({
            time: data.time as any,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
          })
        } else if (chartType === 'line') {
          currentSeries.update({
            time: data.time as any,
            value: data.close,
          })
        } else if (chartType === 'bars') {
          currentSeries.update({
            time: data.time as any,
            value: data.close,
            color: data.close >= data.open ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
          })
        }
        
        volumeSeriesRef.current.update({
          time: data.time as any,
          value: data.volume,
          color: data.close >= data.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        })
        setLivePrice(data.close)
      }
    })

    ws.on('trade', (data: any) => {
      setLivePrice(data.price)
    })

    wsRef.current = ws

    return () => {
      ws.disconnect()
    }
  }, [selectedAsset, selectedTimeframe, chartReady, chartType, seriesSwitching])

  // Display positions on chart as price lines
  useEffect(() => {
    const currentSeries = currentSeriesRef.current || candleSeriesRef.current
    if (!chartReady || !currentSeries || !showPositions) return

    // Remove existing price lines
    priceLinesRef.current.forEach(line => {
      try {
        currentSeries?.removePriceLine(line)
      } catch (e) {
        // Line may already be removed
      }
    })
    priceLinesRef.current = []

    // Filter positions for current asset
    const assetPositions = positions.filter(p => {
      // Map position asset to current selected asset
      const positionSymbol = p.asset.toLowerCase()
      const selectedSymbol = selectedAsset?.symbol?.toLowerCase() || ''
      return positionSymbol.includes(selectedSymbol.replace('ls', '')) || 
             selectedSymbol.includes(positionSymbol)
    })

    // Add price lines for each position
    assetPositions.forEach(position => {
      // Entry price line
      const entryLine = currentSeries.createPriceLine({
        price: position.entry,
        color: position.side === 'long' ? '#22c55e' : '#ef4444',
        lineWidth: 2,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: `${position.side.toUpperCase()} Entry ${position.leverage}x`,
      })
      priceLinesRef.current.push(entryLine)

      // Take profit line (estimate +10% for long, -10% for short)
      const tpPrice = position.side === 'long' 
        ? position.entry * 1.10 
        : position.entry * 0.90
      const tpLine = currentSeries.createPriceLine({
        price: tpPrice,
        color: '#22c55e',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'TP',
      })
      priceLinesRef.current.push(tpLine)

      // Stop loss line (estimate -5% for long, +5% for short)
      const slPrice = position.side === 'long' 
        ? position.entry * 0.95 
        : position.entry * 1.05
      const slLine = currentSeries.createPriceLine({
        price: slPrice,
        color: '#ef4444',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'SL',
      })
      priceLinesRef.current.push(slLine)

      // Liquidation price line
      const liqPrice = position.side === 'long'
        ? position.entry * (1 - 0.9 / position.leverage)
        : position.entry * (1 + 0.9 / position.leverage)
      const liqLine = currentSeries.createPriceLine({
        price: liqPrice,
        color: '#f59e0b',
        lineWidth: 1,
        lineStyle: 1, // Dotted
        axisLabelVisible: true,
        title: 'LIQ',
      })
      priceLinesRef.current.push(liqLine)
    })

    return () => {
      const cleanupSeries = currentSeriesRef.current || candleSeriesRef.current
      priceLinesRef.current.forEach(line => {
        try {
          cleanupSeries?.removePriceLine(line)
        } catch (e) {}
      })
      priceLinesRef.current = []
    }
  }, [positions, selectedAsset, chartReady, showPositions, chartType])

  // Refresh ticker periodically
  useEffect(() => {
    if (!selectedAsset) return

    const interval = setInterval(async () => {
      const symbol = getBinanceSymbol(selectedAsset.id)
      const tickerData = await fetch24hrTicker(symbol)
      if (tickerData) setTicker(tickerData)
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedAsset])

  const toggleFullscreen = useCallback(() => {
    if (!chartContainerRef.current?.parentElement?.parentElement) return
    
    const container = chartContainerRef.current.parentElement.parentElement
    
    if (!document.fullscreenElement) {
      container.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  if (!selectedAsset) return null

  const priceChange = ticker?.priceChangePercent ?? selectedAsset.change24h
  const displayPrice = livePrice || ticker?.price || selectedAsset.price

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col ${isFullscreen ? 'h-screen' : ''}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center text-xl">
              {selectedAsset.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{selectedAsset.symbol}</span>
                <span className="text-gray-400 text-sm">/USDT</span>
                <span className="flex items-center gap-1 text-green-500 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tabular-nums">
                  ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: displayPrice < 1 ? 6 : 2 })}
                </span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Show Positions Toggle */}
          <button
            onClick={() => setShowPositions(!showPositions)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
              showPositions
                ? "bg-pink-100 text-pink-600 border border-pink-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            title="Show your positions on chart"
          >
            <Target className="w-3.5 h-3.5" />
            Positions
            {positions.filter(p => {
              const positionSymbol = p.asset.toLowerCase()
              const selectedSymbol = selectedAsset?.symbol?.toLowerCase() || ''
              return positionSymbol.includes(selectedSymbol.replace('ls', '')) || selectedSymbol.includes(positionSymbol)
            }).length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-pink-500 text-white rounded-full text-[10px]">
                {positions.filter(p => {
                  const positionSymbol = p.asset.toLowerCase()
                  const selectedSymbol = selectedAsset?.symbol?.toLowerCase() || ''
                  return positionSymbol.includes(selectedSymbol.replace('ls', '')) || selectedSymbol.includes(positionSymbol)
                }).length}
              </span>
            )}
          </button>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            {CHART_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value)}
                className={`p-1.5 rounded-md transition-all ${
                  chartType === type.value
                    ? "bg-white text-pink-500 shadow-sm"
                    : "text-gray-400 hover:text-foreground"
                }`}
                title={type.label}
              >
                <type.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Timeframes */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  selectedTimeframe === tf.value
                    ? "bg-white text-foreground shadow-sm"
                    : "text-gray-500 hover:text-foreground"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex-1 min-h-[400px] h-[400px]">
        {(!chartReady || isLoading) && !chartError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Loading chart...</span>
            </div>
          </div>
        ) : null}
        {chartError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="flex flex-col items-center gap-2 text-red-500">
              <span className="text-sm">{chartError}</span>
            </div>
          </div>
        ) : null}

        {/* Floating Position Info Panel */}
        {showPositions && positions.filter(p => {
          const positionSymbol = p.asset.toLowerCase()
          const selectedSymbol = selectedAsset?.symbol?.toLowerCase() || ''
          return positionSymbol.includes(selectedSymbol.replace('ls', '')) || selectedSymbol.includes(positionSymbol)
        }).length > 0 && (
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-3 max-w-[200px]">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
              <DollarSign className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-bold text-gray-800">Your Positions</span>
            </div>
            <div className="space-y-2">
              {positions.filter(p => {
                const positionSymbol = p.asset.toLowerCase()
                const selectedSymbol = selectedAsset?.symbol?.toLowerCase() || ''
                return positionSymbol.includes(selectedSymbol.replace('ls', '')) || selectedSymbol.includes(positionSymbol)
              }).map(pos => {
                const pnl = pos.side === 'long' 
                  ? (displayPrice - pos.entry) / pos.entry * 100 * pos.leverage
                  : (pos.entry - displayPrice) / pos.entry * 100 * pos.leverage
                const pnlValue = pos.size * (pnl / 100)
                
                return (
                  <div key={pos.id} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${pos.side === 'long' ? 'text-green-600' : 'text-red-500'}`}>
                        {pos.side.toUpperCase()} {pos.leverage}x
                      </span>
                      <span className={`font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500">
                      <span>Entry: ${pos.entry.toLocaleString()}</span>
                      <span className={pnlValue >= 0 ? 'text-green-600' : 'text-red-500'}>
                        {pnlValue >= 0 ? '+' : ''}${pnlValue.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      Size: ${pos.size.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div 
          ref={chartContainerRef} 
          className="absolute inset-0"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Footer Stats */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm flex-shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-gray-400">24h High:</span>
            <span className="ml-2 font-semibold text-foreground tabular-nums">
              ${(ticker?.high24h ?? selectedAsset.high24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-gray-400">24h Low:</span>
            <span className="ml-2 font-semibold text-foreground tabular-nums">
              ${(ticker?.low24h ?? selectedAsset.low24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-gray-400">24h Volume:</span>
            <span className="ml-2 font-semibold text-foreground tabular-nums">
              {formatVolume(ticker?.quoteVolume24h ?? selectedAsset.volume24h)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Earning 8.2% APY while trading
        </div>
      </div>
    </div>
  )
}
