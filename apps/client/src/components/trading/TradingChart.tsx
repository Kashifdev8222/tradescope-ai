import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi, type CandlestickData, type LineData, type Time } from 'lightweight-charts';
import type { OHLCBar, MarketQuote } from '../../api/market';

interface Props { candles: OHLCBar[]; quote: MarketQuote | null; timeframe?: string; onTimeframeChange?: (tf: string) => void; symbol?: string; }
const TFS = ['1m', '5m', '15m', '1H', '1D'];

function isDark() { return document.documentElement.classList.contains('dark'); }

function calcSMA(data: OHLCBar[], period: number): LineData[] {
  const result: LineData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j]!.close;
    result.push({ time: data[i]!.time as Time, value: sum / period });
  }
  return result;
}

function calcEMA(data: OHLCBar[], period: number): LineData[] {
  const result: LineData[] = [];
  if (data.length < period) return result;
  let ema = data.slice(0, period).reduce((s, d) => s + d.close, 0) / period;
  result.push({ time: data[period - 1]!.time as Time, value: ema });
  const k = 2 / (period + 1);
  for (let i = period; i < data.length; i++) {
    ema = (data[i]!.close - ema) * k + ema;
    result.push({ time: data[i]!.time as Time, value: ema });
  }
  return result;
}

export function TradingChart({ candles, quote, timeframe = '1m', onTimeframeChange, symbol = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const smaRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [seconds, setSeconds] = useState(0);

  // Countdown timer
  useEffect(() => {
    const secMap: Record<string, number> = { '1m': 60, '5m': 300, '15m': 900, '1H': 3600, '1D': 86400 };
    const interval = secMap[timeframe] || 60;
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      setSeconds(interval - (now % interval));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timeframe]);

  useEffect(() => {
    const c = containerRef.current; if (!c) return;
    const dark = isDark();
    const chart = createChart(c, {
      layout: { background: { type: ColorType.Solid, color: dark ? '#0D1117' : '#FFFFFF' }, textColor: dark ? '#8B949E' : '#6B7280' },
      grid: { vertLines: { color: dark ? '#21262D' : '#E5E7EB' }, horzLines: { color: dark ? '#21262D' : '#E5E7EB' } },
      rightPriceScale: { borderColor: dark ? '#30363D' : '#E5E7EB' },
      timeScale: { borderColor: dark ? '#30363D' : '#E5E7EB', timeVisible: true },
      crosshair: { mode: 0 },
      width: c.clientWidth || 800, height: c.clientHeight || 400,
    });

    const series = chart.addCandlestickSeries({ upColor: '#059669', downColor: '#DC2626', borderUpColor: '#059669', borderDownColor: '#DC2626', wickUpColor: '#059669', wickDownColor: '#DC2626' });
    seriesRef.current = series;

    // SMA-20 line
    const sma = chart.addLineSeries({ color: '#F59E0B', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    smaRef.current = sma;

    // EMA-50 line
    const ema = chart.addLineSeries({ color: '#8B5CF6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    emaRef.current = ema;

    chartRef.current = chart;

    const ro = new ResizeObserver(es => { for (const e of es) { const { width: w, height: h } = e.contentRect; if (w > 0 && h > 0) try { chart.applyOptions({ width: w, height: h }); } catch {} } });
    ro.observe(c);
    return () => { ro.disconnect(); try { chart.remove(); } catch {} };
  }, [symbol]);

  // Update candle data
  useEffect(() => { if (!seriesRef.current || !candles.length) return; seriesRef.current.setData(candles.map(c => ({ time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close }))); }, [candles]);

  // Update SMA/EMA overlays
  useEffect(() => {
    if (!candles.length || !smaRef.current || !emaRef.current) return;
    smaRef.current.setData(calcSMA(candles, 20));
    emaRef.current.setData(calcEMA(candles, 50));
  }, [candles]);

  const fmtCountdown = () => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#0D1117]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 h-9 bg-gray-50 dark:bg-[#161B22] border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex gap-1">
          {TFS.map(t => <button key={t} onClick={() => onTimeframeChange?.(t)} className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-all ${timeframe===t?'bg-blue-600 text-white':'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>{t}</button>)}
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-amber-500 inline-block rounded"/>SMA 20</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-purple-500 inline-block rounded"/>EMA 50</span>
          </div>
          {quote && (
            <div className="flex gap-3 text-[10px] font-mono">
              <span className="text-gray-400">O <b className="text-gray-900 dark:text-white">{quote.price.toFixed(quote.class==='fx'?5:2)}</b></span>
              <span className="text-gray-400">H <b className="text-green-600">{quote.high.toFixed(4)}</b></span>
              <span className="text-gray-400">L <b className="text-red-600">{quote.low.toFixed(4)}</b></span>
            </div>
          )}
          {/* Countdown */}
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400">{fmtCountdown()}</span>
        </div>
      </div>
      {/* Chart */}
      <div ref={containerRef} className="flex-1 w-full" style={{minHeight:'300px'}} />
    </div>
  );
}
