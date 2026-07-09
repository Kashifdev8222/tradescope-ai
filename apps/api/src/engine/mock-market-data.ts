// Professional market data simulator — 35 instruments across 5 classes
// Deterministic two-scale random walk with OHLC candle generation

export interface MarketQuote {
  symbol: string;
  name: string;
  class: InstrumentClass;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

export interface OHLCBar {
  time: number;       // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type InstrumentClass = 'fx' | 'commodity' | 'stock' | 'index' | 'crypto';
export type Timeframe = '1m' | '5m' | '15m' | '1H' | '1D';

interface InstrumentDef {
  symbol: string;
  name: string;
  class: InstrumentClass;
  basePrice: number;
  tickSize: number;
}

// ============================================================
// 35 INSTRUMENTS ACROSS 5 CLASSES
// ============================================================

const INSTRUMENTS: InstrumentDef[] = [
  // FX (10)
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', class: 'fx', basePrice: 1.0850, tickSize: 0.00001 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', class: 'fx', basePrice: 1.2720, tickSize: 0.00001 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', class: 'fx', basePrice: 156.50, tickSize: 0.001 },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', class: 'fx', basePrice: 0.9120, tickSize: 0.00001 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', class: 'fx', basePrice: 0.6620, tickSize: 0.00001 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', class: 'fx', basePrice: 1.3680, tickSize: 0.00001 },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', class: 'fx', basePrice: 0.6120, tickSize: 0.00001 },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', class: 'fx', basePrice: 0.8530, tickSize: 0.00001 },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', class: 'fx', basePrice: 169.80, tickSize: 0.001 },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', class: 'fx', basePrice: 199.10, tickSize: 0.001 },

  // Commodities (10)
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', class: 'commodity', basePrice: 2350.00, tickSize: 0.01 },
  { symbol: 'XAG/USD', name: 'Silver / US Dollar', class: 'commodity', basePrice: 30.50, tickSize: 0.001 },
  { symbol: 'OIL', name: 'Crude Oil WTI', class: 'commodity', basePrice: 78.50, tickSize: 0.01 },
  { symbol: 'BRENT', name: 'Brent Crude Oil', class: 'commodity', basePrice: 82.30, tickSize: 0.01 },
  { symbol: 'NG', name: 'Natural Gas', class: 'commodity', basePrice: 2.85, tickSize: 0.001 },
  { symbol: 'COPPER', name: 'Copper Futures', class: 'commodity', basePrice: 4.55, tickSize: 0.0001 },
  { symbol: 'COFFEE', name: 'Coffee Arabica', class: 'commodity', basePrice: 215.40, tickSize: 0.01 },
  { symbol: 'SUGAR', name: 'Sugar #11', class: 'commodity', basePrice: 19.85, tickSize: 0.01 },
  { symbol: 'WHEAT', name: 'Wheat Futures', class: 'commodity', basePrice: 590.25, tickSize: 0.01 },
  { symbol: 'COTTON', name: 'Cotton #2', class: 'commodity', basePrice: 82.15, tickSize: 0.01 },

  // Stocks (10)
  { symbol: 'AAPL', name: 'Apple Inc.', class: 'stock', basePrice: 215.00, tickSize: 0.01 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', class: 'stock', basePrice: 445.00, tickSize: 0.01 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', class: 'stock', basePrice: 185.00, tickSize: 0.01 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', class: 'stock', basePrice: 210.00, tickSize: 0.01 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', class: 'stock', basePrice: 130.00, tickSize: 0.01 },
  { symbol: 'META', name: 'Meta Platforms Inc.', class: 'stock', basePrice: 520.00, tickSize: 0.01 },
  { symbol: 'TSLA', name: 'Tesla Inc.', class: 'stock', basePrice: 245.00, tickSize: 0.01 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', class: 'stock', basePrice: 200.00, tickSize: 0.01 },
  { symbol: 'V', name: 'Visa Inc.', class: 'stock', basePrice: 290.00, tickSize: 0.01 },
  { symbol: 'BA', name: 'Boeing Co.', class: 'stock', basePrice: 178.00, tickSize: 0.01 },

  // Indices (5)
  { symbol: 'SPX', name: 'S&P 500 Index', class: 'index', basePrice: 5350.00, tickSize: 0.01 },
  { symbol: 'NDX', name: 'Nasdaq 100 Index', class: 'index', basePrice: 19100.00, tickSize: 0.01 },
  { symbol: 'DJI', name: 'Dow Jones Industrial', class: 'index', basePrice: 39500.00, tickSize: 0.01 },
  { symbol: 'DAX', name: 'Germany DAX 40', class: 'index', basePrice: 18700.00, tickSize: 0.01 },
  { symbol: 'FTSE', name: 'FTSE 100', class: 'index', basePrice: 8250.00, tickSize: 0.01 },
];

