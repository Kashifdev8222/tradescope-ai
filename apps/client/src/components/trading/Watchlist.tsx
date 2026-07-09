import { useState, useMemo } from 'react';
import type { MarketQuote } from '../../api/market';
const LABELS: Record<string, string> = { fx: 'FX', commodity: 'Comm', stock: 'Stocks', index: 'Idx', crypto: 'Crypto' };

export function Watchlist({ quotes, selectedSymbol, onSelect }: { quotes: MarketQuote[]; selectedSymbol: string; onSelect: (s: string) => void }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const classes = useMemo(() => ['all', ...Array.from(new Set(quotes.map(q => q.class)))], [quotes]);
  const filtered = useMemo(() => quotes.filter(q => (filter === 'all' || q.class === filter) && (!search || q.symbol.toLowerCase().includes(search.toLowerCase()))), [quotes, filter, search]);

  return (
    <div className="w-[230px] hidden lg:flex bg-gray-50 dark:bg-[#161B22] flex flex-col flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
      <div className="px-3 py-2.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">Watchlist</div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="mx-2 mt-2 px-2.5 py-1.5 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 font-sans" />
      <div className="flex gap-1 px-2 py-2 flex-wrap">
        {classes.map(c => <button key={c} onClick={() => setFilter(c)} className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-all ${filter===c?'bg-blue-600 text-white':'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}>{LABELS[c] || 'All'}</button>)}
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map(q => {
          const up = q.changePercent >= 0;
          const sel = q.symbol === selectedSymbol;
          return (
            <div key={q.symbol} onClick={() => onSelect(q.symbol)} className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-gray-100 dark:border-gray-800/50 hover:bg-white dark:hover:bg-[#0D1117] transition-all ${sel?'bg-blue-50 dark:bg-blue-500/5 border-l-[3px] border-l-blue-600':''}`}>
              <div>
                <div className="text-[12px] font-semibold text-gray-900 dark:text-white">{q.symbol}</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[100px]">{q.name.split(' / ')[0]}</div>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-semibold font-mono text-gray-900 dark:text-white">{q.price.toFixed(q.class === 'fx' ? 5 : 2)}</div>
                <div className={`text-[10px] font-semibold ${up ? 'text-green-600' : 'text-red-600'}`}>{up ? '+' : ''}{q.changePercent.toFixed(2)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
