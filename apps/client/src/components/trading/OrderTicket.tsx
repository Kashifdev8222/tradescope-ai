import { useState, useEffect } from 'react';
import type { MarketQuote } from '../../api/market';

export function OrderTicket({ quote, onPlaceOrder }: { quote: MarketQuote | null; accountId: string; onPlaceOrder: (o: any) => void }) {
  const [type, setType] = useState<'market' | 'limit' | 'stop'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [qty, setQty] = useState('0.01');
  const [price, setPrice] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [expiry, setExpiry] = useState<'GTC' | 'IOC' | 'FOK'>('GTC');
  const [arm, setArm] = useState(() => localStorage.getItem('armMode') === 'true');
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { if (quote) setPrice(quote.price.toFixed(4)); }, [quote]);

  const validate = () => { const q = parseFloat(qty); if (!q || q <= 0) return 'Invalid qty'; if (!quote) return 'No data'; if (type === 'limit') { const p = parseFloat(price); if (!p) return 'Invalid price'; if (side === 'buy' && p >= quote.ask) return 'Buy limit below ask'; if (side === 'sell' && p <= quote.bid) return 'Sell limit above bid'; } if (type === 'stop') { const p = parseFloat(price); if (!p) return 'Invalid price'; if (side === 'buy' && p <= quote.ask) return 'Buy stop above ask'; if (side === 'sell' && p >= quote.bid) return 'Sell stop below bid'; } return null; };
  const doSubmit = () => { if (!quote) return; onPlaceOrder({ symbol: quote.symbol, side, type, quantity: parseFloat(qty), price: type !== 'market' ? parseFloat(price) : undefined, sl: sl ? parseFloat(sl) : undefined, tp: tp ? parseFloat(tp) : undefined }); setConfirm(false); };
  const submit = () => { const e = validate(); if (e) { setErr(e); return; } setErr(''); arm ? doSubmit() : setConfirm(true); };

  if (!quote) return null;

  return (<>
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-[#1C2128] border-t-2 border-blue-500 dark:border-blue-600 flex-shrink-0 overflow-x-auto">
      {/* Symbol + Spread */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{quote.symbol}</span>
        <span className="text-xs text-gray-400">Spread {quote.spread.toFixed(5)}</span>
        <span className="text-xs text-red-500">B {quote.bid.toFixed(4)}</span>
        <span className="text-xs text-green-500">A {quote.ask.toFixed(4)}</span>
      </div>

      <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />

      {/* Order type */}
      <div className="flex gap-0.5 shrink-0">
        {(['market','limit','stop'] as const).map(t => (
          <button key={t} onClick={() => setType(t)} className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${type===t?'bg-blue-600 text-white':'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}>{t[0]!.toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />

      {/* Buy/Sell */}
      <div className="flex gap-1.5 shrink-0">
        <button onClick={() => setSide('buy')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${side==='buy'?'bg-green-600 text-white':'bg-white dark:bg-[#0D1117] text-gray-400 border border-gray-200 dark:border-gray-700'}`}>Buy</button>
        <button onClick={() => setSide('sell')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${side==='sell'?'bg-red-600 text-white':'bg-white dark:bg-[#0D1117] text-gray-400 border border-gray-200 dark:border-gray-700'}`}>Sell</button>
      </div>

      <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />

      {/* Qty */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Qty</span>
        <input type="number" value={qty} onChange={e => setQty(e.target.value)} step="0.01" min="0.01" className="w-16 px-1.5 py-1 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-900 dark:text-white outline-none focus:border-blue-500" />
        {[0.01,0.1,0.5,1].map(v => <button key={v} onClick={() => setQty(String(v))} className="px-1.5 py-0.5 text-xs font-semibold bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded text-gray-400 hover:text-gray-600">{v}</button>)}
      </div>

      {/* Price (limit/stop) */}
      {type !== 'market' && <>
        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{type==='limit'?'Limit':'Stop'}</span>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} step="0.0001" className="w-20 px-1.5 py-1 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-900 dark:text-white outline-none focus:border-blue-500" />
        </div>
      </>}

      <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />

      {/* SL / TP */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">SL</span>
        <input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder="-" className="w-16 px-1.5 py-1 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-900 dark:text-white outline-none focus:border-blue-500" />
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">TP</span>
        <input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder="-" className="w-16 px-1.5 py-1 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-900 dark:text-white outline-none focus:border-blue-500" />
      </div>

      {/* Order Expiry */}
      <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">TIF</span>
        <div className="flex gap-0.5">
          {(['GTC','IOC','FOK'] as const).map(e => (
            <button key={e} onClick={() => setExpiry(e)} className={`px-2 py-1 text-xs font-semibold rounded transition-all ${expiry===e?'bg-blue-600 text-white':'text-gray-400 dark:text-gray-500 hover:text-gray-600 border border-gray-200 dark:border-gray-700'}`}>{e}</button>
          ))}
        </div>
      </div>

      {/* ARM + Submit */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer shrink-0"><input type="checkbox" checked={arm} onChange={() => { setArm(!arm); localStorage.setItem('armMode', String(!arm)); }} className="rounded" />ARM</label>
        <button onClick={submit} className={`px-4 py-1.5 rounded text-xs font-bold text-white transition-all ${side==='buy'?'bg-green-600 hover:bg-green-700':'bg-red-600 hover:bg-red-700'}`}>
          {side.toUpperCase()} {type.toUpperCase()}
        </button>
      </div>
    </div>

    {err && <div className="text-xs text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-1.5">{err}</div>}

    {confirm && <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center" onClick={() => setConfirm(false)}><div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-[320px] w-full shadow-2xl" onClick={e => e.stopPropagation()}>
      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Confirm Order</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400">{side.toUpperCase()} {qty} {quote.symbol} @ {type === 'market' ? 'Market' : price}</p>
      <div className="flex gap-2 mt-4"><button onClick={() => setConfirm(false)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">Cancel</button><button onClick={doSubmit} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white">Confirm</button></div>
    </div></div>}
  </>);
}
