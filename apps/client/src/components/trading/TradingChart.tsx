import { useEffect, useRef } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi, type CandlestickData, type Time } from 'lightweight-charts';
import type { OHLCBar, MarketQuote } from '../../api/market';

interface Props { candles: OHLCBar[]; quote: MarketQuote | null; timeframe?: string; onTimeframeChange?: (tf: string) => void; symbol?: string; }
const TFS = ['1m', '5m', '15m', '1H', '1D'];

function isDark() { return document.documentElement.classList.contains('dark'); }

export function TradingChart({ candles, quote, timeframe = '1m', onTimeframeChange, symbol = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    const c = containerRef.current; if (!c) return;
    const dark = isDark();
    const chart = createChart(c, {
      layout: { background: { type: ColorType.Solid, color: dark ? '#0D1117' : '#FFFFFF' }, textColor: dark ? '#8B949E' : '#6B7280' },
      grid: { vertLines: { color: dark ? '#21262D' : '#E5E7EB' }, horzLines: { color: dark ? '#21262D' : '#E5E7EB' } },
      rightPriceScale: { borderColor: dark ? '#30363D' : '#E5E7EB' },
      timeScale: { borderColor: dark ? '#30363D' : '#E5E7EB', timeVisible: true },
      width: c.clientWidth || 800, height: c.clientHeight || 400,
    });
    const series = chart.addCandlestickSeries({ upColor: '#059669', downColor: '#DC2626', borderUpColor: '#059669', borderDownColor: '#DC2626', wickUpColor: '#059669', wickDownColor: '#DC2626' });
    chartRef.current = chart; seriesRef.current = series;
    const ro = new ResizeObserver(es => { for (const e of es) { const { width: w, height: h } = e.contentRect; if (w > 0 && h > 0) try { chart.applyOptions({ width: w, height: h }); } catch {} } });
    ro.observe(c);
    return () => { ro.disconnect(); try { chart.remove(); } catch {} };
  }, [symbol]);

  useEffect(() => { if (!seriesRef.current || !candles.length) return; seriesRef.current.setData(candles.map(c => ({ time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close }))); }, [candles]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#0D1117]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 h-9 bg-gray-50 dark:bg-[#161B22] border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex gap-1">
          {TFS.map(t => <button key={t} onClick={() => onTimeframeChange?.(t)} className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-all ${timeframe===t?'bg-blue-600 text-white':'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>{t}</button>)}
        </div>
        {quote && (
          <div className="flex gap-3 text-[11px] font-mono">
            <span className="text-gray-400">O <b className="text-gray-900 dark:text-white">{quote.price.toFixed(quote.class==='fx'?5:2)}</b></span>
            <span className="text-gray-400">H <b className="text-green-600">{quote.high.toFixed(4)}</b></span>
            <span className="text-gray-400">L <b className="text-red-600">{quote.low.toFixed(4)}</b></span>
          </div>
        )}
      </div>
      {/* Chart */}
      <div ref={containerRef} className="flex-1 w-full" style={{minHeight:'300px'}} />
    </div>
  );
}
