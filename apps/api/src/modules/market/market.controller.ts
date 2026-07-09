import { Request, Response } from 'express';
import {
  getQuote, getCandles as getCandlesFromEngine, getAllQuotes, getAllSymbols,
  getSymbolsByClass, getInstrumentClasses,
} from '../../engine/mock-market-data.js';
import type { InstrumentClass, Timeframe } from '../../engine/mock-market-data.js';

export function getQuotes(req: Request, res: Response) {
  try {
    const symbolsParam = req.query.symbols as string | undefined;
    const classParam = req.query.class as InstrumentClass | undefined;

    let quotes;
    if (symbolsParam) {
      const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase());
      quotes = symbols.map((s) => {
        try { return getQuote(s); } catch { return null; }
      }).filter(Boolean);
    } else if (classParam) {
      const symbols = getSymbolsByClass(classParam);
      quotes = symbols.map((s) => getQuote(s));
    } else {
      quotes = getAllQuotes();
    }

    res.json({ success: true, data: quotes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export function getCandles(req: Request, res: Response) {
  try {
    const symbol = (req.query.symbol as string)?.toUpperCase();
    const timeframe = (req.query.timeframe as Timeframe) || '1m';
    const bars = parseInt(req.query.bars as string) || 500;

    if (!symbol) {
      res.status(400).json({ success: false, error: { code: 'MISSING_SYMBOL', message: 'symbol is required' } });
      return;
    }

    const validTimeframes: Timeframe[] = ['1m', '5m', '15m', '1H', '1D'];
    if (!validTimeframes.includes(timeframe)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_TIMEFRAME', message: 'Invalid timeframe' } });
      return;
    }

    const candles = getCandlesFromEngine(symbol, timeframe, Math.min(bars, 1500));
    res.json({ success: true, data: candles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}

export function getSymbols(_req: Request, res: Response) {
  try {
    const symbols = getAllSymbols();
    const classes = getInstrumentClasses();
    res.json({ success: true, data: { symbols, classes } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: err.message } });
  }
}