// ============================================================
// CLASS CONFIG
// ============================================================

const CLASS_CONFIG: Record<InstrumentClass, {
  volatility: number;
  spreadPct: number;
  commissionPct: number;
  swapDailyPct: number;
  minTickFraction: number;
}> = {
  fx:       { volatility: 0.003, spreadPct: 0.0001, commissionPct: 0.0, swapDailyPct: 0.0001, minTickFraction: 0.5 },
  commodity:{ volatility: 0.010, spreadPct: 0.0005, commissionPct: 0.0005, swapDailyPct: 0.0002, minTickFraction: 0.5 },
  stock:    { volatility: 0.008, spreadPct: 0.0005, commissionPct: 0.001, swapDailyPct: 0.0002, minTickFraction: 0.5 },
  index:    { volatility: 0.006, spreadPct: 0.0005, commissionPct: 0.0005, swapDailyPct: 0.0001, minTickFraction: 0.5 },
  crypto:   { volatility: 0.018, spreadPct: 0.002,  commissionPct: 0.002, swapDailyPct: 0.0005, minTickFraction: 1.0 },
};

const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1m': 60, '5m': 300, '15m': 900, '1H': 3600, '1D': 86400,
};

// ============================================================
// STATE
// ============================================================

// Current mid-prices per symbol
const currentPrices: Map<string, number> = new Map();
// Closed OHLC bars per (symbol, timeframe)
const candleStore: Map<string, OHLCBar[]> = new Map();
// Current open bar per (symbol, timeframe)
const openBars: Map<string, OHLCBar> = new Map();
// Instrument lookup
const instrumentMap: Map<string, InstrumentDef> = new Map();

for (const inst of INSTRUMENTS) {
  instrumentMap.set(inst.symbol, inst);
  currentPrices.set(inst.symbol, inst.basePrice);
}

// Seed for deterministic history
const SEEDS: Record<string, number> = {};
for (const inst of INSTRUMENTS) {
  SEEDS[inst.symbol] = inst.basePrice * 1000 % 1;
}

// Simple deterministic pseudo-random (mulberry32)
function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ============================================================
// PRICE ENGINE
// ============================================================

function randomWalk(lastPrice: number, volatility: number, rand: () => number): number {
  const drift = 0.00005;
  const shock = volatility * (rand() * 2 - 1);
  const newPrice = lastPrice * (1 + drift + shock);
  return Math.max(newPrice, lastPrice * 0.85);
}

function getInstrument(symbol: string): InstrumentDef | undefined {
  return instrumentMap.get(symbol.toUpperCase());
}

// Tick price for a symbol — returns the new mid price
function tickPrice(symbol: string): number {
  const inst = getInstrument(symbol);
  if (!inst) return 100;

  const cfg = CLASS_CONFIG[inst.class];
  const lastPrice = currentPrices.get(symbol) || inst.basePrice;
  const rng = mulberry32((Date.now() * 0.001 + SEEDS[symbol]!) % 1 * 2 ** 32);
  const newPrice = randomWalk(lastPrice, cfg.volatility, rng);

  currentPrices.set(symbol, newPrice);

  // Update open OHLC bar
  for (const tf of Object.keys(TIMEFRAME_SECONDS) as Timeframe[]) {
    const tfSec = TIMEFRAME_SECONDS[tf];
    const barTime = Math.floor(Date.now() / 1000 / tfSec) * tfSec;
    const key = `${symbol}:${tf}`;
    let bar = openBars.get(key);

    if (!bar || bar.time !== barTime) {
      // Close previous bar
      if (bar) {
        const storeKey = `${symbol}:${tf}`;
        const bars = candleStore.get(storeKey) || [];
        bars.push({ ...bar });
        if (bars.length > 1500) bars.shift();
        candleStore.set(storeKey, bars);
      }
      // Open new bar
      bar = { time: barTime, open: newPrice, high: newPrice, low: newPrice, close: newPrice, volume: 0 };
      openBars.set(key, bar);
    } else {
      bar.high = Math.max(bar.high, newPrice);
      bar.low = Math.min(bar.low, newPrice);
      bar.close = newPrice;
      bar.volume += Math.random() * 100;
    }
  }

  return newPrice;
}

// ============================================================
// PUBLIC API
// ============================================================

export function getQuote(symbol: string): MarketQuote {
  const inst = getInstrument(symbol);
  if (!inst) throw new Error(`Unknown symbol: ${symbol}`);

  const cfg = CLASS_CONFIG[inst.class];
  const price = currentPrices.get(inst.symbol) || inst.basePrice;
  const spread = price * cfg.spreadPct;
  const bid = Math.round((price - spread / 2) * (1 / inst.tickSize)) / (1 / inst.tickSize);
  const ask = Math.round((price + spread / 2) * (1 / inst.tickSize)) / (1 / inst.tickSize);
  const prevPrice = price * (1 - (Math.random() - 0.5) * cfg.volatility * 2);
  const change = price - prevPrice;
  const changePercent = (change / prevPrice) * 100;

  return {
    symbol: inst.symbol,
    name: inst.name,
    class: inst.class,
    price: Math.round(price * 100) / 100,
    bid,
    ask,
    spread: Math.round(spread * 10000) / 10000,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    high: Math.round(price * 1.005 * 100) / 100,
    low: Math.round(price * 0.995 * 100) / 100,
    volume: Math.floor(Math.random() * 5000000 + 500000),
    timestamp: Date.now(),
  };
}

export function getCandles(symbol: string, timeframe: Timeframe, count = 500): OHLCBar[] {
  const inst = getInstrument(symbol);
  if (!inst) return [];

  const storeKey = `${inst.symbol}:${timeframe}`;
  const closed = candleStore.get(storeKey) || [];

  // If we don't have enough history, generate it deterministically from the live price
  if (closed.length < count) {
    const livePrice = currentPrices.get(inst.symbol) || inst.basePrice;
    const cfg = CLASS_CONFIG[inst.class];
    const tfSec = TIMEFRAME_SECONDS[timeframe];
    const liveTime = Math.floor(Date.now() / 1000 / tfSec) * tfSec;
    const seed = SEEDS[inst.symbol]! * liveTime;
    const rng = mulberry32(seed);

    // Walk backward from live price
    const generated: OHLCBar[] = [];
    let price = livePrice;
    const needed = count - closed.length;
    for (let i = needed; i > 0; i--) {
      const barTime = liveTime - i * tfSec;
      const o = price;
      const c = randomWalk(o, cfg.volatility * 0.5, rng);
      const h = Math.max(o, c) * (1 + rng() * cfg.volatility * 0.3);
      const l = Math.min(o, c) * (1 - rng() * cfg.volatility * 0.3);
      generated.push({ time: barTime, open: o, high: h, low: l, close: c, volume: Math.floor(rng() * 10000) });
      price = c;
    }
    // Merge, deduplicate by time, sort ascending
    const merged = new Map<number, OHLCBar>();
    for (const bar of generated) merged.set(bar.time, bar);
    for (const bar of closed) merged.set(bar.time, bar);
    const result = Array.from(merged.values()).sort((a, b) => a.time - b.time);
    return result.slice(-count);
  }

  return closed.slice(-count).sort((a, b) => a.time - b.time);
}

export function getAllQuotes(): MarketQuote[] {
  return INSTRUMENTS.map((inst) => getQuote(inst.symbol));
}

export function getQuotesByClass(cls: InstrumentClass): MarketQuote[] {
  return INSTRUMENTS.filter((i) => i.class === cls).map((i) => getQuote(i.symbol));
}

export function getAllSymbols(): string[] {
  return INSTRUMENTS.map((i) => i.symbol);
}

export function getSymbolsByClass(cls: InstrumentClass): string[] {
  return INSTRUMENTS.filter((i) => i.class === cls).map((i) => i.symbol);
}

export function getInstrumentInfo(symbol: string): InstrumentDef | undefined {
  return getInstrument(symbol);
}

export function getClassConfig(cls: InstrumentClass) {
  return CLASS_CONFIG[cls];
}

export function getInstrumentClasses(): InstrumentClass[] {
  return ['fx', 'commodity', 'stock', 'index', 'crypto'];
}

// Update all prices (called by scheduler)
export function updateAllPrices(): void {
  for (const inst of INSTRUMENTS) {
    tickPrice(inst.symbol);
  }
}

// Tick a single symbol
export function updatePrice(symbol: string): number {
  return tickPrice(symbol);
}

// Seed initial history
export function seedHistory(bars = 500): void {
  for (const inst of INSTRUMENTS) {
    for (const tf of Object.keys(TIMEFRAME_SECONDS) as Timeframe[]) {
      getCandles(inst.symbol, tf, bars);
    }
  }
}

// Seed on module load
seedHistory(500);
